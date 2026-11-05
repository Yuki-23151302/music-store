/* =========================================================
   KOOKSTORE.MX - RESEÑAS DE LA CAMPAÑA (ARMY BOMB VER. 4)
   ---------------------------------------------------------
   - "Dejar mi reseña" abre un formulario con estrellas (1 a 5)
     y un comentario. Solo con sesión iniciada; si no hay sesión
     se ofrece iniciarla y luego se regresa aquí.
   - SIN validaciones: las estrellas vienen en 5 y el texto es
     opcional, así que "Publicar reseña" siempre publica.
   - Las reseñas se guardan en localStorage
     (kookstore_resenas_campana) y aparecen al inicio de la lista.
   - El promedio (4.9), el total de reseñas y las barras 5★…1★
     se recalculan con el historial simulado + las guardadas.

   Necesita: notificaciones.js, sesion.js, carrito.js y
   pagina-campana.js (ID_PRODUCTO_CAMPANA)
   ========================================================= */

const CLAVE_RESENAS_CAMPANA = 'kookstore_resenas_campana';

/* Reseñas que ya existían (simuladas): 128 en total, promedio 4.9.
   Las 4 tarjetas fijas del HTML son parte de este historial. */
const HISTORIAL_RESENAS = { 5: 118, 4: 8, 3: 2, 2: 0, 1: 0 };

const TEXTOS_CALIFICACION = { 1: 'Muy malo', 2: 'Malo', 3: 'Regular', 4: 'Muy bueno', 5: 'Excelente' };

const COLORES_AVATAR_RESENA = ['#ff6b9e', '#6c5ce7', '#c86bfa', '#ff8f6b', '#00b894', '#0984e3'];

let calificacionElegida = 5;

/* ---------------------------------------------------------
   DATOS
   --------------------------------------------------------- */
function leerResenasCampana() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_RESENAS_CAMPANA)) || [];
    } catch (e) {
        return [];
    }
}

function guardarResenasCampana(lista) {
    localStorage.setItem(CLAVE_RESENAS_CAMPANA, JSON.stringify(lista));
}

/* "C.P. 20000, Aguascalientes, Ags." -> "Aguascalientes, Ags." */
function ciudadDelUsuario(usuario) {
    const lineas = String((usuario && usuario.direccion) || '').split('\n').map(l => l.trim()).filter(Boolean);
    const conCP = lineas.find(l => /C\.?\s?P\.?\s*\d+/i.test(l));
    if (conCP) {
        const ciudad = conCP.replace(/C\.?\s?P\.?\s*\d+\s*,?\s*/i, '').trim();
        if (ciudad) return ciudad;
    }
    // Sin C.P.: se usa la penúltima línea (antes de "México")
    if (lineas.length >= 2) return lineas[lineas.length - 2];
    return 'México';
}

/* ¿El usuario ya compró la Army Bomb? -> "Compra verificada" */
function compraVerificada() {
    try {
        return leerPedidos().some(p => (p.articulos || []).some(a => a.id === ID_PRODUCTO_CAMPANA));
    } catch (e) {
        return false;
    }
}

function colorAvatarResena(nombre) {
    let suma = 0;
    for (const letra of String(nombre)) suma += letra.charCodeAt(0);
    return COLORES_AVATAR_RESENA[suma % COLORES_AVATAR_RESENA.length];
}

function textoEstrellas(n) {
    const llenas = Math.max(0, Math.min(5, Math.round(n)));
    return '★'.repeat(llenas) + '☆'.repeat(5 - llenas);
}

/* ---------------------------------------------------------
   PROMEDIO, TOTAL Y BARRAS
   --------------------------------------------------------- */
function calcularResumen() {
    const conteo = Object.assign({}, HISTORIAL_RESENAS);
    leerResenasCampana().forEach(function (r) {
        const estrellas = Math.max(1, Math.min(5, Number(r.estrellas) || 5));
        conteo[estrellas] = (conteo[estrellas] || 0) + 1;
    });

    const total = [1, 2, 3, 4, 5].reduce((suma, n) => suma + conteo[n], 0);
    const puntos = [1, 2, 3, 4, 5].reduce((suma, n) => suma + n * conteo[n], 0);
    return { conteo: conteo, total: total, promedio: total ? puntos / total : 0 };
}

function pintarResumenResenas() {
    const resumen = calcularResumen();
    const nota = resumen.promedio.toFixed(1);
    const estrellas = textoEstrellas(resumen.promedio);

    // Encabezado de la campaña
    document.getElementById('hero-nota').textContent = nota;
    document.getElementById('hero-estrellas').textContent = estrellas;
    document.getElementById('total-resenas').textContent = resumen.total;

    // Tarjeta de resumen
    document.getElementById('resumen-nota').textContent = nota;
    document.getElementById('resumen-estrellas').textContent = estrellas;
    document.getElementById('resumen-total').textContent = resumen.total;

    document.getElementById('resumen-barras').innerHTML = [5, 4, 3, 2, 1].map(function (n) {
        const porcentaje = resumen.total ? Math.round(resumen.conteo[n] / resumen.total * 100) : 0;
        return '<li title="' + resumen.conteo[n] + ' reseñas de ' + n + ' estrellas">' +
            '<span>' + n + ' ★</span>' +
            '<div class="barra"><i style="width: ' + porcentaje + '%"></i></div>' +
            '<span>' + porcentaje + '%</span></li>';
    }).join('');
}

/* ---------------------------------------------------------
   TARJETAS DE LAS RESEÑAS GUARDADAS
   --------------------------------------------------------- */
function htmlResenaUsuario(r) {
    const mia = r.email === clienteActual();
    const fecha = new Date(r.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
    const texto = String(r.texto || '').trim();

    return '' +
        '<div class="resena-cabecera">' +
        '<span class="avatar" style="--avatar: ' + colorAvatarResena(r.nombre) + '">' + escaparHTML(inicialesDe(r.nombre || 'Fan')) + '</span>' +
        '<div><strong>' + escaparHTML(r.nombre || 'Fan Kookstore') + '</strong><small>' + escaparHTML(r.ciudad || 'México') + '</small></div>' +
        '<span class="resena-fecha">' + fecha + '</span>' +
        '</div>' +
        '<div class="resena-fila">' +
        '<span class="estrellas" aria-label="' + r.estrellas + ' de 5 estrellas">' + textoEstrellas(r.estrellas) + '</span>' +
        (r.verificada
            ? '<span class="verificada">✓ Compra verificada</span>'
            : '<span class="verificada cuenta">✓ Cliente registrado</span>') +
        (mia ? '<span class="resena-tuya">Tu reseña</span>' : '') +
        '</div>' +
        // Solo estrellas, sin texto: también se publica
        (texto
            ? '<p>“' + escaparHTML(texto) + '”</p>'
            : '<p class="resena-solo-estrellas">Calificó con ' + r.estrellas + (r.estrellas === 1 ? ' estrella' : ' estrellas') + ' · ' + TEXTOS_CALIFICACION[r.estrellas] + '</p>');
}

function pintarResenasUsuarios(idNueva) {
    const grid = document.getElementById('resenas-grid');
    grid.querySelectorAll('.resena-usuario').forEach(el => el.remove());

    // Las más recientes primero, antes de las tarjetas fijas
    const primeraFija = grid.firstElementChild;
    leerResenasCampana().slice().reverse().forEach(function (r) {
        const tarjeta = document.createElement('article');
        tarjeta.className = 'resena-tarjeta resena-usuario' + (r.id === idNueva ? ' resena-nueva' : '');
        tarjeta.dataset.id = r.id;
        tarjeta.innerHTML = htmlResenaUsuario(r);
        grid.insertBefore(tarjeta, primeraFija);
    });
}

function pintarResenas(idNueva) {
    pintarResumenResenas();
    pintarResenasUsuarios(idNueva);
}

/* ---------------------------------------------------------
   SELECTOR DE ESTRELLAS
   --------------------------------------------------------- */
function marcarEstrellas(valor, esVistaPrevia) {
    document.querySelectorAll('#estrellas-botones button').forEach(function (boton) {
        const n = Number(boton.dataset.valor);
        boton.classList.toggle('llena', n <= valor);
        if (!esVistaPrevia) boton.setAttribute('aria-checked', n === valor ? 'true' : 'false');
        boton.tabIndex = n === calificacionElegida ? 0 : -1;
    });
    document.getElementById('texto-calificacion').textContent =
        valor + (valor === 1 ? ' estrella' : ' estrellas') + ' · ' + TEXTOS_CALIFICACION[valor];
}

function elegirCalificacion(valor) {
    calificacionElegida = Math.max(1, Math.min(5, valor));
    marcarEstrellas(calificacionElegida, false);
}

function iniciarSelectorEstrellas() {
    const grupo = document.getElementById('estrellas-botones');

    grupo.addEventListener('click', function (e) {
        const boton = e.target.closest('button');
        if (boton) elegirCalificacion(Number(boton.dataset.valor));
    });

    // Al pasar el mouse se ve cómo quedaría
    grupo.addEventListener('mouseover', function (e) {
        const boton = e.target.closest('button');
        if (boton) marcarEstrellas(Number(boton.dataset.valor), true);
    });
    grupo.addEventListener('mouseleave', () => marcarEstrellas(calificacionElegida, true));

    // Flechas del teclado
    grupo.addEventListener('keydown', function (e) {
        const cambio = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key];
        if (!cambio) return;
        e.preventDefault();
        elegirCalificacion(calificacionElegida + cambio);
        grupo.querySelector('[data-valor="' + calificacionElegida + '"]').focus();
    });
}

/* ---------------------------------------------------------
   VENTANA "DEJAR MI RESEÑA"
   --------------------------------------------------------- */
let focoAntesDelModal = null;

function abrirFormularioResena() {
    const usuario = usuarioActivo();

    // Solo con sesión iniciada: se ofrece entrar y volver aquí
    if (!usuario) {
        kookConfirmar({
            tipo: 'info',
            titulo: 'Inicia sesión para opinar',
            texto: 'Para dejar tu reseña necesitas entrar a tu cuenta de Kookstore. Al terminar regresarás aquí.',
            textoConfirmar: 'Iniciar sesión',
            textoCancelar: 'Ahora no'
        }).then(function (ir) {
            if (ir) location.href = 'login.html?volver=' + encodeURIComponent('campana.html?resena=1#resenas');
        });
        return;
    }

    // Datos de quien publica
    document.getElementById('resena-autor-avatar').textContent = inicialesDe(usuario.nombre || 'Fan');
    document.getElementById('resena-autor-avatar').style.setProperty('--avatar', colorAvatarResena(usuario.nombre));
    document.getElementById('resena-autor-nombre').textContent = usuario.nombre || 'Fan Kookstore';
    document.getElementById('resena-autor-ciudad').textContent = '📍 ' + ciudadDelUsuario(usuario);

    // Formulario limpio, con 5 estrellas
    document.getElementById('form-resena').reset();
    document.getElementById('resena-letras').textContent = '0';
    elegirCalificacion(5);

    focoAntesDelModal = document.activeElement;
    const modal = document.getElementById('modal-resena');
    modal.hidden = false;
    document.body.classList.add('con-modal-resena');
    requestAnimationFrame(() => modal.classList.add('visible'));
    setTimeout(() => document.querySelector('#estrellas-botones [data-valor="5"]').focus(), 50);
}

function cerrarFormularioResena() {
    const modal = document.getElementById('modal-resena');
    if (modal.hidden) return;
    modal.classList.remove('visible');
    document.body.classList.remove('con-modal-resena');
    setTimeout(function () {
        modal.hidden = true;
        if (focoAntesDelModal) focoAntesDelModal.focus();
    }, 200);
}

/* "Publicar reseña": SIN validaciones, siempre publica */
function publicarResena(e) {
    e.preventDefault();
    const usuario = usuarioActivo() || { nombre: 'Fan Kookstore', email: clienteActual() };

    const resena = {
        id: 'res-' + Date.now(),
        email: usuario.email || clienteActual(),
        nombre: usuario.nombre || 'Fan Kookstore',
        ciudad: ciudadDelUsuario(usuario),
        estrellas: calificacionElegida,
        texto: document.getElementById('resena-texto').value.trim(),
        verificada: compraVerificada(),
        fecha: new Date().toISOString()
    };

    const lista = leerResenasCampana();
    lista.push(resena);
    guardarResenasCampana(lista);

    cerrarFormularioResena();
    pintarResenas(resena.id);

    const tarjeta = document.querySelector('.resena-usuario[data-id="' + resena.id + '"]');
    if (tarjeta) setTimeout(() => tarjeta.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250);

    kookToast('Calificaste con ' + resena.estrellas + (resena.estrellas === 1 ? ' estrella' : ' estrellas') +
        '. Tu reseña ya aparece en la lista.', 'exito', '¡Gracias por tu reseña!');
}

/* Texto de ayuda bajo el botón según haya sesión o no */
function pintarAyudaResena() {
    const usuario = usuarioActivo();
    document.getElementById('resena-ayuda').textContent = usuario
        ? 'Publicarás como ' + (usuario.nombre || 'Fan').split(' ')[0] + '.'
        : 'Inicia sesión para compartir tu experiencia.';
}

/* ---------------------------------------------------------
   INICIO
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    pintarResenas();
    pintarAyudaResena();
    iniciarSelectorEstrellas();

    document.getElementById('btn-dejar-resena').addEventListener('click', abrirFormularioResena);
    document.getElementById('form-resena').addEventListener('submit', publicarResena);
    document.getElementById('resena-texto').addEventListener('input', function () {
        document.getElementById('resena-letras').textContent = this.value.length;
    });

    // Cerrar: botón ×, "Cancelar", clic fuera o tecla Esc
    document.querySelectorAll('[data-cerrar-resena]').forEach(b => b.addEventListener('click', cerrarFormularioResena));
    document.getElementById('modal-resena').addEventListener('click', function (e) {
        if (e.target === this) cerrarFormularioResena();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') cerrarFormularioResena();
    });

    // Regresó del inicio de sesión: se abre el formulario
    const parametros = new URLSearchParams(location.search);
    if (parametros.get('resena') === '1') {
        history.replaceState(null, '', 'campana.html#resenas');
        if (usuarioActivo()) setTimeout(abrirFormularioResena, 400);
    }

    // Reseñas publicadas en otra pestaña
    window.addEventListener('storage', function (e) {
        if (e.key === CLAVE_RESENAS_CAMPANA) pintarResenas();
    });
});
