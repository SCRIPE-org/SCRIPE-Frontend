import { describe, it, expect, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAcademySeasonsViewModel } from "./useAcademySeasonsViewModel";
import type { IAcademySeasonsRepository } from "../../domain/interfaces/IAcademySeasonsRepository";
import type { AcademySeason } from "../../domain/entities/AcademySeason";

describe("useAcademySeasonsViewModel", () => {
  const mockSeasons: AcademySeason[] = [
    {
      id: "season-1",
      nameEn: "2026/2027 Main Season",
      nameAr: "الموسم الرئيسي 2026/2027",
      startDate: "2026-09-01",
      endDate: "2027-08-31",
      status: "Active",
    },
    {
      id: "season-2",
      nameEn: "2027/2028 Next Season",
      nameAr: "الموسم القادم 2027/2028",
      startDate: "2027-09-01",
      endDate: "2028-08-31",
      status: "Draft",
    },
  ];

  const mockRepo: IAcademySeasonsRepository = {
    fetchSeasons: vi.fn().mockResolvedValue(mockSeasons),
    createSeason: vi.fn(),
    updateSeason: vi.fn(),
  };

  it("loads seasons and auto-selects the active season", async () => {
    const { result } = renderHook(() => useAcademySeasonsViewModel(mockRepo));

    expect(result.current.state.stage).toBe("loading");

    await waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
    });

    expect(result.current.state.seasons).toHaveLength(2);
    expect(result.current.state.selectedSeasonId).toBe("season-1");
  });

  it("allows switching the selected season", async () => {
    const { result } = renderHook(() => useAcademySeasonsViewModel(mockRepo));

    await waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
    });

    act(() => {
      result.current.selectSeason("season-2");
    });

    expect(result.current.state.selectedSeasonId).toBe("season-2");
  });

  it("updates season successfully", async () => {
    const updatedSeason: AcademySeason = {
      ...mockSeasons[0],
      nameEn: "Renamed Season",
    };
    (mockRepo.updateSeason as any).mockResolvedValueOnce(updatedSeason);

    const { result } = renderHook(() => useAcademySeasonsViewModel(mockRepo));

    await waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
    });

    let success = false;
    await act(async () => {
      success = await result.current.updateSeason("season-1", {
        nameEn: "Renamed Season",
        nameAr: "الموسم المعدل",
        startDate: "2026-09-01",
        endDate: "2027-08-31",
        status: "Active",
      });
    });

    expect(success).toBe(true);
    expect(result.current.state.seasons[0].nameEn).toBe("Renamed Season");
  });
});
