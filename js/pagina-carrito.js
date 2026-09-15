/* =========================================================
   KOOKSTORE.MX - PÁGINA DEL CARRITO
   ---------------------------------------------------------
   Dibuja las dos pestañas de carrito.html:

     1) Carrito             -> productos por pagar
     2) Historial de compras -> pedidos YA realizados por el
        usuario que tiene la sesión iniciada. Cada cuenta ve
        solamente sus propios pedidos, porque se leen con la
        clave kookstore_pedidos_<correo>.

   Necesita que se carguen antes: sesion.js y carrito.js
   ========================================================= */

/* ---------------------------------------------------------
   PESTAÑA 1: CARRITO
   --------------------------------------------------------- */
function pintarCarrito() {
    const contenedor = document.getElementById('contenido-carrito');
    const carrito = leerCarrito();

    actualizarTituloPestanaCarrito();

    if (carrito.length === 0) {
        contenedor.innerHTML = '' +
            '<div class="carrito-vacio">' +
            '<p>Tu carrito está vacío.</p>' +
            '<a href="catalogo.html" class="btn-primario">Ir al catálogo</a>' +
            '</div>';
        return;
    }

    let filas = '';

    for (let i = 0; i < carrito.length; i++) {
        const item = carrito[i];
        const subtotal = item.precio * item.cantidad;
        const textoOpcion = item.opcion
            ? '<span class="carrito-opcion">' + item.opcion + '</span>'
            : '';

        filas = filas + '' +
            '<tr>' +
            '<td><img src="' + rutaRaiz() + item.imagen + '" alt="' + item.nombre + '"></td>' +
            '<td>' +
            '<strong>' + item.nombre + '</strong>' +
            '<span class="carrito-opcion">' + item.grupo + '</span>' +
            textoOpcion +
            '</td>' +
            '<td>' + formatearPrecio(item.precio) + '</td>' +
            '<td>' +
            '<input type="number" class="carrito-cantidad" value="' + item.cantidad +
            '" min="1" max="99" data-indice="' + i + '">' +
            '</td>' +
            '<td>' + formatearPrecio(subtotal) + '</td>' +
            '<td><button type="button" class="btn-eliminar" data-indice="' + i + '">Eliminar</button></td>' +
            '</tr>';
    }

    contenedor.innerHTML = '' +
        '<table class="carrito-tabla">' +
        '<thead>' +
        '<tr>' +
        '<th>Imagen</th>' +
        '<th>Producto</th>' +
        '<th>Precio</th>' +
        '<th>Cantidad</th>' +
        '<th>Subtotal</th>' +
        '<th>Acción</th>' +
        '</tr>' +
        '</thead>' +
        '<tbody>' + filas + '</tbody>' +
        '</table>' +

        '<div class="carrito-resumen">' +
        '<h2>Total: ' + formatearPrecio(totalCarrito()) + '</h2>' +
        '<div class="carrito-acciones">' +
        '<button type="button" class="btn-vaciar" id="btn-vaciar-carrito">Vaciar carrito</button>' +
        '<button type="button" class="btn-primario btn-pagar" id="btn-procesar-pago">Proceder al Pago</button>' +
        '</div>' +
        '</div>';

    conectarBotonesDelCarrito();
}

/* Vuelve a enlazar los botones cada vez que se redibuja */
function conectarBotonesDelCarrito() {

    document.querySelectorAll('.btn-eliminar').forEach(function (boton) {
        boton.addEventListener('click', function () {
            eliminarDelCarrito(Number(this.getAttribute('data-indice')));
            pintarCarrito();
        });
    });

    document.querySelectorAll('.carrito-cantidad').forEach(function (campo) {
        campo.addEventListener('change', function () {
            cambiarCantidad(Number(this.getAttribute('data-indice')), this.value);
            pintarCarrito();
        });
    });

    document.getElementById('btn-vaciar-carrito')
        .addEventListener('click', function () {
            vaciarCarrito();
            pintarCarrito();
        });

    document.getElementById('btn-procesar-pago')
        .addEventListener('click', procesarPago);
}

/* ---------------------------------------------------------
   PAGO SIMULADO
   Convierte el carrito en un pedido del historial y manda
   al cliente a la pestaña "Historial de compras".
   --------------------------------------------------------- */
function procesarPago() {
    const pedido = registrarPedido();

    pintarCarrito();
    pintarHistorial();
    cambiarPestana('historial');

    mostrarToast('Compra registrada con el folio ' + pedido.folio);
}

/* ---------------------------------------------------------
   PESTAÑA 2: HISTORIAL DE COMPRAS DEL USUARIO
   --------------------------------------------------------- */
function pintarHistorial() {
    const contenedor = document.getElementById('contenido-historial');
    const usuario = usuarioActivo();
    const pedidos = leerPedidos();

    // Encabezado: de quién es el historial que se está viendo
    let encabezado = '';

    if (usuario) {
        encabezado = '' +
            '<div class="historial-dueno">' +
            '<strong>Historial de ' + usuario.nombre + '</strong>' +
            '<span>' + usuario.email + ' &bull; Cliente desde ' + usuario.miembroDesde + '</span>' +
            '</div>';
    } else {
        encabezado = '' +
            '<div class="historial-dueno">' +
            '<strong>Estás navegando como invitado</strong>' +
            '<span>Inicia sesión para que tus compras queden guardadas en tu cuenta. ' +
            '<a href="login.html" style="color: var(--color-primario); font-weight: 600;">Iniciar sesión</a></span>' +
            '</div>';
    }

    if (pedidos.length === 0) {
        contenedor.innerHTML = encabezado +
            '<div class="carrito-vacio">' +
            '<p>Todavía no tienes compras registradas.</p>' +
            '<a href="catalogo.html" class="btn-primario">Explorar el catálogo</a>' +
            '</div>';
        return;
    }

    let tarjetas = '';

    for (let i = 0; i < pedidos.length; i++) {
        const pedido = pedidos[i];
        let articulos = '';

        for (let j = 0; j < pedido.articulos.length; j++) {
            const articulo = pedido.articulos[j];
            const textoOpcion = articulo.opcion ? ' (' + articulo.opcion + ')' : '';

            articulos = articulos + '' +
                '<li>' +
                '<span>' + articulo.cantidad + 'x ' + articulo.nombre + textoOpcion + '</span>' +
                '<span>' + formatearPrecio(articulo.precio * articulo.cantidad) + '</span>' +
                '</li>';
        }

        tarjetas = tarjetas + '' +
            '<article class="pedido-card">' +
            '<div class="pedido-encabezado">' +
            '<div>' +
            '<span class="pedido-folio">Pedido ' + pedido.folio + '</span>' +
            '<span class="pedido-fecha">' + pedido.fecha + ' &bull; ' + pedido.hora + '</span>' +
            '</div>' +
            '<div class="pedido-derecha">' +
            '<span class="badge-estado">' + pedido.estado + '</span>' +
            '<div class="pedido-total">' + formatearPrecio(pedido.total) + '</div>' +
            '</div>' +
            '</div>' +
            '<ul class="pedido-articulos">' + articulos + '</ul>' +
            '</article>';
    }

    contenedor.innerHTML = encabezado + tarjetas;
}

/* ---------------------------------------------------------
   PESTAÑAS
   --------------------------------------------------------- */
function cambiarPestana(cual) {
    const tabCarrito = document.getElementById('tab-carrito');
    const tabHistorial = document.getElementById('tab-historial');
    const panelCarrito = document.getElementById('panel-carrito');
    const panelHistorial = document.getElementById('panel-historial');

    const verCarrito = (cual === 'carrito');

    tabCarrito.classList.toggle('activa', verCarrito);
    tabHistorial.classList.toggle('activa', !verCarrito);
    panelCarrito.classList.toggle('activo', verCarrito);
    panelHistorial.classList.toggle('activo', !verCarrito);
}

/* Pone el número de artículos en el nombre de la pestaña */
function actualizarTituloPestanaCarrito() {
    document.getElementById('tab-carrito').textContent =
        'Carrito (' + contarArticulos() + ')';
}

/* ---------------------------------------------------------
   PUNTO DE ENTRADA
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {

    pintarCarrito();
    pintarHistorial();

    document.getElementById('tab-carrito')
        .addEventListener('click', function () {
            cambiarPestana('carrito');
        });

    document.getElementById('tab-historial')
        .addEventListener('click', function () {
            cambiarPestana('historial');
        });

    // Si se llega con carrito.html#historial se abre esa pestaña
    if (window.location.hash === '#historial') {
        cambiarPestana('historial');
    }
});
