// sw.js - Service Worker do Multiversando

const CACHE_NAME = 'multiversando-offline-v1';
const OFFLINE_URL = 'offline.html';
const PRECACHE_URLS = [
  '/',
  '/offline.html',
  
];

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        // Cache da página offline e recursos essenciais
        return cache.addAll([OFFLINE_URL, ...PRECACHE_URLS]);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', (event) => {
  // Limpeza de caches antigos
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptar requisições de navegação
self.addEventListener('fetch', (event) => {
  // Somente para requisições de navegação (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          // Se falhar, retorna a página offline
          return caches.match(OFFLINE_URL);
        })
    );
  } else {
    // Para outros recursos, usa cache primeiro
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});