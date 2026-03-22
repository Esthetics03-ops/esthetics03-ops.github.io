const CACHE_NAME = 'esthetics-hub-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/g1.png',
  '/manifest.json'
  // Add other CSS or JS files here
];

// Install the service worker and cache assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
