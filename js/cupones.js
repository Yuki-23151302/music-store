/* =========================================================
   KOOKSTORE.MX - CÓDIGOS DE DESCUENTO (CUPONES)
   ---------------------------------------------------------
   Los cupones se crean en el Panel Admin y se muestran en
   pages/promociones.html. El cliente pega el código en el
   detalle del producto o en el carrito.

   Reglas (como en las tiendas reales):
     - Se necesita sesión iniciada para canjear un código.
     - Cada cuenta puede usar cada código UNA sola vez.
     - El código cuenta como usado hasta que se paga el pedido.
     - Solo un código por carrito.
     - Si el Admin cancela el pedido, el código se libera.

   Datos:
     kookstore_cupones -> [{
         id, codigo: "KPOP15", titulo, descripcion,
         tipo: "porcentaje" | "monto", valor: 15,
         productoId: "" (toda la tienda) | "bt21-mini",
         inicio: "AAAA-MM-DD", fin: "AAAA-MM-DD",   // opcionales
         activo: true,
         usos: [{ email, fecha, folio }]
     }]
     kookstore_cupon_<cliente> -> código aplicado al carrito

   Necesita: datos-productos.js, sesion.js y carrito.js
   ========================================================= */

const CLAVE_CUPONES = 'kookstore_cupones';

function leerCupones() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_CUPONES)) || [];
    } catch (e) {
        return [];
    }
}

function guardarCupones(cupones) {
    localStorage.setItem(CLAVE_CUPONES, JSON.stringify(cupones));
}

/* " kpop 15 " -> "KPOP15" */
function normalizarCodigo(codigo) {
    return String(codigo || '').toUpperCase().replace(/\s+/g, '');
}

function buscarCupon(codigo) {
    const limpio = normalizarCodigo(codigo);
    return leerCupones().find(c => c.codigo === limpio) || null;
}

/* "activo" | "programado" | "vencido" | "pausado" (mismas reglas que las ofertas) */
function estadoCupon(cupon) {
    const hoy = fechaHoyISO();
    if (!cupon.activo) return 'pausado';
    if (cupon.fin && hoy > cupon.fin) return 'vencido';
    if (cupon.inicio && hoy < cupon.inicio) return 'programado';
    return 'activo';
}

function haySesionCliente() {
    return !!usuarioActivo() && !esAdmin();
}

/* ¿La cuenta actual ya canjeó este código? */
function cuponUsadoPorCliente(cupon) {
    const email = clienteActual();
    return (cupon.usos || []).some(u => u.email === email);
}

/* Texto corto del descuento: "-15%", "-$100" o "-$99.50" */
function textoDescuentoCupon(cupon) {
    const valor = Number(cupon.valor) || 0;
    if (cupon.tipo !== 'monto') return '-' + valor + '%';
    return Number.isInteger(valor)
        ? '-$' + valor.toLocaleString('es-MX')
        : '-' + formatearPrecio(valor).replace(' MXN', '');
}

/* "Toda la tienda" o el nombre del producto */
function alcanceCupon(cupon) {
    if (!cupon.productoId) return 'Toda la tienda';
    const producto = obtenerProductoPorId(cupon.productoId);
    return producto ? producto.nombre : 'Producto no disponible';
}

/* ---------------------------------------------------------
   VALIDACIÓN DE UN CÓDIGO
   Devuelve { ok, cupon, mensaje }.
   productoId (opcional): el código se está usando en ese producto.
   --------------------------------------------------------- */
function validarCupon(codigo, productoId) {
    const limpio = normalizarCodigo(codigo);
    if (!limpio) return { ok: false, mensaje: 'Escribe o pega un código de descuento.' };

    const cupon = buscarCupon(limpio);
    if (!cupon) return { ok: false, mensaje: 'El código "' + limpio + '" no existe. Revisa que esté bien escrito.' };

    const estado = estadoCupon(cupon);
    if (estado === 'pausado') return { ok: false, cupon, mensaje: 'Este código no está disponible por ahora.' };
    if (estado === 'vencido') return { ok: false, cupon, mensaje: 'Este código ya expiró.' };
    if (estado === 'programado') return { ok: false, cupon, mensaje: 'Este código podrá usarse a partir del ' + fechaLarga(cupon.inicio) + '.' };

    if (!haySesionCliente()) return { ok: false, cupon, mensaje: 'Inicia sesión con tu cuenta para canjear códigos de descuento.' };
    if (cuponUsadoPorCliente(cupon)) return { ok: false, cupon, mensaje: 'Ya usaste el código ' + cupon.codigo + '. Cada código se canjea una sola vez.' };

    if (productoId && cupon.productoId && cupon.productoId !== productoId) {
        return { ok: false, cupon, mensaje: 'Este código solo aplica a "' + alcanceCupon(cupon) + '".' };
    }

    return { ok: true, cupon, mensaje: 'Código ' + cupon.codigo + ' aplicado.' };
}

/* "2026-10-31" -> "31 de octubre" */
function fechaLarga(iso) {
    if (!iso) return '';
    const [anio, mes, dia] = iso.split('-').map(Number);
    return new Date(anio, mes - 1, dia).toLocaleDateString('es-MX', { day: 'numeric', month: 'long' });
}

/* ---------------------------------------------------------
   CUPÓN APLICADO AL CARRITO
   --------------------------------------------------------- */
function claveCuponCarrito() {
    return 'kookstore_cupon_' + clienteActual();
}

function codigoAplicado() {
    return localStorage.getItem(claveCuponCarrito()) || '';
}

function aplicarCuponAlCarrito(codigo, productoId) {
    const resultado = validarCupon(codigo, productoId);
    if (resultado.ok) localStorage.setItem(claveCuponCarrito(), resultado.cupon.codigo);
    return resultado;
}

function quitarCuponDelCarrito() {
    localStorage.removeItem(claveCuponCarrito());
}

/* Descuento en pesos de un cupón sobre una lista de artículos.
   Se calcula sobre el precio que ya trae la oferta (si la hay). */
function calcularDescuentoCupon(cupon, articulos) {
    if (!cupon) return 0;
    const base = (articulos || [])
        .filter(item => !cupon.productoId || item.id === cupon.productoId)
        .reduce((suma, item) => suma + item.precio * item.cantidad, 0);
    if (base <= 0) return 0;

    const valor = Number(cupon.valor) || 0;
    const descuento = cupon.tipo === 'monto' ? Math.min(valor, base) : base * valor / 100;
    return Math.round(descuento * 100) / 100;
}

/* Estado del cupón del carrito para mostrarlo:
   { codigo, cupon, descuento, valido, mensaje } o null si no hay */
function infoCuponCarrito() {
    const codigo = codigoAplicado();
    if (!codigo) return null;

    const resultado = validarCupon(codigo);
    const carrito = leerCarrito();
    if (!resultado.ok) {
        return { codigo, cupon: resultado.cupon, descuento: 0, valido: false, mensaje: resultado.mensaje };
    }

    const descuento = calcularDescuentoCupon(resultado.cupon, carrito);
    if (descuento <= 0) {
        return {
            codigo, cupon: resultado.cupon, descuento: 0, valido: false,
            mensaje: 'Este código aplica a "' + alcanceCupon(resultado.cupon) + '". Agrégalo a tu carrito para usarlo.'
        };
    }

    return { codigo, cupon: resultado.cupon, descuento, valido: true, mensaje: resultado.mensaje };
}

/* ---------------------------------------------------------
   CANJE (se llama al pagar) Y LIBERACIÓN (al cancelar)
   --------------------------------------------------------- */
function canjearCupon(codigo, email, folio) {
    const cupones = leerCupones();
    const cupon = cupones.find(c => c.codigo === normalizarCodigo(codigo));
    if (!cupon) return;
    cupon.usos = cupon.usos || [];
    if (!cupon.usos.some(u => u.email === email && u.folio === folio)) {
        cupon.usos.push({ email: email, folio: folio, fecha: new Date().toLocaleString('es-MX') });
    }
    guardarCupones(cupones);
}

function liberarCupon(codigo, email, folio) {
    const cupones = leerCupones();
    const cupon = cupones.find(c => c.codigo === normalizarCodigo(codigo));
    if (!cupon) return;
    cupon.usos = (cupon.usos || []).filter(u => !(u.email === email && u.folio === folio));
    guardarCupones(cupones);
}
