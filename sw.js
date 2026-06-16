// CTO-ConNect Safety Portal — Service Worker
// Enables PWA install prompt on Android Chrome
// Data lives in Firebase so no offline caching needed —
// this file exists purely to satisfy the PWA install criteria.

const CACHE_NAME = 'cto-safety-v1';

self.addEventListener('install', event => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network-first strategy — always fetch live, no stale data risk
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
