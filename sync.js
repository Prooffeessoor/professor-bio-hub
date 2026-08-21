/* Professor Bio Hub – Background Sync client
 * Queue + flush with error handling and exponential backoff.
 */
(function () {
  var SYNC_QUEUE_KEY = 'profBioSyncQueue';
  var SYNC_ERROR_KEY = 'profBioSyncLastError';
  var SYNC_TAG = 'bio-hub-sync';
  var MAX_ATTEMPTS = 5;
  /** Base delay (ms) for exponential backoff: 1s, 2s, 4s, 8s, 16s */
  var BACKOFF_BASE_MS = 1000;
  var BACKOFF_MAX_MS = 60000;
  var flushing = false;
  var backoffTimer = null;

  function getSyncQueue() {
    try {
      return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    } catch (e) {
      console.error('[Sync] Failed to read queue', e);
      return [];
    }
  }

  function setSyncQueue(queue) {
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.error('[Sync] Failed to write queue (quota?)', e);
      showSyncToast('Could not save offline queue', true);
    }
  }

  function recordError(type, err) {
    var entry = {
      type: type,
      message: (err && err.message) || String(err),
      name: (err && err.name) || 'Error',
      at: Date.now()
    };
    try {
      localStorage.setItem(SYNC_ERROR_KEY, JSON.stringify(entry));
    } catch (e) {}
    console.warn('[Sync] Error recorded', entry);
    return entry;
  }

  function clearLastError() {
    try {
      localStorage.removeItem(SYNC_ERROR_KEY);
    } catch (e) {}
  }

  function getLastError() {
    try {
      return JSON.parse(localStorage.getItem(SYNC_ERROR_KEY) || 'null');
    } catch (e) {
      return null;
    }
  }

  /**
   * Exponential backoff delay for attempt N (0-based after a failure).
   * attempt 1 → 1s, 2 → 2s, 3 → 4s, 4 → 8s, 5 → 16s (capped).
   * @param {number} attempts
   * @return {number} milliseconds
   */
  function backoffDelay(attempts) {
    var exp = Math.max(0, (attempts || 1) - 1);
    var ms = BACKOFF_BASE_MS * Math.pow(2, exp);
    // Full jitter: random between 50% and 100% of delay
    var jittered = ms * (0.5 + Math.random() * 0.5);
    return Math.min(BACKOFF_MAX_MS, Math.round(jittered));
  }

  /**
   * Earliest time any queue item is allowed to retry.
   * @param {Array} queue
   * @return {number} timestamp ms, or 0 if ready now
   */
  function nextRetryAt(queue) {
    var soonest = Infinity;
    for (var i = 0; i < queue.length; i++) {
      var item = queue[i];
      var waitUntil = item.retryAfter || 0;
      if (waitUntil < soonest) soonest = waitUntil;
    }
    return soonest === Infinity ? 0 : soonest;
  }

  function isRetryableError(err) {
    if (!err) return true;
    var name = err.name || '';
    var msg = (err.message || '').toLowerCase();
    if (name === 'TypeError' && msg.indexOf('fetch') !== -1) return true;
    if (name === 'NetworkError' || name === 'AbortError' || name === 'TimeoutError') return true;
    if (msg.indexOf('network') !== -1 || msg.indexOf('offline') !== -1) return true;
    if (msg.indexOf('unavailable') !== -1 || msg.indexOf('deadline') !== -1) return true;
    if (msg.indexOf('permission') !== -1 || msg.indexOf('unauthenticated') !== -1) return true;
    return true;
  }

  function enqueueSync(type, payload) {
    try {
      var queue = getSyncQueue().filter(function (item) {
        return item.type !== type;
      });
      queue.push({
        type: type,
        payload: payload,
        queuedAt: Date.now(),
        attempts: 0,
        lastError: null,
        retryAfter: 0
      });
      setSyncQueue(queue);
      requestBackgroundSync();
      updateSyncBadge();
    } catch (e) {
      recordError('enqueue', e);
      showSyncToast('Failed to queue offline change', true);
    }
  }

  async function requestBackgroundSync() {
    if (!('serviceWorker' in navigator)) return false;
    try {
      var reg = await navigator.serviceWorker.ready;
      if ('sync' in reg) {
        await reg.sync.register(SYNC_TAG);
        console.log('[Sync] Background Sync registered:', SYNC_TAG);
        return true;
      }
      if (reg.active) {
        reg.active.postMessage({ type: 'REQUEST_SYNC' });
      }
    } catch (err) {
      recordError('register', err);
      console.warn('[Sync] register failed:', err.message);
    }
    return false;
  }

  /**
   * Schedule a delayed flush using exponential backoff.
   * @param {number} delayMs
   */
  function scheduleRetry(delayMs) {
    if (backoffTimer) clearTimeout(backoffTimer);
    if (delayMs <= 0) {
      flushSyncQueue();
      return;
    }
    console.log('[Sync] Retry scheduled in', delayMs, 'ms');
    backoffTimer = setTimeout(function () {
      backoffTimer = null;
      flushSyncQueue();
    }, delayMs);
  }

  async function persistItem(item) {
    if (item.type === 'progress') {
      try {
        localStorage.setItem('profBioProgress', JSON.stringify(item.payload));
      } catch (e) {
        var err = new Error('localStorage write failed for progress');
        err.cause = e;
        throw err;
      }
      if (typeof canUseCloud === 'function' && canUseCloud()) {
        try {
          await db.collection('users').doc(currentUser.uid).set(
            {
              progress: item.payload,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            { merge: true }
          );
        } catch (cloudErr) {
          cloudErr._localOk = true;
          throw cloudErr;
        }
      }
      return;
    }

    if (item.type === 'notes') {
      try {
        localStorage.setItem('profBioNotes', JSON.stringify(item.payload));
      } catch (e) {
        var err2 = new Error('localStorage write failed for notes');
        err2.cause = e;
        throw err2;
      }
      if (typeof canUseCloud === 'function' && canUseCloud()) {
        try {
          await db.collection('users').doc(currentUser.uid).set(
            {
              notes: item.payload,
              notesUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
            },
            { merge: true }
          );
        } catch (cloudErr) {
          cloudErr._localOk = true;
          throw cloudErr;
        }
      }
      return;
    }

    throw new Error('Unknown sync item type: ' + item.type);
  }

  /**
   * Flush queue with exponential backoff on failures.
   * @param {{force?: boolean}} [opts] force=true ignores retryAfter
   * @return {Promise<{flushed:number, failed:number, remaining:number, deferred:number}>}
   */
  async function flushSyncQueue(opts) {
    opts = opts || {};
    var result = { flushed: 0, failed: 0, remaining: 0, deferred: 0 };

    if (flushing) {
      console.log('[Sync] Flush already in progress');
      return result;
    }

    var queue = getSyncQueue();
    if (!queue.length) {
      updateSyncBadge();
      clearLastError();
      return result;
    }

    if (!navigator.onLine) {
      console.log('[Sync] Offline — keeping queue (' + queue.length + ')');
      result.remaining = queue.length;
      return result;
    }

    var now = Date.now();
    flushing = true;
    var remaining = [];
    var soonestRetry = Infinity;

    try {
      for (var i = 0; i < queue.length; i++) {
        var item = queue[i];

        // Honor backoff window unless forced (e.g. user tapped badge)
        if (!opts.force && item.retryAfter && item.retryAfter > now) {
          remaining.push(item);
          result.deferred++;
          if (item.retryAfter < soonestRetry) soonestRetry = item.retryAfter;
          continue;
        }

        try {
          await persistItem(item);
          result.flushed++;
          console.log('[Sync] Flushed', item.type);
        } catch (err) {
          result.failed++;
          item.attempts = (item.attempts || 0) + 1;
          item.lastError = (err && err.message) || String(err);
          item.lastAttemptAt = now;
          recordError(item.type, err);

          var retry = isRetryableError(err) && item.attempts < MAX_ATTEMPTS;

          if (err && err._localOk) {
            console.warn(
              '[Sync] Cloud sync failed for', item.type,
              '(local OK). attempt', item.attempts
            );
          } else {
            console.warn(
              '[Sync] Flush failed for', item.type,
              'attempt', item.attempts, err
            );
          }

          if (retry) {
            var delayMs = backoffDelay(item.attempts);
            item.retryAfter = Date.now() + delayMs;
            remaining.push(item);
            if (item.retryAfter < soonestRetry) soonestRetry = item.retryAfter;
            console.log(
              '[Sync] Backoff for', item.type,
              '→ retry in', delayMs, 'ms (attempt', item.attempts + ')'
            );
          } else {
            console.error(
              '[Sync] Dropping', item.type,
              'after', item.attempts, 'attempts'
            );
            showSyncToast('Could not sync ' + item.type + ' (gave up)', true);
          }
        }
      }

      setSyncQueue(remaining);
      result.remaining = remaining.length;
      updateSyncBadge();

      if (result.flushed && !result.remaining) {
        clearLastError();
        showSyncToast(
          result.flushed === 1
            ? 'Synced offline change'
            : 'Synced ' + result.flushed + ' offline changes'
        );
      } else if (result.remaining) {
        if (result.failed) {
          showSyncToast(
            result.remaining + ' change(s) will retry later',
            true
          );
        }
        // Schedule next attempt at earliest backoff
        if (soonestRetry !== Infinity) {
          scheduleRetry(Math.max(0, soonestRetry - Date.now()));
        }
        requestBackgroundSync();
      }
    } catch (fatal) {
      recordError('flush', fatal);
      console.error('[Sync] Fatal flush error', fatal);
      showSyncToast('Sync failed — will retry', true);
      scheduleRetry(backoffDelay(1));
      try {
        requestBackgroundSync();
      } catch (e) {}
    } finally {
      flushing = false;
    }

    return result;
  }

  function updateSyncBadge() {
    var n = getSyncQueue().length;
    var el = document.getElementById('syncPendingBadge');
    if (!n) {
      if (el) el.remove();
      return;
    }
    if (!el) {
      el = document.createElement('div');
      el.id = 'syncPendingBadge';
      el.setAttribute('role', 'status');
      el.style.cssText =
        'position:fixed;top:72px;right:12px;z-index:1100;background:#0f766e;color:#fff;' +
        'font-size:0.75rem;font-weight:600;padding:0.4rem 0.75rem;border-radius:99px;' +
        'box-shadow:0 2px 10px rgba(0,0,0,0.2);cursor:pointer;';
      el.title = 'Tap to retry sync now';
      el.addEventListener('click', function () {
        // Force ignores backoff window
        flushSyncQueue({ force: true });
      });
      document.body.appendChild(el);
    }
    var last = getLastError();
    var label =
      n === 1 ? '1 change waiting to sync' : n + ' changes waiting to sync';
    if (last && last.message) {
      label += ' · tap to retry';
    }
    el.textContent = label;
  }

  function showSyncToast(msg, isError) {
    var t = document.getElementById('syncToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'syncToast';
      t.style.cssText =
        'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:1100;' +
        'font-size:0.85rem;font-weight:600;padding:0.6rem 1rem;border-radius:12px;' +
        'box-shadow:0 4px 16px rgba(0,0,0,0.2);opacity:0;transition:opacity 0.3s;' +
        'max-width:90vw;text-align:center;';
      document.body.appendChild(t);
    }
    t.style.background = isError ? '#7f1d1d' : '#065f46';
    t.style.color = isError ? '#fee2e2' : '#ecfdf5';
    t.textContent = (isError ? '! ' : '\u2713 ') + msg;
    t.style.opacity = '1';
    setTimeout(function () {
      t.style.opacity = '0';
    }, isError ? 4000 : 2500);
  }

  function patchSavers() {
    if (typeof saveProgress === 'function' && !saveProgress._syncPatched) {
      var _origProgress = saveProgress;
      window.saveProgress = function (data) {
        try {
          _origProgress(data);
        } catch (e) {
          recordError('saveProgress', e);
          showSyncToast('Could not save progress', true);
          return;
        }
        if (!navigator.onLine) {
          enqueueSync('progress', data);
        } else if (
          typeof isFirebaseConfigured === 'function' &&
          isFirebaseConfigured() &&
          typeof canUseCloud === 'function' &&
          !canUseCloud()
        ) {
          enqueueSync('progress', data);
        }
      };
      window.saveProgress._syncPatched = true;
    }
    if (typeof saveNotes === 'function' && !saveNotes._syncPatched) {
      var _origNotes = saveNotes;
      window.saveNotes = function (notes) {
        try {
          _origNotes(notes);
        } catch (e) {
          recordError('saveNotes', e);
          showSyncToast('Could not save notes', true);
          return;
        }
        if (!navigator.onLine) {
          enqueueSync('notes', notes);
        } else if (
          typeof isFirebaseConfigured === 'function' &&
          isFirebaseConfigured() &&
          typeof canUseCloud === 'function' &&
          !canUseCloud()
        ) {
          enqueueSync('notes', notes);
        }
      };
      window.saveNotes._syncPatched = true;
    }
  }

  function initBackgroundSync() {
    try {
      patchSavers();
    } catch (e) {
      recordError('patch', e);
    }

    window.addEventListener('online', function () {
      console.log('[Sync] Online — flushing queue');
      // Online event: force attempt (user just regained connectivity)
      flushSyncQueue({ force: true }).catch(function (err) {
        recordError('online-flush', err);
      });
      requestBackgroundSync();
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', function (event) {
        if (!event.data) return;
        if (
          event.data.type === 'FLUSH_SYNC_QUEUE' ||
          event.data.type === 'SYNC_COMPLETE'
        ) {
          flushSyncQueue().catch(function (err) {
            recordError('sw-flush', err);
          });
        }
      });
    }

    if (navigator.onLine && getSyncQueue().length) {
      var queue = getSyncQueue();
      var when = nextRetryAt(queue);
      var delay = Math.max(0, when - Date.now());
      if (delay > 0) {
        scheduleRetry(delay);
      } else {
        flushSyncQueue().catch(function (err) {
          recordError('boot-flush', err);
        });
      }
    }
    updateSyncBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackgroundSync);
  } else {
    setTimeout(initBackgroundSync, 0);
  }

  window.BioHubSync = {
    enqueue: enqueueSync,
    flush: flushSyncQueue,
    request: requestBackgroundSync,
    queue: getSyncQueue,
    lastError: getLastError,
    backoffDelay: backoffDelay
  };
})();
