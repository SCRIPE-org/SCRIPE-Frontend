import type { IApiService } from "@core/interfaces/api.interface";
import type {
  BookingHoldResult,
  ChangeReservationResourceInput,
  ConfirmBookingResult,
  CreateBookingDraftInput,
  ReservationDetails,
  ReservationLifecycleResult,
  RescheduleReservationInput,
} from "../../domain/entities/Booking";
import type { IBookingService } from "../../domain/interfaces/IBookingService";
import { BOOKING_ENDPOINTS } from "./booking.endpoints";

/**
 * Documentation for module export
 */
export class BookingService implements IBookingService {
  constructor(private readonly api: IApiService) {}

  createDraft(input: CreateBookingDraftInput): Promise<{ id: string }> {
    return this.api.post(BOOKING_ENDPOINTS.RESERVATIONS, {
      ...input,
      bookerPartyId: null,
      payerPartyId: null,
    });
  }

  createHold(reservationId: string, idempotencyKey: string): Promise<BookingHoldResult> {
    return this.api.post(BOOKING_ENDPOINTS.HOLDS, { reservationId, idempotencyKey });
  }

  confirm(reservationId: string, idempotencyKey: string, priceQuoteId: string): Promise<ConfirmBookingResult> {
    return this.api.post(BOOKING_ENDPOINTS.CONFIRM(reservationId), { idempotencyKey, priceQuoteId });
  }

  checkIn(reservationId: string, idempotencyKey: string): Promise<ReservationLifecycleResult> {
    return this.api.post(BOOKING_ENDPOINTS.CHECK_IN(reservationId), { idempotencyKey });
  }

  complete(reservationId: string, idempotencyKey: string): Promise<ReservationLifecycleResult> {
    return this.api.post(BOOKING_ENDPOINTS.COMPLETE(reservationId), { idempotencyKey });
  }

  markNoShow(
    reservationId: string,
    idempotencyKey: string,
    reason: string
  ): Promise<ReservationLifecycleResult> {
    return this.api.post(BOOKING_ENDPOINTS.NO_SHOW(reservationId), { idempotencyKey, reason });
  }

  cancel(reservationId: string, idempotencyKey: string, reason: string): Promise<ReservationLifecycleResult> {
    return this.api.post(BOOKING_ENDPOINTS.CANCEL(reservationId), { idempotencyKey, reason });
  }

  reschedule(reservationId: string, input: RescheduleReservationInput): Promise<ReservationLifecycleResult> {
    return this.api.post(BOOKING_ENDPOINTS.RESCHEDULE(reservationId), input);
  }

  changeResource(reservationId: string, input: ChangeReservationResourceInput): Promise<ReservationLifecycleResult> {
    return this.api.post(BOOKING_ENDPOINTS.CHANGE_RESOURCE(reservationId), input);
  }

  getReservation(reservationId: string): Promise<ReservationDetails> {
    return this.api.get(BOOKING_ENDPOINTS.RESERVATION_BY_ID(reservationId));
  }
}
