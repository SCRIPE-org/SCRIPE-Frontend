import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import { useBookingWorkspaceViewModel } from "./useBookingWorkspaceViewModel";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

const facility = { id: "facility-1", name: "Downtown" };
const profile = {
  id: "profile-1",
  facilityId: "facility-1",
  name: "Indoor Court",
  resourceKindCode: "court",
  operatingPolicy: { timeZoneId: "Africa/Cairo" },
  usageTypes: [{ code: "training", label: "Training" }],
};
const resource = {
  id: "resource-1",
  name: "Court 1",
  facilityResourceProfileId: "profile-1",
  isPublished: true,
  isComposite: false,
};
const customer = { id: "party-1", type: "Person", displayName: "Mona Hassan" };
const availability = {
  resourceId: "resource-1",
  resourceName: "Court 1",
  timeZoneId: "Africa/Cairo",
  startUtc: "2026-09-10T07:00:00Z",
  endUtc: "2026-09-10T08:00:00Z",
  requestedQuantity: 1,
  isAvailable: true,
  decidingLayer: "BaseCalendar" as const,
  reasonCode: "Available",
  maximumCapacity: 2,
  consumedCapacity: 0,
  remainingCapacity: 2,
  asOfUtc: "2026-09-02T00:00:00Z",
};

function makeContainer() {
  return {
    facilityRepository: { getAll: vi.fn().mockResolvedValue({ items: [facility] }) },
    facilityResourceProfileRepository: { getAll: vi.fn().mockResolvedValue({ items: [profile] }) },
    schedulableResourceRepository: { getAll: vi.fn().mockResolvedValue({ items: [resource] }) },
    availabilityRepository: { search: vi.fn().mockResolvedValue(availability) },
    commercialPricingRepository: {
      getResourceConfiguration: vi.fn().mockResolvedValue({
        offeringId: "offering-1",
        currencyCode: "EGP",
      }),
      calculateQuote: vi.fn().mockResolvedValue({
        id: "quote-1",
        quoteNumber: "Q-1",
        currencyCode: "EGP",
        grandTotal: 250,
        expiresAtUtc: "2999-09-10T08:00:00Z",
      }),
      overrideQuote: vi.fn().mockResolvedValue({ overriddenGrandTotal: 230 }),
    },
    customerRepository: {
      search: vi.fn().mockResolvedValue([customer]),
      getById: vi.fn().mockResolvedValue(customer),
    },
    bookingRepository: {
      createDraft: vi.fn().mockResolvedValue({ id: "reservation-1" }),
      createHold: vi.fn().mockResolvedValue({
        reservationId: "reservation-1",
        bookingHoldId: "hold-1",
        expiresAtUtc: "2999-09-10T07:15:00Z",
      }),
      getReservation: vi.fn()
        .mockResolvedValueOnce({ id: "reservation-1", reservationNumber: "RES-1", status: "Held" })
        .mockResolvedValueOnce({ id: "reservation-1", reservationNumber: "RES-1", status: "Confirmed" }),
      confirm: vi.fn().mockResolvedValue({ reservationId: "reservation-1", bookingHoldId: "hold-1" }),
    },
  };
}

async function prepareSelection(result: { current: ReturnType<typeof useBookingWorkspaceViewModel> }) {
  await waitFor(() => expect(result.current.setupLoading).toBe(false));
  await act(async () => { await result.current.selectCustomer("party-1"); });
  act(() => result.current.setCriteria({ date: "2026-09-10" }));
  await act(async () => { await result.current.searchAvailability(); });
  await act(async () => { await result.current.selectCandidate(result.current.state.candidates[0]); });
}

describe("useBookingWorkspaceViewModel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("honors a calendar resource/date/time prefill while keeping Availability Search authoritative", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel({
      facilityId: "facility-1",
      resourceId: "resource-1",
      date: "2026-09-10",
      startTime: "10:30",
      durationMinutes: 90,
    }));

    await waitFor(() => expect(result.current.setupLoading).toBe(false));
    await act(async () => { await result.current.selectCustomer("party-1"); });
    await act(async () => { await result.current.searchAvailability(); });

    expect(result.current.criteria).toMatchObject({ resourceId: "resource-1", date: "2026-09-10", startTime: "10:30", durationMinutes: 90 });
    expect(container.availabilityRepository.search).toHaveBeenCalledTimes(1);
    expect(container.bookingRepository.createDraft).not.toHaveBeenCalled();
  });

  it("keeps safe defaults when optional route prefill values are absent", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel({ durationMinutes: undefined }));

    await waitFor(() => expect(result.current.setupLoading).toBe(false));
    expect(result.current.criteria.durationMinutes).toBe(60);
    expect(result.current.criteria.startTime).toBe("09:00");
  });

  it("hydrates the selected Party and maps matching resources through existing Availability Search", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());

    await waitFor(() => expect(result.current.setupLoading).toBe(false));
    await act(async () => { await result.current.selectCustomer("party-1"); });
    act(() => result.current.setCriteria({ date: "2026-09-10" }));
    await act(async () => { await result.current.searchAvailability(); });

    expect(container.customerRepository.getById).toHaveBeenCalledWith("party-1");
    expect(container.availabilityRepository.search).toHaveBeenCalledWith({
      resourceId: "resource-1",
      timeZoneId: "Africa/Cairo",
      startLocal: "2026-09-10T09:00",
      endLocal: "2026-09-10T10:00",
      quantity: 1,
    });
    expect(result.current.state.stage).toBe("results");
    expect(result.current.state.candidates[0].facilityName).toBe("Downtown");
  });

  it("represents a no-availability response without manufacturing an available candidate", async () => {
    const container = makeContainer();
    container.availabilityRepository.search.mockResolvedValue({ ...availability, isAvailable: false, remainingCapacity: 0 });
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());

    await waitFor(() => expect(result.current.setupLoading).toBe(false));
    await act(async () => { await result.current.selectCustomer("party-1"); });
    act(() => result.current.setCriteria({ date: "2026-09-10" }));
    await act(async () => { await result.current.searchAvailability(); });

    expect(result.current.state.stage).toBe("noAvailability");
    expect(result.current.state.candidates[0].isAvailable).toBe(false);
  });

  it("maps a complete availability network failure to a retryable workspace error", async () => {
    const container = makeContainer();
    container.availabilityRepository.search.mockRejectedValue(new Error("Availability service unavailable"));
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());

    await waitFor(() => expect(result.current.setupLoading).toBe(false));
    await act(async () => { await result.current.selectCustomer("party-1"); });
    act(() => result.current.setCriteria({ date: "2026-09-10" }));
    await act(async () => { await result.current.searchAvailability(); });

    expect(result.current.state.stage).toBe("error");
    expect(result.current.state.errorMessage).toBe("Availability service unavailable");
  });

  it("recovers from the real Search-to-Hold race and explains that a new search is required", async () => {
    const container = makeContainer();
    const conflict = Object.assign(new Error("Resource unavailable"), {
      details: { statusCode: 409, errorCode: "ENTITY_OPERATION_CONFLICT" },
    });
    container.bookingRepository.createHold.mockRejectedValue(conflict);
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());
    await prepareSelection(result);

    await act(async () => { await result.current.createHold(); });

    expect(container.bookingRepository.createDraft).toHaveBeenCalledTimes(1);
    expect(container.bookingRepository.createHold).toHaveBeenCalledTimes(1);
    expect(result.current.state.stage).toBe("holdConflict");
    expect(result.current.state.selectedCandidate).toBeNull();
  });

  it("preserves a backend validation message when hold creation fails", async () => {
    const container = makeContainer();
    container.bookingRepository.createHold.mockRejectedValue(new Error("Hold duration is outside policy"));
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());
    await prepareSelection(result);

    await act(async () => { await result.current.createHold(); });

    expect(result.current.state.stage).toBe("error");
    expect(result.current.state.errorMessage).toBe("Hold duration is outside policy");
  });

  it("calls T01 then T04 then T06 once and cannot reconfirm a confirmed booking", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());
    await prepareSelection(result);

    await act(async () => { await Promise.all([result.current.createHold(), result.current.createHold()]); });
    expect(container.bookingRepository.createDraft).toHaveBeenCalledTimes(1);
    expect(container.bookingRepository.createHold).toHaveBeenCalledTimes(1);
    expect(container.bookingRepository.createDraft.mock.invocationCallOrder[0])
      .toBeLessThan(container.bookingRepository.createHold.mock.invocationCallOrder[0]);
    expect(result.current.state.stage).toBe("held");

    await act(async () => { await Promise.all([result.current.confirm(), result.current.confirm()]); });
    expect(container.bookingRepository.confirm).toHaveBeenCalledTimes(1);
    expect(container.bookingRepository.confirm).toHaveBeenCalledWith("reservation-1", expect.any(String), "quote-1");
    expect(result.current.state.stage).toBe("confirmed");

    await act(async () => { await result.current.confirm(); });
    expect(container.bookingRepository.confirm).toHaveBeenCalledTimes(1);
  });

  it("applies a privileged quote override with an explicit reason before confirmation", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());
    await prepareSelection(result);

    await act(async () => { await result.current.applyPriceOverride(-20, "approved concession"); });

    expect(container.commercialPricingRepository.overrideQuote).toHaveBeenCalledWith("quote-1", expect.objectContaining({
      adjustmentAmount: -20, reason: "approved concession", idempotencyKey: expect.any(String),
    }));
    expect(result.current.priceQuote?.grandTotal).toBe(230);
  });
});
