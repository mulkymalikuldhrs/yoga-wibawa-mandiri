// ============================================================
// Service Worker for YWM Dashboard PWA
// Updated: 2026-03-04 — v3: Enhanced caching, offline fallback, navigation preload
// Strategies:
//   - Static assets (JS/CSS/fonts): Cache-First with stale-while-revalidate
//   - Images: Cache-First with SVG offline fallback
//   - API calls: Network-First with 30s timeout
//   - HTML navigation: Network-First with offline.html fallback
// Supports: Push notifications, navigation preload, offline page
// ============================================================

const CACHE_VERSION = 'v3';
const CACHE_NAME = `ywm-dashboard-${CACHE_VERSION}`;
const STATIC_CACHE = `ywm-static-${CACHE_VERSION}`;
const API_CACHE = `ywm-api-${CACHE_VERSION}`;
const IMAGE_CACHE = `ywm-images-${CACHE_VERSION}`;

// All cache names for cleanup
const ALL_CACHES = [CACHE_NAME, STATIC_CACHE, API_CACHE, IMAGE_CACHE];

// Static asset patterns to cache (cache-first)
const STATIC_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.eot$/,
  /\.ico$/,
];

// Image patterns to cache (cache-first with offline SVG fallback)
const IMAGE_PATTERNS = [
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.svg$/,
  /\.gif$/,
  /\.webp$/,
];

// API patterns for network-first strategy
const API_PATTERNS = [
  /\/api\//,
];

// CDN origins allowed for caching
const ALLOWED_CDN_ORIGINS = [
  'fonts.googleapis.com',
  'fonts.gstatic.com',
  'cdn.jsdelivr.net',
];

// Critical assets to pre-cache on install
const PRE_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-192-maskable.png',
  '/icon-512-maskable.png',
  '/favicon.ico',
  '/offline.html',
];

// Network request timeout (3 seconds for network-first)
const NETWORK_TIMEOUT = 3000;

// ─── Install Event ──────────────────────────────────────────
self.addEventListener('install', (event) => {
  console.log('[YWM SW] Installing service worker v3...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      // Cache critical assets individually so one failure doesn't block others
      return Promise.allSettled(
        PRE_CACHE_URLS.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[YWM SW] Failed to pre-cache:', url, err);
          })
        )
      );
    })
  );
  self.skipWaiting();
});

// ─── Activate Event ─────────────────────────────────────────
self.addEventListener('activate', (event) => {
  console.log('[YWM SW] Activating service worker v3...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => !ALL_CACHES.includes(name))
          .map((name) => {
            console.log('[YWM SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      // Enable navigation preload if supported
      if (self.registration.navigationPreload) {
        return self.registration.navigationPreload.enable();
      }
    })
  );
  self.clients.claim();
});

// ─── Message Handler ────────────────────────────────────────
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[YWM SW] Skip waiting requested');
    self.skipWaiting();
  }

  // Cache a specific URL on demand
  if (event.data && event.data.type === 'CACHE_URL') {
    const { url, cacheName } = event.data;
    const targetCache = cacheName || STATIC_CACHE;
    caches.open(targetCache).then((cache) => {
      cache.add(url).catch(() => {});
    });
  }

  // Get cache status
  if (event.data && event.data.type === 'GET_CACHE_STATUS') {
    Promise.all(
      ALL_CACHES.map((name) =>
        caches.open(name).then((cache) => cache.keys().then((keys) => ({ name, count: keys.length })))
      )
    ).then((status) => {
      event.ports[0]?.postMessage({ type: 'CACHE_STATUS', status });
    });
  }
});

// ─── Fetch Event ────────────────────────────────────────────
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip non-http(s) requests (chrome-extension, etc.)
  if (!url.protocol.startsWith('http')) return;

  // Determine origin type
  const isSameOrigin = url.origin === self.location.origin;
  const isCDN = ALLOWED_CDN_ORIGINS.some((origin) => url.hostname.endsWith(origin));

  // Skip cross-origin requests that aren't from allowed CDNs
  if (!isSameOrigin && !isCDN) return;

  // Route to appropriate strategy
  if (API_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    // API requests — Network First with timeout
    event.respondWith(networkFirstWithTimeout(request, API_CACHE, NETWORK_TIMEOUT));
    return;
  }

  if (request.destination === 'image' || IMAGE_PATTERNS.some((p) => p.test(url.pathname))) {
    // Image requests — Cache First with offline SVG fallback
    event.respondWith(cacheFirstWithImageFallback(request, IMAGE_CACHE));
    return;
  }

  if (STATIC_PATTERNS.some((pattern) => pattern.test(url.pathname)) || (isCDN && !url.pathname.endsWith('.html'))) {
    // Static assets (JS, CSS, fonts) — Cache First with background revalidation
    event.respondWith(staleWhileRevalidate(request, STATIC_CACHE));
    return;
  }

  if (request.mode === 'navigate' || (isSameOrigin && url.pathname.endsWith('.html'))) {
    // HTML navigation — Network First with offline.html fallback
    event.respondWith(navigationHandler(request));
    return;
  }

  // Default — try network, fall back to cache
  event.respondWith(networkFirstWithTimeout(request, CACHE_NAME, NETWORK_TIMEOUT));
});

// ─── Navigation Handler (with preload support) ─────────────
async function navigationHandler(request) {
  try {
    // Use navigation preload if available
    if (self.registration.navigationPreload) {
      const preloadResponse = await request.preloadResponse;
      if (preloadResponse) {
        // Cache the preloaded response
        const cache = await caches.open(CACHE_NAME);
        cache.put(request, preloadResponse.clone());
        return preloadResponse;
      }
    }

    // Normal network request
    const response = await fetchWithTimeout(request, NETWORK_TIMEOUT);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Try cache first
    const cached = await caches.match(request);
    if (cached) return cached;

    // Fallback to cached index.html for SPA routing
    const indexFallback = await caches.match('/index.html');
    if (indexFallback) return indexFallback;

    // Last resort: offline.html page
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) return offlinePage;

    // Absolute fallback (inline)
    return new Response(
      `<!DOCTYPE html><html lang="id"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>YWM - Offline</title><style>body{background:#1a1a2e;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}h1{font-size:1.5rem;margin-bottom:.5rem}p{opacity:.5}</style></head><body><div><h1>📡 Offline</h1><p>YWM Dashboard memerlukan koneksi internet.</p></div></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

// ─── Cache-First with Image Fallback ───────────────────────
async function cacheFirstWithImageFallback(request, cacheName) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      // Background revalidation
      fetchAndCache(request, cacheName);
      return cached;
    }

    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    // Return a transparent SVG placeholder for images
    if (request.destination === 'image' || IMAGE_PATTERNS.some((p) => new URL(request.url).pathname.match(p))) {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#1a1a2e" width="200" height="200" rx="12"/><text fill="#ffffff30" font-size="14" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" font-family="sans-serif">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

// ─── Stale-While-Revalidate ────────────────────────────────
async function staleWhileRevalidate(request, cacheName) {
  const cached = await caches.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        const cache = caches.open(cacheName);
        cache.then((c) => c.put(request, response.clone()));
      }
      return response;
    })
    .catch(() => cached);

  // Return cached immediately if available, otherwise wait for network
  return cached || fetchPromise;
}

// ─── Network-First with Timeout ────────────────────────────
async function networkFirstWithTimeout(request, cacheName, timeout) {
  try {
    const response = await fetchWithTimeout(request, timeout);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) return cached;

    // API responses return JSON error
    if (API_PATTERNS.some((p) => new URL(request.url).pathname.match(p))) {
      return new Response(
        JSON.stringify({ error: 'Anda sedang offline', offline: true }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

// ─── Fetch with Timeout ────────────────────────────────────
function fetchWithTimeout(request, timeout) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Network timeout')), timeout);
    fetch(request)
      .then((response) => {
        clearTimeout(timer);
        resolve(response);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

// ─── Background Fetch & Cache ──────────────────────────────
async function fetchAndCache(request, cacheName) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response);
    }
  } catch {
    // Silently fail — we already have the cached version
  }
}

// ─── Push Notification Handler ──────────────────────────────
self.addEventListener('push', (event) => {
  console.log('[YWM SW] Push notification received');

  let data = {
    title: 'YWM Dashboard',
    body: 'Anda memiliki notifikasi baru.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'ywm-notification',
    data: { url: '/' },
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    data: data.data,
    vibrate: [100, 50, 100],
    actions: [
      { action: 'open', title: 'Buka Dashboard' },
      { action: 'dismiss', title: 'Tutup' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

// ─── Notification Click Handler ─────────────────────────────
self.addEventListener('notificationclick', (event) => {
  console.log('[YWM SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      return self.clients.openWindow(urlToOpen);
    })
  );
});

// ─── Push Subscription Change Handler ──────────────────────
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[YWM SW] Push subscription changed');
  event.waitUntil(
    Promise.resolve().then(() => {
      console.log('[YWM SW] Subscription update needed - implement server endpoint');
    })
  );
});
