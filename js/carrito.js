/* =========================================================
   KOOKSTORE.MX - CARRITO E HISTORIAL DE COMPRAS
   ---------------------------------------------------------
   Todo se guarda en el localStorage del navegador, así que
   sobrevive a recargar la página o cerrar el navegador.

   IMPORTANTE: tanto el carrito como el historial se guardan
   POR USUARIO. La clave incluye el correo de quien inició
   sesión, por eso cada cliente ve únicamente sus compras:

     kookstore_carrito_yuridia@kookstore.mx
     kookstore_pedidos_yuridia@kookstore.mx

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

/* Cambia la cantidad de una línea del carrito (mínimo 1) */
function cambiarCantidad(indice, nuevaCantidad) {
    const carrito = leerCarrito();
    if (!carrito[indice]) return;
    carrito[indice].cantidad = Math.max(1, Math.floor(Number(nuevaCantidad)) || 1);
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

/* Pone al día el precio de cada línea con las ofertas vigentes.
   Así, si una oferta empieza, termina o se pausa desde el Admin,
   el carrito y el checkout cobran el precio correcto.
   Solo funciona en páginas que cargaron datos-productos.js. */
function sincronizarPreciosCarrito() {
    if (typeof precioProducto !== 'function') return;

    const carrito = leerCarrito();
    let cambio = false;

    carrito.forEach(function (item) {
        const producto = obtenerProductoPorId(item.id);
        if (!producto) return;
        const info = precioProducto(producto);
        if (item.precio !== info.precio || item.precioOriginal !== info.original) {
            item.precio = info.precio;
            item.precioOriginal = info.original;
            cambio = true;
        }
    });

    if (cambio) guardarCarrito(carrito);
}

/* Cuánto se ahorra el cliente con las ofertas del carrito */
function ahorroCarrito() {
    return leerCarrito().reduce(function (suma, item) {
        const original = Number(item.precioOriginal) || item.precio;
        return suma + Math.max(0, original - item.precio) * item.cantidad;
    }, 0);
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

/* Cuenta los pedidos acumulados de TODOS los clientes en la tienda */
function contarTodosLosPedidosGlobales() {
    let total = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        if (clave && clave.startsWith('kookstore_pedidos_')) {
            const datos = localStorage.getItem(clave);
            if (datos) {
                try {
                    const lista = JSON.parse(datos);
                    total += lista.length;
                } catch (e) {
                    // ignora registros con formato incorrecto
                }
            }
        }
    }
    return total;
}

/* Arma un folio global único consecutivo: KS-2026-001, KS-2026-002, ... */
function generarFolio() {
    const consecutivo = contarTodosLosPedidosGlobales() + 1;
    let numero = String(consecutivo);
    while (numero.length < 3) {
        numero = '0' + numero;
    }
    return 'KS-' + new Date().getFullYear() + '-' + numero;
}

/* Convierte el carrito actual en un pedido del historial,
   descuenta el inventario y deja el carrito vacío.
   "envio" = { nombre: 'Envío Estándar', costo: 150 }
   Devuelve el pedido creado. */
function registrarPedido(envio) {
    const carrito = leerCarrito();
    if (carrito.length === 0) return null;

    envio = envio || { nombre: 'Envío Estándar', costo: 0 };

    const pedidos = leerPedidos();
    const folio = 'KS-2026-' + Math.floor(1000 + Math.random() * 9000);
    const ahora = new Date();
    const subtotal = totalCarrito();

    // Resumen en texto para la tabla del Admin: "2x BT21 Mini (Koya), 1x IN LIFE"
    const resumenTexto = carrito
        .map(item => item.cantidad + 'x ' + item.nombre + (item.opcion ? ' (' + item.opcion + ')' : ''))
        .join(', ');

    const nuevoPedido = {
        folio: folio,
        fecha: ahora.toLocaleDateString('es-MX'),
        hora: ahora.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        articulos: [...carrito],
        resumen: resumenTexto,
        subtotal: subtotal,
        envio: envio,
        total: subtotal + Number(envio.costo || 0),
        estado: 'Pagado'
    };

    pedidos.unshift(nuevoPedido);
    guardarPedidos(pedidos);

    // El inventario baja en cuanto se paga
    if (typeof ajustarStock === 'function') {
        ajustarStock(carrito, -1);
    }

    vaciarCarrito();
    return nuevoPedido;
}

/* ---------------------------------------------------------
   ESTADOS DEL PEDIDO (compartidos por Admin y Rastreo)
   --------------------------------------------------------- */
const ESTADOS_PEDIDO = ['Pagado', 'En preparación', 'En camino', 'Entregado', 'Cancelado'];

/* Los pedidos viejos decían "En proceso"; ahora es "En preparación" */
function normalizarEstado(estado) {
    const texto = (estado || 'Pagado').trim();
    if (texto.toLowerCase() === 'en proceso') return 'En preparación';
    if (texto.toLowerCase() === 'pedido cancelado') return 'Cancelado';
    return texto;
}

/* "En preparación" -> "en-preparacion" (para clases CSS) */
function claseEstado(estado) {
    return normalizarEstado(estado)
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-');
}

function esPedidoCancelado(pedido) {
    return normalizarEstado(pedido && pedido.estado) === 'Cancelado';
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

/* Mensaje flotante de confirmación en la esquina.
   Si la página cargó notificaciones.js usa el toast moderno. */
function mostrarToast(mensaje, tipo) {
    if (typeof kookToast === 'function') {
        kookToast(mensaje, tipo || 'exito');
        return;
    }

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