/// NEXORA Service Worker — P5.1
/// Cache Strategy: App shell (cache-first), API (network-first), Assets (stale-while-revalidate)

const CACHE_VERSION = 'nexora-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;

// App shell — cached on install
const APP_SHELL = [
  '/',
  '/manifest.json',
  '/app-logo.png',
  '/offline.html',
];

// Install: Pre-cache app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(APP_SHELL);
    })
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Strategy per request type
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // API requests → Network-first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Font files → Cache-first (immutable)
  if (url.pathname.startsWith('/fonts/')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Static assets (JS, CSS, images) → Stale-while-revalidate
  if (isStaticAsset(request)) {
    event.respondWith(staleWhileRevalidate(request));
    return;
  }

  // Navigation (HTML pages) → Network-first, offline fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match('/offline.html'))
    );
    return;
  }

  // Everything else → Network with cache fallback
  event.respondWith(networkFirst(request));
});

// --- Strategies ---

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || new Response('{}', {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('', { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached);

  return cached || fetchPromise;
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return /\.(js|css|png|jpg|jpeg|svg|webp|avif|ico|woff2?)$/i.test(url.pathname);
}
