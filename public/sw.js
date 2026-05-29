// ============================================================
// Service Worker for YWM Dashboard PWA
// Updated: 2026-05-29 — Enhanced caching, push notification support
// Caches static assets (cache-first), API calls (network-first)
// Supports push notifications infrastructure
// Handles offline fallback gracefully
// ============================================================

const CACHE_NAME = 'ywm-dashboard-v2';
const STATIC_CACHE = 'ywm-static-v2';
const API_CACHE = 'ywm-api-v2';
const IMAGE_CACHE = 'ywm-images-v2';

// Static asset patterns to cache
const STATIC_PATTERNS = [
  /\.js$/,
  /\.css$/,
  /\.png$/,
  /\.jpg$/,
  /\.jpeg$/,
  /\.svg$/,
  /\.gif$/,
  /\.woff2?$/,
  /\.ttf$/,
  /\.eot$/,
  /\.ico$/,
  /\.webp$/,
  /\.json$/,
];

// API patterns for network-first strategy
const API_PATTERNS = [
  /\/api\//,
];

// Critical assets to pre-cache on install
const PRE_CACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/favicon.ico',
];

// Install event — pre-cache critical assets
self.addEventListener('install', (event) => {
  console.log('[YWM SW] Installing service worker v2...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(PRE_CACHE_URLS).catch((err) => {
        console.warn('[YWM SW] Pre-cache partial failure:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[YWM SW] Activating service worker v2...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE && name !== API_CACHE && name !== IMAGE_CACHE)
          .map((name) => {
            console.log('[YWM SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Skip waiting message handler
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
});

// Fetch event — route requests to appropriate strategy
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

  // Skip cross-origin requests except for fonts/CDN
  const isSameOrigin = url.origin === self.location.origin;
  const isFontOrCDN = /fonts\.googleapis\.com|fonts\.gstatic\.com|cdn\.jsdelivr\.net/.test(url.hostname);

  if (!isSameOrigin && !isFontOrCDN) {
    return;
  }

  // API requests — Network First with 30s cache
  if (API_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirst(request, API_CACHE, 30000));
    return;
  }

  // Image requests — Cache First with separate cache
  if (request.destination === 'image' || /\.(png|jpg|jpeg|svg|gif|webp|ico)$/.test(url.pathname)) {
    event.respondWith(cacheFirst(request, IMAGE_CACHE));
    return;
  }

  // Static assets — Cache First
  if (STATIC_PATTERNS.some((pattern) => pattern.test(url.pathname)) || isFontOrCDN) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }

  // HTML navigation requests — Network First with offline fallback
  if (request.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(networkFirstWithOfflineFallback(request));
    return;
  }

  // Default — Network First
  event.respondWith(networkFirst(request, CACHE_NAME));
});

// ── Cache First Strategy ──
async function cacheFirst(request, cacheName) {
  try {
    const cached = await caches.match(request);
    if (cached) {
      // Update cache in background (stale-while-revalidate)
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
    // Return a basic offline response for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"><rect fill="#1a1a2e" width="100" height="100"/><text fill="#ffffff40" font-size="12" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">Offline</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    return new Response('Offline', { status: 503, statusText: 'Offline' });
  }
}

// ── Network First Strategy ──
async function networkFirst(request, cacheName, maxAge) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      // Check cache age if maxAge is specified
      if (maxAge) {
        const dateHeader = cached.headers.get('date');
        if (dateHeader) {
          const cacheAge = Date.now() - new Date(dateHeader).getTime();
          if (cacheAge > maxAge) {
            // Cache is too old, return it anyway but mark as stale
            return cached;
          }
        }
      }
      return cached;
    }
    return new Response(JSON.stringify({ error: 'Anda sedang offline', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// ── Network First with Offline Fallback (for HTML) ──
async function networkFirstWithOfflineFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Fallback to cached index.html for SPA routing
    const fallback = await caches.match('/index.html');
    if (fallback) {
      return fallback;
    }

    return new Response(
      `<!DOCTYPE html>
      <html lang="id">
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>YWM Dashboard - Offline</title>
      <style>body{background:#0f0c29;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;text-align:center;padding:2rem}
      h1{font-size:1.5rem;margin-bottom:0.5rem}p{opacity:0.6}button{margin-top:1.5rem;padding:0.75rem 1.5rem;background:#0ea5e9;color:#fff;border:none;border-radius:0.75rem;cursor:pointer;font-size:1rem}
      button:hover{background:#0284c7}</style></head>
      <body><div><h1>📡 Anda Sedang Offline</h1><p>YWM Dashboard memerlukan koneksi internet untuk berfungsi penuh.</p>
      <button onclick="window.location.reload()">Coba Lagi</button></div></body></html>`,
      { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    );
  }
}

// ── Fetch and update cache in background (stale-while-revalidate helper) ──
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

// ── Push Notification Handler ──
self.addEventListener('push', (event) => {
  console.log('[YWM SW] Push notification received');

  let data = {
    title: 'YWM Dashboard',
    body: 'Anda memiliki notifikasi baru.',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    tag: 'ywm-notification',
    data: {
      url: '/',
    },
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

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification Click Handler ──
self.addEventListener('notificationclick', (event) => {
  console.log('[YWM SW] Notification clicked:', event.action);
  event.notification.close();

  if (event.action === 'dismiss') return;

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If there's already a window open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Otherwise open a new window
      return self.clients.openWindow(urlToOpen);
    })
  );
});

// ── Push Subscription Change Handler ──
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('[YWM SW] Push subscription changed');
  // In a real implementation, you would send the new subscription to your server
  event.waitUntil(
    Promise.resolve().then(() => {
      console.log('[YWM SW] Subscription update needed - implement server endpoint');
    })
  );
});
