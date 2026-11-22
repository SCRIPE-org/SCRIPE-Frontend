"use client";

import { useCallback, useContext, useEffect, useRef, useState } from "react";
import { QueryClientContext } from "@tanstack/react-query";
import { getCoreContainer } from "@core/di";
import { toast } from "@core/ui/sileo-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useDataExchangeJobsStore } from "../store/useDataExchangeJobsStore";
import { getEntityDisplayName } from "../utils/entity-display-names";
import { invalidateDataExchangeCompletionQueries } from "../utils/invalidate-queries";
import {
  extractErrorStatus,
  getStudioErrorMessage,
  isAbortOrInterceptedError,
} from "./studio/studio-viewmodel.helpers";
import type { DataTransferJobDto, DataTransferJobStatus } from "../../domain/types";

const TERMINAL_STATUSES = new Set<DataTransferJobStatus>([
  "Completed",
  "CompletedWithErrors",
  "Failed",
  "Cancelled",
]);

const FATAL_POLL_STATUSES = new Set([401, 403, 404, 422]);
const MAX_TRANSIENT_POLL_ERRORS = 5;

function buildSuggestedArtifactName(
  job: DataTransferJobDto | undefined,
  jobId: string,
  kind: "export" | "rejected"
): string | undefined {
  if (!job) return undefined;
  const safeEntity = (job.entityKey || "data-exchange").replace(/[^a-zA-Z0-9._-]+/g, "_");
  if (kind === "rejected") {
    return `${safeEntity}-rejected-${jobId.slice(0, 8)}.xlsx`;
  }
  const fmt = (job.fileFormat || "xlsx").toLowerCase();
  const ext = fmt === "csv" || fmt === "tsv" || fmt === "xlsx" ? fmt : "xlsx";
  return `${safeEntity}-export-${jobId.slice(0, 8)}.${ext}`;
}

export interface UseDataExchangeFloatingDockReturn {
  direction: "ltr" | "rtl";
  jobs: DataTransferJobDto[];
  isVisible: boolean;
  isCollapsed: boolean;
  activeCount: number;
  hasFinishedJobs: boolean;
  cancellingJobIds: Record<string, boolean>;
  downloadingJobIds: Record<string, "export" | "rejected" | null>;
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
  const queryClient = useContext(QueryClientContext) ?? null;
  const {
    jobs,
    isCollapsed,
    upsertJob,
    dismissJob,
    clearFinished,
    toggleCollapsed,
  } = useDataExchangeJobsStore();

  const [cancellingJobIds, setCancellingJobIds] = useState<Record<string, boolean>>({});
  const [downloadingJobIds, setDownloadingJobIds] = useState<
    Record<string, "export" | "rejected" | null>
  >({});
  const [stoppedPollIds, setStoppedPollIds] = useState<string[]>([]);

  const notifiedJobIds = useRef<Set<string>>(new Set());
  const errorCountsRef = useRef<Record<string, number>>({});
  const tRef = useRef(t);
  const isArRef = useRef(isAr);
  const upsertJobRef = useRef(upsertJob);
  useEffect(() => {
    tRef.current = t;
    isArRef.current = isAr;
    upsertJobRef.current = upsertJob;
  }, [t, isAr, upsertJob]);

  const activeJobsToPoll = jobs.filter(
    (j) => !TERMINAL_STATUSES.has(j.status) && !stoppedPollIds.includes(j.id)
  );
  const activeJobIdsKey = activeJobsToPoll.map((j) => j.id).sort().join(",");

  useEffect(() => {
    if (!activeJobIdsKey) return;

    const jobIds = activeJobIdsKey.split(",").filter(Boolean);
    const repo = getCoreContainer().dataExchangeRepository;
    const controller = new AbortController();
    let cancelled = false;
    let inFlight = false;

    const pollOnce = async () => {
      if (cancelled || inFlight) return;
      inFlight = true;
      try {
        for (const jobId of jobIds) {
          if (cancelled) break;
          try {
            const latest = await repo.getJob(jobId, controller.signal);
            if (cancelled) break;

            errorCountsRef.current[jobId] = 0;
            upsertJobRef.current(latest);

            if (TERMINAL_STATUSES.has(latest.status)) {
              invalidateDataExchangeCompletionQueries(
                queryClient,
                latest.entityKey,
                latest.isMultiSheet
              );
            }

            if (TERMINAL_STATUSES.has(latest.status) && !notifiedJobIds.current.has(latest.id)) {
              notifiedJobIds.current.add(latest.id);
              const translate = tRef.current;
              const entityLabel = getEntityDisplayName(
                latest.entityKey,
                translate,
                isArRef.current
              );
              const toastId = "dx-job-" + latest.id;

              if (latest.status === "Completed") {
                if (latest.kind === "Export") {
                  toast.success({
                    id: toastId,
                    title: translate("dataExchange.dock.toastTitleExportReady"),
                    description: translate("dataExchange.dock.toastExportReady", {
                      entity: entityLabel,
                    }),
                    button: {
                      title: translate("dataExchange.actions.downloadExport"),
                      onClick: () => {
                        const suggested = buildSuggestedArtifactName(latest, latest.id, "export");
                        repo.downloadArtifactFile(latest.id, "export", suggested).catch((err) => {
                          if (!isAbortOrInterceptedError(err)) {
                            toast.error({
                              id: `${toastId}-dl-err`,
                              title: translate("dataExchange.dock.toastTitleJobFailed"),
                              description: getStudioErrorMessage(
                                err,
                                translate("dataExchange.errors.exportFailed")
                              ),
                            });
                          }
                        });
                      },
                    },
                  });
                } else {
                  toast.success({
                    id: toastId,
                    title: translate("dataExchange.dock.toastTitleImportCompleted"),
                    description: translate("dataExchange.dock.toastImportCompleted", {
                      entity: entityLabel,
                      count: latest.committedRows,
                    }),
                  });
                }
              } else if (latest.status === "CompletedWithErrors") {
                toast.warning({
                  id: toastId,
                  title: translate("dataExchange.dock.toastTitleImportPartial"),
                  description: translate("dataExchange.dock.toastImportPartial", {
                    entity: entityLabel,
                    committed: latest.committedRows,
                    rejected: latest.rejectedRows,
                  }),
                  button: latest.hasRejectedWorkbook
                    ? {
                        title: translate("dataExchange.actions.downloadRejected"),
                        onClick: () => {
                          const suggested = buildSuggestedArtifactName(
                            latest,
                            latest.id,
                            "rejected"
                          );
                          repo
                            .downloadArtifactFile(latest.id, "rejected", suggested)
                            .catch((err) => {
                              if (!isAbortOrInterceptedError(err)) {
                                toast.error({
                                  id: `${toastId}-dl-err`,
                                  title: translate("dataExchange.dock.toastTitleJobFailed"),
                                  description: getStudioErrorMessage(
                                    err,
                                    translate("dataExchange.errors.rejectedDownloadFailed")
                                  ),
                                });
                              }
                            });
                        },
                      }
                    : undefined,
                });
              } else if (latest.status === "Failed") {
                toast.error({
                  id: toastId,
                  title: translate("dataExchange.dock.toastTitleJobFailed"),
                  description: translate("dataExchange.dock.toastJobFailed", {
                    entity: entityLabel,
                  }),
                });
              } else if (latest.status === "Cancelled") {
                toast.info({
                  id: toastId,
                  title: translate("dataExchange.dock.toastTitleJobCancelled"),
                  description: translate("dataExchange.dock.toastJobCancelled", {
                    entity: entityLabel,
                  }),
                });
              }
            }
          } catch (err) {
            if (cancelled || isAbortOrInterceptedError(err)) break;
            const status = extractErrorStatus(err);
            const nextCount = (errorCountsRef.current[jobId] ?? 0) + 1;
            errorCountsRef.current[jobId] = nextCount;
            const isFatal = typeof status === "number" && FATAL_POLL_STATUSES.has(status);
            if (isFatal || nextCount >= MAX_TRANSIENT_POLL_ERRORS) {
              setStoppedPollIds((prev) => (prev.includes(jobId) ? prev : [...prev, jobId]));
            }
          }
        }
      } finally {
        inFlight = false;
      }
    };

    const interval = setInterval(() => {
      void pollOnce();
    }, 2000);

    return () => {
      cancelled = true;
      clearInterval(interval);
      controller.abort();
    };
  }, [activeJobIdsKey, queryClient]);

  const handleCancelJob = useCallback(
    async (jobId: string) => {
      const targetEntity = jobs.find((j) => j.id === jobId)?.entityKey ?? jobId;
      const entityLabel = getEntityDisplayName(targetEntity, t, isAr);
      setCancellingJobIds((prev) => ({ ...prev, [jobId]: true }));
      try {
        const updated = await getCoreContainer().dataExchangeRepository.cancelJob(jobId);
        upsertJob(updated);
        invalidateDataExchangeCompletionQueries(queryClient, updated.entityKey, updated.isMultiSheet);
        toast.info({
          id: "dx-job-" + jobId,
          title: t("dataExchange.dock.toastTitleJobCancelled"),
          description: t("dataExchange.dock.toastJobCancelled", { entity: entityLabel }),
        });
      } catch (err) {
        if (!isAbortOrInterceptedError(err)) {
          toast.error({
            id: "dx-job-" + jobId,
            title: t("dataExchange.dock.toastTitleJobFailed"),
            description: getStudioErrorMessage(err, t("dataExchange.errors.cancelFailed")),
          });
        }
      } finally {
        setCancellingJobIds((prev) => ({ ...prev, [jobId]: false }));
      }
    },
    [jobs, t, isAr, upsertJob, queryClient]
  );

  const handleDownload = useCallback(
    async (jobId: string, kind: "export" | "rejected") => {
      const job = jobs.find((j) => j.id === jobId);
      const targetEntity = job?.entityKey ?? jobId;
      const entityLabel = getEntityDisplayName(targetEntity, t, isAr);
      setDownloadingJobIds((prev) => ({ ...prev, [jobId]: kind }));
      try {
        const suggested = buildSuggestedArtifactName(job, jobId, kind);
        await getCoreContainer().dataExchangeRepository.downloadArtifactFile(jobId, kind, suggested);
      } catch (err) {
        if (!isAbortOrInterceptedError(err)) {
          toast.error({
            id: "dx-job-" + jobId,
            title: t("dataExchange.dock.toastTitleJobFailed"),
            description: getStudioErrorMessage(
              err,
              t("dataExchange.dock.toastJobFailed", { entity: entityLabel })
            ),
          });
        }
      } finally {
        setDownloadingJobIds((prev) => ({ ...prev, [jobId]: null }));
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
    downloadingJobIds,
    toggleCollapsed,
    clearFinished,
    dismissJob,
    handleCancelJob,
    handleDownload,
  };
}
