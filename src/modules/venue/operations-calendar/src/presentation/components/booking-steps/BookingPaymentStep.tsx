"use client";

import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { CalendarResource } from "../../../domain/entities/OperationsCalendar";
import type { CustomerSummary, PriceQuote } from "@modules/venue";
import type { ClickToBookPaymentMethod } from "../../viewmodels/click-to-book/useClickToBookPayment";
import { BookingConflictStage } from "./BookingConflictStage";
import { BookingConfirmedStage } from "./BookingConfirmedStage";

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
  paymentMethod: ClickToBookPaymentMethod;
  onPaymentMethodChange: (method: ClickToBookPaymentMethod) => void;
  paymentReference: string;
  onPaymentReferenceChange: (ref: string) => void;
}

/**
 * Payment selection control and post-submit conflict/confirmation stage router.
 */
export function BookingPaymentStep(props: BookingPaymentStepProps) {
  const { t, stage } = props;

  if (stage === "conflict") {
    return (
      <BookingConflictStage
        t={t}
        onClose={props.onClose}
        onSuccess={props.onSuccess}
        onFindSlots={props.onFindSlots}
      />
    );
  }

  if (stage === "confirmed") {
    return (
      <BookingConfirmedStage
        t={t}
        selectedResource={props.selectedResource}
        selectedCustomer={props.selectedCustomer}
        formatDateDisplay={props.formatDateDisplay}
        formatTimeRange={props.formatTimeRange}
        paymentPartialFailure={props.paymentPartialFailure}
        paymentErrorMessage={props.paymentErrorMessage}
        quote={props.quote}
        amountPaid={props.amountPaid}
        remainingBalance={props.remainingBalance}
        canRecordPayment={props.canRecordPayment}
        recordingPaymentManual={props.recordingPaymentManual}
        onManualRecordPayment={props.onManualRecordPayment}
        reservationId={props.reservationId}
        onClose={props.onClose}
      />
    );
  }

  const currency =
    props.quote?.currencyCode || t("operationsCalendar.clickToBook.pricing.currency");

  return (
    <div className="space-y-2 pt-1">
      <Label className="text-xs font-bold text-nx-ink">
        {t("operationsCalendar.clickToBook.payment.title")}
      </Label>

      <RadioGroup
        aria-label={t("operationsCalendar.clickToBook.payment.title")}
        value={props.paymentChoice}
        onValueChange={(value) => props.onPaymentChoiceChange(value as "later" | "now")}
        className="space-y-2"
      >
        <div
          className={`flex items-start gap-3 rounded-nx-lg border p-3 transition-colors ${
            props.paymentChoice === "later"
              ? "border-nx-accent/40 bg-nx-accent-wash"
              : "border-nx-line hover:bg-nx-raised/50"
          }`}
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

        {props.canRecordPayment && (
          <div
            className={`flex items-start gap-3 rounded-nx-lg border p-3 transition-colors ${
              props.paymentChoice === "now"
                ? "border-nx-accent/40 bg-nx-accent-wash"
                : "border-nx-line hover:bg-nx-raised/50"
            }`}
          >
            <RadioGroupItem id="booking-payment-now" value="now" className="mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="booking-payment-now" className="text-xs font-bold text-nx-ink">
                {t("operationsCalendar.clickToBook.payment.recordNow")}
              </Label>

              {props.paymentChoice === "now" && (
                <div className="mt-2.5 space-y-2.5 border-t border-nx-line pt-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={props.payNowAmount}
                      onChange={(e) => props.onPayNowAmountChange(Number(e.target.value) || 0)}
                      className="h-8 w-28 bg-nx-surface text-xs font-bold"
                    />
                    <span className="text-[11px] text-nx-ink-2">
                      {t("operationsCalendar.clickToBook.payment.remaining", {
                        amount: Math.max(0, (props.quote?.grandTotal ?? 0) - props.payNowAmount),
                        currency,
                      })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <GenericSelect
                      id="booking-payment-method"
                      allowClear={false}
                      value={props.paymentMethod}
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
                          props.onPaymentMethodChange(method as ClickToBookPaymentMethod);
                        }
                      }}
                    />
                    <Input
                      placeholder={t("operationsCalendar.clickToBook.payment.referencePlaceholder")}
                      value={props.paymentReference}
                      onChange={(e) => props.onPaymentReferenceChange(e.target.value)}
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
