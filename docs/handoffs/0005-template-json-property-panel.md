# ハンドオフ 0005 — テンプレJSON化 ＋ プロパティパネル ＋ 全体テーマ

- 作成：Claude / 2026-06-12
- 状態：実装済み

## 目的
今の固定カードを**丸ごとカスタマイズ可能**にする。各項目の**内容＋スタイル（フォント/サイズ/太さ/色/揃え）**を編集でき、**全体テーマ（色/背景/帯/ベースフォント/透かし）**も変えられるようにする。土台は **テンプレJSON（Template型）**。**既定値ではカードの見た目は現状と完全パリティ**。

> 背景：今は「借りた1枚の模写」状態で、カスタム性が無いと使い物にならない（ユーザー指摘）。FTIV流のプロパティパネル方式で「項目ごとの細かい調整」を、破綻させずに入れる。

## 対象/成果物
- 新規：`src/card/template.ts`（型＋既定テンプレ）。`src/components/` にプロパティパネル系コンポーネント（例：`ThemePanel.tsx` / `FieldEditor.tsx`）。
- 改修：`src/App.tsx`（state を `template` 中心に）、`src/components/Form.tsx`（or 置換）、`src/components/CardPreview.tsx`（template/テーマ駆動に）、`src/card/fields.ts`（`template.ts` へ吸収 or 既定の供給元に）、`src/index.css`（テーマをCSS変数で受ける微調整）。
- テスト更新：既存 Vitest / Playwright が**緑のまま**になるよう追従（参照しているキー/ラベルは維持）。

## データモデル（このまま採用・inline）
```ts
export type FieldKey =
  | "schoolName" | "schoolRoman" | "title" | "grade" | "name"
  | "nameRoman" | "birth" | "expiry" | "statement" | "issuer";

export type FieldStyle = {           // 省略時はCSS既定＝パリティ
  fontFamily?: string;               // 下記フォント選択肢のCSS値
  fontSize?: number;                 // px
  fontWeight?: 400 | 500 | 700;
  color?: string;                    // #hex
  align?: "left" | "center" | "right";
};

export type FieldSchema = {
  key: FieldKey;
  label: string;
  type: "text" | "textarea";
  value: string;                     // 内容（初期値）
  style?: FieldStyle;
};

export type ThemeConfig = {
  cardBg: string;        // カード背景（既定 #ffffff）
  bandColor: string;     // ピンク帯（現 --card-pink）
  textColor: string;     // カード文字（現 --card-ink）
  crestAccent: string;   // 校章/印アクセント（現 --card-accent）
  baseFont: string;      // カードのベースフォント
  watermarkText: string; // 透かし文字（空文字なら非表示）
  watermarkOpacity: number; // 0–0.5
};

export type Template = {
  id: string;
  name: string;
  size: { width: number; height: number }; // 680 x 430
  theme: ThemeConfig;
  fields: FieldSchema[];
};

export const DEFAULT_TEMPLATE: Template = { /* コロンド学生証を現状の見た目で表現 */ };
```
- `DEFAULT_TEMPLATE` は**現状のカードを完全再現**（fieldsの初期value＝現 `DEFAULT_FIELD_VALUES`、styleは原則未指定でCSS既定に任せる。theme＝現在のトークン値：bandColor=現ピンク, textColor=現インク, crestAccent=現アクセント, baseFont=現状, watermarkText="COROND JOSHI GAKUIN ", watermarkOpacity=現状）。

## UI（左パネル＝編集／FTIV流プロパティパネル）
- **テーマ（全体）セクション**：cardBg / bandColor / textColor / crestAccent を `<input type="color">`、baseFont を選択、watermarkText を text、watermarkOpacity を range。**透かしは編集可＝任意（空にすれば消える）。強制透かしは入れない。**
- **項目セクション**：各 field を行で表示。行内に **内容入力**（text/textarea）＋ **「スタイル」開閉**（fontFamily 選択 / fontSize 数値 / fontWeight 選択 / color / align）。＝項目ごとの細かい調整。
- **「既定に戻す」ボタン**（`setTemplate(DEFAULT_TEMPLATE)`）。
- フォント選択肢（最小・後で追加可）：**明朝＝`"Noto Serif JP", serif`** / **ゴシック＝`"Noto Sans JP", sans-serif`**（必要なら2–3個まで）。`index.html` のGoogle Fonts読込はそのまま利用。

## 反映（CardPreview）
- カードは `template`（fields の value/style）＋ `theme`＋`photoDataUrl` から描画。
- テーマは**カードルート要素にCSS変数 inline**で適用（既存の `--card-ink/--card-pink/--card-accent` 等にマッピング）。bandColor/textColor/crestAccent/baseFont/watermark を反映。
- 各 field 要素には `style` を**インラインstyle**で適用（fontFamily/fontSize/fontWeight/color/textAlign）。未指定はCSS既定（＝パリティ）。
- `id="card"` と既存クラス名・`data-field` 属性は**維持**（テスト/E2Eが参照）。

## 受け入れ基準（完了確認コマンド）
- `npm run check` 緑（Biome＋Vitest＋build）。
- `npm run check:e2e` 緑（Playwright）。
- **既定状態でカードの見た目が現状と一致（パリティ）**。
- 各項目の 内容＋フォント/サイズ/太さ/色/揃え を変えると**プレビュー即反映**。
- テーマ（背景/帯/文字/アクセント/ベースフォント/透かし文字・濃さ）を変えると即反映。透かしは空文字で消える。
- 「既定に戻す」で初期状態へ。
- 顔写真アップロード・PNG書き出し（3倍）が**従来どおり動く**。

## スコープ外（やらない＝厳守。前回0002で前倒し実装が起きたため明記）
- **写真のトリミング/位置/拡大**（→ 0006）。
- **画像アップロード検証 / toBlob / 保存中表示**（→ 0006）。
- **印・校章ジェネレーター**（→ 0007）。
- **複数テンプレ・テンプレ切替・JSON保存/読込・localStorage**（→ 0008）。
- 自由配置(ドラッグ)エディタ / react-konva / バックエンド / 新フォントの大量追加。
- カードの既定見た目の変更（パリティ維持）。

## 完了後
- `docs/STATUS.md` を更新、`docs/devlog.md` に学び1行。
