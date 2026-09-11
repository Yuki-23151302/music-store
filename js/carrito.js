/* =========================================================
   CARRITO DE COMPRAS - KOOKSTORE.MX
   Se guarda en el localStorage del navegador bajo la clave
   "kookstore_carrito", así que sobrevive a recargar la página
   o cerrar y volver a abrir el navegador (no requiere servidor
   ni base de datos).

   Estructura guardada:
   [
     { nombre, grupo, precio, imagen, cantidad },
     ...
   ]

   Este archivo se incluye en cualquier página que necesite
   leer o modificar el carrito (catálogo, index, y más adelante
   la página de carrito).
   ========================================================= */

const CARRITO_KEY = 'kookstore_carrito';

// Lee el carrito guardado en localStorage
function leerCarrito() {
    const datos = localStorage.getItem(CARRITO_KEY);
    return datos ? JSON.parse(datos) : [];
}

// Guarda el carrito completo en localStorage
function guardarCarrito(carrito) {
    localStorage.setItem(CARRITO_KEY, JSON.stringify(carrito));
}

// Añade un producto al carrito. Si el producto ya existe
// (mismo nombre), solo suma la cantidad en lugar de duplicarlo.
function agregarAlCarrito(producto) {
    const carrito = leerCarrito();

    const existente = carrito.find(item => item.nombre === producto.nombre);

    if (existente) {
        existente.cantidad += producto.cantidad;
    } else {
        carrito.push(producto);
    }

    guardarCarrito(carrito);
    actualizarContadorCarrito();
}

// Elimina un producto del carrito por nombre
function eliminarDelCarrito(nombre) {
    const carrito = leerCarrito().filter(item => item.nombre !== nombre);
    guardarCarrito(carrito);
    actualizarContadorCarrito();
}

// Vacía el carrito por completo
function vaciarCarrito() {
    guardarCarrito([]);
    actualizarContadorCarrito();
}

// Suma el total de unidades (no de productos distintos) en el carrito
function totalUnidadesCarrito() {
    return leerCarrito().reduce((total, item) => total + item.cantidad, 0);
}

// Actualiza el texto "Carrito (n)" del header en cualquier página
// que tenga un elemento con la clase .btn-carrito
function actualizarContadorCarrito() {
    const contador = document.querySelector('.btn-carrito');
    if (contador) {
        contador.textContent = `Carrito (${totalUnidadesCarrito()})`;
    }
}

// Al cargar cualquier página que incluya este archivo,
// refleja de inmediato el total actual guardado en localStorage
document.addEventListener('DOMContentLoaded', actualizarContadorCarrito);
