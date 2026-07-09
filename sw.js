const CACHE_NAME = 'reproductor-core-cache-v1';
const ASSETS_A_GUARDAR = [
  './',
  './index.html',
  './horizontal.jpg',
  './vertical.jpg'
];

// 1. Instala y guarda el esqueleto visual limpio
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_A_GUARDAR);
    })
  );
  self.skipWaiting(); // Fuerza a la app a usar el nuevo código de inmediato
});

// 2. Limpia cachés antiguas si cambias el nombre de la versión
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Intercepta peticiones de forma inteligente
self.addEventListener('fetch', (e) => {
  // EXCLUSIÓN: Si la petición es para Supabase (API) o archivos de audio externos, NO usar caché.
  // Ir directamente a internet para que la música y la base de datos funcionen en tiempo real.
  if (e.request.url.includes('supabase.co') || e.request.url.includes('.mp3') || e.request.destination === 'audio') {
    e.respondWith(fetch(e.request));
    return;
  }

  // Estrategia Network-First para tus archivos locales (index.html, imágenes):
  // Intenta buscar lo más nuevo en GitHub. Si no hay internet, usa lo guardado en caché.
  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Si la respuesta es válida, actualizamos la caché en segundo plano
        if (response.status === 200 && ASSETS_A_GUARDAR.some(asset => e.request.url.includes(asset.replace('./', '')))) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Si falla internet (offline), entregamos lo que está en caché
        return caches.match(e.request);
      })
  );
});
