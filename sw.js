/* Professor Bio Hub – Service Worker (optimized caching)
 *
 * Strategies:
 * - Navigation / HTML: network-first → offline fallback to cached index
 * - App shell (app.js, manifest, icons): stale-while-revalidate
 * - Course data (/data/*.js): cache-first (large, rarely changes)
 * - Third-party (fonts, Firebase CDN): stale-while-revalidate in runtime cache
 */

const VERSION = 'v3';
const SHELL_CACHE = `bio-hub-shell-${VERSION}`;
const DATA_CACHE = `bio-hub-data-${VERSION}`;
const RUNTIME_CACHE = `bio-hub-runtime-${VERSION}`;

const SHELL_ASSETS = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest',
  './icon-192.svg',
  './icon-512.svg'
];

const DATA_ASSETS = [
  './data/chapters.js',
  './data/flashcards.js',
  './data/quizzes.js',
  './data/practicals.js',
  './data/waecQuestions.js',
  './data/waecTheoryQuestions.js',
  './data/waecPracticalQuestions.js',
  './data/jambQuestions.js'
];

/** @param {Request} req */
function isNavigationRequest(req) {
  return req.mode === 'navigate' ||
    (req.method === 'GET' && req.headers.get('accept') && req.headers.get('accept').includes('text/html'));
}

/** @param {URL} url */
function isDataAsset(url) {
  return url.origin === self.location.origin && url.pathname.includes('/data/') && url.pathname.endsWith('.js');
}

/** @param {URL} url */
function isShellAsset(url) {
  if (url.origin !== self.location.origin) return false;
  const path = url.pathname;
  return (
    path.endsWith('/app.js') ||
    path.endsWith('/manifest.webmanifest') ||
    path.endsWith('/icon-192.svg') ||
    path.endsWith('/icon-512.svg') ||
    path.endsWith('/sw.js')
  );
}

/** @param {URL} url */
function isThirdPartyCacheable(url) {
  const host = url.hostname;
  return (
    host === 'fonts.googleapis.com' ||
    host === 'fonts.gstatic.com' ||
    host === 'www.gstatic.com'
  );
}

/**
 * Network-first: try network, fall back to cache, then offline page.
 * @param {Request} request
 * @param {string} cacheName
 * @param {Request|string} [fallback]
 */
async function networkFirst(request, cacheName, fallback) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    if (fallback) {
      const fb = await cache.match(fallback);
      if (fb) return fb;
    }
    throw err;
  }
}

/**
 * Cache-first: serve cache if present, else network and store.
 * @param {Request} request
 * @param {string} cacheName
 */
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

/**
 * Stale-while-revalidate: return cache immediately, refresh in background.
 * @param {Request} request
 * @param {string} cacheName
 */
async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => null);
  return cached || (await networkPromise) || Response.error();
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const shell = await caches.open(SHELL_CACHE);
      await shell.addAll(SHELL_ASSETS);
      const data = await caches.open(DATA_CACHE);
      // Precache data individually so one failure does not abort all
      await Promise.all(
        DATA_ASSETS.map((url) =>
          data.add(url).catch((err) => console.warn('Precache skip:', url, err))
        )
      );
      await self.skipWaiting();
    })()
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const allow = new Set([SHELL_CACHE, DATA_CACHE, RUNTIME_CACHE]);
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !allow.has(k)).map((k) => caches.delete(k))
      );
      await self.clients.claim();
    })()
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Ignore non-http(s) and browser extensions
  if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

  // HTML navigations → network-first + offline index fallback
  if (isNavigationRequest(request)) {
    event.respondWith(networkFirst(request, SHELL_CACHE, './index.html'));
    return;
  }

  // Course data scripts → cache-first (fast offline, rare updates)
  if (isDataAsset(url)) {
    event.respondWith(cacheFirst(request, DATA_CACHE));
    return;
  }

  // App shell scripts / icons / manifest → SWR
  if (isShellAsset(url)) {
    event.respondWith(staleWhileRevalidate(request, SHELL_CACHE));
    return;
  }

  // Same-origin other assets (e.g. future images)
  if (url.origin === self.location.origin) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // Fonts + Firebase CDN → SWR in runtime cache
  if (isThirdPartyCacheable(url)) {
    event.respondWith(staleWhileRevalidate(request, RUNTIME_CACHE));
    return;
  }

  // Everything else: network only (no cache pollution)
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
