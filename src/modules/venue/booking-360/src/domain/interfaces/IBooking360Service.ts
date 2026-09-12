import type { Booking360Reservation } from "../entities/Booking360";

export interface IBooking360Service {
  getById(reservationId: string): Promise<Booking360Reservation>;
}
