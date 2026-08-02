"use client";

import { Button } from "@core/ui/button";
import { GenericModal } from "@core/crud/components/generic-modal";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Checkbox } from "@core/ui/checkbox";
import { useState } from "react";
import { Label } from "@core/ui/label";

interface CascadeStatusDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (cascadeAdmins: boolean) => void;
  isPending: boolean;
  isActive: boolean; // What status are we setting to? true for Activate, false for Deactivate
  title?: string;
  description?: string;
  itemName?: string;
}

/**
 * Presentation UI component rendering the cascade status dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function CascadeStatusDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  isActive,
  title,
  description,
  itemName,
}: CascadeStatusDialogProps) {
  const { t } = useI18n();
  const [cascadeAdmins, setCascadeAdmins] = useState(false);

  const handleConfirm = () => {
    onConfirm(cascadeAdmins);
  };

  const handleClose = (v: boolean) => {
    if (!v) setCascadeAdmins(false);
    onOpenChange(v);
  };

  const actionText = isActive ? t("common.activate") : t("common.deactivate");
  const actionTextToLower = actionText.toLowerCase();

  return (
    <GenericModal
      open={open}
      onOpenChange={handleClose}
      title={title || actionText}
      description={
        description ||
        t("userGroups.statusConfirmMessage", {
          action: actionTextToLower,
          name: itemName || t("userGroups.selectedGroupSingular"),
        })
      }
      size="md"
    >
      <div className="space-y-4 py-2">
        <Alert variant="warning">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>{t("userGroups.cascadeStatusWarning")}</AlertTitle>
          <AlertDescription>
            {t("userGroups.cascadeStatusDesc", { status: actionTextToLower })}
          </AlertDescription>
        </Alert>

        <div className="flex items-start gap-2 pt-2">
          <Checkbox
            id="cascadeAdminsStatus"
            checked={cascadeAdmins}
            onCheckedChange={(checked) => setCascadeAdmins(!!checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="cascadeAdminsStatus" className="cursor-pointer font-medium">
              {t("userGroups.alsoStatusAdmins", { status: actionTextToLower })}
            </Label>
            <p className="text-xs text-nx-ink-3">
              {t("userGroups.alsoStatusAdminsDesc", { status: actionTextToLower })}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t border-nx-line pt-4">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button
            variant={isActive ? "default" : "secondary"}
            onClick={handleConfirm}
            loading={isPending}
          >
            {actionText}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
