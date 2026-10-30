import { describe, it, expect, vi } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { useAcademyOverviewViewModel } from "./useAcademyOverviewViewModel";
import type { IAcademyOverviewRepository } from "../../domain/interfaces/IAcademyOverviewRepository";

describe("useAcademyOverviewViewModel", () => {
  it("initializes in loading stage and transitions to resolved state from repository", async () => {
    const mockRepo: IAcademyOverviewRepository = {
      getOverview: vi.fn().mockResolvedValue({
        stage: "empty",
        isEnabled: true,
        tenantId: "tenant-abc",
        maxAthletes: -1,
        maxPrograms: -1,
        maxTrainingGroups: -1,
        activeProgramsCount: 0,
        activeOfferingsCount: 0,
        activeEnrollmentsCount: 0,
        pendingTrialsCount: 0,
        configuredFeatures: ["Programs"],
        statusMessage: "Active",
      }),
    };

    const { result } = renderHook(() => useAcademyOverviewViewModel(mockRepo));

    expect(result.current.state.stage).toBe("loading");

    await waitFor(() => {
      expect(result.current.state.stage).toBe("empty");
    });

    expect(result.current.state.tenantId).toBe("tenant-abc");
    expect(mockRepo.getOverview).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.refresh();
    });

    expect(mockRepo.getOverview).toHaveBeenCalledTimes(2);
  });
});
