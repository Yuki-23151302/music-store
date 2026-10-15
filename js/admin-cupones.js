/* =========================================================
   KOOKSTORE.MX - PANEL ADMIN: CÓDIGOS DE DESCUENTO
   ---------------------------------------------------------
   Alta, edición, pausa y eliminación de cupones, y lista de
   clientes que ya canjearon cada código.
   La lógica compartida (validar, calcular, canjear) está en
   js/cupones.js.

   Necesita: notificaciones.js, sesion.js, datos-productos.js,
   carrito.js, cupones.js y admin.js (en ese orden).
   ========================================================= */

const ETIQUETA_ESTADO_CUPON = {
    activo: 'Activo',
    programado: 'Programado',
    pausado: 'Pausado',
    vencido: 'Vencido'
};

/* Cupones con la lista de canjes desplegada */
const canjesAbiertos = new Set();

function vigenciaCuponAdmin(cupon) {
    if (cupon.inicio && cupon.fin) return formatearFechaCorta(cupon.inicio) + ' – ' + formatearFechaCorta(cupon.fin);
    if (cupon.fin) return 'Hasta el ' + formatearFechaCorta(cupon.fin);
    if (cupon.inicio) return 'Desde el ' + formatearFechaCorta(cupon.inicio);
    return 'Sin fecha de fin';
}

/* "KOOK" + 4 caracteres fáciles de leer (sin 0/O ni 1/I) */
function generarCodigoCupon() {
    const letras = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let codigo = 'KOOK';
    for (let i = 0; i < 4; i++) codigo += letras[Math.floor(Math.random() * letras.length)];
    return codigo;
}

/* ---------------------------------------------------------
   TABLA Y TARJETAS DE RESUMEN
   --------------------------------------------------------- */
function renderizarCuponesAdmin() {
    const tbody = document.getElementById('tabla-cupones-body');
    if (!tbody) return;

    const cupones = leerCupones();
    const conteo = { activo: 0, programado: 0, pausado: 0, vencido: 0 };
    cupones.forEach(c => { conteo[estadoCupon(c)]++; });
    const canjes = cupones.reduce((suma, c) => suma + (c.usos || []).length, 0);

    document.getElementById('kpis-cupones').innerHTML =
        tarjetaKpi('🎟️', 'Códigos activos', conteo.activo, 'visibles en Promociones', 'rosa') +
        tarjetaKpi('✅', 'Canjes', canjes, 'pedidos pagados con código', 'verde') +
        tarjetaKpi('🗓️', 'Programados', conteo.programado, 'se publican más adelante', 'azul') +
        tarjetaKpi('⏸️', 'Pausados o vencidos', conteo.pausado + conteo.vencido, conteo.pausado + ' pausados · ' + conteo.vencido + ' vencidos', 'ambar');

    document.getElementById('contador-nav-cupones').textContent = conteo.activo;

    const texto = document.getElementById('buscar-cupon').value.toLowerCase().trim();
    const filtro = document.getElementById('filtro-estado-cupon').value;

    const filas = cupones.filter(c =>
        (!texto || c.codigo.toLowerCase().includes(texto) || (c.titulo || '').toLowerCase().includes(texto)) &&
        (filtro === 'todos' || estadoCupon(c) === filtro)
    );

    if (filas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="tabla-vacia">' +
            (cupones.length === 0
                ? 'Todavía no hay códigos. Crea el primero con “Nuevo código” y aparecerá en Promociones.'
                : 'Ningún código coincide con los filtros.') +
            '</td></tr>';
        return;
    }

    tbody.innerHTML = filas.map(function (c) {
        const estado = estadoCupon(c);
        const usos = c.usos || [];
        const abierto = canjesAbiertos.has(c.id);
        const idSeguro = escaparHTML(c.id);

        let fila = '' +
            '<tr class="' + (abierto ? 'con-desglose' : '') + '">' +
            '<td><span class="chip-codigo">' + escaparHTML(c.codigo) + '</span></td>' +
            '<td><strong>' + escaparHTML(c.titulo || 'Sin título') + '</strong>' +
            (c.descripcion ? '<span class="texto-tenue">' + escaparHTML(c.descripcion) + '</span>' : '') + '</td>' +
            '<td><span class="chip-oferta grande">' + textoDescuentoCupon(c) + '</span></td>' +
            '<td>' + escaparHTML(alcanceCupon(c)) + '</td>' +
            '<td>' + vigenciaCuponAdmin(c) + '</td>' +
            '<td>' +
            (usos.length
                ? '<button type="button" class="btn-desglose' + (abierto ? ' abierto' : '') + '" data-accion-cupon="canjes" data-cupon="' + idSeguro + '">' + usos.length + (usos.length === 1 ? ' canje' : ' canjes') + ' <span class="flecha">▾</span></button>'
                : '<span class="texto-tenue">Sin canjes</span>') +
            '</td>' +
            '<td><span class="estado-oferta estado-' + ({ activo: 'activa', programado: 'programada', pausado: 'pausada', vencido: 'vencida' })[estado] + '">' + ETIQUETA_ESTADO_CUPON[estado] + '</span></td>' +
            '<td class="col-acciones">' +
            '<button type="button" class="btn-icono pausar" data-cupon="' + idSeguro + '" data-accion-cupon="alternar" title="' + (c.activo ? 'Pausar' : 'Activar') + '" aria-label="' + (c.activo ? 'Pausar código' : 'Activar código') + '">' +
            (c.activo
                ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="9" y1="6" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="18"/></svg>'
                : '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="7 5 19 12 7 19 7 5"/></svg>') +
            '</button>' +
            '<button type="button" class="btn-icono editar" data-cupon="' + idSeguro + '" data-accion-cupon="editar" title="Editar" aria-label="Editar código">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>' +
            '</button>' +
            '<button type="button" class="btn-icono eliminar" data-cupon="' + idSeguro + '" data-accion-cupon="eliminar" title="Eliminar" aria-label="Eliminar código">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
            '</button>' +
            '</td>' +
            '</tr>';

        // Lista de canjes: quién lo usó, cuándo y en qué pedido
        if (abierto && usos.length) {
            fila += '' +
                '<tr class="fila-desglose"><td colspan="8">' +
                '<div class="desglose-contenido">' +
                '<div class="desglose-titulo"><span><strong>' + escaparHTML(c.codigo) + '</strong> · Clientes que ya lo canjearon</span></div>' +
                '<ul class="lista-canjes">' +
                usos.map(u => '<li><span class="avatar-cliente mini">' + escaparHTML(inicialesDe((buscarUsuarioPorEmail(u.email) || {}).nombre || u.email)) + '</span>' +
                    '<div><strong>' + escaparHTML(u.email) + '</strong><span class="texto-tenue">Pedido ' + escaparHTML(u.folio) + ' · ' + escaparHTML(u.fecha) + '</span></div></li>').join('') +
                '</ul>' +
                '</div>' +
                '</td></tr>';
        }
        return fila;
    }).join('');
}

/* ---------------------------------------------------------
   ACCIONES DE LA TABLA
   --------------------------------------------------------- */
function alternarCupon(id) {
    const cupones = leerCupones();
    const cupon = cupones.find(c => c.id === id);
    if (!cupon) return;
    cupon.activo = !cupon.activo;
    guardarCupones(cupones);
    renderizarCuponesAdmin();
    kookToast(
        cupon.codigo + (cupon.activo ? ' vuelve a aparecer en Promociones' : ' ya no se puede canjear'),
        cupon.activo ? 'exito' : 'info',
        cupon.activo ? 'Código activado' : 'Código pausado'
    );
}

function confirmarEliminarCupon(id) {
    const cupon = leerCupones().find(c => c.id === id);
    if (!cupon) return;

    kookConfirmar({
        tipo: 'peligro',
        titulo: '¿Eliminar el código ' + cupon.codigo + '?',
        texto: 'Desaparecerá de Promociones y ya nadie podrá canjearlo. Los pedidos que ya lo usaron conservan su descuento.',
        detalle: (cupon.titulo || 'Código de descuento') + ' · ' + textoDescuentoCupon(cupon),
        textoConfirmar: 'Sí, eliminar',
        textoCancelar: 'Cancelar'
    }).then(function (acepto) {
        if (!acepto) return;
        guardarCupones(leerCupones().filter(c => c.id !== id));
        canjesAbiertos.delete(id);
        renderizarCuponesAdmin();
        kookToast('El código ' + cupon.codigo + ' se eliminó', 'exito', 'Código eliminado');
    });
}

/* ---------------------------------------------------------
   FORMULARIO (MODAL)
   --------------------------------------------------------- */
function tipoCuponElegido() {
    return document.querySelector('input[name="cupon-tipo"]:checked').value;
}

function aplicarTipoCupon() {
    const esMonto = tipoCuponElegido() === 'monto';
    document.getElementById('cupon-valor-simbolo').textContent = esMonto ? '$' : '%';
    document.getElementById('cupon-valor-etiqueta').textContent = esMonto ? 'Monto a descontar (MXN)' : 'Porcentaje de descuento';
    document.getElementById('cupon-rapidos').innerHTML = (esMonto ? [50, 100, 150, 200, 300] : [5, 10, 15, 20, 25])
        .map(v => '<button type="button" data-valor="' + v + '">' + (esMonto ? '$' + v : v + '%') + '</button>')
        .join('');
    actualizarVistaPreviaCupon();
}

function actualizarVistaPreviaCupon() {
    const borrador = {
        codigo: normalizarCodigo(document.getElementById('cupon-codigo').value) || 'TUCODIGO',
        tipo: tipoCuponElegido(),
        valor: Number(document.getElementById('cupon-valor').value) || 0,
        productoId: document.getElementById('cupon-producto').value
    };
    const titulo = document.getElementById('cupon-titulo').value.trim() || 'Código de descuento';

    document.getElementById('cupon-vista-previa').innerHTML = '' +
        '<div class="mini-cupon-izq">' + textoDescuentoCupon(borrador) + '</div>' +
        '<div class="mini-cupon-der">' +
        '<small>Así se verá en Promociones</small>' +
        '<strong>' + escaparHTML(titulo) + '</strong>' +
        '<span class="texto-tenue">Aplica en: ' + escaparHTML(alcanceCupon(borrador)) + '</span>' +
        '<code>' + escaparHTML(borrador.codigo) + '</code>' +
        '</div>';
}

function abrirModalCupon(cupon) {
    const modal = document.getElementById('modal-cupon');
    document.getElementById('form-cupon').reset();
    document.getElementById('cupon-id').value = cupon ? cupon.id : '';
    document.getElementById('cupon-titulo-modal').textContent = cupon ? 'Editar código' : 'Nuevo código';
    document.getElementById('btn-guardar-cupon').textContent = cupon ? 'Guardar cambios' : 'Guardar código';

    document.getElementById('cupon-producto').innerHTML =
        '<option value="">🛍️ Toda la tienda</option>' +
        leerProductos().map(p => '<option value="' + escaparHTML(p.id) + '">' + escaparHTML(p.nombre) + '</option>').join('');

    document.getElementById('cupon-codigo').value = cupon ? cupon.codigo : generarCodigoCupon();
    document.getElementById('cupon-titulo').value = cupon ? (cupon.titulo || '') : '';
    document.getElementById('cupon-descripcion').value = cupon ? (cupon.descripcion || '') : '';
    document.querySelector('input[name="cupon-tipo"][value="' + (cupon ? cupon.tipo : 'porcentaje') + '"]').checked = true;
    document.getElementById('cupon-valor').value = cupon ? cupon.valor : '';
    document.getElementById('cupon-producto').value = cupon ? (cupon.productoId || '') : '';
    document.getElementById('cupon-inicio').value = cupon ? (cupon.inicio || '') : fechaHoyISO();
    document.getElementById('cupon-fin').value = cupon ? (cupon.fin || '') : '';
    document.getElementById('cupon-activo').checked = cupon ? cupon.activo : true;

    aplicarTipoCupon();

    modal.classList.add('abierto');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sin-scroll');
    setTimeout(() => document.getElementById('cupon-titulo').focus(), 50);
}

function cerrarModalCupon() {
    const modal = document.getElementById('modal-cupon');
    modal.classList.remove('abierto');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sin-scroll');
}

/* Guarda sin validaciones: los valores se acomodan solos */
function guardarCuponFormulario(e) {
    e.preventDefault();

    const idExistente = document.getElementById('cupon-id').value;
    const cupones = leerCupones();
    const anterior = cupones.find(c => c.id === idExistente);

    // Código: vacío -> se genera; repetido -> se le agrega un número
    const base = normalizarCodigo(document.getElementById('cupon-codigo').value) || generarCodigoCupon();
    let codigo = base;
    let n = 2;
    while (cupones.some(c => c.codigo === codigo && c.id !== idExistente)) {
        codigo = base + n;
        n++;
    }

    const productoId = document.getElementById('cupon-producto').value;
    const producto = productoId ? obtenerProductoPorId(productoId) : null;
    const tipo = tipoCuponElegido();
    let valor = Math.max(0, Number(document.getElementById('cupon-valor').value) || 0);
    if (tipo === 'porcentaje') valor = Math.min(100, valor);
    else if (producto) valor = Math.min(Number(producto.precio) || 0, valor);

    let inicio = document.getElementById('cupon-inicio').value;
    let fin = document.getElementById('cupon-fin').value;
    if (inicio && fin && fin < inicio) [inicio, fin] = [fin, inicio];

    const datos = {
        id: idExistente || 'cupon-' + Date.now(),
        codigo: codigo,
        titulo: document.getElementById('cupon-titulo').value.trim() || (textoDescuentoCupon({ tipo, valor }) + ' de descuento'),
        descripcion: document.getElementById('cupon-descripcion').value.trim(),
        tipo: tipo,
        valor: valor,
        productoId: productoId,
        inicio: inicio,
        fin: fin,
        activo: document.getElementById('cupon-activo').checked,
        usos: anterior ? (anterior.usos || []) : []
    };

    guardarCupones([datos].concat(cupones.filter(c => c.id !== datos.id)));
    cerrarModalCupon();
    renderizarCuponesAdmin();

    kookToast(
        datos.codigo + ' · ' + textoDescuentoCupon(datos) + ' en ' + alcanceCupon(datos) +
        (codigo !== base ? ' (el código ' + base + ' ya existía)' : ''),
        'exito',
        idExistente ? 'Código actualizado' : 'Código creado'
    );
}

/* ---------------------------------------------------------
   EVENTOS
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('btn-nuevo-cupon').addEventListener('click', () => abrirModalCupon(null));
    document.getElementById('buscar-cupon').addEventListener('input', renderizarCuponesAdmin);
    document.getElementById('filtro-estado-cupon').addEventListener('change', renderizarCuponesAdmin);
    document.getElementById('form-cupon').addEventListener('submit', guardarCuponFormulario);

    document.getElementById('tabla-cupones-body').addEventListener('click', function (e) {
        const boton = e.target.closest('[data-accion-cupon]');
        if (!boton) return;
        const id = boton.getAttribute('data-cupon');
        switch (boton.getAttribute('data-accion-cupon')) {
            case 'alternar': alternarCupon(id); break;
            case 'editar': abrirModalCupon(leerCupones().find(c => c.id === id)); break;
            case 'eliminar': confirmarEliminarCupon(id); break;
            case 'canjes':
                if (canjesAbiertos.has(id)) canjesAbiertos.delete(id);
                else canjesAbiertos.add(id);
                renderizarCuponesAdmin();
                break;
        }
    });

    // Vista previa en vivo
    ['cupon-codigo', 'cupon-titulo', 'cupon-valor'].forEach(id =>
        document.getElementById(id).addEventListener('input', actualizarVistaPreviaCupon));
    document.getElementById('cupon-producto').addEventListener('change', actualizarVistaPreviaCupon);
    document.querySelectorAll('input[name="cupon-tipo"]').forEach(r => r.addEventListener('change', aplicarTipoCupon));
    document.getElementById('cupon-rapidos').addEventListener('click', function (e) {
        const boton = e.target.closest('[data-valor]');
        if (!boton) return;
        document.getElementById('cupon-valor').value = boton.getAttribute('data-valor');
        actualizarVistaPreviaCupon();
    });
    document.getElementById('btn-generar-codigo').addEventListener('click', function () {
        document.getElementById('cupon-codigo').value = generarCodigoCupon();
        actualizarVistaPreviaCupon();
    });

    // Cerrar: botones, clic fuera y tecla Esc
    document.querySelectorAll('[data-cerrar-cupon]').forEach(b => b.addEventListener('click', cerrarModalCupon));
    document.getElementById('modal-cupon').addEventListener('click', function (e) {
        if (e.target === this) cerrarModalCupon();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.getElementById('modal-cupon').classList.contains('abierto') &&
            !document.querySelector('.kook-dialogo-fondo')) {
            cerrarModalCupon();
        }
    });

    renderizarCuponesAdmin();
});
