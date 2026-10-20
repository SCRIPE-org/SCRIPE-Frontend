import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IApiService } from "@core/interfaces/api.interface";
import { GUEST_PORTAL_ENDPOINTS } from "./guest-portal.endpoints";
import { GuestPortalService } from "./guest-portal.service";

describe("GuestPortalService", () => {
  let service: GuestPortalService;
  let api: Pick<IApiService, "getPublic" | "postPublic">;

  beforeEach(() => {
    api = {
      getPublic: vi.fn(),
      postPublic: vi.fn(),
    };
    service = new GuestPortalService(api as IApiService);
    vi.stubGlobal("fetch", vi.fn());
  });

  it("exchanges the opaque token in the public POST body, never in the URL", async () => {
    const response = {
      guestSessionToken: "",
      expiresAtUtc: "2026-10-06T00:00:00Z",
      reservation: { reservationNumber: "RES-100" },
    };
    vi.mocked(api.postPublic).mockResolvedValueOnce(response as never);

    await expect(service.exchangeSession("opaque-token")).resolves.toEqual(response);

    expect(api.postPublic).toHaveBeenCalledWith(GUEST_PORTAL_ENDPOINTS.SESSION, {
      token: "opaque-token",
    });
    expect(GUEST_PORTAL_ENDPOINTS.SESSION).not.toContain("opaque-token");
    expect(fetch).not.toHaveBeenCalled();
  });

  it("loads booking through the public cookie-session API method", async () => {
    const booking = { reservationNumber: "RES-100", status: "Confirmed" };
    vi.mocked(api.getPublic).mockResolvedValueOnce(booking as never);

    await expect(service.getBooking()).resolves.toEqual(booking);

    expect(api.getPublic).toHaveBeenCalledWith(GUEST_PORTAL_ENDPOINTS.BOOKING);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("sends the stable cancel key in the backend-supported request body", async () => {
    const result = { reservationNumber: "RES-100", status: "Cancelled" };
    vi.mocked(api.postPublic).mockResolvedValueOnce(result as never);

    await expect(service.cancelBooking("Change of plans", "stable-key-123")).resolves.toEqual(
      result
    );

    expect(api.postPublic).toHaveBeenCalledWith(GUEST_PORTAL_ENDPOINTS.CANCEL, {
      reason: "Change of plans",
      idempotencyKey: "stable-key-123",
    });
    expect(fetch).not.toHaveBeenCalled();
  });

  it("does not send a cancel request without an idempotency key", async () => {
    await expect(service.cancelBooking("Change of plans", "  ")).rejects.toThrow(
      "A stable idempotency key is required"
    );
    expect(api.postPublic).not.toHaveBeenCalled();
  });

  it("uses the public API for best-effort cookie logout", async () => {
    vi.mocked(api.postPublic).mockResolvedValueOnce({ success: true } as never);

    await service.logout();

    expect(api.postPublic).toHaveBeenCalledWith(GUEST_PORTAL_ENDPOINTS.LOGOUT, {});
    expect(fetch).not.toHaveBeenCalled();
  });
});
