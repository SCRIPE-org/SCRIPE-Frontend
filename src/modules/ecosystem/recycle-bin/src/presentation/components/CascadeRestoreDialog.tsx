import { GenericModal } from "@core/crud/components/generic-modal";
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Info } from "lucide-react";

export interface CascadeRestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (cascadeAdmins: boolean) => void;
  isPending: boolean;
  itemName: string;
}

export function CascadeRestoreDialog({
  open,
  onOpenChange,
  onConfirm,
  isPending,
  itemName,
}: CascadeRestoreDialogProps) {
  const { t } = useI18n();
  const [cascadeAdmins, setCascadeAdmins] = useState(false);

  // Reset cascadeAdmins when dialog opens
  const [prevOpen, setPrevOpen] = useState(open);
  if (open !== prevOpen) {
    setPrevOpen(open);
    if (open) {
      setCascadeAdmins(false);
    }
  }

  const handleConfirm = () => {
    onConfirm(cascadeAdmins);
  };

  return (
    <GenericModal
      open={open}
      onOpenChange={onOpenChange}
      title={t("recycleBin.restoreConfirmTitle") || "Restore User Group"}
      description={(
        t("recycleBin.restoreConfirmDesc") || "Are you sure you want to restore {name}?"
      ).replace("{name}", itemName)}
    >
      <div className="space-y-4 py-2">
        <Alert>
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle className="text-blue-500">
            {t("userGroups.restoreAdminsTitle") || "Restore Associated Admins"}
          </AlertTitle>
          <AlertDescription className="text-blue-600/90 dark:text-blue-400">
            {t("userGroups.restoreAdminsDesc") ||
              "This user group may have administrators associated with it that were deleted when the group was deleted. You can choose to restore them along with the group."}
          </AlertDescription>
        </Alert>

        <div className="flex items-start space-x-2 pt-2">
          <Checkbox
            id="cascadeAdmins"
            checked={cascadeAdmins}
            onCheckedChange={(checked) => setCascadeAdmins(checked === true)}
            disabled={isPending}
          />
          <Label
            htmlFor="cascadeAdmins"
            className="cursor-pointer text-sm font-normal leading-snug"
          >
            {t("userGroups.alsoRestoreAdmins") || "Also restore assigned admins"}
          </Label>
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("common.cancel") || "Cancel"}
          </Button>
          <Button variant="default" onClick={handleConfirm} loading={isPending}>
            {t("recycleBin.restore") || "Restore"}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
