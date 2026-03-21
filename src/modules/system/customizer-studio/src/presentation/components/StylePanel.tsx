/**
 * StylePanel — Colors, Typography (AR+EN fonts), Background, Spacing
 * Uses core Select/Slider components. All labels localized via t()
 */
"use client";

import { ColorInput } from "./ColorInput";
import { SliderInput } from "./SliderInput";
import { Switch } from "@core/ui/switch";
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
  { value: "to top",        label: "↑" },
  { value: "to top right",  label: "↗" },
  { value: "to right",      label: "→" },
  { value: "to bottom right", label: "↘" },
  { value: "to bottom",     label: "↓" },
  { value: "to bottom left", label: "↙" },
  { value: "to left",       label: "←" },
  { value: "to top left",   label: "↖" },
];

export function StylePanel({ t, activeSection, draft, updateDraft, batchUpdateDraft }: StylePanelProps) {
  // ── COLORS ──
  if (activeSection === "colors") {
    return (
      <div className="space-y-5">
        {/* Color Presets */}
        <div className="space-y-2">
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("studio.colors.presets")}
          </h4>
          <div className="grid grid-cols-3 gap-1.5">
            {COLOR_PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => batchUpdateDraft(preset.colors)}
                className="flex flex-col items-center gap-1 rounded-lg border border-border p-1.5 hover:border-primary/30 hover:bg-muted/30 transition-all"
              >
                <div className="flex gap-0.5">
                  <div className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: preset.colors.primaryColor }} />
                  <div className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: preset.colors.bgColor }} />
                  <div className="h-3 w-3 rounded-full border border-border" style={{ backgroundColor: preset.colors.surfaceColor }} />
                </div>
                <span className="text-[9px] text-muted-foreground">{t(preset.labelKey)}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Individual Colors */}
        <div className="space-y-3">
          <h4 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("studio.colors.custom")}
          </h4>
          <ColorInput label={t("studio.colors.primary")} value={draft.primaryColor} onChange={(v) => updateDraft("primaryColor", v)} />
          <ColorInput label={t("studio.colors.secondary")} value={draft.secondaryColor} onChange={(v) => updateDraft("secondaryColor", v)} />
          <ColorInput label={t("studio.colors.background")} value={draft.bgColor} onChange={(v) => updateDraft("bgColor", v)} />
          <ColorInput label={t("studio.colors.surface")} value={draft.surfaceColor} onChange={(v) => updateDraft("surfaceColor", v)} />
          <ColorInput label={t("studio.colors.text")} value={draft.textColor} onChange={(v) => updateDraft("textColor", v)} />
          <ColorInput label={t("studio.colors.muted")} value={draft.mutedColor} onChange={(v) => updateDraft("mutedColor", v)} />
          <ColorInput label={t("studio.colors.border")} value={draft.borderColor} onChange={(v) => updateDraft("borderColor", v)} />
          <ColorInput label={t("studio.colors.error")} value={draft.errorColor} onChange={(v) => updateDraft("errorColor", v)} />
          <ColorInput label={t("studio.colors.success")} value={draft.successColor} onChange={(v) => updateDraft("successColor", v)} />
        </div>
      </div>
    );
  }

  // ── TYPOGRAPHY ──
  if (activeSection === "typography") {
    return (
      <div className="space-y-5">
        {/* English Font Family */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("studio.typography.fontFamilyEn")}
          </label>
          <Select value={draft.fontFamily} onValueChange={(v) => updateDraft("fontFamily", v)}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FONT_OPTIONS_EN.map((font) => (
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs mt-1" style={{ fontFamily: draft.fontFamily }}>
            The quick brown fox jumps over the lazy dog
          </p>
        </div>

        {/* Arabic Font Family */}
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
                <SelectItem key={font} value={font}>
                  <span style={{ fontFamily: font }}>{font}</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs mt-1" dir="rtl" style={{ fontFamily: draft.fontFamilyAr }}>
            الثعلب البني السريع يقفز فوق الكلب الكسول
          </p>
        </div>

        <SliderInput label={t("studio.typography.headingSize")} value={draft.headingSize} min={20} max={64} onChange={(v) => updateDraft("headingSize", v)} />
        <SliderInput label={t("studio.typography.bodySize")} value={draft.bodySize} min={12} max={20} onChange={(v) => updateDraft("bodySize", v)} />

        {/* Heading Weight */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("studio.typography.headingWeight")}
          </label>
          <Select value={String(draft.headingWeight)} onValueChange={(v) => updateDraft("headingWeight", Number(v))}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[300, 400, 500, 600, 700, 800, 900].map((w) => (
                <SelectItem key={w} value={String(w)}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Body Weight */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("studio.typography.bodyWeight")}
          </label>
          <Select value={String(draft.bodyWeight)} onValueChange={(v) => updateDraft("bodyWeight", Number(v))}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[300, 400, 500, 600].map((w) => (
                <SelectItem key={w} value={String(w)}>{w}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <SliderInput label={t("studio.typography.lineHeight")} value={draft.lineHeight} min={1.0} max={2.0} step={0.05} unit="" onChange={(v) => updateDraft("lineHeight", v)} />
        <SliderInput label={t("studio.typography.letterSpacing")} value={draft.letterSpacing} min={-2} max={5} step={0.5} onChange={(v) => updateDraft("letterSpacing", v)} />
      </div>
    );
  }

  // ── BACKGROUND ──
  if (activeSection === "background") {
    return (
      <div className="space-y-5">
        {/* Background Type */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
            {t("studio.background.type")}
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["solid", "gradient", "image"] as const).map((type) => (
              <button
                key={type}
                onClick={() => updateDraft("bgType", type)}
                className={`h-8 rounded-md border text-xs font-medium transition-all ${
                  draft.bgType === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {t(`studio.background.${type}`)}
              </button>
            ))}
          </div>
        </div>

        {/* Solid */}
        {draft.bgType === "solid" && (
          <ColorInput label={t("studio.colors.background")} value={draft.bgColor} onChange={(v) => updateDraft("bgColor", v)} />
        )}

        {/* Gradient */}
        {draft.bgType === "gradient" && (
          <div className="space-y-3">
            {/* Direction */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">
                {t("studio.background.direction")}
              </label>
              <div className="grid grid-cols-4 gap-1">
                {GRADIENT_DIRECTIONS.map((dir) => (
                  <button
                    key={dir.value}
                    onClick={() => updateDraft("bgGradientDirection", dir.value)}
                    className={`h-7 rounded-md border text-xs transition-all ${
                      draft.bgGradientDirection === dir.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    }`}
                  >
                    {dir.label}
                  </button>
                ))}
              </div>
            </div>
            <ColorInput label={t("studio.background.from")} value={draft.bgGradientFrom} onChange={(v) => updateDraft("bgGradientFrom", v)} />
            <ColorInput label={t("studio.background.to")} value={draft.bgGradientTo} onChange={(v) => updateDraft("bgGradientTo", v)} />
            {/* Gradient Preview */}
            <div
              className="h-12 w-full rounded-lg border border-border"
              style={{
                background: `linear-gradient(${draft.bgGradientDirection}, ${draft.bgGradientFrom}, ${draft.bgGradientTo})`,
              }}
            />
          </div>
        )}

        {/* Image */}
        {draft.bgType === "image" && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-muted-foreground">
                {t("studio.background.imageUrl")}
              </label>
              <input
                type="text"
                value={draft.bgImageUrl}
                onChange={(e) => updateDraft("bgImageUrl", e.target.value)}
                placeholder="https://..."
                className="h-8 w-full rounded-md border border-input bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/20"
              />
            </div>
            {draft.bgImageUrl && (
              <div className="h-20 w-full overflow-hidden rounded-lg border border-border">
                <img src={draft.bgImageUrl} alt="Background" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
              </div>
            )}
          </div>
        )}

        {/* Overlay */}
        <div className="space-y-3 border-t border-border pt-4">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              {t("studio.background.overlay")}
            </label>
            <Switch
              checked={draft.bgOverlayEnabled}
              onCheckedChange={(v) => updateDraft("bgOverlayEnabled", v)}
            />
          </div>
          {draft.bgOverlayEnabled && (
            <>
              <ColorInput label={t("studio.background.overlayColor")} value={draft.bgOverlayColor} onChange={(v) => updateDraft("bgOverlayColor", v)} />
              <SliderInput label={t("studio.background.overlayOpacity")} value={draft.bgOverlayOpacity} min={0} max={1} step={0.05} unit="" onChange={(v) => updateDraft("bgOverlayOpacity", v)} />
            </>
          )}
        </div>

        <SliderInput label={t("studio.background.blur")} value={draft.bgBlur} min={0} max={20} onChange={(v) => updateDraft("bgBlur", v)} />
      </div>
    );
  }

  // ── SPACING & SHAPE ──
  if (activeSection === "spacing") {
    return (
      <div className="space-y-5">
        <SliderInput label={t("studio.spacing.borderRadius")} value={draft.borderRadius} min={0} max={24} onChange={(v) => updateDraft("borderRadius", v)} />
        <SliderInput label={t("studio.spacing.formWidth")} value={draft.formWidth} min={320} max={560} step={10} onChange={(v) => updateDraft("formWidth", v)} />
        <SliderInput label={t("studio.spacing.cardPadding")} value={draft.cardPadding} min={16} max={48} step={4} onChange={(v) => updateDraft("cardPadding", v)} />
        <SliderInput label={t("studio.spacing.elementGap")} value={draft.elementGap} min={8} max={32} step={4} onChange={(v) => updateDraft("elementGap", v)} />
        <SliderInput label={t("studio.spacing.inputHeight")} value={draft.inputHeight} min={36} max={52} step={2} onChange={(v) => updateDraft("inputHeight", v)} />
        <SliderInput label={t("studio.spacing.btnRadius")} value={draft.btnRadius} min={0} max={24} onChange={(v) => updateDraft("btnRadius", v)} />

        {/* Button Size */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
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
