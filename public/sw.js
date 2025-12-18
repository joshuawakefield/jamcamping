/**
 * ===== JAMCAMPING SERVICE WORKER =====
 * 
 * Fully updated service worker to resolve caching issues with Vite hashed assets.
 * 
 * KEY FIXES & IMPROVEMENTS:
 * - Version bumped to v4.0.0 for complete cache invalidation
 * - Navigation requests (HTML pages): Network-first to always get fresh index.html with updated hashed asset references
 * - Static assets (JS, CSS, JSON, images): Cache-first for performance, with runtime caching of new hashed files
 * - Aggressive cleanup: Delete ALL old caches on activate
 * - No hardcoded STATIC_FILES list (prevents requesting obsolete unhashed paths like main.js/style.css)
 * - Offline fallback to cached root for navigation when truly offline
 * - Simplified and robust strategies to prevent stale asset requests and 404s/cancels
 * - Preserved push/sync placeholders for future expansion
 * 
 * SERVICE WORKER CAPABILITIES:
 * - Reliable updates: Fresh HTML on every navigation after deploy
 * - Instant loading of cached assets
 * - Full offline support for festival environments
 * - Handles Vite's asset hashing perfectly
 * 
 * CACHING STRATEGY:
 * - Navigation (HTML): Network-first → cache update → fallback to cached root offline
 * - Everything else (same-origin): Cache-first → network fallback → cache new
 * 
 * @version 4.0.0
 * @scope /
 */

const CACHE_VERSION = 'jamcamping-v4.0.0';
const CACHE_NAME = `jamcamping-cache-${CACHE_VERSION}`;

/**
 * INSTALL EVENT
 * 
 * Open new cache and skip waiting for immediate activation.
 */
self.addEventListener('install', (event) => {
  console.log('🎪 JamCamping Service Worker: Installing v4.0.0...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('✅ New cache opened');
        // Optionally pre-cache root for faster initial offline, but fetched fresh anyway
        return cache.add('/');
      })
      .then(() => self.skipWaiting())
  );
});

/**
 * ACTIVATE EVENT
 * 
 * Delete all old caches and claim clients.
 * Ensures no stale caches interfere with new version.
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 JamCamping Service Worker: Activating v4.0.0...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ All old caches removed');
        return self.clients.claim();
      })
  );
});

/**
 * FETCH EVENT
 * 
 * Smart caching based on request type.
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests (HTML pages) - Network first for fresh content
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          // Cache the fresh response
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              console.log('💾 Caching fresh navigation:', url.pathname);
              cache.put(request, responseClone);
            });
          return networkResponse;
        })
        .catch(() => {
          // Offline - serve cached root
          console.log('📱 Offline navigation - serving cached root');
          return caches.match('/');
        })
    );
    return;
  }

  // All other requests (assets, JSON, etc.) - Cache first
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('⚡ Serving from cache:', url.pathname);
          return cachedResponse;
        }

        // Not cached - fetch and cache
        return fetch(request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  console.log('💾 Caching new asset:', url.pathname);
                  cache.put(request, responseClone);
                });
            }
            return networkResponse;
          })
          .catch((error) => {
            console.error('❌ Fetch failed:', url.pathname, error);
            throw error;
          });
      })
  );
});

/**
 * BACKGROUND SYNC EVENT (placeholder for future offline actions)
 */
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  // Implement real sync logic when needed
});

/**
 * PUSH NOTIFICATION EVENT (placeholder)
 */
self.addEventListener('push', (event) => {
  console.log('📢 Push notification received');

  const title = 'JamCamping Update';
  const options = {
    body: 'New cosmic builds and festival magic await! 🎪',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    tag: 'jamcamping-update'
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

/**
 * NOTIFICATION CLICK EVENT
 */
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked');
  event.notification.close();

  event.waitUntil(
    clients.openWindow('/')
  );
});

/**
 * GLOBAL ERROR HANDLING
 */
self.addEventListener('error', (event) => {
  console.error('🚨 Service Worker Error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Rejection:', event.reason);
});

console.log('🎪 JamCamping Service Worker v4.0.0 loaded and ready');
