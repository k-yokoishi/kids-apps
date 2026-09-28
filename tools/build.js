#!/usr/bin/env node
// src/*.html（Claude Artifact の原本）から公開用の apps/ 一式・manifest・sw.js・ホーム画面を生成する。
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const apps = JSON.parse(fs.readFileSync(path.join(ROOT, 'apps.json'), 'utf8'));
const SITE = 'こどもあそび';

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/* ---------- 各アプリページ ---------- */
const homeButton = `
<style>
.ka-home{position:fixed;z-index:2147483000;left:max(10px,env(safe-area-inset-left));top:max(10px,env(safe-area-inset-top));
width:48px;height:48px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:24px;
text-decoration:none;background:rgba(255,255,255,.72);box-shadow:0 2px 10px rgba(0,0,0,.18);
backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);border:2px solid rgba(255,255,255,.9);
-webkit-tap-highlight-color:transparent;transition:transform .12s ease}
.ka-home:active{transform:scale(.88)}
@media (prefers-color-scheme:dark){.ka-home{background:rgba(40,32,48,.72);border-color:rgba(255,255,255,.28)}}
</style>
<a class="ka-home" href="../../" aria-label="ホームにもどる">🏠</a>
<script>if('serviceWorker' in navigator)addEventListener('load',function(){navigator.serviceWorker.register('../../sw.js').catch(function(){})});</script>
`;

for (const a of apps) {
  let html = fs.readFileSync(path.join(ROOT, 'src', a.slug + '.html'), 'utf8');

  // 外部依存をローカルへ差し替え（オフラインで動くように）
  html = html.replace(/\s*<link[^>]+fonts\.googleapis\.com[^>]*>/g, '');
  html = html.replace(/\s*<link[^>]+fonts\.gstatic\.com[^>]*>/g, '');
  html = html.replace(/https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/matter-js\/[^"']+/g, '../../assets/vendor/matter.min.js');

  const head = `
<link rel="stylesheet" href="../../assets/fonts/fonts.css">
<link rel="manifest" href="./manifest.webmanifest">
<meta name="theme-color" content="${a.color}">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${esc(a.title)}">
<link rel="icon" href="../../icons/${a.slug}-192.png">
<link rel="apple-touch-icon" href="../../icons/${a.slug}-180.png">
`;
  html = html.replace('</head>', head + '</head>');
  html = html.replace('</body>', homeButton + '</body>');

  const dir = path.join(ROOT, 'apps', a.slug);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);

  fs.writeFileSync(path.join(dir, 'manifest.webmanifest'), JSON.stringify({
    id: `../../?app=${a.slug}`,
    name: a.title,
    short_name: a.title.split(' ')[0],
    description: a.desc,
    start_url: './',
    scope: '../../',
    display: 'standalone',
    orientation: 'any',
    background_color: a.color,
    theme_color: a.color,
    lang: 'ja',
    icons: [
      { src: `../../icons/${a.slug}-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: `../../icons/${a.slug}-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: `../../icons/${a.slug}-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' }
    ]
  }, null, 2));
}

/* ---------- ホーム画面 ---------- */
const cards = apps.map(a => `      <a class="card" href="./apps/${a.slug}/" style="--c:${a.color}">
        <span class="emoji">${a.emoji}</span>
        <span class="name">${esc(a.title)}</span>
        <span class="desc">${esc(a.desc)}</span>
      </a>`).join('\n');

const home = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${SITE}</title>
<meta name="description" content="こども向けの あそびアプリ ${apps.length}こ。オフラインでも あそべます。">
<link rel="stylesheet" href="./assets/fonts/fonts.css">
<link rel="manifest" href="./manifest.webmanifest">
<meta name="theme-color" content="#ffc2d1">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="${SITE}">
<link rel="icon" href="./icons/home-192.png">
<link rel="apple-touch-icon" href="./icons/home-180.png">
<style>
:root{
  --bg1:#fff5f8;--bg2:#eef6ff;--ink:#5b3a52;--sub:#8a6a80;--card-ink:#4a2f44;
  --shadow:0 6px 18px rgba(120,80,110,.14);--edge:rgba(255,255,255,.85);--chip:rgba(255,255,255,.7);
}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){
  --bg1:#241b2e;--bg2:#1b2230;--ink:#ffe6f0;--sub:#c3a8bc;--card-ink:#2b1d28;
  --shadow:0 6px 18px rgba(0,0,0,.4);--edge:rgba(255,255,255,.22);--chip:rgba(255,255,255,.12);
}}
:root[data-theme="dark"]{
  --bg1:#241b2e;--bg2:#1b2230;--ink:#ffe6f0;--sub:#c3a8bc;--card-ink:#2b1d28;
  --shadow:0 6px 18px rgba(0,0,0,.4);--edge:rgba(255,255,255,.22);--chip:rgba(255,255,255,.12);
}
*{box-sizing:border-box}
body{
  margin:0;min-height:100vh;color:var(--ink);
  background:linear-gradient(165deg,var(--bg1),var(--bg2));
  font-family:"Zen Maru Gothic","Hiragino Maru Gothic ProN",system-ui,sans-serif;font-weight:700;
  padding:max(20px,env(safe-area-inset-top)) max(16px,env(safe-area-inset-right)) max(28px,env(safe-area-inset-bottom)) max(16px,env(safe-area-inset-left));
  -webkit-text-size-adjust:100%;
}
header{max-width:920px;margin:8px auto 22px;text-align:center}
h1{font-size:clamp(26px,6vw,38px);font-weight:900;margin:0 0 6px;letter-spacing:.02em}
h1 .r{font-size:1.1em;vertical-align:-.06em;margin-right:.12em}
.tag{color:var(--sub);font-size:14px;margin:0}
.status{display:inline-flex;align-items:center;gap:6px;margin-top:12px;padding:6px 14px;border-radius:999px;
  background:var(--chip);font-size:13px;color:var(--sub);border:1px solid var(--edge)}
.status .dot{width:8px;height:8px;border-radius:50%;background:#bbb;transition:background .3s}
.status.ready .dot{background:#2ecc71}
.grid{width:100%;max-width:920px;margin:0 auto;display:grid;gap:14px;
  grid-template-columns:repeat(auto-fill,minmax(min(148px,100%),1fr))}
.card{
  min-width:0;overflow-wrap:anywhere;
  display:flex;flex-direction:column;align-items:center;justify-content:flex-start;gap:4px;
  padding:18px 12px 16px;border-radius:22px;text-decoration:none;color:var(--card-ink);
  background:linear-gradient(160deg,color-mix(in srgb,var(--c) 92%,white),var(--c));
  box-shadow:var(--shadow);border:2px solid var(--edge);
  -webkit-tap-highlight-color:transparent;transition:transform .14s ease,box-shadow .14s ease;
}
.card:active{transform:scale(.95);box-shadow:0 3px 8px rgba(120,80,110,.18)}
.emoji{font-size:52px;line-height:1.1;filter:drop-shadow(0 3px 5px rgba(0,0,0,.14))}
.name{font-weight:900;font-size:15px;text-align:center;line-height:1.35;margin-top:2px;text-wrap:balance}
.desc{font-size:12px;text-align:center;line-height:1.4;opacity:.72}
footer{max-width:920px;margin:26px auto 0;text-align:center;color:var(--sub);font-size:12px;line-height:1.8}
@media (min-width:620px){.grid{gap:18px;grid-template-columns:repeat(auto-fill,minmax(min(170px,100%),1fr))}.emoji{font-size:60px}}
</style>
</head>
<body>
<header>
  <h1><span class="r">🌈</span>${SITE}</h1>
  <p class="tag">すきな あそびを えらんでね</p>
  <div class="status" id="status"><span class="dot"></span><span id="statusText">じゅんび ちゅう…</span></div>
</header>
<main>
  <div class="grid">
${cards}
  </div>
</main>
<footer>
  ぜんぶ ${apps.length}こ ・ ホームがめんに ついかすると アプリのように あそべます<br>
  いちど ひらけば つうしんが なくても あそべます
</footer>
<script>
(function(){
  var el = document.getElementById('status'), txt = document.getElementById('statusText');
  if(!('serviceWorker' in navigator)){ txt.textContent = 'ブラウザで あそべます'; return; }
  navigator.serviceWorker.register('./sw.js').catch(function(){});
  navigator.serviceWorker.ready.then(function(){
    el.classList.add('ready');
    txt.textContent = 'オフラインでも あそべます';
  }).catch(function(){ txt.textContent = 'ブラウザで あそべます'; });
})();
</script>
</body>
</html>
`;
fs.writeFileSync(path.join(ROOT, 'index.html'), home);

fs.writeFileSync(path.join(ROOT, 'manifest.webmanifest'), JSON.stringify({
  id: '../',
  name: SITE,
  short_name: SITE,
  description: `こども向けの あそびアプリ ${apps.length}こ。オフラインでも あそべます。`,
  start_url: './',
  scope: './',
  display: 'standalone',
  orientation: 'any',
  background_color: '#fff5f8',
  theme_color: '#ffc2d1',
  lang: 'ja',
  icons: [
    { src: './icons/home-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: './icons/home-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: './icons/home-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ],
  shortcuts: apps.slice(0, 4).map(a => ({
    name: a.title, url: `./apps/${a.slug}/`,
    icons: [{ src: `./icons/${a.slug}-192.png`, sizes: '192x192', type: 'image/png' }]
  }))
}, null, 2));

/* ---------- Service Worker ---------- */
const precache = ['./', './index.html', './manifest.webmanifest', './apps.json',
  './assets/fonts/fonts.css', './assets/fonts/zen-maru-700.woff2', './assets/fonts/zen-maru-900.woff2',
  './assets/vendor/matter.min.js',
  './icons/home-192.png', './icons/home-512.png', './icons/home-180.png'];
for (const a of apps) {
  precache.push(`./apps/${a.slug}/`, `./apps/${a.slug}/index.html`, `./apps/${a.slug}/manifest.webmanifest`,
    `./icons/${a.slug}-192.png`, `./icons/${a.slug}-512.png`, `./icons/${a.slug}-180.png`);
}

// キャッシュ名は中身のハッシュ。ファイルが変われば自動で新しいキャッシュに切り替わる。
const hash = crypto.createHash('sha1');
for (const rel of precache) {
  const p = path.join(ROOT, rel.replace(/^\.\//, '').replace(/\/$/, '/index.html'));
  if (fs.existsSync(p) && fs.statSync(p).isFile()) hash.update(fs.readFileSync(p));
}
const version = hash.digest('hex').slice(0, 10);

const sw = `/* ${SITE} — オフライン用 Service Worker（tools/build.js が生成） */
const CACHE = 'kids-apps-${version}';
const PRECACHE = ${JSON.stringify(precache, null, 2)};

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
`;
fs.writeFileSync(path.join(ROOT, 'sw.js'), sw);

console.log(`built: ${apps.length} apps / sw cache kids-apps-${version} / ${precache.length} precached files`);
