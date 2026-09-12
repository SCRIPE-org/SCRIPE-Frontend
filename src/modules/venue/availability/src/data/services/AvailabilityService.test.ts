import { describe, expect, it, vi } from "vitest";
import type { IApiService } from "@core/interfaces/api.interface";
import type { ReplaceAvailabilityCalendarPayload } from "../../domain/interfaces/IAvailabilityService";
import { AvailabilityService } from "./AvailabilityService";

describe("AvailabilityService", () => {
  it("loads calendars for one resource and then loads the selected weekly pattern", async () => {
    const api = {
      get: vi
        .fn()
        .mockResolvedValueOnce({
          items: [{ id: "calendar-1", resourceId: "resource-1", status: "Active" }],
          totalCount: 1,
          pageNumber: 1,
          pageSize: 20,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        })
        .mockResolvedValueOnce({ id: "calendar-1", resourceId: "resource-1", windows: [] }),
    } as unknown as IApiService;
    const service = new AvailabilityService(api);

    const result = await service.getCurrentCalendar("resource-1");

    expect(api.get).toHaveBeenNthCalledWith(
      1,
      "/v1/availability-calendars?page=1&pageSize=20&resourceId=resource-1"
    );
    expect(api.get).toHaveBeenNthCalledWith(2, "/v1/availability-calendars/calendar-1");
    expect(result?.id).toBe("calendar-1");
  });

  it("sends expected version when replacing a calendar", async () => {
    const api = { put: vi.fn().mockResolvedValue(undefined) } as unknown as IApiService;
    const service = new AvailabilityService(api);
    const payload: ReplaceAvailabilityCalendarPayload = {
      timeZoneId: "UTC",
      effectiveFrom: "2026-09-01",
      effectiveTo: null,
      expectedVersion: 7,
      windows: [{ dayOfWeek: "Monday", startLocal: "09:00", endLocal: "17:00", capacityOverride: null }],
    };

    await service.replaceCalendar("calendar-1", payload);

    expect(api.put).toHaveBeenCalledWith("/v1/availability-calendars/calendar-1", payload);
  });

  it("builds a bounded UTC availability-search request", async () => {
    const api = { get: vi.fn().mockResolvedValue({ isAvailable: true }) } as unknown as IApiService;
    const service = new AvailabilityService(api);

    await service.search({
      resourceId: "resource-1",
      timeZoneId: "Africa/Cairo",
      startLocal: "2026-09-07T09:00:00",
      endLocal: "2026-09-07T10:00:00",
      quantity: 2,
    });

    expect(api.get).toHaveBeenCalledWith(
      "/v1/availability/search?resourceId=resource-1&timeZoneId=Africa%2FCairo&startLocal=2026-09-07T09%3A00%3A00&endLocal=2026-09-07T10%3A00%3A00&quantity=2"
    );
  });
});
