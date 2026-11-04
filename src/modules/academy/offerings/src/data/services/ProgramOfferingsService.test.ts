import { describe, it, expect, vi, beforeEach } from "vitest";
import { ProgramOfferingsService } from "./ProgramOfferingsService";
import type { IApiService } from "@core/interfaces/api.interface";
import type { CreateOfferingPayload } from "../../domain/entities/ProgramOffering";

describe("ProgramOfferingsService", () => {
  let service: ProgramOfferingsService;
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
    service = new ProgramOfferingsService(mockApi as unknown as IApiService);
  });

  it("fetches offerings with branch filter", async () => {
    const mockOfferings = [
      { id: "o1", nameEn: "Term 1 Offering", branchId: "b1", maxCapacity: 25 },
    ];
    mockApi.get.mockResolvedValue(mockOfferings);

    const res = await service.getOfferings("b1");

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/academy/offerings?branchId=b1")
    );
    expect(res).toEqual(mockOfferings);
  });

  it("creates an offering with complete payload", async () => {
    const payload: CreateOfferingPayload = {
      programId: "p1",
      branchId: "b1",
      seasonId: "s1",
      nameEn: "Term 1 Evening",
      nameAr: "الفصل الأول المسائي",
      startDate: "2026-09-01",
      endDate: "2026-12-15",
      maxCapacity: 20,
      minCapacity: 5,
    };
    const created = { id: "o-new", ...payload, enrolledCount: 0, status: "Draft" };
    mockApi.post.mockResolvedValue(created);

    const res = await service.createOffering(payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining("/academy/offerings"),
      payload
    );
    expect(res).toEqual(created);
  });
});
