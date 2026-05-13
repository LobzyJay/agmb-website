(function () {
  'use strict';

  /* ── HEADING LINE REVEAL ────────────────────────────────────────────────
     Splits each hero h1 into word spans, detects visual lines by grouping
     words with the same getBoundingClientRect().top, then animates each
     line as a unit (slide-up + fade). Lede/body text fades in after.

     Preserves <em> and any other inline elements — only text nodes are
     split; element nodes are recursed into so their children become words.

     Cascade pages (home / about) are excluded — they manage their own
     agmbFadeUp sequence via the per-page cascade JS. -------------------- */
  function initHeadingReveal() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    requestAnimationFrame(function () {
      if (document.documentElement.classList.contains('agmb-cascade')) return;

      document.querySelectorAll('.h1, .h1--centered').forEach(function (heading) {
        if (heading.dataset.agmbDone) return;
        heading.dataset.agmbDone = '1';

        /* 1. Walk the heading DOM, split text nodes into .agmb-w spans.
              Element nodes (em, strong, etc.) are recursed into so their
              text children become word spans — styling is inherited. */
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

        /* 2. Group words by visual line (same rounded top = same line). */
        var lineMap = {};
        words.forEach(function (w) {
          var top = Math.round(w.getBoundingClientRect().top);
          (lineMap[top] = lineMap[top] || []).push(w);
        });
        var lines = Object.keys(lineMap)
          .map(Number)
          .sort(function (a, b) { return a - b; })
          .map(function (k) { return lineMap[k]; });

        /* 3. Animate each line: slide up from 44px, fade in. */
        var perLine = 0.13;
        lines.forEach(function (line, i) {
          gsap.from(line, {
            y: 44,
            opacity: 0,
            duration: 0.7,
            ease: 'power3.out',
            delay: 0.08 + i * perLine,
            clearProps: 'transform,opacity'
          });
        });

        /* 4. Lede / body text fades in after the last heading line. */
        var hero = heading.closest(
          '.hero, .hero--centered, .hero--about, .hero--calculator, .hero--apply'
        );
        var lede = hero && hero.querySelector(
          '.hero__lede, .hero__lede--centered, .lede, .lede--centered'
        );
        if (lede && !lede.dataset.agmbDone) {
          lede.dataset.agmbDone = '1';
          gsap.from(lede, {
            opacity: 0,
            y: 16,
            duration: 0.55,
            ease: 'power2.out',
            delay: 0.08 + lines.length * perLine + 0.08,
            clearProps: 'all'
          });
        }
      });
    });
  }

  /* ── SUPPORTING HERO ELEMENTS ───────────────────────────────────────────
     CTAs, stat bar, viz canvas, form, contact card — fade up together
     after the heading lines have appeared. Delay is set long enough to
     clear even a 3-line heading (3 × 0.13 + 0.08 ≈ 0.47s). ------------ */
  function initHeroSupporting() {
    if (typeof gsap === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (document.documentElement.classList.contains('agmb-cascade')) return;

    var els = document.querySelectorAll(
      '.ctas, .ctas--centered, .hero-ctas, .hero-stat-bar,' +
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
     Works alongside the per-page IntersectionObserver — both add .in-view,
     idempotent. Double rAF lets page initReveals() auto-stamp sections
     with .reveal before we query them. ---------------------------------- */
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

  /* ── BOOT ──────────────────────────────────────────────────────────────
     Wait for fonts before running heading + supporting animations so GSAP
     never plays against a fallback font (which would cause a layout shift
     when the webfont swaps in mid-tween). ScrollTrigger setup is font-
     agnostic so it starts immediately. ---------------------------------- */
  function boot() {
    initScrollReveal();
    // Fonts already cached (return instantly) or load within ~150ms on
    // Google CDN — either way the heading animation starts at the right time.
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
