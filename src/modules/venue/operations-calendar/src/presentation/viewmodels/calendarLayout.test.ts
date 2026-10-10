import { describe, expect, it } from "vitest";
import type { OperationsCalendarBlock, OperationsCalendarDay } from "../../domain/entities/OperationsCalendar";
import {
  blockPosition,
  buildTimeSlots,
  localPrefillForInstant,
  occupyingBlocks,
  placeBlocksOnTracks,
} from "./calendarLayout";

const day: OperationsCalendarDay = {
  dateLocal: "2026-09-09",
  timeZoneId: "Africa/Cairo",
  fromUtc: "2026-09-08T21:00:00Z",
  toUtc: "2026-09-09T21:00:00Z",
  asOfUtc: "2026-09-09T06:00:00Z",
  isTruncated: false,
  blocks: [],
};

function block(patch: Partial<OperationsCalendarBlock>): OperationsCalendarBlock {
  return {
    reservationId: "reservation-1",
    reservationNumber: "RES-1",
    resourceId: "resource-1",
    status: "Confirmed",
    startUtc: "2026-09-09T06:00:00Z",
    endUtc: "2026-09-09T07:00:00Z",
    quantity: 1,
    customerPartyId: "customer-1",
    holdExpiresAtUtc: null,
    ...patch,
  };
}

describe("calendarLayout", () => {
  it("uses the server UTC day bounds so DST days produce 23 or 25 chronological slots", () => {
    expect(buildTimeSlots({ ...day, fromUtc: "2026-03-08T05:00:00Z", toUtc: "2026-03-09T04:00:00Z" }, "en")).toHaveLength(23);
    expect(buildTimeSlots({ ...day, fromUtc: "2026-11-01T04:00:00Z", toUtc: "2026-11-02T05:00:00Z" }, "en")).toHaveLength(25);
  });

  it("positions touching half-open bookings edge-to-edge without overlap", () => {
    const first = block({ startUtc: "2026-09-09T06:00:00Z", endUtc: "2026-09-09T07:00:00Z" });
    const second = block({ reservationId: "reservation-2", startUtc: first.endUtc, endUtc: "2026-09-09T08:00:00Z" });
    const firstPosition = blockPosition(first, day);
    const secondPosition = blockPosition(second, day);

    expect(firstPosition.leftPercent + firstPosition.widthPercent).toBeCloseTo(secondPosition.leftPercent);
    expect(placeBlocksOnTracks([first, second]).map((item) => item.track)).toEqual([0, 0]);
  });

  it("places genuinely overlapping occupancy on separate tracks", () => {
    const first = block({ startUtc: "2026-09-09T06:00:00Z", endUtc: "2026-09-09T08:00:00Z" });
    const second = block({ reservationId: "reservation-2", startUtc: "2026-09-09T07:00:00Z", endUtc: "2026-09-09T09:00:00Z" });

    expect(placeBlocksOnTracks([first, second]).map((item) => item.track)).toEqual([0, 1]);
  });

  it("defensively excludes terminal states from operational occupancy while including maintenance blocks", () => {
    const blocks = [
      block({ status: "Held" }),
      block({ reservationId: "confirmed", status: "Confirmed" }),
      block({ reservationId: "checked-in", status: "CheckedIn" }),
      block({ reservationId: "cancelled", status: "Cancelled" }),
      block({ reservationId: "completed", status: "Completed" }),
      block({ reservationId: "maintenance", status: "Maintenance" as any }),
    ];

    expect(occupyingBlocks(blocks).map((item) => item.status)).toEqual(["Held", "Confirmed", "CheckedIn", "Maintenance"]);
  });

  it("formats an empty-slot instant into the approved resource timezone for Booking Workspace prefill", () => {
    expect(localPrefillForInstant("2026-09-09T07:30:00Z", "Africa/Cairo")).toEqual({
      date: "2026-09-09",
      startTime: "10:30",
    });
  });
});
