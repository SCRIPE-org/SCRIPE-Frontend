import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import { useResourceDetailViewModel } from "./useResourceDetailViewModel";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

const mockResource = {
  id: "res-1",
  facilityResourceProfileId: "prof-1",
  name: "Padel Court 1",
  isComposite: false,
  isPublished: true,
  capacity: { maxConcurrentUsage: 1, allocationMode: "SingleUnit" as const },
  slotPolicy: {
    slotDurationMinutes: 60,
    startIncrementMinutes: 60,
    timeZoneId: "Africa/Cairo",
    allowMultiSlot: false,
  },
  data: {},
};

const mockProfile = {
  id: "prof-1",
  facilityId: "fac-1",
  code: "PADEL",
  name: "Padel",
  resourceKindCode: "Padel",
  operatingPolicy: { timeZoneId: "Africa/Cairo" },
};

const mockFacility = {
  id: "fac-1",
  name: "Nasr City",
};

const mockCalendar247 = {
  id: "cal-1",
  resourceId: "res-1",
  timeZoneId: "Africa/Cairo",
  effectiveFrom: "2026-01-01",
  effectiveTo: null,
  windows: [
    {
      dayOfWeek: "Sunday" as const,
      startLocal: "00:00",
      endLocal: "23:59",
      capacityOverride: null,
    },
    {
      dayOfWeek: "Monday" as const,
      startLocal: "00:00",
      endLocal: "23:59",
      capacityOverride: null,
    },
    {
      dayOfWeek: "Tuesday" as const,
      startLocal: "00:00",
      endLocal: "23:59",
      capacityOverride: null,
    },
    {
      dayOfWeek: "Wednesday" as const,
      startLocal: "00:00",
      endLocal: "23:59",
      capacityOverride: null,
    },
    {
      dayOfWeek: "Thursday" as const,
      startLocal: "00:00",
      endLocal: "23:59",
      capacityOverride: null,
    },
    {
      dayOfWeek: "Friday" as const,
      startLocal: "00:00",
      endLocal: "23:59",
      capacityOverride: null,
    },
    {
      dayOfWeek: "Saturday" as const,
      startLocal: "00:00",
      endLocal: "23:59",
      capacityOverride: null,
    },
  ],
};

const mockPriceConfig = {
  id: "price-1",
  schedulableResourceId: "res-1",
  displayName: "Padel Court 1 Rate",
  currencyCode: "EGP",
  unitPrice: 800,
  taxCategoryId: null,
};

function createMockContainer() {
  return {
    facilityRepository: {
      getById: vi.fn().mockResolvedValue(mockFacility),
    },
    facilityResourceProfileRepository: {
      getById: vi.fn().mockResolvedValue(mockProfile),
    },
    schedulableResourceRepository: {
      getById: vi.fn().mockResolvedValue(mockResource),
      update: vi.fn().mockResolvedValue(undefined),
    },
    availabilityRepository: {
      getCurrentCalendar: vi.fn().mockResolvedValue(mockCalendar247),
      saveCalendar: vi.fn().mockResolvedValue(undefined),
      getBlocks: vi.fn().mockResolvedValue([]),
      createBlock: vi.fn().mockResolvedValue("block-1"),
      deleteBlock: vi.fn().mockResolvedValue(undefined),
    },
    commercialPricingRepository: {
      getResourceConfiguration: vi.fn().mockResolvedValue(mockPriceConfig),
      getTaxCategories: vi
        .fn()
        .mockResolvedValue([{ id: "tax-1", code: "VAT_14", displayName: "VAT 14%" }]),
      configureResourcePrice: vi.fn().mockResolvedValue(undefined),
    },
  };
}

describe("useResourceDetailViewModel", () => {
  let mockContainer: ReturnType<typeof createMockContainer>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockContainer = createMockContainer();
    vi.mocked(getVenueContainer).mockReturnValue(
      mockContainer as unknown as ReturnType<typeof getVenueContainer>
    );
  });

  it("loads resource, profile, facility, calendar, priceConfig and detects 24/7 status", async () => {
    const { result } = renderHook(() => useResourceDetailViewModel("res-1"));

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.resource?.name).toBe("Padel Court 1");
    expect(result.current.profile?.name).toBe("Padel");
    expect(result.current.facility?.name).toBe("Nasr City");
    expect(result.current.isCalendar247).toBe(true);
    expect(result.current.priceConfig?.unitPrice).toBe(800);
  });

  it("updates general info (name, capacity)", async () => {
    const { result } = renderHook(() => useResourceDetailViewModel("res-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.updateGeneral({ name: "Court 1 - Premium", capacity: 4 });
    });

    expect(success).toBe(true);
    expect(mockContainer.schedulableResourceRepository.update).toHaveBeenCalledWith(
      "res-1",
      expect.objectContaining({
        name: "Court 1 - Premium",
        capacity: expect.objectContaining({ maxConcurrentUsage: 4 }),
      })
    );
  });

  it("updates working hours to custom windows", async () => {
    const { result } = renderHook(() => useResourceDetailViewModel("res-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.updateWorkingHours({
        isOpen247: false,
        windows: [
          { dayOfWeek: "Sunday", startLocal: "08:00", endLocal: "23:00", capacityOverride: null },
        ],
      });
    });

    expect(success).toBe(true);
    expect(mockContainer.availabilityRepository.saveCalendar).toHaveBeenCalledWith(
      mockCalendar247,
      expect.objectContaining({
        windows: [
          { dayOfWeek: "Sunday", startLocal: "08:00", endLocal: "23:00", capacityOverride: null },
        ],
      })
    );
  });

  it("updates booking rules (slot duration and increment)", async () => {
    const { result } = renderHook(() => useResourceDetailViewModel("res-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.updateBookingRules({
        slotDurationMinutes: 90,
        startIncrementMinutes: 90,
      });
    });

    expect(success).toBe(true);
    expect(mockContainer.schedulableResourceRepository.update).toHaveBeenCalledWith(
      "res-1",
      expect.objectContaining({
        slotPolicy: expect.objectContaining({
          slotDurationMinutes: 90,
          startIncrementMinutes: 90,
        }),
      })
    );
  });

  it("updates pricing configuration per slot", async () => {
    const { result } = renderHook(() => useResourceDetailViewModel("res-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let success = false;
    await act(async () => {
      success = await result.current.updatePricing({
        unitPrice: 850,
        currencyCode: "EGP",
        taxCategoryId: "tax-1",
      });
    });

    expect(success).toBe(true);
    expect(mockContainer.commercialPricingRepository.configureResourcePrice).toHaveBeenCalledWith(
      expect.objectContaining({
        schedulableResourceId: "res-1",
        unitPrice: 850,
        currencyCode: "EGP",
        taxCategoryId: "tax-1",
      })
    );
  });

  it("adds and deletes closures (maintenance and blackout)", async () => {
    const { result } = renderHook(() => useResourceDetailViewModel("res-1"));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let addSuccess = false;
    await act(async () => {
      addSuccess = await result.current.addClosure({
        kind: "maintenance",
        startLocal: "2026-10-10T10:00:00",
        endLocal: "2026-10-10T12:00:00",
        reason: "Glass polishing",
      });
    });

    expect(addSuccess).toBe(true);
    expect(mockContainer.availabilityRepository.createBlock).toHaveBeenCalledWith(
      "maintenance",
      expect.objectContaining({
        resourceId: "res-1",
        reason: "Glass polishing",
      })
    );

    const blockToDelete = {
      id: "block-1",
      resourceId: "res-1",
      startUtc: "2026-10-10T10:00:00Z",
      endUtc: "2026-10-10T12:00:00Z",
      timeZoneId: "UTC",
      reason: "Glass polishing",
      hardBlock: true,
      version: 1,
      createdAt: "2026-10-01T00:00:00Z",
    };

    let delSuccess = false;
    await act(async () => {
      delSuccess = await result.current.deleteClosure("maintenance", blockToDelete);
    });

    expect(delSuccess).toBe(true);
    expect(mockContainer.availabilityRepository.deleteBlock).toHaveBeenCalledWith(
      "maintenance",
      blockToDelete
    );
  });
});
