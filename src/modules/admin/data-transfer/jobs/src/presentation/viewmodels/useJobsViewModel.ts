"use client";

import { useCallback, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@core/ui/sileo-toast";
import { useI18n } from "@core/providers/i18n-provider";
import { useAdminContext } from "@core/hooks/useAdminContext";
import { isTenantRequiredError } from "@core/data-exchange";
import { getDataTransferContainer } from "../../../../di";
import type {
  DataTransferArtifactKind,
  DataTransferJob,
} from "../../domain/entities/DataTransferJob";
import { useJobsEntityCatalog } from "../hooks/useJobsEntityCatalog";
import { triggerJobArtifactDownload } from "../utils/download-job-artifact";
import type {
  JobsPaginationState,
  UseJobsViewModelReturn,
} from "../types/jobs-viewmodel.types";

/** Re-exported jobs ViewModel state and pagination types. */
export type { JobsPaginationState, UseJobsViewModelReturn };

/** Presentation ViewModel hook managing data transfer background jobs. */
export function useJobsViewModel(): UseJobsViewModelReturn {
  const { t } = useI18n();
  const { activeTenantId } = useAdminContext();
  const queryClient = useQueryClient();
  const repo = getDataTransferContainer().jobsRepository;
  const catalog = useJobsEntityCatalog();

  const [page, setPageState] = useState<number>(1);
  const [pageSize, setPageSizeState] = useState<number>(20);
  const [search, setSearchState] = useState<string>("");
  const [statusFilter, setStatusFilterState] = useState<string>("all");
  const [kindFilter, setKindFilterState] = useState<string>("all");
  const [isStudioPickerOpen, setIsStudioPickerOpen] = useState<boolean>(false);
  const [activeStudioEntityKey, setActiveStudioEntityKey] = useState<string | null>(null);
  const [jobToCancel, setJobToCancel] = useState<DataTransferJob | null>(null);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const setPage = useCallback((nextPage: number) => {
    const valid = Number.isFinite(nextPage) && nextPage >= 1 ? Math.floor(nextPage) : 1;
    setPageState(valid);
  }, []);

  const setSearch = useCallback((val: string) => {
    setSearchState(val);
    setPageState(1);
  }, []);

  const setStatusFilter = useCallback((val: string) => {
    setStatusFilterState(val);
    setPageState(1);
  }, []);

  const setKindFilter = useCallback((val: string) => {
    setKindFilterState(val);
    setPageState(1);
  }, []);

  const resetFilters = useCallback(() => {
    setSearchState("");
    setStatusFilterState("all");
    setKindFilterState("all");
    setPageState(1);
  }, []);

  const setPageSize = useCallback((nextSize: number) => {
    const valid = Number.isFinite(nextSize) && nextSize > 0 ? Math.floor(nextSize) : 20;
    setPageSizeState(valid);
    setPageState(1);
  }, []);

  const openStudioPicker = useCallback(() => {
    setIsStudioPickerOpen(true);
  }, []);

  const launchStudioForEntity = useCallback((entityKey: string) => {
    if (!entityKey) return;
    setIsStudioPickerOpen(false);
    setActiveStudioEntityKey(entityKey);
  }, []);

  const setIsStudioOpen = useCallback((open: boolean) => {
    if (!open) {
      setActiveStudioEntityKey(null);
    } else {
      setIsStudioPickerOpen(true);
    }
  }, []);

  const queryKey = [
    "data-transfer",
    "jobs",
    activeTenantId ?? "no-tenant",
    {
      page: kindFilter === "all" ? page : "client-slice",
      pageSize: kindFilter === "all" ? pageSize : 100,
      status: statusFilter,
      kind: kindFilter,
      search,
    },
  ];

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey,
    enabled: Boolean(activeTenantId),
    queryFn: async ({ signal }) => {
      const status = statusFilter !== "all" ? statusFilter : undefined;
      const trimmedSearch = search.trim() ? search.trim() : undefined;
      if (kindFilter === "all") {
        return repo.getJobs(
          {
            page,
            pageSize,
            status,
            search: trimmedSearch,
          },
          signal
        );
      }

      const firstPage = await repo.getJobs(
        { page: 1, pageSize: 100, status, search: trimmedSearch },
        signal
      );
      const collected = [...(firstPage.items ?? [])];
      const computedTotalPages =
        typeof firstPage.totalPages === "number" && firstPage.totalPages > 0
          ? firstPage.totalPages
          : Math.ceil((firstPage.totalCount ?? collected.length) / 100);
      const maxPages = Math.min(Math.max(1, computedTotalPages), 5);
      for (let p = 2; p <= maxPages; p++) {
        if (signal?.aborted) break;
        const nextPage = await repo.getJobs(
          { page: p, pageSize: 100, status, search: trimmedSearch },
          signal
        );
        collected.push(...(nextPage.items ?? []));
      }
      return {
        ...firstPage,
        items: collected,
        totalCount: collected.length,
        pageNumber: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };
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

  const safePageSize = Math.max(1, Number.isFinite(pageSize) ? Math.floor(pageSize) : 20);
  const rawTotal = data?.totalCount;
  const totalCount =
    kindFilter !== "all"
      ? filteredJobs.length
      : typeof rawTotal === "number" && Number.isFinite(rawTotal) && rawTotal >= 0
        ? Math.floor(rawTotal)
        : rawJobs.length;
  const pagesCount = Math.max(1, Math.ceil(totalCount / safePageSize));
  const safePage = Math.min(Math.max(1, Number.isFinite(page) ? Math.floor(page) : 1), pagesCount);
  const pagedJobs =
    kindFilter !== "all"
      ? filteredJobs.slice((safePage - 1) * safePageSize, safePage * safePageSize)
      : rawJobs;

  const isTenantRequired = !activeTenantId || isTenantRequiredError(error);

  const cancelMutation = useMutation({
    mutationFn: async (job: DataTransferJob) => {
      return repo.cancelJob(job.jobId);
    },
    onSuccess: (_data, job) => {
      const localizedEntity = catalog.resolveEntityName(job.entityKey);
      toast.success({
        id: `dx-job-${job.jobId}`,
        title: localizedEntity || t("adminDataTransferJobs.title"),
        description: t("adminDataTransferJobs.cancelDialog.success", {
          defaultValue: "Cancellation requested successfully.",
        }),
      });
      setIsCancelDialogOpen(false);
      setJobToCancel((current) => (current?.jobId === job.jobId ? null : current));
      void queryClient.invalidateQueries({ queryKey: ["data-transfer", "jobs"] });
    },
    onError: (_err, job) => {
      const localizedEntity = catalog.resolveEntityName(job.entityKey);
      toast.error({
        id: `dx-job-${job.jobId}`,
        title: localizedEntity || t("adminDataTransferJobs.title"),
        description: t("adminDataTransferJobs.cancelDialog.error", {
          defaultValue: "Failed to cancel job.",
        }),
      });
    },
  });

  const { mutateAsync: cancelMutateAsync, isPending: isCancelling } = cancelMutation;

  const promptCancelJob = useCallback((job: DataTransferJob) => {
    setJobToCancel(job);
    setIsCancelDialogOpen(true);
  }, []);

  const closeCancelDialog = useCallback(() => {
    if (!isCancelling) {
      setIsCancelDialogOpen(false);
      setJobToCancel(null);
    }
  }, [isCancelling]);

  const confirmCancelJob = useCallback(async () => {
    if (!jobToCancel) return;
    await cancelMutateAsync(jobToCancel);
  }, [jobToCancel, cancelMutateAsync]);

  const downloadArtifact = useCallback(
    async (job: DataTransferJob, kind: DataTransferArtifactKind) => {
      const localizedEntity = catalog.resolveEntityName(job.entityKey);
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
        triggerJobArtifactDownload(blob, job, kind);
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
    [repo, t, catalog]
  );

  let active = 0;
  let completed = 0;
  let failed = 0;
  const kpiSource = kindFilter !== "all" ? filteredJobs : rawJobs;
  for (const j of kpiSource) {
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

  const hasActiveFilters =
    Boolean(search.trim()) || statusFilter !== "all" || kindFilter !== "all";

  return {
    jobs: pagedJobs,
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
      currentPage: safePage,
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
    hasActiveFilters,
    resetFilters,
    refetch,
    importableEntities: catalog.importableEntities,
    isCatalogLoading: catalog.isCatalogLoading,
    isStudioPickerOpen,
    setIsStudioPickerOpen,
    activeStudioEntityKey,
    setActiveStudioEntityKey,
    openStudioPicker,
    launchStudioForEntity,
    getCatalogEntry: catalog.getCatalogEntry,
    resolveEntityName: catalog.resolveEntityName,
    isStudioOpen: Boolean(activeStudioEntityKey),
    setIsStudioOpen,
    jobToCancel,
    isCancelDialogOpen,
    isCancelling,
    promptCancelJob,
    closeCancelDialog,
    confirmCancelJob,
    downloadArtifact,
    isDownloading,
    kpis,
  };
}
