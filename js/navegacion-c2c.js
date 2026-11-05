/* =========================================================
   KOOKSTORE.MX - SUBMENÚ "MERCADO DE FANS" (MODELO C2C)
   ---------------------------------------------------------
   Une las pantallas de la sección:
     pages/vender.html            -> Publicar producto
     pages/mis-publicaciones.html -> Mis publicaciones
     pages/subasta.html           -> Subasta en vivo

   - Marca la pestaña de la página actual.
   - Muestra cuántas publicaciones tiene el usuario y si la
     subasta sigue en vivo o ya terminó.

   Necesita: sesion.js (clienteActual)
   ========================================================= */

/* Número de publicaciones del usuario actual (o del invitado) */
function totalMisPublicacionesC2C() {
    try {
        const lista = JSON.parse(localStorage.getItem('kookstore_publicaciones_c2c')) || [];
        const yo = clienteActual();
        // Las publicaciones antiguas sin dueño son de quien las ve
        return lista.filter(p => !p.dueno || p.dueno === yo).length;
    } catch (e) {
        return 0;
    }
}

/* true si la subasta simulada ya cerró */
function subastaC2CTerminada() {
    try {
        const datos = JSON.parse(localStorage.getItem('kookstore_subasta_simulada'));
        return Boolean(datos && datos.fin && new Date(datos.fin) <= Date.now());
    } catch (e) {
        return false;
    }
}

/* Actualiza los contadores del submenú */
function pintarInsigniasC2C() {
    document.querySelectorAll('[data-c2c-total]').forEach(function (insignia) {
        insignia.textContent = totalMisPublicacionesC2C();
    });

    const terminada = subastaC2CTerminada();
    document.querySelectorAll('[data-c2c-subasta]').forEach(function (insignia) {
        insignia.textContent = terminada ? 'Finalizada' : 'En vivo';
        insignia.classList.toggle('vivo', !terminada);
    });
}

function iniciarSubmenuC2C() {
    const menu = document.querySelector('.c2c-subnav');
    if (!menu) return;

    // Pestaña activa según el archivo actual (el detalle de una
    // publicación cuenta como "Publicar producto")
    const actual = location.pathname.split('/').pop();
    const archivo = actual === 'publicacion.html' ? 'vender.html' : actual;
    menu.querySelectorAll('[data-c2c]').forEach(function (enlace) {
        const activo = enlace.dataset.c2c === archivo;
        enlace.classList.toggle('activo', activo);
        if (activo) enlace.setAttribute('aria-current', 'page');
        else enlace.removeAttribute('aria-current');
    });

    pintarInsigniasC2C();

    // Cambios en otra pestaña y el cierre de la subasta
    window.addEventListener('storage', function (e) {
        if (e.key === 'kookstore_publicaciones_c2c' || e.key === 'kookstore_subasta_simulada') pintarInsigniasC2C();
    });
    setInterval(pintarInsigniasC2C, 5000);
}

document.addEventListener('DOMContentLoaded', iniciarSubmenuC2C);
