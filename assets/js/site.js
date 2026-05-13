(function () {
  'use strict';

  /* ── HERO ENTRANCE ──────────────────────────────────────────────────────
     Replaces the CSS agmb-enter-up animation with a GSAP tween so timing
     is engine-controlled and degrades gracefully (no GSAP = elements just
     appear at opacity 1, no hidden flash).
     Skips cascade pages (home / about) — they have their own sequenced
     agmbFadeUp system managed by the per-page cascade JS. --------------- */
  function initHeroEntrance() {
    if (typeof gsap === 'undefined') return;
    if (document.documentElement.classList.contains('agmb-cascade')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var els = document.querySelectorAll(
      '.h1, .h1--centered,' +
      '.lede, .lede--centered, .hero__sub,' +
      '.hero__lede, .hero__lede--centered,' +
      '.ctas, .ctas--centered, .hero-ctas, .hero-stat-bar,' +
      '.hero__viz, .hero__col-calc, .form-shell, .contact-twin, .hero__squircle'
    );
    if (!els.length) return;

    gsap.from(els, {
      opacity: 0,
      y: 16,
      duration: 0.52,
      ease: 'power2.out',
      delay: 0.2,
      clearProps: 'all'
    });
  }

  /* ── SCROLL REVEAL via ScrollTrigger ────────────────────────────────────
     Works alongside (not instead of) the per-page IntersectionObserver.
     Both add .in-view — idempotent, no conflict.
     Double rAF waits for per-page initReveals() to auto-stamp .reveal on
     sections before we query them. --------------------------------------- */
  function initScrollReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        document.querySelectorAll('.reveal').forEach(function (el) {
          var rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight && rect.bottom > 0) {
            el.classList.add('in-view');
            return;
          }
          ScrollTrigger.create({
            trigger: el,
            start: 'top 88%',
            once: true,
            onEnter: function () { el.classList.add('in-view'); }
          });
        });
      });
    });
  }

  /* ── BOOT ──────────────────────────────────────────────────────────── */
  function boot() {
    initHeroEntrance();
    initScrollReveal();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}());
