/* =========================================================
   KOOKSTORE.MX - DETALLES DE INTERFAZ COMPARTIDOS
   ---------------------------------------------------------
   - Encabezado con sombra al hacer scroll.
   - Marca automáticamente el enlace de la página actual.
   - Botón de menú para celulares.
   - Animación de aparición al hacer scroll ([data-revelar]).
   - Carrusel reutilizable: iniciarCarrusel(elemento).
   ========================================================= */

/* ---------------------------------------------------------
   ENCABEZADO
   --------------------------------------------------------- */
function iniciarEncabezado() {
    const header = document.querySelector('.header-principal');
    if (!header) return;

    // Sombra suave en cuanto la página se desplaza
    const alDesplazar = () => header.classList.toggle('con-sombra', window.scrollY > 8);
    window.addEventListener('scroll', alDesplazar, { passive: true });
    alDesplazar();

    // Enlace activo según el archivo actual (index.html, catalogo.html, ...)
    const archivo = location.pathname.split('/').pop() || 'index.html';
    header.querySelectorAll('.nav-principal a').forEach(function (enlace) {
        enlace.removeAttribute('style');
        const destino = enlace.getAttribute('href').split('/').pop().split('#')[0];
        enlace.classList.toggle('activo', destino === archivo);
    });

    // Botón de menú para pantallas pequeñas
    const nav = header.querySelector('.nav-principal');
    if (nav && !header.querySelector('.btn-menu')) {
        const boton = document.createElement('button');
        boton.type = 'button';
        boton.className = 'btn-menu';
        boton.setAttribute('aria-label', 'Abrir menú');
        boton.setAttribute('aria-expanded', 'false');
        boton.innerHTML = '<span></span><span></span><span></span>';
        header.insertBefore(boton, nav);

        boton.addEventListener('click', function () {
            const abierto = header.classList.toggle('menu-abierto');
            boton.setAttribute('aria-expanded', abierto);
            boton.setAttribute('aria-label', abierto ? 'Cerrar menú' : 'Abrir menú');
        });

        nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) header.classList.remove('menu-abierto');
        });
    }
}

/* ---------------------------------------------------------
   APARICIÓN AL HACER SCROLL
   --------------------------------------------------------- */
function iniciarRevelado() {
    const elementos = document.querySelectorAll('[data-revelar]');
    if (!elementos.length) return;

    if (!('IntersectionObserver' in window)) {
        elementos.forEach(el => el.classList.add('revelado'));
        return;
    }

    const observador = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
            if (entrada.isIntersecting) {
                entrada.target.classList.add('revelado');
                observador.unobserve(entrada.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    elementos.forEach(el => observador.observe(el));
}

/* ---------------------------------------------------------
   CARRUSEL
   Estructura esperada:
     <div class="carrusel" data-intervalo="4500">
       <div class="carrusel-pista"> ...tarjetas... </div>
       <button class="carrusel-flecha" data-direccion="-1">
       <button class="carrusel-flecha" data-direccion="1">
       <div class="carrusel-puntos"></div>
     </div>
   La pista usa scroll-snap, así el deslizamiento con el dedo
   funciona de forma nativa en celulares.
   "controles" (opcional) es otro elemento que contiene las
   flechas, por ejemplo la cabecera de la sección.
   --------------------------------------------------------- */
function iniciarCarrusel(carrusel, controles) {
    const pista = carrusel.querySelector('.carrusel-pista');
    const puntos = carrusel.querySelector('.carrusel-puntos');
    const intervalo = Number(carrusel.getAttribute('data-intervalo')) || 4500;
    const sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let temporizador = null;
    let pausado = false;

    const anchoPaso = () => {
        const tarjeta = pista.firstElementChild;
        if (!tarjeta) return pista.clientWidth;
        const separacion = parseFloat(getComputedStyle(pista).columnGap) || 0;
        return tarjeta.getBoundingClientRect().width + separacion;
    };

    const totalPaginas = () => Math.max(1, Math.ceil((pista.scrollWidth - pista.clientWidth) / anchoPaso()) + 1);
    const paginaActual = () => Math.round(pista.scrollLeft / anchoPaso());
    const alFinal = () => pista.scrollLeft + pista.clientWidth >= pista.scrollWidth - 4;

    function irA(pagina) {
        pista.scrollTo({ left: pagina * anchoPaso(), behavior: sinMovimiento ? 'auto' : 'smooth' });
    }

    function mover(direccion) {
        if (direccion > 0 && alFinal()) irA(0);                       // del final regresa al inicio
        else if (direccion < 0 && pista.scrollLeft <= 4) irA(totalPaginas() - 1);
        else irA(paginaActual() + direccion);
    }

    function pintarPuntos() {
        if (!puntos) return;
        const total = totalPaginas();
        if (puntos.children.length !== total) {
            puntos.innerHTML = '';
            for (let i = 0; i < total; i++) {
                const punto = document.createElement('button');
                punto.type = 'button';
                punto.setAttribute('aria-label', 'Ir al grupo ' + (i + 1));
                punto.addEventListener('click', () => { irA(i); reiniciar(); });
                puntos.appendChild(punto);
            }
        }
        const activa = alFinal() ? total - 1 : paginaActual();
        Array.from(puntos.children).forEach((p, i) => p.classList.toggle('activo', i === activa));
    }

    function reiniciar() {
        clearInterval(temporizador);
        if (sinMovimiento) return;
        temporizador = setInterval(() => { if (!pausado) mover(1); }, intervalo);
    }

    (controles || carrusel).querySelectorAll('.carrusel-flecha').forEach(function (flecha) {
        flecha.addEventListener('click', function () {
            mover(Number(this.getAttribute('data-direccion')));
            reiniciar();
        });
    });

    // Pausa mientras el usuario lo está viendo de cerca o lo toca
    ['mouseenter', 'focusin', 'touchstart'].forEach(ev => carrusel.addEventListener(ev, () => { pausado = true; }, { passive: true }));
    ['mouseleave', 'focusout', 'touchend'].forEach(ev => carrusel.addEventListener(ev, () => { pausado = false; }, { passive: true }));

    // Flechas del teclado cuando el carrusel tiene el foco
    carrusel.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { mover(1); reiniciar(); }
        if (e.key === 'ArrowLeft') { mover(-1); reiniciar(); }
    });

    let espera;
    pista.addEventListener('scroll', () => { clearTimeout(espera); espera = setTimeout(pintarPuntos, 60); }, { passive: true });
    window.addEventListener('resize', pintarPuntos);

    pintarPuntos();
    reiniciar();
}

/* ---------------------------------------------------------
   MOSTRAR / OCULTAR CONTRASEÑA (.btn-ver-clave junto al input)
   --------------------------------------------------------- */
document.addEventListener('click', function (e) {
    const boton = e.target.closest('.btn-ver-clave');
    if (!boton) return;
    const campo = boton.parentElement.querySelector('input');
    const mostrar = campo.type === 'password';
    campo.type = mostrar ? 'text' : 'password';
    campo.classList.toggle('clave-visible', mostrar);
    boton.classList.toggle('activo', mostrar);
    boton.setAttribute('aria-label', mostrar ? 'Ocultar contraseña' : 'Mostrar contraseña');
});

document.addEventListener('DOMContentLoaded', function () {
    iniciarEncabezado();
    iniciarRevelado();
});
