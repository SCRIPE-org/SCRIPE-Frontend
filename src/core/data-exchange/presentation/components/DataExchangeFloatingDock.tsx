"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  FileSpreadsheet,
  Trash2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { toast } from "@core/ui/sileo-toast";
import { getCoreContainer } from "@core/di";
import { useI18n } from "@core/providers/i18n-provider";
import { useDataExchangeJobsStore } from "../store/useDataExchangeJobsStore";
import { getEntityDisplayName } from "../utils/entity-display-names";
import { FloatingDockJobItem } from "./FloatingDockJobItem";
import type { DataTransferJobStatus } from "../../domain/types";

const TERMINAL_STATUSES = new Set<DataTransferJobStatus>([
  "Completed",
  "CompletedWithErrors",
  "Failed",
  "Cancelled",
]);

/**
 * Floating task dock displaying real-time Data Exchange background imports,
 * exports, and multi-sheet migrations with Sileo morphing status transitions.
 */
export function DataExchangeFloatingDock() {
  const { direction, language, t } = useI18n();
  const isAr = language === "ar";
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

          // Handle single-fire notification upon terminal state using Sileo ID morphing
          if (TERMINAL_STATUSES.has(latest.status) && !notifiedJobIds.current.has(latest.id)) {
            notifiedJobIds.current.add(latest.id);
            const entityLabel = getEntityDisplayName(latest.entityKey, t, isAr);
            const toastId = "dx-job-" + latest.id;

            if (latest.status === "Completed") {
              if (latest.kind === "Export") {
                toast.success({
                  id: toastId,
                  title: t("dataExchange.dock.toastTitleExportReady"),
                  description: t("dataExchange.dock.toastExportReady", { entity: entityLabel }),
                  button: {
                    title: t("dataExchange.actions.downloadExport"),
                    onClick: () => {
                      repo.downloadArtifactFile(latest.id, "export").catch(() => {});
                    },
                  },
                });
              } else {
                toast.success({
                  id: toastId,
                  title: t("dataExchange.dock.toastTitleImportCompleted"),
                  description: t("dataExchange.dock.toastImportCompleted", {
                    entity: entityLabel,
                    count: latest.committedRows,
                  }),
                });
              }
            } else if (latest.status === "CompletedWithErrors") {
              toast.warning({
                id: toastId,
                title: t("dataExchange.dock.toastTitleImportPartial"),
                description: t("dataExchange.dock.toastImportPartial", {
                  entity: entityLabel,
                  committed: latest.committedRows,
                  rejected: latest.rejectedRows,
                }),
                button: latest.hasRejectedWorkbook
                  ? {
                      title: t("dataExchange.actions.downloadRejected"),
                      onClick: () => {
                        repo.downloadArtifactFile(latest.id, "rejected").catch(() => {});
                      },
                    }
                  : undefined,
              });
            } else if (latest.status === "Failed") {
              toast.error({
                id: toastId,
                title: t("dataExchange.dock.toastTitleJobFailed"),
                description: t("dataExchange.dock.toastJobFailed", { entity: entityLabel }),
              });
            } else if (latest.status === "Cancelled") {
              toast.info({
                id: toastId,
                title: t("dataExchange.dock.toastTitleJobCancelled"),
                description: t("dataExchange.dock.toastJobCancelled", { entity: entityLabel }),
              });
            }
          }
        } catch {
          // Keep polling next turn
        }
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [jobs, repo, t, isAr, upsertJob]);

  const handleCancelJob = useCallback(
    async (jobId: string) => {
      const targetEntity = jobs.find((j) => j.id === jobId)?.entityKey ?? jobId;
      const entityLabel = getEntityDisplayName(targetEntity, t, isAr);
      setCancellingJobIds((prev) => ({ ...prev, [jobId]: true }));
      try {
        const updated = await repo.cancelJob(jobId);
        upsertJob(updated);
        toast.info({
          id: "dx-job-" + jobId,
          title: t("dataExchange.dock.toastTitleJobCancelled"),
          description: t("dataExchange.dock.toastJobCancelled", { entity: entityLabel }),
        });
      } catch {
        toast.error({
          id: "dx-job-" + jobId,
          title: t("dataExchange.dock.toastTitleJobFailed"),
          description: t("dataExchange.dock.toastJobFailed", { entity: entityLabel }),
        });
      } finally {
        setCancellingJobIds((prev) => ({ ...prev, [jobId]: false }));
      }
    },
    [jobs, repo, t, isAr, upsertJob]
  );

  const handleDownload = useCallback(
    async (jobId: string, kind: "export" | "rejected") => {
      const targetEntity = jobs.find((j) => j.id === jobId)?.entityKey ?? jobId;
      const entityLabel = getEntityDisplayName(targetEntity, t, isAr);
      try {
        await repo.downloadArtifactFile(jobId, kind);
      } catch {
        toast.error({
          id: "dx-job-" + jobId,
          title: t("dataExchange.dock.toastTitleJobFailed"),
          description: t("dataExchange.dock.toastJobFailed", { entity: entityLabel }),
        });
      }
    },
    [jobs, repo, t, isAr]
  );

  if (jobs.length === 0) {
    return null;
  }

  const activeCount = jobs.filter((j) => !TERMINAL_STATUSES.has(j.status)).length;

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

        {/* Dock Body (No no-scrollbar, proper overscroll-contain) */}
        {!isCollapsed && (
          <CardContent className="p-3 max-h-80 overflow-y-auto overscroll-contain space-y-3">
            {jobs.map((job) => (
              <FloatingDockJobItem
                key={job.id}
                job={job}
                isCancelling={cancellingJobIds[job.id] || false}
                onCancelJob={handleCancelJob}
                onDownload={handleDownload}
                onDismiss={dismissJob}
              />
            ))}
          </CardContent>
        )}
      </Card>
    </aside>
  );
}
