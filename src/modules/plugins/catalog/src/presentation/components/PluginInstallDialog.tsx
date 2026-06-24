// UI-EXCEPTION: compact studio layout
"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Puzzle, ShieldCheck, AlertTriangle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { PluginCatalogItem } from "../../domain/entities/PluginCatalogItem";

interface PluginInstallDialogProps {
  plugin: PluginCatalogItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (plugin: PluginCatalogItem) => void;
  isInstalling: boolean;
}

/**
 * Presentation UI component rendering the plugin install dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function PluginInstallDialog({
  plugin,
  open,
  onOpenChange,
  onConfirm,
  isInstalling,
}: PluginInstallDialogProps) {
  const { t, language } = useI18n();
  const [consented, setConsented] = useState(false);

  if (!plugin) return null;

  const displayName = language === "ar" ? plugin.nameAr || plugin.name : plugin.name;
  const displayDesc =
    language === "ar" ? plugin.descriptionAr || plugin.description : plugin.description;

  const tier2Permissions = [
    t("plugins.perm1"),
    t("plugins.perm2"),
    t("plugins.perm3"),
    t("plugins.perm4"),
  ];

  const handleOpenChange = (next: boolean) => {
    if (!next) setConsented(false);
    onOpenChange(next);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-3">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted"
              style={
                plugin.colorHue != null
                  ? { background: `oklch(0.7 ${plugin.colorChroma ?? 0.2} ${plugin.colorHue})` }
                  : undefined
              }
            >
              <Puzzle className="h-6 w-6 text-white" />
            </div>
            <div>
              <DialogTitle>{displayName}</DialogTitle>
              <Badge variant="outline" className="mt-1 text-xs">
                {plugin.isTier2 ? t("plugins.tier2Label") : t("plugins.tier1Label")}
              </Badge>
            </div>
          </div>
          <DialogDescription>{displayDesc}</DialogDescription>
        </DialogHeader>

        {plugin.isTier2 && (
          <div className="space-y-3 rounded-lg border bg-muted/50 p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {t("plugins.dialogTier2ConsentTitle")}
            </div>
            <p className="text-xs text-muted-foreground">{t("plugins.dialogTier2ConsentDesc")}</p>
            <ul className="space-y-1.5">
              {tier2Permissions.map((perm) => (
                <li key={perm} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <span className="mt-0.5 text-primary">•</span>
                  {perm}
                </li>
              ))}
            </ul>
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                className="rounded"
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
              />
              <span className="text-xs">{t("plugins.dialogTier2ConsentCheck")}</span>
            </label>
          </div>
        )}

        {!plugin.isTier2 && (
          <div className="flex items-start gap-2 rounded-lg border bg-muted/50 p-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-xs text-muted-foreground">{t("plugins.dialogTier1Warning")}</p>
          </div>
        )}

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isInstalling}>
            {t("plugins.dialogCancel")}
          </Button>
          <Button
            onClick={() => onConfirm(plugin)}
            disabled={isInstalling || (plugin.isTier2 && !consented)}
          >
            {isInstalling ? t("plugins.dialogInstalling") : t("plugins.dialogConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
