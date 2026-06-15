# devlog — charashou

つまづき／学びの逐次メモ（1行でOK・後で Note 化）。新しいものを上に。

## 2026-06-15
- charashou を 0015a（背景地紋ジェネレーター）まで実装して**一旦停止**（中止ではない／いつでも再開可）。コンセプトは「創作キャラの身分証メーカー（学生証起点）」で確定。再開手順は `docs/STATUS.md` 冒頭の「現在の状態」を参照。次は自己学習用の別アイデアへ。

## 2026-06-13
- 背景地紋ジェネレーター：repeatText/クロスライン/dots/rosetteLiteを種類別パラメータで編集可能にし、テーマ色追従と個別色を両立。線幅0.5px前後・濃さ5%前後を既定にして、主役を邪魔しない身分証らしい密度へ寄せた。
- パラメータ装飾の最小コア：校章/丸印/反復透かし/背景地紋をgenerator駆動のKonva描画へ変更し、各3プリセットを追加。旧IndexedDB/JSONはZod読込時にgeneratorとpatternを補完し、複数テンプレ前でも保存形式を前進させた。
- 右インスペクタ全要素対応：text/写真/校章/印に共通の位置・サイズを出し、写真のzoom/offsetは既存photo stateへ直結。ホバー枠とpointerカーソル、案内文、種別別aria-liveも追加し、編集データの二重管理なしで発見性を上げた。
- 右インスペクタ最小版：選択状態をCardPreviewからAppへ持ち上げ、テキスト選択時だけ右から重なる編集パネルを追加。fieldKey付き／静的テキストのどちらも既存templateを直接更新し、選択と開閉はUndo履歴外に保った。
- 左パネル整理：内容／デザイン／写真／マイカードをARIAタブへ分離し、タブ列とリセットを固定したまま内容だけスクロールする構成へ。保存カードは2列サムネイルグリッド化し、既存ロジックを動かさず縦長問題を解消した。
- 保存と再開：Dexie/useLiveQueryで保存カード一覧とCRUD、`meta.current`への2秒デバウンス自動保存、起動時復元を追加。Zod検証付きJSONバックアップと `navigator.storage.persist()` も入れ、読込はLOADでUndo/Redo履歴をクリアする形に統一した。
- IndexedDBテスト：Vitestでは `fake-indexeddb` を共通setupへ入れ、テストごとにcards/metaを消去。Playwrightでは保存→再読込、CRUD、JSON往復、不正JSONまで実ブラウザで固定した。

## 2026-06-12
- Undo/Redo：template＋photoを純粋historyReducerへ移し、past/present/futureを50件上限で管理。同一入力とsliderはmergeKeyでまとめ、drag/resize・upload・resetは独立履歴、選択は履歴外に保った。
- レビュー用スクショ自動生成：検証E2Eとは別のPlaywright設定で5状態を固定名出力しREADMEへ埋め込み。写真素材もCanvasで自前生成し、`npm run shots` だけで現状レビュー資料を更新できるようにした。
- 写真調整と安全な書き出し：coverクロップをzoom/offsetで制御するslider、形式/10MB検証、aria-live通知を追加。PNGはtoBlob＋Object URLへ移し、保存中の連打も防止した。
- 自由配置エディタ：内容要素をKonva Transformerで選択・移動・リサイズ可能にし、カード／他要素へのスナップと操作中ガイドを追加。textはscaleを座標・寸法・fontSizeへ確定してぼけを防ぎ、操作E2Eまで固定した。
- Konva描画移行：カードを座標要素リストからCanvas描画し、Stageの3倍PNG出力へ変更。テストもDOM文字検索から状態＋Canvas画像差分へ移した。
- テンプレJSON＋プロパティパネル：既定CSSを上書きしないoptionalなFieldStyleにして、カスタム性と見た目パリティを両立した。
- **CI緑化＆Actions配信開始**：移行一式(0002-0004)をClaude検証(`npm run check`緑)→公開。途中で **`npm ci` が失敗**＝Windows生成のlockに**Linux用オプション依存(@emnapi)が無い**クロスOS問題。→ **CIを `npm install` に変更**で解決。Actions（lint+test+build+E2E→Pages）全緑。
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
