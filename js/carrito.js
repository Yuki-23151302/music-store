/* =========================================================
   KOOKSTORE.MX - CARRITO E HISTORIAL DE COMPRAS
   ---------------------------------------------------------
   Todo se guarda en el localStorage del navegador, así que
   sobrevive a recargar la página o cerrar el navegador.

   IMPORTANTE: tanto el carrito como el historial se guardan
   POR USUARIO. La clave incluye el correo de quien inició
   sesión, por eso cada cliente ve únicamente sus compras:

     kookstore_carrito_sofia@example.com
     kookstore_pedidos_sofia@example.com

   Si nadie inició sesión se usa la bolsa "invitado".

   Este archivo necesita que sesion.js se cargue ANTES.
   ========================================================= */

/* ---------------------------------------------------------
   CLAVES POR USUARIO
   --------------------------------------------------------- */

function claveCarrito() {
    return 'kookstore_carrito_' + clienteActual();
}

function clavePedidos() {
    return 'kookstore_pedidos_' + clienteActual();
}

/* ---------------------------------------------------------
   LECTURA Y ESCRITURA DEL CARRITO
   --------------------------------------------------------- */

function leerCarrito() {
    const datos = localStorage.getItem(claveCarrito());
    return datos ? JSON.parse(datos) : [];
}

function guardarCarrito(carrito) {
    localStorage.setItem(claveCarrito(), JSON.stringify(carrito));
    actualizarContadorCarrito();
}

/* Añade un producto. Si ya estaba (mismo producto y misma
   versión / personaje) solamente suma la cantidad. */
function agregarAlCarrito(producto) {
    const carrito = leerCarrito();
    let yaEstaba = false;

    for (let i = 0; i < carrito.length; i++) {
        if (carrito[i].id === producto.id && carrito[i].opcion === producto.opcion) {
            carrito[i].cantidad = carrito[i].cantidad + producto.cantidad;
            yaEstaba = true;
            break;
        }
    }

    if (!yaEstaba) {
        carrito.push(producto);
    }

    guardarCarrito(carrito);
}

/* Quita una línea del carrito por su posición */
function eliminarDelCarrito(indice) {
    const carrito = leerCarrito();
    carrito.splice(indice, 1);
    guardarCarrito(carrito);
}

/* Cambia la cantidad de una línea del carrito */
function cambiarCantidad(indice, nuevaCantidad) {
    const carrito = leerCarrito();
    carrito[indice].cantidad = Number(nuevaCantidad);
    guardarCarrito(carrito);
}

/* Deja el carrito vacío */
function vaciarCarrito() {
    guardarCarrito([]);
}

/* Suma total en pesos de todo el carrito */
function totalCarrito() {
    const carrito = leerCarrito();
    let total = 0;
    for (let i = 0; i < carrito.length; i++) {
        total = total + (carrito[i].precio * carrito[i].cantidad);
    }
    return total;
}

/* Cuántos artículos hay en total (sumando cantidades) */
function contarArticulos() {
    const carrito = leerCarrito();
    let cuenta = 0;
    for (let i = 0; i < carrito.length; i++) {
        cuenta = cuenta + carrito[i].cantidad;
    }
    return cuenta;
}

/* Al iniciar sesión, lo que el visitante había puesto en el
   carrito como invitado se pasa a su cuenta. */
function fusionarCarritoInvitado() {
    const datosInvitado = localStorage.getItem('kookstore_carrito_invitado');
    if (!datosInvitado) {
        return;
    }

    const carritoInvitado = JSON.parse(datosInvitado);
    for (let i = 0; i < carritoInvitado.length; i++) {
        agregarAlCarrito(carritoInvitado[i]);
    }

    localStorage.removeItem('kookstore_carrito_invitado');
}

/* ---------------------------------------------------------
   HISTORIAL DE COMPRAS (POR USUARIO)
   --------------------------------------------------------- */

/* Devuelve los pedidos del usuario que tiene la sesión abierta */
function leerPedidos() {
    const datos = localStorage.getItem(clavePedidos());
    return datos ? JSON.parse(datos) : [];
}

function guardarPedidos(pedidos) {
    localStorage.setItem(clavePedidos(), JSON.stringify(pedidos));
}

/* Arma un folio consecutivo: KS-2026-001, KS-2026-002, ... */
function generarFolio() {
    const consecutivo = leerPedidos().length + 1;
    let numero = String(consecutivo);
    while (numero.length < 3) {
        numero = '0' + numero;
    }
    return 'KS-' + new Date().getFullYear() + '-' + numero;
}

/* Convierte el carrito actual en un pedido del historial
   y deja el carrito vacío. Devuelve el pedido creado. */
function registrarPedido() {
    const carrito = leerCarrito();
    const ahora = new Date();

    const nombresProductos = carrito.map(function (item) {
        return item.cantidad + 'x ' + item.nombre;
    }).join(', ');

    const pedido = {
        folio: generarFolio(),
        fecha: ahora.toLocaleDateString('es-MX'),
        hora: ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        estado: 'En camino',
        total: totalCarrito(),
        resumen: nombresProductos,
        articulos: carrito
    };

    const pedidos = leerPedidos();
    pedidos.unshift(pedido);   // el más reciente queda primero
    guardarPedidos(pedidos);

    vaciarCarrito();
    return pedido;
}

/* ---------------------------------------------------------
   AYUDAS DE PRESENTACIÓN
   --------------------------------------------------------- */

/* 1550 -> "$1,550.00 MXN" */
function formatearPrecio(cantidad) {
    return '$' + cantidad.toLocaleString('es-MX', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }) + ' MXN';
}

/* Actualiza el texto "Carrito (n)" del encabezado */
function actualizarContadorCarrito() {
    const botones = document.querySelectorAll('.btn-carrito');
    const cuenta = contarArticulos();

    botones.forEach(function (boton) {
        boton.textContent = 'Carrito (' + cuenta + ')';
    });
}

/* Mensaje flotante de confirmación en la esquina */
function mostrarToast(mensaje) {
    let toast = document.getElementById('toast-kookstore');

    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast-kookstore';
        toast.className = 'toast-carrito';
        document.body.appendChild(toast);
    }

    toast.innerHTML = '<span class="toast-icono">&#10003;</span><span>' + mensaje + '</span>';

    // Pequeña espera para que el navegador aplique la transición
    setTimeout(function () {
        toast.classList.add('visible');
    }, 10);

    setTimeout(function () {
        toast.classList.remove('visible');
    }, 2600);
}

/* Al cargar cualquier página, el contador se pone al día */
document.addEventListener('DOMContentLoaded', actualizarContadorCarrito);
