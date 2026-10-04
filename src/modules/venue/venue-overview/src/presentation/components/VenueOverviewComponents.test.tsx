import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { VenueOverviewHeroTimeline } from "./VenueOverviewHeroTimeline";
import { VenueOverviewLiveFeed } from "./VenueOverviewLiveFeed";
import { VenueOverviewDemandChart } from "./VenueOverviewDemandChart";
import { VenueOverviewStatusDonut } from "./VenueOverviewStatusDonut";
import { VenueOverviewResourcePulse } from "./VenueOverviewResourcePulse";
import { VenueNav } from "@modules/venue/shared/src/presentation/components/VenueNav";

vi.mock("next/navigation", () => ({
  usePathname: vi.fn().mockReturnValue("/venue"),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: vi.fn().mockReturnValue(true),
}));

const mockT = (key: string, values?: Record<string, string | number>) => {
  if (values && "count" in values) return `${key} (${values.count})`;
  return key;
};

describe("VenueOverview Metis-Inspired Components", () => {
  const mockDay = {
    dateLocal: "2026-10-01",
    timeZoneId: "Africa/Cairo",
    fromUtc: "2026-10-01T06:00:00Z",
    toUtc: "2026-10-01T23:00:00Z",
    asOfUtc: "2026-10-01T12:00:00Z",
    isTruncated: false,
    blocks: [
      {
        reservationId: "res-1",
        reservationNumber: "RES-101",
        resourceId: "court-1",
        status: "Confirmed" as const,
        startUtc: "2026-10-01T08:00:00Z",
        endUtc: "2026-10-01T09:30:00Z",
        quantity: 1,
        customerPartyId: "cust-1",
        holdExpiresAtUtc: null,
      },
      {
        reservationId: "res-2",
        reservationNumber: "RES-102",
        resourceId: "court-2",
        status: "CheckedIn" as const,
        startUtc: "2026-10-01T11:00:00Z",
        endUtc: "2026-10-01T13:00:00Z",
        quantity: 1,
        customerPartyId: "cust-2",
        holdExpiresAtUtc: null,
      },
      {
        reservationId: "res-3",
        reservationNumber: "RES-103",
        resourceId: "court-1",
        status: "Held" as const,
        startUtc: "2026-10-01T15:00:00Z",
        endUtc: "2026-10-01T16:00:00Z",
        quantity: 1,
        customerPartyId: "cust-3",
        holdExpiresAtUtc: "2026-10-01T14:45:00Z",
      },
    ],
  };

  const mockResources = [
    {
      id: "court-1",
      name: "Padel Court 1",
      profileId: "prof-1",
      profileName: "Padel",
      facilityId: "fac-1",
      facilityName: "City Club",
      resourceKindCode: "Padel",
      timeZoneId: "Africa/Cairo",
    },
    {
      id: "court-2",
      name: "Football Pitch A",
      profileId: "prof-2",
      profileName: "Football",
      facilityId: "fac-1",
      facilityName: "City Club",
      resourceKindCode: "Football",
      timeZoneId: "Africa/Cairo",
    },
  ];

  it("VenueNav renders all 4 product mental model tabs (Overview, Operations, Setup, Money)", () => {
    render(<VenueNav attentionCount={3} />);

    expect(screen.getByRole("link", { name: /overview/i })).toHaveAttribute("href", "/venue");
    expect(screen.getByRole("link", { name: /operations/i })).toHaveAttribute("href", "/venue/calendar");
    expect(screen.getByRole("link", { name: /setup/i })).toHaveAttribute("href", "/venue/facilities");
    expect(screen.getByRole("link", { name: /money/i })).toBeInTheDocument();
  });

  it("VenueOverviewHeroTimeline renders resource lanes, sports icons, and booking blocks", () => {
    render(
      <VenueOverviewHeroTimeline
        day={mockDay}
        resources={mockResources}
        locale="en"
        direction="ltr"
        t={mockT}
      />
    );

    expect(screen.getByTestId("hero-timeline")).toBeInTheDocument();
    expect(screen.getByText("Padel Court 1")).toBeInTheDocument();
    expect(screen.getByText("Football Pitch A")).toBeInTheDocument();
    expect(screen.getByText("RES-101")).toBeInTheDocument();
    expect(screen.getByText("RES-102")).toBeInTheDocument();
    expect(screen.getByText("RES-103")).toBeInTheDocument();
  });

  it("VenueOverviewLiveFeed renders truthful events from check-ins, holds, bookings, and attention signals", () => {
    const mockUpNext = [
      {
        reservationId: "res-1",
        reservationNumber: "RES-101",
        resourceId: "court-1",
        resourceName: "Padel Court 1",
        customerPartyId: "cust-1",
        customerDisplayName: "Ahmed Hassan",
        status: "Confirmed" as const,
        startUtc: "2026-10-01T14:00:00Z",
        endUtc: "2026-10-01T15:00:00Z",
        startLocal: "2026-10-01T16:00:00",
        endLocal: "2026-10-01T17:00:00",
      },
    ];

    const mockAttention = [
      {
        kind: "HardMaintenanceBlockOverlapsLiveAllocation" as const,
        severity: "High" as const,
        resourceId: "court-1",
        resourceName: "Padel Court 1",
        reservationId: "res-1",
        blockId: "block-1",
        startUtc: "2026-10-01T14:00:00Z",
        endUtc: "2026-10-01T15:00:00Z",
        occurredAtUtc: "2026-10-01T12:00:00Z",
      },
    ];

    render(
      <VenueOverviewLiveFeed
        blocks={mockDay.blocks}
        upNext={mockUpNext}
        attentionSignals={mockAttention}
        timeZoneId="Africa/Cairo"
        t={mockT}
      />
    );

    expect(screen.getByTestId("live-venue-feed")).toBeInTheDocument();
    expect(screen.getByText("venueOverview.liveFeed.guestCheckedIn")).toBeInTheDocument();
    expect(screen.getByText("venueOverview.liveFeed.holdActive")).toBeInTheDocument();
    expect(screen.getByText("venueOverview.liveFeed.bookingConfirmed")).toBeInTheDocument();
    expect(screen.getByText("venueOverview.liveFeed.attentionSignal")).toBeInTheDocument();
  });

  it("VenueOverviewDemandChart renders hourly bar chart correctly with total count", () => {
    const mockBuckets = Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${h.toString().padStart(2, "0")}:00`,
      held: h === 10 ? 1 : 0,
      confirmed: h === 10 ? 2 : 0,
      checkedIn: 0,
      completed: 0,
      other: 0,
      total: h === 10 ? 3 : 0,
    }));

    render(<VenueOverviewDemandChart buckets={mockBuckets} t={mockT} />);

    expect(screen.getByTestId("bookings-by-time-chart")).toBeInTheDocument();
    expect(screen.getAllByText(/3/).length).toBeGreaterThan(0);
  });

  it("VenueOverviewStatusDonut renders accurate counts and segments", () => {
    const mockGlance = [
      { status: "Confirmed" as const, count: 5 },
      { status: "CheckedIn" as const, count: 2 },
      { status: "Held" as const, count: 1 },
      { status: "Completed" as const, count: 4 },
      { status: "Cancelled" as const, count: 1 },
    ];

    render(<VenueOverviewStatusDonut items={mockGlance} t={mockT} />);

    expect(screen.getByTestId("today-booking-status-card")).toBeInTheDocument();
    expect(screen.getAllByText("13")[0]).toBeInTheDocument(); // total 5+2+1+4+1 = 13
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  it("VenueOverviewResourcePulse renders operational summary and never labels idle as Available", () => {
    const mockActivities = [
      {
        resourceId: "court-1",
        resourceName: "Padel Court 1",
        facilityId: "fac-1",
        statusLabel: "checkedIn" as const,
        currentOrNextEndUtc: "2026-10-01T14:00:00Z",
        currentOrNextStartUtc: null,
        activeReservationId: "res-1",
      },
      {
        resourceId: "court-2",
        resourceName: "Football Pitch A",
        facilityId: "fac-1",
        statusLabel: "noActiveBooking" as const,
        currentOrNextEndUtc: null,
        currentOrNextStartUtc: null,
        activeReservationId: null,
      },
    ];

    render(<VenueOverviewResourcePulse items={mockActivities} t={mockT} />);

    expect(screen.getByTestId("resource-pulse-card")).toBeInTheDocument();
    expect(screen.getByText("Padel Court 1")).toBeInTheDocument();
    expect(screen.getByText("Football Pitch A")).toBeInTheDocument();
    expect(screen.queryByText("Available")).not.toBeInTheDocument();
    expect(screen.getByText("venueOverview.resourceActivity.status.noActiveBooking")).toBeInTheDocument();
  });
});
