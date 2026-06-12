# ハンドオフ 0007 — 自由配置エディタ（選択 / ドラッグ / 変形 / スナップ / ガイド）

- 作成：Claude / 2026-06-12
- 状態：未着手

## 目的
0006で作ったKonvaカードに**対話編集**を載せる：要素を **選択 → ドラッグ移動 → ハンドルでリサイズ → スナップ＆ガイドライン**。年賀状ソフト/CLIP STUDIO的な操作感。位置/サイズは `template.elements`（`x/y/width/height/rotation`）に保存（App state）。

## 前提（現状）
- `src/card/template.ts`：`Template.elements`（座標要素）＋`fields`（内容/スタイル）。
- `src/components/CardPreview.tsx`：react-konva の `Stage/Layer`、各要素を描画。今は全要素 `listening={false}`（非対話）。
- `App.tsx`：`template` state（`createDefaultTemplate`）＋ `setTemplate`。「既定に戻す」あり。

## 対象（インタラクティブにする要素）
- **内容要素＝ `text`(各field) / `image`(写真) / `crest`(校章) / `seal`(印)** を選択・ドラッグ・リサイズ可能に。
- **frame要素＝ `background` / `band` / `watermark` は今回固定**（`listening=false` 維持。将来 可動化）。

## やること
1. **選択**：要素クリックで選択（Transformerで枠表示）。空白クリック / Esc で解除。
2. **ドラッグ移動**：ドラッグで `x/y` 更新 → App stateへ反映（例：`onElementChange(id, { x, y })`）。
3. **リサイズ（Konva Transformer）**：
   - **text は scale でなくサイズへ変換**：transform終了で `scaleX/scaleY` を読み、**`width`（＋必要なら `fontSize`）に反映して scale を1へリセット**（文字がボケない標準パターン）。
   - `image/crest/seal` は `width/height` を更新（scaleをリセット）。
   - 回転は**任意**（Transformerのrotate許可可。複雑なら後回し）。
4. **スナップ＆ガイドライン**：ドラッグ/リサイズ中、**カードの 左/中央/右・上/中央/下**、および**他要素の 端/中心** にスナップ（閾値≈5px）。スナップ時は**薄いガイド線**を表示、離すと消す。`use-konva-snapping` 等のhook利用 or 自前実装どちらでも可。
5. **保存/反映**：位置/サイズは `template.elements` に保存（**「既定に戻す」で戻ること**）。**PNG書き出し（3倍）にも反映**。プロパティパネル（内容/スタイル/テーマ）は従来どおり併用。

## UI/操作
- ホバー/選択でカーソルや枠が分かるように。Transformerのハンドルは扱いやすいサイズ。
- 任意（できれば）：要素クリックで**パネルの該当項目にフォーカス**（選択同期）。

## テスト/検証
- `npm run check` 緑・`npm run check:e2e` 緑を維持。
- **純ロジック（スナップ計算・transform→サイズ変換）は単体テストに切り出す**と良い。
- canvas上のドラッグE2Eは**最小でよい**（厚くしすぎない）。

## 受け入れ基準（完了確認コマンド）
- 内容要素を**ドラッグで動かせる／ハンドルでリサイズできる**。
- ドラッグ/リサイズ時に**スナップ＋ガイドライン**が出る（カード端/中央・他要素）。
- **text のリサイズで文字がボケない**（width/fontSizeへ変換）。
- 位置/サイズが保存され、**PNG書き出しに反映**、**「既定に戻す」で戻る**。
- 既存（内容/スタイル/テーマ編集・写真アップ・PNG保存）が壊れていない。

## スコープ外（厳守）
- **ルーラー目盛り表示**（任意・余力があれば。無理なら次回に分離）。
- 写真ズーム/トリミング（0008）、印・校章ジェネレーター（0009）、複数テンプレ・保存(localStorage/JSON)（0010）。
- undo/redo、レイヤー順入替、frame要素(背景/帯/透かし)の可動化、バックエンド。

## 完了後
- `docs/STATUS.md` / `docs/devlog.md` 更新。
