import { describe, expect, it, vi } from "vitest";
import type { AvailabilityCalendar, SaveAvailabilityCalendar } from "../../domain/entities/Availability";
import type { IAvailabilityService } from "../../domain/interfaces/IAvailabilityService";
import { AvailabilityRepository } from "./AvailabilityRepository";

describe("AvailabilityRepository", () => {
  it("uses the explicit calendar version for optimistic replacement", async () => {
    const service = {
      replaceCalendar: vi.fn().mockResolvedValue(undefined),
    } as unknown as IAvailabilityService;
    const repository = new AvailabilityRepository(service);
    const existing: AvailabilityCalendar = {
      id: "calendar-1",
      resourceId: "resource-1",
      timeZoneId: "UTC",
      effectiveFrom: "2026-09-01",
      effectiveTo: null,
      status: "Active",
      windows: [],
      version: 7,
      createdAt: "2026-09-01T10:00:00Z",
      modifiedAt: "2026-09-01T10:00:00Z",
    };
    const update: SaveAvailabilityCalendar = {
      resourceId: "resource-1",
      timeZoneId: "UTC",
      effectiveFrom: "2026-09-01",
      effectiveTo: null,
      windows: [],
    };

    await repository.saveCalendar(existing, update);

    expect(service.replaceCalendar).toHaveBeenCalledWith("calendar-1", {
      timeZoneId: "UTC",
      effectiveFrom: "2026-09-01",
      effectiveTo: null,
      windows: [],
      expectedVersion: 7,
    });
  });
});
