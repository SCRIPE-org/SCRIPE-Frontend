import { describe, it, expect, vi, beforeEach } from "vitest";
import { ExternalLocationsService } from "./ExternalLocationsService";
import type { IApiService } from "@core/interfaces/api.interface";
import type { CreateLocationPayload } from "../../domain/entities/ExternalLocation";

describe("ExternalLocationsService", () => {
  let service: ExternalLocationsService;
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
    service = new ExternalLocationsService(mockApi as unknown as IApiService);
  });

  it("fetches locations with optional branch filter", async () => {
    const mockLocations = [
      { id: "loc1", nameEn: "Community Pitch", availabilityDisclaimer: "Externally managed - availability unverified" },
    ];
    mockApi.get.mockResolvedValue(mockLocations);

    const res = await service.getLocations("b1");

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/academy/locations?branchId=b1")
    );
    expect(res).toEqual(mockLocations);
  });

  it("creates an external location with valid data", async () => {
    const payload: CreateLocationPayload = {
      nameEn: "Municipal Pool",
      nameAr: "المسبح البلدي",
      address: "Downtown Center",
    };
    const created = {
      id: "loc-new",
      ...payload,
      availabilityDisclaimer: "Externally managed - availability unverified",
      isActive: true,
    };
    mockApi.post.mockResolvedValue(created);

    const res = await service.createLocation(payload);

    expect(mockApi.post).toHaveBeenCalledWith(
      expect.stringContaining("/academy/locations"),
      payload
    );
    expect(res.availabilityDisclaimer).toBe("Externally managed - availability unverified");
  });
});
