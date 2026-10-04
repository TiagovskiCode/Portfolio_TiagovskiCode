document.addEventListener('DOMContentLoaded', () => {

  // ─── Theme toggle (dark / light) ───────────────────────
  const root = document.documentElement;
  const themeBtn = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme');

  if (savedTheme) {
    root.setAttribute('data-theme', savedTheme);
  } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
    root.setAttribute('data-theme', 'light');
  }

  themeBtn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  // ─── Footer year ───────────────────────────────────────
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ─── Mobile nav ────────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');

  hamburger?.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  navMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ─── Scroll spy: highlight active nav link ─────────────
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];

  function updateActiveLink() {
    let current = null;
    sections.forEach(sec => {
      if (!sec.offsetParent) return;
      if (sec.getBoundingClientRect().top <= window.innerHeight * 0.4) current = sec.id;
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  // ─── Reveal on scroll ──────────────────────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // ─── Contact form (Formspree) ──────────────────────────
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
        alert('Mensagem enviada com sucesso! Entro em contacto em breve. ✉️');
        form.reset();
      } else {
        alert('Algo correu mal. Tenta novamente ou fala comigo no WhatsApp.');
      }
    } catch {
      alert('Erro de rede. Verifica a tua ligação e tenta novamente.');
    } finally {
      form.classList.remove('submitting');
    }
  });

  // ─── Project modal (zoom in / zoom out + gallery) ──────
  const modal = document.getElementById('projectModal');

  if (modal) {
    const WA_BASE = 'https://wa.me/67077376964?text=';
    const ZOOM_LEVELS = [1, 2, 3];

    const stage = document.getElementById('pmStage');
    const imgEl = document.getElementById('pmImg');
    const placeholder = document.getElementById('pmPlaceholder');
    const placeholderText = placeholder.querySelector('span');
    const controls = document.getElementById('pmControls');
    const thumbsEl = document.getElementById('pmThumbs');
    const infoEl = document.getElementById('pmInfo');
    const counter = document.getElementById('pmCounter');
    const btnPrev = document.getElementById('pmPrev');
    const btnNext = document.getElementById('pmNext');
    const btnIn = document.getElementById('pmZoomIn');
    const btnOut = document.getElementById('pmZoomOut');
    const btnClose = document.getElementById('pmClose');

    let images = [];
    let current = 0;
    let zoomIdx = 0;
    let lastFocus = null;
    let token = 0;
    let closing = false;
    let startX = 0, startY = 0, dragged = false;

    const originFrom = (e) => {
      const r = stage.getBoundingClientRect();
      const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
      const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
      return `${x}% ${y}%`;
    };

    function setZoom(idx, origin) {
      zoomIdx = Math.max(0, Math.min(ZOOM_LEVELS.length - 1, idx));
      if (origin) imgEl.style.transformOrigin = origin;
      if (zoomIdx === 0) imgEl.style.transformOrigin = '50% 50%';
      imgEl.style.transform = `scale(${ZOOM_LEVELS[zoomIdx]})`;
      stage.classList.toggle('zoomed', zoomIdx > 0);
      btnOut.disabled = zoomIdx === 0;
      btnIn.disabled = zoomIdx === ZOOM_LEVELS.length - 1;
    }

    function showImage(i) {
      if (!images.length) return;
      current = (i + images.length) % images.length;
      imgEl.src = images[current].src;
      imgEl.alt = images[current].alt;
      imgEl.hidden = false;
      placeholder.hidden = true;
      setZoom(0);
      counter.textContent = `${current + 1} / ${images.length}`;
      thumbsEl.querySelectorAll('.pm-thumb').forEach((t, idx) => t.classList.toggle('active', idx === current));
    }

    const loadImage = (item) => new Promise(resolve => {
      const probe = new Image();
      probe.onload = () => resolve(item);
      probe.onerror = () => resolve(null);
      probe.src = item.src;
    });

    function buildGallery(list) {
      images = list;
      thumbsEl.innerHTML = '';
      const many = images.length > 1;

      if (!images.length) {
        imgEl.hidden = true;
        placeholder.hidden = false;
        placeholderText.textContent = 'Imagens em breve';
        controls.hidden = true;
        return;
      }

      controls.hidden = false;
      btnPrev.hidden = btnNext.hidden = counter.hidden = !many;

      if (many) {
        images.forEach((item, idx) => {
          const b = document.createElement('button');
          b.type = 'button';
          b.className = 'pm-thumb';
          b.setAttribute('aria-label', `Ver imagem ${idx + 1}`);
          const t = document.createElement('img');
          t.src = item.src; t.alt = '';
          b.appendChild(t);
          b.addEventListener('click', () => showImage(idx));
          thumbsEl.appendChild(b);
        });
      }
      showImage(0);
    }

    async function openProject(id) {
      const tpl = document.getElementById('project-' + id);
      if (!tpl || closing) return;

      const myToken = ++token;
      const frag = tpl.content.cloneNode(true);
      const title = tpl.dataset.title || '';
      const status = tpl.dataset.status || '';

      const list = [...frag.querySelectorAll('.pm-images img')].map(i => ({ src: i.dataset.src, alt: i.alt }));
      frag.querySelector('.pm-images')?.remove();

      infoEl.innerHTML = '';
      const eyebrow = document.createElement('p');
      eyebrow.className = 'eyebrow';
      eyebrow.textContent = 'CASO DE SUCESSO';
      const h3 = document.createElement('h3');
      h3.id = 'pmTitle';
      h3.textContent = title;
      infoEl.append(eyebrow, h3);

      if (status) {
        const badge = document.createElement('span');
        badge.className = 'badge badge-live';
        badge.innerHTML = '<span class="pulse"></span>';
        badge.append(status);
        infoEl.appendChild(badge);
      }
      infoEl.appendChild(frag);

      // Botão "Visitar site" só aparece se tiver link
      infoEl.querySelectorAll('[data-site-link]').forEach(a => {
        if (!a.getAttribute('href')) a.remove();
      });

      // CTA de conversão
      const actions = infoEl.querySelector('.pm-actions') || infoEl.appendChild(Object.assign(document.createElement('div'), { className: 'pm-actions' }));
      const cta = document.createElement('a');
      cta.className = 'btn btn-primary';
      cta.target = '_blank';
      cta.rel = 'noreferrer';
      cta.href = WA_BASE + encodeURIComponent(`Olá! Vi o projeto ${title} e gostava de pedir um orçamento para um site semelhante.`);
      cta.innerHTML = '<i class="ri-whatsapp-line"></i> Quero um site assim';
      actions.prepend(cta);
      infoEl.scrollTop = 0;

      // Estado inicial (a carregar)
      images = [];
      thumbsEl.innerHTML = '';
      imgEl.hidden = true;
      placeholder.hidden = false;
      placeholderText.textContent = 'A carregar…';
      controls.hidden = true;
      setZoom(0);

      lastFocus = document.activeElement;
      if (!modal.open) modal.showModal();
      document.body.style.overflow = 'hidden';

      const loaded = (await Promise.all(list.map(loadImage))).filter(Boolean);
      if (myToken !== token) return;
      buildGallery(loaded);
    }

    function closeModal() {
      if (!modal.open || closing) return;
      closing = true;
      token++;
      modal.classList.add('closing');
      setTimeout(() => {
        modal.classList.remove('closing');
        modal.close();
        document.body.style.overflow = '';
        closing = false;
        lastFocus?.focus?.();
      }, 200);
    }

    // Abrir pelos cartões (clique ou teclado)
    document.querySelectorAll('.project-card[data-project]').forEach(card => {
      card.addEventListener('click', () => openProject(card.dataset.project));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openProject(card.dataset.project);
        }
      });
    });

    // Fechar
    btnClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
    modal.addEventListener('cancel', (e) => { e.preventDefault(); closeModal(); });

    // Galeria
    btnPrev.addEventListener('click', () => showImage(current - 1));
    btnNext.addEventListener('click', () => showImage(current + 1));

    // Zoom in / zoom out
    btnIn.addEventListener('click', () => setZoom(zoomIdx + 1));
    btnOut.addEventListener('click', () => setZoom(zoomIdx - 1));

    stage.addEventListener('pointerdown', (e) => { startX = e.clientX; startY = e.clientY; dragged = false; });
    stage.addEventListener('pointermove', (e) => {
      if (e.buttons && Math.hypot(e.clientX - startX, e.clientY - startY) > 6) dragged = true;
      if (zoomIdx > 0 && (e.pointerType === 'mouse' || e.buttons)) imgEl.style.transformOrigin = originFrom(e);
    });
    stage.addEventListener('click', (e) => {
      if (imgEl.hidden || e.target.closest('.pm-controls')) return;
      if (dragged) { dragged = false; return; }
      if (zoomIdx === 0) setZoom(1, originFrom(e));
      else setZoom(0);
    });

    // Teclado
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' && images.length > 1) showImage(current - 1);
      else if (e.key === 'ArrowRight' && images.length > 1) showImage(current + 1);
      else if (e.key === '+' || e.key === '=') setZoom(zoomIdx + 1);
      else if (e.key === '-') setZoom(zoomIdx - 1);
    });
  }

});