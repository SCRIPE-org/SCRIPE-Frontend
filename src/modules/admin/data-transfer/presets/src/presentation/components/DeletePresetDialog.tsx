"use client";

import React from "react";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Loader2 } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import type { DataExchangePreset } from "../../domain/entities/DataExchangePreset";

/**
 * Props for DeletePresetDialog component.
 */
export interface DeletePresetDialogProps {
  open: boolean;
  preset: DataExchangePreset | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/**
 * Confirmation dialog for permanently deleting a mapping preset.
 */
export function DeletePresetDialog({
  open,
  preset,
  isDeleting,
  onClose,
  onConfirm,
}: DeletePresetDialogProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("adminDataTransferPresets.deleteDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("adminDataTransferPresets.deleteDialog.description", {
              name: preset?.name ?? "",
              entityKey: preset?.entityKey ?? "",
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin ltr:mr-1.5 rtl:ml-1.5" />
                {t("adminDataTransferPresets.deleteDialog.deleting")}
              </>
            ) : (
              t("adminDataTransferPresets.deleteDialog.confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
