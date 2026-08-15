import { GenericModal } from "@core/crud/components/generic-modal";
import { Checkbox } from "@core/ui/checkbox";
import { Label } from "@core/ui/label";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Info } from "lucide-react";

/**
 * Interface defining property specifications, keys types, and structural contract rules for cascade restore dialog props.
 */
export interface CascadeRestoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (cascadeAdmins: boolean) => void;
  isPending: boolean;
  itemName: string;
}

/**
 * Presentation UI component rendering the cascade restore dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
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
      title={t("recycleBin.restoreGroupTitle")}
      description={t("recycleBin.restoreConfirmDesc").replace("{name}", itemName)}
    >
      <div className="space-y-4 py-2">
        <Alert variant="info">
          <Info className="h-4 w-4" aria-hidden="true" />
          <AlertTitle>{t("userGroups.restoreAdminsTitle")}</AlertTitle>
          <AlertDescription>{t("userGroups.restoreAdminsDesc")}</AlertDescription>
        </Alert>

        <div className="flex items-start gap-2 pt-2">
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
            {t("userGroups.alsoRestoreAdmins")}
          </Label>
        </div>

        <div className="mt-4 flex justify-end gap-2 border-t border-nx-line pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
            {t("common.cancel")}
          </Button>
          <Button variant="default" onClick={handleConfirm} loading={isPending}>
            {t("recycleBin.restore")}
          </Button>
        </div>
      </div>
    </GenericModal>
  );
}
