# STATUS — charashou

状態の単一原本。新しいセッション/Codexは AGENTS.md の次にここを読む。

## Done
- handoffs/0004-biome-github-actions：Biomeを導入し、GitHub Actionsでlint/test/build/E2EとPages配信を自動化。
- handoffs/0003-validation-guardrails：Vitest + Playwright最小E2E + `npm run check` / `check:e2e` を追加。手動ブラウザ確認を減らす運用を `docs/validation.md` と `AGENTS.md` に明文化。
- handoffs/0002-vite-react-ts：Vite ＋ React ＋ TypeScript へ移行。挙動/見た目パリティ、クライアント完結、`npm run build` 成功。
- handoffs/0001-dark-chrome：アプリ外枠を dark chrome 化。`app.js` と `#card` 本体は未変更。
- MVP最小版（`index.html`/`style.css`/`app.js`）：フィールド連動・顔写真アップロード・PNG書き出し。**実機で動作確認済**。
- `scripts/`（UTF-8安全 read/append）配置。
- Phase 0 ドキュメント：AGENTS.md / STATUS.md / docs/handoffs/ / docs/devlog.md。
- **Phase 0 完了**：public公開 `github.com/ftiv-lab/charashou` ＋ GitHub Pages（main/root）→ `https://ftiv-lab.github.io/charashou/`。

## Doing
- なし

## Next
- カスタム性：テンプレJSON化 → 複数テンプレ → 校章/印アップロード → テンプレ・エディタ（react-konva）。

## 保留
- Boothでテンプレ販売（収益の芽）。
