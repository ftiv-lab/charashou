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

## スタック（決定 2026-06-12）
**Vite ＋ React ＋ TypeScript**（クライアント完結・バックエンド無し）。商品化＝Booth配布(zip)／Tauri(.exe)／テンプレ販売。詳細は `AGENTS.md`。

## 安全設計（公開・配布する場合）
ID系メーカーは偽造に使われ得るため、公開時は最初から健全側に倒す（由来＝マルチモデルcouncilでChatGPTが偽造リスクを指摘・採用）：
- **実在の学校名/ロゴは使わない**（架空前提・既定テンプレも架空のコロンド女子学院）。
- 必要に応じ **`SAMPLE`/`架空`/`FICTIONAL` 透かしオプション**（将来）。
- 名前 **「キャラ証」が既に“キャラ＝架空のID証”を示す**＝健全な方向（「学生証メーカー」より誤解されにくい）。
- 写真アップロードのサイズ/MIME検証（将来・公開機能を作る場合）。

## 次の拡張の指針
- テンプレを**JSON化**（背景/帯/座標/フォント/フィールド）→ 複数テンプレ＆テンプレ・エディタへ。エディタのドラッグ編集は **Konva（react-konva）** が候補。
- 校章/印を画像アップロード対応。
- 差別化＝「自分の絵 × 高品質テンプレ × 設定資料用途」。
