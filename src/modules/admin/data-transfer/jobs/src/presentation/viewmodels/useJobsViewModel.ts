"use client";

import { useCallback, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@core/ui/sileo-toast";
import { useI18n } from "@core/providers/i18n-provider";
import type { DataExchangeArtifactKind } from "@core/data-exchange/domain/types";
import { getDataTransferContainer } from "../../../../di";
import type { DataTransferJob } from "../../domain/entities/DataTransferJob";

/**
 * Return type of the jobs sub-module viewmodel hook.
 */
export interface UseJobsViewModelReturn {
  jobs: DataTransferJob[];
  totalCount: number;
  isLoading: boolean;
  isError: boolean;
  page: number;
  pageSize: number;
  search: string;
  statusFilter: string;
  kindFilter: string;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setKindFilter: (kind: string) => void;
  refetch: () => Promise<unknown>;
  // Cancel job workflow
  jobToCancel: DataTransferJob | null;
  isCancelDialogOpen: boolean;
  isCancelling: boolean;
  promptCancelJob: (job: DataTransferJob) => void;
  closeCancelDialog: () => void;
  confirmCancelJob: () => Promise<void>;
  // Download artifact
  downloadArtifact: (job: DataTransferJob, kind: DataExchangeArtifactKind) => Promise<void>;
  isDownloading: boolean;
  // KPIs
  kpis: {
    totalJobs: number;
    activeJobs: number;
    completedJobs: number;
    failedJobs: number;
  };
}

/**
 * Presentation ViewModel hook managing data transfer background jobs.
 */
export function useJobsViewModel(): UseJobsViewModelReturn {
  const { t } = useI18n();
  const queryClient = useQueryClient();
  const repo = getDataTransferContainer().jobsRepository;

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);
  const [search, setSearch] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [jobToCancel, setJobToCancel] = useState<DataTransferJob | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const queryKey = useMemo(
    () => ["data-transfer", "jobs", { page, pageSize, status: statusFilter, kind: kindFilter }],
    [page, pageSize, statusFilter, kindFilter]
  );

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      return repo.getJobs(
        {
          page,
          pageSize,
          status: statusFilter !== "all" ? statusFilter : undefined,
        },
        signal
      );
    },
    refetchInterval: (query) => {
      const items: DataTransferJob[] = query.state.data?.items ?? [];
      const hasActive = items.some((j: DataTransferJob) => j.isActive);
      return hasActive ? 2000 : false;
    },
  });

  const rawJobs = useMemo(() => data?.items ?? [], [data]);

  const filteredJobs = useMemo(() => {
    let result = rawJobs;
    if (kindFilter !== "all") {
      result = result.filter((j: DataTransferJob) => j.kind === kindFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (j: DataTransferJob) =>
          j.jobId.toLowerCase().includes(q) ||
          j.entityKey.toLowerCase().includes(q) ||
          (j.originalFileName && j.originalFileName.toLowerCase().includes(q))
      );
    }
    return result;
  }, [rawJobs, kindFilter, search]);

  const cancelMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return repo.cancelJob(jobId);
    },
    onSuccess: () => {
      toast.success(
        t("adminDataTransferJobs.cancelDialog.success", {
          defaultValue: "Cancellation requested successfully.",
        })
      );
      setIsCancelDialogOpen(false);
      setJobToCancel(null);
      void queryClient.invalidateQueries({ queryKey: ["data-transfer", "jobs"] });
    },
    onError: () => {
      toast.error(
        t("adminDataTransferJobs.cancelDialog.error", {
          defaultValue: "Failed to cancel job.",
        })
      );
    },
  });

  const promptCancelJob = useCallback((job: DataTransferJob) => {
    setJobToCancel(job);
    setIsCancelDialogOpen(true);
  }, []);

  const closeCancelDialog = useCallback(() => {
    if (!cancelMutation.isPending) {
      setIsCancelDialogOpen(false);
      setJobToCancel(null);
    }
  }, [cancelMutation.isPending]);

  const confirmCancelJob = useCallback(async () => {
    if (!jobToCancel) return;
    await cancelMutation.mutateAsync(jobToCancel.jobId);
  }, [jobToCancel, cancelMutation]);

  const downloadArtifact = useCallback(
    async (job: DataTransferJob, kind: DataExchangeArtifactKind) => {
      try {
        setIsDownloading(true);
        toast.info(
          t("adminDataTransferJobs.download.starting", {
            defaultValue: "Preparing download...",
          })
        );
        const blob = await repo.downloadArtifact(job.jobId, kind);
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const ext = job.fileFormat?.toLowerCase() === "csv" ? "csv" : "xlsx";
        a.download = `${job.entityKey}-${job.kind.toLowerCase()}-${kind.toLowerCase()}-${job.jobId.slice(0, 8)}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success(
          t("adminDataTransferJobs.download.success", {
            defaultValue: "Artifact downloaded successfully.",
          })
        );
      } catch {
        toast.error(
          t("adminDataTransferJobs.download.failed", {
            defaultValue: "Failed to download artifact workbook.",
          })
        );
      } finally {
        setIsDownloading(false);
      }
    },
    [repo, t]
  );

  const kpis = useMemo(() => {
    const total = data?.totalCount ?? rawJobs.length;
    let active = 0;
    let completed = 0;
    let failed = 0;
    for (const j of rawJobs) {
      if (j.isActive) active++;
      else if (j.status === "Completed") completed++;
      else if (j.status === "Failed" || j.status === "Cancelled") failed++;
    }
    return {
      totalJobs: total,
      activeJobs: active,
      completedJobs: completed,
      failedJobs: failed,
    };
  }, [data, rawJobs]);

  return {
    jobs: filteredJobs,
    totalCount: data?.totalCount ?? filteredJobs.length,
    isLoading,
    isError,
    page,
    pageSize,
    search,
    statusFilter,
    kindFilter,
    setPage,
    setPageSize,
    setSearch,
    setStatusFilter,
    setKindFilter,
    refetch,
    jobToCancel,
    isCancelDialogOpen,
    isCancelling: cancelMutation.isPending,
    promptCancelJob,
    closeCancelDialog,
    confirmCancelJob,
    downloadArtifact,
    isDownloading,
    kpis,
  };
}
