/* Professor Bio Hub – Background Sync client
 * Queues progress/notes while offline; flushes on reconnect or SW sync event.
 * Patches saveProgress / saveNotes after app.js loads.
 */
(function () {
  const SYNC_QUEUE_KEY = 'profBioSyncQueue';
  const SYNC_TAG = 'bio-hub-sync';

  function getSyncQueue() {
    try { return JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY) || '[]'); }
    catch (e) { return []; }
  }

  function setSyncQueue(queue) {
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }

  function enqueueSync(type, payload) {
    const queue = getSyncQueue().filter(function (item) { return item.type !== type; });
    queue.push({ type: type, payload: payload, queuedAt: Date.now() });
    setSyncQueue(queue);
    requestBackgroundSync();
    updateSyncBadge();
  }

  async function requestBackgroundSync() {
    if (!('serviceWorker' in navigator)) return false;
    try {
      var reg = await navigator.serviceWorker.ready;
      if ('sync' in reg) {
        await reg.sync.register(SYNC_TAG);
        console.log('[Sync] Background sync registered');
        return true;
      }
    } catch (err) {
      console.warn('[Sync] register failed:', err.message);
    }
    return false;
  }

  async function flushSyncQueue() {
    var queue = getSyncQueue();
    if (!queue.length) {
      updateSyncBadge();
      return;
    }
    if (!navigator.onLine) {
      console.log('[Sync] Still offline, keep queue');
      return;
    }

    var remaining = [];
    for (var i = 0; i < queue.length; i++) {
      var item = queue[i];
      try {
        if (item.type === 'progress') {
          localStorage.setItem('profBioProgress', JSON.stringify(item.payload));
          if (typeof canUseCloud === 'function' && canUseCloud()) {
            await db.collection('users').doc(currentUser.uid).set({
              progress: item.payload,
              updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          }
        } else if (item.type === 'notes') {
          localStorage.setItem('profBioNotes', JSON.stringify(item.payload));
          if (typeof canUseCloud === 'function' && canUseCloud()) {
            await db.collection('users').doc(currentUser.uid).set({
              notes: item.payload,
              notesUpdatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
          }
        }
        console.log('[Sync] Flushed', item.type);
      } catch (err) {
        console.warn('[Sync] Flush failed for', item.type, err.message);
        remaining.push(item);
      }
    }
    setSyncQueue(remaining);
    updateSyncBadge();
    if (!remaining.length) showSyncToast('Synced offline changes');
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
      el.style.cssText = 'position:fixed;top:72px;right:12px;z-index:1100;background:#0f766e;color:#fff;font-size:0.75rem;font-weight:600;padding:0.4rem 0.75rem;border-radius:99px;box-shadow:0 2px 10px rgba(0,0,0,0.2);';
      document.body.appendChild(el);
    }
    el.textContent = n === 1 ? '1 change waiting to sync' : n + ' changes waiting to sync';
  }

  function showSyncToast(msg) {
    var t = document.getElementById('syncToast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'syncToast';
      t.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);z-index:1100;background:#065f46;color:#ecfdf5;font-size:0.85rem;font-weight:600;padding:0.6rem 1rem;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.2);opacity:0;transition:opacity 0.3s;';
      document.body.appendChild(t);
    }
    t.textContent = '\u2713 ' + msg;
    t.style.opacity = '1';
    setTimeout(function () { t.style.opacity = '0'; }, 2500);
  }

  function patchSavers() {
    if (typeof saveProgress === 'function' && !saveProgress._syncPatched) {
      var _origProgress = saveProgress;
      window.saveProgress = function (data) {
        _origProgress(data);
        if (!navigator.onLine) enqueueSync('progress', data);
        else if (typeof isFirebaseConfigured === 'function' && isFirebaseConfigured() &&
                 typeof canUseCloud === 'function' && !canUseCloud()) {
          enqueueSync('progress', data);
        }
      };
      window.saveProgress._syncPatched = true;
    }
    if (typeof saveNotes === 'function' && !saveNotes._syncPatched) {
      var _origNotes = saveNotes;
      window.saveNotes = function (notes) {
        _origNotes(notes);
        if (!navigator.onLine) enqueueSync('notes', notes);
        else if (typeof isFirebaseConfigured === 'function' && isFirebaseConfigured() &&
                 typeof canUseCloud === 'function' && !canUseCloud()) {
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
        if (event.data && event.data.type === 'FLUSH_SYNC_QUEUE') {
          flushSyncQueue();
        }
      });
    }

    if (navigator.onLine && getSyncQueue().length) flushSyncQueue();
    updateSyncBadge();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackgroundSync);
  } else {
    // app.js may still be defining functions; defer one tick
    setTimeout(initBackgroundSync, 0);
  }

  window.BioHubSync = {
    enqueue: enqueueSync,
    flush: flushSyncQueue,
    request: requestBackgroundSync,
    queue: getSyncQueue
  };
})();
