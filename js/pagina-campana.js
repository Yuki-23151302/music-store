/* =========================================================
   KOOKSTORE.MX - PÁGINA DE CAMPAÑA (ESCAPARATE DE MARKETING)
   ---------------------------------------------------------
   - Lee el producto destacado del catálogo real, así el precio,
     la oferta y el stock coinciden con el carrito y el checkout.
   - "Comprar ahora" agrega 1 pieza al carrito y lleva al pago.
   - Si el Admin creó una oferta con fecha de fin, muestra la
     cuenta regresiva.

   Necesita: notificaciones.js, datos-productos.js, sesion.js,
   carrito.js y ui.js
   ========================================================= */

/* Producto que protagoniza la campaña */
const ID_PRODUCTO_CAMPANA = 'lightstick-army-bomb';

let temporizadorCuenta = null;

/* Piezas que todavía se pueden agregar (stock menos lo que ya hay en el carrito) */
function piezasDisponiblesCampana(producto) {
    const enCarrito = leerCarrito()
        .filter(item => item.id === producto.id)
        .reduce((suma, item) => suma + item.cantidad, 0);
    return Math.max(0, stockDisponible(producto) - enCarrito);
}

/* Precio, sello de descuento, stock y estado de los botones */
function pintarCampana() {
    const producto = obtenerProductoPorId(ID_PRODUCTO_CAMPANA);
    const botones = [document.getElementById('btn-comprar-ahora'), document.getElementById('btn-comprar-final')];

    // Si el producto se eliminó del catálogo, la campaña lleva al catálogo
    if (!producto) {
        document.getElementById('campana-precio').innerHTML = '';
        document.getElementById('campana-stock').textContent = 'Este producto ya no está disponible.';
        botones.forEach(b => { b.textContent = 'Ver catálogo →'; b.onclick = () => { location.href = 'catalogo.html'; }; });
        return;
    }

    const info = precioProducto(producto);
    document.getElementById('campana-imagen').src = resolverImagen(producto.imagen);

    // Precio: si hay una oferta vigente se muestra el anterior tachado
    document.getElementById('campana-precio').innerHTML =
        (info.oferta ? '<span class="precio-antes">' + formatearPrecio(info.original) + '</span>' : '') +
        '<span class="precio-ahora">' + formatearPrecio(info.precio).replace(' MXN', '') + ' <small>MXN</small></span>' +
        (info.oferta ? '<span class="precio-ahorro">Ahorras ' + formatearPrecio(info.original - info.precio) + '</span>' : '');

    const sello = document.getElementById('campana-sello');
    sello.hidden = !info.oferta;
    sello.textContent = info.oferta ? '-' + info.descuento + '%' : '';

    // Stock
    const disponibles = piezasDisponiblesCampana(producto);
    const stock = document.getElementById('campana-stock');
    if (stockDisponible(producto) <= 0) {
        stock.textContent = '😢 Agotado por ahora. ¡Vuelve pronto!';
    } else if (disponibles <= 0) {
        stock.textContent = '🛒 Ya tienes en tu carrito todas las piezas disponibles.';
    } else if (disponibles <= 5) {
        stock.textContent = '⚡ ¡Solo quedan ' + disponibles + ' piezas!';
    } else {
        stock.textContent = '✓ ' + disponibles + ' piezas disponibles';
    }

    botones.forEach(function (boton) {
        boton.disabled = disponibles <= 0;
        boton.textContent = stockDisponible(producto) <= 0 ? 'Agotado' : 'Comprar ahora →';
    });

    pintarCuentaRegresiva(info.oferta);
}

/* "La oferta termina en 2d 05:12:40" (solo si la oferta tiene fecha de fin) */
function pintarCuentaRegresiva(oferta) {
    const zona = document.getElementById('campana-cuenta');
    clearInterval(temporizadorCuenta);

    if (!oferta || !oferta.fin) {
        zona.hidden = true;
        return;
    }

    const [anio, mes, dia] = oferta.fin.split('-').map(Number);
    const limite = new Date(anio, mes - 1, dia, 23, 59, 59);

    function actualizar() {
        const restante = limite - new Date();
        if (restante <= 0) {
            clearInterval(temporizadorCuenta);
            pintarCampana();
            return;
        }
        const dias = Math.floor(restante / 86400000);
        const horas = Math.floor(restante / 3600000) % 24;
        const minutos = Math.floor(restante / 60000) % 60;
        const segundos = Math.floor(restante / 1000) % 60;
        const dos = n => String(n).padStart(2, '0');
        zona.innerHTML = '⏰ La oferta termina en <strong>' + (dias ? dias + 'd ' : '') +
            dos(horas) + ':' + dos(minutos) + ':' + dos(segundos) + '</strong>';
    }

    zona.hidden = false;
    actualizar();
    temporizadorCuenta = setInterval(actualizar, 1000);
}

/* "Comprar ahora": agrega 1 pieza al carrito con el precio vigente y va al pago */
function comprarAhora() {
    const producto = obtenerProductoPorId(ID_PRODUCTO_CAMPANA);
    if (!producto) return;

    // Si el producto tiene versiones, el cliente debe elegir una en el detalle
    if (producto.tieneVariantes) {
        location.href = 'productos.html?id=' + encodeURIComponent(producto.id);
        return;
    }

    if (piezasDisponiblesCampana(producto) <= 0) {
        pintarCampana();
        return;
    }

    const info = precioProducto(producto);
    agregarAlCarrito({
        id: producto.id,
        nombre: producto.nombre,
        grupo: producto.grupo,
        precio: info.precio,
        precioOriginal: info.original,
        imagen: producto.imagen,
        cantidad: 1,
        opcion: ''
    });

    kookToast(producto.nombre + ' se añadió a tu carrito', 'exito', '¡Excelente elección!');
    setTimeout(() => { location.href = 'checkout.html'; }, 700);
}

document.addEventListener('DOMContentLoaded', function () {
    pintarCampana();
    document.getElementById('btn-comprar-ahora').addEventListener('click', comprarAhora);
    document.getElementById('btn-comprar-final').addEventListener('click', comprarAhora);

    // Si el Admin cambia el precio, el stock o la oferta en otra pestaña
    window.addEventListener('storage', function (e) {
        if (e.key === 'kookstore_productos' || e.key === CLAVE_OFERTAS || e.key === claveCarrito()) pintarCampana();
    });
});
