/* =========================================================
   KOOKSTORE.MX - PÁGINA DE PERFIL
   ---------------------------------------------------------
   Muestra los datos de la cuenta que inició sesión y sus
   últimas compras. Los pedidos se leen con la clave
   kookstore_pedidos_<correo>, por eso cada cliente ve
   solamente su propio historial.

   Necesita que se carguen antes: sesion.js y carrito.js
   ========================================================= */

/* Cuántos pedidos se muestran en el perfil.
   El historial completo está en carrito.html#historial */
const PEDIDOS_EN_PERFIL = 3;

/* ---------------------------------------------------------
   PANTALLA PARA QUIEN NO INICIÓ SESIÓN
   --------------------------------------------------------- */
function mostrarPerfilInvitado() {
    const contenedor = document.getElementById('perfil-contenedor');

    contenedor.innerHTML = '' +
        '<div class="perfil-header-card">' +
        '<div class="perfil-avatar">KS</div>' +
        '<div class="perfil-info">' +
        '<h2>Hola, visitante</h2>' +
        '<p>Aún no has iniciado sesión en Kookstore.mx</p>' +
        '</div>' +
        '</div>' +

        '<div class="perfil-card">' +
        '<h3>Entra a tu cuenta</h3>' +
        '<p>Inicia sesión o crea una cuenta para guardar tu dirección de envío ' +
        'y llevar el historial de todas tus compras.</p>' +
        '<div style="display: flex; gap: 1rem; flex-wrap: wrap; margin-top: 1.5rem;">' +
        '<a href="login.html" class="btn-primario">Iniciar sesión</a>' +
        '<a href="registro.html" class="btn-secundario" style="width: auto; padding: 0.8rem 2rem;">' +
        'Crear cuenta</a>' +
        '</div>' +
        '</div>';
}

/* ---------------------------------------------------------
   DATOS DE LA CUENTA
   --------------------------------------------------------- */
function pintarDatosUsuario(usuario) {
    document.getElementById('perfil-avatar').textContent = usuario.avatar;
    document.getElementById('perfil-nombre').textContent = usuario.nombre;
    document.getElementById('perfil-datos').textContent =
        usuario.email + ' • Miembro desde ' + usuario.miembroDesde;

    // La dirección se guarda con saltos de línea, aquí se
    // convierten en saltos de línea de HTML
    document.getElementById('perfil-direccion').innerHTML =
        usuario.direccion.split('\n').join('<br>');
}

/* ---------------------------------------------------------
   ÚLTIMOS PEDIDOS DE ESTE USUARIO
   --------------------------------------------------------- */
function pintarPedidosUsuario() {
    const lista = document.getElementById('lista-pedidos-usuario');
    const pedidos = leerPedidos();

    if (pedidos.length === 0) {
        lista.innerHTML = '' +
            '<li class="perfil-pedido-item" style="border: none;">' +
            '<span>Todavía no tienes compras registradas.</span>' +
            '</li>';
        return;
    }

    let html = '';
    const cuantos = Math.min(pedidos.length, PEDIDOS_EN_PERFIL);

    for (let i = 0; i < cuantos; i++) {
        const pedido = pedidos[i];

        html = html + '' +
            '<li class="perfil-pedido-item">' +
            '<div>' +
            '<strong>Pedido ' + pedido.folio + '</strong>' +
            '<span>' + pedido.resumen + '</span><br>' +
            '<span>' + pedido.fecha + ' • ' + formatearPrecio(pedido.total) + '</span>' +
            '</div>' +
            '<span class="badge-estado">' + pedido.estado + '</span>' +
            '</li>';
    }

    lista.innerHTML = html;

    document.getElementById('perfil-ver-historial').style.display = 'inline-block';
}

/* ---------------------------------------------------------
   PUNTO DE ENTRADA
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    const usuario = usuarioActivo();

    if (!usuario) {
        mostrarPerfilInvitado();
        return;
    }

    pintarDatosUsuario(usuario);
    pintarPedidosUsuario();

    document.getElementById('btn-cerrar-sesion')
        .addEventListener('click', function (evento) {
            evento.preventDefault();
            cerrarSesion();
            window.location.href = '../index.html';
        });
});
