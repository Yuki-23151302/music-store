/* =========================================================
   KOOKSTORE.MX - PÁGINA DE COMUNIDAD
   ---------------------------------------------------------
   Muestra los comentarios de la comunidad y agrega los
   nuevos al inicio de la lista sin recargar la página.

   El formulario NO tiene validaciones: "Publicar" siempre
   publica, aunque el nombre y el comentario estén vacíos.

   Los comentarios publicados se guardan en el navegador
   (kookstore_comentarios) para que sigan ahí al recargar.
   Si hay sesión iniciada, el nombre se toma de la cuenta.

   Necesita: notificaciones.js (escaparKook, kookToast) y sesion.js
   ========================================================= */

const CLAVE_COMENTARIOS = 'kookstore_comentarios';

/* Comentarios de ejemplo (simulados) que siempre aparecen al final */
const COMENTARIOS_INICIALES = [
    {
        nombre: 'Valeria Army',
        fecha: new Date(2026, 9, 28, 19, 42).toISOString(),
        mensaje: '¡Ya tengo mi Army Bomb Ver. 4! Se ve hermosa en vivo, la conexión por Bluetooth fue facilísima. 💜'
    },
    {
        nombre: 'Diego STAY',
        fecha: new Date(2026, 9, 27, 13, 15).toISOString(),
        mensaje: '¿Alguien más va al concierto de Stray Kids en CDMX? Mi Nachimbong llegó justo a tiempo.'
    },
    {
        nombre: 'Camila Blink',
        fecha: new Date(2026, 9, 25, 21, 8).toISOString(),
        mensaje: 'Me salió la photocard de Lisa en The Album 😭 La mejor compra del año, gracias Kookstore.'
    }
];

const COLORES_AVATAR = ['#ff6b9e', '#6c5ce7', '#c86bfa', '#ff8f6b', '#00b894'];

/* ---------------------------------------------------------
   DATOS
   --------------------------------------------------------- */
function leerComentariosPublicados() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_COMENTARIOS)) || [];
    } catch (e) {
        return [];
    }
}

/* Publicados (más nuevos primero) + los de ejemplo */
function todosLosComentarios() {
    return leerComentariosPublicados().concat(COMENTARIOS_INICIALES);
}

/* ---------------------------------------------------------
   PRESENTACIÓN
   (nombres propios para no pisar inicialesDe() de sesion.js)
   --------------------------------------------------------- */
function inicialesComentario(nombre) {
    return nombre.trim().split(/\s+/).slice(0, 2).map(p => p.charAt(0).toUpperCase()).join('') || '?';
}

function colorAvatar(nombre) {
    let suma = 0;
    for (let i = 0; i < nombre.length; i++) suma += nombre.charCodeAt(i);
    return COLORES_AVATAR[suma % COLORES_AVATAR.length];
}

function formatoFechaComentario(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }) +
        ' · ' + fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function crearComentario(comentario) {
    // Si se publicó vacío, igual se muestra en la lista con textos de relleno
    const nombre = (comentario.nombre || '').trim() || 'Anónimo';
    const mensaje = (comentario.mensaje || '').trim();

    const item = document.createElement('li');
    item.className = 'comentario';
    item.innerHTML =
        '<span class="avatar avatar-chico" style="--avatar: ' + colorAvatar(nombre) + '">' +
        escaparKook(inicialesComentario(nombre)) + '</span>' +
        '<div class="comentario-cuerpo">' +
        '<div class="comentario-meta">' +
        '<strong>' + escaparKook(nombre) + '</strong>' +
        '<time datetime="' + comentario.fecha + '">' + formatoFechaComentario(comentario.fecha) + '</time>' +
        '</div>' +
        (mensaje
            ? '<p>' + escaparKook(mensaje) + '</p>'
            : '<p class="comentario-vacio">(Comentario sin texto)</p>') +
        '</div>';
    return item;
}

/* Contadores de la lista y del encabezado */
function actualizarContadores() {
    const comentarios = todosLosComentarios();
    const fans = new Set(comentarios.map(c => ((c.nombre || '').trim() || 'Anónimo').toLowerCase())).size;
    document.getElementById('contador-comentarios').textContent = comentarios.length;
    document.getElementById('dato-comentarios').textContent = comentarios.length;
    document.getElementById('dato-fans').textContent = fans;
}

function pintarComentarios() {
    const lista = document.getElementById('lista-comentarios');
    lista.innerHTML = '';
    todosLosComentarios().forEach(c => lista.appendChild(crearComentario(c)));
    actualizarContadores();
}

/* ---------------------------------------------------------
   PUBLICAR
   --------------------------------------------------------- */
function publicarComentario(e) {
    e.preventDefault();

    const campoNombre = document.getElementById('comentario-nombre');
    const campoTexto = document.getElementById('comentario-texto');

    // Sin validaciones: se publica tal cual, aunque los campos estén vacíos
    const comentario = {
        nombre: campoNombre.value.trim(),
        fecha: new Date().toISOString(),
        mensaje: campoTexto.value.trim()
    };

    // Se guarda y se agrega arriba de la lista, sin recargar
    const publicados = leerComentariosPublicados();
    publicados.unshift(comentario);
    localStorage.setItem(CLAVE_COMENTARIOS, JSON.stringify(publicados));

    const item = crearComentario(comentario);
    item.classList.add('comentario-nuevo');
    document.getElementById('lista-comentarios').prepend(item);
    actualizarContadores();

    // Solo se limpia el texto; el nombre se conserva para el siguiente comentario
    campoTexto.value = '';
    document.getElementById('letras-usadas').textContent = '0';
    // La confirmación aparece siempre, haya o no texto
    kookToast('Se publicó tu mensaje. Ya está visible para la comunidad.', 'exito', '¡Publicado!');
}

document.addEventListener('DOMContentLoaded', function () {
    // Si hay sesión de cliente, se adelanta su nombre
    const usuario = typeof usuarioActivo === 'function' ? usuarioActivo() : null;
    if (usuario && usuario.nombre) {
        document.getElementById('comentario-nombre').value = usuario.nombre;
    }

    pintarComentarios();

    document.getElementById('form-comentario').addEventListener('submit', publicarComentario);
    document.getElementById('comentario-texto').addEventListener('input', function () {
        document.getElementById('letras-usadas').textContent = this.value.length;
    });

    // Comentarios publicados desde otra pestaña
    window.addEventListener('storage', function (e) {
        if (e.key === CLAVE_COMENTARIOS) pintarComentarios();
    });
});
