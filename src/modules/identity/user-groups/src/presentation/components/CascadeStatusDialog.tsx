"use client";

import { Button } from "@core/ui/button";
import { GenericModal } from "@core/crud/components/generic-modal";
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
 * React presentation component representing the cascade status dialog UI element.
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

  const actionText = isActive
    ? t("common.activate") || "Activate"
    : t("common.deactivate") || "Deactivate";
  const actionTextToLower = isActive
    ? t("common.activate")?.toLowerCase() || "activate"
    : t("common.deactivate")?.toLowerCase() || "deactivate";

  return (
    <GenericModal
      open={open}
      onOpenChange={handleClose}
      title={title || actionText}
      description={
        description ||
        t("common.statusConfirmDesc")
          ?.replace("{status}", actionTextToLower)
          .replace("{item}", itemName || "") ||
        `Are you sure you want to ${actionTextToLower} ${itemName || "this item"}?`
      }
      size="md"
    >
      <div className="space-y-4 py-2">
        <div className="rounded-md border border-amber-500/20 bg-amber-500/10 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-amber-500">
                {t("userGroups.cascadeStatusWarning") ||
                  `Warning: This action can affect assigned admins.`}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("userGroups.cascadeStatusDesc")?.replace("{status}", actionTextToLower) ||
                  `You can optionally ${actionTextToLower} all admins assigned to this group as well.`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox
            id="cascadeAdminsStatus"
            checked={cascadeAdmins}
            onCheckedChange={(checked) => setCascadeAdmins(!!checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="cascadeAdminsStatus" className="cursor-pointer font-medium">
              {t("userGroups.alsoStatusAdmins")?.replace("{status}", actionTextToLower) ||
                `Also ${actionTextToLower} assigned admins`}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t("userGroups.alsoStatusAdminsDesc")?.replace("{status}", actionTextToLower) ||
                `Check this to cascade this status change to all admins in the group.`}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            {t("common.cancel") || "Cancel"}
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
