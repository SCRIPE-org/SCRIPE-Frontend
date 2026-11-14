"use client";

import React from "react";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
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
 * Standardized on @core/ui/confirmation-dialog.
 */
export function DeletePresetDialog({
  open,
  preset,
  isDeleting,
  onClose,
  onConfirm,
}: DeletePresetDialogProps): React.ReactElement {
  const { direction, t } = useI18n();

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={(isOpen) => (!isOpen ? onClose() : null)}
      onConfirm={onConfirm}
      onCancel={onClose}
      variant="destructive"
      isLoading={isDeleting}
      title={t("adminDataTransferPresets.deleteDialog.title")}
      description={t("adminDataTransferPresets.deleteDialog.description", {
        name: preset?.name ?? "",
        entityKey: preset?.entityKey ?? "",
      })}
      cancelText={t("common.cancel", { defaultValue: "Cancel" })}
      confirmText={
        isDeleting
          ? t("adminDataTransferPresets.deleteDialog.deleting")
          : t("adminDataTransferPresets.deleteDialog.confirm")
      }
      dir={direction}
      className="max-w-md border border-nx-line bg-nx-surface text-nx-ink shadow-nx-modal"
      data-testid="delete-preset-dialog"
      cancelButtonProps={{
        "data-testid": "delete-preset-cancel-btn",
      }}
      confirmButtonProps={{
        "data-testid": "delete-preset-confirm-btn",
      }}
    />
  );
}
