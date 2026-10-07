/* =========================================================
   KOOKSTORE.MX - LÓGICA DEL PANEL ADMINISTRATIVO
   ---------------------------------------------------------
   1. Productos: tabla con desglose de inventario por versión /
      personaje, formulario condicional y eliminación con
      confirmación moderna.
   2. Pedidos: cambio de estado de envío. Si se cancela, el
      cliente ve un aviso de reembolso y el stock se repone.
   3. Clientes: cuentas registradas y su actividad.

   Necesita: notificaciones.js, sesion.js, datos-productos.js,
   carrito.js (en ese orden).
   ========================================================= */

const NOMBRES_CATEGORIA = {
    albumes: 'Álbumes',
    lightsticks: 'Lightsticks',
    peluches: 'Peluches'
};

const STOCK_BAJO = 5;

/* Productos con el desglose abierto (se conserva al redibujar) */
const desglosesAbiertos = new Set();

/* true cuando el usuario escribió el ID a mano (ya no se autogenera) */
let idEditadoManualmente = false;

/* ---------------------------------------------------------
   AYUDAS
   --------------------------------------------------------- */
function formatearPrecioAdmin(precio) {
    return formatearPrecio(Number(precio) || 0);
}

/* Precio de la tabla de productos; si tiene oferta vigente se marca */
function celdaPrecioAdmin(producto) {
    const info = precioProducto(producto);
    if (!info.oferta) return formatearPrecioAdmin(info.original);
    return '<span class="precio-tachado">' + formatearPrecioAdmin(info.original) + '</span>' +
        formatearPrecioAdmin(info.precio) + ' <span class="chip-oferta">-' + info.descuento + '%</span>';
}

/* "Llavero de Colección" -> "llavero-de-coleccion" */
function generarSlug(texto) {
    return texto
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/* Clase de color según la cantidad en stock */
function nivelStock(cantidad) {
    if (cantidad <= 0) return 'agotado';
    if (cantidad <= STOCK_BAJO) return 'bajo';
    return 'alto';
}

function tarjetaKpi(icono, etiqueta, valor, detalle, tono) {
    return '' +
        '<article class="kpi-card kpi-' + tono + '">' +
        '<span class="kpi-icono">' + icono + '</span>' +
        '<div>' +
        '<span class="kpi-etiqueta">' + etiqueta + '</span>' +
        '<strong class="kpi-valor">' + valor + '</strong>' +
        (detalle ? '<span class="kpi-detalle">' + detalle + '</span>' : '') +
        '</div>' +
        '</article>';
}

/* ---------------------------------------------------------
   INICIO
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    // La sesión vive en sessionStorage (esAdmin() de sesion.js)
    if (!esAdmin()) {
        document.getElementById('aviso-sesion').hidden = false;
    }

    inicializarNavegacionAdmin();
    inicializarEventosProductos();
    inicializarFormularioProducto();
    inicializarEventosPedidos();

    renderizarTodo();

    document.getElementById('btn-salir-admin').addEventListener('click', function () {
        kookConfirmar({
            tipo: 'aviso',
            titulo: '¿Cerrar sesión?',
            texto: 'Saldrás del panel de administración en esta pestaña.',
            textoConfirmar: 'Cerrar sesión'
        }).then(function (acepto) {
            if (!acepto) return;
            cerrarSesion();
            location.href = '../index.html';
        });
    });

    // Si un cliente compra en otra pestaña, el panel se actualiza solo
    window.addEventListener('storage', function (e) {
        if (!e.key) return;
        if (e.key === 'kookstore_productos' || e.key.startsWith('kookstore_pedidos_') || e.key === 'kookstore_usuarios' || e.key === CLAVE_OFERTAS) {
            renderizarTodo();
        }
    });
});

function renderizarTodo() {
    renderizarProductosAdmin();
    renderizarPedidosAdmin();
    renderizarClientesAdmin();
    if (typeof renderizarOfertasAdmin === 'function') renderizarOfertasAdmin();
}

/* ---------------------------------------------------------
   NAVEGACIÓN ENTRE PESTAÑAS DEL ADMIN
   --------------------------------------------------------- */
function mostrarSeccion(objetivo) {
    document.querySelectorAll('.nav-tab').forEach(t => {
        t.classList.toggle('activo', t.getAttribute('href') === '#' + objetivo);
    });
    document.querySelectorAll('.admin-seccion').forEach(sec => {
        const activa = sec.id === 'seccion-' + objetivo;
        sec.hidden = !activa;
        sec.classList.toggle('activa', activa);
    });
}

function inicializarNavegacionAdmin() {
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function (e) {
            e.preventDefault();
            const objetivo = this.getAttribute('href').replace('#', '');
            history.replaceState(null, '', '#' + objetivo);
            mostrarSeccion(objetivo);
        });
    });

    const inicial = location.hash.replace('#', '');
    if (['productos', 'pedidos', 'clientes', 'ofertas'].includes(inicial)) {
        mostrarSeccion(inicial);
    }
}

/* =========================================================
   1. GESTIÓN DE PRODUCTOS
   ========================================================= */

function renderizarKpisProductos(productos) {
    const unidades = productos.reduce((suma, p) => suma + p.stock, 0);
    const agotados = productos.filter(p => p.stock <= 0).length;
    // Stock bajo: el total del producto o alguna de sus versiones tiene 5 o menos
    const bajos = productos.filter(p => p.stock > 0 &&
        (p.stock <= STOCK_BAJO || p.variantes.some(v => Number(v.stock) <= STOCK_BAJO))).length;
    const conVariantes = productos.filter(p => p.tieneVariantes).length;

    document.getElementById('kpis-productos').innerHTML =
        tarjetaKpi('📦', 'Productos', productos.length, 'en el catálogo', 'rosa') +
        tarjetaKpi('🧮', 'Unidades en stock', unidades.toLocaleString('es-MX'), 'sumando todas las versiones', 'morado') +
        tarjetaKpi('🎭', 'Con versiones', conVariantes, 'productos con personajes', 'azul') +
        tarjetaKpi('⚠️', 'Requieren atención', bajos + agotados, bajos + ' con stock bajo · ' + agotados + ' agotados', 'ambar');

    document.getElementById('contador-nav-productos').textContent = productos.length;
}

/* Fila de detalle con el stock de cada versión / personaje */
function construirDesglose(p) {
    const maximo = Math.max(1, ...p.variantes.map(v => Number(v.stock)));
    const tipo = (p.tituloVariante || '').toLowerCase().includes('personaje') ? 'Personaje' : 'Versión';

    let tarjetas = '';
    p.variantes.forEach(function (v, i) {
        const nivel = nivelStock(Number(v.stock));
        const porcentaje = Math.round((Number(v.stock) / maximo) * 100);
        tarjetas += '' +
            '<div class="variante-card nivel-' + nivel + '">' +
            '<div class="variante-card-top">' +
            '<span class="variante-card-nombre">' + escaparHTML(v.nombre) + '</span>' +
            '<button type="button" class="btn-mini-eliminar" data-accion="eliminar-variante" data-id="' + escaparHTML(p.id) + '" data-indice="' + i + '" title="Eliminar ' + tipo.toLowerCase() + '" aria-label="Eliminar ' + escaparHTML(v.nombre) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
            '</button>' +
            '</div>' +
            '<div class="variante-card-stock"><strong>' + v.stock + '</strong> unids' +
            (nivel === 'agotado' ? ' <em>Agotado</em>' : (nivel === 'bajo' ? ' <em>Bajo</em>' : '')) + '</div>' +
            '<div class="variante-barra"><span style="width: ' + porcentaje + '%"></span></div>' +
            '</div>';
    });

    const resumen = p.variantes.map(v => escaparHTML(v.nombre) + ': ' + v.stock + ' unids').join(' · ');

    return '' +
        '<tr class="fila-desglose" data-desglose="' + escaparHTML(p.id) + '">' +
        '<td colspan="6">' +
        '<div class="desglose-contenido">' +
        '<div class="desglose-titulo">' +
        '<span><strong>' + escaparHTML(p.nombre) + '</strong> · Stock total: <strong>' + p.stock + '</strong> → Desglose por ' + tipo.toLowerCase() + ' (' + p.variantes.length + ')</span>' +
        '<button type="button" class="btn-texto" data-accion="editar" data-id="' + escaparHTML(p.id) + '">Editar inventario</button>' +
        '</div>' +
        '<div class="desglose-grid">' + tarjetas + '</div>' +
        '<p class="desglose-resumen">' + resumen + '</p>' +
        '</div>' +
        '</td>' +
        '</tr>';
}

function renderizarProductosAdmin() {
    const tbody = document.getElementById('tabla-productos-body');
    const todos = leerProductos();
    renderizarKpisProductos(todos);

    // Filtros de la barra de herramientas
    const texto = document.getElementById('buscar-producto').value.toLowerCase().trim();
    const categoria = document.getElementById('filtro-categoria').value;
    const filtroStock = document.getElementById('filtro-stock').value;

    const productos = todos.filter(function (p) {
        const coincideTexto = !texto ||
            p.nombre.toLowerCase().includes(texto) ||
            (p.grupo || '').toLowerCase().includes(texto) ||
            p.id.toLowerCase().includes(texto);
        const coincideCategoria = categoria === 'todos' || p.categoria === categoria;
        let coincideStock = true;
        if (filtroStock === 'variantes') coincideStock = p.tieneVariantes;
        if (filtroStock === 'bajo') coincideStock = p.stock > 0 &&
            (p.stock <= STOCK_BAJO || p.variantes.some(v => Number(v.stock) <= STOCK_BAJO));
        if (filtroStock === 'agotado') coincideStock = p.stock <= 0;
        return coincideTexto && coincideCategoria && coincideStock;
    });

    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="tabla-vacia">' +
            (todos.length === 0 ? 'No hay productos registrados. Crea el primero con “Nuevo producto”.' : 'Ningún producto coincide con los filtros.') +
            '</td></tr>';
        return;
    }

    let html = '';
    productos.forEach(p => {
        const nivel = nivelStock(p.stock);
        const abierto = desglosesAbiertos.has(p.id);
        const idSeguro = escaparHTML(p.id);

        const inventario = p.tieneVariantes
            ? '<div class="celda-inventario">' +
              '<span class="badge-stock ' + nivel + '">' + p.stock + ' unids</span>' +
              '<button type="button" class="btn-desglose' + (abierto ? ' abierto' : '') + '" data-accion="desglose" data-id="' + idSeguro + '" aria-expanded="' + abierto + '">' +
              p.variantes.length + ' ' + ((p.tituloVariante || '').toLowerCase().includes('personaje') ? 'personajes' : 'versiones') +
              ' <span class="flecha">▾</span></button>' +
              '</div>'
            : '<div class="celda-inventario"><span class="badge-stock ' + nivel + '">' + p.stock + ' unids</span><span class="texto-tenue">Stock general</span></div>';

        html += '' +
            '<tr class="fila-producto' + (abierto ? ' con-desglose' : '') + '">' +
            '<td>' +
            '<div class="celda-producto">' +
            '<img src="' + resolverImagen(p.imagen) + '" alt="" onerror="this.onerror=null; this.src=\'../assets/img/logo.png\'">' +
            '<div><strong>' + escaparHTML(p.nombre) + '</strong><span class="texto-tenue">' + idSeguro + '</span></div>' +
            '</div>' +
            '</td>' +
            '<td>' + escaparHTML(p.grupo || '—') + '</td>' +
            '<td><span class="chip-categoria cat-' + escaparHTML(p.categoria) + '">' + (NOMBRES_CATEGORIA[p.categoria] || escaparHTML(p.categoria)) + '</span></td>' +
            '<td class="celda-precio">' + celdaPrecioAdmin(p) + '</td>' +
            '<td>' + inventario + '</td>' +
            '<td class="col-acciones">' +
            '<button type="button" class="btn-icono editar" data-accion="editar" data-id="' + idSeguro + '" title="Editar" aria-label="Editar ' + escaparHTML(p.nombre) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>' +
            '</button>' +
            '<button type="button" class="btn-icono eliminar" data-accion="eliminar" data-id="' + idSeguro + '" title="Eliminar" aria-label="Eliminar ' + escaparHTML(p.nombre) + '">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>' +
            '</button>' +
            '</td>' +
            '</tr>' +
            (p.tieneVariantes && abierto ? construirDesglose(p) : '');
    });
    tbody.innerHTML = html;
}

/* Un solo listener para todos los botones de la tabla (delegación) */
function inicializarEventosProductos() {
    document.getElementById('tabla-productos-body').addEventListener('click', function (e) {
        const boton = e.target.closest('[data-accion]');
        if (!boton) return;
        const id = boton.getAttribute('data-id');

        switch (boton.getAttribute('data-accion')) {
            case 'desglose':
                if (desglosesAbiertos.has(id)) desglosesAbiertos.delete(id);
                else desglosesAbiertos.add(id);
                renderizarProductosAdmin();
                break;
            case 'editar':
                prepararEdicionProducto(id);
                break;
            case 'eliminar':
                confirmarEliminarProducto(id);
                break;
            case 'eliminar-variante':
                confirmarEliminarVarianteInventario(id, Number(boton.getAttribute('data-indice')));
                break;
        }
    });

    document.getElementById('btn-nuevo-producto').addEventListener('click', abrirModalProducto);
    document.getElementById('buscar-producto').addEventListener('input', renderizarProductosAdmin);
    document.getElementById('filtro-categoria').addEventListener('change', renderizarProductosAdmin);
    document.getElementById('filtro-stock').addEventListener('change', renderizarProductosAdmin);
}

function confirmarEliminarProducto(id) {
    const p = obtenerProductoPorId(id);
    if (!p) return;

    kookConfirmar({
        tipo: 'peligro',
        titulo: '¿Eliminar este producto?',
        texto: 'Se quitará del catálogo de forma permanente' + (p.tieneVariantes ? ', junto con sus ' + p.variantes.length + ' versiones/personajes.' : '.'),
        detalle: p.nombre + ' · ' + p.stock + ' unidades en stock',
        textoConfirmar: 'Sí, eliminar',
        textoCancelar: 'Cancelar'
    }).then(function (acepto) {
        if (!acepto) return;
        eliminarProductoBD(id);
        desglosesAbiertos.delete(id);
        renderizarProductosAdmin();
        kookToast('"' + p.nombre + '" se eliminó del inventario', 'exito', 'Producto eliminado');
    });
}

/* Eliminar una versión / personaje directamente desde el desglose */
function confirmarEliminarVarianteInventario(id, indice) {
    const p = obtenerProductoPorId(id);
    if (!p || !p.variantes[indice]) return;
    const variante = p.variantes[indice];
    const esUltima = p.variantes.length === 1;

    kookConfirmar({
        tipo: 'peligro',
        titulo: '¿Eliminar "' + variante.nombre + '"?',
        texto: esUltima
            ? 'Es la única versión de este producto. Quedará como producto sin versiones y con stock 0.'
            : 'Se quitará esta versión del producto y su stock dejará de contarse.',
        detalle: p.nombre + ' → ' + variante.nombre + ': ' + variante.stock + ' unids',
        textoConfirmar: 'Sí, eliminar',
        textoCancelar: 'Cancelar'
    }).then(function (acepto) {
        if (!acepto) return;
        p.variantes.splice(indice, 1);
        if (p.variantes.length === 0) {
            p.stock = 0;
            desglosesAbiertos.delete(id);
        }
        editarProductoBD(id, p);
        renderizarProductosAdmin();
        kookToast(variante.nombre + ' se eliminó de ' + p.nombre, 'exito', 'Versión eliminada');
    });
}

/* ---------------------------------------------------------
   FORMULARIO DE PRODUCTO (con versiones / personajes)
   --------------------------------------------------------- */
function inicializarFormularioProducto() {
    const form = document.getElementById('form-producto');
    form.addEventListener('submit', guardarProductoFormulario);

    document.querySelectorAll('[data-cerrar-modal]').forEach(b => b.addEventListener('click', cerrarModalProducto));

    // Clic fuera de la tarjeta o tecla Esc cierran el modal
    document.getElementById('modal-producto').addEventListener('click', function (e) {
        if (e.target === this) cerrarModalProducto();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && document.getElementById('modal-producto').classList.contains('abierto') &&
            !document.querySelector('.kook-dialogo-fondo')) {
            cerrarModalProducto();
        }
    });

    // El ID se genera a partir del nombre mientras no se escriba a mano
    document.getElementById('prod-nombre').addEventListener('input', function () {
        const campoId = document.getElementById('prod-id');
        if (!campoId.disabled && !idEditadoManualmente) {
            campoId.value = generarSlug(this.value);
        }
    });
    document.getElementById('prod-id').addEventListener('input', function () {
        idEditadoManualmente = this.value.trim() !== '';
    });

    // ¿Cuenta con versiones/personajes? Sí / No
    document.querySelectorAll('input[name="tiene-variantes"]').forEach(function (radio) {
        radio.addEventListener('change', alCambiarTieneVariantes);
    });

    document.getElementById('btn-agregar-variante').addEventListener('click', function () {
        agregarFilaVariante('', '');
        const filas = document.querySelectorAll('.fila-variante');
        filas[filas.length - 1].querySelector('.variante-input-nombre').focus();
    });

    // Delegación: eliminar fila y recalcular total
    const lista = document.getElementById('lista-variantes');
    lista.addEventListener('click', function (e) {
        const boton = e.target.closest('.btn-quitar-variante');
        if (boton) quitarFilaVariante(boton.closest('.fila-variante'));
    });
    lista.addEventListener('input', actualizarTotalVariantes);

    // Imagen: clic, cambio de archivo y arrastrar/soltar
    const inputArchivo = document.getElementById('prod-imagen-file');
    const zona = document.getElementById('zona-imagen');
    inputArchivo.addEventListener('change', function () {
        if (this.files[0]) cargarImagen(this.files[0]);
    });
    ['dragenter', 'dragover'].forEach(ev => zona.addEventListener(ev, function (e) {
        e.preventDefault();
        zona.classList.add('arrastrando');
    }));
    ['dragleave', 'drop'].forEach(ev => zona.addEventListener(ev, function (e) {
        e.preventDefault();
        zona.classList.remove('arrastrando');
    }));
    zona.addEventListener('drop', function (e) {
        const archivo = e.dataTransfer.files[0];
        if (archivo && archivo.type.startsWith('image/')) cargarImagen(archivo);
    });
}

/* Reduce la foto a máx. 700 px para no llenar el localStorage */
function cargarImagen(archivo) {
    const lector = new FileReader();
    lector.onload = function (evento) {
        const img = new Image();
        img.onload = function () {
            const escala = Math.min(1, 700 / Math.max(img.width, img.height));
            const lienzo = document.createElement('canvas');
            lienzo.width = Math.round(img.width * escala);
            lienzo.height = Math.round(img.height * escala);
            lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height);
            mostrarVistaPrevia(lienzo.toDataURL('image/jpeg', 0.85));
        };
        img.src = evento.target.result;
    };
    lector.readAsDataURL(archivo);
}

function mostrarVistaPrevia(ruta) {
    const preview = document.getElementById('preview-imagen-prod');
    const texto = document.getElementById('zona-imagen-texto');
    const zona = document.getElementById('zona-imagen');
    document.getElementById('prod-imagen').value = ruta || '';

    if (ruta) {
        preview.src = resolverImagen(ruta);
        preview.hidden = false;
        texto.classList.add('sobre-imagen');
        texto.querySelector('strong').textContent = 'Cambiar foto';
    } else {
        preview.hidden = true;
        preview.removeAttribute('src');
        texto.classList.remove('sobre-imagen');
        texto.querySelector('strong').textContent = 'Haz clic o arrastra una foto aquí';
    }
}

/* Muestra el panel de stock general o el de versiones */
function aplicarModoVariantes(conVariantes) {
    document.querySelector('input[name="tiene-variantes"][value="' + (conVariantes ? 'si' : 'no') + '"]').checked = true;
    document.getElementById('panel-stock-general').hidden = conVariantes;
    document.getElementById('panel-variantes').hidden = !conVariantes;
}

function alCambiarTieneVariantes() {
    const conVariantes = this.value === 'si';

    if (conVariantes) {
        aplicarModoVariantes(true);
        if (document.querySelectorAll('.fila-variante').length === 0) {
            agregarFilaVariante('', '');
            agregarFilaVariante('', '');
        }
        actualizarTotalVariantes();
        return;
    }

    // Pasar a "No": si ya hay versiones capturadas se pide confirmación
    const capturadas = Array.from(document.querySelectorAll('.variante-input-nombre')).filter(i => i.value.trim()).length;
    if (capturadas === 0) {
        document.getElementById('lista-variantes').innerHTML = '';
        aplicarModoVariantes(false);
        return;
    }

    aplicarModoVariantes(true); // se mantiene mientras el usuario decide
    kookConfirmar({
        tipo: 'aviso',
        titulo: '¿Quitar las versiones?',
        texto: 'Se descartarán las ' + capturadas + ' versiones/personajes capturados y el producto usará un stock general.',
        textoConfirmar: 'Sí, usar stock general',
        textoCancelar: 'Conservar versiones'
    }).then(function (acepto) {
        if (!acepto) return;
        const total = sumarFilasVariantes();
        document.getElementById('lista-variantes').innerHTML = '';
        document.getElementById('prod-stock').value = total;
        aplicarModoVariantes(false);
    });
}

/* Agrega una fila de versión / personaje al formulario */
function agregarFilaVariante(nombre, stock) {
    const lista = document.getElementById('lista-variantes');
    const fila = document.createElement('div');
    fila.className = 'fila-variante';
    fila.innerHTML =
        '<span class="fila-variante-numero"></span>' +
        '<input type="text" class="variante-input-nombre" placeholder="ej. Personaje A" aria-label="Nombre de la versión o personaje" value="' + escaparHTML(nombre) + '">' +
        '<input type="number" class="variante-input-stock" min="0" step="1" placeholder="0" aria-label="Stock de esta versión" value="' + escaparHTML(stock) + '">' +
        '<button type="button" class="btn-quitar-variante" title="Eliminar versión" aria-label="Eliminar versión">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>' +
        '</button>';
    lista.appendChild(fila);
    renumerarFilasVariantes();
    actualizarTotalVariantes();
}

/* Quita una fila; si ya tenía nombre, pide confirmación */
function quitarFilaVariante(fila) {
    const nombre = fila.querySelector('.variante-input-nombre').value.trim();

    function quitar() {
        fila.classList.add('saliendo');
        setTimeout(function () {
            fila.remove();
            renumerarFilasVariantes();
            actualizarTotalVariantes();
        }, 180);
    }

    if (!nombre) {
        quitar();
        return;
    }

    kookConfirmar({
        tipo: 'peligro',
        titulo: '¿Eliminar "' + nombre + '"?',
        texto: 'Esta versión/personaje se quitará del producto al guardar.',
        detalle: 'Stock capturado: ' + (Number(fila.querySelector('.variante-input-stock').value) || 0) + ' unids',
        textoConfirmar: 'Sí, eliminar',
        textoCancelar: 'Cancelar'
    }).then(function (acepto) {
        if (acepto) quitar();
    });
}

function renumerarFilasVariantes() {
    document.querySelectorAll('.fila-variante').forEach(function (fila, i) {
        fila.querySelector('.fila-variante-numero').textContent = i + 1;
    });
}

function sumarFilasVariantes() {
    return Array.from(document.querySelectorAll('.variante-input-stock'))
        .reduce((suma, input) => suma + (Math.max(0, Number(input.value)) || 0), 0);
}

function actualizarTotalVariantes() {
    const filas = document.querySelectorAll('.fila-variante').length;
    document.getElementById('variantes-total').innerHTML =
        'Stock total: <strong>' + sumarFilasVariantes() + '</strong> unids en ' + filas + (filas === 1 ? ' versión' : ' versiones');
}

/* Deja el formulario limpio */
function limpiarFormulario() {
    document.getElementById('form-producto').reset();
    document.getElementById('prod-id-original').value = '';
    document.getElementById('prod-id').disabled = false;
    document.getElementById('lista-variantes').innerHTML = '';
    idEditadoManualmente = false;
    mostrarVistaPrevia('');
    aplicarModoVariantes(false);
    actualizarTotalVariantes();
}

function abrirModal() {
    const modal = document.getElementById('modal-producto');
    modal.classList.add('abierto');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('sin-scroll');
    setTimeout(() => document.getElementById('prod-nombre').focus(), 50);
}

function abrirModalProducto() {
    limpiarFormulario();
    document.getElementById('modal-titulo').textContent = 'Agregar nuevo producto';
    document.getElementById('btn-guardar-producto').textContent = 'Guardar producto';
    abrirModal();
}

function cerrarModalProducto() {
    const modal = document.getElementById('modal-producto');
    modal.classList.remove('abierto');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('sin-scroll');
}

function prepararEdicionProducto(id) {
    const p = obtenerProductoPorId(id);
    if (!p) return;

    limpiarFormulario();
    document.getElementById('modal-titulo').textContent = 'Editar producto';
    document.getElementById('btn-guardar-producto').textContent = 'Guardar cambios';
    document.getElementById('prod-id-original').value = p.id;
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-id').disabled = true;
    document.getElementById('prod-nombre').value = p.nombre;
    document.getElementById('prod-grupo').value = p.grupo || '';
    document.getElementById('prod-categoria').value = p.categoria;
    document.getElementById('prod-precio').value = p.precio;
    document.getElementById('prod-etiqueta').value = p.etiqueta || '';
    document.getElementById('prod-descripcion').value = p.descripcion || '';
    mostrarVistaPrevia(p.imagen || '');

    if (p.tieneVariantes) {
        aplicarModoVariantes(true);
        document.getElementById('prod-tipo-variante').value =
            (p.tituloVariante || '').toLowerCase().includes('personaje') ? 'Selecciona el Personaje:' : 'Selecciona la Versión:';
        p.variantes.forEach(v => agregarFilaVariante(v.nombre, v.stock));
    } else {
        document.getElementById('prod-stock').value = p.stock;
    }

    abrirModal();
}

/* Número entero de 0 o más; lo vacío o inválido cuenta como 0 */
function aEntero(valor) {
    return Math.max(0, Math.floor(Number(valor)) || 0);
}

/* Lee las versiones del formulario (sin validar).
   Una fila sin nombre recibe "Versión N" para que se pueda elegir. */
function leerVariantesFormulario() {
    return Array.from(document.querySelectorAll('.fila-variante')).map(function (fila, i) {
        return {
            nombre: fila.querySelector('.variante-input-nombre').value.trim() || 'Versión ' + (i + 1),
            stock: aEntero(fila.querySelector('.variante-input-stock').value)
        };
    });
}

/* Si el ID ya existe al crear, se le agrega -2, -3... en lugar de marcar error */
function idDisponible(base) {
    let id = base;
    let n = 2;
    while (obtenerProductoPorId(id)) {
        id = base + '-' + n;
        n++;
    }
    return id;
}

/* Guarda el producto SIN validaciones: los campos vacíos toman un valor por defecto */
function guardarProductoFormulario(e) {
    e.preventDefault();

    const idOriginal = document.getElementById('prod-id-original').value;
    const nombre = document.getElementById('prod-nombre').value.trim() || 'Producto sin nombre';
    const idEscrito = document.getElementById('prod-id').value.trim() || generarSlug(nombre) || 'producto-' + Date.now();
    const id = idOriginal ? idOriginal : idDisponible(idEscrito);
    const precio = Math.max(0, Number(document.getElementById('prod-precio').value) || 0);
    const imagen = document.getElementById('prod-imagen').value.trim();   // vacía = se muestra el logo

    // Con "Sí" pero sin filas, el producto se guarda como stock general
    let variantes = document.querySelector('input[name="tiene-variantes"]:checked').value === 'si'
        ? leerVariantesFormulario()
        : [];
    const conVariantes = variantes.length > 0;
    const stock = conVariantes ? sumarStockVariantes(variantes) : aEntero(document.getElementById('prod-stock').value);

    const productoObjeto = {
        id: id,
        nombre: nombre,
        grupo: document.getElementById('prod-grupo').value.trim(),
        precio: precio,
        imagen: imagen,
        categoria: document.getElementById('prod-categoria').value,
        etiqueta: document.getElementById('prod-etiqueta').value.trim() || 'PRODUCTO OFICIAL',
        descripcion: document.getElementById('prod-descripcion').value.trim(),
        tieneVariantes: conVariantes,
        tituloVariante: conVariantes ? document.getElementById('prod-tipo-variante').value : undefined,
        variantes: variantes,
        stock: stock
    };

    try {
        if (idOriginal) {
            editarProductoBD(idOriginal, productoObjeto);
        } else {
            agregarProductoBD(productoObjeto);
        }
    } catch (err) {
        // localStorage lleno (normalmente por imágenes muy pesadas)
        kookToast('No hay espacio para guardar. Usa una imagen más ligera.', 'error', 'No se pudo guardar');
        return;
    }

    if (conVariantes) desglosesAbiertos.add(id);
    cerrarModalProducto();
    renderizarProductosAdmin();

    kookToast(
        nombre + (conVariantes ? ' · ' + variantes.length + ' versiones, ' + stock + ' unids' : ' · ' + stock + ' unids'),
        'exito',
        idOriginal ? 'Producto actualizado' : 'Producto agregado'
    );
}

/* =========================================================
   2. GESTIÓN DE PEDIDOS GLOBALES (SINCRONIZADO)
   ========================================================= */
function obtenerTodosLosPedidosGlobales() {
    const pedidosGlobales = [];
    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        if (clave && clave.startsWith('kookstore_pedidos_')) {
            const emailCliente = clave.replace('kookstore_pedidos_', '');
            try {
                const pedidosUsuario = JSON.parse(localStorage.getItem(clave)) || [];
                pedidosUsuario.forEach(pedido => {
                    pedidosGlobales.push(Object.assign({}, pedido, { emailCliente: emailCliente }));
                });
            } catch (err) {
                console.error('Error leyendo pedidos de ' + clave, err);
            }
        }
    }
    return pedidosGlobales;
}

function renderizarKpisPedidos(pedidos) {
    const activos = pedidos.filter(p => !esPedidoCancelado(p));
    const ingresos = activos.reduce((suma, p) => suma + Number(p.total || 0), 0);
    const pendientes = activos.filter(p => normalizarEstado(p.estado) !== 'Entregado').length;
    const cancelados = pedidos.length - activos.length;

    document.getElementById('kpis-pedidos').innerHTML =
        tarjetaKpi('🧾', 'Pedidos', pedidos.length, 'registrados en la tienda', 'rosa') +
        tarjetaKpi('💰', 'Ingresos', formatearPrecioAdmin(ingresos), 'sin contar cancelados', 'verde') +
        tarjetaKpi('🚚', 'Por entregar', pendientes, 'pagados, en preparación o en camino', 'azul') +
        tarjetaKpi('↩️', 'Cancelados', cancelados, 'con reembolso al cliente', 'rojo');

    document.getElementById('contador-nav-pedidos').textContent = pedidos.length;
}

function renderizarPedidosAdmin() {
    const tbody = document.getElementById('tabla-pedidos-body');
    const todos = obtenerTodosLosPedidosGlobales();
    renderizarKpisPedidos(todos);

    const texto = document.getElementById('buscar-pedido').value.toLowerCase().trim();
    const filtroEstado = document.getElementById('filtro-estado').value;

    const pedidos = todos.filter(p =>
        (!texto || p.folio.toLowerCase().includes(texto) || p.emailCliente.toLowerCase().includes(texto)) &&
        (filtroEstado === 'todos' || normalizarEstado(p.estado) === filtroEstado)
    );

    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="tabla-vacia">' +
            (todos.length === 0 ? 'Aún no hay pedidos en la tienda.' : 'Ningún pedido coincide con los filtros.') + '</td></tr>';
        return;
    }

    let html = '';
    pedidos.forEach(p => {
        const estado = normalizarEstado(p.estado);
        const opciones = ESTADOS_PEDIDO.map(est =>
            '<option value="' + est + '"' + (est === estado ? ' selected' : '') + '>' + (est === 'Cancelado' ? 'Pedido cancelado' : est) + '</option>'
        ).join('');

        const articulos = (p.articulos && p.articulos.length)
            ? p.articulos.map(a => '<li>' + a.cantidad + '× ' + escaparHTML(a.nombre) + (a.opcion ? ' <span class="texto-tenue">(' + escaparHTML(a.opcion) + ')</span>' : '') + '</li>').join('')
            : '<li>' + escaparHTML(p.resumen || '') + '</li>';

        html += '' +
            '<tr>' +
            '<td><strong>' + escaparHTML(p.folio) + '</strong></td>' +
            '<td>' + escaparHTML(p.emailCliente) + '</td>' +
            '<td>' + escaparHTML(p.fecha) + '<br><span class="texto-tenue">' + escaparHTML(p.hora || '') + '</span></td>' +
            '<td><ul class="lista-articulos">' + articulos + '</ul></td>' +
            '<td class="celda-precio">' + formatearPrecioAdmin(p.total) +
            (p.envio ? '<br><span class="texto-tenue">' + escaparHTML(p.envio.nombre) + '</span>' : '') + '</td>' +
            '<td>' +
            '<select class="select-estado estado-' + claseEstado(estado) + '" data-email="' + escaparHTML(p.emailCliente) + '" data-folio="' + escaparHTML(p.folio) + '" data-anterior="' + estado + '" aria-label="Estado del pedido ' + escaparHTML(p.folio) + '">' +
            opciones +
            '</select>' +
            '</td>' +
            '</tr>';
    });
    tbody.innerHTML = html;
}

function inicializarEventosPedidos() {
    document.getElementById('tabla-pedidos-body').addEventListener('change', function (e) {
        const select = e.target.closest('.select-estado');
        if (!select) return;
        solicitarCambioEstado(select);
    });
    document.getElementById('buscar-pedido').addEventListener('input', renderizarPedidosAdmin);
    document.getElementById('filtro-estado').addEventListener('change', renderizarPedidosAdmin);
}

/* Cancelar pide confirmación porque avisa al cliente y repone stock */
function solicitarCambioEstado(select) {
    const email = select.getAttribute('data-email');
    const folio = select.getAttribute('data-folio');
    const anterior = select.getAttribute('data-anterior');
    const nuevo = select.value;

    if (nuevo !== 'Cancelado') {
        cambiarEstadoPedido(email, folio, nuevo);
        return;
    }

    const pedido = obtenerTodosLosPedidosGlobales().find(p => p.folio === folio && p.emailCliente === email);

    kookConfirmar({
        tipo: 'peligro',
        titulo: '¿Cancelar el pedido ' + folio + '?',
        texto: 'El cliente verá un aviso de que su pedido fue cancelado y de que se procederá con el reembolso. Las piezas regresarán al inventario.',
        detalle: 'Reembolso: ' + formatearPrecioAdmin(pedido ? pedido.total : 0) + ' · ' + email,
        textoConfirmar: 'Sí, cancelar pedido',
        textoCancelar: 'No, mantener'
    }).then(function (acepto) {
        if (acepto) {
            cambiarEstadoPedido(email, folio, nuevo);
        } else {
            select.value = anterior; // se regresa al estado que tenía
        }
    });
}

function cambiarEstadoPedido(emailCliente, folio, nuevoEstado) {
    const clave = 'kookstore_pedidos_' + emailCliente;
    const datos = localStorage.getItem(clave);
    if (!datos) return;

    const pedidos = JSON.parse(datos);
    const pedido = pedidos.find(p => p.folio === folio);
    if (!pedido) return;

    const estabaCancelado = esPedidoCancelado(pedido);
    pedido.estado = nuevoEstado;
    const quedaCancelado = esPedidoCancelado(pedido);
    localStorage.setItem(clave, JSON.stringify(pedidos));

    // Inventario: al cancelar se reponen las piezas; si se reactiva, se vuelven a descontar
    if (!estabaCancelado && quedaCancelado) ajustarStock(pedido.articulos, +1);
    if (estabaCancelado && !quedaCancelado) ajustarStock(pedido.articulos, -1);

    renderizarTodo();

    if (quedaCancelado) {
        kookToast('Se notificó al cliente el reembolso de ' + formatearPrecioAdmin(pedido.total), 'aviso', 'Pedido ' + folio + ' cancelado');
    } else {
        kookToast('El pedido ' + folio + ' ahora está: ' + nuevoEstado, 'exito', 'Estado actualizado');
    }
}

/* =========================================================
   3. CLIENTES REGISTRADOS
   ========================================================= */
function renderizarClientesAdmin() {
    const tbody = document.getElementById('tabla-clientes-body');
    const usuarios = leerUsuarios();
    const pedidos = obtenerTodosLosPedidosGlobales();
    document.getElementById('contador-nav-clientes').textContent = usuarios.length;

    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="tabla-vacia">No hay clientes registrados.</td></tr>';
        return;
    }

    let html = '';
    usuarios.forEach(u => {
        const suyos = pedidos.filter(p => p.emailCliente === u.email);
        const gastado = suyos.filter(p => !esPedidoCancelado(p)).reduce((s, p) => s + Number(p.total || 0), 0);
        const direccion = escaparHTML(u.direccion || 'Sin dirección registrada').split('\n').join('<br>');

        html += '' +
            '<tr>' +
            '<td>' +
            '<div class="celda-cliente">' +
            '<span class="avatar-cliente">' + escaparHTML(u.avatar || 'KS') + '</span>' +
            '<div><strong>' + escaparHTML(u.nombre) + '</strong><span class="texto-tenue">' + escaparHTML(u.email) + '</span></div>' +
            '</div>' +
            '</td>' +
            '<td>' + escaparHTML(u.miembroDesde || '—') + '</td>' +
            '<td class="celda-direccion">' + direccion + '</td>' +
            '<td><span class="chip-numero">' + suyos.length + '</span></td>' +
            '<td class="celda-precio">' + formatearPrecioAdmin(gastado) + '</td>' +
            '<td>' + (u.ultimoAcceso ? escaparHTML(u.ultimoAcceso) : '<span class="texto-tenue">Sin registro</span>') + '</td>' +
            '</tr>';
    });
    tbody.innerHTML = html;
}
