/* Global topic search – interactive filter */
(function () {
  var INDEX = null;

  function buildIndex() {
    var items = [];
    var ch = (window.BIO_DATA && window.BIO_DATA.chapters) || (typeof chapters !== 'undefined' ? chapters : null);
    if (Array.isArray(ch)) {
      ch.forEach(function (c) {
        items.push({
          type: 'chapter',
          id: c.id,
          title: c.title,
          subtitle: c.subtitle || '',
          page: 'reader',
          open: function () {
            if (typeof openChapter === 'function') openChapter(c.id);
            else if (window.BioHubNav) BioHubNav.navigate('chapters');
          }
        });
      });
    }
    var topics = [
      { id: 'flashcards', title: 'Study Cards', page: 'flashcards' },
      { id: 'quiz', title: 'Quizzes', page: 'quiz' },
      { id: 'waec', title: 'WAEC Practice', page: 'waec' },
      { id: 'jamb', title: 'JAMB MSQ', page: 'jamb' },
      { id: 'practical', title: 'Practical Guides', page: 'practical' },
      { id: 'games', title: 'Games & Puzzles', page: 'games' },
      { id: 'notes', title: 'My Notes', page: 'notes' },
      { id: 'respiration', title: 'Respiration', page: 'chapters', chapter: 'respiration' },
      { id: 'excretion', title: 'Excretion', page: 'chapters', chapter: 'excretion' },
      { id: 'coordination', title: 'Coordination & Control', page: 'chapters', chapter: 'coordination' }
    ];
    topics.forEach(function (t) {
      items.push({
        type: 'feature',
        id: t.id,
        title: t.title,
        subtitle: t.type || 'Section',
        page: t.page,
        open: function () {
          if (t.chapter && typeof openChapter === 'function') {
            // ensure chapters loaded then open
            if (typeof ensurePageData === 'function') {
              ensurePageData('chapters').then(function () {
                if (typeof openChapter === 'function') openChapter(t.chapter);
              });
            } else if (window.BioHubNav) BioHubNav.navigate(t.page);
          } else if (window.BioHubNav) BioHubNav.navigate(t.page);
          else if (typeof showPage === 'function') showPage(t.page);
        }
      });
    });
    return items;
  }

  function ensureIndex() {
    if (!INDEX) INDEX = buildIndex();
    return INDEX;
  }

  function filter(q) {
    q = (q || '').trim().toLowerCase();
    if (!q) return [];
    return ensureIndex().filter(function (item) {
      return (item.title + ' ' + item.subtitle + ' ' + item.id).toLowerCase().indexOf(q) !== -1;
    }).slice(0, 12);
  }

  function render(results) {
    var box = document.getElementById('searchResults');
    if (!box) return;
    if (!results.length) {
      box.classList.add('hidden');
      box.innerHTML = '';
      return;
    }
    box.classList.remove('hidden');
    box.innerHTML = results.map(function (r, i) {
      return '<button type="button" class="search-hit" data-idx="' + i + '" style="display:block;width:100%;text-align:left;padding:0.75rem 1rem;border:none;border-bottom:1px solid var(--border);background:var(--surface);color:var(--text);cursor:pointer;font-family:inherit;">' +
        '<strong>' + escapeHtml(r.title) + '</strong>' +
        '<div style="font-size:0.75rem;color:var(--text-muted);">' + escapeHtml(r.subtitle || r.type) + '</div></button>';
    }).join('');
    box.querySelectorAll('.search-hit').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = results[parseInt(btn.getAttribute('data-idx'), 10)];
        if (item) item.open();
        box.classList.add('hidden');
        var input = document.getElementById('globalSearch');
        if (input) input.value = '';
      });
    });
  }

  function escapeHtml(t) {
    var d = document.createElement('div');
    d.textContent = t || '';
    return d.innerHTML;
  }

  function initSearch() {
    var input = document.getElementById('globalSearch');
    var box = document.getElementById('searchResults');
    if (!input || !box) return;

    var timer = null;
    input.addEventListener('input', function () {
      clearTimeout(timer);
      timer = setTimeout(function () {
        // Rebuild index after data may have loaded
        INDEX = null;
        render(filter(input.value));
      }, 120);
    });
    input.addEventListener('focus', function () {
      if (typeof ensurePageData === 'function') ensurePageData('chapters').then(function () { INDEX = null; });
    });
    document.addEventListener('click', function (e) {
      if (!box.contains(e.target) && e.target !== input) box.classList.add('hidden');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSearch);
  } else {
    initSearch();
  }
})();
