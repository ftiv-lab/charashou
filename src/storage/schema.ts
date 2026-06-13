import { z } from "zod";
import {
  createDefaultPatternElement,
  DEFAULT_CREST_GENERATOR,
  DEFAULT_SEAL_GENERATOR,
  DEFAULT_WATERMARK_GENERATOR,
  normalizePatternGenerator,
} from "../card/decorations";
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

const monogramCrestGeneratorSchema = z.object({
  type: z.literal("monogramCrest"),
  initials: z.string(),
  shape: z.enum(["circle", "shield", "diamond"]),
  strokeColor: z.string().optional(),
  fillColor: z.string().optional(),
});

const roundSealGeneratorSchema = z.object({
  type: z.literal("roundSeal"),
  outerText: z.string(),
  centerText: z.string(),
  color: z.string().optional(),
});

const repeatTextWatermarkGeneratorSchema = z.object({
  type: z.literal("repeatTextWatermark"),
  text: z.string(),
  angle: z.number().finite(),
  opacity: z.number().min(0).max(1),
});

const patternBase = {
  type: z.literal("pattern"),
  color: z.string().optional(),
  opacity: z.number().min(0).max(1),
};

const patternGeneratorSchema = z.union([
  z.object({
    ...patternBase,
    kind: z.literal("repeatText"),
    text: z.string(),
    angle: z.number().finite(),
    spacing: z.number().positive(),
  }),
  z.object({
    ...patternBase,
    kind: z.literal("stripe"),
    angle: z.number().finite(),
    spacing: z.number().positive(),
    strokeWidth: z.number().positive(),
  }),
  z.object({
    ...patternBase,
    kind: z.literal("dots"),
    spacing: z.number().positive(),
    radius: z.number().positive(),
  }),
  z.object({
    ...patternBase,
    kind: z.literal("rosetteLite"),
    loops: z.number().int().positive(),
    radius: z.number().positive(),
    amplitude: z.number().positive(),
    strokeWidth: z.number().positive(),
  }),
  z.object({
    ...patternBase,
    kind: z.enum(["stripe", "dot", "wave", "rosette"]),
  }),
]);

const watermarkElementSchema = z.object({
  ...elementBase,
  kind: z.literal("watermark"),
  generator: repeatTextWatermarkGeneratorSchema.optional(),
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
  z.object({
    ...elementBase,
    kind: z.literal("pattern"),
    generator: patternGeneratorSchema.optional(),
  }),
  z.object({
    ...elementBase,
    kind: z.literal("crest"),
    generator: monogramCrestGeneratorSchema.optional(),
  }),
  z.object({ ...elementBase, kind: z.literal("image") }),
  z.object({
    ...elementBase,
    kind: z.literal("seal"),
    generator: roundSealGeneratorSchema.optional(),
  }),
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
  return normalizeEditorDocument(editorDocumentSchema.parse(value));
}

export function parseEditorDocumentJson(text: string): EditorDocument {
  const value: unknown = JSON.parse(text);
  return normalizeEditorDocument(backupSchema.parse(value).doc);
}

export function serializeEditorDocument(doc: EditorDocument): string {
  return JSON.stringify({ format: "charashou", version: 1, doc }, null, 2);
}

function normalizeEditorDocument(value: z.infer<typeof editorDocumentSchema>): EditorDocument {
  const elements = value.template.elements.map((element) => {
    if (element.kind === "crest") {
      return { ...element, generator: element.generator ?? { ...DEFAULT_CREST_GENERATOR } };
    }
    if (element.kind === "seal") {
      return { ...element, generator: element.generator ?? { ...DEFAULT_SEAL_GENERATOR } };
    }
    if (element.kind === "watermark") {
      return {
        ...element,
        generator: element.generator ?? {
          ...DEFAULT_WATERMARK_GENERATOR,
          text: value.template.theme.watermarkText,
          opacity: value.template.theme.watermarkOpacity,
        },
      };
    }
    if (element.kind === "pattern") {
      return {
        ...element,
        generator: normalizePatternGenerator(
          element.generator ?? createDefaultPatternElement().generator,
        ),
      };
    }
    return element;
  });

  if (!elements.some((element) => element.kind === "pattern")) {
    const bandIndex = elements.findIndex(
      (element) => element.kind === "rect" && element.role === "band",
    );
    elements.splice(bandIndex >= 0 ? bandIndex + 1 : 0, 0, createDefaultPatternElement());
  }

  return {
    ...value,
    template: { ...value.template, elements },
  } as EditorDocument;
}
