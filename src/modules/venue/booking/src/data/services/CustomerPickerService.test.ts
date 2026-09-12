import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IApiService } from "@core/interfaces/api.interface";
import { CustomerPickerService } from "./CustomerPickerService";

describe("CustomerPickerService", () => {
  const api = {
    get: vi.fn(),
  } as unknown as IApiService;

  beforeEach(() => vi.clearAllMocks());

  it("searches the tenant Party API without duplicating Party ownership", async () => {
    vi.mocked(api.get).mockResolvedValue({
      items: [{ id: "party-1", type: "Person", displayName: "Mona Hassan" }],
      totalCount: 1,
    });

    const result = await new CustomerPickerService(api).search("Mona");

    expect(api.get).toHaveBeenCalledWith(
      "/v1/Parties?page=1&pageSize=20&search=Mona"
    );
    expect(result).toEqual([{ id: "party-1", type: "Person", displayName: "Mona Hassan" }]);
  });

  it("hydrates the selected customer from Party by id", async () => {
    vi.mocked(api.get).mockResolvedValue({ id: "party-1", type: "Person", displayName: "Mona Hassan" });

    const result = await new CustomerPickerService(api).getById("party-1");

    expect(api.get).toHaveBeenCalledWith("/v1/Parties/party-1");
    expect(result.displayName).toBe("Mona Hassan");
  });
});
