# ハンドオフ 0003 — 検証ガードレール整備（Vitest + Playwright最小E2E）

- 作成：Codex / 2026-06-12
- 状態：実装済み

## 背景
0002のVite移行時、手動ブラウザ確認・DOM確認・PNG保存確認を都度ツールで行ったため、応答が重くなった。これはアプリ性能の問題ではなく、検証方法が手作業寄りだったことが主因。以後はまず機械的な確認コマンドで受け入れ基準を固定する。

## 目的
- Codex/Claudeの確認を `npm run check` / `npm run check:e2e` に寄せる。
- 手動ブラウザ操作の回数を減らす。
- 既存の重要挙動（入力反映・写真反映・PNG保存）を最小テストで固定する。

## 実装内容
- Vitest + jsdom + Testing Libraryを追加。
- Playwright最小E2Eを追加。
- `docs/validation.md` に検証ルールを追加。
- `AGENTS.md` に検証プロトコルを追加。

## 追加コマンド
- `npm run test`
- `npm run build`
- `npm run check`
- `npm run e2e`
- `npm run check:e2e`

## 受け入れ基準
- `npm run check` が成功する。
- `npm run e2e` が成功する。
- E2Eは dev server を自動起動し、作業後に手動サーバーを残さない。
- バックエンド/認証/DBは追加しない。
- テストは既存挙動の固定に限定し、新機能を追加しない。

## 運用ルール
- 通常変更は `npm run check`。
- UI/写真/PNG出力に触れた変更は `npm run check:e2e`。
- in-app Browserが使えない場合でも、すぐ手動確認に切り替えず `npm run e2e` を使う。
- 新しいhandoffには「完了確認コマンド」を必ず書く。
