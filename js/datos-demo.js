/* =========================================================
   KOOKSTORE.MX - DATOS DE DEMOSTRACIÓN
   ---------------------------------------------------------
   Crea dos cuentas de ejemplo con historial de compras ya
   registrado, para poder mostrar el sitio funcionando sin
   tener que capturar pedidos a mano.

   CUENTAS:
     sofia@example.com     / kookstore123  -> 3 pedidos
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
        nombre: 'Sofia Park',
        email: 'sofia@example.com',
        password: 'kookstore123',
        avatar: 'SP',
        miembroDesde: 'Marzo 2026',
        direccion: 'Av. Universidad #123, Col. Centro\nC.P. 20000, Aguascalientes, Ags.\nMéxico'
    },
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

    'sofia@example.com': [
        {
            folio: 'KS-2026-003',
            fecha: '12/9/2026',
            hora: '06:45 p.m.',
            estado: 'En camino',
            total: 1700,
            resumen: '1x Nachim Bong',
            articulos: [
                {
                    id: 'lightstick-nachim-bong',
                    nombre: 'Nachim Bong',
                    grupo: 'Stray Kids',
                    precio: 1700,
                    imagen: 'assets/img/productos/lightsticks/nachimbongskz.jpg',
                    cantidad: 1,
                    opcion: ''
                }
            ]
        },
        {
            folio: 'KS-2026-002',
            fecha: '28/8/2026',
            hora: '11:20 a.m.',
            estado: 'Entregado',
            total: 780,
            resumen: '2x BT21 Frutitas, 1x BT21 Rainbow',
            articulos: [
                {
                    id: 'bt21frutita',
                    nombre: 'BT21 Frutitas',
                    grupo: 'BTS',
                    precio: 180,
                    imagen: 'assets/img/productos/peluches/bt21frutita.jpg',
                    cantidad: 2,
                    opcion: 'Cooky (Jungkook)'
                },
                {
                    id: 'bt21-rainbow',
                    nombre: 'BT21 Rainbow',
                    grupo: 'BTS',
                    precio: 420,
                    imagen: 'assets/img/productos/peluches/bt21rainbow.jpg',
                    cantidad: 1,
                    opcion: 'Tata (V)'
                }
            ]
        },
        {
            folio: 'KS-2026-001',
            fecha: '15/8/2026',
            hora: '09:05 p.m.',
            estado: 'Entregado',
            total: 1900,
            resumen: '1x Love Yourself: Answer, 1x Army Bomb - Map of the Soul',
            articulos: [
                {
                    id: 'album-love-yourself',
                    nombre: 'Love Yourself: Answer',
                    grupo: 'BTS',
                    precio: 950,
                    imagen: 'assets/img/productos/albums/albumlyabts.jpg',
                    cantidad: 1,
                    opcion: 'Versión L'
                },
                {
                    id: 'lightstick-army-bomb',
                    nombre: 'Army Bomb - Map of the Soul',
                    grupo: 'BTS',
                    precio: 950,
                    imagen: 'assets/img/productos/lightsticks/armybombver4.jpg',
                    cantidad: 1,
                    opcion: ''
                }
            ]
        }
    ],

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
