# devlog — charashou

つまづき／学びの逐次メモ（1行でOK・後で Note 化）。新しいものを上に。

## 2026-06-12
- Biome＋GitHub Actions導入：ローカルとCIの品質ゲートを揃え、main成功時にViteの `dist/` をPages配信する構成へ。
- 検証ガードレール追加：手動ブラウザ確認で重くなったため、`npm run check` と最小E2E `npm run check:e2e` を先に回す運用へ変更。
- Vite＋React＋TS移行完了：FIELD配列を型付き単一ソース化し、カードDOMはrefでPNG出力。見た目は旧CSSを `src/index.css` に移してパリティ維持。
- **Phase 0完了：public公開＋GitHub Pages有効化** → https://ftiv-lab.github.io/charashou/ 。build in publicの土台が立った。
- Codex連携の初回：handoffs/0001を渡す→実装→Claude差分レビュー→commit、のループが回った。AGENTS.mdに read-utf8.ps1 の読み方を追記（最初の読込が文字化けしたため）。
- dark chrome適用：カード本体は触らず、`.card-wrap` 内だけ旧カード色トークンを継承させて外枠の青アクセントと分離した。
- Phase 0 開始：AGENTS.md / STATUS / handoffs / devlog を整備。Codexは repo内だけで完結させる方針。
- `start.bat` の日本語コメントでUTF-8を疑った → **batはASCIIのみ**に修正。`scripts/*.ps1` でUTF-8安全な読み書き。
- **html2canvas + 日本語フォント**：`await document.fonts.ready` の後にキャプチャしないと明朝が崩れる。
- MVPは一発で動作。顔写真アップロード→合成→PNG出力までOK。自分の絵を載せられる＝狙いの差別化が動いた。
