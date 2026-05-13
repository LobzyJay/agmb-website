(function () {
  'use strict';

  /* ── HEADING LINE REVEAL ────────────────────────────────────────────────
     CSS (shared.css) sets .hero .h1 { opacity:0 } so text is hidden before
     JS fires — no FOUC. This function:
       1. Wraps text nodes into .agmb-w word spans (preserves <em> etc.)
       2. Groups words by visual line via getBoundingClientRect
       3. Sets words to opacity:0 via GSAP, then reveals heading container
       4. Animates each line with gsap.to (slide-up + fade)
       5. Fades in the lede after the last line completes
     Cascade pages (home/about) are excluded — they use agmbFadeUp. ------- */
  function initHeadingReveal() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    requestAnimationFrame(function () {
      if (document.documentElement.classList.contains('agmb-cascade')) return;

      document.querySelectorAll('.h1, .h1--centered').forEach(function (heading) {
        if (heading.dataset.agmbDone) return;
        heading.dataset.agmbDone = '1';

        /* 1. Split text nodes into .agmb-w word spans */
        var words = [];
        function wrapNode(node) {
          if (node.nodeType === 3) {
            var frag = document.createDocumentFragment();
            node.textContent.split(/(\s+)/).forEach(function (token) {
              if (!token.trim()) {
                frag.appendChild(document.createTextNode(token));
              } else {
                var s = document.createElement('span');
                s.className = 'agmb-w';
                s.textContent = token;
                words.push(s);
                frag.appendChild(s);
              }
            });
            node.parentNode.replaceChild(frag, node);
          } else if (node.nodeType === 1) {
            Array.from(node.childNodes).forEach(wrapNode);
          }
        }
        Array.from(heading.childNodes).forEach(wrapNode);
        if (!words.length) return;

        /* 2. Group words by visual line */
        var lineMap = {};
        words.forEach(function (w) {
          var top = Math.round(w.getBoundingClientRect().top);
          (lineMap[top] = lineMap[top] || []).push(w);
        });
        var lines = Object.keys(lineMap).map(Number)
          .sort(function (a, b) { return a - b; })
          .map(function (k) { return lineMap[k]; });

        /* 3. Set words hidden, then reveal heading container */
        gsap.set(words, { opacity: 0, y: 44 });
        heading.style.opacity = '1';

        /* 4. Animate each line */
        var perLine = 0.13;
        lines.forEach(function (line, i) {
          gsap.to(line, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            delay: 0.08 + i * perLine
          });
        });

        /* 5. Fade in the lede after heading finishes */
        var hero = heading.closest(
          '.hero, .hero--centered, .hero--about, .hero--calculator, .hero--apply, .hero--nhf'
        );
        var lede = hero && hero.querySelector(
          '.hero__lede, .hero__lede--centered, .lede, .lede--centered'
        );
        if (lede && !lede.dataset.agmbDone) {
          lede.dataset.agmbDone = '1';
          lede.style.opacity = '1';
          gsap.fromTo(lede,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out', delay: 0.08 + lines.length * perLine + 0.08 }
          );
        }
      });
    });
  }

  /* ── SUPPORTING HERO ELEMENTS ───────────────────────────────────────────
     Stat bar, CTAs, viz canvas, form, contact card — fade up after heading.
     Includes both .fact-strip (mortgages/NHF) and .hero__stat-bar (products)
     and .hero-stat-bar (shared cascade name). ----------------------------- */
  function initHeroSupporting() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.documentElement.classList.contains('agmb-cascade')) return;

    var els = document.querySelectorAll(
      '.ctas, .ctas--centered, .hero-ctas,' +
      '.hero-stat-bar, .hero__stat-bar, .fact-strip,' +
      '.hero__viz, .hero__col-calc, .form-shell, .contact-twin, .hero__squircle'
    );
    if (!els.length) return;

    gsap.from(els, {
      opacity: 0,
      y: 16,
      duration: 0.52,
      ease: 'power2.out',
      delay: 0.6,
      clearProps: 'all'
    });
  }

  /* ── SCROLL REVEAL via ScrollTrigger ────────────────────────────────────
     Runs alongside the per-page IntersectionObserver — both add .in-view,
     idempotent. Double rAF lets page initReveals() stamp .reveal first. -- */
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

  /* ── GSAP FALLBACK ──────────────────────────────────────────────────────
     If GSAP CDN fails, reveal all hidden headings/ledes immediately so the
     page doesn't show blank text. ---------------------------------------- */
  function applyFallback() {
    document.querySelectorAll(
      '.hero .h1, .hero .h1--centered, .hero .hero__lede, .hero .hero__lede--centered'
    ).forEach(function (el) { el.style.opacity = '1'; });
  }

  /* ── BOOT ──────────────────────────────────────────────────────────── */
  function boot() {
    if (typeof gsap === 'undefined') {
      applyFallback();
      return;
    }
    initScrollReveal();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () {
        initHeadingReveal();
        initHeroSupporting();
      });
    } else {
      initHeadingReveal();
      initHeroSupporting();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
}());
