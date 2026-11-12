/* Azienda Medei 2.0 - movimento: GSAP (ScrollTrigger, SplitText) + Lenis */
(function () {
  'use strict';
  var radice = document.documentElement;
  var fermo = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  if (!window.gsap || !window.ScrollTrigger || fermo) {
    radice.classList.remove('js');
    return;
  }
  window.__medeiAnim = true;
  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  var EASE = 'expo.out';

  /* scorrimento fluido */
  var lenis = null;
  if (window.Lenis) {
    lenis = new Lenis({ anchors: { offset: -90 }, lerp: 0.11 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
    /* le strisce che scorrono in orizzontale restano native */
    $$('.scorri, .pv-tabella').forEach(function (el) { el.setAttribute('data-lenis-prevent-touch', ''); });
  }

  /* barra: sparisce scendendo, torna risalendo */
  var testata = $('#testata'), menu = $('#menu');
  ScrollTrigger.create({
    start: 200, end: 'max',
    onUpdate: function (st) {
      if (menu && menu.classList.contains('aperto')) return;
      testata.classList.toggle('nascosta', st.direction === 1);
    },
    onLeaveBack: function () { testata.classList.remove('nascosta'); }
  });
  var bm = $('.apri-menu');
  if (bm && lenis) bm.addEventListener('click', function () {
    setTimeout(function () { menu.classList.contains('aperto') ? lenis.stop() : lenis.start(); }, 0);
  });

  function righe(el) {
    if (!window.SplitText) return null;
    return SplitText.create(el, { type: 'lines', mask: 'lines', linesClass: 'riga-split' });
  }

  function avvia() {
    /* --- ingresso della copertina (un solo momento orchestrato) --- */
    var eroe = $('.eroe');
    if (eroe) {
      var tl = gsap.timeline({ defaults: { ease: EASE } });
      gsap.set('.eroe-logo, .eroe-titolo, .eroe-sotto, .eroe-azioni', { visibility: 'visible' });
      var lettere = window.SplitText ? SplitText.create('.eroe-titolo span', { type: 'chars', mask: 'chars' }) : null;
      tl.from('.eroe-foto img', { scale: 1.25, duration: 2.4, ease: 'power3.out' }, 0);
      tl.from('.eroe-logo', { scale: 0.6, autoAlpha: 0, y: 30, duration: 1.4, transformOrigin: 'left bottom' }, 0.05);
      if (lettere) tl.from(lettere.chars, { yPercent: 110, duration: 1.3, stagger: 0.035 }, 0.35);
      else tl.from('.eroe-titolo span', { yPercent: 40, autoAlpha: 0, duration: 1.2, stagger: 0.12 }, 0.15);
      tl.from('.eroe-sotto', { y: 30, autoAlpha: 0, duration: 1.1 }, 0.8)
        .from('.eroe-azioni .btn', { y: 24, autoAlpha: 0, duration: 0.9, stagger: 0.1 }, 0.95)
        .from('.testata', { yPercent: -200, duration: 1.1 }, 0.5);
      gsap.to('.eroe-foto img', { yPercent: 18, ease: 'none', scrollTrigger: { trigger: eroe, start: 'top top', end: 'bottom top', scrub: true } });
      gsap.to('.eroe-testo', { yPercent: -22, autoAlpha: 0.2, ease: 'none', scrollTrigger: { trigger: eroe, start: 'top top', end: 'bottom top', scrub: true } });
    }
    $$('.copertina').forEach(function (c) {
      var w = $('.wrap', c);
      gsap.set(w, { visibility: 'visible' });
      var h1 = $('h1', c), t = gsap.timeline({ defaults: { ease: EASE } });
      var sp = h1 && righe(h1);
      if (sp) t.from(sp.lines, { yPercent: 110, duration: 1.3, stagger: 0.12 }, 0.1);
      t.from($$('.titolo:not(h1), .azione', w), { y: 28, autoAlpha: 0, duration: 1, stagger: 0.12 }, 0.6);
      var sf = $('.sfondo', c);
      if (sf) gsap.to(sf, { yPercent: 14, ease: 'none', scrollTrigger: { trigger: c, start: 'top top', end: 'bottom top', scrub: true } });
      else gsap.fromTo(c, { backgroundPositionY: '50%' }, { backgroundPositionY: '80%', ease: 'none', scrollTrigger: { trigger: c, start: 'top top', end: 'bottom top', scrub: true } });
    });

    /* --- nastro: velocità e verso seguono lo scorrimento --- */
    $$('.nastro-binario').forEach(function (b) {
      var x = 0, verso = -1, meta = b.scrollWidth / 2;
      window.addEventListener('resize', function () { meta = b.scrollWidth / 2; });
      gsap.ticker.add(function (t, dt) {
        var v = lenis ? lenis.velocity : 0;
        if (v > 0.5) verso = -1; else if (v < -0.5) verso = 1;
        x += verso * (0.06 * dt + Math.abs(v) * 1.1);
        if (x <= -meta) x += meta;
        if (x > 0) x -= meta;
        b.style.transform = 'translate3d(' + x + 'px,0,0)';
      });
    });

    /* --- presentazione: le parole si accendono scorrendo --- */
    $$('[data-parole]').forEach(function (p) {
      if (!window.SplitText) return;
      var sp = SplitText.create(p, { type: 'words' });
      gsap.fromTo(sp.words, { opacity: 0.14 }, { opacity: 1, stagger: 0.08, ease: 'none',
        scrollTrigger: { trigger: p, start: 'top 82%', end: 'bottom 45%', scrub: true } });
    });

    /* --- corsia dei prodotti: fissata, scorre in orizzontale (solo schermi larghi) --- */
    var mm = gsap.matchMedia();
    mm.add('(min-width: 821px)', function () {
      $$('.corsia').forEach(function (c) {
        var b = $('.corsia-binario', c);
        var dist = function () { return Math.max(0, b.scrollWidth - window.innerWidth); };
        var tw = gsap.to(b, { x: function () { return -dist(); }, ease: 'none',
          scrollTrigger: { trigger: c, start: 'center center', end: function () { return '+=' + dist(); }, pin: true, scrub: 0.6, invalidateOnRefresh: true, anticipatePin: 1 } });
        $$('.arco img', c).forEach(function (im) {
          gsap.fromTo(im, { xPercent: -8, scale: 1.15 }, { xPercent: 8, scale: 1.15, ease: 'none',
            scrollTrigger: { trigger: im, containerAnimation: tw, start: 'left right', end: 'right left', scrub: true } });
        });
      });
      /* finestra video: l'arco si apre fino a tutto schermo */
      $$('.cinema').forEach(function (c) {
        gsap.to($('.cinema-finestra', c), { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', ease: 'none',
          scrollTrigger: { trigger: c, start: 'top 85%', end: 'top top', scrub: true } });
        ScrollTrigger.create({ trigger: c, start: 'top top', end: '+=40%', pin: true });
      });
    });
    mm.add('(max-width: 820px)', function () {
      $$('.cinema-finestra').forEach(function (f) {
        gsap.fromTo(f, { clipPath: 'inset(6% 8% 0% 8% round 999px 999px 0px 0px)' }, { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', ease: 'none',
          scrollTrigger: { trigger: f, start: 'top 90%', end: 'top 10%', scrub: true } });
      });
    });

    /* --- titoli: entrano riga per riga --- */
    $$('main .duo, main h2.titolo, main .presenta-titolo').forEach(function (h) {
      if (h.closest('.copertina, .eroe')) return;
      var sp = righe(h);
      if (!sp) return;
      gsap.from(sp.lines, { yPercent: 115, duration: 1.2, ease: EASE, stagger: 0.1,
        scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
    });

    /* --- fotografie: si scoprono dal basso e scorrono dentro la cornice --- */
    $$('main .foto').forEach(function (im) {
      if (im.closest('.scuro, .scorri, .scheda[hidden]')) return;
      var c = document.createElement('div');
      c.className = 'cornice';
      var a = im.parentNode.tagName === 'A' ? im.parentNode : im;
      a.parentNode.insertBefore(c, a);
      c.appendChild(a);
      gsap.fromTo(c, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: EASE,
        scrollTrigger: { trigger: c, start: 'top 85%', once: true }, onComplete: function () { c.style.clipPath = ''; } });
      gsap.fromTo(im, { yPercent: -7, scale: 1.16 }, { yPercent: 7, scale: 1.16, ease: 'none',
        scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: true } });
    });

    /* --- gallerie e strisce: scivolano di lato mentre scendi --- */
    $$('.galleria').forEach(function (g) {
      gsap.fromTo(g, { x: 60 }, { x: -120, ease: 'none', scrollTrigger: { trigger: g, start: 'top bottom', end: 'bottom top', scrub: 0.5 } });
    });

    /* --- gruppi di schede: ingresso a cascata --- */
    ['.recensione', '.prodotto', '.icona-box', '.numero-voce', '.contatore'].forEach(function (sel) {
      var el = $$(sel);
      if (!el.length) return;
      gsap.set(el, { y: 40, autoAlpha: 0 });
      ScrollTrigger.batch(el, { start: 'top 92%', once: true,
        onEnter: function (b) { gsap.to(b, { y: 0, autoAlpha: 1, duration: 1, ease: EASE, stagger: 0.08, overwrite: true }); } });
    });
    $$('main .testo, main .azione, main .elenco, .corsia-testa p').forEach(function (t) {
      if (t.closest('.copertina, .scheda[hidden], .scuro')) return;
      gsap.from(t, { y: 26, autoAlpha: 0, duration: 1, ease: EASE, scrollTrigger: { trigger: t, start: 'top 92%', once: true } });
    });

    /* --- la forma di pecorino ruota con lo scorrimento --- */
    $$('[data-ruota]').forEach(function (r) {
      gsap.to(r, { rotation: 300, ease: 'none', scrollTrigger: { trigger: r, start: 'top bottom', end: 'bottom top', scrub: 0.8 } });
    });

    /* --- pulsanti magnetici (solo con il mouse) --- */
    if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
      $$('.grande-tondo, .eroe-azioni .btn').forEach(function (b) {
        var qx = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'power3' }), qy = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'power3' });
        b.addEventListener('mousemove', function (ev) {
          var r = b.getBoundingClientRect();
          qx((ev.clientX - r.left - r.width / 2) * 0.3); qy((ev.clientY - r.top - r.height / 2) * 0.3);
        });
        b.addEventListener('mouseleave', function () { qx(0); qy(0); });
      });
    }

    /* le schede a linguetta cambiano altezza: ricalcola */
    document.addEventListener('click', function (ev) { if (ev.target.closest('[role=tab]')) setTimeout(function () { ScrollTrigger.refresh(); }, 60); });
    window.addEventListener('load', function () { ScrollTrigger.refresh(); });
  }

  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(avvia);
})();
