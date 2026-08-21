/* PWA efficiency: idle work, visibility pause, data merge for extra topics */
(function () {
  function loadExtraTopics() {
    if (window.__extraTopicsLoaded) return Promise.resolve();
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = './data/extraTopics.js';
      s.async = true;
      s.onload = function () {
        window.__extraTopicsLoaded = true;
        // Sync globals used by app.js
        if (window.BIO_DATA) {
          if (window.BIO_DATA.chapters) window.chapters = window.BIO_DATA.chapters;
          if (window.BIO_DATA.flashcards) {
            if (typeof flashcards === 'undefined' || !flashcards) window.flashcards = window.BIO_DATA.flashcards;
            else Object.assign(flashcards, window.BIO_DATA.flashcards);
          }
          if (window.BIO_DATA.quizzes) {
            if (typeof quizzes === 'undefined' || !quizzes) window.quizzes = window.BIO_DATA.quizzes;
            else Object.assign(quizzes, window.BIO_DATA.quizzes);
          }
        }
        // Refresh UI lists if already rendered
        if (typeof renderChapters === 'function') try { renderChapters(); } catch (e) {}
        if (typeof renderHomeChapters === 'function') try { renderHomeChapters(); } catch (e) {}
        if (typeof renderProgress === 'function') try { renderProgress(); } catch (e) {}
        resolve();
      };
      s.onerror = function () { resolve(); };
      document.head.appendChild(s);
    });
  }

  function enrichTopicSelects() {
    var extras = [
      { value: 'respiration', label: 'Respiration' },
      { value: 'excretion', label: 'Excretion' },
      { value: 'coordination', label: 'Coordination' }
    ];
    ['cardTopic'].forEach(function (id) {
      var sel = document.getElementById(id);
      if (!sel) return;
      extras.forEach(function (x) {
        if (![].some.call(sel.options, function (o) { return o.value === x.value; })) {
          var opt = document.createElement('option');
          opt.value = x.value;
          opt.textContent = x.label;
          sel.appendChild(opt);
        }
      });
    });
    // Quiz topic cards
    var setup = document.getElementById('quizSetup');
    if (setup) {
      var grid = setup.querySelector('.feature-grid');
      if (grid && !grid.querySelector('[data-quiz="respiration"]')) {
        var html = [
          { id: 'respiration', icon: '💨', label: 'Respiration' },
          { id: 'excretion', icon: '🫘', label: 'Excretion' },
          { id: 'coordination', icon: '🧠', label: 'Coordination' }
        ].map(function (t) {
          return '<div class="feature-card" data-quiz="' + t.id + '"><div class="feature-icon">' + t.icon + '</div><h3>' + t.label + '</h3></div>';
        }).join('');
        grid.insertAdjacentHTML('beforeend', html);
        grid.querySelectorAll('[data-quiz]').forEach(function (el) {
          if (el._wired) return;
          el._wired = true;
          el.addEventListener('click', function () {
            if (typeof startQuiz === 'function') startQuiz(el.getAttribute('data-quiz'));
          });
        });
      }
    }
  }

  function idle(fn) {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 2000 });
    else setTimeout(fn, 200);
  }

  function initEfficiency() {
    idle(function () {
      loadExtraTopics().then(enrichTopicSelects);
    });

    // Pause non-critical work when tab hidden
    document.addEventListener('visibilitychange', function () {
      if (document.hidden && typeof timerRunning !== 'undefined' && timerRunning && typeof timerInterval !== 'undefined') {
        // exam timer keeps running intentionally
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEfficiency);
  } else {
    initEfficiency();
  }

  window.BioHubEfficiency = { loadExtraTopics: loadExtraTopics };
})();
