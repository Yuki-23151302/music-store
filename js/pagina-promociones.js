/* =========================================================
   KOOKSTORE.MX - PÁGINA DE PROMOCIONES
   ---------------------------------------------------------
   Muestra los códigos de descuento que creó el Admin.
   Para la cuenta con sesión iniciada marca cada código como:
     Disponible · En tu carrito · Ya usado · Próximamente

   Necesita: notificaciones.js, datos-productos.js, sesion.js,
   carrito.js, cupones.js y ui.js
   ========================================================= */

let filtroPromos = 'todos';

/* Estado del cupón desde el punto de vista del cliente */
function estadoParaCliente(cupon) {
    if (estadoCupon(cupon) === 'programado') return 'proximamente';
    if (haySesionCliente() && cuponUsadoPorCliente(cupon)) return 'usado';
    if (codigoAplicado() === cupon.codigo) return 'en-carrito';
    return 'disponible';
}

const ETIQUETA_CLIENTE = {
    disponible: '✨ Disponible',
    'en-carrito': '🛒 Aplicado en tu carrito',
    usado: '✓ Ya usado',
    proximamente: '🗓️ Próximamente'
};

function textoVigenciaCupon(cupon) {
    if (estadoCupon(cupon) === 'programado') return 'Disponible a partir del ' + fechaLarga(cupon.inicio);
    if (cupon.fin) return 'Válido hasta el ' + fechaLarga(cupon.fin);
    return 'Sin fecha de vencimiento';
}

function tarjetaCupon(cupon) {
    const estado = estadoParaCliente(cupon);
    const producto = cupon.productoId ? obtenerProductoPorId(cupon.productoId) : null;
    const bloqueado = estado === 'usado' || estado === 'proximamente';

    const alcance = producto
        ? '<a class="cupon-alcance" href="productos.html?id=' + encodeURIComponent(producto.id) + '">' +
          '<img src="' + resolverImagen(producto.imagen) + '" alt="" onerror="this.onerror=null; this.src=\'../assets/img/logo.png\'">' +
          '<span><small>Aplica en</small>' + escaparHTML(producto.nombre) + '</span></a>'
        : '<div class="cupon-alcance"><span class="cupon-alcance-icono">🛍️</span><span><small>Aplica en</small>Toda la tienda</span></div>';

    const destino = producto ? 'productos.html?id=' + encodeURIComponent(producto.id) : 'catalogo.html';
    const accion = estado === 'usado'
        ? '<span class="cupon-accion deshabilitada">Ya canjeaste este código</span>'
        : estado === 'en-carrito'
            ? '<a class="cupon-accion" href="carrito.html">Ver mi carrito →</a>'
            : estado === 'proximamente'
                ? '<span class="cupon-accion deshabilitada">Aún no disponible</span>'
                : '<a class="cupon-accion" href="' + destino + '">' + (producto ? 'Usar en el producto →' : 'Ir al catálogo →') + '</a>';

    return '' +
        '<article class="cupon-card estado-' + estado + '" data-revelar>' +
        '<div class="cupon-izquierda">' +
        '<span class="cupon-descuento">' + textoDescuentoCupon(cupon) + '</span>' +
        '<small>de descuento</small>' +
        '</div>' +
        '<div class="cupon-derecha">' +
        '<span class="cupon-estado">' + ETIQUETA_CLIENTE[estado] + '</span>' +
        '<h3>' + escaparHTML(cupon.titulo || 'Código de descuento') + '</h3>' +
        (cupon.descripcion ? '<p class="cupon-descripcion">' + escaparHTML(cupon.descripcion) + '</p>' : '') +
        alcance +
        '<p class="cupon-vigencia">⏰ ' + textoVigenciaCupon(cupon) + '</p>' +
        '<div class="cupon-codigo">' +
        '<code>' + escaparHTML(cupon.codigo) + '</code>' +
        '<button type="button" class="btn-copiar" data-codigo="' + escaparHTML(cupon.codigo) + '"' + (bloqueado ? ' disabled' : '') + '>' +
        (estado === 'usado' ? 'Usado' : 'Copiar') + '</button>' +
        '</div>' +
        accion +
        '</div>' +
        (estado === 'usado' ? '<span class="cupon-sello">YA USADO</span>' : '') +
        '</article>';
}

function pintarPromociones() {
    const grid = document.getElementById('cupones-grid');
    document.getElementById('aviso-sesion').hidden = haySesionCliente();

    // Solo se publican los activos y los programados
    const visibles = leerCupones()
        .filter(c => ['activo', 'programado'].includes(estadoCupon(c)))
        .filter(c => !c.productoId || obtenerProductoPorId(c.productoId));

    const filtrados = visibles.filter(function (c) {
        const estado = estadoParaCliente(c);
        if (filtroPromos === 'disponible') return estado === 'disponible' || estado === 'en-carrito';
        if (filtroPromos === 'usado') return estado === 'usado';
        return true;
    });

    if (visibles.length === 0) {
        grid.innerHTML = '' +
            '<div class="promos-vacio">' +
            '<span>🎟️</span>' +
            '<h2>Por ahora no hay códigos</h2>' +
            '<p>Vuelve pronto: aquí publicaremos nuevos códigos de descuento.</p>' +
            '<a href="catalogo.html" class="btn-primario">Explorar el catálogo</a>' +
            '</div>';
        return;
    }

    if (filtrados.length === 0) {
        grid.innerHTML = '<div class="promos-vacio pequeno"><p>' +
            (filtroPromos === 'usado' ? 'Todavía no has usado ningún código.' : 'Ya usaste todos los códigos disponibles. ¡Vuelve pronto!') +
            '</p></div>';
        return;
    }

    // Disponibles primero, luego en carrito, próximamente y usados al final
    const orden = { disponible: 0, 'en-carrito': 1, proximamente: 2, usado: 3 };
    grid.innerHTML = filtrados
        .sort((a, b) => orden[estadoParaCliente(a)] - orden[estadoParaCliente(b)])
        .map(tarjetaCupon)
        .join('');

    requestAnimationFrame(() => requestAnimationFrame(function () {
        grid.querySelectorAll('[data-revelar]').forEach((el, i) => {
            el.style.setProperty('--retraso', (i % 6) * 0.06 + 's');
            el.classList.add('revelado');
        });
    }));
}

/* Copia el código al portapapeles (con respaldo para navegadores viejos) */
function copiarCodigo(codigo, boton) {
    function avisar() {
        boton.textContent = '¡Copiado!';
        boton.classList.add('copiado');
        setTimeout(() => { boton.textContent = 'Copiar'; boton.classList.remove('copiado'); }, 1800);
        kookToast('Pega ' + codigo + ' en el producto o en tu carrito', 'exito', 'Código copiado');
    }

    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(codigo).then(avisar).catch(() => respaldo());
    } else {
        respaldo();
    }

    function respaldo() {
        const campo = document.createElement('textarea');
        campo.value = codigo;
        campo.style.position = 'fixed';
        campo.style.opacity = '0';
        document.body.appendChild(campo);
        campo.select();
        try { document.execCommand('copy'); } catch (e) { /* sin portapapeles */ }
        campo.remove();
        avisar();
    }
}

document.addEventListener('DOMContentLoaded', function () {
    pintarPromociones();

    document.getElementById('cupones-grid').addEventListener('click', function (e) {
        const boton = e.target.closest('.btn-copiar');
        if (boton && !boton.disabled) copiarCodigo(boton.getAttribute('data-codigo'), boton);
    });

    document.querySelectorAll('.promo-filtro').forEach(function (boton) {
        boton.addEventListener('click', function () {
            document.querySelectorAll('.promo-filtro').forEach(b => b.classList.toggle('activo', b === this));
            filtroPromos = this.getAttribute('data-filtro');
            pintarPromociones();
        });
    });

    // Si el Admin cambia cupones o el cliente usa uno en otra pestaña
    window.addEventListener('storage', function (e) {
        if (e.key === CLAVE_CUPONES || e.key === claveCuponCarrito() || e.key === 'kookstore_productos') {
            pintarPromociones();
        }
    });
});
