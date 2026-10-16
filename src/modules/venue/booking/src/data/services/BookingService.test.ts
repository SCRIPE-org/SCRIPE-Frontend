import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IApiService } from "@core/interfaces/api.interface";
import { BookingService } from "./BookingService";

describe("BookingService", () => {
  const api = {
    get: vi.fn(),
    post: vi.fn(),
  } as unknown as IApiService;

  beforeEach(() => vi.clearAllMocks());

  it("maps the server-authoritative availability interval into T01", async () => {
    vi.mocked(api.post).mockResolvedValue({ id: "reservation-1" });

    const input = {
      resourceId: "resource-1",
      customerPartyId: "party-1",
      requestedStartUtc: "2026-09-10T07:00:00Z",
      requestedEndUtc: "2026-09-10T08:00:00Z",
      quantity: 2,
    };
    const result = await new BookingService(api).createDraft(input);

    expect(api.post).toHaveBeenCalledWith("/v1/Reservations", {
      ...input,
      bookerPartyId: null,
      payerPartyId: null,
    });
    expect(result.id).toBe("reservation-1");
  });

  it("creates T04 with a caller-owned idempotency key", async () => {
    vi.mocked(api.post).mockResolvedValue({
      reservationId: "reservation-1",
      bookingHoldId: "hold-1",
      expiresAtUtc: "2026-09-10T07:15:00Z",
    });

    await new BookingService(api).createHold("reservation-1", "hold-key");

    expect(api.post).toHaveBeenCalledWith("/v1/booking-holds", {
      reservationId: "reservation-1",
      idempotencyKey: "hold-key",
    });
  });

  it("confirms T06 through the explicit action endpoint", async () => {
    vi.mocked(api.post).mockResolvedValue({
      reservationId: "reservation-1",
      bookingHoldId: "hold-1",
    });

    await new BookingService(api).confirm("reservation-1", "confirm-key", "price-quote-1");

    expect(api.post).toHaveBeenCalledWith("/v1/Reservations/reservation-1/confirm", {
      idempotencyKey: "confirm-key",
      priceQuoteId: "price-quote-1",
    });
  });

  it("checks in through the explicit T09 action endpoint", async () => {
    vi.mocked(api.post).mockResolvedValue({ reservationId: "reservation-1", status: "CheckedIn" });

    await new BookingService(api).checkIn("reservation-1", "check-in-key");

    expect(api.post).toHaveBeenCalledWith("/v1/Reservations/reservation-1/check-in", {
      idempotencyKey: "check-in-key",
    });
  });

  it("completes through the explicit T10 action endpoint", async () => {
    vi.mocked(api.post).mockResolvedValue({ reservationId: "reservation-1", status: "Completed" });

    await new BookingService(api).complete("reservation-1", "complete-key");

    expect(api.post).toHaveBeenCalledWith("/v1/Reservations/reservation-1/complete", {
      idempotencyKey: "complete-key",
    });
  });

  it("marks no-show through T12 with its bounded operator reason", async () => {
    vi.mocked(api.post).mockResolvedValue({ reservationId: "reservation-1", status: "NoShow" });

    await new BookingService(api).markNoShow("reservation-1", "no-show-key", "Did not arrive");

    expect(api.post).toHaveBeenCalledWith("/v1/Reservations/reservation-1/no-show", {
      idempotencyKey: "no-show-key",
      reason: "Did not arrive",
    });
  });

  it("cancels through T13 with the supplied operator reason", async () => {
    vi.mocked(api.post).mockResolvedValue({ reservationId: "reservation-1", status: "Cancelled" });

    await new BookingService(api).cancel(
      "reservation-1",
      "cancel-key",
      "Customer requested cancellation"
    );

    expect(api.post).toHaveBeenCalledWith("/v1/Reservations/reservation-1/cancel", {
      idempotencyKey: "cancel-key",
      reason: "Customer requested cancellation",
    });
  });

  it("reschedules through T14 without converting it into a generic update", async () => {
    vi.mocked(api.post).mockResolvedValue({ reservationId: "reservation-1", status: "Confirmed" });
    const input = {
      resourceId: "resource-1",
      requestedStartUtc: "2026-09-10T09:00:00Z",
      requestedEndUtc: "2026-09-10T10:00:00Z",
      idempotencyKey: "reschedule-key",
    };

    await new BookingService(api).reschedule("reservation-1", input);

    expect(api.post).toHaveBeenCalledWith("/v1/Reservations/reservation-1/reschedule", input);
  });

  it("changes resource through T15 while preserving the explicit interval contract", async () => {
    vi.mocked(api.post).mockResolvedValue({ reservationId: "reservation-1", status: "Confirmed" });
    const input = {
      targetResourceId: "resource-2",
      requestedStartUtc: "2026-09-10T07:00:00Z",
      requestedEndUtc: "2026-09-10T08:00:00Z",
      idempotencyKey: "resource-key",
    };

    await new BookingService(api).changeResource("reservation-1", input);

    expect(api.post).toHaveBeenCalledWith("/v1/Reservations/reservation-1/change-resource", input);
  });

  it("hydrates the reservation reference from the read contract", async () => {
    vi.mocked(api.get).mockResolvedValue({
      id: "reservation-1",
      reservationNumber: "RES-20260910-A1B2C3",
    });

    const result = await new BookingService(api).getReservation("reservation-1");

    expect(api.get).toHaveBeenCalledWith("/v1/Reservations/reservation-1");
    expect(result.reservationNumber).toBe("RES-20260910-A1B2C3");
  });
});
