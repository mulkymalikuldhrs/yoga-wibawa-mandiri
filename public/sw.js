// ============================================================
// Service Worker for YWM Dashboard PWA
// Caches static assets (cache-first), API calls (network-first)
// Handles offline fallback gracefully
// ============================================================

const CACHE_NAME = 'ywm-dashboard-v1';
const STATIC_CACHE = 'ywm-static-v1';
const API_CACHE = 'ywm-api-v1';

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
];

// API patterns for network-first strategy
const API_PATTERNS = [
  /\/api\//,
];

// Install event — pre-cache critical assets
self.addEventListener('install', (event) => {
  console.log('[YWM SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
      ]).catch((err) => {
        console.warn('[YWM SW] Pre-cache failed:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate event — clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[YWM SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== STATIC_CACHE && name !== API_CACHE)
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

  // API requests — Network First
  if (API_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    event.respondWith(networkFirst(request, API_CACHE));
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
async function networkFirst(request, cacheName) {
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
