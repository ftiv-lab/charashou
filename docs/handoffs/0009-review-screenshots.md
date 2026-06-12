# ハンドオフ 0009 — レビュー用スクリーンショット自動生成 ＋ README埋め込み

- 作成：Claude / 2026-06-12
- 状態：未着手

## 目的
開発段階ごとに**機能を網羅したスクショを Playwright で自動撮影**し、`docs/screenshots/`（**固定ファイル名＝上書き**）＋ README に貼る。**外部AI（ChatGPT等）がGitHubを見るだけで現状の見た目と機能を理解**でき、客観レビューを効率化する。
- 背景：本番URLはReact SPA＋Konva Canvasのため、JSを実行しないAIには空ページに見え、カードもcanvas(画像)で読めない。→ **スクショをREADMEに置く**のが費用対効果◎。
- 古いスクショ＝**固定名の上書きで置換**（git履歴が過去版の保管）。stage毎アーカイブはしない（git履歴で足りる）。

## 何を撮るか（機能網羅・5枚程度・固定名）
- `docs/screenshots/01-overview.png`：アプリ全体（左パネル＋右カード・既定状態）。
- `docs/screenshots/02-customize.png`：テーマ/項目スタイルを変えた状態（色・フォント変更が分かる）。
- `docs/screenshots/03-photo.png`：写真を入れ、ズーム/位置を調整した状態（**著作権フリーの自前生成プレースホルダ画像**を使用）。
- `docs/screenshots/04-editor.png`：要素を選択して **Transformer＋スナップ用ガイド**が出た状態（自由配置が分かる）。
- `docs/screenshots/05-panel.png`：プロパティパネル拡大（テーマ＋項目＋写真コントロール）。

## 仕組み（実装）
- `e2e/screenshots.spec.ts`（または `scripts/`）：Playwrightで各状態を作り `page.screenshot()`。**既存の playwright webServer（dev起動）設定を再利用**。
- **専用npmスクリプト**（例 `"shots": "playwright test screenshots ..."`）で**手動再生成**。**通常の `npm run check` / `check:e2e`（検証）には含めない**（これはテストでなく成果物生成）。
- 出力は `docs/screenshots/`（固定名・上書き）。viewportは見やすい解像度（例 1280×800〜）。
- **写真プレースホルダ**：実在キャラ画像は使わず、**dataURL等で自前生成**（グラデ＋簡易シルエット等）。
- **README**：`## スクリーンショット` 節を追加し、5枚を**キャプション付きで埋め込み**（相対パス）。「自動生成の現状スクショ（レビュー/AI用）。更新は `npm run shots`」と明記。

## 受け入れ基準（完了確認）
- `npm run shots`（名称任意）で `docs/screenshots/*.png` が再生成される（固定名・上書き）。
- READMEに5枚程度が説明付きで表示（GitHub上で見える相対パス）。
- 既存の `npm run check` / `check:e2e` が**緑のまま**（スクショspecは検証E2Eを汚さない＝別スクリプト）。

## スコープ外（厳守）
- CIでの自動撮影/自動コミット（今回は手動 `npm run shots`）。
- stage毎のアーカイブ蓄積（git履歴で足りる）。
- 印・校章ジェネレーター（0010）、複数テンプレ・保存（0011）。

## 完了後
- `docs/STATUS.md` / `docs/devlog.md` 更新。運用：機能を足したら `npm run shots`→コミット で README が最新化される。
