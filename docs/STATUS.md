# STATUS — charashou

状態の単一原本。新しいセッション/Codexは AGENTS.md の次にここを読む。

## Done
- handoffs/0007-free-positioning-editor：内容要素(text/写真/校章/印)の選択・ドラッグ・リサイズ、カード／他要素へのスナップとガイドラインを実装。textはscaleをwidth/height/fontSizeへ変換し、frameは固定。操作E2Eも追加。
- handoffs/0006-konva-render-migration：カード描画をreact-konvaへ移行。座標要素モデル、Konva 3倍PNG、Canvas画像差分E2Eへ切替。対話機能は未実装。
- handoffs/0005-template-json-property-panel：固定カードをTemplate型へ移行し、全体テーマ＋項目ごとの内容/スタイル編集パネルを追加。既定見た目と既存の写真/PNG挙動を維持。
- handoffs/0004-biome-github-actions：Biomeを導入し、GitHub Actionsでlint/test/build/E2EとPages配信を自動化。
- handoffs/0003-validation-guardrails：Vitest + Playwright最小E2E + `npm run check` / `check:e2e` を追加。手動ブラウザ確認を減らす運用を `docs/validation.md` と `AGENTS.md` に明文化。
- handoffs/0002-vite-react-ts：Vite ＋ React ＋ TypeScript へ移行。挙動/見た目パリティ、クライアント完結、`npm run build` 成功。
- handoffs/0001-dark-chrome：アプリ外枠を dark chrome 化。`app.js` と `#card` 本体は未変更。
- MVP最小版（`index.html`/`style.css`/`app.js`）：フィールド連動・顔写真アップロード・PNG書き出し。**実機で動作確認済**。
- `scripts/`（UTF-8安全 read/append）配置。
- Phase 0 ドキュメント：AGENTS.md / STATUS.md / docs/handoffs/ / docs/devlog.md。
- **Phase 0 完了**：public公開 `github.com/ftiv-lab/charashou` ＋ GitHub Pages（main/root）→ `https://ftiv-lab.github.io/charashou/`。

## Doing
- 次のhandoff待ち。

## Next
- 0008：写真のズーム/トリミング ＋ アップロード検証(accept/サイズ/エラー) ＋ 保存中表示。
- 0009：印・モノグラム校章ジェネレーター（＋アップロード）。
- 0010：複数テンプレ（学園/魔法学校/ギルド/サイバー/VTuber…）＋切替＋JSON保存/読込＋localStorage。
- 後：ビジュアル回帰テスト／WebP・PDF／Tauri。

## 保留
- Boothでテンプレ販売（収益の芽）。
