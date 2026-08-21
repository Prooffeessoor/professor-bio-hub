/* Professor Bio Hub SW v7 – caching + background sync */
const VERSION = 'v7';
const SHELL_CACHE = `bio-hub-shell-${VERSION}`;
const DATA_CACHE = `bio-hub-data-${VERSION}`;
const RUNTIME_CACHE = `bio-hub-runtime-${VERSION}`;
const SYNC_TAG = 'bio-hub-sync';

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
  return req.mode === 'navigate' ||
    (req.method === 'GET' && req.headers.get('accept') &&
      req.headers.get('accept').includes('text/html'));
}

function isDataAsset(url) {
  return url.origin === self.location.origin &&
    url.pathname.includes('/data/') && url.pathname.endsWith('.js');
}

function isShellAsset(url) {
  if (url.origin !== self.location.origin) return false;
  const p = url.pathname;
  return /\/(app|sync|install|logo-inject|boot|nav|search|efficiency|sw)\.js$/.test(p) ||
    p.endsWith('/manifest.webmanifest') ||
    p.endsWith('/icon-192.svg') || p.endsWith('/icon-512.svg');
}

function isThirdPartyCacheable(url) {
  const h = url.hostname;
  return h === 'fonts.googleapis.com' || h === 'fonts.gstatic.com' || h === 'www.gstatic.com';
}

async function networkFirst(request, cacheName, fallback) {
  const cache = await caches.open(cacheName);
  try {
    const response = await fetch(request);
    if (response && response.ok) cache.put(request, response.clone());
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

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response && response.ok) cache.put(request, response.clone());
  return response;
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkPromise = fetch(request)
    .then((response) => {
      if (response && response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);
  return cached || (await networkPromise) || Response.error();
}

async function notifyClientsFlush() {
  const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clientsList) client.postMessage({ type: 'FLUSH_SYNC_QUEUE' });
  return clientsList.length;
}

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const shell = await caches.open(SHELL_CACHE);
    await shell.addAll(SHELL_ASSETS);
    const data = await caches.open(DATA_CACHE);
    await Promise.all(DATA_ASSETS.map((url) => data.add(url).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
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

  if (isNavigationRequest(request)) {
    event.respondWith(networkFirst(request, SHELL_CACHE, './index.html'));
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

self.addEventListener('sync', (event) => {
  if (event.tag === SYNC_TAG) event.waitUntil(notifyClientsFlush());
});

self.addEventListener('message', (event) => {
  if (!event.data) return;
  if (event.data.type === 'SKIP_WAITING') self.skipWaiting();
  if (event.data.type === 'REQUEST_SYNC') event.waitUntil(notifyClientsFlush());
});
