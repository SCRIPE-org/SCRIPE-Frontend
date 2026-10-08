import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { OperationsCalendarDay } from "../../domain/entities/OperationsCalendar";
import { ResourceTimeline } from "./ResourceTimeline";

const resource = { id: "resource-1", name: "Court 1", profileId: "profile-1", profileName: "Indoor Court", facilityId: "facility-1", facilityName: "Downtown", resourceKindCode: "court", timeZoneId: "Africa/Cairo" };
const day: OperationsCalendarDay = {
  dateLocal: "2026-09-09", timeZoneId: "Africa/Cairo",
  fromUtc: "2026-09-08T21:00:00Z", toUtc: "2026-09-09T21:00:00Z", asOfUtc: "2026-09-09T06:00:00Z", isTruncated: false,
  blocks: [
    { reservationId: "held", reservationNumber: "RES-H", resourceId: "resource-1", status: "Held", startUtc: "2026-09-09T06:00:00Z", endUtc: "2026-09-09T07:00:00Z", quantity: 1, customerPartyId: "party-1", holdExpiresAtUtc: "2026-09-09T08:00:00Z" },
    { reservationId: "confirmed", reservationNumber: "RES-C", resourceId: "resource-1", status: "Confirmed", startUtc: "2026-09-09T07:00:00Z", endUtc: "2026-09-09T08:00:00Z", quantity: 1, customerPartyId: "party-2", holdExpiresAtUtc: null },
    { reservationId: "checked-in", reservationNumber: "RES-I", resourceId: "resource-1", status: "CheckedIn", startUtc: "2026-09-09T08:00:00Z", endUtc: "2026-09-09T09:00:00Z", quantity: 1, customerPartyId: "party-3", holdExpiresAtUtc: null },
    { reservationId: "cancelled", reservationNumber: "RES-X", resourceId: "resource-1", status: "Cancelled", startUtc: "2026-09-09T08:00:00Z", endUtc: "2026-09-09T09:00:00Z", quantity: 1, customerPartyId: "party-3", holdExpiresAtUtc: null },
    { reservationId: "completed", reservationNumber: "RES-D", resourceId: "resource-1", status: "Completed", startUtc: "2026-09-09T09:00:00Z", endUtc: "2026-09-09T10:00:00Z", quantity: 1, customerPartyId: "party-4", holdExpiresAtUtc: null },
    { reservationId: "no-show", reservationNumber: "RES-N", resourceId: "resource-1", status: "NoShow", startUtc: "2026-09-09T10:00:00Z", endUtc: "2026-09-09T11:00:00Z", quantity: 1, customerPartyId: "party-5", holdExpiresAtUtc: null },
  ],
};

const t = (key: string, values?: Record<string, string | number>) => {
  const templates: Record<string, string> = {
    "operationsCalendar.timeline.bookingLabel": "Open {{reference}}, {{status}}, {{start}} to {{end}} on {{resource}}",
    "operationsCalendar.timeline.emptySlot": "Create booking for {{resource}} at {{time}}",
  };
  return Object.entries(values ?? {}).reduce((text, [name, value]) => text.replace(`{{${name}}}`, String(value)), templates[key] ?? key);
};

describe("ResourceTimeline", () => {
  it("keeps CheckedIn occupying while NoShow and Completed disappear after refresh", () => {
    render(<ResourceTimeline day={day} resources={[resource]} locale="en" direction="ltr" canCreate t={t} onOpen={vi.fn()} onEmptySlot={vi.fn()} />);
    const lane = document.querySelector<HTMLElement>('[data-resource-id="resource-1"]')!;
    expect(within(lane).getByText("RES-H")).toBeInTheDocument();
    expect(within(lane).getByText("RES-C")).toBeInTheDocument();
    expect(within(lane).getByText("RES-I")).toBeInTheDocument();
    expect(within(lane).queryByText("RES-X")).not.toBeInTheDocument();
    expect(within(lane).queryByText("RES-D")).not.toBeInTheDocument();
    expect(within(lane).queryByText("RES-N")).not.toBeInTheDocument();
    expect(screen.getAllByText("03:00").length).toBeGreaterThan(0);
  });

  it("uses native keyboard-focusable controls for blocks and empty-slot prefill", () => {
    const onOpen = vi.fn();
    const onEmptySlot = vi.fn();
    render(<ResourceTimeline day={day} resources={[resource]} locale="en" direction="rtl" canCreate t={t} onOpen={onOpen} onEmptySlot={onEmptySlot} />);

    const block = screen.getByRole("button", { name: /RES-H/ });
    block.focus();
    expect(block).toHaveFocus();
    fireEvent.click(block);
    expect(onOpen).toHaveBeenCalledWith(day.blocks[0]);

    fireEvent.click(screen.getByRole("button", { name: /Create booking for Court 1 at 00:00/ }));
    expect(onEmptySlot).toHaveBeenCalledWith(resource, "2026-09-08T21:00:00.000Z");
    expect(screen.getByTestId("resource-timeline").firstElementChild).toHaveAttribute("dir", "ltr");
  });
});
