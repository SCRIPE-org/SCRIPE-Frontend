// FILE-EXCEPTION: file length
/**
 * StylePanel — Appearance + Typography + Spacing
 * Complete light/dark isolation with section-independent backgrounds.
 * Uses ImageUploadField for bg images, Select for fonts, Slider for sizes.
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import { useI18n } from "@core/providers/i18n-provider";

import { ColorInput } from "./ColorInput";
import { SliderInput } from "./SliderInput";
import { Switch } from "@core/ui/switch";
import { ImageUploadField } from "@core/ui/image-upload-field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import type {
  StudioDraftProps as StudioDraft,
  StudioPanel,
} from "../../domain/entities/StudioDraft";
import { COLOR_PRESETS, FONT_OPTIONS_EN, FONT_OPTIONS_AR } from "../../domain/entities/StudioDraft";

interface StylePanelProps {
  activeSection: StudioPanel;
  draft: StudioDraft;
  updateDraft: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
  batchUpdateDraft: (updates: Partial<StudioDraft>) => void;
}

const GRADIENT_DIRECTIONS = [
  { value: "to top", label: "↑" },
  { value: "to top right", label: "↗" },
  { value: "to right", label: "→" },
  { value: "to bottom right", label: "↘" },
  { value: "to bottom", label: "↓" },
  { value: "to bottom left", label: "↙" },
  { value: "to left", label: "←" },
  { value: "to top left", label: "↖" },
];

// ── Layout Section Map: how many visual bg sections each layout has ──
const LAYOUT_SECTION_MAP: Record<string, { sections: 1 | 2; labels?: [string, string] }> = {
  // 1-section layouts — single page background
  centered: { sections: 1 },
  minimal: { sections: 1 },
  "fullscreen-form": { sections: 1 },
  floating: { sections: 1 },
  spotlight: { sections: 1 },
  "glass-morphism": { sections: 1 },
  mosaic: { sections: 1 },
  overlay: { sections: 1 },
  "branded-full": { sections: 1 },
  // 2-section layouts — split/stacked with independent areas
  "split-right": { sections: 2, labels: ["formSide", "brandingPanel"] },
  "split-left": { sections: 2, labels: ["formSide", "brandingPanel"] },
  asymmetric: { sections: 2, labels: ["formSide", "brandingPanel"] },
  "sidebar-compact": { sections: 2, labels: ["formSide", "brandingPanel"] },
  carousel: { sections: 2, labels: ["formSide", "brandingPanel"] },
  "dual-panel": { sections: 2, labels: ["formSide", "brandingPanel"] },
  "split-diagonal": { sections: 2, labels: ["formSide", "brandingPanel"] },
  stacked: { sections: 2, labels: ["heroSection", "formArea"] },
  "vertical-split": { sections: 2, labels: ["heroSection", "formArea"] },
  "gradient-wave": { sections: 2, labels: ["heroSection", "formArea"] },
  magazine: { sections: 2, labels: ["heroSection", "formArea"] },
  immersive: { sections: 2, labels: ["heroSection", "formArea"] },
  "corner-card": { sections: 2, labels: ["heroSection", "formArea"] },
};

// ═══════════════════════════════════════════════════
// BgControls — extracted as a stable module-level component
// (defining it inside the render function created a new component identity
//  on every re-render, causing React to unmount/remount all inputs → focus loss)
// ═══════════════════════════════════════════════════

const IMAGE_FIT_OPTIONS = [
  { value: "cover" as const, label: "Cover" },
  { value: "contain" as const, label: "Contain" },
  { value: "fill" as const, label: "Fill" },
  { value: "none" as const, label: "None" },
  { value: "scale-down" as const, label: "Scale" },
];

const IMAGE_POSITION_OPTIONS = [
  { value: "top left", label: "↖" },
  { value: "top center", label: "↑" },
  { value: "top right", label: "↗" },
  { value: "center left", label: "←" },
  { value: "center", label: "●" },
  { value: "center right", label: "→" },
  { value: "bottom left", label: "↙" },
  { value: "bottom center", label: "↓" },
  { value: "bottom right", label: "↘" },
];

interface BgControlsProps {
  prefix: string;
  bgType: "solid" | "gradient" | "image";
  bgColor: string;
  bgGradientDirection: string;
  bgGradientFrom: string;
  bgGradientTo: string;
  bgImageUrl: string;
  bgImageFit: "cover" | "contain" | "fill" | "none" | "scale-down";
  bgImagePosition: string;
  bgOverlayEnabled: boolean;
  bgOverlayColor: string;
  bgOverlayOpacity: number;
  bgBlur: number;
  hideImage?: boolean;
  copyFromLightUrl?: string;
  updateDraft: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
}

function BgControls({
  prefix,
  bgType,
  bgColor,
  bgGradientDirection,
  bgGradientFrom,
  bgGradientTo,
  bgImageUrl,
  bgImageFit,
  bgImagePosition,
  bgOverlayEnabled,
  bgOverlayColor,
  bgOverlayOpacity,
  bgBlur,
  hideImage,
  copyFromLightUrl,
  updateDraft,
}: BgControlsProps) {
  const { t } = useI18n();
  const f = (field: string): keyof StudioDraft => {
    if (prefix === "") return field as keyof StudioDraft;
    const stripped = field.startsWith("bg") ? field.slice(2) : field;
    return `${prefix}${stripped}` as keyof StudioDraft;
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-1.5">
        {(hideImage
          ? (["solid", "gradient"] as const)
          : (["solid", "gradient", "image"] as const)
        ).map((type) => (
          <button
            key={type}
            onClick={() => updateDraft(f("bgType"), type as any)}
            className={`h-7 rounded-md border text-[10px] font-medium transition-all ${
              bgType === type
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {t(`studio.background.${type}`)}
          </button>
        ))}
      </div>

      {bgType === "solid" && (
        <ColorInput
          label={t("studio.colors.background")}
          value={bgColor}
          onChange={(v) => updateDraft(f("bgColor"), v as any)}
        />
      )}

      {bgType === "gradient" && (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-1">
            {GRADIENT_DIRECTIONS.map((dir) => (
              <button
                key={dir.value}
                onClick={() => updateDraft(f("bgGradientDirection"), dir.value as any)}
                className={`h-6 rounded-md border text-[10px] transition-all ${
                  bgGradientDirection === dir.value
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {dir.label}
              </button>
            ))}
          </div>
          <ColorInput
            label={t("studio.background.from")}
            value={bgGradientFrom}
            onChange={(v) => updateDraft(f("bgGradientFrom"), v as any)}
          />
          <ColorInput
            label={t("studio.background.to")}
            value={bgGradientTo}
            onChange={(v) => updateDraft(f("bgGradientTo"), v as any)}
          />
          <div
            className="h-8 w-full rounded-lg border border-border"
            style={{
              background: `linear-gradient(${bgGradientDirection}, ${bgGradientFrom}, ${bgGradientTo})`,
            }}
          />
        </div>
      )}

      {bgType === "image" && (
        <>
          {copyFromLightUrl && (
            <button
              onClick={() => updateDraft(f("bgImageUrl"), copyFromLightUrl as any)}
              className="flex h-7 w-full items-center justify-center gap-1.5 rounded-md border border-amber-500/40 bg-amber-500/10 text-[10px] font-medium text-amber-600 transition-all hover:bg-amber-500/20 dark:text-amber-400"
            >
              ☀️ {t("studio.background.useLight") || "Use light image"}
            </button>
          )}
          <ImageUploadField
            value={bgImageUrl}
            onChange={(v) => updateDraft(f("bgImageUrl"), v as any)}
            label={t("studio.background.imageUrl") || "Background Image"}
            maxSizeBytes={5 * 1024 * 1024}
            accept="image/png,image/jpeg,image/webp,image/gif"
          />
          <div className="space-y-1.5">
            <span className="text-[10px] font-medium text-muted-foreground">
              {t("studio.background.imageFit") || "Image Fit"}
            </span>
            <div className="grid grid-cols-5 gap-1">
              {IMAGE_FIT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateDraft(f("bgImageFit"), opt.value as any)}
                  className={`h-6 rounded-md border text-[9px] font-medium transition-all ${
                    bgImageFit === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-medium text-muted-foreground">
              {t("studio.background.imagePosition") || "Image Position"}
            </span>
            <div className="grid w-24 grid-cols-3 gap-1">
              {IMAGE_POSITION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateDraft(f("bgImagePosition"), opt.value as any)}
                  className={`h-6 w-8 rounded-md border text-[9px] transition-all ${
                    bgImagePosition === opt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      <div className="flex items-center justify-between">
        <span className="text-[10px] font-medium text-muted-foreground">
          {t("studio.background.overlay")}
        </span>
        <Switch
          checked={bgOverlayEnabled}
          onCheckedChange={(v) => updateDraft(f("bgOverlayEnabled"), v as any)}
        />
      </div>
      {bgOverlayEnabled && (
        <>
          <ColorInput
            label={t("studio.background.overlayColor")}
            value={bgOverlayColor}
            onChange={(v) => updateDraft(f("bgOverlayColor"), v as any)}
          />
          <SliderInput
            label={t("studio.background.overlayOpacity")}
            value={bgOverlayOpacity}
            min={0}
            max={1}
            step={0.05}
            unit=""
            onChange={(v) => updateDraft(f("bgOverlayOpacity"), v as any)}
          />
        </>
      )}
      <SliderInput
        label={t("studio.background.blur")}
        value={bgBlur}
        min={0}
        max={20}
        onChange={(v) => updateDraft(f("bgBlur"), v as any)}
      />
    </div>
  );
}

// ── PresetDots — also extracted as a stable component ──
function PresetDots({
  mode,
  onApply,
}: {
  mode: "light" | "dark";
  onApply: (c: Partial<StudioDraft>) => void;
}) {
  const { t } = useI18n();
  return (
    <div className="grid grid-cols-3 gap-1.5">
      {COLOR_PRESETS.map((preset, i) => {
        const dots =
          mode === "light"
            ? [preset.colors.primaryColor, preset.colors.bgColor, preset.colors.surfaceColor]
            : [
                preset.colors.darkPrimaryColor,
                preset.colors.darkBgColor,
                preset.colors.darkSurfaceColor,
              ];
        return (
          <button
            key={i}
            onClick={() => onApply(preset.colors)}
            className="flex flex-col items-center gap-1 rounded-lg border border-border p-1.5 transition-all hover:border-primary/30 hover:bg-muted/30"
          >
            <div className="flex gap-0.5">
              {dots.map((c, ci) => (
                <div
                  key={ci}
                  className="h-3 w-3 rounded-full border border-border"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <span className="text-[9px] text-muted-foreground">{t(preset.labelKey)}</span>
          </button>
        );
      })}
    </div>
  );
}

export function StylePanel({
  activeSection,
  draft,
  updateDraft,
  batchUpdateDraft,
}: StylePanelProps) {
  const { t } = useI18n();

  // ══════════════════════════════════════════════════════
  // APPEARANCE (merged Colors + Background)
  // ══════════════════════════════════════════════════════
  if (activeSection === "appearance") {
    const layoutInfo = LAYOUT_SECTION_MAP[draft.layout] || { sections: 1 };
    const sectionCount = layoutInfo.sections;
    const isMultiSection = sectionCount > 1;
    const sectionLabels = layoutInfo.labels || ["formSide", "brandingPanel"];

    const lightPresetKeys: (keyof StudioDraft)[] = [
      "primaryColor",
      "secondaryColor",
      "bgColor",
      "surfaceColor",
      "textColor",
      "mutedColor",
      "borderColor",
      "errorColor",
      "successColor",
    ];
    const darkPresetKeys: (keyof StudioDraft)[] = [
      "darkPrimaryColor",
      "darkSecondaryColor",
      "darkBgColor",
      "darkSurfaceColor",
      "darkTextColor",
      "darkMutedColor",
      "darkBorderColor",
      "darkErrorColor",
      "darkSuccessColor",
    ];

    const applyPreset = (presetColors: Partial<StudioDraft>, keys: (keyof StudioDraft)[]) => {
      const filtered: Partial<StudioDraft> = {};
      for (const key of keys) {
        if (key in presetColors) (filtered as any)[key] = (presetColors as any)[key];
      }
      batchUpdateDraft(filtered);
    };

    // ── Section label helper ──
    const sectionLabel = (idx: 0 | 1) => {
      const key = sectionLabels[idx];
      return t(`studio.background.${key}`) || key;
    };

    return (
      <div className="space-y-5">
        {/* ─── SECTION MODE (multi-section layouts only) ─── */}
        {isMultiSection && (
          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                📐 {t("studio.background.panelBg")}
              </h4>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary">
                {sectionCount} {t("studio.background.sectionCount")}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {(["unified", "independent"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => updateDraft("splitBgMode", mode)}
                  className={`h-7 rounded-md border text-[10px] font-medium transition-all ${
                    draft.splitBgMode === mode
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {mode === "unified"
                    ? t("studio.background.panelSame")
                    : t("studio.background.panelIndependent")}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {draft.splitBgMode === "unified"
                ? t("studio.background.panelSameDesc")
                : `${sectionLabel(0)} + ${sectionLabel(1)} — ${t("studio.background.panelIndependentDesc")}`}
            </p>
          </div>
        )}

        {/* ═══════════════ ☀️ LIGHT THEME ═══════════════ */}
        <div className="space-y-3 rounded-lg border border-border/60 bg-gradient-to-b from-amber-50/30 to-transparent p-3 dark:from-amber-950/10">
          <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>☀️</span> {t("studio.appearance.lightTheme")}
          </h4>

          {/* Light Presets */}
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("studio.colors.presets")}
            </h5>
            <PresetDots mode="light" onApply={(c) => applyPreset(c, lightPresetKeys)} />
          </div>

          {/* Light Page Background — shows as "Full Page" if unified/1-section, as section label if separated */}
          <div className="space-y-2 border-t border-border/40 pt-3">
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {isMultiSection && draft.splitBgMode === "independent"
                ? `🔲 ${sectionLabel(0)}`
                : `🌐 ${t("studio.background.fullPage")}`}
            </h5>
            <BgControls
              prefix=""
              bgType={draft.bgType}
              bgColor={draft.bgColor}
              bgGradientDirection={draft.bgGradientDirection}
              bgGradientFrom={draft.bgGradientFrom}
              bgGradientTo={draft.bgGradientTo}
              bgImageUrl={draft.bgImageUrl}
              bgImageFit={draft.bgImageFit}
              bgImagePosition={draft.bgImagePosition}
              bgOverlayEnabled={draft.bgOverlayEnabled}
              bgOverlayColor={draft.bgOverlayColor}
              bgOverlayOpacity={draft.bgOverlayOpacity}
              bgBlur={draft.bgBlur}
              updateDraft={updateDraft}
            />
          </div>

          {/* Light Color Palette */}
          <div className="space-y-2 border-t border-border/40 pt-3">
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              🎨 {t("studio.colors.lightPalette")}
            </h5>
            <ColorInput
              label={t("studio.colors.primary")}
              value={draft.primaryColor}
              onChange={(v) => updateDraft("primaryColor", v)}
            />
            <ColorInput
              label={t("studio.colors.secondary")}
              value={draft.secondaryColor}
              onChange={(v) => updateDraft("secondaryColor", v)}
            />
            <ColorInput
              label={t("studio.colors.surface")}
              value={draft.surfaceColor}
              onChange={(v) => updateDraft("surfaceColor", v)}
            />
            <ColorInput
              label={t("studio.colors.text")}
              value={draft.textColor}
              onChange={(v) => updateDraft("textColor", v)}
            />
            <ColorInput
              label={t("studio.colors.muted")}
              value={draft.mutedColor}
              onChange={(v) => updateDraft("mutedColor", v)}
            />
            <ColorInput
              label={t("studio.colors.border")}
              value={draft.borderColor}
              onChange={(v) => updateDraft("borderColor", v)}
            />
            <ColorInput
              label={t("studio.colors.error")}
              value={draft.errorColor}
              onChange={(v) => updateDraft("errorColor", v)}
            />
            <ColorInput
              label={t("studio.colors.success")}
              value={draft.successColor}
              onChange={(v) => updateDraft("successColor", v)}
            />
          </div>

          {/* Light Section 2 Bg (multi-section + independent only) */}
          {isMultiSection && draft.splitBgMode === "independent" && (
            <div className="space-y-2 border-t border-border/40 pt-3">
              <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                🖼️ {sectionLabel(1)}
              </h5>
              <BgControls
                prefix="panelBg"
                bgType={draft.panelBgType}
                bgColor={draft.panelBgColor}
                bgGradientDirection={draft.panelBgGradientDirection}
                bgGradientFrom={draft.panelBgGradientFrom}
                bgGradientTo={draft.panelBgGradientTo}
                bgImageUrl={draft.panelBgImageUrl}
                bgImageFit={draft.panelBgImageFit}
                bgImagePosition={draft.panelBgImagePosition}
                bgOverlayEnabled={draft.panelBgOverlayEnabled}
                bgOverlayColor={draft.panelBgOverlayColor}
                bgOverlayOpacity={draft.panelBgOverlayOpacity}
                bgBlur={draft.panelBgBlur}
                updateDraft={updateDraft}
              />
            </div>
          )}
        </div>

        {/* ═══════════════ 🌙 DARK THEME ═══════════════ */}
        <div className="space-y-3 rounded-lg border border-border/60 bg-gradient-to-b from-indigo-950/20 to-transparent p-3 dark:from-indigo-950/30">
          <h4 className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>🌙</span> {t("studio.appearance.darkTheme")}
          </h4>

          {/* Dark Presets */}
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {t("studio.colors.presets")}
            </h5>
            <PresetDots mode="dark" onApply={(c) => applyPreset(c, darkPresetKeys)} />
          </div>

          {/* Dark Page Background */}
          <div className="space-y-2 border-t border-border/40 pt-3">
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {isMultiSection && draft.splitBgMode === "independent"
                ? `🔲 ${sectionLabel(0)}`
                : `🌐 ${t("studio.background.fullPage")}`}
            </h5>
            <BgControls
              prefix="darkBg"
              bgType={draft.darkBgType}
              bgColor={draft.darkBgColor}
              bgGradientDirection={draft.darkBgGradientDirection}
              bgGradientFrom={draft.darkBgGradientFrom}
              bgGradientTo={draft.darkBgGradientTo}
              bgImageUrl={draft.darkBgImageUrl}
              bgImageFit={draft.darkBgImageFit}
              bgImagePosition={draft.darkBgImagePosition}
              bgOverlayEnabled={draft.darkBgOverlayEnabled}
              bgOverlayColor={draft.darkBgOverlayColor}
              bgOverlayOpacity={draft.darkBgOverlayOpacity}
              bgBlur={draft.darkBgBlur}
              copyFromLightUrl={draft.bgImageUrl || undefined}
              updateDraft={updateDraft}
            />
          </div>

          {/* Dark Color Palette */}
          <div className="space-y-2 border-t border-border/40 pt-3">
            <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              🎨 {t("studio.colors.darkPalette")}
            </h5>
            <ColorInput
              label={t("studio.colors.primary")}
              value={draft.darkPrimaryColor}
              onChange={(v) => updateDraft("darkPrimaryColor", v)}
            />
            <ColorInput
              label={t("studio.colors.secondary")}
              value={draft.darkSecondaryColor}
              onChange={(v) => updateDraft("darkSecondaryColor", v)}
            />
            <ColorInput
              label={t("studio.colors.surface")}
              value={draft.darkSurfaceColor}
              onChange={(v) => updateDraft("darkSurfaceColor", v)}
            />
            <ColorInput
              label={t("studio.colors.text")}
              value={draft.darkTextColor}
              onChange={(v) => updateDraft("darkTextColor", v)}
            />
            <ColorInput
              label={t("studio.colors.muted")}
              value={draft.darkMutedColor}
              onChange={(v) => updateDraft("darkMutedColor", v)}
            />
            <ColorInput
              label={t("studio.colors.border")}
              value={draft.darkBorderColor}
              onChange={(v) => updateDraft("darkBorderColor", v)}
            />
            <ColorInput
              label={t("studio.colors.error")}
              value={draft.darkErrorColor}
              onChange={(v) => updateDraft("darkErrorColor", v)}
            />
            <ColorInput
              label={t("studio.colors.success")}
              value={draft.darkSuccessColor}
              onChange={(v) => updateDraft("darkSuccessColor", v)}
            />
          </div>

          {/* Dark Section 2 Bg (multi-section + independent only) */}
          {isMultiSection && draft.splitBgMode === "independent" && (
            <div className="space-y-2 border-t border-border/40 pt-3">
              <h5 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                🖼️ {sectionLabel(1)}
              </h5>
              <BgControls
                prefix="darkPanelBg"
                bgType={draft.darkPanelBgType}
                bgColor={draft.darkPanelBgColor}
                bgGradientDirection={draft.darkPanelBgGradientDirection}
                bgGradientFrom={draft.darkPanelBgGradientFrom}
                bgGradientTo={draft.darkPanelBgGradientTo}
                bgImageUrl={draft.darkPanelBgImageUrl}
                bgImageFit={draft.darkPanelBgImageFit}
                bgImagePosition={draft.darkPanelBgImagePosition}
                bgOverlayEnabled={draft.darkPanelBgOverlayEnabled}
                bgOverlayColor={draft.darkPanelBgOverlayColor}
                bgOverlayOpacity={draft.darkPanelBgOverlayOpacity}
                bgBlur={draft.darkPanelBgBlur}
                copyFromLightUrl={draft.panelBgImageUrl || undefined}
                updateDraft={updateDraft}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // TYPOGRAPHY
  // ══════════════════════════════════════════════════════
  if (activeSection === "typography") {
    return (
      <div className="space-y-5">
        {/* Body Font (English) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("studio.typography.fontFamily")}
          </label>
          <Select value={draft.fontFamily} onValueChange={(v) => updateDraft("fontFamily", v)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS_EN.map((font) => (
                <SelectItem
                  key={font}
                  value={font}
                  className="text-xs"
                  style={{ fontFamily: font }}
                >
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Font (Arabic) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("studio.typography.fontFamilyAr")}
          </label>
          <Select value={draft.fontFamilyAr} onValueChange={(v) => updateDraft("fontFamilyAr", v)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS_AR.map((font) => (
                <SelectItem
                  key={font}
                  value={font}
                  className="text-xs"
                  style={{ fontFamily: font }}
                >
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Heading Font */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("studio.typography.headingFont")}
          </label>
          <Select
            value={draft.headingFont || draft.fontFamily}
            onValueChange={(v) => updateDraft("headingFont", v)}
          >
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS_EN.map((font) => (
                <SelectItem
                  key={font}
                  value={font}
                  className="text-xs"
                  style={{ fontFamily: font }}
                >
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Heading Size */}
        <SliderInput
          label={t("studio.typography.headingSize")}
          value={draft.headingSize}
          min={20}
          max={56}
          onChange={(v) => updateDraft("headingSize", v)}
        />

        {/* Body Size */}
        <SliderInput
          label={t("studio.typography.bodySize")}
          value={draft.bodySize}
          min={10}
          max={22}
          onChange={(v) => updateDraft("bodySize", v)}
        />

        {/* Heading Weight */}
        <SliderInput
          label={t("studio.typography.headingWeight")}
          value={draft.headingWeight}
          min={300}
          max={900}
          step={100}
          onChange={(v) => updateDraft("headingWeight", v)}
        />

        {/* Body Weight */}
        <SliderInput
          label={t("studio.typography.bodyWeight")}
          value={draft.bodyWeight}
          min={300}
          max={700}
          step={100}
          onChange={(v) => updateDraft("bodyWeight", v)}
        />

        {/* Line Height */}
        <SliderInput
          label={t("studio.typography.lineHeight")}
          value={draft.lineHeight}
          min={1}
          max={2.5}
          step={0.1}
          unit=""
          onChange={(v) => updateDraft("lineHeight", v)}
        />

        {/* Letter Spacing */}
        <SliderInput
          label={t("studio.typography.letterSpacing")}
          value={draft.letterSpacing}
          min={-2}
          max={4}
          step={0.5}
          unit="px"
          onChange={(v) => updateDraft("letterSpacing", v)}
        />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // SPACING & SHAPE
  // ══════════════════════════════════════════════════════
  if (activeSection === "spacing") {
    return (
      <div className="space-y-5">
        <SliderInput
          label={t("studio.spacing.borderRadius")}
          value={draft.borderRadius}
          min={0}
          max={24}
          onChange={(v) => updateDraft("borderRadius", v)}
        />
        <SliderInput
          label={t("studio.spacing.formWidth")}
          value={draft.formWidth}
          min={320}
          max={560}
          step={10}
          onChange={(v) => updateDraft("formWidth", v)}
        />
        <SliderInput
          label={t("studio.spacing.cardPadding")}
          value={draft.cardPadding}
          min={16}
          max={48}
          step={4}
          onChange={(v) => updateDraft("cardPadding", v)}
        />
        <SliderInput
          label={t("studio.spacing.elementGap")}
          value={draft.elementGap}
          min={8}
          max={32}
          step={4}
          onChange={(v) => updateDraft("elementGap", v)}
        />
        <SliderInput
          label={t("studio.spacing.inputHeight")}
          value={draft.inputHeight}
          min={36}
          max={52}
          step={2}
          onChange={(v) => updateDraft("inputHeight", v)}
        />
        <SliderInput
          label={t("studio.spacing.btnRadius")}
          value={draft.btnRadius}
          min={0}
          max={24}
          onChange={(v) => updateDraft("btnRadius", v)}
        />
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("studio.spacing.btnSize")}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["sm", "md", "lg"] as const).map((size) => (
              <button
                key={size}
                onClick={() => updateDraft("btnSize", size)}
                className={`h-8 rounded-md border text-xs font-medium transition-all ${
                  draft.btnSize === size
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {size.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
