/* Numiva service worker
   Cache-first for the app shell, with a versioned cache name so that
   bumping CACHE_NAME is enough to trigger the update flow in index.html
   (registration.waiting -> "A new version of Numiva is ready" toast). */

const CACHE_NAME = 'numiva-v2';
const APP_SHELL = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './browserconfig.xml',
  './favicon.ico',
  './icons/icon-16.png',
  './icons/icon-32.png',
  './icons/icon-48.png',
  './icons/icon-57.png',
  './icons/icon-60.png',
  './icons/icon-70.png',
  './icons/icon-72.png',
  './icons/icon-76.png',
  './icons/icon-96.png',
  './icons/icon-114.png',
  './icons/icon-120.png',
  './icons/icon-128.png',
  './icons/icon-144.png',
  './icons/icon-150.png',
  './icons/icon-152.png',
  './icons/icon-167.png',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-256.png',
  './icons/icon-384.png',
  './icons/icon-512.png',
  './icons/icon-512-maskable.png',
  './icons/mstile-150.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.allSettled(
        // allSettled so a single missing/renamed asset (e.g. an icon that
        // hasn't been added yet) doesn't fail the whole install step.
        APP_SHELL.map((url) => cache.add(url).catch((err) => {
          console.warn('Numiva SW: could not cache', url, err);
        }))
      ))
  );
  // Don't auto-activate; wait for the page to explicitly ask via
  // SKIP_WAITING so the "Refresh" button in the update toast stays meaningful.
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;

  // Only handle same-origin GET requests; let everything else (POSTs,
  // cross-origin calls, etc.) pass straight through to the network.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((response) => {
          // Only cache successful, basic (same-origin) responses.
          if (response && response.status === 200 && response.type === 'basic') {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          }
          return response;
        })
        .catch(() => {
          // Offline fallback: for navigations, prefer the cached app shell;
          // if even that isn't cached yet (e.g. very first visit was
          // offline), fall back to the dedicated offline page.
          if (req.mode === 'navigate') {
            return caches.match('./index.html').then((shell) => shell || caches.match('./offline.html'));
          }
          return undefined;
        });
    })
  );
});
