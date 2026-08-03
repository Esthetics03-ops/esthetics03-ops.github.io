const CACHE_NAME = 'esthetics-cache-v1';
const PRECACHE_URLS = [
  '/',
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(clients.claim());
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (url.origin === location.origin) {
    event.respondWith(
      caches.match(event.request).then(cached => {
        return cached || fetch(event.request).then(resp => {
          return caches.open(CACHE_NAME).then(cache => {
            if (event.request.method === 'GET' && resp && resp.status === 200) {
              cache.put(event.request, resp.clone());
            }
            return resp;
          });
        });
      })
    );
  } else {
    event.respondWith(fetch(event.request));
  }
});
