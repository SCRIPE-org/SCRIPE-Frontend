"use client";

import React from "react";
import { ArrowRight, Timer } from "lucide-react";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@core/ui/dialog";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription } from "@core/ui/alert";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";
import {
  useClickToBookViewModel,
  type UseClickToBookProps,
} from "../viewmodels/useClickToBookViewModel";
import { BookingCourtStep } from "./booking-steps/BookingCourtStep";
import { BookingCustomerStep } from "./booking-steps/BookingCustomerStep";
import { BookingPricingStep } from "./booking-steps/BookingPricingStep";
import { BookingPaymentStep } from "./booking-steps/BookingPaymentStep";

function getCourtImage(resourceName?: string, sportType?: string): string {
  const lower = (resourceName || "").toLowerCase();
  const sport = (sportType || "").toLowerCase();
  if (lower.includes("football") || lower.includes("turf") || lower.includes("pitch") || sport.includes("football") || sport.includes("soccer")) {
    return "/images/venue/football-turf-night.svg";
  }
  if (lower.includes("2") || lower.includes("outdoor") || lower.includes("court 2")) {
    return "/images/venue/padel-court-outdoor.svg";
  }
  return "/images/venue/padel-court-indoor.svg";
}

export type ClickToBookModalProps = UseClickToBookProps;

export function ClickToBookModal(props: ClickToBookModalProps) {
  const { open, onOpenChange, resources = [], onFindSlots, onSuccess } = props;
  const vm = useClickToBookViewModel(props);
  const { t, isRtl } = vm;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 bg-nx-surface border border-nx-border rounded-2xl shadow-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("operationsCalendar.clickToBook.title")}</DialogTitle>
          <DialogDescription>
            {vm.selectedResource?.name
              ? `${vm.selectedResource.name} booking`
              : "Create venue booking"}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper Header (Only during normal booking flow) */}
        {vm.stage === "booking" && (
          <div className="flex items-center justify-between pb-3 border-b border-nx-border">
            {!vm.isContextual && (
              <>
                <div className="flex items-center gap-2">
                  <span
                    className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                      vm.step >= 0
                        ? "bg-[#C6FF00] text-[#0D0D0E] shadow-sm ring-1 ring-[#C6FF00]/40"
                        : "bg-nx-raised text-nx-ink-3"
                    }`}
                  >
                    1
                  </span>
                  <span className={`text-xs font-semibold ${vm.step >= 0 ? "text-nx-ink font-bold" : "text-nx-ink-3"}`}>
                    {t("operationsCalendar.clickToBook.stepper.courtAndTime")}
                  </span>
                </div>
                <div className={`h-px w-6 ${vm.step >= 1 ? "bg-[#C6FF00]" : "bg-nx-border"}`} />
              </>
            )}

            <div className="flex items-center gap-2">
              <span
                className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  vm.step >= 1
                    ? "bg-[#C6FF00] text-[#0D0D0E] shadow-sm ring-1 ring-[#C6FF00]/40"
                    : "bg-nx-raised text-nx-ink-3"
                }`}
              >
                {vm.isContextual ? 1 : 2}
              </span>
              <span className={`text-xs font-semibold ${vm.step >= 1 ? "text-nx-ink font-bold" : "text-nx-ink-3"}`}>
                {t("operationsCalendar.clickToBook.stepper.customer")}
              </span>
            </div>

            <div className={`h-px w-6 ${vm.step >= 2 ? "bg-[#C6FF00]" : "bg-nx-border"}`} />

            <div className="flex items-center gap-2">
              <span
                className={`flex size-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  vm.step >= 2
                    ? "bg-[#C6FF00] text-[#0D0D0E] shadow-sm ring-1 ring-[#C6FF00]/40"
                    : "bg-nx-raised text-nx-ink-3"
                }`}
              >
                {vm.isContextual ? 2 : 3}
              </span>
              <span className={`text-xs font-semibold ${vm.step >= 2 ? "text-nx-ink font-bold" : "text-nx-ink-3"}`}>
                {t("operationsCalendar.clickToBook.stepper.confirm")}
              </span>
            </div>
          </div>
        )}

        {/* Global Error Banner */}
        {vm.error && (
          <Alert variant="destructive" className="my-2 py-2">
            <AlertDescription className="text-xs">{vm.error}</AlertDescription>
          </Alert>
        )}

        {/* Conflict & Confirmed Stages */}
        {vm.stage !== "booking" ? (
          <BookingPaymentStep
            t={t}
            stage={vm.stage}
            onClose={() => onOpenChange(false)}
            onSuccess={onSuccess}
            onFindSlots={onFindSlots}
            selectedResource={vm.selectedResource}
            selectedCustomer={vm.selectedCustomer}
            formatDateDisplay={vm.formatDateDisplay}
            formatTimeRange={vm.formatTimeRange}
            paymentPartialFailure={vm.paymentPartialFailure}
            paymentErrorMessage={vm.paymentErrorMessage}
            quote={vm.quote}
            amountPaid={vm.amountPaid}
            remainingBalance={vm.remainingBalance}
            canRecordPayment={vm.canRecordPayment}
            recordingPaymentManual={vm.recordingPaymentManual}
            onManualRecordPayment={vm.handleManualRecordPayment}
            reservationId={vm.reservationId}
            paymentChoice={vm.paymentChoice}
            onPaymentChoiceChange={vm.setPaymentChoice}
            payNowAmount={vm.payNowAmount}
            onPayNowAmountChange={vm.setPayNowAmount}
            paymentMethod={vm.paymentMethod}
            onPaymentMethodChange={vm.setPaymentMethod}
            paymentReference={vm.paymentReference}
            onPaymentReferenceChange={vm.setPaymentReference}
          />
        ) : (
          /* Active Booking Flow */
          <div className="space-y-4 py-2">
            {/* Context Summary Card (Shown in Steps 1 & 2) */}
            {vm.step >= 1 && vm.selectedResource && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-nx-border bg-nx-raised/40">
                <div className="relative size-12 rounded-lg overflow-hidden border border-nx-border shrink-0 bg-nx-surface">
                  <img
                    src={getCourtImage(vm.selectedResource.name)}
                    alt={vm.selectedResource.name}
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-nx-ink truncate">
                      {vm.selectedResource.name}
                    </h4>
                    {!vm.isContextual && (
                      <button
                        type="button"
                        onClick={() => vm.setStep(0)}
                        className="text-[11px] font-semibold text-emerald-600 dark:text-[#C6FF00] hover:underline"
                      >
                        {t("operationsCalendar.clickToBook.context.change")}
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-nx-ink-2 truncate">
                    {vm.selectedResource.facilityName}
                  </p>
                  <p className="text-[11px] font-medium text-nx-ink mt-0.5">
                    {vm.formatDateDisplay()} • {vm.formatTimeRange()} ({vm.duration} min)
                  </p>
                </div>
              </div>
            )}

            {/* Step 0: Court & Time */}
            {vm.step === 0 && (
              <BookingCourtStep
                resources={resources}
                selectedResource={vm.selectedResource}
                onSelectResource={vm.setSelectedResource}
                startUtc={vm.startUtc}
                onStartTimeChange={vm.setSelectedInstantUtc}
                duration={vm.duration}
                onDurationChange={vm.setDuration}
                allowedDurations={vm.allowedDurations}
                timeZoneId={props.timeZoneId}
                isRtl={isRtl}
                step0Error={vm.step0Error}
                courtLabel={t("operationsCalendar.clickToBook.context.court")}
              />
            )}

            {/* Step 1: Customer Selection */}
            {vm.step === 1 && (
              <BookingCustomerStep
                t={t}
                quickAddOpen={vm.quickAddOpen}
                onToggleQuickAdd={() => {
                  vm.setQuickAddOpen(!vm.quickAddOpen);
                }}
                quickName={vm.quickName}
                onQuickNameChange={vm.setQuickName}
                quickPhone={vm.quickPhone}
                onQuickPhoneChange={vm.setQuickPhone}
                quickEmail={vm.quickEmail}
                onQuickEmailChange={vm.setQuickEmail}
                quickAddError={vm.quickAddError}
                duplicateWarning={vm.duplicateWarning}
                submitting={vm.submitting}
                onQuickAddCustomer={vm.handleQuickAddCustomer}
                selectedCustomer={vm.selectedCustomer}
                onSelectCustomer={vm.setSelectedCustomer}
                customerSearch={vm.customerSearch}
                onCustomerSearchChange={vm.setCustomerSearch}
                customerSearching={vm.customerSearching}
                customerSearchError={vm.customerSearchError}
                customerResults={vm.customerResults}
                onAdvanceToPricing={() => vm.setStep(2)}
              />
            )}

            {/* Step 2: Pricing Summary & Payment Option */}
            {vm.step === 2 && (
              <>
                <BookingPricingStep
                  t={t}
                  selectedCustomer={vm.selectedCustomer}
                  onChangeCustomer={() => vm.setStep(1)}
                  holdCountdown={vm.holdCountdown}
                  holdExpired={vm.holdExpired}
                  onRefreshAvailability={() => {
                    vm.setHoldExpired(false);
                    void vm.fetchAuthoritativeQuote();
                  }}
                  priceChangeNotice={vm.priceChangeNotice}
                  onAcknowledgePriceChange={() => vm.setPriceChangeNotice(null)}
                  quoteExpiredMessage={vm.quoteExpiredMessage}
                  quote={vm.quote}
                  quoteLoading={vm.quoteLoading}
                  quoteError={vm.quoteError}
                  onRetryQuote={vm.fetchAuthoritativeQuote}
                  canOverridePrice={vm.canOverridePrice}
                  overrideOpen={vm.overrideOpen}
                  onToggleOverride={() => vm.setOverrideOpen(!vm.overrideOpen)}
                  overrideAmount={vm.overrideAmount}
                  onOverrideAmountChange={vm.setOverrideAmount}
                  overrideReason={vm.overrideReason}
                  onOverrideReasonChange={vm.setOverrideReason}
                  overrideLoading={vm.overrideLoading}
                  overrideError={vm.overrideError}
                  onApplyOverride={vm.handleApplyPriceOverride}
                />

                <BookingPaymentStep
                  t={t}
                  stage={vm.stage}
                  onClose={() => onOpenChange(false)}
                  onSuccess={onSuccess}
                  onFindSlots={onFindSlots}
                  selectedResource={vm.selectedResource}
                  selectedCustomer={vm.selectedCustomer}
                  formatDateDisplay={vm.formatDateDisplay}
                  formatTimeRange={vm.formatTimeRange}
                  paymentPartialFailure={vm.paymentPartialFailure}
                  quote={vm.quote}
                  amountPaid={vm.amountPaid}
                  remainingBalance={vm.remainingBalance}
                  canRecordPayment={vm.canRecordPayment}
                  recordingPaymentManual={vm.recordingPaymentManual}
                  onManualRecordPayment={vm.handleManualRecordPayment}
                  reservationId={vm.reservationId}
                  paymentChoice={vm.paymentChoice}
                  onPaymentChoiceChange={vm.setPaymentChoice}
                  payNowAmount={vm.payNowAmount}
                  onPayNowAmountChange={vm.setPayNowAmount}
                  paymentMethod={vm.paymentMethod}
                  onPaymentMethodChange={vm.setPaymentMethod}
                  paymentReference={vm.paymentReference}
                  onPaymentReferenceChange={vm.setPaymentReference}
                />
              </>
            )}
          </div>
        )}

        {/* Footer Controls */}
        {vm.stage === "booking" && (
          <DialogFooter className="pt-3 border-t border-nx-border flex items-center justify-between">
            {vm.step === 2 && vm.canCreateHold && !vm.holdExpiresAtUtc ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={vm.handleHoldTemporarily}
                disabled={vm.submitting || !vm.selectedCustomer}
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
                  if (vm.step > (vm.isContextual ? 1 : 0)) {
                    vm.setStep(vm.step - 1);
                  } else {
                    onOpenChange(false);
                  }
                }}
                className="text-xs font-semibold"
              >
                {vm.step > (vm.isContextual ? 1 : 0)
                  ? t("operationsCalendar.clickToBook.confirm.back")
                  : t("operationsCalendar.clickToBook.confirm.cancel")}
              </Button>

              {vm.step < 2 ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    if (vm.step === 0) {
                      void vm.handleStep0Next();
                    } else {
                      vm.setStep(vm.step + 1);
                    }
                  }}
                  loading={vm.step === 0 && vm.step0Checking}
                  disabled={
                    (vm.step === 0 && (vm.step0Checking || !vm.selectedResource)) ||
                    (vm.step === 1 && !vm.selectedCustomer)
                  }
                  className="text-xs font-bold bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0D0D0E] shadow-sm disabled:opacity-50"
                >
                  {vm.step === 0 && vm.step0Checking ? (
                    <span>{isRtl ? "جارٍ التحقق..." : "Checking..."}</span>
                  ) : (
                    <>
                      {t("operationsCalendar.clickToBook.confirm.next")}
                      <ArrowRight className="size-3.5 ms-1 rtl:rotate-180" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  onClick={vm.handleConfirm}
                  loading={vm.submitting}
                  disabled={
                    vm.submitting ||
                    vm.quoteLoading ||
                    !vm.quote ||
                    vm.holdExpired ||
                    Boolean(vm.priceChangeNotice) ||
                    !vm.canCreateBooking
                  }
                  className="text-xs font-bold bg-[#C6FF00] hover:bg-[#b5eb00] text-[#0D0D0E] shadow-sm disabled:opacity-50"
                >
                  {vm.submitting ? (
                    <span>{isRtl ? "جارٍ التأكيد..." : "Confirming..."}</span>
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
