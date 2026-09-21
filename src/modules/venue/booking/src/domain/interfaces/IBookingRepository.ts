import type {
  BookingHoldResult,
  ChangeReservationResourceInput,
  ConfirmBookingResult,
  CreateBookingDraftInput,
  ReservationDetails,
  ReservationLifecycleResult,
  RescheduleReservationInput,
} from "../entities/Booking";

export interface IBookingRepository {
  createDraft(input: CreateBookingDraftInput): Promise<{ id: string }>;
  createHold(reservationId: string, idempotencyKey: string): Promise<BookingHoldResult>;
  confirm(reservationId: string, idempotencyKey: string, priceQuoteId: string): Promise<ConfirmBookingResult>;
  checkIn(reservationId: string, idempotencyKey: string): Promise<ReservationLifecycleResult>;
  complete(reservationId: string, idempotencyKey: string): Promise<ReservationLifecycleResult>;
  markNoShow(
    reservationId: string,
    idempotencyKey: string,
    reason: string
  ): Promise<ReservationLifecycleResult>;
  cancel(reservationId: string, idempotencyKey: string, reason: string): Promise<ReservationLifecycleResult>;
  reschedule(reservationId: string, input: RescheduleReservationInput): Promise<ReservationLifecycleResult>;
  changeResource(reservationId: string, input: ChangeReservationResourceInput): Promise<ReservationLifecycleResult>;
  getReservation(reservationId: string): Promise<ReservationDetails>;
}
