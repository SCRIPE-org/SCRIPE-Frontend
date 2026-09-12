import { describe, expect, it, vi } from "vitest";
import { VenueOverviewService } from "./VenueOverviewService";

describe("VenueOverviewService", () => {
  const mockProjection = {
    facilityId: "facility-1",
    asOfUtc: "2099-09-12T10:00:00Z",
    timeZoneId: "Africa/Cairo",
    operatingHoursWindow: { startLocal: "08:00", endLocal: "23:00" },
    blocks: [
      {
        reservationId: "res-1",
        reservationNumber: "RES-101",
        status: "Confirmed" as const,
        resourceId: "court-1",
        startUtc: "2099-09-12T12:00:00Z",
        endUtc: "2099-09-12T13:00:00Z",
        startLocal: "2099-09-12T14:00:00",
        endLocal: "2099-09-12T15:00:00",
        quantity: 1,
        customerPartyId: "party-1",
      },
      {
        reservationId: "res-2",
        reservationNumber: "RES-102",
        status: "CheckedIn" as const,
        resourceId: "court-2",
        startUtc: "2020-01-01T09:00:00Z",
        endUtc: "2099-09-12T23:59:59Z", // Active now
        startLocal: "2099-09-12T11:00:00",
        endLocal: "2099-09-12T12:00:00",
        quantity: 1,
        customerPartyId: "party-2",
      },
      {
        reservationId: "res-3",
        reservationNumber: "RES-103",
        status: "Held" as const,
        resourceId: "court-1",
        startUtc: "2099-09-12T16:00:00Z",
        endUtc: "2099-09-12T17:00:00Z",
        startLocal: "2099-09-12T18:00:00",
        endLocal: "2099-09-12T19:00:00",
        quantity: 1,
        customerPartyId: "party-1",
      },
    ],
  };

  const mockOperationsCalendarRepo = {
    getDayProjection: vi.fn().mockResolvedValue(mockProjection),
  };

  const mockSchedulableResourceRepo = {
    getAll: vi.fn().mockResolvedValue({
      items: [
        { id: "court-1", name: "Padel Court 1", facilityResourceProfileId: "prof-1", isPublished: true, isComposite: false },
        { id: "court-2", name: "Padel Court 2", facilityResourceProfileId: "prof-1", isPublished: true, isComposite: false },
        { id: "court-3", name: "Tennis Court 1", facilityResourceProfileId: "prof-1", isPublished: true, isComposite: false },
      ],
      totalCount: 3,
    }),
  };

  const mockProfileRepo = {
    getAll: vi.fn().mockResolvedValue({
      items: [{ id: "prof-1", facilityId: "facility-1" }],
      totalCount: 1,
    }),
  };

  const mockFacilityRepo = {
    getAll: vi.fn().mockResolvedValue({
      items: [{ id: "facility-1", name: "Downtown Sports Arena" }],
      totalCount: 1,
    }),
  };

  const mockCustomerRepo = {
    getById: vi.fn().mockImplementation(async (id: string) => {
      if (id === "party-1") return { id: "party-1", displayName: "Tarek Mansour" };
      if (id === "party-2") return { id: "party-2", displayName: "Sherif Aly" };
      return null;
    }),
  };

  it("derives all overview metrics, hourly load, at a glance, up next, and resource activity from authoritative projection", async () => {
    const service = new VenueOverviewService(
      mockOperationsCalendarRepo as never,
      mockSchedulableResourceRepo as never,
      mockProfileRepo as never,
      mockFacilityRepo as never,
      mockCustomerRepo as never
    );

    const overview = await service.getOverview("facility-1", "2026-09-12");

    expect(overview.stage).toBe("ready");
    expect(overview.facilityId).toBe("facility-1");
    expect(overview.facilityName).toBe("Downtown Sports Arena");
    expect(overview.timeZoneId).toBe("Africa/Cairo");

    // KPI Verification
    expect(overview.kpis.todayReservationsCount).toBe(3);
    expect(overview.kpis.todayReservationsConfirmedCount).toBe(1);
    expect(overview.kpis.todayReservationsCheckedInCount).toBe(1);
    expect(overview.kpis.activeHoldsCount).toBe(1);
    expect(overview.kpis.checkedInNowCount).toBe(1);
    expect(overview.kpis.activeResourcesCount).toBe(2);

    // Hourly Load Verification (24 buckets)
    expect(overview.hourlyLoad).toHaveLength(24);
    const hour14Bucket = overview.hourlyLoad.find((b) => b.hour === 14);
    expect(hour14Bucket?.confirmed).toBe(1);

    // At A Glance Verification
    const confirmedGlance = overview.atAGlance.find((item) => item.status === "Confirmed");
    expect(confirmedGlance?.count).toBe(1);
    const checkedInGlance = overview.atAGlance.find((item) => item.status === "CheckedIn");
    expect(checkedInGlance?.count).toBe(1);

    // Up Next Verification (sorted chronologically)
    expect(overview.upNext).toHaveLength(3);
    expect(overview.upNext[0]!.reservationNumber).toBe("RES-102");
    expect(overview.upNext[0]!.customerDisplayName).toBe("Sherif Aly");

    // Resource Activity Verification (NEVER uses 'Available' for booking absence)
    expect(overview.resourceActivity).toHaveLength(3);

    const court1Activity = overview.resourceActivity.find((r) => r.resourceId === "court-1");
    expect(court1Activity?.statusLabel).toBe("nextBooking");

    const court2Activity = overview.resourceActivity.find((r) => r.resourceId === "court-2");
    expect(court2Activity?.statusLabel).toBe("checkedIn");

    const court3Activity = overview.resourceActivity.find((r) => r.resourceId === "court-3");
    expect(court3Activity?.statusLabel).toBe("noActiveBooking");
    expect(court3Activity?.statusLabel).not.toBe("Available" as never);
  });

  it("isolates customer party enrichment failures so overview core remains fully functional", async () => {
    const failingCustomerRepo = {
      getById: vi.fn().mockRejectedValue(new Error("Party service network error")),
    };

    const service = new VenueOverviewService(
      mockOperationsCalendarRepo as never,
      mockSchedulableResourceRepo as never,
      mockProfileRepo as never,
      mockFacilityRepo as never,
      failingCustomerRepo as never
    );

    const overview = await service.getOverview("facility-1", "2026-09-12");

    expect(overview.stage).toBe("ready");
    expect(overview.upNext[0]!.customerDisplayName).toBeNull();
    expect(overview.kpis.todayReservationsCount).toBe(3);
  });
});
