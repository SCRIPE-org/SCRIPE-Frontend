"use client";

import { useCallback } from "react";
import type { MutableRefObject } from "react";
import type { CustomerSummary, PriceQuote } from "@modules/venue";
import type { getVenueContainer } from "@modules/venue/di";
import type { CalendarResource } from "../../../domain/entities/OperationsCalendar";
import { isConflictError } from "./clickToBookIntents";

type VenueContainer = ReturnType<typeof getVenueContainer>;

export interface PendingBookingContext {
  resource: CalendarResource;
  customer: CustomerSummary;
  instantUtc: string;
  durationMinutes: number;
}

interface UseClickToBookSubmissionProps {
  bookingRepository: VenueContainer["bookingRepository"];
  selectedResource: CalendarResource | null;
  selectedCustomer: CustomerSummary | null;
  startUtc: string;
  endUtc: string;
  duration: number;
  canCreateBooking: boolean;
  canCreateHold: boolean;
  canRecordPayment: boolean;
  submitting: boolean;
  holdExpired: boolean;
  quote: PriceQuote | null;
  priceChangeNotice: { oldPrice: number; newPrice: number; currency: string } | null;
  paymentChoice: "later" | "now";
  payNowAmount: number;
  tRef: MutableRefObject<(key: string, params?: Record<string, string | number>) => string>;
  pendingBookingContextRef: MutableRefObject<PendingBookingContext | null>;
  fetchAuthoritativeQuote: () => Promise<void>;
  setQuoteExpiredMessage: (value: boolean) => void;
  recordAndAllocatePayment: (params: {
    targetReservationId: string;
    resource: CalendarResource;
    customerId: string;
    amount: number;
    currencyCode: string;
    reason: string;
    accumulatePaid: boolean;
  }) => Promise<void>;
  setStage: (stage: "booking" | "conflict" | "confirmed") => void;
  setSubmitting: (value: boolean) => void;
  setError: (value: string | null) => void;
  setHoldExpiresAtUtc: (value: string | null) => void;
  setHoldExpired: (value: boolean) => void;
  setReservationId: (value: string | null) => void;
  setReservationNumber: (value: string) => void;
  onSuccess: () => void;
}

/**
 * Sub-hook encapsulating idempotent draft/hold creation and final booking confirmation.
 */
export function useClickToBookSubmission({
  bookingRepository,
  selectedResource,
  selectedCustomer,
  startUtc,
  endUtc,
  duration,
  canCreateBooking,
  canCreateHold,
  canRecordPayment,
  submitting,
  holdExpired,
  quote,
  priceChangeNotice,
  paymentChoice,
  payNowAmount,
  tRef,
  pendingBookingContextRef,
  fetchAuthoritativeQuote,
  setQuoteExpiredMessage,
  recordAndAllocatePayment,
  setStage,
  setSubmitting,
  setError,
  setHoldExpiresAtUtc,
  setHoldExpired,
  setReservationId,
  setReservationNumber,
  onSuccess,
}: UseClickToBookSubmissionProps) {
  const createDraftAndHold = useCallback(
    async (confirmationFingerprint?: string) => {
      if (!selectedResource || !selectedCustomer) {
        throw new Error(
          tRef.current("operationsCalendar.clickToBook.errors.chooseResourceAndCustomer"),
        );
      }

      const intent = await bookingRepository.getOrCreateBusinessIntent(
        JSON.stringify([selectedResource.id, selectedCustomer.id, startUtc, endUtc, 1]),
        confirmationFingerprint,
      );

      pendingBookingContextRef.current = {
        resource: selectedResource,
        customer: selectedCustomer,
        instantUtc: startUtc,
        durationMinutes: duration,
      };

      const draft = await bookingRepository.createDraft({
        resourceId: selectedResource.id,
        customerPartyId: selectedCustomer.id,
        requestedStartUtc: startUtc,
        requestedEndUtc: endUtc,
        quantity: 1,
        idempotencyKey: intent.draftIdempotencyKey,
      });

      const hold = await bookingRepository.createHold(draft.id, intent.holdIdempotencyKey);
      bookingRepository.recordBusinessHoldExpiry(
        intent.draftIdempotencyKey,
        intent.holdIdempotencyKey,
        hold.expiresAtUtc,
      );

      const holdValid =
        Number.isFinite(Date.parse(hold.expiresAtUtc)) && Date.parse(hold.expiresAtUtc) > Date.now();
      return { intent, draft, hold, holdValid, resource: selectedResource, customer: selectedCustomer };
    },
    [
      bookingRepository,
      duration,
      endUtc,
      pendingBookingContextRef,
      selectedCustomer,
      selectedResource,
      startUtc,
      tRef,
    ],
  );

  const handleConfirm = useCallback(async () => {
    if (!canCreateBooking || !selectedResource || !selectedCustomer || submitting) return;

    if (!quote) {
      setError(tRef.current("operationsCalendar.clickToBook.pricing.missingQuote"));
      return;
    }
    if (priceChangeNotice) {
      setError(tRef.current("operationsCalendar.clickToBook.pricing.acknowledgeNotice"));
      return;
    }
    if (holdExpired) {
      setError(tRef.current("operationsCalendar.clickToBook.hold.expired"));
      return;
    }
    if (quote.expiresAtUtc && Date.parse(quote.expiresAtUtc) < Date.now()) {
      setQuoteExpiredMessage(true);
      void fetchAuthoritativeQuote();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const { intent, draft, holdValid, resource, customer } = await createDraftAndHold(quote.id);
      if (!holdValid) {
        setHoldExpired(true);
        throw new Error(tRef.current("operationsCalendar.clickToBook.hold.expired"));
      }

      await bookingRepository.confirm(draft.id, intent.confirmIdempotencyKey, quote.id);
      const reservation = await bookingRepository.getReservation(draft.id);
      setReservationId(draft.id);
      setReservationNumber(reservation.reservationNumber);
      bookingRepository.clearBusinessIntent();
      pendingBookingContextRef.current = null;

      if (paymentChoice === "now" && canRecordPayment && payNowAmount > 0) {
        await recordAndAllocatePayment({
          targetReservationId: draft.id,
          resource,
          customerId: customer.id,
          amount: payNowAmount,
          currencyCode: quote.currencyCode || "EGP",
          reason: tRef.current("operationsCalendar.clickToBook.payment.initialAuditNote"),
          accumulatePaid: false,
        });
      }

      setStage("confirmed");
      onSuccess();
    } catch (err) {
      if (isConflictError(err)) {
        setStage("conflict");
      } else {
        setError(
          err instanceof Error && err.message
            ? err.message
            : tRef.current("operationsCalendar.clickToBook.confirm.failed"),
        );
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    bookingRepository,
    canCreateBooking,
    canRecordPayment,
    createDraftAndHold,
    fetchAuthoritativeQuote,
    holdExpired,
    onSuccess,
    payNowAmount,
    paymentChoice,
    pendingBookingContextRef,
    priceChangeNotice,
    quote,
    recordAndAllocatePayment,
    selectedCustomer,
    selectedResource,
    setError,
    setHoldExpired,
    setQuoteExpiredMessage,
    setReservationId,
    setReservationNumber,
    setStage,
    setSubmitting,
    submitting,
    tRef,
  ]);

  const handleHoldTemporarily = useCallback(async () => {
    if (!canCreateHold || !selectedResource || !selectedCustomer || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { draft, hold, holdValid } = await createDraftAndHold();
      if (!holdValid) {
        setHoldExpired(true);
        setError(tRef.current("operationsCalendar.clickToBook.hold.expired"));
        return;
      }
      const reservation = await bookingRepository.getReservation(draft.id);
      setReservationId(draft.id);
      setReservationNumber(reservation.reservationNumber);
      setHoldExpiresAtUtc(hold.expiresAtUtc);
    } catch (err) {
      if (isConflictError(err)) {
        setStage("conflict");
      } else {
        setError(
          err instanceof Error && err.message
            ? err.message
            : tRef.current("operationsCalendar.clickToBook.hold.failed"),
        );
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    bookingRepository,
    canCreateHold,
    createDraftAndHold,
    selectedCustomer,
    selectedResource,
    setError,
    setHoldExpired,
    setHoldExpiresAtUtc,
    setReservationId,
    setReservationNumber,
    setStage,
    setSubmitting,
    submitting,
    tRef,
  ]);

  return { handleConfirm, handleHoldTemporarily };
}
