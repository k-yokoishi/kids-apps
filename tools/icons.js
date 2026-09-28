#!/usr/bin/env node
// apps.json の絵文字と色から PNG アイコンを生成する。
// Chrome の起動は 1 回だけ。全アイコンを縦に並べた 1 枚を撮り、ImageMagick で切り出す。
// headless Chrome は --screenshot を書き出したあとプロセスが残ることがあるので、
// ファイルの出現を待って明示的に終了させる。
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawn, execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const S = 512;
const items = JSON.parse(fs.readFileSync(path.join(ROOT, 'apps.json'), 'utf8'))
  .concat([{ slug: 'home', emoji: '🌈', color: '#ffc2d1' }]);

const sleep = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
const shade = (hex, f) => '#' + [1, 3, 5]
  .map(i => Math.max(0, Math.min(255, Math.round(parseInt(hex.substr(i, 2), 16) * f))).toString(16).padStart(2, '0'))
  .join('');

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'kidsicons-'));
const out = path.join(ROOT, 'icons');
fs.mkdirSync(out, { recursive: true });

const tiles = items.map(a => `<div class="t" style="background:linear-gradient(145deg,${shade(a.color, 1.08)},${shade(a.color, 0.82)})"><span>${a.emoji}</span></div>`).join('');
const sheet = path.join(tmp, 'sheet.html');
fs.writeFileSync(sheet, `<!doctype html><meta charset=utf-8><style>
html,body{margin:0;padding:0;width:${S}px;overflow:hidden}
.t{width:${S}px;height:${S}px;display:grid;place-items:center}
span{font-size:270px;line-height:1;font-family:"Apple Color Emoji";filter:drop-shadow(0 10px 14px rgba(0,0,0,.18))}
</style>${tiles}`);

const sheetPng = path.join(tmp, 'sheet.png');
const child = spawn(CHROME, ['--headless=new', '--disable-gpu', '--no-first-run', '--no-default-browser-check',
  '--disable-extensions', '--hide-scrollbars', '--force-device-scale-factor=1', '--virtual-time-budget=3000',
  `--user-data-dir=${path.join(tmp, 'cd')}`, `--window-size=${S},${S * items.length}`,
  `--screenshot=${sheetPng}`, 'file://' + sheet], { stdio: 'ignore', detached: true });

let size = -1;
for (let i = 0; i < 120; i++) {           // 最大 2 分待つ
  sleep(1000);
  if (!fs.existsSync(sheetPng)) continue;
  const now = fs.statSync(sheetPng).size;
  if (now > 0 && now === size) break;      // サイズが安定したら書き出し完了
  size = now;
}
try { process.kill(-child.pid, 'SIGKILL'); } catch (e) { child.kill('SIGKILL'); }
if (!fs.existsSync(sheetPng)) { console.error('スクリーンショットに失敗しました'); process.exit(1); }

items.forEach((a, i) => {
  const png = path.join(out, `${a.slug}-${S}.png`);
  execFileSync('magick', [sheetPng, '-crop', `${S}x${S}+0+${i * S}`, '+repage', png]);
  for (const size of [192, 180]) {
    execFileSync('magick', [png, '-resize', `${size}x${size}`, path.join(out, `${a.slug}-${size}.png`)]);
  }
});
fs.rmSync(tmp, { recursive: true, force: true });
console.log(`icons: ${items.length * 3} files`);
