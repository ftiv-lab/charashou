export type FieldKey =
  | "schoolName"
  | "schoolRoman"
  | "title"
  | "grade"
  | "name"
  | "nameRoman"
  | "birth"
  | "expiry"
  | "statement"
  | "issuer";

export type FieldStyle = {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: 400 | 500 | 700;
  color?: string;
  align?: "left" | "center" | "right";
};

export type FieldSchema = {
  key: FieldKey;
  label: string;
  type: "text" | "textarea";
  value: string;
  style?: FieldStyle;
};

type ElementBase = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
};

export type TextElement = ElementBase & {
  kind: "text";
  fieldKey?: FieldKey;
  text?: string;
  fontFamily?: string;
  fontSize: number;
  fontWeight?: 400 | 500 | 700;
  color?: string;
  align?: "left" | "center" | "right";
  verticalAlign?: "top" | "middle" | "bottom";
  letterSpacing?: number;
  lineHeight?: number;
};

export type RectElement = ElementBase & {
  kind: "rect";
  role: "background" | "band";
  cornerRadius?: number | [number, number, number, number];
};

export type WatermarkElement = ElementBase & {
  kind: "watermark";
  fontFamily: string;
  fontSize: number;
  color: string;
  letterSpacing: number;
  lineHeight: number;
};

export type CrestElement = ElementBase & {
  kind: "crest";
};

export type PhotoElement = ElementBase & {
  kind: "image";
};

export type SealElement = ElementBase & {
  kind: "seal";
};

export type TemplateElement =
  | TextElement
  | RectElement
  | WatermarkElement
  | CrestElement
  | PhotoElement
  | SealElement;

export type ThemeConfig = {
  cardBg: string;
  bandColor: string;
  textColor: string;
  crestAccent: string;
  baseFont: string;
  watermarkText: string;
  watermarkOpacity: number;
};

export type Template = {
  id: string;
  name: string;
  size: { width: number; height: number };
  theme: ThemeConfig;
  fields: FieldSchema[];
  elements: TemplateElement[];
};

export const FONT_OPTIONS = [
  { label: "明朝", value: '"Noto Serif JP", serif' },
  { label: "ゴシック", value: '"Noto Sans JP", sans-serif' },
] as const;

export const DEFAULT_TEMPLATE: Template = {
  id: "corond-student-id",
  name: "コロンド学生証",
  size: { width: 680, height: 430 },
  theme: {
    cardBg: "#ffffff",
    bandColor: "#fbe2ec",
    textColor: "#2a2330",
    crestAccent: "#9b5d7a",
    baseFont: '"Noto Serif JP", serif',
    watermarkText: "COROND JOSHI GAKUIN ",
    watermarkOpacity: 0.28,
  },
  fields: [
    { key: "schoolName", label: "学校名", type: "text", value: "私立コロンド女子学院" },
    {
      key: "schoolRoman",
      label: "学校名（ローマ字）",
      type: "text",
      value: "SHIRITSU COROND JOSHI GAKUIN",
    },
    { key: "title", label: "タイトル", type: "text", value: "学生証" },
    { key: "grade", label: "学年", type: "text", value: "高等部　2年A組" },
    { key: "name", label: "氏名", type: "text", value: "白峰 雪菜" },
    {
      key: "nameRoman",
      label: "氏名（ローマ字）",
      type: "text",
      value: "shiramine yukina",
    },
    { key: "birth", label: "生年月日", type: "text", value: "××××年2月9日" },
    { key: "expiry", label: "有効期限", type: "text", value: "××××年3月31日" },
    {
      key: "statement",
      label: "証明文",
      type: "textarea",
      value: "上記の者は本院の学生であることを証明する",
    },
    { key: "issuer", label: "発行者", type: "text", value: "私立コロンド女子学院長" },
  ],
  elements: [
    {
      id: "card-background",
      kind: "rect",
      role: "background",
      x: 1,
      y: 1,
      width: 678,
      height: 428,
      cornerRadius: 21,
    },
    {
      id: "card-band",
      kind: "rect",
      role: "band",
      x: 2,
      y: 96,
      width: 676,
      height: 332,
      cornerRadius: [0, 0, 20, 20],
    },
    {
      id: "watermark",
      kind: "watermark",
      x: -170,
      y: -120,
      width: 920,
      height: 680,
      rotation: -18,
      fontFamily: '"Noto Sans JP", sans-serif',
      fontSize: 22,
      color: "#e7b9cd",
      letterSpacing: 6,
      lineHeight: 1.55,
    },
    { id: "crest", kind: "crest", x: 20, y: 14, width: 64, height: 64 },
    {
      id: "school-name",
      kind: "text",
      fieldKey: "schoolName",
      x: 98,
      y: 12,
      width: 560,
      height: 44,
      fontSize: 30,
      fontWeight: 700,
      letterSpacing: 2,
      verticalAlign: "middle",
    },
    {
      id: "school-roman",
      kind: "text",
      fieldKey: "schoolRoman",
      x: 98,
      y: 58,
      width: 560,
      height: 18,
      fontFamily: '"Noto Sans JP", sans-serif',
      fontSize: 11,
      color: "#7a6a78",
      letterSpacing: 3,
    },
    { id: "photo", kind: "image", x: 20, y: 104, width: 150, height: 190 },
    {
      id: "title",
      kind: "text",
      fieldKey: "title",
      x: 188,
      y: 104,
      width: 470,
      height: 38,
      fontSize: 24,
      fontWeight: 700,
      align: "center",
      letterSpacing: 10,
      verticalAlign: "middle",
    },
    {
      id: "grade-label",
      kind: "text",
      text: "学　年",
      x: 188,
      y: 153,
      width: 84,
      height: 24,
      fontSize: 15,
      color: "#5b4f63",
      letterSpacing: 2,
    },
    {
      id: "grade",
      kind: "text",
      fieldKey: "grade",
      x: 282,
      y: 150,
      width: 360,
      height: 28,
      fontSize: 18,
    },
    {
      id: "name-label",
      kind: "text",
      text: "氏　名",
      x: 188,
      y: 194,
      width: 84,
      height: 24,
      fontSize: 15,
      color: "#5b4f63",
      letterSpacing: 2,
    },
    {
      id: "name",
      kind: "text",
      fieldKey: "name",
      x: 282,
      y: 184,
      width: 210,
      height: 42,
      fontSize: 28,
      fontWeight: 700,
      verticalAlign: "middle",
    },
    {
      id: "name-roman",
      kind: "text",
      fieldKey: "nameRoman",
      x: 488,
      y: 200,
      width: 166,
      height: 22,
      fontFamily: '"Noto Sans JP", sans-serif',
      fontSize: 14,
      color: "#6b5e72",
    },
    {
      id: "birth-label",
      kind: "text",
      text: "生年月日",
      x: 188,
      y: 238,
      width: 84,
      height: 24,
      fontSize: 15,
      color: "#5b4f63",
      letterSpacing: 2,
    },
    {
      id: "birth",
      kind: "text",
      fieldKey: "birth",
      x: 282,
      y: 235,
      width: 360,
      height: 28,
      fontSize: 18,
    },
    {
      id: "expiry-label",
      kind: "text",
      text: "有効期限",
      x: 188,
      y: 274,
      width: 84,
      height: 24,
      fontSize: 15,
      color: "#5b4f63",
      letterSpacing: 2,
    },
    {
      id: "expiry",
      kind: "text",
      fieldKey: "expiry",
      x: 282,
      y: 271,
      width: 360,
      height: 28,
      fontSize: 18,
    },
    {
      id: "statement",
      kind: "text",
      fieldKey: "statement",
      x: 20,
      y: 306,
      width: 620,
      height: 28,
      fontSize: 15,
      letterSpacing: 1,
    },
    {
      id: "issuer",
      kind: "text",
      fieldKey: "issuer",
      x: 20,
      y: 339,
      width: 550,
      height: 42,
      fontSize: 26,
      fontWeight: 700,
      letterSpacing: 2,
    },
    { id: "seal", kind: "seal", x: 614, y: 354, width: 46, height: 46, rotation: -4 },
  ],
};

export function createDefaultTemplate(): Template {
  return {
    ...DEFAULT_TEMPLATE,
    size: { ...DEFAULT_TEMPLATE.size },
    theme: { ...DEFAULT_TEMPLATE.theme },
    fields: DEFAULT_TEMPLATE.fields.map((field) => ({
      ...field,
      style: field.style ? { ...field.style } : undefined,
    })),
    elements: DEFAULT_TEMPLATE.elements.map((element) => ({ ...element })),
  };
}

export function getTemplateField(template: Template, key: FieldKey): FieldSchema {
  const field = template.fields.find((candidate) => candidate.key === key);
  if (!field) {
    throw new Error(`Template field was not found: ${key}`);
  }
  return field;
}
