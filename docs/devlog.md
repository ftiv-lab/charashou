# devlog — charashou

つまづき／学びの逐次メモ（1行でOK・後で Note 化）。新しいものを上に。

## 2026-06-12
- Phase 0 開始：AGENTS.md / STATUS / handoffs / devlog を整備。Codexは repo内だけで完結させる方針。
- `start.bat` の日本語コメントでUTF-8を疑った → **batはASCIIのみ**に修正。`scripts/*.ps1` でUTF-8安全な読み書き。
- **html2canvas + 日本語フォント**：`await document.fonts.ready` の後にキャプチャしないと明朝が崩れる。
- MVPは一発で動作。顔写真アップロード→合成→PNG出力までOK。自分の絵を載せられる＝狙いの差別化が動いた。
