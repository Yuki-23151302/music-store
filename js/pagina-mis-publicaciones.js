/* =========================================================
   KOOKSTORE.MX - MIS PUBLICACIONES (MODELO C2C)
   ---------------------------------------------------------
   Lista de los productos que el usuario publicó en
   "Publica tu producto". Cada elemento tiene:
     - Editar   -> la tarjeta se convierte en un formulario
                   en la misma lista (simulado, sin validaciones)
     - Eliminar -> confirmación y la tarjeta desaparece (simulado)

   Si llega desde "Publicar" (mis-publicaciones.html?nueva=ID),
   la publicación nueva se resalta.

   Necesita: notificaciones.js, sesion.js, carrito.js y
   publicaciones-c2c.js
   ========================================================= */

/* ---------------------------------------------------------
   RESUMEN DE ARRIBA
   --------------------------------------------------------- */
function pintarResumen(lista) {
    const valor = lista.reduce((suma, p) => suma + (Math.max(0, Number(p.precio)) || 0), 0);
    document.getElementById('dato-total').textContent = lista.length;
    document.getElementById('dato-valor').textContent = formatearPrecio(valor);
    document.getElementById('dato-ultima').textContent = lista.length
        ? new Date(lista[0].fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
        : '—';

    const usuario = usuarioActivo();
    document.getElementById('mispub-subtitulo').textContent = usuario
        ? 'Hola, ' + usuario.nombre.split(' ')[0] + '. Administra los productos que publicaste para vender a otros fans.'
        : 'Estás como invitado: aquí ves lo que publicaste desde este navegador.';
}

/* ---------------------------------------------------------
   UN ELEMENTO DE LA LISTA (modo vista)
   --------------------------------------------------------- */
function htmlElementoVista(pub) {
    const fecha = new Date(pub.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' });
    const editada = pub.editada
        ? ' · Editada el ' + new Date(pub.editada).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })
        : '';

    return '' +
        '<div class="mispub-foto' + (pub.foto ? '' : ' sin-foto') + '">' +
        '<img src="' + escaparHTML(fotoPublicacion(pub)) + '" alt="' + escaparHTML(nombrePublicacion(pub)) + '"' +
        ' onerror="this.onerror=null; this.src=\'../assets/img/logo.png\'">' +
        '</div>' +
        '<div class="mispub-info">' +
        '<div class="mispub-fila">' +
        '<h3>' + escaparHTML(nombrePublicacion(pub)) + '</h3>' +
        '<span class="mispub-estado">● Activa</span>' +
        '</div>' +
        '<p class="mispub-precio">' + precioPublicacion(pub) + '</p>' +
        '<p class="mispub-descripcion">' + escaparHTML(descripcionPublicacion(pub)) + '</p>' +
        '<p class="mispub-fecha">Publicada el ' + fecha + editada + '</p>' +
        '</div>' +
        '<div class="mispub-acciones">' +
        '<button type="button" class="btn-mispub editar" data-accion="editar">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>' +
        'Editar</button>' +
        '<button type="button" class="btn-mispub eliminar" data-accion="eliminar">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
        'Eliminar</button>' +
        '</div>';
}

/* ---------------------------------------------------------
   UN ELEMENTO DE LA LISTA (modo edición)
   --------------------------------------------------------- */
function htmlElementoEdicion(pub) {
    return '' +
        '<label class="mispub-foto mispub-foto-editable' + (pub.foto ? '' : ' sin-foto') + '" title="Cambiar foto">' +
        '<img src="' + escaparHTML(fotoPublicacion(pub)) + '" alt="" data-campo="vista-foto">' +
        '<span class="mispub-cambiar-foto">📷 Cambiar foto</span>' +
        '<input type="file" accept="image/*" data-campo="foto" hidden>' +
        '</label>' +
        '<form class="mispub-editar" novalidate>' +
        '<label>Nombre del producto<input type="text" data-campo="nombre" value="' + escaparHTML(pub.nombre || '') + '" placeholder="Producto sin nombre"></label>' +
        '<label>Precio (MXN)<input type="number" data-campo="precio" min="0" step="0.01" value="' + escaparHTML(pub.precio === undefined ? '' : pub.precio) + '" placeholder="Precio a convenir"></label>' +
        '<label class="ancho">Descripción<textarea data-campo="descripcion" rows="3" placeholder="Sin descripción.">' + escaparHTML(pub.descripcion || '') + '</textarea></label>' +
        '<div class="mispub-editar-acciones">' +
        '<button type="button" class="btn-mispub cancelar" data-accion="cancelar">Cancelar</button>' +
        '<button type="submit" class="btn-mispub guardar">Guardar cambios</button>' +
        '</div>' +
        '</form>';
}

/* ---------------------------------------------------------
   LISTA COMPLETA
   --------------------------------------------------------- */
function pintarMisPublicaciones() {
    const contenedor = document.getElementById('lista-mis-publicaciones');
    const lista = misPublicaciones();
    pintarResumen(lista);

    if (lista.length === 0) {
        contenedor.innerHTML = '' +
            '<div class="mispub-vacio">' +
            '<span>📦</span>' +
            '<h2>Aún no has publicado nada</h2>' +
            '<p>Publica tus álbumes, photocards o lightsticks y aparecerán aquí.</p>' +
            '<a href="vender.html" class="btn-primario">Publicar mi primer producto</a>' +
            '</div>';
        return;
    }

    contenedor.innerHTML = '';
    lista.forEach(function (pub) {
        const elemento = document.createElement('article');
        elemento.className = 'mispub-item';
        elemento.dataset.id = pub.id;
        elemento.innerHTML = htmlElementoVista(pub);
        contenedor.appendChild(elemento);
    });
}

/* ---------------------------------------------------------
   EDITAR (simulado): formulario dentro de la misma tarjeta
   --------------------------------------------------------- */
function abrirEdicion(elemento) {
    const pub = misPublicaciones().find(p => p.id === elemento.dataset.id);
    if (!pub) return;

    elemento.classList.remove('recien-publicado', 'recien-editado');
    elemento.classList.add('editando');
    elemento.innerHTML = htmlElementoEdicion(pub);
    elemento.dataset.fotoNueva = '';
    elemento.querySelector('[data-campo="nombre"]').focus();

    // Cambiar foto (simulada)
    elemento.querySelector('[data-campo="foto"]').addEventListener('change', function () {
        if (!this.files[0]) return;
        reducirFoto(this.files[0], function (ruta) {
            elemento.dataset.fotoNueva = ruta;
            elemento.querySelector('[data-campo="vista-foto"]').src = ruta;
            elemento.querySelector('.mispub-foto').classList.remove('sin-foto');
        });
    });

    elemento.querySelector('form').addEventListener('submit', function (e) {
        e.preventDefault();
        guardarEdicion(elemento);
    });
}

/* Guarda SIN validaciones: lo vacío se muestra con texto de relleno */
function guardarEdicion(elemento) {
    const publicaciones = leerPublicaciones();
    const pub = publicaciones.find(p => p.id === elemento.dataset.id);
    if (!pub) return;

    pub.nombre = elemento.querySelector('[data-campo="nombre"]').value;
    pub.precio = elemento.querySelector('[data-campo="precio"]').value;
    pub.descripcion = elemento.querySelector('[data-campo="descripcion"]').value;
    if (elemento.dataset.fotoNueva) pub.foto = elemento.dataset.fotoNueva;
    pub.editada = new Date().toISOString();
    guardarPublicaciones(publicaciones);

    cerrarEdicion(elemento, pub);
    elemento.classList.add('recien-editado');
    setTimeout(() => elemento.classList.remove('recien-editado'), 1600);
    pintarResumen(misPublicaciones());
    kookToast(nombrePublicacion(pub), 'exito', 'Cambios guardados (simulado)');
}

function cerrarEdicion(elemento, pub) {
    elemento.classList.remove('editando');
    elemento.innerHTML = htmlElementoVista(pub || misPublicaciones().find(p => p.id === elemento.dataset.id));
}

/* ---------------------------------------------------------
   ELIMINAR (simulado): confirmación y la tarjeta desaparece
   --------------------------------------------------------- */
function confirmarEliminar(elemento) {
    const pub = misPublicaciones().find(p => p.id === elemento.dataset.id);
    if (!pub) return;

    kookConfirmar({
        tipo: 'peligro',
        titulo: '¿Eliminar esta publicación?',
        texto: 'Dejará de aparecer en tus publicaciones y en las publicaciones recientes de la comunidad.',
        detalle: nombrePublicacion(pub) + ' · ' + precioPublicacion(pub),
        textoConfirmar: 'Sí, eliminar',
        textoCancelar: 'Cancelar'
    }).then(function (acepto) {
        if (!acepto) return;

        guardarPublicaciones(leerPublicaciones().filter(p => p.id !== pub.id));
        elemento.classList.add('saliendo');
        setTimeout(function () {
            elemento.remove();
            if (!document.querySelector('.mispub-item')) pintarMisPublicaciones();
            else pintarResumen(misPublicaciones());
        }, 400);
        kookToast(nombrePublicacion(pub), 'exito', 'Publicación eliminada (simulado)');
    });
}

/* ---------------------------------------------------------
   INICIO
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    pintarMisPublicaciones();

    // Un solo listener para todos los botones de la lista
    document.getElementById('lista-mis-publicaciones').addEventListener('click', function (e) {
        const boton = e.target.closest('[data-accion]');
        if (!boton) return;
        const elemento = boton.closest('.mispub-item');
        switch (boton.dataset.accion) {
            case 'editar': abrirEdicion(elemento); break;
            case 'eliminar': confirmarEliminar(elemento); break;
            case 'cancelar': cerrarEdicion(elemento); break;
        }
    });

    // Recién publicada desde "Publica tu producto": se resalta
    const nueva = new URLSearchParams(location.search).get('nueva');
    const elementoNuevo = nueva && document.querySelector('.mispub-item[data-id="' + CSS.escape(nueva) + '"]');
    if (elementoNuevo) {
        elementoNuevo.classList.add('recien-publicado');
        setTimeout(() => elementoNuevo.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
        kookToast('Tu producto ya está en tu lista.', 'exito', 'Publicado (simulado)');
        history.replaceState(null, '', 'mis-publicaciones.html');
    }

    // Cambios hechos en otra pestaña (por ejemplo, una nueva publicación)
    window.addEventListener('storage', function (e) {
        if (e.key === CLAVE_PUBLICACIONES && !document.querySelector('.mispub-item.editando')) {
            pintarMisPublicaciones();
        }
    });
});
