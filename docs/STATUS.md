# STATUS — charashou

状態の単一原本。新しいセッション/Codexは AGENTS.md の次にここを読む。

## Done
- handoffs/0010-undo-redo：`template`＋`photo`をpast/present/futureで管理する純粋historyReducer、50件上限、mergeKey coalesce、Undo/RedoボタンとCtrl系ショートカットを実装。選択は履歴外、drag/resizeは1ジェスチャ1履歴。
- handoffs/0009-review-screenshots：Playwright専用設定と `npm run shots` で、全体／カスタム／自前生成写真／Transformer＋ガイド／パネルの5枚を固定名生成しREADMEへ埋め込み。検証E2Eとは分離。
- handoffs/0008-photo-adjust-upload-export：写真のズーム/横位置/縦位置slider、PNG/JPEG/WebP・10MB上限のアップロード検証とaria-liveエラー、保存中表示、Konva toBlob書き出しを実装。
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
- **handoffs/0011**：保存（Dexie/IndexedDBの“保存カード一覧”＋自動保存＋JSON書き出し/読み込み＋`persist()`）。「翌日また編集／ファイル迷子」を解消。サーバ無し維持。

## Next
- 0012：複数テンプレ（学園/魔法学校/ギルド/サイバー/VTuber…）＋**テンプレ毎にフィールド構成**＋切替。←“創作カードエディタ”化の本丸。
- 0013：印・モノグラム校章ジェネレーター（＋アップロード）。
- 後（レビュー候補）：編集の最低ライン（複製/前面背面/レイヤー）／選択要素情報＋キーボード移動／立ち絵向け枠／SNS用書き出し／ビジュアル回帰テスト(`npm run visual`)／WebP・PDF／Tauri。

## 保留
- Boothでテンプレ販売（収益の芽）。
