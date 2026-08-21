/* Professor Bio Hub – Spaced Repetition (SM-2)
 * Review mode for flashcards with Again / Hard / Good / Easy.
 */
(function () {
  var SRS_KEY = 'srs'; // nested under profBioProgress
  var mode = 'browse'; // 'browse' | 'review'
  var reviewQueue = [];
  var reviewIndex = 0;
  var wired = false;

  /**
   * SM-2 algorithm (SuperMemo 2).
   * @param {{ease:number, interval:number, repetitions:number}} state
   * @param {number} quality 0–5 (Again≈1, Hard≈3, Good≈4, Easy≈5)
   * @return {{ease:number, interval:number, repetitions:number, due:number}}
   */
  function sm2(state, quality) {
    state = state || { ease: 2.5, interval: 0, repetitions: 0 };
    var ef = typeof state.ease === 'number' ? state.ease : 2.5;
    var interval = state.interval || 0;
    var reps = state.repetitions || 0;
    var q = Math.max(0, Math.min(5, quality));

    if (q < 3) {
      // Failed recall — reset schedule
      reps = 0;
      interval = 0; // due immediately / same day after short delay
    } else {
      if (reps === 0) {
        interval = 1;
      } else if (reps === 1) {
        interval = 6;
      } else {
        interval = Math.max(1, Math.round(interval * ef));
      }
      reps += 1;
    }

    // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    ef = ef + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
    if (ef < 1.3) ef = 1.3;

    // Hard slightly shorter; Easy slightly longer (common Anki-like tweak)
    if (q === 3 && reps > 1) {
      interval = Math.max(1, Math.round(interval * 1.2));
    }
    if (q === 5 && reps > 1) {
      interval = Math.max(1, Math.round(interval * 1.3));
    }

    var due = Date.now();
    if (q < 3) {
      due += 10 * 60 * 1000; // 10 minutes
    } else {
      due += interval * 24 * 60 * 60 * 1000;
    }

    return {
      ease: Math.round(ef * 100) / 100,
      interval: interval,
      repetitions: reps,
      due: due,
      lastQuality: q,
      updatedAt: Date.now()
    };
  }

  /** Map UI rating to SM-2 quality */
  var RATING = {
    again: 1,
    hard: 3,
    good: 4,
    easy: 5
  };

  function getProgress() {
    try {
      return JSON.parse(localStorage.getItem('profBioProgress') || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveProgressData(data) {
    if (typeof saveProgress === 'function') {
      saveProgress(data);
    } else {
      localStorage.setItem('profBioProgress', JSON.stringify(data));
    }
  }

  function getSrsMap() {
    var data = getProgress();
    return data[SRS_KEY] || {};
  }

  function setCardState(cardId, state) {
    var data = getProgress();
    data[SRS_KEY] = data[SRS_KEY] || {};
    data[SRS_KEY][cardId] = state;
    // Count reviews for progress panel
    data.cardsSeen = (data.cardsSeen || 0) + 1;
    data.srsReviews = (data.srsReviews || 0) + 1;
    saveProgressData(data);
    if (typeof renderProgress === 'function') renderProgress();
  }

  function cardId(topic, card) {
    var front = (card && card.front) || '';
    return topic + '::' + front.slice(0, 80);
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

  /** Cards due now (or never studied) for current topic filter */
  function buildReviewQueue() {
    var topicSel = document.getElementById('cardTopic');
    var topic = topicSel ? topicSel.value : 'all';
    var map = getSrsMap();
    var now = Date.now();
    var due = [];
    var newCards = [];

    cardsForTopic(topic).forEach(function (c) {
      var st = map[c.id];
      if (!st) {
        newCards.push(c);
      } else if (st.due <= now) {
        due.push(c);
      }
    });

    // Prioritize due reviews, then new cards (limit new to 20 per session)
    due.sort(function (a, b) {
      var da = (map[a.id] && map[a.id].due) || 0;
      var db = (map[b.id] && map[b.id].due) || 0;
      return da - db;
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
    toolbar.style.cssText = 'display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;margin-bottom:1rem;';
    toolbar.innerHTML =
      '<button type="button" class="btn btn-primary btn-sm" id="srsReviewBtn">📅 Review due</button>' +
      '<button type="button" class="btn btn-secondary btn-sm" id="srsBrowseBtn">📚 Browse</button>' +
      '<span id="srsStats" style="font-size:0.8rem;color:var(--text-muted);margin-left:0.25rem;"></span>';

    var title = page.querySelector('.section-title');
    if (title && title.nextSibling) {
      page.insertBefore(toolbar, title.nextSibling);
    } else {
      page.insertBefore(toolbar, page.firstChild);
    }

    var rating = document.createElement('div');
    rating.id = 'srsRating';
    rating.className = 'hidden';
    rating.style.cssText =
      'display:none;grid-template-columns:repeat(4,1fr);gap:0.5rem;margin-top:1rem;';
    rating.innerHTML =
      '<button type="button" class="btn btn-sm" data-rating="again" style="background:#fee2e2;color:#991b1b;">Again</button>' +
      '<button type="button" class="btn btn-sm" data-rating="hard" style="background:#ffedd5;color:#9a3412;">Hard</button>' +
      '<button type="button" class="btn btn-sm" data-rating="good" style="background:#d1fae5;color:#065f46;">Good</button>' +
      '<button type="button" class="btn btn-sm" data-rating="easy" style="background:#ccfbf1;color:#0f766e;">Easy</button>';

    var controls = page.querySelector('#flipCard');
    if (controls && controls.parentElement) {
      controls.parentElement.insertAdjacentElement('afterend', rating);
    } else {
      page.appendChild(rating);
    }
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
      el.textContent = c.due + ' due · ' + c.new + ' new · ' + c.later + ' scheduled';
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
        'Review ' + (reviewIndex + 1) + ' of ' + reviewQueue.length +
        ' · ' + card.topic;
    }
    var rating = document.getElementById('srsRating');
    if (rating) rating.style.display = 'grid';
    updateStats();
  }

  function rate(ratingKey) {
    var card = currentReviewCard();
    if (!card) return;
    var quality = RATING[ratingKey];
    if (quality == null) return;

    var map = getSrsMap();
    var prev = map[card.id] || { ease: 2.5, interval: 0, repetitions: 0 };
    var next = sm2(prev, quality);
    setCardState(card.id, next);

    console.log('[SRS]', card.id, ratingKey, next);

    reviewIndex += 1;
    showCurrent();
  }

  function wire() {
    if (wired) return;
    ensureUi();

    var reviewBtn = document.getElementById('srsReviewBtn');
    var browseBtn = document.getElementById('srsBrowseBtn');
    if (reviewBtn) {
      reviewBtn.addEventListener('click', function () {
        setMode('review');
      });
    }
    if (browseBtn) {
      browseBtn.addEventListener('click', function () {
        setMode('browse');
      });
    }

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

    // Keyboard shortcuts in review mode
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
    // Wait until flashcard page / data may exist
    function tryWire() {
      if (document.getElementById('page-flashcards')) wire();
    }
    tryWire();
    // Re-run when user opens flashcards (data may load late)
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
    counts: counts,
    setMode: setMode,
    rate: rate,
    getSrsMap: getSrsMap
  };
})();
