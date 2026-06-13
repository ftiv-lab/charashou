import type {
  MonogramCrestGenerator,
  PatternElement,
  PatternGenerator,
  RepeatTextWatermarkGenerator,
  RoundSealGenerator,
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
  kind: "stripe",
  opacity: 0.055,
};

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
  { id: "stripe", label: "ストライプ", generator: { ...DEFAULT_PATTERN_GENERATOR } },
  {
    id: "dot",
    label: "ドット",
    generator: { type: "pattern", kind: "dot", opacity: 0.1 },
  },
  {
    id: "rosette",
    label: "ロゼット",
    generator: { type: "pattern", kind: "rosette", opacity: 0.09 },
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
  | { id: string; kind: "line"; points: number[]; tension?: number }
  | { id: string; kind: "dot"; x: number; y: number; radius: number }
  | { id: string; kind: "rosette"; x: number; y: number };

export function createPatternMarks(
  generator: PatternGenerator,
  width: number,
  height: number,
): PatternMark[] {
  if (generator.kind === "stripe") {
    return Array.from({ length: Math.ceil((width + height) / 34) + 1 }, (_, index) => {
      const start = -height + index * 34;
      return {
        id: `stripe-${start}`,
        kind: "line" as const,
        points: [start, 0, start + height, height],
      };
    });
  }
  if (generator.kind === "dot") {
    return Array.from({ length: Math.ceil(height / 28) }, (_, row) =>
      Array.from({ length: Math.ceil(width / 28) }, (_, column) => {
        const x = 14 + column * 28;
        const y = 14 + row * 28;
        return { id: `dot-${x}-${y}`, kind: "dot" as const, x, y, radius: 1.8 };
      }),
    ).flat();
  }
  if (generator.kind === "wave") {
    return Array.from({ length: Math.ceil(height / 30) }, (_, row) => {
      const baseY = 15 + row * 30;
      const points = Array.from({ length: Math.ceil(width / 16) + 1 }, (_, column) => {
        const x = column * 16;
        return [x, baseY + Math.sin(column * 0.9) * 4];
      }).flat();
      return { id: `wave-${baseY}`, kind: "line" as const, points, tension: 0.45 };
    });
  }
  return Array.from({ length: Math.ceil(height / 72) }, (_, row) =>
    Array.from({ length: Math.ceil(width / 72) }, (_, column) => {
      const x = 36 + column * 72;
      const y = 36 + row * 72;
      return { id: `rosette-${x}-${y}`, kind: "rosette" as const, x, y };
    }),
  ).flat();
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
