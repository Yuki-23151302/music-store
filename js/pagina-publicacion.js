/* =========================================================
   KOOKSTORE.MX - DETALLE DE UNA PUBLICACIÓN (MODELO C2C)
   ---------------------------------------------------------
   Igual que la ficha del catálogo (productos.html?id=...),
   pero para lo que publican los fans. La publicación llega
   en la dirección:

     publicacion.html?id=pub-1730...        (de un usuario)
     publicacion.html?id=ejemplo-skzoo-leebit (de ejemplo)

   - Si la publicación es tuya: accesos para editarla o
     eliminarla en "Mis publicaciones".
   - Si es de otro fan: "Contactar al vendedor" (simulado).
   - Abajo: carrusel con más publicaciones de fans.

   Necesita: notificaciones.js, sesion.js, carrito.js, ui.js
   y publicaciones-c2c.js
   ========================================================= */

let carruselRelacionadosListo = false;

/* Lee el id que viene en la dirección */
function idPublicacionDeLaUrl() {
    const id = new URLSearchParams(location.search).get('id');
    return id || location.hash.replace('#', '');
}

function fechaLarga(fecha) {
    return new Date(fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ---------------------------------------------------------
   MIGAS: Mercado de fans › Publicaciones › Nombre
   --------------------------------------------------------- */
function pintarMigasPublicacion(pub) {
    const migas = document.querySelector('.detalle-migas');
    migas.innerHTML =
        '<a href="vender.html#lista-publicaciones" class="migas-volver">&larr; Volver a publicaciones</a>' +
        '<nav class="migas-ruta" aria-label="Ruta de navegación">' +
        '<a href="vender.html">Mercado de fans</a><span>›</span>' +
        '<a href="vender.html#lista-publicaciones">Publicaciones recientes</a><span>›</span>' +
        '<strong>' + escaparHTML(nombrePublicacion(pub)) + '</strong>' +
        '</nav>';
}

/* El enlace llegó incompleto o la publicación se eliminó */
function mostrarPublicacionNoEncontrada(contenedor) {
    document.title = 'Publicación no disponible | Kookstore.mx';
    contenedor.innerHTML =
        '<div class="detalle-vacio">' +
        '<h1>Esta publicación ya no está disponible</h1>' +
        '<p>Puede que el enlace esté incompleto o que el vendedor la haya eliminado.</p>' +
        '<a href="vender.html#lista-publicaciones" class="btn-primario">Ver publicaciones recientes</a>' +
        '</div>';
}

/* ---------------------------------------------------------
   ACCIONES: dueño o comprador
   --------------------------------------------------------- */
function htmlAccionesPublicacion(pub) {
    if (esMiPublicacion(pub)) {
        return '' +
            '<div class="pub-aviso-dueno">✨ Esta es tu publicación. Así la ven los demás fans.</div>' +
            '<a href="mis-publicaciones.html" class="btn-primario detalle-btn-carrito pub-btn">✏️ Editar o eliminar en Mis publicaciones</a>';
    }
    return '' +
        '<button type="button" class="btn-primario detalle-btn-carrito pub-btn" id="btn-contactar">💬 Me interesa · Contactar al vendedor</button>' +
        '<p class="pub-nota">Simulación: no se comparte ningún dato personal.</p>';
}

/* ---------------------------------------------------------
   FICHA DE LA PUBLICACIÓN
   --------------------------------------------------------- */
function pintarPublicacion(pub) {
    const contenedor = document.getElementById('detalle-publicacion');
    const nombre = nombrePublicacion(pub);
    const vendedor = pub.vendedor || 'Fan anónimo';

    document.title = nombre + ' | Mercado de fans | Kookstore.mx';
    pintarMigasPublicacion(pub);

    contenedor.innerHTML = '' +
        '<article class="detalle-producto pub-detalle">' +

        '<div class="detalle-imagen pub-imagen' + (pub.foto ? '' : ' sin-foto') + '">' +
        '<img src="' + escaparHTML(fotoPublicacion(pub)) + '" alt="' + escaparHTML(nombre) + '"' +
        ' onerror="this.onerror=null; this.src=\'../assets/img/logo.png\'; this.parentNode.classList.add(\'sin-foto\')">' +
        '<span class="pub-sello">🤝 De fan a fan</span>' +
        '</div>' +

        '<div class="detalle-info">' +
        '<span class="catalogo-etiqueta pub-etiqueta">PUBLICACIÓN DE LA COMUNIDAD</span>' +
        '<h1>' + escaparHTML(nombre) + '</h1>' +
        '<p class="detalle-grupo">Publicado por ' + escaparHTML(vendedor) + (esMiPublicacion(pub) ? ' (tú)' : '') + '</p>' +
        '<p class="detalle-precio pub-precio">' + precioPublicacion(pub) + '</p>' +

        '<div class="detalle-bloque">' +
        '<h2>Descripción</h2>' +
        '<p>' + escaparHTML(descripcionPublicacion(pub)) + '</p>' +
        '</div>' +

        '<dl class="pub-ficha">' +
        '<div><dt>Estado</dt><dd><span class="pub-disponible">● Disponible</span></dd></div>' +
        '<div><dt>Publicada</dt><dd>' + fechaLarga(pub.fecha) + '</dd></div>' +
        '<div><dt>Entrega</dt><dd>A acordar con el vendedor</dd></div>' +
        '<div><dt>Comisión</dt><dd>Sin comisión (simulado)</dd></div>' +
        (pub.editada ? '<div><dt>Última edición</dt><dd>' + fechaLarga(pub.editada) + '</dd></div>' : '') +
        '</dl>' +

        '<div class="pub-vendedor">' +
        '<span class="pub-avatar">' + escaparHTML(inicialesDe(vendedor)) + '</span>' +
        '<div><strong>' + escaparHTML(vendedor) + '</strong><small>Fan de la comunidad Kookstore</small></div>' +
        '</div>' +

        htmlAccionesPublicacion(pub) +

        '<div class="detalle-enlaces">' +
        '<a href="vender.html#lista-publicaciones" class="detalle-enlace-carrito">← Seguir viendo publicaciones</a>' +
        '<a href="vender.html" class="detalle-enlace-carrito">Publicar el mío →</a>' +
        '</div>' +
        '</div>' +

        '</article>';

    const contactar = document.getElementById('btn-contactar');
    if (contactar) {
        contactar.addEventListener('click', function () {
            kookAlerta({
                tipo: 'exito',
                titulo: 'Mensaje enviado (simulado)',
                texto: 'Le avisamos a ' + vendedor + ' que te interesa su publicación. En una tienda real, te contactaría para acordar el pago y la entrega.',
                detalle: nombre + ' · ' + precioPublicacion(pub),
                textoBoton: 'Entendido'
            });
        });
    }
}

/* ---------------------------------------------------------
   MÁS PUBLICACIONES DE FANS (carrusel, como en el catálogo)
   --------------------------------------------------------- */
function tarjetaPublicacionRelacionada(pub) {
    return '' +
        '<a class="slide-producto" href="' + urlPublicacion(pub) + '">' +
        '<div class="slide-imagen' + (pub.foto ? '' : ' pub-slide-sin-foto') + '">' +
        '<span class="slide-insignia">' + (esMiPublicacion(pub) ? 'Tuya' : 'De fan a fan') + '</span>' +
        '<img src="' + escaparHTML(fotoPublicacion(pub)) + '" alt="' + escaparHTML(nombrePublicacion(pub)) + '" loading="lazy"' +
        ' onerror="this.onerror=null; this.src=\'../assets/img/logo.png\'">' +
        '</div>' +
        '<div class="slide-info">' +
        '<span class="slide-grupo">👤 ' + escaparHTML(pub.vendedor || 'Fan anónimo') + '</span>' +
        '<h3>' + escaparHTML(nombrePublicacion(pub)) + '</h3>' +
        '<div class="slide-pie">' +
        // Sin "MXN" para que el precio quepa en una línea junto a "Ver →"
        '<span class="slide-precio">' + precioPublicacion(pub).replace(' MXN', '') + '</span>' +
        '<span class="slide-boton">Ver →</span>' +
        '</div>' +
        '</div>' +
        '</a>';
}

function pintarRelacionadas(pub) {
    const seccion = document.getElementById('seccion-relacionados');
    const otras = todasLasPublicaciones().filter(p => p.id !== pub.id).slice(0, 8);
    seccion.hidden = otras.length === 0;
    if (!otras.length) return;

    const pista = document.getElementById('pista-relacionados');
    pista.innerHTML = otras.map(tarjetaPublicacionRelacionada).join('');
    pista.scrollLeft = 0;

    if (!carruselRelacionadosListo && typeof iniciarCarrusel === 'function') {
        iniciarCarrusel(document.getElementById('carrusel-relacionados'), seccion.querySelector('.carrusel-cabecera'));
        window.addEventListener('resize', actualizarControlesRelacionadas);
        carruselRelacionadosListo = true;
    }
    requestAnimationFrame(function () {
        actualizarControlesRelacionadas();
        window.dispatchEvent(new Event('resize'));   // el carrusel recalcula sus puntos
    });
}

/* Si todas las tarjetas caben, las flechas y los puntos sobran */
function actualizarControlesRelacionadas() {
    const seccion = document.getElementById('seccion-relacionados');
    const pista = document.getElementById('pista-relacionados');
    const cabe = pista.scrollWidth <= pista.clientWidth + 4;
    seccion.querySelector('.carrusel-controles').hidden = cabe;
    seccion.querySelector('.carrusel-puntos').hidden = cabe;
}

/* ---------------------------------------------------------
   INICIO
   --------------------------------------------------------- */
function cargarDetallePublicacion() {
    const pub = obtenerPublicacionPorId(idPublicacionDeLaUrl());
    if (!pub) {
        mostrarPublicacionNoEncontrada(document.getElementById('detalle-publicacion'));
        document.getElementById('seccion-relacionados').hidden = true;
        return;
    }
    pintarPublicacion(pub);
    pintarRelacionadas(pub);
}

document.addEventListener('DOMContentLoaded', function () {
    cargarDetallePublicacion();

    // Si se edita o elimina en otra pestaña, la ficha se actualiza
    window.addEventListener('storage', function (e) {
        if (e.key === CLAVE_PUBLICACIONES) cargarDetallePublicacion();
    });
});
