/* =========================================================
   KOOKSTORE.MX - DATOS DE DEMOSTRACIÓN
   ---------------------------------------------------------
   Crea dos cuentas de ejemplo con historial de compras ya
   registrado, para poder mostrar el sitio funcionando sin
   tener que capturar pedidos a mano.

   CUENTA:
     yuridia@kookstore.mx  / kookstore123  -> 3 pedidos

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
        },
        // Compras anteriores (ya entregadas) con todos los datos del comprobante
        {
            folio: 'KS-2026-0418',
            fecha: '18/8/2026',
            hora: '07:15 p.m.',
            estado: 'Entregado',
            subtotal: 1590,
            envio: { nombre: 'Envío Exprés', costo: 250 },
            total: 1840,
            resumen: '1x Love Yourself: Answer (Versión S), 2x BT21 Mini',
            metodoPago: { tipo: 'tarjeta', etiqueta: 'Tarjeta •••• 4821', titular: 'YURIDIA FLORES' },
            direccionEnvio: { nombre: 'Yuridia Flores', calle: 'Calle Madero #45, Col. Del Valle', cp: '20130', ciudad: 'Aguascalientes, Ags.' },
            cliente: { nombre: 'Yuridia Flores', email: 'yuridia@kookstore.mx' },
            articulos: [
                { id: 'album-love-yourself', nombre: 'Love Yourself: Answer', grupo: 'BTS', precio: 950, imagen: 'assets/img/productos/albums/albumlyabts.jpg', cantidad: 1, opcion: 'Versión S' },
                { id: 'bt21-mini', nombre: 'BT21 Mini', grupo: 'BTS', precio: 320, imagen: 'assets/img/productos/peluches/bt21mini.jpg', cantidad: 2, opcion: '' }
            ]
        },
        {
            folio: 'KS-2026-0233',
            fecha: '2/7/2026',
            hora: '11:40 a.m.',
            estado: 'Entregado',
            subtotal: 1140,
            envio: { nombre: 'Envío Estándar', costo: 150 },
            total: 1290,
            resumen: '1x IN LIFE, 2x SKZOO Pink',
            metodoPago: { tipo: 'transferencia', etiqueta: 'Transferencia SPEI', referencia: 'KS-581204' },
            direccionEnvio: { nombre: 'Yuridia Flores', calle: 'Calle Madero #45, Col. Del Valle', cp: '20130', ciudad: 'Aguascalientes, Ags.' },
            cliente: { nombre: 'Yuridia Flores', email: 'yuridia@kookstore.mx' },
            articulos: [
                { id: 'in-life', nombre: 'IN LIFE', grupo: 'Stray Kids', precio: 820, imagen: 'assets/img/productos/albums/albuminlifeskz.jpg', cantidad: 1, opcion: '' },
                { id: 'skzoo-pink', nombre: 'SKZOO Pink', grupo: 'Stray Kids', precio: 160, imagen: 'assets/img/productos/peluches/skzoopink.jpg', cantidad: 2, opcion: '' }
            ]
        }
    ]
};

/* Los navegadores que ya cargaron la demostración antes no tienen
   las compras anteriores: se agregan una sola vez al final del
   historial (sin tocar los pedidos que ya existen). */
const CLAVE_DEMO_COMPRAS = 'kookstore_demo_compras_v2';

function completarComprasDemo() {
    if (localStorage.getItem(CLAVE_DEMO_COMPRAS)) return;

    Object.keys(PEDIDOS_DEMO).forEach(function (email) {
        const clave = 'kookstore_pedidos_' + email;
        let historial;
        try {
            historial = JSON.parse(localStorage.getItem(clave)) || [];
        } catch (e) {
            historial = [];
        }
        const folios = historial.map(p => p.folio);
        PEDIDOS_DEMO[email].forEach(function (pedido) {
            if (!folios.includes(pedido.folio)) historial.push(pedido);
        });
        localStorage.setItem(clave, JSON.stringify(historial));
    });

    localStorage.setItem(CLAVE_DEMO_COMPRAS, 'si');
}

/* Cuentas de demostración que ya no se usan. Se borran del
   navegador (cuenta, pedidos, carrito y avisos) en cada carga. */
const CUENTAS_RETIRADAS = ['sofia@example.com'];

function limpiarCuentasRetiradas() {
    const usuarios = leerUsuarios();
    const restantes = usuarios.filter(u => !CUENTAS_RETIRADAS.includes(u.email));
    if (restantes.length !== usuarios.length) {
        guardarUsuarios(restantes);
    }

    CUENTAS_RETIRADAS.forEach(function (email) {
        localStorage.removeItem('kookstore_pedidos_' + email);
        localStorage.removeItem('kookstore_carrito_' + email);
        localStorage.removeItem('kookstore_avisos_cancelacion_' + email);
        if (sessionStorage.getItem('kookstore_sesion') === email) {
            sessionStorage.removeItem('kookstore_sesion');
        }
    });
}

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

limpiarCuentasRetiradas();
cargarDatosDemo();
completarComprasDemo();
