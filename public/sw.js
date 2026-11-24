/// SCRIPE Service Worker — Static-Only Public Shell Cache (SW-01 Hardened)
/// Security Invariant: NEVER cache "/api/*", "?_rsc=", cross-origin requests,
/// authenticated requests, HTML navigations, or private/no-store responses.

const CACHE_VERSION = "scripe-v3-static-only";
const STATIC_CACHE = `${CACHE_VERSION}-static`;

// Offline fallback shell & public static branding only (never "/" which may 307-redirect or carry SSR state)
const APP_SHELL = ["/manifest.json", "/brand/app-logo-1024.png", "/offline.html"];

function hasNoStoreOrPrivateCacheHeader(response) {
  const cc = (response.headers.get("cache-control") || "").toLowerCase();
  return cc.includes("no-store") || cc.includes("private");
}

function isCacheablePublicResponse(response) {
  return (
    Boolean(response) &&
    response.ok &&
    response.status === 200 &&
    response.type === "basic" &&
    !hasNoStoreOrPrivateCacheHeader(response) &&
    !response.headers.has("set-cookie")
  );
}

function isStaticAssetPathname(pathname) {
  if (pathname.startsWith("/_next/data/") || pathname.startsWith("/api/")) {
    return false;
  }
  return /\.(js|css|png|jpg|jpeg|svg|webp|avif|ico|woff2?)$/i.test(pathname);
}

// Install: Pre-cache strictly public offline assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: Purge all legacy/dynamic caches (including scripe-v2-relay-dynamic)
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Message: Explicit cache purge hook on logout / tenant-switch
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCRIPE_PURGE_CACHES") {
    event.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE)
            .map((key) => caches.delete(key))
        )
      )
    );
  }
});

// Fetch: Same-origin static assets & offline navigation fallback ONLY
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // Never intercept cross-origin requests (e.g. https://api.scripe.org)
  if (url.origin !== self.location.origin) return;

  // Never intercept or cache API routes, Next.js RSC flight payloads, or Authorization-bearing calls
  if (
    url.pathname.startsWith("/api/") ||
    url.searchParams.has("_rsc") ||
    request.headers.has("authorization")
  ) {
    return;
  }

  // Navigation (HTML pages) -> Network only, static /offline.html fallback when offline
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(async () => {
        const fallback = await caches.match("/offline.html");
        return fallback || new Response("Offline", { status: 503 });
      })
    );
    return;
  }

  // Immutable font files -> Cache-first in STATIC_CACHE
  if (url.pathname.startsWith("/fonts/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Same-origin static assets -> Stale-while-revalidate in STATIC_CACHE
  if (isStaticAssetPathname(url.pathname)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (isCacheablePublicResponse(response)) {
      const cache = await caches.open(STATIC_CACHE);
      await cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("", { status: 503 });
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(STATIC_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request)
    .then(async (response) => {
      if (isCacheablePublicResponse(response)) {
        await cache.put(request, response.clone());
      }
      return response;
    })
    .catch(() => cached || new Response("", { status: 503 }));

  return cached || fetchPromise;
}
