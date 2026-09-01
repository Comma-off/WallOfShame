/* Android Wall of Shame — rendering, filtering, sorting, theme. */
(function () {
  'use strict';

  /* Severity drives the default order, the meter, and the step indicator.
     Colour bands follow the brief: red for the two worst, tertiary for the
     middle three, primary container for the one band that behaves. */
  var TIERS = [
    {id: 'impossible', label: 'Impossible', steps: 5, blurb: 'No official route exists.'},
    {id: 'extreme',    label: 'Extreme',    steps: 5, blurb: 'Restricted to the point of theoretical.'},
    {id: 'hard',       label: 'Hard',       steps: 4, blurb: 'Approval, queues, or manual flashing.'},
    {id: 'varies',     label: 'Varies',     steps: 3, blurb: 'Depends entirely on the model.'},
    {id: 'medium',     label: 'Medium',     steps: 2, blurb: 'A form to fill and a price to pay.'},
    {id: 'easy',       label: 'Easy',       steps: 1, blurb: 'Toggle, fastboot, done.'}
  ];

  var TIER_BY_ID = {};
  TIERS.forEach(function (t, i) { TIER_BY_ID[t.id] = t; t.order = i; });

  var vendors = window.WALL_DATA.vendors.slice();

  /* Canonical shame order: severity first, then alphabetical inside a band.
     Rank is assigned once here so it never shifts when the view is re-sorted. */
  vendors.sort(function (a, b) {
    var d = TIER_BY_ID[a.tier].order - TIER_BY_ID[b.tier].order;
    return d !== 0 ? d : a.name.localeCompare(b.name);
  });
  vendors.forEach(function (v, i) { v.rank = i + 1; });

  var state = {tier: 'all', query: '', sort: 'worst'};

  var el = {
    meterBar: document.getElementById('meter-bar'),
    chips: document.getElementById('chips'),
    wall: document.getElementById('wall'),
    empty: document.getElementById('empty'),
    count: document.getElementById('count'),
    search: document.getElementById('search'),
    sort: document.getElementById('sort'),
    themeToggle: document.getElementById('theme-toggle')
  };

  /* ------------------------------------------------------------- theme */

  var THEME_KEY = 'awos-theme';

  function applyTheme(theme) {
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.setAttribute('data-theme', theme);
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    var dark = theme === 'dark';
    el.themeToggle.setAttribute('aria-pressed', String(dark));
    el.themeToggle.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  function systemPrefersDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  var stored = null;
  try { stored = localStorage.getItem(THEME_KEY); } catch (e) { /* private mode */ }
  /* A host that already stamped a theme (an embedding viewer) outranks the OS
     preference, but never the visitor's own explicit choice. */
  var hostStamp = document.documentElement.getAttribute('data-theme');
  applyTheme(stored || hostStamp || (systemPrefersDark() ? 'dark' : 'light'));

  el.themeToggle.addEventListener('click', function () {
    var next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* nothing to do */ }
  });

  /* -------------------------------------------------------------- meter */

  function counts() {
    var out = {};
    TIERS.forEach(function (t) { out[t.id] = 0; });
    vendors.forEach(function (v) { out[v.tier] += 1; });
    return out;
  }

  var TALLY = counts();

  function buildMeter() {
    TIERS.forEach(function (t, i) {
      if (!TALLY[t.id]) return;
      var seg = document.createElement('div');
      seg.className = 'meter__seg';
      seg.dataset.tier = t.id;
      seg.style.flexGrow = String(TALLY[t.id]);
      seg.style.animationDelay = (i * 55) + 'ms';
      el.meterBar.appendChild(seg);
    });
  }

  function buildChips() {
    var all = document.createElement('li');
    all.appendChild(chip('all', 'All manufacturers', vendors.length));
    el.chips.appendChild(all);

    TIERS.forEach(function (t) {
      if (!TALLY[t.id]) return;
      var li = document.createElement('li');
      li.appendChild(chip(t.id, t.label, TALLY[t.id]));
      el.chips.appendChild(li);
    });
  }

  function chip(tier, label, n) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'chip';
    b.dataset.tier = tier;
    b.setAttribute('aria-pressed', String(state.tier === tier));
    b.innerHTML =
      '<span class="chip__dot" aria-hidden="true"></span>' +
      '<span>' + label + '</span>' +
      '<span class="chip__count">' + n + '</span>';
    b.addEventListener('click', function () {
      state.tier = state.tier === tier && tier !== 'all' ? 'all' : tier;
      syncChips();
      render();
    });
    return b;
  }

  function syncChips() {
    el.chips.querySelectorAll('.chip').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.tier === state.tier));
    });
    var focused = state.tier !== 'all';
    if (focused) el.meterBar.dataset.focused = '';
    else delete el.meterBar.dataset.focused;
    el.meterBar.querySelectorAll('.meter__seg').forEach(function (s) {
      if (s.dataset.tier === state.tier) s.dataset.active = '';
      else delete s.dataset.active;
    });
  }

  /* --------------------------------------------------------------- cards */

  function card(v, index, entering) {
    var tier = TIER_BY_ID[v.tier];

    var li = document.createElement('li');
    /* Only the first paint arms a reveal. Filtering and sorting rebuild the
       same cards, and replaying the entrance there reads as a doubled
       animation. */
    li.className = entering ? 'card is-pending' : 'card';
    li.dataset.tier = v.tier;

    var steps = '';
    for (var i = 1; i <= 5; i++) steps += '<span' + (i <= tier.steps ? ' data-on' : '') + '></span>';

    var evidence = v.evidence.map(function (e) {
      return '<li>' + escapeHtml(e) + '</li>';
    }).join('');

    /* Only vendors with a source get a Learn more button. */
    var source = '';
    if (v.source) {
      source =
        '<div class="card__source">' +
          '<a class="link-button" href="' + escapeHtml(v.source.url) + '"' +
            ' target="_blank" rel="noopener noreferrer"' +
            ' aria-label="Learn more about ' + escapeHtml(v.name) +
              ' bootloader unlocking, opens in a new tab">' +
            'Learn more' +
            '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 21q-.825 0-1.412-.587Q3 19.825 3 19V5q0-.825.588-1.413Q4.175 3 5 3h5q.425 0 .713.288Q11 3.575 11 4t-.287.712Q10.425 5 10 5H5v14h14v-5q0-.425.288-.713Q19.575 13 20 13t.712.287Q21 13.575 21 14v5q0 .825-.587 1.413Q19.825 21 19 21Zm5.7-6.3q-.275-.275-.275-.7t.275-.7L17.6 6H15q-.425 0-.712-.288Q14 5.425 14 5t.288-.713Q14.575 4 15 4h5q.425 0 .712.287Q21 4.575 21 5v5q0 .425-.288.712Q20.425 11 20 11t-.712-.288Q19 10.425 19 10V7.4l-6.9 6.9q-.275.275-.7.275t-.7-.275Z"/></svg>' +
          '</a>' +
          '<span class="card__origin" data-kind="' + escapeHtml(v.source.kind) + '">' +
            escapeHtml(v.source.label) +
          '</span>' +
        '</div>';
    }

    li.innerHTML =
      '<div class="card__top">' +
        '<div>' +
          '<p class="card__rank">' + pad(v.rank) + ' / ' + vendors.length + '</p>' +
          '<h3 class="card__name">' + escapeHtml(v.name) + '</h3>' +
        '</div>' +
        '<span class="badge">' + tier.label + '</span>' +
      '</div>' +
      '<div class="steps" role="img" aria-label="Difficulty ' + tier.steps + ' of 5">' + steps + '</div>' +
      '<p class="card__verdict">' + escapeHtml(v.verdict) + '</p>' +
      '<p class="card__detail">' + escapeHtml(v.detail) + '</p>' +
      '<div class="card__foot">' +
        '<ul class="evidence">' + evidence + '</ul>' +
        source +
      '</div>';

    return li;
  }

  function pad(n) { return n < 10 ? '0' + n : String(n); }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c];
    });
  }

  /* --------------------------------------------------------------- reveal */

  /* Cards below the fold used to animate on a fixed stagger, so the last one
     finished about a second after load, off-screen, where nobody saw it. Now a
     card animates as it comes into view.

     This is a scroll sweep rather than an IntersectionObserver on purpose: the
     observer only reports a *change* in intersection, so a jump straight to the
     bottom (End key, scrollbar drag, anchor link) skips every card in between —
     they stay non-intersecting before and after, no callback fires, and they
     are left invisible for good. A sweep cannot skip anything. */
  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var canReveal = !reducedMotion;
  var pending = [];
  var ticking = false;

  function show(card, delay) {
    card.classList.remove('is-pending');
    /* A null delay means the reader has already scrolled past this card —
       show it, but do not animate something behind them. */
    if (delay === null) return;
    card.style.setProperty('--enter-delay', delay + 'ms');
    card.classList.add('is-entering');
  }

  function sweep() {
    ticking = false;
    if (!pending.length) return;
    var vh = window.innerHeight;
    var batch = 0;
    pending = pending.filter(function (card) {
      var box = card.getBoundingClientRect();
      if (box.top > vh * 1.12) return true;
      show(card, box.bottom < 0 ? null : Math.min(batch++ * 45, 270));
      return false;
    });
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(sweep);
  }

  /* Capture, because scroll does not bubble: this still fires if the page ends
     up inside a scrolling container rather than scrolling the window. */
  window.addEventListener('scroll', onScroll, {passive: true, capture: true});
  window.addEventListener('resize', onScroll);

  /* Last resort. If nothing was ever revealed the mechanism has failed
     somehow, and a wall of invisible cards is far worse than no animation. */
  function guardReveal(total) {
    setTimeout(function () {
      if (pending.length < total) return;
      pending.forEach(function (card) { card.classList.remove('is-pending'); });
      pending = [];
    }, 2500);
  }

  /* --------------------------------------------------------------- render */

  var SORTS = {
    worst: function (a, b) { return a.rank - b.rank; },
    best:  function (a, b) { return b.rank - a.rank; },
    name:  function (a, b) { return a.name.localeCompare(b.name); }
  };

  function matches(v) {
    if (state.tier !== 'all' && v.tier !== state.tier) return false;
    if (!state.query) return true;
    var hay = (v.name + ' ' + v.verdict + ' ' + v.detail + ' ' + v.evidence.join(' ') +
               ' ' + TIER_BY_ID[v.tier].label).toLowerCase();
    return state.query.split(/\s+/).every(function (word) { return hay.indexOf(word) !== -1; });
  }

  var firstPaint = true;

  function render() {
    var shown = vendors.filter(matches).sort(SORTS[state.sort]);

    var arm = firstPaint && canReveal;

    el.wall.textContent = '';
    shown.forEach(function (v, i) { el.wall.appendChild(card(v, i, arm)); });

    if (arm) {
      pending = [].slice.call(el.wall.querySelectorAll('.card'));
      var total = pending.length;
      sweep();
      guardReveal(total);
    }
    firstPaint = false;

    el.empty.hidden = shown.length > 0;
    el.count.textContent = shown.length === vendors.length
      ? vendors.length + ' manufacturers'
      : shown.length + ' of ' + vendors.length + ' manufacturers';
  }

  /* -------------------------------------------------------------- controls */

  el.search.addEventListener('input', function () {
    state.query = el.search.value.trim().toLowerCase();
    render();
  });

  el.sort.addEventListener('click', function (event) {
    var button = event.target.closest('button[data-sort]');
    if (!button) return;
    state.sort = button.dataset.sort;
    el.sort.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-pressed', String(b === button));
    });
    render();
  });

  buildMeter();
  buildChips();
  syncChips();
  render();
})();
