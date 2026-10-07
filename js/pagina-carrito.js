/* =========================================================
   KOOKSTORE.MX - PÁGINA DEL CARRITO E HISTORIAL DE COMPRAS
   ---------------------------------------------------------
   Dibuja las dos pestañas de carrito.html:

     1) Carrito             -> productos por pagar
     2) Historial de compras -> pedidos YA realizados por el
        usuario que tiene la sesión iniciada.

   Incluye:
     - Selección múltiple con "Eliminar seleccionados"; si se marcan
       todos, el botón cambia a "Vaciar carrito". Confirmaciones
       modernas (notificaciones.js).
     - Cantidad con botones − / + limitada al stock disponible.
     - Resumen con subtotal, número de artículos y total.
     - Rastreo del pedido: Pagado → En preparación → En camino → Entregado.
     - Si el Admin cancela un pedido, aparece un aviso de reembolso
       (también en vivo si la página está abierta en otra pestaña).
   ========================================================= */

/* ---------------------------------------------------------
   AYUDAS DE STOCK (solo si la página cargó datos-productos.js)
   --------------------------------------------------------- */
function stockDeLinea(item) {
    if (typeof obtenerProductoPorId !== 'function') return 99;
    const producto = obtenerProductoPorId(item.id);
    if (!producto) return 0;
    return stockDisponible(producto, producto.tieneVariantes ? item.opcion : undefined);
}

/* ---------------------------------------------------------
   PESTAÑA 1: CARRITO
   --------------------------------------------------------- */
function pintarCarrito() {
    const contenedor = document.getElementById('contenido-carrito');
    sincronizarPreciosCarrito();   // aplica ofertas que empezaron o terminaron
    const carrito = leerCarrito();

    actualizarTituloPestanaCarrito();

    if (carrito.length === 0) {
        contenedor.innerHTML = '' +
            '<div class="carrito-vacio">' +
            '<div class="carrito-vacio-icono">🛍️</div>' +
            '<h2>Tu carrito está vacío</h2>' +
            '<p>Descubre álbumes, lightsticks y peluches de tus grupos favoritos.</p>' +
            '<a href="catalogo.html" class="btn-primario">Ir al catálogo</a>' +
            '</div>';
        return;
    }

    let filas = '';

    for (let i = 0; i < carrito.length; i++) {
        const item = carrito[i];
        const subtotal = item.precio * item.cantidad;
        const stock = stockDeLinea(item);
        const excedeStock = item.cantidad > stock;

        const textoOpcion = item.opcion
            ? '<span class="carrito-opcion carrito-opcion-variante">' + escaparHTML(item.opcion) + '</span>'
            : '';
        const avisoStock = excedeStock
            ? '<span class="carrito-aviso-stock">' + (stock <= 0 ? 'Agotado' : 'Solo quedan ' + stock) + '</span>'
            : '';

        filas += '' +
            '<tr class="' + (excedeStock ? 'fila-sin-stock' : '') + '">' +
            '<td><input type="checkbox" class="checkbox-item" data-indice="' + i + '" aria-label="Seleccionar ' + escaparHTML(item.nombre) + '"></td>' +
            '<td><img src="' + resolverImagen(item.imagen) + '" alt="' + escaparHTML(item.nombre) + '" onerror="this.onerror=null; this.src=\'' + rutaRaiz() + 'assets/img/logo.png\';"></td>' +
            '<td>' +
            '<strong>' + escaparHTML(item.nombre) + '</strong>' +
            '<span class="carrito-opcion">' + escaparHTML(item.grupo || '') + '</span>' +
            textoOpcion + avisoStock +
            '</td>' +
            '<td>' +
            (item.precioOriginal > item.precio ? '<span class="carrito-precio-antes">' + formatearPrecio(item.precioOriginal) + '</span>' : '') +
            '<span class="' + (item.precioOriginal > item.precio ? 'carrito-precio-oferta' : '') + '">' + formatearPrecio(item.precio) + '</span>' +
            '</td>' +
            '<td>' +
            '<div class="carrito-stepper">' +
            '<button type="button" class="btn-cantidad" data-indice="' + i + '" data-paso="-1" aria-label="Restar uno"' + (item.cantidad <= 1 ? ' disabled' : '') + '>−</button>' +
            '<input type="number" class="carrito-cantidad" value="' + item.cantidad + '" min="1" max="' + Math.max(1, stock) + '" data-indice="' + i + '" aria-label="Cantidad">' +
            '<button type="button" class="btn-cantidad" data-indice="' + i + '" data-paso="1" aria-label="Sumar uno"' + (item.cantidad >= stock ? ' disabled' : '') + '>+</button>' +
            '</div>' +
            '</td>' +
            '<td class="carrito-subtotal">' + formatearPrecio(subtotal) + '</td>' +
            '<td><button type="button" class="btn-eliminar" data-indice="' + i + '" title="Eliminar producto">' +
            '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
            '<span>Eliminar</span></button></td>' +
            '</tr>';
    }

    const articulos = contarArticulos();
    const ahorro = ahorroCarrito();

    contenedor.innerHTML = '' +
        '<div class="carrito-barra">' +
        '<span class="carrito-barra-info">' + carrito.length + (carrito.length === 1 ? ' producto' : ' productos') + ' en tu carrito</span>' +
        '<div class="carrito-barra-acciones">' +
        '<button type="button" class="btn-vaciar" id="btn-eliminar-seleccionados" hidden>Eliminar seleccionados</button>' +
        '</div>' +
        '</div>' +

        '<div class="carrito-layout">' +
        '<div class="carrito-tabla-card">' +
        '<table class="carrito-tabla">' +
        '<thead>' +
        '<tr>' +
        '<th><input type="checkbox" id="checkbox-todos" aria-label="Seleccionar todos"></th>' +
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
        '</div>' +

        '<aside class="carrito-resumen">' +
        '<h2>Resumen</h2>' +
        '<div class="resumen-linea"><span>Artículos</span><span>' + articulos + '</span></div>' +
        '<div class="resumen-linea"><span>Subtotal</span><span>' + formatearPrecio(totalCarrito()) + '</span></div>' +
        (ahorro > 0 ? '<div class="resumen-linea resumen-ahorro"><span>🔥 Ahorro</span><span>-' + formatearPrecio(ahorro) + '</span></div>' : '') +
        '<div class="resumen-linea resumen-nota"><span>Envío</span><span>Se elige al pagar</span></div>' +
        '<div class="resumen-linea resumen-total"><span>Total</span><strong>' + formatearPrecio(totalCarrito()) + '</strong></div>' +
        '<div class="carrito-acciones">' +
        '<button type="button" class="btn-primario btn-pagar" id="btn-procesar-pago">Proceder al Pago</button>' +
        '<a href="catalogo.html" class="enlace-seguir">← Seguir comprando</a>' +
        '</div>' +
        '<ul class="resumen-garantias">' +
        '<li><span>🔒</span>Pago seguro (simulado)</li>' +
        '<li><span>🚚</span>Envíos a todo México</li>' +
        '<li><span>💎</span>Productos 100% oficiales</li>' +
        '</ul>' +
        '</aside>' +
        '</div>';

    conectarBotonesDelCarrito();
}

/* Vuelve a enlazar los botones y eventos cada vez que se redibuja */
function conectarBotonesDelCarrito() {

    const checkTodos = document.getElementById('checkbox-todos');
    const checksItem = document.querySelectorAll('.checkbox-item');
    const btnEliminarSeleccionados = document.getElementById('btn-eliminar-seleccionados');

    /* Con todos marcados, el botón se convierte en "Vaciar carrito" */
    function actualizarBotonSeleccionados() {
        const cuantos = Array.from(checksItem).filter(chk => chk.checked).length;
        const todos = cuantos === checksItem.length;
        btnEliminarSeleccionados.hidden = cuantos === 0;
        btnEliminarSeleccionados.classList.toggle('btn-vaciar-todo', todos);
        btnEliminarSeleccionados.textContent = todos
            ? 'Vaciar carrito'
            : 'Eliminar seleccionados (' + cuantos + ')';
    }

    checkTodos.addEventListener('change', function () {
        checksItem.forEach(chk => { chk.checked = checkTodos.checked; });
        actualizarBotonSeleccionados();
    });

    checksItem.forEach(chk => {
        chk.addEventListener('change', function () {
            actualizarBotonSeleccionados();
            checkTodos.checked = Array.from(checksItem).every(c => c.checked);
        });
    });

    // Eliminar un producto con confirmación moderna
    document.querySelectorAll('.btn-eliminar').forEach(function (boton) {
        boton.addEventListener('click', function () {
            const indice = Number(this.getAttribute('data-indice'));
            const item = leerCarrito()[indice];
            if (!item) return;

            kookConfirmar({
                tipo: 'peligro',
                titulo: '¿Quitar este producto?',
                texto: 'Se eliminará de tu carrito. Puedes volver a agregarlo desde el catálogo.',
                detalle: item.cantidad + 'x ' + item.nombre + (item.opcion ? ' · ' + item.opcion : ''),
                textoConfirmar: 'Sí, eliminar',
                textoCancelar: 'Conservar'
            }).then(function (acepto) {
                if (!acepto) return;
                eliminarDelCarrito(indice);
                pintarCarrito();
                kookToast(item.nombre + ' se eliminó del carrito', 'exito');
            });
        });
    });

    // Eliminar varios productos seleccionados (o vaciar si están todos)
    btnEliminarSeleccionados.addEventListener('click', function () {
        const carrito = leerCarrito();
        const indices = Array.from(checksItem)
            .filter(chk => chk.checked)
            .map(chk => Number(chk.getAttribute('data-indice')))
            .sort((a, b) => b - a);

        if (indices.length === carrito.length) {
            confirmarVaciarCarrito();
            return;
        }

        kookConfirmar({
            tipo: 'peligro',
            titulo: '¿Eliminar ' + indices.length + ' productos?',
            texto: 'Los productos seleccionados se quitarán de tu carrito.',
            textoConfirmar: 'Sí, eliminar',
            textoCancelar: 'Cancelar'
        }).then(function (acepto) {
            if (!acepto) return;
            indices.forEach(i => eliminarDelCarrito(i));
            pintarCarrito();
            kookToast('Se eliminaron ' + indices.length + ' productos', 'exito');
        });
    });

    // Botones − / +
    document.querySelectorAll('.btn-cantidad').forEach(function (boton) {
        boton.addEventListener('click', function () {
            const indice = Number(this.getAttribute('data-indice'));
            const item = leerCarrito()[indice];
            if (!item) return;
            actualizarCantidadLinea(indice, item.cantidad + Number(this.getAttribute('data-paso')));
        });
    });

    // Cantidad escrita a mano
    document.querySelectorAll('.carrito-cantidad').forEach(function (campo) {
        campo.addEventListener('change', function () {
            actualizarCantidadLinea(Number(this.getAttribute('data-indice')), this.value);
        });
    });

    document.getElementById('btn-procesar-pago').addEventListener('click', procesarPago);
}

/* Cambia la cantidad respetando el stock disponible */
function actualizarCantidadLinea(indice, valor) {
    const item = leerCarrito()[indice];
    if (!item) return;

    const stock = stockDeLinea(item);
    let cantidad = Math.max(1, Math.floor(Number(valor)) || 1);

    if (cantidad > stock && stock > 0) {
        cantidad = stock;
        kookToast('Solo hay ' + stock + ' piezas disponibles de este producto', 'aviso');
    }

    cambiarCantidad(indice, cantidad);
    pintarCarrito();
}

/* Confirmación llamativa antes de vaciar todo el carrito */
function confirmarVaciarCarrito() {
    const articulos = contarArticulos();

    kookConfirmar({
        tipo: 'peligro',
        titulo: '¿Vaciar todo tu carrito?',
        texto: 'Se quitarán todos los productos. Esta acción no se puede deshacer.',
        detalle: articulos + (articulos === 1 ? ' artículo' : ' artículos') + ' · ' + formatearPrecio(totalCarrito()),
        textoConfirmar: 'Sí, vaciar carrito',
        textoCancelar: 'Mejor no'
    }).then(function (acepto) {
        if (!acepto) return;
        vaciarCarrito();
        pintarCarrito();
        kookToast('Tu carrito quedó vacío', 'exito');
    });
}

/* ---------------------------------------------------------
   PAGO SIMULADO (CHECKOUT)
   Antes de ir a pagar se revisa que haya stock suficiente.
   --------------------------------------------------------- */
function procesarPago() {
    const carrito = leerCarrito();
    if (carrito.length === 0) {
        kookToast('Tu carrito está vacío', 'aviso');
        return;
    }

    const sinStock = carrito.filter(item => item.cantidad > stockDeLinea(item));
    if (sinStock.length > 0) {
        kookAlerta({
            tipo: 'aviso',
            titulo: 'Revisa tu carrito',
            texto: 'Algunos productos ya no tienen stock suficiente. Ajusta las cantidades marcadas para continuar.',
            detalle: sinStock.map(i => i.nombre + (i.opcion ? ' (' + i.opcion + ')' : '')).join(', '),
            textoBoton: 'Entendido'
        });
        return;
    }

    window.location.href = 'checkout.html';
}

/* ---------------------------------------------------------
   PESTAÑA 2: HISTORIAL DE COMPRAS Y RASTREO
   --------------------------------------------------------- */

const PASOS_RASTREO = [
    { estado: 'Pagado', icono: '💳' },
    { estado: 'En preparación', icono: '📦' },
    { estado: 'En camino', icono: '🚚' },
    { estado: 'Entregado', icono: '🏠' }
];

const MENSAJE_CANCELACION = 'Tu pedido ha sido cancelado. Se procederá con la devolución/reembolso de tu dinero.';

/* Índice (1..4) del paso en que va el pedido */
function obtenerPasoEstado(estado) {
    const indice = PASOS_RASTREO.findIndex(p => p.estado === normalizarEstado(estado));
    return indice === -1 ? 1 : indice + 1;
}

/* Barra de pasos del pedido */
function construirStepper(pedido) {
    // Pedido cancelado: solo se muestra Pagado → Cancelado
    if (esPedidoCancelado(pedido)) {
        return '' +
            '<div class="stepper-container stepper-cancelado">' +
            '<div class="stepper-linea-fondo"><div class="stepper-linea-progreso" style="width: 100%;"></div></div>' +
            '<div class="step-item completado"><div class="step-circulo">✓</div><span class="step-texto">Pagado</span></div>' +
            '<div class="step-item cancelado"><div class="step-circulo">✕</div><span class="step-texto">Cancelado</span></div>' +
            '</div>';
    }

    const pasoActual = obtenerPasoEstado(pedido.estado);
    const porcentaje = ((pasoActual - 1) / (PASOS_RASTREO.length - 1)) * 100;

    let pasos = '';
    PASOS_RASTREO.forEach(function (paso, i) {
        const numero = i + 1;
        let clase = '';
        if (numero < pasoActual || (numero === pasoActual && numero === PASOS_RASTREO.length)) clase = 'completado';
        else if (numero === pasoActual) clase = 'completado actual';

        pasos += '' +
            '<div class="step-item ' + clase + '">' +
            '<div class="step-circulo">' + (numero <= pasoActual ? '✓' : paso.icono) + '</div>' +
            '<span class="step-texto">' + paso.estado + '</span>' +
            '</div>';
    });

    return '' +
        '<div class="stepper-container">' +
        '<div class="stepper-linea-fondo"><div class="stepper-linea-progreso" style="width: ' + porcentaje + '%;"></div></div>' +
        pasos +
        '</div>';
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
            '<strong>Historial de ' + escaparHTML(usuario.nombre) + '</strong>' +
            '<span>' + escaparHTML(usuario.email) + ' &bull; Cliente desde ' + (usuario.miembroDesde || 'Junio 2026') + '</span>' +
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
            '<div class="carrito-vacio-icono">📦</div>' +
            '<h2>Todavía no tienes compras</h2>' +
            '<p>Cuando hagas un pedido podrás seguir su envío desde aquí.</p>' +
            '<a href="catalogo.html" class="btn-primario">Explorar el catálogo</a>' +
            '</div>';
        return;
    }

    let tarjetas = '';

    pedidos.forEach(function (pedido) {
        let articulos = '';

        if (pedido.articulos && pedido.articulos.length > 0) {
            pedido.articulos.forEach(function (articulo) {
                const textoOpcion = articulo.opcion ? ' (' + escaparHTML(articulo.opcion) + ')' : '';
                articulos += '<li>' +
                    '<span>' + articulo.cantidad + 'x ' + escaparHTML(articulo.nombre) + textoOpcion + '</span>' +
                    '<span>' + formatearPrecio(articulo.precio * articulo.cantidad) + '</span>' +
                    '</li>';
            });
        } else if (pedido.resumen) {
            articulos = '<li><span>' + escaparHTML(pedido.resumen) + '</span><span>' + formatearPrecio(pedido.total) + '</span></li>';
        }

        // Línea de envío (solo en pedidos que la guardaron)
        if (pedido.envio) {
            articulos += '<li class="pedido-linea-envio"><span>' + escaparHTML(pedido.envio.nombre) + '</span>' +
                '<span>' + (pedido.envio.costo ? formatearPrecio(pedido.envio.costo) : 'Gratis') + '</span></li>';
        }

        const estado = normalizarEstado(pedido.estado);
        const cancelado = esPedidoCancelado(pedido);

        // Aviso de reembolso: siempre visible, aunque el rastreo esté cerrado
        const avisoCancelacion = cancelado
            ? '<div class="aviso-cancelacion" role="alert">' +
              '<span class="aviso-cancelacion-icono">!</span>' +
              '<div>' +
              '<strong>Pedido cancelado</strong>' +
              '<p>' + MENSAJE_CANCELACION + '</p>' +
              '<span class="aviso-cancelacion-monto">Monto a reembolsar: ' + formatearPrecio(pedido.total) + '</span>' +
              '</div>' +
              '</div>'
            : '';

        tarjetas += '' +
            '<article class="pedido-card tarjeta-pedido' + (cancelado ? ' pedido-cancelado' : '') + '" id="tarjeta-pedido-' + pedido.folio + '" onclick="toggleRastreo(\'' + pedido.folio + '\', event)">' +
            '<div class="pedido-encabezado">' +
            '<div>' +
            '<span class="pedido-folio">Pedido ' + pedido.folio + '</span>' +
            '<span class="pedido-fecha">' + pedido.fecha + ' &bull; ' + (pedido.hora || '') + '</span>' +
            '</div>' +
            '<div class="pedido-derecha pedido-header-derecha">' +
            '<span class="badge-estado ' + claseEstado(estado) + '">' + (cancelado ? 'Pedido cancelado' : estado) + '</span>' +
            '<div class="pedido-total">' + formatearPrecio(pedido.total) + '</div>' +
            '<button type="button" class="btn-toggle-rastreo">Rastreo <span class="flecha-icon">▼</span></button>' +
            '</div>' +
            '</div>' +
            avisoCancelacion +
            '<ul class="pedido-articulos">' + articulos + '</ul>' +

            '<div class="desplegable-rastreo" id="rastreo-' + pedido.folio + '" style="display: none;">' +
            '<div class="rastreo-header">' +
            '<h4>Seguimiento del Paquete</h4>' +
            '<span class="rastreo-estado">Estado actual: <strong>' + (cancelado ? 'Pedido cancelado' : estado) + '</strong></span>' +
            '</div>' +
            construirStepper(pedido) +
            '</div>' +
            '</article>';
    });

    contenedor.innerHTML = encabezado + tarjetas;
}

/* ---------------------------------------------------------
   AVISOS DE CANCELACIÓN Y CAMBIOS DE ESTADO
   ---------------------------------------------------------
   Se guarda qué cancelaciones ya vio el cliente para no
   repetir el aviso cada vez que entra a la página.
   --------------------------------------------------------- */
function claveAvisosCancelacion() {
    return 'kookstore_avisos_cancelacion_' + clienteActual();
}

function revisarCancelaciones() {
    const pedidos = leerPedidos();
    const cancelados = pedidos.filter(esPedidoCancelado).map(p => p.folio);

    let vistos = [];
    try { vistos = JSON.parse(localStorage.getItem(claveAvisosCancelacion())) || []; } catch (e) { vistos = []; }

    // Si un pedido dejó de estar cancelado se olvida, por si se vuelve a cancelar
    vistos = vistos.filter(folio => cancelados.includes(folio));
    const nuevos = pedidos.filter(p => esPedidoCancelado(p) && !vistos.includes(p.folio));

    localStorage.setItem(claveAvisosCancelacion(), JSON.stringify(vistos.concat(nuevos.map(p => p.folio))));
    if (nuevos.length === 0) return;

    const reembolso = nuevos.reduce((suma, p) => suma + Number(p.total || 0), 0);

    kookAlerta({
        tipo: 'error',
        titulo: nuevos.length === 1 ? 'Pedido ' + nuevos[0].folio + ' cancelado' : nuevos.length + ' pedidos cancelados',
        texto: MENSAJE_CANCELACION,
        detalle: 'Monto a reembolsar: ' + formatearPrecio(reembolso),
        textoBoton: 'Ver mi pedido'
    }).then(function () {
        cambiarPestana('historial');
        const rastreo = document.getElementById('rastreo-' + nuevos[0].folio);
        if (rastreo && rastreo.style.display !== 'block') toggleRastreo(nuevos[0].folio);
        const tarjeta = document.getElementById('tarjeta-pedido-' + nuevos[0].folio);
        if (tarjeta) tarjeta.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
}

/* Foto de los estados para detectar qué cambió */
let estadosAnteriores = {};

function guardarFotoEstados() {
    estadosAnteriores = {};
    leerPedidos().forEach(p => { estadosAnteriores[p.folio] = normalizarEstado(p.estado); });
}

/* Avisa con un toast los cambios de estado (los cancelados usan el modal) */
function avisarCambiosDeEstado() {
    leerPedidos().forEach(function (p) {
        const antes = estadosAnteriores[p.folio];
        const ahora = normalizarEstado(p.estado);
        if (antes && antes !== ahora && ahora !== 'Cancelado') {
            kookToast('Tu pedido ' + p.folio + ' ahora está: ' + ahora, 'info', 'Actualización de envío');
        }
    });
    guardarFotoEstados();
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
    guardarFotoEstados();

    document.getElementById('tab-carrito').addEventListener('click', function () {
        cambiarPestana('carrito');
    });

    document.getElementById('tab-historial').addEventListener('click', function () {
        cambiarPestana('historial');
    });

    if (window.location.hash === '#historial') {
        cambiarPestana('historial');
    }

    // Si el Admin canceló algo mientras el cliente no estaba, se le avisa al entrar
    revisarCancelaciones();

    // Cambios hechos desde otra pestaña (Panel Admin) se reflejan en vivo
    window.addEventListener('storage', function (e) {
        if (e.key === clavePedidos()) {
            pintarHistorial();
            avisarCambiosDeEstado();
            revisarCancelaciones();
        }
        if (e.key === claveCarrito() || e.key === 'kookstore_productos' || e.key === CLAVE_OFERTAS) {
            pintarCarrito();
            actualizarContadorCarrito();
        }
    });
});
