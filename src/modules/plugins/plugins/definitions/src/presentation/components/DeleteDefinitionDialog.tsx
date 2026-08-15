"use client";

import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveBilingualLabel } from "@core/common/utils";
import type { PluginDefinition } from "@modules/plugins/core";

/**
 * Interface defining property specifications, keys types, and structural contract rules for delete definition dialog props.
 */
export interface DeleteDefinitionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  definition: PluginDefinition | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

/**
 * Confirms permanent (soft-)deletion of a plugin definition before the destructive
 * mutation fires. The table's Delete icon-button previously called the delete
 * mutation directly with no confirmation step -- a stray click permanently removed
 * a plugin definition from the platform registry.
 */
export function DeleteDefinitionDialog({
  open,
  onOpenChange,
  definition,
  onConfirm,
  isDeleting = false,
}: DeleteDefinitionDialogProps) {
  const { t, language } = useI18n();
  const defName = definition
    ? resolveBilingualLabel(definition.name, definition.nameAr, language)
    : "";

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={onOpenChange}
      variant="destructive"
      title={t("common.confirmDelete")}
      // Naming the record is the whole point of a confirmation -- the operator
      // has to recognise what they are about to delete, not just that it is
      // "a plugin definition".
      description={t("plugins.defDeleteConfirmDesc", { name: defName })}
      confirmText={t("common.delete")}
      cancelText={t("common.cancel")}
      onConfirm={onConfirm}
      isLoading={isDeleting}
    >
      <p className="text-sm text-nx-ink-2">{t("common.deleteWarning")}</p>
    </ConfirmationDialog>
  );
}
