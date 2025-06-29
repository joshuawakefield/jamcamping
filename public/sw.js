/**
 * ===== JAMCAMPING SERVICE WORKER =====
 * 
 * This service worker provides Progressive Web App (PWA) functionality
 * for the JamCamping website. It enables offline access, background sync,
 * push notifications, and performance optimizations through intelligent caching.
 * 
 * SERVICE WORKER CAPABILITIES:
 * - Offline functionality with cache-first strategies
 * - Background synchronization for offline actions
 * - Push notifications for updates and deals
 * - Performance optimization through strategic caching
 * - Automatic cache management and cleanup
 * 
 * CACHING STRATEGY:
 * - Static Cache: Core app files (HTML, CSS, JS) cached indefinitely
 * - Dynamic Cache: API responses and user-generated content with TTL
 * - Network First: For real-time data that changes frequently
 * - Cache First: For static assets that rarely change
 * 
 * FESTIVAL USER BENEFITS:
 * - Works offline in areas with poor cell coverage (common at festivals)
 * - Faster loading through aggressive caching
 * - Background sync ensures actions complete when connection returns
 * - Push notifications for new projects and deals
 * 
 * BUSINESS BENEFITS:
 * - Increased engagement through offline access
 * - Reduced server load through client-side caching
 * - Better conversion rates with faster loading
 * - Re-engagement through push notifications
 * 
 * @version 1.0.0
 * @scope /
 */

/**
 * CACHE VERSION CONFIGURATION
 * 
 * Cache names include version numbers to enable proper cache invalidation.
 * When versions change, old caches are automatically cleaned up.
 */
const CACHE_NAME = 'jamcamping-v1.0.0';           // Main cache identifier
const STATIC_CACHE = 'jamcamping-static-v1.0.0';  // Static assets cache
const DYNAMIC_CACHE = 'jamcamping-dynamic-v1.0.0'; // Dynamic content cache

/**
 * STATIC FILES TO CACHE
 * 
 * Core application files that should be cached immediately when the
 * service worker is installed. These files enable basic offline functionality.
 * 
 * CACHE STRATEGY:
 * - Root path (/) for offline homepage access
 * - Core CSS and JavaScript for app functionality
 * - Essential data files for project and shop content
 * - PWA manifest for app installation
 * 
 * NOTE: Keep this list minimal to avoid slow initial cache population.
 * Additional files will be cached dynamically as users access them.
 */
const STATIC_FILES = [
  '/',                          // Homepage - essential for offline access
  '/css/style.css',            // Core styles - required for proper display
  '/js/main.js',               // Main application logic
  '/data/projects.json',       // Project data - core content
  '/data/shop.json',           // Shop data - core content
  '/manifest.json'             // PWA manifest - required for installation
];

/**
 * SERVICE WORKER INSTALL EVENT
 * 
 * Triggered when the service worker is first installed or updated.
 * Pre-caches essential files to enable immediate offline functionality.
 * 
 * INSTALL PROCESS:
 * 1. Open the static cache
 * 2. Add all static files to the cache
 * 3. Skip waiting to activate immediately (for updates)
 * 
 * ERROR HANDLING:
 * - If any file fails to cache, the entire installation fails
 * - This ensures the app only works offline if all essential files are available
 */
self.addEventListener('install', (event) => {
  console.log('🎪 JamCamping Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('✅ Static files cached successfully');
        // Skip waiting to activate the new service worker immediately
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Failed to cache static files:', error);
        throw error;
      })
  );
});

/**
 * SERVICE WORKER ACTIVATE EVENT
 * 
 * Triggered when the service worker becomes active (after installation).
 * Cleans up old caches and takes control of all open pages.
 * 
 * ACTIVATION PROCESS:
 * 1. Get list of all existing caches
 * 2. Delete caches that don't match current version
 * 3. Take control of all open pages immediately
 * 
 * CACHE CLEANUP:
 * - Removes outdated caches to free up storage space
 * - Ensures users get the latest version of cached content
 * - Prevents storage quota issues on mobile devices
 */
self.addEventListener('activate', (event) => {
  console.log('🚀 JamCamping Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        console.log('🧹 Cleaning up old caches...');
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete caches that don't match current version
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Cache cleanup complete');
        // Take control of all open pages immediately
        return self.clients.claim();
      })
      .catch((error) => {
        console.error('❌ Failed to activate service worker:', error);
        throw error;
      })
  );
});

/**
 * SERVICE WORKER FETCH EVENT
 * 
 * Intercepts all network requests and applies caching strategies.
 * This is the core of the offline functionality and performance optimization.
 * 
 * CACHING STRATEGIES:
 * - Navigation requests: Cache first with network fallback
 * - API requests: Network first with cache fallback
 * - Static assets: Cache first with network fallback
 * 
 * PERFORMANCE BENEFITS:
 * - Instant loading for cached resources
 * - Reduced server load and bandwidth usage
 * - Graceful degradation when offline
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  /**
   * NAVIGATION REQUEST HANDLING
   * 
   * For page navigation (when user clicks links or types URLs),
   * serve the cached homepage to enable offline browsing.
   * 
   * STRATEGY: Cache First
   * - Try to serve from cache first (instant loading)
   * - Fall back to network if not cached
   * - Fall back to cached homepage if network fails (offline)
   */
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/')
        .then((response) => {
          if (response) {
            console.log('📄 Serving navigation from cache');
            return response;
          }
          
          // Not in cache, try network
          return fetch(request)
            .then((networkResponse) => {
              console.log('🌐 Serving navigation from network');
              return networkResponse;
            })
            .catch(() => {
              // Network failed, serve cached homepage as fallback
              console.log('📱 Network failed, serving cached homepage');
              return caches.match('/');
            });
        })
    );
    return;
  }

  /**
   * API REQUEST HANDLING
   * 
   * For API requests (data fetching), prioritize fresh data
   * but provide cached fallback for offline scenarios.
   * 
   * STRATEGY: Network First
   * - Try network first for fresh data
   * - Cache successful responses for future offline use
   * - Fall back to cache if network fails
   */
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache successful API responses
          if (response.status === 200) {
            console.log('💾 Caching API response:', url.pathname);
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseClone);
              });
          }
          return response;
        })
        .catch(() => {
          // Network failed, try cache
          console.log('📦 Network failed, trying cache for:', url.pathname);
          return caches.match(request);
        })
    );
    return;
  }

  /**
   * STATIC ASSET HANDLING
   * 
   * For static assets (CSS, JS, images), prioritize cache
   * for instant loading and performance.
   * 
   * STRATEGY: Cache First
   * - Serve from cache immediately if available
   * - Fetch from network and cache if not available
   * - Provides best performance for static content
   */
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          console.log('⚡ Serving from cache:', url.pathname);
          return response;
        }

        // Not in cache, fetch from network
        return fetch(request)
          .then((response) => {
            // Don't cache non-successful responses or non-basic requests
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            console.log('💾 Caching new asset:', url.pathname);
            
            // Cache the response for future use
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => {
                cache.put(request, responseToCache);
              });

            return response;
          })
          .catch((error) => {
            console.error('❌ Failed to fetch:', url.pathname, error);
            throw error;
          });
      })
  );
});

/**
 * BACKGROUND SYNC EVENT
 * 
 * Handles background synchronization when the device comes back online.
 * Processes actions that were queued while offline (form submissions, etc.).
 * 
 * USE CASES:
 * - Project submissions while offline
 * - Cart updates that failed due to poor connection
 * - Analytics events that couldn't be sent
 * 
 * FESTIVAL SCENARIO:
 * User adds items to cart while in area with poor cell coverage.
 * When connection returns, background sync ensures cart is updated.
 */
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      handleBackgroundSync()
        .then(() => {
          console.log('✅ Background sync completed');
        })
        .catch((error) => {
          console.error('❌ Background sync failed:', error);
        })
    );
  }
});

/**
 * PUSH NOTIFICATION EVENT
 * 
 * Handles incoming push notifications from the server.
 * Displays notifications about new projects, deals, or updates.
 * 
 * NOTIFICATION CONTENT:
 * - New project announcements
 * - Seasonal deals and promotions
 * - Festival-specific content updates
 * - Community highlights and features
 * 
 * ENGAGEMENT STRATEGY:
 * - Festival-themed notification content
 * - Action buttons for immediate engagement
 * - Rich media support for visual appeal
 */
self.addEventListener('push', (event) => {
  console.log('📢 Push notification received');
  
  // Extract notification data or use default
  const notificationData = event.data ? event.data.json() : {};
  const title = notificationData.title || 'JamCamping';
  const body = notificationData.body || 'New festival projects available!';
  
  /**
   * NOTIFICATION OPTIONS
   * 
   * Comprehensive notification configuration for maximum engagement.
   */
  const options = {
    body: body,
    icon: '/icons/icon-192x192.png',        // App icon for branding
    badge: '/icons/badge-72x72.png',        // Small badge icon
    vibrate: [100, 50, 100],                // Vibration pattern for attention
    data: {
      dateOfArrival: Date.now(),            // Timestamp for analytics
      primaryKey: notificationData.id || 1, // Unique identifier
      url: notificationData.url || '/'      // Deep link destination
    },
    /**
     * ACTION BUTTONS
     * 
     * Interactive buttons that appear with the notification.
     * Provide immediate actions without opening the app.
     */
    actions: [
      {
        action: 'explore',
        title: 'Explore Projects',
        icon: '/icons/action-explore.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/action-close.png'
      }
    ],
    // Additional options for rich notifications
    requireInteraction: false,              // Auto-dismiss after timeout
    silent: false,                          // Play notification sound
    tag: 'jamcamping-update',              // Group similar notifications
    renotify: true                          // Show even if similar notification exists
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
      .then(() => {
        console.log('✅ Notification displayed successfully');
      })
      .catch((error) => {
        console.error('❌ Failed to show notification:', error);
      })
  );
});

/**
 * NOTIFICATION CLICK EVENT
 * 
 * Handles user interactions with push notifications.
 * Opens the app and navigates to relevant content.
 * 
 * CLICK ACTIONS:
 * - 'explore': Opens app to projects page
 * - 'close': Dismisses notification
 * - Default: Opens app to homepage or deep link
 */
self.addEventListener('notificationclick', (event) => {
  console.log('👆 Notification clicked:', event.action);
  
  // Close the notification
  event.notification.close();

  // Handle different action buttons
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/#projects')
        .then(() => {
          console.log('🎪 Opened projects page');
        })
    );
  } else if (event.action === 'close') {
    // Just close the notification (already done above)
    console.log('❌ Notification dismissed');
  } else {
    // Default action - open app to homepage or deep link
    const urlToOpen = event.notification.data?.url || '/';
    event.waitUntil(
      clients.openWindow(urlToOpen)
        .then(() => {
          console.log('🎪 Opened app:', urlToOpen);
        })
    );
  }
});

/**
 * BACKGROUND SYNC HANDLER
 * 
 * Processes queued offline actions when connection is restored.
 * Ensures user actions complete even if they were initiated offline.
 * 
 * OFFLINE ACTION TYPES:
 * - Form submissions (project submissions, contact forms)
 * - Cart updates (add/remove items)
 * - Analytics events (page views, interactions)
 * - User preferences (theme changes, favorites)
 * 
 * PROCESS:
 * 1. Retrieve queued actions from IndexedDB or localStorage
 * 2. Process each action by making appropriate API calls
 * 3. Remove successfully processed actions from queue
 * 4. Retry failed actions on next sync opportunity
 */
async function handleBackgroundSync() {
  console.log('🔄 Processing background sync...');
  
  try {
    // Retrieve offline actions from storage
    const offlineActions = await getOfflineActions();
    console.log(`📋 Found ${offlineActions.length} offline actions to process`);
    
    // Process each queued action
    for (const action of offlineActions) {
      try {
        console.log('⚙️ Processing action:', action.type);
        await processOfflineAction(action);
        await removeOfflineAction(action.id);
        console.log('✅ Action processed successfully:', action.id);
      } catch (error) {
        console.error('❌ Failed to process action:', action.id, error);
        // Leave failed actions in queue for retry on next sync
      }
    }
    
    console.log('🎉 Background sync completed successfully');
  } catch (error) {
    console.error('💥 Background sync failed:', error);
    throw error;
  }
}

/**
 * GET OFFLINE ACTIONS
 * 
 * Retrieves queued actions from local storage.
 * In a full implementation, this would use IndexedDB for better performance.
 * 
 * @returns {Promise<Array>} Array of offline actions to process
 */
async function getOfflineActions() {
  try {
    // In a real implementation, use IndexedDB for better performance
    const actions = localStorage.getItem('jamcamping-offline-actions');
    return actions ? JSON.parse(actions) : [];
  } catch (error) {
    console.error('Failed to retrieve offline actions:', error);
    return [];
  }
}

/**
 * PROCESS OFFLINE ACTION
 * 
 * Executes a specific offline action by making the appropriate API call.
 * 
 * @param {Object} action - The action object containing type and data
 * @returns {Promise} Promise that resolves when action is processed
 */
async function processOfflineAction(action) {
  switch (action.type) {
    /**
     * PROJECT SUBMISSION
     * 
     * Submits a project that was created while offline.
     */
    case 'submit_project':
      return fetch('/api/projects', {
        method: 'POST',
        body: JSON.stringify(action.data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    
    /**
     * CART UPDATE
     * 
     * Synchronizes cart changes that occurred while offline.
     */
    case 'update_cart':
      return fetch('/api/cart', {
        method: 'PUT',
        body: JSON.stringify(action.data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    
    /**
     * ANALYTICS EVENT
     * 
     * Sends analytics events that were queued while offline.
     */
    case 'analytics_event':
      return fetch('/api/analytics', {
        method: 'POST',
        body: JSON.stringify(action.data),
        headers: {
          'Content-Type': 'application/json'
        }
      });
    
    default:
      console.warn('Unknown offline action type:', action.type);
      return Promise.resolve();
  }
}

/**
 * REMOVE OFFLINE ACTION
 * 
 * Removes a successfully processed action from the offline queue.
 * 
 * @param {string} actionId - Unique identifier of the action to remove
 * @returns {Promise} Promise that resolves when action is removed
 */
async function removeOfflineAction(actionId) {
  try {
    const actions = await getOfflineActions();
    const filteredActions = actions.filter(action => action.id !== actionId);
    localStorage.setItem('jamcamping-offline-actions', JSON.stringify(filteredActions));
  } catch (error) {
    console.error('Failed to remove offline action:', error);
    throw error;
  }
}

/**
 * ERROR HANDLING
 * 
 * Global error handler for unhandled service worker errors.
 * Logs errors for debugging and monitoring.
 */
self.addEventListener('error', (event) => {
  console.error('🚨 Service Worker Error:', event.error);
});

/**
 * UNHANDLED REJECTION HANDLING
 * 
 * Catches unhandled promise rejections in the service worker.
 * Prevents silent failures and aids in debugging.
 */
self.addEventListener('unhandledrejection', (event) => {
  console.error('🚨 Unhandled Promise Rejection:', event.reason);
  event.preventDefault(); // Prevent the default browser behavior
});

/**
 * SERVICE WORKER LIFECYCLE LOGGING
 * 
 * Provides visibility into service worker state changes for debugging.
 */
console.log('🎪 JamCamping Service Worker: Script loaded and ready');
