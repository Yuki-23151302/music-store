/* =========================================================
   KOOKSTORE.MX - LÓGICA DEL PANEL ADMINISTRATIVO
   ========================================================= */

// Verificación segura de administrador
function validarAccesoAdmin() {
    const sesion = localStorage.getItem('kookstore_sesion');
    return sesion === 'admin@kookstore.mx' || sesion === 'admin';
}

// Auxiliares de formato para evitar errores en pantalla
function formatearPrecioAdmin(precio) {
    if (typeof formatearPrecio === 'function') {
        return formatearPrecio(precio);
    }
    return '$' + Number(precio).toLocaleString('es-MX', { minimumFractionDigits: 2 });
}

function resolverRutaImagen(ruta) {
    if (!ruta) return 'https://via.placeholder.com/45';
    if (ruta.startsWith('../') || ruta.startsWith('http')) return ruta;
    return '../' + ruta;
}

// Inicialización al cargar la página
document.addEventListener('DOMContentLoaded', function () {
    // Si no ha iniciado sesión como admin, se le notifica
    if (!validarAccesoAdmin()) {
        console.warn('Sesión de administrador no detectada.');
    }

    inicializarNavegacionAdmin();
    renderizarProductosAdmin();
    renderizarPedidosAdmin();
    renderizarClientesAdmin();

    const formProd = document.getElementById('form-producto');
    if (formProd) {
        formProd.addEventListener('submit', guardarProductoFormulario);
    }
});

/* ---------------------------------------------------------
   NAVEGACIÓN ENTRE PESTAÑAS DEL ADMIN
   --------------------------------------------------------- */
function inicializarNavegacionAdmin() {
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const objetivo = href.replace('#', '');

                tabs.forEach(t => t.classList.remove('activo'));
                this.classList.add('activo');

                document.querySelectorAll('.admin-seccion').forEach(sec => {
                    sec.style.display = 'none';
                    sec.classList.remove('activa');
                });

                const seccionObjetivo = document.getElementById('seccion-' + objetivo);
                if (seccionObjetivo) {
                    seccionObjetivo.style.display = 'block';
                    seccionObjetivo.classList.add('activa');
                }
            }
        });
    });
}

/* ---------------------------------------------------------
   1. GESTIÓN DE PRODUCTOS
   --------------------------------------------------------- */
function renderizarProductosAdmin() {
    const tbody = document.getElementById('tabla-productos-body');
    if (!tbody) return;

    // Leer productos desde datos-productos.js / localStorage
    const productos = (typeof leerProductos === 'function') ? leerProductos() : [];

    if (productos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">No hay productos registrados.</td></tr>';
        return;
    }

    let html = '';
    productos.forEach(p => {
        const stockNum = p.stock !== undefined ? p.stock : 10;
        const badgeClass = stockNum <= 5 ? 'bajo' : 'alto';

        html += `
            <tr>
                <td><img src="${resolverRutaImagen(p.imagen)}" alt="${p.nombre}" style="width: 45px; height: 45px; object-fit: cover; border-radius: 6px;" onerror="this.src='https://via.placeholder.com/45'"></td>
                <td><strong>${p.nombre}</strong></td>
                <td>${p.grupo || '-'}</td>
                <td>${p.categoria || '-'}</td>
                <td><span class="badge-stock ${badgeClass}">${stockNum}</span></td>
                <td>${formatearPrecioAdmin(p.precio)}</td>
                <td>
                    <button type="button" class="btn-icono editar" onclick="prepararEdicionProducto('${p.id}')" title="Editar">✏️</button>
                    <button type="button" class="btn-icono eliminar" onclick="confirmarEliminarProducto('${p.id}')" title="Eliminar">🗑️</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function abrirModalProducto() {
    const modal = document.getElementById('modal-producto');
    if (!modal) return;
    document.getElementById('modal-titulo').textContent = 'Agregar Nuevo Producto';
    document.getElementById('form-producto').reset();
    document.getElementById('prod-id-original').value = '';
    document.getElementById('prod-id').disabled = false;
    modal.style.display = 'flex';
}

function cerrarModalProducto() {
    const modal = document.getElementById('modal-producto');
    if (modal) modal.style.display = 'none';
}

function prepararEdicionProducto(id) {
    const p = obtenerProductoPorId(id);
    if (!p) return;

    document.getElementById('modal-titulo').textContent = 'Editar Producto';
    document.getElementById('prod-id-original').value = p.id;
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-id').disabled = true;
    document.getElementById('prod-nombre').value = p.nombre;
    document.getElementById('prod-grupo').value = p.grupo || '';
    document.getElementById('prod-categoria').value = p.categoria;
    document.getElementById('prod-precio').value = p.precio;
    document.getElementById('prod-stock').value = p.stock !== undefined ? p.stock : 10;
    document.getElementById('prod-imagen').value = p.imagen;
    document.getElementById('prod-etiqueta').value = p.etiqueta || 'PRODUCTO OFICIAL';
    document.getElementById('prod-descripcion').value = p.descripcion || '';

    document.getElementById('modal-producto').style.display = 'flex';
}

function guardarProductoFormulario(e) {
    e.preventDefault();

    const idOriginal = document.getElementById('prod-id-original').value;
    const id = document.getElementById('prod-id').value.trim();
    const nombre = document.getElementById('prod-nombre').value.trim();
    const grupo = document.getElementById('prod-grupo').value.trim();
    const categoria = document.getElementById('prod-categoria').value;
    const precio = Number(document.getElementById('prod-precio').value);
    const stock = Number(document.getElementById('prod-stock').value);
    const imagen = document.getElementById('prod-imagen').value.trim();
    const etiqueta = document.getElementById('prod-etiqueta').value.trim();
    const descripcion = document.getElementById('prod-descripcion').value.trim();

    const productoObjeto = {
        id: id,
        nombre: nombre,
        grupo: grupo,
        precio: precio,
        stock: stock,
        imagen: imagen,
        categoria: categoria,
        etiqueta: etiqueta,
        descripcion: descripcion
    };

    if (idOriginal) {
        editarProductoBD(idOriginal, productoObjeto);
    } else {
        if (obtenerProductoPorId(id)) {
            alert('Ya existe un producto con el ID "' + id + '". Elige otro identificador.');
            return;
        }
        agregarProductoBD(productoObjeto);
    }

    cerrarModalProducto();
    renderizarProductosAdmin();
}

function confirmarEliminarProducto(id) {
    const p = obtenerProductoPorId(id);
    if (!p) return;

    if (confirm(`¿Deseas eliminar permanentemente el producto "${p.nombre}"?`)) {
        eliminarProductoBD(id);
        renderizarProductosAdmin();
    }
}

/* ---------------------------------------------------------
   2. GESTIÓN DE PEDIDOS GLOBALES (SINCRONIZADO)
   --------------------------------------------------------- */
function obtenerTodosLosPedidosGlobales() {
    const pedidosGlobales = [];
    for (let i = 0; i < localStorage.length; i++) {
        const clave = localStorage.key(i);
        if (clave && clave.startsWith('kookstore_pedidos_')) {
            const emailCliente = clave.replace('kookstore_pedidos_', '');
            try {
                const pedidosUsuario = JSON.parse(localStorage.getItem(clave)) || [];
                pedidosUsuario.forEach(pedido => {
                    pedidosGlobales.push({
                        ...pedido,
                        emailCliente: emailCliente
                    });
                });
            } catch (err) {
                console.error("Error leyendo pedidos de " + clave, err);
            }
        }
    }
    return pedidosGlobales;
}

function renderizarPedidosAdmin() {
    const tbody = document.getElementById('tabla-pedidos-body');
    if (!tbody) return;

    const pedidos = obtenerTodosLosPedidosGlobales();

    if (pedidos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay pedidos registrados en la tienda.</td></tr>';
        return;
    }

    let html = '';
    pedidos.forEach(p => {
        // Incluye los 4 estados de la barra de seguimiento SHEIN + Cancelado
        const estados = ['Pagado', 'En proceso', 'En camino', 'Entregado', 'Cancelado'];
        let opcionesEstado = '';
        estados.forEach(est => {
            const selected = (p.estado === est) ? 'selected' : '';
            opcionesEstado += `<option value="${est}" ${selected}>${est}</option>`;
        });

        html += `
            <tr>
                <td><strong>${p.folio}</strong></td>
                <td>${p.emailCliente}</td>
                <td>${p.fecha} <br><small style="color:#777;">${p.hora || ''}</small></td>
                <td>${p.resumen}</td>
                <td><strong>${formatearPrecioAdmin(p.total)}</strong></td>
                <td>
                    <select onchange="cambiarEstadoPedido('${p.emailCliente}', '${p.folio}', this.value)" style="padding:6px 10px; border-radius:6px; border:1px solid #ccc; font-weight:600; cursor:pointer;">
                        ${opcionesEstado}
                    </select>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function cambiarEstadoPedido(emailCliente, folio, nuevoEstado) {
    const clave = 'kookstore_pedidos_' + emailCliente;
    const datos = localStorage.getItem(clave);
    if (!datos) return;

    const pedidos = JSON.parse(datos);
    const pedido = pedidos.find(p => p.folio === folio);
    if (pedido) {
        pedido.estado = nuevoEstado;
        localStorage.setItem(clave, JSON.stringify(pedidos));
    }
}

/* ---------------------------------------------------------
   3. CLIENTES REGISTRADOS Y SESIONES
   --------------------------------------------------------- */
function renderizarClientesAdmin() {
    const tbody = document.getElementById('tabla-clientes-body');
    if (!tbody) return;

    const usuarios = (typeof leerUsuarios === 'function') ? leerUsuarios() : [];
    const emailSesionActiva = localStorage.getItem('kookstore_sesion');

    if (usuarios.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;">No hay clientes registrados.</td></tr>';
        return;
    }

    let html = '';
    usuarios.forEach(u => {
        const esActiva = (u.email === emailSesionActiva);
        const badgeSesion = esActiva
            ? '<span class="badge-estado" style="background-color: #28a745; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem;">Sesión Activa</span>'
            : '<span class="badge-estado" style="background-color: #6c757d; color: white; padding: 3px 8px; border-radius: 12px; font-size: 0.8rem;">Inactiva</span>';

        const direccionFormateada = (u.direccion || 'Sin dirección registrada').split('\n').join('<br>');

        html += `
            <tr>
                <td><div class="perfil-avatar" style="width:35px; height:35px; font-size:14px; margin:0; display:flex; align-items:center; justify-content:center; background:#e0e0e0; border-radius:50%;">${u.avatar || 'KS'}</div></td>
                <td><strong>${u.nombre}</strong></td>
                <td>${u.email}</td>
                <td>${u.miembroDesde || '-'}</td>
                <td style="font-size:0.85rem; line-height:1.3;">${direccionFormateada}</td>
                <td>${badgeSesion}</td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}