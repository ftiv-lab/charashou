export const FIELDS = [
  { key: "schoolName", label: "学校名" },
  { key: "schoolRoman", label: "学校名（ローマ字）" },
  { key: "title", label: "タイトル" },
  { key: "grade", label: "学年" },
  { key: "name", label: "氏名" },
  { key: "nameRoman", label: "氏名（ローマ字）" },
  { key: "birth", label: "生年月日" },
  { key: "expiry", label: "有効期限" },
  { key: "statement", label: "証明文" },
  { key: "issuer", label: "発行者" },
] as const;

export type FieldKey = (typeof FIELDS)[number]["key"];
export type FieldValues = Record<FieldKey, string>;

export const DEFAULT_FIELD_VALUES: FieldValues = {
  schoolName: "私立コロンド女子学院",
  schoolRoman: "SHIRITSU COROND JOSHI GAKUIN",
  title: "学生証",
  grade: "高等部　2年A組",
  name: "白峰 雪菜",
  nameRoman: "shiramine yukina",
  birth: "××××年2月9日",
  expiry: "××××年3月31日",
  statement: "上記の者は本院の学生であることを証明する",
  issuer: "私立コロンド女子学院長",
};
