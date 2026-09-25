/* Aquamarine Construction — gallery page extras
   Runs after script.js (both deferred). Adds:
   - lightbox for the scrolling "Our Work" rows and the Work in Progress strip
   - previous / next arrows, captions, keyboard (Esc, ←, →) and swipe in the lightbox
   - the draggable before & after comparison sliders */
(function () {
  'use strict';

  /* ---------- Before & After sliders ---------- */
  document.querySelectorAll('.cmp').forEach(function (box) {
    var range = box.querySelector('.cmp-range');
    if (!range) return;
    function set() { box.style.setProperty('--pos', range.value + '%'); }
    range.addEventListener('input', set);
    set();
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  if (!lb || !lbImg) return;

  var prev = document.createElement('button');
  prev.className = 'lb-nav lb-prev'; prev.setAttribute('aria-label', 'Previous photo'); prev.innerHTML = '&#8249;';
  var next = document.createElement('button');
  next.className = 'lb-nav lb-next'; next.setAttribute('aria-label', 'Next photo'); next.innerHTML = '&#8250;';
  var cap = document.createElement('div');
  cap.className = 'lb-cap';
  lb.appendChild(prev); lb.appendChild(next); lb.appendChild(cap);
  lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-modal', 'true'); lb.setAttribute('aria-label', 'Photo viewer');
  var closeBtn = document.getElementById('lbClose');
  if (closeBtn) closeBtn.setAttribute('aria-label', 'Close');

  // Photo groups (duplicates in the scrolling rows are skipped)
  var groups = {
    work: Array.prototype.slice.call(document.querySelectorAll('.ourwork .mq-item:not(.dup)'))
      .sort(function (a, b) { return a.getAttribute('data-i') - b.getAttribute('data-i'); }),
    wip: Array.prototype.slice.call(document.querySelectorAll('.wip-strip [data-full]'))
  };
  var set = [], idx = 0, lastFocus = null;

  function show(i) {
    idx = (i + set.length) % set.length;
    var el = set[idx];
    lbImg.src = el.getAttribute('data-full');
    var text = el.getAttribute('data-caption') || '';
    lbImg.alt = text; cap.textContent = text;
    prev.style.display = next.style.display = set.length > 1 ? '' : 'none';
  }
  function open(el) {
    var inWork = el.closest('.ourwork');
    set = inWork ? groups.work : groups.wip;
    var i = inWork ? parseInt(el.getAttribute('data-i'), 10) : set.indexOf(el);
    lastFocus = el; show(Math.max(0, i)); lb.classList.add('show');
    if (closeBtn) closeBtn.focus();
  }
  function close() {
    lb.classList.remove('show');
    if (lastFocus && lastFocus.getAttribute('aria-hidden') !== 'true') lastFocus.focus();
  }

  document.querySelectorAll('.ourwork .mq-item, .wip-strip [data-full]').forEach(function (el) {
    el.addEventListener('click', function () { open(el); });
    if (el.classList.contains('dup')) return; // duplicates stay out of the tab order
    el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); }
    });
  });

  prev.addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
  next.addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
  if (closeBtn) closeBtn.addEventListener('click', close);
  lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('show')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });

  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50 && set.length > 1) show(idx + (dx < 0 ? 1 : -1));
  });
})();
