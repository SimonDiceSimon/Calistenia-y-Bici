// Calistenia y Bici - service worker
const CACHE = "cyb-v3";
const LOCAL = ["./", "./index.html", "./manifest.json", "./icon-192.png", "./icon-512.png", "./icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(LOCAL))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.hostname.includes("googleapis.com")) return; // datos de Firebase: siempre en vivo
  // Primero la red (para tener siempre la última versión); si no hay señal, lo guardado
  e.respondWith(fetch(e.request).then(r => {
    if (r.ok || r.type === "opaque") { const copia = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copia)); }
    return r;
  }).catch(() => caches.match(e.request).then(r => r || caches.match("./index.html"))));
});
