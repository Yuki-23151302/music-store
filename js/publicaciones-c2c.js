/* =========================================================
   KOOKSTORE.MX - PUBLICACIONES C2C (DATOS COMPARTIDOS)
   ---------------------------------------------------------
   Lo usan las dos pantallas del modelo C2C:
     pages/vender.html             -> "Publica tu producto"
     pages/mis-publicaciones.html  -> "Mis publicaciones"

   Cada publicación se guarda en el navegador
   (kookstore_publicaciones_c2c) así:
     {
       id: "pub-1730...",
       dueno: "yuridia@kookstore.mx" | "invitado",
       nombre, precio, descripcion, foto,
       vendedor: "Yuridia Flores",
       fecha: "2026-11-01T...",       // cuándo se publicó
       editada: "2026-11-02T..."      // última edición (opcional)
     }

   Necesita: sesion.js (clienteActual, usuarioActivo)
   ========================================================= */

const CLAVE_PUBLICACIONES = 'kookstore_publicaciones_c2c';

function generarIdPublicacion() {
    return 'pub-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
}

/* Lee todas las publicaciones. Las que se crearon antes de que
   existiera "Mis publicaciones" no tenían id ni dueño: se les
   asignan aquí (quedan como de quien las está viendo). */
function leerPublicaciones() {
    let lista;
    try {
        lista = JSON.parse(localStorage.getItem(CLAVE_PUBLICACIONES)) || [];
    } catch (e) {
        return [];
    }

    let cambio = false;
    lista.forEach(function (pub) {
        if (!pub.id) { pub.id = generarIdPublicacion(); cambio = true; }
        if (!pub.dueno) { pub.dueno = clienteActual(); cambio = true; }
    });
    if (cambio) guardarPublicaciones(lista);
    return lista;
}

function guardarPublicaciones(lista) {
    try {
        localStorage.setItem(CLAVE_PUBLICACIONES, JSON.stringify(lista));
    } catch (e) {
        // Si una foto es muy pesada y no cabe, esa publicación se guarda sin foto
        const conFoto = lista.find(p => p.foto && p.foto.startsWith('data:'));
        if (conFoto) conFoto.foto = '';
        localStorage.setItem(CLAVE_PUBLICACIONES, JSON.stringify(lista));
    }
    if (typeof pintarInsigniasC2C === 'function') pintarInsigniasC2C();
}

/* Solo las publicaciones de quien tiene la sesión (o del invitado) */
function misPublicaciones() {
    const yo = clienteActual();
    return leerPublicaciones().filter(p => p.dueno === yo);
}

/* Nombre de quien publica: su cuenta, o "Fan anónimo" */
function nombreVendedor() {
    const usuario = typeof usuarioActivo === 'function' ? usuarioActivo() : null;
    return usuario && usuario.nombre ? usuario.nombre : 'Fan anónimo';
}

/* ---------- Textos de relleno para campos vacíos ---------- */
function nombrePublicacion(pub) {
    return (pub.nombre || '').trim() || 'Producto sin nombre';
}

function precioPublicacion(pub) {
    const precio = Number(pub.precio);
    return pub.precio === '' || pub.precio === undefined || isNaN(precio)
        ? 'Precio a convenir'
        : formatearPrecio(Math.max(0, precio));
}

function descripcionPublicacion(pub) {
    return (pub.descripcion || '').trim() || 'Sin descripción.';
}

function fotoPublicacion(pub) {
    return pub.foto || '../assets/img/logo.png';
}

/* Reduce una foto a máx. 600 px (para que quepa en el navegador).
   La foto es simulada: nunca se sube a ningún servidor. */
function reducirFoto(archivo, alTerminar) {
    const lector = new FileReader();
    lector.onload = function (evento) {
        const img = new Image();
        img.onload = function () {
            const escala = Math.min(1, 600 / Math.max(img.width, img.height));
            const lienzo = document.createElement('canvas');
            lienzo.width = Math.round(img.width * escala);
            lienzo.height = Math.round(img.height * escala);
            lienzo.getContext('2d').drawImage(img, 0, 0, lienzo.width, lienzo.height);
            alTerminar(lienzo.toDataURL('image/jpeg', 0.8));
        };
        img.src = evento.target.result;
    };
    lector.readAsDataURL(archivo);
}
