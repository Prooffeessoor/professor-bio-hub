/* Professor Bio Hub – Background Sync client
 * Queue + flush with structured error handling for failures.
 */
(function () {
  var SYNC_QUEUE_KEY = 'profBioSyncQueue';
  var SYNC_ERROR_KEY = 'profBioSyncLastError';
  var SYNC_TAG = 'bio-hub-sync';
  var MAX_ATTEMPTS = 5;
  var flushing = false;

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

  /** Classify failures for retry vs permanent drop */
  function isRetryableError(err) {
    if (!err) return true;
    var name = err.name || '';
    var msg = (err.message || '').toLowerCase();
    // Network / transient
    if (name === 'TypeError' && msg.indexOf('fetch') !== -1) return true;
    if (name === 'NetworkError' || name === 'AbortError' || name === 'TimeoutError') return true;
    if (msg.indexOf('network') !== -1 || msg.indexOf('offline') !== -1) return true;
    if (msg.indexOf('unavailable') !== -1 || msg.indexOf('deadline') !== -1) return true;
    // Firebase auth not ready yet — retry
    if (msg.indexOf('permission') !== -1) return true;
    if (msg.indexOf('unauthenticated') !== -1) return true;
    return true; // default: retry until MAX_ATTEMPTS
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
        lastError: null
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
          // Local write succeeded; cloud failed — still treat as partial success
          // but rethrow so we retry cloud later
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
   * Flush queue with per-item error handling.
   * @return {Promise<{flushed:number, failed:number, remaining:number}>}
   */
  async function flushSyncQueue() {
    var result = { flushed: 0, failed: 0, remaining: 0 };

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

    flushing = true;
    var remaining = [];

    try {
      for (var i = 0; i < queue.length; i++) {
        var item = queue[i];
        try {
          await persistItem(item);
          result.flushed++;
          console.log('[Sync] Flushed', item.type);
        } catch (err) {
          result.failed++;
          item.attempts = (item.attempts || 0) + 1;
          item.lastError = (err && err.message) || String(err);
          item.lastAttemptAt = Date.now();
          recordError(item.type, err);

          var retry = isRetryableError(err) && item.attempts < MAX_ATTEMPTS;

          if (err && err._localOk) {
            // Local data is safe; keep retrying cloud only
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
            remaining.push(item);
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
      } else if (result.failed && result.remaining) {
        showSyncToast(
          result.remaining + ' change(s) will retry later',
          true
        );
        requestBackgroundSync();
      }
    } catch (fatal) {
      // Unexpected top-level failure — preserve full queue
      recordError('flush', fatal);
      console.error('[Sync] Fatal flush error', fatal);
      showSyncToast('Sync failed — will retry', true);
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
      el.title = 'Tap to retry sync';
      el.addEventListener('click', function () {
        flushSyncQueue();
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
      flushSyncQueue().catch(function (err) {
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
      flushSyncQueue().catch(function (err) {
        recordError('boot-flush', err);
      });
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
    lastError: getLastError
  };
})();
