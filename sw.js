/* こどもあそび — オフライン用 Service Worker（tools/build.js が生成） */
const CACHE = 'kids-apps-bed44e5233';
const PRECACHE = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./apps.json",
  "./assets/fonts/fonts.css",
  "./assets/fonts/zen-maru-700.woff2",
  "./assets/fonts/zen-maru-900.woff2",
  "./assets/vendor/matter.min.js",
  "./icons/home-192.png",
  "./icons/home-512.png",
  "./icons/home-180.png",
  "./apps/juice-sort/",
  "./apps/juice-sort/index.html",
  "./apps/juice-sort/manifest.webmanifest",
  "./icons/juice-sort-192.png",
  "./icons/juice-sort-512.png",
  "./icons/juice-sort-180.png",
  "./apps/water-delivery/",
  "./apps/water-delivery/index.html",
  "./apps/water-delivery/manifest.webmanifest",
  "./icons/water-delivery-192.png",
  "./icons/water-delivery-512.png",
  "./icons/water-delivery-180.png",
  "./apps/candy-factory/",
  "./apps/candy-factory/index.html",
  "./apps/candy-factory/manifest.webmanifest",
  "./icons/candy-factory-192.png",
  "./icons/candy-factory-512.png",
  "./icons/candy-factory-180.png",
  "./apps/flower-field/",
  "./apps/flower-field/index.html",
  "./apps/flower-field/manifest.webmanifest",
  "./icons/flower-field-192.png",
  "./icons/flower-field-512.png",
  "./icons/flower-field-180.png",
  "./apps/bear-errand/",
  "./apps/bear-errand/index.html",
  "./apps/bear-errand/manifest.webmanifest",
  "./icons/bear-errand-192.png",
  "./icons/bear-errand-512.png",
  "./icons/bear-errand-180.png",
  "./apps/bubble-count/",
  "./apps/bubble-count/index.html",
  "./apps/bubble-count/manifest.webmanifest",
  "./icons/bubble-count-192.png",
  "./icons/bubble-count-512.png",
  "./icons/bubble-count-180.png",
  "./apps/pattern-train/",
  "./apps/pattern-train/index.html",
  "./apps/pattern-train/manifest.webmanifest",
  "./icons/pattern-train-192.png",
  "./icons/pattern-train-512.png",
  "./icons/pattern-train-180.png",
  "./apps/animal-memory/",
  "./apps/animal-memory/index.html",
  "./apps/animal-memory/manifest.webmanifest",
  "./icons/animal-memory-192.png",
  "./icons/animal-memory-512.png",
  "./icons/animal-memory-180.png",
  "./apps/color-mix/",
  "./apps/color-mix/index.html",
  "./apps/color-mix/manifest.webmanifest",
  "./icons/color-mix-192.png",
  "./icons/color-mix-512.png",
  "./icons/color-mix-180.png",
  "./apps/star-connect/",
  "./apps/star-connect/index.html",
  "./apps/star-connect/manifest.webmanifest",
  "./icons/star-connect-192.png",
  "./icons/star-connect-512.png",
  "./icons/star-connect-180.png",
  "./apps/block-castle/",
  "./apps/block-castle/index.html",
  "./apps/block-castle/manifest.webmanifest",
  "./icons/block-castle-192.png",
  "./icons/block-castle-512.png",
  "./icons/block-castle-180.png",
  "./apps/aquarium/",
  "./apps/aquarium/index.html",
  "./apps/aquarium/manifest.webmanifest",
  "./icons/aquarium-192.png",
  "./icons/aquarium-512.png",
  "./icons/aquarium-180.png",
  "./apps/shadow-match/",
  "./apps/shadow-match/index.html",
  "./apps/shadow-match/manifest.webmanifest",
  "./icons/shadow-match-192.png",
  "./icons/shadow-match-512.png",
  "./icons/shadow-match-180.png",
  "./apps/forest-pinball/",
  "./apps/forest-pinball/index.html",
  "./apps/forest-pinball/manifest.webmanifest",
  "./icons/forest-pinball-192.png",
  "./icons/forest-pinball-512.png",
  "./icons/forest-pinball-180.png",
  "./apps/knock-door/",
  "./apps/knock-door/index.html",
  "./apps/knock-door/manifest.webmanifest",
  "./icons/knock-door-192.png",
  "./icons/knock-door-512.png",
  "./icons/knock-door-180.png",
  "./apps/cake-defense/",
  "./apps/cake-defense/index.html",
  "./apps/cake-defense/manifest.webmanifest",
  "./icons/cake-defense-192.png",
  "./icons/cake-defense-512.png",
  "./icons/cake-defense-180.png"
];

self.addEventListener('install', e => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // 1つ失敗しても残りをキャッシュする
    await Promise.all(PRECACHE.map(u => cache.add(new Request(u, { cache: 'reload' })).catch(() => {})));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith((async () => {
    const cached = await caches.match(req, { ignoreSearch: true });
    if (cached) {
      // 裏でこっそり更新しておく
      e.waitUntil(fetch(req).then(r => r.ok && caches.open(CACHE).then(c => c.put(req, r.clone()))).catch(() => {}));
      return cached;
    }
    try {
      const res = await fetch(req);
      if (res.ok) { const c = await caches.open(CACHE); c.put(req, res.clone()); }
      return res;
    } catch (err) {
      if (req.mode === 'navigate') return (await caches.match('./index.html')) || Response.error();
      throw err;
    }
  })());
});
