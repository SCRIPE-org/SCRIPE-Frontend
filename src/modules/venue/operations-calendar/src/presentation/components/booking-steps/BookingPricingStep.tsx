"use client";

import { AlertCircle, RotateCcw, Timer } from "lucide-react";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Button } from "@core/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import type { CustomerSummary, PriceQuote } from "@modules/venue";

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

/**
 * Step 2 authoritative price breakdown, temporary hold countdown, and manager override panel.
 */
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
      {selectedCustomer && (
        <div className="flex items-center justify-between rounded-nx-lg border border-nx-line bg-nx-raised/30 p-2.5 text-xs">
          <div className="flex min-w-0 items-center gap-2">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-nx-accent-fill text-xs font-bold text-nx-on-fill">
              {selectedCustomer.displayName.charAt(0)}
            </div>
            <div className="min-w-0">
              <p className="truncate font-semibold text-nx-ink">{selectedCustomer.displayName}</p>
              {selectedCustomer.type && (
                <p className="truncate text-[10px] text-nx-ink-3">{selectedCustomer.type}</p>
              )}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onChangeCustomer}
            className="h-auto shrink-0 px-0 text-[11px] font-semibold text-nx-accent hover:underline"
          >
            {t("operationsCalendar.clickToBook.customer.change")}
          </Button>
        </div>
      )}

      {holdCountdown && (
        <div className="flex items-center justify-between rounded-nx-control border border-nx-accent/40 bg-nx-accent-wash p-2 text-xs text-nx-accent">
          <span className="flex items-center gap-1.5 font-medium">
            <Timer className="size-3.5" aria-hidden="true" />
            {t("operationsCalendar.clickToBook.hold.temporaryBadge")}
          </span>
          <span className="font-mono font-bold">
            {t("operationsCalendar.clickToBook.hold.countdown", { time: holdCountdown })}
          </span>
        </div>
      )}

      {holdExpired && (
        <Alert variant="destructive" className="py-2 text-xs">
          <AlertCircle className="size-4" aria-hidden="true" />
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
              <RotateCcw className="me-1 size-3" aria-hidden="true" />
              {t("operationsCalendar.clickToBook.hold.refreshAvailability")}
            </Button>
          </div>
        </Alert>
      )}

      {priceChangeNotice && (
        <Alert variant="warning" className="py-2 text-xs">
          <AlertCircle className="size-4" aria-hidden="true" />
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

      {quoteExpiredMessage && (
        <Alert variant="warning" className="py-1 text-xs">
          <AlertDescription>{t("operationsCalendar.clickToBook.pricing.expired")}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2 rounded-nx-lg border border-nx-line bg-nx-raised/40 p-3.5">
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
              <RotateCcw className="me-1 size-3" aria-hidden="true" />
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
              <div className="flex items-center justify-between text-success">
                <span>{t("operationsCalendar.clickToBook.pricing.discount")}</span>
                <span>
                  -{quote.discountAmount} {quote.currencyCode}
                </span>
              </div>
            )}

            {quote.taxAmount > 0 && (
              <div className="flex items-center justify-between text-nx-ink-2">
                <span>{t("operationsCalendar.clickToBook.pricing.tax")}</span>
                <span>
                  +{quote.taxAmount} {quote.currencyCode}
                </span>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-nx-line pt-1.5 text-sm font-bold text-nx-ink">
              <span>{t("operationsCalendar.clickToBook.pricing.total")}</span>
              <span>
                {quote.grandTotal} {quote.currencyCode}
              </span>
            </div>
          </div>
        ) : null}
      </div>

      {canOverridePrice && quote && (
        <div className="pt-1">
          {!overrideOpen ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onToggleOverride}
              className="h-auto px-0 text-[11px] font-semibold text-nx-accent hover:underline"
            >
              {t("operationsCalendar.clickToBook.pricing.override")}
            </Button>
          ) : (
            <div className="space-y-2 rounded-nx-md border border-nx-line bg-nx-surface p-2.5 text-xs">
              <Label className="text-xs font-bold text-nx-ink">
                {t("operationsCalendar.clickToBook.pricing.override")}
              </Label>
              {overrideError && <p className="text-xs text-destructive">{overrideError}</p>}
              <Input
                type="number"
                placeholder={t("operationsCalendar.clickToBook.pricing.overrideAmountPlaceholder")}
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
                  variant="default"
                  size="sm"
                  loading={overrideLoading}
                  disabled={
                    overrideLoading ||
                    !Number.isFinite(Number(overrideAmount)) ||
                    Number(overrideAmount) === 0 ||
                    !overrideReason.trim()
                  }
                  onClick={onApplyOverride}
                  className="h-7 text-xs font-semibold"
                >
                  {overrideLoading
                    ? t("operationsCalendar.clickToBook.pricing.overriding")
                    : t("operationsCalendar.clickToBook.pricing.applyOverride")}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={overrideLoading}
                  onClick={onToggleOverride}
                  className="h-7 text-xs"
                >
                  {t("operationsCalendar.clickToBook.confirm.cancel")}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
