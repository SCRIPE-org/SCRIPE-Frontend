import type { IApiService } from "@core/interfaces/api.interface";
import type {
  Booking360Reservation,
  GuestAccessStatus,
  GenerateGuestAccessResult,
  SendGuestLinkResult,
} from "../../domain/entities/Booking360";
import type { IBooking360Service } from "../../domain/interfaces/IBooking360Service";
import { BOOKING_360_ENDPOINTS } from "./booking-360.endpoints";

/**
 * Service implementation for Booking 360 API communication.
 */
export class Booking360Service implements IBooking360Service {
  constructor(private readonly api: IApiService) {}

  getById(reservationId: string): Promise<Booking360Reservation> {
    return this.api.get(BOOKING_360_ENDPOINTS.OPERATIONAL_DETAIL(reservationId));
  }

  getGuestAccessStatus(reservationId: string): Promise<GuestAccessStatus> {
    return this.api.get<GuestAccessStatus>(BOOKING_360_ENDPOINTS.GUEST_ACCESS(reservationId));
  }

  generateGuestAccess(
    reservationId: string,
    durationMinutes?: number
  ): Promise<GenerateGuestAccessResult> {
    return this.api.post<GenerateGuestAccessResult>(
      BOOKING_360_ENDPOINTS.GUEST_ACCESS(reservationId),
      durationMinutes ? { durationMinutes } : undefined
    );
  }

  sendGuestLink(reservationId: string, recipient?: string): Promise<SendGuestLinkResult> {
    return this.api.post<SendGuestLinkResult>(
      BOOKING_360_ENDPOINTS.GUEST_ACCESS_SEND(reservationId),
      recipient ? { recipient } : {}
    );
  }

  revokeGuestAccess(reservationId: string, reason?: string): Promise<void> {
    const url =
      BOOKING_360_ENDPOINTS.GUEST_ACCESS(reservationId) +
      (reason ? `?reason=${encodeURIComponent(reason)}` : "");
    return this.api.delete(url);
  }
}
