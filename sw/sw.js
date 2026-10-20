/* SommeilEnOr service worker — build __BUILD_ID__.
 *
 * Caches only the application shell so the app can open and show its
 * disconnected state. It never intercepts /api requests or non-GET requests:
 * journal writes are online-only and are never queued or replayed.
 */
const CACHE = "sommeilenor-shell-__BUILD_ID__";
const SHELL = ["/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Network first, cached shell as fallback.
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok && (request.mode === "navigate" || url.pathname.startsWith("/assets/"))) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request.mode === "navigate" ? "/" : request, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(request.mode === "navigate" ? "/" : request).then((cached) => cached || Response.error()),
      ),
  );
});
