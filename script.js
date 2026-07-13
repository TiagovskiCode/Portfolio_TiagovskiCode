document.addEventListener('DOMContentLoaded', () => {

  // ─── Footer year ─────────────────────────────────────
  document.getElementById('year').textContent = new Date().getFullYear();

  // ─── HUD clock (24h, local time) ─────────────────────
  const clockEl = document.getElementById('hudClock');
  function tickClock() {
    if (!clockEl) return;
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    clockEl.textContent = `${hh}:${mm}:${ss}`;
  }
  tickClock();
  setInterval(tickClock, 1000);

  // ─── Starfield canvas ─────────────────────────────────
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');
  let stars = [];
  let w, h;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    const count = Math.floor((w * h) / 6000);
    stars = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.1 + 0.2,
      baseAlpha: Math.random() * 0.6 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      phase: Math.random() * Math.PI * 2,
      drift: Math.random() * 0.04 + 0.01,
    }));
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    for (const s of stars) {
      const alpha = s.baseAlpha + Math.sin(t * s.twinkleSpeed + s.phase) * 0.25;
      ctx.beginPath();
      ctx.fillStyle = `rgba(210, 230, 255, ${Math.max(0, alpha)})`;
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
      s.y += s.drift; // slow downward drift, like passing stars
      if (s.y > h) { s.y = 0; s.x = Math.random() * w; }
    }
    requestAnimationFrame(draw);
  }

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  resize();
  window.addEventListener('resize', resize);
  if (!reduceMotion) requestAnimationFrame(draw);
  else draw(0); // draw once, static

  // ─── Modal system ─────────────────────────────────────
  const panels = document.querySelectorAll('.panel[data-target]');
  const overlays = document.querySelectorAll('.overlay');
  let lastFocused = null;

  function openModal(id) {
    const overlay = document.getElementById(id);
    if (!overlay) return;
    lastFocused = document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    const closeBtn = overlay.querySelector('.modal-close');
    closeBtn?.focus();
    document.addEventListener('keydown', onKeydown);
  }

  function closeModal(overlay) {
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.removeEventListener('keydown', onKeydown);
    lastFocused?.focus();
  }

  function onKeydown(e) {
    if (e.key === 'Escape') {
      const openOverlay = document.querySelector('.overlay.open');
      if (openOverlay) closeModal(openOverlay);
    }
  }

  panels.forEach(panel => {
    panel.addEventListener('click', () => openModal(panel.dataset.target));
  });

  overlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeModal(overlay);
    });
    overlay.querySelector('[data-close]')?.addEventListener('click', () => closeModal(overlay));
  });

  // ─── Contact form (Formspree) ─────────────────────────
  const form = document.getElementById('contactForm');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    form.classList.add('submitting');

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (response.ok) {
        alert('Message transmitted successfully! ✉️');
        form.reset();
      } else {
        alert('Something went wrong. Please try again.');
      }
    } catch {
      alert('Network error. Check your connection and try again.');
    } finally {
      form.classList.remove('submitting');
    }
  });

});
