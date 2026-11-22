"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, CreditCard, ExternalLink } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import type { CustomerSummary, PriceQuote } from "@modules/venue";
import type { CalendarResource } from "../../../domain/entities/OperationsCalendar";

interface BookingConfirmedStageProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  selectedResource: CalendarResource | null;
  selectedCustomer: CustomerSummary | null;
  formatDateDisplay: () => string;
  formatTimeRange: () => string;
  paymentPartialFailure: boolean;
  paymentErrorMessage?: string | null;
  quote: PriceQuote | null;
  amountPaid: number;
  remainingBalance: number;
  canRecordPayment: boolean;
  recordingPaymentManual: boolean;
  onManualRecordPayment: () => void;
  reservationId: string | null;
  onClose: () => void;
}

/**
 * Confirmation summary stage displaying booking receipt, partial payment retry, and deep links.
 */
export function BookingConfirmedStage({
  t,
  selectedResource,
  selectedCustomer,
  formatDateDisplay,
  formatTimeRange,
  paymentPartialFailure,
  paymentErrorMessage,
  quote,
  amountPaid,
  remainingBalance,
  canRecordPayment,
  recordingPaymentManual,
  onManualRecordPayment,
  reservationId,
  onClose,
}: BookingConfirmedStageProps) {
  const currency = quote?.currencyCode || t("operationsCalendar.clickToBook.pricing.currency");

  return (
    <div className="space-y-3.5 py-1 text-center">
      <div className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-success/40 bg-success/10 text-success">
        <CheckCircle2 className="size-9" aria-hidden="true" />
      </div>

      <div>
        <h3 className="text-lg font-black text-nx-ink">
          {t("operationsCalendar.clickToBook.success.title")}
        </h3>
        <p className="mt-0.5 text-xs text-nx-ink-2">
          {selectedResource?.name} • {formatDateDisplay()} • {formatTimeRange()}
        </p>
        <p className="mt-0.5 text-xs font-bold text-nx-ink">{selectedCustomer?.displayName}</p>
      </div>

      {paymentPartialFailure && (
        <Alert variant="warning" className="my-2 text-start text-xs">
          <AlertCircle className="size-4" aria-hidden="true" />
          <AlertTitle className="text-xs font-bold">
            {t("operationsCalendar.clickToBook.partialFailure.title")}
          </AlertTitle>
          <AlertDescription className="text-[11px]">
            {paymentErrorMessage || t("operationsCalendar.clickToBook.partialFailure.description")}
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2 rounded-nx-lg border border-nx-line bg-nx-raised/40 p-3.5 text-start">
        <div className="flex items-center justify-between text-xs">
          <span className="text-nx-ink-2">
            {t("operationsCalendar.clickToBook.success.total")}
          </span>
          <span className="font-bold text-nx-ink">
            {quote?.grandTotal ?? 0} {currency}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-nx-ink-2">
            {t("operationsCalendar.clickToBook.success.paid")}
          </span>
          <span className="font-bold text-success">
            {amountPaid} {currency}
          </span>
        </div>
        <div className="flex items-center justify-between border-t border-nx-line pt-1.5 text-xs">
          <span className="text-nx-ink-2">
            {t("operationsCalendar.clickToBook.success.remaining")}
          </span>
          <span className="font-bold text-warning">
            {remainingBalance} {currency}
          </span>
        </div>
      </div>

      <div className="space-y-2 pt-2">
        {canRecordPayment && remainingBalance > 0 && (
          <Button
            type="button"
            variant="default"
            className="h-9 w-full rounded-nx-lg text-xs font-bold"
            loading={recordingPaymentManual}
            disabled={recordingPaymentManual}
            onClick={onManualRecordPayment}
          >
            <CreditCard className="me-2 size-3.5" aria-hidden="true" />
            {amountPaid === 0
              ? t("operationsCalendar.clickToBook.success.recordPayment")
              : t("operationsCalendar.clickToBook.success.recordAnotherPayment")}
          </Button>
        )}

        {reservationId && (
          <Button
            asChild
            variant="outline"
            className="h-9 w-full rounded-nx-lg border border-nx-line text-xs font-semibold hover:bg-nx-raised"
          >
            <Link href={`/venue/bookings/${encodeURIComponent(reservationId)}`}>
              <ExternalLink className="me-2 size-3.5" aria-hidden="true" />
              {t("operationsCalendar.clickToBook.success.openBooking")}
            </Link>
          </Button>
        )}

        <Button
          type="button"
          variant="ghost"
          onClick={onClose}
          className="text-xs font-semibold text-nx-ink-3 hover:text-nx-ink"
        >
          {t("operationsCalendar.clickToBook.success.close")}
        </Button>
      </div>
    </div>
  );
}
