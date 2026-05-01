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
  LAYER_INFO,
  BUNDLE_TYPE_CONFIG,
  type BundleLayer,
  type BundleType,
} from "../../domain/entities/ThemeBundle";
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

  const handleSave = () => {
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
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
            <Save className="h-5 w-5 text-primary" />
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
                return (
                  <label
                    key={layer}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border/50 p-2.5 transition-colors hover:bg-muted/30"
                  >
                    <Checkbox checked={layers[layer]} onCheckedChange={() => toggleLayer(layer)} />
                    <div
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md"
                      style={{ backgroundColor: `${info.color}15` }}
                    >
                      <span style={{ color: info.color }}>
                        <Icon className="h-3.5 w-3.5" />
                      </span>
                    </div>
                    <span className="text-sm">{t(info.labelKey)}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Auto-detected type */}
          <div className="flex items-center gap-2 rounded-lg border border-border/50 bg-muted/30 p-2.5">
            <Package className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {t(`${B}.saveDialog.detectedType`)}:
            </span>
            <Badge
              variant="outline"
              className="text-xs"
              style={{ borderColor: typeConfig.color, color: typeConfig.color }}
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
            <p className="text-[10px] text-muted-foreground">{t(`${B}.saveDialog.tagsHint`)}</p>
          </div>
        </div>

        <DialogFooter className="mt-4 gap-2">
          <Button variant="outline" onClick={onClose}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleSave} disabled={!canSave} loading={isSaving}>
            {!isSaving && <Save className="mr-1.5 h-4 w-4" />}
            {t(`${B}.saveDialog.save`)}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
