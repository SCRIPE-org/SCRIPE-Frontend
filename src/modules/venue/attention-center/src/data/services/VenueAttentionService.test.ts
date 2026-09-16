import { describe, expect, it, vi } from "vitest";
import type { IApiService } from "@core/interfaces/api.interface";
import { VenueAttentionService } from "./VenueAttentionService";

describe("VenueAttentionService", () => {
  it("uses the scoped, read-only attention endpoint with bounded paging", async () => {
    const api = { get: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }) } as unknown as IApiService;
    const service = new VenueAttentionService(api);

    await service.get(2, 20);

    expect(api.get).toHaveBeenCalledWith("/v1/venue-attention?page=2&pageSize=20");
  });
});
