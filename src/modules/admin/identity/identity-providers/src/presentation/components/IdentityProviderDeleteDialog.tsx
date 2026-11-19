"use client";

import { useI18n } from "@core/providers/i18n-provider";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@core/ui/alert-dialog";

/**
 * Props for {@link IdentityProviderDeleteDialog}.
 */
export interface IdentityProviderDeleteDialogProps {
  /** Controlled dialog open state. */
  open: boolean;
  /** Callback to update dialog open state. */
  onOpenChange: (open: boolean) => void;
  /** Invoked when the administrator confirms deletion of the provider. */
  onConfirm: () => void;
}

/**
 * Confirmation dialog guarding destructive Identity Provider deletion.
 */
export function IdentityProviderDeleteDialog({
  open,
  onOpenChange,
  onConfirm,
}: IdentityProviderDeleteDialogProps) {
  const { t } = useI18n();

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("identityProviders.deleteConfirmTitle")}</AlertDialogTitle>
          <AlertDialogDescription>
            {t("identityProviders.deleteConfirmDesc")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {t("common.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
