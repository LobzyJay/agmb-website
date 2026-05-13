(function () {
  'use strict';

  /* ── HEADING LINE REVEAL ────────────────────────────────────────────────
     CSS sets all hero elements to opacity:0. This function:
       1. Wraps text nodes into .agmb-w spans. Inline elements like <em>
          are treated as ATOMIC units (pushed whole to words[]) — recursing
          into them leaves the <em> container visible while its children are
          at opacity:0, which creates a rendering artifact (small dot).
       2. Groups words by visual line via getBoundingClientRect top.
       3. Sets words to opacity:0/y:44 via gsap.set, then reveals heading.
       4. Animates each line with gsap.to.
       5. Fades in the lede after the last line.
     Cascade pages excluded — they use agmbFadeUp. ------------------------ */
  function initHeadingReveal() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    requestAnimationFrame(function () {
      if (document.documentElement.classList.contains('agmb-cascade')) return;

      document.querySelectorAll('.h1, .h1--centered').forEach(function (heading) {
        if (heading.dataset.agmbDone) return;
        heading.dataset.agmbDone = '1';

        /* 1. Wrap text nodes into word spans; inline elements are atomic */
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
            /* Inline element (em, strong, span): treat whole element as
               one word unit. Avoids rendering dots from empty containers. */
            words.push(node);
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

        /* 3. Words hidden via gsap.set → reveal heading container */
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

        /* 5. Fade lede after heading finishes */
        var hero = heading.closest(
          '.hero, .hero--centered, .hero--about, .hero--calculator,' +
          '.hero--apply, .hero--nhf'
        );
        var lede = hero && hero.querySelector(
          '.hero__lede, .hero__lede--centered, .lede, .lede--centered'
        );
        if (lede && !lede.dataset.agmbDone) {
          lede.dataset.agmbDone = '1';
          lede.style.opacity = '1';
          gsap.fromTo(lede,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.55, ease: 'power2.out',
              delay: 0.08 + lines.length * perLine + 0.08 }
          );
        }
      });
    });
  }

  /* ── SUPPORTING HERO ELEMENTS ───────────────────────────────────────────
     Cascade pages excluded — their cascade-run animation handles CTAs/viz.
     Non-cascade: viz fades in opacity-only (no y transform, would conflict
     with scroll-parallax JS). CTAs / stat bars fade+slide up together. ----- */
  function initHeroSupporting() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.documentElement.classList.contains('agmb-cascade')) return;

    /* Viz: opacity only — product vizzes run scroll-parallax transforms */
    var viz = document.querySelector('.hero__viz');
    if (viz) {
      gsap.to(viz, { opacity: 1, duration: 1.2, ease: 'power2.out', delay: 0.4 });
    }

    /* CTAs, stat bars, form, squircle: fade + slide up */
    var els = document.querySelectorAll(
      '.ctas, .ctas--centered, .hero-ctas,' +
      '.hero-stat-bar, .hero__stat-bar, .fact-strip,' +
      '.hero__col-calc, .form-shell, .contact-twin, .hero__squircle'
    );
    if (!els.length) return;

    /* Use fromTo — CSS starts at opacity:0. clearProps:'transform' keeps
       GSAP's opacity:1 inline style so elements don't go invisible again. */
    gsap.fromTo(els,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.52, ease: 'power2.out',
        delay: 0.6, clearProps: 'transform' }
    );
  }

  /* ── SCROLL REVEAL via ScrollTrigger ────────────────────────────────────
     Double rAF: waits for per-page initReveals() to stamp .reveal before
     ScrollTrigger queries them. ------------------------------------------ */
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
            trigger: el, start: 'top 88%', once: true,
            onEnter: function () { el.classList.add('in-view'); }
          });
        });
      });
    });
  }

  /* ── FALLBACK — show all hidden elements if GSAP CDN fails ------------- */
  function applyFallback() {
    document.querySelectorAll(
      '.hero .h1, .hero .h1--centered,' +
      '.hero .hero__lede, .hero .hero__lede--centered,' +
      '.hero .hero__viz,' +
      '.hero .ctas, .hero .ctas--centered, .hero .hero-ctas,' +
      '.hero .hero-stat-bar, .hero .hero__stat-bar, .hero .fact-strip,' +
      '.hero .hero__col-calc, .hero .form-shell, .hero .contact-twin,' +
      '.hero .hero__squircle'
    ).forEach(function (el) { el.style.opacity = '1'; });
  }

  /* ── BOOT ──────────────────────────────────────────────────────────── */
  function boot() {
    if (typeof gsap === 'undefined') { applyFallback(); return; }
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
