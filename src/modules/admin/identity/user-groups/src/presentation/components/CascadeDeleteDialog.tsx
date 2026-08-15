"use client";

import { Button } from "@core/ui/button";
import { GenericModal } from "@core/crud/components/generic-modal";
import { Alert, AlertTitle, AlertDescription } from "@core/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { Checkbox } from "@core/ui/checkbox";
import { useState } from "react";
import { Label } from "@core/ui/label";

interface CascadeDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (cascadeAdmins: boolean) => void;
  isPending: boolean;
  title?: string;
  description?: string;
  itemName?: string;
}

/**
 * Presentation UI component rendering the cascade delete dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function CascadeDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  title,
  description,
  itemName,
}: CascadeDeleteDialogProps) {
  const { t } = useI18n();
  const [cascadeAdmins, setCascadeAdmins] = useState(false);

  const handleConfirm = () => {
    onConfirm(cascadeAdmins);
  };

  const handleClose = (v: boolean) => {
    if (!v) setCascadeAdmins(false);
    onOpenChange(v);
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={handleClose}
      title={title || t("userGroups.deleteConfirmTitle")}
      description={
        description ||
        t("userGroups.deleteConfirmMessage", {
          name: itemName || t("userGroups.selectedGroupSingular"),
        })
      }
      size="md"
    >
      <div className="space-y-4 py-2">
        <Alert variant="destructive">
          <AlertTriangle aria-hidden="true" />
          <AlertTitle>{t("userGroups.cascadeDeleteWarning")}</AlertTitle>
          <AlertDescription>{t("userGroups.cascadeDeleteDesc")}</AlertDescription>
        </Alert>

        <div className="flex items-start gap-2 pt-2">
          <Checkbox
            id="cascadeAdmins"
            checked={cascadeAdmins}
            onCheckedChange={(checked) => setCascadeAdmins(!!checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="cascadeAdmins" className="cursor-pointer font-medium">
              {t("userGroups.alsoDeleteAdmins")}
            </Label>
            <p className="text-xs text-nx-ink-3">{t("userGroups.alsoDeleteAdminsDesc")}</p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t border-nx-line pt-4">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} loading={isPending}>
            {t("common.delete")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
