/* =========================================================
   KOOKSTORE.MX - DETALLE DE UN SOLO PRODUCTO
   ---------------------------------------------------------
   Esta página muestra ÚNICAMENTE el producto que el cliente
   eligió en el catálogo. El producto llega en la dirección:

     productos.html?id=album-love-yourself

   Ningún otro producto se dibuja en pantalla: el HTML se
   construye a partir de un solo elemento de PRODUCTOS.

   Si el producto tiene versiones/personajes, cada una se
   muestra como botón con su propio stock; las agotadas se
   deshabilitan. La cantidad nunca supera lo disponible
   (descontando lo que ya está en el carrito).

   Necesita que se carguen antes:
     datos-productos.js, sesion.js y carrito.js
   ========================================================= */

const NOMBRES_CATEGORIA = {
    albumes: 'Álbumes',
    lightsticks: 'Lightsticks',
    peluches: 'Peluches'
};

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

/* Migas de pan: Catálogo › Categoría › Producto */
function pintarMigas(producto) {
    const migas = document.querySelector('.detalle-migas');
    if (!migas) return;

    const categoria = NOMBRES_CATEGORIA[producto.categoria] || 'Productos';
    migas.innerHTML =
        '<a href="catalogo.html" class="migas-volver">&larr; Volver al Catálogo</a>' +
        '<nav class="migas-ruta" aria-label="Ruta de navegación">' +
        '<a href="catalogo.html">Catálogo</a><span>›</span>' +
        '<a href="catalogo.html?categoria=' + encodeURIComponent(producto.categoria) + '">' + categoria + '</a><span>›</span>' +
        '<strong>' + escaparHTML(producto.nombre) + '</strong>' +
        '</nav>';
}

/* Cuántas piezas de este producto/variante ya están en el carrito */
function piezasEnCarrito(idProducto, opcion) {
    return leerCarrito()
        .filter(item => item.id === idProducto && (item.opcion || '') === (opcion || ''))
        .reduce((suma, item) => suma + item.cantidad, 0);
}

/* Botones de versión / personaje con su stock */
function construirSelector(producto) {
    if (!producto.tieneVariantes) {
        return '';
    }

    let botones = '';
    producto.variantes.forEach(function (variante, i) {
        const agotado = Number(variante.stock) <= 0;
        botones +=
            '<button type="button" class="variante-chip' + (agotado ? ' agotado' : '') + '"' +
            ' data-variante="' + i + '"' + (agotado ? ' disabled' : '') + '>' +
            '<span class="variante-nombre">' + escaparHTML(variante.nombre) + '</span>' +
            '<span class="variante-stock">' + (agotado ? 'Agotado' : variante.stock + ' disp.') + '</span>' +
            '</button>';
    });

    return '' +
        '<div class="detalle-campo">' +
        '<label>' + escaparHTML(producto.tituloVariante) + '</label>' +
        '<div class="variantes-lista">' + botones + '</div>' +
        '</div>';
}

/* Dibuja en pantalla el producto seleccionado */
function mostrarDetalle(producto, contenedor) {
    // El título de la pestaña también cambia al producto elegido
    document.title = producto.nombre + ' | Kookstore.mx';
    pintarMigas(producto);

    contenedor.innerHTML = '' +
        '<article class="detalle-producto">' +

        '<div class="detalle-imagen">' +
        '<img src="' + resolverImagen(producto.imagen) + '" alt="' + escaparHTML(producto.nombre) + '"' +
        ' onerror="this.onerror=null; this.src=\'' + rutaRaiz() + 'assets/img/logo.png\';">' +
        '</div>' +

        '<div class="detalle-info">' +
        '<span class="catalogo-etiqueta">' + escaparHTML(producto.etiqueta || 'PRODUCTO OFICIAL') + '</span>' +
        '<h1>' + escaparHTML(producto.nombre) + '</h1>' +
        '<p class="detalle-grupo">Grupo: ' + escaparHTML(producto.grupo || 'K-POP') + '</p>' +
        '<p class="detalle-precio">' + formatearPrecio(producto.precio) + '</p>' +

        '<div class="detalle-bloque">' +
        '<h2>Descripción</h2>' +
        '<p>' + escaparHTML(producto.descripcion || '') + '</p>' +
        '</div>' +

        construirSelector(producto) +

        '<div class="detalle-campo detalle-campo-cantidad">' +
        '<label for="cantidad-producto">Cantidad:</label>' +
        '<div class="cantidad-fila">' +
        '<div class="cantidad-stepper">' +
        '<button type="button" id="btn-menos" aria-label="Restar uno">−</button>' +
        '<input type="number" id="cantidad-producto" value="1" min="1">' +
        '<button type="button" id="btn-mas" aria-label="Sumar uno">+</button>' +
        '</div>' +
        '<span class="detalle-disponible" id="texto-disponible"></span>' +
        '</div>' +
        '</div>' +

        '<p class="detalle-subtotal">Subtotal: <strong id="texto-subtotal">' + formatearPrecio(producto.precio) + '</strong></p>' +

        '<button type="button" class="btn-primario detalle-btn-carrito" id="btn-agregar-carrito">' +
        'Añadir al Carrito</button>' +

        '<div class="detalle-enlaces">' +
        '<a href="catalogo.html" class="detalle-enlace-carrito">← Seguir comprando</a>' +
        '<a href="carrito.html" class="detalle-enlace-carrito">Ver mi carrito →</a>' +
        '</div>' +

        '</div>' +
        '</article>';

    const campoCantidad = document.getElementById('cantidad-producto');
    const botonAgregar = document.getElementById('btn-agregar-carrito');
    const textoDisponible = document.getElementById('texto-disponible');
    const textoSubtotal = document.getElementById('texto-subtotal');
    let varianteElegida = null;

    /* Lo que todavía se puede agregar: stock menos lo que ya está en el carrito */
    function maximoPermitido() {
        const opcion = varianteElegida ? varianteElegida.nombre : '';
        if (producto.tieneVariantes && !varianteElegida) return 0;
        const stock = stockDisponible(producto, opcion || undefined);
        return Math.max(0, stock - piezasEnCarrito(producto.id, opcion));
    }

    /* Ajusta cantidad, texto de disponibilidad, subtotal y botón */
    function refrescarEstado() {
        const maximo = maximoPermitido();
        let cantidad = Math.floor(Number(campoCantidad.value)) || 1;
        cantidad = Math.min(Math.max(1, cantidad), Math.max(1, maximo));
        campoCantidad.value = cantidad;
        campoCantidad.max = Math.max(1, maximo);

        if (producto.tieneVariantes && !varianteElegida) {
            textoDisponible.textContent = 'Elige una opción';
            textoDisponible.className = 'detalle-disponible';
        } else if (maximo <= 0) {
            textoDisponible.textContent = stockDisponible(producto, varianteElegida ? varianteElegida.nombre : undefined) > 0
                ? 'Ya tienes todo el stock en tu carrito'
                : 'Agotado';
            textoDisponible.className = 'detalle-disponible sin-stock';
        } else {
            textoDisponible.textContent = maximo + (maximo === 1 ? ' disponible' : ' disponibles');
            textoDisponible.className = 'detalle-disponible' + (maximo <= 5 ? ' poco-stock' : '');
        }

        botonAgregar.disabled = maximo <= 0;
        botonAgregar.textContent = (producto.tieneVariantes && !varianteElegida)
            ? 'Elige una opción'
            : (maximo <= 0 ? 'Sin stock disponible' : 'Añadir al Carrito');
        textoSubtotal.textContent = formatearPrecio(producto.precio * cantidad);
    }

    // Selección de versión / personaje
    contenedor.querySelectorAll('.variante-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
            contenedor.querySelectorAll('.variante-chip').forEach(c => c.classList.remove('activo'));
            this.classList.add('activo');
            varianteElegida = producto.variantes[Number(this.getAttribute('data-variante'))];
            refrescarEstado();
        });
    });

    // Se preselecciona la primera variante con stock
    const primeraConStock = contenedor.querySelector('.variante-chip:not(.agotado)');
    if (primeraConStock) primeraConStock.click();

    document.getElementById('btn-menos').addEventListener('click', function () {
        campoCantidad.value = Number(campoCantidad.value) - 1;
        refrescarEstado();
    });

    document.getElementById('btn-mas').addEventListener('click', function () {
        const antes = Number(campoCantidad.value);
        campoCantidad.value = antes + 1;
        refrescarEstado();
        if (Number(campoCantidad.value) === antes) {
            mostrarToast('Solo hay ' + maximoPermitido() + ' disponibles', 'aviso');
        }
    });

    campoCantidad.addEventListener('change', refrescarEstado);

    // Botón "Añadir al Carrito"
    botonAgregar.addEventListener('click', function () {
        const cantidad = Number(campoCantidad.value);
        if (cantidad > maximoPermitido()) {
            refrescarEstado();
            return;
        }

        const articulo = {
            id: producto.id,
            nombre: producto.nombre,
            grupo: producto.grupo,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: cantidad,
            opcion: varianteElegida ? varianteElegida.nombre : ''
        };

        agregarAlCarrito(articulo);
        mostrarToast(producto.nombre + (articulo.opcion ? ' (' + articulo.opcion + ')' : '') + ' se añadió a tu carrito');
        campoCantidad.value = 1;
        refrescarEstado();
    });

    refrescarEstado();
}

/* Punto de entrada de la página */
function cargarDetalleProducto() {
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
}

document.addEventListener('DOMContentLoaded', cargarDetalleProducto);
