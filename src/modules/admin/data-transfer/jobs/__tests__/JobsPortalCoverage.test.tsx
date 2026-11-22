import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { DataTransferJob } from "../src/domain/entities/DataTransferJob";
import { setDataTransferContainer } from "../../di";

const { mockToastSuccess, mockToastError } = vi.hoisted(() => ({
  mockToastSuccess: vi.fn(),
  mockToastError: vi.fn(),
}));

const mockStoreState: {
  tenantCode: string | null;
  currentTenant: { id: string } | null;
  user: { id: string; tenantId: string | null } | null;
} = {
  tenantCode: "ahly-sc",
  currentTenant: { id: "ahly-sc" },
  user: { id: "u-1", tenantId: "ahly-sc" },
};

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    settings: { pageSize: 10 },
    updateSettings: vi.fn(),
  }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: (selector?: (s: typeof mockStoreState) => unknown) =>
    selector ? selector(mockStoreState) : mockStoreState,
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    toast: {
      success: mockToastSuccess,
      error: mockToastError,
    },
    success: mockToastSuccess,
    error: mockToastError,
  }),
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
  },
}));

vi.mock("@core/ui/sileo-toast", () => ({
  toast: {
    success: mockToastSuccess,
    error: mockToastError,
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@core/hooks/use-module-locales", () => ({
  useModuleLocales: vi.fn(),
}));

import { useJobsViewModel } from "../src/presentation/viewmodels/useJobsViewModel";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

function makeJob(idx: number, kind: "Import" | "Export", status: "Running" | "Completed" = "Completed") {
  return new DataTransferJob({
    jobId: `00000000-0000-4000-8000-${String(idx).padStart(12, "0")}`,
    kind,
    entityKey: "crm.lead",
    status,
    totalRows: 10,
    processedRows: 10,
    progressPercent: 100,
    validRows: 10,
    committedRows: 10,
    createdRows: 10,
    updatedRows: 0,
    rejectedRows: 0,
    hasRejectedWorkbook: false,
    hasExportWorkbook: kind === "Export",
    createdAt: "2026-11-10T10:00:00.000Z",
    expiresAtUtc: "2026-11-17T10:00:00.000Z",
  });
}

describe("useJobsViewModel Wave 2 Portal coverage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockStoreState.tenantCode = "ahly-sc";
    mockStoreState.currentTenant = { id: "ahly-sc" };
    mockStoreState.user = { id: "u-1", tenantId: "ahly-sc" };
  });

  afterEach(() => {
    setDataTransferContainer(null);
  });

  it("sets isTenantRequired=true when Platform SuperAdmin has no active tenant context", () => {
    mockStoreState.tenantCode = null;
    mockStoreState.currentTenant = null;
    mockStoreState.user = { id: "sa-1", tenantId: null };

    const getJobs = vi.fn();
    setDataTransferContainer({
      entitiesRepository: {
        getAll: vi.fn().mockResolvedValue([]),
        getDescriptor: vi.fn(),
        downloadTemplate: vi.fn(),
      },
      jobsRepository: {
        getJobs,
        getJobById: vi.fn(),
        cancelJob: vi.fn(),
        downloadArtifact: vi.fn(),
      },
      presetsRepository: {} as never,
    });

    const { result } = renderHook(() => useJobsViewModel(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isTenantRequired).toBe(true);
    expect(getJobs).not.toHaveBeenCalled();
  });

  it("fetches multi-page jobs and computes accurate filtered totalCount, pagesCount, and KPIs when kindFilter is active", async () => {
    const page1 = Array.from({ length: 100 }, (_, i) =>
      makeJob(i + 1, i % 2 === 0 ? "Import" : "Export")
    );
    const page2 = Array.from({ length: 10 }, (_, i) =>
      makeJob(101 + i, "Import")
    );

    const getJobs = vi.fn(async ({ page: reqPage }: { page?: number }) => {
      if (reqPage === 2) {
        return {
          items: page2,
          totalCount: 110,
          pageNumber: 2,
          pageSize: 100,
          totalPages: 2,
          hasNextPage: false,
          hasPreviousPage: true,
        };
      }
      return {
        items: page1,
        totalCount: 110,
        pageNumber: 1,
        pageSize: 100,
        totalPages: 2,
        hasNextPage: true,
        hasPreviousPage: false,
      };
    });

    setDataTransferContainer({
      entitiesRepository: {
        getAll: vi.fn().mockResolvedValue([]),
        getDescriptor: vi.fn(),
        downloadTemplate: vi.fn(),
      },
      jobsRepository: {
        getJobs,
        getJobById: vi.fn(),
        cancelJob: vi.fn(),
        downloadArtifact: vi.fn(),
      },
      presetsRepository: {} as never,
    });

    const { result } = renderHook(() => useJobsViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => {
      result.current.setKindFilter("Import");
    });

    await waitFor(() => expect(result.current.totalCount).toBe(60));
    expect(getJobs).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 100 }),
      expect.anything()
    );
    expect(getJobs).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 100 }),
      expect.anything()
    );
    expect(result.current.jobs).toHaveLength(20);
    expect(result.current.pagesCount).toBe(3);
    expect(result.current.kpis.totalJobs).toBe(60);

    act(() => {
      result.current.setPage(3);
    });
    expect(result.current.jobs).toHaveLength(20);
    expect(result.current.jobs.slice(-10).map((j) => j.jobId)).toEqual(
      page2.map((j) => j.jobId)
    );
  });

  it("captures cancelled job via mutation variable even if dialog state clears before resolution", async () => {
    const runningJob = makeJob(99, "Import", "Running");
    let resolveCancel!: (value: DataTransferJob) => void;
    const cancelJob = vi.fn(
      () =>
        new Promise<DataTransferJob>((res) => {
          resolveCancel = res;
        })
    );

    setDataTransferContainer({
      entitiesRepository: {
        getAll: vi.fn().mockResolvedValue([]),
        getDescriptor: vi.fn(),
        downloadTemplate: vi.fn(),
      },
      jobsRepository: {
        getJobs: vi.fn().mockResolvedValue({
          items: [runningJob],
          totalCount: 1,
          pageNumber: 1,
          pageSize: 10,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        }),
        getJobById: vi.fn(),
        cancelJob,
        downloadArtifact: vi.fn(),
      },
      presetsRepository: {} as never,
    });

    const { result } = renderHook(() => useJobsViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.jobs).toHaveLength(1));

    act(() => {
      result.current.promptCancelJob(runningJob);
    });

    let cancelPromise!: Promise<void>;
    act(() => {
      cancelPromise = result.current.confirmCancelJob();
    });

    await waitFor(() => expect(cancelJob).toHaveBeenCalledTimes(1));

    act(() => {
      result.current.closeCancelDialog();
    });

    await act(async () => {
      resolveCancel(makeJob(99, "Import", "Completed"));
      await cancelPromise;
    });

    expect(cancelJob).toHaveBeenCalledWith(runningJob.jobId);
    expect(mockToastSuccess).toHaveBeenCalledTimes(1);
  });
});
