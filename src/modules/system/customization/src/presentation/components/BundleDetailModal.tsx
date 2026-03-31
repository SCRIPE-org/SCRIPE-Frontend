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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@core/ui/dialog";
import {
  LogIn, Shield, LayoutDashboard, Package, Blocks,
  Grid3X3, FileKey2, Heart, Check, Loader2, Star,
  ArrowRight, Layers, Info,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useState } from "react";
import type { ThemeBundle, BundleLayer } from "../../domain/entities/ThemeBundle";
import { BUNDLE_TYPE_CONFIG, LAYER_INFO } from "../../domain/entities/ThemeBundle";

interface BundleDetailModalProps {
  bundle: ThemeBundle | null;
  isOpen: boolean;
  onClose: () => void;
  onApply: (slug: string, merge: boolean) => void;
  onToggleFavorite: (slug: string) => void;
  isApplying?: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LogIn, Shield, LayoutDashboard, Package, Blocks, Grid3X3, FileKey2,
};

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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {/* Color dot */}
            <div
              className="h-10 w-10 rounded-xl flex items-center justify-center shadow-lg"
              style={{
                background: `linear-gradient(135deg, ${bundle.accentColor}, color-mix(in srgb, ${bundle.accentColor} 50%, #1e1b4b))`,
              }}
            >
              <TypeIcon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="block">{bundle.name}</span>
              <span className="text-xs text-muted-foreground font-normal flex items-center gap-1.5 mt-0.5">
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  {t(typeConfig.labelKey)}
                </Badge>
                {bundle.isFeatured && (
                  <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                )}
                <span>v{bundle.version}</span>
                <span>•</span>
                <span>{bundle.authorName}</span>
              </span>
            </div>
          </DialogTitle>
          <DialogDescription className="text-sm leading-relaxed mt-2">
            {bundle.description}
          </DialogDescription>
        </DialogHeader>

        {/* ── Layer Breakdown ── */}
        <div className="mt-4">
          <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
            <Layers className="h-4 w-4 text-primary" />
            {t("studio.bundles.includes")}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bundle.includedLayers.map((layer: BundleLayer) => {
              const info = LAYER_INFO[layer];
              const Icon = ICON_MAP[info.icon] ?? Blocks;
              return (
                <div
                  key={layer}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-muted/30"
                >
                  <div
                    className="h-9 w-9 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${info.color}15` }}
                  >
                    <span style={{ color: info.color }}><Icon className="h-4 w-4" /></span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{t(info.labelKey)}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {t(`studio.bundles.layerDesc.${layer}`)}
                    </p>
                  </div>
                  <Check className="h-4 w-4 text-emerald-500 ml-auto flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Tags ── */}
        {bundle.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-4">
            {bundle.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* ── Apply Mode Selector ── */}
        {!bundle.isApplied && bundle.isAvailable && (
          <div className="mt-6 p-4 border border-border/50 rounded-xl bg-muted/20">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Info className="h-4 w-4 text-primary" />
              {t("studio.bundles.applyMode.title")}
            </h4>
            <div className="grid grid-cols-2 gap-3">
              {/* Replace option */}
              <button
                className={cn(
                  "flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left",
                  applyMode === "replace"
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/30"
                )}
                onClick={() => setApplyMode("replace")}
              >
                <span className="text-sm font-medium">{t("studio.bundles.applyMode.replace")}</span>
                <span className="text-[11px] text-muted-foreground mt-1">
                  {t("studio.bundles.applyMode.replaceDesc")}
                </span>
              </button>

              {/* Merge option */}
              <button
                className={cn(
                  "flex flex-col items-start p-3 rounded-lg border-2 transition-all text-left",
                  applyMode === "merge"
                    ? "border-primary bg-primary/5"
                    : "border-border/50 hover:border-primary/30"
                )}
                onClick={() => setApplyMode("merge")}
              >
                <span className="text-sm font-medium">{t("studio.bundles.applyMode.merge")}</span>
                <span className="text-[11px] text-muted-foreground mt-1">
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
            className={cn(bundle.isFavorited && "text-rose-500")}
          >
            <Heart className={cn("h-4 w-4 mr-1.5", bundle.isFavorited && "fill-current")} />
            {bundle.isFavorited ? t("studio.marketplace.favorited") : t("studio.marketplace.favorite")}
          </Button>

          <div className="flex-1" />

          <Button variant="outline" onClick={onClose}>
            {t("common.close")}
          </Button>

          {!bundle.isApplied && bundle.isAvailable && (
            <Button
              onClick={() => handleApply(applyMode === "merge")}
              disabled={isApplying || !applyMode}
              className="gap-2"
            >
              {isApplying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ArrowRight className="h-4 w-4" />
                  {t("studio.bundles.applyBundle")}
                </>
              )}
            </Button>
          )}

          {bundle.isApplied && (
            <Badge variant="outline" className="text-primary border-primary/30 py-1.5 px-3">
              <Check className="h-4 w-4 mr-1.5" />
              {t("studio.gallery.applied")}
            </Badge>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
