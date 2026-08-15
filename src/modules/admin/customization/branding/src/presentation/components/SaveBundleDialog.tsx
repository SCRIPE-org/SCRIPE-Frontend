"use client";

/**
 * SaveBundleDialog — Dialog for saving current config as a bundle
 *
 * Lets admins name, describe, tag, and select which layers to include.
 * Auto-detects bundle type from layer selection.
 *
 * @module customization/presentation
 */
import { useState, useMemo } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
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
  Blocks,
  Grid3X3,
  FileKey2,
  Save,
  Package,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { useI18n } from "@core/providers/i18n-provider";
import {
  BUNDLE_TYPE_CONFIG,
  type BundleLayer,
  type BundleType,
} from "../../domain/entities/ThemeBundle";
import { LAYER_INFO, BUNDLE_TYPE_CHART_SLOT } from "../constants/layerDisplay";
import type { SaveBundlePayload } from "../../domain/interfaces/IThemeBundleService";

interface SaveBundleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: SaveBundlePayload) => void;
  isSaving: boolean;
}

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LogIn,
  Shield,
  LayoutDashboard,
  Blocks,
  Grid3X3,
  FileKey2,
};

const ALL_LAYERS: BundleLayer[] = [
  "login",
  "authPages",
  "dashboard",
  "loginBuilder",
  "dashboardBuilder",
];

const B = "studio.bundles";

/** Detect bundle type from selected layers */
function detectBundleType(layers: Record<BundleLayer, boolean>): BundleType {
  const selected = ALL_LAYERS.filter((l) => layers[l]);
  if (selected.length === 5) return "full-bundle";
  if (selected.length === 1 && selected[0] === "login") return "login-only";
  if (
    selected.includes("dashboard") &&
    !selected.includes("login") &&
    !selected.includes("authPages")
  )
    return "dashboard-only";
  if (selected.includes("login") && selected.includes("authPages")) return "auth-suite";
  return "full-bundle";
}

/**
 * Presentation UI component rendering the save bundle dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SaveBundleDialog({ isOpen, onClose, onSave, isSaving }: SaveBundleDialogProps) {
  const { t } = useI18n();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [layers, setLayers] = useState<Record<BundleLayer, boolean>>({
    login: true,
    authPages: true,
    dashboard: true,
    loginBuilder: true,
    dashboardBuilder: true,
  });

  const toggleLayer = (layer: BundleLayer) => {
    setLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  const detectedType = useMemo(() => detectBundleType(layers), [layers]);
  const selectedCount = ALL_LAYERS.filter((l) => layers[l]).length;
  const typeConfig = BUNDLE_TYPE_CONFIG[detectedType];
  const typeColor = chartColor(BUNDLE_TYPE_CHART_SLOT[detectedType]);

  const handleSave = () => {
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    onSave({
      name,
      description,
      bundleType: detectedType,
      tags,
      includeLayers: layers,
    });
  };

  const canSave = name.trim().length > 0 && selectedCount > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5 text-nx-accent" aria-hidden="true" />
            {t(`${B}.saveDialog.title`)}
          </DialogTitle>
          <DialogDescription>{t(`${B}.saveDialog.subtitle`)}</DialogDescription>
        </DialogHeader>

        <div className="mt-2 space-y-4">
          {/* Name */}
          <div className="space-y-1.5">
            <Label htmlFor="bundle-name" className="text-xs font-medium">
              {t(`${B}.saveDialog.name`)}
            </Label>
            <Input
              id="bundle-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t(`${B}.saveDialog.namePlaceholder`)}
              className="h-9"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="bundle-desc" className="text-xs font-medium">
              {t(`${B}.saveDialog.description`)}
            </Label>
            <Textarea
              id="bundle-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t(`${B}.saveDialog.descPlaceholder`)}
              rows={3}
              className="resize-none text-sm"
            />
          </div>

          {/* Layer Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">{t(`${B}.saveDialog.selectLayers`)}</Label>
            <div className="space-y-2">
              {ALL_LAYERS.map((layer) => {
                const info = LAYER_INFO[layer];
                const Icon = ICON_MAP[info.icon] ?? Blocks;
                const slotColor = chartColor(info.chartSlot);
                const inputId = `bundle-layer-${layer}`;
                return (
                  <label
                    key={layer}
                    htmlFor={inputId}
                    className="flex cursor-pointer items-center gap-3 rounded-nx-md border border-nx-line p-2.5 transition-colors duration-nx-micro hover:bg-nx-hover motion-reduce:transition-none"
                  >
                    <Checkbox
                      id={inputId}
                      checked={layers[layer]}
                      onCheckedChange={() => toggleLayer(layer)}
                    />
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-nx-sm"
                      style={{
                        backgroundColor: `color-mix(in srgb, ${slotColor} 15%, transparent)`,
                      }}
                      aria-hidden="true"
                    >
                      <span style={{ color: slotColor }}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <span className="text-sm text-nx-ink">{t(info.labelKey)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Auto-detected type */}
          <div className="flex items-center gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-2.5">
            <Package className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
            <span className="text-xs text-nx-ink-2">{t(`${B}.saveDialog.detectedType`)}:</span>
            <Badge
              variant="outline"
              className="text-xs"
              style={{ borderColor: typeColor, color: typeColor }}
            >
              {t(typeConfig.labelKey)}
            </Badge>
          </div>

          {/* Tags */}
          <div className="space-y-1.5">
            <Label htmlFor="bundle-tags" className="text-xs font-medium">
              {t(`${B}.saveDialog.tags`)}
            </Label>
            <Input
              id="bundle-tags"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder={t(`${B}.saveDialog.tagsPlaceholder`)}
              className="h-9"
            />
            <p className="text-[10px] text-nx-ink-3">{t(`${B}.saveDialog.tagsHint`)}</p>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!canSave} loading={isSaving}>
            {!isSaving && <Save className="me-1.5 h-4 w-4" aria-hidden="true" />}
            {t(`${B}.saveDialog.save`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
