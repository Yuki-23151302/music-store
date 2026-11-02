/* =========================================================
   KOOKSTORE.MX - SUBASTA SIMULADA (MODELO C2C)
   ---------------------------------------------------------
   - Temporizador de cuenta regresiva: la fecha de cierre se
     guarda en localStorage, así no se reinicia al recargar.
   - Historial de ofertas previas (simulado) con la oferta más
     alta resaltada.
   - Campo "Hacer oferta" + botón "Ofertar". SIN validaciones:
     funciona con o sin texto, muestra "Oferta registrada
     (simulada)" y la oferta aparece al instante en la lista.
     Si el texto está vacío, no es un número o es menor al
     mínimo, se registra el mínimo para que quede arriba.
   - Cada cierto tiempo otro fan (simulado) puede superarte.
   - Una oferta en los últimos 2 minutos extiende la subasta.

   Necesita: notificaciones.js, sesion.js y ui.js
   ========================================================= */

const CLAVE_SUBASTA = 'kookstore_subasta_simulada';

const PRECIO_SALIDA = 1500;
const INCREMENTO_MINIMO = 50;
const DURACION_INICIAL = (2 * 60 + 14) * 60 * 1000;   // 2 h 14 min
const EXTENSION_FINAL = 2 * 60 * 1000;                 // 2 min

/* Ofertas previas simuladas: monto y hace cuántos minutos */
const OFERTAS_INICIALES = [
    { nombre: 'kookie.lover', monto: 1550, minutos: 178 },
    { nombre: 'Daniela R.', monto: 1650, minutos: 151 },
    { nombre: 'jiminie_mx', monto: 1800, minutos: 122 },
    { nombre: 'Luis F.', monto: 1850, minutos: 97 },
    { nombre: 'Purple_Fan', monto: 2000, minutos: 64 },
    { nombre: 'Daniela R.', monto: 2150, minutos: 38 },
    { nombre: 'Valeria G.', monto: 2300, minutos: 12 }
];

/* Fans simulados que pueden ofertar mientras ves la página */
const POSTORES_SIMULADOS = ['Daniela R.', 'Valeria G.', 'jiminie_mx', 'Purple_Fan', 'Luis F.', 'borahae.gdl', 'kookie.lover'];

const COLORES_AVATAR = ['#6c5ce7', '#ff6b9e', '#00b894', '#f39c12', '#0984e3', '#e84393', '#00cec9'];

let subasta = null;
let ultimoRender = '';

/* ---------------------------------------------------------
   DATOS
   --------------------------------------------------------- */
function crearSubasta() {
    const ahora = Date.now();
    return {
        inicio: new Date(ahora - 3 * 60 * 60 * 1000).toISOString(),
        fin: new Date(ahora + DURACION_INICIAL).toISOString(),
        ofertas: OFERTAS_INICIALES.map(o => ({
            nombre: o.nombre,
            monto: o.monto,
            fecha: new Date(ahora - o.minutos * 60 * 1000).toISOString(),
            tuya: false
        })),
        avisoFinal: false
    };
}

function leerSubasta() {
    try {
        const guardada = JSON.parse(localStorage.getItem(CLAVE_SUBASTA));
        if (guardada && guardada.fin && Array.isArray(guardada.ofertas)) return guardada;
    } catch (e) { /* datos dañados: se crea una nueva */ }
    const nueva = crearSubasta();
    guardarSubasta(nueva);
    return nueva;
}

function guardarSubasta(datos) {
    localStorage.setItem(CLAVE_SUBASTA, JSON.stringify(datos || subasta));
}

/* Ofertas de la más alta a la más baja */
function ofertasOrdenadas() {
    return subasta.ofertas.slice().sort((a, b) => b.monto - a.monto || new Date(b.fecha) - new Date(a.fecha));
}

function ofertaMasAlta() {
    return ofertasOrdenadas()[0] || null;
}

function montoActual() {
    const alta = ofertaMasAlta();
    return alta ? alta.monto : PRECIO_SALIDA;
}

function montoMinimo() {
    return subasta.ofertas.length ? montoActual() + INCREMENTO_MINIMO : PRECIO_SALIDA;
}

function tiempoRestante() {
    return Math.max(0, new Date(subasta.fin) - Date.now());
}

function subastaTerminada() {
    return tiempoRestante() <= 0;
}

function miNombre() {
    const usuario = usuarioActivo();
    return usuario ? usuario.nombre : 'Tú (invitado)';
}

/* ---------------------------------------------------------
   FORMATOS
   --------------------------------------------------------- */
function pesos(cantidad) {
    return '$' + Number(cantidad).toLocaleString('es-MX', { maximumFractionDigits: 2 });
}

function dosDigitos(n) {
    return String(n).padStart(2, '0');
}

function haceCuanto(fecha) {
    const minutos = Math.floor((Date.now() - new Date(fecha)) / 60000);
    if (minutos < 1) return 'hace unos segundos';
    if (minutos < 60) return 'hace ' + minutos + ' min';
    const horas = Math.floor(minutos / 60);
    return 'hace ' + horas + ' h' + (minutos % 60 ? ' ' + (minutos % 60) + ' min' : '');
}

function inicialesPostor(nombre) {
    const limpio = String(nombre).replace(/[^A-Za-zÁÉÍÓÚÑáéíóúñ0-9 ._]/g, '');
    const partes = limpio.split(/[ ._]+/).filter(Boolean);
    return ((partes[0] || '?')[0] + (partes[1] ? partes[1][0] : (partes[0] || '?')[1] || '')).toUpperCase();
}

function colorPostor(nombre) {
    let suma = 0;
    for (const letra of String(nombre)) suma += letra.charCodeAt(0);
    return COLORES_AVATAR[suma % COLORES_AVATAR.length];
}

/* ---------------------------------------------------------
   TEMPORIZADOR (se actualiza cada segundo)
   --------------------------------------------------------- */
function pintarReloj() {
    const restante = tiempoRestante();
    const segundosTotales = Math.floor(restante / 1000);
    const dias = Math.floor(segundosTotales / 86400);
    const horas = Math.floor((segundosTotales % 86400) / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segundos = segundosTotales % 60;

    document.getElementById('caja-dias').hidden = dias === 0;
    document.getElementById('reloj-dias').textContent = dosDigitos(dias);
    document.getElementById('reloj-horas').textContent = dosDigitos(horas);
    document.getElementById('reloj-minutos').textContent = dosDigitos(minutos);
    document.getElementById('reloj-segundos').textContent = dosDigitos(segundos);

    // Barra: porcentaje del tiempo total que ya pasó
    const inicio = new Date(subasta.inicio).getTime();
    const total = new Date(subasta.fin).getTime() - inicio;
    const transcurrido = Math.min(100, Math.max(0, (Date.now() - inicio) / total * 100));
    document.getElementById('reloj-progreso').style.width = transcurrido + '%';

    // Colores según lo que falta
    const reloj = document.getElementById('subasta-reloj');
    reloj.classList.toggle('ultimos', restante > 0 && restante <= 5 * 60 * 1000);
    reloj.classList.toggle('critico', restante > 0 && restante <= 60 * 1000);
    reloj.classList.toggle('terminado', restante <= 0);

    const fin = new Date(subasta.fin);
    document.getElementById('reloj-fin').textContent = restante > 0
        ? 'Cierra el ' + fin.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'short' }) +
          ' a las ' + fin.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
        : 'Cerró a las ' + fin.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });

    document.getElementById('reloj-titulo').textContent = restante <= 0
        ? '🏁 Subasta finalizada'
        : restante <= 60 * 1000 ? '🔥 ¡Último minuto!' : '⏳ La subasta termina en';

    if (restante <= 0 && !subasta.avisoFinal) anunciarGanador();
}

/* ---------------------------------------------------------
   PRECIO, LÍDER Y FORMULARIO
   --------------------------------------------------------- */
function pintarPanel() {
    const terminada = subastaTerminada();
    const alta = ofertaMasAlta();
    const postores = new Set(subasta.ofertas.map(o => o.tuya ? '__tu__' : o.nombre)).size;

    document.getElementById('texto-oferta-actual').textContent = terminada ? 'Precio final' : 'Oferta actual';
    document.getElementById('oferta-actual').textContent = pesos(montoActual());
    document.getElementById('total-ofertas').textContent = subasta.ofertas.length;
    document.getElementById('total-postores').textContent = postores;
    document.getElementById('texto-minimo').textContent = 'Mínimo ' + pesos(montoMinimo());
    document.getElementById('monto-oferta').placeholder = 'Escribe tu oferta, ej. ' + montoMinimo();

    const lider = document.getElementById('subasta-lider');
    lider.className = 'subasta-lider';
    if (!alta) {
        lider.textContent = 'Aún no hay ofertas. ¡Sé el primero!';
    } else if (terminada) {
        lider.classList.add(alta.tuya ? 'ganando' : 'final');
        lider.textContent = alta.tuya ? '🏆 ¡Ganaste la subasta! (simulado)' : '🏆 Ganó ' + alta.nombre;
    } else if (alta.tuya) {
        lider.classList.add('ganando');
        lider.textContent = '👑 Vas ganando. ¡Mantente atento!';
    } else if (subasta.ofertas.some(o => o.tuya)) {
        lider.classList.add('superado');
        lider.textContent = '⚠️ Te superaron. Va ganando ' + alta.nombre + '.';
    } else {
        lider.textContent = 'Va ganando ' + alta.nombre;
    }

    // "Ofertar" nunca se bloquea (sin validaciones), ni al terminar
    document.getElementById('btn-adelantar').disabled = terminada;

    const chip = document.getElementById('subasta-chip');
    chip.classList.toggle('cerrada', terminada);
    chip.innerHTML = terminada ? '🏁 FINALIZADA · Simulada' : '<span class="punto-vivo"></span>EN VIVO · Simulada';

    document.getElementById('precio-salida').textContent = pesos(PRECIO_SALIDA);
    document.getElementById('incremento-minimo').textContent = pesos(INCREMENTO_MINIMO);
    document.getElementById('fecha-inicio').textContent = new Date(subasta.inicio)
        .toLocaleString('es-MX', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

/* ---------------------------------------------------------
   HISTORIAL DE OFERTAS
   --------------------------------------------------------- */
function pintarHistorial(resaltarFecha) {
    const lista = document.getElementById('historial-lista');
    const ofertas = ofertasOrdenadas();
    const total = ofertas.length;

    document.getElementById('historial-resumen').textContent = total === 1 ? '1 oferta' : total + ' ofertas';

    if (!total) {
        lista.innerHTML = '<li class="historial-vacio">Todavía no hay ofertas.</li>';
        return;
    }

    lista.innerHTML = ofertas.map(function (oferta, i) {
        const anterior = ofertas[i + 1];
        const subio = anterior ? '+' + pesos(oferta.monto - anterior.monto) : 'Primera oferta';
        const nombre = oferta.tuya ? miNombre() : oferta.nombre;
        const clases = ['historial-item'];
        if (i === 0) clases.push('lider');
        if (oferta.tuya) clases.push('tuya');
        if (resaltarFecha && oferta.fecha === resaltarFecha) clases.push('nueva');

        return '' +
            '<li class="' + clases.join(' ') + '">' +
            '<span class="historial-avatar" style="background:' + (oferta.tuya ? 'var(--degradado-marca)' : colorPostor(nombre)) + '">' +
            escaparHTML(inicialesPostor(nombre)) + '</span>' +
            '<div class="historial-quien">' +
            '<strong>' + escaparHTML(nombre) +
            (oferta.tuya ? ' <span class="etiqueta-tu">Tú</span>' : '') +
            (i === 0 ? ' <span class="etiqueta-lider">' + (subastaTerminada() ? '🏆 Ganadora' : '👑 Más alta') + '</span>' : '') +
            '</strong>' +
            '<small>' + haceCuanto(oferta.fecha) + ' · ' +
            new Date(oferta.fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) + '</small>' +
            '</div>' +
            '<div class="historial-monto">' +
            '<strong>' + pesos(oferta.monto) + '</strong>' +
            '<small>' + subio + '</small>' +
            '</div>' +
            '</li>';
    }).join('');
}

function pintarTodo(resaltarFecha) {
    pintarReloj();
    pintarPanel();
    pintarHistorial(resaltarFecha);
}

/* ---------------------------------------------------------
   OFERTAR (simulado, sin validaciones)
   --------------------------------------------------------- */
function registrarOferta(nombre, monto, tuya) {
    const oferta = { nombre: nombre, monto: monto, fecha: new Date().toISOString(), tuya: tuya };
    subasta.ofertas.push(oferta);

    // Antisniping: en los últimos 2 minutos (o ya cerrada) la subasta
    // se extiende 2 minutos
    let extendida = false;
    if (tiempoRestante() < EXTENSION_FINAL) {
        subasta.fin = new Date(Date.now() + EXTENSION_FINAL).toISOString();
        subasta.avisoFinal = false;
        extendida = true;
    }

    guardarSubasta();
    pintarTodo(oferta.fecha);
    return extendida;
}

/* Convierte lo escrito en el campo a número ("$2,500" -> 2500).
   Si no hay un número devuelve 0. */
function montoEscrito(texto) {
    const numero = Number(String(texto).replace(/[^0-9.]/g, ''));
    return isFinite(numero) ? numero : 0;
}

/* Botón "Ofertar": SIN validaciones, funciona con o sin texto */
function ofertar(e) {
    e.preventDefault();

    const campo = document.getElementById('monto-oferta');
    const escrito = montoEscrito(campo.value);
    const minimo = montoMinimo();
    const ajustada = escrito < minimo;
    const monto = ajustada ? minimo : escrito;
    const estabaCerrada = subastaTerminada();

    const extendida = registrarOferta(miNombre(), monto, true);
    campo.value = '';
    mostrarOfertaNueva();

    kookToast(
        (ajustada ? 'Se registró el mínimo de ' : 'Ofertaste ') + pesos(monto) + '. Ya aparece en la lista de ofertas.' +
        (estabaCerrada ? ' La subasta se reabrió 2 minutos.' : extendida ? ' La subasta se extendió 2 minutos.' : ''),
        'exito',
        'Oferta registrada (simulada)'
    );
    programarRival(6000 + Math.random() * 6000);
}

/* Lleva la vista a la oferta recién agregada en el historial */
function mostrarOfertaNueva() {
    const lista = document.getElementById('historial-lista');
    lista.scrollTop = 0;
    const nueva = lista.querySelector('.historial-item.nueva');
    if (!nueva) return;
    const caja = nueva.getBoundingClientRect();
    if (caja.top < 80 || caja.top > window.innerHeight * 0.65) {
        nueva.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/* Botones +$50 / +$100 / +$250 sobre la oferta actual */
function sumarRapido(cantidad) {
    const campo = document.getElementById('monto-oferta');
    const escrito = montoEscrito(campo.value);
    const base = escrito >= montoMinimo() ? escrito : montoActual();
    campo.value = base + cantidad;
    campo.focus();
}

/* ---------------------------------------------------------
   OTROS FANS (simulados) QUE OFERTAN
   --------------------------------------------------------- */
let temporizadorRival = null;

function programarRival(espera) {
    clearTimeout(temporizadorRival);
    temporizadorRival = setTimeout(ofertaRival, espera || 20000 + Math.random() * 20000);
}

function ofertaRival() {
    if (subastaTerminada()) return;
    const alta = ofertaMasAlta();

    // A veces nadie oferta, para que se sienta natural
    if (Math.random() < 0.65) {
        const candidatos = POSTORES_SIMULADOS.filter(n => !alta || alta.tuya || n !== alta.nombre);
        const nombre = candidatos[Math.floor(Math.random() * candidatos.length)];
        const monto = montoMinimo() + INCREMENTO_MINIMO * Math.floor(Math.random() * 3);
        const ibasGanando = alta && alta.tuya;

        registrarOferta(nombre, monto, false);
        if (ibasGanando) {
            kookToast(nombre + ' ofertó ' + pesos(monto) + '. ¡Vuelve a ofertar!', 'aviso', 'Te superaron');
        }
    }
    programarRival();
}

/* ---------------------------------------------------------
   FIN DE LA SUBASTA
   --------------------------------------------------------- */
function anunciarGanador() {
    subasta.avisoFinal = true;
    guardarSubasta();
    clearTimeout(temporizadorRival);
    pintarPanel();
    pintarHistorial();

    const alta = ofertaMasAlta();
    if (!alta) return;
    kookAlerta({
        tipo: alta.tuya ? 'exito' : 'info',
        titulo: alta.tuya ? '¡Ganaste la subasta! (simulado)' : 'La subasta terminó',
        texto: alta.tuya
            ? 'Tu oferta fue la más alta. En una tienda real, el vendedor te contactaría para acordar el pago y la entrega.'
            : 'El artículo se lo llevó ' + alta.nombre + '. ¡Suerte en la próxima subasta!',
        detalle: 'Precio final: ' + pesos(alta.monto),
        textoBoton: 'Entendido'
    });
}

/* ---------------------------------------------------------
   CONTROLES DE LA SIMULACIÓN
   --------------------------------------------------------- */
function adelantarAlFinal() {
    if (subastaTerminada()) return;
    subasta.fin = new Date(Date.now() + 60 * 1000).toISOString();
    guardarSubasta();
    pintarTodo();
    kookToast('Faltan 60 segundos para que cierre la subasta.', 'info', 'Último minuto');
}

function reiniciarSubasta() {
    kookConfirmar({
        tipo: 'aviso',
        titulo: '¿Reiniciar la subasta?',
        texto: 'El reloj vuelve a empezar y se borran las ofertas que hiciste. Las ofertas simuladas regresan.',
        textoConfirmar: 'Sí, reiniciar',
        textoCancelar: 'Cancelar'
    }).then(function (acepto) {
        if (!acepto) return;
        subasta = crearSubasta();
        guardarSubasta();
        pintarTodo();
        programarRival();
        kookToast('La subasta empezó de nuevo.', 'exito', 'Subasta reiniciada');
    });
}

/* ---------------------------------------------------------
   INICIO
   --------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function () {
    subasta = leerSubasta();
    pintarTodo();

    document.getElementById('form-oferta').addEventListener('submit', ofertar);
    document.querySelectorAll('[data-sumar]').forEach(function (boton) {
        boton.addEventListener('click', () => sumarRapido(Number(boton.dataset.sumar)));
    });
    document.getElementById('btn-adelantar').addEventListener('click', adelantarAlFinal);
    document.getElementById('btn-reiniciar').addEventListener('click', reiniciarSubasta);

    // Reloj cada segundo; los "hace X min" del historial cada 30 s
    setInterval(pintarReloj, 1000);
    setInterval(function () {
        const actual = JSON.stringify(subasta.ofertas.map(o => haceCuanto(o.fecha)));
        if (actual !== ultimoRender) { ultimoRender = actual; pintarHistorial(); }
    }, 30000);

    if (!subastaTerminada()) programarRival();

    // Ofertas hechas en otra pestaña
    window.addEventListener('storage', function (e) {
        if (e.key === CLAVE_SUBASTA) { subasta = leerSubasta(); pintarTodo(); }
    });
});
