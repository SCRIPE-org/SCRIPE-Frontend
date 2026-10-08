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
        quantity: 1,
        customerPartyId: "party-1",
        holdExpiresAtUtc: null,
      },
      {
        reservationId: "res-2",
        reservationNumber: "RES-102",
        status: "CheckedIn" as const,
        resourceId: "court-2",
        startUtc: "2020-01-01T09:00:00Z",
        endUtc: "2099-09-12T23:59:59Z", // Active now
        quantity: 1,
        customerPartyId: "party-2",
        holdExpiresAtUtc: null,
      },
      {
        reservationId: "res-3",
        reservationNumber: "RES-103",
        status: "Held" as const,
        resourceId: "court-1",
        startUtc: "2099-09-12T16:00:00Z",
        endUtc: "2099-09-12T17:00:00Z",
        quantity: 1,
        customerPartyId: "party-1",
        holdExpiresAtUtc: "2099-09-12T15:00:00Z",
      },
    ],
  };

  const mockOperationsCalendarRepo = {
    getDay: vi.fn().mockResolvedValue(mockProjection),
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
      items: [{ id: "prof-1", facilityId: "facility-1", operatingPolicy: { timeZoneId: "Africa/Cairo" } }],
      totalCount: 1,
    }),
  };

  const mockFacilityRepo = {
    getAll: vi.fn().mockResolvedValue({
      items: [{ id: "facility-1", name: "Downtown Sports Arena" }],
      totalCount: 1,
    }),
    getById: vi.fn().mockResolvedValue({ id: "facility-1", name: "Downtown Sports Arena" }),
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
      {} as never,
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
    expect(mockOperationsCalendarRepo.getDay).toHaveBeenCalledWith({
      dateLocal: "2026-09-12", timeZoneId: "Africa/Cairo", resourceIds: ["court-1", "court-2", "court-3"],
    });

    // KPI Verification
    expect(overview.kpis.todayReservationsCount).toBe(3);
    expect(overview.kpis.todayReservationsConfirmedCount).toBe(1);
    expect(overview.kpis.todayReservationsCheckedInCount).toBe(1);
    expect(overview.kpis.activeHoldsCount).toBe(1);
    expect(overview.kpis.checkedInNowCount).toBe(1);
    expect(overview.kpis.activeResourcesCount).toBe(2);

    // Hourly Load Verification (24 buckets)
    expect(overview.hourlyLoad).toHaveLength(24);
    expect(overview.hourlyLoad.reduce((total, bucket) => total + bucket.confirmed, 0)).toBe(1);

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

    // Timeline Verification
    expect(overview.timelineDay).not.toBeNull();
    expect(overview.timelineDay?.blocks).toHaveLength(3);
    expect(overview.timelineResources).toHaveLength(3);
    expect(overview.timelineResources?.[0]?.name).toBe("Padel Court 1");
  });

  it("isolates customer party enrichment failures so overview core remains fully functional", async () => {
    const failingCustomerRepo = {
      getById: vi.fn().mockRejectedValue(new Error("Party service network error")),
    };

    const service = new VenueOverviewService(
      {} as never,
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

  it("returns an honest empty state without querying booking operations when no facility exists", async () => {
    mockOperationsCalendarRepo.getDay.mockClear();
    const noFacilities = {
      getAll: vi.fn().mockResolvedValue({ items: [], totalCount: 0 }),
    };
    const service = new VenueOverviewService(
      {} as never,
      mockOperationsCalendarRepo as never,
      mockSchedulableResourceRepo as never,
      mockProfileRepo as never,
      noFacilities as never,
      mockCustomerRepo as never
    );

    const overview = await service.getOverview();

    expect(overview.stage).toBe("empty");
    expect(overview.facilityId).toBe("");
    expect(overview.facilityName).toBe("");
    expect(mockOperationsCalendarRepo.getDay).not.toHaveBeenCalled();
  });

  it("keeps a caller-selected facility instead of silently replacing it with the first list page", async () => {
    const selectedFacilityRepo = {
      getAll: vi.fn().mockResolvedValue({
        items: [{ id: "facility-1", name: "First Facility" }], totalCount: 2,
      }),
      getById: vi.fn().mockResolvedValue({ id: "facility-2", name: "Selected Facility" }),
    };
    const selectedProfiles = {
      getAll: vi.fn().mockResolvedValue({
        items: [{ id: "profile-2", facilityId: "facility-2", operatingPolicy: { timeZoneId: "UTC" } }], totalCount: 1,
      }),
    };
    const selectedResources = {
      getAll: vi.fn().mockResolvedValue({
        items: [{ id: "court-2", name: "Selected Court", facilityResourceProfileId: "profile-2", isPublished: true, isComposite: false }],
        totalCount: 1,
      }),
    };
    const service = new VenueOverviewService(
      {} as never,
      mockOperationsCalendarRepo as never,
      selectedResources as never,
      selectedProfiles as never,
      selectedFacilityRepo as never,
      mockCustomerRepo as never
    );

    const overview = await service.getOverview("facility-2", "2026-09-12");

    expect(overview.facilityId).toBe("facility-2");
    expect(overview.facilityName).toBe("Selected Facility");
    expect(selectedFacilityRepo.getById).toHaveBeenCalledWith("facility-2");
  });

  it("batches a large facility through the bounded calendar contract without losing resources", async () => {
    mockOperationsCalendarRepo.getDay.mockClear();
    const resources = Array.from({ length: 51 }, (_, index) => ({
      id: `court-${index + 1}`,
      name: `Court ${index + 1}`,
      facilityResourceProfileId: "prof-1",
      isPublished: true,
      isComposite: false,
    }));
    const resourceRepo = {
      getAll: vi.fn().mockResolvedValue({ items: resources, totalCount: resources.length }),
    };
    const service = new VenueOverviewService(
      {} as never,
      mockOperationsCalendarRepo as never,
      resourceRepo as never,
      mockProfileRepo as never,
      mockFacilityRepo as never,
      mockCustomerRepo as never
    );

    const overview = await service.getOverview("facility-1", "2026-09-12");

    expect(overview.stage).toBe("ready");
    expect(overview.facilityId).toBe("facility-1");
    expect(mockOperationsCalendarRepo.getDay).toHaveBeenCalledTimes(2);
    expect(mockOperationsCalendarRepo.getDay).toHaveBeenNthCalledWith(1, {
      dateLocal: "2026-09-12", timeZoneId: "Africa/Cairo", resourceIds: resources.slice(0, 50).map((resource) => resource.id),
    });
    expect(mockOperationsCalendarRepo.getDay).toHaveBeenNthCalledWith(2, {
      dateLocal: "2026-09-12", timeZoneId: "Africa/Cairo", resourceIds: resources.slice(50).map((resource) => resource.id),
    });
  });

  it("refuses to derive partial KPIs when a bounded calendar batch is truncated", async () => {
    const truncatedCalendarRepo = {
      getDay: vi.fn().mockResolvedValue({ ...mockProjection, isTruncated: true }),
    };
    const service = new VenueOverviewService(
      truncatedCalendarRepo as never,
      mockSchedulableResourceRepo as never,
      mockProfileRepo as never,
      mockFacilityRepo as never,
      mockCustomerRepo as never
    );

    const overview = await service.getOverview("facility-1", "2026-09-12");

    expect(overview.stage).toBe("limited");
    expect(overview.kpis.todayReservationsCount).toBe(0);
  });
});
