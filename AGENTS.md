# AGENTS.md — charashou

> このファイルは **AIコーディングエージェント（Claude / Codex）と新規セッションが最初に読む文脈ファイル**。
> 原則：**このリポジトリの中だけで作業が完結するように書く**（Codexは repo の外＝IdeaLab等を読めない）。

## プロジェクト概要
**キャラ証（charashou）** ＝ オリジナルキャラの**学生証/身分証風カード**を作るブラウザツール。
顔写真・名前・学校名・学年などを差し替えてPNG書き出し。
- 狙い：創作者が**自分の絵（ComfyUI/イラスト）を載せて設定資料カードを作る**（汎用「学生証メーカー」やPicrew＝パーツ式 との差別化）。
- 位置づけ：**learn in public の第一作**。完璧より前進。発信（Note）を開発の副産物にする。

## 技術スタック
- 現状：**素のHTML/CSS/JS ＋ html2canvas ＋ Noto JPフォント**（ビルド無し・`index.html`直開きで動く）。
- 将来（Phase 3・任意）：Vite ＋ TypeScript ＋ Vitest ＋ Playwright ＋ Biome（段階導入）。

## コマンド
- 起動：`index.html` をブラウザで開く（`start.bat` / `python -m http.server` でも）。
- UTF-8読み取り：日本語Markdownが文字化けする場合は `powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\read-utf8.ps1 .\AGENTS.md` のように読む。`docs/STATUS.md` や `docs/handoffs/*.md` も同様。
- （将来）`npm run dev` / `test` / `lint` / `build`。

## ディレクトリ
- `index.html` / `style.css` / `app.js` … 本体
- `scripts/` … UTF-8安全な読み書き（PowerShell・`read-utf8.ps1` / `append-utf8.ps1`）
- `docs/STATUS.md` … **状態の単一原本**（Done/Doing/Next/保留）。まず読む。
- `docs/handoffs/` … **1スライス1ブリーフ**（実装依頼。文脈をinlineで含む）
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
- **日本語フォントは描画前に読込待ち**（`await document.fonts.ready` の後に html2canvas。待たないと明朝が崩れる）。
- 写真は `FileReader`→dataURL（外部URLはCORSで出力不可になり得る）。

## Done の定義
- ブリーフの受け入れ基準を満たす／既存機能（編集→反映・写真アップ・PNG保存）が壊れていない／（将来）lint緑・test緑・build成功。

## さらに深い背景（人間/Claude用・Codexは読めなくてよい）
- 壁打ち記録・競合・設計プラン：`E:\IdeaLab\2026-06-12-charashou-*.md`、発信/学習：`E:\IdeaLab\charashou\`。
- ※ここに依存しないこと。**実装に必要な文脈は必ずブリーフ/SPEC/STATUSにinlineで書く**。
