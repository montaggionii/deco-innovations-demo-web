(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const NS = 'http://www.w3.org/2000/svg';

  /* ---------- acabados (nombres y códigos tomados de decoinnovations.es; el dibujo es ilustrativo) ---------- */
  const FINISHES = [
    { id: 'mallorca', name: 'Mallorca', kind: 'Placa', group: 'p', val: 'Placa', desc: 'Efecto mármol en tono claro.',
      type: 'marble', photo: 'assets/marble.jpg', base: '#ece8e1', veins: ['#8d8a86', '#b9b5ae'], n: 5, w: [3, 7] },
    { id: 'microcemento', name: 'Microcemento', kind: 'Placa', group: 'p', val: 'Placa', desc: 'Superficie lisa efecto cemento.',
      type: 'cement', base: '#aaa69e', blot: ['#98948c', '#b8b4ac', '#a39f97'] },
    { id: 'rosa', name: 'Rosa de Formentera', kind: 'Placa', group: 'p', val: 'Placa', desc: 'Mármol rosa de vetas claras.',
      type: 'marble', base: '#e4aebb', veins: ['#f8e7ea', '#b46c7d'], n: 4, w: [2.5, 6] },
    { id: 'orinoco', name: 'Orinoco', kind: 'Placa', group: 'p', val: 'Placa', desc: 'Fondo oscuro con vetas claras.',
      type: 'marble', photo: 'assets/marble-dark.jpg', base: '#1c1c1e', veins: ['#e9e3d5', '#b8955a'], n: 4, w: [2, 5] },
    { id: 'roble', name: 'Roble', kind: 'Listón', group: 'l', val: '53102', desc: 'Listón con veta de madera natural.',
      type: 'slats', photo: 'assets/oak.jpg', n: 22, gap: '#3b2514', tones: ['#a8723d', '#b98348', '#9a6634', '#c4915a'], grain: '#6f4521' },
    { id: 'oro', name: 'Oro con blanco', kind: 'Listón', group: 'l', val: 'LK8033', desc: 'Listón dorado con detalles blancos.',
      type: 'slats', n: 26, gap: '#f1ece1', tones: ['#c9a13f', '#d6b254', '#bf9632'], grain: '#f0dc9b' },
    { id: 'negro', name: 'Negro rayado', kind: 'Listón', group: 'l', val: 'LK4010', desc: 'Listón negro con relieve rayado.',
      type: 'slats', n: 20, gap: '#0a0a0a', tones: ['#1c1c1d', '#262627', '#171718'], grain: '#4a4a4c' },
    { id: 'gris', name: 'Madera gris', kind: 'Listón', group: 'l', val: 'LK1018', desc: 'Listón de madera en gris.',
      type: 'slats', n: 22, gap: '#4b4a47', tones: ['#8a8984', '#9a9993', '#7d7c77', '#a6a59f'], grain: '#5f5e5a' },
  ];
  const byId = Object.fromEntries(FINISHES.map(f => [f.id, f]));

  const rng = seed => () => { // mulberry32
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
  let uid = 0;

  /* devuelve el interior de un <svg> (sin gradientes: color plano, trazos y ruido) */
  function paint(f, w, h, seed = 1) {
    const r = rng(seed * 9973 + f.id.length * 131);
    const s = w / 600;
    let o = '';
    if (f.photo) {
      o += `<image href="${f.photo}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice"/>`;
      if (f.type === 'slats') {
        const sw = w / f.n;
        for (let i = 0; i < f.n; i++) {
          const x = i * sw;
          o += `<rect x="${(x + sw * .74).toFixed(2)}" y="0" width="${(sw * .2).toFixed(2)}" height="${h}" fill="#000" opacity=".16"/>`;
          o += `<rect x="${(x + sw * .06).toFixed(2)}" y="0" width="${(sw * .08).toFixed(2)}" height="${h}" fill="#fff" opacity=".1"/>`;
          o += `<rect x="${x.toFixed(2)}" y="0" width="${Math.max(1, sw * .07).toFixed(2)}" height="${h}" fill="${f.gap}" opacity=".9"/>`;
        }
      }
      return o;
    }
    if (f.type === 'marble') {
      o += `<rect width="${w}" height="${h}" fill="${f.base}"/>`;
      for (let c = 0; c < 5; c++) o += `<ellipse cx="${(r() * w).toFixed(0)}" cy="${(r() * h).toFixed(0)}" rx="${(w * (.25 + r() * .35)).toFixed(0)}" ry="${(h * (.1 + r() * .2)).toFixed(0)}" fill="${f.veins[c % f.veins.length]}" opacity=".09"/>`;
      for (let i = 0; i < f.n; i++) {
        const steps = 7, sx = (-0.15 + r() * 1.2) * w, dx = (r() * 1.1 - 0.3) * w;
        const pts = [];
        for (let k = 0; k <= steps; k++) pts.push([sx + dx * k / steps + (r() - .5) * w * .1, -30 + (h + 60) * k / steps + (r() - .5) * h * .03]);
        const mk = off => {
          let d = `M${(pts[0][0] + off).toFixed(1)} ${pts[0][1].toFixed(1)}`;
          for (let k = 1; k < pts.length - 1; k++) {
            const mx = (pts[k][0] + pts[k + 1][0]) / 2 + off, my = (pts[k][1] + pts[k + 1][1]) / 2;
            d += ` Q${(pts[k][0] + off).toFixed(1)} ${pts[k][1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`;
          }
          return d;
        };
        const col = f.veins[i % f.veins.length];
        const sw = (f.w[0] + r() * (f.w[1] - f.w[0])) * Math.max(s, .5);
        o += `<path d="${mk(0)}" fill="none" stroke="${col}" stroke-width="${sw.toFixed(2)}" stroke-linecap="round" opacity="${(.5 + r() * .4).toFixed(2)}"/>`;
        for (const off of [(10 + r() * 16) * s, -(8 + r() * 14) * s]) {
          o += `<path d="${mk(off)}" fill="none" stroke="${col}" stroke-width="${(sw * .3).toFixed(2)}" stroke-linecap="round" opacity="${(.25 + r() * .25).toFixed(2)}"/>`;
        }
      }
      const id = 'n' + (uid++);
      o += `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="${seed}"/><feColorMatrix values="0 0 0 0 .5  0 0 0 0 .5  0 0 0 0 .5  0 0 0 .09 0"/></filter><rect width="${w}" height="${h}" filter="url(#${id})"/>`;
    } else if (f.type === 'cement') {
      o += `<rect width="${w}" height="${h}" fill="${f.base}"/>`;
      for (let i = 0; i < 30; i++) {
        o += `<ellipse cx="${(r() * w).toFixed(0)}" cy="${(r() * h).toFixed(0)}" rx="${(w * (.06 + r() * .16)).toFixed(0)}" ry="${(h * (.02 + r() * .07)).toFixed(0)}" fill="${f.blot[i % f.blot.length]}" opacity="${(.1 + r() * .2).toFixed(2)}"/>`;
      }
      const id = 'n' + (uid++);
      o += `<filter id="${id}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="3" seed="${seed}"/><feColorMatrix values="0 0 0 0 .3  0 0 0 0 .3  0 0 0 0 .3  0 0 0 .38 0"/></filter><rect width="${w}" height="${h}" filter="url(#${id})"/>`;
    } else {
      const sw = w / f.n;
      o += `<rect width="${w}" height="${h}" fill="${f.gap}"/>`;
      for (let i = 0; i < f.n; i++) {
        const x = i * sw, tone = f.tones[Math.floor(r() * f.tones.length)];
        o += `<rect x="${x.toFixed(2)}" y="0" width="${(sw - Math.max(1, sw * .08)).toFixed(2)}" height="${h}" fill="${tone}"/>`;
        o += `<rect x="${(x + sw * .74).toFixed(2)}" y="0" width="${(sw * .18).toFixed(2)}" height="${h}" fill="#000" opacity=".14"/>`;
        for (let g = 0; g < 2; g++) {
          const gx = x + sw * (.15 + r() * .5);
          o += `<rect x="${gx.toFixed(2)}" y="0" width="${Math.max(.6, sw * .035).toFixed(2)}" height="${h}" fill="${f.grain}" opacity="${(.18 + r() * .3).toFixed(2)}"/>`;
        }
      }
    }
    return o;
  }
  function svg(inner, vb, par = 'xMidYMid slice') {
    const el = document.createElementNS(NS, 'svg');
    el.setAttribute('viewBox', vb); el.setAttribute('preserveAspectRatio', par);
    el.setAttribute('aria-hidden', 'true'); el.setAttribute('focusable', 'false');
    el.innerHTML = inner; return el;
  }

  /* ---------- escenario fijo ---------- */
  const wall = document.getElementById('stageWall');
  const layers = {};
  FINISHES.forEach((f, i) => {
    const el = svg(paint(f, 600, 900, i + 1), '0 0 600 900');
    wall.appendChild(el); layers[f.id] = el;
  });
  const capName = document.getElementById('capName'), capKind = document.getElementById('capKind');
  let current = null, chosen = null, z = 1;
  function setFinish(id, fromUser, instant) {
    if (!byId[id]) return;
    if (fromUser) chosen = id;
    if (id === current) return;
    current = id;
    const next = layers[id];
    Object.values(layers).forEach(el => { if (el !== next && !el.classList.contains('wipe')) el.classList.remove('on'); });
    next.style.zIndex = ++z;
    if (reduced || instant) {
      Object.values(layers).forEach(el => el.classList.toggle('on', el === next));
    } else {
      next.classList.remove('wipe'); void next.getBoundingClientRect();
      next.classList.add('on', 'wipe');
      next.addEventListener('animationend', () => {
        next.classList.remove('wipe');
        Object.entries(layers).forEach(([k, el]) => { if (k !== current) el.classList.remove('on'); });
      }, { once: true });
    }
    const f = byId[id];
    capName.textContent = f.name;
    capKind.textContent = (f.group === 'p' ? 'Placa decorativa' : 'Listón decorativo') + (f.group === 'l' ? ' · ' + f.val : '');
    document.querySelectorAll('.menu-item').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.id === id)));
  }

  /* ---------- menú de acabados (lo que se puede tocar) ---------- */
  const sheet = document.getElementById('menuSheet');
  [['p', 'Placas decorativas'], ['l', 'Listones decorativos']].forEach(([g, title]) => {
    const wrap = document.createElement('div'); wrap.className = 'menu-group';
    wrap.innerHTML = `<h3>${title}</h3>`;
    FINISHES.filter(f => f.group === g).forEach(f => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'menu-item'; b.dataset.id = f.id; b.setAttribute('aria-pressed', 'false');
      b.innerHTML = `<span class="mi-sw"></span><span class="mi-line"><span class="mi-name">${f.name}</span><span class="mi-lead"></span><span class="mi-val">${f.val}</span></span><span class="mi-desc">${f.desc}</span>`;
      b.querySelector('.mi-sw').appendChild(svg(paint(f, 40, 40, 7), '0 0 40 40'));
      b.addEventListener('click', () => setFinish(f.id, true));
      wrap.appendChild(b);
    });
    sheet.appendChild(wrap);
  });

  /* la pared cambia según la sección que lees (si no has elegido tú) */
  const secs = [...document.querySelectorAll('[data-finish]')];
  const seen = new Map();
  const io = new IntersectionObserver(es => {
    es.forEach(e => seen.set(e.target, e.isIntersecting));
    const hit = secs.find(s => seen.get(s));
    if (hit) { if (hit.id !== 'acabados' && hit.id !== 'top') chosen = null; if (!chosen) setFinish(hit.dataset.finish); }
  }, { rootMargin: '-45% 0px -45% 0px' });
  secs.forEach(s => io.observe(s));
  setFinish('mallorca', false, true);

  /* ---------- galería: fotos de referencia con licencia abierta ---------- */
  const frames = [
    { m: 'tall', items: [['Cocina con listones', 'g-cocina', 'Cocina con un muro de listones de madera verticales y encimera clara']] },
    { m: 'pair', items: [['Baño', 'g-bano', 'Baño blanco con azulejos verdes y toallero'], ['Salón', 'g-salon', 'Salón con grandes ventanales y vistas a un lago']] },
    { m: 'wide', items: [['Cocina y comedor', 'g-comedor', 'Cocina oscura y comedor luminoso de plano abierto']] },
    { m: 'tall', items: [['Dormitorio', 'g-dormitorio', 'Cabecero tapizado sobre una pared oscura con motivos geométricos']] },
  ];
  const row = document.getElementById('row');
  frames.forEach(fr => {
    const mod = document.createElement('div'); mod.className = 'mod mod-' + fr.m;
    fr.items.forEach(([label, file, alt]) => {
      const pic = document.createElement('div'); pic.className = 'pic';
      pic.innerHTML = `<img src="assets/${file}.jpg" alt="${alt}" loading="lazy" decoding="async"><span>${label} · referencia</span>`;
      mod.appendChild(pic);
    });
    row.appendChild(mod);
  });
  const mods = row.querySelectorAll('.mod');
  const showMod = m => m.querySelectorAll('.pic').forEach((p, i) => { p.style.transitionDelay = (i * 120) + 'ms'; p.classList.add('in'); });
  if (reduced || !('IntersectionObserver' in window)) mods.forEach(showMod);
  else {
    // se observa el contenedor: un clip-path a cero dejaría al .pic sin área visible
    const po = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { showMod(e.target); po.unobserve(e.target); } }), { threshold: .12 });
    mods.forEach(m => po.observe(m));
  }
  // arrastrar con el ratón (el táctil ya desliza solo)
  let down = false, sx = 0, sl = 0;
  row.addEventListener('pointerdown', e => { if (e.pointerType !== 'mouse') return; down = true; sx = e.clientX; sl = row.scrollLeft; row.classList.add('drag'); });
  addEventListener('pointermove', e => { if (down) row.scrollLeft = sl - (e.clientX - sx); });
  addEventListener('pointerup', () => { down = false; row.classList.remove('drag'); });
  row.addEventListener('keydown', e => { if (e.key === 'ArrowRight') row.scrollBy({ left: 320, behavior: 'smooth' }); if (e.key === 'ArrowLeft') row.scrollBy({ left: -320, behavior: 'smooth' }); });

  /* ---------- pie ---------- */
  document.getElementById('footImg').appendChild(svg(paint(byId.orinoco, 600, 900, 3), '0 0 600 900'));

  /* ---------- entradas al scroll ---------- */
  const rv = document.querySelectorAll('.rv');
  if (reduced || !('IntersectionObserver' in window)) rv.forEach(e => e.classList.add('in'));
  else {
    const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); o.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: .05 });
    rv.forEach(e => o.observe(e));
  }

  /* ---------- palabra de marca: escala con el scroll (máx. 6%) ---------- */
  const wm = document.getElementById('wordmark');
  if (!reduced && wm) {
    let tick = false;
    const upd = () => { tick = false; const p = Math.min(1, scrollY / innerHeight); wm.style.transform = `scale(${(1 - .06 * p).toFixed(4)})`; };
    addEventListener('scroll', () => { if (!tick) { tick = true; requestAnimationFrame(upd); } }, { passive: true });
  }

  /* ---------- motion graphics ---------- */
  // Instalación: las placas "se montan" sobre la pared al cargar la página
  if (!reduced) {
    const st = document.getElementById('stage');
    const intro = document.createElement('div'); intro.className = 'intro'; intro.setAttribute('aria-hidden', 'true');
    for (let i = 0; i < 5; i++) { const s = document.createElement('i'); s.style.setProperty('--i', i); intro.appendChild(s); }
    st.appendChild(intro);
    setTimeout(() => intro.remove(), 1900);
  }
  // Wordmark: letras que suben desde una máscara
  const wmEl = document.getElementById('wordmark');
  if (wmEl) {
    wmEl.innerHTML = ['Deco', 'Innovations'].map((w, li) => `<span class="ln">${[...w].map((c, i) => `<span class="wl" style="--d:${(li * 4 + i) * 45}ms">${c}</span>`).join('')}</span>`).join('');
  }
  // 24 h: reloj que da la vuelta y contador
  const clock = document.getElementById('clock'), n24 = document.getElementById('n24');
  if (clock) {
    const run = () => {
      clock.classList.add('go');
      if (reduced) return;
      const t0 = performance.now(), D = 1800;
      const step = t => { const p = Math.min(1, (t - t0) / D); n24.textContent = Math.round(24 * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); };
      n24.textContent = '0'; requestAnimationFrame(step);
    };
    if (reduced || !('IntersectionObserver' in window)) run();
    else { const co = new IntersectionObserver(es => { if (es[0].isIntersecting) { run(); co.disconnect(); } }, { threshold: .5 }); co.observe(clock); }
  }
  // Cinta de acabados
  const track = document.getElementById('track');
  if (track) {
    const one = FINISHES.map(f => `<span class="bi"><span class="bs"><svg viewBox="0 0 40 40" preserveAspectRatio="xMidYMid slice" aria-hidden="true">${paint(f, 40, 40, 9)}</svg></span>${f.name}</span>`).join('');
    track.innerHTML = one + one;
  }

  const bp = document.getElementById('bandPause'), band = document.getElementById('band');
  if (bp) bp.addEventListener('click', () => { const on = band.classList.toggle('paused'); bp.setAttribute('aria-pressed', String(on)); bp.textContent = on ? 'Reanudar' : 'Pausar'; });

  /* ---------- menú móvil ---------- */
  const btn = document.getElementById('menuBtn'), nav = document.getElementById('nav');
  btn.addEventListener('click', () => { const open = nav.classList.toggle('open'); btn.setAttribute('aria-expanded', String(open)); });
  nav.addEventListener('click', e => { if (e.target.tagName === 'A') { nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); } });
})();
