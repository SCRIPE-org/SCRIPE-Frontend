"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, CreditCard, ExternalLink, Search } from "lucide-react";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import type { CalendarResource } from "../../../domain/entities/OperationsCalendar";
import type { CustomerSummary, PriceQuote } from "@modules/venue";

interface BookingPaymentStepProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  stage: "booking" | "conflict" | "confirmed";
  onClose: () => void;
  onSuccess: () => void;
  onFindSlots?: () => void;
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
  paymentChoice: "later" | "now";
  onPaymentChoiceChange: (choice: "later" | "now") => void;
  payNowAmount: number;
  onPayNowAmountChange: (amt: number) => void;
  paymentMethod: "Cash" | "Card" | "POS" | "BankTransfer" | "Other";
  onPaymentMethodChange: (method: "Cash" | "Card" | "POS" | "BankTransfer" | "Other") => void;
  paymentReference: string;
  onPaymentReferenceChange: (ref: string) => void;
}

export function BookingPaymentStep({
  t,
  stage,
  onClose,
  onSuccess,
  onFindSlots,
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
  paymentChoice,
  onPaymentChoiceChange,
  payNowAmount,
  onPayNowAmountChange,
  paymentMethod,
  onPaymentMethodChange,
  paymentReference,
  onPaymentReferenceChange,
}: BookingPaymentStepProps) {
  if (stage === "conflict") {
    return (
      <div className="space-y-4 py-4 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-full border-2 border-warning/40 bg-warning/10 text-warning">
          <AlertCircle className="size-8" />
        </div>
        <div>
          <h3 className="text-base font-bold text-nx-ink">
            {t("operationsCalendar.clickToBook.conflict.title")}
          </h3>
          <p className="mt-1 text-xs text-nx-ink-2">
            {t("operationsCalendar.clickToBook.conflict.description")}
          </p>
        </div>
        <div className="space-y-2 pt-2">
          {onFindSlots && (
            <Button
              type="button"
              variant="default"
              className="h-9 w-full rounded-lg text-xs font-bold"
              onClick={() => {
                onClose();
                onFindSlots();
              }}
            >
              <Search className="me-2 h-3.5 w-3.5" />
              {t("operationsCalendar.clickToBook.conflict.findAnother")}
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            className="h-9 w-full rounded-lg text-xs font-semibold"
            onClick={() => {
              onClose();
              onSuccess();
            }}
          >
            {t("operationsCalendar.clickToBook.conflict.returnToCalendar")}
          </Button>
        </div>
      </div>
    );
  }

  if (stage === "confirmed") {
    return (
      <div className="space-y-4 py-3 text-center">
        <div className="mx-auto flex size-16 items-center justify-center rounded-full border-2 border-success/40 bg-success/10 text-success">
          <CheckCircle2 className="size-9" />
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

        {/* Critical Partial Failure Alert */}
        {paymentPartialFailure && (
          <Alert variant="warning" className="my-2 text-left text-xs">
            <AlertCircle className="size-4" />
            <AlertTitle className="text-xs font-bold">
              {t("operationsCalendar.clickToBook.partialFailure.title")}
            </AlertTitle>
            <AlertDescription className="text-[11px]">
              {paymentErrorMessage ||
                t("operationsCalendar.clickToBook.partialFailure.description")}
            </AlertDescription>
          </Alert>
        )}

        {/* Receipt Summary Card */}
        <div className="border-nx-line bg-nx-raised/40 space-y-2 rounded-xl border p-3.5 text-left">
          <div className="flex items-center justify-between text-xs">
            <span className="text-nx-ink-2">
              {t("operationsCalendar.clickToBook.success.total")}
            </span>
            <span className="font-bold text-nx-ink">
              {quote?.grandTotal ?? 0} {quote?.currencyCode || "EGP"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-nx-ink-2">
              {t("operationsCalendar.clickToBook.success.paid")}
            </span>
            <span className="font-bold text-success">
              {amountPaid} {quote?.currencyCode || "EGP"}
            </span>
          </div>
          <div className="border-nx-line flex items-center justify-between border-t pt-1.5 text-xs">
            <span className="text-nx-ink-2">
              {t("operationsCalendar.clickToBook.success.remaining")}
            </span>
            <span className="font-bold text-warning">
              {remainingBalance} {quote?.currencyCode || "EGP"}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          {canRecordPayment && remainingBalance > 0 && (
            <Button
              type="button"
              className="h-9 w-full rounded-xl bg-nx-accent-fill text-xs font-bold text-nx-on-fill hover:bg-nx-accent-fill/90"
              loading={recordingPaymentManual}
              disabled={recordingPaymentManual}
              onClick={onManualRecordPayment}
            >
              <CreditCard className="me-2 size-3.5" />
              {amountPaid === 0
                ? t("operationsCalendar.clickToBook.success.recordPayment")
                : t("operationsCalendar.clickToBook.success.recordAnotherPayment")}
            </Button>
          )}

          {reservationId && (
            <Button
              asChild
              variant="outline"
              className="border-nx-border h-9 w-full rounded-xl border text-xs font-semibold hover:bg-nx-raised"
            >
              <Link href={`/venue/bookings/${encodeURIComponent(reservationId)}`}>
                <ExternalLink className="me-2 size-3.5" />
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

  return (
    <div className="space-y-2 pt-1">
      <Label className="text-xs font-bold text-nx-ink">
        {t("operationsCalendar.clickToBook.payment.title")}
      </Label>

      <RadioGroup
        aria-label={t("operationsCalendar.clickToBook.payment.title")}
        value={paymentChoice}
        onValueChange={(value) => onPaymentChoiceChange(value as "later" | "now")}
        className="space-y-2"
      >
        <div
          className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${paymentChoice === "later" ? "border-nx-accent bg-nx-accent-wash" : "border-nx-line hover:bg-nx-raised/50"}`}
        >
          <RadioGroupItem id="booking-payment-later" value="later" className="mt-0.5" />
          <div>
            <Label htmlFor="booking-payment-later" className="text-xs font-bold text-nx-ink">
              {t("operationsCalendar.clickToBook.payment.payLater")}
            </Label>
            <p className="text-[10px] text-nx-ink-3">
              {t("operationsCalendar.clickToBook.payment.payLaterDescription")}
            </p>
          </div>
        </div>

        {canRecordPayment && (
          <div
            className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${paymentChoice === "now" ? "border-nx-accent bg-nx-accent-wash" : "border-nx-line hover:bg-nx-raised/50"}`}
          >
            <RadioGroupItem id="booking-payment-now" value="now" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="booking-payment-now" className="text-xs font-bold text-nx-ink">
                {t("operationsCalendar.clickToBook.payment.recordNow")}
              </Label>

              {paymentChoice === "now" && (
                <div className="border-nx-line mt-2.5 space-y-2.5 border-t pt-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={payNowAmount}
                      onChange={(e) => onPayNowAmountChange(Number(e.target.value) || 0)}
                      className="h-8 w-28 bg-nx-surface text-xs font-bold"
                    />
                    <span className="text-[11px] text-nx-ink-2">
                      {t("operationsCalendar.clickToBook.payment.remaining", {
                        amount: Math.max(0, (quote?.grandTotal ?? 0) - payNowAmount),
                        currency: quote?.currencyCode || "EGP",
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <GenericSelect
                      id="booking-payment-method"
                      allowClear={false}
                      value={paymentMethod}
                      options={[
                        { value: "Cash", label: t("operationsCalendar.clickToBook.payment.cash") },
                        { value: "Card", label: t("operationsCalendar.clickToBook.payment.card") },
                        {
                          value: "BankTransfer",
                          label: t("operationsCalendar.clickToBook.payment.transfer"),
                        },
                        { value: "POS", label: t("operationsCalendar.clickToBook.payment.pos") },
                      ]}
                      onValueChange={(value: string | string[]) => {
                        const method = Array.isArray(value) ? value[0] : value;
                        if (method) {
                          onPaymentMethodChange(
                            method as "Cash" | "Card" | "POS" | "BankTransfer" | "Other"
                          );
                        }
                      }}
                    />
                    <Input
                      placeholder={t("operationsCalendar.clickToBook.payment.referencePlaceholder")}
                      value={paymentReference}
                      onChange={(e) => onPaymentReferenceChange(e.target.value)}
                      className="h-8 bg-nx-surface text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </RadioGroup>
    </div>
  );
}
