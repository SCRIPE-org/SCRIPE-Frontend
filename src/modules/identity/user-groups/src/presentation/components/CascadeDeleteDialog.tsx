"use client";

import { Button } from "@core/ui/button";
import { GenericModal } from "@core/crud/components/generic-modal";
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
 * React presentation component representing the cascade delete dialog UI element.
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
      title={title || t("common.deleteConfirm") || "Confirm Deletion"}
      description={
        description ||
        t("common.deleteConfirmDesc")?.replace("{item}", itemName || "") ||
        `Are you sure you want to delete ${itemName || "this item"}?`
      }
      size="md"
    >
      <div className="space-y-4 py-2">
        <div className="rounded-md border border-destructive/20 bg-destructive/10 p-4">
          <div className="flex gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-destructive">
                {t("userGroups.cascadeDeleteWarning") ||
                  "Warning: This action can affect assigned admins."}
              </p>
              <p className="text-xs text-muted-foreground">
                {t("userGroups.cascadeDeleteDesc") ||
                  "If you don't delete the admins, they will be removed from this group. Admins left with no roles or groups will be assigned a default system role."}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox
            id="cascadeAdmins"
            checked={cascadeAdmins}
            onCheckedChange={(checked) => setCascadeAdmins(!!checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="cascadeAdmins" className="cursor-pointer font-medium">
              {t("userGroups.alsoDeleteAdmins") || "Also delete assigned admins"}
            </Label>
            <p className="text-xs text-muted-foreground">
              {t("userGroups.alsoDeleteAdminsDesc") ||
                "Check this to soft-delete all admins that are currently assigned to this group."}
            </p>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => handleClose(false)} disabled={isPending}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button variant="destructive" onClick={handleConfirm} loading={isPending}>
            {t("common.delete") || "Delete"}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
