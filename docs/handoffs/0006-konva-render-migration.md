# ハンドオフ 0006 — カード描画を Konva へ移行（パリティ＋Konva書き出し・対話はまだ）

- 作成：Claude / 2026-06-12
- 状態：未着手

## 目的
カードのプレビューを **HTML/CSS DOM → react-konva（Canvas）** に作り直す。**見た目は現状とほぼパリティ**、書き出しは **Konva（`stage.toDataURL`）** に。これは「自由配置＋スナップ編集（0007）」の土台。
**この0006では対話（ドラッグ/選択/変形/スナップ）はまだ入れない**＝描画・書き出し・座標モデル・テストを安定させることに集中（リスク分割）。

## なぜ分割
Konva化は今までで最大の作り直し＋**テスト方式が変わる**。まず「同じ見た目をCanvasで描く／Konvaで書き出す／テストを通す」を固め、対話は0007で乗せる。

## 依存
- 追加：`konva` `react-konva`。
- カードの `html2canvas` 利用は **Konva書き出しに置換**（他で未使用なら依存削除可）。

## モデル拡張（座標を持たせる）
- Canvasは絶対座標。テンプレに**各要素の配置(x, y, 幅)**を持たせる。
- 形は**「要素＝位置＋サイズ＋スタイル＋内容」を1リストで持つ**のが0007のドラッグと相性良い（例：`elements: Array<{ id; kind:"text"|"image"|"group"; x; y; width; ...; fieldKey? }>`）。既存 `FieldSchema/ThemeConfig` は流用・拡張可。
- `DEFAULT_TEMPLATE` は**現状の見た目を座標で再現**（680×430内）。※**完全一致は難しいので“近い”を目標→後で微調整**。
- 具体構造はCodex裁量。ただし**0007で各要素を個別にドラッグ/変形できる粒度**にしておくこと。

## Konva構成（目安）
- `Stage`(680×430) → `Layer` → `Rect`(背景・角丸) → `Rect`(ピンク帯) → `Text`(透かし・回転・低opacity・カードでクリップ) → `Group`(校章＝円＋「CR」) → `Image`(写真／無い時はプレースホルダ `Rect`＋「PHOTO」) → 各 `Text`(項目・ラベル) → `Group`(印＝赤枠＋「学院長之印」)。
- テーマ（cardBg / bandColor / textColor / crestAccent / baseFont / 透かし文字・濃さ）と各項目スタイル（font / size / weight / color / align）を反映。

## 書き出し（export.ts）
- `exportPng` を **`stage.toDataURL({ pixelRatio: 3, mimeType: "image/png" })`** ベースに。
- **書き出し前に `await document.fonts.ready`**（フォント未ロードだと明朝が崩れる）。必要なら描画を待ってから。ダウンロード処理は従来どおり（toBlob化は0006では任意）。
- App は DOMの `cardRef` の代わりに **Konva Stage への ref** を持つ。

## テスト改修（★DOM→Canvasで方式が変わる）
- カード内テキストはDOMから消える＝**`data-field` を `getByText` で見る単体/E2Eは成立しない**。
- 方針：**フォーム/プロパティパネルはDOMのまま**（Testing Libraryで入力テスト継続）。カード反映の確認は
  (a) **テンプレ状態の単体テスト**（値/スタイル/テーマが正しく state に入る）
  (b) **PNGダウンロードが起きるE2E**（継続）
  (c) 任意：**Playwright スクショ比較**（canvasの見た目回帰）。
- 既存テストはCodexが新方式に追従し**緑に保つ**。

## 受け入れ基準（完了確認コマンド）
- `npm run check` 緑・`npm run check:e2e` 緑。
- 既定状態のカードが**現状とほぼ同じ見た目**（多少のズレ可・後で詰める）。
- 項目内容/スタイル/テーマ変更が**プレビュー即反映**（パネル経由）。
- 写真アップロード→表示、PNG書き出し（3倍・Konva）が動く。

## スコープ外（厳守）
- **ドラッグ / 選択 / 変形 / スナップ / ガイド / ルーラー**（→ 0007）。
- 写真のズーム/トリミング、印・校章ジェネレーター、複数テンプレ、localStorage、バックエンド。

## 完了後
- `docs/STATUS.md` / `docs/devlog.md` 更新 → **0007（自由配置エディタ：選択/ドラッグ/変形/スナップ/ガイド）**へ。
