/* // Theme (dark by default, respects preference, stored in localStorage)
const root = document.documentElement;
const prefersLight = window.matchMedia('(prefers-color-scheme: light)').matches;
const saved = localStorage.getItem('theme'); // 'dark' or 'light'
if (saved === 'light' || (!saved && prefersLight)) {
  root.classList.add('light');
}
const themeBtn = document.getElementById('themeToggle');
const themeIcon = document.querySelector('.theme-icon');
function setIcon() {
  const light = root.classList.contains('light');
  themeIcon.textContent = light ? '🌙' : '☀️';
}
setIcon();
themeBtn.addEventListener('click', () => {
  root.classList.toggle('light');
  localStorage.setItem('theme', root.classList.contains('light') ? 'light' : 'dark');
  setIcon();
}); */

// Mobile nav
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('navMenu');
hamburger?.addEventListener('click', () => {
  const open = navMenu.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(open));
});

// Elevate header on scroll
const header = document.querySelector('.header');
let lastY = window.scrollY;
addEventListener('scroll', () => {
  const y = window.scrollY;
  if (y > 4 && !header.classList.contains('elevated')) header.classList.add('elevated');
  if (y <= 4) header.classList.remove('elevated');
  lastY = y;
});

// Reveal on scroll (IntersectionObserver)
const revealItems = document.querySelectorAll('[data-reveal]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
revealItems.forEach((el) => observer.observe(el));

// Dynamic timeline dots positions
const timeline = document.querySelector('.timeline');
if (timeline) {
  const dots = timeline.querySelectorAll('.dot');
  dots.forEach((d, i) => {
    d.style.top = (i * 92 + 6) + 'px';
  });
}

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Fake contact form handling (prevent submit)
document.getElementById('contactForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  alert('Obrigado! Este formulário é demonstrativo. Liga-o a um backend (ex.: Formspree).');
});
