"use client";

import React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";

export interface StudioConfirmExitDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
}

/**
 * Confirmation dialog preventing accidental loss of uploaded spreadsheet data,
 * inspected schema mappings, or uncopied ephemeral credentials.
 * Standardized on @core/ui/confirmation-dialog.
 */
export function StudioConfirmExitDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
  confirmText,
}: StudioConfirmExitDialogProps) {
  const { direction, t } = useI18n();

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={(isOpen) => (!isOpen ? onCancel() : null)}
      onConfirm={onConfirm}
      onCancel={onCancel}
      variant="destructive"
      title={title || t("dataExchange.confirmExit.title")}
      description={description || t("dataExchange.confirmExit.description")}
      confirmText={confirmText || t("dataExchange.confirmExit.discardAndExit")}
      cancelText={t("dataExchange.confirmExit.keepEditing")}
      dir={direction}
      className="max-w-md border border-nx-line bg-nx-surface text-nx-ink"
      data-testid="studio-confirm-exit-dialog"
      cancelButtonProps={{
        "data-testid": "studio-exit-cancel-btn",
        className: "border-nx-line text-xs",
      }}
      confirmButtonProps={{
        "data-testid": "studio-exit-confirm-btn",
        className: "text-xs",
      }}
    />
  );
}
