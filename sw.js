/* Professor Bio Hub – Service Worker v8
 * Includes Navigation Preload for faster document loads
 *
 * Navigation Preload starts the network request for HTML in parallel
 * with service worker startup, then we use event.preloadResponse.
 */
const VERSION = 'v8';
const SHELL_CACHE = `bio-hub-shell-${VERSION}`;
const DATA_CACHE = `bio-hub-data-${VERSION}`;
const RUNTIME_CACHE = `bio-hub-runtime-${VERSION}`;
const SYNC_TAG = 'bio-hub-sync';

const RUNTIME_MAX_ENTRIES = 32;
const NAV_TIMEOUT_MS = 2800;

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
  if (!canCache(response)) return;
  try {
    const cache = await caches.open(cacheName);
    await cache.put(request, response.clone());
    if (cacheName === RUNTIME_CACHE) await trimCache(cacheName, RUNTIME_MAX_ENTRIES);
  } catch (e) {}
}

async function trimCache(cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  for (let i = 0; i < keys.length - maxEntries; i++) {
    await cache.delete(keys[i]);
  }
}

function fetchWithTimeout(request, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(request, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

async function networkFirst(request, cacheName, fallbackUrl, timeoutMs) {
  const cache = await caches.open(cacheName);
  try {
    const response = timeoutMs
      ? await fetchWithTimeout(request, timeoutMs)
      : await fetch(request);
    if (canCache(response)) await cache.put(request, response.clone());
    return response;
  } catch (err) {
    const cached =
      (await cache.match(request)) ||
      (fallbackUrl ? await cache.match(fallbackUrl) : null) ||
      (await cache.match('./index.html')) ||
      (await cache.match('./'));
    if (cached) return cached;
    throw err;
  }
}

/**
 * Handle navigations with Navigation Preload when available.
 * Flow: use preloadResponse if ready → else network-first with timeout → cache.
 */
async function handleNavigation(event) {
  const request = event.request;

  // 1) Prefer the preloaded response (started in parallel with SW boot)
  try {
    const preload = await event.preloadResponse;
    if (preload) {
      putInCache(SHELL_CACHE, request, preload);
      return preload;
    }
  } catch (e) {
    console.warn('[SW] preloadResponse failed', e);
  }

  // 2) Normal network-first with timeout + offline fallback
  return networkFirst(request, SHELL_CACHE, './index.html', NAV_TIMEOUT_MS);
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) {
    fetch(request)
      .then((res) => { if (canCache(res)) cache.put(request, res.clone()); })
      .catch(() => {});
    return cached;
  }
  const response = await fetch(request);
  if (canCache(response)) await cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then(async (response) => {
      if (canCache(response)) {
        await cache.put(request, response.clone());
        if (cacheName === RUNTIME_CACHE) await trimCache(cacheName, RUNTIME_MAX_ENTRIES);
      }
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
      SHELL_ASSETS.map((url) => shell.add(url).catch((e) => console.warn('[SW] shell skip', url, e)))
    );
    const data = await caches.open(DATA_CACHE);
    await Promise.all(
      DATA_ASSETS.map((url) => data.add(url).catch((e) => console.warn('[SW] data skip', url, e)))
    );
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    // Enable Navigation Preload (Chrome / Edge / supported browsers)
    if (self.registration.navigationPreload) {
      try {
        await self.registration.navigationPreload.enable();
        // Optional header so the server could vary response; GitHub Pages ignores it safely
        if (self.registration.navigationPreload.setHeaderValue) {
          await self.registration.navigationPreload.setHeaderValue('bio-hub-preload');
        }
        console.log('[SW] Navigation Preload enabled');
      } catch (err) {
        console.warn('[SW] Navigation Preload enable failed', err);
      }
    }

    const allow = new Set([SHELL_CACHE, DATA_CACHE, RUNTIME_CACHE]);
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => !allow.has(k)).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;
  if (request.headers.get('range')) return;

  // Navigations → Navigation Preload path
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

async function notifyClientsFlush() {
  const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clientsList) {
    client.postMessage({ type: 'FLUSH_SYNC_QUEUE' });
  }
  return clientsList.length;
}

self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) event.waitUntil(notifyClientsFlush());
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'REQUEST_SYNC') event.waitUntil(notifyClientsFlush());
});
