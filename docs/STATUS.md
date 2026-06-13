# STATUS — charashou

状態の単一原本。新しいセッション/Codexは AGENTS.md の次にここを読む。

## Done
- handoffs/0015a-background-pattern-generator：背景地紋をrepeatText/stripe/dots/rosetteLiteの編集可能ジェネレーターへ拡張。専用UI、テーマ色連動/個別色、旧pattern移行、保存/履歴/3倍PNG反映を追加。
- handoffs/0014a-parametric-decorations-presets：校章/印/透かし/背景地紋を判別可能な生成パラメータ＋Konva手続き描画へ移行。デザインタブに各3プリセット、旧保存データ補完、Undo/JSON/IndexedDB/3倍PNG反映を追加。
- handoffs/0013b-inspector-photo-crest-discoverability：右インスペクタをtext/写真/校章/印へ拡張。共通の位置・サイズと写真調整を既存template/photo stateへ接続し、クリック案内・ホバー枠・pointerカーソルで発見性も改善。
- handoffs/0013-right-inspector-text：`selectedElementId`をAppへ持ち上げ、テキスト選択時だけ開く右スライドインスペクタを追加。内容/X/Y/文字サイズ/色は既存template stateを更新し、選択は履歴外。
- handoffs/0012-left-panel-tabs-mycards-grid：左パネルを「内容/デザイン/写真/マイカード」のARIAタブへ再編し、保存カードを2列サムネイルグリッド化。既存コントロールとロジックは維持。
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

## コンセプト（2026-06-13 確定）
- charashou＝**創作キャラの身分証メーカー（学生証起点）**。同人/オリキャラの設定資料集に貼る用。ターゲット＝AIは使えるが自作デザインは苦手な層。
- 装飾の役割分担：**背景地紋/透かし/丸印＝アプリ生成**、**校章/紋章＝アップロード＋AIプロンプト補助**、同梱素材はCC0等の安全な抽象のみ最小限。校章の本格生成は追わない。

## Doing
- なし。

## Next
- 0015b：丸印（ハンコ）ジェネレーターの編集UI（外周/中央文字・色・線幅・サイズ・濃さ）。
- 0015c：校章/印/背景の**アップロードスロット**＋**AIプロンプト補助**（用途/雰囲気/テーマ色を埋めた生成プロンプトをコピー→外部AIで生成→透過PNGをアップロード）。
- 0016：複数テンプレ（学生証深掘り→社員証→ギルド/魔法学校）＋`assetSlots`抽象＋切替（保存して新規作成）。※装飾スロット前提で後から。
- 0013c以降（小）：左「内容」のスタイルを段階的に右へ移設、右パネルのピン留め/localStorage永続化＋かぶり対策、画面幅別レスポンシブ。
- 後（レビュー候補）：レスポンシブ/スマホ簡易編集（下部タブ＋ドロワー）／編集の最低ライン（複製/前面背面/レイヤー）／選択要素情報＋キーボード移動／立ち絵向け枠／SNS用書き出し／ビジュアル回帰テスト(`npm run visual`)／WebP・PDF／Tauri。

## 保留
- Boothでテンプレ販売（収益の芽）。
