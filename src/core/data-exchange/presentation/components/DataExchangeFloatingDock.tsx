"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileSpreadsheet,
  Loader2,
  X,
  Trash2,
  Ban,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Progress } from "@core/ui/progress";
import { toast } from "@core/ui/sileo-toast";
import { getCoreContainer } from "@core/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useDataExchangeJobsStore } from "../store/useDataExchangeJobsStore";
import type { DataTransferJobStatus } from "../../domain/types";

const TERMINAL_STATUSES = new Set<DataTransferJobStatus>([
  "Completed",
  "CompletedWithErrors",
  "Failed",
  "Cancelled",
]);

export function DataExchangeFloatingDock() {
  const { direction, t } = useI18n();
  const repo = getCoreContainer().dataExchangeRepository;
  const {
    jobs,
    isCollapsed,
    upsertJob,
    dismissJob,
    clearFinished,
    toggleCollapsed,
  } = useDataExchangeJobsStore();

  const [cancellingJobIds, setCancellingJobIds] = useState<Record<string, boolean>>({});
  const notifiedJobIds = useRef<Set<string>>(new Set());

  // Polling active jobs (Queued or Running)
  useEffect(() => {
    const activeJobs = jobs.filter((j) => !TERMINAL_STATUSES.has(j.status));
    if (activeJobs.length === 0) return;

    const interval = setInterval(async () => {
      for (const job of activeJobs) {
        try {
          const latest = await repo.getJob(job.id);
          upsertJob(latest);

          // Handle single-fire notification upon terminal state
          if (TERMINAL_STATUSES.has(latest.status) && !notifiedJobIds.current.has(latest.id)) {
            notifiedJobIds.current.add(latest.id);
            if (latest.status === "Completed") {
              if (latest.kind === "Export") {
                toast.success(t("dataExchange.dock.toastExportReady", { entity: latest.entityKey }));
              } else {
                toast.success(
                  t("dataExchange.dock.toastImportCompleted", {
                    entity: latest.entityKey,
                    count: latest.committedRows,
                  })
                );
              }
            } else if (latest.status === "CompletedWithErrors") {
              toast.warning(
                t("dataExchange.dock.toastImportPartial", {
                  entity: latest.entityKey,
                  committed: latest.committedRows,
                  rejected: latest.rejectedRows,
                })
              );
            } else if (latest.status === "Failed") {
              toast.error(t("dataExchange.dock.toastJobFailed", { entity: latest.entityKey }));
            } else if (latest.status === "Cancelled") {
              toast.info(t("dataExchange.dock.toastJobCancelled", { entity: latest.entityKey }));
            }
          }
        } catch {
          // Keep polling next turn
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobs, repo, t, upsertJob]);

  const handleCancelJob = useCallback(
    async (jobId: string) => {
      const targetEntity = jobs.find((j) => j.id === jobId)?.entityKey ?? jobId;
      setCancellingJobIds((prev) => ({ ...prev, [jobId]: true }));
      try {
        const updated = await repo.cancelJob(jobId);
        upsertJob(updated);
        toast.info(t("dataExchange.dock.toastJobCancelled", { entity: updated.entityKey || targetEntity }));
      } catch {
        toast.error(t("dataExchange.dock.toastJobFailed", { entity: targetEntity }));
      } finally {
        setCancellingJobIds((prev) => ({ ...prev, [jobId]: false }));
      }
    },
    [jobs, repo, t, upsertJob]
  );

  const handleDownload = useCallback(
    async (jobId: string, kind: "export" | "rejected") => {
      const targetEntity = jobs.find((j) => j.id === jobId)?.entityKey ?? jobId;
      try {
        await repo.downloadArtifactFile(jobId, kind);
      } catch {
        toast.error(t("dataExchange.dock.toastJobFailed", { entity: targetEntity }));
      }
    },
    [jobs, repo, t]
  );

  if (jobs.length === 0) {
    return null;
  }

  const activeCount = jobs.filter((j) => !TERMINAL_STATUSES.has(j.status)).length;

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
    <aside
      aria-label={t("dataExchange.dock.title")}
      dir={direction}
      className="fixed bottom-4 end-4 z-40 w-96 max-w-[calc(100vw-2rem)] select-none"
    >
      <Card className="border border-nx-line bg-nx-surface text-nx-ink shadow-nx-dropdown transition-all">
        {/* Dock Header */}
        <CardHeader className="flex flex-row items-center justify-between p-3 border-b border-nx-line">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="h-4 w-4 text-nx-accent" />
            <CardTitle className="text-xs font-semibold text-nx-ink">
              {t("dataExchange.dock.title")}
            </CardTitle>
            {activeCount > 0 && (
              <Badge variant="info" className="text-[10px] px-1.5 py-0 h-4">
                {t("dataExchange.dock.activeCount", { count: activeCount })}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1">
            {jobs.some((j) => TERMINAL_STATUSES.has(j.status)) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 px-1.5 text-[11px] text-nx-ink-2 hover:text-nx-ink"
                onClick={clearFinished}
                title={t("dataExchange.dock.clearCompleted")}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-nx-ink-2 hover:text-nx-ink"
              onClick={toggleCollapsed}
              title={isCollapsed ? t("dataExchange.dock.expand") : t("dataExchange.dock.collapse")}
            >
              {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        {/* Dock Body */}
        {!isCollapsed && (
          <CardContent className="p-3 max-h-80 overflow-y-auto space-y-3 no-scrollbar">
            {jobs.map((job) => {
              const isActive = !TERMINAL_STATUSES.has(job.status);
              const progress =
                job.progressPercent ??
                (job.totalRows > 0 ? Math.round((job.processedRows / job.totalRows) * 100) : 0);
              const isCancelling = cancellingJobIds[job.id] || false;

              return (
                <div
                  key={job.id}
                  className="rounded-nx-md border border-nx-line bg-nx-raised p-2.5 space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-nx-ink">
                        {job.originalFileName || job.entityKey}
                      </p>
                      <p className="text-[11px] text-nx-ink-3">
                        {t(`dataExchange.hub.kinds.${job.kind}`, { defaultValue: job.kind })} • {job.entityKey}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {renderStatusBadge(job.status)}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-nx-ink-3 hover:text-nx-ink"
                        onClick={() => dismissJob(job.id)}
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
                        onClick={() => handleCancelJob(job.id)}
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
                            onClick={() => handleDownload(job.id, "export")}
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
                            onClick={() => handleDownload(job.id, "rejected")}
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
            })}
          </CardContent>
        )}
      </Card>
    </aside>
  );
}
