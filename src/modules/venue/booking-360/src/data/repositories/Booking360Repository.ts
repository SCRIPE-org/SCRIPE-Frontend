import type {
  Booking360Reservation,
  GuestAccessStatus,
  GenerateGuestAccessResult,
  SendGuestLinkResult,
} from "../../domain/entities/Booking360";
import type { IBooking360Repository } from "../../domain/interfaces/IBooking360Repository";
import type { IBooking360Service } from "../../domain/interfaces/IBooking360Service";

/**
 * Repository implementation for Booking 360 domain operations.
 */
export class Booking360Repository implements IBooking360Repository {
  constructor(private readonly service: IBooking360Service) {}

  getById(reservationId: string): Promise<Booking360Reservation> {
    return this.service.getById(reservationId);
  }

  getGuestAccessStatus(reservationId: string): Promise<GuestAccessStatus> {
    return this.service.getGuestAccessStatus(reservationId);
  }

  generateGuestAccess(
    reservationId: string,
    durationMinutes?: number
  ): Promise<GenerateGuestAccessResult> {
    return this.service.generateGuestAccess(reservationId, durationMinutes);
  }

  sendGuestLink(reservationId: string, recipient?: string): Promise<SendGuestLinkResult> {
    return this.service.sendGuestLink(reservationId, recipient);
  }

  revokeGuestAccess(reservationId: string, reason?: string): Promise<void> {
    return this.service.revokeGuestAccess(reservationId, reason);
  }
}
