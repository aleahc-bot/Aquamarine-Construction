/* Aquamarine Construction — shared site behaviour
   Loaded with `defer` on every page, so the DOM is ready when this runs. */
(function () {
  'use strict';

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hasIO = 'IntersectionObserver' in window;

  /* ---- Mobile navigation toggle ---- */
  var nav = document.getElementById('nav');
  var navToggle = document.getElementById('navtoggle');
  if (nav && navToggle) {
    navToggle.addEventListener('click', function () {
      nav.classList.toggle('open');
    });
    // close the menu after tapping any link inside it
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a[href]')) nav.classList.remove('open');
    });
  }

  /* ---- Header shrink on scroll ---- */
  var header = document.querySelector('header');
  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 40);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Reveal-on-scroll with staggered children ---- */
  var STAGGER_SEL = '.feature,.svc-card,.review,.valuecard,.step,.rel,.rcard,.tl-row,.mosaic .tile';
  var reveals = document.querySelectorAll('.reveal');
  if (hasIO && !reduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        e.target.querySelectorAll(STAGGER_SEL).forEach(function (k, i) {
          k.style.transitionDelay = (i * 0.07) + 's';
        });
        io.unobserve(e.target);
      });
    }, { threshold: 0.12 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    // no observer / reduced motion: show everything immediately
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Count-up numeric stats when scrolled into view ---- */
  function animateCount(el) {
    var raw = el.getAttribute('data-raw') || el.textContent.trim();
    el.setAttribute('data-raw', raw);
    var m = raw.match(/^(\d+(?:\.\d+)?)(.*)$/);
    if (!m) return;
    var target = parseFloat(m[1]);
    var suffix = m[2];
    var dec = (m[1].split('.')[1] || '').length;
    var dur = 1200, start = null;
    if (target >= 1000 && suffix === '') return; // leave bare years (e.g. 2002) static
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(dec) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = target.toFixed(dec) + suffix;
    }
    requestAnimationFrame(step);
  }
  if (hasIO && !reduced) {
    var counters = document.querySelectorAll('.badge b,.valuecard b,.rev-hero-stats .s b,.aboutstrip .tag b');
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(function (el) { cio.observe(el); });
  }

  /* ---- Lightbox (gallery) ---- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  var lbClose = document.getElementById('lbClose');
  function openLightbox(src) {
    if (lb && lbImg) { lbImg.src = src; lb.classList.add('show'); }
  }
  if (lb) {
    if (lbClose) lbClose.addEventListener('click', function () { lb.classList.remove('show'); });
    lb.addEventListener('click', function (e) { if (e.target === lb) lb.classList.remove('show'); });
  }

  /* ---- Gallery filter + tile → lightbox ---- */
  var gf = document.getElementById('gfilter');
  var mosaic = document.getElementById('mosaic');
  if (gf && mosaic) {
    gf.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (!b) return;
      gf.querySelectorAll('button').forEach(function (x) { x.classList.remove('active'); });
      b.classList.add('active');
      var cat = b.getAttribute('data-cat');
      mosaic.querySelectorAll('.tile').forEach(function (t) {
        t.style.display = (cat === 'all' || t.getAttribute('data-cat') === cat) ? '' : 'none';
      });
    });
    mosaic.addEventListener('click', function (e) {
      var t = e.target.closest('.tile');
      if (t) openLightbox(t.getAttribute('data-full'));
    });
  }

  /* ---- Contact form confirmation note ---- */
  var send = document.getElementById('cf-send');
  if (send) {
    send.addEventListener('click', function () {
      var note = document.getElementById('cf-note');
      if (note) note.style.display = 'block';
    });
  }
})();
