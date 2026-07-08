const CACHE_NAME = 'reproductor-core-cache-v1';
const ASSETS_A_GUARDAR = [
  './',
  './index.html',
  './horizontal.jpg',
  './vertical.jpg'
];

// Instala y guarda el esqueleto visual en el navegador
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_A_GUARDAR);
    })
  );
});

// Intercepta las peticiones cuando no hay internet
self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((respuestaClonada) => {
      return respuestaClonada || fetch(e.request);
    })
  );
});