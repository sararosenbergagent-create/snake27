// Service worker de Snake27 (patch_v14.py). Reseau d'abord, copie gardee pour jouer sans reseau.
const CACHE = "snake27-v1";
const FICHIERS = ["./", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./maskable-512.png", "./apple-touch-icon.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request;
  if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;   // polices, sources : jamais interceptees
  const page = r.mode === "navigate";
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const cle = page ? "./" : r;
    const reseau = fetch(r).then(rep => { if (rep.ok) c.put(cle, rep.clone()); return rep; });
    e.waitUntil(reseau.catch(() => {}));
    const garde = await c.match(cle, { ignoreSearch: true });
    if (!garde) return reseau;
    const delai = new Promise(ok => setTimeout(() => ok(garde), 4000));
    try { return await Promise.race([reseau, delai]); } catch (_) { return garde; }
  })());
});
