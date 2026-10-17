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
      create: vi.fn().mockResolvedValue(customer),
    },
    bookingRepository: {
      createDraft: vi.fn().mockResolvedValue({ id: "reservation-1" }),
      createHold: vi.fn().mockResolvedValue({
        reservationId: "reservation-1",
        bookingHoldId: "hold-1",
        expiresAtUtc: "2999-09-10T07:15:00Z",
      }),
      getReservation: vi
        .fn()
        .mockResolvedValueOnce({ id: "reservation-1", reservationNumber: "RES-1", status: "Held" })
        .mockResolvedValueOnce({
          id: "reservation-1",
          reservationNumber: "RES-1",
          status: "Confirmed",
        }),
      confirm: vi
        .fn()
        .mockResolvedValue({ reservationId: "reservation-1", bookingHoldId: "hold-1" }),
    },
  };
}

async function prepareSelection(result: {
  current: ReturnType<typeof useBookingWorkspaceViewModel>;
}) {
  await waitFor(() => expect(result.current.setupLoading).toBe(false));
  await act(async () => {
    await result.current.selectCustomer("party-1");
  });
  act(() => result.current.setCriteria({ date: "2026-09-10" }));
  await act(async () => {
    await result.current.searchAvailability();
  });
  await act(async () => {
    await result.current.selectCandidate(result.current.state.candidates[0]);
  });
}

describe("useBookingWorkspaceViewModel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("reuses the stable CatalogPricing quote key and expiry after a lost response", async () => {
    const container = makeContainer();
    container.commercialPricingRepository.calculateQuote
      .mockRejectedValueOnce(new Error("quote response was lost after commit"))
      .mockResolvedValueOnce({
        id: "quote-replayed",
        quoteNumber: "Q-1",
        currencyCode: "EGP",
        grandTotal: 250,
        expiresAtUtc: "2999-09-10T08:00:00Z",
      });
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());
    await waitFor(() => expect(result.current.setupLoading).toBe(false));
    await act(async () => result.current.selectCustomer("party-1"));
    act(() => result.current.setCriteria({ date: "2026-09-10" }));
    await act(async () => result.current.searchAvailability());
    const candidate = result.current.state.candidates[0];

    await act(async () => result.current.selectCandidate(candidate));
    await act(async () => result.current.selectCandidate(candidate));

    const quoteCalls = container.commercialPricingRepository.calculateQuote.mock.calls;
    expect(quoteCalls).toHaveLength(2);
    expect(quoteCalls[1][0].idempotencyKey).toBe(quoteCalls[0][0].idempotencyKey);
    expect(quoteCalls[1][0].expiresAtUtc).toBe(quoteCalls[0][0].expiresAtUtc);
    expect(result.current.priceQuote?.id).toBe("quote-replayed");
  });

  it("reuses the quote-override key after an ambiguous response", async () => {
    const container = makeContainer();
    container.commercialPricingRepository.overrideQuote
      .mockRejectedValueOnce(new Error("override response was lost after commit"))
      .mockResolvedValueOnce({ overriddenGrandTotal: 240 });
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());
    await prepareSelection(result);

    await act(async () => {
      expect(await result.current.applyPriceOverride(-10, "approved discount")).toBe(false);
    });
    await act(async () => {
      expect(await result.current.applyPriceOverride(-10, "approved discount")).toBe(true);
    });

    const calls = container.commercialPricingRepository.overrideQuote.mock.calls;
    expect(calls).toHaveLength(2);
    expect(calls[1][1].idempotencyKey).toBe(calls[0][1].idempotencyKey);
    expect(result.current.priceQuote?.grandTotal).toBe(240);
  });

  it("reuses the same Party create intent key after an ambiguous response", async () => {
    const container = makeContainer();
    container.customerRepository.create
      .mockRejectedValueOnce(new Error("Network response was lost"))
      .mockResolvedValueOnce(customer);
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());
    await waitFor(() => expect(result.current.setupLoading).toBe(false));

    await act(async () => {
      await expect(result.current.createCustomer("Mona Hassan", "Person", "synthetic-phone"))
        .rejects.toThrow("Network response was lost");
    });
    await act(async () => {
      await result.current.createCustomer("Mona Hassan", "Person", "synthetic-phone");
    });

    expect(container.customerRepository.create).toHaveBeenCalledTimes(2);
    const firstOptions = container.customerRepository.create.mock.calls[0]?.[3];
    const secondOptions = container.customerRepository.create.mock.calls[1]?.[3];
    expect(firstOptions?.idempotencyKey).toBeTruthy();
    expect(secondOptions?.idempotencyKey).toBe(firstOptions?.idempotencyKey);
    expect(result.current.customer?.id).toBe(customer.id);
  });

  it("honors a calendar resource/date/time prefill while keeping Availability Search authoritative", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() =>
      useBookingWorkspaceViewModel({
        facilityId: "facility-1",
        resourceId: "resource-1",
        date: "2026-09-10",
        startTime: "10:30",
        durationMinutes: 90,
      })
    );

    await waitFor(() => expect(result.current.setupLoading).toBe(false));
    await act(async () => {
      await result.current.selectCustomer("party-1");
    });
    await act(async () => {
      await result.current.searchAvailability();
    });

    expect(result.current.criteria).toMatchObject({
      resourceId: "resource-1",
      date: "2026-09-10",
      startTime: "10:30",
      durationMinutes: 90,
    });
    expect(container.availabilityRepository.search).toHaveBeenCalledTimes(1);
    expect(container.bookingRepository.createDraft).not.toHaveBeenCalled();
  });

  it("keeps safe defaults when optional route prefill values are absent", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() =>
      useBookingWorkspaceViewModel({ durationMinutes: undefined })
    );

    await waitFor(() => expect(result.current.setupLoading).toBe(false));
    expect(result.current.criteria.durationMinutes).toBe(60);
    expect(result.current.criteria.startTime).toBe("09:00");
  });

  it("hydrates the selected Party and maps matching resources through existing Availability Search", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());

    await waitFor(() => expect(result.current.setupLoading).toBe(false));
    await act(async () => {
      await result.current.selectCustomer("party-1");
    });
    act(() => result.current.setCriteria({ date: "2026-09-10" }));
    await act(async () => {
      await result.current.searchAvailability();
    });

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
    container.availabilityRepository.search.mockResolvedValue({
      ...availability,
      isAvailable: false,
      remainingCapacity: 0,
    });
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());

    await waitFor(() => expect(result.current.setupLoading).toBe(false));
    await act(async () => {
      await result.current.selectCustomer("party-1");
    });
    act(() => result.current.setCriteria({ date: "2026-09-10" }));
    await act(async () => {
      await result.current.searchAvailability();
    });

    expect(result.current.state.stage).toBe("noAvailability");
    expect(result.current.state.candidates[0].isAvailable).toBe(false);
  });

  it("maps a complete availability network failure to a retryable workspace error", async () => {
    const container = makeContainer();
    container.availabilityRepository.search.mockRejectedValue(
      new Error("Availability service unavailable")
    );
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());

    await waitFor(() => expect(result.current.setupLoading).toBe(false));
    await act(async () => {
      await result.current.selectCustomer("party-1");
    });
    act(() => result.current.setCriteria({ date: "2026-09-10" }));
    await act(async () => {
      await result.current.searchAvailability();
    });

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

    await act(async () => {
      await result.current.createHold();
    });

    expect(container.bookingRepository.createDraft).toHaveBeenCalledTimes(1);
    expect(container.bookingRepository.createHold).toHaveBeenCalledTimes(1);
    expect(result.current.state.stage).toBe("holdConflict");
    expect(result.current.state.selectedCandidate).toBeNull();
  });

  it("preserves a backend validation message when hold creation fails", async () => {
    const container = makeContainer();
    container.bookingRepository.createHold.mockRejectedValue(
      new Error("Hold duration is outside policy")
    );
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());
    await prepareSelection(result);

    await act(async () => {
      await result.current.createHold();
    });

    expect(result.current.state.stage).toBe("error");
    expect(result.current.state.errorMessage).toBe("Hold duration is outside policy");
  });

  it("reuses the same hold intent key after a lost response", async () => {
    const container = makeContainer();
    container.bookingRepository.createHold
      .mockRejectedValueOnce(new Error("Network response was lost"))
      .mockResolvedValueOnce({
        reservationId: "reservation-1",
        bookingHoldId: "hold-1",
        expiresAtUtc: "2026-09-10T10:00:00.000Z",
      });
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());
    await prepareSelection(result);

    await act(async () => {
      await result.current.createHold();
    });
    await act(async () => {
      await result.current.createHold();
    });

    expect(container.bookingRepository.createDraft).toHaveBeenCalledTimes(1);
    expect(container.bookingRepository.createHold).toHaveBeenCalledTimes(2);
    expect(container.bookingRepository.createHold.mock.calls[1]?.[1]).toBe(
      container.bookingRepository.createHold.mock.calls[0]?.[1]
    );
    expect(result.current.state.stage).toBe("held");
  });

  it("reuses the same draft intent key when the draft response is lost", async () => {
    const container = makeContainer();
    container.bookingRepository.createDraft
      .mockRejectedValueOnce(new Error("Network response was lost"))
      .mockResolvedValueOnce({ id: "reservation-1" });
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());
    await prepareSelection(result);

    await act(async () => {
      await result.current.createHold();
    });
    await act(async () => {
      await result.current.createHold();
    });

    expect(container.bookingRepository.createDraft).toHaveBeenCalledTimes(2);
    expect(container.bookingRepository.createDraft.mock.calls[1]?.[0].idempotencyKey).toBe(
      container.bookingRepository.createDraft.mock.calls[0]?.[0].idempotencyKey
    );
    expect(container.bookingRepository.createHold).toHaveBeenCalledTimes(1);
    expect(result.current.state.stage).toBe("held");
  });

  it("calls T01 then T04 then T06 once and cannot reconfirm a confirmed booking", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());
    await prepareSelection(result);

    await act(async () => {
      await Promise.all([result.current.createHold(), result.current.createHold()]);
    });
    expect(container.bookingRepository.createDraft).toHaveBeenCalledTimes(1);
    expect(container.bookingRepository.createHold).toHaveBeenCalledTimes(1);
    expect(container.bookingRepository.createDraft.mock.invocationCallOrder[0]).toBeLessThan(
      container.bookingRepository.createHold.mock.invocationCallOrder[0]
    );
    expect(result.current.state.stage).toBe("held");

    await act(async () => {
      await Promise.all([result.current.confirm(), result.current.confirm()]);
    });
    expect(container.bookingRepository.confirm).toHaveBeenCalledTimes(1);
    expect(container.bookingRepository.confirm).toHaveBeenCalledWith(
      "reservation-1",
      expect.any(String),
      "quote-1"
    );
    expect(result.current.state.stage).toBe("confirmed");

    await act(async () => {
      await result.current.confirm();
    });
    expect(container.bookingRepository.confirm).toHaveBeenCalledTimes(1);
  });

  it("keeps an ambiguous confirmation retryable with the same business intent key", async () => {
    const container = makeContainer();
    container.bookingRepository.confirm
      .mockRejectedValueOnce(new Error("Confirmation response was lost"))
      .mockResolvedValueOnce({ reservationId: "reservation-1", bookingHoldId: "hold-1" });
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());
    await prepareSelection(result);

    await act(async () => result.current.createHold());
    await act(async () => result.current.confirm());

    expect(result.current.state.stage).toBe("held");
    expect(result.current.state.errorMessage).toBe("Confirmation response was lost");

    await act(async () => result.current.confirm());

    expect(container.bookingRepository.confirm).toHaveBeenCalledTimes(2);
    expect(container.bookingRepository.confirm.mock.calls[1]?.[1]).toBe(
      container.bookingRepository.confirm.mock.calls[0]?.[1]
    );
    expect(result.current.state.stage).toBe("confirmed");
  });

  it("applies a privileged quote override with an explicit reason before confirmation", async () => {
    const container = makeContainer();
    vi.mocked(getVenueContainer).mockReturnValue(container as never);
    const { result } = renderHook(() => useBookingWorkspaceViewModel());
    await prepareSelection(result);

    await act(async () => {
      await result.current.applyPriceOverride(-20, "approved concession");
    });

    expect(container.commercialPricingRepository.overrideQuote).toHaveBeenCalledWith(
      "quote-1",
      expect.objectContaining({
        adjustmentAmount: -20,
        reason: "approved concession",
        idempotencyKey: expect.any(String),
      })
    );
    expect(result.current.priceQuote?.grandTotal).toBe(230);
  });
});
