/* Professor Bio Hub – Service Worker */
const CACHE_NAME = 'bio-hub-v1';
const PRECACHE = [
  './',
  './index.html',
  './app.js',
  './manifest.webmanifest',
  './icon-192.svg',
  './icon-512.svg',
  './data/chapters.js',
  './data/flashcards.js',
  './data/quizzes.js',
  './data/practicals.js',
  './data/waecQuestions.js',
  './data/waecTheoryQuestions.js',
  './data/waecPracticalQuestions.js',
  './data/jambQuestions.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req)
        .then((res) => {
          if (!res || res.status !== 200 || res.type === 'opaque') return res;
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => cached);
      return cached || fetched;
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
