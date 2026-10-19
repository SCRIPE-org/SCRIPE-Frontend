"use client";

import React from "react";
import { AlertCircle, RotateCcw, Timer } from "lucide-react";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import type { CustomerSummary } from "@modules/venue/booking/src/domain/entities/Booking";
import type { PriceQuote } from "@modules/venue/commercial/src/domain/entities/CommercialPricing";

interface BookingPricingStepProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  selectedCustomer: CustomerSummary | null;
  onChangeCustomer: () => void;
  holdCountdown: string | null;
  holdExpired: boolean;
  onRefreshAvailability: () => void;
  priceChangeNotice: {
    oldPrice: number;
    newPrice: number;
    currency: string;
  } | null;
  onAcknowledgePriceChange: () => void;
  quoteExpiredMessage: boolean;
  quote: PriceQuote | null;
  quoteLoading: boolean;
  quoteError: string | null;
  onRetryQuote: () => void;
  canOverridePrice: boolean;
  overrideOpen: boolean;
  onToggleOverride: () => void;
  overrideAmount: string;
  onOverrideAmountChange: (val: string) => void;
  overrideReason: string;
  onOverrideReasonChange: (val: string) => void;
  overrideLoading?: boolean;
  overrideError?: string | null;
  onApplyOverride?: () => void;
}

export function BookingPricingStep({
  t,
  selectedCustomer,
  onChangeCustomer,
  holdCountdown,
  holdExpired,
  onRefreshAvailability,
  priceChangeNotice,
  onAcknowledgePriceChange,
  quoteExpiredMessage,
  quote,
  quoteLoading,
  quoteError,
  onRetryQuote,
  canOverridePrice,
  overrideOpen,
  onToggleOverride,
  overrideAmount,
  onOverrideAmountChange,
  overrideReason,
  onOverrideReasonChange,
  overrideLoading = false,
  overrideError = null,
  onApplyOverride,
}: BookingPricingStepProps) {
  return (
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
            onClick={onChangeCustomer}
            className="text-[11px] font-semibold text-nx-primary hover:underline shrink-0"
          >
            {t("operationsCalendar.clickToBook.customer.change")}
          </button>
        </div>
      )}

      {/* Hold Countdown Badge if active */}
      {holdCountdown && (
        <div className="flex items-center justify-between p-2 rounded-lg bg-nx-accent/10 border border-nx-accent/30 text-xs text-nx-accent-hi">
          <span className="flex items-center gap-1.5 font-medium">
            <Timer className="size-3.5" />
            {t("operationsCalendar.clickToBook.hold.temporaryBadge")}
          </span>
          <span className="font-mono font-bold">
            {t("operationsCalendar.clickToBook.hold.countdown", { time: holdCountdown })}
          </span>
        </div>
      )}

      {/* Hold Expired Alert */}
      {holdExpired && (
        <Alert variant="destructive" className="py-2 text-xs">
          <AlertCircle className="size-4" />
          <AlertTitle className="text-xs font-bold">
            {t("operationsCalendar.clickToBook.hold.expired")}
          </AlertTitle>
          <div className="mt-2">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-6 text-[11px] font-bold"
              onClick={onRefreshAvailability}
            >
              <RotateCcw className="size-3 me-1" />
              {t("operationsCalendar.clickToBook.hold.refreshAvailability")}
            </Button>
          </div>
        </Alert>
      )}

      {/* Price Change Acknowledgment Alert */}
      {priceChangeNotice && (
        <Alert variant="warning" className="py-2 text-xs">
          <AlertCircle className="size-4" />
          <AlertTitle className="text-xs font-bold">
            {t("operationsCalendar.clickToBook.pricing.priceChanged", {
              oldPrice: priceChangeNotice.oldPrice,
              newPrice: priceChangeNotice.newPrice,
              currency: priceChangeNotice.currency,
            })}
          </AlertTitle>
          <div className="mt-2">
            <Button
              type="button"
              size="sm"
              className="h-6 text-[11px] font-bold"
              onClick={onAcknowledgePriceChange}
            >
              {t("operationsCalendar.clickToBook.pricing.acknowledge")}
            </Button>
          </div>
        </Alert>
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
              onClick={onRetryQuote}
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
              <div className="flex items-center justify-between text-emerald-500">
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
              onClick={onToggleOverride}
              className="text-[11px] text-nx-primary hover:underline font-semibold"
            >
              {t("operationsCalendar.clickToBook.pricing.override")}
            </button>
          ) : (
            <div className="p-2.5 rounded-lg border border-nx-border bg-nx-surface space-y-2 text-xs">
              <Label className="text-xs font-bold text-nx-ink">
                {t("operationsCalendar.clickToBook.pricing.override")}
              </Label>
              {overrideError && (
                <p className="text-xs text-destructive">{overrideError}</p>
              )}
              <Input
                type="number"
                placeholder={t("operationsCalendar.clickToBook.pricing.overrideAmountPlaceholder", {
                  defaultValue: "Adjustment Amount (e.g. -20 for discount)",
                })}
                value={overrideAmount}
                disabled={overrideLoading}
                onChange={(e) => onOverrideAmountChange(e.target.value)}
                className="h-7 text-xs"
              />
              <Input
                placeholder={t("operationsCalendar.clickToBook.pricing.overrideReason")}
                value={overrideReason}
                disabled={overrideLoading}
                maxLength={500}
                onChange={(e) => onOverrideReasonChange(e.target.value)}
                className="h-7 text-xs"
              />
              <div className="flex items-center gap-2 pt-1">
                <Button
                  type="button"
                  size="sm"
                  disabled={
                    overrideLoading ||
                    !Number.isFinite(Number(overrideAmount)) ||
                    Number(overrideAmount) === 0 ||
                    !overrideReason.trim()
                  }
                  onClick={onApplyOverride}
                  className="h-7 text-xs font-semibold"
                >
                  {overrideLoading ? (
                    <>
                      <LoadingSpinner size="sm" className="me-1" />
                      <span>{t("operationsCalendar.clickToBook.pricing.overriding", { defaultValue: "Applying..." })}</span>
                    </>
                  ) : (
                    t("operationsCalendar.clickToBook.pricing.applyOverride", { defaultValue: "Apply Override" })
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={overrideLoading}
                  onClick={onToggleOverride}
                  className="h-7 text-xs"
                >
                  {t("common.cancel", { defaultValue: "Cancel" })}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
