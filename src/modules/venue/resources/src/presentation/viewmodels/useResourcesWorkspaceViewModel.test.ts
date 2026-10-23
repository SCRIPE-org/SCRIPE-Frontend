import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import { useResourcesWorkspaceViewModel } from "./useResourcesWorkspaceViewModel";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

const mockFacility = {
  id: "fac-1",
  code: "NASR_CITY",
  name: "Nasr City",
  venueProfileId: "vp-1",
};

const mockProfile = {
  id: "prof-1",
  facilityId: "fac-1",
  code: "PADEL",
  name: "Padel",
  resourceKindCode: "Padel",
  operatingPolicy: { timeZoneId: "Africa/Cairo" },
};

const mockResource1 = {
  id: "res-1",
  facilityResourceProfileId: "prof-1",
  name: "Padel Court 1",
  isComposite: false,
  isPublished: true,
  capacity: { maxConcurrentUsage: 1, allocationMode: "SingleUnit" },
  slotPolicy: {
    slotDurationMinutes: 60,
    startIncrementMinutes: 60,
    timeZoneId: "Africa/Cairo",
    allowMultiSlot: false,
  },
};

const mockResource2 = {
  id: "res-2",
  facilityResourceProfileId: "prof-1",
  name: "Padel Court 2",
  isComposite: false,
  isPublished: true,
  capacity: { maxConcurrentUsage: 1, allocationMode: "SingleUnit" },
  slotPolicy: {
    slotDurationMinutes: 90,
    startIncrementMinutes: 90,
    timeZoneId: "Africa/Cairo",
    allowMultiSlot: false,
  },
};

const mockComposite = {
  id: "res-comp",
  facilityResourceProfileId: "prof-1",
  name: "Combined Court",
  isComposite: true,
  isPublished: true,
};

function createMockContainer() {
  return {
    facilityRepository: {
      getAll: vi.fn().mockResolvedValue({ items: [mockFacility], totalCount: 1 }),
      create: vi.fn().mockResolvedValue("fac-new"),
    },
    facilityResourceProfileRepository: {
      getAll: vi.fn().mockResolvedValue({ items: [mockProfile], totalCount: 1 }),
      create: vi.fn().mockResolvedValue("prof-new"),
    },
    schedulableResourceRepository: {
      getAll: vi.fn().mockResolvedValue({
        items: [mockResource1, mockResource2, mockComposite],
        totalCount: 3,
      }),
      create: vi.fn().mockResolvedValue("res-new"),
      update: vi.fn().mockResolvedValue(undefined),
      publish: vi.fn().mockResolvedValue(undefined),
    },
    availabilityRepository: {
      saveCalendar: vi.fn().mockResolvedValue(undefined),
    },
    commercialPricingRepository: {
      getResourceConfiguration: vi.fn().mockImplementation(async (id: string) => {
        if (id === "res-1") {
          return { unitPrice: 800, currencyCode: "EGP" };
        }
        return null;
      }),
      configureResourcePrice: vi.fn().mockResolvedValue(undefined),
    },
  };
}

describe("useResourcesWorkspaceViewModel", () => {
  let mockContainer: ReturnType<typeof createMockContainer>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContainer = createMockContainer();
    vi.mocked(getVenueContainer).mockReturnValue(
      mockContainer as unknown as ReturnType<typeof getVenueContainer>
    );
  });

  it("loads facilities, profiles, resources, and pricing, filtering out composite resources", async () => {
    const { result } = renderHook(() => useResourcesWorkspaceViewModel());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.allItems).toHaveLength(2);
    expect(result.current.allItems[0]).toMatchObject({
      id: "res-1",
      name: "Padel Court 1",
      sportType: "Padel",
      facilityName: "Nasr City",
      slotDurationMinutes: 60,
      pricePerSlot: 800,
      currencyCode: "EGP",
    });
    expect(result.current.allItems[1]).toMatchObject({
      id: "res-2",
      name: "Padel Court 2",
      sportType: "Padel",
      slotDurationMinutes: 90,
      pricePerSlot: null,
    });
  });

  it("filters items by facility and search query", async () => {
    const { result } = renderHook(() => useResourcesWorkspaceViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    act(() => {
      result.current.setSearchQuery("Court 2");
    });

    expect(result.current.items).toHaveLength(1);
    expect(result.current.items[0].name).toBe("Padel Court 2");

    act(() => {
      result.current.setSearchQuery("");
      result.current.setSelectedFacilityId("fac-non-existent");
    });

    expect(result.current.items).toHaveLength(0);
  });

  it("executes first-time setup successfully with branch, courts, hours, slot and price", async () => {
    const { result } = renderHook(() => useResourcesWorkspaceViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.executeFirstTimeSetup({
        branchName: "New Zayed Branch",
        sportType: "Padel",
        courts: ["Padel 1", "Padel 2"],
        isOpen247: true,
        slotDurationMinutes: 60,
        startIncrementMinutes: 60,
        pricePerSlot: 700,
        currencyCode: "EGP",
        timeZoneId: "Africa/Cairo",
      });
    });

    expect(success).toBe(true);

    // Facility created
    expect(mockContainer.facilityRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "New Zayed Branch" })
    );

    // Profile created
    expect(mockContainer.facilityResourceProfileRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Padel" })
    );

    // 2 Courts created and published
    expect(mockContainer.schedulableResourceRepository.create).toHaveBeenCalledTimes(2);
    expect(mockContainer.schedulableResourceRepository.publish).toHaveBeenCalledTimes(2);

    // Availability calendar saved for both courts
    expect(mockContainer.availabilityRepository.saveCalendar).toHaveBeenCalledTimes(2);

    // Pricing configured for both courts
    expect(mockContainer.commercialPricingRepository.configureResourcePrice).toHaveBeenCalledTimes(
      2
    );
  });

  it("reuses existing branch and profile if names match", async () => {
    const { result } = renderHook(() => useResourcesWorkspaceViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.executeFirstTimeSetup({
        branchName: "Nasr City",
        sportType: "Padel",
        courts: ["Court 3"],
        isOpen247: false,
        customWorkingHours: { opensAt: "08:00", closesAt: "23:00", days: [0, 1, 2, 3, 4, 5, 6] },
        slotDurationMinutes: 90,
        startIncrementMinutes: 90,
        pricePerSlot: 500,
        currencyCode: "EGP",
        timeZoneId: "Africa/Cairo",
      });
    });

    expect(success).toBe(true);
    // Facility not recreated
    expect(mockContainer.facilityRepository.create).not.toHaveBeenCalled();
    // Profile not recreated
    expect(mockContainer.facilityResourceProfileRepository.create).not.toHaveBeenCalled();
    // Court created
    expect(mockContainer.schedulableResourceRepository.create).toHaveBeenCalledTimes(1);
    expect(mockContainer.availabilityRepository.saveCalendar).toHaveBeenCalledWith(
      null,
      expect.objectContaining({
        windows: expect.arrayContaining([
          expect.objectContaining({ startLocal: "08:00", endLocal: "23:00" }),
        ]),
      })
    );
  });

  it("calculates source-backed operational metrics correctly", async () => {
    const { result } = renderHook(() => useResourcesWorkspaceViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metrics).toEqual({
      totalSpaces: 2,
      activeSpaces: 1, // res-1 has price 800 and isPublished true; res-2 has no price
      readySpaces: 1,
      activatingSpaces: 0,
      setupRequired: 1,
      branchCount: 1,
    });
  });

  it("handles partial failure during multi-court creation without reporting complete success", async () => {
    // Make second court creation fail
    mockContainer.schedulableResourceRepository.create = vi
      .fn()
      .mockResolvedValueOnce("res-ok")
      .mockRejectedValueOnce(new Error("Database unique constraint violation"));

    const { result } = renderHook(() => useResourcesWorkspaceViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = true;
    await act(async () => {
      success = await result.current.executeFirstTimeSetup({
        branchName: "Nasr City",
        sportType: "Padel",
        courts: ["Court A", "Court B"],
        isOpen247: true,
        slotDurationMinutes: 60,
        startIncrementMinutes: 60,
        pricePerSlot: 600,
        currencyCode: "EGP",
        timeZoneId: "Africa/Cairo",
      });
    });

    expect(success).toBe(false);
    expect(result.current.lastSetupResults).toHaveLength(2);
    expect(result.current.lastSetupResults[0]).toMatchObject({
      name: "Court A",
      success: true,
      resourceId: "res-ok",
    });
    expect(result.current.lastSetupResults[1]).toMatchObject({
      name: "Court B",
      success: false,
      stepFailed: "create",
      error: "Database unique constraint violation",
    });
    expect(result.current.error).toContain("Partial setup");
  });

  it("supports direct facilityId selection for onboarding into an existing branch", async () => {
    const { result } = renderHook(() => useResourcesWorkspaceViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.executeFirstTimeSetup({
        branchName: "Different Name In Input",
        facilityId: "fac-1", // Directly specified authorized facility
        sportType: "Padel",
        courts: ["Direct Court 1"],
        isOpen247: true,
        slotDurationMinutes: 60,
        startIncrementMinutes: 60,
        pricePerSlot: 500,
        currencyCode: "EGP",
        timeZoneId: "Africa/Cairo",
      });
    });

    expect(success).toBe(true);
    // Facility was NOT created because facilityId was provided
    expect(mockContainer.facilityRepository.create).not.toHaveBeenCalled();
    expect(mockContainer.schedulableResourceRepository.create).toHaveBeenCalledTimes(1);
  });

  it("recovers from previous partial failure by reusing existing resource IDs and publishing before pricing", async () => {
    const callOrder: string[] = [];
    mockContainer.schedulableResourceRepository.create = vi.fn().mockImplementation(async () => {
      callOrder.push("create");
      return "res-new";
    });
    mockContainer.availabilityRepository.saveCalendar = vi.fn().mockImplementation(async () => {
      callOrder.push("calendar");
    });
    mockContainer.schedulableResourceRepository.publish = vi.fn().mockImplementation(async () => {
      callOrder.push("publish");
    });
    mockContainer.commercialPricingRepository.configureResourcePrice = vi
      .fn()
      .mockImplementation(async () => {
        callOrder.push("pricing");
      });

    const { result } = renderHook(() => useResourcesWorkspaceViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.executeFirstTimeSetup({
        branchName: "Nasr City",
        sportType: "Padel",
        courts: ["Retried Court"],
        isOpen247: true,
        slotDurationMinutes: 60,
        startIncrementMinutes: 60,
        pricePerSlot: 800,
        currencyCode: "EGP",
        timeZoneId: "Africa/Cairo",
        publishImmediately: true,
        existingCourtResources: {
          "Retried Court": "res-existing-from-previous-attempt",
        },
      });
    });

    expect(success).toBe(true);
    // SchedulableResource.create was skipped because resourceId was reused from previous attempt
    expect(mockContainer.schedulableResourceRepository.create).not.toHaveBeenCalled();

    // Verify correct order of operations: calendar -> publish -> pricing
    expect(callOrder).toEqual(["calendar", "publish", "pricing"]);

    // Verify pricing configured with future UTC buffer
    expect(mockContainer.commercialPricingRepository.configureResourcePrice).toHaveBeenCalledWith(
      expect.objectContaining({
        schedulableResourceId: "res-existing-from-previous-attempt",
        unitPrice: 800,
        effectiveFromUtc: expect.any(String),
      })
    );
  });

  it("simulates pricing failure after publication, marking court as Setup Required and preserving resourceId for retry", async () => {
    mockContainer.schedulableResourceRepository.create = vi
      .fn()
      .mockResolvedValue("res-pricing-fail");
    mockContainer.availabilityRepository.saveCalendar = vi.fn().mockResolvedValue(undefined);
    mockContainer.schedulableResourceRepository.publish = vi.fn().mockResolvedValue(undefined);
    mockContainer.commercialPricingRepository.configureResourcePrice = vi
      .fn()
      .mockRejectedValue(new Error("CatalogPricing: service unavailable"));

    const { result } = renderHook(() => useResourcesWorkspaceViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.executeFirstTimeSetup({
        branchName: "Nasr City",
        facilityId: "fac-1",
        sportType: "Padel",
        courts: ["Unpriced Published Court"],
        isOpen247: true,
        slotDurationMinutes: 60,
        startIncrementMinutes: 60,
        pricePerSlot: 500,
        currencyCode: "EGP",
        timeZoneId: "Africa/Cairo",
        publishImmediately: true,
      });
    });

    // Overall wizard fails due to pricing failure
    expect(success).toBe(false);
    expect(result.current.error).toContain("Partial setup: Some courts failed");

    // Court result records pricing step failure and preserves resourceId
    const pricingFailure = result.current.lastSetupResults.find(
      (r) => r.name === "Unpriced Published Court"
    );
    expect(pricingFailure).toBeDefined();
    expect(pricingFailure?.success).toBe(false);
    expect(pricingFailure?.stepFailed).toBe("pricing");
    expect(pricingFailure?.resourceId).toBe("res-pricing-fail");
    expect(pricingFailure?.error).toBe("CatalogPricing: service unavailable");

    // Publication succeeded before pricing failure
    expect(mockContainer.schedulableResourceRepository.publish).toHaveBeenCalledWith(
      "res-pricing-fail"
    );
  });

  it("fails safely and truthfully on 409 conflict when no persisted resourceId exists (does not hijack existing resources by name)", async () => {
    mockContainer.schedulableResourceRepository.create = vi
      .fn()
      .mockRejectedValue(
        new Error("409 Conflict: SchedulableResource with name 'Padel Court 1' already exists")
      );

    const { result } = renderHook(() => useResourcesWorkspaceViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.executeFirstTimeSetup({
        branchName: "Nasr City",
        facilityId: "fac-1",
        sportType: "Padel",
        courts: ["Padel Court 1"],
        isOpen247: true,
        slotDurationMinutes: 60,
        startIncrementMinutes: 60,
        pricePerSlot: 800,
        currencyCode: "EGP",
        timeZoneId: "Africa/Cairo",
        publishImmediately: true,
      });
    });

    // Fails safely without hijacking arbitrary resource res-1
    expect(success).toBe(false);
  });

  it("uses persisted resourceId as primary identity during retry, updating name if edited without recreating", async () => {
    mockContainer.schedulableResourceRepository.update = vi.fn().mockResolvedValue(undefined);

    const { result } = renderHook(() => useResourcesWorkspaceViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.executeFirstTimeSetup({
        branchName: "Nasr City",
        facilityId: "fac-1",
        sportType: "Padel",
        courts: ["Padel Court 1 Renamed"],
        courtItems: [
          {
            clientKey: "court-1",
            name: "Padel Court 1 Renamed",
            resourceId: "res-persisted-1",
            isCalendarSaved: true,
            isPublished: true,
            isPriceConfigured: false,
          },
        ],
        isOpen247: true,
        slotDurationMinutes: 60,
        startIncrementMinutes: 60,
        pricePerSlot: 800,
        currencyCode: "EGP",
        timeZoneId: "Africa/Cairo",
        publishImmediately: true,
      });
    });

    expect(success).toBe(true);
    // Did NOT recreate resource
    expect(mockContainer.schedulableResourceRepository.create).not.toHaveBeenCalled();
    // Updated name of existing resource
    expect(mockContainer.schedulableResourceRepository.update).toHaveBeenCalledWith(
      "res-persisted-1",
      expect.objectContaining({
        name: "Padel Court 1 Renamed",
      })
    );
    // Skipped already-saved calendar and already-published steps
    expect(mockContainer.availabilityRepository.saveCalendar).not.toHaveBeenCalled();
    expect(mockContainer.schedulableResourceRepository.publish).not.toHaveBeenCalled();
    // Configured remaining pricing step
    expect(mockContainer.commercialPricingRepository.configureResourcePrice).toHaveBeenCalledWith(
      expect.objectContaining({ schedulableResourceId: "res-persisted-1" })
    );
  });

  it("creates a fresh resource when court is renamed rather than reusing previous ID", async () => {
    mockContainer.schedulableResourceRepository.create = vi.fn().mockResolvedValue("res-renamed");

    const { result } = renderHook(() => useResourcesWorkspaceViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.executeFirstTimeSetup({
        branchName: "Nasr City",
        facilityId: "fac-1",
        sportType: "Padel",
        courts: ["Renamed Court Name"], // NOT in existingCourtResources
        isOpen247: true,
        slotDurationMinutes: 60,
        startIncrementMinutes: 60,
        pricePerSlot: 500,
        currencyCode: "EGP",
        timeZoneId: "Africa/Cairo",
        publishImmediately: true,
        existingCourtResources: {
          "Old Court Name": "res-old",
        },
      });
    });

    expect(success).toBe(true);
    // A fresh court creation was executed for the renamed court
    expect(mockContainer.schedulableResourceRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Renamed Court Name" })
    );
  });

  it("verifies pricing effectiveFromUtc satisfies future UTC contract without past-time violations", async () => {
    let capturedEffectiveUtc: string | undefined;
    mockContainer.commercialPricingRepository.configureResourcePrice = vi
      .fn()
      .mockImplementation(async (params) => {
        capturedEffectiveUtc = params.effectiveFromUtc;
      });

    const beforeCall = Date.now();
    const { result } = renderHook(() => useResourcesWorkspaceViewModel());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await act(async () => {
      await result.current.executeFirstTimeSetup({
        branchName: "Nasr City",
        facilityId: "fac-1",
        sportType: "Padel",
        courts: ["Buffer Court"],
        isOpen247: true,
        slotDurationMinutes: 60,
        startIncrementMinutes: 60,
        pricePerSlot: 600,
        currencyCode: "EGP",
        timeZoneId: "Africa/Cairo",
        publishImmediately: true,
      });
    });

    expect(capturedEffectiveUtc).toBeDefined();
    const parsedEffectiveMs = new Date(capturedEffectiveUtc!).getTime();

    // Verify it is strictly in the future relative to the call time (protecting against clock skew / past time rejection)
    expect(parsedEffectiveMs).toBeGreaterThan(beforeCall);
    // Buffer is approximately +15 seconds (between 14s and 16s ahead)
    const diffSeconds = (parsedEffectiveMs - beforeCall) / 1000;
    expect(diffSeconds).toBeGreaterThanOrEqual(14);
    expect(diffSeconds).toBeLessThanOrEqual(16);
  });
});
