import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { OperationsCalendarDay } from "../../domain/entities/OperationsCalendar";
import { ResourceTimeline } from "./ResourceTimeline";

const resource = {
  id: "resource-1",
  name: "Court 1",
  profileId: "profile-1",
  profileName: "Indoor Court",
  facilityId: "facility-1",
  facilityName: "Downtown",
  resourceKindCode: "court",
  timeZoneId: "Africa/Cairo",
};
const day: OperationsCalendarDay = {
  dateLocal: "2026-09-09",
  timeZoneId: "Africa/Cairo",
  fromUtc: "2026-09-08T21:00:00Z",
  toUtc: "2026-09-09T21:00:00Z",
  asOfUtc: "2026-09-09T06:00:00Z",
  isTruncated: false,
  blocks: [
    {
      reservationId: "held",
      reservationNumber: "RES-H",
      resourceId: "resource-1",
      status: "Held",
      startUtc: "2026-09-09T06:00:00Z",
      endUtc: "2026-09-09T07:00:00Z",
      quantity: 1,
      customerPartyId: "party-1",
      holdExpiresAtUtc: "2026-09-09T08:00:00Z",
    },
    {
      reservationId: "confirmed",
      reservationNumber: "RES-C",
      resourceId: "resource-1",
      status: "Confirmed",
      startUtc: "2026-09-09T07:00:00Z",
      endUtc: "2026-09-09T08:00:00Z",
      quantity: 1,
      customerPartyId: "party-2",
      holdExpiresAtUtc: null,
    },
    {
      reservationId: "checked-in",
      reservationNumber: "RES-I",
      resourceId: "resource-1",
      status: "CheckedIn",
      startUtc: "2026-09-09T08:00:00Z",
      endUtc: "2026-09-09T09:00:00Z",
      quantity: 1,
      customerPartyId: "party-3",
      holdExpiresAtUtc: null,
    },
    {
      reservationId: "cancelled",
      reservationNumber: "RES-X",
      resourceId: "resource-1",
      status: "Cancelled",
      startUtc: "2026-09-09T08:00:00Z",
      endUtc: "2026-09-09T09:00:00Z",
      quantity: 1,
      customerPartyId: "party-3",
      holdExpiresAtUtc: null,
    },
    {
      reservationId: "completed",
      reservationNumber: "RES-D",
      resourceId: "resource-1",
      status: "Completed",
      startUtc: "2026-09-09T09:00:00Z",
      endUtc: "2026-09-09T10:00:00Z",
      quantity: 1,
      customerPartyId: "party-4",
      holdExpiresAtUtc: null,
    },
    {
      reservationId: "no-show",
      reservationNumber: "RES-N",
      resourceId: "resource-1",
      status: "NoShow",
      startUtc: "2026-09-09T10:00:00Z",
      endUtc: "2026-09-09T11:00:00Z",
      quantity: 1,
      customerPartyId: "party-5",
      holdExpiresAtUtc: null,
    },
  ],
};

const t = (key: string, values?: Record<string, string | number>) => {
  const templates: Record<string, string> = {
    "operationsCalendar.timeline.bookingLabel":
      "Open {{reference}}, {{status}}, {{start}} to {{end}} on {{resource}}",
    "operationsCalendar.timeline.emptySlot": "Create booking for {{resource}} at {{time}}",
  };
  return Object.entries(values ?? {}).reduce(
    (text, [name, value]) => text.replace(`{{${name}}}`, String(value)),
    templates[key] ?? key
  );
};

describe("ResourceTimeline", () => {
  it("renders completed and no-show blocks as occupied while cancelled bookings are removed", () => {
    render(
      <ResourceTimeline
        day={day}
        resources={[resource]}
        locale="en"
        direction="ltr"
        canCreate
        t={t}
        onOpen={vi.fn()}
        onEmptySlot={vi.fn()}
      />
    );
    const lane = document.querySelector<HTMLElement>('[data-resource-id="resource-1"]')!;
    expect(within(lane).getByText("RES-H")).toBeInTheDocument();
    expect(within(lane).getByText("RES-C")).toBeInTheDocument();
    expect(within(lane).getByText("RES-I")).toBeInTheDocument();
    expect(within(lane).getByText("RES-D")).toBeInTheDocument();
    expect(within(lane).getByText("RES-N")).toBeInTheDocument();
    expect(within(lane).queryByText("RES-X")).not.toBeInTheDocument();
    expect(screen.getAllByText("03:00").length).toBeGreaterThan(0);
  });

  it("uses native keyboard-focusable controls for blocks and empty-slot prefill", () => {
    const onOpen = vi.fn();
    const onEmptySlot = vi.fn();
    render(
      <ResourceTimeline
        day={day}
        resources={[resource]}
        locale="en"
        direction="rtl"
        canCreate
        t={t}
        onOpen={onOpen}
        onEmptySlot={onEmptySlot}
      />
    );

    const block = screen.getByRole("button", { name: /RES-H/ });
    block.focus();
    expect(block).toHaveFocus();
    fireEvent.click(block);
    expect(onOpen).toHaveBeenCalledWith(day.blocks[0]);

    fireEvent.click(screen.getByRole("button", { name: /Create booking for Court 1 at 00:00/ }));
    expect(onEmptySlot).toHaveBeenCalledWith(resource, "2026-09-08T21:00:00.000Z");
    expect(screen.getByTestId("resource-timeline").firstElementChild).toHaveAttribute("dir", "ltr");
  });

  it("renders Maintenance closures distinctly and marks overlapping slots occupied", () => {
    const dayWithMaintenance: OperationsCalendarDay = {
      ...day,
      blocks: [
        {
          reservationId: "maint-1",
          reservationNumber: "MAINT-101",
          resourceId: "resource-1",
          status: "Maintenance" as any,
          startUtc: "2026-09-09T06:00:00Z",
          endUtc: "2026-09-09T08:00:00Z",
          quantity: 1,
          customerPartyId: "",
          holdExpiresAtUtc: null,
        },
      ],
    };

    render(
      <ResourceTimeline
        day={dayWithMaintenance}
        resources={[resource]}
        locale="en"
        direction="ltr"
        canCreate
        t={t}
        onOpen={vi.fn()}
        onEmptySlot={vi.fn()}
      />
    );

    const lane = document.querySelector<HTMLElement>('[data-resource-id="resource-1"]')!;
    expect(within(lane).getAllByText(/Maintenance/).length).toBeGreaterThan(0);
  });

  it("allows clicking a 30-minute free window when the other half of the hour is occupied", () => {
    const onEmptySlot = vi.fn();
    const dayWith30MinBooking: OperationsCalendarDay = {
      ...day,
      blocks: [
        {
          reservationId: "partial-30",
          reservationNumber: "RES-30M",
          resourceId: "resource-1",
          status: "Confirmed",
          startUtc: "2026-09-08T21:00:00Z", // 00:00 - 00:30 local
          endUtc: "2026-09-08T21:30:00Z",
          quantity: 1,
          customerPartyId: "party-p",
          holdExpiresAtUtc: null,
        },
      ],
    };

    render(
      <ResourceTimeline
        day={dayWith30MinBooking}
        resources={[resource]}
        locale="en"
        direction="ltr"
        canCreate
        t={t}
        onOpen={vi.fn()}
        onEmptySlot={onEmptySlot}
      />
    );

    // The second half (00:30) of the 00:00 hour should be enabled and clickable
    const freeSubSlot = screen.getByRole("button", {
      name: /Create booking for Court 1 at 00:30/,
    });
    expect(freeSubSlot).not.toBeDisabled();
    fireEvent.click(freeSubSlot);
    expect(onEmptySlot).toHaveBeenCalledWith(resource, "2026-09-08T21:30:00.000Z");
  });

  it("sets dir='ltr' on the outer scroll container and dir='auto' with line-clamp-2 and w-56 sticky column in Arabic RTL", () => {
    const longEnglishResource = {
      ...resource,
      name: "Showcase Panoramic Padel Court",
      profileName: "Showcase 7-a-side Smart Pitch",
    };

    render(
      <ResourceTimeline
        day={day}
        resources={[longEnglishResource]}
        locale="ar"
        direction="rtl"
        canCreate
        t={t}
        onOpen={vi.fn()}
        onEmptySlot={vi.fn()}
      />
    );

    const scrollContainer = screen.getByTestId("resource-timeline");
    expect(scrollContainer).toHaveAttribute("dir", "ltr");

    const lane = document.querySelector<HTMLElement>('[data-resource-id="resource-1"]')!;
    const stickyCell = lane.firstElementChild as HTMLElement;
    expect(stickyCell.className).toContain("w-56");

    const nameEl = within(lane).getByText("Showcase Panoramic Padel Court");
    const profileEl = within(lane).getByText("Showcase 7-a-side Smart Pitch");
    expect(nameEl).toHaveAttribute("dir", "auto");
    expect(profileEl).toHaveAttribute("dir", "auto");
    expect(nameEl.className).toContain("line-clamp-2");
    expect(profileEl.className).toContain("line-clamp-2");
    expect(nameEl.className).not.toContain("truncate");
  });
});
