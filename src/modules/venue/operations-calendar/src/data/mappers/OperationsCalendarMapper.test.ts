import { describe, expect, it } from "vitest";
import { OperationsCalendarMapper } from "./OperationsCalendarMapper";

describe("OperationsCalendarMapper", () => {
  it("handles null and undefined safely with empty defaults", () => {
    const dayNull = OperationsCalendarMapper.toDayEntity(null);
    expect(dayNull.dateLocal).toBe("");
    expect(dayNull.timeZoneId).toBe("UTC");
    expect(dayNull.blocks).toEqual([]);
    expect(dayNull.isTruncated).toBe(false);

    const dayUndef = OperationsCalendarMapper.toDayEntity(undefined);
    expect(dayUndef.blocks).toEqual([]);
  });

  it("maps blocks with null-coalescing defaults", () => {
    const day = OperationsCalendarMapper.toDayEntity({
      dateLocal: "2026-10-23",
      timeZoneId: "Africa/Cairo",
      blocks: [
        {
          reservationId: "res-1",
          reservationNumber: "RES-100",
          resourceId: "court-1",
          status: "CheckedIn",
          startUtc: "2026-10-23T10:00:00Z",
          endUtc: "2026-10-23T11:00:00Z",
        },
        {
          reservationId: "res-2",
          // missing optional fields
        },
      ],
    });

    expect(day.blocks).toHaveLength(2);
    expect(day.blocks[0]).toEqual({
      reservationId: "res-1",
      reservationNumber: "RES-100",
      resourceId: "court-1",
      status: "CheckedIn",
      startUtc: "2026-10-23T10:00:00Z",
      endUtc: "2026-10-23T11:00:00Z",
      quantity: 1,
      customerPartyId: "",
      holdExpiresAtUtc: null,
    });
    expect(day.blocks[1]).toEqual({
      reservationId: "res-2",
      reservationNumber: "",
      resourceId: "",
      status: "Confirmed",
      startUtc: "",
      endUtc: "",
      quantity: 1,
      customerPartyId: "",
      holdExpiresAtUtc: null,
    });
  });

  it("synthesizes closure blocks from closures array", () => {
    const day = OperationsCalendarMapper.toDayEntity({
      closures: [
        {
          resourceId: "court-2",
          startUtc: "2026-10-23T14:00:00Z",
          endUtc: "2026-10-23T16:00:00Z",
          reason: "Net Repair",
          closureType: "Maintenance",
        },
        {
          resourceId: "court-3",
          startUtc: "2026-10-23T18:00:00Z",
          endUtc: "2026-10-23T20:00:00Z",
          reason: null,
          closureType: null,
        },
      ],
    });

    expect(day.blocks).toHaveLength(2);
    expect(day.blocks[0]?.reservationId).toBe("closure-court-2-2026-10-23T14:00:00Z");
    expect(day.blocks[0]?.reservationNumber).toBe("⊘ Net Repair");
    expect(day.blocks[0]?.status).toBe("Maintenance");

    expect(day.blocks[1]?.reservationNumber).toBe("⊘ Closure");
    expect(day.blocks[1]?.status).toBe("Unavailable");
  });

  it("maps resource DTO to CalendarResource entity with defaults", () => {
    const res = OperationsCalendarMapper.toResourceEntity({
      id: "res-1",
      name: "Court Alpha",
      slotPolicy: {
        slotDurationMinutes: 90,
      },
    });

    expect(res.id).toBe("res-1");
    expect(res.name).toBe("Court Alpha");
    expect(res.resourceKindCode).toBe("Court");
    expect(res.slotPolicy?.slotDurationMinutes).toBe(90);
    expect(res.slotPolicy?.startIncrementMinutes).toBe(30);
    expect(res.slotPolicy?.allowMultiSlot).toBe(false);
  });
});
