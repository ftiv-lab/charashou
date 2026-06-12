# AGENTS.md — charashou

> このファイルは **AIコーディングエージェント（Claude / Codex）と新規セッションが最初に読む文脈ファイル**。
> 原則：**このリポジトリの中だけで作業が完結するように書く**（Codexは repo の外＝IdeaLab等を読めない）。

## プロジェクト概要
**キャラ証（charashou）** ＝ オリジナルキャラの**学生証/身分証風カード**を作るブラウザツール。
顔写真・名前・学校名・学年などを差し替えてPNG書き出し。
- 狙い：創作者が**自分の絵（ComfyUI/イラスト）を載せて設定資料カードを作る**（汎用「学生証メーカー」やPicrew＝パーツ式 との差別化）。
- 位置づけ：**learn in public の第一作**。完璧より前進。発信（Note）を開発の副産物にする。

## 技術スタック
- **Vite ＋ React ＋ TypeScript ＋ react-konva**（**クライアント完結・バックエンド無し**）。Konva Stageでカード描画・3倍PNG書き出し、Noto JPフォント。`vite.config` の `base:'./'`（Pagesサブパス＋将来のzip/file:// 両対応）。
- 旧：素のHTML/CSS/JS（`index.html`/`style.css`/`app.js`）→ React版へ置換。
- 品質：**Biome** ＋ **Vitest**（unit/component）＋ **Playwright最小E2E**。検証ルールは `docs/validation.md`。
- CI/配信：GitHub Actionsで品質ゲートを実行し、main成功時にViteの `dist/` をGitHub Pagesへ配信。
- 商品化方針：Booth配布(zip)／**Tauri(.exe)**／テンプレ販売。**バックエンド/認証/DBは入れない**。

## コマンド
- 開発：`npm install` → `npm run dev`（Vite開発サーバ）。ビルド：`npm run build`（`dist/` 出力）。確認：`npm run preview`。
- 検証：通常は `npm run check`。UI/写真/PNG出力に触れたら `npm run check:e2e`。整形は `npm run format`、CI相当は `npm run ci`。
- UTF-8読み取り：日本語Markdownが文字化けする場合は `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\read-utf8.ps1 .\AGENTS.md` のように読む。`docs/STATUS.md` や `docs/handoffs/*.md` も同様。

## ディレクトリ
- `index.html` / `src/` … 本体（Vite + React + TypeScript）
- `e2e/` … Playwright最小E2E
- `review/` / `playwright.screenshots.config.ts` … READMEレビュー用スクリーンショット生成（検証E2Eとは分離）
- `docs/screenshots/` … `npm run shots` が固定名で上書きする現状スクリーンショット
- `.github/workflows/` … CIとGitHub Pages配信
- `scripts/` … UTF-8安全な読み書き（PowerShell・`read-utf8.ps1` / `append-utf8.ps1`）
- `docs/STATUS.md` … **状態の単一原本**（Done/Doing/Next/保留）。まず読む。
- `docs/handoffs/` … **1スライス1ブリーフ**（実装依頼。文脈をinlineで含む）
- `docs/validation.md` … **検証ルール**（手動ブラウザ確認を増やさないためのコマンド運用）
- `docs/devlog.md` … つまづき/学びの逐次メモ（発信の素）
- `SPEC.md` … カードの仕様・フィールド

## 役割分担
- **Claude**：設計・レビュー・**ブリーフ作成**・検証・サインオフ。
- **Codex**：ブリーフに沿って**実装**（GPT-5.2-Codex）。
- **オーナー（人）**：方針決定・実機確認・git/公開。

## ワークフロー（1スライスの回し方）
1. Claudeが `docs/handoffs/NNNN-xxx.md` にブリーフ（目的/対象ファイル/やること/受け入れ基準/スコープ外/**文脈inline**）。
2. **Codexが実装**。
3. Claudeが検証（差分確認＋（将来）lint/test/build）→ サインオフ。
4. `docs/STATUS.md` 更新 → コミット。
5. つまづき/学びは `docs/devlog.md` に1行（後でNote化）。

## コーディング規約
- **文字コード＝UTF-8（BOM無し）**。**`.bat` はASCIIのみ**（日本語コメント禁止）。ファイル追記は `scripts/append-utf8.ps1` を使う。
- 変更は**小さく**。既存のスタイル・命名に合わせる。
- TypeScript/TSX/JSON/CSSはBiomeでformat/lintする。手編集後は `npm run lint`、自動修正は `npm run lint:fix`。
- **日本語フォントは描画前に読込待ち**（`document.fonts.ready` 後にKonva Layerを再描画し、PNG出力前にも待つ）。待たないと明朝が崩れる。
- 写真は `FileReader`→dataURL（外部URLはCORSで出力不可になり得る）。
- 写真アップロードはPNG/JPEG/WebP・10MB以下をFileReader前に検証し、`zoom/offsetX/offsetY` はパネルsliderで調整する。キャンバスドラッグは写真枠の移動であり、画像内部のパンには使わない。
- Konvaの内容要素（text/image/crest/seal）は編集対象、frame（背景/帯/透かし）は固定。text変形はscaleを残さず `width/height/fontSize` へ確定する。選択枠とガイドの `editor-ui` LayerはPNG出力へ含めない。
- 編集ドキュメント（`template`＋`photo`）は `src/card/history.ts` の履歴reducerで管理する。連続入力／sliderはmergeKeyでまとめ、drag/resize・upload・resetは独立履歴。選択・保存中表示などのUI状態は履歴へ入れない。

## 検証プロトコル（重要）
- 手動ブラウザ確認より先に `docs/validation.md` のコマンドを使う。
- 通常変更：`npm run check`（Biome + Vitest + build）。
- UI/写真/PNG出力変更：`npm run check:e2e`。
- レビュー用画像の更新：`npm run shots`。成果物生成専用であり、`check` / `check:e2e` / CIには含めない。
- Playwright E2Eは dev server を自動起動するため、E2E用に別途 `npm run dev` を常駐させない。
- dev serverを手で起動した場合、作業終了前に必ず止める。
- 新しいhandoffには「完了確認コマンド」を必ず書く。
- GitHub上の最終ゲートは `.github/workflows/ci-pages.yml`。Claudeレビュー時はActions結果も確認する。

## Done の定義
- ブリーフの受け入れ基準を満たす／既存機能（編集→反映・写真アップ・PNG保存）が壊れていない／必要な確認コマンド（通常 `npm run check`、UI系 `npm run check:e2e`）が成功。

## さらに深い背景（人間/Claude用・Codexは読めなくてよい）
- 壁打ち記録・競合・設計プラン：`E:\IdeaLab\2026-06-12-charashou-*.md`、発信/学習：`E:\IdeaLab\charashou\`。
- ※ここに依存しないこと。**実装に必要な文脈は必ずブリーフ/SPEC/STATUSにinlineで書く**。
