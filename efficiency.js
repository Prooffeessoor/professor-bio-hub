/* PWA efficiency: idle work, extra topics + exam banks */
(function () {
  function loadScript(src) {
    return new Promise(function (resolve) {
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.onload = resolve;
      s.onerror = resolve;
      document.head.appendChild(s);
    });
  }

  function syncGlobalsFromBioData() {
    if (!window.BIO_DATA) return;
    if (window.BIO_DATA.chapters) window.chapters = window.BIO_DATA.chapters;
    if (window.BIO_DATA.flashcards) {
      if (typeof flashcards === 'undefined' || !flashcards) window.flashcards = window.BIO_DATA.flashcards;
      else Object.assign(flashcards, window.BIO_DATA.flashcards);
    }
    if (window.BIO_DATA.quizzes) {
      if (typeof quizzes === 'undefined' || !quizzes) window.quizzes = window.BIO_DATA.quizzes;
      else Object.assign(quizzes, window.BIO_DATA.quizzes);
    }
    if (window.BIO_DATA.waecQuestions) {
      if (typeof waecQuestions === 'undefined' || !waecQuestions) window.waecQuestions = window.BIO_DATA.waecQuestions;
      else if (Array.isArray(waecQuestions) && waecQuestions !== window.BIO_DATA.waecQuestions) {
        // prefer merged BIO_DATA list if longer
        if (window.BIO_DATA.waecQuestions.length > waecQuestions.length) {
          window.waecQuestions = window.BIO_DATA.waecQuestions;
        }
      }
    }
    if (window.BIO_DATA.jambQuestions) {
      if (typeof jambQuestions === 'undefined' || !jambQuestions) window.jambQuestions = window.BIO_DATA.jambQuestions;
      else if (Array.isArray(jambQuestions) && window.BIO_DATA.jambQuestions.length > jambQuestions.length) {
        window.jambQuestions = window.BIO_DATA.jambQuestions;
      }
    }
  }

  function loadExtraTopics() {
    if (window.__extraTopicsLoaded) return Promise.resolve();
    return loadScript('./data/extraTopics.js').then(function () {
      window.__extraTopicsLoaded = true;
      syncGlobalsFromBioData();
      if (typeof renderChapters === 'function') try { renderChapters(); } catch (e) {}
      if (typeof renderHomeChapters === 'function') try { renderHomeChapters(); } catch (e) {}
      if (typeof renderProgress === 'function') try { renderProgress(); } catch (e) {}
    });
  }

  function loadExamExtra() {
    if (window.__examExtraLoaded) return Promise.resolve();
    return loadScript('./data/examExtra.js').then(function () {
      window.__examExtraLoaded = true;
      syncGlobalsFromBioData();
    });
  }

  var TOPIC_UI = [
    { value: 'respiration', label: 'Respiration', icon: '💨' },
    { value: 'excretion', label: 'Excretion', icon: '🫘' },
    { value: 'coordination', label: 'Coordination', icon: '🧠' },
    { value: 'growth', label: 'Growth & Development', icon: '📈' },
    { value: 'sense_organs', label: 'Sense Organs', icon: '👁️' },
    { value: 'skeleton', label: 'Support & Locomotion', icon: '🦴' },
    { value: 'microorganisms', label: 'Micro-organisms', icon: '🦠' },
    { value: 'blood', label: 'Blood & Immunity', icon: '🩸' }
  ];

  function enrichTopicSelects() {
    ['cardTopic'].forEach(function (id) {
      var sel = document.getElementById(id);
      if (!sel) return;
      TOPIC_UI.forEach(function (x) {
        if (![].some.call(sel.options, function (o) { return o.value === x.value; })) {
          var opt = document.createElement('option');
          opt.value = x.value;
          opt.textContent = x.label;
          sel.appendChild(opt);
        }
      });
    });

    var setup = document.getElementById('quizSetup');
    if (setup) {
      var grid = setup.querySelector('.feature-grid');
      if (grid) {
        TOPIC_UI.forEach(function (t) {
          if (grid.querySelector('[data-quiz="' + t.value + '"]')) return;
          var div = document.createElement('div');
          div.className = 'feature-card';
          div.setAttribute('data-quiz', t.value);
          div.innerHTML =
            '<div class="feature-icon">' + t.icon + '</div><h3>' + t.label + '</h3>';
          grid.appendChild(div);
          div.addEventListener('click', function () {
            if (typeof startQuiz === 'function') startQuiz(t.value);
          });
        });
      }
    }
  }

  function idle(fn) {
    if ('requestIdleCallback' in window) requestIdleCallback(fn, { timeout: 3000 });
    else setTimeout(fn, 200);
  }

  function initEfficiency() {
    idle(function () {
      loadExtraTopics()
        .then(loadExamExtra)
        .then(enrichTopicSelects);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEfficiency);
  } else {
    initEfficiency();
  }

  window.BioHubEfficiency = {
    loadExtraTopics: loadExtraTopics,
    loadExamExtra: loadExamExtra
  };
})();
