document.addEventListener('DOMContentLoaded', () => {

  // ─── Theme Toggle ───────────────────────────────────
  const root        = document.documentElement;
  const themeBtn    = document.getElementById('themeToggle');
  const savedTheme  = localStorage.getItem('theme');

  // Apply saved theme or system preference on load
  if (savedTheme === 'light' || (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches)) {
    root.classList.add('light');
  }

  themeBtn?.addEventListener('click', () => {
    root.classList.toggle('light');
    localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
  });

  // ─── Footer Year ────────────────────────────────────
  document.getElementById('year').textContent = new Date().getFullYear();

  // ─── Mobile Nav ─────────────────────────────────────
  const hamburger = document.getElementById('hamburger');
  const navMenu   = document.getElementById('navMenu');

  hamburger?.addEventListener('click', () => {
    const open = navMenu.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close mobile nav when a link is clicked
  navMenu?.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // ─── Nav Span: hover + scroll spy ─────────────────
  const sections  = [...document.querySelectorAll('main[id], section[id]')];
  const navLinks  = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const navSpan   = document.querySelector('.nav_span');
  let activeLink  = navLinks[0]; // default: Home

  // Move the pill to a given <a>
  function moveSpanTo(link) {
    if (!navSpan || !link) return;
    const navRect  = navMenu.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();
    navSpan.style.left  = (linkRect.left  - navRect.left)  + 'px';
    navSpan.style.width = linkRect.width + 'px';
  }

  // Hover: temporarily move span to hovered link
  navLinks.forEach(link => {
    link.addEventListener('mouseenter', () => moveSpanTo(link));
    link.addEventListener('mouseleave', () => moveSpanTo(activeLink)); // snap back
  });

  // Scroll spy: update activeLink when section changes
  function updateActiveLink() {
    let current = navLinks[0];

    sections.forEach((sec, i) => {
      if (sec.getBoundingClientRect().top <= window.innerHeight * 0.4) {
        // Find the matching nav link
        const match = navLinks.find(l => l.getAttribute('href') === '#' + sec.id);
        if (match) current = match;
      }
    });

    activeLink = current;
    moveSpanTo(activeLink); // only moves if mouse is NOT hovering (mouseleave snaps back here)
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // Initial position after layout is painted
  requestAnimationFrame(() => {
    updateActiveLink();
  });

  // ─── Reveal on Scroll (IntersectionObserver) ───────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

  // ─── Contact Form (Formspree) ───────────────────────
  const form      = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Prevent double-submit
    form.classList.add('submitting');

    try {
      const response = await fetch(form.action, {
        method:  'POST',
        body:    new FormData(form),
        headers: { Accept: 'application/json' }
      });

      if (response.ok) {
        alert('Mensagem enviada com sucesso! ✉️');
        form.reset();
      } else {
        alert('Erro ao enviar. Por favor tenta novamente.');
      }
    } catch {
      alert('Erro de rede. Verifica a tua conexão e tenta novamente.');
    } finally {
      form.classList.remove('submitting');
    }
  });

});
