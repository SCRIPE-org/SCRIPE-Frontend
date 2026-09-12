import type { Booking360Reservation } from "../entities/Booking360";

export interface IBooking360Repository {
  getById(reservationId: string): Promise<Booking360Reservation>;
}
