/* Past-paper style practice (mock papers).
 * NOT official WAEC/JAMB copyrighted papers — original practice sets
 * organised by year for exam-style sessions.
 */
(function () {
  var YEARS = [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025];
  var WAEC_PAPER_SIZE = 40;
  var JAMB_PAPER_SIZE = 40;
  var wired = false;

  function mulberry32(a) {
    return function () {
      var t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(arr, rnd) {
    var a = arr.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(rnd() * (i + 1));
      var t = a[i];
      a[i] = a[j];
      a[j] = t;
    }
    return a;
  }

  function getBank(exam) {
    if (exam === 'jamb') {
      return (
        (typeof jambQuestions !== 'undefined' && jambQuestions) ||
        (window.BIO_DATA && window.BIO_DATA.jambQuestions) ||
        []
      );
    }
    // WAEC objective bank
    return (
      (typeof waecQuestions !== 'undefined' && waecQuestions) ||
      (window.BIO_DATA && window.BIO_DATA.waecQuestions) ||
      []
    );
  }

  /**
   * Build a deterministic mock paper for a given year.
   * @param {'waec'|'jamb'} exam
   * @param {number} year
   * @param {number} size
   */
  function buildPaper(exam, year, size) {
    var bank = getBank(exam);
    if (!bank.length) return [];
    var rnd = mulberry32(year * 10007 + (exam === 'jamb' ? 17 : 31));
    var pool = shuffle(bank, rnd);
    // Prefer topic spread: take round-robin by topic when possible
    var byTopic = {};
    pool.forEach(function (q) {
      var t = q.topic || 'general';
      if (!byTopic[t]) byTopic[t] = [];
      byTopic[t].push(q);
    });
    var topics = Object.keys(byTopic);
    var paper = [];
    var idx = 0;
    while (paper.length < size && paper.length < pool.length) {
      var topic = topics[idx % topics.length];
      if (byTopic[topic] && byTopic[topic].length) {
        paper.push(byTopic[topic].shift());
      }
      idx++;
      if (idx > size * topics.length + 10) break;
    }
    // Pad from remaining pool if needed
    if (paper.length < size) {
      var used = {};
      paper.forEach(function (q) {
        used[(q.topic || '') + '|' + (q.q || '')] = true;
      });
      for (var i = 0; i < pool.length && paper.length < size; i++) {
        var key = (pool[i].topic || '') + '|' + (pool[i].q || '');
        if (!used[key]) {
          paper.push(pool[i]);
          used[key] = true;
        }
      }
    }
    return paper.slice(0, size);
  }

  function ensureDisclaimer(container) {
    if (container.querySelector('.past-paper-note')) return;
    var note = document.createElement('p');
    note.className = 'past-paper-note';
    note.style.cssText =
      'font-size:0.8rem;color:var(--text-muted);margin:0.5rem 0 1rem;line-height:1.45;';
    note.innerHTML =
      '<strong>Practice papers</strong> — original exam-style sets organised by year. ' +
      'These are <em>not</em> official WAEC or JAMB past papers (those are copyrighted). ' +
      'Use real past papers from authorised sources for final revision.';
    container.insertBefore(note, container.firstChild);
  }

  function renderYearGrid(exam, hostId) {
    var host = document.getElementById(hostId);
    if (!host) return;
    ensureDisclaimer(host.parentElement || host);

    var existing = host.querySelector('.past-paper-years');
    if (existing) existing.remove();

    var wrap = document.createElement('div');
    wrap.className = 'past-paper-years';
    wrap.style.cssText = 'margin-bottom:1.25rem;';
    wrap.innerHTML =
      '<h3 class="section-title" style="font-size:1rem;margin-bottom:0.65rem;">📅 Past-paper style practice</h3>' +
      '<p style="font-size:0.8rem;color:var(--text-muted);margin-bottom:0.65rem;">' +
      (exam === 'waec'
        ? 'Mock WAEC objective paper · ' + WAEC_PAPER_SIZE + ' questions'
        : 'Mock JAMB Biology paper · ' + JAMB_PAPER_SIZE + ' questions') +
      '</p>';

    var grid = document.createElement('div');
    grid.className = 'feature-grid';
    grid.style.gridTemplateColumns = 'repeat(auto-fill,minmax(100px,1fr))';
    YEARS.forEach(function (y) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'feature-card';
      card.style.cssText =
        'cursor:pointer;border:1px solid var(--border);font-family:inherit;color:inherit;';
      card.innerHTML =
        '<div class="feature-icon" style="font-size:1.1rem;">📝</div><h3 style="font-size:0.95rem;">' +
        y +
        '</h3>';
      card.addEventListener('click', function () {
        startPastPaper(exam, y);
      });
      grid.appendChild(card);
    });
    wrap.appendChild(grid);
    host.insertBefore(wrap, host.firstChild);
  }

  function startPastPaper(exam, year) {
    var size = exam === 'jamb' ? JAMB_PAPER_SIZE : WAEC_PAPER_SIZE;
    var paper = buildPaper(exam, year, size);
    if (!paper.length) {
      alert('Question bank still loading. Wait a moment and try again.');
      if (window.BioHubEfficiency && BioHubEfficiency.loadExamBank) {
        BioHubEfficiency.loadExamBank();
      }
      return;
    }

    if (exam === 'waec') {
      // Reuse WAEC MSQ engine
      if (typeof waecMode !== 'undefined') {
        try {
          waecMode = 'msq';
        } catch (e) {}
      }
      if (typeof waecState !== 'undefined') {
        waecState = {
          topic: 'paper-' + year,
          index: 0,
          score: 0,
          answered: false,
          questions: paper
        };
      }
      var picker = document.getElementById('waecTopicPicker');
      var area = document.getElementById('waecQuizArea');
      var result = document.getElementById('waecResult');
      if (picker) picker.classList.add('hidden');
      if (result) result.classList.add('hidden');
      if (area) area.classList.remove('hidden');
      if (typeof setText === 'function') {
        setText('waecTopicLabel', 'WAEC-style ' + year);
      } else {
        var lab = document.getElementById('waecTopicLabel');
        if (lab) lab.textContent = 'WAEC-style ' + year;
      }
      if (typeof renderWaecQuestion === 'function') renderWaecQuestion();
      else renderGenericWaec(paper);
    } else {
      if (typeof jambState !== 'undefined') {
        jambState = {
          topic: 'paper-' + year,
          index: 0,
          score: 0,
          answered: false,
          questions: paper
        };
      }
      var jp = document.getElementById('jambTopicPicker');
      var ja = document.getElementById('jambQuizArea');
      var jr = document.getElementById('jambResult');
      if (jp) jp.classList.add('hidden');
      if (jr) jr.classList.add('hidden');
      if (ja) ja.classList.remove('hidden');
      if (typeof setText === 'function') {
        setText('jambTopicLabel', 'JAMB-style ' + year);
      } else {
        var jlab = document.getElementById('jambTopicLabel');
        if (jlab) jlab.textContent = 'JAMB-style ' + year;
      }
      if (typeof renderJambQuestion === 'function') renderJambQuestion();
      else renderGenericJamb(paper);
    }

    // Optional: start exam timer if available
    if (typeof setTimerMinutes === 'function') {
      try {
        setTimerMinutes(exam === 'jamb' ? 40 : 50);
      } catch (e) {}
    }
  }

  /** Fallback renderer if app internals differ */
  function renderGenericWaec(paper) {
    var state =
      typeof waecState !== 'undefined'
        ? waecState
        : { index: 0, questions: paper, score: 0, answered: false };
    var q = state.questions[state.index];
    if (!q) return;
    var box = document.getElementById('waecQuestion');
    var counter = document.getElementById('waecCounter');
    var prog = document.getElementById('waecProgress');
    if (counter) {
      counter.textContent =
        'Question ' + (state.index + 1) + '/' + state.questions.length;
    }
    if (prog) {
      prog.style.width =
        (state.index / state.questions.length) * 100 + '%';
    }
    if (!box) return;
    var letters = ['A', 'B', 'C', 'D'];
    box.innerHTML =
      '<p style="font-weight:600;margin-bottom:1rem;">' +
      escapeHtml(q.q) +
      '</p>' +
      (q.options || [])
        .map(function (opt, i) {
          return (
            '<div class="option" data-i="' +
            i +
            '"><span class="option-letter">' +
            letters[i] +
            '</span><span>' +
            escapeHtml(opt) +
            '</span></div>'
          );
        })
        .join('');
    box.querySelectorAll('.option').forEach(function (el) {
      el.addEventListener('click', function () {
        if (state.answered) return;
        state.answered = true;
        var i = parseInt(el.getAttribute('data-i'), 10);
        var correct = q.answer;
        el.classList.add(i === correct ? 'correct' : 'wrong');
        if (i === correct) state.score++;
        box.querySelectorAll('.option').forEach(function (o, j) {
          if (j === correct) o.classList.add('correct');
        });
        var next = document.getElementById('waecNextBtn');
        if (next) next.style.display = '';
      });
    });
  }

  function renderGenericJamb(paper) {
    var state =
      typeof jambState !== 'undefined'
        ? jambState
        : { index: 0, questions: paper, score: 0, answered: false };
    var q = state.questions[state.index];
    if (!q) return;
    var box = document.getElementById('jambQuestion');
    var counter = document.getElementById('jambCounter');
    var prog = document.getElementById('jambProgress');
    if (counter) {
      counter.textContent =
        'Question ' + (state.index + 1) + '/' + state.questions.length;
    }
    if (prog) {
      prog.style.width =
        (state.index / state.questions.length) * 100 + '%';
    }
    if (!box) return;
    var letters = ['A', 'B', 'C', 'D'];
    box.innerHTML =
      '<p style="font-weight:600;margin-bottom:1rem;">' +
      escapeHtml(q.q) +
      '</p>' +
      (q.options || [])
        .map(function (opt, i) {
          return (
            '<div class="option" data-i="' +
            i +
            '"><span class="option-letter">' +
            letters[i] +
            '</span><span>' +
            escapeHtml(opt) +
            '</span></div>'
          );
        })
        .join('');
    box.querySelectorAll('.option').forEach(function (el) {
      el.addEventListener('click', function () {
        if (state.answered) return;
        state.answered = true;
        var i = parseInt(el.getAttribute('data-i'), 10);
        var correct = q.answer;
        el.classList.add(i === correct ? 'correct' : 'wrong');
        if (i === correct) state.score++;
        box.querySelectorAll('.option').forEach(function (o, j) {
          if (j === correct) o.classList.add('correct');
        });
        var next = document.getElementById('jambNextBtn');
        if (next) next.style.display = '';
      });
    });
  }

  function escapeHtml(t) {
    var d = document.createElement('div');
    d.textContent = t || '';
    return d.innerHTML;
  }

  /**
   * Patch startWaecTopic / engines to honour pre-built question lists
   * when topic starts with paper-
   */
  function patchEngines() {
    if (typeof startWaecTopic === 'function' && !startWaecTopic._pp) {
      var _sw = startWaecTopic;
      window.startWaecTopic = function (topic) {
        if (String(topic).indexOf('paper-') === 0) return;
        return _sw(topic);
      };
      window.startWaecTopic._pp = true;
    }

    // Make renderWaecQuestion use waecState.questions when present
    if (typeof renderWaecQuestion === 'function' && !renderWaecQuestion._pp) {
      var _rw = renderWaecQuestion;
      window.renderWaecQuestion = function () {
        if (
          waecState &&
          Array.isArray(waecState.questions) &&
          waecState.questions.length &&
          String(waecState.topic || '').indexOf('paper-') === 0
        ) {
          var qs = waecState.questions;
          var q = qs[waecState.index];
          if (!q) {
            if (typeof showWaecResult === 'function') return showWaecResult();
            return finishWaecPaper();
          }
          waecState.answered = false;
          setText(
            'waecCounter',
            'Question ' + (waecState.index + 1) + '/' + qs.length
          );
          setStyle(
            'waecProgress',
            'width',
            (waecState.index / qs.length) * 100 + '%'
          );
          var nextBtn = document.getElementById('waecNextBtn');
          if (nextBtn) nextBtn.style.display = 'none';
          var reveal = document.getElementById('waecRevealTheoryBtn');
          if (reveal) reveal.style.display = 'none';
          var fb = document.getElementById('waecFeedback');
          if (fb) {
            fb.classList.add('hidden');
            fb.innerHTML = '';
          }
          var letters = ['A', 'B', 'C', 'D'];
          var card = document.getElementById('waecQuestion');
          if (!card) return;
          card.innerHTML =
            '<p style="font-weight:600;margin-bottom:1rem;">' +
            escapeHtml(q.q) +
            '</p>' +
            (q.options || [])
              .map(function (opt, i) {
                return (
                  '<div class="option" data-i="' +
                  i +
                  '"><span class="option-letter">' +
                  letters[i] +
                  '</span><span>' +
                  escapeHtml(opt) +
                  '</span></div>'
                );
              })
              .join('');
          card.querySelectorAll('.option').forEach(function (el) {
            el.addEventListener('click', function () {
              if (waecState.answered) return;
              waecState.answered = true;
              var i = parseInt(el.getAttribute('data-i'), 10);
              var correct = q.answer;
              el.classList.add(i === correct ? 'correct' : 'wrong');
              if (i === correct) waecState.score++;
              card.querySelectorAll('.option').forEach(function (o, j) {
                if (j === correct) o.classList.add('correct');
              });
              if (q.explanation) {
                var f = document.getElementById('waecFeedback');
                if (f) {
                  f.classList.remove('hidden');
                  f.className =
                    'feedback ' + (i === correct ? 'correct' : 'wrong');
                  f.textContent = q.explanation;
                }
              }
              if (nextBtn) nextBtn.style.display = '';
            });
          });
          return;
        }
        return _rw();
      };
      window.renderWaecQuestion._pp = true;
    }

    if (typeof nextWaecQuestion === 'function' && !nextWaecQuestion._pp) {
      var _nw = nextWaecQuestion;
      window.nextWaecQuestion = function () {
        if (
          waecState &&
          Array.isArray(waecState.questions) &&
          String(waecState.topic || '').indexOf('paper-') === 0
        ) {
          waecState.index++;
          if (waecState.index >= waecState.questions.length) {
            return finishWaecPaper();
          }
          return renderWaecQuestion();
        }
        return _nw();
      };
      window.nextWaecQuestion._pp = true;
    }

    if (typeof renderJambQuestion === 'function' && !renderJambQuestion._pp) {
      var _rj = renderJambQuestion;
      window.renderJambQuestion = function () {
        if (
          jambState &&
          Array.isArray(jambState.questions) &&
          jambState.questions.length &&
          String(jambState.topic || '').indexOf('paper-') === 0
        ) {
          var qs = jambState.questions;
          var q = qs[jambState.index];
          if (!q) return finishJambPaper();
          jambState.answered = false;
          setText(
            'jambCounter',
            'Question ' + (jambState.index + 1) + '/' + qs.length
          );
          setStyle(
            'jambProgress',
            'width',
            (jambState.index / qs.length) * 100 + '%'
          );
          var nextBtn = document.getElementById('jambNextBtn');
          if (nextBtn) nextBtn.style.display = 'none';
          var fb = document.getElementById('jambFeedback');
          if (fb) {
            fb.classList.add('hidden');
            fb.innerHTML = '';
          }
          var letters = ['A', 'B', 'C', 'D'];
          var card = document.getElementById('jambQuestion');
          if (!card) return;
          card.innerHTML =
            '<p style="font-weight:600;margin-bottom:1rem;">' +
            escapeHtml(q.q) +
            '</p>' +
            (q.options || [])
              .map(function (opt, i) {
                return (
                  '<div class="option" data-i="' +
                  i +
                  '"><span class="option-letter">' +
                  letters[i] +
                  '</span><span>' +
                  escapeHtml(opt) +
                  '</span></div>'
                );
              })
              .join('');
          card.querySelectorAll('.option').forEach(function (el) {
            el.addEventListener('click', function () {
              if (jambState.answered) return;
              jambState.answered = true;
              var i = parseInt(el.getAttribute('data-i'), 10);
              var correct = q.answer;
              el.classList.add(i === correct ? 'correct' : 'wrong');
              if (i === correct) jambState.score++;
              card.querySelectorAll('.option').forEach(function (o, j) {
                if (j === correct) o.classList.add('correct');
              });
              if (nextBtn) nextBtn.style.display = '';
            });
          });
          return;
        }
        return _rj();
      };
      window.renderJambQuestion._pp = true;
    }

    if (typeof nextJambQuestion === 'function' && !nextJambQuestion._pp) {
      var _nj = nextJambQuestion;
      window.nextJambQuestion = function () {
        if (
          jambState &&
          Array.isArray(jambState.questions) &&
          String(jambState.topic || '').indexOf('paper-') === 0
        ) {
          jambState.index++;
          if (jambState.index >= jambState.questions.length) {
            return finishJambPaper();
          }
          return renderJambQuestion();
        }
        return _nj();
      };
      window.nextJambQuestion._pp = true;
    }
  }

  function finishWaecPaper() {
    var area = document.getElementById('waecQuizArea');
    var result = document.getElementById('waecResult');
    if (area) area.classList.add('hidden');
    if (result) result.classList.remove('hidden');
    var total = (waecState.questions && waecState.questions.length) || 1;
    var pct = Math.round((waecState.score / total) * 100);
    setText('waecFinalScore', pct + '%');
    setText(
      'waecScoreMessage',
      'You scored ' +
        waecState.score +
        ' / ' +
        total +
        ' on this practice paper.'
    );
  }

  function finishJambPaper() {
    var area = document.getElementById('jambQuizArea');
    var result = document.getElementById('jambResult');
    if (area) area.classList.add('hidden');
    if (result) result.classList.remove('hidden');
    var total = (jambState.questions && jambState.questions.length) || 1;
    var pct = Math.round((jambState.score / total) * 100);
    setText('jambFinalScore', pct + '%');
    setText(
      'jambScoreMessage',
      'You scored ' +
        jambState.score +
        ' / ' +
        total +
        ' on this practice paper.'
    );
  }

  function mount() {
    renderYearGrid('waec', 'waecTopicPicker');
    renderYearGrid('jamb', 'jambTopicPicker');
    patchEngines();
  }

  function init() {
    mount();
    var orig = window.ensurePageInit;
    if (typeof orig === 'function' && !orig._ppWrapped) {
      window.ensurePageInit = function (pageId) {
        return Promise.resolve(orig(pageId)).then(function (r) {
          if (pageId === 'waec' || pageId === 'jamb') {
            setTimeout(mount, 50);
          }
          return r;
        });
      };
      window.ensurePageInit._ppWrapped = true;
    }
    // Retry after exam bank loads
    setTimeout(mount, 2500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

  window.BioHubPastPapers = {
    buildPaper: buildPaper,
    start: startPastPaper,
    years: YEARS.slice()
  };
})();
