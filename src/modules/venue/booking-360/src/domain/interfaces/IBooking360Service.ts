import type { Booking360Reservation } from "../entities/Booking360";

/**
 * Documentation for module export
 */
export interface IBooking360Service {
  getById(reservationId: string): Promise<Booking360Reservation>;
}
