// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
"use client";

/**
 * BundleCard -- Rich card component for theme bundle display
 *
 * REDESIGNED: Now shows a structural layout preview thumbnail instead of
 * a flat gradient rectangle. Includes color palette dots, star rating,
 * industry badge, and selective layer icons.
 *
 * @module customization/presentation
 */
import { cn } from "@/core/common/utils";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Heart,
  LogIn,
  Shield,
  LayoutDashboard,
  Package,
  Blocks,
  Grid3X3,
  FileKey2,
  Star,
  Check,
  Loader2,
  Eye,
  User,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { ThemeBundle, BundleLayer } from "../../domain/entities/ThemeBundle";
import { BUNDLE_TYPE_CONFIG, LAYER_INFO } from "../../domain/entities/ThemeBundle";
import { LayoutPreviewThumbnail } from "./LayoutPreviewThumbnail";

interface BundleCardProps {
  bundle: ThemeBundle;
  onOpenDetail: (bundle: ThemeBundle) => void;
  onToggleFavorite: (slug: string) => void;
  onApply: (slug: string, merge: boolean) => void;
  onPreview?: (bundle: ThemeBundle) => void;
  isApplying?: boolean;
  compact?: boolean;
}

/** Map icon string name to Lucide component */
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LogIn,
  Shield,
  LayoutDashboard,
  Package,
  Blocks,
  Grid3X3,
  FileKey2,
};

/** Get layer icon component */
function LayerIcon({ layer, className }: { layer: BundleLayer; className?: string }) {
  const info = LAYER_INFO[layer];
  const Icon = ICON_MAP[info.icon] ?? Blocks;
  return <Icon className={className} />;
}

/** Extract color palette from loginThemeJson */
function extractColors(bundle: ThemeBundle): string[] {
  const colors: string[] = [bundle.accentColor];
  try {
    if (bundle.contents.loginThemeJson) {
      const parsed = JSON.parse(bundle.contents.loginThemeJson);
      const tokens = parsed.tokens || {};
      if (tokens["--login-primary"]) colors.push(tokens["--login-primary"]);
      if (tokens["--login-bg"]) colors.push(tokens["--login-bg"]);
      if (tokens["--login-surface"]) colors.push(tokens["--login-surface"]);
      if (tokens["--login-text"]) colors.push(tokens["--login-text"]);
    }
  } catch {
    /* ignore parse errors */
  }
  // Deduplicate and limit
  return [...new Set(colors)].slice(0, 5);
}

/** Extract layout from loginThemeJson */
function extractLayout(bundle: ThemeBundle): string {
  try {
    if (bundle.contents.loginThemeJson) {
      const parsed = JSON.parse(bundle.contents.loginThemeJson);
      return parsed.layout || "centered";
    }
  } catch {
    /* ignore */
  }
  return "centered";
}

/** Extract surface color from loginThemeJson */
function extractSurfaceColor(bundle: ThemeBundle): string {
  try {
    if (bundle.contents.loginThemeJson) {
      const parsed = JSON.parse(bundle.contents.loginThemeJson);
      return parsed.tokens?.["--login-surface"] || "#ffffff";
    }
  } catch {
    /* ignore */
  }
  return "#ffffff";
}

/**
 * Presentation UI component rendering the bundle card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function BundleCard({
  bundle,
  onOpenDetail,
  onToggleFavorite,
  onApply,
  onPreview,
  isApplying,
  compact = false,
}: BundleCardProps) {
  const { t } = useI18n();
  const typeConfig = BUNDLE_TYPE_CONFIG[bundle.bundleType];
  const TypeIcon = ICON_MAP[typeConfig.icon] ?? Package;
  const layout = extractLayout(bundle);
  const surfaceColor = extractSurfaceColor(bundle);
  const paletteColors = extractColors(bundle);

  if (compact) {
    // ── Compact variant (sidebar marketplace) ──
    return (
      <div
        className={cn(
          "group flex items-center gap-3 rounded-lg border border-border/50 p-2",
          "cursor-pointer bg-card transition-all hover:border-primary/30 hover:bg-accent/20",
          bundle.isApplied && "ring-1 ring-primary/30"
        )}
        onClick={() => onOpenDetail(bundle)}
      >
        {/* Layout preview */}
        <LayoutPreviewThumbnail
          layout={layout}
          accentColor={bundle.accentColor}
          surfaceColor={surfaceColor}
          size="sm"
        />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <h4 className="truncate text-xs font-semibold text-foreground">{bundle.name}</h4>
            {bundle.isFeatured && (
              <Star className="h-3 w-3 shrink-0 fill-warning text-warning" />
            )}
          </div>

          {/* Color palette dots */}
          <div className="mt-1 flex items-center gap-1">
            {paletteColors.map((color, i) => (
              <div
                key={i}
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-border/30"
                style={{ background: color }}
              />
            ))}
            <span className="ml-1 text-[9px] text-muted-foreground/60">
              {bundle.layerCount} {bundle.layerCount === 1 ? "layer" : "layers"}
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex shrink-0 items-center gap-0.5">
          {onPreview && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPreview(bundle);
              }}
              className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
              title={t("studio.bundles.preview") || "Preview"}
            >
              <Eye className="h-3 w-3" />
            </button>
          )}
          {bundle.isApplied && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
        </div>
      </div>
    );
  }

  // ── Full variant (gallery page) ──
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-border/60",
        "overflow-hidden bg-card transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5",
        bundle.isApplied && "ring-2 ring-primary/40"
      )}
    >
      {/* ── Preview Header ── */}
      <button
        className="relative h-36 w-full cursor-pointer overflow-hidden"
        onClick={() => onOpenDetail(bundle)}
      >
        {/* Background gradient */}
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
          style={{
            background: `linear-gradient(135deg, ${bundle.accentColor}15, ${bundle.accentColor}30)`,
          }}
        />

        {/* Layout Preview Thumbnail — centered in the preview area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <LayoutPreviewThumbnail
            layout={layout}
            accentColor={bundle.accentColor}
            surfaceColor={surfaceColor}
            size="lg"
            className="shadow-lg transition-transform duration-300 group-hover:scale-105"
          />
        </div>

        {/* Bundle type badge */}
        <div className="absolute left-2.5 top-2.5">
          <Badge
            variant="secondary"
            className="border-border/40 bg-background/80 text-xs shadow-sm backdrop-blur-sm"
          >
            <TypeIcon className="mr-1 h-3 w-3" />
            {t(typeConfig.labelKey)}
          </Badge>
        </div>

        {/* Applied checkmark */}
        {bundle.isApplied && (
          <div className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-primary shadow-lg">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        )}

        {/* Featured star */}
        {bundle.isFeatured && !bundle.isApplied && (
          <div className="absolute right-2.5 top-2.5">
            <Star className="h-5 w-5 fill-warning text-warning drop-shadow-lg" />
          </div>
        )}

        {/* Quick preview button */}
        {onPreview && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(bundle);
            }}
            className="absolute bottom-2.5 right-2.5 flex h-7 items-center gap-1.5 rounded-md border border-border/40 bg-background/80 px-2.5 text-xs text-foreground opacity-0 shadow-sm backdrop-blur-sm transition-opacity hover:bg-background group-hover:opacity-100"
          >
            <Eye className="h-3 w-3" /> Preview
          </button>
        )}

        {/* Pricing badge */}
        {!bundle.isFree && (
          <div className="absolute bottom-2.5 left-2.5">
            <Badge className="border-0 bg-warning/90 text-[10px] text-warning-foreground">PRO</Badge>
          </div>
        )}
      </button>

      {/* ── Card Body ── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title + Author */}
        <button className="cursor-pointer text-left" onClick={() => onOpenDetail(bundle)}>
          <h3 className="line-clamp-1 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
            {bundle.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5">
            <User className="h-2.5 w-2.5 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/70">{bundle.authorName}</span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {bundle.description}
          </p>
        </button>

        {/* Color palette dots + tags */}
        <div className="mt-3 flex items-center gap-2">
          {/* Color dots */}
          <div className="flex items-center gap-1">
            {paletteColors.map((color, i) => (
              <div
                key={i}
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-border/40 shadow-sm"
                style={{ background: color }}
                title={color}
              />
            ))}
          </div>

          <div className="flex-1" />

          {/* Layer icons */}
          <div className="flex items-center gap-0.5">
            {bundle.includedLayers.slice(0, 3).map((layer) => (
              <div
                key={layer}
                className="flex h-5 w-5 items-center justify-center rounded bg-muted/40"
                title={t(LAYER_INFO[layer].labelKey)}
              >
                <LayerIcon layer={layer} className="h-2.5 w-2.5 text-muted-foreground" />
              </div>
            ))}
            {bundle.includedLayers.length > 3 && (
              <span className="ml-0.5 text-[9px] text-muted-foreground/60">
                +{bundle.includedLayers.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="min-h-[8px] flex-1" />

        {/* Footer: Actions */}
        <div className="mt-3 flex items-center justify-between border-t border-border/40 pt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {bundle.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded bg-muted/60 px-1.5 py-0.5 text-[9px] text-muted-foreground/80"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {/* Favorite */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(bundle.slug);
              }}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md transition-colors",
                bundle.isFavorited
                  ? "bg-destructive/10 text-destructive"
                  : "text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", bundle.isFavorited && "fill-current")} />
            </button>

            {/* Apply */}
            {bundle.isAvailable && !bundle.isApplied && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2.5 text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  onApply(bundle.slug, false);
                }}
                disabled={isApplying}
              >
                {isApplying ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  t("studio.bundles.applyBundle")
                )}
              </Button>
            )}

            {/* Already applied */}
            {bundle.isApplied && (
              <Badge variant="outline" className="border-primary/30 text-xs text-primary">
                <Check className="mr-1 h-3 w-3" />
                {t("studio.gallery.applied")}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
