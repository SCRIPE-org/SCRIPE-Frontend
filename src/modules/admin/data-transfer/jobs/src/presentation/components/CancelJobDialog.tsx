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
import type { DataTransferJob } from "../../domain/entities/DataTransferJob";

/**
 * Props for CancelJobDialog component.
 */
export interface CancelJobDialogProps {
  open: boolean;
  job: DataTransferJob | null;
  isCancelling: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

/**
 * Confirmation dialog for cancelling an active data transfer job.
 */
export function CancelJobDialog({
  open,
  job,
  isCancelling,
  onClose,
  onConfirm,
}: CancelJobDialogProps): React.ReactElement {
  const { t } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("adminDataTransferJobs.cancelDialog.title")}</DialogTitle>
          <DialogDescription>
            {t("adminDataTransferJobs.cancelDialog.description", {
              jobId: job?.jobId.slice(0, 8) ?? "",
            })}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isCancelling}>
            {t("common.cancel", { defaultValue: "Cancel" })}
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isCancelling}
          >
            {isCancelling ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin ltr:mr-1.5 rtl:ml-1.5" />
                {t("adminDataTransferJobs.cancelDialog.cancelling")}
              </>
            ) : (
              t("adminDataTransferJobs.cancelDialog.confirm")
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
