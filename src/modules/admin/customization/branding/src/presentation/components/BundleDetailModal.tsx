// UI-EXCEPTION: compact studio layout
"use client";

/**
 * BundleDetailModal — Full detail view for a theme bundle
 *
 * Shows screenshots, layer breakdown, "What will change" preview,
 * and Apply/Replace/Merge options.
 *
 * @module customization/presentation
 */
import { cn } from "@/core/common/utils";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { chartColor } from "@core/ui/chart";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import {
  LogIn,
  Shield,
  LayoutDashboard,
  Package,
  Blocks,
  Grid3X3,
  FileKey2,
  Heart,
  Check,
  Star,
  ArrowRight,
  Layers,
  Info,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useState } from "react";
import type { ThemeBundle, BundleLayer } from "../../domain/entities/ThemeBundle";
import { BUNDLE_TYPE_CONFIG } from "../../domain/entities/ThemeBundle";
import { LAYER_INFO } from "../constants/layerDisplay";

interface BundleDetailModalProps {
  bundle: ThemeBundle | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (slug: string, merge: boolean) => void;
  onToggleFavorite: (slug: string) => void;
  isApplying?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LogIn,
  Shield,
  LayoutDashboard,
  Package,
  Blocks,
  Grid3X3,
  FileKey2,
};

/**
 * Presentation UI component rendering the bundle detail modal.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function BundleDetailModal({
  bundle,
  isOpen,
  onClose,
  onApply,
  onToggleFavorite,
  isApplying,
}: BundleDetailModalProps) {
  const { t } = useI18n();
  const [applyMode, setApplyMode] = useState<"replace" | "merge" | null>(null);

  if (!bundle) return null;

  const typeConfig = BUNDLE_TYPE_CONFIG[bundle.bundleType];
  const TypeIcon = ICON_MAP[typeConfig.icon] ?? Package;

  const handleApply = (merge: boolean) => {
    onApply(bundle.slug, merge);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {/* Color dot */}
            <div
              className="flex h-10 w-10 items-center justify-center rounded-nx-md shadow-nx-sm"
              style={{
                background: `linear-gradient(135deg, ${bundle.accentColor}, color-mix(in srgb, ${bundle.accentColor} 50%, black))`,
              }}
              aria-hidden="true"
            >
              <TypeIcon className="h-5 w-5 text-nx-on-fill" />
            </div>
            <div>
              <span className="block">{bundle.name}</span>
              <span className="mt-0.5 flex items-center gap-1.5 text-xs font-normal text-nx-ink-2">
                <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                  {t(typeConfig.labelKey)}
                </Badge>
                {bundle.isFeatured && (
                  <Star className="h-3 w-3 fill-warning text-warning" aria-hidden="true" />
                )}
                <span>v{bundle.version}</span>
                <span aria-hidden="true">•</span>
                <span>{bundle.authorName}</span>
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed">
            {bundle.description}
          </DialogDescription>
        </DialogHeader>

        {/* ── Layer Breakdown ── */}
        <div className="mt-4">
          <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-nx-ink">
            <Layers className="h-4 w-4 text-nx-accent" aria-hidden="true" />
            {t("studio.bundles.includes")}
          </h4>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {bundle.includedLayers.map((layer: BundleLayer) => {
              const info = LAYER_INFO[layer];
              const Icon = ICON_MAP[info.icon] ?? Blocks;
              const slotColor = chartColor(info.chartSlot);
              return (
                <div
                  key={layer}
                  className="flex items-center gap-3 rounded-nx-md border border-nx-line bg-nx-raised p-3"
                >
                  <div
                    className="flex h-9 w-9 items-center justify-center rounded-nx-md"
                    style={{
                      backgroundColor: `color-mix(in srgb, ${slotColor} 15%, transparent)`,
                    }}
                    aria-hidden="true"
                  >
                    <span style={{ color: slotColor }}>
                      <Icon className="h-4 w-4" />
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-nx-ink">{t(info.labelKey)}</p>
                    <p className="text-[11px] text-nx-ink-2">
                      {t(`studio.bundles.layerDesc.${layer}`)}
                    </p>
                  </div>
                  <Check className="ms-auto h-4 w-4 flex-shrink-0 text-success" aria-hidden="true" />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Tags ── */}
        {bundle.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {bundle.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* ── Apply Mode Selector ── */}
        {!bundle.isApplied && bundle.isAvailable && (
          <div className="mt-6 rounded-nx-lg border border-nx-line bg-nx-raised p-4">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-nx-ink">
              <Info className="h-4 w-4 text-nx-accent" aria-hidden="true" />
              {t("studio.bundles.applyMode.title")}
            </h4>
            <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label={t("studio.bundles.applyMode.title")}>
              {/* Replace option */}
              <button
                type="button"
                role="radio"
                aria-checked={applyMode === "replace"}
                className={cn(
                  "flex flex-col items-start rounded-nx-md border-2 p-3 text-start transition-colors duration-nx-micro motion-reduce:transition-none",
                  "focus-visible:outline-none focus-visible:shadow-nx-focus",
                  applyMode === "replace"
                    ? "border-nx-accent bg-nx-accent-wash"
                    : "border-nx-line hover:border-nx-line-hi"
                )}
                onClick={() => setApplyMode("replace")}
              >
                <span className="text-sm font-medium text-nx-ink">
                  {t("studio.bundles.applyMode.replace")}
                </span>
                <span className="mt-1 text-[11px] text-nx-ink-2">
                  {t("studio.bundles.applyMode.replaceDesc")}
                </span>
              </button>

              {/* Merge option */}
              <button
                type="button"
                role="radio"
                aria-checked={applyMode === "merge"}
                className={cn(
                  "flex flex-col items-start rounded-nx-md border-2 p-3 text-start transition-colors duration-nx-micro motion-reduce:transition-none",
                  "focus-visible:outline-none focus-visible:shadow-nx-focus",
                  applyMode === "merge"
                    ? "border-nx-accent bg-nx-accent-wash"
                    : "border-nx-line hover:border-nx-line-hi"
                )}
                onClick={() => setApplyMode("merge")}
              >
                <span className="text-sm font-medium text-nx-ink">
                  {t("studio.bundles.applyMode.merge")}
                </span>
                <span className="mt-1 text-[11px] text-nx-ink-2">
                  {t("studio.bundles.applyMode.mergeDesc")}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* ── Footer Actions ── */}
        <DialogFooter className="mt-6 gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleFavorite(bundle.slug)}
            aria-pressed={bundle.isFavorited}
            className={cn(bundle.isFavorited && "text-destructive")}
          >
            <Heart className={cn("me-1.5 h-4 w-4", bundle.isFavorited && "fill-current")} aria-hidden="true" />
            {bundle.isFavorited
              ? t("studio.marketplace.favorited")
              : t("studio.marketplace.favorite")}
          </Button>

          <div className="flex-1" />

          <Button variant="outline" onClick={onClose}>
            {t("common.close")}
          </Button>

          {!bundle.isApplied && bundle.isAvailable && (
            <Button
              onClick={() => handleApply(applyMode === "merge")}
              disabled={isApplying || !applyMode}
              loading={isApplying}
              className="gap-2"
            >
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
              {t("studio.bundles.applyBundle")}
            </Button>
          )}

          {bundle.isApplied && (
            <Badge variant="outline" className="border-nx-accent px-3 py-1.5 text-nx-accent">
              <Check className="me-1.5 h-4 w-4" aria-hidden="true" />
              {t("studio.gallery.card.applied")}
            </Badge>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
