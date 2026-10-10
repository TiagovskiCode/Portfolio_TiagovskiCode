document.addEventListener('DOMContentLoaded', () => {

  // ─── Theme toggle (dark / light) ───────────────────────
  const root = document.documentElement;
  const isEn = root.lang === 'en';
  const T = isEn ? {
    waForm: 'Hi! I sent a message through the website and would like to talk about my project.',
    ok: (l) => 'Message sent successfully! I will get back to you soon. If it is urgent, <a href="' + l + '" target="_blank" rel="noreferrer">message me on WhatsApp</a>.',
    err: (l) => 'Something went wrong while sending. Please try again or <a href="' + l + '" target="_blank" rel="noreferrer">message me on WhatsApp</a>.',
    off: (l) => 'No internet connection? Check your connection and try again, or <a href="' + l + '" target="_blank" rel="noreferrer">message me on WhatsApp</a>.',
    zoom: 'Zoom image in or out',
    soon: 'Images coming soon',
    eyebrow: 'SUCCESS STORY',
    waProject: (t) => `Hi! I saw the ${t} project and would like to request a quote for a similar website.`,
    cta: 'I want a site like this'
  } : {
    waForm: 'Olá! Enviei uma mensagem pelo site e gostava de falar sobre o meu projeto.',
    ok: (l) => 'Mensagem enviada com sucesso! Respondo-te em breve. Se for urgente, <a href="' + l + '" target="_blank" rel="noreferrer">fala comigo no WhatsApp</a>.',
    err: (l) => 'Algo correu mal ao enviar. Tenta novamente ou <a href="' + l + '" target="_blank" rel="noreferrer">fala comigo no WhatsApp</a>.',
    off: (l) => 'Sem ligação à internet? Verifica a tua ligação e tenta novamente, ou <a href="' + l + '" target="_blank" rel="noreferrer">fala comigo no WhatsApp</a>.',
    zoom: T.zoom,
    soon: 'Imagens em breve',
    eyebrow: 'CASO DE SUCESSO',
    waProject: (t) => `Olá! Vi o projeto ${t} e gostava de pedir um orçamento para um site semelhante.`,
    cta: 'Quero um site assim'
  };
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

  // ─── Mobile nav (gaveta à direita + overlay + botão X) ──
  const hamburger = document.getElementById('hamburger');
  const navMenu = document.getElementById('navMenu');
  const navOverlay = document.getElementById('navOverlay');
  const navClose = document.getElementById('navClose');
  const desktopMQ = window.matchMedia('(min-width: 761px)');

  function setMenu(open) {
    if (!navMenu || !hamburger) return;
    const wasOpen = navMenu.classList.contains('open');
    if (wasOpen === open) return;
    navMenu.classList.toggle('open', open);
    navOverlay?.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    document.body.classList.toggle('menu-open', open);
    if (open) navClose?.focus();
    else hamburger.focus();
  }

  hamburger?.addEventListener('click', () => setMenu(!navMenu.classList.contains('open')));
  navClose?.addEventListener('click', () => setMenu(false));
  navOverlay?.addEventListener('click', () => setMenu(false));
  navMenu?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

  document.addEventListener('keydown', (e) => {
    if (!navMenu?.classList.contains('open')) return;
    if (e.key === 'Escape') { setMenu(false); return; }
    if (e.key === 'Tab') {                       // mantém o foco dentro da gaveta
      const items = [...navMenu.querySelectorAll('a, button')].filter(el => el.offsetParent !== null);
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  desktopMQ.addEventListener('change', (e) => { if (e.matches) setMenu(false); });

  // ─── Scroll spy (só quando o menu tem âncoras #) ───────
  // Nas páginas separadas o menu não tem âncoras, por isso nem se regista o evento de scroll.
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];

  if (navLinks.length && sections.length) {
    let ticking = false;

    const updateActiveLink = () => {
      ticking = false;
      let current = null;
      sections.forEach(sec => {
        if (!sec.offsetParent) return;
        if (sec.getBoundingClientRect().top <= window.innerHeight * 0.4) current = sec.id;
      });
      navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === '#' + current);
      });
    };

    window.addEventListener('scroll', () => {
      if (!ticking) { ticking = true; requestAnimationFrame(updateActiveLink); }
    }, { passive: true });
    updateActiveLink();
  }

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
  const statusEl = document.getElementById('formStatus');
  const WA_LINK = 'https://wa.me/67077376964?text=' + encodeURIComponent(T.waForm);

  function showStatus(state, html) {
    if (!statusEl) return;
    statusEl.dataset.state = state;
    statusEl.innerHTML = html;
    statusEl.hidden = false;
    statusEl.focus({ preventScroll: true });
    statusEl.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.classList.contains('submitting')) return;
    form.classList.add('submitting');
    if (statusEl) statusEl.hidden = true;

    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (response.ok) {
        form.reset();
        showStatus('success', T.ok(WA_LINK));
      } else {
        showStatus('error', T.err(WA_LINK));
      }
    } catch {
      showStatus('error', T.off(WA_LINK));
    } finally {
      form.classList.remove('submitting');
    }
  });

  // ─── FAQ: acordeão animado (uma pergunta aberta de cada vez) ─
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFaqOpen = (item) => item._target ?? item.open;

  function setFaq(item, open) {
    if (isFaqOpen(item) === open) return;
    item._target = open;

    const startH = item.offsetHeight;
    const prev = item._anim; item._anim = null; prev?.cancel();

    // mede a altura aberta e a fechada
    item.open = true;
    const openH = item.offsetHeight;
    item.open = false;
    const closedH = item.offsetHeight;
    item.open = true;                      // fica aberto durante a animação

    if (reduceMotion || typeof item.animate !== 'function') {
      item.open = open; item._target = undefined;
      return;
    }

    item.style.overflow = 'hidden';
    const anim = item.animate(
      { height: [startH + 'px', (open ? openH : closedH) + 'px'] },
      { duration: 260, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
    );
    item._anim = anim;
    anim.onfinish = () => {
      if (item._anim !== anim) return;
      item.open = open;
      item._anim = null; item._target = undefined;
      item.style.overflow = '';
    };
  }

  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('summary')?.addEventListener('click', (e) => {
      e.preventDefault();
      const willOpen = !isFaqOpen(item);
      if (willOpen) {
        const group = item.closest('[data-faq]') || document;
        group.querySelectorAll('.faq-item').forEach(other => { if (other !== item) setFaq(other, false); });
      }
      setFaq(item, willOpen);
    });
  });

  // ─── Project modal (galeria vertical + zoom por imagem) ─
  const modal = document.getElementById('projectModal');

  if (modal) {
    const WA_BASE = 'https://wa.me/67077376964?text=';

    const gallery = document.getElementById('pmGallery');
    const shotsEl = document.getElementById('pmShots');
    const placeholder = document.getElementById('pmPlaceholder');
    const placeholderText = placeholder.querySelector('span');
    const hint = document.getElementById('pmHint');
    const infoEl = document.getElementById('pmInfo');
    const btnClose = document.getElementById('pmClose');

    let lastFocus = null;
    let token = 0;
    let closing = false;

    // Amplia / reduz uma imagem. rx e ry (0 a 1) indicam o ponto onde se clicou.
    function toggleZoom(fig, view, rx, ry) {
      if (fig.classList.contains('zoomed')) {
        fig.classList.remove('zoomed');
        view.scrollLeft = 0;
        view.scrollTop = 0;
        return;
      }
      fig.classList.add('zoomed');
      view.scrollLeft = rx * view.scrollWidth - view.clientWidth / 2;
      view.scrollTop = ry * view.scrollHeight - view.clientHeight / 2;
      fig.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }

    // Mostra as imagens à medida que chegam: a 1.ª com prioridade, as restantes só perto do ecrã.
    // Antes esperava-se por TODAS as imagens antes de mostrar a primeira (pesado em dados móveis).
    function renderGallery(list, myToken) {
      shotsEl.innerHTML = '';

      if (!list.length) {
        placeholder.hidden = false;
        placeholderText.textContent = T.soon;
        hint.hidden = true;
        return;
      }

      placeholder.hidden = true;
      hint.hidden = false;
      let pending = list.length;

      const settle = () => {
        if (myToken !== token) return;
        if (--pending === 0 && !shotsEl.children.length) {
          placeholder.hidden = false;
          placeholderText.textContent = T.soon;
          hint.hidden = true;
        }
      };

      list.forEach((item, i) => {
        const fig = document.createElement('figure');
        fig.className = 'pm-shot';

        const view = document.createElement('div');
        view.className = 'pm-shot-view';
        view.tabIndex = 0;
        view.setAttribute('role', 'button');
        view.setAttribute('aria-label', T.zoom);

        const img = new Image();
        img.alt = item.alt;
        img.decoding = 'async';
        img.draggable = false;
        if (i === 0) img.fetchPriority = 'high';
        else img.loading = 'lazy';
        img.addEventListener('load', () => { fig.classList.add('loaded'); settle(); });
        img.addEventListener('error', () => { fig.remove(); settle(); });
        img.src = item.src;

        view.appendChild(img);
        fig.appendChild(view);

        if (item.alt) {
          const cap = document.createElement('figcaption');
          cap.textContent = item.alt;
          fig.appendChild(cap);
        }

        view.addEventListener('click', (e) => {
          const r = img.getBoundingClientRect();
          const rx = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
          const ry = Math.min(1, Math.max(0, (e.clientY - r.top) / r.height));
          toggleZoom(fig, view, rx, ry);
        });
        view.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleZoom(fig, view, 0.5, 0.5);
          }
        });

        shotsEl.appendChild(fig);
      });
    }

    function openProject(id) {
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
      eyebrow.textContent = T.eyebrow;
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
      cta.href = WA_BASE + encodeURIComponent(T.waProject(title));
      cta.innerHTML = '<i class="ri-whatsapp-line"><svg aria-hidden="true" focusable="false"><use href="#ri-whatsapp-line"/></svg></i> ' + T.cta;
      actions.prepend(cta);
      infoEl.scrollTop = 0;

      // As imagens começam a descarregar já, em paralelo com a animação de abertura
      gallery.scrollTop = 0;
      renderGallery(list, myToken);

      lastFocus = document.activeElement;
      if (!modal.open) modal.showModal();
      document.body.style.overflow = 'hidden';
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
  }

});