const CACHE_NAME = 'greetprompt-v2.1.0';

const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
  '/scenes/ganesha_royal.jpg',
  '/scenes/ganesha_gold.jpg',
  '/scenes/ganesha_modak.jpg',
  '/scenes/ganesha_temple.jpg',
  '/scenes/diwali_palace.jpg',
  '/scenes/diwali_diyas.jpg',
  '/scenes/diwali_rangoli.jpg',
  '/scenes/diwali_lakshmi.jpg',
  '/scenes/gm_krishna.jpg',
  '/scenes/gm_chai.jpg',
  '/scenes/gm_sunrise.jpg',
  '/scenes/bday_cake.jpg',
  '/scenes/newyear_fireworks.jpg',
];

// Install Event: Pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-caching offline assets');
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[Service Worker] Pre-cache partial error:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event: Cache-first for images & fonts, Network-first for API
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Do not intercept non-GET or cross-origin API calls that aren't assets
  if (event.request.method !== 'GET') return;

  // Handle Static Scene Images & Fonts (Cache-first for instant 0ms load)
  if (
    url.pathname.startsWith('/scenes/') ||
    url.hostname.includes('fonts.googleapis.com') ||
    url.hostname.includes('fonts.gstatic.com')
  ) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          }
          return response;
        });
      })
    );
    return;
  }

  // Handle API Requests (Network-first with timeout)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request);
      })
    );
    return;
  }

  // Handle Navigation & App Shell (Network-first, fallback to cache)
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        }
        return response;
      })
      .catch(() => {
        return caches.match(event.request).then((cached) => {
          return cached || caches.match('/');
        });
      })
  );
});
