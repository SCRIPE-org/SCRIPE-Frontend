/**
 * Theme Detail Modal
 *
 * Rich modal for viewing theme details including:
 * - Color palette preview + mock login form
 * - Device size toggle (desktop/tablet/mobile)
 * - Light/Dark mode toggle
 * - Feature badges (dark, a11y, blocks, etc.)
 * - Theme specs (colors, typography, spacing)
 * - Usage stats
 * - Actions (Try in Studio, Apply, Favorite)
 *
 * All strings use i18n via t().
 *
 * @module customization/presentation
 */
"use client";
// UI-EXCEPTION: compact studio layout — native <button> used for pixel-precise
// compact controls (theme cards, filter toggles, etc.) where @core/ui/button's
// padding/sizing would break the layout.

import { useState, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@/core/common/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import {
  Heart,
  Star,
  Eye,
  Paintbrush,
  X,
  Moon,
  Sun,
  ShieldCheck,
  Blocks,
  Monitor,
  Tablet,
  Smartphone,
  Sparkles,
  Lock,
  Code,
  Globe,
  Users,
  Palette,
  Type,
  Ruler,
  ShoppingCart,
  ExternalLink,
  Calendar,
} from "lucide-react";
import type { ThemeCard } from "../../domain/entities/ThemeCard";

const D = "studio.themeDetail";

type DeviceSize = "desktop" | "tablet" | "mobile";
type ColorMode = "light" | "dark";

interface ThemeDetailModalProps {
  theme: ThemeCard | null;
  isOpen: boolean;
  onClose: () => void;
  onApply?: (slug: string, merge: boolean) => void;
  onTryInStudio?: (slug: string) => void;
  onToggleFavorite?: (slug: string) => void;
  isApplying?: boolean;
  themeDataJson?: string | null;
}

export function ThemeDetailModal({
  theme,
  isOpen,
  onClose,
  onApply,
  onTryInStudio,
  onToggleFavorite,
  isApplying,
  themeDataJson,
}: ThemeDetailModalProps) {
  const { t } = useI18n();
  const [deviceSize, setDeviceSize] = useState<DeviceSize>("desktop");
  const [colorMode, setColorMode] = useState<ColorMode>("light");
  const [activeTab, setActiveTab] = useState("overview");
  const [confirmApply, setConfirmApply] = useState(false);

  // Parse theme data for specs display
  const parsedTokens = useMemo(() => {
    if (!themeDataJson) return null;
    try {
      const data = JSON.parse(themeDataJson);
      return data?.tokens || data || {};
    } catch {
      return null;
    }
  }, [themeDataJson]);

  // Extract color swatches from tokens
  const colorSwatches = useMemo(() => {
    if (!parsedTokens) return { light: [], dark: [] };
    const light: { name: string; value: string }[] = [];
    const dark: { name: string; value: string }[] = [];

    const colorKeys = [
      "primary",
      "secondary",
      "background",
      "surface",
      "text",
      "muted",
      "border",
      "error",
      "success",
    ];
    for (const key of colorKeys) {
      const lightVal = parsedTokens[`color.${key}`];
      const darkVal = parsedTokens[`dark.color.${key}`];
      if (lightVal) light.push({ name: key, value: lightVal });
      if (darkVal) dark.push({ name: key, value: darkVal });
    }
    return { light, dark };
  }, [parsedTokens]);

  if (!theme) return null;

  const accentColor = theme.accentColor || "#6b7280";

  const deviceWidths: Record<DeviceSize, string> = {
    desktop: "100%",
    tablet: "768px",
    mobile: "375px",
  };

  // Feature list
  const features = [
    { key: "darkMode", icon: Moon, has: theme.hasDarkMode },
    { key: "accessibility", icon: ShieldCheck, has: theme.hasAccessibilityPreset },
    { key: "contentBlocks", icon: Blocks, has: theme.hasContentBlocks },
  ].filter((f) => f.has);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] max-w-5xl flex-col overflow-hidden p-0">
        {/* ── Header ── */}
        <DialogHeader className="shrink-0 border-b border-border/50 px-6 pb-4 pt-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Color swatch */}
              <div
                className="h-14 w-14 shrink-0 rounded-xl border border-white/20 shadow-lg"
                style={{
                  background: `linear-gradient(135deg, ${accentColor}, color-mix(in srgb, ${accentColor} 50%, black))`,
                }}
              />
              <div>
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-xl font-bold">{theme.name}</DialogTitle>
                  {theme.isFeatured && <Star className="h-4 w-4 fill-amber-500 text-amber-500" />}
                  {theme.isNew && (
                    <Badge className="border-emerald-500/20 bg-emerald-500/10 text-[10px] text-emerald-600">
                      <Sparkles className="mr-0.5 h-3 w-3" />
                      {t("studio.gallery.card.new")}
                    </Badge>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                  {theme.authorName && (
                    <span>{t("studio.gallery.card.byAuthor", { author: theme.authorName })}</span>
                  )}
                  {theme.version && <span>v{theme.version}</span>}
                  {theme.category && (
                    <Badge variant="outline" className="text-[10px] capitalize">
                      {theme.category}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                <span className="font-medium">{theme.usageCount}</span>
                <span className="text-xs">{t(`${D}.stats.uses`)}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Heart className="h-4 w-4" />
                <span className="font-medium">{theme.likeCount}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {/* ── Content ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-5">
            {/* Left: Preview */}
            <div className="border-r border-border/50 p-6 lg:col-span-3">
              {/* Device + Color mode controls */}
              <div className="mb-4 flex items-center justify-between">
                <h3 className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
                  <Eye className="h-4 w-4 text-primary" />
                  {t(`${D}.preview.title`)}
                </h3>
                <div className="flex items-center gap-2">
                  {/* Device toggle */}
                  <div className="flex items-center rounded-md border border-border/50 bg-muted/50 p-0.5">
                    {[
                      { key: "desktop" as const, icon: Monitor },
                      { key: "tablet" as const, icon: Tablet },
                      { key: "mobile" as const, icon: Smartphone },
                    ].map(({ key, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setDeviceSize(key)}
                        className={cn(
                          "flex h-7 w-7 items-center justify-center rounded transition-all",
                          deviceSize === key
                            ? "bg-background text-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                        title={t(`${D}.preview.${key}`)}
                      >
                        <Icon className="h-3.5 w-3.5" />
                      </button>
                    ))}
                  </div>
                  {/* Light/Dark toggle */}
                  <div className="flex items-center rounded-md border border-border/50 bg-muted/50 p-0.5">
                    <button
                      onClick={() => setColorMode("light")}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded transition-all",
                        colorMode === "light"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      title={t(`${D}.preview.lightMode`)}
                    >
                      <Sun className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => setColorMode("dark")}
                      className={cn(
                        "flex h-7 w-7 items-center justify-center rounded transition-all",
                        colorMode === "dark"
                          ? "bg-background text-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      title={t(`${D}.preview.darkMode`)}
                    >
                      <Moon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Preview area */}
              <div className="flex justify-center">
                <div
                  className="relative overflow-hidden rounded-xl border border-border/60 shadow-lg transition-all duration-300"
                  style={{
                    width: deviceWidths[deviceSize],
                    maxWidth: "100%",
                    height:
                      deviceSize === "mobile"
                        ? "500px"
                        : deviceSize === "tablet"
                          ? "450px"
                          : "380px",
                    background:
                      colorMode === "dark"
                        ? `linear-gradient(135deg, color-mix(in srgb, ${accentColor} 20%, #0f172a), #0f172a)`
                        : `linear-gradient(135deg, ${accentColor}20, #f8fafc)`,
                  }}
                >
                  {/* Mock login form */}
                  <div className="absolute inset-0 flex items-center justify-center p-6">
                    <div
                      className={cn(
                        "w-full space-y-4 rounded-2xl border p-6 shadow-xl backdrop-blur-sm transition-all",
                        colorMode === "dark"
                          ? "border-slate-700/40 bg-slate-900/80"
                          : "border-white/60 bg-white/90"
                      )}
                      style={{
                        maxWidth: deviceSize === "mobile" ? "280px" : "340px",
                      }}
                    >
                      {/* Logo placeholder */}
                      <div className="mb-2 flex justify-center">
                        <div className="h-8 w-8 rounded-lg" style={{ background: accentColor }} />
                      </div>
                      {/* Title */}
                      <div className="space-y-1 text-center">
                        <div
                          className={cn(
                            "mx-auto h-4 w-32 rounded",
                            colorMode === "dark" ? "bg-white/20" : "bg-gray-200"
                          )}
                        />
                        <div
                          className={cn(
                            "mx-auto h-2.5 w-48 rounded",
                            colorMode === "dark" ? "bg-white/10" : "bg-gray-100"
                          )}
                        />
                      </div>
                      {/* Inputs */}
                      {[1, 2].map((i) => (
                        <div
                          key={i}
                          className={cn(
                            "h-9 w-full rounded-lg border",
                            colorMode === "dark"
                              ? "border-slate-600/40 bg-slate-800/60"
                              : "border-gray-200 bg-gray-50"
                          )}
                        />
                      ))}
                      {/* Button */}
                      <div className="h-9 w-full rounded-lg" style={{ background: accentColor }} />
                      {/* Footer link */}
                      <div className="flex justify-center">
                        <div
                          className={cn(
                            "h-2 w-24 rounded",
                            colorMode === "dark" ? "bg-white/10" : "bg-gray-100"
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Feature badges */}
              {features.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {features.map(({ key, icon: Icon }) => (
                    <Badge key={key} variant="outline" className="gap-1 py-1 text-xs">
                      <Icon className="h-3.5 w-3.5" />
                      {t(`${D}.features.${key}`)}
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info + Specs */}
            <div className="p-6 lg:col-span-2">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4 w-full">
                  <TabsTrigger value="overview" className="flex-1 text-xs">
                    {t(`${D}.tabs.overview`)}
                  </TabsTrigger>
                  <TabsTrigger value="specs" className="flex-1 text-xs">
                    {t(`${D}.tabs.specs`)}
                  </TabsTrigger>
                </TabsList>

                {/* Overview tab */}
                <TabsContent value="overview" className="mt-0 space-y-5">
                  {/* Description */}
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {theme.description || ""}
                  </p>

                  {/* Info grid */}
                  <div className="grid grid-cols-2 gap-3">
                    {theme.category && (
                      <InfoItem
                        icon={<Palette className="h-3.5 w-3.5" />}
                        label={t(`${D}.info.category`)}
                        value={theme.category}
                      />
                    )}
                    {theme.version && (
                      <InfoItem
                        icon={<Code className="h-3.5 w-3.5" />}
                        label={t(`${D}.info.version`)}
                        value={`v${theme.version}`}
                      />
                    )}
                    {theme.authorName && (
                      <InfoItem
                        icon={<Users className="h-3.5 w-3.5" />}
                        label={t(`${D}.info.author`)}
                        value={theme.authorName}
                      />
                    )}
                    {theme.targetIndustry && (
                      <InfoItem
                        icon={<Globe className="h-3.5 w-3.5" />}
                        label={t(`${D}.info.industry`)}
                        value={theme.targetIndustry}
                      />
                    )}
                    {theme.publishedAt && (
                      <InfoItem
                        icon={<Calendar className="h-3.5 w-3.5" />}
                        label={t(`${D}.info.published`)}
                        value={new Date(theme.publishedAt).toLocaleDateString()}
                      />
                    )}
                  </div>

                  {/* Tags */}
                  {theme.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {theme.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px] capitalize">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TabsContent>

                {/* Specs tab */}
                <TabsContent value="specs" className="mt-0 space-y-5">
                  {/* Color palette */}
                  {colorSwatches.light.length > 0 && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Palette className="h-3.5 w-3.5 text-primary" />
                        {t(`${D}.specs.colorPalette`)}
                      </h4>
                      {/* Light colors */}
                      <p className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                        {t(`${D}.specs.lightColors`)}
                      </p>
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {colorSwatches.light.map(({ name, value }) => (
                          <div key={name} className="flex flex-col items-center gap-0.5">
                            <div
                              className="h-7 w-7 rounded-md border border-border/50 shadow-sm"
                              style={{ backgroundColor: value }}
                              title={`${name}: ${value}`}
                            />
                            <span className="text-[8px] capitalize text-muted-foreground">
                              {name}
                            </span>
                          </div>
                        ))}
                      </div>
                      {/* Dark colors */}
                      {colorSwatches.dark.length > 0 && (
                        <>
                          <p className="mb-1.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                            {t(`${D}.specs.darkColors`)}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {colorSwatches.dark.map(({ name, value }) => (
                              <div key={name} className="flex flex-col items-center gap-0.5">
                                <div
                                  className="h-7 w-7 rounded-md border border-border/50 shadow-sm"
                                  style={{ backgroundColor: value }}
                                  title={`${name}: ${value}`}
                                />
                                <span className="text-[8px] capitalize text-muted-foreground">
                                  {name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Typography specs */}
                  {parsedTokens && (parsedTokens["font.body"] || parsedTokens["font.heading"]) && (
                    <div>
                      <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                        <Type className="h-3.5 w-3.5 text-primary" />
                        {t(`${D}.specs.typography`)}
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {parsedTokens["font.heading"] && (
                          <SpecItem
                            label={t(`${D}.specs.headingFont`)}
                            value={parsedTokens["font.heading"]}
                          />
                        )}
                        {parsedTokens["font.body"] && (
                          <SpecItem
                            label={t(`${D}.specs.bodyFont`)}
                            value={parsedTokens["font.body"]}
                          />
                        )}
                        {parsedTokens["font.headingSize"] && (
                          <SpecItem
                            label={t(`${D}.specs.headingSize`)}
                            value={parsedTokens["font.headingSize"]}
                          />
                        )}
                        {parsedTokens["font.bodySize"] && (
                          <SpecItem
                            label={t(`${D}.specs.bodySize`)}
                            value={parsedTokens["font.bodySize"]}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Spacing specs */}
                  {parsedTokens &&
                    (parsedTokens["spacing.borderRadius"] || parsedTokens["spacing.btnRadius"]) && (
                      <div>
                        <h4 className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground">
                          <Ruler className="h-3.5 w-3.5 text-primary" />
                          {t(`${D}.specs.spacing`)}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {parsedTokens["spacing.borderRadius"] && (
                            <SpecItem
                              label={t(`${D}.specs.borderRadius`)}
                              value={parsedTokens["spacing.borderRadius"]}
                            />
                          )}
                          {parsedTokens["spacing.btnRadius"] && (
                            <SpecItem
                              label={t(`${D}.specs.buttonRadius`)}
                              value={parsedTokens["spacing.btnRadius"]}
                            />
                          )}
                          {parsedTokens["spacing.formWidth"] && (
                            <SpecItem
                              label={t(`${D}.specs.formWidth`)}
                              value={parsedTokens["spacing.formWidth"]}
                            />
                          )}
                          {parsedTokens["spacing.inputHeight"] && (
                            <SpecItem
                              label={t(`${D}.specs.inputHeight`)}
                              value={parsedTokens["spacing.inputHeight"]}
                            />
                          )}
                        </div>
                      </div>
                    )}

                  {/* No specs fallback */}
                  {!parsedTokens && (
                    <div className="py-8 text-center">
                      <Palette className="mx-auto mb-2 h-8 w-8 text-muted-foreground/30" />
                      <p className="text-xs text-muted-foreground">{t(`${D}.tabs.specs`)}</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* ── Footer Actions ── */}
        <div className="flex shrink-0 items-center justify-between border-t border-border/50 bg-muted/20 px-6 py-4">
          <div className="flex items-center gap-2">
            {/* Favorite */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onToggleFavorite?.(theme.slug)}
            >
              <Heart className={cn("h-4 w-4", theme.isFavorited && "fill-red-500 text-red-500")} />
              {theme.isFavorited ? t(`${D}.actions.unfavorite`) : t(`${D}.actions.favorite`)}
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {/* Try in Studio */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={() => onTryInStudio?.(theme.slug)}
            >
              <ExternalLink className="h-4 w-4" />
              {t(`${D}.actions.tryInStudio`)}
            </Button>

            {/* Apply */}
            {theme.isAvailable && !confirmApply && (
              <Button size="sm" className="gap-1.5" onClick={() => setConfirmApply(true)}>
                <Paintbrush className="h-4 w-4" />
                {t(`${D}.actions.applyToDraft`)}
              </Button>
            )}

            {/* Apply confirmation */}
            {theme.isAvailable && confirmApply && (
              <div className="flex items-center gap-1.5">
                <Button
                  size="sm"
                  onClick={() => {
                    onApply?.(theme.slug, false);
                    setConfirmApply(false);
                  }}
                  loading={isApplying}
                >
                  {t("studio.gallery.card.replace")}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onApply?.(theme.slug, true);
                    setConfirmApply(false);
                  }}
                  disabled={isApplying}
                >
                  {t("studio.gallery.card.merge")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setConfirmApply(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Locked/Buy state */}
            {!theme.isAvailable && theme.isBuyable && (
              <Button variant="outline" size="sm" disabled className="gap-1.5">
                <ShoppingCart className="h-4 w-4" />
                {theme.price ? `$${theme.price.toFixed(0)}` : t("studio.gallery.card.buy")}
              </Button>
            )}
            {!theme.isAvailable && !theme.isBuyable && (
              <Button variant="outline" size="sm" disabled className="gap-1.5">
                <Lock className="h-4 w-4" />
                {t("studio.gallery.card.upgrade")}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ── Helpers ──

function InfoItem({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 rounded-lg bg-muted/30 p-2">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className="text-xs font-medium capitalize text-foreground">{value}</p>
      </div>
    </div>
  );
}

function SpecItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-muted/30 p-2">
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p className="font-mono text-xs font-medium text-foreground">{value}</p>
    </div>
  );
}
