/* Professor Bio Hub – navigation with hash routes & history */
(function () {
  var VALID = {
    home: 1, chapters: 1, reader: 1, flashcards: 1, quiz: 1,
    practical: 1, 'practical-detail': 1, waec: 1, jamb: 1, games: 1, notes: 1
  };

  var navigating = false;

  function parseHash() {
    var h = (location.hash || '#home').replace(/^#/, '');
    var parts = h.split('/');
    var page = parts[0] || 'home';
    if (!VALID[page]) page = 'home';
    return { page: page, arg: parts[1] || null };
  }

  function setHash(pageId, replace) {
    var next = '#' + (pageId || 'home');
    if (replace) {
      history.replaceState({ page: pageId }, '', next);
    } else if (location.hash !== next) {
      history.pushState({ page: pageId }, '', next);
    }
  }

  function syncActive(pageId) {
    document.querySelectorAll('.nav-link').forEach(function (l) {
      l.classList.toggle('active', l.getAttribute('data-page') === pageId);
    });
    document.querySelectorAll('.bottom-nav-item').forEach(function (l) {
      var p = l.getAttribute('data-page');
      // Map detail pages to parent tab
      var tab = pageId;
      if (pageId === 'reader') tab = 'chapters';
      if (pageId === 'practical-detail') tab = 'home';
      l.classList.toggle('active', p === tab || p === pageId);
    });
  }

  function closeSidebarSafe() {
    if (typeof closeSidebar === 'function') closeSidebar();
    else {
      var s = document.getElementById('sidebar');
      var o = document.getElementById('overlay');
      if (s) s.classList.remove('open');
      if (o) o.classList.remove('show');
    }
  }

  /**
   * Navigate to a page. Uses app showPage when available.
   * @param {string} pageId
   * @param {{replace?: boolean, skipHash?: boolean}} [opts]
   */
  function navigate(pageId, opts) {
    opts = opts || {};
    if (!pageId || !VALID[pageId]) pageId = 'home';
    if (navigating) return;
    navigating = true;
    try {
      if (!opts.skipHash) setHash(pageId, opts.replace);
      document.querySelectorAll('.page').forEach(function (p) {
        p.classList.toggle('active', p.id === 'page-' + pageId);
      });
      syncActive(pageId);
      closeSidebarSafe();
      window.scrollTo(0, 0);
      if (typeof ensurePageInit === 'function') {
        ensurePageInit(pageId).catch(function (err) {
          console.warn('Page init failed:', pageId, err);
        });
      }
    } finally {
      navigating = false;
    }
  }

  function onPopState() {
    var route = parseHash();
    navigate(route.page, { skipHash: true });
  }

  function wireClicks() {
    document.body.addEventListener('click', function (e) {
      var t = e.target.closest('[data-page], [data-goto], .back-btn[data-goto]');
      if (!t) return;
      var page = t.getAttribute('data-page') || t.getAttribute('data-goto');
      if (!page || !VALID[page]) return;
      e.preventDefault();
      navigate(page);
    });
  }

  /** Prefetch data for a page during idle time */
  function prefetch(pageId) {
    if (typeof ensurePageData === 'function') {
      ensurePageData(pageId).catch(function () {});
    }
  }

  function wirePrefetch() {
    document.querySelectorAll('[data-page], [data-goto]').forEach(function (el) {
      var once = function () {
        var p = el.getAttribute('data-page') || el.getAttribute('data-goto');
        if (p) prefetch(p);
        el.removeEventListener('pointerenter', once);
        el.removeEventListener('focus', once);
      };
      el.addEventListener('pointerenter', once, { passive: true });
      el.addEventListener('focus', once, { passive: true });
    });
  }

  function initNav() {
    // Override global showPage used by app.js
    window.showPage = function (pageId) {
      navigate(pageId);
    };

    wireClicks();
    wirePrefetch();
    window.addEventListener('popstate', onPopState);
    window.addEventListener('hashchange', onPopState);

    var route = parseHash();
    navigate(route.page, { replace: true, skipHash: false });
    setHash(route.page, true);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      // Run after app.js init so showPage override sticks
      setTimeout(initNav, 0);
    });
  } else {
    setTimeout(initNav, 0);
  }

  window.BioHubNav = { navigate: navigate, parseHash: parseHash, prefetch: prefetch };
})();
