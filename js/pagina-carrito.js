/* =========================================================
   KOOKSTORE.MX - PÁGINA DEL CARRITO
   ---------------------------------------------------------
   Dibuja las dos pestañas de carrito.html:

     1) Carrito             -> productos por pagar
     2) Historial de compras -> pedidos YA realizados por el
        usuario que tiene la sesión iniciada.

   Incluye:
     - Casilla de selección múltiple y general ("Seleccionar todos").
     - Confirmación individual al eliminar un producto.
     - Confirmación masiva al eliminar seleccionados o vaciar el carrito.
     - Mensajes de aviso (toast) al concretar la eliminación.
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
            '<td><input type="checkbox" class="checkbox-item" data-indice="' + i + '"></td>' +
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
        '<div style="margin-bottom: 15px; display: flex; gap: 10px; align-items: center;">' +
        '<button type="button" class="btn-vaciar" id="btn-eliminar-seleccionados" style="display: none;">Eliminar seleccionados</button>' +
        '</div>' +

        '<table class="carrito-tabla">' +
        '<thead>' +
        '<tr>' +
        '<th><input type="checkbox" id="checkbox-todos"></th>' +
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

/* Vuelve a enlazar los botones y eventos cada vez que se redibuja */
function conectarBotonesDelCarrito() {

    // Checkbox general (Seleccionar todos)
    const checkTodos = document.getElementById('checkbox-todos');
    const checksItem = document.querySelectorAll('.checkbox-item');
    const btnEliminarSeleccionados = document.getElementById('btn-eliminar-seleccionados');

    function actualizarBotonSeleccionados() {
        const algunSeleccionado = Array.from(checksItem).some(chk => chk.checked);
        if (btnEliminarSeleccionados) {
            btnEliminarSeleccionados.style.display = algunSeleccionado ? 'inline-block' : 'none';
        }
    }

    if (checkTodos) {
        checkTodos.addEventListener('change', function () {
            checksItem.forEach(chk => {
                chk.checked = checkTodos.checked;
            });
            actualizarBotonSeleccionados();
        });
    }

    checksItem.forEach(chk => {
        chk.addEventListener('change', function () {
            actualizarBotonSeleccionados();
            if (checkTodos) {
                checkTodos.checked = Array.from(checksItem).every(c => c.checked);
            }
        });
    });

    // Eliminar individual con confirmación
    document.querySelectorAll('.btn-eliminar').forEach(function (boton) {
        boton.addEventListener('click', function () {
            const indice = Number(this.getAttribute('data-indice'));
            const confirmar = window.confirm('¿Estás seguro de eliminar este producto?');
            
            if (confirmar) {
                eliminarDelCarrito(indice);
                pintarCarrito();
                mostrarToast('Se eliminó el producto');
            }
        });
    });

    // Eliminar seleccionados / Vaciar carrito por selección
    if (btnEliminarSeleccionados) {
        btnEliminarSeleccionados.addEventListener('click', function () {
            const carrito = leerCarrito();
            const seleccionados = Array.from(checksItem).filter(chk => chk.checked);
            const todosSeleccionados = seleccionados.length === carrito.length;

            let mensaje = todosSeleccionados 
                ? '¿Deseas vaciar tu carrito?' 
                : '¿Deseas eliminar estos productos?';

            if (window.confirm(mensaje)) {
                // Obtenemos los índices de mayor a menor para eliminarlos sin alterar posiciones
                const indicesAEliminar = seleccionados
                    .map(chk => Number(chk.getAttribute('data-indice')))
                    .sort((a, b) => b - a);

                if (todosSeleccionados) {
                    vaciarCarrito();
                    mostrarToast('Se vació el carrito');
                } else {
                    for (let i = 0; i < indicesAEliminar.length; i++) {
                        eliminarDelCarrito(indicesAEliminar[i]);
                    }
                    mostrarToast('Se eliminó el producto o productos');
                }
                pintarCarrito();
            }
        });
    }

    // Cambiar cantidad de producto
    document.querySelectorAll('.carrito-cantidad').forEach(function (campo) {
        campo.addEventListener('change', function () {
            cambiarCantidad(Number(this.getAttribute('data-indice')), this.value);
            pintarCarrito();
        });
    });

    // Vaciar carrito completo desde el botón inferior
    const btnVaciar = document.getElementById('btn-vaciar-carrito');
    if (btnVaciar) {
        btnVaciar.addEventListener('click', function () {
            if (window.confirm('¿Deseas vaciar tu carrito?')) {
                vaciarCarrito();
                pintarCarrito();
                mostrarToast('Se vació el carrito');
            }
        });
    }

    const btnPagar = document.getElementById('btn-procesar-pago');
    if (btnPagar) {
        btnPagar.addEventListener('click', procesarPago);
    }
}

/* ---------------------------------------------------------
   PAGO SIMULADO (ACTUALIZADO PARA CHECKOUT)
   --------------------------------------------------------- */
function procesarPago() {
    // Ya no simulamos la compra aquí directamente.
    // Ahora enviamos al usuario al flujo visual completo.
    
    // Solo permitimos ir a pagar si hay algo en el carrito
    if (leerCarrito().length > 0) {
        window.location.href = 'checkout.html';
    } else {
        mostrarToast('Tu carrito está vacío');
    }
}

/* ---------------------------------------------------------
   PESTAÑA 2: HISTORIAL DE COMPRAS DEL USUARIO
   --------------------------------------------------------- */
function pintarHistorial() {
    const contenedor = document.getElementById('contenido-historial');
    const usuario = usuarioActivo();
    const pedidos = leerPedidos();

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

    if (window.location.hash === '#historial') {
        cambiarPestana('historial');
    }
});