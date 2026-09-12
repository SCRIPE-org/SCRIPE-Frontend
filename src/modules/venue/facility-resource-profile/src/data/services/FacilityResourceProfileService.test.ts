import { describe, expect, it, vi } from "vitest";
import type { IApiService } from "@core/interfaces/api.interface";
import { FacilityResourceProfileService } from "./FacilityResourceProfileService";

describe("FacilityResourceProfileService", () => {
  it("applies the facility filter to the owning module list endpoint", async () => {
    const api = {
      get: vi.fn().mockResolvedValue({
        items: [],
        totalCount: 0,
        pageNumber: 1,
        pageSize: 100,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      }),
    } as unknown as IApiService;
    const service = new FacilityResourceProfileService(api);

    await service.getAll({ page: 1, pageSize: 100, facilityId: "facility-1" });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/facility-resource-profiles?page=1&pageSize=100&facilityId=facility-1"
    );
  });

  it("sends the complete operational profile payload on create", async () => {
    const api = { post: vi.fn().mockResolvedValue({ id: "profile-1" }) } as unknown as IApiService;
    const service = new FacilityResourceProfileService(api);
    const payload = {
      facilityId: "facility-1",
      code: "COURT-1",
      name: "Court 1",
      description: "Indoor court",
      resourceKindCode: "court",
      timeZoneId: "Africa/Cairo",
      days: 62,
      opensAt: "09:00",
      closesAt: "22:00",
      setupBufferMinutes: 15,
      cleanupBufferMinutes: 10,
      usageTypes: [{ code: "basketball", label: "Basketball" }],
    };

    await service.create(payload);

    expect(api.post).toHaveBeenCalledWith("/v1/facility-resource-profiles", payload);
  });
});
