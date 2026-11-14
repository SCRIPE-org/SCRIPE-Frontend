"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCoreContainer } from "@core/di";
import { toast } from "@core/ui/sileo-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useDataExchangeJobsStore } from "../store/useDataExchangeJobsStore";
import { getEntityDisplayName } from "../utils/entity-display-names";
import type { DataTransferJobDto, DataTransferJobStatus } from "../../domain/types";

const TERMINAL_STATUSES = new Set<DataTransferJobStatus>([
  "Completed",
  "CompletedWithErrors",
  "Failed",
  "Cancelled",
]);

export interface UseDataExchangeFloatingDockReturn {
  direction: "ltr" | "rtl";
  jobs: DataTransferJobDto[];
  isVisible: boolean;
  isCollapsed: boolean;
  activeCount: number;
  hasFinishedJobs: boolean;
  cancellingJobIds: Record<string, boolean>;
  toggleCollapsed: () => void;
  clearFinished: () => void;
  dismissJob: (jobId: string) => void;
  handleCancelJob: (jobId: string) => Promise<void>;
  handleDownload: (jobId: string, kind: "export" | "rejected") => Promise<void>;
}

/**
 * Presentation ViewModel hook governing the Data Exchange floating job dock:
 * active-job polling, Sileo toast transitions, artifact downloads, and cancellation.
 */
export function useDataExchangeFloatingDockViewModel(): UseDataExchangeFloatingDockReturn {
  const { direction, language, t } = useI18n();
  const isAr = language === "ar";
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

  useEffect(() => {
    const activeJobs = jobs.filter((j) => !TERMINAL_STATUSES.has(j.status));
    if (activeJobs.length === 0) return;

    const repo = getCoreContainer().dataExchangeRepository;
    const interval = setInterval(async () => {
      for (const job of activeJobs) {
        try {
          const latest = await repo.getJob(job.id);
          upsertJob(latest);

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
  }, [jobs, t, isAr, upsertJob]);

  const handleCancelJob = useCallback(
    async (jobId: string) => {
      const targetEntity = jobs.find((j) => j.id === jobId)?.entityKey ?? jobId;
      const entityLabel = getEntityDisplayName(targetEntity, t, isAr);
      setCancellingJobIds((prev) => ({ ...prev, [jobId]: true }));
      try {
        const updated = await getCoreContainer().dataExchangeRepository.cancelJob(jobId);
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
    [jobs, t, isAr, upsertJob]
  );

  const handleDownload = useCallback(
    async (jobId: string, kind: "export" | "rejected") => {
      const targetEntity = jobs.find((j) => j.id === jobId)?.entityKey ?? jobId;
      const entityLabel = getEntityDisplayName(targetEntity, t, isAr);
      try {
        await getCoreContainer().dataExchangeRepository.downloadArtifactFile(jobId, kind);
      } catch {
        toast.error({
          id: "dx-job-" + jobId,
          title: t("dataExchange.dock.toastTitleJobFailed"),
          description: t("dataExchange.dock.toastJobFailed", { entity: entityLabel }),
        });
      }
    },
    [jobs, t, isAr]
  );

  const activeCount = jobs.filter((j) => !TERMINAL_STATUSES.has(j.status)).length;
  const hasFinishedJobs = jobs.some((j) => TERMINAL_STATUSES.has(j.status));

  return {
    direction,
    jobs,
    isVisible: jobs.length > 0,
    isCollapsed,
    activeCount,
    hasFinishedJobs,
    cancellingJobIds,
    toggleCollapsed,
    clearFinished,
    dismissJob,
    handleCancelJob,
    handleDownload,
  };
}
