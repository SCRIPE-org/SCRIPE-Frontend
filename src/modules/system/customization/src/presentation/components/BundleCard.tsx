"use client";

/**
 * BundleCard — Rich card component for theme bundle display
 *
 * Shows bundle type badge, layer icons, accent color gradient,
 * favorite/apply buttons, and pricing info.
 *
 * @module customization/presentation
 */
import { cn } from "@/core/common/utils";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Heart, LogIn, Shield, LayoutDashboard, Package,
  Blocks, Grid3X3, FileKey2, Star, Check, Loader2,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { ThemeBundle, BundleLayer } from "../../domain/entities/ThemeBundle";
import { BUNDLE_TYPE_CONFIG, LAYER_INFO } from "../../domain/entities/ThemeBundle";

interface BundleCardProps {
  bundle: ThemeBundle;
  onOpenDetail: (bundle: ThemeBundle) => void;
  onToggleFavorite: (slug: string) => void;
  onApply: (slug: string, merge: boolean) => void;
  isApplying?: boolean;
}

/** Map icon string name → Lucide component */
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

export function BundleCard({ bundle, onOpenDetail, onToggleFavorite, onApply, isApplying }: BundleCardProps) {
  const { t } = useI18n();
  const typeConfig = BUNDLE_TYPE_CONFIG[bundle.bundleType];
  const TypeIcon = ICON_MAP[typeConfig.icon] ?? Package;

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-xl border border-border/60",
        "bg-card overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-0.5",
        bundle.isApplied && "ring-2 ring-primary/40"
      )}
    >
      {/* ── Color Gradient Preview ── */}
      <button
        className="relative h-32 w-full overflow-hidden cursor-pointer"
        onClick={() => onOpenDetail(bundle)}
      >
        <div
          className="absolute inset-0 transition-transform duration-500 group-hover:scale-110"
          style={{
            background: `linear-gradient(135deg, ${bundle.accentColor}, color-mix(in srgb, ${bundle.accentColor} 50%, #1e1b4b))`,
          }}
        />
        {/* Decorative pattern overlay */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.15) 0%, transparent 50%),
                                radial-gradient(circle at 75% 75%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
            }}
          />
        </div>

        {/* Layer icons floating in the preview */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
          {bundle.includedLayers.map((layer) => (
            <div
              key={layer}
              className="h-7 w-7 rounded-md bg-white/20 backdrop-blur-sm flex items-center justify-center"
              title={t(LAYER_INFO[layer].labelKey)}
            >
              <LayerIcon layer={layer} className="h-3.5 w-3.5 text-white" />
            </div>
          ))}
        </div>

        {/* Bundle type badge */}
        <div className="absolute top-3 left-3">
          <Badge
            variant="secondary"
            className="bg-white/20 backdrop-blur-sm text-white border-white/30 text-xs"
          >
            <TypeIcon className="h-3 w-3 mr-1" />
            {t(typeConfig.labelKey)}
          </Badge>
        </div>

        {/* Applied checkmark */}
        {bundle.isApplied && (
          <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Check className="h-4 w-4 text-primary-foreground" />
          </div>
        )}

        {/* Featured star */}
        {bundle.isFeatured && !bundle.isApplied && (
          <div className="absolute top-3 right-3">
            <Star className="h-5 w-5 text-amber-300 fill-amber-300 drop-shadow-lg" />
          </div>
        )}
      </button>

      {/* ── Card Body ── */}
      <div className="flex flex-col flex-1 p-4">
        {/* Title + Description */}
        <button
          className="text-left cursor-pointer"
          onClick={() => onOpenDetail(bundle)}
        >
          <h3 className="font-semibold text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {bundle.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
            {bundle.description}
          </p>
        </button>

        {/* Tags */}
        {bundle.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2.5">
            {bundle.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="px-1.5 py-0.5 text-[10px] rounded-md bg-muted/80 text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1 min-h-[8px]" />

        {/* Footer: Layers count + Actions */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Package className="h-3.5 w-3.5" />
            <span>{t("studio.bundles.card.layers", { count: bundle.layerCount })}</span>
          </div>

          <div className="flex items-center gap-1">
            {/* Favorite */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(bundle.slug);
              }}
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
