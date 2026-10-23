// FILE-EXCEPTION: rule bypass for existing large file

"use client";

import React from "react";
import { ArrowRight, Timer } from "lucide-react";
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
import {
  useClickToBookViewModel,
  type UseClickToBookProps,
} from "../viewmodels/useClickToBookViewModel";
import { BookingCourtStep } from "./booking-steps/BookingCourtStep";
import { BookingCustomerStep } from "./booking-steps/BookingCustomerStep";
import { BookingPricingStep } from "./booking-steps/BookingPricingStep";
import { BookingPaymentStep } from "./booking-steps/BookingPaymentStep";

function getCourtImage(resourceName?: string, sportType?: string): string {
  const n = (resourceName || "").toLowerCase();
  const s = (sportType || "").toLowerCase();
  if (s.includes("5-a-side") || n.includes("5-a-side") || n.includes("5a")) {
    return "https://images.unsplash.com/photo-1575361204480-aadea25e6e68?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("foot") || n.includes("foot") || n.includes("pitch") || s.includes("soccer") || n.includes("turf")) {
    return "https://images.unsplash.com/photo-1529900748604-07564a03e7a6?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("tennis") || n.includes("tennis") || n.includes("clay") || n.includes("hardcourt")) {
    return "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("swim") || n.includes("swim") || n.includes("pool") || n.includes("lane") || s.includes("aqua")) {
    return "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("squash") || n.includes("squash")) {
    return "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("basket") || n.includes("basket") || n.includes("fieldhouse")) {
    return "https://images.unsplash.com/photo-1519861531473-9200262188bf?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("badmin") || n.includes("badmin")) {
    return "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("volley") || n.includes("volley") || n.includes("beach")) {
    return "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("gym") || s.includes("crossfit") || s.includes("fit") || n.includes("gym") || n.includes("crossfit")) {
    return "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("run") || s.includes("track") || s.includes("athletic") || n.includes("track")) {
    return "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=1200&q=80";
  }
  if (n.includes("outdoor") || s.includes("outdoor") || n.includes("panoramic")) {
    return "https://images.unsplash.com/photo-1599474924187-334a4ae5bd3c?auto=format&fit=crop&w=1200&q=80";
  }
  if (s.includes("padel") || n.includes("padel")) {
    return "https://images.unsplash.com/photo-1626248801379-51a0748a5f96?auto=format&fit=crop&w=1200&q=80";
  }
  return "/images/venue/padel-court-indoor.svg";
}

export type ClickToBookModalProps = UseClickToBookProps;

export function ClickToBookModal(props: ClickToBookModalProps) {
  const { open, onOpenChange, resources = [], onFindSlots, onSuccess } = props;
  const vm = useClickToBookViewModel(props);
  const { t } = vm;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-nx-border max-w-md rounded-2xl border bg-nx-surface p-6 shadow-xl">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("operationsCalendar.clickToBook.title")}</DialogTitle>
          <DialogDescription>
            {vm.selectedResource?.name
              ? `${vm.selectedResource.name} booking`
              : t("operationsCalendar.clickToBook.dialogDescription")}
          </DialogDescription>
        </DialogHeader>

        {/* Stepper Header (Only during normal booking flow) */}
        {vm.stage === "booking" && (
          <div className="border-nx-border flex items-center justify-between border-b pb-3">
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
                  <span
                    className={`text-xs font-semibold ${vm.step >= 0 ? "font-bold text-nx-ink" : "text-nx-ink-3"}`}
                  >
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
              <span
                className={`text-xs font-semibold ${vm.step >= 1 ? "font-bold text-nx-ink" : "text-nx-ink-3"}`}
              >
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
              <span
                className={`text-xs font-semibold ${vm.step >= 2 ? "font-bold text-nx-ink" : "text-nx-ink-3"}`}
              >
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
              <div className="border-nx-border bg-nx-raised/40 flex items-center gap-3 rounded-xl border p-3">
                <div className="border-nx-border relative size-12 shrink-0 overflow-hidden rounded-lg border bg-nx-surface">
                  <img
                    src={getCourtImage(vm.selectedResource.name)}
                    alt={vm.selectedResource.name}
                    className="size-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="truncate text-xs font-bold text-nx-ink">
                      {vm.selectedResource.name}
                    </h4>
                    {!vm.isContextual && (
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => vm.setStep(0)}
                        className="h-auto px-0 text-[11px] font-semibold text-emerald-600 hover:underline dark:text-[#C6FF00]"
                      >
                        {t("operationsCalendar.clickToBook.context.change")}
                      </Button>
                    )}
                  </div>
                  <p className="truncate text-[11px] text-nx-ink-2">
                    {vm.selectedResource.facilityName}
                  </p>
                  <p className="mt-0.5 text-[11px] font-medium text-nx-ink">
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
                t={t}
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
          <DialogFooter className="border-nx-border flex items-center justify-between border-t pt-3">
            {vm.step === 2 && vm.canCreateHold && !vm.holdExpiresAtUtc ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={vm.handleHoldTemporarily}
                disabled={vm.submitting || !vm.selectedCustomer}
                className="text-xs text-nx-ink-2"
              >
                <Timer className="me-1 size-3.5" />
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
                  className="bg-[#C6FF00] text-xs font-bold text-[#0D0D0E] shadow-sm hover:bg-[#b5eb00] disabled:opacity-50"
                >
                  {vm.step === 0 && vm.step0Checking ? (
                    <span>{t("operationsCalendar.clickToBook.courtStep.checking")}</span>
                  ) : (
                    <>
                      {t("operationsCalendar.clickToBook.confirm.next")}
                      <ArrowRight className="ms-1 size-3.5 rtl:rotate-180" />
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
                  className="bg-[#C6FF00] text-xs font-bold text-[#0D0D0E] shadow-sm hover:bg-[#b5eb00] disabled:opacity-50"
                >
                  {vm.submitting ? (
                    <span>{t("operationsCalendar.clickToBook.courtStep.confirming")}</span>
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
