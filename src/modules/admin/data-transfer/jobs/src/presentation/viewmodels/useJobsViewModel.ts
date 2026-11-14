"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@core/ui/sileo-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { getEntityDisplayName, isTenantRequiredError } from "@core/data-exchange";
import type { DataExchangeArtifactKind } from "@core/data-exchange/domain/types";
import { getDataTransferContainer } from "../../../../di";
import type { DataTransferJob } from "../../domain/entities/DataTransferJob";

/**
 * Return type of the jobs sub-module viewmodel hook.
 */
export interface UseJobsViewModelReturn {
  jobs: DataTransferJob[];
  totalCount: number;
  pagesCount: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  isTenantRequired: boolean;
  page: number;
  pageNumber: number;
  pageSize: number;
  search: string;
  statusFilter: string;
  kindFilter: string;
  setPage: (page: number) => void;
  setPageNumber: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  pagination: {
    page: number;
    pageNumber: number;
    pageSize: number;
    itemsCount: number;
    totalCount: number;
    pagesCount: number;
    totalPages: number;
  };
  setSearch: (search: string) => void;
  setStatusFilter: (status: string) => void;
  setKindFilter: (kind: string) => void;
  refetch: () => Promise<unknown>;
  // Studio CTA
  isStudioOpen: boolean;
  setIsStudioOpen: (open: boolean) => void;
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
  const { t, language } = useI18n();
  const isAr = language === "ar";
  const tenantCode = useAppStore((s) => s.tenantCode);
  const queryClient = useQueryClient();
  const repo = getDataTransferContainer().jobsRepository;

  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(20);
  const [search, setSearchState] = useState<string>("");
  const [statusFilter, setStatusFilterState] = useState<string>("all");
  const [kindFilter, setKindFilter] = useState<string>("all");
  const [isStudioOpen, setIsStudioOpen] = useState<boolean>(false);
  const [jobToCancel, setJobToCancel] = useState<DataTransferJob | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const setSearch = useCallback((val: string) => {
    setSearchState(val);
    setPage(1);
  }, []);

  const setStatusFilter = useCallback((val: string) => {
    setStatusFilterState(val);
    setPage(1);
  }, []);

  const setPageSize = useCallback((nextSize: number) => {
    const valid = Number.isFinite(nextSize) && nextSize > 0 ? Math.floor(nextSize) : 20;
    setPageSizeState(valid);
    setPage(1);
  }, []);

  const queryKey = [
    "data-transfer",
    "jobs",
    tenantCode ?? "platform",
    { page, pageSize, status: statusFilter, kind: kindFilter, search },
  ];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      return repo.getJobs(
        {
          page,
          pageSize,
          status: statusFilter !== "all" ? statusFilter : undefined,
          search: search.trim() ? search.trim() : undefined,
        },
        signal
      );
    },
    retry: (failureCount, err) => !isTenantRequiredError(err) && failureCount < 2,
    refetchInterval: (q) => {
      const items: DataTransferJob[] = q.state.data?.items ?? [];
      const hasActive = items.some((j: DataTransferJob) => j.isActive);
      return hasActive ? 2000 : false;
    },
  });

  const rawJobs = data?.items ?? [];
  const filteredJobs =
    kindFilter !== "all" ? rawJobs.filter((j: DataTransferJob) => j.kind === kindFilter) : rawJobs;

  const safePageSize = Math.max(1, Number.isFinite(pageSize) ? pageSize : 20);
  const rawTotal = data?.totalCount;
  const totalCount =
    typeof rawTotal === "number" && Number.isFinite(rawTotal) && rawTotal >= 0
      ? rawTotal
      : filteredJobs.length;
  const pagesCount = Math.max(1, Math.ceil(totalCount / safePageSize));
  const safePage = Math.min(Math.max(1, Number.isFinite(page) ? page : 1), pagesCount);

  const isTenantRequired = isTenantRequiredError(error);

  const cancelMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return repo.cancelJob(jobId);
    },
    onSuccess: () => {
      const localizedEntity = jobToCancel ? getEntityDisplayName(jobToCancel.entityKey, t, isAr) : "";
      toast.success({
        id: jobToCancel ? `dx-job-${jobToCancel.jobId}` : undefined,
        title: localizedEntity || t("adminDataTransferJobs.title"),
        description: t("adminDataTransferJobs.cancelDialog.success", {
          defaultValue: "Cancellation requested successfully.",
        }),
      });
      setIsCancelDialogOpen(false);
      setJobToCancel(null);
      void queryClient.invalidateQueries({ queryKey: ["data-transfer", "jobs"] });
    },
    onError: () => {
      const localizedEntity = jobToCancel ? getEntityDisplayName(jobToCancel.entityKey, t, isAr) : "";
      toast.error({
        id: jobToCancel ? `dx-job-${jobToCancel.jobId}` : undefined,
        title: localizedEntity || t("adminDataTransferJobs.title"),
        description: t("adminDataTransferJobs.cancelDialog.error", {
          defaultValue: "Failed to cancel job.",
        }),
      });
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
      const localizedEntity = getEntityDisplayName(job.entityKey, t, isAr);
      try {
        setIsDownloading(true);
        toast.info({
          id: `dx-job-${job.jobId}`,
          title: localizedEntity,
          description: t("adminDataTransferJobs.download.starting", {
            defaultValue: "Preparing download...",
          }),
        });
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
        toast.success({
          id: `dx-job-${job.jobId}`,
          title: localizedEntity,
          description: t("adminDataTransferJobs.download.success", {
            defaultValue: "Artifact downloaded successfully.",
          }),
        });
      } catch {
        toast.error({
          id: `dx-job-${job.jobId}`,
          title: localizedEntity,
          description: t("adminDataTransferJobs.download.failed", {
            defaultValue: "Failed to download artifact workbook.",
          }),
        });
      } finally {
        setIsDownloading(false);
      }
    },
    [repo, t, isAr]
  );

  let active = 0;
  let completed = 0;
  let failed = 0;
  for (const j of rawJobs) {
    if (j.isActive) active++;
    else if (j.status === "Completed") completed++;
    else if (j.status === "Failed" || j.status === "Cancelled") failed++;
  }
  const kpis = {
    totalJobs: totalCount,
    activeJobs: active,
    completedJobs: completed,
    failedJobs: failed,
  };

  return {
    jobs: filteredJobs,
    totalCount,
    pagesCount,
    totalPages: pagesCount,
    isLoading,
    isError,
    error,
    isTenantRequired,
    page: safePage,
    pageNumber: safePage,
    pageSize: safePageSize,
    search,
    statusFilter,
    kindFilter,
    setPage,
    setPageNumber: setPage,
    setPageSize,
    pagination: {
      page: safePage,
      pageNumber: safePage,
      pageSize: safePageSize,
      itemsCount: totalCount,
      totalCount,
      pagesCount,
      totalPages: pagesCount,
    },
    setSearch,
    setStatusFilter,
    setKindFilter,
    refetch,
    isStudioOpen,
    setIsStudioOpen,
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
