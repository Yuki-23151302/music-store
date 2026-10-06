/* =========================================================
   KOOKSTORE.MX - PÁGINA DE INICIO
   ---------------------------------------------------------
   - Carrusel de productos destacados (datos reales del
     catálogo, así respeta precios y stock del Admin).
   - Cinta animada con los grupos disponibles.
   - Cifras del encabezado (productos y grupos).

   Necesita: datos-productos.js, sesion.js, carrito.js y ui.js
   ========================================================= */

/* Productos que se muestran como destacados, en este orden.
   Si alguno se elimina desde el Admin simplemente se omite. */
const IDS_DESTACADOS = [
    'album-love-yourself',
    'lightstick-hammer-bong',
    'in-life',
    'bt21-rainbow',
    'lightstick-candy-bong',
    'skzoo-mini',
    'newjeans-bunnies',
    'lightstick-nachim-bong',
    'peluches-blackpink'
];

function obtenerDestacados() {
    const productos = leerProductos();
    let lista = IDS_DESTACADOS
        .map(id => productos.find(p => p.id === id))
        .filter(p => p && p.stock > 0);

    // Respaldo: si quedan pocos, se completa con otros productos con stock
    if (lista.length < 4) {
        productos.forEach(p => {
            if (lista.length < 8 && p.stock > 0 && !lista.includes(p)) lista.push(p);
        });
    }
    return lista;
}

function pintarCarruselDestacados() {
    const pista = document.getElementById('pista-destacados');
    if (!pista) return;

    pista.innerHTML = obtenerDestacados().map(function (p) {
        let insignia = '<span class="slide-insignia">★ Destacado</span>';
        if (p.stock <= 5) insignia = '<span class="slide-insignia poco">¡Últimas piezas!</span>';
        else if (p.tieneVariantes) insignia = '<span class="slide-insignia">' + p.variantes.length + ' opciones</span>';

        return '' +
            '<a class="slide-producto" href="pages/productos.html?id=' + encodeURIComponent(p.id) + '">' +
            '<div class="slide-imagen">' +
            insignia +
            '<img src="' + resolverImagen(p.imagen) + '" alt="' + escaparHTML(p.nombre) + '" loading="lazy"' +
            ' onerror="this.onerror=null; this.src=\'assets/img/logo.png\'">' +
            '</div>' +
            '<div class="slide-info">' +
            '<span class="slide-grupo">' + escaparHTML(p.grupo || 'K-POP') + '</span>' +
            '<h3>' + escaparHTML(p.nombre) + '</h3>' +
            '<div class="slide-pie">' +
            '<span class="slide-precio">' + formatearPrecio(Number(p.precio) || 0) + '</span>' +
            '<span class="slide-boton">Ver →</span>' +
            '</div>' +
            '</div>' +
            '</a>';
    }).join('');
}

/* Cinta con los grupos, duplicada para que el movimiento sea continuo */
function pintarCintaGrupos(productos) {
    const cinta = document.getElementById('cinta-grupos');
    if (!cinta) return;
    const grupos = [...new Set(productos.map(p => p.grupo).filter(Boolean))];
    const html = grupos.map(g => '<span>' + escaparHTML(g) + '</span>').join('');
    cinta.innerHTML = html + html + html + html;
}

document.addEventListener('DOMContentLoaded', function () {
    const productos = leerProductos();
    const grupos = new Set(productos.map(p => p.grupo).filter(Boolean));

    document.getElementById('dato-productos').textContent = productos.length;
    document.getElementById('dato-grupos').textContent = grupos.size;

    pintarCintaGrupos(productos);
    pintarCarruselDestacados();

    // Las flechas viven en la cabecera de la sección
    iniciarCarrusel(
        document.getElementById('carrusel-destacados'),
        document.querySelector('.carrusel-cabecera')
    );
});
