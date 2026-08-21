/* Professor Bio Hub – Background Sync client
 * Queues progress & notes while offline; flushes when:
 *  - Background Sync event fires (SW tag: bio-hub-sync)
 *  - Browser goes online
 *  - Page loads with pending queue
 */
(function () {
  var SYNC_QUEUE_KEY = 'profBioSyncQueue';
  var SYNC_TAG = 'bio-hub-sync';
  var flushing = false;

  function getSyncQueue() {
    try {
      return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]');
    } catch (e) {
      return [];
    }
  }

  function setSyncQueue(queue) {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  /**
   * Enqueue a payload (one entry per type — latest wins).
   * @param {'progress'|'notes'} type
   * @param {*} payload
   */
  function enqueueSync(type, payload) {
    var queue = getSyncQueue().filter(function (item) {
      return item.type !== type;
    });
    queue.push({
      type: type,
      payload: payload,
      queuedAt: Date.now(),
      attempts: 0
    });
    setSyncQueue(queue);
    requestBackgroundSync();
    updateSyncBadge();
  }

  /**
   * Register one-shot Background Sync with the service worker.
   * @return {Promise<boolean>}
   */
  async function requestBackgroundSync() {
    if (!('serviceWorker' in navigator)) return false;
    try {
      var reg = await navigator.serviceWorker.ready;
      if ('sync' in reg) {
        await reg.sync.register(SYNC_TAG);
        console.log('[Sync] Background Sync registered:', SYNC_TAG);
        return true;
      }
      // Fallback: ask SW to nudge clients when possible
      if (reg.active) {
        reg.active.postMessage({ type: 'REQUEST_SYNC' });
      }
    } catch (err) {
      console.warn('[Sync] register failed:', err.message);
    }
    return false;
  }

  /**
   * Persist a single queue item (local + optional Firebase).
   * @param {{type:string,payload:*,attempts?:number}} item
   */
  async function persistItem(item) {
    if (item.type === 'progress') {
      localStorage.setItem('profBioProgress', JSON.stringify(item.payload));
      if (typeof canUseCloud === 'function' && canUseCloud()) {
        await db.collection('users').doc(currentUser.uid).set(
          {
            progress: item.payload,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
          },
          { merge: true }
        );
      }
      return;
    }
    if (item.type === 'notes') {
      localStorage.setItem('profBioNotes', JSON.stringify(item.payload));
      if (typeof canUseCloud === 'function' && canUseCloud()) {
        await db.collection('users').doc(currentUser.uid).set(
          {
            notes: item.payload,
            notesUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
          },
          { merge: true }
        );
      }
    }
  }

  /**
   * Flush the offline queue. Safe to call multiple times.
   * @return {Promise<void>}
   */
  async function flushSyncQueue() {
    if (flushing) return;
    var queue = getSyncQueue();
    if (!queue.length) {
      updateSyncBadge();
      return;
    }
    if (!navigator.onLine) {
      console.log('[Sync] Offline — keeping queue (' + queue.length + ')');
      return;
    }

    flushing = true;
    var remaining = [];
    try {
      for (var i = 0; i < queue.length; i++) {
        var item = queue[i];
        try {
          await persistItem(item);
          console.log('[Sync] Flushed', item.type);
        } catch (err) {
          item.attempts = (item.attempts || 0) + 1;
          console.warn('[Sync] Flush failed', item.type, err.message);
          // Keep trying up to 5 attempts, then drop to avoid poison pills
          if (item.attempts < 5) remaining.push(item);
        }
      }
      setSyncQueue(remaining);
      updateSyncBadge();
      if (!remaining.length) {
        showSyncToast('Synced offline changes');
      } else {
        // Re-register so the browser retries later
        requestBackgroundSync();
      }
    } finally {
      flushing = false;
    }
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
        'box-shadow:0 2px 10px rgba(0,0,0,0.2);';
      document.body.appendChild(el);
    }
    el.textContent =
      n === 1 ? '1 change waiting to sync' : n + ' changes waiting to sync';
  }

  function showSyncToast(msg) {
    var t = document.getElementById('syncToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'syncToast';
      t.style.cssText =
        'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:1100;' +
        'background:#065f46;color:#ecfdf5;font-size:0.85rem;font-weight:600;' +
        'padding:0.6rem 1rem;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.2);' +
        'opacity:0;transition:opacity 0.3s;';
      document.body.appendChild(t);
    }
    t.textContent = '\u2713 ' + msg;
    t.style.opacity = '1';
    setTimeout(function () {
      t.style.opacity = '0';
    }, 2500);
  }

  function patchSavers() {
    if (typeof saveProgress === 'function' && !saveProgress._syncPatched) {
      var _origProgress = saveProgress;
      window.saveProgress = function (data) {
        _origProgress(data);
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
        _origNotes(notes);
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
    patchSavers();

    window.addEventListener('online', function () {
      console.log('[Sync] Online — flushing queue');
      flushSyncQueue();
      requestBackgroundSync();
    });

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', function (event) {
        if (!event.data) return;
        if (
          event.data.type === 'FLUSH_SYNC_QUEUE' ||
          event.data.type === 'SYNC_COMPLETE'
        ) {
          flushSyncQueue();
        }
      });
    }

    // Pending work from a previous session
    if (navigator.onLine && getSyncQueue().length) {
      flushSyncQueue();
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
    queue: getSyncQueue
  };
})();
