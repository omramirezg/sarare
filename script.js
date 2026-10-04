(() => {
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('nav');
  if (btn && nav) {
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
    nav.addEventListener('click', (e) => {
      if (e.target.closest('a')) { nav.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false'); }
    });
  }

  // Selector "¿Qué necesita resolver?"
  // En una columna (celular) la explicación se abre justo debajo de la situación elegida
  const tabs = document.querySelectorAll('.pick');
  const panelsBox = document.querySelector('.picker__panels');
  const oneCol = window.matchMedia('(max-width: 600px)');
  const placePanel = (tab, panel) => {
    if (!panel || !panelsBox) return;
    if (oneCol.matches) { if (tab.nextElementSibling !== panel) tab.after(panel); }
    else if (panel.parentElement !== panelsBox) panelsBox.appendChild(panel);
  };
  const choose = (tab, scroll) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', String(on));
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (!panel) return;
      if (on) placePanel(t, panel);
      panel.hidden = !on; panel.classList.toggle('is-on', on);
      if (on && scroll) {
        if (oneCol.matches) {
          const top = t.getBoundingClientRect().top + window.scrollY - 84;
          window.scrollTo({ top, behavior: 'smooth' });
        } else if (panel.getBoundingClientRect().bottom > window.innerHeight) {
          panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      }
    });
  };
  tabs.forEach((tab) => tab.addEventListener('click', () => choose(tab, true)));
  const current = () => [...tabs].find((t) => t.classList.contains('is-on'));
  if (current()) choose(current(), false);
  oneCol.addEventListener('change', () => { const t = current(); if (t) choose(t, false); });

  const y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();

  const targets = document.querySelectorAll('.title, .picker, .plist, .rows, .rules, .steps, .team__exp, .person');
  if ('IntersectionObserver' in window) {
    targets.forEach((el) => el.classList.add('reveal'));
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    targets.forEach((el) => io.observe(el));
  }

  const banner = document.querySelector('.cookie');
  if (banner) {
    let visto = false;
    try { visto = localStorage.getItem('sarare-aviso-cookies') === '1'; } catch (e) { visto = false; }
    if (!visto) banner.classList.add('is-on');
    const ok = banner.querySelector('[data-cookie-ok]');
    if (ok) ok.addEventListener('click', () => {
      try { localStorage.setItem('sarare-aviso-cookies', '1'); } catch (e) { /* almacenamiento bloqueado: solo se oculta en esta visita */ }
      banner.classList.remove('is-on');
    });
  }

  // Portada: el código ya está escrito; solo se reescribe el nombre de la demostración
  // y el panel de salida la muestra en un iframe aislado (una sola animación activa a la vez).
  // Demostraciones en orden de rotación: archivo en _opciones/ (con ?embed=1), nombre en el código,
  // título y tiempo a la vista (ms). Para agregar una, basta una línea más en esta lista.
  // Ciclo completo ≈ 60 s. "Del caos al orden" va alineado a su ciclo interno (13,6 s): con 15 s se ve
  // el ciclo entero (caos, barras, logo, disolución) y sale mientras las partículas vuelven a dispersarse.
  // Subir DEMO_V cada vez que se edite una animación, para que el navegador no muestre la versión vieja
  const DEMO_V = '20261004g';
  const DEMOS = [
    { file: 'documentos-a-datos', name: 'documentos_a_datos', title: 'Documentos que se vuelven datos', ms: 11000 },
    { file: 'vision-computador', name: 'vision_por_computador', title: 'Visión por computador', ms: 11000 },
    { file: 'vision-ganado', name: 'conteo_de_ganado', title: 'Conteo y pesaje de ganado', ms: 12000 },
    { file: 'vision-banda', name: 'banda_de_produccion', title: 'Visión en la línea de producción', ms: 11000 },
    { file: 'cacao-iot-vision', name: 'cacao_inteligente', title: 'Cacao: secado y selección de grano', ms: 13000 },
    { file: 'citas-agenda', name: 'citas_en_linea', title: 'Citas en línea', ms: 12000 },
    { file: 'dron-cultivo', name: 'dron_en_cultivo', title: 'Dron: mapa de salud del cultivo', ms: 12000 },
    { file: 'inventario', name: 'control_de_inventario', title: 'Inventario bajo control', ms: 12000 },
    { file: 'rutas-entregas', name: 'rutas_de_entrega', title: 'Rutas de entrega en tiempo real', ms: 11000 },
    { file: 'facturas-automaticas', name: 'facturas_automaticas', title: 'Facturas que se procesan solas', ms: 12000 },
    { file: 'sensores-iot-simple', name: 'sensores_iot', title: 'Sensores en vivo', ms: 11000 },
    { file: 'caos-al-orden', name: 'del_caos_al_orden', title: 'Del caos al orden', ms: 13000 },
  ];
  const demoStage = document.getElementById('demoStage');
  const demoName = document.getElementById('demoName');
  const demoTitle = document.getElementById('demoTitle');
  const dotsBox = document.getElementById('demoDots');
  if (demoStage && demoName && demoTitle && dotsBox) {
    const demos = DEMOS;
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const figure = demoStage.closest('.ide');
    const code = figure.querySelector('.ide__code');
    const titleBox = demoTitle.parentElement;
    const section = demoStage.closest('section');
    const cover = section && section.nextElementSibling;   // la sección que sube por encima de la portada
    const wait = (ms) => new Promise((ok) => setTimeout(ok, ms));
    let cur = 0, gen = 0, timer = 0, live = null, shown = false, auto = true;

    const demoDots = demos.map((d) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'out__dot';
      b.setAttribute('aria-label', 'Ver demostración: ' + d.title);
      b.setAttribute('aria-pressed', 'false');
      dotsBox.appendChild(b);
      return b;
    });
    const setDots = (i) => demoDots.forEach((b, k) => { b.classList.toggle('is-on', k === i); b.setAttribute('aria-pressed', String(k === i)); });
    const setTitle = (i) => {
      const t = demos[i].title;
      if (demoTitle.textContent === t) return;
      if (still) { demoTitle.textContent = t; return; }
      titleBox.classList.add('is-swap');
      setTimeout(() => { demoTitle.textContent = t; titleBox.classList.remove('is-swap'); }, 300);
    };
    demoName.textContent = demos[0].name; demoTitle.textContent = demos[0].title; setDots(0);

    // El iframe va aislado (sandbox: otro proceso, no frena esta página). Avisa la rueda y las
    // flechas por mensaje y aquí se aplican: el paso de hoja sigue funcionando sobre la animación.
    const SCROLL_KEYS = { ArrowDown: 40, ArrowUp: -40, PageDown: 0.9, PageUp: -0.9, ' ': 0.9 };
    window.addEventListener('message', (e) => {
      const d = e.data;
      if (!d || typeof d !== 'object' || (d.sarare !== 'wheel' && d.sarare !== 'key')) return;
      if (![...demoStage.querySelectorAll('iframe')].some((f) => f.contentWindow === e.source)) return;
      if (d.sarare === 'wheel') {
        const ev = new WheelEvent('wheel', { deltaX: +d.dx || 0, deltaY: +d.dy || 0, deltaMode: +d.mode || 0, bubbles: true, cancelable: true });
        if (window.dispatchEvent(ev)) {                        // nadie la tomó: desplazamiento normal
          const k = ev.deltaMode === 1 ? 16 : ev.deltaMode === 2 ? window.innerHeight : 1;
          window.scrollBy({ left: ev.deltaX * k, top: ev.deltaY * k, behavior: 'instant' });
        }
      } else if (d.key in SCROLL_KEYS) {
        const ev = new KeyboardEvent('keydown', { key: d.key, bubbles: true, cancelable: true });
        if (window.dispatchEvent(ev)) {
          const v = SCROLL_KEYS[d.key];
          window.scrollBy({ top: Math.abs(v) < 1 ? v * window.innerHeight : v, behavior: 'smooth' });
        }
      }
    });
    const makeFrame = (i) => {
      const f = document.createElement('iframe');
      f.setAttribute('sandbox', 'allow-scripts');
      f.title = 'Demostración animada: ' + demos[i].title;
      f.tabIndex = -1;
      f.loading = 'lazy';
      f.setAttribute('aria-hidden', 'true');
      f.addEventListener('load', () => { f.dataset.ready = '1'; }, { once: true });
      f.addEventListener('error', () => console.error('[portada] no cargó la demostración', f.src));
      f.src = '_opciones/' + demos[i].file + '.html?embed=1&v=' + DEMO_V;
      demoStage.appendChild(f);
      return f;
    };
    const ready = (f, max) => new Promise((ok) => {
      if (f.dataset.ready) { ok(); return; }
      const t = setTimeout(() => { console.warn('[portada] la demostración tarda en cargar; se muestra igual', f.src); ok(); }, max);
      f.addEventListener('load', () => { clearTimeout(t); ok(); }, { once: true });
    });
    const show = (f) => {
      demoStage.querySelectorAll('iframe').forEach((x) => {
        if (x === f) return;
        x.classList.remove('is-on'); x.setAttribute('aria-hidden', 'true');
        setTimeout(() => x.remove(), still ? 0 : 700);           // se descarga tras el fundido
      });
      f.classList.add('is-on'); f.removeAttribute('aria-hidden');
      live = f;
    };
    // Cada demostración queda a la vista ~ms: se descuenta lo que tarda en borrar y escribir el siguiente nombre
    const schedule = (g) => {
      clearTimeout(timer);
      if (still || !auto) return;
      const nx = (cur + 1) % demos.length;
      const typing = demos[cur].name.length * 30 + 180 + demos[nx].name.length * 60 + 150;
      timer = setTimeout(() => { if (g === gen) go(nx, false); }, Math.max(2000, demos[cur].ms - typing));
    };

    // Borra el nombre anterior, escribe el nuevo (precargando su iframe) y funde la salida
    async function go(i, fast) {
      const g = ++gen;
      clearTimeout(timer);
      cur = i; setDots(i);
      code.classList.add('is-typing');
      let s = demoName.textContent, f = null;
      const drop = () => { if (g === gen) code.classList.remove('is-typing'); if (f && f !== live) f.remove(); };
      while (s.length) {
        s = s.slice(0, -1); demoName.textContent = s;
        await wait(fast ? 12 : 30); if (g !== gen) { drop(); return; }
      }
      f = makeFrame(i);                                         // precarga ~1 s antes del cambio
      await wait(fast ? 60 : 180); if (g !== gen) { drop(); return; }
      const to = demos[i].name;
      for (let k = 1; k <= to.length; k++) {
        demoName.textContent = to.slice(0, k);
        await wait(fast ? 18 + Math.random() * 10 : 40 + Math.random() * 40); if (g !== gen) { drop(); return; }
      }
      code.classList.remove('is-typing');
      await ready(f, 4000); if (g !== gen) { drop(); return; }
      show(f); setTitle(i);
      schedule(g);
    }

    // Fuera de pantalla o con la pestaña oculta: se detiene y se descarga la animación
    const pause = () => {
      if (!shown) return;
      shown = false; gen++; clearTimeout(timer);
      demoStage.querySelectorAll('iframe').forEach((x) => x.remove());
      live = null;
      code.classList.remove('is-typing');
      demoName.textContent = demos[cur].name; setDots(cur); setTitle(cur);
    };
    const resume = () => {
      if (shown) return;
      shown = true;
      const g = ++gen, f = makeFrame(cur);
      ready(f, 4000).then(() => { if (g !== gen) { if (f !== live) f.remove(); return; } show(f); schedule(g); });
    };
    const pick = (i) => {
      if (i === cur && live) return;
      if (still || !shown) {
        gen++; clearTimeout(timer);
        cur = i; setDots(i); demoName.textContent = demos[i].name; setTitle(i);
        if (shown) show(makeFrame(i));
        return;
      }
      go(i, true);
    };
    demoDots.forEach((b, i) => b.addEventListener('click', () => pick(i)));

    // Carrusel manual: flechas, pausa/reproducir y teclado (← →) con el foco en la ilustración
    const step = (d) => pick((cur + d + demos.length) % demos.length);
    const prevB = document.getElementById('demoPrev'), nextB = document.getElementById('demoNext');
    const playB = document.getElementById('demoPlay');
    if (prevB) prevB.addEventListener('click', () => step(-1));
    if (nextB) nextB.addEventListener('click', () => step(1));
    const setAuto = (on) => {
      auto = on;
      if (playB) {
        playB.classList.toggle('is-paused', !on);
        playB.setAttribute('aria-pressed', String(!on));
        playB.setAttribute('aria-label', on ? 'Pausar el carrusel' : 'Reanudar el carrusel');
      }
      if (on) { if (shown && live) schedule(gen); } else clearTimeout(timer);
    };
    if (playB) { if (still) setAuto(false); playB.addEventListener('click', () => setAuto(!auto)); }
    figure.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
    });
    let sx = null;
    demoStage.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    demoStage.addEventListener('touchend', (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx; sx = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    }, { passive: true });

    let queued = false;
    const check = () => {
      queued = false;
      const r = figure.getBoundingClientRect();
      const coverTop = cover ? cover.getBoundingClientRect().top : Infinity;
      const vis = !document.hidden && r.bottom > 0 && r.top < window.innerHeight && coverTop > r.top + 60;
      if (vis) resume(); else pause();
    };
    const queue = () => { if (!queued) { queued = true; requestAnimationFrame(check); } };
    if ('IntersectionObserver' in window) new IntersectionObserver(queue).observe(figure);
    window.addEventListener('scroll', queue, { passive: true });   // en escritorio la portada queda fija y la tapa la sección siguiente
    window.addEventListener('resize', queue);
    document.addEventListener('visibilitychange', check);
    check();
  }

  // Paso de hoja: de la portada a la sección siguiente (y de vuelta) de un solo movimiento
  const hero = document.querySelector('.hero--horizon');
  const next = document.getElementById('resolver');
  const wide = window.matchMedia('(min-width: 981px) and (min-height: 560px)');
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (hero && next) {
    const HEAD = 68;
    const target = () => next.getBoundingClientRect().top + window.scrollY - HEAD;
    const paint = () => {
      if (!wide.matches) { hero.style.transform = ''; hero.style.filter = ''; return; }
      const p = Math.min(1, Math.max(0, window.scrollY / Math.max(1, target())));
      hero.style.transform = `scale(${1 - p * 0.07}) translateY(${p * -24}px)`;
      hero.style.filter = `brightness(${1 - p * 0.55})`;
    };
    window.addEventListener('scroll', paint, { passive: true });
    window.addEventListener('resize', paint);
    paint();

    let busy = false;
    const glide = (to) => {
      if (calm.matches) { window.scrollTo(0, to); return; }
      busy = true;
      const from = window.scrollY, d = to - from, t0 = performance.now(), ms = 850;
      document.documentElement.style.scrollBehavior = 'auto';
      const ease = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
      const step = (now) => {
        const k = Math.min(1, (now - t0) / ms);
        window.scrollTo(0, from + d * ease(k));
        if (k < 1) requestAnimationFrame(step);
        else { document.documentElement.style.scrollBehavior = ''; setTimeout(() => { busy = false; }, 250); }
      };
      requestAnimationFrame(step);
    };
    const zone = () => window.scrollY < target() - 4;
    const atNext = () => Math.abs(window.scrollY - target()) < 6;
    const decide = (down, e) => {
      if (!wide.matches) return;
      if (busy) { if (e && e.cancelable) e.preventDefault(); return; }
      if (down && zone()) { if (e && e.cancelable) e.preventDefault(); glide(target()); }
      else if (!down && (zone() || atNext()) && window.scrollY > 0) { if (e && e.cancelable) e.preventDefault(); glide(0); }
    };
    window.addEventListener('wheel', (e) => { if (Math.abs(e.deltaY) > 2) decide(e.deltaY > 0, e); }, { passive: false });
    let ty = null;
    window.addEventListener('touchstart', (e) => { ty = e.touches[0].clientY; }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (ty === null) return;
      const dy = ty - e.touches[0].clientY;
      if (Math.abs(dy) > 24) { decide(dy > 0, e); ty = null; }
    }, { passive: false });
    window.addEventListener('keydown', (e) => {
      if (/input|textarea|select/i.test(document.activeElement.tagName)) return;
      if (['ArrowDown', 'PageDown', ' '].includes(e.key)) decide(true, e);
      if (['ArrowUp', 'PageUp'].includes(e.key)) decide(false, e);
    });
  }

  // Explicación en palabras sencillas
  const dlg = document.getElementById('explica');
  if (dlg && typeof dlg.showModal === 'function') {
    document.querySelectorAll('[data-explica]').forEach((b) => b.addEventListener('click', () => dlg.showModal()));
    dlg.querySelectorAll('[data-cerrar]').forEach((b) => b.addEventListener('click', () => dlg.close()));
    dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  } else {
    document.querySelectorAll('[data-explica]').forEach((b) => b.addEventListener('click', () => { const r = document.getElementById('resolver'); if (r) r.scrollIntoView({ behavior: 'smooth' }); }));
  }

  // Barra superior: se compacta al bajar y marca la sección en la que está el visitante
  const top = document.querySelector('.top--clean');
  if (top) {
    const onScroll = () => top.classList.toggle('is-scrolled', window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
    const links = [...document.querySelectorAll('.nav a:not(.btn)')];
    const secs = links.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
    if ('IntersectionObserver' in window && secs.length) {
      const spy = new IntersectionObserver((ents) => {
        ents.forEach((en) => {
          if (!en.isIntersecting) return;
          links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      secs.forEach((s) => spy.observe(s));
      window.addEventListener('scroll', () => { if (window.scrollY < 200) links.forEach((a) => a.classList.remove('is-active')); }, { passive: true });
    }
  }
})();
