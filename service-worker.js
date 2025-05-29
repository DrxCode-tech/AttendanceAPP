self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('adex-cache-v1').then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/signADEX.js',
        '/LoginADEX.html',
        '/LoginADEX.js',
        '/V2ADEX.html',
        '/V2ADEX.js',
        '/V2ADEX.css',
        '/AboutADEX.html',
        '/firebaseConfig.js',
        '/icon-192.png',
        '/icon-512.png',
        '/manifest.json'
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
