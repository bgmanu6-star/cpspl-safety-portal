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

// ============================================================
// PUSH NOTIFICATIONS (Firebase Cloud Messaging)
// Handles notifications that arrive while the app/tab is closed or in the
// background — this code runs separately from index.html's own JS, in the
// service worker's own context, which is why Firebase needs to be
// initialized again here with the same project config.
// ============================================================
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
    body: (payload.notification && payload.notification.body) || '',
    icon: 'icon-192.png',
    badge: 'icon-192.png'
  };
  self.registration.showNotification(title, options);
});

