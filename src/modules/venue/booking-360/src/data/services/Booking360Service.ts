import type { IApiService } from "@core/interfaces/api.interface";
import type { Booking360Reservation } from "../../domain/entities/Booking360";
import type { IBooking360Service } from "../../domain/interfaces/IBooking360Service";
import { BOOKING_360_ENDPOINTS } from "./booking-360.endpoints";

/**
 * Documentation for module export
 */
export class Booking360Service implements IBooking360Service {
  constructor(private readonly api: IApiService) {}

  getById(reservationId: string): Promise<Booking360Reservation> {
    return this.api.get(BOOKING_360_ENDPOINTS.OPERATIONAL_DETAIL(reservationId));
  }
}
