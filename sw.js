// CTO-ConNect Safety Portal — Service Worker v2
// Enables PWA install + handles push notifications in the background.

const CACHE_NAME = 'cto-safety-v2';

self.addEventListener('install', event => {
  self.skipWaiting(); // activate immediately, never block page load
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Network-first strategy — always fetch live, no stale data risk
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

// ============================================================
// PUSH NOTIFICATIONS — Firebase Cloud Messaging background handler.
// importScripts is wrapped in try/catch so that if the Firebase CDN
// is temporarily unreachable the service worker still installs and
// activates normally (no more "loading forever" caused by a blocked
// importScripts call at the top level of the file).
// ============================================================
try {
  importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey: "AIzaSyDSfDVHm4v1-wakACAhlWzjwvz9GLKxcBE",
    authDomain: "cpspl-safety-portal.firebaseapp.com",
    projectId: "cpspl-safety-portal",
    storageBucket: "cpspl-safety-portal.firebasestorage.app",
    messagingSenderId: "222167051757",
    appId: "1:222167051757:web:9c3dd4db151a89b5d9cbe4"
  });

  const messaging = firebase.messaging();

  messaging.onBackgroundMessage(payload => {
    const title = (payload.notification && payload.notification.title) || 'CTO-ConNect Safety Portal';
    const options = {
      body:  (payload.notification && payload.notification.body) || '',
      icon:  'icon-192.png',
      badge: 'icon-192.png'
    };
    self.registration.showNotification(title, options);
  });
} catch (err) {
  // Firebase CDN unavailable — push notifications won't work but the
  // rest of the app is completely unaffected.
  console.warn('FCM service worker setup failed:', err);
}
