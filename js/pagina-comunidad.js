        lista.appendChild(crearComentario(comentario));
    });
    actualizarContador();
}

function publicarComentario(e) {
    e.preventDefault();

    const campoNombre = document.getElementById('comentario-nombre');
    const campoTexto = document.getElementById('comentario-texto');
    const mensaje = campoTexto.value.trim();

    if (!mensaje) {
        kookAlerta({
            tipo: 'advertencia',
            titulo: 'Tu comentario está vacío',
            texto: 'Escribe algo antes de publicar.'
        }).then(function () { campoTexto.focus(); });
        return;
    }

    const comentario = {
        nombre: campoNombre.value.trim() || 'Anónimo',
        fecha: new Date(),
        mensaje: mensaje
    };

    const lista = document.getElementById('lista-comentarios');
    const item = crearComentario(comentario);
    item.classList.add('comentario-nuevo');
    lista.prepend(item);
    actualizarContador();

    // Solo se limpia el texto; el nombre se conserva para el siguiente comentario
    campoTexto.value = '';
    kookToast('Tu comentario ya está visible para la comunidad.', 'exito', '¡Publicado!');
}

document.addEventListener('DOMContentLoaded', function () {
    pintarComentariosIniciales();
    document.getElementById('form-comentario').addEventListener('submit', publicarComentario);
});