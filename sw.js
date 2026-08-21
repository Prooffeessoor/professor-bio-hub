/* Professor Bio Hub – Service Worker v10
 * Navigation Preload + background cache updates
 */
const VERSION = 'v10';
const SHELL_CACHE = `bio-hub-shell-${VERSION}`;
const DATA_CACHE = `bio-hub-data-${VERSION}`;
const RUNTIME_CACHE = `bio-hub-runtime-${VERSION}`;
const SYNC_TAG = 'bio-hub-sync';
const BG_UPDATE_TAG = 'bio-hub-bg-update';

const RUNTIME_MAX_ENTRIES = 32;
const PRELOAD_WAIT_MS = 800;
const NAV_TIMEOUT_MS = 2800;
/** Stagger between background fetches (ms) to avoid bursts */
const BG_FETCH_GAP_MS = 80;

const SHELL_ASSETS = [
  './', './index.html', './app.js', './sync.js', './install.js',
  './logo-inject.js', './boot.js', './nav.js', './search.js', './efficiency.js',
  './manifest.webmanifest', './icon-192.svg', './icon-512.svg'
];

const DATA_ASSETS = [
  './data/chapters.js', './data/flashcards.js', './data/quizzes.js',
  './data/practicals.js', './data/waecQuestions.js', './data/waecTheoryQuestions.js',
  './data/waecPracticalQuestions.js', './data/jambQuestions.js',
  './data/extraTopics.js'
];

let bgUpdateRunning = false;

function isNavigationRequest(req) {
  return (
    req.mode === 'navigate' ||
    (req.method === 'GET' && (req.headers.get('accept') || '').includes('text/html'))
  );
}

function isDataAsset(url) {
  return (
    url.origin === self.location.origin &&
    url.pathname.includes('/data/') &&
    url.pathname.endsWith('.js')
  );
}

function isShellAsset(url) {
  if (url.origin !== self.location.origin) return false;
  const p = url.pathname;
  return (
    /\/(app|sync|install|logo-inject|boot|nav|search|efficiency)\.js$/.test(p) ||
    p.endsWith('/manifest.webmanifest') ||
    p.endsWith('/icon-192.svg') ||
    p.endsWith('/icon-512.svg')
  );
}

function isThirdPartyCacheable(url) {
  const h = url.hostname;
  return (
    h === 'fonts.googleapis.com' ||
    h === 'fonts.gstatic.com' ||
    h === 'www.gstatic.com'
  );
}

function canCache(response) {
  return !!(response && response.status === 200 &&
    (response.type === 'basic' || response.type === 'cors'));
}

async function putInCache(cacheName, request, response) {
  if (!canCache(response)) return false;
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    if (cacheName === RUNTIME_CACHE) await trimCache(cacheName, RUNTIME_MAX_ENTRIES);
    return true;
  } catch (e) {
    return false;
  }
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  for (let i = 0; i < keys.length - maxEntries; i++) {
    await cache.delete(keys[i]);
  }
}

function timeoutPromise(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(null), ms));
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function fetchWithTimeout(request, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

/**
 * Background update: re-fetch shell + data into caches without blocking UI.
 * Returns { updated, failed } counts.
 */
async function backgroundCacheUpdate(options) {
  options = options || {};
  if (bgUpdateRunning) {
    return { updated: 0, failed: 0, skipped: true };
  }
  bgUpdateRunning = true;
  let updated = 0;
  let failed = 0;

  try {
    const shellList = options.shellOnly ? SHELL_ASSETS : SHELL_ASSETS;
    const dataList = options.shellOnly ? [] : DATA_ASSETS;

    const shell = await caches.open(SHELL_CACHE);
    for (const url of shellList) {
      try {
        const res = await fetch(url, { cache: 'no-cache' });
        if (canCache(res)) {
          await shell.put(url, res.clone());
          updated++;
        } else {
          failed++;
        }
      } catch (e) {
        failed++;
      }
      await delay(BG_FETCH_GAP_MS);
    }

    if (dataList.length) {
      const data = await caches.open(DATA_CACHE);
      for (const url of dataList) {
        try {
          const res = await fetch(url, { cache: 'no-cache' });
          if (canCache(res)) {
            await data.put(url, res.clone());
            updated++;
          } else {
            failed++;
          }
        } catch (e) {
          failed++;
        }
        await delay(BG_FETCH_GAP_MS);
      }
    }

    // Notify open pages
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of clientsList) {
      client.postMessage({
        type: 'CACHE_UPDATED',
        updated: updated,
        failed: failed,
        version: VERSION
      });
    }

    console.log('[SW] Background cache update done', { updated, failed });
    return { updated, failed, skipped: false };
  } finally {
    bgUpdateRunning = false;
  }
}

/** Update a single request in the background (used by strategies). */
function backgroundRefresh(request, cacheName) {
  return fetch(request, { cache: 'no-cache' })
    .then((res) => putInCache(cacheName, request, res))
    .catch(() => false);
}

async function handleNavigation(event) {
  const request = event.request;
  const cache = await caches.open(SHELL_CACHE);

  const cachedPromise = Promise.all([
    cache.match(request),
    cache.match('./index.html'),
    cache.match('./')
  ]).then(([a, b, c]) => a || b || c || null);

  const preloadPromise = (async () => {
    try {
      if (!event.preloadResponse) return null;
      return await event.preloadResponse;
    } catch (e) {
      return null;
    }
  })();

  const preloadOrTimeout = Promise.race([
    preloadPromise,
    timeoutPromise(PRELOAD_WAIT_MS)
  ]);

  const [preload, cached] = await Promise.all([preloadOrTimeout, cachedPromise]);

  if (preload && preload.ok) {
    putInCache(SHELL_CACHE, request, preload);
    putInCache(SHELL_CACHE, new Request('./index.html'), preload);
    return preload;
  }

  if (cached) {
    event.waitUntil(
      (async () => {
        try {
          const late = await preloadPromise;
          if (late && late.ok) {
            await putInCache(SHELL_CACHE, request, late);
            await putInCache(SHELL_CACHE, new Request('./index.html'), late);
            return;
          }
        } catch (e) {}
        await backgroundRefresh(request, SHELL_CACHE);
      })()
    );
    return cached;
  }

  try {
    const latePreload = await preloadPromise;
    if (latePreload && latePreload.ok) {
      putInCache(SHELL_CACHE, request, latePreload);
      putInCache(SHELL_CACHE, new Request('./index.html'), latePreload);
      return latePreload;
    }
  } catch (e) {}

  try {
    const response = await fetchWithTimeout(request, NAV_TIMEOUT_MS);
    if (canCache(response)) {
      putInCache(SHELL_CACHE, request, response);
      putInCache(SHELL_CACHE, new Request('./index.html'), response);
    }
    return response;
  } catch (err) {
    const fallback =
      (await cache.match('./index.html')) ||
      (await cache.match('./'));
    if (fallback) return fallback;
    throw err;
  }
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    // Fire-and-forget background update
    backgroundRefresh(request, cacheName);
    return cached;
  }
  const response = await fetch(request);
  if (canCache(response)) await putInCache(cacheName, request, response);
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request, { cache: 'no-cache' })
    .then(async (response) => {
      await putInCache(cacheName, request, response);
      return response;
    })
    .catch(() => null);
  if (cached) return cached;
  return (await networkPromise) || Response.error();
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    await Promise.all(
      SHELL_ASSETS.map((url) =>
        shell.add(url).catch((e) => console.warn('[SW] shell skip', url, e))
      )
    );
    const data = await caches.open(DATA_CACHE);
    await Promise.all(
      DATA_ASSETS.map((url) =>
        data.add(url).catch((e) => console.warn('[SW] data skip', url, e))
      )
    );
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    if (self.registration.navigationPreload) {
      try {
        await self.registration.navigationPreload.enable();
        if (self.registration.navigationPreload.setHeaderValue) {
          await self.registration.navigationPreload.setHeaderValue('bio-hub-preload');
        }
      } catch (err) {}
    }
    const allow = new Set([SHELL_CACHE, DATA_CACHE, RUNTIME_CACHE]);
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !allow.has(k)).map((k) => caches.delete(k)));
    await self.clients.claim();
    // Quiet background refresh after takeover
    backgroundCacheUpdate().catch(() => {});
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (request.headers.get('range')) return;

  if (isNavigationRequest(request)) {
    event.respondWith(handleNavigation(event));
    return;
  }

  if (isDataAsset(url)) {
    event.respondWith(cacheFirst(request, DATA_CACHE));
    return;
  }

  if (isShellAsset(url)) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  if (isThirdPartyCacheable(url)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
  }
});

/* Background Sync: offline queue flush OR full cache refresh */
self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) {
    event.waitUntil(notifyClientsFlush());
  }
  if (event.tag === BG_UPDATE_TAG) {
    event.waitUntil(backgroundCacheUpdate());
  }
});

async function notifyClientsFlush() {
  const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clientsList) {
    client.postMessage({ type: 'FLUSH_SYNC_QUEUE' });
  }
  return clientsList.length;
}

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'REQUEST_SYNC') {
    event.waitUntil(notifyClientsFlush());
  }
  if (event.data.type === 'UPDATE_CACHE') {
    event.waitUntil(
      backgroundCacheUpdate({ shellOnly: !!event.data.shellOnly }).then((result) => {
        if (event.ports && event.ports[0]) {
          event.ports[0].postMessage(result);
        }
      })
    );
  }
});
