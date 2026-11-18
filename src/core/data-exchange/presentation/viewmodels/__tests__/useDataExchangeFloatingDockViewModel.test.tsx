import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { qk } from "@core/common/query-keys";
import { useDataExchangeFloatingDockViewModel } from "../useDataExchangeFloatingDockViewModel";
import type { DataTransferJobDto } from "../../../domain/types";

let mockJobs: DataTransferJobDto[] = [];
const upsertJobMock = vi.fn((updated: DataTransferJobDto) => {
  mockJobs = mockJobs.map((j) => (j.id === updated.id ? updated : j));
});
const getJobMock = vi.fn();
const cancelJobMock = vi.fn();
const downloadArtifactFileMock = vi.fn();
const toastSuccessMock = vi.fn();
const toastWarningMock = vi.fn();
const toastErrorMock = vi.fn();

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: "en",
    direction: "ltr" as const,
    t: (k: string, params?: Record<string, string | number>) =>
      params ? `${k}:${JSON.stringify(params)}` : k,
  }),
}));

vi.mock("@core/di", () => ({
  getCoreContainer: () => ({
    dataExchangeRepository: {
      getJob: getJobMock,
      cancelJob: cancelJobMock,
      downloadArtifactFile: downloadArtifactFileMock,
    },
  }),
}));

vi.mock("../../store/useDataExchangeJobsStore", () => ({
  useDataExchangeJobsStore: () => ({
    jobs: mockJobs,
    isCollapsed: false,
    upsertJob: upsertJobMock,
    dismissJob: vi.fn(),
    clearFinished: vi.fn(),
    toggleCollapsed: vi.fn(),
  }),
}));

vi.mock("@core/ui/sileo-toast", () => ({
  toast: {
    success: (...args: unknown[]) => toastSuccessMock(...args),
    warning: (...args: unknown[]) => toastWarningMock(...args),
    error: (...args: unknown[]) => toastErrorMock(...args),
    info: vi.fn(),
  },
}));

function makeJob(overrides: Partial<DataTransferJobDto> = {}): DataTransferJobDto {
  return {
    id: "12345678-aaaa-bbbb",
    kind: "Import",
    entityKey: "crm.lead",
    isMultiSheet: false,
    importMode: "Upsert",
    onboardingMode: "StagedPendingInvite",
    fileFormat: "tsv",
    originalFileName: "leads.tsv",
    status: "Running",
    totalRows: 10,
    processedRows: 5,
    progressPercent: 50,
    validRows: 10,
    committedRows: 0,
    createdRows: 0,
    updatedRows: 0,
    rejectedRows: 0,
    errorSummary: null,
    hasRejectedWorkbook: false,
    hasExportWorkbook: false,
    createdAt: new Date().toISOString(),
    startedAtUtc: new Date().toISOString(),
    completedAtUtc: null,
    expiresAtUtc: new Date(Date.now() + 86_400_000).toISOString(),
    ...overrides,
  };
}

describe("useDataExchangeFloatingDockViewModel", () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
    mockJobs = [];
    queryClient = new QueryClient();
    vi.spyOn(queryClient, "invalidateQueries").mockResolvedValue(undefined);
    wrapper = ({ children }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("keeps a single polling interval across upsert ticks, invalidates queries on completion, and emits {count} toast", async () => {
    const running = makeJob({ status: "Running" });
    mockJobs = [running];

    const setIntervalSpy = vi.spyOn(globalThis, "setInterval");
    const { rerender } = renderHook(() => useDataExchangeFloatingDockViewModel(), {
      wrapper,
    });
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    // Tick 1: still running -> interval should NOT recreate when job status/progress updates
    getJobMock.mockResolvedValueOnce(makeJob({ status: "Running", processedRows: 7 }));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    rerender();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);

    // Tick 2: completed -> invalidates dataTransfer + module query keys + toast with count=10
    getJobMock.mockResolvedValueOnce(
      makeJob({ status: "Completed", processedRows: 10, committedRows: 10 })
    );
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });

    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({
      queryKey: qk.dataTransfer.all,
    });
    expect(queryClient.invalidateQueries).toHaveBeenCalledWith({ queryKey: ["crm"] });
    expect(toastSuccessMock).toHaveBeenCalledWith(
      expect.objectContaining({
        description: expect.stringContaining('"count":10'),
      })
    );
  });

  it("stops polling immediately on 404 fatal error and tracks downloadingJobIds with format extension", async () => {
    mockJobs = [makeJob({ id: "abcdef12-9999", kind: "Export", fileFormat: "tsv" })];
    getJobMock.mockRejectedValue(Object.assign(new Error("Not Found"), { status: 404 }));

    const { result, rerender } = renderHook(
      () => useDataExchangeFloatingDockViewModel(),
      { wrapper }
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2000);
    });
    rerender();
    expect(getJobMock).toHaveBeenCalledTimes(1);

    // Next intervals do not poll the fatally stopped job
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4000);
    });
    expect(getJobMock).toHaveBeenCalledTimes(1);

    let resolveDl!: () => void;
    downloadArtifactFileMock.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          resolveDl = resolve;
        })
    );
    act(() => {
      void result.current.handleDownload("abcdef12-9999", "export");
    });
    expect(result.current.downloadingJobIds["abcdef12-9999"]).toBe("export");
    expect(downloadArtifactFileMock).toHaveBeenCalledWith(
      "abcdef12-9999",
      "export",
      "crm.lead-export-abcdef12.tsv"
    );

    await act(async () => {
      resolveDl();
    });
    expect(result.current.downloadingJobIds["abcdef12-9999"]).toBeNull();
  });
});
