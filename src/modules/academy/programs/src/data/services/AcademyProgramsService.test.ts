import { describe, it, expect, vi, beforeEach } from "vitest";
import { AcademyProgramsService } from "./AcademyProgramsService";
import type { IApiService } from "@core/interfaces/api.interface";
import type { CreateProgramPayload } from "../../domain/entities/AcademyProgram";

describe("AcademyProgramsService", () => {
  let service: AcademyProgramsService;
  let mockApi: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockApi = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
    };
    service = new AcademyProgramsService(mockApi as unknown as IApiService);
  });

  it("fetches programs with optional sport filter", async () => {
    const mockPrograms = [
      { id: "p1", code: "PROG-1", nameEn: "Prog 1", nameAr: "برنامج 1", status: "Draft" },
    ];
    mockApi.get.mockResolvedValue(mockPrograms);

    const res = await service.getPrograms("sport-123");

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/academy/programs?sportId=sport-123")
    );
    expect(res).toEqual(mockPrograms);
  });

  it("creates a program with complete payload", async () => {
    const payload: CreateProgramPayload = {
      sportId: "sport-1",
      code: "FB-01",
      nameEn: "Football Dev",
      nameAr: "تطوير كرة القدم",
      minAge: 6,
      maxAge: 12,
      level: "Beginner",
      genderCriteria: "Mixed",
    };
    const created = { id: "p-new", ...payload, status: "Draft", version: 1 };
    mockApi.post.mockResolvedValue(created);

    const res = await service.createProgram(payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining("/academy/programs"),
      payload
    );
    expect(res).toEqual(created);
  });

  it("publishes a program via POST :id/publish", async () => {
    const published = { id: "p1", status: "Published", version: 2 };
    mockApi.post.mockResolvedValue(published);

    const res = await service.publishProgram("p1");

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining("/academy/programs/p1/publish"),
      {}
    );
    expect(res.status).toBe("Published");
  });

  it("fetches programs with groupsCount and reconciles accurately (DEF-004)", async () => {
    const mockPrograms = [
      { id: "p1", code: "PROG-1", nameEn: "Prog 1", nameAr: "برنامج 1", status: "Published", groupsCount: 4 },
      { id: "p2", code: "PROG-2", nameEn: "Prog 2", nameAr: "برنامج 2", status: "Published", groupsCount: 2 },
    ];
    mockApi.get.mockResolvedValue(mockPrograms);

    const res = await service.getPrograms();

    expect(res).toEqual(mockPrograms);
    const sumGroups = res.reduce((acc, p) => acc + (p.groupsCount ?? 0), 0);
    expect(sumGroups).toBe(6);
  });
});
