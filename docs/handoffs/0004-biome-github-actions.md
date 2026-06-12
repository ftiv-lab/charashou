# ハンドオフ 0004 — Biome + GitHub Actions CI/Pages

- 作成：Codex / 2026-06-12
- 状態：実装済み

## 目的
ローカルとGitHubで同じ品質ゲートを使い、mainへ入ったViteビルドをGitHub Pagesへ自動配信する。Claudeレビューでは手動確認より先にActions結果を確認できる状態にする。

## 実装内容
- Biome v2を導入し、format/lint/import整理を統一。
- `npm run check` にBiomeを追加。
- CI専用 `npm run ci` を追加（Biome CI → Vitest → build → Playwright）。
- `.github/workflows/ci-pages.yml` を追加。
- pull request：検証のみ。
- main push / workflow_dispatch：検証成功後に `dist/` をGitHub Pagesへdeploy。

## 完了確認コマンド
- `npm run lint`
- `npm run check:e2e`
- `npm run ci`

## GitHub側で必要な設定
リポジトリの Settings → Pages → Build and deployment → Source を **GitHub Actions** にする。現在の main/root 配信から切り替える。

## スコープ外
- バックエンド・認証・DB。
- 複数ブラウザE2E。
- visual regression。
- Dependabot等の追加自動化。
