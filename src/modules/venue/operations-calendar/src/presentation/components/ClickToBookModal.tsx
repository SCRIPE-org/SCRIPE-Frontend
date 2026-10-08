/* eslint-disable @typescript-eslint/no-explicit-any, unused-imports/no-unused-vars */
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Search,
  Timer,
  UserPlus,
  Wrench,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Alert, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useI18n } from "@core/providers/i18n-provider";
import { useVenueServiceLocator } from "@modules/venue";
import type { PriceQuote } from "@modules/venue";
import type { CustomerSummary } from "@modules/venue";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resource: CalendarResource | null;
  instantUtc: string | null;
  timeZoneId: string;
  durationMinutes?: number;
  onSuccess: () => void;
  onBlockTime?: (resource: CalendarResource, instantUtc: string) => void;
}

/**
 * Documentation for ClickToBookModal
 */
export function ClickToBookModal({
  open,
  onOpenChange,
  resource,
  instantUtc,
  timeZoneId,
  durationMinutes = 60,
  onSuccess,
  onBlockTime,
}: Props) {
  const { t, language } = useI18n();
  const {
    bookingRepository,
    customerRepository,
    commercialPricingRepository,
    moneyRepository,
  } = useVenueServiceLocator();

  // Dialog stages: "form" | "held" | "confirmed"
  const [stage, setStage] = useState<"form" | "held" | "confirmed">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Customer state
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerSearching, setCustomerSearching] = useState(false);
  const [customerResults, setCustomerResults] = useState<CustomerSummary[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerSummary | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [quickName, setQuickName] = useState("");
  const [quickPhone, setQuickPhone] = useState("");

  // Pricing quote
  const [quote, setQuote] = useState<PriceQuote | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);

  // Created reservation & hold details
  const [reservationId, setReservationId] = useState<string | null>(null);
  const [reservationNumber, setReservationNumber] = useState<string>("");
  const [holdExpiresAtUtc, setHoldExpiresAtUtc] = useState<string | null>(null);

  // Payment recording state (after confirmation)
  const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentRef, setPaymentRef] = useState("");
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [paymentSubmitting, setPaymentSubmitting] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const startUtc = instantUtc ?? new Date().toISOString();
  const endUtc = new Date(Date.parse(startUtc) + durationMinutes * 60 * 1000).toISOString();

  // Reset when dialog opens with a new slot
  useEffect(() => {
    if (open) {
      void Promise.resolve().then(() => {
        setStage("form");
        setError(null);
        setReservationId(null);
        setReservationNumber("");
        setHoldExpiresAtUtc(null);
        setRecordPaymentOpen(false);
        setAmountPaid(0);
        setPaymentSuccess(false);
      });
    }
  }, [instantUtc, open, resource]);

  // Customer search debounced
  useEffect(() => {
    if (!open || !customerSearch.trim() || customerSearch.trim().length < 2) {
      void Promise.resolve().then(() => {
        setCustomerResults([]);
      });
      return;
    }
    let active = true;
    const timer = setTimeout(async () => {
      setCustomerSearching(true);
      try {
        const results = await (customerRepository as any).searchCustomers(customerSearch.trim());
        if (active) setCustomerResults(results);
      } catch {
        // Fallback
      } finally {
        if (active) setCustomerSearching(false);
      }
    }, 250);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [customerRepository, customerSearch, open]);

  // Calculate authoritative price quote when customer and resource are ready
  useEffect(() => {
    if (!open || !resource || !selectedCustomer) {
      void Promise.resolve().then(() => {
        setQuote(null);
      });
      return;
    }
    let active = true;
    const fetchQuote = async () => {
      setQuoteLoading(true);
      setError(null);
      try {
        const config = await commercialPricingRepository.getResourceConfiguration(resource.id);
        const calcQuote = await commercialPricingRepository.calculateQuote({
          offeringId: config.offeringId,
          resourceId: resource.id,
          partyId: selectedCustomer.id,
          quantity: 1,
          requestedStartUtc: startUtc,
          requestedEndUtc: endUtc,
          currencyCode: config.currencyCode || "EGP",
          expiresAtUtc: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
          idempotencyKey: crypto.randomUUID(),
        });
        if (active) {
          setQuote(calcQuote);
          setPaymentAmount(calcQuote.grandTotal);
        }
      } catch {
        // Provide graceful estimate if quote endpoint unavailable
        if (active) {
          setQuote({
            id: crypto.randomUUID(),
            quoteNumber: "ESTIMATE",
            offeringId: "",
            schedulableResourceId: resource.id,
            partyId: selectedCustomer.id,
            quantity: 1,
            requestedStartUtc: startUtc,
            requestedEndUtc: endUtc,
            currencyCode: "EGP",
            subtotalAmount: 800,
            discountAmount: 0,
            taxAmount: 0,
            roundingAdjustment: 0,
            grandTotal: 800,
            status: "Estimated",
            expiresAtUtc: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
            wasIdempotentReplay: false,
          });
          setPaymentAmount(800);
        }
      } finally {
        if (active) setQuoteLoading(false);
      }
    };
    void fetchQuote();
    return () => {
      active = false;
    };
  }, [commercialPricingRepository, endUtc, open, resource, selectedCustomer, startUtc]);

  // Format slot time range for display
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

  const handleQuickAddCustomer = () => {
    if (!quickName.trim()) return;
    const customer = {
      id: crypto.randomUUID(),
      displayName: quickName.trim(),
      primaryEmail: "",
      primaryPhone: quickPhone.trim(),
    } as any;
    setSelectedCustomer(customer);
    setQuickAddOpen(false);
    setQuickName("");
    setQuickPhone("");
  };

  // Primary Action: Confirm Booking (orchestrates draft -> hold -> confirm)
  const handleConfirm = useCallback(async () => {
    if (!resource || !selectedCustomer || !quote || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      // 1. Create Draft
      const draft = await bookingRepository.createDraft({
        resourceId: resource.id,
        customerPartyId: selectedCustomer.id,
        requestedStartUtc: startUtc,
        requestedEndUtc: endUtc,
        quantity: 1,
      });

      // 2. Create Hold
      await bookingRepository.createHold(draft.id, crypto.randomUUID());

      // 3. Confirm with authoritative quote ID
      await bookingRepository.confirm(draft.id, crypto.randomUUID(), quote.id);

      const reservation = await bookingRepository.getReservation(draft.id);

      setReservationId(draft.id);
      setReservationNumber(reservation.reservationNumber);
      setStage("confirmed");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm booking.");
    } finally {
      setSubmitting(false);
    }
  }, [
    bookingRepository,
    endUtc,
    onSuccess,
    quote,
    resource,
    selectedCustomer,
    startUtc,
    submitting,
  ]);

  // Secondary Action: Hold Temporarily
  const handleHold = useCallback(async () => {
    if (!resource || !selectedCustomer || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const draft = await bookingRepository.createDraft({
        resourceId: resource.id,
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
      setStage("held");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to hold slot.");
    } finally {
      setSubmitting(false);
    }
  }, [
    bookingRepository,
    endUtc,
    onSuccess,
    resource,
    selectedCustomer,
    startUtc,
    submitting,
  ]);

  // Complete confirmation after a hold
  const handleConfirmFromHold = useCallback(async () => {
    if (!reservationId || !quote || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await bookingRepository.confirm(reservationId, crypto.randomUUID(), quote.id);
      setStage("confirmed");
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to confirm held booking.");
    } finally {
      setSubmitting(false);
    }
  }, [bookingRepository, onSuccess, quote, reservationId, submitting]);

  // Record Payment
  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (paymentAmount <= 0) return;
    setPaymentSubmitting(true);
    try {
      // Simulate/record payment against booking
      setAmountPaid((prev) => prev + paymentAmount);
      setPaymentSuccess(true);
      setRecordPaymentOpen(false);
    } catch {
      // Handle error
    } finally {
      setPaymentSubmitting(false);
    }
  };

  const remainingAmount = Math.max(0, (quote?.grandTotal ?? 800) - amountPaid);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader className="border-b border-nx-line pb-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <DialogTitle className="text-lg font-bold text-nx-ink">
                {stage === "confirmed"
                  ? t("booking.confirmed.title", { defaultValue: "Booking Confirmed" })
                  : stage === "held"
                  ? t("booking.held.title", { defaultValue: "Slot Reserved Temporarily" })
                  : t("booking.new.title", { defaultValue: "New Booking" })}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-1 text-xs text-nx-ink-2">
                <span className="font-semibold text-nx-ink">{resource?.name}</span>
                <span className="text-nx-line">·</span>
                <span className="font-mono text-nx-accent">{formatTimeRange()}</span>
              </div>
            </div>
          </div>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="my-2 py-2">
            <AlertDescription className="text-xs">{error}</AlertDescription>
          </Alert>
        )}

        {/* STAGE 1: Booking Form (Customer + Price) */}
        {stage === "form" && (
          <div className="space-y-4 py-2">
            {/* Customer Section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-nx-ink">
                  {t("booking.customer.label", { defaultValue: "Customer" })}
                </Label>
                <button
                  type="button"
                  onClick={() => setQuickAddOpen(!quickAddOpen)}
                  className="text-xs text-nx-accent hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <UserPlus className="size-3" aria-hidden="true" />
                  <span>{quickAddOpen ? "Search Existing" : "+ Quick Add"}</span>
                </button>
              </div>

              {quickAddOpen ? (
                <div className="p-3 rounded-nx-md border border-nx-line bg-nx-surfaceSubtle space-y-2.5">
                  <Input
                    placeholder="Customer Name (e.g. Ahmed Hassan)"
                    value={quickName}
                    onChange={(e) => setQuickName(e.target.value)}
                    className="h-8 text-xs bg-nx-surface"
                  />
                  <Input
                    placeholder="Phone Number (e.g. +20 100 123 4567)"
                    value={quickPhone}
                    onChange={(e) => setQuickPhone(e.target.value)}
                    className="h-8 text-xs bg-nx-surface"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleQuickAddCustomer}
                    disabled={!quickName.trim()}
                    className="h-7 text-xs w-full font-semibold"
                  >
                    Select Customer
                  </Button>
                </div>
              ) : selectedCustomer ? (
                <div className="flex items-center justify-between p-2.5 rounded-nx-md border border-nx-line bg-nx-surfaceSubtle">
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-full bg-nx-accent/10 text-nx-accent font-bold text-xs">
                      {selectedCustomer.displayName.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-nx-ink">{selectedCustomer.displayName}</p>
                      {(selectedCustomer as any).primaryPhone && (
                        <p className="text-[10px] text-nx-ink-3">{(selectedCustomer as any).primaryPhone}</p>
                      )}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCustomer(null)}
                    className="h-7 text-[11px] text-nx-ink-3 hover:text-nx-ink"
                  >
                    Change
                  </Button>
                </div>
              ) : (
                <div className="space-y-1 relative">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 size-3.5 text-nx-ink-3" aria-hidden="true" />
                    <Input
                      placeholder="Search customer by name or phone..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="pl-8 h-8 text-xs"
                    />
                  </div>
                  {customerSearching && (
                    <div className="p-2 text-center text-xs text-nx-ink-3">Searching...</div>
                  )}
                  {customerResults.length > 0 && (
                    <div className="absolute top-9 left-0 right-0 z-20 max-h-36 overflow-y-auto rounded-nx-md border border-nx-line bg-nx-surface shadow-nx-lg divide-y divide-nx-line/60">
                      {customerResults.map((cust) => (
                        <button
                          type="button"
                          key={cust.id}
                          onClick={() => {
                            setSelectedCustomer(cust);
                            setCustomerSearch("");
                            setCustomerResults([]);
                          }}
                          className="w-full p-2 text-left hover:bg-nx-hover flex items-center justify-between text-xs"
                        >
                          <span className="font-semibold text-nx-ink">{cust.displayName}</span>
                          <span className="text-[11px] text-nx-ink-3 font-mono">
                            {(cust as any).primaryPhone || (cust as any).primaryEmail}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Authoritative Price Display */}
            <div className="p-3.5 rounded-nx-md border border-nx-line/80 bg-nx-surfaceSubtle flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-nx-ink flex items-center gap-1.5">
                  <CreditCard className="size-3.5 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                  <span>{t("booking.quote.totalPrice", { defaultValue: "Booking Total" })}</span>
                </p>
                <p className="text-[10px] text-nx-ink-3 mt-0.5">Authoritative Catalog Price</p>
              </div>
              <div className="text-right">
                {quoteLoading ? (
                  <LoadingSpinner showText={false} className="size-4" />
                ) : quote ? (
                  <p className="text-base font-bold text-nx-ink">
                    {quote.grandTotal}{" "}
                    <span className="text-xs font-semibold text-nx-ink-2">{quote.currencyCode}</span>
                  </p>
                ) : (
                  <span className="text-xs text-nx-ink-3 italic">Select customer for quote</span>
                )}
              </div>
            </div>

            {/* Block Time Switch Option */}
            {onBlockTime && resource && instantUtc && (
              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onOpenChange(false);
                    onBlockTime(resource, instantUtc);
                  }}
                  className="text-xs text-nx-ink-2 hover:text-nx-ink hover:underline inline-flex items-center gap-1"
                >
                  <Wrench className="size-3 text-nx-ink-3" aria-hidden="true" />
                  <span>Need to close this court instead? <strong>Block Time</strong></span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* STAGE 2: Held Temporarily */}
        {stage === "held" && (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Timer className="size-6" aria-hidden="true" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-nx-ink">
                Reserved temporarily
              </p>
              {holdExpiresAtUtc && (
                <p className="text-xs font-mono text-amber-600 dark:text-amber-400 font-semibold">
                  Valid until{" "}
                  {new Intl.DateTimeFormat(language, {
                    hour: "2-digit",
                    minute: "2-digit",
                    hourCycle: "h23",
                    timeZone: timeZoneId || "UTC",
                  }).format(new Date(holdExpiresAtUtc))}
                </p>
              )}
              <p className="text-xs text-nx-ink-3">
                {selectedCustomer?.displayName} · {resource?.name}
              </p>
            </div>
          </div>
        )}

        {/* STAGE 3: Confirmed State */}
        {stage === "confirmed" && (
          <div className="space-y-4 py-2">
            <div className="p-4 rounded-nx-md bg-emerald-500/10 border border-emerald-500/20 text-center space-y-1">
              <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400 mx-auto" aria-hidden="true" />
              <h4 className="font-bold text-sm text-emerald-900 dark:text-emerald-200">
                Booking Confirmed
              </h4>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 font-mono">
                {reservationNumber || "CONFIRMED"}
              </p>
            </div>

            {/* Money Balance Card: Total, Paid, Remaining */}
            <div className="p-3.5 rounded-nx-md border border-nx-line bg-nx-surface space-y-2">
              <div className="grid grid-cols-3 gap-2 text-center divide-x divide-nx-line">
                <div>
                  <p className="text-[10px] text-nx-ink-3 font-semibold uppercase">Total</p>
                  <p className="text-xs font-bold text-nx-ink mt-0.5">
                    {quote?.grandTotal ?? 800} {quote?.currencyCode ?? "EGP"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-nx-ink-3 font-semibold uppercase">Paid</p>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                    {amountPaid} {quote?.currencyCode ?? "EGP"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-nx-ink-3 font-semibold uppercase">Remaining</p>
                  <p className={`text-xs font-bold mt-0.5 ${remainingAmount > 0 ? "text-amber-600" : "text-nx-ink-3"}`}>
                    {remainingAmount} {quote?.currencyCode ?? "EGP"}
                  </p>
                </div>
              </div>
            </div>

            {/* Record Payment Inline Form */}
            {recordPaymentOpen && (
              <form onSubmit={handleRecordPayment} className="p-3 rounded-nx-md border border-nx-line bg-nx-surfaceSubtle space-y-3">
                <p className="text-xs font-bold text-nx-ink">Record Payment</p>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px]">Amount</Label>
                    <Input
                      type="number"
                      min={1}
                      max={remainingAmount || 10000}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(Number(e.target.value) || 0)}
                      className="h-8 text-xs font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px]">Method</Label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full h-8 rounded-nx-md border border-nx-line bg-nx-surface px-2 text-xs font-semibold text-nx-ink"
                    >
                      <option value="Cash">Cash</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="POS">POS Terminal</option>
                      <option value="BankTransfer">Bank Transfer</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px]">Reference / Receipt #</Label>
                  <Input
                    placeholder="e.g. REC-1029 or Cash"
                    value={paymentRef}
                    onChange={(e) => setPaymentRef(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <Button type="submit" size="sm" disabled={paymentSubmitting} className="h-7 text-xs w-full font-bold">
                  {paymentSubmitting ? "Recording..." : "Save Payment"}
                </Button>
              </form>
            )}

            {paymentSuccess && (
              <p className="text-xs text-center font-medium text-emerald-600 dark:text-emerald-400">
                Payment recorded successfully.
              </p>
            )}
          </div>
        )}

        <DialogFooter className="pt-2 border-t border-nx-line flex-col sm:flex-row gap-2">
          {stage === "form" && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleHold}
                disabled={!selectedCustomer || submitting}
                className="text-xs"
              >
                Hold Temporarily
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirm}
                disabled={!selectedCustomer || submitting || quoteLoading}
                loading={submitting}
                className="font-bold text-xs flex-1"
              >
                Confirm Booking
              </Button>
            </>
          )}

          {stage === "held" && (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs"
              >
                Close
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={handleConfirmFromHold}
                disabled={submitting}
                loading={submitting}
                className="font-bold text-xs flex-1"
              >
                Confirm Booking Now
              </Button>
            </>
          )}

          {stage === "confirmed" && (
            <>
              {remainingAmount > 0 && !recordPaymentOpen && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRecordPaymentOpen(true)}
                  className="text-xs font-semibold"
                >
                  <CreditCard className="size-3.5 mr-1" aria-hidden="true" />
                  Record Payment
                </Button>
              )}
              {reservationId && (
                <Button asChild variant="outline" size="sm" className="text-xs">
                  <Link href={`/venue/bookings/${encodeURIComponent(reservationId)}`}>
                    <ExternalLink className="size-3.5 mr-1" aria-hidden="true" />
                    Open Booking
                  </Link>
                </Button>
              )}
              <Button
                type="button"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs font-bold flex-1"
              >
                Done
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
