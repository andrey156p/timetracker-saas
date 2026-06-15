const CACHE_NAME = 'timetracker-cache-v12';
const urlsToCache = [
  './',
  './app.html',
  './manifest.json',
  './app_icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener('push', event => {
  let data = {};
  try {
    if(event.data) data = event.data.json();
  } catch(e){}
  
  const title = data.title || 'TimeTracker SaaS';
  const options = {
    body: data.body || 'У вас новое уведомление',
    icon: './app_icon.png',
    badge: './app_icon.png'
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.matchAll({type: 'window'}).then(clientsArr => {
    if (clientsArr.length) {
        return clientsArr[0].focus();
    } else {
        return clients.openWindow('/');
    }
  }));
});
