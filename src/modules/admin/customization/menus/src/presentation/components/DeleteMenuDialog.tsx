/**
 * Delete Menu Dialog
 *
 * Confirmation dialog for deleting a menu item.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";

/* -------------------------------------------------------------------------- */
/*  Props                                                                      */
/* -------------------------------------------------------------------------- */

export interface DeleteMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemName: string;
  onConfirm: () => void;
  isPending: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export function DeleteMenuDialog({
  open,
  onOpenChange,
  itemName,
  onConfirm,
  isPending,
}: DeleteMenuDialogProps) {
  const { t } = useI18n();

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="destructive"
      title={t("menus.deleteTitle")}
      description={t("menus.deleteDesc", { name: itemName })}
      confirmText={isPending ? t("common.deleting") : t("common.delete")}
      cancelText={t("common.cancel")}
      onConfirm={onConfirm}
      isLoading={isPending}
    />
  );
}
