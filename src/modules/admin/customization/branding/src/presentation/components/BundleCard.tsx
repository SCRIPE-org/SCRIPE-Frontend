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
import { chartColor } from "@core/ui/chart";
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
  Eye,
  User,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { ThemeBundle, BundleLayer } from "../../domain/entities/ThemeBundle";
import { BUNDLE_TYPE_CONFIG } from "../../domain/entities/ThemeBundle";
import { LAYER_INFO } from "../constants/layerDisplay";
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
const ICON_MAP: Record<
  string,
  React.ComponentType<{ className?: string; style?: React.CSSProperties }>
> = {
  LogIn,
  Shield,
  LayoutDashboard,
  Package,
  Blocks,
  Grid3X3,
  FileKey2,
};

/** Get layer icon component, tinted from the fixed categorical chart ladder */
function LayerIcon({ layer, className }: { layer: BundleLayer; className?: string }) {
  const info = LAYER_INFO[layer];
  const Icon = ICON_MAP[info.icon] ?? Blocks;
  return <Icon className={className} style={{ color: chartColor(info.chartSlot) }} />;
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

/** Translucent chip surface for badges that float over the arbitrary-accent
 * preview header — a solid nx token would look like a hole in the artwork,
 * so it goes through color-mix rather than a raw rgba literal. */
const FLOATING_CHIP =
  "bg-[color:color-mix(in_srgb,var(--nx-popover)_82%,transparent)] border border-nx-line";

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
  const detailAriaLabel = t("studio.bundles.card.viewDetailsAria", { name: bundle.name });

  if (compact) {
    // ── Compact variant (sidebar marketplace) ──
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={detailAriaLabel}
        onClick={() => onOpenDetail(bundle)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenDetail(bundle);
          }
        }}
        className={cn(
          "group flex items-center gap-3 rounded-nx-md border border-nx-line p-2",
          "cursor-pointer bg-nx-surface transition-colors duration-nx-standard hover:border-nx-line-hi motion-reduce:transition-none",
          "focus-visible:shadow-nx-focus focus-visible:outline-none",
          bundle.isApplied && "border-nx-accent"
        )}
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
            <h4 className="truncate text-xs font-semibold text-nx-ink">{bundle.name}</h4>
            {bundle.isFeatured && (
              <Star className="h-3 w-3 shrink-0 fill-warning text-warning" aria-hidden="true" />
            )}
          </div>

          {/* Color palette dots */}
          <div className="mt-1 flex items-center gap-1">
            {paletteColors.map((color, i) => (
              <div
                key={i}
                className="h-2.5 w-2.5 shrink-0 rounded-full border border-nx-line"
                style={{ background: color }}
                aria-hidden="true"
              />
            ))}
            <span className="ms-1 text-[9px] text-nx-ink-3">
              {t("studio.bundles.card.layers", { count: bundle.layerCount })}
            </span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex shrink-0 items-center gap-0.5">
          {onPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onPreview(bundle);
              }}
              aria-label={t("studio.marketplace.preview")}
              className="flex h-6 w-6 items-center justify-center rounded-nx-sm text-nx-ink-3 transition-colors duration-nx-micro hover:bg-nx-accent-wash hover:text-nx-accent focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none"
            >
              <Eye className="h-3 w-3" aria-hidden="true" />
            </button>
          )}
          {bundle.isApplied && (
            <Check className="h-3.5 w-3.5 shrink-0 text-nx-accent" aria-hidden="true" />
          )}
        </div>
      </div>
    );
  }

  // ── Full variant (gallery page) ──
  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-nx-lg border border-nx-line",
        "overflow-hidden bg-nx-surface transition-colors duration-nx-standard hover:border-nx-line-hi motion-reduce:transition-none",
        bundle.isApplied && "border-nx-accent"
      )}
    >
      {/* ── Preview Header ── */}
      {/* A real <button> can't host the nested quick-preview button, so this
          follows the stat-card.tsx activatable-card pattern instead. */}
      <div
        role="button"
        tabIndex={0}
        aria-label={detailAriaLabel}
        className="relative h-36 w-full cursor-pointer overflow-hidden focus-visible:shadow-nx-focus focus-visible:outline-none"
        onClick={() => onOpenDetail(bundle)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onOpenDetail(bundle);
          }
        }}
      >
        {/* Background gradient — tint wash derived from the tenant accent */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, color-mix(in srgb, ${bundle.accentColor} 15%, transparent), color-mix(in srgb, ${bundle.accentColor} 30%, transparent))`,
          }}
          aria-hidden="true"
        />

        {/* Layout Preview Thumbnail — centered in the preview area */}
        <div className="absolute inset-0 flex items-center justify-center">
          <LayoutPreviewThumbnail
            layout={layout}
            accentColor={bundle.accentColor}
            surfaceColor={surfaceColor}
            size="lg"
            className="shadow-nx-sm"
          />
        </div>

        {/* Bundle type badge */}
        <div className="absolute start-2.5 top-2.5">
          <Badge variant="secondary" className={cn("text-xs shadow-nx-sm", FLOATING_CHIP)}>
            <TypeIcon className="me-1 h-3 w-3" aria-hidden="true" />
            {t(typeConfig.labelKey)}
          </Badge>
        </div>

        {/* Applied checkmark */}
        {bundle.isApplied && (
          <div className="absolute end-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-nx-accent-fill shadow-nx-sm">
            <Check className="h-4 w-4 text-nx-on-fill" aria-hidden="true" />
          </div>
        )}

        {/* Featured star */}
        {bundle.isFeatured && !bundle.isApplied && (
          <div className="absolute end-2.5 top-2.5">
            <Star className="h-5 w-5 fill-warning text-warning" aria-hidden="true" />
          </div>
        )}

        {/* Quick preview button */}
        {onPreview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onPreview(bundle);
            }}
            className={cn(
              "absolute bottom-2.5 end-2.5 flex h-7 items-center gap-1.5 rounded-nx-control px-2.5 text-xs text-nx-ink opacity-0 shadow-nx-sm transition-opacity duration-nx-standard hover:bg-nx-popover focus-visible:opacity-100 focus-visible:shadow-nx-focus focus-visible:outline-none group-hover:opacity-100 motion-reduce:transition-none",
              FLOATING_CHIP
            )}
          >
            <Eye className="h-3 w-3" aria-hidden="true" /> {t("studio.marketplace.preview")}
          </button>
        )}

        {/* Pricing badge */}
        {!bundle.isFree && (
          <div className="absolute bottom-2.5 start-2.5">
            <Badge className="border-0 bg-warning text-[10px] text-warning-foreground">
              {t("studio.bundles.card.pro")}
            </Badge>
          </div>
        )}
      </div>

      {/* ── Card Body ── */}
      <div className="flex flex-1 flex-col p-4">
        {/* Title + Author */}
        <button
          type="button"
          className="cursor-pointer text-start focus-visible:shadow-nx-focus focus-visible:outline-none"
          onClick={() => onOpenDetail(bundle)}
        >
          <h3 className="line-clamp-1 text-sm font-semibold text-nx-ink transition-colors duration-nx-micro group-hover:text-nx-accent motion-reduce:transition-none">
            {bundle.name}
          </h3>
          <div className="mt-0.5 flex items-center gap-1.5">
            <User className="h-2.5 w-2.5 text-nx-ink-3" aria-hidden="true" />
            <span className="text-[10px] text-nx-ink-3">{bundle.authorName}</span>
          </div>
          <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-nx-ink-2">
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
                className="h-3.5 w-3.5 shrink-0 rounded-full border border-nx-line shadow-nx-sm"
                style={{ background: color }}
                aria-hidden="true"
              />
            ))}
          </div>

          <div className="flex-1" />

          {/* Layer icons */}
          <div className="flex items-center gap-0.5">
            {bundle.includedLayers.slice(0, 3).map((layer) => (
              <div
                key={layer}
                role="img"
                aria-label={t(LAYER_INFO[layer].labelKey)}
                className="flex h-5 w-5 items-center justify-center rounded-nx-sm bg-nx-raised"
              >
                <LayerIcon layer={layer} className="h-2.5 w-2.5" />
              </div>
            ))}
            {bundle.includedLayers.length > 3 && (
              <span className="ms-0.5 text-[9px] text-nx-ink-3">
                +{bundle.includedLayers.length - 3}
              </span>
            )}
          </div>
        </div>

        {/* Spacer */}
        <div className="min-h-[8px] flex-1" />

        {/* Footer: Actions */}
        <div className="mt-3 flex items-center justify-between border-t border-nx-line pt-3">
          <div className="flex items-center gap-1.5 text-xs text-nx-ink-2">
            {bundle.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="rounded-nx-sm bg-nx-raised px-1.5 py-0.5 text-[9px] text-nx-ink-2"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="flex items-center gap-1">
            {/* Favorite */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(bundle.slug);
              }}
              aria-label={
                bundle.isFavorited
                  ? t("studio.marketplace.favorited")
                  : t("studio.marketplace.favorite")
              }
              aria-pressed={bundle.isFavorited}
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-nx-control transition-colors duration-nx-micro focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none",
                bundle.isFavorited
                  ? "bg-destructive/10 text-destructive"
                  : "text-nx-ink-3 hover:bg-destructive/10 hover:text-destructive"
              )}
            >
              <Heart
                className={cn("h-3.5 w-3.5", bundle.isFavorited && "fill-current")}
                aria-hidden="true"
              />
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
                loading={isApplying}
              >
                {t("studio.bundles.applyBundle")}
              </Button>
            )}

            {/* Already applied */}
            {bundle.isApplied && (
              <Badge variant="outline" className="border-nx-accent text-xs text-nx-accent">
                <Check className="me-1 h-3 w-3" aria-hidden="true" />
                {t("studio.gallery.card.applied")}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
