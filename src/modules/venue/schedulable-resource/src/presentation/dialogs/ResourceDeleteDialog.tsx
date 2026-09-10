import React from "react";
import { Button } from "@core/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@core/ui/alert-dialog";
import type { SchedulableResourceTreeNode } from "../utils/resourceTree";

export interface ResourceDeleteDialogProps {
  target: SchedulableResourceTreeNode | null;
  deleting: boolean;
  t: (key: string) => string;
  onClose: () => void;
  onConfirm: () => void;
}

export function ResourceDeleteDialog({
  target,
  deleting,
  t,
  onClose,
  onConfirm,
}: ResourceDeleteDialogProps) {
  return (
    <AlertDialog
      open={!!target}
      onOpenChange={(open) => {
        if (deleting) return;
        if (!open) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t("schedulableResource.deleteTitle")}</AlertDialogTitle>
          <AlertDialogDescription>{t("schedulableResource.deleteConfirm")}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel asChild>
            <Button variant="outline" disabled={deleting}>
              {t("common.cancel")}
            </Button>
          </AlertDialogCancel>
          <Button variant="destructive" loading={deleting} disabled={deleting} onClick={onConfirm}>
            {t("common.delete")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
