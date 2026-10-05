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

/**
 * Repository implementation for managing venue reservation lifecycles and operational workflows.
 * Wraps {@link IBookingService} to provide clean domain abstractions for draft creation,
 * two-phase holds, cryptographic confirmations, lifecycle transitions, and conflict-checked alterations.
 */
export class BookingRepository implements IBookingRepository {
  constructor(private readonly service: IBookingService) {}

  /**
   * Initializes a pending reservation draft for a specific resource, time window, and customer.
   * @param input Draft specifications including facility, resource, customer, and local time range.
   * @returns The generated reservation identifier.
   */
  createDraft(input: CreateBookingDraftInput): Promise<{ id: string }> {
    return this.service.createDraft(input);
  }

  /**
   * Establishes a temporary reservation hold, acquiring an optimistic concurrency lock and starting hold countdown.
   * @param reservationId The reservation identifier to lock.
   * @param idempotencyKey Client-generated idempotency key preventing duplicate hold acquisition.
   * @returns Hold confirmation payload containing expiration UTC timestamp.
   */
  createHold(reservationId: string, idempotencyKey: string): Promise<BookingHoldResult> {
    return this.service.createHold(reservationId, idempotencyKey);
  }

  /**
   * Confirms a held reservation, linking an immutable price quote and finalizing the booking slot.
   * @param reservationId Target reservation identifier.
   * @param idempotencyKey Unique idempotency key.
   * @param priceQuoteId Sealed price quote reference.
   * @returns Final confirmed booking state and reference numbers.
   */
  confirm(reservationId: string, idempotencyKey: string, priceQuoteId: string): Promise<ConfirmBookingResult> {
    return this.service.confirm(reservationId, idempotencyKey, priceQuoteId);
  }

  /**
   * Transitions a confirmed reservation into the active checked-in status upon customer arrival.
   * @param reservationId The reservation identifier.
   * @param idempotencyKey Unique idempotency key.
   * @returns Updated lifecycle status.
   */
  checkIn(reservationId: string, idempotencyKey: string): Promise<ReservationLifecycleResult> {
    return this.service.checkIn(reservationId, idempotencyKey);
  }

  /**
   * Concludes an active reservation session, releasing the resource back into the available pool.
   * @param reservationId Target reservation identifier.
   * @param idempotencyKey Unique idempotency key.
   * @returns Concluded lifecycle record.
   */
  complete(reservationId: string, idempotencyKey: string): Promise<ReservationLifecycleResult> {
    return this.service.complete(reservationId, idempotencyKey);
  }

  /**
   * Marks a reservation as No-Show if the client fails to arrive within the configured grace window.
   * @param reservationId Target reservation identifier.
   * @param idempotencyKey Unique idempotency key.
   * @param reason Operational justification or audit notation.
   * @returns Updated lifecycle status.
   */
  markNoShow(
    reservationId: string,
    idempotencyKey: string,
    reason: string
  ): Promise<ReservationLifecycleResult> {
    return this.service.markNoShow(reservationId, idempotencyKey, reason);
  }

  /**
   * Cancels a reservation, freeing up reserved resource slots and recording cancellation telemetry.
   * @param reservationId Target reservation identifier.
   * @param idempotencyKey Unique idempotency key.
   * @param reason Cancellation reasoning or customer-initiated code.
   * @returns Cancellation lifecycle summary.
   */
  cancel(reservationId: string, idempotencyKey: string, reason: string): Promise<ReservationLifecycleResult> {
    return this.service.cancel(reservationId, idempotencyKey, reason);
  }

  /**
   * Reschedules an existing reservation to a different time slot subject to availability checks.
   * @param reservationId Target reservation identifier.
   * @param input Target date, time, and optional adjustment reasons.
   * @returns Updated lifecycle status and modified schedule timeframes.
   */
  reschedule(reservationId: string, input: RescheduleReservationInput): Promise<ReservationLifecycleResult> {
    return this.service.reschedule(reservationId, input);
  }

  /**
   * Migrates a reservation to an alternative schedulable resource (e.g. court or pitch upgrade/swap).
   * @param reservationId Target reservation identifier.
   * @param input Target resource ID and operational swap rationale.
   * @returns Updated lifecycle result reflecting the new resource mapping.
   */
  changeResource(reservationId: string, input: ChangeReservationResourceInput): Promise<ReservationLifecycleResult> {
    return this.service.changeResource(reservationId, input);
  }

  /**
   * Retrieves full 360-degree operational details, telemetry, and audit trail for a reservation.
   * @param reservationId Target reservation identifier.
   * @returns Deep reservation aggregate including participants, pricing, holds, and state transitions.
   */
  getReservation(reservationId: string): Promise<ReservationDetails> {
    return this.service.getReservation(reservationId);
  }
}
