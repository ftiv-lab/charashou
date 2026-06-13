import {
  CREST_PRESETS,
  type DecorationTarget,
  isDecorationPresetActive,
  PATTERN_PRESETS,
  SEAL_PRESETS,
  WATERMARK_PRESETS,
} from "../card/decorations";
import {
  FONT_OPTIONS,
  type RepeatTextWatermarkGenerator,
  type Template,
  type ThemeConfig,
} from "../card/template";

type ThemePanelProps = {
  template: Template;
  onChange: <Key extends keyof ThemeConfig>(key: Key, value: ThemeConfig[Key]) => void;
  onDecorationPreset: (target: DecorationTarget, presetId: string) => void;
  onWatermarkChange: (
    key: "text" | "opacity",
    value: RepeatTextWatermarkGenerator["text" | "opacity"],
  ) => void;
};

const PRESET_GROUPS = [
  { target: "crest", label: "校章", presets: CREST_PRESETS },
  { target: "seal", label: "印", presets: SEAL_PRESETS },
  { target: "watermark", label: "透かし", presets: WATERMARK_PRESETS },
  { target: "pattern", label: "背景", presets: PATTERN_PRESETS },
] as const;

export function ThemePanel({
  template,
  onChange,
  onDecorationPreset,
  onWatermarkChange,
}: ThemePanelProps) {
  const { theme } = template;
  const watermark = template.elements.find((element) => element.kind === "watermark");
  const watermarkText = watermark?.generator.text ?? theme.watermarkText;
  const watermarkOpacity = watermark?.generator.opacity ?? theme.watermarkOpacity;

  return (
    <section className="property-section" aria-labelledby="theme-heading">
      <h2 id="theme-heading">全体テーマ</h2>
      <div className="theme-grid">
        <label className="control-row">
          <span>カード背景</span>
          <input
            type="color"
            value={theme.cardBg}
            onChange={(event) => onChange("cardBg", event.target.value)}
          />
        </label>
        <label className="control-row">
          <span>帯の色</span>
          <input
            type="color"
            value={theme.bandColor}
            onChange={(event) => onChange("bandColor", event.target.value)}
          />
        </label>
        <label className="control-row">
          <span>文字色</span>
          <input
            type="color"
            value={theme.textColor}
            onChange={(event) => onChange("textColor", event.target.value)}
          />
        </label>
        <label className="control-row">
          <span>校章アクセント</span>
          <input
            type="color"
            value={theme.crestAccent}
            onChange={(event) => onChange("crestAccent", event.target.value)}
          />
        </label>
      </div>

      <label className="field">
        <span>ベースフォント</span>
        <select
          value={theme.baseFont}
          onChange={(event) => onChange("baseFont", event.target.value)}
        >
          {FONT_OPTIONS.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label}
            </option>
          ))}
        </select>
      </label>

      <section className="decoration-presets" aria-labelledby="decoration-presets-heading">
        <h3 id="decoration-presets-heading">装飾プリセット</h3>
        {PRESET_GROUPS.map((group) => (
          <fieldset className="preset-group" key={group.target}>
            <legend>{group.label}</legend>
            <div className="preset-options">
              {group.presets.map((preset) => (
                <button
                  key={preset.id}
                  className="preset-button"
                  type="button"
                  aria-label={`${group.label} ${preset.label}`}
                  aria-pressed={isDecorationPresetActive(template, group.target, preset.id)}
                  onClick={() => onDecorationPreset(group.target, preset.id)}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </fieldset>
        ))}
      </section>

      <label className="field">
        <span>透かし文字</span>
        <input
          type="text"
          value={watermarkText}
          onChange={(event) => onWatermarkChange("text", event.target.value)}
        />
      </label>

      <label className="field range-field">
        <span>透かしの濃さ</span>
        <span className="range-control">
          <input
            type="range"
            min="0"
            max="0.5"
            step="0.01"
            value={watermarkOpacity}
            onChange={(event) => onWatermarkChange("opacity", Number(event.target.value))}
          />
          <output>{watermarkOpacity.toFixed(2)}</output>
        </span>
      </label>
    </section>
  );
}
