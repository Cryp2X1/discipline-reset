/* Discipline Reset — conservative service worker for the static SPA export.
 * All URLs are resolved against the registration scope, so this works both at
 * the domain root and under a GitHub Pages project path like /discipline-reset/.
 * Hashed /_expo/static assets are cache-first (safe: filenames change on each build).
 * HTML and everything else is network-first so a new deploy is picked up while online,
 * and the last cached copy still works offline.
 */
const STATIC_CACHE = 'discipline-reset-static-v1';
const SHELL_CACHE = 'discipline-reset-shell-v1';

function scopeURL(path) {
  return new URL(path, self.registration.scope);
}

function scopePath() {
  return new URL('./', self.registration.scope).pathname;
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) =>
        cache.addAll([
          scopeURL('./').href,
          scopeURL('./index.html').href,
          scopeURL('./manifest.json').href,
          scopeURL('./icon-192.png').href,
          scopeURL('./icon-512.png').href,
          scopeURL('./apple-touch-icon.png').href,
        ]).catch(() => undefined),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keep = new Set([STATIC_CACHE, SHELL_CACHE]);
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => !keep.has(k)).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  let url;
  try {
    url = new URL(req.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;
  const prefix = scopePath();
  if (!url.pathname.startsWith(prefix)) return;

  const isStatic =
    url.pathname.startsWith(prefix + '_expo/') ||
    url.pathname.startsWith(prefix + 'assets/');

  if (isStatic) {
    event.respondWith(cacheFirst(req, STATIC_CACHE));
    return;
  }

  event.respondWith(networkFirst(req));
});

async function cacheFirst(req, cacheName) {
  const cached = await caches.match(req);
  if (cached) return cached;
  const res = await fetch(req);
  if (res && res.ok) {
    const cache = await caches.open(cacheName);
    cache.put(req, res.clone());
  }
  return res;
}

async function networkFirst(req) {
  try {
    const res = await fetch(req);
    if (res && res.ok) {
      const cache = await caches.open(SHELL_CACHE);
      cache.put(req, res.clone());
    }
    return res;
  } catch (err) {
    const cached = await caches.match(req);
    if (cached) return cached;
    if (req.mode === 'navigate') {
      const shell =
        (await caches.match(scopeURL('./index.html'))) ||
        (await caches.match(scopeURL('./')));
      if (shell) return shell;
    }
    throw err;
  }
}
