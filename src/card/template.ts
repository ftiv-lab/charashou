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
  };
}

export function getTemplateField(template: Template, key: FieldKey): FieldSchema {
  const field = template.fields.find((candidate) => candidate.key === key);
  if (!field) {
    throw new Error(`Template field was not found: ${key}`);
  }
  return field;
}
