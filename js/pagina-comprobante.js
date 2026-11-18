/* =========================================================
   KOOKSTORE.MX - COMPROBANTE / TICKET DE COMPRA
   ---------------------------------------------------------
   Dibuja el comprobante de un pedido del usuario actual:
     comprobante.html?folio=KS-2026-1234

   Incluye: datos del negocio, datos del cliente, productos,
   desglose con IVA incluido, total, fecha y folio del
   comprobante. "Descargar PDF" usa la impresión del navegador
   ("Guardar como PDF") con estilos solo para el ticket.

   Los pedidos antiguos no guardaban dirección ni método de
   pago: se completan con los datos de la cuenta.

   Necesita: notificaciones.js, sesion.js y carrito.js
   ========================================================= */

/* Datos del negocio (ficticios, para fines académicos) */
const NEGOCIO = {
    nombre: 'Kookstore.mx',
    razonSocial: 'Kookstore México S.A. de C.V.',
    rfc: 'KME260101AB1',
    direccion: 'Av. Universidad #940, Ciudad Universitaria, C.P. 20100, Aguascalientes, Ags.',
    contacto: 'hola@kookstore.mx · 449 123 4567'
};

const TASA_IVA = 0.16;

function folioDeLaUrl() {
    return new URLSearchParams(location.search).get('folio') || '';
}

/* "KS-2026-1234" -> "CMP-2026-1234" */
function folioComprobante(pedido) {
    return 'CMP-' + String(pedido.folio).replace(/^KS-/, '');
}

/* Dirección del pedido o, si no la tiene, la de la cuenta */
function direccionDelPedido(pedido, usuario) {
    const d = pedido.direccionEnvio;
    if (d && (d.calle || d.cp || d.ciudad)) {
        return [d.calle, [d.cp ? 'C.P. ' + d.cp : '', d.ciudad].filter(Boolean).join(', ')].filter(Boolean).join('\n');
    }
    if (usuario && usuario.direccion) return usuario.direccion.replace(/\nMéxico$/, '');
    return 'Sin dirección registrada';
}

function subtotalDelPedido(pedido) {
    if (pedido.subtotal) return Number(pedido.subtotal);
    return (pedido.articulos || []).reduce((suma, a) => suma + a.precio * a.cantidad, 0);
}

/* Código de barras decorativo a partir del folio */
function codigoBarras(texto) {
    let barras = '';
    String(texto).split('').forEach(function (letra, i) {
        const codigo = letra.charCodeAt(0);
        barras += '<i style="width:' + (1 + codigo % 3) + 'px"></i>';
        barras += '<b style="width:' + (1 + (codigo + i) % 2) + 'px"></b>';
        barras += '<i style="width:' + (1 + (codigo >> 2) % 3) + 'px"></i>';
        barras += '<b style="width:2px"></b>';
    });
    return barras;
}

/* ---------------------------------------------------------
   TICKET
   --------------------------------------------------------- */
function pintarComprobante(pedido) {
    const usuario = usuarioActivo();
    const cliente = pedido.cliente || {};
    const nombreCliente = cliente.nombre || (pedido.direccionEnvio && pedido.direccionEnvio.nombre) ||
        (usuario ? usuario.nombre : 'Cliente invitado');
    const correoCliente = cliente.email || (usuario ? usuario.email : 'Sin correo (invitado)');
    const metodo = pedido.metodoPago ? pedido.metodoPago.etiqueta : 'Tarjeta (simulado)';
    const estado = normalizarEstado(pedido.estado);
    const cancelado = esPedidoCancelado(pedido);

    const subtotal = subtotalDelPedido(pedido);
    const descuento = Number(pedido.descuentoCupon) || 0;
    const envio = pedido.envio || null;
    const total = Number(pedido.total) || 0;
    const iva = total - total / (1 + TASA_IVA);
    const folio = folioComprobante(pedido);

    document.title = 'Comprobante ' + folio + ' | Kookstore.mx';
    document.getElementById('migas-folio').textContent = 'Comprobante ' + folio;

    const filas = (pedido.articulos || []).map(a => `
        <tr>
            <td class="col-cant">${a.cantidad}</td>
            <td>
                <strong>${escaparHTML(a.nombre)}</strong>
                <small>${escaparHTML([a.grupo, a.opcion].filter(Boolean).join(' · ') || 'Producto oficial')}</small>
            </td>
            <td class="col-num">${formatearPrecio(Number(a.precio) || 0)}</td>
            <td class="col-num">${formatearPrecio((Number(a.precio) || 0) * a.cantidad)}</td>
        </tr>
    `).join('') || `<tr><td class="col-cant">1</td><td><strong>${escaparHTML(pedido.resumen || 'Compra')}</strong></td><td class="col-num">—</td><td class="col-num">${formatearPrecio(subtotal)}</td></tr>`;

    document.getElementById('ticket').innerHTML = `
        ${cancelado ? '<div class="ticket-sello-cancelado">CANCELADO · REEMBOLSO EN PROCESO</div>' : ''}

        <header class="ticket-encabezado">
            <div class="ticket-negocio">
                <img src="../assets/img/logo.png" alt="">
                <div>
                    <h1>${NEGOCIO.nombre}</h1>
                    <p>${NEGOCIO.razonSocial}</p>
                    <p>RFC: ${NEGOCIO.rfc}</p>
                    <p>${NEGOCIO.direccion}</p>
                    <p>${NEGOCIO.contacto}</p>
                </div>
            </div>
            <div class="ticket-folio">
                <span class="ticket-tipo">Comprobante de compra</span>
                <dl>
                    <div><dt>Folio</dt><dd>${escaparHTML(folio)}</dd></div>
                    <div><dt>Fecha</dt><dd>${escaparHTML(pedido.fecha)}${pedido.hora ? ' · ' + escaparHTML(pedido.hora) : ''}</dd></div>
                    <div><dt>Pedido</dt><dd>#${escaparHTML(pedido.folio)}</dd></div>
                </dl>
            </div>
        </header>

        <section class="ticket-datos">
            <div>
                <h2>Cliente</h2>
                <p><strong>${escaparHTML(nombreCliente)}</strong></p>
                <p>${escaparHTML(correoCliente)}</p>
                <p class="ticket-direccion">${escaparHTML(direccionDelPedido(pedido, usuario)).split('\n').join('<br>')}</p>
            </div>
            <div>
                <h2>Pago y entrega</h2>
                <p><span>Método de pago:</span> ${escaparHTML(metodo)}</p>
                ${pedido.metodoPago && pedido.metodoPago.referencia ? `<p><span>Referencia:</span> ${escaparHTML(pedido.metodoPago.referencia)}</p>` : ''}
                <p><span>Envío:</span> ${escaparHTML(envio ? envio.nombre : 'Envío estándar')}</p>
                <p><span>Estado:</span> <em class="ticket-estado ${cancelado ? 'cancelado' : ''}">${cancelado ? 'Cancelado' : escaparHTML(estado)}</em></p>
            </div>
        </section>

        <table class="ticket-tabla">
            <thead>
                <tr><th class="col-cant">Cant.</th><th>Descripción</th><th class="col-num">P. unitario</th><th class="col-num">Importe</th></tr>
            </thead>
            <tbody>${filas}</tbody>
        </table>

        <section class="ticket-totales">
            <div><span>Subtotal</span><span>${formatearPrecio(subtotal)}</span></div>
            ${descuento ? `<div><span>Descuento (${escaparHTML(pedido.cupon || 'cupón')})</span><span>-${formatearPrecio(descuento)}</span></div>` : ''}
            ${envio ? `<div><span>${escaparHTML(envio.nombre)}</span><span>${Number(envio.costo) ? formatearPrecio(Number(envio.costo)) : 'Gratis'}</span></div>` : ''}
            <div class="ticket-iva"><span>IVA incluido (16%)</span><span>${formatearPrecio(iva)}</span></div>
            <div class="ticket-total"><span>Total</span><strong>${formatearPrecio(total)}</strong></div>
        </section>

        <footer class="ticket-pie">
            <div class="ticket-barras" aria-hidden="true">${codigoBarras(folio)}</div>
            <p class="ticket-folio-barras">${escaparHTML(folio)}</p>
            <p class="ticket-gracias">¡Gracias por tu compra! 💜</p>
        </footer>
    `;
}

function mostrarComprobanteNoEncontrado() {
    document.getElementById('btn-descargar-pdf').hidden = true;
    document.getElementById('ticket').classList.add('ticket-vacio');
    document.getElementById('ticket').innerHTML = `
        <div class="ticket-no-encontrado">
            <span>🧾</span>
            <h1>No encontramos este comprobante</h1>
            <p>Puede que el enlace esté incompleto o que el pedido pertenezca a otra cuenta. Inicia sesión con la cuenta con la que compraste.</p>
            <a href="carrito.html#historial" class="btn-primario">Ir a Mis compras</a>
        </div>
    `;
}

/* "Descargar PDF": la ventana de impresión permite "Guardar como PDF".
   El título de la página se usa como nombre del archivo. */
function descargarPDF(pedido) {
    kookToast('En la ventana que se abre elige "Guardar como PDF".', 'info', 'Descargando comprobante');
    const tituloAntes = document.title;
    document.title = 'Comprobante-' + folioComprobante(pedido);
    setTimeout(function () {
        window.print();
        document.title = tituloAntes;
    }, 600);
}

document.addEventListener('DOMContentLoaded', function () {
    const folio = folioDeLaUrl();
    const pedido = leerPedidos().find(p => p.folio === folio);

    if (!pedido) {
        mostrarComprobanteNoEncontrado();
        return;
    }

    pintarComprobante(pedido);
    document.getElementById('btn-descargar-pdf').addEventListener('click', () => descargarPDF(pedido));
});
