# こどもあそび

Claude Artifact でつくった子ども向けミニゲーム 15 本を、GitHub Pages で公開するための PWA です。
一度開けば **オフラインでも遊べます**。ホーム画面に追加すると、ふつうのアプリのように起動します。

👉 https://k-yokoishi.github.io/kids-apps/

## つくり

```
index.html               ホーム画面（アプリ一覧・ビルド生成物）
manifest.webmanifest     ホーム画面用の PWA マニフェスト（生成物）
sw.js                    オフライン用 Service Worker（生成物）
apps/<slug>/             各ゲーム（生成物）
src/<slug>.html          Artifact からそのまま落とした原本。編集はここに対して行う
apps.json                アプリの一覧・絵文字・色・説明
tools/build.js           src/ から公開用ファイル一式を生成する
assets/fonts/            Zen Maru Gothic を使用文字だけにサブセットしたもの（約 73KB）
assets/vendor/           matter.js（2 本のゲームが使用）
icons/                   各アプリの PNG アイコン（512 / 192 / 180）
```

外部 CDN・Google Fonts への参照はビルド時にローカルのファイルへ差し替えているため、
通信がなくてもゲームの見た目と挙動は変わりません。

## ビルド

`src/` や `apps.json` を編集したら、次を実行して公開用ファイルを作り直します。

```sh
node tools/build.js
```

`sw.js` のキャッシュ名は中身のハッシュから決まるので、
ファイルを更新して push すれば、次に開いたときに自動で新しい内容に切り替わります。

## アプリを追加する

1. Artifact の HTML を `src/<slug>.html` として置く
2. `apps.json` に `slug` / `title` / `emoji` / `color` / `desc` を追記する
3. `tools/icons.js` でアイコンを生成し、`node tools/build.js` を実行する
