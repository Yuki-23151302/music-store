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
   PERSISTENCIA CON LOCALSTORAGE
   --------------------------------------------------------- */

function leerProductos() {
    const datos = localStorage.getItem('kookstore_productos');
    if (!datos) {
        localStorage.setItem('kookstore_productos', JSON.stringify(PRODUCTOS_INICIALES));
        return PRODUCTOS_INICIALES;
    }
    try {
        return JSON.parse(datos);
    } catch (e) {
        return PRODUCTOS_INICIALES;
    }
}

function guardarProductos(productos) {
    localStorage.setItem('kookstore_productos', JSON.stringify(productos));
    if (typeof PRODUCTOS !== 'undefined') {
        PRODUCTOS = productos;
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
}
/* Detecta cambios hechos desde otra pestaña (ej. Panel de Admin) */
window.addEventListener('storage', function (e) {
    if (e.key === 'kookstore_productos') {
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