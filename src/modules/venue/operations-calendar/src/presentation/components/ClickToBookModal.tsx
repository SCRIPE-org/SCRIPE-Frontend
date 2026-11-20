"use client";

import { ArrowRight, Timer } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@core/ui/sheet";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription } from "@core/ui/alert";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import {
  useClickToBookViewModel,
  type UseClickToBookProps,
} from "../viewmodels/useClickToBookViewModel";
import { BookingStepperHeader } from "./booking-steps/BookingStepperHeader";
import { BookingContextSummary } from "./booking-steps/BookingContextSummary";
import { BookingCourtStep } from "./booking-steps/BookingCourtStep";
import { BookingCustomerStep } from "./booking-steps/BookingCustomerStep";
import { BookingPricingStep } from "./booking-steps/BookingPricingStep";
import { BookingPaymentStep } from "./booking-steps/BookingPaymentStep";

export type ClickToBookModalProps = UseClickToBookProps;

/**
 * Multi-step Click-to-Book slide-over sheet orchestrating court selection,
 * customer assignment, authoritative quote verification, and payment recording.
 */
export function ClickToBookModal(props: ClickToBookModalProps) {
  const { open, onOpenChange, resources = [], onFindSlots, onSuccess } = props;
  const vm = useClickToBookViewModel(props);
  const { t } = vm;
  const { language, direction } = useI18n();
  const isRtl =
    direction === "rtl" ||
    language === "ar" ||
    (typeof document !== "undefined" && document.documentElement.dir === "rtl");

  const paymentStepProps = {
    t,
    stage: vm.stage,
    onClose: () => onOpenChange(false),
    onSuccess,
    onFindSlots,
    selectedResource: vm.selectedResource,
    selectedCustomer: vm.selectedCustomer,
    formatDateDisplay: vm.formatDateDisplay,
    formatTimeRange: vm.formatTimeRange,
    paymentPartialFailure: vm.paymentPartialFailure,
    paymentErrorMessage: vm.paymentErrorMessage,
    quote: vm.quote,
    amountPaid: vm.amountPaid,
    remainingBalance: vm.remainingBalance,
    canRecordPayment: vm.canRecordPayment,
    recordingPaymentManual: vm.recordingPaymentManual,
    onManualRecordPayment: vm.handleManualRecordPayment,
    reservationId: vm.reservationId,
    paymentChoice: vm.paymentChoice,
    onPaymentChoiceChange: vm.setPaymentChoice,
    payNowAmount: vm.payNowAmount,
    onPayNowAmountChange: vm.setPayNowAmount,
    paymentMethod: vm.paymentMethod,
    onPaymentMethodChange: vm.setPaymentMethod,
    paymentReference: vm.paymentReference,
    onPaymentReferenceChange: vm.setPaymentReference,
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isRtl ? "left" : "right"}
        dir={isRtl ? "rtl" : "ltr"}
        className={cn(
          "flex h-full w-full flex-col overflow-y-auto border-s border-nx-line bg-nx-surface p-6 shadow-nx-modal sm:max-w-lg",
          vm.stage === "confirmed" ? "justify-start space-y-4" : "justify-between",
        )}
      >
        <SheetHeader className="border-b border-nx-line pb-3 pe-8 text-start">
          <SheetTitle className="text-base font-bold text-nx-ink">
            {t("operationsCalendar.clickToBook.title")}
          </SheetTitle>
          <SheetDescription className="text-xs text-nx-ink-2">
            {vm.selectedResource?.name
              ? `${vm.selectedResource.name}${vm.selectedResource.facilityName ? ` • ${vm.selectedResource.facilityName}` : ""}`
              : t("operationsCalendar.clickToBook.dialogDescription")}
          </SheetDescription>
        </SheetHeader>

        {vm.stage === "booking" && (
          <BookingStepperHeader isContextual={vm.isContextual} step={vm.step} t={t} />
        )}

        {vm.error && (
          <Alert variant="destructive" className="my-2 py-2">
            <AlertDescription className="text-xs">{vm.error}</AlertDescription>
          </Alert>
        )}

        {vm.stage !== "booking" ? (
          <BookingPaymentStep {...paymentStepProps} />
        ) : (
          <div className="space-y-4 py-2">
            {vm.step >= 1 && vm.selectedResource && (
              <BookingContextSummary
                resource={vm.selectedResource}
                isContextual={vm.isContextual}
                duration={vm.duration}
                dateDisplay={vm.formatDateDisplay()}
                timeRange={vm.formatTimeRange()}
                onChangeCourt={() => vm.setStep(0)}
                t={t}
              />
            )}

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

            {vm.step === 1 && (
              <BookingCustomerStep
                t={t}
                quickAddOpen={vm.quickAddOpen}
                onToggleQuickAdd={() => vm.setQuickAddOpen(!vm.quickAddOpen)}
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

                <BookingPaymentStep {...paymentStepProps} />
              </>
            )}
          </div>
        )}

        {vm.stage === "booking" && (
          <SheetFooter className="flex items-center justify-between border-t border-nx-line pt-3">
            {vm.step === 2 && vm.canCreateHold && !vm.holdExpiresAtUtc ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={vm.handleHoldTemporarily}
                disabled={vm.submitting || !vm.selectedCustomer}
                className="text-xs text-nx-ink-2"
              >
                <Timer className="me-1 size-3.5" aria-hidden="true" />
                {t("operationsCalendar.clickToBook.hold.holdAction")}
              </Button>
            ) : (
              <div />
            )}

            <div className="flex shrink-0 items-center gap-2">
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
                  variant="default"
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
                  className="text-xs font-bold"
                >
                  {vm.step === 0 && vm.step0Checking ? (
                    <span>{t("operationsCalendar.clickToBook.courtStep.checking")}</span>
                  ) : (
                    <>
                      {t("operationsCalendar.clickToBook.confirm.next")}
                      <ArrowRight className="ms-1 size-3.5 rtl:rotate-180" aria-hidden="true" />
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="default"
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
                  className="text-xs font-bold"
                >
                  {vm.submitting ? (
                    <span>{t("operationsCalendar.clickToBook.courtStep.confirming")}</span>
                  ) : (
                    t("operationsCalendar.clickToBook.confirm.action")
                  )}
                </Button>
              )}
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
