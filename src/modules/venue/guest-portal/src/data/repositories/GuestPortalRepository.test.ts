import { beforeEach, describe, expect, it, vi } from "vitest";
import type { IGuestPortalService } from "../../domain/interfaces/IGuestPortalService";
import { GuestPortalRepository } from "./GuestPortalRepository";
import type {
  GuestBooking,
  ExchangeGuestSessionResponse,
  CancelGuestReservationResponse,
} from "../../domain/entities/GuestBooking";

describe("GuestPortalRepository", () => {
  let repository: GuestPortalRepository;
  let service: IGuestPortalService;

  beforeEach(() => {
    service = {
      exchangeSession: vi.fn(),
      getBooking: vi.fn(),
      cancelBooking: vi.fn(),
      logout: vi.fn(),
    };
    repository = new GuestPortalRepository(service);
  });

  it("delegates exchangeSession to service and maps response", async () => {
    const mockResponse: ExchangeGuestSessionResponse = {
      guestSessionToken: "tok-123",
      expiresAtUtc: "2026-10-23T00:00:00Z",
      reservation: {
        reservationNumber: "RES-999",
        venueName: "Grand Arena",
        facilityName: "Court 1",
        resourceName: "Pitch",
        startUtc: "2026-10-23T10:00:00Z",
        endUtc: "2026-10-23T11:00:00Z",
        timeZoneId: "UTC",
        status: "Confirmed",
        quantity: 1,
        allowedActions: ["Cancel"],
        canCancel: true,
      },
    };
    vi.mocked(service.exchangeSession).mockResolvedValueOnce(mockResponse);

    const result = await repository.exchangeSession("tok-123");
    expect(service.exchangeSession).toHaveBeenCalledWith("tok-123");
    expect(result.guestSessionToken).toBe("tok-123");
    expect(result.reservation.reservationNumber).toBe("RES-999");
  });

  it("delegates getBooking to service and maps response", async () => {
    const mockBooking: GuestBooking = {
      reservationNumber: "RES-888",
      venueName: "Olympic Pool",
      facilityName: "Lane 3",
      resourceName: "Pool",
      startUtc: "2026-10-23T12:00:00Z",
      endUtc: "2026-10-23T13:00:00Z",
      timeZoneId: "UTC",
      status: "Confirmed",
      quantity: 1,
      allowedActions: ["Cancel"],
      canCancel: true,
    };
    vi.mocked(service.getBooking).mockResolvedValueOnce(mockBooking);

    const result = await repository.getBooking();
    expect(service.getBooking).toHaveBeenCalled();
    expect(result.reservationNumber).toBe("RES-888");
  });

  it("delegates cancelBooking to service and maps response", async () => {
    const mockCancel: CancelGuestReservationResponse = {
      reservationNumber: "RES-888",
      status: "Cancelled",
    };
    vi.mocked(service.cancelBooking).mockResolvedValueOnce(mockCancel);

    const result = await repository.cancelBooking("Illness", "idemp-key-1");
    expect(service.cancelBooking).toHaveBeenCalledWith("Illness", "idemp-key-1");
    expect(result.status).toBe("Cancelled");
  });

  it("delegates logout to service", async () => {
    vi.mocked(service.logout).mockResolvedValueOnce(undefined);

    await repository.logout();
    expect(service.logout).toHaveBeenCalled();
  });
});
