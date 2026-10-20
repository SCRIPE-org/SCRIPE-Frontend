"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { getVenueContainer } from "@modules/venue/di";
import type { PriceQuote } from "@modules/venue/commercial/src/domain/entities/CommercialPricing";
import type { CustomerSummary } from "@modules/venue/booking/src/domain/entities/Booking";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";

type IntentKeyRef = {
  current: { fingerprint: string; key: string } | null;
};

function getIntentKey(ref: IntentKeyRef, fingerprint: string): string {
  if (ref.current?.fingerprint !== fingerprint) {
    ref.current = { fingerprint, key: crypto.randomUUID() };
  }
  return ref.current.key;
}

function getQuoteIntent(
  ref: { current: { fingerprint: string; key: string; expiresAtUtc: string } | null },
  fingerprint: string
): { key: string; expiresAtUtc: string } {
  const current = ref.current;
  if (
    !current ||
    current.fingerprint !== fingerprint ||
    !Number.isFinite(Date.parse(current.expiresAtUtc)) ||
    Date.parse(current.expiresAtUtc) <= Date.now()
  ) {
    ref.current = {
      fingerprint,
      key: crypto.randomUUID(),
      expiresAtUtc: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }
  return ref.current!;
}

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
  const canRecordPayment = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_CREATE);
  const canOverridePrice = usePermission(VENUE_PERMISSIONS.CATALOG_PRICING_OVERRIDE_PRICE);

  // Selected court & time context
  const [selectedResource, setSelectedResource] = useState<CalendarResource | null>(
    initialResource
  );
  const [selectedInstantUtc, setSelectedInstantUtc] = useState<string | null>(initialInstantUtc);
  const [slotPolicy, setSlotPolicy] = useState<{
    slotDurationMinutes: number;
    startIncrementMinutes?: number;
    allowMultiSlot?: boolean;
  } | null>(initialResource?.slotPolicy ?? null);

  const allowedDurations = useMemo(() => {
    const base = slotPolicy?.slotDurationMinutes ?? 60;
    const allowMulti = slotPolicy?.allowMultiSlot ?? true;
    if (slotPolicy && slotPolicy.allowMultiSlot === false) {
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
  const quickAddIntentRef = useRef<{ fingerprint: string; key: string } | null>(null);

  // Authoritative Pricing Quote state
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [quoteExpiredMessage, setQuoteExpiredMessage] = useState(false);

  // Price Override state
  const [overrideOpen, setOverrideOpen] = useState(false);
  const [overrideAmount, setOverrideAmount] = useState<string>("");
  const [overrideReason, setOverrideReason] = useState<string>("");
  const [overrideLoading, setOverrideLoading] = useState(false);
  const [overrideError, setOverrideError] = useState<string | null>(null);

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
  const [paymentErrorMessage, setPaymentErrorMessage] = useState<string | null>(null);
  const [recordingPaymentManual, setRecordingPaymentManual] = useState(false);

  // Reservation reference
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [reservationNumber, setReservationNumber] = useState<string>("");
  const quoteIntentRef = useRef<{
    fingerprint: string;
    key: string;
    expiresAtUtc: string;
  } | null>(null);
  const paymentIntentRef = useRef<{ fingerprint: string; key: string } | null>(null);
  const allocationIntentRef = useRef<{ fingerprint: string; key: string } | null>(null);
  const overrideIntentRef = useRef<{ fingerprint: string; key: string } | null>(null);
  const defaultStartUtcRef = useRef(new Date().toISOString());
  const pendingBookingContextRef = useRef<{
    resource: CalendarResource;
    customer: CustomerSummary;
    instantUtc: string;
    durationMinutes: number;
  } | null>(null);

  // Start & End calculations
  const startUtc = selectedInstantUtc || defaultStartUtcRef.current;

  const endUtc = useMemo(() => {
    return new Date(Date.parse(startUtc) + duration * 60 * 1000).toISOString();
  }, [startUtc, duration]);

  const getBookingIntent = useCallback(
    (confirmationFingerprint?: string) => {
      if (!selectedResource || !selectedCustomer) {
        throw new Error("Choose a resource and customer first.");
      }
      return bookingRepository.getOrCreateBusinessIntent(
        JSON.stringify([selectedResource.id, selectedCustomer.id, startUtc, endUtc, 1]),
        confirmationFingerprint
      );
    },
    [bookingRepository, endUtc, selectedCustomer, selectedResource, startUtc]
  );

  const prevOpenRef = useRef(false);

  // Full state reset on open transition
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      const pendingBookingContext = pendingBookingContextRef.current;
      setSelectedResource(
        pendingBookingContext?.resource ?? initialResource ?? (resources[0] || null)
      );
      setSelectedInstantUtc(
        pendingBookingContext?.instantUtc ?? initialInstantUtc ?? new Date().toISOString()
      );
      setDuration(pendingBookingContext?.durationMinutes ?? initialDurationMinutes);
      setStep(pendingBookingContext ? 2 : initialResource && initialInstantUtc ? 1 : 0);
      setStage("booking");
      setSubmitting(false);
      setError(null);
      setCustomerSearch("");
      setCustomerSearching(false);
      setCustomerSearchError(false);
      setCustomerResults([]);
      setSelectedCustomer(pendingBookingContext?.customer ?? null);
      if (!pendingBookingContext && initialCustomerId) {
        customerRepository
          .getById(initialCustomerId)
          .then((c) => {
            setSelectedCustomer(c);
          })
          .catch(() => {});
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
      quoteIntentRef.current = null;
      setQuoteLoading(false);
      setQuoteError(null);
      setQuoteExpiredMessage(false);
      setOverrideOpen(false);
      setOverrideAmount("");
      setOverrideReason("");
      setOverrideLoading(false);
      setOverrideError(null);
      setHoldExpiresAtUtc(null);
      setHoldCountdown(null);
      setHoldExpired(false);
      setPaymentChoice("later");
      setPayNowAmount(0);
      setAmountPaid(0);
      setPaymentPartialFailure(false);
      setPaymentErrorMessage(null);
      setReservationId(null);
      setReservationNumber("");
    }
    prevOpenRef.current = open;
  }, [
    open,
    initialResource,
    initialInstantUtc,
    initialDurationMinutes,
    resources,
    customerRepository,
    initialCustomerId,
  ]);

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
      if (config?.effectiveFromUtc && Date.parse(config.effectiveFromUtc) > Date.now()) {
        setQuote(null);
        setQuoteError(
          tRef.current("operationsCalendar.clickToBook.pricing.activating", {
            defaultValue:
              "Authoritative pricing for this court is still activating. Bookings cannot be accepted until activation completes.",
          })
        );
        return;
      }
      const quoteIntent = getQuoteIntent(
        quoteIntentRef,
        JSON.stringify([
          selectedResource.id,
          selectedCustomer.id,
          config.offeringId,
          config.currencyCode || "EGP",
          startUtc,
          endUtc,
          1,
        ])
      );
      const calcQuote = await commercialPricingRepository.calculateQuote({
        offeringId: config.offeringId,
        resourceId: selectedResource.id,
        partyId: selectedCustomer.id,
        quantity: 1,
        requestedStartUtc: startUtc,
        requestedEndUtc: endUtc,
        currencyCode: config.currencyCode || "EGP",
        expiresAtUtc: quoteIntent.expiresAtUtc,
        idempotencyKey: quoteIntent.key,
      });
      if (
        previousQuoteRef.current &&
        calcQuote.grandTotal !== previousQuoteRef.current.grandTotal
      ) {
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
  }, [commercialPricingRepository, endUtc, selectedCustomer, selectedResource, startUtc]);

  function toLocalIsoDateTime(utcIso: string, timeZone: string): string {
    const d = new Date(utcIso);
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZone || "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      hourCycle: "h23",
    });
    return formatter.format(d).replace(", ", "T").replace(" ", "T");
  }

  const handleStep0Next = useCallback(async () => {
    if (!selectedResource) return;
    setStep0Checking(true);
    setStep0Error(null);
    try {
      const container = getVenueContainer();
      const tz = timeZoneId || "UTC";
      const startLocal = toLocalIsoDateTime(startUtc, tz);
      const endLocal = toLocalIsoDateTime(endUtc, tz);

      if (container.commercialPricingRepository?.getResourceConfiguration) {
        try {
          const pricingConfig =
            await container.commercialPricingRepository.getResourceConfiguration(
              selectedResource.id
            );
          if (
            pricingConfig?.effectiveFromUtc &&
            Date.parse(pricingConfig.effectiveFromUtc) > Date.now()
          ) {
            setStep0Error(
              tRef.current("operationsCalendar.clickToBook.step0.pricingActivating", {
                defaultValue:
                  "Authoritative pricing for this court is still activating. Bookings cannot be accepted until activation completes.",
              })
            );
            return;
          }
        } catch (pricingErr) {
          console.warn("Pricing configuration preflight exception:", pricingErr);
        }
      }

      if (container.availabilityRepository?.search) {
        let res;
        try {
          res = await container.availabilityRepository.search({
            resourceId: selectedResource.id,
            timeZoneId: tz,
            startLocal,
            endLocal,
            quantity: 1,
          });
        } catch (searchErr) {
          const errMsg = searchErr instanceof Error ? searchErr.message : "";
          if (
            errMsg.toLowerCase().includes("notsearchable") ||
            errMsg.toLowerCase().includes("not published") ||
            errMsg.toLowerCase().includes("draft")
          ) {
            setStep0Error(
              tRef.current("operationsCalendar.clickToBook.step0.courtDraftError") ||
                "This court is in Draft status or incomplete setup. Please complete its setup and publish it in Courts & Spaces before booking."
            );
            return;
          }
          console.warn("Availability search preflight exception:", searchErr);
        }

        if (res && res.isAvailable === false) {
          let localizedUnavailable =
            tRef.current("operationsCalendar.clickToBook.step0.slotUnavailable") ||
            "This time slot is not available. Please select another time.";
          if (res.reasonCode === "availability.baseClosed") {
            localizedUnavailable =
              tRef.current("operationsCalendar.clickToBook.step0.courtClosed") ||
              "Court is closed during this time based on its operating hours.";
          } else if (res.reasonCode === "availability.maintenance") {
            localizedUnavailable =
              tRef.current("operationsCalendar.clickToBook.step0.courtMaintenance") ||
              "Court is scheduled for maintenance during this time.";
          } else if (res.reasonCode === "availability.capacityInsufficient") {
            localizedUnavailable =
              tRef.current("operationsCalendar.clickToBook.step0.courtBooked") ||
              "This time slot is already reserved by another booking.";
          }
          setStep0Error(localizedUnavailable);
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
      const fingerprint = JSON.stringify([trimmedName, "Person", quickPhone.trim() || null]);
      const idempotencyKey = getIntentKey(quickAddIntentRef, fingerprint);
      const created = await customerRepository.create(
        trimmedName,
        "Person",
        quickPhone.trim() || undefined,
        { idempotencyKey }
      );
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

  // Price Override Action
  const handleApplyPriceOverride = useCallback(async () => {
    if (!quote || !canOverridePrice || overrideLoading) return;
    const amount = Number(overrideAmount);
    if (!Number.isFinite(amount) || amount === 0) return;
    if (!overrideReason.trim()) return;

    setOverrideLoading(true);
    setOverrideError(null);
    try {
      const applied = await commercialPricingRepository.overrideQuote(quote.id, {
        adjustmentAmount: amount,
        reason: overrideReason.trim(),
        idempotencyKey: getIntentKey(
          overrideIntentRef,
          JSON.stringify([quote.id, amount, overrideReason.trim()])
        ),
      });
      setQuote((current) =>
        current && current.id === quote.id
          ? { ...current, grandTotal: applied.overriddenGrandTotal }
          : current
      );
      setOverrideOpen(false);
    } catch (err) {
      setOverrideError(err instanceof Error ? err.message : "Failed to apply price override.");
    } finally {
      setOverrideLoading(false);
    }
  }, [
    commercialPricingRepository,
    canOverridePrice,
    overrideAmount,
    overrideLoading,
    overrideReason,
    quote,
  ]);

  // Primary Action: Confirm Booking
  const handleConfirm = useCallback(async () => {
    if (
      !canCreateBooking ||
      !selectedResource ||
      !selectedCustomer ||
      !quote ||
      submitting ||
      holdExpired ||
      priceChangeNotice
    )
      return;

    if (quote.expiresAtUtc && Date.parse(quote.expiresAtUtc) < Date.now()) {
      setQuoteExpiredMessage(true);
      void fetchAuthoritativeQuote();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const intent = await getBookingIntent(quote.id);
      // An ambiguous network failure can leave the server-side draft committed. Preserve the
      // exact business context across closing/reopening so the UI can replay the same intent.
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
        hold.expiresAtUtc
      );
      if (
        !Number.isFinite(Date.parse(hold.expiresAtUtc)) ||
        Date.parse(hold.expiresAtUtc) <= Date.now()
      ) {
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
        try {
          let profileId: string | null = selectedResource.profileId ?? null;
          if (!profileId && resources?.length) {
            profileId = resources.find((r) => r.id === selectedResource.id)?.profileId ?? null;
          }
          if (!profileId && schedulableResourceRepository?.getById) {
            try {
              const fullResource = await schedulableResourceRepository.getById(selectedResource.id);
              profileId = fullResource?.facilityResourceProfileId ?? null;
            } catch {
              // fallback
            }
          }

          if (!profileId) {
            throw new Error("Unable to resolve facility resource profile for court.");
          }

          const payment = await moneyRepository.recordPayment({
            reservationId: draft.id,
            payerPartyId: selectedCustomer.id,
            schedulableResourceId: selectedResource.id,
            facilityResourceProfileId: profileId,
            amount: payNowAmount,
            currencyCode: quote.currencyCode || "EGP",
            method: paymentMethod,
            externalReference: paymentReference.trim() || null,
            reason: "Booking creation payment",
            idempotencyKey: getIntentKey(
              paymentIntentRef,
              JSON.stringify([
                draft.id,
                selectedCustomer.id,
                selectedResource.id,
                profileId,
                payNowAmount,
                quote.currencyCode || "EGP",
                paymentMethod,
                paymentReference.trim() || null,
                "Booking creation payment",
              ])
            ),
          });
          setAmountPaid(payNowAmount);
          setPaymentPartialFailure(false);
          setPaymentErrorMessage(null);

          try {
            const invoicePage = await moneyRepository.getInvoices(1, 10, {
              reservationId: draft.id,
            });
            const invoice =
              invoicePage?.items?.find((inv) => inv.reservationId === draft.id) ??
              invoicePage?.items?.[0];
            if (invoice) {
              await moneyRepository.allocatePayment(
                payment.id,
                invoice.id,
                payNowAmount,
                getIntentKey(
                  allocationIntentRef,
                  JSON.stringify([payment.id, invoice.id, payNowAmount])
                )
              );
            }
          } catch {
            // Outbox materialization may still be processing; payment record preserved
          }
        } catch (payErr: any) {
          const msg =
            payErr?.response?.data?.title ||
            payErr?.response?.data?.message ||
            payErr?.message ||
            "Payment recording failed";
          setPaymentErrorMessage(msg);
          setAmountPaid(0);
          setPaymentPartialFailure(true);
        }
      }

      setStage("confirmed");
      onSuccess();
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      if (
        errMsg.includes("409") ||
        errMsg.includes("Conflict") ||
        errMsg.includes("overlap") ||
        errMsg.includes("already booked")
      ) {
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
    canCreateBooking,
    endUtc,
    duration,
    fetchAuthoritativeQuote,
    getBookingIntent,
    holdExpired,
    moneyRepository,
    onSuccess,
    payNowAmount,
    paymentChoice,
    paymentMethod,
    paymentReference,
    priceChangeNotice,
    quote,
    schedulableResourceRepository,
    selectedCustomer,
    selectedResource,
    startUtc,
    submitting,
  ]);

  // Secondary Action: Hold Temporarily
  const handleHoldTemporarily = useCallback(async () => {
    if (!canCreateHold || !selectedResource || !selectedCustomer || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const intent = await getBookingIntent();
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
        hold.expiresAtUtc
      );
      if (
        !Number.isFinite(Date.parse(hold.expiresAtUtc)) ||
        Date.parse(hold.expiresAtUtc) <= Date.now()
      ) {
        setHoldExpired(true);
        setError(tRef.current("operationsCalendar.clickToBook.hold.expired"));
        return;
      }
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
    canCreateHold,
    endUtc,
    duration,
    getBookingIntent,
    selectedCustomer,
    selectedResource,
    startUtc,
    submitting,
  ]);

  // Post-booking manual payment recording
  const handleManualRecordPayment = async () => {
    if (!canRecordPayment || !reservationId || !selectedCustomer || !quote) return;
    setRecordingPaymentManual(true);
    setPaymentErrorMessage(null);
    try {
      const toPay =
        payNowAmount > 0
          ? payNowAmount
          : remainingBalance > 0
            ? remainingBalance
            : quote.grandTotal;
      let profileId = selectedResource?.profileId ?? null;
      if (!profileId && selectedResource && resources?.length) {
        profileId = resources.find((r) => r.id === selectedResource.id)?.profileId ?? null;
      }
      if (!profileId && selectedResource && schedulableResourceRepository?.getById) {
        try {
          const fullResource = await schedulableResourceRepository.getById(selectedResource.id);
          profileId = fullResource?.facilityResourceProfileId ?? null;
        } catch {
          // fallback
        }
      }

      if (!profileId || !selectedResource) {
        throw new Error("Unable to resolve facility resource profile for court.");
      }

      const payment = await moneyRepository.recordPayment({
        reservationId,
        payerPartyId: selectedCustomer.id,
        schedulableResourceId: selectedResource.id,
        facilityResourceProfileId: profileId,
        amount: toPay,
        currencyCode: quote.currencyCode || "EGP",
        method: paymentMethod,
        externalReference: paymentReference.trim() || null,
        reason: "Manual post-booking payment",
        idempotencyKey: getIntentKey(
          paymentIntentRef,
          JSON.stringify([
            reservationId,
            selectedCustomer.id,
            selectedResource.id,
            profileId,
            toPay,
            quote.currencyCode || "EGP",
            paymentMethod,
            paymentReference.trim() || null,
            "Manual post-booking payment",
          ])
        ),
      });
      setAmountPaid((prev) => prev + toPay);
      setPaymentPartialFailure(false);
      setPaymentErrorMessage(null);

      try {
        const invoicePage = await moneyRepository.getInvoices(1, 10, { reservationId });
        const invoice =
          invoicePage?.items?.find((inv) => inv.reservationId === reservationId) ??
          invoicePage?.items?.[0];
        if (invoice) {
          await moneyRepository.allocatePayment(
            payment.id,
            invoice.id,
            toPay,
            getIntentKey(allocationIntentRef, JSON.stringify([payment.id, invoice.id, toPay]))
          );
        }
      } catch {
        // Outbox materialization may still be processing
      }
    } catch (payErr: any) {
      const msg =
        payErr?.response?.data?.title ||
        payErr?.response?.data?.message ||
        payErr?.message ||
        "Payment recording failed";
      setPaymentErrorMessage(msg);
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
    overrideLoading,
    overrideError,
    handleApplyPriceOverride,
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
    paymentErrorMessage,
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
