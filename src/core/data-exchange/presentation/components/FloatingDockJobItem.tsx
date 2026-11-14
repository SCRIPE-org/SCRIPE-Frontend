"use client";

import React from "react";
import {
  Ban,
  Download,
  Loader2,
  X,
} from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Progress } from "@core/ui/progress";
import { useI18n } from "@core/providers/i18n-provider";
import { getEntityDisplayName } from "../utils/entity-display-names";
import type { DataTransferJob, DataTransferJobStatus } from "../../domain/types";

export interface FloatingDockJobItemProps {
  job: DataTransferJob;
  isCancelling: boolean;
  onCancelJob: (jobId: string) => void;
  onDownload: (jobId: string, kind: "export" | "rejected") => void;
  onDismiss: (jobId: string) => void;
}

const TERMINAL_STATUSES = new Set<DataTransferJobStatus>([
  "Completed",
  "CompletedWithErrors",
  "Failed",
  "Cancelled",
]);

/**
 * Single job card inside the Data Exchange floating dock.
 */
export function FloatingDockJobItem({
  job,
  isCancelling,
  onCancelJob,
  onDownload,
  onDismiss,
}: FloatingDockJobItemProps) {
  const { language, t } = useI18n();
  const isAr = language === "ar";
  const isActive = !TERMINAL_STATUSES.has(job.status);
  const progress =
    job.progressPercent ??
    (job.totalRows > 0 ? Math.round((job.processedRows / job.totalRows) * 100) : 0);
  const entityDisplayName = getEntityDisplayName(job.entityKey, t, isAr);

  const renderStatusBadge = (status: DataTransferJobStatus) => {
    switch (status) {
      case "Queued":
        return <Badge variant="outline">{t("dataExchange.dock.statusQueued")}</Badge>;
      case "Running":
        return (
          <Badge variant="info" className="gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            {t("dataExchange.dock.statusRunning")}
          </Badge>
        );
      case "Completed":
        return <Badge variant="success">{t("dataExchange.dock.statusCompleted")}</Badge>;
      case "CompletedWithErrors":
        return <Badge variant="warning">{t("dataExchange.dock.statusCompletedWithErrors")}</Badge>;
      case "Failed":
        return <Badge variant="destructive">{t("dataExchange.dock.statusFailed")}</Badge>;
      case "Cancelled":
        return <Badge variant="secondary">{t("dataExchange.dock.statusCancelled")}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5 space-y-2 text-xs">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-nx-ink">
            {entityDisplayName}
          </p>
          <p className="text-[11px] text-nx-ink-3 font-mono truncate" dir="ltr">
            {t(`dataExchange.hub.kinds.${job.kind}`, { defaultValue: job.kind })} • {job.entityKey}
            {job.originalFileName ? ` • ${job.originalFileName}` : ""}
          </p>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {renderStatusBadge(job.status)}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-nx-ink-3 hover:text-nx-ink"
            onClick={() => onDismiss(job.id)}
            title={t("dataExchange.dock.dismiss")}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Progress for Active Jobs */}
      {isActive && (
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] text-nx-ink-2 font-mono">
            <span>
              {job.processedRows} / {job.totalRows}
            </span>
            <span>{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>
      )}

      {/* Action Bar */}
      <div className="flex items-center justify-end gap-1.5 pt-1">
        {isActive ? (
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className="h-6 px-2 text-[11px]"
            loading={isCancelling}
            onClick={() => onCancelJob(job.id)}
          >
            <Ban className="me-1 h-3 w-3" />
            {t("dataExchange.dock.cancel")}
          </Button>
        ) : (
          <>
            {job.hasExportWorkbook && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[11px]"
                onClick={() => onDownload(job.id, "export")}
              >
                <Download className="me-1 h-3 w-3 text-nx-accent" />
                {t("dataExchange.dock.downloadExport")}
              </Button>
            )}
            {job.hasRejectedWorkbook && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[11px] text-destructive hover:text-destructive"
                onClick={() => onDownload(job.id, "rejected")}
              >
                <Download className="me-1 h-3 w-3" />
                {t("dataExchange.dock.downloadRejected")}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
