/**
 * ===== JAMCAMPING SERVICE WORKER =====
 * 
 * Updated service worker for reliable PWA functionality.
 * 
 * KEY CHANGES & IMPROVEMENTS:
 * - Version bumped to force full cache refresh and clear old/stale caches
 * - Removed hardcoded unhashed file list (prevents requesting old main.js/style.css)
 * - Runtime caching: Cache-first for all same-origin assets (including hashed JS/CSS)
 * - Aggressive old cache cleanup on activate
 * - Simplified strategies while preserving offline support
 * - Network-first fallback removed for non-existent /api/ paths
 * - Push & sync handlers preserved but simplified (they are optional and safe)
 * - Better offline fallback to cached index.html
 * 
 * SERVICE WORKER CAPABILITIES:
 * - Full offline access with instant loading of cached assets
 * - Automatic cache updates on new deploys
 * - Reliable handling of Vite's hashed assets
 * - Graceful offline experience at festivals with poor connectivity
 * 
 * CACHING STRATEGY:
 * - Cache-first for all site assets (JS, CSS, JSON, images, fonts)
 * - Runtime caching ensures new hashed files are cached on first load
 * - Network fallback only when truly needed
 * - Offline fallback to root index.html
 * 
 * @version 3.0.0
 * @scope /
 */

const CACHE_VERSION = 'jamcamping-v3.0.0';
const CACHE_NAME = `jamcamping-cache-${CACHE_VERSION}`;

/**
 * INSTALL EVENT
 * 
 * On install, skip waiting to activate immediately.
 * No pre-caching of specific files - we rely on runtime caching for hashed assets.
 */
self.addEventListener('install', (event) => {
  console.log('🎪 JamCamping Service Worker: Installing new version...');
  
  event.waitUntil(
    // Open the new cache (empty for now)
    caches.open(CACHE_NAME)
      .then(() => {
        console.log('✅ New cache created');
        return self.skipWaiting();
      })
  );
});

/**
 * ACTIVATE EVENT
 * 
 * Cleans up ALL old caches and claims clients immediately.
 * This ensures no stale assets (old main.js, style.css) are ever served again.
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 JamCamping Service Worker: Activating new version...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('🧹 Cleaning up old caches...');
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
        console.log('✅ Cache cleanup complete');
        return self.clients.claim();
      })
  );
});

/**
 * FETCH EVENT
 * 
 * Core caching strategy: Cache-first for same-origin requests.
 * - Serve from cache instantly if available
 * - Otherwise fetch from network and cache the response
 * - Offline: serve cached version or fallback to index.html
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only cache same-origin requests (ignore external APIs/CDNs if needed)
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('⚡ Serving from cache:', url.pathname);
            return cachedResponse;
          }

          // Not cached - fetch from network
          return fetch(request)
            .then((networkResponse) => {
              // Cache successful responses (skip large/external if desired)
              if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    console.log('💾 Caching new asset:', url.pathname);
                    cache.put(request, responseClone);
                  });
              }
              return networkResponse;
            })
            .catch(() => {
              // Offline fallback for navigation requests
              if (request.mode === 'navigate') {
                console.log('📱 Offline - serving fallback index.html');
                return caches.match('/');
              }
              throw new Error('Offline and no cache');
            });
        })
    );
  }
});

/**
 * BACKGROUND SYNC EVENT (preserved for future use)
 */
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  // Placeholder - extend when real offline actions are implemented
});

/**
 * PUSH NOTIFICATION EVENT (preserved for future use)
 */
self.addEventListener('push', (event) => {
  console.log('📢 Push notification received');
  
  const title = 'JamCamping';
  const options = {
    body: 'New festival projects and cosmic vibes await! 🎪',
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
 * NOTIFICATION CLICK EVENT (preserved)
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
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
});

console.log('🎪 JamCamping Service Worker: Ready (v3.0.0)');
