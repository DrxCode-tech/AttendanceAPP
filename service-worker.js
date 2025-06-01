const CACHE_NAME = 'adex-cache-v1';
const FILES_TO_CACHE = [
  '/',
  '/index.html',
  '/signADEX.js',
  '/LoginADEX.html',
  '/LoginADEX.js',
  '/V2ADEX.html',
  '/V2ADEX.js',
  '/V2ADEX.css',
  'review.html',
  'review.js',
  '/AboutADEX.html',
  '/firebaseConfig.js',
  '/icon-192.png',
  '/icon-512.png',
  '/manifest.json'
];

// Install event
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Install');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activate');
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
