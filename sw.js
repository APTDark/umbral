// Service worker de Umbral: guarda la app para que abra sin conexión.
// Las páginas se piden primero a la red (para tener siempre la última versión) y los archivos a la caché.
const CACHE = 'umbral-v2';
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (e.request.mode === 'navigate') {
    e.respondWith(fetch(e.request).then((r) => { const c = r.clone(); caches.open(CACHE).then((k) => k.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then((r) => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request).then((resp) => { if (resp.ok) { const c = resp.clone(); caches.open(CACHE).then((k) => k.put(e.request, c)); } return resp; })));
});
