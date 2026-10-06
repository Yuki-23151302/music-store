/* =========================================================
   KOOKSTORE.MX - NOTIFICACIONES Y CONFIRMACIONES
   ---------------------------------------------------------
   Reemplaza alert() y confirm() del navegador por componentes
   propios con el estilo de la tienda. No usa librerías
   externas, así funciona aunque no haya internet.

     kookToast('Producto guardado', 'exito');
     kookToast('Algo salió mal', 'error', 'Título opcional');

     kookConfirmar({
         titulo: '¿Eliminar producto?',
         texto: 'Esta acción no se puede deshacer.',
         tipo: 'peligro',                 // peligro | aviso | info | exito
         textoConfirmar: 'Sí, eliminar',
         textoCancelar: 'Cancelar'
     }).then(function (acepto) { ... });

     kookAlerta({ titulo, texto, tipo, textoBoton });

   Necesita css/notificaciones.css
   ========================================================= */

/* Íconos SVG de cada tipo de aviso */
const ICONOS_KOOK = {
    exito: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    error: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    peligro: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>',
    aviso: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
};

/* Evita que un texto se interprete como HTML */
function escaparKook(texto) {
    return String(texto === undefined || texto === null ? '' : texto)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

/* ---------------------------------------------------------
   TOASTS (avisos pequeños que desaparecen solos)
   --------------------------------------------------------- */
function kookToast(mensaje, tipo, titulo) {
    tipo = tipo || 'exito';

    let pila = document.getElementById('kook-toast-pila');
    if (!pila) {
        pila = document.createElement('div');
        pila.id = 'kook-toast-pila';
        pila.className = 'kook-toast-pila';
        pila.setAttribute('aria-live', 'polite');
        document.body.appendChild(pila);
    }

    const toast = document.createElement('div');
    toast.className = 'kook-toast kook-toast-' + tipo;
    toast.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    toast.innerHTML =
        '<span class="kook-toast-icono">' + (ICONOS_KOOK[tipo] || ICONOS_KOOK.info) + '</span>' +
        '<div class="kook-toast-texto">' +
        (titulo ? '<strong>' + escaparKook(titulo) + '</strong>' : '') +
        '<span>' + escaparKook(mensaje) + '</span>' +
        '</div>' +
        '<button type="button" class="kook-toast-cerrar" aria-label="Cerrar">&times;</button>' +
        '<span class="kook-toast-barra"></span>';

    pila.appendChild(toast);

    // Pequeña espera para que el navegador aplique la animación de entrada
    requestAnimationFrame(function () {
        toast.classList.add('visible');
    });

    function cerrar() {
        toast.classList.remove('visible');
        toast.classList.add('saliendo');
        setTimeout(function () { toast.remove(); }, 300);
    }

    const temporizador = setTimeout(cerrar, 3500);
    toast.querySelector('.kook-toast-cerrar').addEventListener('click', function () {
        clearTimeout(temporizador);
        cerrar();
    });
}

/* ---------------------------------------------------------
   MODAL BASE (lo usan kookConfirmar y kookAlerta)
   --------------------------------------------------------- */
function abrirModalKook(opciones, conCancelar) {
    return new Promise(function (resolver) {
        const tipo = opciones.tipo || 'info';
        const icono = ICONOS_KOOK[tipo] || ICONOS_KOOK.info;
        const textoConfirmar = opciones.textoConfirmar || opciones.textoBoton || 'Aceptar';
        const textoCancelar = opciones.textoCancelar || 'Cancelar';

        const fondo = document.createElement('div');
        fondo.className = 'kook-dialogo-fondo';
        fondo.innerHTML =
            '<div class="kook-dialogo kook-dialogo-' + tipo + '" role="dialog" aria-modal="true" aria-labelledby="kook-dialogo-titulo">' +
            '<div class="kook-dialogo-icono">' + icono + '</div>' +
            '<h3 id="kook-dialogo-titulo">' + escaparKook(opciones.titulo || '') + '</h3>' +
            (opciones.texto ? '<p>' + escaparKook(opciones.texto) + '</p>' : '') +
            (opciones.detalle ? '<div class="kook-dialogo-detalle">' + escaparKook(opciones.detalle) + '</div>' : '') +
            '<div class="kook-dialogo-botones">' +
            (conCancelar ? '<button type="button" class="kook-btn kook-btn-cancelar">' + escaparKook(textoCancelar) + '</button>' : '') +
            '<button type="button" class="kook-btn kook-btn-confirmar">' + escaparKook(textoConfirmar) + '</button>' +
            '</div>' +
            '</div>';

        document.body.appendChild(fondo);
        const focoAnterior = document.activeElement;

        requestAnimationFrame(function () {
            fondo.classList.add('visible');
            fondo.querySelector('.kook-btn-confirmar').focus();
        });

        function cerrar(resultado) {
            document.removeEventListener('keydown', alTeclear);
            fondo.classList.remove('visible');
            setTimeout(function () {
                fondo.remove();
                if (focoAnterior && focoAnterior.focus) focoAnterior.focus();
            }, 220);
            resolver(resultado);
        }

        function alTeclear(e) {
            if (e.key === 'Escape') cerrar(false);
        }

        document.addEventListener('keydown', alTeclear);
        fondo.querySelector('.kook-btn-confirmar').addEventListener('click', function () { cerrar(true); });

        const btnCancelar = fondo.querySelector('.kook-btn-cancelar');
        if (btnCancelar) btnCancelar.addEventListener('click', function () { cerrar(false); });

        // Clic fuera de la tarjeta = cancelar
        fondo.addEventListener('click', function (e) {
            if (e.target === fondo) cerrar(false);
        });
    });
}

/* Pregunta Sí / No. Devuelve una promesa con true o false. */
function kookConfirmar(opciones) {
    return abrirModalKook(opciones || {}, true);
}

/* Aviso con un solo botón. Devuelve una promesa al cerrarse. */
function kookAlerta(opciones) {
    return abrirModalKook(opciones || {}, false);
}
