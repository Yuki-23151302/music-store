/* =========================================================
   KOOKSTORE.MX - CATÁLOGO DE DATOS Y PERSISTENCIA
   ========================================================= */

const PRODUCTOS_INICIALES = [

    /* ================= ÁLBUMES ================= */
    {
        id: "album-love-yourself",
        nombre: "Love Yourself: Answer",
        grupo: "BTS",
        precio: 950,
        imagen: "assets/img/productos/albums/albumlyabts.jpg",
        categoria: "albumes",
        etiqueta: "ÁLBUM OFICIAL",
        descripcion: "Álbum recopilatorio oficial de BTS. Incluye CD, photobook detallado, mini libro de notas, photocard aleatoria y póster oficial plegado.",
        opcion: {
            titulo: "Selecciona la Versión:",
            valores: ["Versión S", "Versión E", "Versión L", "Versión F"]
        }
    },
    {
        id: "the-album",
        nombre: "The Album",
        grupo: "BLACKPINK",
        precio: 720,
        imagen: "assets/img/productos/albums/albumbp.jpg",
        categoria: "albumes",
        etiqueta: "ÁLBUM OFICIAL",
        descripcion: "Primer álbum de estudio de BLACKPINK. Incluye CD, photobook de alta calidad, postcards y postales exclusivas."
    },
    {
        id: "in-life",
        nombre: "IN LIFE",
        grupo: "Stray Kids",
        precio: 820,
        imagen: "assets/img/productos/albums/albuminlifeskz.jpg",
        categoria: "albumes",
        etiqueta: "ÁLBUM OFICIAL",
        descripcion: "Álbum repackage oficial de Stray Kids. Incluye CD, photobook, photocards aleatorias y beneficios de preventa."
    },
    {
        id: "momoland",
        nombre: "Show Me",
        grupo: "MOMOLAND",
        precio: 710,
        imagen: "assets/img/productos/albums/albummomoland.jpg",
        categoria: "albumes",
        etiqueta: "ÁLBUM OFICIAL",
        descripcion: "Mini álbum oficial de MOMOLAND. Incluye CD, photobook a color y tarjetas coleccionables."
    },

    /* ================= LIGHTSTICKS ================= */
    {
        id: "lightstick-army-bomb",
        nombre: "Army Bomb - Versión 4 Arirang World Tour",
        grupo: "BTS",
        precio: 950,
        imagen: "assets/img/productos/lightsticks/armybombver4.jpg",
        categoria: "lightsticks",
        etiqueta: "LIGHTSTICK OFICIAL",
        descripcion: "Lightstick oficial de BTS Ver. 4 (MOS Special Edition). Incluye bolsa de tela, correa, photocards de los integrantes y manual."
    },
    {
        id: "lightstick-hammer-bong",
        nombre: "Hammer Bong",
        grupo: "BLACKPINK",
        precio: 1550,
        imagen: "assets/img/productos/lightsticks/lightstickbp.jpg",
        categoria: "lightsticks",
        etiqueta: "LIGHTSTICK OFICIAL",
        descripcion: "Lightstick oficial de BLACKPINK con diseño de martillo y sonido interactivo. Incluye correa para la muñeca."
    },
    {
        id: "lightstick-nachim-bong",
        nombre: "Nachim Bong",
        grupo: "Stray Kids",
        precio: 1700,
        imagen: "assets/img/productos/lightsticks/nachimbongskz.jpg",
        categoria: "lightsticks",
        etiqueta: "LIGHTSTICK OFICIAL",
        descripcion: "Lightstick oficial de Stray Kids (Nachimbong Ver. 2). Conexión Bluetooth con aplicación oficial y modos de luz dinámicos."
    },
    {
        id: "lightstick-candy-bong",
        nombre: "Candy Bong",
        grupo: "TWICE",
        precio: 1500,
        imagen: "assets/img/productos/lightsticks/candybong.jpg",
        categoria: "lightsticks",
        etiqueta: "LIGHTSTICK OFICIAL",
        descripcion: "Lightstick oficial de TWICE. Funciona como lámpara de ambiente y bastón de luz para conciertos con app móvil."
    },

    /* ================= PELUCHES Y DOLLS ================= */
    {
        id: "bt21frutita",
        nombre: "BT21 Frutitas",
        grupo: "BTS",
        precio: 180,
        imagen: "assets/img/productos/peluches/bt21frutita.jpg",
        categoria: "peluches",
        etiqueta: "PELUCHE OFICIAL",
        descripcion: "Adorable peluche de la colección BT21 disfrazados de tiernas frutas. Material ultra suave al tacto, fabricado con materiales hipoalergénicos. Peluche miniatura con llavero incluido.",
        opcion: {
            titulo: "Selecciona el Personaje:",
            valores: ["Koya (RM)", "RJ (Jin)", "Shooky (Suga)", "Mang (J-Hope)", "Chimmy (Jimin)", "Tata (V)", "Cooky (Jungkook)"]
        }
    },
    {
        id: "bt21-floresitas",
        nombre: "BT21 Floresitas",
        grupo: "BTS",
        precio: 320,
        imagen: "assets/img/productos/peluches/bt21florecita.jpg",
        categoria: "peluches",
        etiqueta: "PELUCHE OFICIAL",
        descripcion: "Peluche mediano de la colección BT21 Floresitas. Excelente calidad de bordado y relleno suave.",
        opcion: {
            titulo: "Selecciona el Personaje:",
            valores: ["Koya (RM)", "RJ (Jin)", "Shooky (Suga)", "Mang (J-Hope)", "Chimmy (Jimin)", "Tata (V)", "Cooky (Jungkook)"]
        }
    },
    {
        id: "bt21-rainbow",
        nombre: "BT21 Rainbow",
        grupo: "BTS",
        precio: 420,
        imagen: "assets/img/productos/peluches/bt21rainbow.jpg",
        categoria: "peluches",
        etiqueta: "PELUCHE OFICIAL",
        descripcion: "Peluche grande BT21 Rainbow Edition con detalles coloridos y diseño especial de colección.",
        opcion: {
            titulo: "Selecciona el Personaje:",
            valores: ["Koya (RM)", "RJ (Jin)", "Shooky (Suga)", "Mang (J-Hope)", "Chimmy (Jimin)", "Tata (V)", "Cooky (Jungkook)"]
        }
    },
    {
        id: "bt21-mini",
        nombre: "BT21 Mini",
        grupo: "BTS",
        precio: 320,
        imagen: "assets/img/productos/peluches/bt21mini.jpg",
        categoria: "peluches",
        etiqueta: "PELUCHE OFICIAL",
        descripcion: "Peluche BT21 Mini clásico. Ideal para colgar en mochilas o decorar tu espacio.",
        opcion: {
            titulo: "Selecciona el Personaje:",
            valores: ["Koya (RM)", "RJ (Jin)", "Shooky (Suga)", "Mang (J-Hope)", "Chimmy (Jimin)", "Tata (V)", "Cooky (Jungkook)"]
        }
    },
    {
        id: "skzoo-pink",
        nombre: "Mini skzoo Pink Edition",
        grupo: "Stray Kids",
        precio: 160,
        imagen: "assets/img/productos/peluches/skzoopink.jpg",
        categoria: "peluches",
        etiqueta: "PELUCHE OFICIAL",
        descripcion: "Peluche Skzoo edición especial en tonos rosas. Personajes oficiales de Stray Kids.",
        opcion: {
            titulo: "Selecciona el Personaje:",
            valores: ["Wolf Chan (Bang Chan)", "Leebit (Lee Know)", "Dwaekki (Changbin)", "Jiniret (Hyunjin)", "Han Quokka (Han)", "BbokAri (Felix)", "PuppyM (Seungmin)", "FoxI.Ny (I.N)"]
        }
    },
    {
        id: "skzoo-mini",
        nombre: "Mini skzoo 12 cm",
        grupo: "Stray Kids",
        precio: 220,
        imagen: "assets/img/productos/peluches/skzoomini.jpg",
        categoria: "peluches",
        etiqueta: "PELUCHE OFICIAL",
        descripcion: "Peluche miniatura Skzoo de 12 cm con gancho para llavero. Colecciona a tu miembro favorito.",
        opcion: {
            titulo: "Selecciona el Personaje:",
            valores: ["Wolf Chan (Bang Chan)", "Leebit (Lee Know)", "Dwaekki (Changbin)", "Jiniret (Hyunjin)", "Han Quokka (Han)", "BbokAri (Felix)", "PuppyM (Seungmin)", "FoxI.Ny (I.N)"]
        }
    },
    {
        id: "peluches-blackpink",
        nombre: "Peluches BlackPink",
        grupo: "BLACKPINK",
        precio: 250,
        imagen: "assets/img/productos/peluches/bpdolls.jpg",
        categoria: "peluches",
        etiqueta: "PELUCHE OFICIAL",
        descripcion: "Dolls inspirados en BLACKPINK / K-pop characters. Diseño tierno y oficial.",
        opcion: {
            titulo: "Selecciona el Personaje:",
            valores: ["ChuDeuk (Jisoo)", "JenDeuk (Jennie)", "Rosie (Rosé)", "Lisa (Lisa)"]
        }
    },
    {
        id: "newjeans-bunnies",
        nombre: "New Jeans Bunnies",
        grupo: "NewJeans",
        precio: 200,
        imagen: "assets/img/productos/peluches/njbunnies.jpg",
        categoria: "peluches",
        etiqueta: "PELUCHE OFICIAL",
        descripcion: "Llavero de peluche oficial Buninies de NewJeans. Suave y con los colores característicos.",
        opcion: {
            titulo: "Selecciona el Personaje:",
            valores: ["Bunini Azul (Minji)", "Bunini Rosa (Hanni)", "Bunini Amarillo (Danielle)", "Bunini Verde (Haerin)", "Bunini Morado (Hyein)"]
        }
    }
];

/* ---------------------------------------------------------
   MODELO DE VARIANTES (VERSIONES / PERSONAJES)
   ---------------------------------------------------------
   Cada producto puede tener o no versiones/personajes:

     tieneVariantes: false -> usa "stock" general
     tieneVariantes: true  -> usa "variantes" con stock propio
         tituloVariante: "Selecciona el Personaje:"
         variantes: [ { nombre: "Koya (RM)", stock: 10 }, ... ]
         stock: suma de todas las variantes (se calcula solo)

   Los personajes pueden repetirse entre productos distintos,
   pero cada producto guarda su propio inventario.
   --------------------------------------------------------- */

const STOCK_INICIAL_GENERAL = 20;
const STOCK_INICIAL_VARIANTE = 10;

/* Suma el stock de todas las variantes */
function sumarStockVariantes(variantes) {
    let total = 0;
    for (let i = 0; i < variantes.length; i++) {
        total += Number(variantes[i].stock) || 0;
    }
    return total;
}

/* Convierte productos con el formato anterior (opcion.valores)
   al formato nuevo con variantes y stock. */
function normalizarProducto(p) {
    const producto = Object.assign({}, p);

    if (!Array.isArray(producto.variantes)) {
        if (producto.opcion && Array.isArray(producto.opcion.valores)) {
            producto.tituloVariante = producto.opcion.titulo;
            producto.variantes = producto.opcion.valores.map(function (valor) {
                return { nombre: valor, stock: STOCK_INICIAL_VARIANTE };
            });
        } else {
            producto.variantes = [];
        }
    }
    delete producto.opcion;

    producto.tieneVariantes = producto.variantes.length > 0;

    if (producto.tieneVariantes) {
        producto.tituloVariante = producto.tituloVariante || 'Selecciona la versión:';
        producto.stock = sumarStockVariantes(producto.variantes);
    } else {
        producto.stock = (producto.stock === undefined || producto.stock === null || producto.stock === '')
            ? STOCK_INICIAL_GENERAL
            : Number(producto.stock);
    }

    return producto;
}

/* Stock disponible de un producto, o de una variante concreta */
function stockDisponible(producto, nombreVariante) {
    if (!producto) return 0;
    if (producto.tieneVariantes) {
        if (!nombreVariante) return producto.stock;
        const variante = producto.variantes.find(v => v.nombre === nombreVariante);
        return variante ? Number(variante.stock) : 0;
    }
    return Number(producto.stock) || 0;
}

/* Suma (signo = +1) o resta (signo = -1) del inventario las piezas
   de una lista de artículos de carrito/pedido. Se usa al pagar
   y al cancelar un pedido desde el Admin. */
function ajustarStock(articulos, signo) {
    const productos = leerProductos();

    (articulos || []).forEach(function (articulo) {
        const producto = productos.find(p => p.id === articulo.id);
        if (!producto) return;

        const piezas = (Number(articulo.cantidad) || 0) * signo;

        if (producto.tieneVariantes) {
            const variante = producto.variantes.find(v => v.nombre === articulo.opcion);
            if (variante) {
                variante.stock = Math.max(0, Number(variante.stock) + piezas);
            }
            producto.stock = sumarStockVariantes(producto.variantes);
        } else {
            producto.stock = Math.max(0, Number(producto.stock) + piezas);
        }
    });

    guardarProductos(productos);
}

/* ---------------------------------------------------------
   OFERTAS
   ---------------------------------------------------------
   Se guardan aparte en "kookstore_ofertas" y se administran
   desde el Panel Admin. Cada producto tiene como máximo una:

     {
       id: "oferta-1696...",
       productoId: "bt21-mini",
       tipo: "porcentaje" | "monto",   // -20 %  o  -$50
       valor: 20,
       inicio: "2026-10-01",           // opcional (AAAA-MM-DD)
       fin: "2026-10-31",              // opcional, el día cuenta completo
       activa: true                    // false = pausada a mano
     }
   --------------------------------------------------------- */

const CLAVE_OFERTAS = 'kookstore_ofertas';

function leerOfertas() {
    try {
        return JSON.parse(localStorage.getItem(CLAVE_OFERTAS)) || [];
    } catch (e) {
        return [];
    }
}

function guardarOfertas(ofertas) {
    localStorage.setItem(CLAVE_OFERTAS, JSON.stringify(ofertas));
}

/* Fecha local de hoy como "AAAA-MM-DD" (mismo formato que <input type="date">) */
function fechaHoyISO() {
    const hoy = new Date();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    return hoy.getFullYear() + '-' + mes + '-' + dia;
}

/* "activa" | "programada" | "vencida" | "pausada" */
function estadoOferta(oferta) {
    const hoy = fechaHoyISO();
    if (!oferta.activa) return 'pausada';
    if (oferta.fin && hoy > oferta.fin) return 'vencida';
    if (oferta.inicio && hoy < oferta.inicio) return 'programada';
    return 'activa';
}

/* Oferta que aplica HOY a un producto, o null */
function ofertaVigente(productoId) {
    return leerOfertas().find(o => o.productoId === productoId && estadoOferta(o) === 'activa') || null;
}

/* Precio con el descuento de una oferta (nunca menor a 0) */
function aplicarDescuento(precio, oferta) {
    const base = Number(precio) || 0;
    if (!oferta) return base;
    const valor = Number(oferta.valor) || 0;
    const final = oferta.tipo === 'monto' ? base - valor : base * (1 - valor / 100);
    return Math.max(0, Math.round(final * 100) / 100);
}

/* Todo lo que la tienda necesita para mostrar el precio de un producto:
   { precio, original, descuento (en %), oferta } */
function precioProducto(producto) {
    const original = Number(producto && producto.precio) || 0;
    const oferta = producto ? ofertaVigente(producto.id) : null;
    const precio = aplicarDescuento(original, oferta);
    const descuento = oferta && original > 0 ? Math.round((1 - precio / original) * 100) : 0;
    return { precio: precio, original: original, descuento: descuento, oferta: precio < original ? oferta : null };
}

/* ---------------------------------------------------------
   PERSISTENCIA CON LOCALSTORAGE
   --------------------------------------------------------- */

function leerProductos() {
    const datos = localStorage.getItem('kookstore_productos');
    let lista = PRODUCTOS_INICIALES;

    if (datos) {
        try {
            lista = JSON.parse(datos);
        } catch (e) {
            lista = PRODUCTOS_INICIALES;
        }
    }

    const normalizados = lista.map(normalizarProducto);

    // La primera vez (o si venían en el formato anterior) se guardan ya convertidos
    const faltaMigrar = !datos || lista.some(p => p.tieneVariantes === undefined);
    if (faltaMigrar) {
        localStorage.setItem('kookstore_productos', JSON.stringify(normalizados));
    }

    return normalizados;
}

function guardarProductos(productos) {
    const normalizados = productos.map(normalizarProducto);
    localStorage.setItem('kookstore_productos', JSON.stringify(normalizados));
    if (typeof PRODUCTOS !== 'undefined') {
        PRODUCTOS = normalizados;
    }
}

// Variable global para compatibilidad directa
var PRODUCTOS = leerProductos();

/* ---------------------------------------------------------
   FUNCIONES BÚSQUEDA Y FILTRADO
   --------------------------------------------------------- */

function obtenerProductoPorId(id) {
    const lista = leerProductos();
    for (let i = 0; i < lista.length; i++) {
        if (lista[i].id === id) {
            return lista[i];
        }
    }
    return null;
}

function obtenerProductosPorCategoria(categoria) {
    const lista = leerProductos();
    if (categoria === 'todos' || !categoria) return lista;
    return lista.filter(producto => producto.categoria === categoria);
}

/* ---------------------------------------------------------
   OPERACIONES CRUD PARA PANEL ADMINISTRATIVO
   --------------------------------------------------------- */

function agregarProductoBD(nuevoProducto) {
    const productos = leerProductos();
    productos.unshift(nuevoProducto);
    guardarProductos(productos);
}

function editarProductoBD(idOriginal, productoActualizado) {
    const productos = leerProductos();
    const indice = productos.findIndex(p => p.id === idOriginal);
    if (indice !== -1) {
        productos[indice] = productoActualizado;
        guardarProductos(productos);
    }
}

function eliminarProductoBD(id) {
    let productos = leerProductos();
    productos = productos.filter(p => p.id !== id);
    guardarProductos(productos);

    // Su oferta (si tenía) deja de tener sentido
    guardarOfertas(leerOfertas().filter(o => o.productoId !== id));
}
/* Detecta cambios hechos desde otra pestaña (ej. Panel de Admin) */
window.addEventListener('storage', function (e) {
    if (e.key === 'kookstore_productos' || e.key === CLAVE_OFERTAS) {
        // Actualizar la lista global de productos
        PRODUCTOS = leerProductos();

        // Si la página tiene una función para renderizar catálogo o detalle, la vuelve a ejecutar
        if (typeof renderizarProductos === 'function') {
            renderizarProductos(obtenerProductosPorCategoria('todos'));
        }
        if (typeof cargarDetalleProducto === 'function') {
            cargarDetalleProducto();
        }
    }
});