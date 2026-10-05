/* =========================================================
   KOOKSTORE.MX - DATOS DE DEMOSTRACIÓN
   ---------------------------------------------------------
   Crea dos cuentas de ejemplo con historial de compras ya
   registrado, para poder mostrar el sitio funcionando sin
   tener que capturar pedidos a mano.

   CUENTA:
     yuridia@kookstore.mx  / kookstore123  -> 1 pedido

   Sirven además para comprobar que cada cliente ve SOLO su
   historial: las dos cuentas tienen pedidos distintos.

   Esto se ejecuta UNA SOLA VEZ por navegador. Después se
   marca la bandera kookstore_demo_cargado y ya no vuelve a
   tocar nada, así que las compras que hagas tú se conservan.

   PARA QUITAR LA DEMOSTRACIÓN:
   borra la línea <script src=".../js/datos-demo.js"></script>
   de las páginas HTML.

   Necesita que sesion.js se cargue ANTES.
   ========================================================= */

const CLAVE_DEMO = 'kookstore_demo_cargado';

/* Las dos cuentas de ejemplo */
const USUARIOS_DEMO = [
    {
        nombre: 'Yuridia Flores',
        email: 'yuridia@kookstore.mx',
        password: 'kookstore123',
        avatar: 'YF',
        miembroDesde: 'Junio 2026',
        direccion: 'Calle Madero #45, Col. Del Valle\nC.P. 20130, Aguascalientes, Ags.\nMéxico'
    }
];

/* Historial de cada cuenta. El pedido más reciente va primero. */
const PEDIDOS_DEMO = {

    'yuridia@kookstore.mx': [
        {
            folio: 'KS-2026-001',
            fecha: '5/9/2026',
            hora: '04:30 p.m.',
            estado: 'En camino',
            total: 1500,
            resumen: '1x Candy Bong',
            articulos: [
                {
                    id: 'lightstick-candy-bong',
                    nombre: 'Candy Bong',
                    grupo: 'TWICE',
                    precio: 1500,
                    imagen: 'assets/img/productos/lightsticks/candybong.jpg',
                    cantidad: 1,
                    opcion: ''
                }
            ]
        }
    ]
};

/* Deja las cuentas y sus pedidos guardados en el navegador */
function cargarDatosDemo() {

    // Si ya se cargó una vez, no se vuelve a tocar nada
    if (localStorage.getItem(CLAVE_DEMO)) {
        return;
    }

    const usuarios = leerUsuarios();

    for (let i = 0; i < USUARIOS_DEMO.length; i++) {
        const demo = USUARIOS_DEMO[i];

        // Solo se agrega si esa cuenta todavía no existe
        if (!buscarUsuarioPorEmail(demo.email)) {
            usuarios.push(demo);
        }

        // El historial se guarda con la clave de ESE usuario
        const clave = 'kookstore_pedidos_' + demo.email;
        if (!localStorage.getItem(clave)) {
            localStorage.setItem(clave, JSON.stringify(PEDIDOS_DEMO[demo.email]));
        }
    }

    guardarUsuarios(usuarios);
    localStorage.setItem(CLAVE_DEMO, 'si');
}

cargarDatosDemo();
