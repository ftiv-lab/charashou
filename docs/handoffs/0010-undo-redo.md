# ハンドオフ 0010 — Undo/Redo（操作履歴）

- 作成：Claude / 2026-06-12
- 状態：未着手

## 目的
編集を**いつでも戻せる/やり直せる**ようにする＝安心して触れるエディタに。`useReducer` で「ドキュメント（`template`＋`photo`）」の**操作履歴（past/present/future）**を持つ。

## 前提（現状）
- App state：`template`(Template: fields/theme/elements)、`photo`(PhotoState: dataUrl/zoom/offsetX/offsetY)、`isExporting`/`exportMessage`(transient)。
- 変更：field値/style、theme、element(位置/サイズ＝drag/transform end)、photo(upload/zoom/offset)、reset。
- 選択状態 `selectedElementId` は CardPreview ローカル（UI状態）。

## 設計
- **ドキュメント** `Doc = { template: Template; photo: PhotoState }` を履歴管理。
- **historyReducer** `{ past: Doc[]; present: Doc; future: Doc[] }`：
  - `EDIT`（新Doc＋`mergeKey`）：通常は present を past に積んで更新＋future クリア。ただし**直前のEDITと `mergeKey` が同じ（かつ間にUNDO/REDOが無い）なら present を置換＝coalesce**（past を増やさない）。
  - `UNDO`：past→present、旧present→future。`REDO`：逆。
  - `RESET`：既定Docへ（**履歴1エントリとして積む**＝undo可）。
  - **past 上限 ~50**（写真dataURLが重いので無制限にしない＝超過分は古い方を捨てる）。
- `isExporting`/`exportMessage`/`selectedElementId` は**履歴外**（transient/UI）。

## coalesce（mergeKey）方針
連続した同一対象の微編集は1エントリにまとめる：
- テキスト項目：`field:<key>`（同じ項目の連続入力＝1回）。
- スタイル：`style:<key>:<prop>`。テーマ：`theme:<key>`。
- 写真slider：`photo:<zoom|offsetX|offsetY>`。
- **要素の drag/resize は end で1コミット**（毎ジェスチャ1エントリ・mergeKey不要）。
- 写真upload・reset は**毎回独立エントリ**（coalesceしない）。
- UNDO/REDO 後は merge チェーンを切る（次のEDITは必ず past に積む）。

## UI/操作
- topbar に **Undo / Redo ボタン**（past/future が空なら disabled）。
- キーボード：**Ctrl+Z＝Undo**、**Ctrl+Shift+Z / Ctrl+Y＝Redo**（テキスト入力欄やIMEの通常操作を邪魔しない範囲で）。
- 既存「既定に戻す」は RESET（履歴に積む）。

## 反映（配線）
- 既存の各ハンドラ（field/style/theme/element/photo/reset）を **reducer dispatch** に置換。component には present の `template`/`photo` を渡す。
- CardPreview の `onElementChange` → element編集の dispatch（drag/transform end）。Panel各操作 → 対応 dispatch（mergeKey 付き）。

## テスト/検証
- `npm run check` / `check:e2e` 緑。
- **historyReducer を純関数として単体テスト**（edit / undo / redo / coalesce / 上限 / reset）。
- 最小E2E：編集 → Undoで戻る → Redoでやり直し。

## 受け入れ基準（完了確認コマンド）
- 各種編集（内容/スタイル/テーマ/配置/写真）後に **Undoで1つ前、Redoでやり直し**できる。
- 連続入力/連続slider は **1回のUndoでまとめて戻る**（coalesce）。drag/resize は 1ジェスチャ＝1エントリ。
- **Ctrl+Z / Ctrl+Shift+Z（Ctrl+Y）**で動く。ボタンの有効/無効が正しい。
- 「既定に戻す」も Undo で戻せる。履歴は上限でクランプ。
- 既存（編集/配置/写真/PNG/スクショ）が壊れていない。

## スコープ外（厳守）
- 複数テンプレ・JSON保存/読込・localStorage（0011）。
- 印・校章ジェネレーター、選択要素の情報表示/キーボード移動（別スライス）、SNS書き出し、ビジュアル回帰テスト。
- 選択状態（`selectedElementId`）の履歴化（selectionは履歴外のまま）。

## 完了後
- `docs/STATUS.md` / `docs/devlog.md` 更新。
