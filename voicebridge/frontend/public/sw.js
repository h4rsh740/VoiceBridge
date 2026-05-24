const CACHE_NAME = 'voicebridge-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/vite.svg',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/index.css'
];

// Install Event - cache core static resources
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Activate Event - clear old caches
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
});

// Fetch Event - network first with cache fallback
self.addEventListener('fetch', (e) => {
  // Only handle GET requests and skip Chrome extensions or foreign domains
  if (e.request.method !== 'GET' || !e.request.url.startsWith(self.location.origin)) {
    return;
  }

  e.respondWith(
    fetch(e.request)
      .then((response) => {
        // Put a clone in cache if it's a successful response
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Fallback to cache if network is down
        return caches.match(e.request);
      })
  );
});
