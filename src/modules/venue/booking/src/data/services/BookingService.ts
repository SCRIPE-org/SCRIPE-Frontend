import { buildUrl } from "@/core/config/api-endpoints/_shared";
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
import type {
  IBookingService,
  CustomerReservationSummary,
  PagedCustomerReservations,
} from "../../domain/interfaces/IBookingService";
import { BOOKING_ENDPOINTS } from "./booking.endpoints";
import {
  clearBookingIntent,
  getOrCreateBookingIntent,
  recordBookingHoldExpiry,
} from "./bookingIntentStore";

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

  recordBusinessHoldExpiry(
    draftIdempotencyKey: string,
    holdIdempotencyKey: string,
    expiresAtUtc: string
  ): void {
    recordBookingHoldExpiry(draftIdempotencyKey, holdIdempotencyKey, expiresAtUtc);
  }

  /**
   * Sends a business mutation through the shared bounded retry policy using its caller-owned key.
   * @param endpoint - Venue mutation endpoint.
   * @param payload - Request body containing the same idempotency key.
   * @param idempotencyKey - Stable key for this business intent and all transport retries.
   * @returns The endpoint response after success or the final retryable failure.
   */
  private postIntent<T>(endpoint: string, payload: unknown, idempotencyKey?: string): Promise<T> {
    const intent = idempotencyKey ? { idempotencyKey } : undefined;
    return (
      this.api.postWithRetry?.(endpoint, payload, undefined, intent) ??
      this.api.post(endpoint, payload, undefined, intent)
    );
  }

  createDraft(input: CreateBookingDraftInput): Promise<{ id: string }> {
    const { idempotencyKey, ...payload } = input;
    return this.postIntent(
      BOOKING_ENDPOINTS.RESERVATIONS,
      {
        ...payload,
        bookerPartyId: null,
        payerPartyId: null,
      },
      idempotencyKey
    );
  }

  createHold(reservationId: string, idempotencyKey: string): Promise<BookingHoldResult> {
    return this.postIntent(
      BOOKING_ENDPOINTS.HOLDS,
      { reservationId },
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
      { priceQuoteId },
      idempotencyKey
    );
  }

  checkIn(reservationId: string, idempotencyKey: string): Promise<ReservationLifecycleResult> {
    return this.postIntent(
      BOOKING_ENDPOINTS.CHECK_IN(reservationId),
      {},
      idempotencyKey
    );
  }

  complete(reservationId: string, idempotencyKey: string): Promise<ReservationLifecycleResult> {
    return this.postIntent(
      BOOKING_ENDPOINTS.COMPLETE(reservationId),
      {},
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
      { reason },
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
      { reason },
      idempotencyKey
    );
  }

  reschedule(
    reservationId: string,
    input: RescheduleReservationInput
  ): Promise<ReservationLifecycleResult> {
    const { idempotencyKey, ...payload } = input;
    return this.postIntent(
      BOOKING_ENDPOINTS.RESCHEDULE(reservationId),
      payload,
      idempotencyKey
    );
  }

  changeResource(
    reservationId: string,
    input: ChangeReservationResourceInput
  ): Promise<ReservationLifecycleResult> {
    const { idempotencyKey, ...payload } = input;
    return this.postIntent(
      BOOKING_ENDPOINTS.CHANGE_RESOURCE(reservationId),
      payload,
      idempotencyKey
    );
  }

  getReservation(reservationId: string): Promise<ReservationDetails> {
    return this.api.get(BOOKING_ENDPOINTS.RESERVATION_BY_ID(reservationId));
  }

  async getCustomerReservations(
    customerPartyId: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<PagedCustomerReservations> {
    const url = buildUrl(BOOKING_ENDPOINTS.RESERVATIONS, {
      customerPartyId: customerPartyId.trim(),
      page: Math.max(1, page),
      pageSize: Math.max(1, Math.min(pageSize, 100)),
    });

    const result = await this.api.get<any>(url);

    const rawItems = Array.isArray(result?.items)
      ? result.items
      : Array.isArray(result)
      ? result
      : [];

    const items: CustomerReservationSummary[] = rawItems.map((item: any) => ({
      id: String(item.id ?? ""),
      reservationNumber: String(item.reservationNumber ?? ""),
      status: String(item.status ?? ""),
      resourceId: String(item.resourceId ?? ""),
      requestedStartUtc: String(item.requestedStartUtc ?? ""),
      requestedEndUtc: String(item.requestedEndUtc ?? ""),
      quantity: Number(item.quantity ?? 1),
      createdAt: String(item.createdAt ?? ""),
    }));

    const totalCount = typeof result?.totalCount === "number" ? result.totalCount : items.length;
    const pageNumber = typeof result?.pageNumber === "number" ? result.pageNumber : page;
    const effectivePageSize = typeof result?.pageSize === "number" ? result.pageSize : pageSize;
    const totalPages =
      typeof result?.totalPages === "number"
        ? result.totalPages
        : Math.ceil(totalCount / effectivePageSize) || 1;

    return {
      items,
      totalCount,
      pageNumber,
      pageSize: effectivePageSize,
      totalPages,
    };
  }
}
