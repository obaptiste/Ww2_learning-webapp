// Service Worker for WWII Battles Globe
// Version 1.0.0
// Implements stale-while-revalidate strategy for offline support

const CACHE_VERSION = 'wwii-globe-v1.0.0';
const CACHE_NAME = `${CACHE_VERSION}-static`;
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`;

// Files to cache immediately on install
const STATIC_ASSETS = [
  './',
  './index.html',
  './battles.json',
  './chapters.json',
  './i18n.json',
  // CDN resources will be cached on first access via runtime caching
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[Service Worker] Installed successfully');
        return self.skipWaiting(); // Activate immediately
      })
      .catch((error) => {
        console.error('[Service Worker] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete old caches that don't match current version
            if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
              console.log('[Service Worker] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[Service Worker] Activated successfully');
        console.log('[Service Worker] Offline ready!');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - implement stale-while-revalidate strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.open(RUNTIME_CACHE).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        // Fetch from network
        const fetchPromise = fetch(request)
          .then((networkResponse) => {
            // Cache the new response if it's valid
            if (networkResponse && networkResponse.status === 200) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch((error) => {
            console.log('[Service Worker] Fetch failed for:', request.url);
            // Return a custom offline response for HTML pages
            if (request.headers.get('accept').includes('text/html')) {
              return new Response(
                '<h1>Offline</h1><p>You are currently offline. Please check your internet connection.</p>',
                {
                  headers: { 'Content-Type': 'text/html' }
                }
              );
            }
            throw error;
          });
        
        // Stale-while-revalidate: return cached response immediately,
        // but update cache in background
        return cachedResponse || fetchPromise;
      });
    })
  );
});

// Message event - allow clients to trigger cache updates
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(RUNTIME_CACHE).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});

// Background sync for updating data (optional future enhancement)
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-battles') {
    event.waitUntil(
      fetch('./battles.json')
        .then((response) => response.json())
        .then((data) => {
          console.log('[Service Worker] Background sync completed');
          // Could store in IndexedDB here for offline access
        })
        .catch((error) => {
          console.error('[Service Worker] Background sync failed:', error);
        })
    );
  }
});

console.log('[Service Worker] Loaded');