import { z } from "zod";
import type { EditorDocument } from "../card/history";

const fieldKeySchema = z.enum([
  "schoolName",
  "schoolRoman",
  "title",
  "grade",
  "name",
  "nameRoman",
  "birth",
  "expiry",
  "statement",
  "issuer",
]);

const fieldStyleSchema = z.object({
  fontFamily: z.string().optional(),
  fontSize: z.number().finite().optional(),
  fontWeight: z.union([z.literal(400), z.literal(500), z.literal(700)]).optional(),
  color: z.string().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
});

const fieldSchema = z.object({
  key: fieldKeySchema,
  label: z.string(),
  type: z.enum(["text", "textarea"]),
  value: z.string(),
  style: fieldStyleSchema.optional(),
});

const elementBase = {
  id: z.string(),
  x: z.number().finite(),
  y: z.number().finite(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number().finite().optional(),
};

const textElementSchema = z.object({
  ...elementBase,
  kind: z.literal("text"),
  fieldKey: fieldKeySchema.optional(),
  text: z.string().optional(),
  fontFamily: z.string().optional(),
  fontSize: z.number().positive(),
  fontWeight: z.union([z.literal(400), z.literal(500), z.literal(700)]).optional(),
  color: z.string().optional(),
  align: z.enum(["left", "center", "right"]).optional(),
  verticalAlign: z.enum(["top", "middle", "bottom"]).optional(),
  letterSpacing: z.number().finite().optional(),
  lineHeight: z.number().positive().optional(),
});

const rectElementSchema = z.object({
  ...elementBase,
  kind: z.literal("rect"),
  role: z.enum(["background", "band"]),
  cornerRadius: z
    .union([z.number(), z.tuple([z.number(), z.number(), z.number(), z.number()])])
    .optional(),
});

const watermarkElementSchema = z.object({
  ...elementBase,
  kind: z.literal("watermark"),
  fontFamily: z.string(),
  fontSize: z.number().positive(),
  color: z.string(),
  letterSpacing: z.number().finite(),
  lineHeight: z.number().positive(),
});

const templateElementSchema = z.discriminatedUnion("kind", [
  textElementSchema,
  rectElementSchema,
  watermarkElementSchema,
  z.object({ ...elementBase, kind: z.literal("crest") }),
  z.object({ ...elementBase, kind: z.literal("image") }),
  z.object({ ...elementBase, kind: z.literal("seal") }),
]);

export const editorDocumentSchema = z.object({
  template: z.object({
    id: z.string(),
    name: z.string(),
    size: z.object({ width: z.number().positive(), height: z.number().positive() }),
    theme: z.object({
      cardBg: z.string(),
      bandColor: z.string(),
      textColor: z.string(),
      crestAccent: z.string(),
      baseFont: z.string(),
      watermarkText: z.string(),
      watermarkOpacity: z.number().min(0).max(1),
    }),
    fields: z.array(fieldSchema),
    elements: z.array(templateElementSchema),
  }),
  photo: z.object({
    dataUrl: z.string(),
    zoom: z.number().min(1).max(3),
    offsetX: z.number().min(-1).max(1),
    offsetY: z.number().min(-1).max(1),
  }),
});

const backupSchema = z.object({
  format: z.literal("charashou"),
  version: z.literal(1),
  doc: editorDocumentSchema,
});

export function parseEditorDocument(value: unknown): EditorDocument {
  return editorDocumentSchema.parse(value) as EditorDocument;
}

export function parseEditorDocumentJson(text: string): EditorDocument {
  const value: unknown = JSON.parse(text);
  return backupSchema.parse(value).doc as EditorDocument;
}

export function serializeEditorDocument(doc: EditorDocument): string {
  return JSON.stringify({ format: "charashou", version: 1, doc }, null, 2);
}
