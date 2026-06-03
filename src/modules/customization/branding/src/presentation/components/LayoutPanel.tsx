/**
 * LayoutPanel — 22 login layout selector with visual thumbnails
 * Now page-aware: each auth page can have its own layout, headline, subtitle.
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (toggle switches, gradient pickers, layout thumbnails, etc.)
// where @core/ui/button's padding/sizing would break the layout.

import { CheckCircle, Layout, LayoutGrid } from "lucide-react";
import { cn } from "@/core/common/utils";
import { ALL_LAYOUTS } from "../../domain/entities/StudioDraft";
import type { LoginLayout } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import type { AuthPageId, AuthPageOverride } from "../../domain/entities/StudioDraft";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import { Switch } from "@core/ui/switch";
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

// Mini visual previews for each layout
const LAYOUT_THUMBNAILS: Record<LoginLayout, React.ReactNode> = {
  vault: (
    <div className="relative flex h-full w-full gap-0.5 overflow-hidden">
      <div className="relative flex-1 rounded-sm bg-gradient-to-br from-primary/40 via-primary/20 to-primary/40">
        <div className="absolute left-1/2 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/60 blur-[1px]" />
      </div>
      <div className="flex w-[45%] flex-col items-center justify-center gap-1 rounded-sm border border-primary/20 bg-background/70 backdrop-blur-sm">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/40" />
        <div className="h-1 w-6 rounded-full bg-muted-foreground/30" />
        <div className="h-1.5 w-5 rounded-sm bg-primary/60" />
      </div>
    </div>
  ),
  "split-right": (
    <div className="flex h-full w-full gap-0.5">
      <div className="flex-1 rounded-sm bg-primary/30" />
      <div className="flex w-[45%] flex-col items-center justify-center gap-1 rounded-sm bg-muted/60">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/40" />
        <div className="h-1 w-6 rounded-full bg-muted-foreground/30" />
        <div className="h-1.5 w-5 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  "split-left": (
    <div className="flex h-full w-full gap-0.5">
      <div className="flex w-[45%] flex-col items-center justify-center gap-1 rounded-sm bg-muted/60">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/40" />
        <div className="h-1 w-6 rounded-full bg-muted-foreground/30" />
        <div className="h-1.5 w-5 rounded-sm bg-primary/50" />
      </div>
      <div className="flex-1 rounded-sm bg-primary/30" />
    </div>
  ),
  centered: (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-sm bg-muted/40">
      <div className="h-2 w-2 rounded-full bg-primary/40" />
      <div className="h-1 w-5 rounded-full bg-muted-foreground/40" />
      <div className="h-1 w-7 rounded-full bg-muted-foreground/30" />
      <div className="h-1.5 w-5 rounded-sm bg-primary/50" />
    </div>
  ),
  "branded-full": (
    <div className="relative flex h-full w-full items-center justify-center rounded-sm bg-gradient-to-br from-primary/20 to-primary/40">
      <div className="absolute inset-0 rounded-sm bg-black/30" />
      <div className="relative z-10 flex flex-col items-center gap-0.5 rounded-md bg-background/80 p-1.5">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/40" />
        <div className="h-1 w-3 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  minimal: (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 rounded-sm bg-muted/30">
      <div className="flex items-center gap-0.5">
        <div className="h-1.5 w-1.5 rounded-sm bg-muted-foreground/30" />
        <div className="h-1 w-4 rounded-full bg-muted-foreground/40" />
      </div>
      <div className="h-1 w-6 rounded-full bg-muted-foreground/30" />
      <div className="h-1.5 w-5 rounded-sm bg-primary/50" />
    </div>
  ),
  overlay: (
    <div className="relative flex h-full w-full items-center justify-center rounded-sm bg-gradient-to-br from-muted/40 to-muted/60">
      <div className="absolute inset-0 rounded-sm backdrop-blur-[1px]" />
      <div className="relative z-10 flex flex-col items-center gap-0.5 rounded-lg border border-white/20 bg-white/10 p-1.5 backdrop-blur-sm">
        <div className="h-1 w-4 rounded-full bg-white/40" />
        <div className="h-1 w-3 rounded-sm bg-primary/60" />
      </div>
    </div>
  ),
  magazine: (
    <div className="flex h-full w-full gap-0.5">
      <div className="flex flex-1 flex-col justify-end rounded-sm bg-primary/20 p-1">
        <div className="h-1.5 w-6 rounded-full bg-foreground/40" />
        <div className="mt-0.5 h-1 w-8 rounded-full bg-muted-foreground/30" />
      </div>
      <div className="flex w-[40%] flex-col items-center justify-center gap-1 rounded-sm bg-muted/60">
        <div className="h-1 w-5 rounded-full bg-muted-foreground/30" />
        <div className="h-1.5 w-4 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  stacked: (
    <div className="flex h-full w-full flex-col gap-0.5 rounded-sm">
      <div className="flex h-[35%] items-center justify-center rounded-sm bg-primary/30">
        <div className="h-2 w-2 rounded-full bg-white/40" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-sm bg-muted/50">
        <div className="h-1 w-5 rounded-full bg-muted-foreground/30" />
        <div className="h-1.5 w-4 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  "sidebar-compact": (
    <div className="flex h-full w-full gap-0.5">
      <div className="flex w-[25%] flex-col items-center justify-center gap-1 rounded-sm bg-primary/30">
        <div className="h-1.5 w-1.5 rounded-full bg-white/40" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-1 rounded-sm bg-muted/50">
        <div className="h-1 w-5 rounded-full bg-muted-foreground/30" />
        <div className="h-1 w-6 rounded-full bg-muted-foreground/20" />
        <div className="h-1.5 w-5 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  asymmetric: (
    <div className="flex h-full w-full gap-0.5">
      <div className="flex w-[60%] items-center justify-center rounded-sm bg-primary/25">
        <div className="h-3 w-3 rounded-full bg-white/20" />
      </div>
      <div className="flex w-[40%] flex-col items-center justify-center gap-1 rounded-sm bg-muted/60">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/30" />
        <div className="h-1.5 w-4 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  floating: (
    <div className="flex h-full w-full items-center justify-center rounded-sm bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(128,128,128,0.05)_3px,rgba(128,128,128,0.05)_6px)]">
      <div className="flex flex-col items-center gap-0.5 rounded-lg border border-border bg-background p-2 shadow-sm">
        <div className="h-1.5 w-1.5 rounded-full bg-primary/40" />
        <div className="h-1 w-4 rounded-full bg-muted-foreground/30" />
        <div className="h-1.5 w-4 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  immersive: (
    <div className="relative flex h-full w-full items-center justify-center rounded-sm bg-gradient-to-br from-violet-500/20 via-primary/20 to-cyan-500/20">
      <div className="absolute inset-0 rounded-sm bg-black/40" />
      <div className="relative z-10 flex flex-col items-center gap-0.5 rounded-md bg-background/70 p-1.5 backdrop-blur-sm">
        <div className="h-1 w-4 rounded-full bg-foreground/40" />
        <div className="h-1 w-3 rounded-sm bg-primary/60" />
      </div>
    </div>
  ),
  "split-diagonal": (
    <div className="flex h-full w-full overflow-hidden rounded-sm">
      <div
        className="flex-1 bg-primary/30"
        style={{ clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }}
      />
      <div className="flex w-[45%] flex-col items-center justify-center gap-1 bg-muted/60">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/30" />
        <div className="h-1.5 w-4 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  carousel: (
    <div className="flex h-full w-full gap-0.5">
      <div className="flex flex-1 flex-col justify-center gap-1 rounded-sm bg-primary/25 p-1">
        <div className="h-1 w-5 rounded-full bg-white/30" />
        <div className="h-1 w-7 rounded-full bg-white/20" />
        <div className="mt-0.5 h-0.5 w-3 rounded-full bg-white/40" />
      </div>
      <div className="flex w-[42%] flex-col items-center justify-center gap-1 rounded-sm bg-muted/60">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/30" />
        <div className="h-1.5 w-4 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  "glass-morphism": (
    <div className="relative flex h-full w-full items-center justify-center rounded-sm bg-gradient-to-br from-primary/15 to-muted/40">
      <div className="absolute start-1 top-1 h-3 w-3 rounded-full bg-primary/20 blur-[4px]" />
      <div className="absolute bottom-1 end-1 h-2 w-2 rounded-full bg-primary/15 blur-[3px]" />
      <div className="relative z-10 flex flex-col items-center gap-0.5 rounded-xl border border-primary/20 bg-background/60 p-2 backdrop-blur-sm">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/30" />
        <div className="h-1 w-3 rounded-sm bg-primary/60" />
      </div>
    </div>
  ),
  "gradient-wave": (
    <div className="flex h-full w-full flex-col rounded-sm">
      <div className="flex h-[40%] items-center justify-center rounded-t-sm bg-primary/25">
        <div className="h-2 w-2 rounded-full bg-white/30" />
      </div>
      <svg viewBox="0 0 40 6" className="w-full">
        <path d="M0,3 C10,6 20,0 30,3 C35,5 38,3 40,3 L40,6 L0,6 Z" fill="hsl(var(--background))" />
      </svg>
      <div className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-background">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/30" />
        <div className="h-1 w-3 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  spotlight: (
    <div className="relative flex h-full w-full items-center justify-center rounded-sm bg-muted/30">
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.15) 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 flex flex-col items-center gap-0.5 rounded-lg border border-border bg-background p-1.5 shadow-sm">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/30" />
        <div className="h-1 w-3 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  "dual-panel": (
    <div className="flex h-full w-full flex-col gap-0.5 rounded-sm">
      <div className="flex h-[20%] items-center gap-1 rounded-sm bg-muted/50 px-1">
        <div className="h-1.5 w-1.5 rounded-sm bg-primary/40" />
        <div className="h-0.5 w-3 rounded-full bg-muted-foreground/30" />
      </div>
      <div className="flex flex-1 gap-0.5">
        <div className="flex flex-1 flex-col justify-center gap-0.5 rounded-sm bg-muted/40 p-1">
          <div className="h-1 w-5 rounded-full bg-muted-foreground/30" />
          <div className="h-1 w-4 rounded-full bg-muted-foreground/20" />
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-sm bg-muted/60">
          <div className="h-1 w-4 rounded-full bg-muted-foreground/30" />
          <div className="h-1 w-3 rounded-sm bg-primary/50" />
        </div>
      </div>
    </div>
  ),
  "corner-card": (
    <div className="relative flex h-full w-full rounded-sm bg-gradient-to-br from-muted/30 to-primary/15">
      <div className="flex flex-1 flex-col justify-center p-1">
        <div className="h-1.5 w-6 rounded-full bg-foreground/30" />
        <div className="mt-0.5 h-1 w-5 rounded-full bg-muted-foreground/20" />
      </div>
      <div className="absolute bottom-1 end-1 flex flex-col items-center gap-0.5 rounded-md border border-border bg-background p-1 shadow-sm">
        <div className="h-1 w-3 rounded-full bg-muted-foreground/30" />
        <div className="h-1 w-2.5 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  "vertical-split": (
    <div className="flex h-full w-full flex-col gap-0.5 rounded-sm">
      <div className="flex h-1/2 flex-col items-center justify-center gap-0.5 rounded-sm bg-primary/20">
        <div className="h-2 w-2 rounded-full bg-white/30" />
        <div className="h-1 w-5 rounded-full bg-white/20" />
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-0.5 rounded-sm bg-muted/50">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/30" />
        <div className="h-1 w-3 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  "fullscreen-form": (
    <div className="relative flex h-full w-full flex-col items-center justify-center gap-1 rounded-sm bg-muted/20">
      <div className="absolute inset-0 rounded-sm bg-[radial-gradient(circle,hsl(var(--border))_0.5px,transparent_0.5px)] bg-[size:4px_4px] opacity-30" />
      <div className="relative z-10 h-2 w-2 rounded-full bg-muted-foreground/20" />
      <div className="relative z-10 h-1 w-5 rounded-full bg-muted-foreground/30" />
      <div className="relative z-10 h-1.5 w-4 rounded-sm bg-primary/50" />
    </div>
  ),
  mosaic: (
    <div className="relative flex h-full w-full items-center justify-center rounded-sm bg-muted/20">
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-px p-0.5 opacity-20">
        {[0.3, 0.5, 0.4, 0.6, 0.3, 0.5].map((o, i) => (
          <div key={i} className="rounded-[1px] bg-primary" style={{ opacity: o }} />
        ))}
      </div>
      <div className="relative z-10 flex flex-col items-center gap-0.5 rounded-lg border border-border bg-background p-1.5 shadow-sm">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/30" />
        <div className="h-1 w-3 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
};

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
  return (
    <div className="space-y-4">
      {/* Mode Toggle: Presets / Builder */}
      {onCanvasModeChange && (
        <div className="flex gap-1 rounded-lg border border-border bg-muted/20 p-1">
          <button
            onClick={() => onCanvasModeChange("layout")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all",
              canvasMode === "layout" || !canvasMode
                ? "border border-border/50 bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            <Layout className="h-3.5 w-3.5" />
            {t("studio.builder.mode.presets") || "Presets"}
          </button>
          <button
            onClick={() => onCanvasModeChange("builder")}
            className={cn(
              "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all",
              canvasMode === "builder"
                ? "border border-border/50 bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            {t("studio.builder.mode.builder") || "Builder"}
          </button>
        </div>
      )}

      {/* Builder mode hint */}
      {canvasMode === "builder" && (
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2">
          <p className="text-xs text-violet-600 dark:text-violet-400">
            {t("studio.builder.activeHint") ||
              "Builder mode active — use the Builder tab to arrange components"}
          </p>
        </div>
      )}
      {/* Page context indicator */}
      {activeAuthPage && activeAuthPage !== "login" && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="text-xs text-blue-600 dark:text-blue-400">
            {t(
              `studio.page.${activeAuthPage === "forgot-password" ? "forgotPassword" : activeAuthPage === "reset-password" ? "resetPassword" : activeAuthPage === "verify-email" ? "verifyEmail" : activeAuthPage}`
            ) || activeAuthPage}
          </span>
        </div>
      )}

      {/* Per-page headline & subtitle */}
      {pageOverride && onUpdatePageField && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("studio.pageContent") || "Page Content"}
          </p>
          <div className="space-y-1.5">
            <Label className="text-xs">{t("studio.fields.headline") || "Headline"}</Label>
            <Input
              value={pageOverride.headline}
              onChange={(e) => onUpdatePageField("headline", e.target.value)}
              placeholder={t("studio.fields.headlinePlaceholder") || "Page headline..."}
              className="h-8 text-xs"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">{t("studio.fields.subtitle") || "Subtitle"}</Label>
            <Input
              value={pageOverride.subtitle}
              onChange={(e) => onUpdatePageField("subtitle", e.target.value)}
              placeholder={t("studio.fields.subtitlePlaceholder") || "Page subtitle..."}
              className="h-8 text-xs"
            />
          </div>
        </div>
      )}

      {/* Per-page background controls (non-login pages only) */}
      {pageOverride && onUpdatePageField && activeAuthPage && activeAuthPage !== "login" && (
        <div className="space-y-3 rounded-lg border border-border bg-muted/20 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            {t("studio.pageBg") || "Page Background"}
          </p>

          {/* Inherit toggle */}
          <div className="flex cursor-pointer items-center justify-between">
            <span className="text-xs text-foreground">
              {t("studio.fields.inheritBg") || "Inherit background from Login page"}
            </span>
            <Switch
              checked={pageOverride.inheritBackground !== false}
              onCheckedChange={(checked) => onUpdatePageField("inheritBackground", checked)}
            />
          </div>

          {/* Per-page background settings (when not inheriting) */}
          {pageOverride.inheritBackground === false && (
            <div className="space-y-2 border-t border-border/50 pt-1">
              {/* Background type */}
              <div className="space-y-1">
                <Label className="text-[10px] text-muted-foreground">
                  {t("studio.fields.bgType") || "Type"}
                </Label>
                <div className="flex gap-1">
                  {(["solid", "gradient", "image"] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => onUpdatePageField("bgType", type)}
                      className={cn(
                        "h-7 flex-1 rounded-md border text-[10px] font-medium transition-colors",
                        (pageOverride.bgType || "solid") === type
                          ? "border-primary/30 bg-primary/10 text-primary"
                          : "border-border bg-background text-muted-foreground hover:bg-muted"
                      )}
                    >
                      {t(`studio.bg.${type}`) || type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Solid color */}
              {(!pageOverride.bgType || pageOverride.bgType === "solid") && (
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground">
                    {t("studio.fields.bgColor") || "Color"}
                  </Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={pageOverride.bgColor || "#ffffff"}
                      onChange={(e) => onUpdatePageField("bgColor", e.target.value)}
                      className="h-8 w-10 cursor-pointer rounded border border-border"
                    />
                    <Input
                      value={pageOverride.bgColor || ""}
                      onChange={(e) => onUpdatePageField("bgColor", e.target.value)}
                      placeholder="#ffffff"
                      className="h-8 flex-1 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Gradient */}
              {pageOverride.bgType === "gradient" && (
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        {t("studio.fields.gradientFrom") || "From"}
                      </Label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={pageOverride.bgGradientFrom || "#3b82f6"}
                          onChange={(e) => onUpdatePageField("bgGradientFrom", e.target.value)}
                          className="h-7 w-7 cursor-pointer rounded border border-border"
                        />
                        <Input
                          value={pageOverride.bgGradientFrom || ""}
                          onChange={(e) => onUpdatePageField("bgGradientFrom", e.target.value)}
                          className="h-7 flex-1 text-[10px]"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        {t("studio.fields.gradientTo") || "To"}
                      </Label>
                      <div className="flex items-center gap-1">
                        <input
                          type="color"
                          value={pageOverride.bgGradientTo || "#8b5cf6"}
                          onChange={(e) => onUpdatePageField("bgGradientTo", e.target.value)}
                          className="h-7 w-7 cursor-pointer rounded border border-border"
                        />
                        <Input
                          value={pageOverride.bgGradientTo || ""}
                          onChange={(e) => onUpdatePageField("bgGradientTo", e.target.value)}
                          className="h-7 flex-1 text-[10px]"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] text-muted-foreground">
                      {t("studio.fields.gradientDir") || "Direction"}
                    </Label>
                    <select
                      value={pageOverride.bgGradientDirection || "135deg"}
                      onChange={(e) => onUpdatePageField("bgGradientDirection", e.target.value)}
                      className="h-7 w-full rounded-md border border-border bg-background px-2 text-[10px]"
                    >
                      <option value="0deg">↑ Top</option>
                      <option value="45deg">↗ Top Right</option>
                      <option value="90deg">→ Right</option>
                      <option value="135deg">↘ Bottom Right</option>
                      <option value="180deg">↓ Bottom</option>
                      <option value="225deg">↙ Bottom Left</option>
                      <option value="270deg">← Left</option>
                      <option value="315deg">↖ Top Left</option>
                    </select>
                  </div>
                  {/* Preview */}
                  <div
                    className="h-8 rounded-md border border-border"
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
                    <Label className="text-[10px] text-muted-foreground">
                      {t("studio.fields.bgImageUrl") || "Image URL"}
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
                      <Label className="text-[10px] text-muted-foreground">
                        {t("studio.fields.bgFit") || "Fit"}
                      </Label>
                      <select
                        value={pageOverride.bgImageFit || "cover"}
                        onChange={(e) => onUpdatePageField("bgImageFit", e.target.value)}
                        className="h-7 w-full rounded-md border border-border bg-background px-2 text-[10px]"
                      >
                        <option value="cover">Cover</option>
                        <option value="contain">Contain</option>
                        <option value="fill">Fill</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-[10px] text-muted-foreground">
                        {t("studio.fields.bgPosition") || "Position"}
                      </Label>
                      <select
                        value={pageOverride.bgImagePosition || "center"}
                        onChange={(e) => onUpdatePageField("bgImagePosition", e.target.value)}
                        className="h-7 w-full rounded-md border border-border bg-background px-2 text-[10px]"
                      >
                        <option value="center">Center</option>
                        <option value="top">Top</option>
                        <option value="bottom">Bottom</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                    </div>
                  </div>
                  {/* Overlay */}
                  <div className="flex cursor-pointer items-center justify-between">
                    <span className="text-[10px] text-foreground">
                      {t("studio.fields.bgOverlay") || "Enable overlay"}
                    </span>
                    <Switch
                      checked={pageOverride.bgOverlayEnabled || false}
                      onCheckedChange={(checked) => onUpdatePageField("bgOverlayEnabled", checked)}
                    />
                  </div>
                  {pageOverride.bgOverlayEnabled && (
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Color</Label>
                        <input
                          type="color"
                          value={pageOverride.bgOverlayColor || "#000000"}
                          onChange={(e) => onUpdatePageField("bgOverlayColor", e.target.value)}
                          className="h-7 w-full cursor-pointer rounded border border-border"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-[10px] text-muted-foreground">Opacity</Label>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={pageOverride.bgOverlayOpacity ?? 30}
                          onChange={(e) =>
                            onUpdatePageField("bgOverlayOpacity", parseInt(e.target.value, 10))
                          }
                          className="h-2 w-full accent-primary"
                        />
                        <span className="text-[9px] text-muted-foreground">
                          {pageOverride.bgOverlayOpacity ?? 30}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Per-page custom CSS */}
          <div className="space-y-1 border-t border-border/50 pt-2">
            <Label className="text-[10px] text-muted-foreground">
              {t("studio.fields.pageCss") || "Custom CSS (this page only)"}
            </Label>
            <Textarea
              value={pageOverride.customCss || ""}
              onChange={(e) => onUpdatePageField("customCss", e.target.value)}
              placeholder=".login-card { backdrop-filter: blur(20px); }"
              className="h-16 resize-none bg-[#1e1e1e] font-mono text-xs text-[#cccccc]"
              spellCheck={false}
            />
          </div>
        </div>
      )}

      <p className="text-xs text-muted-foreground">{t("studio.layout.description")}</p>

      <div className="grid grid-cols-2 gap-2">
        {ALL_LAYOUTS.map((layout) => {
          const isSelected = selectedLayout === layout.id;
          return (
            <button
              key={layout.id}
              onClick={() => onSelectLayout(layout.id)}
              className={cn(
                "group relative flex flex-col gap-1.5 rounded-xl border p-2 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 shadow-sm ring-1 ring-primary/20"
                  : "border-border hover:border-primary/30 hover:bg-muted/30"
              )}
            >
              {/* Thumbnail */}
              <div
                className={cn(
                  "h-16 w-full overflow-hidden rounded-lg border",
                  isSelected ? "border-primary/30" : "border-border"
                )}
              >
                {LAYOUT_THUMBNAILS[layout.id]}
              </div>

              {/* Label */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium leading-tight text-foreground">
                  {t(layout.labelKey)}
                </span>
                {isSelected && <CheckCircle className="h-3 w-3 shrink-0 text-primary" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
