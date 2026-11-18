/* =========================================================
   KOOKSTORE.MX - CHECKOUT (PAGO SIMULADO)
   ---------------------------------------------------------
   Flujo en 3 pasos (sin validaciones, se puede avanzar con
   los campos vacíos):
     Paso 1 -> Dirección y método de envío
     Paso 2 -> Método de pago: Tarjeta, Transferencia o
               KookWallet (saldo simulado)
     Paso 3 -> Confirmación previa: revisión de todo + "Pagar"

   Al pagar se registra el pedido (carrito.js), se muestra la
   pantalla "¡Pago aprobado!" con el número de pedido y el
   resumen, y desde ahí se abre el comprobante
   (comprobante.html?folio=...) o "Mis compras".

   De la tarjeta solo se guardan los últimos 4 dígitos.

   Necesita: notificaciones.js, datos-productos.js, sesion.js,
   carrito.js, cupones.js y ui.js
   ========================================================= */

let carritoCheckout = [];
let pasoActual = 1;

/* Referencia de la transferencia para esta compra */
const REFERENCIA_TRANSFERENCIA = 'KS-' + Math.floor(100000 + Math.random() * 900000);

/* Saldo con el que empieza la KookWallet de cada cuenta */
const SALDO_INICIAL_WALLET = 8000;
const RECARGA_WALLET = 2000;

const TEXTOS_BOTON_PASO = { 1: 'Continuar al pago', 2: 'Revisar pedido' };

/* ---------------------------------------------------------
   KOOKWALLET (saldo simulado por cuenta)
   --------------------------------------------------------- */
function claveWallet() {
    return 'kookstore_wallet_' + clienteActual();
}

function leerSaldoWallet() {
    const guardado = localStorage.getItem(claveWallet());
    if (guardado === null) {
        localStorage.setItem(claveWallet(), String(SALDO_INICIAL_WALLET));
        return SALDO_INICIAL_WALLET;
    }
    return Number(guardado) || 0;
}

function guardarSaldoWallet(saldo) {
    localStorage.setItem(claveWallet(), String(Math.max(0, saldo)));
}

/* ---------------------------------------------------------
   DATOS DEL FORMULARIO
   --------------------------------------------------------- */
function envioSeleccionado() {
    const radio = document.querySelector('input[name="envio"]:checked');
    return { nombre: radio.getAttribute('data-nombre'), costo: parseFloat(radio.value) };
}

/* Mismo cálculo que registrarPedido(): subtotal - cupón + envío */
function totalAPagar() {
    const cupon = infoCuponCarrito();
    const descuento = cupon && cupon.valido ? cupon.descuento : 0;
    return Math.max(0, totalCarrito() - descuento + envioSeleccionado().costo);
}

function direccionFormulario() {
    const valor = id => document.getElementById(id).value.trim();
    return {
        nombre: valor('envio-nombre'),
        calle: valor('envio-calle'),
        cp: valor('envio-cp'),
        ciudad: valor('envio-ciudad')
    };
}

function textoDireccion(d) {
    const linea2 = [d.cp ? 'C.P. ' + d.cp : '', d.ciudad].filter(Boolean).join(', ');
    return [d.calle, linea2].filter(Boolean).join(' · ') || 'Sin dirección capturada (simulado)';
}

function metodoElegido() {
    return document.querySelector('input[name="metodo-pago"]:checked').value;
}

/* Lo que se guarda del pago en el pedido (nunca el número completo ni el CVV) */
function datosMetodoPago() {
    const metodo = metodoElegido();
    if (metodo === 'transferencia') {
        return { tipo: 'transferencia', etiqueta: 'Transferencia SPEI', referencia: REFERENCIA_TRANSFERENCIA };
    }
    if (metodo === 'ewallet') {
        return { tipo: 'ewallet', etiqueta: 'KookWallet' };
    }
    const digitos = document.getElementById('pago-numero').value.replace(/\D/g, '');
    return {
        tipo: 'tarjeta',
        etiqueta: 'Tarjeta •••• ' + (digitos.slice(-4) || '0000'),
        titular: document.getElementById('pago-titular').value.trim()
    };
}

/* ---------------------------------------------------------
   PASOS
   --------------------------------------------------------- */
function irAPaso(numero) {
    pasoActual = Math.max(1, Math.min(3, numero));

    document.querySelectorAll('.checkout-paso').forEach(function (panel) {
        const activo = Number(panel.dataset.paso) === pasoActual;
        panel.hidden = !activo;
        panel.classList.toggle('activo', activo);
    });

    // Encabezado: hechos con ✓, el actual resaltado
    document.querySelectorAll('#checkout-pasos li[data-paso]').forEach(function (li) {
        const n = Number(li.dataset.paso);
        li.className = n < pasoActual ? 'hecho' : n === pasoActual ? 'activo' : '';
        li.querySelector('span').textContent = n < pasoActual ? '✓' : n;
        li.tabIndex = n < pasoActual ? 0 : -1;
    });

    if (pasoActual === 2) pintarPanelPago();
    if (pasoActual === 3) pintarRevision();
    actualizarBotonResumen();

    const grid = document.getElementById('checkout-grid');
    if (grid.getBoundingClientRect().top < 0) {
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/* El botón del resumen avanza en los pasos 1 y 2 y paga en el 3 */
function actualizarBotonResumen() {
    const texto = pasoActual === 3
        ? 'Pagar ' + formatearPrecio(totalAPagar())
        : TEXTOS_BOTON_PASO[pasoActual];
    const boton = document.getElementById('btn-pagar-final');
    if (!boton.classList.contains('procesando') && !boton.classList.contains('aprobado')) {
        boton.querySelector('span').textContent = texto;
    }
    document.getElementById('btn-pagar-paso').textContent = 'Pagar ' + formatearPrecio(totalAPagar());
}

/* ---------------------------------------------------------
   PASO 2: MÉTODOS DE PAGO
   --------------------------------------------------------- */
function mostrarMetodo() {
    const metodo = metodoElegido();
    document.querySelectorAll('.metodo-panel').forEach(function (panel) {
        panel.hidden = panel.dataset.metodo !== metodo;
    });
    pintarPanelPago();
}

/* Montos de transferencia y KookWallet */
function pintarPanelPago() {
    const total = totalAPagar();
    document.getElementById('dato-referencia').textContent = REFERENCIA_TRANSFERENCIA;
    document.getElementById('dato-monto-transferencia').textContent = formatearPrecio(total);

    const saldo = leerSaldoWallet();
    const usuario = usuarioActivo();
    document.getElementById('wallet-titular').textContent = usuario ? usuario.nombre : 'Invitado';
    document.getElementById('wallet-saldo').textContent = formatearPrecio(saldo);
    document.getElementById('wallet-saldo-linea').textContent = formatearPrecio(saldo);
    document.getElementById('wallet-total').textContent = '-' + formatearPrecio(total);

    const restante = saldo - total;
    const restanteTexto = document.getElementById('wallet-restante');
    restanteTexto.textContent = (restante < 0 ? '-' : '') + formatearPrecio(Math.abs(restante));
    restanteTexto.classList.toggle('negativo', restante < 0);
    document.getElementById('wallet-aviso').hidden = restante >= 0;
}

function recargarWallet() {
    guardarSaldoWallet(leerSaldoWallet() + RECARGA_WALLET);
    pintarPanelPago();
    kookToast('Se agregaron ' + formatearPrecio(RECARGA_WALLET) + ' a tu KookWallet.', 'exito', 'Recarga simulada');
}

function copiarDato(idDato) {
    const texto = document.getElementById(idDato).textContent.trim();
    const avisar = () => kookToast(texto, 'exito', 'Copiado al portapapeles');
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(texto).then(avisar, avisar);
    } else {
        avisar();
    }
}

/* ---------------------------------------------------------
   PASO 3: CONFIRMACIÓN PREVIA
   --------------------------------------------------------- */
function tarjetaRevision(icono, titulo, lineas, paso) {
    return '' +
        '<div class="revision-tarjeta">' +
        '<div class="revision-cabecera"><span>' + icono + ' ' + titulo + '</span>' +
        '<button type="button" class="revision-editar" data-ir-paso="' + paso + '">Editar</button></div>' +
        lineas.map(l => '<p>' + l + '</p>').join('') +
        '</div>';
}

function pintarRevision() {
    const direccion = direccionFormulario();
    const envio = envioSeleccionado();
    const pago = datosMetodoPago();

    let detallePago = '';
    if (pago.tipo === 'tarjeta') detallePago = escaparHTML(pago.titular || 'Titular sin capturar');
    if (pago.tipo === 'transferencia') detallePago = 'Referencia ' + pago.referencia;
    if (pago.tipo === 'ewallet') detallePago = 'Saldo disponible: ' + formatearPrecio(leerSaldoWallet());

    document.getElementById('revision-datos').innerHTML =
        tarjetaRevision('📍', 'Enviar a', [
            '<strong>' + escaparHTML(direccion.nombre || 'Sin nombre') + '</strong>',
            escaparHTML(textoDireccion(direccion))
        ], 1) +
        tarjetaRevision('🚚', 'Envío', [
            '<strong>' + escaparHTML(envio.nombre) + '</strong>',
            envio.costo ? formatearPrecio(envio.costo) : 'Gratis'
        ], 1) +
        tarjetaRevision(pago.tipo === 'tarjeta' ? '💳' : pago.tipo === 'transferencia' ? '🏦' : '👛', 'Pago', [
            '<strong>' + escaparHTML(pago.etiqueta) + '</strong>',
            detallePago
        ], 2);

    document.getElementById('revision-productos').innerHTML = carritoCheckout.map(item => `
        <div class="revision-producto">
            <img src="${resolverImagen(item.imagen)}" alt="" onerror="this.onerror=null; this.src='../assets/img/logo.png'">
            <div><strong>${escaparHTML(item.nombre)}</strong><small>${item.cantidad} × ${formatearPrecio(item.precio)}${item.opcion ? ' · ' + escaparHTML(item.opcion) : ''}</small></div>
            <span>${formatearPrecio(item.precio * item.cantidad)}</span>
        </div>
    `).join('');
}

/* ---------------------------------------------------------
   INICIO
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    sincronizarPreciosCarrito();   // cobra el precio con las ofertas vigentes
    carritoCheckout = leerCarrito();

    if (carritoCheckout.length === 0) {
        window.location.href = 'carrito.html';
        return;
    }

    // Si hay sesión, se adelanta el nombre del cliente
    const usuario = usuarioActivo();
    if (usuario && usuario.nombre) {
        document.getElementById('envio-nombre').value = usuario.nombre;
    }

    conectarTarjetaVisual();
    actualizarResumen();
    irAPaso(1);

    document.getElementById('acepto-terminos').addEventListener('change', function () {
        document.getElementById('casilla-terminos').classList.remove('requerida');
    });

    // Botones "Continuar", "Editar", "← Cambiar..." y los pasos ya hechos
    document.addEventListener('click', function (e) {
        const boton = e.target.closest('[data-ir-paso]');
        if (boton) irAPaso(Number(boton.dataset.irPaso));

        const pasoHecho = e.target.closest('#checkout-pasos li.hecho[data-paso]');
        if (pasoHecho) irAPaso(Number(pasoHecho.dataset.paso));

        const copiar = e.target.closest('[data-copiar]');
        if (copiar) copiarDato(copiar.dataset.copiar);
    });

    document.getElementById('btn-pagar-final').addEventListener('click', function () {
        if (pasoActual < 3) irAPaso(pasoActual + 1);
        else document.getElementById('form-pago').requestSubmit();
    });
    document.getElementById('form-pago').addEventListener('submit', procesarPago);

    document.querySelectorAll('input[name="metodo-pago"]').forEach(r => r.addEventListener('change', mostrarMetodo));
    document.getElementById('btn-recargar-wallet').addEventListener('click', recargarWallet);
});

/* La tarjeta de la izquierda refleja lo que se escribe (sin validar) */
function conectarTarjetaVisual() {
    const numero = document.getElementById('pago-numero');
    const titular = document.getElementById('pago-titular');
    const vence = document.getElementById('pago-vence');
    const cvv = document.getElementById('pago-cvv');

    numero.addEventListener('input', function () {
        const digitos = this.value.replace(/\D/g, '').slice(0, 16);
        this.value = digitos.replace(/(.{4})/g, '$1 ').trim();
        const relleno = (digitos + '•'.repeat(16 - digitos.length)).replace(/(.{4})/g, '$1 ').trim();
        document.getElementById('vista-numero').textContent = relleno;
    });

    titular.addEventListener('input', function () {
        document.getElementById('vista-titular').textContent = this.value.trim().toUpperCase() || 'TU NOMBRE';
    });

    vence.addEventListener('input', function () {
        const digitos = this.value.replace(/\D/g, '').slice(0, 4);
        this.value = digitos.length > 2 ? digitos.slice(0, 2) + '/' + digitos.slice(2) : digitos;
        document.getElementById('vista-vence').textContent = this.value || 'MM/AA';
    });

    cvv.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 4);
    });
}

function actualizarResumen() {
    const contenedorItems = document.getElementById('checkout-items');
    const contenedorDesglose = document.getElementById('checkout-desglose');
    const contenedorTotal = document.getElementById('checkout-total');

    contenedorItems.innerHTML = carritoCheckout.map(item => `
        <div class="resumen-item">
            <div class="resumen-item-foto">
                <img src="${resolverImagen(item.imagen)}" alt="" onerror="this.onerror=null; this.src='../assets/img/logo.png'">
                <span class="resumen-item-cantidad">${item.cantidad}</span>
            </div>
            <div class="resumen-item-info">
                <strong>${escaparHTML(item.nombre)}</strong>
                <small>${item.opcion ? escaparHTML(item.opcion) : escaparHTML(item.grupo || '')}</small>
            </div>
            <span class="resumen-item-precio">${formatearPrecio(item.precio * item.cantidad)}</span>
        </div>
    `).join('');

    const envioSeleccionado = document.querySelector('input[name="envio"]:checked');
    const costoEnvio = parseFloat(envioSeleccionado.value);
    const nombreEnvio = envioSeleccionado.getAttribute('data-nombre');
    const totalProductos = totalCarrito();
    const cupon = infoCuponCarrito();
    const descuentoCupon = cupon && cupon.valido ? cupon.descuento : 0;

    let lineaCupon = '';
    if (cupon && cupon.valido) {
        lineaCupon = `<div class="resumen-linea linea-cupon"><span>🎟️ Código <strong>${escaparHTML(cupon.codigo)}</strong> (${textoDescuentoCupon(cupon.cupon)})</span><span class="texto-gratis">-${formatearPrecio(descuentoCupon)}</span></div>`;
    } else if (cupon) {
        lineaCupon = `<div class="aviso-cupon">⚠️ El código ${escaparHTML(cupon.codigo)} no se aplicará: ${escaparHTML(cupon.mensaje)}</div>`;
    }

    contenedorDesglose.innerHTML = `
        <div class="resumen-linea"><span>Subtotal (${contarArticulos()} artículos)</span><span>${formatearPrecio(totalProductos)}</span></div>
        ${ahorroCarrito() > 0 ? `<div class="resumen-linea"><span>🔥 Ahorro en ofertas</span><span class="texto-gratis">-${formatearPrecio(ahorroCarrito())}</span></div>` : ''}
        ${lineaCupon}
        <div class="resumen-linea"><span>${nombreEnvio}</span><span class="${costoEnvio === 0 ? 'texto-gratis' : ''}">${costoEnvio === 0 ? 'Gratis' : formatearPrecio(costoEnvio)}</span></div>
    `;

    contenedorTotal.innerHTML = `
        <span>Total a pagar</span>
        <strong>${formatearPrecio(totalProductos - descuentoCupon + costoEnvio)}</strong>
    `;

    // El total cambia con el envío: se actualizan los montos que dependen de él
    pintarPanelPago();
    if (pasoActual === 3) pintarRevision();
    actualizarBotonResumen();
}

/* "Pagar": simula la confirmación exitosa de la compra */
function procesarPago(event) {
    event.preventDefault();

    // Enter en un campo del paso 1 o 2 solo avanza de paso
    if (pasoActual < 3) {
        irAPaso(pasoActual + 1);
        return;
    }

    // Igual que en las tiendas reales: sin aceptar los términos no se cobra
    const casilla = document.getElementById('casilla-terminos');
    if (!document.getElementById('acepto-terminos').checked) {
        casilla.classList.remove('requerida');
        void casilla.offsetWidth;            // reinicia la animación
        casilla.classList.add('requerida');
        casilla.scrollIntoView({ behavior: 'smooth', block: 'center' });
        kookToast('Acepta los Términos y Condiciones para confirmar tu compra.', 'aviso', 'Falta un paso');
        return;
    }

    // KookWallet: el saldo debe alcanzar (se puede recargar en el paso 2)
    const total = totalAPagar();
    const pago = datosMetodoPago();
    if (pago.tipo === 'ewallet' && leerSaldoWallet() < total) {
        kookConfirmar({
            tipo: 'aviso',
            titulo: 'Saldo insuficiente',
            texto: 'Tu KookWallet no alcanza para este pedido. Recarga saldo o elige otro método de pago.',
            detalle: 'Saldo: ' + formatearPrecio(leerSaldoWallet()) + ' · Total: ' + formatearPrecio(total),
            textoConfirmar: 'Cambiar método de pago',
            textoCancelar: 'Cerrar'
        }).then(ir => { if (ir) irAPaso(2); });
        return;
    }

    const btn = document.getElementById('btn-pagar-final');
    const btnPaso = document.getElementById('btn-pagar-paso');
    btn.classList.add('procesando');
    btn.querySelector('span').textContent = 'Procesando pago...';
    btnPaso.disabled = true;
    btnPaso.textContent = 'Procesando pago...';

    // Último chequeo de inventario antes de cobrar
    const sinStock = leerCarrito().filter(item => {
        const producto = obtenerProductoPorId(item.id);
        return !producto || item.cantidad > stockDisponible(producto, producto.tieneVariantes ? item.opcion : undefined);
    });
    if (sinStock.length > 0) {
        kookAlerta({
            tipo: 'aviso',
            titulo: 'Stock insuficiente',
            texto: 'Mientras comprabas se agotaron algunas piezas. Ajusta tu carrito para continuar.',
            detalle: sinStock.map(i => i.nombre + (i.opcion ? ' (' + i.opcion + ')' : '')).join(', '),
            textoBoton: 'Volver al carrito'
        }).then(() => { window.location.href = 'carrito.html'; });
        return;
    }

    const envio = envioSeleccionado();

    // Código de descuento: se vuelve a revisar justo antes de cobrar
    const cupon = infoCuponCarrito();
    const usuario = usuarioActivo();
    const extras = {
        terminosAceptados: new Date().toLocaleString('es-MX'),
        metodoPago: pago,
        direccionEnvio: direccionFormulario(),
        cliente: {
            nombre: document.getElementById('envio-nombre').value.trim() || (usuario ? usuario.nombre : 'Cliente invitado'),
            email: usuario ? usuario.email : ''
        }
    };
    if (cupon && cupon.valido) {
        extras.cupon = cupon.codigo;
        extras.descuentoCupon = cupon.descuento;
    }
    if (pago.tipo === 'ewallet') {
        pago.saldoRestante = leerSaldoWallet() - total;
    }

    setTimeout(() => {
        const nuevoPedido = registrarPedido(envio, extras);

        // El código queda canjeado para esta cuenta (una sola vez)
        if (nuevoPedido && extras.cupon) {
            canjearCupon(extras.cupon, clienteActual(), nuevoPedido.folio);
        }
        quitarCuponDelCarrito();

        // KookWallet: se descuenta el saldo
        if (nuevoPedido && pago.tipo === 'ewallet') {
            guardarSaldoWallet(pago.saldoRestante);
        }

        btn.classList.remove('procesando');
        btn.classList.add('aprobado');
        btn.querySelector('span').textContent = '¡Pago aprobado!';
        if (nuevoPedido) mostrarConfirmacion(nuevoPedido);
    }, 2000);
}

/* ---------------------------------------------------------
   CONFIRMACIÓN DE COMPRA: "¡PAGO APROBADO!"
   --------------------------------------------------------- */
function entregaEstimada(envio) {
    const nombre = String((envio && envio.nombre) || '').toLowerCase();
    if (nombre.includes('exprés') || nombre.includes('expres')) return 'Llega en 1 a 2 días hábiles';
    if (nombre.includes('tienda')) return 'Te avisamos cuando esté listo para recoger';
    return 'Llega en 3 a 5 días hábiles';
}

function mostrarConfirmacion(pedido) {
    document.querySelectorAll('#checkout-pasos li').forEach(li => { li.className = 'hecho'; li.querySelector('span').textContent = '✓'; });
    document.getElementById('checkout-grid').hidden = true;
    document.querySelector('.enlace-volver').hidden = true;

    const productos = (pedido.articulos || []).map(item => `
        <div class="revision-producto">
            <img src="${resolverImagen(item.imagen)}" alt="" onerror="this.onerror=null; this.src='../assets/img/logo.png'">
            <div><strong>${escaparHTML(item.nombre)}</strong><small>${item.cantidad} × ${formatearPrecio(item.precio)}${item.opcion ? ' · ' + escaparHTML(item.opcion) : ''}</small></div>
            <span>${formatearPrecio(item.precio * item.cantidad)}</span>
        </div>
    `).join('');

    const nombre = (pedido.cliente && pedido.cliente.nombre) || 'fan';
    const envioCosto = Number(pedido.envio && pedido.envio.costo) || 0;

    const seccion = document.getElementById('checkout-confirmacion');
    seccion.innerHTML = `
        <div class="confirmacion-tarjeta">
            <div class="exito-icono">
                <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="24" fill="none"/><path fill="none" d="M15 27l7 7 15-15"/></svg>
            </div>
            <span class="confirmacion-sello">✓ PAGO APROBADO</span>
            <h2>¡Pago aprobado!</h2>
            <p class="confirmacion-texto">Gracias, ${escaparHTML(nombre.split(' ')[0])}. Recibimos tu pago y ya estamos preparando tu pedido.</p>
            <div class="exito-folio">Número de pedido <strong>#${escaparHTML(pedido.folio)}</strong></div>

            <div class="confirmacion-datos">
                <div><span>📅</span><small>Fecha</small><strong>${escaparHTML(pedido.fecha)} · ${escaparHTML(pedido.hora || '')}</strong></div>
                <div><span>💳</span><small>Pagado con</small><strong>${escaparHTML(pedido.metodoPago ? pedido.metodoPago.etiqueta : 'Tarjeta')}</strong></div>
                <div><span>🚚</span><small>${escaparHTML(pedido.envio ? pedido.envio.nombre : 'Envío')}</small><strong>${entregaEstimada(pedido.envio)}</strong></div>
                <div><span>📍</span><small>Enviar a</small><strong>${escaparHTML(textoDireccion(pedido.direccionEnvio || {}))}</strong></div>
            </div>

            <h3 class="revision-subtitulo">Resumen de tu compra</h3>
            <div class="revision-productos">${productos}</div>

            <div class="confirmacion-totales">
                <div><span>Subtotal</span><span>${formatearPrecio(Number(pedido.subtotal) || 0)}</span></div>
                ${pedido.cupon ? `<div><span>🎟️ Código ${escaparHTML(pedido.cupon)}</span><span class="texto-gratis">-${formatearPrecio(Number(pedido.descuentoCupon) || 0)}</span></div>` : ''}
                <div><span>${escaparHTML(pedido.envio ? pedido.envio.nombre : 'Envío')}</span><span>${envioCosto ? formatearPrecio(envioCosto) : 'Gratis'}</span></div>
                <div class="confirmacion-total"><span>Total pagado</span><strong>${formatearPrecio(Number(pedido.total) || 0)}</strong></div>
            </div>

            <div class="confirmacion-botones">
                <a href="comprobante.html?folio=${encodeURIComponent(pedido.folio)}" class="btn-primario">🧾 Ver comprobante</a>
                <a href="carrito.html#historial" class="btn-contorno">📦 Ir a Mis compras</a>
            </div>
            <a href="catalogo.html" class="confirmacion-seguir">Seguir comprando →</a>
        </div>
    `;
    seccion.hidden = false;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    kookToast('Pedido #' + pedido.folio + ' confirmado.', 'exito', '¡Pago aprobado!');
}
