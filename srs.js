/* Professor Bio Hub – Spaced Repetition (optimized SM-2)
 * Review mode: Again / Hard / Good / Easy
 */
(function () {
  var SRS_KEY = 'srs';
  var mode = 'browse';
  var reviewQueue = [];
  var reviewIndex = 0;
  var wired = false;

  // --- SM-2 tuning ---
  var MIN_EASE = 1.3;
  var DEFAULT_EASE = 2.5;
  var MAX_INTERVAL_DAYS = 365;
  var EASY_BONUS = 1.3;      // Easy multiplies interval after EF step
  var HARD_FACTOR = 1.2;     // Hard: previous interval * 1.2 (not full EF)
  var FUZZ_RATIO = 0.05;     // ±5% due-date fuzz to spread reviews
  var DAY_MS = 24 * 60 * 60 * 1000;
  var LEARNING_STEPS_MS = [60 * 1000, 10 * 60 * 1000]; // 1 min, 10 min

  var RATING = { again: 1, hard: 3, good: 4, easy: 5 };

  /**
   * Classic SM-2 ease factor update.
   * EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
   * @param {number} ef
   * @param {number} q quality 0–5
   * @return {number}
   */
  function updateEase(ef, q) {
    var next = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (next < MIN_EASE) next = MIN_EASE;
    // Soft ceiling avoids runaway ease from repeated Easy
    if (next > 3.5) next = 3.5;
    return Math.round(next * 100) / 100;
  }

  /**
   * Clamp and quantize interval in whole days.
   * @param {number} days
   * @return {number}
   */
  function normalizeInterval(days) {
    if (!isFinite(days) || days < 0) days = 0;
    days = Math.round(days);
    if (days < 1) days = 1;
    if (days > MAX_INTERVAL_DAYS) days = MAX_INTERVAL_DAYS;
    return days;
  }

  /**
   * Apply ±fuzz to a due timestamp so many cards are not due at the same second.
   * @param {number} dueMs
   * @param {number} intervalDays
   * @return {number}
   */
  function fuzzDue(dueMs, intervalDays) {
    if (intervalDays < 2) return dueMs;
    var windowMs = intervalDays * DAY_MS * FUZZ_RATIO;
    var delta = (Math.random() * 2 - 1) * windowMs;
    return Math.round(dueMs + delta);
  }

  /**
   * Optimized SM-2 interval scheduling.
   *
   * Success path (q ≥ 3):
   *  - Graduating: 1 day, then 6 days, then I × EF
   *  - Hard: max(1, prev × HARD_FACTOR) without advancing as fast as Good
   *  - Easy: (I × EF × EASY_BONUS)
   * Fail path (q < 3):
   *  - Reset reps; learning steps 1m → 10m by lapse count
   *
   * @param {{ease?:number, interval?:number, repetitions?:number, lapses?:number}} state
   * @param {number} quality 0–5
   * @return {{ease:number, interval:number, repetitions:number, lapses:number, due:number, lastQuality:number, updatedAt:number}}
   */
  function sm2(state, quality) {
    state = state || {};
    var ef = typeof state.ease === 'number' ? state.ease : DEFAULT_EASE;
    var interval = typeof state.interval === 'number' ? state.interval : 0;
    var reps = state.repetitions || 0;
    var lapses = state.lapses || 0;
    var q = Math.max(0, Math.min(5, Number(quality) || 0));
    var now = Date.now();
    var due = now;

    // Always update ease (SM-2 original behaviour)
    ef = updateEase(ef, q);

    if (q < 3) {
      // Failed recall
      lapses += 1;
      reps = 0;
      interval = 0;
      // Learning steps: first fail → 1 min, repeat fails → 10 min
      var stepIndex = Math.min(lapses - 1, LEARNING_STEPS_MS.length - 1);
      if (stepIndex < 0) stepIndex = 0;
      due = now + LEARNING_STEPS_MS[stepIndex];
    } else {
      // Successful recall
      if (reps === 0) {
        // New card or relearning graduate
        if (q === 3) {
          // Hard on first success: still graduate but shorter
          interval = 1;
        } else if (q === 5) {
          interval = 4; // Easy bonus on first pass
        } else {
          interval = 1;
        }
      } else if (reps === 1) {
        if (q === 3) {
          interval = normalizeInterval(Math.max(interval, 1) * HARD_FACTOR);
        } else if (q === 5) {
          interval = normalizeInterval(6 * EASY_BONUS);
        } else {
          interval = 6;
        }
      } else {
        // Review stage: I(n) = I(n-1) * EF  (with button modifiers)
        var base = Math.max(interval, 1) * ef;
        if (q === 3) {
          // Hard: do not use full EF growth
          base = Math.max(interval, 1) * HARD_FACTOR;
        } else if (q === 5) {
          base = base * EASY_BONUS;
        }
        interval = normalizeInterval(base);
      }

      // Ensure Hard never increases interval vs previous review stage
      if (q === 3 && reps >= 2) {
        var capped = normalizeInterval(Math.max(interval, 1));
        var prev = Math.max(state.interval || 1, 1);
        // Hard may grow slowly but stay ≤ Good-equivalent path
        interval = Math.min(capped, normalizeInterval(prev * HARD_FACTOR + 1));
        interval = normalizeInterval(Math.max(prev, interval)); // at least previous
        // Actually Hard should be slightly longer than prev but less than Good:
        interval = normalizeInterval(prev * HARD_FACTOR);
      }

      reps += 1;
      due = fuzzDue(now + interval * DAY_MS, interval);
    }

    return {
      ease: ef,
      interval: interval,
      repetitions: reps,
      lapses: lapses,
      due: due,
      lastQuality: q,
      updatedAt: now
    };
  }

  /** Human-readable next interval hint for UI (optional) */
  function previewIntervals(state) {
    state = state || { ease: DEFAULT_EASE, interval: 0, repetitions: 0, lapses: 0 };
    return {
      again: '1–10m',
      hard: formatPreview(sm2(state, 3)),
      good: formatPreview(sm2(state, 4)),
      easy: formatPreview(sm2(state, 5))
    };
  }

  function formatPreview(result) {
    if (!result.interval) {
      var mins = Math.max(1, Math.round((result.due - Date.now()) / 60000));
      return mins < 60 ? mins + 'm' : Math.round(mins / 60) + 'h';
    }
    if (result.interval === 1) return '1d';
    if (result.interval < 30) return result.interval + 'd';
    if (result.interval < 365) return Math.round(result.interval / 30) + 'mo';
    return '1y';
  }

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem('profBioProgress') || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveProgressData(data) {
    if (typeof saveProgress === 'function') saveProgress(data);
    else localStorage.setItem('profBioProgress', JSON.stringify(data));
  }

  function getSrsMap() {
    return getProgress()[SRS_KEY] || {};
  }

  function setCardState(cardId, state) {
    var data = getProgress();
    data[SRS_KEY] = data[SRS_KEY] || {};
    data[SRS_KEY][cardId] = state;
    data.cardsSeen = (data.cardsSeen || 0) + 1;
    data.srsReviews = (data.srsReviews || 0) + 1;
    saveProgressData(data);
    if (typeof renderProgress === 'function') renderProgress();
  }

  function cardId(topic, card) {
    return topic + '::' + ((card && card.front) || '').slice(0, 80);
  }

  function allCardsFlat() {
    var list = [];
    var fc =
      (typeof flashcards !== 'undefined' && flashcards) ||
      (window.BIO_DATA && window.BIO_DATA.flashcards) ||
      null;
    if (!fc) return list;
    Object.keys(fc).forEach(function (topic) {
      (fc[topic] || []).forEach(function (c, i) {
        list.push({
          topic: topic,
          index: i,
          front: c.front,
          back: c.back,
          id: cardId(topic, c)
        });
      });
    });
    return list;
  }

  function cardsForTopic(topic) {
    var all = allCardsFlat();
    if (!topic || topic === 'all') return all;
    return all.filter(function (c) {
      return c.topic === topic;
    });
  }

  function buildReviewQueue() {
    var topicSel = document.getElementById('cardTopic');
    var topic = topicSel ? topicSel.value : 'all';
    var map = getSrsMap();
    var now = Date.now();
    var due = [];
    var newCards = [];

    cardsForTopic(topic).forEach(function (c) {
      var st = map[c.id];
      if (!st) newCards.push(c);
      else if (st.due <= now) due.push(c);
    });

    due.sort(function (a, b) {
      return ((map[a.id] && map[a.id].due) || 0) - ((map[b.id] && map[b.id].due) || 0);
    });

    return due.concat(newCards.slice(0, 20));
  }

  function counts() {
    var map = getSrsMap();
    var now = Date.now();
    var due = 0;
    var learning = 0;
    var newCount = 0;
    allCardsFlat().forEach(function (c) {
      var st = map[c.id];
      if (!st) newCount++;
      else if (st.due <= now) due++;
      else learning++;
    });
    return { due: due, new: newCount, later: learning, total: due + newCount + learning };
  }

  function ensureUi() {
    var page = document.getElementById('page-flashcards');
    if (!page || document.getElementById('srsToolbar')) return;

    var toolbar = document.createElement('div');
    toolbar.id = 'srsToolbar';
    toolbar.style.cssText =
      'display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;margin-bottom:1rem;';
    toolbar.innerHTML =
      '<button type="button" class="btn btn-primary btn-sm" id="srsReviewBtn">📅 Review due</button>' +
      '<button type="button" class="btn btn-secondary btn-sm" id="srsBrowseBtn">📚 Browse</button>' +
      '<span id="srsStats" style="font-size:0.8rem;color:var(--text-muted);margin-left:0.25rem;"></span>';

    var title = page.querySelector('.section-title');
    if (title && title.nextSibling) page.insertBefore(toolbar, title.nextSibling);
    else page.insertBefore(toolbar, page.firstChild);

    var rating = document.createElement('div');
    rating.id = 'srsRating';
    rating.className = 'hidden';
    rating.style.cssText =
      'display:none;grid-template-columns:repeat(4,1fr);gap:0.5rem;margin-top:1rem;';
    rating.innerHTML =
      '<button type="button" class="btn btn-sm" data-rating="again" style="background:#fee2e2;color:#991b1b;">Again<br><small id="hint-again" style="font-weight:500;opacity:0.85">10m</small></button>' +
      '<button type="button" class="btn btn-sm" data-rating="hard" style="background:#ffedd5;color:#9a3412;">Hard<br><small id="hint-hard" style="font-weight:500;opacity:0.85">—</small></button>' +
      '<button type="button" class="btn btn-sm" data-rating="good" style="background:#d1fae5;color:#065f46;">Good<br><small id="hint-good" style="font-weight:500;opacity:0.85">—</small></button>' +
      '<button type="button" class="btn btn-sm" data-rating="easy" style="background:#ccfbf1;color:#0f766e;">Easy<br><small id="hint-easy" style="font-weight:500;opacity:0.85">—</small></button>';

    var controls = document.getElementById('flipCard');
    if (controls && controls.parentElement) {
      controls.parentElement.insertAdjacentElement('afterend', rating);
    } else {
      page.appendChild(rating);
    }
  }

  function updateHints() {
    var card = currentReviewCard();
    if (!card) return;
    var prev = getSrsMap()[card.id] || {
      ease: DEFAULT_EASE,
      interval: 0,
      repetitions: 0,
      lapses: 0
    };
    var p = previewIntervals(prev);
    var a = document.getElementById('hint-again');
    var h = document.getElementById('hint-hard');
    var g = document.getElementById('hint-good');
    var e = document.getElementById('hint-easy');
    if (a) a.textContent = p.again;
    if (h) h.textContent = p.hard;
    if (g) g.textContent = p.good;
    if (e) e.textContent = p.easy;
  }

  function setMode(next) {
    mode = next;
    var rating = document.getElementById('srsRating');
    var prev = document.getElementById('prevCard');
    var nextBtn = document.getElementById('nextCard');

    if (mode === 'review') {
      reviewQueue = buildReviewQueue();
      reviewIndex = 0;
      if (rating) {
        rating.classList.remove('hidden');
        rating.style.display = 'grid';
      }
      if (prev) prev.style.display = 'none';
      if (nextBtn) nextBtn.style.display = 'none';
    } else {
      if (rating) {
        rating.classList.add('hidden');
        rating.style.display = 'none';
      }
      if (prev) prev.style.display = '';
      if (nextBtn) nextBtn.style.display = '';
    }
    updateStats();
    showCurrent();
  }

  function updateStats() {
    var el = document.getElementById('srsStats');
    if (!el) return;
    var c = counts();
    if (mode === 'review') {
      var left = Math.max(0, reviewQueue.length - reviewIndex);
      el.textContent =
        left + ' left this session · ' + c.due + ' due · ' + c.new + ' new';
    } else {
      el.textContent =
        c.due + ' due · ' + c.new + ' new · ' + c.later + ' scheduled';
    }
  }

  function currentReviewCard() {
    return reviewQueue[reviewIndex] || null;
  }

  function showCurrent() {
    var front = document.getElementById('cardFront');
    var back = document.getElementById('cardBack');
    var progress = document.getElementById('cardProgress');
    var fc = document.getElementById('flashcard');
    if (fc) fc.classList.remove('flipped');

    if (mode === 'browse') {
      if (typeof renderCard === 'function') {
        try {
          renderCard();
        } catch (e) {}
      }
      updateStats();
      return;
    }

    var card = currentReviewCard();
    if (!card) {
      if (front) front.textContent = 'All caught up! 🎉';
      if (back) back.textContent = 'No cards due. Switch to Browse or check back later.';
      if (progress) progress.textContent = 'Session complete';
      var rating = document.getElementById('srsRating');
      if (rating) rating.style.display = 'none';
      updateStats();
      return;
    }

    if (front) front.textContent = card.front;
    if (back) back.textContent = card.back;
    if (progress) {
      progress.textContent =
        'Review ' +
        (reviewIndex + 1) +
        ' of ' +
        reviewQueue.length +
        ' · ' +
        card.topic;
    }
    var ratingEl = document.getElementById('srsRating');
    if (ratingEl) ratingEl.style.display = 'grid';
    updateHints();
    updateStats();
  }

  function rate(ratingKey) {
    var card = currentReviewCard();
    if (!card) return;
    var quality = RATING[ratingKey];
    if (quality == null) return;

    var map = getSrsMap();
    var prev = map[card.id] || {
      ease: DEFAULT_EASE,
      interval: 0,
      repetitions: 0,
      lapses: 0
    };
    var next = sm2(prev, quality);
    setCardState(card.id, next);

    console.log('[SRS]', card.id, ratingKey, next);
    reviewIndex += 1;
    showCurrent();
  }

  function wire() {
    if (wired) {
      updateStats();
      return;
    }
    ensureUi();

    var reviewBtn = document.getElementById('srsReviewBtn');
    var browseBtn = document.getElementById('srsBrowseBtn');
    if (reviewBtn) reviewBtn.addEventListener('click', function () { setMode('review'); });
    if (browseBtn) browseBtn.addEventListener('click', function () { setMode('browse'); });

    var rating = document.getElementById('srsRating');
    if (rating) {
      rating.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-rating]');
        if (!btn) return;
        rate(btn.getAttribute('data-rating'));
      });
    }

    var topicSel = document.getElementById('cardTopic');
    if (topicSel) {
      topicSel.addEventListener('change', function () {
        if (mode === 'review') setMode('review');
        else updateStats();
      });
    }

    document.addEventListener('keydown', function (e) {
      var page = document.getElementById('page-flashcards');
      if (!page || !page.classList.contains('active') || mode !== 'review') return;
      if (e.key === '1') rate('again');
      else if (e.key === '2') rate('hard');
      else if (e.key === '3') rate('good');
      else if (e.key === '4') rate('easy');
      else if (e.key === ' ' || e.key === 'Enter') {
        var fc = document.getElementById('flashcard');
        if (fc) fc.classList.toggle('flipped');
        e.preventDefault();
      }
    });

    wired = true;
    updateStats();
  }

  function init() {
    function tryWire() {
      if (document.getElementById('page-flashcards')) wire();
    }
    tryWire();
    var origEnsure = window.ensurePageInit;
    if (typeof origEnsure === 'function' && !origEnsure._srsWrapped) {
      window.ensurePageInit = function (pageId) {
        return Promise.resolve(origEnsure(pageId)).then(function (r) {
          if (pageId === 'flashcards') {
            setTimeout(function () {
              wire();
              updateStats();
            }, 0);
          }
          return r;
        });
      };
      window.ensurePageInit._srsWrapped = true;
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

  window.BioHubSRS = {
    sm2: sm2,
    updateEase: updateEase,
    previewIntervals: previewIntervals,
    counts: counts,
    setMode: setMode,
    rate: rate,
    getSrsMap: getSrsMap
  };
})();
