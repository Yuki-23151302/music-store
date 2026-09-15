/* =========================================================
   KOOKSTORE.MX - DETALLE DE UN SOLO PRODUCTO
   ---------------------------------------------------------
   Esta página muestra ÚNICAMENTE el producto que el cliente
   eligió en el catálogo. El producto llega en la dirección:

     productos.html?id=album-love-yourself

   Ningún otro producto se dibuja en pantalla: el HTML se
   construye a partir de un solo elemento de PRODUCTOS.

   Necesita que se carguen antes:
     datos-productos.js, sesion.js y carrito.js
   ========================================================= */

/* Lee el id del producto que viene en la dirección */
function obtenerIdDeLaUrl() {
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get('id');

    if (id) {
        return id;
    }

    // Respaldo para enlaces antiguos del tipo productos.html#in-life
    if (window.location.hash) {
        return window.location.hash.replace('#', '');
    }

    return '';
}

/* Dibuja el aviso de que el producto no existe */
function mostrarProductoNoEncontrado(contenedor) {
    contenedor.innerHTML =
        '<div class="detalle-vacio">' +
        '<h1>No encontramos ese producto</h1>' +
        '<p>Puede que el enlace esté incompleto o que el artículo ya no esté disponible.</p>' +
        '<a href="catalogo.html" class="btn-primario">Volver al catálogo</a>' +
        '</div>';
}

/* Arma el HTML del selector de versión / personaje */
function construirSelector(producto) {
    if (!producto.opcion) {
        return '';
    }

    let opciones = '';
    for (let i = 0; i < producto.opcion.valores.length; i++) {
        const valor = producto.opcion.valores[i];
        opciones = opciones + '<option value="' + valor + '">' + valor + '</option>';
    }

    return '' +
        '<div class="detalle-campo">' +
        '<label for="opcion-producto">' + producto.opcion.titulo + '</label>' +
        '<select id="opcion-producto" class="detalle-select">' + opciones + '</select>' +
        '</div>';
}

/* Dibuja en pantalla el producto seleccionado */
function mostrarDetalle(producto, contenedor) {
    // El título de la pestaña también cambia al producto elegido
    document.title = producto.nombre + ' | Kookstore.mx';

    contenedor.innerHTML = '' +
        '<article class="detalle-producto">' +

        '<div class="detalle-imagen">' +
        '<img src="' + rutaRaiz() + producto.imagen + '" alt="' + producto.nombre + '">' +
        '</div>' +

        '<div class="detalle-info">' +
        '<span class="catalogo-etiqueta">' + producto.etiqueta + '</span>' +
        '<h1>' + producto.nombre + '</h1>' +
        '<p class="detalle-grupo">Grupo: ' + producto.grupo + '</p>' +
        '<p class="detalle-precio">' + formatearPrecio(producto.precio) + '</p>' +

        '<div class="detalle-bloque">' +
        '<h2>Descripción</h2>' +
        '<p>' + producto.descripcion + '</p>' +
        '</div>' +

        construirSelector(producto) +

        '<div class="detalle-campo detalle-campo-cantidad">' +
        '<label for="cantidad-producto">Cantidad:</label>' +
        '<input type="number" id="cantidad-producto" value="1" min="1" max="10">' +
        '</div>' +

        '<button type="button" class="btn-primario detalle-btn-carrito" id="btn-agregar-carrito">' +
        'Añadir al Carrito</button>' +

        '<a href="carrito.html" class="detalle-enlace-carrito">Ver mi carrito</a>' +

        '</div>' +
        '</article>';

    // Botón "Añadir al Carrito"
    document.getElementById('btn-agregar-carrito')
        .addEventListener('click', function () {

            const campoCantidad = document.getElementById('cantidad-producto');
            const campoOpcion = document.getElementById('opcion-producto');

            const articulo = {
                id: producto.id,
                nombre: producto.nombre,
                grupo: producto.grupo,
                precio: producto.precio,
                imagen: producto.imagen,
                cantidad: Number(campoCantidad.value),
                opcion: campoOpcion ? campoOpcion.value : ''
            };

            agregarAlCarrito(articulo);
            mostrarToast(producto.nombre + ' se añadió a tu carrito');
        });
}

/* Punto de entrada de la página */
document.addEventListener('DOMContentLoaded', function () {
    const contenedor = document.getElementById('detalle-producto');
    if (!contenedor) {
        return;
    }

    const producto = obtenerProductoPorId(obtenerIdDeLaUrl());

    if (producto) {
        mostrarDetalle(producto, contenedor);
    } else {
        mostrarProductoNoEncontrado(contenedor);
    }
});
