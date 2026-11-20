"use client";

import React from "react";
import { ConfirmationDialog } from "@core/ui/confirmation-dialog";
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
 * Standardized on @core/ui/confirmation-dialog.
 */
export function CancelJobDialog({
  open,
  job,
  isCancelling,
  onClose,
  onConfirm,
}: CancelJobDialogProps): React.ReactElement {
  const { direction, t } = useI18n();

  return (
    <ConfirmationDialog
      open={open}
      onOpenChange={(isOpen) => (!isOpen ? onClose() : null)}
      onConfirm={onConfirm}
      onCancel={onClose}
      variant="destructive"
      isLoading={isCancelling}
      title={t("adminDataTransferJobs.cancelDialog.title")}
      description={t("adminDataTransferJobs.cancelDialog.description", {
        jobId: job?.jobId.slice(0, 8) ?? "",
      })}
      cancelText={t("common.cancel", { defaultValue: "Cancel" })}
      confirmText={
        isCancelling
          ? t("adminDataTransferJobs.cancelDialog.cancelling")
          : t("adminDataTransferJobs.cancelDialog.confirm")
      }
      dir={direction}
      className="max-w-md border border-nx-line bg-nx-surface text-nx-ink"
      data-testid="cancel-job-dialog"
      cancelButtonProps={{
        "data-testid": "cancel-job-cancel-btn",
      }}
      confirmButtonProps={{
        "data-testid": "cancel-job-confirm-btn",
      }}
    >
      {job && (
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <code
            dir="ltr"
            className="rounded-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 font-mono text-[11px] text-nx-ink"
          >
            {job.jobId.slice(0, 8)}...
          </code>
          <code
            dir="ltr"
            className="rounded-sm border border-nx-line bg-nx-raised px-1.5 py-0.5 font-mono text-[11px] text-nx-ink-2"
          >
            {job.entityKey}
          </code>
        </div>
      )}
    </ConfirmationDialog>
  );
}
