/**
 * LayoutPanel — 22 login layout selector with visual thumbnails
 * Now page-aware: each auth page can have its own layout, headline, subtitle.
 */
"use client";

import { CheckCircle, Layout, LayoutGrid } from "lucide-react";
import { cn } from "@/core/common/utils";
import { ALL_LAYOUTS } from "../viewmodels/useStudioViewModel";
import type { LoginLayout } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import type { AuthPageId, AuthPageOverride } from "../../domain/entities/StudioDraft";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";

interface LayoutPanelProps {
  selectedLayout: LoginLayout;
  onSelectLayout: (layout: LoginLayout) => void;
  // Multi-page branding
  activeAuthPage?: AuthPageId;
  pageOverride?: AuthPageOverride;
  onUpdatePageField?: (field: keyof AuthPageOverride, value: string) => void;
  // Builder mode toggle
  canvasMode?: 'layout' | 'builder';
  onCanvasModeChange?: (mode: 'layout' | 'builder') => void;
}

// Mini visual previews for each layout
const LAYOUT_THUMBNAILS: Record<LoginLayout, React.ReactNode> = {
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
      <div className="flex-1 bg-primary/30" style={{ clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)" }} />
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
      <div className="absolute top-1 start-1 h-3 w-3 rounded-full bg-primary/20 blur-[4px]" />
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
      <svg viewBox="0 0 40 6" className="w-full"><path d="M0,3 C10,6 20,0 30,3 C35,5 38,3 40,3 L40,6 L0,6 Z" fill="hsl(var(--background))" /></svg>
      <div className="flex flex-1 flex-col items-center justify-center gap-0.5 bg-background">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/30" />
        <div className="h-1 w-3 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
  spotlight: (
    <div className="relative flex h-full w-full items-center justify-center rounded-sm bg-muted/30">
      <div className="absolute inset-0 rounded-sm" style={{ background: "radial-gradient(circle at 50% 50%, hsl(var(--primary)/0.15) 0%, transparent 70%)" }} />
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
      <div className="absolute inset-0 bg-[radial-gradient(circle,hsl(var(--border))_0.5px,transparent_0.5px)] bg-[size:4px_4px] opacity-30 rounded-sm" />
      <div className="relative z-10 h-2 w-2 rounded-full bg-muted-foreground/20" />
      <div className="relative z-10 h-1 w-5 rounded-full bg-muted-foreground/30" />
      <div className="relative z-10 h-1.5 w-4 rounded-sm bg-primary/50" />
    </div>
  ),
  mosaic: (
    <div className="relative flex h-full w-full items-center justify-center rounded-sm bg-muted/20">
      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-px p-0.5 opacity-20">
        {[0.3, 0.5, 0.4, 0.6, 0.3, 0.5].map((o, i) => (<div key={i} className="rounded-[1px] bg-primary" style={{ opacity: o }} />))}
      </div>
      <div className="relative z-10 flex flex-col items-center gap-0.5 rounded-lg border border-border bg-background p-1.5 shadow-sm">
        <div className="h-1 w-4 rounded-full bg-muted-foreground/30" />
        <div className="h-1 w-3 rounded-sm bg-primary/50" />
      </div>
    </div>
  ),
};

export function LayoutPanel({ selectedLayout, onSelectLayout, activeAuthPage, pageOverride, onUpdatePageField, canvasMode, onCanvasModeChange }: LayoutPanelProps) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      {/* Mode Toggle: Presets / Builder */}
      {onCanvasModeChange && (
        <div className="rounded-lg border border-border bg-muted/20 p-1 flex gap-1">
          <button
            onClick={() => onCanvasModeChange('layout')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all",
              canvasMode === 'layout' || !canvasMode
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <Layout className="h-3.5 w-3.5" />
            {t('studio.builder.mode.presets') || 'Presets'}
          </button>
          <button
            onClick={() => onCanvasModeChange('builder')}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-xs font-medium transition-all",
              canvasMode === 'builder'
                ? "bg-background text-foreground shadow-sm border border-border/50"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            )}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            {t('studio.builder.mode.builder') || 'Builder'}
          </button>
        </div>
      )}

      {/* Builder mode hint */}
      {canvasMode === 'builder' && (
        <div className="rounded-lg border border-violet-500/20 bg-violet-500/5 px-3 py-2">
          <p className="text-xs text-violet-600 dark:text-violet-400">
            {t('studio.builder.activeHint') || 'Builder mode active — use the Builder tab to arrange components'}
          </p>
        </div>
      )}
      {/* Page context indicator */}
      {activeAuthPage && activeAuthPage !== "login" && (
        <div className="flex items-center gap-2 rounded-lg border border-blue-500/20 bg-blue-500/5 px-3 py-2">
          <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
          <span className="text-xs text-blue-600 dark:text-blue-400">
            {t(`studio.page.${activeAuthPage === "forgot-password" ? "forgotPassword" : activeAuthPage === "reset-password" ? "resetPassword" : activeAuthPage === "verify-email" ? "verifyEmail" : activeAuthPage}`) || activeAuthPage}
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

      <p className="text-xs text-muted-foreground">
        {t("studio.layout.description")}
      </p>

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
                  ? "border-primary bg-primary/5 ring-1 ring-primary/20 shadow-sm"
                  : "border-border hover:border-primary/30 hover:bg-muted/30"
              )}
            >
              {/* Thumbnail */}
              <div
                className={cn(
                  "h-16 w-full rounded-lg border overflow-hidden",
                  isSelected ? "border-primary/30" : "border-border"
                )}
              >
                {LAYOUT_THUMBNAILS[layout.id]}
              </div>

              {/* Label */}
              <div className="flex items-center gap-1">
                <span className="text-[11px] font-medium text-foreground leading-tight">
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
