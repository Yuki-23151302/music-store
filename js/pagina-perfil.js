/* =========================================================
   KOOKSTORE.MX - PÁGINA DE PERFIL
   ---------------------------------------------------------
   Muestra los datos de la cuenta que inició sesión y sus
   últimas compras. Los pedidos se leen con la clave
   kookstore_pedidos_<correo>, por eso cada cliente ve
   solamente su propio historial.

   Incluye: estadísticas de compra, edición de la dirección
   de envío y cierre de sesión con confirmación.

   Necesita que se carguen antes: notificaciones.js,
   sesion.js y carrito.js
   ========================================================= */

/* Cuántos pedidos se muestran en el perfil.
   El historial completo está en carrito.html#historial */
const PEDIDOS_EN_PERFIL = 3;

/* Avance de la barra de cada pedido según su estado */
const AVANCE_ESTADO = {
    'Pagado': 25,
    'En preparación': 50,
    'En camino': 75,
    'Entregado': 100,
    'Cancelado': 100
};

const ICONO_ESTADO = {
    'Pagado': '💳',
    'En preparación': '📦',
    'En camino': '🚚',
    'Entregado': '🏠',
    'Cancelado': '↩️'
};

/* ---------------------------------------------------------
   PANTALLA PARA QUIEN NO INICIÓ SESIÓN
   --------------------------------------------------------- */
function mostrarPerfilInvitado() {
    document.getElementById('perfil-contenedor').innerHTML = '' +
        '<section class="perfil-invitado" data-revelar>' +
        '<div class="perfil-avatar grande">👋</div>' +
        '<span class="etiqueta-seccion">Mi cuenta</span>' +
        '<h1>Hola, visitante</h1>' +
        '<p>Inicia sesión o crea una cuenta para guardar tu dirección de envío, ' +
        'rastrear tus pedidos y llevar el historial de todas tus compras.</p>' +
        '<div class="perfil-invitado-acciones">' +
        '<a href="login.html" class="btn-primario">Iniciar sesión</a>' +
        '<a href="registro.html" class="btn-contorno">Crear cuenta</a>' +
        '</div>' +
        '</section>';
}

/* ---------------------------------------------------------
   ESTRUCTURA DEL PERFIL
   --------------------------------------------------------- */
function tarjetaEstadistica(icono, valor, etiqueta) {
    return '' +
        '<article class="perfil-stat">' +
        '<span class="perfil-stat-icono">' + icono + '</span>' +
        '<div><strong>' + valor + '</strong><span>' + etiqueta + '</span></div>' +
        '</article>';
}

function pintarPerfil(usuario) {
    const pedidos = leerPedidos();
    const activos = pedidos.filter(p => !esPedidoCancelado(p));
    const totalComprado = activos.reduce((suma, p) => suma + Number(p.total || 0), 0);
    const porEntregar = activos.filter(p => normalizarEstado(p.estado) !== 'Entregado').length;
    const primerNombre = usuario.nombre.split(' ')[0];

    document.getElementById('perfil-contenedor').innerHTML = '' +

        // Portada con avatar
        '<section class="perfil-portada" data-revelar>' +
        '<span class="hero-burbuja b1"></span><span class="hero-burbuja b2"></span>' +
        '<div class="perfil-identidad">' +
        '<div class="perfil-avatar">' + escaparHTML(usuario.avatar || inicialesDe(usuario.nombre)) + '</div>' +
        '<div class="perfil-identidad-texto">' +
        '<span class="perfil-saludo">Mi cuenta</span>' +
        '<h1>¡Hola, ' + escaparHTML(primerNombre) + '!</h1>' +
        '<p>' + escaparHTML(usuario.email) + ' · Miembro desde ' + escaparHTML(usuario.miembroDesde || mesActual()) + '</p>' +
        '</div>' +
        '<button type="button" class="perfil-salir" id="btn-cerrar-sesion">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>' +
        'Cerrar sesión</button>' +
        '</div>' +
        '</section>' +

        // Estadísticas
        '<section class="perfil-stats" data-revelar style="--retraso: 0.08s">' +
        tarjetaEstadistica('🧾', pedidos.length, pedidos.length === 1 ? 'Pedido realizado' : 'Pedidos realizados') +
        tarjetaEstadistica('💰', formatearPrecio(totalComprado), 'Total comprado') +
        tarjetaEstadistica('🚚', porEntregar, 'Por entregar') +
        tarjetaEstadistica('🛒', contarArticulos(), 'Artículos en tu carrito') +
        '</section>' +

        '<div class="perfil-grid">' +

        // Columna izquierda
        '<div class="perfil-columna">' +

        '<article class="perfil-card" data-revelar>' +
        '<h2><span>👤</span> Mis datos</h2>' +
        '<dl class="perfil-datos">' +
        '<div><dt>Nombre</dt><dd>' + escaparHTML(usuario.nombre) + '</dd></div>' +
        '<div><dt>Correo</dt><dd>' + escaparHTML(usuario.email) + '</dd></div>' +
        '<div><dt>Miembro desde</dt><dd>' + escaparHTML(usuario.miembroDesde || '—') + '</dd></div>' +
        '<div><dt>Último acceso</dt><dd>' + escaparHTML(usuario.ultimoAcceso || 'Hoy') + '</dd></div>' +
        '</dl>' +
        '</article>' +

        '<article class="perfil-card" data-revelar style="--retraso: 0.08s">' +
        '<div class="perfil-card-titulo">' +
        '<h2><span>📍</span> Dirección de envío</h2>' +
        '<button type="button" class="btn-texto-perfil" id="btn-editar-direccion">Editar</button>' +
        '</div>' +
        '<div id="zona-direccion"></div>' +
        '</article>' +

        '<nav class="perfil-accesos" data-revelar style="--retraso: 0.16s">' +
        '<a href="catalogo.html"><span>🛍️</span>Ir al catálogo</a>' +
        '<a href="carrito.html"><span>🛒</span>Mi carrito</a>' +
        '<a href="carrito.html#historial"><span>📦</span>Rastrear pedidos</a>' +
        '</nav>' +

        '</div>' +

        // Columna derecha: pedidos
        '<article class="perfil-card perfil-pedidos" data-revelar style="--retraso: 0.1s">' +
        '<div class="perfil-card-titulo">' +
        '<h2><span>🧾</span> Mis pedidos recientes</h2>' +
        (pedidos.length > 0 ? '<a href="carrito.html#historial" class="btn-texto-perfil">Ver todos →</a>' : '') +
        '</div>' +
        '<ul class="perfil-lista-pedidos" id="lista-pedidos-usuario"></ul>' +
        '</article>' +

        '</div>';

    pintarDireccion(usuario);
    pintarPedidosUsuario(pedidos);

    document.getElementById('btn-editar-direccion').addEventListener('click', () => editarDireccion(usuario));
    document.getElementById('btn-cerrar-sesion').addEventListener('click', confirmarCerrarSesion);
}

/* ---------------------------------------------------------
   DIRECCIÓN DE ENVÍO (con edición)
   --------------------------------------------------------- */
function pintarDireccion(usuario) {
    const direccion = usuario.direccion || '';
    document.getElementById('zona-direccion').innerHTML = direccion
        ? '<p class="perfil-direccion">' + escaparHTML(direccion).split('\n').join('<br>') + '</p>'
        : '<p class="perfil-direccion vacia">Aún no registras una dirección de envío.</p>';
    document.getElementById('btn-editar-direccion').hidden = false;
}

function editarDireccion(usuario) {
    const zona = document.getElementById('zona-direccion');
    document.getElementById('btn-editar-direccion').hidden = true;

    zona.innerHTML = '' +
        '<textarea id="campo-direccion" class="perfil-textarea" rows="4" placeholder="Calle y número, colonia&#10;C.P., ciudad, estado&#10;País">' +
        escaparHTML(usuario.direccion || '') + '</textarea>' +
        '<div class="perfil-editar-acciones">' +
        '<button type="button" class="btn-contorno" id="btn-cancelar-direccion">Cancelar</button>' +
        '<button type="button" class="btn-primario" id="btn-guardar-direccion">Guardar</button>' +
        '</div>';

    const campo = document.getElementById('campo-direccion');
    campo.focus();

    document.getElementById('btn-cancelar-direccion').addEventListener('click', () => pintarDireccion(usuario));
    document.getElementById('btn-guardar-direccion').addEventListener('click', function () {
        const usuarios = leerUsuarios();
        const cuenta = usuarios.find(u => u.email === usuario.email);
        if (cuenta) {
            cuenta.direccion = campo.value.trim();
            guardarUsuarios(usuarios);
            usuario.direccion = cuenta.direccion;
        }
        pintarDireccion(usuario);
        kookToast('Tu dirección de envío se actualizó', 'exito', 'Dirección guardada');
    });
}

/* ---------------------------------------------------------
   ÚLTIMOS PEDIDOS DE ESTE USUARIO
   --------------------------------------------------------- */
function pintarPedidosUsuario(pedidos) {
    const lista = document.getElementById('lista-pedidos-usuario');

    if (pedidos.length === 0) {
        lista.innerHTML = '' +
            '<li class="perfil-sin-pedidos">' +
            '<span>🛍️</span>' +
            '<strong>Todavía no tienes compras</strong>' +
            '<p>Cuando hagas tu primer pedido aparecerá aquí con su rastreo.</p>' +
            '<a href="catalogo.html" class="btn-primario">Explorar el catálogo</a>' +
            '</li>';
        return;
    }

    lista.innerHTML = pedidos.slice(0, PEDIDOS_EN_PERFIL).map(function (pedido) {
        const estado = normalizarEstado(pedido.estado);
        const cancelado = esPedidoCancelado(pedido);
        const resumen = pedido.resumen ||
            (pedido.articulos || []).map(a => a.cantidad + 'x ' + a.nombre).join(', ');

        return '' +
            '<li class="perfil-pedido' + (cancelado ? ' cancelado' : '') + '">' +
            '<span class="perfil-pedido-icono">' + (ICONO_ESTADO[estado] || '📦') + '</span>' +
            '<div class="perfil-pedido-info">' +
            '<div class="perfil-pedido-fila">' +
            '<strong>Pedido ' + escaparHTML(pedido.folio) + '</strong>' +
            '<span class="badge-estado ' + claseEstado(estado) + '">' + (cancelado ? 'Cancelado · reembolso en proceso' : estado) + '</span>' +
            '</div>' +
            '<p class="perfil-pedido-resumen">' + escaparHTML(resumen) + '</p>' +
            '<div class="perfil-pedido-fila">' +
            '<span class="perfil-pedido-fecha">' + escaparHTML(pedido.fecha) + '</span>' +
            '<strong class="perfil-pedido-total">' + formatearPrecio(Number(pedido.total) || 0) + '</strong>' +
            '</div>' +
            '<div class="perfil-avance"><span style="width: ' + (AVANCE_ESTADO[estado] || 25) + '%"></span></div>' +
            '</div>' +
            '</li>';
    }).join('');
}

/* ---------------------------------------------------------
   CERRAR SESIÓN
   --------------------------------------------------------- */
function confirmarCerrarSesion() {
    kookConfirmar({
        tipo: 'aviso',
        titulo: '¿Cerrar sesión?',
        texto: 'Tu carrito y tus pedidos se quedan guardados en tu cuenta para la próxima vez.',
        textoConfirmar: 'Cerrar sesión',
        textoCancelar: 'Quedarme'
    }).then(function (acepto) {
        if (!acepto) return;
        cerrarSesion();
        window.location.href = '../index.html';
    });
}

/* ---------------------------------------------------------
   PUNTO DE ENTRADA
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    const usuario = usuarioActivo();

    if (!usuario) {
        mostrarPerfilInvitado();
    } else {
        pintarPerfil(usuario);
    }

    // El contenido se dibujó después de que ui.js preparó las animaciones,
    // así que aquí se activan (doble frame para que se vea la transición)
    requestAnimationFrame(() => requestAnimationFrame(function () {
        document.querySelectorAll('#perfil-contenedor [data-revelar]').forEach(el => el.classList.add('revelado'));
    }));
});
