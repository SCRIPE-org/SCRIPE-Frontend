import type {
  Booking360Reservation,
  GuestAccessStatus,
  GenerateGuestAccessResult,
  SendGuestLinkResult,
} from "../entities/Booking360";

/**
 * Repository contract for Booking 360 domain operations.
 */
export interface IBooking360Repository {
  getById(reservationId: string): Promise<Booking360Reservation>;
  getGuestAccessStatus(reservationId: string): Promise<GuestAccessStatus>;
  generateGuestAccess(
    reservationId: string,
    durationMinutes?: number
  ): Promise<GenerateGuestAccessResult>;
  sendGuestLink(reservationId: string, recipient?: string): Promise<SendGuestLinkResult>;
  revokeGuestAccess(reservationId: string, reason?: string): Promise<void>;
}
