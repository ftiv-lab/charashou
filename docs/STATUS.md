# STATUS — charashou

状態の単一原本。新しいセッション/Codexは AGENTS.md の次にここを読む。

## Done
- MVP最小版（`index.html`/`style.css`/`app.js`）：フィールド連動・顔写真アップロード・PNG書き出し。**実機で動作確認済**。
- `scripts/`（UTF-8安全 read/append）配置。
- Phase 0 ドキュメント：AGENTS.md / STATUS.md / docs/handoffs/ / docs/devlog.md。

## Doing
- **Phase 0**：git init → GitHubリポジトリ → GitHub Pages 公開。

## Next
- **handoffs/0001-dark-chrome**：アプリ外枠を“おしゃれな暗い道具”に（デザイン・トークン適用）。
- Phase 1：描画を純関数に切り出し → Vitest ＋ Biome ＋ GitHub Actions CI（TDD開始）。
- Phase 2：Playwright E2E（入力→反映／写真→表示／PNG出力）。
- カスタム性：テンプレJSON化 → 複数テンプレ → 校章/印アップロード → テンプレ・エディタ。

## 保留
- Phase 3：Vite ＋ TypeScript 移行（意図的な学習回）。
- Boothでテンプレ販売（収益の芽）。
