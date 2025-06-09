const CACHE_NAME = 'adex-cache-v3';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/signADEX.js',
  '/LoginADEX.html',
  '/LoginADEX.js',
  '/V2ADEX.html',
  '/V2ADEX.js',
  '/V2ADEX.css',
  '/review.html',
  '/review.js',
  '/AboutADEX.html',
  '/firebaseConfig.js',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Install event: cache files
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[ServiceWorker] Caching app shell');
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => self.skipWaiting()) // Activate immediately after install
  );
});

// Activate event: clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys()
      .then((keyList) => Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      ))
      .then(() => self.clients.claim()) // Take control of clients immediately
  );
});

// Fetch event: serve from cache first, then network fallback
self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          // Return cached response if found
          return cachedResponse;
        }
        // Otherwise fetch from network
        return fetch(event.request)
          .then((networkResponse) => {
            // Optionally cache new requests here if needed
            return networkResponse;
          });
      })
      .catch(() => {
        // Optional: return a fallback page/image for offline use
        // return caches.match('/offline.html');
      })
  );
});
