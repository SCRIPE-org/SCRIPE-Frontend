"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { getVenueContainer } from "@modules/venue/di";
import type { PriceQuote } from "@modules/venue/commercial/src/domain/entities/CommercialPricing";
import type { CustomerSummary } from "@modules/venue/booking/src/domain/entities/Booking";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";

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

export function useClickToBookViewModel({
  open,
  onOpenChange,
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
  } = useMemo(() => getVenueContainer(), []);

  // Permissions
  const canCreateBooking = usePermission(VENUE_PERMISSIONS.RESERVATION_CREATE);
  const canCreateHold = usePermission(VENUE_PERMISSIONS.BOOKING_HOLD_CREATE);
  const canRecordPayment =
    usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_CREATE) ||
    usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW);
  const canOverridePrice = usePermission(
    VENUE_PERMISSIONS.CATALOG_PRICING_OVERRIDE_PRICE
  );

  // Selected court & time context
  const [selectedResource, setSelectedResource] = useState<CalendarResource | null>(
    initialResource
  );
  const [selectedInstantUtc, setSelectedInstantUtc] = useState<string | null>(
    initialInstantUtc
  );
  const [slotPolicy, setSlotPolicy] = useState<{
    slotDurationMinutes: number;
    startIncrementMinutes?: number;
    allowMultiSlot?: boolean;
  } | null>(initialResource?.slotPolicy ?? null);

  const allowedDurations = useMemo(() => {
    const base = slotPolicy?.slotDurationMinutes ?? 60;
    const allowMulti = slotPolicy?.allowMultiSlot ?? false;
    if (!allowMulti) {
      return [base];
    }
    return [base, base * 2, base * 3];
  }, [slotPolicy]);

  const [duration, setDuration] = useState<number>(() => {
    return initialResource?.slotPolicy?.slotDurationMinutes ?? initialDurationMinutes;
  });

  // Keep duration valid when allowedDurations changes
  useEffect(() => {
    if (allowedDurations.length > 0 && !allowedDurations.includes(duration)) {
      setDuration(allowedDurations[0]);
    }
  }, [allowedDurations, duration]);

  // Fetch slot policy for court if not already present
  useEffect(() => {
    if (!selectedResource) return;
    if (selectedResource.slotPolicy) {
      setSlotPolicy(selectedResource.slotPolicy);
      return;
    }
    let active = true;
    if (schedulableResourceRepository?.getById) {
      try {
        const p = schedulableResourceRepository.getById(selectedResource.id);
        if (p && typeof (p as any).then === "function") {
          void p
            .then((res: any) => {
              if (active && res?.slotPolicy) {
                setSlotPolicy({
                  slotDurationMinutes: res.slotPolicy.slotDurationMinutes,
                  startIncrementMinutes: res.slotPolicy.startIncrementMinutes,
                  allowMultiSlot: res.slotPolicy.allowMultiSlot ?? false,
                });
              }
            })
            .catch(() => {
              if (active) setSlotPolicy({ slotDurationMinutes: 60, allowMultiSlot: false });
            });
        }
      } catch {
        if (active) setSlotPolicy({ slotDurationMinutes: 60, allowMultiSlot: false });
      }
    }
    return () => {
      active = false;
    };
  }, [selectedResource, schedulableResourceRepository]);

  const isContextual = Boolean(initialResource && initialInstantUtc);
  const [step, setStep] = useState<number>(isContextual ? 1 : 0);

  // Stages: "booking" | "conflict" | "confirmed"
  const [stage, setStage] = useState<"booking" | "conflict" | "confirmed">("booking");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer state
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSearching, setCustomerSearching] = useState(false);
  const [customerSearchError, setCustomerSearchError] = useState(false);
  const [customerResults, setCustomerResults] = useState<CustomerSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");
  const [quickEmail, setQuickEmail] = useState("");
  const [quickAddError, setQuickAddError] = useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);

  // Authoritative Pricing Quote state
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteExpiredMessage, setQuoteExpiredMessage] = useState(false);

  // Price Override state
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideAmount, setOverrideAmount] = useState<string>("");
  const [overrideReason, setOverrideReason] = useState<string>("");

  // Hold & Countdown state
  const [holdExpiresAtUtc, setHoldExpiresAtUtc] = useState<string | null>(null);
  const [holdCountdown, setHoldCountdown] = useState<string | null>(null);
  const [holdExpired, setHoldExpired] = useState(false);

  // Price Change Acknowledgement state
  const previousQuoteRef = useRef<PriceQuote | null>(null);
  const [priceChangeNotice, setPriceChangeNotice] = useState<{
    oldPrice: number;
    newPrice: number;
    currency: string;
  } | null>(null);

  // Step 0 validation state
  const [step0Error, setStep0Error] = useState<string | null>(null);
  const [step0Checking, setStep0Checking] = useState(false);

  // Payment state
  const [paymentChoice, setPaymentChoice] = useState<"later" | "now">("later");
  const [payNowAmount, setPayNowAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<
    "Cash" | "Card" | "POS" | "BankTransfer" | "Other"
  >("Cash");
  const [paymentReference, setPaymentReference] = useState("");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentPartialFailure, setPaymentPartialFailure] = useState(false);
  const [recordingPaymentManual, setRecordingPaymentManual] = useState(false);

  // Reservation reference
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [reservationNumber, setReservationNumber] = useState<string>("");

  // Start & End calculations
  const startUtc = useMemo(() => {
    return selectedInstantUtc || "2026-10-09T09:00:00.000Z";
  }, [selectedInstantUtc]);

  const endUtc = useMemo(() => {
    return new Date(Date.parse(startUtc) + duration * 60 * 1000).toISOString();
  }, [startUtc, duration]);

  const prevOpenRef = useRef(false);

  // Full state reset on open transition
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setSelectedResource(initialResource ?? (resources[0] || null));
      setSelectedInstantUtc(initialInstantUtc ?? new Date().toISOString());
      setDuration(initialDurationMinutes);
      setStep(initialResource && initialInstantUtc ? 1 : 0);
      setStage("booking");
      setSubmitting(false);
      setError(null);
      setCustomerSearch("");
      setCustomerSearching(false);
      setCustomerSearchError(false);
      setCustomerResults([]);
      setSelectedCustomer(null);
      if (initialCustomerId) {
        customerRepository.getById(initialCustomerId).then((c) => {
          setSelectedCustomer(c);
        }).catch(() => {});
      }
      setQuickAddOpen(false);
      setQuickName("");
      setQuickPhone("");
      setQuickEmail("");
      setQuickAddError(null);
      setDuplicateWarning(null);
      previousQuoteRef.current = null;
      setPriceChangeNotice(null);
      setStep0Error(null);
      setStep0Checking(false);
      setQuote(null);
      setQuoteLoading(false);
      setQuoteError(null);
      setQuoteExpiredMessage(false);
      setOverrideOpen(false);
      setOverrideAmount("");
      setOverrideReason("");
      setHoldExpiresAtUtc(null);
      setHoldCountdown(null);
      setHoldExpired(false);
      setPaymentChoice("later");
      setPayNowAmount(0);
      setAmountPaid(0);
      setPaymentPartialFailure(false);
      setReservationId(null);
      setReservationNumber("");
    }
    prevOpenRef.current = open;
  }, [open, initialResource, initialInstantUtc, initialDurationMinutes, resources, customerRepository, initialCustomerId]);

  // Customer search with debounce
  useEffect(() => {
    if (!open || !customerSearch.trim() || customerSearch.trim().length < 2) {
      setCustomerResults([]);
      setCustomerSearchError(false);
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      setCustomerSearching(true);
      setCustomerSearchError(false);
      try {
        const results = await customerRepository.search(customerSearch.trim());
        if (active) setCustomerResults(results);
      } catch {
        if (active) setCustomerSearchError(true);
      } finally {
        if (active) setCustomerSearching(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customerRepository, customerSearch, open]);

  // Hold expiration countdown timer effect
  useEffect(() => {
    if (!holdExpiresAtUtc) {
      setHoldCountdown(null);
      setHoldExpired(false);
      return;
    }

    const targetTime = new Date(holdExpiresAtUtc).getTime();

    const updateTimer = () => {
      const remaining = targetTime - Date.now();
      if (remaining <= 0) {
        setHoldCountdown(null);
        setHoldExpired(true);
      } else {
        const mins = Math.floor(remaining / 60000);
        const secs = Math.floor((remaining % 60000) / 1000);
        setHoldCountdown(`${mins}:${secs < 10 ? "0" : ""}${secs}`);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAtUtc]);

  // Authoritative Price Quote calculation
  const fetchAuthoritativeQuote = useCallback(async () => {
    if (!selectedResource || !selectedCustomer) return;
    setQuoteLoading(true);
    setQuoteError(null);
    setQuoteExpiredMessage(false);

    try {
      const config = await commercialPricingRepository.getResourceConfiguration(
        selectedResource.id
      );
      const calcQuote = await commercialPricingRepository.calculateQuote({
        offeringId: config.offeringId,
        resourceId: selectedResource.id,
        partyId: selectedCustomer.id,
        quantity: 1,
        requestedStartUtc: startUtc,
        requestedEndUtc: endUtc,
        currencyCode: config.currencyCode || "EGP",
        expiresAtUtc: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        idempotencyKey: crypto.randomUUID(),
      });
      if (previousQuoteRef.current && calcQuote.grandTotal !== previousQuoteRef.current.grandTotal) {
        setPriceChangeNotice({
          oldPrice: previousQuoteRef.current.grandTotal,
          newPrice: calcQuote.grandTotal,
          currency: calcQuote.currencyCode || "EGP",
        });
      }
      previousQuoteRef.current = calcQuote;
      setQuote(calcQuote);
      setPayNowAmount(calcQuote.grandTotal);
    } catch (err) {
      setQuote(null);
      setQuoteError(
        err instanceof Error
          ? err.message
          : tRef.current("operationsCalendar.clickToBook.pricing.failed")
      );
    } finally {
      setQuoteLoading(false);
    }
  }, [
    commercialPricingRepository,
    endUtc,
    selectedCustomer,
    selectedResource,
    startUtc,
  ]);

  const handleStep0Next = useCallback(async () => {
    if (!selectedResource) return;
    setStep0Checking(true);
    setStep0Error(null);
    try {
      const container = getVenueContainer();
      const localDate = new Date(startUtc).toISOString().slice(0, 10);
      const startTimeStr = new Date(startUtc).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: timeZoneId || "UTC",
      });
      const endTimeStr = new Date(endUtc).toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: timeZoneId || "UTC",
      });
      const startLocal = `${localDate}T${startTimeStr}:00`;
      const endLocal = `${localDate}T${endTimeStr}:00`;

      if (container.availabilityRepository?.search) {
        const res = await container.availabilityRepository.search({
          resourceId: selectedResource.id,
          timeZoneId: timeZoneId || "UTC",
          startLocal,
          endLocal,
          quantity: 1,
        });

        if (res && res.isAvailable === false) {
          setStep0Error(
            tRef.current("operationsCalendar.clickToBook.step0.slotUnavailable") ||
              "This time slot is not available (occupied, closed, or maintenance). Please select another time."
          );
          return;
        }
      }
      setStep(1);
    } catch {
      setStep(1);
    } finally {
      setStep0Checking(false);
    }
  }, [endUtc, selectedResource, startUtc, timeZoneId]);

  useEffect(() => {
    if (open && selectedResource && selectedCustomer && step === 2) {
      void fetchAuthoritativeQuote();
    }
  }, [fetchAuthoritativeQuote, open, selectedCustomer, selectedResource, step]);

  // Quick Add Customer Handler with duplicate checks
  const handleQuickAddCustomer = async () => {
    const trimmedName = quickName.trim();
    if (!trimmedName) {
      setQuickAddError("Customer name is required.");
      return;
    }

    const duplicate = customerResults.find(
      (c) =>
        c.displayName.toLowerCase() === trimmedName.toLowerCase() ||
        (quickPhone && c.type?.includes(quickPhone))
    );
    if (duplicate && !duplicateWarning) {
      setDuplicateWarning(
        `${t("operationsCalendar.clickToBook.customer.duplicateWarning")}: ${duplicate.displayName}`
      );
      return;
    }

    setQuickAddError(null);
    setSubmitting(true);
    try {
      const created = await customerRepository.create(trimmedName, "Person");
      setSelectedCustomer(created);
      setQuickAddOpen(false);
      setQuickName("");
      setQuickPhone("");
      setQuickEmail("");
      setDuplicateWarning(null);
      setStep(2);
    } catch (err) {
      setQuickAddError(
        err instanceof Error ? err.message : "Failed to create customer. Please check input."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Primary Action: Confirm Booking
  const handleConfirm = useCallback(async () => {
    if (!selectedResource || !selectedCustomer || !quote || submitting || holdExpired || priceChangeNotice) return;

    if (quote.expiresAtUtc && Date.parse(quote.expiresAtUtc) < Date.now()) {
      setQuoteExpiredMessage(true);
      void fetchAuthoritativeQuote();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const draft = await bookingRepository.createDraft({
        resourceId: selectedResource.id,
        customerPartyId: selectedCustomer.id,
        requestedStartUtc: startUtc,
        requestedEndUtc: endUtc,
        quantity: 1,
      });

      await bookingRepository.createHold(draft.id, crypto.randomUUID());
      await bookingRepository.confirm(draft.id, crypto.randomUUID(), quote.id);

      const reservation = await bookingRepository.getReservation(draft.id);
      setReservationId(draft.id);
      setReservationNumber(reservation.reservationNumber);

      if (paymentChoice === "now" && canRecordPayment && payNowAmount > 0) {
        try {
          await moneyRepository.recordPayment({
            reservationId: draft.id,
            payerPartyId: selectedCustomer.id,
            schedulableResourceId: selectedResource.id,
            facilityResourceProfileId: selectedResource.profileId ?? null,
            amount: payNowAmount,
            currencyCode: quote.currencyCode || "EGP",
            method: paymentMethod,
            externalReference: paymentReference.trim() || null,
            reason: "Booking creation payment",
            idempotencyKey: crypto.randomUUID(),
          });
          setAmountPaid(payNowAmount);
          setPaymentPartialFailure(false);
        } catch {
          setAmountPaid(0);
          setPaymentPartialFailure(true);
        }
      }

      setStage("confirmed");
      onSuccess();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("409") || errMsg.includes("Conflict") || errMsg.includes("overlap") || errMsg.includes("already booked")) {
        setStage("conflict");
      } else {
        setError(errMsg || "Failed to confirm booking.");
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    bookingRepository,
    canRecordPayment,
    endUtc,
    fetchAuthoritativeQuote,
    holdExpired,
    moneyRepository,
    onSuccess,
    payNowAmount,
    paymentChoice,
    paymentMethod,
    paymentReference,
    priceChangeNotice,
    quote,
    selectedCustomer,
    selectedResource,
    startUtc,
    submitting,
  ]);

  // Secondary Action: Hold Temporarily
  const handleHoldTemporarily = useCallback(async () => {
    if (!selectedResource || !selectedCustomer || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const draft = await bookingRepository.createDraft({
        resourceId: selectedResource.id,
        customerPartyId: selectedCustomer.id,
        requestedStartUtc: startUtc,
        requestedEndUtc: endUtc,
        quantity: 1,
      });
      const hold = await bookingRepository.createHold(draft.id, crypto.randomUUID());
      const reservation = await bookingRepository.getReservation(draft.id);

      setReservationId(draft.id);
      setReservationNumber(reservation.reservationNumber);
      setHoldExpiresAtUtc(hold.expiresAtUtc);
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (errMsg.includes("409") || errMsg.includes("Conflict") || errMsg.includes("overlap")) {
        setStage("conflict");
      } else {
        setError(errMsg || "Failed to hold time slot.");
      }
    } finally {
      setSubmitting(false);
    }
  }, [
    bookingRepository,
    endUtc,
    onSuccess,
    selectedCustomer,
    selectedResource,
    startUtc,
    submitting,
  ]);

  // Post-booking manual payment recording
  const handleManualRecordPayment = async () => {
    if (!reservationId || !selectedCustomer || !quote) return;
    setRecordingPaymentManual(true);
    try {
      const toPay = payNowAmount > 0 ? payNowAmount : quote.grandTotal;
      await moneyRepository.recordPayment({
        reservationId,
        payerPartyId: selectedCustomer.id,
        schedulableResourceId: selectedResource?.id ?? null,
        facilityResourceProfileId: selectedResource?.profileId ?? null,
        amount: toPay,
        currencyCode: quote.currencyCode || "EGP",
        method: paymentMethod,
        externalReference: paymentReference.trim() || null,
        reason: "Manual post-booking payment",
        idempotencyKey: crypto.randomUUID(),
      });
      setAmountPaid((prev) => prev + toPay);
      setPaymentPartialFailure(false);
    } catch {
      setPaymentPartialFailure(true);
    } finally {
      setRecordingPaymentManual(false);
    }
  };

  const formatTimeRange = () => {
    try {
      const s = new Intl.DateTimeFormat(language, {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: timeZoneId || "UTC",
      }).format(new Date(startUtc));
      const e = new Intl.DateTimeFormat(language, {
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
        timeZone: timeZoneId || "UTC",
      }).format(new Date(endUtc));
      return `${s} – ${e}`;
    } catch {
      return "";
    }
  };

  const formatDateDisplay = () => {
    try {
      return new Intl.DateTimeFormat(language, {
        weekday: "short",
        month: "short",
        day: "numeric",
        timeZone: timeZoneId || "UTC",
      }).format(new Date(startUtc));
    } catch {
      return "";
    }
  };

  const remainingBalance = Math.max(0, (quote?.grandTotal ?? 0) - amountPaid);

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
    customerSearch,
    setCustomerSearch,
    customerSearching,
    customerSearchError,
    customerResults,
    selectedCustomer,
    setSelectedCustomer,
    quickAddOpen,
    setQuickAddOpen,
    quickName,
    setQuickName,
    quickPhone,
    setQuickPhone,
    quickEmail,
    setQuickEmail,
    quickAddError,
    duplicateWarning,
    quote,
    quoteLoading,
    quoteError,
    quoteExpiredMessage,
    overrideOpen,
    setOverrideOpen,
    overrideAmount,
    setOverrideAmount,
    overrideReason,
    setOverrideReason,
    holdExpiresAtUtc,
    holdCountdown,
    holdExpired,
    setHoldExpired,
    priceChangeNotice,
    setPriceChangeNotice,
    step0Error,
    step0Checking,
    paymentChoice,
    setPaymentChoice,
    payNowAmount,
    setPayNowAmount,
    paymentMethod,
    setPaymentMethod,
    paymentReference,
    setPaymentReference,
    amountPaid,
    paymentPartialFailure,
    recordingPaymentManual,
    reservationId,
    reservationNumber,
    startUtc,
    endUtc,
    handleStep0Next,
    handleQuickAddCustomer,
    handleConfirm,
    handleHoldTemporarily,
    handleManualRecordPayment,
    fetchAuthoritativeQuote,
    formatTimeRange,
    formatDateDisplay,
    remainingBalance,
    onBlockTime,
    onFindSlots,
  };
}
