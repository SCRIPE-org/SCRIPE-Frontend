"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
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
import { useI18n } from "@core/providers/i18n-provider";

export interface StudioConfirmExitDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  description?: string;
}

/**
 * Confirmation dialog preventing accidental loss of uploaded spreadsheet data,
 * inspected schema mappings, or uncopied ephemeral credentials.
 */
export function StudioConfirmExitDialog({
  open,
  onConfirm,
  onCancel,
  title,
  description,
}: StudioConfirmExitDialogProps) {
  const { direction, t } = useI18n();

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => (!isOpen ? onCancel() : null)}>
      <AlertDialogContent
        dir={direction}
        className="z-[960] max-w-md border border-nx-line bg-nx-surface text-nx-ink shadow-nx-modal"
        data-testid="studio-confirm-exit-dialog"
      >
        <AlertDialogHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-nx-control border border-warning/30 bg-warning/10 text-warning">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="text-base font-semibold text-nx-ink">
              {title || t("dataExchange.confirmExit.title")}
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-xs text-nx-ink-2 mt-2 leading-relaxed">
            {description || t("dataExchange.confirmExit.description")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4 gap-2">
          <AlertDialogCancel
            type="button"
            className="border-nx-line text-xs"
            data-testid="studio-exit-cancel-btn"
          >
            {t("dataExchange.confirmExit.keepEditing")}
          </AlertDialogCancel>
          <AlertDialogAction
            type="button"
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs"
            data-testid="studio-exit-confirm-btn"
          >
            {t("dataExchange.confirmExit.discardAndExit")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
