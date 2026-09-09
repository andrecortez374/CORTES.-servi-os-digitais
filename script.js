"use strict";

const CORTES_CONFIG = {
  brand: "CORTÊS",
  whatsappSites: "5579981719602",
  whatsappTraffic: "5579988133030",
  social: "@cortezweb.ia"
};

const $ = (selector, root = document) => root?.querySelector?.(selector) || null;
const $$ = (selector, root = document) => root ? [...root.querySelectorAll(selector)] : [];

function whatsappURL(phone, message) {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

function initWhatsApp() {
  $$('[data-wa]').forEach(button => {
    button.addEventListener('click', () => {
      const route = button.dataset.wa === 'traffic' ? 'traffic' : 'site';
      const phone = route === 'traffic' ? CORTES_CONFIG.whatsappTraffic : CORTES_CONFIG.whatsappSites;
      const message = button.dataset.message || `Olá, Cortês. Vim pelo site e quero conversar sobre ${route === 'traffic' ? 'tráfego pago' : 'meu projeto digital'}.`;
      window.open(whatsappURL(phone, message), '_blank', 'noopener,noreferrer');
    });
  });
}

function initMenu() {
  const toggle = $('#menuToggle');
  const nav = $('#mainNav');
  if (!toggle || !nav) return;

  const close = () => {
    toggle.classList.remove('is-open');
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  };

  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.classList.toggle('is-open', open);
    nav.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('menu-open', open);
  });

  $$('a', nav).forEach(link => link.addEventListener('click', close));
  window.addEventListener('resize', () => { if (window.innerWidth > 1040) close(); });
  document.addEventListener('keydown', event => { if (event.key === 'Escape') close(); });
}

function initHeader() {
  const header = $('#siteHeader');
  const progress = $('#scrollProgress');

  const update = () => {
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 18);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = `${max > 0 ? Math.min(100, Math.max(0, (window.scrollY / max) * 100)) : 0}%`;
    }
  };

  update();
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
}

function initReveal() {
  const items = $$('.reveal');
  if (!items.length) return;

  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(item => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

  items.forEach(item => observer.observe(item));
}

function initSmoothAnchors() {
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const id = link.getAttribute('href');
      if (!id || id === '#') return;
      const target = $(id);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    });
  });
}

function initYear() {
  const year = $('#currentYear');
  if (year) year.textContent = new Date().getFullYear();
}

function init() {
  initMenu();
  initHeader();
  initReveal();
  initSmoothAnchors();
  initWhatsApp();
  initYear();
}

document.addEventListener('DOMContentLoaded', init);