import type {
  BookingHoldResult,
  ChangeReservationResourceInput,
  ConfirmBookingResult,
  CreateBookingDraftInput,
  ReservationDetails,
  ReservationLifecycleResult,
  RescheduleReservationInput,
} from "../../domain/entities/Booking";
import type { IBookingRepository } from "../../domain/interfaces/IBookingRepository";
import type { IBookingService } from "../../domain/interfaces/IBookingService";

export class BookingRepository implements IBookingRepository {
  constructor(private readonly service: IBookingService) {}

  createDraft(input: CreateBookingDraftInput): Promise<{ id: string }> {
    return this.service.createDraft(input);
  }
  createHold(reservationId: string, idempotencyKey: string): Promise<BookingHoldResult> {
    return this.service.createHold(reservationId, idempotencyKey);
  }
  confirm(reservationId: string, idempotencyKey: string, priceQuoteId: string): Promise<ConfirmBookingResult> {
    return this.service.confirm(reservationId, idempotencyKey, priceQuoteId);
  }
  checkIn(reservationId: string, idempotencyKey: string): Promise<ReservationLifecycleResult> {
    return this.service.checkIn(reservationId, idempotencyKey);
  }
  complete(reservationId: string, idempotencyKey: string): Promise<ReservationLifecycleResult> {
    return this.service.complete(reservationId, idempotencyKey);
  }
  markNoShow(
    reservationId: string,
    idempotencyKey: string,
    reason: string
  ): Promise<ReservationLifecycleResult> {
    return this.service.markNoShow(reservationId, idempotencyKey, reason);
  }
  cancel(reservationId: string, idempotencyKey: string, reason: string): Promise<ReservationLifecycleResult> {
    return this.service.cancel(reservationId, idempotencyKey, reason);
  }
  reschedule(reservationId: string, input: RescheduleReservationInput): Promise<ReservationLifecycleResult> {
    return this.service.reschedule(reservationId, input);
  }
  changeResource(reservationId: string, input: ChangeReservationResourceInput): Promise<ReservationLifecycleResult> {
    return this.service.changeResource(reservationId, input);
  }
  getReservation(reservationId: string): Promise<ReservationDetails> {
    return this.service.getReservation(reservationId);
  }
}
