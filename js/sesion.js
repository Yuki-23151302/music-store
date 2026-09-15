/* =========================================================
   KOOKSTORE.MX - SESIÓN DE USUARIO
   ---------------------------------------------------------
   Maneja el alta de usuarios, el inicio y el cierre de
   sesión usando localStorage (no requiere servidor).

   Claves que se guardan en el navegador:
     kookstore_usuarios -> lista de todas las cuentas creadas
     kookstore_sesion   -> correo del usuario que inició sesión

   NOTA: este archivo debe cargarse ANTES que carrito.js,
   porque el carrito y el historial se guardan por usuario.
   ========================================================= */

const CLAVE_USUARIOS = 'kookstore_usuarios';
const CLAVE_SESION = 'kookstore_sesion';

/* ---------------------------------------------------------
   RUTAS
   El sitio tiene páginas en la raíz (index.html) y dentro de
   la carpeta /pages/. Estas funciones devuelven la ruta
   correcta según dónde estemos parados.
   --------------------------------------------------------- */

/* true si la página actual vive dentro de /pages/ */
function estaEnSubcarpeta() {
    if (location.pathname.toLowerCase().indexOf('/pages/') !== -1) {
        return true;
    }
    // Respaldo por si el archivo se abre de una forma distinta
    return document.querySelector('link[href^="../css/"]') !== null;
}

/* Prefijo para llegar a una página de /pages/ */
function rutaPaginas() {
    return estaEnSubcarpeta() ? '' : 'pages/';
}

/* Ruta para llegar a la raíz del proyecto (imágenes, index) */
function rutaRaiz() {
    return estaEnSubcarpeta() ? '../' : '';
}

/* ---------------------------------------------------------
   USUARIOS
   --------------------------------------------------------- */

/* Lee la lista completa de cuentas registradas */
function leerUsuarios() {
    const datos = localStorage.getItem(CLAVE_USUARIOS);
    return datos ? JSON.parse(datos) : [];
}

/* Guarda la lista completa de cuentas registradas */
function guardarUsuarios(usuarios) {
    localStorage.setItem(CLAVE_USUARIOS, JSON.stringify(usuarios));
}

/* Busca una cuenta por su correo. Devuelve null si no existe. */
function buscarUsuarioPorEmail(email) {
    const usuarios = leerUsuarios();
    for (let i = 0; i < usuarios.length; i++) {
        if (usuarios[i].email === email) {
            return usuarios[i];
        }
    }
    return null;
}

/* Saca las iniciales para el avatar: "Sofia Park" -> "SP" */
function inicialesDe(nombre) {
    const partes = nombre.trim().split(' ');
    let iniciales = '';
    for (let i = 0; i < partes.length && iniciales.length < 2; i++) {
        if (partes[i].length > 0) {
            iniciales += partes[i].charAt(0).toUpperCase();
        }
    }
    return iniciales === '' ? 'KS' : iniciales;
}

/* Devuelve el mes y año actuales: "Septiembre 2026" */
function mesActual() {
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const hoy = new Date();
    return meses[hoy.getMonth()] + ' ' + hoy.getFullYear();
}

/* ---------------------------------------------------------
   ALTA DE USUARIO (REGISTRO)
   Crea la cuenta y deja la sesión iniciada.
   --------------------------------------------------------- */
function registrarUsuario(nombre, email, password) {
    // Valores por defecto para que el flujo nunca se detenga
    // aunque el formulario se envíe vacío (no es una validación:
    // no se bloquea ni se avisa nada, solo se rellena).
    if (!nombre) {
        nombre = 'Fan Kookstore';
    }
    if (!email) {
        email = 'invitado@kookstore.mx';
    }

    const usuarios = leerUsuarios();
    const existente = buscarUsuarioPorEmail(email);

    // Si el correo ya estaba dado de alta, solo actualizamos los datos
    if (existente) {
        existente.nombre = nombre;
        existente.password = password;
        existente.avatar = inicialesDe(nombre);
        guardarUsuarios(usuarios.map(u => u.email === email ? existente : u));
        localStorage.setItem(CLAVE_SESION, email);
        return existente;
    }

    const nuevoUsuario = {
        nombre: nombre,
        email: email,
        password: password,
        avatar: inicialesDe(nombre),
        miembroDesde: mesActual(),
        direccion: 'Av. Universidad #123, Col. Centro\nC.P. 20000, Aguascalientes, Ags.\nMéxico'
    };

    usuarios.push(nuevoUsuario);
    guardarUsuarios(usuarios);
    localStorage.setItem(CLAVE_SESION, email);
    return nuevoUsuario;
}

/* ---------------------------------------------------------
   INICIO DE SESIÓN
   Sin validaciones: si el correo no existe, se da de alta
   en ese momento para que el flujo nunca se detenga.
   --------------------------------------------------------- */
function iniciarSesion(email, password) {
    if (!email) {
        email = 'invitado@kookstore.mx';
    }

    const usuario = buscarUsuarioPorEmail(email);

    if (usuario) {
        localStorage.setItem(CLAVE_SESION, email);
        return usuario;
    }

    // El nombre se arma con la parte del correo antes de la @
    const nombreAutomatico = email.split('@')[0] || 'Fan Kookstore';
    return registrarUsuario(nombreAutomatico, email, password);
}

/* Cierra la sesión (el historial de compras NO se borra) */
function cerrarSesion() {
    localStorage.removeItem(CLAVE_SESION);
}

/* Devuelve el usuario con sesión iniciada, o null si no hay */
function usuarioActivo() {
    const email = localStorage.getItem(CLAVE_SESION);
    if (!email) {
        return null;
    }
    return buscarUsuarioPorEmail(email);
}

/* Identificador con el que se guardan carrito e historial.
   Si nadie inició sesión se usa la bolsa "invitado". */
function clienteActual() {
    const usuario = usuarioActivo();
    return usuario ? usuario.email : 'invitado';
}

/* ---------------------------------------------------------
   ENCABEZADO
   Cambia el botón "Mi Cuenta" según haya sesión o no.
   --------------------------------------------------------- */
function pintarHeaderUsuario() {
    const contenedor = document.querySelector('.iconos-usuario');
    if (!contenedor) {
        return;
    }

    const usuario = usuarioActivo();
    const paginas = rutaPaginas();

    // Conservamos el botón del carrito tal como está en la página
    let botonCarrito = contenedor.querySelector('.btn-carrito');
    let htmlCarrito = botonCarrito
        ? botonCarrito.outerHTML
        : '<a href="' + paginas + 'carrito.html" class="btn-carrito">Carrito</a>';

    if (usuario) {
        contenedor.innerHTML =
            '<a href="' + paginas + 'perfil.html" class="btn-login" title="Ir a mi perfil">Hola, ' +
            usuario.nombre.split(' ')[0] + '</a>' +
            '<a href="#" class="btn-salir" id="btn-cerrar-sesion-header">Salir</a>' +
            htmlCarrito;

        document.getElementById('btn-cerrar-sesion-header')
            .addEventListener('click', function (evento) {
                evento.preventDefault();
                cerrarSesion();
                location.href = rutaRaiz() + 'index.html';
            });
    } else {
        contenedor.innerHTML =
            '<a href="' + paginas + 'login.html" class="btn-login">Mi Cuenta</a>' +
            htmlCarrito;
    }
}

document.addEventListener('DOMContentLoaded', pintarHeaderUsuario);
