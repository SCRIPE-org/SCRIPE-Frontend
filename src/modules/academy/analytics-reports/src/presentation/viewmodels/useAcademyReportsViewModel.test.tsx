import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { AcademyOperationalMetrics } from "../../domain/entities/AcademyAnalytics";
import type { IAcademyAnalyticsRepository } from "../../domain/interfaces/IAcademyAnalyticsRepository";
import { useAcademyReportsViewModel } from "./useAcademyReportsViewModel";

function metrics(label: string): AcademyOperationalMetrics {
  return {
    metadata: { asOfUtc: "2026-11-21T00:00:00.000Z", scopedBranchIds: [], scope: label },
  } as unknown as AcademyOperationalMetrics;
}

function repository(getOperationalMetrics: ReturnType<typeof vi.fn>) {
  return {
    getOperationalMetrics,
    getExportUrl: vi.fn(() => "/export"),
  } as unknown as IAcademyAnalyticsRepository;
}

describe("useAcademyReportsViewModel", () => {
  it("keeps filter edits as drafts until Apply requests the current scope", async () => {
    const getOperationalMetrics = vi.fn().mockResolvedValue(metrics("initial"));
    const analyticsRepository = repository(getOperationalMetrics);
    const { result } = renderHook(() => useAcademyReportsViewModel(analyticsRepository));
    await waitFor(() => expect(getOperationalMetrics).toHaveBeenCalledTimes(1));

    act(() => result.current.setBranchFilter("branch-final"));
    await act(async () => { await Promise.resolve(); });
    expect(getOperationalMetrics).toHaveBeenCalledTimes(1);

    await act(async () => { await result.current.fetchMetrics(); });
    expect(getOperationalMetrics).toHaveBeenLastCalledWith(expect.objectContaining({ branchId: "branch-final" }));
  });

  it("ignores a stale response that resolves after a newer report scope", async () => {
    let resolveOld!: (value: AcademyOperationalMetrics) => void;
    let resolveNew!: (value: AcademyOperationalMetrics) => void;
    const oldRequest = new Promise<AcademyOperationalMetrics>((resolve) => { resolveOld = resolve; });
    const newRequest = new Promise<AcademyOperationalMetrics>((resolve) => { resolveNew = resolve; });
    const getOperationalMetrics = vi.fn()
      .mockResolvedValueOnce(metrics("initial"))
      .mockReturnValueOnce(oldRequest)
      .mockReturnValueOnce(newRequest);
    const analyticsRepository = repository(getOperationalMetrics);
    const { result } = renderHook(() => useAcademyReportsViewModel(analyticsRepository));
    await waitFor(() => expect(result.current.metrics).not.toBeNull());

    let oldCompletion!: Promise<void>;
    let newCompletion!: Promise<void>;
    act(() => {
      oldCompletion = result.current.fetchMetrics({ branchId: "old" });
      newCompletion = result.current.fetchMetrics({ branchId: "new" });
    });
    await act(async () => { resolveNew(metrics("new")); await newCompletion; });
    await act(async () => { resolveOld(metrics("old")); await oldCompletion; });
    expect(result.current.metrics).not.toBeNull();
    const metadata = result.current.metrics!.metadata as unknown as { scope: string };
    expect(metadata.scope).toBe("new");
  });
});
