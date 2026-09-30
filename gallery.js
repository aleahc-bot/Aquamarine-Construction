/* Aquamarine Construction — gallery page extras
   Runs after script.js (both deferred). Adds:
   - lightbox for the scrolling "Our Work" rows and the Work in Progress strip
   - previous / next arrows, captions, keyboard (Esc, ←, →) and swipe in the lightbox
   - "Learn more about…" link to the matching service page when a category is picked
   - JS-driven moving rows (works on phones too) and 2-second auto-advance for the build strip */
(function () {
  'use strict';

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
    wip: Array.prototype.slice.call(document.querySelectorAll('.wip-strip [data-full]')),
    ba: Array.prototype.slice.call(document.querySelectorAll('.ba2-list [data-full]'))
  };
  function gridVisible() {
    return Array.prototype.filter.call(document.querySelectorAll('#owgrid .ow-tile'), function (t) { return !t.hidden; });
  }
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
    var inRows = el.classList.contains('mq-item');
    var inGrid = el.classList.contains('ow-tile');
    var fp = el.closest('.fp-grid');
    set = inRows ? groups.work : inGrid ? gridVisible() : fp ? Array.prototype.slice.call(fp.querySelectorAll('[data-full]')) : el.closest('.ba2-list') ? groups.ba : groups.wip;
    var i = inRows ? parseInt(el.getAttribute('data-i'), 10) : set.indexOf(el);
    lastFocus = el; show(Math.max(0, i)); lb.classList.add('show');
    if (closeBtn) closeBtn.focus();
  }
  function close() {
    lb.classList.remove('show');
    if (lastFocus && lastFocus.getAttribute('aria-hidden') !== 'true') lastFocus.focus();
  }

  document.querySelectorAll('.ourwork .mq-item, #owgrid .ow-tile, .wip-strip [data-full], .ba2-list [data-full], .fp-grid [data-full]').forEach(function (el) {
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

  /* ---------- Category filter: "All" = moving rows, a category = still grid ---------- */
  var bar = document.getElementById('owfilter');
  var rows = document.getElementById('owrows');
  var grid = document.getElementById('owgrid');
  var more = document.getElementById('owmore');
  var moreLink = document.getElementById('owmorelink');
  // Where "Learn more" goes for each category
  var pages = {
    docks: ['boat-docks.html', 'Learn more about Boat Docks'],
    lifts: ['boat-lifts.html', 'Learn more about Boat Lifts'],
    tiki: ['tiki-huts.html', 'Learn more about Tiki Huts'],
    seawalls: ['seawall-repair.html', 'Learn more about Seawalls'],
    covers: ['boat-lifts.html', 'Learn more about Lift Covers'],
    kayak: ['kayak-stations.html', 'Learn more about Kayak Stations']
  };
  if (bar && rows && grid) {
    bar.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b) return;
      var cat = b.getAttribute('data-cat');
      bar.querySelectorAll('button').forEach(function (x) {
        var on = x === b; x.classList.toggle('active', on); x.setAttribute('aria-pressed', on ? 'true' : 'false');
      });
      if (cat === 'all') { grid.hidden = true; rows.hidden = false; if (more) more.hidden = true; return; }
      if (more && moreLink && pages[cat]) {
        moreLink.href = pages[cat][0];
        moreLink.firstChild.nodeValue = pages[cat][1] + ' ';
        more.hidden = false;
      }
      grid.querySelectorAll('.ow-tile').forEach(function (t) { t.hidden = (t.getAttribute('data-cat') || '').split(' ').indexOf(cat) === -1; });
      rows.hidden = true; grid.hidden = false;
    });
  }

  /* ---------- "Our Work" rows: keep moving on every device (JS-driven, so phones
     with Reduce Motion / Low Power Mode still animate). Pause on mouse hover only. ---------- */
  var tracks = Array.prototype.slice.call(document.querySelectorAll('.marquee .mq-track'));
  var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches;
  var mq = tracks.map(function (t) {
    var s = { el: t, x: 0, half: 0, dir: t.parentNode.classList.contains('mq-right') ? 1 : -1, paused: false };
    if (canHover) {
      t.parentNode.addEventListener('mouseenter', function () { s.paused = true; });
      t.parentNode.addEventListener('mouseleave', function () { s.paused = false; });
    }
    return s;
  });
  function measure() {
    mq.forEach(function (s) {
      var gap = parseFloat(getComputedStyle(s.el).columnGap) || 16;
      s.half = s.el.scrollWidth / 2 + gap / 2;
      if (s.dir === 1 && s.x === 0) s.x = -s.half;
    });
  }
  var last = null;
  function tick(ts) {
    if (last === null) last = ts;
    var dt = Math.min(ts - last, 100) / 1000; last = ts;
    var lbOpen = lb.classList.contains('show');
    mq.forEach(function (s) {
      if (!s.half || s.el.offsetParent === null) return;
      if (!s.paused && !lbOpen) {
        var speed = s.half / (window.innerWidth < 760 ? 45 : 60); // one full loop every 45–60s
        s.x += s.dir * speed * dt;
        if (s.x <= -s.half) s.x += s.half;
        if (s.x >= 0) s.x -= s.half;
      }
      s.el.style.transform = 'translate3d(' + s.x.toFixed(2) + 'px,0,0)';
    });
    requestAnimationFrame(tick);
  }
  if (mq.length) {
    measure();
    window.addEventListener('load', measure);
    window.addEventListener('resize', function () { mq.forEach(function (s) { s.x = s.dir === 1 ? -1 : 0; }); measure(); });
    requestAnimationFrame(tick);
  }

  /* ---------- "From job site to finished dock": auto-advance one card every 2s ---------- */
  var strip = document.querySelector('.wip-strip');
  if (strip) {
    var holdUntil = 0;
    function hold() { holdUntil = Date.now() + 6000; } // pause 6s after someone touches/scrolls it
    ['touchstart', 'pointerdown', 'wheel'].forEach(function (ev) { strip.addEventListener(ev, hold, { passive: true }); });
    if (canHover) { strip.addEventListener('mouseenter', function () { holdUntil = Infinity; }); strip.addEventListener('mouseleave', function () { holdUntil = 0; }); }
    setInterval(function () {
      if (Date.now() < holdUntil || lb.classList.contains('show')) return;
      var max = strip.scrollWidth - strip.clientWidth;
      if (max < 4) return; // everything already fits (wide screens)
      var card = strip.querySelector('.wip-card');
      var step = card ? card.getBoundingClientRect().width + (parseFloat(getComputedStyle(strip).columnGap) || 16) : strip.clientWidth;
      var nextX = strip.scrollLeft + step;
      if (strip.scrollLeft >= max - 4) nextX = 0; // loop back to the first card
      strip.scrollTo({ left: Math.min(nextX, max), behavior: 'smooth' });
    }, 2000);
  }
})();
