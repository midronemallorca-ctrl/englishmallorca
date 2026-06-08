'use strict';

/* ============================================================
   English Mallorca — main.js
   ============================================================ */

/* ---- Sticky header shadow ---- */
(function () {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ---- Mobile nav toggle ---- */
(function () {
  const toggle = document.querySelector('.nav__toggle');
  const menu   = document.querySelector('.nav__menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    menu.classList.toggle('open', !expanded);
    document.body.style.overflow = expanded ? '' : 'hidden';
  });

  // Close on nav link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) {
      toggle.setAttribute('aria-expanded', 'false');
      menu.classList.remove('open');
      document.body.style.overflow = '';
      toggle.focus();
    }
  });
})();

/* ---- Hero image parallax / load class ---- */
(function () {
  const bg = document.querySelector('.hero__bg');
  if (!bg) return;
  // Signal that the background image has (probably) loaded
  const img = new Image();
  img.src = 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=1600&q=80';
  img.onload = () => bg.classList.add('loaded');
})();

/* ---- Active nav link highlight on scroll ---- */
(function () {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav__menu a[href^="#"]');
  if (!sections.length || !navLinks.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.classList.toggle(
            'active',
            link.getAttribute('href') === '#' + entry.target.id
          );
        });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
})();

/* ---- Contact form — Web3Forms submission ---- */
(function () {
  const form        = document.getElementById('contact-form');
  const submitBtn   = document.getElementById('submit-btn');
  const successBox  = document.getElementById('form-success');
  const errorBox    = document.getElementById('form-error-banner');
  const btnText     = submitBtn && submitBtn.querySelector('.btn__text');
  const btnLoading  = submitBtn && submitBtn.querySelector('.btn__loading');

  if (!form) return;

  const fields = {
    nombre:  document.getElementById('nombre'),
    email:   document.getElementById('email'),
    mensaje: document.getElementById('mensaje'),
  };
  const errors = {
    nombre:  document.getElementById('nombre-error'),
    email:   document.getElementById('email-error'),
    mensaje: document.getElementById('mensaje-error'),
  };

  function setError(field, msg) {
    fields[field].classList.toggle('invalid', !!msg);
    errors[field].textContent = msg;
    if (msg) fields[field].setAttribute('aria-describedby', field + '-error');
    else     fields[field].removeAttribute('aria-describedby');
  }

  function validate() {
    let valid = true;
    const name  = fields.nombre.value.trim();
    const email = fields.email.value.trim();
    const msg   = fields.mensaje.value.trim();

    if (!name) {
      setError('nombre', 'Por favor, escribe tu nombre.');
      valid = false;
    } else {
      setError('nombre', '');
    }

    if (!email) {
      setError('email', 'Por favor, escribe tu email.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('email', 'El email no parece válido.');
      valid = false;
    } else {
      setError('email', '');
    }

    if (!msg) {
      setError('mensaje', 'Por favor, escribe tu mensaje.');
      valid = false;
    } else {
      setError('mensaje', '');
    }

    return valid;
  }

  // Inline validation on blur
  Object.keys(fields).forEach(key => {
    fields[key].addEventListener('blur', () => validate());
    fields[key].addEventListener('input', () => {
      if (fields[key].classList.contains('invalid')) validate();
    });
  });

  function setLoading(loading) {
    submitBtn.disabled = loading;
    if (btnText)    btnText.hidden    = loading;
    if (btnLoading) btnLoading.hidden = !loading;
  }

  function showBanner(el, show) {
    el.hidden = !show;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();

    showBanner(successBox, false);
    showBanner(errorBox, false);

    if (!validate()) {
      // Focus first invalid field
      const firstInvalid = Object.values(fields).find(f => f.classList.contains('invalid'));
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    setLoading(true);

    try {
      const data = new FormData(form);
      const res  = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body:   data,
      });
      const json = await res.json();

      if (res.ok && json.success) {
        form.reset();
        showBanner(successBox, true);
        successBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        showBanner(errorBox, true);
        errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } catch (_) {
      showBanner(errorBox, true);
      errorBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      setLoading(false);
    }
  });
})();
