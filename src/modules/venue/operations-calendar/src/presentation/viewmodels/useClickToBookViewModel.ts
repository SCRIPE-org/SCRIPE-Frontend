"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { getVenueContainer } from "@modules/venue/di";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";
import { getNextSlotInstantUtc } from "./click-to-book/clickToBookIntents";
import {
  formatBookingDateDisplay,
  formatBookingTimeRange,
  getAllowedDurationsForPolicy,
} from "./click-to-book/clickToBookFormatters";
import { useClickToBookCustomer } from "./click-to-book/useClickToBookCustomer";
import { useClickToBookPricing } from "./click-to-book/useClickToBookPricing";
import { useClickToBookPayment } from "./click-to-book/useClickToBookPayment";
import { useHoldCountdown, useResourceSlotPolicy } from "./click-to-book/useClickToBookSession";
import { useClickToBookStep0 } from "./click-to-book/useClickToBookStep0";
import {
  type PendingBookingContext,
  useClickToBookSubmission,
} from "./click-to-book/useClickToBookSubmission";

export { getNextSlotInstantUtc };

export interface UseClickToBookProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: CalendarResource | null;
  instantUtc: string | null;
  timeZoneId: string;
  durationMinutes?: number;
  resources?: CalendarResource[];
  initialCustomerId?: string | null;
  onSuccess: () => void;
  onBlockTime?: (resource: CalendarResource, instantUtc: string) => void;
  onFindSlots?: () => void;
}

/**
 * Orchestrating ViewModel for the 4-step Click-to-Book booking workflow.
 */
export function useClickToBookViewModel({
  open,
  resource: initialResource,
  instantUtc: initialInstantUtc,
  timeZoneId,
  durationMinutes: initialDurationMinutes = 60,
  resources = [],
  initialCustomerId,
  onSuccess,
  onBlockTime,
  onFindSlots,
}: UseClickToBookProps) {
  const { t, language } = useI18n();
  const isRtl = language === "ar";
  const tRef = useRef(t);
  useEffect(() => {
    tRef.current = t;
  }, [t]);

  const {
    bookingRepository,
    customerRepository,
    commercialPricingRepository,
    moneyRepository,
    schedulableResourceRepository,
    availabilityRepository,
  } = getVenueContainer();

  const canCreateBooking = usePermission(VENUE_PERMISSIONS.RESERVATION_CREATE);
  const canCreateHold = usePermission(VENUE_PERMISSIONS.BOOKING_HOLD_CREATE);
  const canRecordPayment = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_CREATE);
  const canOverridePrice = usePermission(VENUE_PERMISSIONS.CATALOG_PRICING_OVERRIDE_PRICE);

  const [selectedResource, setSelectedResource] = useState<CalendarResource | null>(
    initialResource,
  );
  const [selectedInstantUtc, setSelectedInstantUtc] = useState<string | null>(initialInstantUtc);
  const slotPolicy = useResourceSlotPolicy(selectedResource, schedulableResourceRepository);
  const allowedDurations = getAllowedDurationsForPolicy(slotPolicy);

  const [rawDuration, setDuration] = useState<number>(
    () => initialResource?.slotPolicy?.slotDurationMinutes ?? initialDurationMinutes,
  );
  const duration = allowedDurations.includes(rawDuration) ? rawDuration : allowedDurations[0];

  const isContextual = Boolean(initialResource && initialInstantUtc);
  const [step, setStep] = useState<number>(isContextual ? 1 : 0);
  const [stage, setStage] = useState<"booking" | "conflict" | "confirmed">("booking");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hold = useHoldCountdown();
  const [step0Error, setStep0Error] = useState<string | null>(null);
  const [step0Checking, setStep0Checking] = useState(false);
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [reservationNumber, setReservationNumber] = useState<string>("");

  const [defaultStartUtc] = useState(() => getNextSlotInstantUtc(30));
  const pendingBookingContextRef = useRef<PendingBookingContext | null>(null);

  const startUtc = selectedInstantUtc || defaultStartUtc;
  const endUtc = new Date(Date.parse(startUtc) + duration * 60 * 1000).toISOString();

  const customer = useClickToBookCustomer({
    open,
    customerRepository,
    tRef,
    onCustomerCreated: () => setStep(2),
    setSubmitting,
  });

  const paymentRef = useRef<(amount: number) => void>(() => {});
  const handleQuoteLoaded = useCallback((grandTotal: number) => {
    paymentRef.current(grandTotal);
  }, []);

  const pricing = useClickToBookPricing({
    commercialPricingRepository,
    selectedResource,
    selectedCustomer: customer.selectedCustomer,
    startUtc,
    endUtc,
    canOverridePrice,
    tRef,
    onQuoteLoaded: handleQuoteLoaded,
  });

  const payment = useClickToBookPayment({
    moneyRepository,
    schedulableResourceRepository,
    resources,
    selectedResource,
    selectedCustomer: customer.selectedCustomer,
    reservationId,
    quote: pricing.quote,
    canRecordPayment,
    tRef,
  });

  const { setPayNowAmount } = payment;
  useEffect(() => {
    paymentRef.current = setPayNowAmount;
  }, [setPayNowAmount]);

  const { resetCustomerState, selectedCustomer } = customer;
  const { resetPricingState, fetchAuthoritativeQuote } = pricing;
  const { resetPaymentState } = payment;
  const { setHoldExpiresAtUtc, setHoldCountdown, setHoldExpired } = hold;

  const prevOpenRef = useRef(false);
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      const pending = pendingBookingContextRef.current;
      const targetResource = pending?.resource ?? initialResource ?? (resources[0] || null);
      setSelectedResource(targetResource);
      const defaultStart = getNextSlotInstantUtc(
        targetResource?.slotPolicy?.startIncrementMinutes ?? 30,
      );
      setSelectedInstantUtc(pending?.instantUtc ?? initialInstantUtc ?? defaultStart);
      setDuration(pending?.durationMinutes ?? initialDurationMinutes);
      setStep(pending ? 2 : initialResource && initialInstantUtc ? 1 : 0);
      setStage("booking");
      setSubmitting(false);
      setError(null);
      setStep0Error(null);
      setStep0Checking(false);
      setHoldExpiresAtUtc(null);
      setHoldCountdown(null);
      setHoldExpired(false);
      setReservationId(null);
      setReservationNumber("");
      resetCustomerState(pending?.customer ?? null, initialCustomerId);
      resetPricingState();
      resetPaymentState();
    }
    prevOpenRef.current = open;
  }, [
    open,
    initialResource,
    initialInstantUtc,
    initialDurationMinutes,
    resources,
    initialCustomerId,
    resetCustomerState,
    resetPricingState,
    resetPaymentState,
    setHoldExpiresAtUtc,
    setHoldCountdown,
    setHoldExpired,
  ]);

  useEffect(() => {
    if (open && selectedResource && selectedCustomer && step === 2) {
      void fetchAuthoritativeQuote();
    }
  }, [fetchAuthoritativeQuote, open, selectedCustomer, selectedResource, step]);

  const { handleStep0Next } = useClickToBookStep0({
    commercialPricingRepository,
    availabilityRepository,
    selectedResource,
    startUtc,
    endUtc,
    timeZoneId,
    tRef,
    setStep,
    setStep0Error,
    setStep0Checking,
  });

  const submission = useClickToBookSubmission({
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
    holdExpired: hold.holdExpired,
    quote: pricing.quote,
    priceChangeNotice: pricing.priceChangeNotice,
    paymentChoice: payment.paymentChoice,
    payNowAmount: payment.payNowAmount,
    tRef,
    pendingBookingContextRef,
    fetchAuthoritativeQuote,
    setQuoteExpiredMessage: pricing.setQuoteExpiredMessage,
    recordAndAllocatePayment: payment.recordAndAllocatePayment,
    setStage,
    setSubmitting,
    setError,
    setHoldExpiresAtUtc,
    setHoldExpired,
    setReservationId,
    setReservationNumber,
    onSuccess,
  });

  const formatTimeRange = () => formatBookingTimeRange(startUtc, endUtc, language, timeZoneId);
  const formatDateDisplay = () => formatBookingDateDisplay(startUtc, language, timeZoneId);

  return {
    t,
    isRtl,
    canCreateBooking,
    canCreateHold,
    canRecordPayment,
    canOverridePrice,
    selectedResource,
    setSelectedResource,
    selectedInstantUtc,
    setSelectedInstantUtc,
    slotPolicy,
    allowedDurations,
    duration,
    setDuration,
    isContextual,
    step,
    setStep,
    stage,
    setStage,
    submitting,
    error,
    ...customer,
    ...pricing,
    holdExpiresAtUtc: hold.holdExpiresAtUtc,
    holdCountdown: hold.holdCountdown,
    holdExpired: hold.holdExpired,
    setHoldExpired: hold.setHoldExpired,
    step0Error,
    step0Checking,
    ...payment,
    reservationId,
    reservationNumber,
    startUtc,
    endUtc,
    handleStep0Next,
    ...submission,
    formatTimeRange,
    formatDateDisplay,
    onBlockTime,
    onFindSlots,
  };
}
