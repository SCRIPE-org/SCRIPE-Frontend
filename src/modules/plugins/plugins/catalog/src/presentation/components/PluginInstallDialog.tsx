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
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Puzzle, ShieldCheck, AlertTriangle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
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
  const hasBrandColor = plugin.colorHue != null;

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
              className={cn(
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-nx-md border border-nx-line",
                hasBrandColor ? "text-nx-on-fill" : "bg-nx-raised text-nx-ink-3"
              )}
              style={
                hasBrandColor
                  ? { background: `oklch(0.7 ${plugin.colorChroma ?? 0.2} ${plugin.colorHue})` }
                  : undefined
              }
              aria-hidden="true"
            >
              <Puzzle className="h-6 w-6" />
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
          <div className="space-y-3 rounded-nx-md border border-nx-line bg-nx-raised p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-nx-ink">
              <ShieldCheck className="h-4 w-4 text-nx-accent" aria-hidden="true" />
              {t("plugins.dialogTier2ConsentTitle")}
            </div>
            <p className="text-xs text-nx-ink-2">{t("plugins.dialogTier2ConsentDesc")}</p>
            <ul className="space-y-1.5">
              {tier2Permissions.map((perm) => (
                <li key={perm} className="flex items-start gap-2 text-xs text-nx-ink-2">
                  <span className="mt-0.5 text-nx-accent" aria-hidden="true">
                    •
                  </span>
                  {perm}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2">
              <Checkbox
                id="plugin-install-tier2-consent"
                checked={consented}
                onCheckedChange={(checked) => setConsented(checked === true)}
              />
              <Label
                htmlFor="plugin-install-tier2-consent"
                className="cursor-pointer text-xs font-normal text-nx-ink"
              >
                {t("plugins.dialogTier2ConsentCheck")}
              </Label>
            </div>
          </div>
        )}

        {!plugin.isTier2 && (
          <Alert variant="warning">
            <AlertTriangle aria-hidden="true" />
            <AlertDescription className="text-xs">
              {t("plugins.dialogTier1Warning")}
            </AlertDescription>
          </Alert>
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
