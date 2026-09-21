import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import { VenueOverviewView } from "./VenueOverviewView";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

describe("VenueOverviewView", () => {
  const mockOverviewState = {
    stage: "ready" as const,
    facilityId: "facility-1",
    facilityName: "Downtown Arena",
    timeZoneId: "Africa/Cairo",
    asOfUtc: "2026-09-12T10:00:00Z",
    localDate: "2026-09-12",
    kpis: {
      todayReservationsCount: 12,
      todayReservationsConfirmedCount: 9,
      todayReservationsCheckedInCount: 3,
      activeHoldsCount: 2,
      nearestHoldExpiryUtc: "2026-09-12T10:15:00Z",
      checkedInNowCount: 3,
      activeResourcesCount: 5,
    },
    hourlyLoad: Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${h.toString().padStart(2, "0")}:00`,
      held: h === 14 ? 1 : 0,
      confirmed: h === 14 ? 2 : 0,
      checkedIn: h === 14 ? 1 : 0,
      completed: 0,
      other: 0,
      total: h === 14 ? 4 : 0,
    })),
    atAGlance: [
      { status: "Confirmed" as const, count: 9 },
      { status: "Held" as const, count: 2 },
      { status: "CheckedIn" as const, count: 3 },
    ],
    upNext: [
      {
        reservationId: "res-101",
        reservationNumber: "RES-9871",
        resourceId: "court-1",
        resourceName: "Padel Court 1",
        customerPartyId: "party-1",
        customerDisplayName: "Hassan Ali",
        status: "Confirmed" as const,
        startUtc: "2026-09-12T12:00:00Z",
        endUtc: "2026-09-12T13:00:00Z",
        startLocal: "2026-09-12T14:00:00",
        endLocal: "2026-09-12T15:00:00",
      },
    ],
    resourceActivity: [
      {
        resourceId: "court-1",
        resourceName: "Padel Court 1",
        facilityId: "facility-1",
        statusLabel: "checkedIn" as const,
        currentOrNextEndUtc: "2026-09-12T15:00:00Z",
        currentOrNextStartUtc: null,
        activeReservationId: "res-101",
      },
      {
        resourceId: "court-2",
        resourceName: "Padel Court 2",
        facilityId: "facility-1",
        statusLabel: "noActiveBooking" as const,
        currentOrNextEndUtc: null,
        currentOrNextStartUtc: null,
        activeReservationId: null,
      },
    ],
    recentActivityDeferred: true as const,
    error: false,
  };

  const mockVenueOverviewService = {
    getOverview: vi.fn().mockResolvedValue(mockOverviewState),
  };

  const mockFacilityRepository = {
    getAll: vi.fn().mockResolvedValue({
      items: [{ id: "facility-1", name: "Downtown Arena" }],
      totalCount: 1,
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getVenueContainer).mockReturnValue({
      venueOverviewService: mockVenueOverviewService,
      facilityRepository: mockFacilityRepository,
      venueAttentionRepository: {
        get: vi.fn().mockResolvedValue({ items: [], totalCount: 0, generatedAtUtc: "2026-09-12T10:00:00Z" }),
      },
    } as never);
  });

  it("renders header, 4 KPI cards, Operational Load chart, Today at a Glance, Up Next, and Resource Activity", async () => {
    render(<VenueOverviewView facilityId="facility-1" localDate="2026-09-12" />);

    await waitFor(() => {
      expect(screen.getByTestId("venue-overview-view")).toBeInTheDocument();
    });

    // Header & Facility Context
    expect(screen.getByRole("heading", { name: "venueOverview.title" })).toBeInTheDocument();
    expect(screen.getByText("Downtown Arena")).toBeInTheDocument();

    // 4 KPI Strip Cards
    expect(screen.getByText("venueOverview.kpis.todayReservations")).toBeInTheDocument();
    expect(screen.getAllByText("12")[0]).toBeInTheDocument();

    expect(screen.getByText("venueOverview.kpis.activeHolds")).toBeInTheDocument();
    expect(screen.getAllByText("2")[0]).toBeInTheDocument();

    expect(screen.getByText("venueOverview.kpis.checkedInNow")).toBeInTheDocument();
    expect(screen.getAllByText("3")).toHaveLength(2); // KPI count + At A Glance count

    expect(screen.getByText("venueOverview.kpis.activeResources")).toBeInTheDocument();
    expect(screen.getByText("5")).toBeInTheDocument();

    // Main Operational Load Chart
    expect(screen.getByText("venueOverview.operationalLoad.title")).toBeInTheDocument();

    // Up Next List
    expect(screen.getByText("venueOverview.upNext.title")).toBeInTheDocument();
    expect(screen.getAllByText("Padel Court 1").length).toBeGreaterThan(0);
    expect(screen.getByText("Hassan Ali")).toBeInTheDocument();
    expect(screen.getByText("RES-9871")).toBeInTheDocument();

    // Resource Activity List
    expect(screen.getByText("venueOverview.resourceActivity.title")).toBeInTheDocument();
    expect(screen.getByText("venueOverview.resourceActivity.status.noActiveBooking")).toBeInTheDocument();

    // Deferred Recent Activity Banner
    expect(screen.getByTestId("recent-activity-deferred")).toBeInTheDocument();
    expect(screen.getByText("venueOverview.deferred.recentActivity")).toBeInTheDocument();
  });

  it("renders an explicit empty state instead of a fictional facility", async () => {
    mockVenueOverviewService.getOverview.mockResolvedValue({
      ...mockOverviewState,
      stage: "empty",
      facilityId: "",
      facilityName: "",
    });

    render(<VenueOverviewView />);

    await waitFor(() => {
      expect(screen.getByTestId("venue-overview-empty")).toBeInTheDocument();
    });
    expect(screen.getByText("venueOverview.empty.noFacilityTitle")).toBeInTheDocument();
    expect(screen.queryByText("Main Facility")).not.toBeInTheDocument();
  });

  it("renders a transparent bounded-overview message instead of partial operational data", async () => {
    mockVenueOverviewService.getOverview.mockResolvedValueOnce({
      ...mockOverviewState,
      stage: "limited",
      error: false,
    });

    render(<VenueOverviewView />);

    await waitFor(() => {
      expect(screen.getByTestId("venue-overview-limited")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("venue-overview-view")).not.toBeInTheDocument();
  });
});
