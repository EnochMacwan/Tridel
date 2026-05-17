/* sw.js — service worker that caches forcing-data JSONs as immutable assets.
 *
 * The chunked JSON files under /data/ are content-addressed per dataset
 * release: when the dataset is regenerated the bundle name changes. So we
 * can treat each successful response as forever-fresh. This eliminates the
 * network round-trip on repeat visits and back/forward scrubbing.
 *
 * Scope is the page root; the worker only intercepts requests under /data/
 * that end in .json. Everything else (HTML, CSS, JS, basemap tiles) falls
 * through to the browser's normal cache.
 *
 * The manifest (`data/currents.json`) is mutable across releases — its
 * list of chunks and time axis can change — so it is served network-first
 * and only falls back to the cache when offline. Chunk files are still
 * served cache-first (immutable per release).
 */
const CACHE_VERSION = "v3";
const CACHE_NAME = `hormuz-forcing-${CACHE_VERSION}`;
const DATA_PATTERN = /\/data\/.*\.json(?:\?|$)/;
const MANIFEST_PATTERN = /\/data\/currents\.json(?:\?|$)/;

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    /* Drop any older cache versions to free disk. */
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (!DATA_PATTERN.test(url.pathname)) return;
  const isManifest = MANIFEST_PATTERN.test(url.pathname);

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);

    /* Manifest is mutable per dataset release — try the network first so a
       redeploy reaches returning users. Fall back to the cache on offline. */
    if (isManifest) {
      try {
        const fresh = await fetch(event.request, { cache: "no-cache" });
        if (fresh.ok) cache.put(event.request, fresh.clone()).catch(() => {});
        return fresh;
      } catch (err) {
        const fallback = await cache.match(event.request);
        if (fallback) return fallback;
        throw err;
      }
    }

    /* Chunk files are immutable per release. Cache-first; only hit the
       network on a miss. Don't strip query strings — if the manifest
       cache-busts a chunk URL via `?v=…` it must miss and re-fetch. */
    const cached = await cache.match(event.request);
    if (cached) return cached;
    try {
      const fresh = await fetch(event.request);
      /* Only cache opaque-safe, ok responses. Opaque cross-origin (type
         "opaque", status 0) is intentionally skipped — caching them
         disables offline fallback because every match looks empty. */
      if (fresh.ok && fresh.type !== "opaque") {
        cache.put(event.request, fresh.clone()).catch(() => {});
      }
      return fresh;
    } catch (err) {
      const fallback = await cache.match(event.request);
      if (fallback) return fallback;
      throw err;
    }
  })());
});
