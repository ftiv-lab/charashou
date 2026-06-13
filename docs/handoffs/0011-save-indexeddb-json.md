# ハンドオフ 0011 — 保存（IndexedDB 保存カード一覧 ＋ 自動保存 ＋ JSON書き出し/読み込み）

- 作成：Claude / 2026-06-13
- 状態：未着手

## 目的
作ったカードを**失わず・翌日また編集**できるように。**サーバ無しのまま**、保存の便利さを入れる：
- **IndexedDBの“保存カード一覧”**（アプリが覚えてて一覧から選び再編集＝ファイル迷子ゼロ）。
- **現在カードの自動保存**（リロードしても作業が消えない）。
- **JSON書き出し/読み込み**（バックアップ・別PC移行・共有の保険＝IndexedDBが消えても復元できる）。

## 採用ライブラリ（2026標準・調査済み）
- **Dexie.js ＋ dexie-react-hooks**：IndexedDBのアプリ的データの定番。型付きテーブル/トランザクション/スキーマ版管理＋**`useLiveQuery`** で**保存一覧がDB変更に応じ自動再描画**（手動state同期不要）。この“一覧＋CRUD”用途は idb(最小) より Dexie が楽。
- 取り込みJSONの検証は **Zod（推奨）or 自前の型ガード**（信頼できない入力なので必須）。
- ※localStorageは同期でメイン阻害＋~5MB＝写真込みに不適。**保存も自動保存も全部 Dexie(IndexedDB)** に。
- 依存追加：`dexie` `dexie-react-hooks`（＋採用するなら `zod`）。

## データ設計
```ts
// 既存：EditorDocument = { template: Template; photo: PhotoState }
interface SavedCard {
  id: string;          // uuid（crypto.randomUUID）
  name: string;        // ユーザー命名（既定：テンプレ名＋日時）
  createdAt: number;
  updatedAt: number;
  thumbnail: string;   // 一覧用の小さいPNG dataURL（Konva stage から低pixelRatioで生成）
  doc: EditorDocument;
}
// Dexie: cards(id, updatedAt) ／ meta(key)   ※ meta["current"] = 自動保存の現在doc
```

## 機能
- **保存**：現在カードを SavedCard として保存（新規）。読込済みカードを編集中なら「**上書き保存／別名で保存**」。`thumbnail` は保存時に **stageRef の `toDataURL({ pixelRatio: ~0.3 })`** で生成。
- **保存カード一覧**（`useLiveQuery`）：サムネ＋名前＋updatedAt。各カードに **読込／複製／名前変更／削除**。
- **自動保存**：編集のたびに **デバウンス（~2秒）** で `meta["current"] = history.present` を書く。**起動時に `meta["current"]` があればそれで履歴を初期化**（無ければ既定テンプレ）。
- **JSON書き出し**：現在doc（または選択カード）を `charashou-<name>.json` でダウンロード。
- **JSON読み込み**：ファイル→parse→**検証（Zod/型ガード）**→**ドキュメント全置換＋履歴リセット**（＋任意で保存一覧へ追加）。不正は弾いて**エラー表示（aria-live）**。
- **永続化**：初回保存時（またはマウント時）に **`navigator.storage.persist()`** を要求。
- **UIに一言**：「ブラウザに保存。**大事なものはJSON書き出し**を」。

## Undo/Redo（0010）との関係
- 自動保存＝`history.present` を保存。**カード読込/JSON読込＝ドキュメント全置換＋履歴クリア**：`historyReducer` に `LOAD`（next を present に、past/future クリア）を追加 or `createHistoryState(next)` で再初期化。
- 「既定に戻す」は従来どおり（RESETで履歴に積む）。自動保存・読込はUndoのEDIT対象にしない。

## UI（パネルに“保存・読込”セクションを追加）
- 「保存」ボタン、**保存カード一覧**（サムネ/名前/読込/複製/改名/削除）、**JSON書き出し/読み込み**ボタン、**自動保存インジケータ**（「自動保存しました」aria-live）。
- ※パネルが縦に長い問題（タブ化等）は**別スライス**。ここでは“保存・読込”セクション追加のみ。

## テスト/検証
- `npm run check` / `check:e2e` 緑。
- **純ロジックを単体テスト**：JSON検証（正常/不正）、SavedCard整形、デバウンス（fakeタイマー）。Dexie操作はモック/最小に（DB依存を薄く）。
- E2E：保存→一覧に出る→読込で復元／JSON書き出し→読み込みで復元／**リロードで現在カード復元**／不正JSONはエラー。

## 受け入れ基準（完了確認コマンド）
- 現在カードを**保存**でき、**一覧から読込**で再編集（サムネ表示）。複製/改名/削除も。
- **リロードしても作業が消えない**（自動保存）。
- **JSON書き出し→読み込み**で復元。**不正JSONはエラー表示**で弾く。
- 既存（編集/配置/写真/Undo-Redo/PNG/スクショ）が壊れていない。`navigator.storage.persist()` を要求。

## スコープ外（厳守）
- 複数テンプレ・テンプレ毎フィールド（0012）。
- バックエンド/アカウント/端末間同期/URL共有（要サーバ＝将来）。
- パネルのタブ化、写真のBlob化最適化（doc内dataURLのまま）、SNS書き出し、生成機能。

## 完了後
- `docs/STATUS.md` / `docs/devlog.md` 更新。
