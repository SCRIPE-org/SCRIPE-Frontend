import type { Booking360Reservation } from "../entities/Booking360";

/**
 * Documentation for module export
 */
export interface IBooking360Repository {
  getById(reservationId: string): Promise<Booking360Reservation>;
}
