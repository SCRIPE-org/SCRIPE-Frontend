import type { IApiService } from "@core/interfaces/api.interface";
import type {
  BookingBusinessIntent,
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
import { clearBookingIntent, getOrCreateBookingIntent } from "./bookingIntentStore";

/**
 * Documentation for module export
 */
export class BookingService implements IBookingService {
  constructor(private readonly api: IApiService) {}

  getOrCreateBusinessIntent(
    fingerprint: string,
    confirmationFingerprint?: string
  ): Promise<BookingBusinessIntent> {
    return getOrCreateBookingIntent(fingerprint, confirmationFingerprint);
  }

  clearBusinessIntent(): void {
    clearBookingIntent();
  }

  /**
   * Sends a business mutation through the shared bounded retry policy using its caller-owned key.
   * @param endpoint - Venue mutation endpoint.
   * @param payload - Request body containing the same idempotency key.
   * @param idempotencyKey - Stable key for this business intent and all transport retries.
   * @returns The endpoint response after success or the final retryable failure.
   */
  private postIntent<T>(endpoint: string, payload: unknown, idempotencyKey: string): Promise<T> {
    const intent = { idempotencyKey };
    return (
      this.api.postWithRetry?.(endpoint, payload, undefined, intent) ??
      this.api.post(endpoint, payload, undefined, intent)
    );
  }

  createDraft(input: CreateBookingDraftInput): Promise<{ id: string }> {
    return this.postIntent(
      BOOKING_ENDPOINTS.RESERVATIONS,
      {
        ...input,
        bookerPartyId: null,
        payerPartyId: null,
        idempotencyKey: input.idempotencyKey,
      },
      input.idempotencyKey
    );
  }

  createHold(reservationId: string, idempotencyKey: string): Promise<BookingHoldResult> {
    return this.postIntent(
      BOOKING_ENDPOINTS.HOLDS,
      { reservationId, idempotencyKey },
      idempotencyKey
    );
  }

  confirm(
    reservationId: string,
    idempotencyKey: string,
    priceQuoteId: string
  ): Promise<ConfirmBookingResult> {
    return this.postIntent(
      BOOKING_ENDPOINTS.CONFIRM(reservationId),
      { idempotencyKey, priceQuoteId },
      idempotencyKey
    );
  }

  checkIn(reservationId: string, idempotencyKey: string): Promise<ReservationLifecycleResult> {
    return this.postIntent(
      BOOKING_ENDPOINTS.CHECK_IN(reservationId),
      { idempotencyKey },
      idempotencyKey
    );
  }

  complete(reservationId: string, idempotencyKey: string): Promise<ReservationLifecycleResult> {
    return this.postIntent(
      BOOKING_ENDPOINTS.COMPLETE(reservationId),
      { idempotencyKey },
      idempotencyKey
    );
  }

  markNoShow(
    reservationId: string,
    idempotencyKey: string,
    reason: string
  ): Promise<ReservationLifecycleResult> {
    return this.postIntent(
      BOOKING_ENDPOINTS.NO_SHOW(reservationId),
      { idempotencyKey, reason },
      idempotencyKey
    );
  }

  cancel(
    reservationId: string,
    idempotencyKey: string,
    reason: string
  ): Promise<ReservationLifecycleResult> {
    return this.postIntent(
      BOOKING_ENDPOINTS.CANCEL(reservationId),
      { idempotencyKey, reason },
      idempotencyKey
    );
  }

  reschedule(
    reservationId: string,
    input: RescheduleReservationInput
  ): Promise<ReservationLifecycleResult> {
    return this.postIntent(
      BOOKING_ENDPOINTS.RESCHEDULE(reservationId),
      input,
      input.idempotencyKey
    );
  }

  changeResource(
    reservationId: string,
    input: ChangeReservationResourceInput
  ): Promise<ReservationLifecycleResult> {
    return this.postIntent(
      BOOKING_ENDPOINTS.CHANGE_RESOURCE(reservationId),
      input,
      input.idempotencyKey
    );
  }

  getReservation(reservationId: string): Promise<ReservationDetails> {
    return this.api.get(BOOKING_ENDPOINTS.RESERVATION_BY_ID(reservationId));
  }
}
