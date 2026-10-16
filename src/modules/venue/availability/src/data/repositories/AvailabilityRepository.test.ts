import { describe, expect, it, vi } from "vitest";
import type {
  AvailabilityCalendar,
  ResourceBlock,
  SaveAvailabilityCalendar,
} from "../../domain/entities/Availability";
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

  it("propagates the block version for update and delete", async () => {
    const service = {
      updateBlock: vi.fn().mockResolvedValue(undefined),
      deleteBlock: vi.fn().mockResolvedValue(undefined),
    } as unknown as IAvailabilityService;
    const repository = new AvailabilityRepository(service);
    const block: ResourceBlock = {
      id: "block-1",
      resourceId: "resource-1",
      startUtc: "2026-09-15T07:00:00Z",
      endUtc: "2026-09-15T08:00:00Z",
      timeZoneId: "Africa/Cairo",
      hardBlock: true,
      reason: "Safety",
      version: 4,
      createdAt: "2026-09-01T10:00:00Z",
    };

    await repository.updateBlock("maintenance", block, {
      timeZoneId: "Africa/Cairo",
      startLocal: "2026-09-15T09:00",
      endLocal: "2026-09-15T10:00",
      hardBlock: false,
      reason: "Routine",
    });
    await repository.deleteBlock("maintenance", block);

    expect(service.updateBlock).toHaveBeenCalledWith(
      "maintenance",
      "block-1",
      expect.objectContaining({ expectedVersion: 4 })
    );
    expect(service.deleteBlock).toHaveBeenCalledWith("maintenance", "block-1", 4);
  });
});
