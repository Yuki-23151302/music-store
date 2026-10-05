/* =========================================================
   KOOKSTORE.MX - PÁGINA DEL CARRITO E HISTORIAL DE COMPRAS
   ---------------------------------------------------------
   Dibuja las dos pestañas de carrito.html:

     1) Carrito             -> productos por pagar
     2) Historial de compras -> pedidos YA realizados por el
        usuario que tiene la sesión iniciada.

   Incluye:
     - Casilla de selección múltiple y general ("Seleccionar todos").
     - Botón dinámico "Eliminar seleccionados" (vacía el carrito si se seleccionan todos).
     - Manejo de imágenes mediante rutaRaiz().
     - Desglose desplegable con seguimiento tipo SHEIN en el Historial.
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
    const prefixRuta = (typeof rutaRaiz === 'function') ? rutaRaiz() : '';

    for (let i = 0; i < carrito.length; i++) {
        const item = carrito[i];
        const subtotal = item.precio * item.cantidad;
        const textoOpcion = item.opcion
            ? '<span class="carrito-opcion">' + item.opcion + '</span>'
            : '';

        const rutaImagen = prefixRuta + item.imagen;

        filas = filas + '' +
            '<tr>' +
            '<td><input type="checkbox" class="checkbox-item" data-indice="' + i + '"></td>' +
            '<td><img src="' + rutaImagen + '" alt="' + item.nombre + '" onerror="this.onerror=null; this.src=\'' + prefixRuta + 'assets/img/logo.png\';"></td>' +
            '<td>' +
            '<strong>' + item.nombre + '</strong>' +
            '<span class="carrito-opcion">' + (item.grupo || '') + '</span>' +
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

    // Eliminar seleccionados / Vaciar carrito por selección masiva
    if (btnEliminarSeleccionados) {
        btnEliminarSeleccionados.addEventListener('click', function () {
            const carrito = leerCarrito();
            const seleccionados = Array.from(checksItem).filter(chk => chk.checked);
            const todosSeleccionados = seleccionados.length === carrito.length;

            let mensaje = todosSeleccionados 
                ? '¿Deseas vaciar tu carrito?' 
                : '¿Deseas eliminar estos productos?';

            if (window.confirm(mensaje)) {
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
                    mostrarToast('Se eliminaron los productos seleccionados');
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

    // Redirección al proceso de pago (Checkout)
    const btnPagar = document.getElementById('btn-procesar-pago');
    if (btnPagar) {
        btnPagar.addEventListener('click', procesarPago);
    }
}

/* ---------------------------------------------------------
   PAGO SIMULADO (CHECKOUT)
   --------------------------------------------------------- */
function procesarPago() {
    if (leerCarrito().length > 0) {
        window.location.href = 'checkout.html';
    } else {
        mostrarToast('Tu carrito está vacío');
    }
}

/* ---------------------------------------------------------
   PESTAÑA 2: HISTORIAL DE COMPRAS Y SEGUIMIENTO TIPO SHEIN
   --------------------------------------------------------- */

function obtenerPasoEstado(estado) {
    const est = (estado || '').toLowerCase().trim();
    if (est === 'pagado') return 1;
    if (est === 'en proceso') return 2;
    if (est === 'en camino') return 3;
    if (est === 'entregado') return 4;
    return 1; // Por defecto siempre inicia en paso 1 (Pagado)
}

function calcularPorcentajeLinea(paso) {
    if (paso === 1) return 0;
    if (paso === 2) return 33.3;
    if (paso === 3) return 66.6;
    if (paso === 4) return 100;
    return 0;
}

/* Generador de círculos con estilos directos para evitar inconsistencias de CSS */
function generarCirculoPaso(numeroPaso, pasoActual, iconoPendiente) {
    const estaCompletado = numeroPaso <= pasoActual;
    
    if (estaCompletado) {
        // Estado completado: Círculo verde lleno con palomita blanca
        return '<div class="step-circulo" style="background-color: #2e7d32 !important; color: #ffffff !important; border: 2px solid #2e7d32 !important; font-weight: bold; font-size: 1.1rem; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; margin: 0 auto 6px auto; box-shadow: 0 2px 5px rgba(46, 125, 50, 0.3);">✓</div>';
    } else {
        // Estado pendiente: Círculo gris suave con icono emoji
        return '<div class="step-circulo" style="background-color: #f5f5f5 !important; color: #777777 !important; border: 2px solid #cccccc !important; font-size: 1rem; display: flex; align-items: center; justify-content: center; width: 36px; height: 36px; border-radius: 50%; margin: 0 auto 6px auto;">' + iconoPendiente + '</div>';
    }
}

function toggleRastreo(folio, event) {
    if (event) {
        event.stopPropagation();
    }
    const contenedor = document.getElementById('rastreo-' + folio);
    const tarjeta = document.getElementById('tarjeta-pedido-' + folio);

    if (contenedor) {
        const estaAbierto = contenedor.style.display === 'block';
        contenedor.style.display = estaAbierto ? 'none' : 'block';
        if (tarjeta) {
            tarjeta.classList.toggle('desplegado', !estaAbierto);
        }
    }
}

function pintarHistorial() {
    const contenedor = document.getElementById('contenido-historial');
    const usuario = usuarioActivo();
    const pedidos = leerPedidos();

    let encabezado = '';

    if (usuario) {
        encabezado = '' +
            '<div class="historial-dueno">' +
            '<strong>Historial de ' + usuario.nombre + '</strong>' +
            '<span>' + usuario.email + ' &bull; Cliente desde ' + (usuario.miembroDesde || 'Junio 2026') + '</span>' +
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

        if (pedido.articulos && pedido.articulos.length > 0) {
            for (let j = 0; j < pedido.articulos.length; j++) {
                const articulo = pedido.articulos[j];
                const textoOpcion = articulo.opcion ? ' (' + articulo.opcion + ')' : '';

                articulos += '<li>' +
                    '<span>' + articulo.cantidad + 'x ' + articulo.nombre + textoOpcion + '</span>' +
                    '<span>' + formatearPrecio(articulo.precio * articulo.cantidad) + '</span>' +
                    '</li>';
            }
        } else if (pedido.resumen) {
            articulos = '<li><span>' + pedido.resumen + '</span><span>' + formatearPrecio(pedido.total) + '</span></li>';
        }

        const pasoActual = obtenerPasoEstado(pedido.estado);
        const porcentajeLinea = calcularPorcentajeLinea(pasoActual);
        const claseClaveEstado = (pedido.estado || 'pagado').toLowerCase().replace(/\s+/g, '-');

        tarjetas += '' +
            '<article class="pedido-card tarjeta-pedido" id="tarjeta-pedido-' + pedido.folio + '" onclick="toggleRastreo(\'' + pedido.folio + '\', event)">' +
            '<div class="pedido-encabezado">' +
            '<div>' +
            '<span class="pedido-folio">Pedido ' + pedido.folio + '</span>' +
            '<span class="pedido-fecha">' + pedido.fecha + ' &bull; ' + pedido.hora + '</span>' +
            '</div>' +
            '<div class="pedido-derecha pedido-header-derecha">' +
            '<span class="badge-estado ' + claseClaveEstado + '">' + pedido.estado + '</span>' +
            '<div class="pedido-total">' + formatearPrecio(pedido.total) + '</div>' +
            '<button type="button" class="btn-toggle-rastreo">Rastreo <span class="flecha-icon">▼</span></button>' +
            '</div>' +
            '</div>' +
            '<ul class="pedido-articulos">' + articulos + '</ul>' +

            '<div class="desplegable-rastreo" id="rastreo-' + pedido.folio + '" style="display: none;">' +
            '<div class="rastreo-header">' +
            '<h4>Seguimiento del Paquete</h4>' +
            '<span style="font-size: 0.88rem; color: #666;">Estado actual: <strong>' + pedido.estado + '</strong></span>' +
            '</div>' +

            '<div class="stepper-container">' +
            '<div class="stepper-linea-fondo">' +
            '<div class="stepper-linea-progreso" style="width: ' + porcentajeLinea + '%;"></div>' +
            '</div>' +

            '<div class="step-item ' + (pasoActual >= 1 ? 'completado' : '') + '">' +
            generarCirculoPaso(1, pasoActual, '💳') +
            '<span class="step-texto" style="color: ' + (pasoActual >= 1 ? '#2e7d32' : '#666') + '; font-weight: ' + (pasoActual >= 1 ? '700' : '400') + ';">Pagado</span>' +
            '</div>' +

            '<div class="step-item ' + (pasoActual >= 2 ? 'completado' : '') + '">' +
            generarCirculoPaso(2, pasoActual, '📦') +
            '<span class="step-texto" style="color: ' + (pasoActual >= 2 ? '#2e7d32' : '#666') + '; font-weight: ' + (pasoActual >= 2 ? '700' : '400') + ';">En proceso</span>' +
            '</div>' +

            '<div class="step-item ' + (pasoActual >= 3 ? 'completado' : '') + '">' +
            generarCirculoPaso(3, pasoActual, '🚚') +
            '<span class="step-texto" style="color: ' + (pasoActual >= 3 ? '#2e7d32' : '#666') + '; font-weight: ' + (pasoActual >= 3 ? '700' : '400') + ';">En camino</span>' +
            '</div>' +

            '<div class="step-item ' + (pasoActual >= 4 ? 'completado' : '') + '">' +
            generarCirculoPaso(4, pasoActual, '🏠') +
            '<span class="step-texto" style="color: ' + (pasoActual >= 4 ? '#2e7d32' : '#666') + '; font-weight: ' + (pasoActual >= 4 ? '700' : '400') + ';">Entregado</span>' +
            '</div>' +
            '</div>' +
            '</div>' +
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

    if (tabCarrito && tabHistorial && panelCarrito && panelHistorial) {
        tabCarrito.classList.toggle('activa', verCarrito);
        tabHistorial.classList.toggle('activa', !verCarrito);
        panelCarrito.classList.toggle('activo', verCarrito);
        panelHistorial.classList.toggle('activo', !verCarrito);
    }
}

function actualizarTituloPestanaCarrito() {
    const tab = document.getElementById('tab-carrito');
    if (tab) {
        tab.textContent = 'Carrito (' + contarArticulos() + ')';
    }
}

/* ---------------------------------------------------------
   PUNTO DE ENTRADA
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {

    pintarCarrito();
    pintarHistorial();

    const tabCarrito = document.getElementById('tab-carrito');
    const tabHistorial = document.getElementById('tab-historial');

    if (tabCarrito) {
        tabCarrito.addEventListener('click', function () {
            cambiarPestana('carrito');
        });
    }

    if (tabHistorial) {
        tabHistorial.addEventListener('click', function () {
            cambiarPestana('historial');
        });
    }

    if (window.location.hash === '#historial') {
        cambiarPestana('historial');
    }
});