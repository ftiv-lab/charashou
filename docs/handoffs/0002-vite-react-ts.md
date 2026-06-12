# ハンドオフ 0002 — Vite + React + TypeScript へ移行（クライアント完結・パリティ）

- 作成：Claude / 2026-06-12
- 状態：未着手

## 目的
動いている素のHTML/CSS/JS版を **Vite ＋ React ＋ TypeScript** に移行する（**クライアント完結・バックエンド無し**）。**挙動と見た目は完全パリティ**（新機能は足さない）。狙い：今後のテンプレ複数化/エディタ等の“状態↔UI”をReactで楽にする・業界標準・商品化(zip/Tauri)の土台。

## 対象/成果物
- 新規：`package.json` / `tsconfig.json` / `vite.config.ts` / `src/` 一式 / `index.html`（Vite用に書き換え）
- 旧 `app.js` / `style.css` / `index.html` を React 版へ移植（CSSは流用可）。`start.bat` は不要なら削除可（任意）。
- **触らない**：`docs/` / `scripts/` / `AGENTS.md` / `SPEC.md`（必要な追記のみ）。

## 技術指定
- 依存：`react` `react-dom` `html2canvas`。dev依存：`vite` `@vitejs/plugin-react` `typescript` `@types/react` `@types/react-dom`。
- `vite.config.ts`：`@vitejs/plugin-react`、**`base: './'`**（GitHub Pagesサブパス＋将来のzip/file:// 両対応）。
- `tsconfig.json`：`strict: true`。
- フォント：`index.html` に Noto Serif JP / Noto Sans JP の Google Fonts `<link>` を残す。
- `html2canvas` は **v1.4.1 を npm 依存**で（CDN廃止）。
- **入れない**：バックエンド/認証/DB/ルーター/状態ライブラリ/Tailwind/UIライブラリ（単一画面・`useState`で十分）。

## 構成（目安）
```
index.html              # <div id="root"> + <script type="module" src="/src/main.tsx">
src/
  main.tsx              # createRoot(...).render(<App/>)
  App.tsx               # topbar + panel(Form) + stage(CardPreview)
  index.css             # 旧 style.css を移植（dark chrome + card・トークン）
  card/
    fields.ts           # FIELD定義（型つき・単一ソース）
  components/
    Form.tsx            # FIELDから入力欄生成＋写真アップロード
    CardPreview.tsx     # 旧 #card のJSX化。forwardRef でDOM参照を渡す
  export.ts             # exportPng(node): await fonts.ready → html2canvas → download
```

## 保持すべき挙動（パリティ＝受け入れ基準）
1. **各フィールド編集→プレビュー即反映**：schoolName / schoolRoman / title / grade / name / nameRoman / birth / expiry / statement / issuer（全て text）。React state（FIELD配列駆動）。
2. **顔写真アップロード**：`<input type=file accept=image/*>` → `FileReader` → dataURL → state → `<img object-fit:cover>` に反映。
3. **PNG書き出し**：カードDOMを ref で取得 → **`await document.fonts.ready` の後に** `html2canvas(node,{scale:3,backgroundColor:'#ffffff'})` → `charashou.png` をダウンロード。
4. **透かし**：`"COROND JOSHI GAKUIN "` を繰り返した文字列。
5. **見た目はパリティ**：dark chrome（外枠）＋ピンクのカードが**現状と同じに見える**。`.card-wrap` 内でカード色トークン（`--ink/--pink/--accent` を `--card-*` へ）を再スコープする現行手法を維持。
6. `npm install` 成功・`npm run dev` で表示・`npm run build` で `dist/` 生成・**型エラー無し**。

## 既定値（カード初期表示・inline）
- 私立コロンド女子学院 / SHIRITSU COROND JOSHI GAKUIN / 学生証 / 高等部 2年A組 / 白峰 雪菜 / shiramine yukina / ××××年2月9日 / ××××年3月31日 / 上記の者は本院の学生であることを証明する / 私立コロンド女子学院長
- カード寸法 680×430。色・レイアウトは現 `style.css`（`#card`まわり）を踏襲（`SPEC.md` 参照）。

## スコープ外（やらない）
- 新機能（テンプレ切替/保存/エディタ/校章・印アップロード）。
- バックエンド・認証・DB・Tailwind・UIライブラリ・ルーター。
- テスト/Biome/CI（→ `0003`）。
- **GitHub Pages の配信方式変更（→ Claudeが別途 Actions 化）**。
- カードの見た目変更。

## 完了後
- `docs/STATUS.md` の該当を Done へ、`docs/devlog.md` に学び1行。
- 配信（Pages）は **Claude が GitHub Actions ビルド配信へ切替**（移行後は main/root 直配信が効かないため）。
