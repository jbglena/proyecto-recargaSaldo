$(document).ready(function () {
    $('#cbo-paisespermitidotransacciones-compras,#cbo-preciobasadosen-compras').select2({
        searchInputPlaceholder: 'Buscar opción',
        allowClear: false,
        width: '100%'
    })

    $('#btn-buscarpreciosplazbot-compras').click(function () {
        let tipoCompraDefault = $('#cbo-preciobasadosen-compras').val()
        let paisCompraDefault = $('#cbo-paisespermitidotransacciones-compras').val()

        if (tipoCompraDefault == '1') tipoCompraDefault = 'MENSAJES'
        else if (tipoCompraDefault == '2') tipoCompraDefault = 'SESIONENT'
        else if (tipoCompraDefault == '3') tipoCompraDefault = 'PLANTILLA'
        else if (tipoCompraDefault == '4') tipoCompraDefault = 'SMS'
        else if (tipoCompraDefault == '5') tipoCompraDefault = 'HORASOPORTE'

        let detalleTipo = $('#cbo-preciobasadosen-compras').find('option:selected').text()
        let detallePais = $('#cbo-paisespermitidotransacciones-compras').find('option:selected').text()
        $('#txt-detallebusquedaetiqueta-compras').html(`<strong>${detalleTipo}</strong> para el pais <strong>${detallePais}</strong>`)

        FnBuscarPreciosComprasApp(tipoCompraDefault, paisCompraDefault)
        FnSaldoPlantillasYMensajes()
    })

    $('#btn-buscarpreciosplazbot-compras').click()

    $('#btn-refresh-listaPrecios').click(function () {
        FnSaldoPlantillasYMensajes()
    });
})

/* contador de saldo disponible wsp y hsm */
FnSaldoPlantillasYMensajes = () => {
    $.ajax({
        type: "GET",
        beforeSend: function () {
            setLoadingView('loading', $('#totalmensajes-wsp-disponibles, #totalmensajes-hsmentrantes-disponibles, #totalmensajes-hsm-disponibles , #totalmensajes-horasSoporte-disponibles , #totalmensajes-sms-disponibles'),null, 'transform: scale(.3)')
        },
        url: `/Home/GetSaldoMensajesWhatsappYPlantillasHsm`,
        //data: JSON.stringify({ }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            data.forEach(el => {
                if (el.tipoPago == 'MENSAJES') {
                    $('#totalmensajes-wsp-disponibles').html(el.totalMensajesDisponibles);
                }
                else if (el.tipoPago == 'PLANTILLA') {
                    $('#totalmensajes-hsm-disponibles').html(el.totalMensajesDisponibles);
                }
                else if (el.tipoPago == 'SESIONENT') {
                    $('#totalmensajes-hsmentrantes-disponibles').html(el.totalMensajesDisponibles);
                }
                else if (el.tipoPago == 'HORASOPORTE') {
                    $('#totalmensajes-horasSoporte-disponibles').html(el.totalMensajesDisponibles);
                }
                else if (el.tipoPago == 'SMS') {
                    $('#totalmensajes-sms-disponibles').html(el.totalMensajesDisponibles);
                }
            })
            setLoadingView('showing', $('#totalmensajes-wsp-disponibles'), 'skelleton')
        }
        
    });
}


const FnBuscarPreciosComprasApp = function (tipoCompra, paisCompra) {
    let container = $('#container-listadopreciosplazbot-compras')
    container.empty()

    let tipoCompraRef = ''
    if (tipoCompra === 'SESIONENT') { tipoCompraRef = 'Sesiones Entrantes(HSM)' }
    if (tipoCompra === 'PLANTILLA') { tipoCompraRef = 'Sesiones Salientes (HSM)' }
    if (tipoCompra === 'MENSAJES') { tipoCompraRef = 'Mensajes de WhatsApp' }
    if (tipoCompra === 'SMS') { tipoCompraRef = 'SMS' }
    if (tipoCompra === 'HORASOPORTE') { tipoCompraRef = 'Horas de Soporte' }

    if (tipoCompra == 'HORASOPORTE' ) {
        if (paisCompra) {
            if (paisCompra == 'UY' || 'CO' || 'PY' || 'ES' || 'CL' || 'AR' || 'MX' || 'PA' || 'DO' || 'CR' || 'EC') {
                paisCompra = 'PE'
            }
        }
    }

    if (tipoCompra == 'MENSAJES') {
        if (paisCompra) {
            if (paisCompra == 'UY' || 'CO' || 'PY' || 'ES' || 'CL' || 'AR' || 'MX' || 'PA' || 'DO' || 'CR' || 'EC') {
                paisCompra = 'PE'
            }
        }
    }

    $.ajax({
        type: "POST",
        beforeSend: function () {
            LoadButton($('#btn-buscarpreciosplazbot-compras'))
            $('#panel-cargandolistadoprecios-compras').closest('.pos-relative').addClass('ht-100')
            $('#panel-cargandolistadoprecios-compras').css('display', 'flex')
        },
        url: "/Home/GetPreciosPagosPlazbot",
        data: JSON.stringify({ "tipoPrecios": tipoCompra, "codigoPais": paisCompra }),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function (data) {
            if (typeof data === 'string') data = JSON.parse(data)

            $(data).each(function (index, item) {
                let tipoDeCompra;

                if (item.tipo === 'HORASOPORTE') {
                   tipoDeCompra = `<h6 class="tx-uppercase tx-17 tx-spacing-1 tx-color-02 tx-semibold mg-b-8">${FnNumberWithCommas(item.cantidad)} HORAS</h6>`
                } else if (item.tipo === 'PLANTILLA' || 'MENSAJES' || 'SESIONENT' ||  'SMS'){
                    tipoDeCompra = `<h6 class="tx-uppercase tx-17 tx-spacing-1 tx-color-02 tx-semibold mg-b-8">${FnNumberWithCommas(item.cantidad)} Envíos</h6>`
                }

                container.append(`<div class="col-md-3">
                            <div class="card card-body tx-center pd-b-5 mg-b-15">
                               ${tipoDeCompra}
                                <div>
                                    <p class="tx-11 tx-color-03 mg-b-5">aprox. $${item.precioUnitario} cada una</p>
                                    <h3 class="tx-bold tx-rubik mg-b-0 mg-r-5 lh-1">$${item.precioTotal}</h3>
                                </div>
                                <hr class="mg-t-5 mg-b-5" />
                                <div class="tx-center mg-t-5 mg-b-5">
                                    <button type="button" class="btn btn-success btn-sm btn-uppercase" data-unidadescompra="${item.cantidad}" data-tipocompra="${tipoCompraRef}" data-cantidad="${item.cantidad}"  data-tipopago="${item.tipo}" data-montototal="${item.precioTotal}" onclick="javascript: FnComprarConPaypalMasRegistro(this);">Comprar</button>
                                </div>
                            </div>
                        </div>`)
            })
        },
        failure: function () {
            ShowAlertMessage($('#container-alertas-compras'), 'danger', 'Error', 'Hubo un error obteniendo los precios a mostrar.')
        },
        error: function () {
            ShowAlertMessage($('#container-alertas-compras'), 'danger', 'Error', 'Hubo un error obteniendo los precios a mostrar.')
        },
        complete: function () {
            UnLoadButton($('#btn-buscarpreciosplazbot-compras'))
            $('#panel-cargandolistadoprecios-compras').css('display', 'none')
            $('#panel-cargandolistadoprecios-compras').closest('.pos-relative').removeClass('ht-100')
        }
    });
},

    FnComprarConPaypalMasRegistro = function (element) {

        console.log(element)

        let totalPagar = $(element).data('montototal')
        let tipoCompra = $(element).data('tipocompra')
        let tipoPago = $(element).data('tipopago')
        let unidadesCompradas = $(element).data('unidadescompra')

        let detalleRegistroCompra = `${tipoCompra} - ${unidadesCompradas} unidades`


        $('#contenedor-pagoporpaypal-compras').empty()


        let value = $('#script-paypalgenerator-layout').attr('src')
        value = value.replace('&vault=true&intent=subscription', '')
        $('#script-paypalgenerator-layout').attr('src', value)

        paypal.Buttons({
            style: {
                "height": 35, "layout": 'vertical', "color": 'blue', "shape": 'rect', "label": 'paypal', "tagline": false
            },
            createOrder: function (data, actions) {
                return actions.order.create({ "purchase_units": [{ "amount": { "value": totalPagar } }] });
            },
            onApprove: function (data, actions) {
                return actions.order.capture().then(async function (details) {
                    details["unidadesCompradas"] = unidadesCompradas
                    details["detalleCompra"] = detalleRegistroCompra
                    details["tipoCompra"] = tipoCompra
                    details["tipopago"] = tipoPago

                    $('#progressbar-registropagosunicos-compras').removeClass('d-none')
                    await FnGuardarInformacionPagoUnico(details).then(response => {
                        if (response.statusCode === 200) {
                            ShowAlertMessage($('#container-alertas-compras'), 'success', 'Información', 'La compra se registró correctamente.')
                            $('#modal-confirmacionregistropago-compras').modal('toggle')
                        }
                        else {
                            ShowAlertMessage($('#contenedor-alertarregistropagounico-compras'), 'danger', 'Error', 'Hubo un error al momento de generar la compra.')
                        }
                    })
                    $('#progressbar-registropagosunicos-compras').addClass('d-none')
                });
            }
        }).render('#contenedor-pagoporpaypal-compras');

        $('#modal-confirmacionregistropago-compras').modal('toggle')
    },

    FnGuardarInformacionPagoUnico = function (details) { //aaca vien undefined
        return new Promise(async (resolve, reject) => {
            console.log(details)

            const jsonPost = {
                "idPago": details.id,
                "estadoPago": details.status,
                "idPagador": details.payer.payer_id,
                "nombrePagador": `${details.payer.name.given_name} ${details.payer.name.surname}`,
                "emailPagador": details.payer.email_address,
                "codigoPais": details.purchase_units[0].shipping.address.country_code,
                "merchantId": details.purchase_units[0].payee.merchant_id,
                "emailRecibePago": details.purchase_units[0].payee.email_address,
                "tipoSuscripcion": details.tipoCompra,
                "tipoPago": details.tipopago,
                "detallePago": details.detalleCompra,
                "codigoMoneda": details.purchase_units[0].amount.currency_code,
                "montoPago": details.purchase_units[0].amount.value,
                "fechaCreacionPago": details.create_time,
                "fechaActualizacionPago": details.update_time,
                "unidadesCompradas": parseInt(details.unidadesCompradas),
                "json": JSON.stringify(details)
            }

            const request = await axios.post('/Home/PostRegistrarPagoUnicoBolsaPago', jsonPost, {
                headers: { 'content-type': 'application/json; charset=utf-8' }
            });

            resolve({ statusCode: request.status })
        })
    },

    FnNumberWithCommas = function (x) {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }