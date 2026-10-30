import { describe, it, expect, vi, beforeEach } from "vitest";
import { AcademySeasonsService } from "./AcademySeasonsService";
import type { IApiService } from "@core/interfaces/api.interface";
import type { CreateSeasonPayload } from "../../domain/entities/AcademySeason";

describe("AcademySeasonsService", () => {
  let service: AcademySeasonsService;
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
    service = new AcademySeasonsService(mockApi as unknown as IApiService);
  });

  it("fetches seasons list", async () => {
    const mockSeasons = [
      { id: "s1", nameEn: "Season 2026/2027", startDate: "2026-09-01", endDate: "2027-06-30", status: "Draft" },
    ];
    mockApi.get.mockResolvedValue(mockSeasons);

    const res = await service.getSeasons();

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/academy/seasons")
    );
    expect(res).toEqual(mockSeasons);
  });

  it("creates a season with valid dates", async () => {
    const payload: CreateSeasonPayload = {
      nameEn: "Season 2026/2027",
      nameAr: "موسم 2026/2027",
      startDate: "2026-09-01",
      endDate: "2027-06-30",
    };
    const created = { id: "s-new", ...payload, status: "Draft" };
    mockApi.post.mockResolvedValue(created);

    const res = await service.createSeason(payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining("/academy/seasons"),
      payload
    );
    expect(res).toEqual(created);
  });
});
