import { describe, it, expect, vi, beforeEach } from "vitest";
import { GuestPortalService } from "./guest-portal.service";

describe("GuestPortalService", () => {
  let service: GuestPortalService;
  const mockFetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = mockFetch;
    service = new GuestPortalService("http://localhost:5035/api");
  });

  it("exchangeSession sends token in POST body and returns session payload", async () => {
    const mockResponse = {
      guestSessionToken: "test-session-token",
      expiresAtUtc: "2026-10-06T00:00:00Z",
      reservation: {
        reservationNumber: "RES-100",
        venueName: "Venue A",
        facilityName: "Hall 1",
        resourceName: "Court 1",
        status: "Confirmed",
        quantity: 1,
        canCancel: true,
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await service.exchangeSession("test-bearer-token-123");

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:5035/api/v1/venue/guest/session",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        body: JSON.stringify({ token: "test-bearer-token-123" }),
      })
    );
    expect(result.guestSessionToken).toBe("test-session-token");
    expect(result.reservation.reservationNumber).toBe("RES-100");
  });

  it("getBooking includes credentials and standard headers via HttpOnly cookie", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reservationNumber: "RES-100", status: "Confirmed" }),
    });

    const result = await service.getBooking();

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:5035/api/v1/venue/guest/booking",
      expect.objectContaining({
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      })
    );
    expect(result.reservationNumber).toBe("RES-100");
  });

  it("cancelBooking sends reason, idempotency key, and credentials via HttpOnly cookie", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ reservationNumber: "RES-100", status: "Cancelled" }),
    });

    const result = await service.cancelBooking(
      "Change of plans",
      "idem-key-123"
    );

    expect(mockFetch).toHaveBeenCalledWith(
      "http://localhost:5035/api/v1/venue/guest/booking/cancel",
      expect.objectContaining({
        method: "POST",
        credentials: "include",
        headers: expect.objectContaining({
          "Idempotency-Key": "idem-key-123",
          "Content-Type": "application/json",
          Accept: "application/json",
        }),
        body: JSON.stringify({
          reason: "Change of plans",
          idempotencyKey: "idem-key-123",
        }),
      })
    );
    expect(result.status).toBe("Cancelled");
  });
});
