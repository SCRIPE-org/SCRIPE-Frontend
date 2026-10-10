"use client";

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  ExternalLink,
  Plus,
  Search,
  Timer,
  User,
  UserPlus,
  AlertCircle,
  ArrowRight,
  RotateCcw,
  ShieldAlert,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { getVenueContainer } from "@modules/venue/di";
import type { PriceQuote } from "@modules/venue/commercial/src/domain/entities/CommercialPricing";
import type { CustomerSummary } from "@modules/venue/booking/src/domain/entities/Booking";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";

interface Props {
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

export function ClickToBookModal({
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
}: Props) {
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
    const base = initialResource?.slotPolicy?.slotDurationMinutes ?? initialDurationMinutes;
    return base;
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

  // Determine entry mode:
  // Mode A (Contextual Calendar Booking): opened from an actual slot click
  // Mode B (Global New Booking): opened from "+ New Booking" without initial resource/slot
  const isContextual = Boolean(initialResource && initialInstantUtc);

  // Stepper state:
  // For Contextual: Step 1 is Customer, Step 2 is Confirm
  // For Global: Step 0 is Court & Time, Step 1 is Customer, Step 2 is Confirm
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
  }, [open, initialResource, initialInstantUtc, initialDurationMinutes, resources]);

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

  useEffect(() => {
    if (open && selectedResource && selectedCustomer && step === 2) {
      void fetchAuthoritativeQuote();
    }
  }, [fetchAuthoritativeQuote, open, selectedCustomer, selectedResource, step]);

  // Hold Countdown timer
  useEffect(() => {
    if (!holdExpiresAtUtc) {
      setHoldCountdown(null);
      return;
    }
    const updateCountdown = () => {
      const diffMs = Date.parse(holdExpiresAtUtc) - Date.now();
      if (diffMs <= 0) {
        setHoldCountdown("00:00");
        setHoldExpired(true);
        return;
      }
      const totalSec = Math.floor(diffMs / 1000);
      const mins = String(Math.floor(totalSec / 60)).padStart(2, "0");
      const secs = String(totalSec % 60).padStart(2, "0");
      setHoldCountdown(`${mins}:${secs}`);
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [holdExpiresAtUtc]);

  // Quick Add Customer Handler with duplicate checks
  const handleQuickAddCustomer = async () => {
    const trimmedName = quickName.trim();
    if (!trimmedName) {
      setQuickAddError("Customer name is required.");
      return;
    }

    // Check existing search results for potential duplicates
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
      setStep(2); // Advance directly to Price & Confirm
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
    if (!selectedResource || !selectedCustomer || !quote || submitting || holdExpired) return;

    // Check quote expiration
    if (quote.expiresAtUtc && Date.parse(quote.expiresAtUtc) < Date.now()) {
      setQuoteExpiredMessage(true);
      void fetchAuthoritativeQuote();
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      // 1. Create Draft
      const draft = await bookingRepository.createDraft({
        resourceId: selectedResource.id,
        customerPartyId: selectedCustomer.id,
        requestedStartUtc: startUtc,
        requestedEndUtc: endUtc,
        quantity: 1,
      });

      // 2. Create Hold
      await bookingRepository.createHold(draft.id, crypto.randomUUID());

      // 3. Confirm with Authoritative Price Quote
      await bookingRepository.confirm(draft.id, crypto.randomUUID(), quote.id);

      const reservation = await bookingRepository.getReservation(draft.id);
      setReservationId(draft.id);
      setReservationNumber(reservation.reservationNumber);

      // 4. If operator requested "Record Payment Now" and has permission
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
          // Booking succeeded! Payment recording failed!
          // NEVER imply the booking failed.
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
      onSuccess();
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

  // Post-booking manual payment recording (for partial failure or subsequent collection)
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
      // Payment recording failed again
      setPaymentPartialFailure(true);
    } finally {
      setRecordingPaymentManual(false);
    }
  };

  // Formatted date and time string
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-nx-surface border border-nx-border rounded-2xl shadow-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("operationsCalendar.clickToBook.title")}</DialogTitle>
          <DialogDescription>
            {selectedResource?.name ? `${selectedResource.name} booking` : "Create venue booking"}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper Header (Only during normal booking flow) */}
        {stage === "booking" && (
          <div className="flex items-center justify-between pb-3 border-b border-nx-border">
            {!isContextual && (
              <>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      step >= 0 ? "bg-nx-primary text-white" : "bg-nx-raised text-nx-ink-3"
                    }`}
                  >
                    1
                  </span>
                  <span className="text-xs font-semibold text-nx-ink">
                    {t("operationsCalendar.clickToBook.stepper.courtAndTime")}
                  </span>
                </div>
                <div className="h-px w-4 bg-nx-border" />
              </>
            )}

            <div className="flex items-center gap-1.5">
              <span
                className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  step >= 1 ? "bg-nx-primary text-white" : "bg-nx-raised text-nx-ink-3"
                }`}
              >
                {isContextual ? 1 : 2}
              </span>
              <span className="text-xs font-semibold text-nx-ink">
                {t("operationsCalendar.clickToBook.stepper.customer")}
              </span>
            </div>
            <div className="h-px w-4 bg-nx-border" />
            <div className="flex items-center gap-1.5">
              <span
                className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  step >= 2 ? "bg-nx-primary text-white" : "bg-nx-raised text-nx-ink-3"
                }`}
              >
                {isContextual ? 2 : 3}
              </span>
              <span className="text-xs font-semibold text-nx-ink">
                {t("operationsCalendar.clickToBook.stepper.confirm")}
              </span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {error && (
          <Alert variant="destructive" className="my-2 py-2">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* ======================================================== */}
        {/* STAGE: CONFLICT RECOVERY (409 / Slot Taken During Flow)   */}
        {/* ======================================================== */}
        {stage === "conflict" && (
          <div className="space-y-4 py-4 text-center">
            <div className="size-14 rounded-full bg-amber-500/10 border-2 border-amber-500 flex items-center justify-center text-amber-500 mx-auto">
              <AlertCircle className="size-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-nx-ink">
                {t("operationsCalendar.clickToBook.conflict.title")}
              </h3>
              <p className="text-xs text-nx-ink-2 mt-1">
                {t("operationsCalendar.clickToBook.conflict.description")}
              </p>
            </div>
            <div className="space-y-2 pt-2">
              {onFindSlots && (
                <Button
                  type="button"
                  className="w-full h-9 text-xs font-bold bg-nx-primary hover:bg-nx-primary-hover text-white rounded-lg"
                  onClick={() => {
                    onOpenChange(false);
                    onFindSlots();
                  }}
                >
                  <Search className="h-3.5 w-3.5 me-2" />
                  {t("operationsCalendar.clickToBook.conflict.findAnother")}
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                className="w-full h-9 text-xs font-semibold rounded-lg"
                onClick={() => {
                  onOpenChange(false);
                  onSuccess();
                }}
              >
                {t("operationsCalendar.clickToBook.conflict.returnToCalendar")}
              </Button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE: CONFIRMED / SUCCESS STATE                         */}
        {/* ======================================================== */}
        {stage === "confirmed" && (
          <div className="space-y-4 py-3 text-center">
            <div className="size-14 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center text-emerald-500 mx-auto">
              <CheckCircle2 className="size-8" />
            </div>

            <div>
              <h3 className="text-lg font-black text-nx-ink">
                {t("operationsCalendar.clickToBook.success.title")}
              </h3>
              <p className="text-xs text-nx-ink-2 mt-0.5">
                {selectedResource?.name} • {formatDateDisplay()} • {formatTimeRange()}
              </p>
              <p className="text-xs font-bold text-nx-ink mt-0.5">
                {selectedCustomer?.displayName}
              </p>
            </div>

            {/* Critical Partial Failure Alert */}
            {paymentPartialFailure && (
              <Alert variant="warning" className="text-left text-xs my-2">
                <AlertCircle className="size-4" />
                <AlertTitle className="text-xs font-bold">
                  {t("operationsCalendar.clickToBook.partialFailure.title")}
                </AlertTitle>
                <AlertDescription className="text-[11px]">
                  {t("operationsCalendar.clickToBook.partialFailure.description")}
                </AlertDescription>
              </Alert>
            )}

            {/* Receipt Summary Card */}
            <div className="p-3 rounded-xl border border-nx-border bg-nx-raised/40 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-nx-ink-2">{t("operationsCalendar.clickToBook.success.total")}</span>
                <span className="font-bold text-nx-ink">
                  {quote?.grandTotal ?? 0} {quote?.currencyCode || "EGP"}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-nx-ink-2">{t("operationsCalendar.clickToBook.success.paid")}</span>
                <span className="font-bold text-emerald-600">
                  {amountPaid} {quote?.currencyCode || "EGP"}
                </span>
              </div>
              <div className="border-t border-nx-border pt-1.5 flex items-center justify-between text-xs">
                <span className="text-nx-ink-2">{t("operationsCalendar.clickToBook.success.remaining")}</span>
                <span className="font-bold text-amber-600">
                  {remainingBalance} {quote?.currencyCode || "EGP"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-2 pt-2">
              {canRecordPayment && remainingBalance > 0 && (
                <Button
                  type="button"
                  className="w-full h-9 text-xs font-bold bg-nx-primary hover:bg-nx-primary-hover text-white rounded-lg"
                  disabled={recordingPaymentManual}
                  onClick={handleManualRecordPayment}
                >
                  <CreditCard className="size-3.5 me-2" />
                  {amountPaid === 0
                    ? t("operationsCalendar.clickToBook.success.recordPayment")
                    : t("operationsCalendar.clickToBook.success.recordAnotherPayment")}
                </Button>
              )}

              {reservationId && (
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-9 text-xs font-semibold rounded-lg"
                >
                  <Link href={`/venue/bookings/${encodeURIComponent(reservationId)}`}>
                    <ExternalLink className="size-3.5 me-2" />
                    {t("operationsCalendar.clickToBook.success.openBooking")}
                  </Link>
                </Button>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
                className="text-xs text-nx-ink-3 hover:text-nx-ink"
              >
                {t("operationsCalendar.clickToBook.success.close")}
              </Button>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* STAGE: ACTIVE BOOKING FLOW                               */}
        {/* ======================================================== */}
        {stage === "booking" && (
          <div className="space-y-4 py-2">
            {/* Context Summary Card (Shown in Steps 1 & 2) */}
            {step >= 1 && selectedResource && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-nx-border bg-nx-raised/40">
                <div className="size-11 rounded-lg bg-nx-primary/10 border border-nx-primary/20 shrink-0 flex items-center justify-center text-nx-primary text-base">
                  🎾
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-nx-ink truncate">
                      {selectedResource.name}
                    </h4>
                    {!isContextual && (
                      <button
                        type="button"
                        onClick={() => setStep(0)}
                        className="text-[11px] font-semibold text-nx-primary hover:underline"
                      >
                        {t("operationsCalendar.clickToBook.context.change")}
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-nx-ink-2 truncate">
                    {selectedResource.facilityName}
                  </p>
                  <p className="text-[11px] font-medium text-nx-ink mt-0.5">
                    {formatDateDisplay()} • {formatTimeRange()} ({duration} min)
                  </p>
                </div>
              </div>
            )}

            {/* STEP 0: Court & Time (Only in Global Mode B) */}
            {step === 0 && (
              <div className="space-y-3 py-1">
                <div className="space-y-1.5">
                  <Label className="text-xs font-bold text-nx-ink">
                    {t("operationsCalendar.clickToBook.context.court")}
                  </Label>
                  <select
                    className="w-full h-9 rounded-md border border-nx-border bg-nx-surface px-3 text-xs focus:ring-1 focus:ring-nx-primary"
                    value={selectedResource?.id || ""}
                    onChange={(e) => {
                      const res = resources.find((r) => r.id === e.target.value);
                      if (res) setSelectedResource(res);
                    }}
                  >
                    {resources.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.facilityName})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-nx-ink">
                      {isRtl ? "وقت البدء" : "Start Time"}
                    </Label>
                    <Input
                      type="time"
                      value={new Date(startUtc).toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                        timeZone: timeZoneId || "UTC",
                      })}
                      onChange={(e) => {
                        const [h, m] = e.target.value.split(":").map(Number);
                        const d = new Date(startUtc);
                        d.setHours(h, m, 0, 0);
                        setSelectedInstantUtc(d.toISOString());
                      }}
                      className="h-8 text-xs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-nx-ink">
                      {isRtl ? "المدة" : "Duration"}
                    </Label>
                    {allowedDurations.length <= 1 ? (
                      <div className="w-full h-8 rounded-md border border-nx-border bg-nx-raised/40 px-3 flex items-center text-xs font-semibold text-nx-ink">
                        {allowedDurations[0] ?? 60} min
                      </div>
                    ) : (
                      <select
                        className="w-full h-8 rounded-md border border-nx-border bg-nx-surface px-3 text-xs"
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                      >
                        {allowedDurations.map((d) => (
                          <option key={d} value={d}>
                            {d} min {d >= 60 && d % 60 === 0 ? `(${d / 60} hr)` : ""}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 1: Customer Selection */}
            {step === 1 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold text-nx-ink">
                    {t("operationsCalendar.clickToBook.customer.title")}
                  </Label>
                  <button
                    type="button"
                    onClick={() => {
                      setQuickAddOpen(!quickAddOpen);
                      setQuickAddError(null);
                      setDuplicateWarning(null);
                    }}
                    className="text-xs text-nx-primary hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    <UserPlus className="size-3" />
                    <span>
                      {quickAddOpen
                        ? t("operationsCalendar.clickToBook.customer.searchExisting")
                        : t("operationsCalendar.clickToBook.customer.addNew")}
                    </span>
                  </button>
                </div>

                {/* Quick Add Form */}
                {quickAddOpen ? (
                  <div className="p-3 rounded-xl border border-nx-border bg-nx-raised/40 space-y-2.5">
                    <h5 className="text-xs font-bold text-nx-ink">
                      {t("operationsCalendar.clickToBook.customer.quickAddTitle")}
                    </h5>

                    {quickAddError && (
                      <Alert variant="destructive" className="py-1.5 text-xs">
                        <AlertDescription>{quickAddError}</AlertDescription>
                      </Alert>
                    )}

                    {duplicateWarning && (
                      <Alert variant="warning" className="py-1.5 text-xs">
                        <AlertDescription>{duplicateWarning}</AlertDescription>
                      </Alert>
                    )}

                    <Input
                      placeholder={t("operationsCalendar.clickToBook.customer.namePlaceholder")}
                      value={quickName}
                      onChange={(e) => {
                        setQuickName(e.target.value);
                        setDuplicateWarning(null);
                      }}
                      className="h-8 text-xs bg-nx-surface"
                    />
                    <Input
                      placeholder={t("operationsCalendar.clickToBook.customer.phonePlaceholder")}
                      value={quickPhone}
                      onChange={(e) => setQuickPhone(e.target.value)}
                      className="h-8 text-xs bg-nx-surface"
                    />
                    <Input
                      placeholder={t("operationsCalendar.clickToBook.customer.emailPlaceholder")}
                      value={quickEmail}
                      onChange={(e) => setQuickEmail(e.target.value)}
                      className="h-8 text-xs bg-nx-surface"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleQuickAddCustomer}
                      disabled={!quickName.trim() || submitting}
                      className="h-7 text-xs w-full font-bold bg-nx-primary hover:bg-nx-primary-hover text-white"
                    >
                      {submitting
                        ? t("operationsCalendar.clickToBook.customer.creating")
                        : t("operationsCalendar.clickToBook.customer.createAndSelect")}
                    </Button>
                  </div>
                ) : selectedCustomer ? (
                  /* Selected Customer Card */
                  <div className="flex items-center justify-between p-3 rounded-xl border border-nx-primary/40 bg-nx-primary/5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex size-8 items-center justify-center rounded-full bg-nx-primary text-white font-bold text-xs">
                        {selectedCustomer.displayName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-nx-ink">
                          {selectedCustomer.displayName}
                        </p>
                        <p className="text-[10px] text-nx-ink-2">
                          {selectedCustomer.type || "Customer"}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedCustomer(null)}
                      className="h-7 text-xs text-nx-ink-2 hover:text-nx-ink"
                    >
                      {t("operationsCalendar.clickToBook.customer.change")}
                    </Button>
                  </div>
                ) : (
                  /* Search Customer Input & Results */
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 size-3.5 text-nx-ink-3 rtl:right-2.5 rtl:left-auto" />
                      <Input
                        placeholder={t("operationsCalendar.clickToBook.customer.searchPlaceholder")}
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        className="ps-8 h-8 text-xs rounded-lg"
                      />
                    </div>

                    {customerSearching && (
                      <div className="p-2 text-center text-xs text-nx-ink-3 flex items-center justify-center gap-2">
                        <LoadingSpinner size="sm" />
                        <span>Searching...</span>
                      </div>
                    )}

                    {customerSearchError && (
                      <Alert variant="destructive" className="py-1 text-xs">
                        <AlertDescription>
                          {t("operationsCalendar.clickToBook.customer.searchError")}
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Results List */}
                    <div className="space-y-1 max-h-40 overflow-y-auto">
                      {customerResults.map((cust) => (
                        <button
                          type="button"
                          key={cust.id}
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setCustomerSearch("");
                            setCustomerResults([]);
                            setStep(2); // Automatically advance to confirmation
                          }}
                          className="w-full p-2 rounded-lg border border-nx-border hover:border-nx-primary hover:bg-nx-primary/5 text-start flex items-center justify-between text-xs transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <div className="flex size-6 items-center justify-center rounded-full bg-nx-raised text-nx-ink font-bold text-xs">
                              {cust.displayName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-semibold text-nx-ink block">
                                {cust.displayName}
                              </span>
                              <span className="text-[10px] text-nx-ink-3 block">
                                {cust.type}
                              </span>
                            </div>
                          </div>
                        </button>
                      ))}

                      {!customerSearching &&
                        customerSearch.trim().length >= 2 &&
                        customerResults.length === 0 &&
                        !customerSearchError && (
                          <p className="text-center text-xs text-nx-ink-3 py-2">
                            {t("operationsCalendar.clickToBook.customer.noResults")}
                          </p>
                        )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STEP 2: Price Quote, Hold, Payment & Confirmation */}
            {step === 2 && (
              <div className="space-y-3">
                {/* Selected Customer Summary */}
                {selectedCustomer && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl border border-nx-border bg-nx-raised/30 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="flex size-7 items-center justify-center rounded-full bg-nx-primary text-white font-bold text-xs shrink-0">
                        {selectedCustomer.displayName.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-nx-ink truncate">
                          {selectedCustomer.displayName}
                        </p>
                        {selectedCustomer.type && (
                          <p className="text-[10px] text-nx-ink-3 truncate">
                            {selectedCustomer.type}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-[11px] font-semibold text-nx-primary hover:underline shrink-0"
                    >
                      {t("operationsCalendar.clickToBook.customer.change")}
                    </button>
                  </div>
                )}

                {/* Hold Countdown Badge if active */}
                {holdCountdown && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-600 dark:text-blue-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Timer className="size-3.5" />
                      {t("operationsCalendar.clickToBook.hold.temporaryBadge")}
                    </span>
                    <span className="font-mono font-bold">
                      {t("operationsCalendar.clickToBook.hold.countdown", { time: holdCountdown })}
                    </span>
                  </div>
                )}

                {/* Quote Expired Banner */}
                {quoteExpiredMessage && (
                  <Alert variant="warning" className="py-1 text-xs">
                    <AlertDescription>
                      {t("operationsCalendar.clickToBook.pricing.expired")}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Authoritative Pricing Box */}
                <div className="p-3.5 rounded-xl border border-nx-border bg-nx-raised/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-xs font-bold text-nx-ink">
                      {t("operationsCalendar.clickToBook.pricing.title")}
                    </h5>
                    {quoteLoading && <LoadingSpinner size="sm" />}
                  </div>

                  {quoteError ? (
                    <div className="space-y-1.5">
                      <p className="text-xs text-destructive">{quoteError}</p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="h-6 text-[11px]"
                        onClick={fetchAuthoritativeQuote}
                      >
                        <RotateCcw className="size-3 me-1" />
                        {t("operationsCalendar.clickToBook.pricing.retry")}
                      </Button>
                    </div>
                  ) : quoteLoading ? (
                    <div className="py-3 text-center text-xs text-nx-ink-3">
                      {t("operationsCalendar.clickToBook.pricing.calculating")}
                    </div>
                  ) : quote ? (
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center justify-between text-nx-ink-2">
                        <span>{t("operationsCalendar.clickToBook.pricing.courtPrice")}</span>
                        <span>
                          {quote.subtotalAmount} {quote.currencyCode}
                        </span>
                      </div>

                      {quote.discountAmount > 0 && (
                        <div className="flex items-center justify-between text-emerald-600">
                          <span>Discount</span>
                          <span>
                            -{quote.discountAmount} {quote.currencyCode}
                          </span>
                        </div>
                      )}

                      {quote.taxAmount > 0 && (
                        <div className="flex items-center justify-between text-nx-ink-2">
                          <span>Tax</span>
                          <span>
                            +{quote.taxAmount} {quote.currencyCode}
                          </span>
                        </div>
                      )}

                      <div className="border-t border-nx-border pt-1.5 flex items-center justify-between text-sm font-bold text-nx-ink">
                        <span>{t("operationsCalendar.clickToBook.pricing.total")}</span>
                        <span>
                          {quote.grandTotal} {quote.currencyCode}
                        </span>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Price Override (Restricted to authorized managers) */}
                {canOverridePrice && quote && (
                  <div className="pt-1">
                    {!overrideOpen ? (
                      <button
                        type="button"
                        onClick={() => setOverrideOpen(true)}
                        className="text-[11px] text-nx-primary hover:underline font-semibold"
                      >
                        {t("operationsCalendar.clickToBook.pricing.override")}
                      </button>
                    ) : (
                      <div className="p-2.5 rounded-lg border border-nx-border bg-nx-surface space-y-2 text-xs">
                        <Label className="text-xs font-bold text-nx-ink">
                          {t("operationsCalendar.clickToBook.pricing.override")}
                        </Label>
                        <Input
                          type="number"
                          placeholder="Override Amount"
                          value={overrideAmount}
                          onChange={(e) => setOverrideAmount(e.target.value)}
                          className="h-7 text-xs"
                        />
                        <Input
                          placeholder={t("operationsCalendar.clickToBook.pricing.overrideReason")}
                          value={overrideReason}
                          onChange={(e) => setOverrideReason(e.target.value)}
                          className="h-7 text-xs"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Payment Option (Default is payment NOT required) */}
                <div className="space-y-2 pt-1">
                  <Label className="text-xs font-bold text-nx-ink">
                    {t("operationsCalendar.clickToBook.payment.title")}
                  </Label>

                  <div className="space-y-1.5">
                    <label className="flex items-center gap-2 p-2 rounded-lg border border-nx-border hover:bg-nx-raised cursor-pointer">
                      <input
                        type="radio"
                        name="paymentOption"
                        checked={paymentChoice === "later"}
                        onChange={() => setPaymentChoice("later")}
                        className="text-nx-primary"
                      />
                      <span className="text-xs font-semibold text-nx-ink">
                        {t("operationsCalendar.clickToBook.payment.payLater")}
                      </span>
                    </label>

                    {canRecordPayment && (
                      <label className="flex items-start gap-2 p-2 rounded-lg border border-nx-border hover:bg-nx-raised cursor-pointer">
                        <input
                          type="radio"
                          name="paymentOption"
                          checked={paymentChoice === "now"}
                          onChange={() => setPaymentChoice("now")}
                          className="mt-0.5 text-nx-primary"
                        />
                        <div className="flex-1">
                          <span className="text-xs font-semibold text-nx-ink block">
                            {t("operationsCalendar.clickToBook.payment.recordNow")}
                          </span>

                          {paymentChoice === "now" && (
                            <div className="space-y-2 mt-2 pt-1 border-t border-nx-border/50">
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={payNowAmount}
                                  onChange={(e) => setPayNowAmount(Number(e.target.value) || 0)}
                                  className="h-7 w-28 text-xs font-bold"
                                />
                                <span className="text-[11px] text-nx-ink-2">
                                  {t("operationsCalendar.clickToBook.payment.remaining", {
                                    amount: Math.max(0, (quote?.grandTotal ?? 0) - payNowAmount),
                                    currency: quote?.currencyCode || "EGP",
                                  })}
                                </span>
                              </div>

                              <div className="grid grid-cols-2 gap-2">
                                <select
                                  value={paymentMethod}
                                  onChange={(e) =>
                                    setPaymentMethod(
                                      e.target.value as
                                        | "Cash"
                                        | "Card"
                                        | "POS"
                                        | "BankTransfer"
                                        | "Other"
                                    )
                                  }
                                  className="h-7 rounded border border-nx-border bg-nx-surface text-xs px-2"
                                >
                                  <option value="Cash">Cash</option>
                                  <option value="Card">Card</option>
                                  <option value="BankTransfer">Bank Transfer</option>
                                </select>
                                <Input
                                  placeholder={t(
                                    "operationsCalendar.clickToBook.payment.referencePlaceholder"
                                  )}
                                  value={paymentReference}
                                  onChange={(e) => setPaymentReference(e.target.value)}
                                  className="h-7 text-xs"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* FOOTER CONTROLS                                          */}
        {/* ======================================================== */}
        {stage === "booking" && (
          <DialogFooter className="pt-3 border-t border-nx-border flex items-center justify-between">
            {step === 2 && canCreateHold && !holdExpiresAtUtc ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleHoldTemporarily}
                disabled={submitting || !selectedCustomer}
                className="text-xs text-nx-ink-2"
              >
                <Timer className="size-3.5 me-1" />
                {t("operationsCalendar.clickToBook.hold.holdAction")}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (step > (isContextual ? 1 : 0)) {
                    setStep((prev) => prev - 1);
                  } else {
                    onOpenChange(false);
                  }
                }}
                className="text-xs font-semibold"
              >
                {step > (isContextual ? 1 : 0)
                  ? t("operationsCalendar.clickToBook.confirm.back")
                  : t("operationsCalendar.clickToBook.confirm.cancel")}
              </Button>

              {step < 2 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => setStep((prev) => prev + 1)}
                  disabled={step === 1 && !selectedCustomer}
                  className="text-xs font-bold bg-nx-primary hover:bg-nx-primary-hover text-white"
                >
                  {t("operationsCalendar.clickToBook.confirm.next")}
                  <ArrowRight className="size-3.5 ms-1 rtl:rotate-180" />
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={handleConfirm}
                  disabled={submitting || quoteLoading || !quote || holdExpired || !canCreateBooking}
                  className="text-xs font-bold bg-nx-primary hover:bg-nx-primary-hover text-white shadow-xs"
                >
                  {submitting ? (
                    <>
                      <LoadingSpinner size="sm" className="me-2" />
                      {t("operationsCalendar.clickToBook.confirm.confirming")}
                    </>
                  ) : (
                    t("operationsCalendar.clickToBook.confirm.action")
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
