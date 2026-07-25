// FILE-EXCEPTION: file length
/**
 * LayoutPanel — 23 login layout selector with visual thumbnails
 * Now page-aware: each auth page can have its own layout, headline, subtitle.
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import {
  CheckCircle,
  Layout,
  LayoutGrid,
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  Circle,
} from "lucide-react";
import { cn } from "@/core/common/utils";
import { ALL_LAYOUTS } from "../../domain/entities/StudioDraft";
import type { LoginLayout } from "@core/domain/entities/LoginBrandingTypes";
import type { AuthPageId, AuthPageOverride } from "../../domain/entities/StudioDraft";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Switch } from "@core/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { ColorInput } from "./ColorInput";
import { SliderInput } from "./SliderInput";
import { useI18n } from "@core/providers/i18n-provider";

interface LayoutPanelProps {
  selectedLayout: LoginLayout;
  onSelectLayout: (layout: LoginLayout) => void;
  // Multi-page branding
  activeAuthPage?: AuthPageId;
  pageOverride?: AuthPageOverride;
  onUpdatePageField?: (
    field: keyof AuthPageOverride,
    value: AuthPageOverride[keyof AuthPageOverride]
  ) => void;
  // Builder mode toggle
  canvasMode?: "layout" | "builder";
  onCanvasModeChange?: (mode: "layout" | "builder") => void;
}

// ── Tiny building blocks for the thumbnails — nx tokens only ──
function ThumbBar({ className }: { className?: string }) {
  return <div className={cn("rounded-full bg-nx-ink-3", className)} />;
}
function ThumbAccentBar({ className }: { className?: string }) {
  return <div className={cn("rounded-nx-sm bg-nx-accent-fill", className)} />;
}
function ThumbDot({ className }: { className?: string }) {
  return <div className={cn("rounded-full bg-nx-accent-fill", className)} />;
}

// Mini visual previews for each layout
const LAYOUT_THUMBNAILS: Record<LoginLayout, React.ReactNode> = {
  vault: (
    <div className="relative flex h-full w-full gap-0.5">
      <div className="relative flex-1 rounded-nx-sm bg-gradient-to-br from-nx-accent-wash to-nx-accent-fill">
        <ThumbDot className="absolute start-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 bg-nx-on-fill" />
      </div>
      <div className="flex w-[45%] flex-col items-center justify-center gap-1 rounded-nx-sm border border-nx-line bg-nx-popover">
        <ThumbBar className="h-1 w-4" />
        <ThumbBar className="h-1 w-6" />
        <ThumbAccentBar className="h-1.5 w-5" />
      </div>
    </div>
  ),
  "split-right": (
    <div className="flex h-full w-full gap-0.5">
      <div className="flex-1 rounded-nx-sm bg-nx-accent-wash" />
      <div className="flex w-[45%] flex-col items-center justify-center gap-1 rounded-nx-sm bg-nx-raised">
        <ThumbBar className="h-1 w-4" />
        <ThumbBar className="h-1 w-6" />
        <ThumbAccentBar className="h-1.5 w-5" />
      </div>
    </div>
  ),
  "split-left": (
    <div className="flex h-full w-full gap-0.5">
      <div className="flex w-[45%] flex-col items-center justify-center gap-1 rounded-nx-sm bg-nx-raised">
        <ThumbBar className="h-1 w-4" />
        <ThumbBar className="h-1 w-6" />
        <ThumbAccentBar className="h-1.5 w-5" />
      </div>
      <div className="flex-1 rounded-nx-sm bg-nx-accent-wash" />
    </div>
  ),
  centered: (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-nx-sm bg-nx-raised">
      <ThumbDot className="h-2 w-2" />
      <ThumbBar className="h-1 w-5" />
      <ThumbBar className="h-1 w-7" />
      <ThumbAccentBar className="h-1.5 w-5" />
    </div>
  ),
  "branded-full": (
    <div className="relative flex h-full w-full items-center justify-center rounded-nx-sm bg-nx-accent-wash">
      <div className="absolute inset-0 rounded-nx-sm bg-scrim" />
      <div className="relative flex flex-col items-center gap-0.5 rounded-nx-md bg-nx-popover p-1.5">
        <ThumbBar className="h-1 w-4" />
        <ThumbAccentBar className="h-1 w-3" />
      </div>
    </div>
  ),
  minimal: (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-nx-sm bg-nx-raised">
      <div className="flex items-center gap-0.5">
        <div className="h-1.5 w-1.5 rounded-nx-sm bg-nx-ink-3" />
        <ThumbBar className="h-1 w-4" />
      </div>
      <ThumbBar className="h-1 w-6" />
      <ThumbAccentBar className="h-1.5 w-5" />
    </div>
  ),
  overlay: (
    <div className="relative flex h-full w-full items-center justify-center rounded-nx-sm bg-nx-raised">
      <div className="absolute inset-0 rounded-nx-sm bg-scrim" />
      <div className="relative flex flex-col items-center gap-0.5 rounded-nx-md border border-nx-line bg-nx-popover p-1.5">
        <ThumbBar className="h-1 w-4" />
        <ThumbAccentBar className="h-1 w-3" />
      </div>
    </div>
  ),
  magazine: (
    <div className="flex h-full w-full gap-0.5">
      <div className="flex flex-1 flex-col justify-end rounded-nx-sm bg-nx-accent-wash p-1">
        <ThumbBar className="h-1.5 w-6 bg-nx-ink-2" />
        <ThumbBar className="mt-0.5 h-1 w-8" />
      </div>
      <div className="flex w-[40%] flex-col items-center justify-center gap-1 rounded-nx-sm bg-nx-raised">
        <ThumbBar className="h-1 w-5" />
        <ThumbAccentBar className="h-1.5 w-4" />
      </div>
    </div>
  ),
  stacked: (
    <div className="flex h-full w-full flex-col gap-0.5 rounded-nx-sm">
      <div className="flex h-[35%] items-center justify-center rounded-nx-sm bg-nx-accent-fill">
        <ThumbDot className="h-2 w-2 bg-nx-on-fill" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-nx-sm bg-nx-raised">
        <ThumbBar className="h-1 w-5" />
        <ThumbAccentBar className="h-1.5 w-4" />
      </div>
    </div>
  ),
  "sidebar-compact": (
    <div className="flex h-full w-full gap-0.5">
      <div className="flex w-[25%] flex-col items-center justify-center gap-1 rounded-nx-sm bg-nx-accent-fill">
        <div className="h-1.5 w-1.5 rounded-full bg-nx-on-fill" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-nx-sm bg-nx-raised">
        <ThumbBar className="h-1 w-5" />
        <ThumbBar className="h-1 w-6" />
        <ThumbAccentBar className="h-1.5 w-5" />
      </div>
    </div>
  ),
  asymmetric: (
    <div className="flex h-full w-full gap-0.5">
      <div className="flex w-[60%] items-center justify-center rounded-nx-sm bg-nx-accent-wash">
        <ThumbDot className="h-3 w-3" />
      </div>
      <div className="flex w-[40%] flex-col items-center justify-center gap-1 rounded-nx-sm bg-nx-raised">
        <ThumbBar className="h-1 w-4" />
        <ThumbAccentBar className="h-1.5 w-4" />
      </div>
    </div>
  ),
  floating: (
    <div className="flex h-full w-full items-center justify-center rounded-nx-sm bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,var(--nx-hover)_3px,var(--nx-hover)_6px)]">
      <div className="flex flex-col items-center gap-0.5 rounded-nx-md border border-nx-line bg-nx-popover p-2 shadow-nx-sm">
        <div className="h-1.5 w-1.5 rounded-full bg-nx-accent-fill" />
        <ThumbBar className="h-1 w-4" />
        <ThumbAccentBar className="h-1.5 w-4" />
      </div>
    </div>
  ),
  immersive: (
    <div className="relative flex h-full w-full items-center justify-center rounded-nx-sm bg-gradient-to-br from-nx-accent-wash to-nx-accent-fill">
      <div className="absolute inset-0 rounded-nx-sm bg-scrim" />
      <div className="relative flex flex-col items-center gap-0.5 rounded-nx-md bg-nx-popover p-1.5">
        <ThumbBar className="h-1 w-4" />
        <ThumbAccentBar className="h-1 w-3" />
      </div>
    </div>
  ),
  "split-diagonal": (
    <div className="flex h-full w-full overflow-hidden rounded-nx-sm">
      <div
        className="flex-1 bg-nx-accent-wash"
        style={{ clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }}
      />
      <div className="flex w-[45%] flex-col items-center justify-center gap-1 bg-nx-raised">
        <ThumbBar className="h-1 w-4" />
        <ThumbAccentBar className="h-1.5 w-4" />
      </div>
    </div>
  ),
  carousel: (
    <div className="flex h-full w-full gap-0.5">
      <div className="flex flex-1 flex-col justify-center gap-1 rounded-nx-sm bg-nx-accent-fill p-1">
        <div className="h-1 w-5 rounded-full bg-nx-on-fill" />
        <div className="h-1 w-7 rounded-full bg-nx-on-fill" />
        <div className="mt-0.5 h-0.5 w-3 rounded-full bg-nx-on-fill" />
      </div>
      <div className="flex w-[42%] flex-col items-center justify-center gap-1 rounded-nx-sm bg-nx-raised">
        <ThumbBar className="h-1 w-4" />
        <ThumbAccentBar className="h-1.5 w-4" />
      </div>
    </div>
  ),
  "glass-morphism": (
    <div className="relative flex h-full w-full items-center justify-center rounded-nx-sm bg-nx-accent-wash">
      <ThumbDot className="absolute start-1 top-1 h-3 w-3" />
      <ThumbDot className="absolute bottom-1 end-1 h-2 w-2" />
      <div className="relative flex flex-col items-center gap-0.5 rounded-nx-md border border-nx-line bg-nx-popover p-2">
        <ThumbBar className="h-1 w-4" />
        <ThumbAccentBar className="h-1 w-3" />
      </div>
    </div>
  ),
  "gradient-wave": (
    <div className="flex h-full w-full flex-col rounded-nx-sm">
      <div className="flex h-[40%] items-center justify-center rounded-t-nx-sm bg-nx-accent-fill">
        <div className="h-2 w-2 rounded-full bg-nx-on-fill" />
      </div>
      <svg viewBox="0 0 40 6" className="w-full">
        <path
          d="M0,3 C10,6 20,0 30,3 C35,5 38,3 40,3 L40,6 L0,6 Z"
          style={{ fill: "var(--nx-surface)" }}
        />
      </svg>
      <div className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-nx-surface">
        <ThumbBar className="h-1 w-4" />
        <ThumbAccentBar className="h-1 w-3" />
      </div>
    </div>
  ),
  spotlight: (
    <div className="relative flex h-full w-full items-center justify-center rounded-nx-sm bg-nx-raised">
      <div
        className="absolute inset-0 rounded-nx-sm"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, color-mix(in oklch, var(--nx-accent) 15%, transparent) 0%, transparent 70%)",
        }}
      />
      <div className="relative flex flex-col items-center gap-0.5 rounded-nx-md border border-nx-line bg-nx-popover p-1.5 shadow-nx-sm">
        <ThumbBar className="h-1 w-4" />
        <ThumbAccentBar className="h-1 w-3" />
      </div>
    </div>
  ),
  "dual-panel": (
    <div className="flex h-full w-full flex-col gap-0.5 rounded-nx-sm">
      <div className="flex h-[20%] items-center gap-1 rounded-nx-sm bg-nx-raised px-1">
        <div className="h-1.5 w-1.5 rounded-nx-sm bg-nx-accent-fill" />
        <ThumbBar className="h-0.5 w-3" />
      </div>
      <div className="flex flex-1 gap-0.5">
        <div className="flex flex-1 flex-col justify-center gap-0.5 rounded-nx-sm bg-nx-raised p-1">
          <ThumbBar className="h-1 w-5" />
          <ThumbBar className="h-1 w-4" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-nx-sm bg-nx-accent-wash">
          <ThumbBar className="h-1 w-4" />
          <ThumbAccentBar className="h-1 w-3" />
        </div>
      </div>
    </div>
  ),
  "corner-card": (
    <div className="relative flex h-full w-full rounded-nx-sm bg-gradient-to-br from-nx-raised to-nx-accent-wash">
      <div className="flex flex-1 flex-col justify-center p-1">
        <ThumbBar className="h-1.5 w-6 bg-nx-ink-2" />
        <ThumbBar className="mt-0.5 h-1 w-5" />
      </div>
      <div className="absolute bottom-1 end-1 flex flex-col items-center gap-0.5 rounded-nx-md border border-nx-line bg-nx-popover p-1 shadow-nx-sm">
        <ThumbBar className="h-1 w-3" />
        <ThumbAccentBar className="h-1 w-2.5" />
      </div>
    </div>
  ),
  "vertical-split": (
    <div className="flex h-full w-full flex-col gap-0.5 rounded-nx-sm">
      <div className="flex h-1/2 flex-col items-center justify-center gap-0.5 rounded-nx-sm bg-nx-accent-wash">
        <ThumbDot className="h-2 w-2" />
        <div className="h-1 w-5 rounded-full bg-nx-ink-2" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-nx-sm bg-nx-raised">
        <ThumbBar className="h-1 w-4" />
        <ThumbAccentBar className="h-1 w-3" />
      </div>
    </div>
  ),
  "fullscreen-form": (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-nx-sm bg-nx-raised">
      <div className="absolute inset-0 rounded-nx-sm bg-[radial-gradient(circle,var(--nx-line)_0.5px,transparent_0.5px)] bg-[size:4px_4px]" />
      <div className="relative h-2 w-2 rounded-full bg-nx-ink-3" />
      <ThumbBar className="relative h-1 w-5" />
      <ThumbAccentBar className="relative h-1.5 w-4" />
    </div>
  ),
  mosaic: (
    <div className="relative flex h-full w-full items-center justify-center rounded-nx-sm bg-nx-raised">
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-px p-0.5">
        {["opacity-30", "opacity-50", "opacity-40", "opacity-60", "opacity-30", "opacity-50"].map(
          (o, i) => (
            <div key={i} className={cn("rounded-[1px] bg-nx-accent-fill", o)} />
          )
        )}
      </div>
      <div className="relative flex flex-col items-center gap-0.5 rounded-nx-md border border-nx-line bg-nx-popover p-1.5 shadow-nx-sm">
        <ThumbBar className="h-1 w-4" />
        <ThumbAccentBar className="h-1 w-3" />
      </div>
    </div>
  ),
};

// Compass direction icons, shared by the gradient-direction and image-position pickers.
const DIRECTION_ICONS: Partial<Record<string, typeof ArrowUp>> = {
  top: ArrowUp,
  topRight: ArrowUpRight,
  right: ArrowRight,
  bottomRight: ArrowDownRight,
  bottom: ArrowDown,
  bottomLeft: ArrowDownLeft,
  left: ArrowLeft,
  topLeft: ArrowUpLeft,
  center: Circle,
};

const GRADIENT_DIRECTION_OPTIONS: { value: string; key: string }[] = [
  { value: "0deg", key: "top" },
  { value: "45deg", key: "topRight" },
  { value: "90deg", key: "right" },
  { value: "135deg", key: "bottomRight" },
  { value: "180deg", key: "bottom" },
  { value: "225deg", key: "bottomLeft" },
  { value: "270deg", key: "left" },
  { value: "315deg", key: "topLeft" },
];

const IMAGE_FIT_OPTIONS: { value: string; labelKey: string }[] = [
  { value: "cover", labelKey: "studio.background.fitCover" },
  { value: "contain", labelKey: "studio.background.fitContain" },
  { value: "fill", labelKey: "studio.background.fitFill" },
  { value: "none", labelKey: "studio.background.fitNone" },
];

const IMAGE_POSITION_OPTIONS: { value: string; key: string }[] = [
  { value: "center", key: "center" },
  { value: "top", key: "top" },
  { value: "bottom", key: "bottom" },
  { value: "left", key: "left" },
  { value: "right", key: "right" },
];

/**
 * Presentation UI component rendering the layout panel.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function LayoutPanel({
  selectedLayout,
  onSelectLayout,
  activeAuthPage,
  pageOverride,
  onUpdatePageField,
  canvasMode,
  onCanvasModeChange,
}: LayoutPanelProps) {
  const { t } = useI18n();

  const pageLabelKey =
    activeAuthPage === "forgot-password"
      ? "studio.page.forgotPassword"
      : activeAuthPage === "reset-password"
        ? "studio.page.resetPassword"
        : "studio.page.login";

  return (
    <div className="space-y-4">
      {/* Mode Toggle: Presets / Builder */}
      {onCanvasModeChange && (
        <div className="flex gap-1 rounded-nx-control border border-nx-line bg-nx-raised p-1">
          <button
            type="button"
            onClick={() => onCanvasModeChange("layout")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-nx-sm px-3 py-2 text-xs font-medium transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus",
              canvasMode === "layout" || !canvasMode
                ? "bg-nx-surface text-nx-ink"
                : "text-nx-ink-2 hover:bg-nx-hover hover:text-nx-ink"
            )}
          >
            <Layout className="h-3.5 w-3.5" aria-hidden="true" />
            {t("studio.builder.mode.presets")}
          </button>
          <button
            type="button"
            onClick={() => onCanvasModeChange("builder")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-nx-sm px-3 py-2 text-xs font-medium transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus",
              canvasMode === "builder"
                ? "bg-nx-surface text-nx-ink"
                : "text-nx-ink-2 hover:bg-nx-hover hover:text-nx-ink"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
            {t("studio.builder.mode.builder")}
          </button>
        </div>
      )}

      {/* Builder mode hint */}
      {canvasMode === "builder" && (
        <div className="rounded-nx-md border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash px-3 py-2">
          <p className="text-xs text-nx-accent">{t("studio.builder.activeHint")}</p>
        </div>
      )}
      {/* Page context indicator */}
      {activeAuthPage && activeAuthPage !== "login" && (
        <div className="flex items-center gap-2 rounded-nx-md border border-info/30 bg-info/10 px-3 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-info" />
          <span className="text-xs text-info">{t(pageLabelKey)}</span>
        </div>
      )}

      {/* Per-page headline & subtitle */}
      {pageOverride && onUpdatePageField && (
        <div className="space-y-3 rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("studio.pageContent")}
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs">{t("studio.fields.headline")}</Label>
            <Input
              value={pageOverride.headline}
              onChange={(e) => onUpdatePageField("headline", e.target.value)}
              placeholder={t("studio.fields.headlinePlaceholder")}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t("studio.fields.subtitle")}</Label>
            <Input
              value={pageOverride.subtitle}
              onChange={(e) => onUpdatePageField("subtitle", e.target.value)}
              placeholder={t("studio.fields.subtitlePlaceholder")}
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}

      {/* Per-page background controls (non-login pages only) */}
      {pageOverride && onUpdatePageField && activeAuthPage && activeAuthPage !== "login" && (
        <div className="space-y-3 rounded-nx-md border border-nx-line bg-nx-raised p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
            {t("studio.pageBg")}
          </p>

          {/* Inherit toggle */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-nx-ink">{t("studio.fields.inheritBg")}</span>
            <Switch
              checked={pageOverride.inheritBackground !== false}
              onCheckedChange={(checked) => onUpdatePageField("inheritBackground", checked)}
            />
          </div>

          {/* Per-page background settings (when not inheriting) */}
          {pageOverride.inheritBackground === false && (
            <div className="space-y-2 border-t border-nx-line pt-1">
              {/* Background type */}
              <div className="space-y-1">
                <Label className="text-[10px] text-nx-ink-3">{t("studio.fields.bgType")}</Label>
                <div className="flex gap-1">
                  {(["solid", "gradient", "image"] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => onUpdatePageField("bgType", type)}
                      className={cn(
                        "h-7 flex-1 rounded-nx-control border text-[10px] font-medium transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus",
                        (pageOverride.bgType || "solid") === type
                          ? "border-nx-accent bg-nx-accent-wash text-nx-accent"
                          : "border-nx-line bg-nx-surface text-nx-ink-2 hover:bg-nx-hover"
                      )}
                    >
                      {t(`studio.bg.${type}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Solid color */}
              {(!pageOverride.bgType || pageOverride.bgType === "solid") && (
                <ColorInput
                  label={t("studio.fields.bgColor")}
                  value={pageOverride.bgColor || "#ffffff"}
                  onChange={(v) => onUpdatePageField("bgColor", v)}
                />
              )}

              {/* Gradient */}
              {pageOverride.bgType === "gradient" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <ColorInput
                      label={t("studio.fields.gradientFrom")}
                      value={pageOverride.bgGradientFrom || "#3b82f6"}
                      onChange={(v) => onUpdatePageField("bgGradientFrom", v)}
                    />
                    <ColorInput
                      label={t("studio.fields.gradientTo")}
                      value={pageOverride.bgGradientTo || "#8b5cf6"}
                      onChange={(v) => onUpdatePageField("bgGradientTo", v)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-nx-ink-3">
                      {t("studio.fields.gradientDir")}
                    </Label>
                    <Select
                      value={pageOverride.bgGradientDirection || "135deg"}
                      onValueChange={(v) => onUpdatePageField("bgGradientDirection", v)}
                    >
                      <SelectTrigger className="h-7 text-[10px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {GRADIENT_DIRECTION_OPTIONS.map((dir) => {
                          const Icon = DIRECTION_ICONS[dir.key] ?? ArrowUp;
                          return (
                            <SelectItem key={dir.value} value={dir.value} className="text-xs">
                              <span className="inline-flex items-center gap-1.5">
                                <Icon className="h-3 w-3" aria-hidden="true" />
                                {t(`studio.direction.${dir.key}`)}
                              </span>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Preview */}
                  <div
                    className="h-8 rounded-nx-control border border-nx-line"
                    style={{
                      background: `linear-gradient(${pageOverride.bgGradientDirection || "135deg"}, ${pageOverride.bgGradientFrom || "#3b82f6"}, ${pageOverride.bgGradientTo || "#8b5cf6"})`,
                    }}
                  />
                </div>
              )}

              {/* Image */}
              {pageOverride.bgType === "image" && (
                <div className="space-y-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] text-nx-ink-3">
                      {t("studio.fields.bgImageUrl")}
                    </Label>
                    <Input
                      value={pageOverride.bgImageUrl || ""}
                      onChange={(e) => onUpdatePageField("bgImageUrl", e.target.value)}
                      placeholder="https://..."
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-nx-ink-3">
                        {t("studio.fields.bgFit")}
                      </Label>
                      <Select
                        value={pageOverride.bgImageFit || "cover"}
                        onValueChange={(v) =>
                          onUpdatePageField(
                            "bgImageFit",
                            v as "cover" | "contain" | "fill" | "none"
                          )
                        }
                      >
                        <SelectTrigger className="h-7 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IMAGE_FIT_OPTIONS.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value} className="text-xs">
                              {t(opt.labelKey)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-nx-ink-3">
                        {t("studio.fields.bgPosition")}
                      </Label>
                      <Select
                        value={pageOverride.bgImagePosition || "center"}
                        onValueChange={(v) => onUpdatePageField("bgImagePosition", v)}
                      >
                        <SelectTrigger className="h-7 text-[10px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {IMAGE_POSITION_OPTIONS.map((opt) => {
                            const Icon = DIRECTION_ICONS[opt.key] ?? Circle;
                            return (
                              <SelectItem key={opt.value} value={opt.value} className="text-xs">
                                <span className="inline-flex items-center gap-1.5">
                                  <Icon className="h-3 w-3" aria-hidden="true" />
                                  {t(`studio.direction.${opt.key}`)}
                                </span>
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  {/* Overlay */}
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-nx-ink">{t("studio.fields.bgOverlay")}</span>
                    <Switch
                      checked={pageOverride.bgOverlayEnabled || false}
                      onCheckedChange={(checked) => onUpdatePageField("bgOverlayEnabled", checked)}
                    />
                  </div>
                  {pageOverride.bgOverlayEnabled && (
                    <div className="grid grid-cols-2 gap-2">
                      <ColorInput
                        label={t("studio.background.overlayColor")}
                        value={pageOverride.bgOverlayColor || "#000000"}
                        onChange={(v) => onUpdatePageField("bgOverlayColor", v)}
                      />
                      <SliderInput
                        label={t("studio.background.overlayOpacity")}
                        value={pageOverride.bgOverlayOpacity ?? 30}
                        min={0}
                        max={100}
                        unit="%"
                        onChange={(v) => onUpdatePageField("bgOverlayOpacity", v)}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Per-page custom CSS */}
          <div className="space-y-1 border-t border-nx-line pt-2">
            <Label className="text-[10px] text-nx-ink-3">{t("studio.fields.pageCss")}</Label>
            <Textarea
              value={pageOverride.customCss || ""}
              onChange={(e) => onUpdatePageField("customCss", e.target.value)}
              placeholder=".login-card { backdrop-filter: blur(20px); }"
              className="h-16 resize-none bg-nx-ground font-mono text-xs"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      <p className="text-xs text-nx-ink-2">{t("studio.layout.description")}</p>

      <div className="grid grid-cols-2 gap-2">
        {ALL_LAYOUTS.map((layout) => {
          const isSelected = selectedLayout === layout.id;
          return (
            <button
              key={layout.id}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelectLayout(layout.id)}
              className={cn(
                "group relative flex flex-col gap-1.5 rounded-nx-md border p-2 text-start transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus",
                isSelected
                  ? "border-nx-accent bg-nx-accent-wash"
                  : "border-nx-line hover:border-nx-line-hi hover:bg-nx-hover"
              )}
            >
              {/* Thumbnail */}
              <div
                className={cn(
                  "h-16 w-full overflow-hidden rounded-nx-sm border",
                  isSelected ? "border-nx-accent" : "border-nx-line"
                )}
              >
                {LAYOUT_THUMBNAILS[layout.id]}
              </div>

              {/* Label */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium leading-tight text-nx-ink">
                  {t(layout.labelKey)}
                </span>
                {isSelected && (
                  <CheckCircle className="h-3 w-3 shrink-0 text-nx-accent" aria-hidden="true" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
