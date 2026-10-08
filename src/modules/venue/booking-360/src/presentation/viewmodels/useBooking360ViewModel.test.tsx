import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getVenueContainer } from "@modules/venue/di";
import { useBooking360ViewModel } from "./useBooking360ViewModel";

vi.mock("@modules/venue/di", () => ({ getVenueContainer: vi.fn() }));

const detail = {
  id: "reservation-1",
  reservationNumber: "RES-1",
  status: "Held" as const,
  resourceId: "resource-1",
  requestedStartUtc: "2026-09-10T07:00:00Z",
  requestedEndUtc: "2026-09-10T08:00:00Z",
  quantity: 2,
  customerPartyId: "party-1",
  payerPartyId: "payer-1",
  priceSnapshotId: null,
  createdAt: "2026-09-10T06:00:00Z",
  modifiedAt: null,
  asOfUtc: "2026-09-10T06:30:00Z",
  activeHold: { id: "hold-1", expiresAtUtc: "2999-09-10T07:30:00Z" },
  history: [
    {
      fromStatus: null,
      toStatus: "Draft",
      transitionCode: "T01",
      occurredAtUtc: "2026-09-10T06:00:00Z",
      reason: null,
    },
    {
      fromStatus: "Draft",
      toStatus: "Held",
      transitionCode: "T04",
      occurredAtUtc: "2026-09-10T06:10:00Z",
      reason: null,
    },
  ],
};

function container(overrides: Record<string, unknown> = {}) {
  return {
    booking360Repository: { getById: vi.fn().mockResolvedValue(detail) },
    bookingRepository: {
      confirm: vi.fn().mockResolvedValue({ reservationId: "reservation-1" }),
      checkIn: vi.fn().mockResolvedValue({ reservationId: "reservation-1", status: "CheckedIn" }),
      complete: vi.fn().mockResolvedValue({ reservationId: "reservation-1", status: "Completed" }),
      markNoShow: vi.fn().mockResolvedValue({ reservationId: "reservation-1", status: "NoShow" }),
      cancel: vi.fn().mockResolvedValue({ reservationId: "reservation-1", status: "Cancelled" }),
      reschedule: vi.fn().mockResolvedValue({ reservationId: "reservation-1" }),
      changeResource: vi.fn().mockResolvedValue({ reservationId: "reservation-1" }),
    },
    customerRepository: {
      getById: vi
        .fn()
        .mockResolvedValue({ id: "party-1", type: "Person", displayName: "Mona Hassan" }),
    },
    schedulableResourceRepository: {
      getById: vi.fn().mockResolvedValue({
        id: "resource-1",
        name: "Court 1",
        facilityResourceProfileId: "profile-1",
      }),
    },
    facilityResourceProfileRepository: {
      getById: vi.fn().mockResolvedValue({
        id: "profile-1",
        facilityId: "facility-1",
        name: "Indoor Court",
        resourceKindCode: "court",
        operatingPolicy: { timeZoneId: "Africa/Cairo" },
        usageTypes: [],
      }),
    },
    facilityRepository: {
      getById: vi.fn().mockResolvedValue({ id: "facility-1", name: "Downtown" }),
    },
    commercialPricingRepository: {
      getResourceConfiguration: vi
        .fn()
        .mockResolvedValue({ offeringId: "offering-1", currencyCode: "EGP" }),
      calculateQuote: vi.fn().mockResolvedValue({ id: "quote-1" }),
    },
    ...overrides,
  };
}

describe("useBooking360ViewModel", () => {
  beforeEach(() => vi.clearAllMocks());

  it("loads one reservation and composes exact Party, resource, profile, and Facility identities", async () => {
    const value = container();
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );

    await waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
      expect(result.current.state.enrichmentLoading).toBe(false);
    });

    expect(result.current.state.reservation?.reservationNumber).toBe("RES-1");
    expect(result.current.state.customer?.displayName).toBe("Mona Hassan");
    expect(result.current.state.resource?.name).toBe("Court 1");
    expect(result.current.state.facility?.name).toBe("Downtown");
    expect(result.current.state.profile).toEqual({
      name: "Indoor Court",
      timeZoneId: "Africa/Cairo",
    });
    expect(result.current.state.resource).toEqual({ name: "Court 1" });
    expect(result.current.state.facility).toEqual({ id: "facility-1", name: "Downtown" });
    expect(value.customerRepository.getById).toHaveBeenCalledWith("party-1");
    expect(value.schedulableResourceRepository.getById).toHaveBeenCalledWith("resource-1");
    expect(value.facilityResourceProfileRepository.getById).toHaveBeenCalledOnce();
  });

  it("keeps the core booking usable when Party enrichment fails", async () => {
    const value = container({
      customerRepository: { getById: vi.fn().mockRejectedValue(new Error("party unavailable")) },
    });
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );

    await waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
      expect(result.current.state.enrichmentLoading).toBe(false);
    });

    expect(result.current.state.stage).toBe("ready");
    expect(result.current.state.reservation?.id).toBe("reservation-1");
    expect(result.current.state.customer).toBeNull();
    expect(result.current.state.customerError).toBe(true);
  });

  it("keeps the core booking usable when Facility enrichment fails", async () => {
    const value = container({
      facilityRepository: { getById: vi.fn().mockRejectedValue(new Error("facility unavailable")) },
    });
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );

    await waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
      expect(result.current.state.enrichmentLoading).toBe(false);
    });

    expect(result.current.state.stage).toBe("ready");
    expect(result.current.state.resource?.name).toBe("Court 1");
    expect(result.current.state.facility).toBeNull();
    expect(result.current.state.facilityError).toBe(true);
  });

  it("uses one stable T06 idempotency key, prevents double submit, and reloads server truth", async () => {
    let resolveConfirm!: () => void;
    const confirm = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveConfirm = resolve;
        })
    );
    const getById = vi
      .fn()
      .mockResolvedValueOnce(detail)
      .mockResolvedValue({ ...detail, status: "Confirmed", activeHold: null });
    const value = container({ booking360Repository: { getById }, bookingRepository: { confirm } });
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );
    await waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
      expect(result.current.state.enrichmentLoading).toBe(false);
    });

    await act(async () => {
      const first = result.current.confirm();
      const second = result.current.confirm();
      await waitFor(() => expect(confirm).toHaveBeenCalledTimes(1));
      resolveConfirm();
      await Promise.all([first, second]);
    });
    await waitFor(() => expect(result.current.state.reservation?.status).toBe("Confirmed"));
    expect(getById).toHaveBeenCalledTimes(2);
    expect(value.commercialPricingRepository.calculateQuote).toHaveBeenCalledWith(
      expect.objectContaining({
        offeringId: "offering-1",
        resourceId: "resource-1",
        partyId: "payer-1",
      })
    );
    expect(confirm).toHaveBeenCalledWith("reservation-1", expect.any(String), "quote-1");
  });

  it("does not use the workstation clock as confirmation authority", async () => {
    const serverValid = {
      ...detail,
      activeHold: { id: "hold-1", expiresAtUtc: "2026-09-10T06:31:00Z" },
    };
    const confirm = vi.fn().mockResolvedValue({ reservationId: "reservation-1" });
    const value = container({
      booking360Repository: { getById: vi.fn().mockResolvedValue(serverValid) },
      bookingRepository: { confirm },
    });
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );
    await waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
      expect(result.current.state.enrichmentLoading).toBe(false);
    });

    await act(async () => {
      await result.current.confirm();
    });

    expect(confirm).toHaveBeenCalledOnce();
  });

  it("classifies a confirm race as expiry when authoritative reload has no live hold", async () => {
    const expiredConflict = Object.assign(new Error("hold unavailable"), {
      details: { statusCode: 409, errorCode: "ENTITY_OPERATION_CONFLICT" },
    });
    const getById = vi
      .fn()
      .mockResolvedValueOnce(detail)
      .mockResolvedValue({ ...detail, activeHold: null });
    const value = container({
      booking360Repository: { getById },
      bookingRepository: { confirm: vi.fn().mockRejectedValue(expiredConflict) },
    });
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );
    await waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
      expect(result.current.state.enrichmentLoading).toBe(false);
    });

    await act(async () => {
      await result.current.confirm();
    });

    expect(result.current.state.actionError).toBe("expired");
    expect(result.current.state.reservation?.activeHold).toBeNull();
  });

  it("classifies a confirm race as conflict when another operator confirmed first", async () => {
    const operationConflict = Object.assign(new Error("reservation changed"), {
      details: { statusCode: 409, errorCode: "ENTITY_OPERATION_CONFLICT" },
    });
    const getById = vi
      .fn()
      .mockResolvedValueOnce(detail)
      .mockResolvedValue({ ...detail, status: "Confirmed", activeHold: null });
    const value = container({
      booking360Repository: { getById },
      bookingRepository: { confirm: vi.fn().mockRejectedValue(operationConflict) },
    });
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );
    await waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
      expect(result.current.state.enrichmentLoading).toBe(false);
    });

    await act(async () => {
      await result.current.confirm();
    });

    expect(result.current.state.actionError).toBe("conflict");
    expect(result.current.state.reservation?.status).toBe("Confirmed");
  });

  it("checks in once under a double click and reloads authoritative status and history", async () => {
    let resolveAction!: () => void;
    const checkIn = vi.fn().mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveAction = resolve;
        })
    );
    const confirmed = { ...detail, status: "Confirmed" as const, activeHold: null };
    const checkedIn = {
      ...confirmed,
      status: "CheckedIn" as const,
      history: [
        ...confirmed.history,
        {
          fromStatus: "Confirmed" as const,
          toStatus: "CheckedIn" as const,
          transitionCode: "T09",
          occurredAtUtc: "2026-09-10T07:01:00Z",
          reason: null,
        },
      ],
    };
    const getById = vi.fn().mockResolvedValueOnce(confirmed).mockResolvedValue(checkedIn);
    const value = container({
      booking360Repository: { getById },
      bookingRepository: { ...container().bookingRepository, checkIn },
    });
    vi.mocked(getVenueContainer).mockReturnValue(value as never);
    const { result } = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );
    await waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
      expect(result.current.state.enrichmentLoading).toBe(false);
    });

    await act(async () => {
      const first = result.current.checkIn();
      const second = result.current.checkIn();
      await Promise.resolve();
      expect(checkIn).toHaveBeenCalledOnce();
      resolveAction();
      await Promise.all([first, second]);
    });

    expect(result.current.state.reservation?.status).toBe("CheckedIn");
    expect(result.current.state.reservation?.history.at(-1)?.transitionCode).toBe("T09");
    expect(result.current.state.operationalFeedback).toEqual({
      action: "checkIn",
      kind: "success",
      status: "CheckedIn",
    });
    expect(getById).toHaveBeenCalledTimes(2);
  });

  it("reloads a CAS conflict and reports the other operator's current status", async () => {
    const concurrency = Object.assign(new Error("changed"), {
      details: { statusCode: 409, errorCode: "ENTITY_CONCURRENCY_CONFLICT" },
    });
    const confirmed = { ...detail, status: "Confirmed" as const, activeHold: null };
    const noShow = { ...confirmed, status: "NoShow" as const };
    const getById = vi.fn().mockResolvedValueOnce(confirmed).mockResolvedValue(noShow);
    const bookingRepository = {
      ...container().bookingRepository,
      checkIn: vi.fn().mockRejectedValue(concurrency),
    };
    vi.mocked(getVenueContainer).mockReturnValue(
      container({
        booking360Repository: { getById },
        bookingRepository,
      }) as never
    );
    const { result } = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );
    await waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
      expect(result.current.state.enrichmentLoading).toBe(false);
    });

    await act(async () => {
      await result.current.checkIn();
    });

    expect(result.current.state.reservation?.status).toBe("NoShow");
    expect(result.current.state.operationalFeedback).toEqual({
      action: "checkIn",
      kind: "concurrency",
      status: "NoShow",
    });
    expect(getById).toHaveBeenCalledTimes(2);
  });

  it("reuses the same idempotency key when a network-unknown check-in is retried", async () => {
    const confirmed = { ...detail, status: "Confirmed" as const, activeHold: null };
    const checkedIn = { ...confirmed, status: "CheckedIn" as const };
    const getById = vi.fn().mockResolvedValueOnce(confirmed).mockResolvedValue(checkedIn);
    const checkIn = vi
      .fn()
      .mockRejectedValueOnce(new Error("network"))
      .mockResolvedValue({ reservationId: "reservation-1", status: "CheckedIn" });
    vi.mocked(getVenueContainer).mockReturnValue(
      container({
        booking360Repository: { getById },
        bookingRepository: { ...container().bookingRepository, checkIn },
      }) as never
    );
    const { result } = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );
    await waitFor(() => {
      expect(result.current.state.stage).toBe("ready");
      expect(result.current.state.enrichmentLoading).toBe(false);
    });

    await act(async () => {
      await result.current.checkIn();
    });
    expect(result.current.state.operationalFeedback?.kind).toBe("network");
    await act(async () => {
      await result.current.checkIn();
    });

    expect(checkIn).toHaveBeenCalledTimes(2);
    expect(checkIn.mock.calls[0]?.[1]).toBe(checkIn.mock.calls[1]?.[1]);
    expect(result.current.state.reservation?.status).toBe("CheckedIn");
  });

  it("validates no-show reason before transport and completes only from CheckedIn", async () => {
    const confirmed = { ...detail, status: "Confirmed" as const, activeHold: null };
    const noShowRepository = container().bookingRepository;
    vi.mocked(getVenueContainer).mockReturnValue(
      container({
        booking360Repository: { getById: vi.fn().mockResolvedValue(confirmed) },
        bookingRepository: noShowRepository,
      }) as never
    );
    const noShow = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );
    await waitFor(() => {
      expect(noShow.result.current.state.stage).toBe("ready");
      expect(noShow.result.current.state.enrichmentLoading).toBe(false);
    });

    await act(async () => {
      await noShow.result.current.markNoShow("   ");
    });
    expect(noShowRepository.markNoShow).not.toHaveBeenCalled();
    expect(noShow.result.current.state.operationalFeedback?.kind).toBe("validation");
    noShow.unmount();

    const checkedIn = { ...detail, status: "CheckedIn" as const, activeHold: null };
    const completed = { ...checkedIn, status: "Completed" as const };
    const completeRepository = container().bookingRepository;
    vi.mocked(getVenueContainer).mockReturnValue(
      container({
        booking360Repository: {
          getById: vi.fn().mockResolvedValueOnce(checkedIn).mockResolvedValue(completed),
        },
        bookingRepository: completeRepository,
      }) as never
    );
    const completion = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );
    await waitFor(() => {
      expect(completion.result.current.state.stage).toBe("ready");
      expect(completion.result.current.state.enrichmentLoading).toBe(false);
    });

    await act(async () => {
      await completion.result.current.complete();
    });
    expect(completeRepository.complete).toHaveBeenCalledOnce();
    expect(completion.result.current.state.reservation?.status).toBe("Completed");
  });

  it("validates cancel reason and executes cancel with reloaded server state", async () => {
    const cancelled = { ...detail, status: "Cancelled" as const, activeHold: null };
    const repo = container().bookingRepository;
    const getById = vi.fn().mockResolvedValueOnce(detail).mockResolvedValue(cancelled);
    vi.mocked(getVenueContainer).mockReturnValue(
      container({
        booking360Repository: { getById },
        bookingRepository: repo,
      }) as never
    );

    const { result } = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );
    await waitFor(() => expect(result.current.state.stage).toBe("ready"));

    // Validation failure on empty reason
    await act(async () => {
      await result.current.cancel("   ");
    });
    expect(repo.cancel).not.toHaveBeenCalled();
    expect(result.current.state.operationalFeedback?.kind).toBe("validation");

    // Success on valid reason
    await act(async () => {
      await result.current.cancel("Customer request");
    });
    expect(repo.cancel).toHaveBeenCalledWith(
      "reservation-1",
      expect.any(String),
      "Customer request"
    );
    expect(result.current.state.reservation?.status).toBe("Cancelled");
    expect(result.current.state.operationalFeedback).toEqual({
      action: "cancel",
      kind: "success",
      status: "Cancelled",
    });
  });

  it("executes reschedule with selected resource and slot, reloading detail", async () => {
    const confirmed = { ...detail, status: "Confirmed" as const, priceSnapshotId: "snapshot-1" };
    const rescheduled = {
      ...confirmed,
      requestedStartUtc: "2026-09-11T10:00:00Z",
      requestedEndUtc: "2026-09-11T11:00:00Z",
    };
    const repo = container().bookingRepository;
    const getById = vi.fn().mockResolvedValueOnce(confirmed).mockResolvedValue(rescheduled);
    vi.mocked(getVenueContainer).mockReturnValue(
      container({
        booking360Repository: { getById },
        bookingRepository: repo,
      }) as never
    );

    const { result } = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );
    await waitFor(() => expect(result.current.state.stage).toBe("ready"));

    await act(async () => {
      await result.current.reschedule({
        resourceId: "resource-1",
        requestedStartUtc: "2026-09-11T10:00:00Z",
        requestedEndUtc: "2026-09-11T11:00:00Z",
      });
    });

    expect(repo.reschedule).toHaveBeenCalledWith("reservation-1", {
      resourceId: "resource-1",
      requestedStartUtc: "2026-09-11T10:00:00Z",
      requestedEndUtc: "2026-09-11T11:00:00Z",
      idempotencyKey: expect.any(String),
      priceQuoteId: "quote-1",
    });
    expect(result.current.state.reservation?.requestedStartUtc).toBe("2026-09-11T10:00:00Z");
    expect(result.current.state.operationalFeedback).toEqual({
      action: "reschedule",
      kind: "success",
      status: "Confirmed",
    });
  });

  it("executes changeResource with target resource, reloading detail", async () => {
    const confirmed = { ...detail, status: "Confirmed" as const, priceSnapshotId: "snapshot-1" };
    const changed = { ...confirmed, resourceId: "resource-2" };
    const repo = container().bookingRepository;
    const getById = vi.fn().mockResolvedValueOnce(confirmed).mockResolvedValue(changed);
    vi.mocked(getVenueContainer).mockReturnValue(
      container({
        booking360Repository: { getById },
        bookingRepository: repo,
      }) as never
    );

    const { result } = renderHook(() =>
      useBooking360ViewModel("reservation-1", true, true, true, true, true)
    );
    await waitFor(() => expect(result.current.state.stage).toBe("ready"));

    await act(async () => {
      await result.current.changeResource({
        targetResourceId: "resource-2",
        requestedStartUtc: "2026-09-10T07:00:00Z",
        requestedEndUtc: "2026-09-10T08:00:00Z",
      });
    });

    expect(repo.changeResource).toHaveBeenCalledWith("reservation-1", {
      targetResourceId: "resource-2",
      requestedStartUtc: "2026-09-10T07:00:00Z",
      requestedEndUtc: "2026-09-10T08:00:00Z",
      idempotencyKey: expect.any(String),
      priceQuoteId: "quote-1",
    });
    expect(result.current.state.reservation?.resourceId).toBe("resource-2");
    expect(result.current.state.operationalFeedback).toEqual({
      action: "changeResource",
      kind: "success",
      status: "Confirmed",
    });
  });
});
