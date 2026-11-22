import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DataTransferJob } from "../src/domain/entities/DataTransferJob";
import { useJobsViewModel } from "../src/presentation/viewmodels/useJobsViewModel";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: (selector: (s: { tenantCode: string }) => unknown) =>
    selector({ tenantCode: "ahly" }),
}));

vi.mock("../src/presentation/hooks/useJobsEntityCatalog", () => ({
  useJobsEntityCatalog: () => ({
    importableEntities: [],
    isCatalogLoading: false,
    getCatalogEntry: () => undefined,
    resolveEntityName: (key: string) => key,
  }),
}));

const getJobsMock = vi.fn().mockResolvedValue({
  items: [
    new DataTransferJob({
      jobId: "job-1",
      kind: "Import",
      entityKey: "crm.lead",
      status: "Completed",
      createdAt: "2026-11-10T10:00:00.000Z",
      expiresAtUtc: "2026-11-17T10:00:00.000Z",
    }),
  ],
  totalCount: 45,
  pagesCount: 3,
});

vi.mock("../../di", () => ({
  getDataTransferContainer: () => ({
    jobsRepository: {
      getJobs: getJobsMock,
      cancelJob: vi.fn(),
      downloadArtifact: vi.fn(),
    },
  }),
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  };
}

describe("useJobsViewModel kindFilter & resetFilters behavior", () => {
  it("resets page to 1 on setKindFilter and clears search/status/kind on resetFilters", async () => {
    const { result } = renderHook(() => useJobsViewModel(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.hasActiveFilters).toBe(false);

    act(() => {
      result.current.setPage(2);
    });
    await waitFor(() => expect(result.current.page).toBe(2));

    act(() => {
      result.current.setKindFilter("MultiSheetMigration");
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.page).toBe(1);
    expect(result.current.kindFilter).toBe("MultiSheetMigration");
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.setStatusFilter("Queued");
      result.current.setSearch("lead");
    });
    expect(result.current.hasActiveFilters).toBe(true);

    act(() => {
      result.current.resetFilters();
    });
    expect(result.current.page).toBe(1);
    expect(result.current.search).toBe("");
    expect(result.current.statusFilter).toBe("all");
    expect(result.current.kindFilter).toBe("all");
    expect(result.current.hasActiveFilters).toBe(false);
  });
});
