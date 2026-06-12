# キャラ証（charashou）

オリジナルキャラの**学生証/身分証風カード**を作るブラウザツール。
顔写真・名前・学校名・学年などを差し替えて、PNGで書き出せる。

> 作る人（同人/創作）が、**自分の絵（ComfyUI/イラスト）を載せて設定資料カードを作る**ための道具。
> （汎用「学生証メーカー」と違い、創作者の設定資料用途に寄せていく方針）

## 使い方
1. `npm install` → `npm run dev` で開発サーバを起動。
2. 左の項目を編集 → 右のカードに即反映。顔写真もアップロード可。
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

整形・lint：
```bash
npm run lint
npm run lint:fix
```

## 技術
- Vite ＋ React ＋ TypeScript（クライアント完結）
- react-konva / KonvaでCanvas描画→3倍PNG
- Biome ＋ Vitest ＋ Playwright最小E2Eで品質と既存挙動を固定
- GitHub ActionsでCIとGitHub Pages配信
- フォント：Noto Serif JP / Noto Sans JP（Google Fonts）
- 仕組み：テンプレJSONの座標要素をKonva Stageへ描画。差し替え＝React stateでテキスト/画像/テーマを変える。

### 注意（ハマりどころ）
- **日本語フォントは読み込み完了を待ってからKonvaを再描画・書き出し**（`await document.fonts.ready`）。待たないと明朝が反映されない。
- 外部URLの画像はCORSで出力できないことがある → 写真はアップロード（dataURL）でOK。

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
