# キャラ証 — 設計メモ（SPEC）

元の壁打ち仕様：`E:\IdeaLab\2026-06-12-card-maker-spec.md`（要素分解の詳細）。ここはその実装版の要点。

## カードの構造
- `#card`（680×430px・position:relative・overflow:hidden）の中に層を重ねる：
  1. `.band`（z0）：上部96pxを残しピンク背景
  2. `.wm`（z1）：透かし（薄い繰り返し文字・回転）
  3. 内容（z2）：ヘッダ（校章＋学校名）／本文（写真＋タイトル＋各行）／証明文／発行者＋印
- 出力はこの `#card` DOM を html2canvas で scale:3 でPNG化。

## フィールド（差し替え対象）
| key | 内容 | 種別 |
|---|---|---|
| schoolName / schoolRoman | 学校名・ローマ字 | text |
| title | タイトル(学生証) | text |
| grade | 学年 | text |
| name / nameRoman | 氏名・ローマ字 | text |
| birth / expiry | 生年月日・有効期限 | text |
| statement / issuer | 証明文・発行者 | text |
| photo | 顔写真 | image(upload) |
| crest / seal | 校章・印 | （現状CSS。将来 image 化） |

- フォーム生成・連動の単一ソースは `app.js` の `FIELDS`。プレビュー側は `data-field="key"`。

## 次の拡張の指針
- テンプレを**JSON化**（背景/帯/座標/フォント/フィールド）→ 複数テンプレ＆テンプレ・エディタへ。
- 校章/印を画像アップロード対応。
- 差別化＝「自分の絵 × 高品質テンプレ × 設定資料用途」。
