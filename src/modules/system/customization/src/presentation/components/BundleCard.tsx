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
  Heart, LogIn, Shield, LayoutDashboard, Package,
  Blocks, Grid3X3, FileKey2, Star, Check, Loader2,
  Eye, User,
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
  LogIn, Shield, LayoutDashboard, Package, Blocks, Grid3X3, FileKey2,
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
  } catch { /* ignore parse errors */ }
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
  } catch { /* ignore */ }
  return "centered";
}

/** Extract surface color from loginThemeJson */
function extractSurfaceColor(bundle: ThemeBundle): string {
  try {
    if (bundle.contents.loginThemeJson) {
      const parsed = JSON.parse(bundle.contents.loginThemeJson);
      return parsed.tokens?.["--login-surface"] || "#ffffff";
    }
  } catch { /* ignore */ }
  return "#ffffff";
}

export function BundleCard({
  bundle, onOpenDetail, onToggleFavorite, onApply, onPreview, isApplying, compact = false,
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
          "bg-card hover:bg-accent/20 hover:border-primary/30 transition-all cursor-pointer",
          bundle.isApplied && "ring-1 ring-primary/30",
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
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h4 className="text-xs font-semibold text-foreground truncate">
              {bundle.name}
            </h4>
            {bundle.isFeatured && (
              <Star className="h-3 w-3 text-amber-400 fill-amber-400 shrink-0" />
            )}
          </div>

          {/* Color palette dots */}
          <div className="flex items-center gap-1 mt-1">
            {paletteColors.map((color, i) => (
              <div
                key={i}
                className="h-2.5 w-2.5 rounded-full border border-border/30 shrink-0"
                style={{ background: color }}
              />
            ))}
            <span className="text-[9px] text-muted-foreground/60 ml-1">
              {bundle.layerCount} {bundle.layerCount === 1 ? "layer" : "layers"}
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-0.5 shrink-0">
          {onPreview && (
            <button
              onClick={(e) => { e.stopPropagation(); onPreview(bundle); }}
              className="h-6 w-6 rounded flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
              title={t("studio.bundles.preview") || "Preview"}
            >
              <Eye className="h-3 w-3" />
            </button>
          )}
          {bundle.isApplied && (
            <Check className="h-3.5 w-3.5 text-primary shrink-0" />
          )}
        </div>
      </div>
    );
  }

  // ── Full variant (gallery page) ──
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-border/60",
        "bg-card overflow-hidden transition-all duration-300",
        "hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-0.5",
        bundle.isApplied && "ring-2 ring-primary/40"
      )}
    >
      {/* ── Preview Header ── */}
      <button
        className="relative h-36 w-full overflow-hidden cursor-pointer"
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
            className="shadow-lg group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Bundle type badge */}
        <div className="absolute top-2.5 left-2.5">
          <Badge
            variant="secondary"
            className="bg-background/80 backdrop-blur-sm border-border/40 text-xs shadow-sm"
          >
            <TypeIcon className="h-3 w-3 mr-1" />
            {t(typeConfig.labelKey)}
          </Badge>
        </div>

        {/* Applied checkmark */}
        {bundle.isApplied && (
          <div className="absolute top-2.5 right-2.5 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        )}

        {/* Featured star */}
        {bundle.isFeatured && !bundle.isApplied && (
          <div className="absolute top-2.5 right-2.5">
            <Star className="h-5 w-5 text-amber-400 fill-amber-400 drop-shadow-lg" />
          </div>
        )}

        {/* Quick preview button */}
        {onPreview && (
          <button
            onClick={(e) => { e.stopPropagation(); onPreview(bundle); }}
            className="absolute bottom-2.5 right-2.5 h-7 px-2.5 rounded-md bg-background/80 backdrop-blur-sm border border-border/40 text-xs text-foreground flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-background"
          >
            <Eye className="h-3 w-3" /> Preview
          </button>
        )}

        {/* Pricing badge */}
        {!bundle.isFree && (
          <div className="absolute bottom-2.5 left-2.5">
            <Badge className="bg-amber-500/90 text-white border-0 text-[10px]">PRO</Badge>
          </div>
        )}
      </button>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title + Author */}
        <button
          className="text-left cursor-pointer"
          onClick={() => onOpenDetail(bundle)}
        >
          <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {bundle.name}
          </h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <User className="h-2.5 w-2.5 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/70">{bundle.authorName}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2 leading-relaxed">
            {bundle.description}
          </p>
        </button>

        {/* Color palette dots + tags */}
        <div className="flex items-center gap-2 mt-3">
          {/* Color dots */}
          <div className="flex items-center gap-1">
            {paletteColors.map((color, i) => (
              <div
                key={i}
                className="h-3.5 w-3.5 rounded-full border border-border/40 shadow-sm shrink-0"
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
                className="h-5 w-5 rounded flex items-center justify-center bg-muted/40"
                title={t(LAYER_INFO[layer].labelKey)}
              >
                <LayerIcon layer={layer} className="h-2.5 w-2.5 text-muted-foreground" />
              </div>
            ))}
            {bundle.includedLayers.length > 3 && (
              <span className="text-[9px] text-muted-foreground/60 ml-0.5">
                +{bundle.includedLayers.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="flex-1 min-h-[8px]" />

        {/* Footer: Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            {bundle.tags.slice(0, 2).map(tag => (
              <span key={tag} className="px-1.5 py-0.5 text-[9px] rounded bg-muted/60 text-muted-foreground/80">
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {/* Favorite */}
            <button
              onClick={(e) => { e.stopPropagation(); onToggleFavorite(bundle.slug); }}
              className={cn(
                "h-7 w-7 rounded-md flex items-center justify-center transition-colors",
                bundle.isFavorited
                  ? "text-rose-500 bg-rose-500/10"
                  : "text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
              )}
            >
              <Heart className={cn("h-3.5 w-3.5", bundle.isFavorited && "fill-current")} />
            </button>

            {/* Apply */}
            {bundle.isAvailable && !bundle.isApplied && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs px-2.5"
                onClick={(e) => { e.stopPropagation(); onApply(bundle.slug, false); }}
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
              <Badge variant="outline" className="text-xs text-primary border-primary/30">
                <Check className="h-3 w-3 mr-1" />
                {t("studio.gallery.applied")}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
