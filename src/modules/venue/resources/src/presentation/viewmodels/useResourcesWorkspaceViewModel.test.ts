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
    vi.mocked(getVenueContainer).mockReturnValue(mockContainer as unknown as ReturnType<typeof getVenueContainer>);
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
    expect(mockContainer.commercialPricingRepository.configureResourcePrice).toHaveBeenCalledTimes(2);
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
});
