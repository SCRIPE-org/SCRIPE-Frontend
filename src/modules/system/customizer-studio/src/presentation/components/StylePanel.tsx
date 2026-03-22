/**
 * StylePanel — Appearance + Typography + Spacing
 * Complete light/dark isolation with section-independent backgrounds.
 * Uses ImageUploadField for bg images, Select for fonts, Slider for sizes.
 */
"use client";

import { ColorInput } from "./ColorInput";
import { SliderInput } from "./SliderInput";
import { Switch } from "@core/ui/switch";
import { ImageUploadField } from "@core/ui/image-upload-field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import type { StudioDraft, StudioPanel } from "../viewmodels/useStudioViewModel";
import {
  COLOR_PRESETS,
  FONT_OPTIONS_EN,
  FONT_OPTIONS_AR,
} from "../viewmodels/useStudioViewModel";

interface StylePanelProps {
  t: (key: string) => string;
  activeSection: StudioPanel;
  draft: StudioDraft;
  updateDraft: <K extends keyof StudioDraft>(field: K, value: StudioDraft[K]) => void;
  batchUpdateDraft: (updates: Partial<StudioDraft>) => void;
}

const GRADIENT_DIRECTIONS = [
  { value: "to top",          label: "↑" },
  { value: "to top right",    label: "↗" },
  { value: "to right",        label: "→" },
  { value: "to bottom right", label: "↘" },
  { value: "to bottom",       label: "↓" },
  { value: "to bottom left",  label: "↙" },
  { value: "to left",         label: "←" },
  { value: "to top left",     label: "↖" },
];

const SPLIT_LAYOUTS = [
  "split-right", "split-left", "asymmetric", "sidebar-compact",
  "magazine", "stacked", "dual-panel", "vertical-split",
  "split-diagonal", "carousel",
];

export function StylePanel({ t, activeSection, draft, updateDraft, batchUpdateDraft }: StylePanelProps) {

  // ══════════════════════════════════════════════════════
  // APPEARANCE (merged Colors + Background)
  // ══════════════════════════════════════════════════════
  if (activeSection === "appearance") {
    const isSplitLayout = SPLIT_LAYOUTS.includes(draft.layout);

    const lightPresetKeys: (keyof StudioDraft)[] = [
      "primaryColor", "secondaryColor", "bgColor", "surfaceColor",
      "textColor", "mutedColor", "borderColor", "errorColor", "successColor",
    ];
    const darkPresetKeys: (keyof StudioDraft)[] = [
      "darkPrimaryColor", "darkSecondaryColor", "darkBgColor", "darkSurfaceColor",
      "darkTextColor", "darkMutedColor", "darkBorderColor", "darkErrorColor", "darkSuccessColor",
    ];

    const applyPreset = (presetColors: Partial<StudioDraft>, keys: (keyof StudioDraft)[]) => {
      const filtered: Partial<StudioDraft> = {};
      for (const key of keys) {
        if (key in presetColors) (filtered as any)[key] = (presetColors as any)[key];
      }
      batchUpdateDraft(filtered);
    };

    // ── Reusable BgControls ──
    const BgControls = ({
      prefix, bgType, bgColor, bgGradientDirection, bgGradientFrom, bgGradientTo,
      bgImageUrl, bgOverlayEnabled, bgOverlayColor, bgOverlayOpacity, bgBlur,
    }: {
      prefix: string;
      bgType: "solid" | "gradient" | "image";
      bgColor: string;
      bgGradientDirection: string;
      bgGradientFrom: string;
      bgGradientTo: string;
      bgImageUrl: string;
      bgOverlayEnabled: boolean;
      bgOverlayColor: string;
      bgOverlayOpacity: number;
      bgBlur: number;
    }) => {
      // Map field names to draft keys using the prefix
      const f = (field: string): keyof StudioDraft => {
        if (prefix === "") return field as keyof StudioDraft;
        // field comes as "bgType", "bgColor", "bgGradientFrom", etc.
        // Strip "bg" prefix, then prepend our prefix
        const stripped = field.startsWith("bg") ? field.slice(2) : field;
        return `${prefix}${stripped}` as keyof StudioDraft;
      };

      return (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {(["solid", "gradient", "image"] as const).map((type) => (
              <button key={type} onClick={() => updateDraft(f("bgType"), type as any)}
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
            <ColorInput label={t("studio.colors.background")} value={bgColor} onChange={(v) => updateDraft(f("bgColor"), v as any)} />
          )}

          {bgType === "gradient" && (
            <div className="space-y-2">
              <div className="grid grid-cols-4 gap-1">
                {GRADIENT_DIRECTIONS.map((dir) => (
                  <button key={dir.value} onClick={() => updateDraft(f("bgGradientDirection"), dir.value as any)}
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
              <ColorInput label={t("studio.background.from")} value={bgGradientFrom} onChange={(v) => updateDraft(f("bgGradientFrom"), v as any)} />
              <ColorInput label={t("studio.background.to")} value={bgGradientTo} onChange={(v) => updateDraft(f("bgGradientTo"), v as any)} />
              <div className="h-8 w-full rounded-lg border border-border" style={{ background: `linear-gradient(${bgGradientDirection}, ${bgGradientFrom}, ${bgGradientTo})` }} />
            </div>
          )}

          {bgType === "image" && (
            <ImageUploadField
              value={bgImageUrl}
              onChange={(v) => updateDraft(f("bgImageUrl"), v as any)}
              label={t("studio.background.imageUrl") || "Background Image"}
              maxSizeBytes={5 * 1024 * 1024}
              accept="image/png,image/jpeg,image/webp,image/gif"
            />
          )}

          <div className="flex items-center justify-between">
            <span className="text-[10px] font-medium text-muted-foreground">{t("studio.background.overlay")}</span>
            <Switch checked={bgOverlayEnabled} onCheckedChange={(v) => updateDraft(f("bgOverlayEnabled"), v as any)} />
          </div>
          {bgOverlayEnabled && (
            <>
              <ColorInput label={t("studio.background.overlayColor")} value={bgOverlayColor} onChange={(v) => updateDraft(f("bgOverlayColor"), v as any)} />
              <SliderInput label={t("studio.background.overlayOpacity")} value={bgOverlayOpacity} min={0} max={1} step={0.05} unit="" onChange={(v) => updateDraft(f("bgOverlayOpacity"), v as any)} />
            </>
          )}
          <SliderInput label={t("studio.background.blur")} value={bgBlur} min={0} max={20} onChange={(v) => updateDraft(f("bgBlur"), v as any)} />
        </div>
      );
    };

    // ── Preset Dots ──
    const PresetDots = ({ mode, onApply }: { mode: "light" | "dark"; onApply: (c: Partial<StudioDraft>) => void }) => (
      <div className="grid grid-cols-3 gap-1.5">
        {COLOR_PRESETS.map((preset, i) => {
          const dots = mode === "light"
            ? [preset.colors.primaryColor, preset.colors.bgColor, preset.colors.surfaceColor]
            : [preset.colors.darkPrimaryColor, preset.colors.darkBgColor, preset.colors.darkSurfaceColor];
          return (
            <button key={i} onClick={() => onApply(preset.colors)}
              className="flex flex-col items-center gap-1 rounded-lg border border-border p-1.5 hover:border-primary/30 hover:bg-muted/30 transition-all"
            >
              <div className="flex gap-0.5">
                {dots.map((c, ci) => <div key={ci} className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: c }} />)}
              </div>
              <span className="text-[9px] text-muted-foreground">{t(preset.labelKey)}</span>
            </button>
          );
        })}
      </div>
    );

    return (
      <div className="space-y-5">
        {/* ─── SECTION MODE (split layouts only) ─── */}
        {isSplitLayout && (
          <div className="space-y-2 rounded-lg border border-border/60 bg-muted/20 p-3">
            <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              📐 {t("studio.background.panelBg")}
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
              {(["unified", "independent"] as const).map((mode) => (
                <button key={mode} onClick={() => updateDraft("splitBgMode", mode)}
                  className={`h-7 rounded-md border text-[10px] font-medium transition-all ${
                    draft.splitBgMode === mode
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/30"
                  }`}
                >
                  {mode === "unified" ? t("studio.background.panelSame") : t("studio.background.panelIndependent")}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-muted-foreground">
              {draft.splitBgMode === "unified" ? t("studio.background.panelSameDesc") : t("studio.background.panelIndependentDesc")}
            </p>
          </div>
        )}

        {/* ═══════════════ ☀️ LIGHT THEME ═══════════════ */}
        <div className="space-y-3 rounded-lg border border-border/60 bg-gradient-to-b from-amber-50/30 to-transparent p-3 dark:from-amber-950/10">
          <h4 className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>☀️</span> {t("studio.appearance.lightTheme")}
          </h4>

          {/* Light Presets */}
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t("studio.colors.presets")}</h5>
            <PresetDots mode="light" onApply={(c) => applyPreset(c, lightPresetKeys)} />
          </div>

          {/* Light Page Background */}
          <div className="space-y-2 border-t border-border/40 pt-3">
            <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">🖼️ {t("studio.background.type")}</h5>
            <BgControls prefix="" bgType={draft.bgType} bgColor={draft.bgColor}
              bgGradientDirection={draft.bgGradientDirection} bgGradientFrom={draft.bgGradientFrom} bgGradientTo={draft.bgGradientTo}
              bgImageUrl={draft.bgImageUrl} bgOverlayEnabled={draft.bgOverlayEnabled} bgOverlayColor={draft.bgOverlayColor}
              bgOverlayOpacity={draft.bgOverlayOpacity} bgBlur={draft.bgBlur} />
          </div>

          {/* Light Color Palette */}
          <div className="space-y-2 border-t border-border/40 pt-3">
            <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">🎨 {t("studio.colors.lightPalette")}</h5>
            <ColorInput label={t("studio.colors.primary")} value={draft.primaryColor} onChange={(v) => updateDraft("primaryColor", v)} />
            <ColorInput label={t("studio.colors.secondary")} value={draft.secondaryColor} onChange={(v) => updateDraft("secondaryColor", v)} />
            <ColorInput label={t("studio.colors.surface")} value={draft.surfaceColor} onChange={(v) => updateDraft("surfaceColor", v)} />
            <ColorInput label={t("studio.colors.text")} value={draft.textColor} onChange={(v) => updateDraft("textColor", v)} />
            <ColorInput label={t("studio.colors.muted")} value={draft.mutedColor} onChange={(v) => updateDraft("mutedColor", v)} />
            <ColorInput label={t("studio.colors.border")} value={draft.borderColor} onChange={(v) => updateDraft("borderColor", v)} />
            <ColorInput label={t("studio.colors.error")} value={draft.errorColor} onChange={(v) => updateDraft("errorColor", v)} />
            <ColorInput label={t("studio.colors.success")} value={draft.successColor} onChange={(v) => updateDraft("successColor", v)} />
          </div>

          {/* Light Panel Bg (split + independent) */}
          {isSplitLayout && draft.splitBgMode === "independent" && (
            <div className="space-y-2 border-t border-border/40 pt-3">
              <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">📐 {t("studio.background.brandingPanel")}</h5>
              <BgControls prefix="panelBg" bgType={draft.panelBgType} bgColor={draft.panelBgColor}
                bgGradientDirection={draft.panelBgGradientDirection} bgGradientFrom={draft.panelBgGradientFrom} bgGradientTo={draft.panelBgGradientTo}
                bgImageUrl={draft.panelBgImageUrl} bgOverlayEnabled={draft.panelBgOverlayEnabled} bgOverlayColor={draft.panelBgOverlayColor}
                bgOverlayOpacity={draft.panelBgOverlayOpacity} bgBlur={draft.panelBgBlur} />
            </div>
          )}
        </div>

        {/* ═══════════════ 🌙 DARK THEME ═══════════════ */}
        <div className="space-y-3 rounded-lg border border-border/60 bg-gradient-to-b from-indigo-950/20 to-transparent p-3 dark:from-indigo-950/30">
          <h4 className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            <span>🌙</span> {t("studio.appearance.darkTheme")}
          </h4>

          {/* Dark Presets */}
          <div className="space-y-1.5">
            <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{t("studio.colors.presets")}</h5>
            <PresetDots mode="dark" onApply={(c) => applyPreset(c, darkPresetKeys)} />
          </div>

          {/* Dark Page Background */}
          <div className="space-y-2 border-t border-border/40 pt-3">
            <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">🖼️ {t("studio.background.type")}</h5>
            <BgControls prefix="darkBg" bgType={draft.darkBgType} bgColor={draft.darkBgColor}
              bgGradientDirection={draft.darkBgGradientDirection} bgGradientFrom={draft.darkBgGradientFrom} bgGradientTo={draft.darkBgGradientTo}
              bgImageUrl={draft.darkBgImageUrl} bgOverlayEnabled={draft.darkBgOverlayEnabled} bgOverlayColor={draft.darkBgOverlayColor}
              bgOverlayOpacity={draft.darkBgOverlayOpacity} bgBlur={draft.darkBgBlur} />
          </div>

          {/* Dark Color Palette */}
          <div className="space-y-2 border-t border-border/40 pt-3">
            <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">🎨 {t("studio.colors.darkPalette")}</h5>
            <ColorInput label={t("studio.colors.primary")} value={draft.darkPrimaryColor} onChange={(v) => updateDraft("darkPrimaryColor", v)} />
            <ColorInput label={t("studio.colors.secondary")} value={draft.darkSecondaryColor} onChange={(v) => updateDraft("darkSecondaryColor", v)} />
            <ColorInput label={t("studio.colors.surface")} value={draft.darkSurfaceColor} onChange={(v) => updateDraft("darkSurfaceColor", v)} />
            <ColorInput label={t("studio.colors.text")} value={draft.darkTextColor} onChange={(v) => updateDraft("darkTextColor", v)} />
            <ColorInput label={t("studio.colors.muted")} value={draft.darkMutedColor} onChange={(v) => updateDraft("darkMutedColor", v)} />
            <ColorInput label={t("studio.colors.border")} value={draft.darkBorderColor} onChange={(v) => updateDraft("darkBorderColor", v)} />
            <ColorInput label={t("studio.colors.error")} value={draft.darkErrorColor} onChange={(v) => updateDraft("darkErrorColor", v)} />
            <ColorInput label={t("studio.colors.success")} value={draft.darkSuccessColor} onChange={(v) => updateDraft("darkSuccessColor", v)} />
          </div>

          {/* Dark Panel Bg (split + independent) */}
          {isSplitLayout && draft.splitBgMode === "independent" && (
            <div className="space-y-2 border-t border-border/40 pt-3">
              <h5 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">📐 {t("studio.background.brandingPanel")}</h5>
              <BgControls prefix="darkPanelBg" bgType={draft.darkPanelBgType} bgColor={draft.darkPanelBgColor}
                bgGradientDirection={draft.darkPanelBgGradientDirection} bgGradientFrom={draft.darkPanelBgGradientFrom} bgGradientTo={draft.darkPanelBgGradientTo}
                bgImageUrl={draft.darkPanelBgImageUrl} bgOverlayEnabled={draft.darkPanelBgOverlayEnabled} bgOverlayColor={draft.darkPanelBgOverlayColor}
                bgOverlayOpacity={draft.darkPanelBgOverlayOpacity} bgBlur={draft.darkPanelBgBlur} />
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
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("studio.typography.fontFamily")}
          </label>
          <Select value={draft.fontFamily} onValueChange={(v) => updateDraft("fontFamily", v)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS_EN.map((font) => (
                <SelectItem key={font} value={font} className="text-xs" style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Font (Arabic) */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("studio.typography.fontFamilyAr")}
          </label>
          <Select value={draft.fontFamilyAr} onValueChange={(v) => updateDraft("fontFamilyAr", v)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS_AR.map((font) => (
                <SelectItem key={font} value={font} className="text-xs" style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Heading Font */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("studio.typography.headingFont")}
          </label>
          <Select value={draft.headingFont || draft.fontFamily} onValueChange={(v) => updateDraft("headingFont", v)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS_EN.map((font) => (
                <SelectItem key={font} value={font} className="text-xs" style={{ fontFamily: font }}>
                  {font}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Heading Size */}
        <SliderInput label={t("studio.typography.headingSize")} value={draft.headingSize} min={20} max={56} onChange={(v) => updateDraft("headingSize", v)} />

        {/* Body Size */}
        <SliderInput label={t("studio.typography.bodySize")} value={draft.bodySize} min={10} max={22} onChange={(v) => updateDraft("bodySize", v)} />

        {/* Heading Weight */}
        <SliderInput label={t("studio.typography.headingWeight")} value={draft.headingWeight} min={300} max={900} step={100} onChange={(v) => updateDraft("headingWeight", v)} />

        {/* Body Weight */}
        <SliderInput label={t("studio.typography.bodyWeight")} value={draft.bodyWeight} min={300} max={700} step={100} onChange={(v) => updateDraft("bodyWeight", v)} />

        {/* Line Height */}
        <SliderInput label={t("studio.typography.lineHeight")} value={draft.lineHeight} min={1} max={2.5} step={0.1} unit="" onChange={(v) => updateDraft("lineHeight", v)} />

        {/* Letter Spacing */}
        <SliderInput label={t("studio.typography.letterSpacing")} value={draft.letterSpacing} min={-2} max={4} step={0.5} unit="px" onChange={(v) => updateDraft("letterSpacing", v)} />
      </div>
    );
  }

  // ══════════════════════════════════════════════════════
  // SPACING & SHAPE
  // ══════════════════════════════════════════════════════
  if (activeSection === "spacing") {
    return (
      <div className="space-y-5">
        <SliderInput label={t("studio.spacing.borderRadius")} value={draft.borderRadius} min={0} max={24} onChange={(v) => updateDraft("borderRadius", v)} />
        <SliderInput label={t("studio.spacing.formWidth")} value={draft.formWidth} min={320} max={560} step={10} onChange={(v) => updateDraft("formWidth", v)} />
        <SliderInput label={t("studio.spacing.cardPadding")} value={draft.cardPadding} min={16} max={48} step={4} onChange={(v) => updateDraft("cardPadding", v)} />
        <SliderInput label={t("studio.spacing.elementGap")} value={draft.elementGap} min={8} max={32} step={4} onChange={(v) => updateDraft("elementGap", v)} />
        <SliderInput label={t("studio.spacing.inputHeight")} value={draft.inputHeight} min={36} max={52} step={2} onChange={(v) => updateDraft("inputHeight", v)} />
        <SliderInput label={t("studio.spacing.btnRadius")} value={draft.btnRadius} min={0} max={24} onChange={(v) => updateDraft("btnRadius", v)} />
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{t("studio.spacing.btnSize")}</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["sm", "md", "lg"] as const).map((size) => (
              <button key={size} onClick={() => updateDraft("btnSize", size)}
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
