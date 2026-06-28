// campusec Service Worker — v28-06-2026
// עדכון גרסה מאפס את כל ה-cache הישן

const CACHE_NAME = 'campusec-v28062026';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

// התקנה — מחק cache ישן, שמור חדש
self.addEventListener('install', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(key => caches.delete(key)))
    ).then(() =>
      caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    ).then(() => self.skipWaiting())
  );
});

// הפעלה — קח שליטה מיידית
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// בקשות — network first, cache fallback
self.addEventListener('fetch', event => {
  // אל תחסום בקשות Firebase
  if (event.request.url.includes('firebase') ||
      event.request.url.includes('googleapis') ||
      event.request.url.includes('gstatic')) {
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
