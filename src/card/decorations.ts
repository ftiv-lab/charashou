import type {
  DotsPatternGenerator,
  MonogramCrestGenerator,
  PatternElement,
  PatternGenerator,
  RepeatTextPatternGenerator,
  RepeatTextWatermarkGenerator,
  RosetteLitePatternGenerator,
  RoundSealGenerator,
  StripePatternGenerator,
  Template,
} from "./template";

export const DEFAULT_CREST_GENERATOR: MonogramCrestGenerator = {
  type: "monogramCrest",
  initials: "CR",
  shape: "circle",
};

export const DEFAULT_SEAL_GENERATOR: RoundSealGenerator = {
  type: "roundSeal",
  outerText: "COROND ACADEMY",
  centerText: "認",
  color: "#c0392b",
};

export const DEFAULT_WATERMARK_GENERATOR: RepeatTextWatermarkGenerator = {
  type: "repeatTextWatermark",
  text: "COROND JOSHI GAKUIN ",
  angle: -18,
  opacity: 0.16,
};

export const DEFAULT_PATTERN_GENERATOR: PatternGenerator = {
  type: "pattern",
  kind: "rosetteLite",
  loops: 10,
  radius: 20,
  amplitude: 2.5,
  strokeWidth: 0.5,
  opacity: 0.05,
};

export type PatternKind = PatternGenerator["kind"];

export function createPatternGenerator(kind: "repeatText"): RepeatTextPatternGenerator;
export function createPatternGenerator(kind: "stripe"): StripePatternGenerator;
export function createPatternGenerator(kind: "dots"): DotsPatternGenerator;
export function createPatternGenerator(kind: "rosetteLite"): RosetteLitePatternGenerator;
export function createPatternGenerator(kind: PatternKind): PatternGenerator;
export function createPatternGenerator(kind: PatternKind): PatternGenerator {
  switch (kind) {
    case "repeatText":
      return {
        type: "pattern",
        kind,
        text: "CHARACTER ID ",
        angle: -24,
        spacing: 88,
        opacity: 0.055,
      };
    case "stripe":
      return {
        type: "pattern",
        kind,
        angle: 32,
        spacing: 30,
        strokeWidth: 0.5,
        opacity: 0.045,
      };
    case "dots":
      return {
        type: "pattern",
        kind,
        spacing: 30,
        radius: 1.25,
        opacity: 0.065,
      };
    case "rosetteLite":
      return { ...DEFAULT_PATTERN_GENERATOR };
  }
}

export function createDefaultPatternElement(): PatternElement {
  return {
    id: "background-pattern",
    kind: "pattern",
    generator: { ...DEFAULT_PATTERN_GENERATOR },
    x: 2,
    y: 96,
    width: 676,
    height: 332,
  };
}

type Preset<T> = {
  id: string;
  label: string;
  generator: T;
};

export const CREST_PRESETS: Preset<MonogramCrestGenerator>[] = [
  { id: "classic", label: "クラシック", generator: { ...DEFAULT_CREST_GENERATOR } },
  {
    id: "shield",
    label: "シールド",
    generator: { type: "monogramCrest", initials: "CG", shape: "shield" },
  },
  {
    id: "diamond",
    label: "ダイヤ",
    generator: { type: "monogramCrest", initials: "C", shape: "diamond" },
  },
];

export const SEAL_PRESETS: Preset<RoundSealGenerator>[] = [
  { id: "academy", label: "学院印", generator: { ...DEFAULT_SEAL_GENERATOR } },
  {
    id: "certified",
    label: "証明印",
    generator: { type: "roundSeal", outerText: "CERTIFIED", centerText: "証" },
  },
  {
    id: "sakura",
    label: "桜印",
    generator: { type: "roundSeal", outerText: "COROND", centerText: "桜" },
  },
];

export const WATERMARK_PRESETS: Preset<RepeatTextWatermarkGenerator>[] = [
  { id: "school", label: "学院名", generator: { ...DEFAULT_WATERMARK_GENERATOR } },
  {
    id: "monogram",
    label: "モノグラム",
    generator: { type: "repeatTextWatermark", text: "CR ", angle: -30, opacity: 0.12 },
  },
  {
    id: "student-id",
    label: "学生証",
    generator: {
      type: "repeatTextWatermark",
      text: "STUDENT ID ",
      angle: 0,
      opacity: 0.1,
    },
  },
];

export const PATTERN_PRESETS: Preset<PatternGenerator>[] = [
  { id: "rosette", label: "ロゼット", generator: { ...DEFAULT_PATTERN_GENERATOR } },
  {
    id: "stripe",
    label: "ストライプ",
    generator: createPatternGenerator("stripe"),
  },
  {
    id: "dot",
    label: "ドット",
    generator: createPatternGenerator("dots"),
  },
];

export const DECORATION_PRESETS = {
  crest: CREST_PRESETS,
  seal: SEAL_PRESETS,
  watermark: WATERMARK_PRESETS,
  pattern: PATTERN_PRESETS,
} as const;

export type DecorationTarget = keyof typeof DECORATION_PRESETS;

export function resolveDecorationColor(color: string | undefined, fallback: string): string {
  return color ?? fallback;
}

export function getCrestOutlinePoints(
  shape: MonogramCrestGenerator["shape"],
  width: number,
  height: number,
): number[] | undefined {
  if (shape === "circle") return undefined;
  if (shape === "diamond") {
    return [width / 2, 1, width - 1, height / 2, width / 2, height - 1, 1, height / 2];
  }
  return [
    width / 2,
    1,
    width - 3,
    height * 0.2,
    width * 0.84,
    height * 0.72,
    width / 2,
    height - 1,
    width * 0.16,
    height * 0.72,
    3,
    height * 0.2,
  ];
}

export type PatternMark =
  | {
      id: string;
      kind: "line";
      x: number;
      y: number;
      rotation: number;
      points: number[];
      strokeWidth: number;
    }
  | { id: string; kind: "dot"; x: number; y: number; radius: number }
  | {
      id: string;
      kind: "text";
      x: number;
      y: number;
      rotation: number;
      text: string;
      fontSize: number;
    }
  | { id: string; kind: "rosette"; points: number[]; strokeWidth: number };

export function createPatternMarks(
  generator: PatternGenerator,
  width: number,
  height: number,
): PatternMark[] {
  if (generator.kind === "repeatText") {
    const spacing = Math.max(32, generator.spacing);
    return Array.from({ length: Math.ceil(height / spacing) + 2 }, (_, row) =>
      Array.from({ length: Math.ceil(width / spacing) + 2 }, (_, column) => {
        const x = -spacing + column * spacing + (row % 2) * (spacing / 2);
        const y = -spacing + row * spacing;
        return {
          id: `text-${x}-${y}`,
          kind: "text" as const,
          x,
          y,
          rotation: generator.angle,
          text: generator.text,
          fontSize: Math.max(8, spacing * 0.16),
        };
      }),
    ).flat();
  }
  if (generator.kind === "stripe") {
    const spacing = Math.max(8, generator.spacing);
    const diagonal = Math.hypot(width, height) * 1.4;
    const count = Math.ceil((diagonal * 2) / spacing) + 1;
    return [generator.angle, generator.angle + 90].flatMap((rotation, direction) =>
      Array.from({ length: count }, (_, index) => {
        const offset = -diagonal + index * spacing;
        return {
          id: `stripe-${direction}-${offset}`,
          kind: "line" as const,
          x: width / 2,
          y: height / 2,
          rotation,
          points: [offset, -diagonal, offset, diagonal],
          strokeWidth: generator.strokeWidth,
        };
      }),
    );
  }
  if (generator.kind === "dots") {
    const spacing = Math.max(8, generator.spacing);
    return Array.from({ length: Math.ceil(height / spacing) + 1 }, (_, row) =>
      Array.from({ length: Math.ceil(width / spacing) + 1 }, (_, column) => {
        const x = spacing / 2 + column * spacing;
        const y = spacing / 2 + row * spacing;
        return { id: `dot-${x}-${y}`, kind: "dot" as const, x, y, radius: generator.radius };
      }),
    ).flat();
  }

  const tileSize = Math.max(24, (generator.radius + generator.amplitude) * 2 + 16);
  return Array.from({ length: Math.ceil(height / tileSize) + 1 }, (_, row) =>
    Array.from({ length: Math.ceil(width / tileSize) + 1 }, (_, column) => {
      const centerX = tileSize / 2 + column * tileSize;
      const centerY = tileSize / 2 + row * tileSize;
      const steps = Math.max(72, generator.loops * 14);
      const points = Array.from({ length: steps + 1 }, (_, step) => {
        const angle = (step / steps) * Math.PI * 2;
        const radius = generator.radius + Math.sin(angle * generator.loops) * generator.amplitude;
        return [centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius];
      }).flat();
      return {
        id: `rosette-${centerX}-${centerY}`,
        kind: "rosette" as const,
        points,
        strokeWidth: generator.strokeWidth,
      };
    }),
  ).flat();
}

export function normalizePatternGenerator(value: unknown): PatternGenerator {
  if (!value || typeof value !== "object") return { ...DEFAULT_PATTERN_GENERATOR };
  const source = value as Record<string, unknown>;
  const opacity = typeof source.opacity === "number" ? source.opacity : undefined;
  const color = typeof source.color === "string" ? source.color : undefined;
  const kind = source.kind;

  if (kind === "repeatText" || kind === "stripe" || kind === "dots" || kind === "rosetteLite") {
    return {
      ...createPatternGenerator(kind),
      ...source,
      type: "pattern",
      kind,
    } as PatternGenerator;
  }
  const legacyValues = {
    ...(opacity === undefined ? {} : { opacity }),
    ...(color === undefined ? {} : { color }),
  };
  if (kind === "dot") return { ...createPatternGenerator("dots"), ...legacyValues };
  if (kind === "rosette") {
    return { ...createPatternGenerator("rosetteLite"), ...legacyValues };
  }
  if (kind === "wave") {
    const stripe = createPatternGenerator("stripe");
    if (stripe.kind !== "stripe") return stripe;
    return { ...stripe, angle: 0, ...legacyValues };
  }
  return { ...createPatternGenerator("stripe"), ...legacyValues };
}

export function updatePatternGenerator(template: Template, generator: PatternGenerator): Template {
  return {
    ...template,
    elements: template.elements.map((element) =>
      element.kind === "pattern" ? { ...element, generator: { ...generator } } : element,
    ),
  };
}

function cloneGenerator<T extends object>(generator: T): T {
  return { ...generator };
}

function generatorsEqual(left: object, right: object): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function isDecorationPresetActive(
  template: Template,
  target: DecorationTarget,
  presetId: string,
): boolean {
  const element = template.elements.find((candidate) => candidate.kind === target);
  const preset = DECORATION_PRESETS[target].find((candidate) => candidate.id === presetId);
  return Boolean(
    element &&
      "generator" in element &&
      preset &&
      generatorsEqual(element.generator, preset.generator),
  );
}

export function applyDecorationPreset(
  template: Template,
  target: DecorationTarget,
  presetId: string,
): Template {
  const preset = DECORATION_PRESETS[target].find((candidate) => candidate.id === presetId);
  if (!preset) return template;

  const elements = template.elements.map((element) => {
    if (element.kind !== target) return element;
    return { ...element, generator: cloneGenerator(preset.generator) } as typeof element;
  });
  const theme =
    target === "watermark"
      ? {
          ...template.theme,
          watermarkText: (preset.generator as RepeatTextWatermarkGenerator).text,
          watermarkOpacity: (preset.generator as RepeatTextWatermarkGenerator).opacity,
        }
      : template.theme;

  return { ...template, theme, elements };
}

export function updateWatermarkGenerator(
  template: Template,
  change: Partial<Pick<RepeatTextWatermarkGenerator, "text" | "opacity">>,
): Template {
  return {
    ...template,
    theme: {
      ...template.theme,
      watermarkText: change.text ?? template.theme.watermarkText,
      watermarkOpacity: change.opacity ?? template.theme.watermarkOpacity,
    },
    elements: template.elements.map((element) =>
      element.kind === "watermark"
        ? { ...element, generator: { ...element.generator, ...change } }
        : element,
    ),
  };
}
