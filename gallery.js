/* Aquamarine Construction — gallery page extras
   Runs after script.js (both deferred). script.js already handles the filter
   buttons and opening the lightbox from #mosaic tiles; this file adds:
   - lightbox for the Work in Progress strip and Before & After photos
   - previous / next arrows, captions, keyboard (Esc, ←, →)
   - keyboard activation (Enter / Space) for every photo
   - a live photo count for the active filter */
(function () {
  'use strict';
  var lb = document.getElementById('lightbox');
  var lbImg = document.getElementById('lbImg');
  if (!lb || !lbImg) return;

  // Build prev / next / caption controls once
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

  var set = [], idx = 0, lastFocus = null;

  function visible(el) { return el.offsetParent !== null; }
  function groupOf(el) {
    if (el.closest('#mosaic')) return Array.prototype.filter.call(document.querySelectorAll('#mosaic .tile'), visible);
    if (el.closest('.wip-strip')) return Array.prototype.slice.call(document.querySelectorAll('.wip-strip [data-full]'));
    if (el.closest('.ba-list')) return Array.prototype.slice.call(document.querySelectorAll('.ba-list [data-full]'));
    return [el];
  }
  function show(i) {
    idx = (i + set.length) % set.length;
    var el = set[idx];
    lbImg.src = el.getAttribute('data-full');
    var img = el.querySelector('img');
    var text = el.getAttribute('data-caption') || (img && img.alt) || '';
    lbImg.alt = text; cap.textContent = text;
    var multi = set.length > 1;
    prev.style.display = next.style.display = multi ? '' : 'none';
  }
  function open(el) {
    set = groupOf(el); idx = Math.max(0, set.indexOf(el));
    lastFocus = el; show(idx); lb.classList.add('show');
    if (closeBtn) closeBtn.focus();
  }
  function close() {
    lb.classList.remove('show');
    if (lastFocus) lastFocus.focus();
  }

  // Mosaic: script.js opens the lightbox on click; we just sync the set/caption.
  var mosaic = document.getElementById('mosaic');
  if (mosaic) {
    mosaic.addEventListener('click', function (e) {
      var t = e.target.closest('.tile'); if (t) open(t);
    });
  }
  // WIP strip + Before & After
  document.querySelectorAll('.wip-strip [data-full], .ba-list [data-full]').forEach(function (el) {
    el.addEventListener('click', function () { open(el); });
  });
  // Keyboard activation for all photos
  document.querySelectorAll('#mosaic .tile, .wip-strip [data-full], .ba-list [data-full]').forEach(function (el) {
    el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
    el.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(el); }
    });
  });

  prev.addEventListener('click', function (e) { e.stopPropagation(); show(idx - 1); });
  next.addEventListener('click', function (e) { e.stopPropagation(); show(idx + 1); });
  if (closeBtn) closeBtn.addEventListener('click', function () { if (lastFocus) lastFocus.focus(); });
  document.addEventListener('keydown', function (e) {
    if (!lb.classList.contains('show')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(idx - 1);
    else if (e.key === 'ArrowRight') show(idx + 1);
  });

  // Swipe on touch screens
  var sx = null;
  lb.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener('touchend', function (e) {
    if (sx === null) return;
    var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 50 && set.length > 1) show(idx + (dx < 0 ? 1 : -1));
  });

  // Photo count for the active filter
  var gf = document.getElementById('gfilter');
  var count = document.getElementById('gcount');
  function updateCount() {
    if (!count || !mosaic) return;
    var n = Array.prototype.filter.call(mosaic.querySelectorAll('.tile'), function (t) { return t.style.display !== 'none'; }).length;
    count.textContent = n + (n === 1 ? ' project photo' : ' project photos');
  }
  if (gf) gf.addEventListener('click', function () { setTimeout(updateCount, 0); });
  updateCount();
})();
