# キャラ証（charashou）

オリジナルキャラの**学生証/身分証風カード**を作るブラウザツール。
顔写真・名前・学校名・学年などを差し替えて、PNGで書き出せる。

> 作る人（同人/創作）が、**自分の絵（ComfyUI/イラスト）を載せて設定資料カードを作る**ための道具。
> （汎用「学生証メーカー」と違い、創作者の設定資料用途に寄せていく方針）

## スクリーンショット
Playwrightで自動生成した現状スクリーンショットです（レビュー／AI参照用）。機能追加後は `npm run shots` で固定ファイル名へ上書きします。

### 全体
既定状態のプロパティパネルとカードプレビュー。

![キャラ証の全体画面](docs/screenshots/01-overview.png)

### カスタマイズ
テーマ色、氏名、フォントと文字サイズを変更した状態。

![テーマと文字スタイルを変更したカード](docs/screenshots/02-customize.png)

### 写真調整
テスト内で生成した架空キャラクター画像を入れ、ズームと位置を調整した状態。

![自前生成画像を使った写真調整](docs/screenshots/03-photo.png)

### 自由配置エディタ
氏名要素のTransformerと、カード中央へスナップするガイドライン。

![Transformerとスナップガイドを表示した編集状態](docs/screenshots/04-editor.png)

### プロパティパネル
全体テーマ、項目別スタイル、写真コントロールを含むパネル全体。

![プロパティパネル全体](docs/screenshots/05-panel.png)

## 使い方
1. `npm install` → `npm run dev` で開発サーバを起動。
2. 左の項目を編集、または右の内容要素を選択してドラッグ／リサイズ。顔写真はアップロード後にズームと位置を調整可能。
3. 「PNGで保存」で画像を書き出し（3倍解像度）。

ビルド確認：
```bash
npm run check
npm run build
npm run preview
```

UI/写真/PNG出力を触った時：
```bash
npm run check:e2e
```

レビュー用スクリーンショットを更新する時：
```bash
npm run shots
```

整形・lint：
```bash
npm run lint
npm run lint:fix
```

## 技術
- Vite ＋ React ＋ TypeScript（クライアント完結）
- react-konva / KonvaでCanvas描画→Blobベースの3倍PNG
- Biome ＋ Vitest ＋ Playwright最小E2Eで品質と既存挙動を固定
- GitHub ActionsでCIとGitHub Pages配信
- フォント：Noto Serif JP / Noto Sans JP（Google Fonts）
- 仕組み：テンプレJSONの座標要素をKonva Stageへ描画。内容要素は選択・移動・リサイズでき、カード／他要素へスナップする。

### 注意（ハマりどころ）
- **日本語フォントは読み込み完了を待ってからKonvaを再描画・書き出し**（`await document.fonts.ready`）。待たないと明朝が反映されない。
- 外部URLの画像はCORSで出力できないことがある → 写真はアップロード（dataURL）でOK。
- 顔写真はPNG/JPEG/WebP、10MB以下。クロップ調整はパネルのズーム／横位置／縦位置sliderで行う。

## ロードマップ
- [ ] 見た目を元イメージにさらに寄せる（位置・フォント・透かし・印）
- [ ] 校章・印を画像アップロード対応
- [ ] テンプレ複数化（社員証/免許証/ステータスカード）
- [ ] 学校名・色・背景も変えられる**テンプレ・エディタ**
- [ ] Boothで設定資料テンプレ配布

## メモ
- 設計の詳細：`SPEC.md`
- 検証ルール：`docs/validation.md`
- これは FTIVision とは**別プロジェクト**（独立リポジトリ）。
