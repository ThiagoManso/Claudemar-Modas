/**
 * SERVICE WORKER - CRM CLAUDEMAR MODAS (PWA)
 * Permite que o web app seja instalado como aplicativo na tela inicial do Android/iOS.
 */

const CACHE_NAME = 'crm-claudemar-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Passa requisições direto para a rede, garantindo que o Firebase/Firestore esteja sempre sincronizado
  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});
