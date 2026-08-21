/* Timed Exam Mode — countdown + auto-submit for WAEC/JAMB practice papers */
(function () {
  var DEFAULTS = {
    waec: 50 * 60,
    jamb: 40 * 60
  };

  var state = {
    active: false,
    exam: null,
    year: null,
    remaining: 0,
    total: 0,
    interval: null,
    submitted: false
  };

  function ensureBar() {
    var bar = document.getElementById('timedExamBar');
    if (bar) return bar;
    bar = document.createElement('div');
    bar.id = 'timedExamBar';
    bar.setAttribute('role', 'timer');
    bar.setAttribute('aria-live', 'polite');
    bar.style.cssText =
      'display:none;position:fixed;top:calc(var(--nav-height,64px) + 4px);left:50%;transform:translateX(-50%);' +
      'z-index:1200;background:linear-gradient(135deg,#0f766e,#0d9488);color:#fff;' +
      'padding:0.5rem 1rem;border-radius:99px;font-weight:700;font-size:0.9rem;' +
      'box-shadow:0 4px 20px rgba(15,118,110,0.35);align-items:center;gap:0.75rem;' +
      'font-family:JetBrains Mono,ui-monospace,monospace;max-width:92vw;';
    bar.innerHTML =
      '<span id="timedExamLabel" style="font-family:Inter,system-ui,sans-serif;font-weight:600;font-size:0.8rem;opacity:0.95;"></span>' +
      '<span id="timedExamClock">50:00</span>' +
      '<button type="button" id="timedExamSubmit" style="border:none;border-radius:99px;padding:0.35rem 0.75rem;' +
      'font-weight:700;cursor:pointer;background:#fff;color:#0f766e;font-family:inherit;font-size:0.75rem;">Submit</button>';
    document.body.appendChild(bar);

    document.getElementById('timedExamSubmit').addEventListener('click', function () {
      if (!state.active || state.submitted) return;
      if (confirm('Submit exam now? You cannot continue this timed session after submitting.')) {
        finishExam('manual');
      }
    });
    return bar;
  }

  function formatTime(sec) {
    sec = Math.max(0, sec);
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  function updateUi() {
    var clock = document.getElementById('timedExamClock');
    var bar = document.getElementById('timedExamBar');
    if (!clock || !bar) return;
    clock.textContent = formatTime(state.remaining);
    bar.style.background =
      state.remaining <= 60
        ? 'linear-gradient(135deg,#b91c1c,#dc2626)'
        : state.remaining <= 180
          ? 'linear-gradient(135deg,#c2410c,#ea580c)'
          : 'linear-gradient(135deg,#0f766e,#0d9488)';
  }

  function showBar(label) {
    var bar = ensureBar();
    var lab = document.getElementById('timedExamLabel');
    if (lab) lab.textContent = label || 'Timed exam';
    bar.style.display = 'flex';
    updateUi();
  }

  function hideBar() {
    var bar = document.getElementById('timedExamBar');
    if (bar) bar.style.display = 'none';
  }

  function clearTick() {
    if (state.interval) {
      clearInterval(state.interval);
      state.interval = null;
    }
  }

  function startTimedExam(exam, year, seconds) {
    stopTimedExam(true);
    state.active = true;
    state.exam = exam;
    state.year = year || null;
    state.total = seconds || DEFAULTS[exam] || 45 * 60;
    state.remaining = state.total;
    state.submitted = false;

    var label =
      (exam === 'jamb' ? 'JAMB' : 'WAEC') +
      (year ? ' ' + year : '') +
      ' · timed';
    showBar(label);

    clearTick();
    state.interval = setInterval(function () {
      if (!state.active || state.submitted) return;
      state.remaining--;
      updateUi();
      if (state.remaining <= 0) finishExam('timeout');
    }, 1000);
  }

  function stopTimedExam(silent) {
    clearTick();
    state.active = false;
    state.submitted = true;
    if (!silent) hideBar();
    else hideBar();
  }

  function finishExam(reason) {
    if (state.submitted && reason !== 'timeout') return;
    if (state.submitted && reason === 'timeout') {
      /* already submitted */
    }
    var already = state.submitted;
    state.submitted = true;
    clearTick();
    state.active = false;

    if (!already) {
      showToast(
        reason === 'timeout'
          ? 'Time is up! Your paper has been submitted.'
          : 'Exam submitted.',
        reason === 'timeout'
      );
    }

    if (state.exam === 'waec') {
      if (window.BioHubPastPapers && BioHubPastPapers.finishWaec) {
        BioHubPastPapers.finishWaec();
      } else {
        forceResult('waec');
      }
    } else if (state.exam === 'jamb') {
      if (window.BioHubPastPapers && BioHubPastPapers.finishJamb) {
        BioHubPastPapers.finishJamb();
      } else {
        forceResult('jamb');
      }
    }
    hideBar();
  }

  function forceResult(exam) {
    var area = document.getElementById(exam === 'jamb' ? 'jambQuizArea' : 'waecQuizArea');
    var result = document.getElementById(exam === 'jamb' ? 'jambResult' : 'waecResult');
    if (area) area.classList.add('hidden');
    if (result) result.classList.remove('hidden');
    var st = exam === 'jamb' ? window.jambState : window.waecState;
    if (!st || typeof setText !== 'function') return;
    var total = (st.questions && st.questions.length) || Math.max(st.index + 1, 1);
    var pct = Math.round((st.score / total) * 100);
    var prefix = exam === 'jamb' ? 'jamb' : 'waec';
    setText(prefix + 'FinalScore', pct + '%');
    setText(
      prefix + 'ScoreMessage',
      'Timed paper: ' + st.score + ' / ' + total + (state.year ? ' · ' + state.year : '')
    );
  }

  function showToast(msg, isAlert) {
    var t = document.getElementById('timedExamToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'timedExamToast';
      t.style.cssText =
        'position:fixed;bottom:88px;left:50%;transform:translateX(-50%);z-index:1300;' +
        'padding:0.75rem 1.15rem;border-radius:12px;font-weight:600;font-size:0.9rem;' +
        'box-shadow:0 4px 20px rgba(0,0,0,0.2);opacity:0;transition:opacity 0.3s;max-width:90vw;text-align:center;';
      document.body.appendChild(t);
    }
    t.style.background = isAlert ? '#7f1d1d' : '#065f46';
    t.style.color = isAlert ? '#fee2e2' : '#ecfdf5';
    t.textContent = msg;
    t.style.opacity = '1';
    setTimeout(function () {
      t.style.opacity = '0';
    }, 3500);
  }

  function patchBackButtons() {
    ['waecBackTopics', 'waecBackTopics2', 'jambBackTopics', 'jambBackTopics2'].forEach(
      function (id) {
        var el = document.getElementById(id);
        if (!el || el._timedBound) return;
        el._timedBound = true;
        el.addEventListener('click', function () {
          stopTimedExam();
        });
      }
    );
  }

  window.addEventListener('beforeunload', function (e) {
    if (state.active && !state.submitted) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  function init() {
    ensureBar();
    patchBackButtons();
    var tries = 0;
    var iv = setInterval(function () {
      patchBackButtons();
      tries++;
      if (tries > 15) clearInterval(iv);
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

  window.BioHubTimedExam = {
    start: startTimedExam,
    stop: stopTimedExam,
    finish: finishExam,
    getState: function () {
      return {
        active: state.active,
        remaining: state.remaining,
        exam: state.exam,
        year: state.year
      };
    }
  };
})();
