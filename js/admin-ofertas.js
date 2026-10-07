/* =========================================================
   KOOKSTORE.MX - PANEL ADMIN: OFERTAS
   ---------------------------------------------------------
   Alta, edición, pausa y eliminación de ofertas por producto.
   Los datos viven en "kookstore_ofertas" (ver las funciones
   de ofertas en datos-productos.js) y la tienda las aplica
   sola en catálogo, detalle, carrito y checkout.

   Necesita: notificaciones.js, sesion.js, datos-productos.js,
   carrito.js y admin.js (en ese orden).
   ========================================================= */

const ETIQUETA_ESTADO_OFERTA = {
    activa: 'Activa',
    programada: 'Programada',
    pausada: 'Pausada',
    vencida: 'Vencida'
};

/* "2026-10-31" -> "31 oct 2026" */
function formatearFechaCorta(iso) {
    if (!iso) return '';
    const [anio, mes, dia] = iso.split('-').map(Number);
    return new Date(anio, mes - 1, dia).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' });
}

/* Texto del descuento: "-20%" o "-$50.00" */
function textoDescuento(oferta) {
    return oferta.tipo === 'monto'
        ? '-' + formatearPrecio(Number(oferta.valor) || 0).replace(' MXN', '')
        : '-' + (Number(oferta.valor) || 0) + '%';
}

function textoVigencia(oferta) {
    if (oferta.inicio && oferta.fin) return formatearFechaCorta(oferta.inicio) + ' – ' + formatearFechaCorta(oferta.fin);
    if (oferta.fin) return 'Hasta el ' + formatearFechaCorta(oferta.fin);
    if (oferta.inicio) return 'Desde el ' + formatearFechaCorta(oferta.inicio);
    return 'Sin fecha de fin';
}

/* ---------------------------------------------------------
   TABLA Y TARJETAS DE RESUMEN
   --------------------------------------------------------- */
function renderizarOfertasAdmin() {
    const tbody = document.getElementById('tabla-ofertas-body');
    if (!tbody) return;

    const productos = leerProductos();
    const ofertas = leerOfertas().filter(o => productos.some(p => p.id === o.productoId));
    const conteo = { activa: 0, programada: 0, pausada: 0, vencida: 0 };
    ofertas.forEach(o => { conteo[estadoOferta(o)]++; });

    // Mayor descuento entre las ofertas activas
    const mayor = ofertas
        .filter(o => estadoOferta(o) === 'activa')
        .map(o => precioProducto(productos.find(p => p.id === o.productoId)).descuento)
        .reduce((max, d) => Math.max(max, d), 0);

    document.getElementById('kpis-ofertas').innerHTML =
        tarjetaKpi('🔥', 'Ofertas activas', conteo.activa, 'visibles en el catálogo', 'rosa') +
        tarjetaKpi('🗓️', 'Programadas', conteo.programada, 'empiezan más adelante', 'azul') +
        tarjetaKpi('⏸️', 'Pausadas o vencidas', conteo.pausada + conteo.vencida, conteo.pausada + ' pausadas · ' + conteo.vencida + ' vencidas', 'ambar') +
        tarjetaKpi('💸', 'Mayor descuento', mayor ? mayor + '%' : '—', 'entre las activas', 'verde');

    document.getElementById('contador-nav-ofertas').textContent = conteo.activa;

    // Filtros
    const texto = document.getElementById('buscar-oferta').value.toLowerCase().trim();
    const filtro = document.getElementById('filtro-estado-oferta').value;

    const filas = ofertas.filter(function (o) {
        const p = productos.find(prod => prod.id === o.productoId);
        const coincideTexto = !texto || p.nombre.toLowerCase().includes(texto) || (p.grupo || '').toLowerCase().includes(texto);
        return coincideTexto && (filtro === 'todos' || estadoOferta(o) === filtro);
    });

    if (filas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="tabla-vacia">' +
            (ofertas.length === 0
                ? 'Todavía no hay ofertas. Crea la primera con “Nueva oferta” y aparecerá en el catálogo.'
                : 'Ninguna oferta coincide con los filtros.') +
            '</td></tr>';
        return;
    }

    tbody.innerHTML = filas.map(function (o) {
        const p = productos.find(prod => prod.id === o.productoId);
        const estado = estadoOferta(o);
        const final = aplicarDescuento(p.precio, o);
        const idSeguro = escaparHTML(o.id);

        return '' +
            '<tr>' +
            '<td>' +
            '<div class="celda-producto">' +
            '<img src="' + resolverImagen(p.imagen) + '" alt="" onerror="this.onerror=null; this.src=\'../assets/img/logo.png\'">' +
            '<div><strong>' + escaparHTML(p.nombre) + '</strong><span class="texto-tenue">' + escaparHTML(p.grupo || '—') + '</span></div>' +
            '</div>' +
            '</td>' +
            '<td><span class="chip-oferta grande">' + textoDescuento(o) + '</span></td>' +
            '<td class="celda-precio"><span class="precio-tachado">' + formatearPrecio(Number(p.precio) || 0) + '</span>' + formatearPrecio(final) + '</td>' +
            '<td>' + textoVigencia(o) + '</td>' +
            '<td><span class="estado-oferta estado-' + estado + '">' + ETIQUETA_ESTADO_OFERTA[estado] + '</span></td>' +
            '<td class="col-acciones">' +
            '<button type="button" class="btn-icono pausar" data-oferta="' + idSeguro + '" data-accion-oferta="alternar" title="' + (o.activa ? 'Pausar' : 'Activar') + '" aria-label="' + (o.activa ? 'Pausar oferta' : 'Activar oferta') + '">' +
            (o.activa
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="9" y1="6" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="18"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="7 5 19 12 7 19 7 5"/></svg>') +
            '</button>' +
            '<button type="button" class="btn-icono editar" data-oferta="' + idSeguro + '" data-accion-oferta="editar" title="Editar" aria-label="Editar oferta">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>' +
            '</button>' +
            '<button type="button" class="btn-icono eliminar" data-oferta="' + idSeguro + '" data-accion-oferta="eliminar" title="Eliminar" aria-label="Eliminar oferta">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
            '</button>' +
            '</td>' +
            '</tr>';
    }).join('');
}

/* ---------------------------------------------------------
   ACCIONES DE LA TABLA
   --------------------------------------------------------- */
function alternarOferta(id) {
    const ofertas = leerOfertas();
    const oferta = ofertas.find(o => o.id === id);
    if (!oferta) return;
    oferta.activa = !oferta.activa;
    guardarOfertas(ofertas);
    renderizarTodo();

    const producto = obtenerProductoPorId(oferta.productoId);
    kookToast(
        (producto ? producto.nombre : 'La oferta') + (oferta.activa ? ' vuelve a mostrar su descuento' : ' ya no muestra descuento'),
        oferta.activa ? 'exito' : 'info',
        oferta.activa ? 'Oferta activada' : 'Oferta pausada'
    );
}

function confirmarEliminarOferta(id) {
    const oferta = leerOfertas().find(o => o.id === id);
    if (!oferta) return;
    const producto = obtenerProductoPorId(oferta.productoId);

    kookConfirmar({
        tipo: 'peligro',
        titulo: '¿Eliminar esta oferta?',
        texto: 'El producto regresará a su precio normal en el catálogo.',
        detalle: (producto ? producto.nombre : 'Producto') + ' · ' + textoDescuento(oferta),
        textoConfirmar: 'Sí, eliminar',
        textoCancelar: 'Cancelar'
    }).then(function (acepto) {
        if (!acepto) return;
        guardarOfertas(leerOfertas().filter(o => o.id !== id));
        renderizarTodo();
        kookToast('La oferta de ' + (producto ? producto.nombre : 'el producto') + ' se eliminó', 'exito', 'Oferta eliminada');
    });
}

/* ---------------------------------------------------------
   FORMULARIO (MODAL)
   --------------------------------------------------------- */
function tipoOfertaElegido() {
    return document.querySelector('input[name="oferta-tipo"]:checked').value;
}

/* Lista de productos; los que ya tienen otra oferta quedan deshabilitados */
function llenarSelectProductos(idOfertaEditando, productoElegido) {
    const select = document.getElementById('oferta-producto');
    const ocupados = leerOfertas().filter(o => o.id !== idOfertaEditando).map(o => o.productoId);

    select.innerHTML = leerProductos().map(function (p) {
        const ocupado = ocupados.includes(p.id);
        return '<option value="' + escaparHTML(p.id) + '"' + (ocupado ? ' disabled' : '') + '>' +
            escaparHTML(p.nombre) + ' — ' + formatearPrecio(Number(p.precio) || 0) + (ocupado ? ' (ya tiene oferta)' : '') +
            '</option>';
    }).join('');

    if (productoElegido) {
        select.value = productoElegido;
    } else {
        const libre = Array.from(select.options).find(o => !o.disabled);
        if (libre) select.value = libre.value;
    }
}

/* Cambia el símbolo y los botones rápidos según % o $ */
function aplicarTipoOferta() {
    const esMonto = tipoOfertaElegido() === 'monto';
    document.getElementById('oferta-valor-simbolo').textContent = esMonto ? '$' : '%';
    document.getElementById('oferta-valor-etiqueta').textContent = esMonto ? 'Monto a descontar (MXN)' : 'Porcentaje de descuento';
    document.getElementById('oferta-valor').placeholder = esMonto ? '50' : '20';
    document.getElementById('descuentos-rapidos').innerHTML = (esMonto ? [20, 50, 100, 150, 200] : [10, 15, 20, 30, 50])
        .map(v => '<button type="button" data-valor="' + v + '">' + (esMonto ? '$' + v : v + '%') + '</button>')
        .join('');
    actualizarVistaPreviaOferta();
}

/* Muestra cómo quedará el precio en el catálogo */
function actualizarVistaPreviaOferta() {
    const vista = document.getElementById('oferta-vista-previa');
    const producto = obtenerProductoPorId(document.getElementById('oferta-producto').value);
    if (!producto) {
        vista.innerHTML = '<span class="texto-tenue">Primero agrega productos al inventario.</span>';
        return;
    }

    const oferta = { tipo: tipoOfertaElegido(), valor: Number(document.getElementById('oferta-valor').value) || 0 };
    const final = aplicarDescuento(producto.precio, oferta);
    const original = Number(producto.precio) || 0;
    const porcentaje = original > 0 ? Math.round((1 - final / original) * 100) : 0;

    vista.innerHTML = '' +
        '<img src="' + resolverImagen(producto.imagen) + '" alt="" onerror="this.onerror=null; this.src=\'../assets/img/logo.png\'">' +
        '<div>' +
        '<small>Así se verá en el catálogo</small>' +
        '<strong>' + escaparHTML(producto.nombre) + '</strong>' +
        '<div class="vista-precios">' +
        (final < original ? '<span class="precio-tachado">' + formatearPrecio(original) + '</span>' : '') +
        '<span class="vista-final">' + formatearPrecio(final) + '</span>' +
        (porcentaje > 0 ? '<span class="chip-oferta">-' + porcentaje + '%</span>' : '') +
        '</div>' +
        '</div>';
}

function abrirModalOferta(oferta) {
    const modal = document.getElementById('modal-oferta');
    document.getElementById('form-oferta').reset();
    document.getElementById('oferta-id').value = oferta ? oferta.id : '';
    document.getElementById('oferta-titulo').textContent = oferta ? 'Editar oferta' : 'Nueva oferta';
    document.getElementById('btn-guardar-oferta').textContent = oferta ? 'Guardar cambios' : 'Guardar oferta';

    llenarSelectProductos(oferta ? oferta.id : null, oferta ? oferta.productoId : null);

    document.querySelector('input[name="oferta-tipo"][value="' + (oferta ? oferta.tipo : 'porcentaje') + '"]').checked = true;
    document.getElementById('oferta-valor').value = oferta ? oferta.valor : '';
    document.getElementById('oferta-inicio').value = oferta ? (oferta.inicio || '') : fechaHoyISO();
    document.getElementById('oferta-fin').value = oferta ? (oferta.fin || '') : '';
    document.getElementById('oferta-activa').checked = oferta ? oferta.activa : true;

    aplicarTipoOferta();

    modal.classList.add('abierto');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sin-scroll');
    setTimeout(() => document.getElementById('oferta-valor').focus(), 50);
}

function cerrarModalOferta() {
    const modal = document.getElementById('modal-oferta');
    modal.classList.remove('abierto');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sin-scroll');
}

/* Guarda la oferta sin validaciones: los valores se ajustan solos */
function guardarOfertaFormulario(e) {
    e.preventDefault();

    const productoId = document.getElementById('oferta-producto').value;
    const producto = obtenerProductoPorId(productoId);
    if (!producto) {
        cerrarModalOferta();
        kookToast('Agrega productos al inventario para poder crear ofertas.', 'info', 'Sin productos');
        return;
    }

    const tipo = tipoOfertaElegido();
    let valor = Math.max(0, Number(document.getElementById('oferta-valor').value) || 0);
    if (tipo === 'porcentaje') valor = Math.min(100, valor);
    else valor = Math.min(Number(producto.precio) || 0, valor);

    let inicio = document.getElementById('oferta-inicio').value;
    let fin = document.getElementById('oferta-fin').value;
    if (inicio && fin && fin < inicio) [inicio, fin] = [fin, inicio];   // fechas al revés: se acomodan

    const idExistente = document.getElementById('oferta-id').value;
    const datos = {
        id: idExistente || 'oferta-' + Date.now(),
        productoId: productoId,
        tipo: tipo,
        valor: valor,
        inicio: inicio,
        fin: fin,
        activa: document.getElementById('oferta-activa').checked
    };

    const ofertas = leerOfertas().filter(o => o.id !== datos.id && o.productoId !== productoId);
    ofertas.unshift(datos);
    guardarOfertas(ofertas);

    cerrarModalOferta();
    renderizarTodo();

    const estado = estadoOferta(datos);
    kookToast(
        producto.nombre + ' · ' + textoDescuento(datos) + ' → ' + formatearPrecio(aplicarDescuento(producto.precio, datos)) +
        (estado === 'activa' ? '' : ' (' + ETIQUETA_ESTADO_OFERTA[estado].toLowerCase() + ')'),
        'exito',
        idExistente ? 'Oferta actualizada' : 'Oferta creada'
    );
}

/* ---------------------------------------------------------
   EVENTOS
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-nueva-oferta').addEventListener('click', () => abrirModalOferta(null));
    document.getElementById('buscar-oferta').addEventListener('input', renderizarOfertasAdmin);
    document.getElementById('filtro-estado-oferta').addEventListener('change', renderizarOfertasAdmin);
    document.getElementById('form-oferta').addEventListener('submit', guardarOfertaFormulario);

    document.getElementById('tabla-ofertas-body').addEventListener('click', function (e) {
        const boton = e.target.closest('[data-accion-oferta]');
        if (!boton) return;
        const id = boton.getAttribute('data-oferta');
        const accion = boton.getAttribute('data-accion-oferta');
        if (accion === 'alternar') alternarOferta(id);
        if (accion === 'editar') abrirModalOferta(leerOfertas().find(o => o.id === id));
        if (accion === 'eliminar') confirmarEliminarOferta(id);
    });

    // Vista previa en vivo
    document.getElementById('oferta-producto').addEventListener('change', actualizarVistaPreviaOferta);
    document.getElementById('oferta-valor').addEventListener('input', actualizarVistaPreviaOferta);
    document.querySelectorAll('input[name="oferta-tipo"]').forEach(r => r.addEventListener('change', aplicarTipoOferta));
    document.getElementById('descuentos-rapidos').addEventListener('click', function (e) {
        const boton = e.target.closest('[data-valor]');
        if (!boton) return;
        document.getElementById('oferta-valor').value = boton.getAttribute('data-valor');
        actualizarVistaPreviaOferta();
    });

    // Cerrar: botones, clic fuera y tecla Esc
    document.querySelectorAll('[data-cerrar-oferta]').forEach(b => b.addEventListener('click', cerrarModalOferta));
    document.getElementById('modal-oferta').addEventListener('click', function (e) {
        if (e.target === this) cerrarModalOferta();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.getElementById('modal-oferta').classList.contains('abierto') &&
            !document.querySelector('.kook-dialogo-fondo')) {
            cerrarModalOferta();
        }
    });

    renderizarOfertasAdmin();
});
