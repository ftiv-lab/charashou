# STATUS — charashou

状態の単一原本。新しいセッション/Codexは AGENTS.md の次にここを読む。

## Done
- handoffs/0011-save-indexeddb-json：Dexie/useLiveQueryによる保存カード一覧とCRUD、約2秒の現在カード自動保存・起動時復元、Zod検証付きJSON書き出し/読込、Storage Persistence要求を実装。カード/JSON読込は履歴をクリア。
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
- **handoffs/0012-left-panel-tabs-mycards-grid**：左パネルを「内容/デザイン/写真/マイカード」のタブ化＋保存カードをサムネイル・グリッド化（レイアウト整理のみ・新機能なし）。council(Claude+ChatGPT)一致＝段階導入Step1+2。

## Next
- 0013：右インスペクタ（文脈依存：未選択=全体テーマ／要素選択=その要素のスタイル・位置）＋`selectedElementId`をAppへ持ち上げ＋左/中央/右の3ペイン化。
- 0014：複数テンプレ（学園/魔法学校/ギルド/サイバー/VTuber…）＋テンプレ毎フィールド構成＋切替（左「テンプレート」タブへ）。
- 0015：印・モノグラム校章ジェネレーター（＋アップロード）。
- 後（レビュー候補）：レスポンシブ/スマホ簡易編集（下部タブ＋ドロワー）／編集の最低ライン（複製/前面背面/レイヤー）／選択要素情報＋キーボード移動／立ち絵向け枠／SNS用書き出し／ビジュアル回帰テスト(`npm run visual`)／WebP・PDF／Tauri。

## 保留
- Boothでテンプレ販売（収益の芽）。
