/* =========================================================
   KOOKSTORE.MX - PÁGINA DE COMUNIDAD
   ---------------------------------------------------------
   Muestra los comentarios de la comunidad y agrega los
   nuevos al inicio de la lista sin recargar la página.

   Necesita: notificaciones.js (escaparKook, kookAlerta, kookToast)
   ========================================================= */

const COMENTARIOS_INICIALES = [
    {
        nombre: 'Valeria Army',
        fecha: new Date(2026, 9, 28, 19, 42),
        mensaje: '¡Ya tengo mi Army Bomb Ver. 4! Se ve hermosa en vivo, la conexión por Bluetooth fue facilísima. 💜'
    },
    {
        nombre: 'Diego STAY',
        fecha: new Date(2026, 9, 27, 13, 15),
        mensaje: '¿Alguien más va al concierto de Stray Kids en CDMX? Mi Nachimbong llegó justo a tiempo.'
    },
    {
        nombre: 'Camila Blink',
        fecha: new Date(2026, 9, 25, 21, 8),
        mensaje: 'Me salió la photocard de Lisa en The Album 😭 La mejor compra del año, gracias Kookstore.'
    }
];

const COLORES_AVATAR = ['#ff6b9e', '#6c5ce7', '#c86bfa', '#ff8f6b', '#00b894'];

function inicialesDe(nombre) {
    return nombre.trim().split(/\s+/).slice(0, 2).map(function (palabra) {
        return palabra.charAt(0).toUpperCase();
    }).join('');
}

function colorAvatar(nombre) {
    let suma = 0;
    for (let i = 0; i < nombre.length; i++) suma += nombre.charCodeAt(i);
    return COLORES_AVATAR[suma % COLORES_AVATAR.length];
}

function formatoFechaComentario(fecha) {
    return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ' · ' + fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function crearComentario(comentario) {
    const item = document.createElement('li');
    item.className = 'comentario';
    item.innerHTML =
        '<span class="avatar avatar-chico" style="--avatar: ' + colorAvatar(comentario.nombre) + '">' +
        escaparKook(inicialesDe(comentario.nombre)) + '</span>' +
        '<div class="comentario-cuerpo">' +
        '<div class="comentario-meta">' +
        '<strong>' + escaparKook(comentario.nombre) + '</strong>' +
        '<time datetime="' + comentario.fecha.toISOString() + '">' + formatoFechaComentario(comentario.fecha) + '</time>' +
        '</div>' +
        '<p>' + escaparKook(comentario.mensaje) + '</p>' +
        '</div>';
    return item;
}

function actualizarContador() {
    const total = document.querySelectorAll('#lista-comentarios .comentario').length;
    document.getElementById('contador-comentarios').textContent = total;
}

function pintarComentariosIniciales() {
    const lista = document.getElementById('lista-comentarios');
    COMENTARIOS_INICIALES.forEach(function (comentario) {
        lista.appendChild(crearComentario(comentario));
    });
    actualizarContador();
}

function publicarComentario(e) {
    e.preventDefault();

    const campoNombre = document.getElementById('comentario-nombre');
    const campoTexto = document.getElementById('comentario-texto');
    const mensaje = campoTexto.value.trim();

    // Sin texto no se publica nada (sin alertas)
    if (!mensaje) return;

    const comentario = {
        nombre: campoNombre.value.trim() || 'Anónimo',
        fecha: new Date(),
        mensaje: mensaje
    };

    const lista = document.getElementById('lista-comentarios');
    const item = crearComentario(comentario);
    item.classList.add('comentario-nuevo');
    lista.prepend(item);
    actualizarContador();

    // Solo se limpia el texto; el nombre se conserva para el siguiente comentario
    campoTexto.value = '';
    kookToast('Tu comentario ya está visible para la comunidad.', 'exito', '¡Publicado!');
}

document.addEventListener('DOMContentLoaded', function () {
    pintarComentariosIniciales();
    document.getElementById('form-comentario').addEventListener('submit', publicarComentario);
});