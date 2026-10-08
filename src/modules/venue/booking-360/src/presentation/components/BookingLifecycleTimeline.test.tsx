import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Booking360HistoryItem } from "../../domain/entities/Booking360";
import { BookingLifecycleTimeline } from "./BookingLifecycleTimeline";

const item = (
  transitionCode: string,
  occurredAtUtc: string,
  toStatus: Booking360HistoryItem["toStatus"]
): Booking360HistoryItem => ({
  fromStatus: null,
  toStatus,
  transitionCode,
  occurredAtUtc,
  reason: null,
});

describe("BookingLifecycleTimeline", () => {
  it("orders chronologically while preserving authoritative server order for equal timestamps", () => {
    render(
      <BookingLifecycleTimeline
        items={[
          item("T04", "2026-09-10T07:00:00Z", "Held"),
          item("T01", "2026-09-10T07:00:00Z", "Draft"),
          item("T02", "2026-09-10T06:00:00Z", "Requested"),
        ]}
        locale="en"
        timeZoneId="UTC"
        t={(key) => key}
      />
    );

    const rows = within(screen.getByRole("list")).getAllByRole("listitem");
    expect(rows[0]).toHaveTextContent("booking360.transition.T02");
    expect(rows[1]).toHaveTextContent("booking360.transition.T04");
    expect(rows[2]).toHaveTextContent("booking360.transition.T01");
  });
});
