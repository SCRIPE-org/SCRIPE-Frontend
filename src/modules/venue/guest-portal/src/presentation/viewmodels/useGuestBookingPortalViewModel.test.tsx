import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useGuestBookingPortalViewModel } from "./useGuestBookingPortalViewModel";

const { guestPortalServiceMock } = vi.hoisted(() => ({
  guestPortalServiceMock: {
    exchangeSession: vi.fn(),
    getBooking: vi.fn(),
    cancelBooking: vi.fn(),
    logout: vi.fn(),
  },
}));

vi.mock("@modules/venue/di", () => ({
  getVenueContainer: vi.fn(() => ({ guestPortalService: guestPortalServiceMock })),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
    setLanguage: vi.fn(),
    registerBothLanguages: vi.fn(),
  }),
}));

const booking = {
  reservationNumber: "RES-100",
  venueName: "Venue",
  facilityName: "Facility",
  resourceName: "Court 1",
  startUtc: "2026-10-20T10:00:00Z",
  endUtc: "2026-10-20T11:00:00Z",
  timeZoneId: "UTC",
  status: "Confirmed",
  quantity: 1,
  allowedActions: ["Cancel"],
  canCancel: true,
};

describe("useGuestBookingPortalViewModel cancellation intent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("alert", vi.fn());
    window.location.hash = "#opaque-guest-token";
    guestPortalServiceMock.exchangeSession.mockResolvedValue({
      guestSessionToken: "",
      expiresAtUtc: "2026-10-21T10:00:00Z",
      reservation: booking,
    });
  });

  it("reuses a key for the same reason after an ambiguous failure and changes it for a new reason", async () => {
    guestPortalServiceMock.cancelBooking
      .mockRejectedValueOnce(new Error("response lost"))
      .mockRejectedValueOnce(new Error("response still unavailable"))
      .mockResolvedValueOnce({ reservationNumber: "RES-100", status: "Cancelled" });
    guestPortalServiceMock.getBooking.mockResolvedValueOnce({
      ...booking,
      status: "Cancelled",
      canCancel: false,
    });
    const { result } = renderHook(() => useGuestBookingPortalViewModel());

    await waitFor(() => expect(result.current.stage).toBe("ready"));

    await act(async () => result.current.handleConfirmCancel("Plans changed"));
    await act(async () => result.current.handleConfirmCancel("Plans changed"));
    await act(async () => result.current.handleConfirmCancel("Venue changed plans"));

    const calls = guestPortalServiceMock.cancelBooking.mock.calls;
    expect(calls).toHaveLength(3);
    expect(calls[0][0]).toBe("Plans changed");
    expect(calls[0][1]).toBe(calls[1][1]);
    expect(calls[1][1]).not.toBe(calls[2][1]);
    expect(guestPortalServiceMock.getBooking).toHaveBeenCalledOnce();
    expect(result.current.booking).toMatchObject({ status: "Cancelled", canCancel: false });
    expect(result.current.cancelSuccessBanner).toBe(true);
  });
});
