/* =========================================================
   KOOKSTORE.MX - PUBLICA TU PRODUCTO (MODELO C2C)
   ---------------------------------------------------------
   Un fan publica un artículo para venderlo a otros fans.

   - El formulario NO tiene validaciones: "Publicar" funciona
     aunque todos los campos estén vacíos.
   - La foto es simulada: solo se muestra en el navegador,
     no se sube a ningún servidor.
   - Al publicar aparece "Publicado (simulado)" y la publicación
     se agrega a "Mis publicaciones" (pages/mis-publicaciones.html)
     y al inicio de "Publicaciones recientes".
   - Los datos son compartidos con "Mis publicaciones" a través
     de js/publicaciones-c2c.js.

   Necesita: notificaciones.js, sesion.js, carrito.js y
   publicaciones-c2c.js
   ========================================================= */

/* Publicaciones de ejemplo (simuladas) */
const PUBLICACIONES_EJEMPLO = [
    {
        nombre: 'Photocard Jimin - Map of the Soul',
        precio: 180,
        descripcion: 'Original, en perfecto estado. Siempre guardada en funda.',
        foto: '../assets/img/productos/albums/albumlyabts.jpg',
        vendedor: 'Karla Army',
        fecha: new Date(2026, 9, 30, 18, 20).toISOString()
    },
    {
        nombre: 'Peluche SKZOO Leebit',
        precio: 250,
        descripcion: 'Con etiqueta, solo se exhibió en repisa.',
        foto: '../assets/img/productos/peluches/skzoomini.jpg',
        vendedor: 'Diego STAY',
        fecha: new Date(2026, 9, 29, 12, 5).toISOString()
    },
    {
        nombre: 'Lightstick Candy Bong Z',
        precio: 1100,
        descripcion: 'Funciona perfecto, incluye caja y correa.',
        foto: '../assets/img/productos/lightsticks/candybong.jpg',
        vendedor: 'Fer Once',
        fecha: new Date(2026, 9, 27, 20, 40).toISOString()
    }
];

/* ---------------------------------------------------------
   TARJETA DE PUBLICACIÓN (lista y vista previa)
   Los campos vacíos muestran un texto de relleno.
   --------------------------------------------------------- */
function htmlPublicacion(pub, esPreview) {
    const nombre = nombrePublicacion(pub);
    const textoPrecio = precioPublicacion(pub);
    const descripcion = descripcionPublicacion(pub);
    const foto = fotoPublicacion(pub);
    const fecha = esPreview
        ? 'Ahora'
        : new Date(pub.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' });

    return '' +
        '<div class="publicacion-foto' + (pub.foto ? '' : ' sin-foto') + '">' +
        '<img src="' + escaparHTML(foto) + '" alt="' + escaparHTML(nombre) + '" onerror="this.onerror=null; this.src=\'../assets/img/logo.png\'">' +
        '<span class="publicacion-sello">De fan a fan</span>' +
        '</div>' +
        '<div class="publicacion-info">' +
        '<h3>' + escaparHTML(nombre) + '</h3>' +
        '<p class="publicacion-precio">' + textoPrecio + '</p>' +
        '<p class="publicacion-descripcion">' + escaparHTML(descripcion) + '</p>' +
        '<div class="publicacion-pie">' +
        '<span class="publicacion-vendedor">👤 ' + escaparHTML(pub.vendedor || 'Fan anónimo') + '</span>' +
        '<span>' + fecha + '</span>' +
        '</div>' +
        '</div>';
}

/* Franja "Tienes N publicaciones · Ver mis publicaciones" */
function pintarResumenMisPublicaciones() {
    const total = misPublicaciones().length;
    document.getElementById('total-mis-publicaciones').textContent = total;
    document.getElementById('texto-mis-publicaciones').textContent =
        total === 1 ? 'publicación activa' : 'publicaciones activas';
}

function pintarPublicaciones() {
    pintarResumenMisPublicaciones();
    const lista = document.getElementById('lista-publicaciones');
    lista.innerHTML = leerPublicaciones().concat(PUBLICACIONES_EJEMPLO)
        .map(pub => '<article class="publicacion-card">' + htmlPublicacion(pub, false) + '</article>')
        .join('');
}

/* ---------------------------------------------------------
   FORMULARIO
   --------------------------------------------------------- */
let fotoSeleccionada = '';

function datosFormulario() {
    return {
        id: generarIdPublicacion(),
        dueno: clienteActual(),
        nombre: document.getElementById('vender-nombre').value,
        precio: document.getElementById('vender-precio').value,
        descripcion: document.getElementById('vender-descripcion').value,
        foto: fotoSeleccionada,
        vendedor: nombreVendedor(),
        fecha: new Date().toISOString()
    };
}

function actualizarVistaPrevia() {
    document.getElementById('tarjeta-preview').innerHTML = htmlPublicacion(datosFormulario(), true);
}

/* Foto simulada: se reduce y solo se muestra en el navegador */
function cargarFoto(archivo) {
    reducirFoto(archivo, mostrarFoto);
}

function mostrarFoto(ruta) {
    fotoSeleccionada = ruta || '';
    const preview = document.getElementById('vender-foto-preview');
    const texto = document.getElementById('zona-foto-texto');
    preview.hidden = !ruta;
    if (ruta) preview.src = ruta; else preview.removeAttribute('src');
    texto.classList.toggle('sobre-foto', !!ruta);
    texto.querySelector('strong').textContent = ruta ? 'Cambiar foto' : 'Elige o arrastra una foto';
    document.getElementById('btn-quitar-foto').hidden = !ruta;
    actualizarVistaPrevia();
}

/* Publicar SIN validaciones: siempre publica y siempre confirma */
function publicarProducto(e) {
    e.preventDefault();

    const publicacion = datosFormulario();
    const publicaciones = leerPublicaciones();
    publicaciones.unshift(publicacion);
    guardarPublicaciones(publicaciones);

    // Se agrega arriba de "Publicaciones recientes"
    pintarPublicaciones();
    const primera = document.querySelector('#lista-publicaciones .publicacion-card');
    if (primera) primera.classList.add('publicacion-nueva');

    // Mensaje de confirmación: se puede ir directo a "Mis publicaciones"
    kookConfirmar({
        tipo: 'exito',
        titulo: 'Publicado (simulado)',
        texto: 'Tu producto ya aparece en "Mis publicaciones" y en las publicaciones recientes de la comunidad.',
        detalle: nombrePublicacion(publicacion),
        textoConfirmar: 'Ver mis publicaciones',
        textoCancelar: 'Publicar otro'
    }).then(function (irAMisPublicaciones) {
        if (irAMisPublicaciones) {
            location.href = 'mis-publicaciones.html?nueva=' + encodeURIComponent(publicacion.id);
        } else if (primera) {
            primera.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    // Se limpia el formulario para publicar otro
    document.getElementById('form-vender').reset();
    mostrarFoto('');
}

document.addEventListener('DOMContentLoaded', function () {
    pintarPublicaciones();
    actualizarVistaPrevia();

    const formulario = document.getElementById('form-vender');
    formulario.addEventListener('submit', publicarProducto);
    formulario.addEventListener('input', actualizarVistaPrevia);

    // Foto: clic o arrastrar y soltar
    const zona = document.getElementById('zona-foto');
    document.getElementById('vender-foto').addEventListener('change', function () {
        if (this.files[0]) cargarFoto(this.files[0]);
    });
    ['dragenter', 'dragover'].forEach(ev => zona.addEventListener(ev, function (e) {
        e.preventDefault();
        zona.classList.add('arrastrando');
    }));
    ['dragleave', 'drop'].forEach(ev => zona.addEventListener(ev, function (e) {
        e.preventDefault();
        zona.classList.remove('arrastrando');
    }));
    zona.addEventListener('drop', function (e) {
        const archivo = e.dataTransfer.files[0];
        if (archivo && archivo.type.startsWith('image/')) cargarFoto(archivo);
    });
    document.getElementById('btn-quitar-foto').addEventListener('click', function () {
        document.getElementById('vender-foto').value = '';
        mostrarFoto('');
    });

    // Publicaciones hechas en otra pestaña
    window.addEventListener('storage', function (e) {
        if (e.key === CLAVE_PUBLICACIONES) pintarPublicaciones();
    });
});
