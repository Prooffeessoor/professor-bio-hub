/* Client helper: trigger background cache updates */
(function () {
  var LAST_KEY = 'profBioLastCacheUpdate';
  var MIN_INTERVAL_MS = 15 * 60 * 1000; // 15 minutes

  function canRun() {
    try {
      var last = parseInt(localStorage.getItem(LAST_KEY) || '0', 10);
      return Date.now() - last > MIN_INTERVAL_MS;
    } catch (e) {
      return true;
    }
  }

  function markRan() {
    try { localStorage.setItem(LAST_KEY, String(Date.now())); } catch (e) {}
  }

  /**
   * Ask the service worker to refresh shell + data caches in the background.
   * @param {{shellOnly?: boolean}} [opts]
   * @return {Promise<object|null>}
   */
  function requestCacheUpdate(opts) {
    opts = opts || {};
    if (!('serviceWorker' in navigator)) return Promise.resolve(null);
    return navigator.serviceWorker.ready.then(function (reg) {
      return new Promise(function (resolve) {
        var channel = new MessageChannel();
        channel.port1.onmessage = function (ev) {
          markRan();
          resolve(ev.data || null);
        };
        if (reg.active) {
          reg.active.postMessage(
            { type: 'UPDATE_CACHE', shellOnly: !!opts.shellOnly },
            [channel.port2]
          );
        } else {
          resolve(null);
        }
        // Also try Background Sync tag when supported
        if ('sync' in reg) {
          reg.sync.register('bio-hub-bg-update').catch(function () {});
        }
        // Safety timeout if SW does not reply
        setTimeout(function () { resolve(null); }, 5000);
      });
    }).catch(function () { return null; });
  }

  function onCacheUpdatedMessage(event) {
    if (!event.data || event.data.type !== 'CACHE_UPDATED') return;
    markRan();
    console.log('[Cache] Background update', event.data);
  }

  function init() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', onCacheUpdatedMessage);
    }

    window.addEventListener('online', function () {
      if (canRun()) requestCacheUpdate();
    });

    // After load, idle refresh
    function idleUpdate() {
      if (!navigator.onLine || !canRun()) return;
      requestCacheUpdate();
    }

    if ('requestIdleCallback' in window) {
      requestIdleCallback(idleUpdate, { timeout: 8000 });
    } else {
      setTimeout(idleUpdate, 5000);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.BioHubCache = { update: requestCacheUpdate };
})();
