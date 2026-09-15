/* =========================================================
   KOOKSTORE.MX - CATÁLOGO DE DATOS
   ---------------------------------------------------------
   Aquí viven TODOS los productos de la tienda en un solo
   lugar. La página de detalle (productos.html) lee de aquí
   para mostrar ÚNICAMENTE el producto seleccionado.

   Campos de cada producto:
     id          -> identificador único (viaja en la URL)
     nombre      -> título del producto
     grupo       -> grupo de K-pop al que pertenece
     precio      -> número, sin símbolos (para poder sumar)
     imagen      -> ruta desde la RAÍZ del proyecto
     categoria   -> albumes | lightsticks | peluches
     etiqueta    -> texto del listón rosa
     descripcion -> texto largo del producto
     opcion      -> (opcional) selector de versión / personaje
   ========================================================= */

const PRODUCTOS = [

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
        nombre: "Army Bomb - Map of the Soul",
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
        precio: 180,
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
        precio: 180,
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
        precio: 180,
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
        precio: 180,
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

/* Busca un producto por su id. Devuelve null si no existe. */
function obtenerProductoPorId(id) {
    for (let i = 0; i < PRODUCTOS.length; i++) {
        if (PRODUCTOS[i].id === id) {
            return PRODUCTOS[i];
        }
    }
    return null;
}

/* Devuelve todos los productos de una categoría. */
function obtenerProductosPorCategoria(categoria) {
    return PRODUCTOS.filter(producto => producto.categoria === categoria);
}
