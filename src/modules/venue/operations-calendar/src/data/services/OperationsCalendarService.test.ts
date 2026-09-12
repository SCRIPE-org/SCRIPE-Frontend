import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IApiService } from "@core/interfaces/api.interface";
import { OperationsCalendarService } from "./OperationsCalendarService";

describe("OperationsCalendarService", () => {
  const api = { get: vi.fn() } as unknown as IApiService;

  beforeEach(() => vi.clearAllMocks());

  it("maps a finite local day, timezone, and bounded resource set to the calendar endpoint", async () => {
    vi.mocked(api.get).mockResolvedValue({ blocks: [] });

    await new OperationsCalendarService(api).getDay({
      dateLocal: "2026-09-09",
      timeZoneId: "Africa/Cairo",
      resourceIds: ["resource-1", "resource-2"],
    });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/operations-calendar?dateLocal=2026-09-09&timeZoneId=Africa%2FCairo&resourceIds=resource-1%2Cresource-2"
    );
  });
});
