const CACHE_NAME = 'timetracker-cache-v11';
const urlsToCache = [
  './',
  './app.html',
  './manifest.json',
  './app_icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  // Try network first, fallback to cache (ideal for PWA tracking app where API calls matter)
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
