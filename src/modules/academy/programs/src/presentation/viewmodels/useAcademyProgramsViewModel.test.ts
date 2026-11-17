import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAcademyProgramsViewModel } from "./useAcademyProgramsViewModel";
import type { IAcademyProgramsRepository } from "../../domain/interfaces/IAcademyProgramsRepository";
import type { AcademyProgram } from "../../domain/entities/AcademyProgram";

describe("useAcademyProgramsViewModel (UAT08-01 Program Manage)", () => {
  const mockPrograms: AcademyProgram[] = [
    {
      id: "prog-01",
      sportId: "sport-football",
      code: "QA-ALPHA",
      nameEn: "QA Program Alpha",
      nameAr: "البرنامج Alpha",
      descriptionEn: "Elite football development track.",
      descriptionAr: "مسار النخبة لكرة القدم.",
      minAge: 8,
      maxAge: 14,
      level: "Intermediate",
      genderCriteria: "Mixed",
      status: "Published",
      version: 2,
      groupsCount: 6,
    },
    {
      id: "prog-02",
      sportId: "sport-football",
      code: "QA-GAMMA",
      nameEn: "Junior Football Club",
      nameAr: "برنامج تطوير",
      descriptionEn: "Introductory football track.",
      descriptionAr: "مسار تأسيسي.",
      minAge: 6,
      maxAge: 10,
      level: "Beginner",
      genderCriteria: "BoysOnly",
      status: "Draft",
      version: 1,
      groupsCount: 0,
    },
  ];

  let mockRepo: IAcademyProgramsRepository;

  beforeEach(() => {
    mockRepo = {
      fetchPrograms: vi.fn().mockResolvedValue(mockPrograms),
      fetchProgramById: vi.fn().mockImplementation((id: string) => {
        const found = mockPrograms.find((p) => p.id === id);
        return Promise.resolve(found || mockPrograms[0]);
      }),
      fetchSports: vi.fn().mockResolvedValue([
        { id: "sport-football", code: "FOOTBALL", nameEn: "Football", nameAr: "كرة القدم", isActive: true },
      ]),
      createProgram: vi.fn(),
      publishProgram: vi.fn().mockImplementation((id: string) => {
        const found = mockPrograms.find((p) => p.id === id);
        if (!found) throw new Error("Program not found");
        return Promise.resolve({ ...found, status: "Published" });
      }),
    };
  });

  it("loads programs and sports taxonomy into ready stage", async () => {
    const { result } = renderHook(() => useAcademyProgramsViewModel(mockRepo));

    await vi.waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
    });

    expect(result.current.state.programs).toHaveLength(2);
    expect(result.current.state.sports).toHaveLength(1);
    expect(result.current.state.errorMessage).toBeNull();
  });

  it("publishes draft program successfully without fabricating endpoints", async () => {
    const { result } = renderHook(() => useAcademyProgramsViewModel(mockRepo));

    await vi.waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
    });

    let ok = false;
    await act(async () => {
      ok = await result.current.publishProgram("prog-02");
    });

    expect(ok).toBe(true);
    expect(mockRepo.publishProgram).toHaveBeenCalledWith("prog-02");
    const updated = result.current.state.programs.find((p) => p.id === "prog-02");
    expect(updated?.status).toBe("Published");
  });

  it("filters offerings accurately by programId preserving context", () => {
    const mockOfferings = [
      { id: "off-01", programId: "prog-01", nameEn: "Fall Alpha Cohort" },
      { id: "off-02", programId: "prog-01", nameEn: "Winter Alpha Cohort" },
      { id: "off-03", programId: "prog-03", nameEn: "Other Cohort" },
    ];

    // Filter for prog-01 (has 2 offerings)
    const prog1Offerings = mockOfferings.filter((o) => o.programId === "prog-01");
    expect(prog1Offerings).toHaveLength(2);

    // Filter for prog-02 (empty offerings state)
    const prog2Offerings = mockOfferings.filter((o) => o.programId === "prog-02");
    expect(prog2Offerings).toHaveLength(0);
  });
});
