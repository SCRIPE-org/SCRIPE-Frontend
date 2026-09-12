import type { Booking360Reservation } from "../../domain/entities/Booking360";
import type { IBooking360Repository } from "../../domain/interfaces/IBooking360Repository";
import type { IBooking360Service } from "../../domain/interfaces/IBooking360Service";

export class Booking360Repository implements IBooking360Repository {
  constructor(private readonly service: IBooking360Service) {}

  getById(reservationId: string): Promise<Booking360Reservation> {
    return this.service.getById(reservationId);
  }
}
