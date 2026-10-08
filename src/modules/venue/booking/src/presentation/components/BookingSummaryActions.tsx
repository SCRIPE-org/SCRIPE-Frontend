"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, CheckCircle2, Clock3, LockKeyhole, RotateCcw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import type { PriceQuote } from "@modules/venue";
import type {
  AvailabilityCandidate,
  BookingWorkspaceState,
  CustomerSummary,
} from "../../domain/entities/Booking";
import { remainingHoldSeconds } from "../viewmodels/useHoldExpiry";

interface BookingSummaryActionsProps {
  t: (key: string, values?: Record<string, string | number>) => string;
  locale: string;
  customer: CustomerSummary | null;
  state: BookingWorkspaceState;
  canHold: boolean;
  canConfirm: boolean;
  priceQuote: PriceQuote | null;
  priceQuoteLoading: boolean;
  priceQuoteError: string | null;
  canOverridePrice: boolean;
  priceOverrideLoading: boolean;
  onHold: () => Promise<void>;
  onConfirm: () => Promise<void>;
  onExpired: () => void;
  onSearchAgain: () => Promise<AvailabilityCandidate[]>;
  onCreateAnother: () => void;
  onOverridePrice: (adjustmentAmount: number, reason: string) => Promise<boolean>;
}

function formatDateTime(value: string, locale: string, timeZone: string): string {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(new Date(value));
}

function formatMoney(amount: number, currencyCode: string, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency: currencyCode }).format(
    amount
  );
}

/**
 * Documentation for BookingSummaryActions
 */
export function BookingSummaryActions({
  t,
  locale,
  customer,
  state,
  canHold,
  canConfirm,
  priceQuote,
  priceQuoteLoading,
  priceQuoteError,
  canOverridePrice,
  priceOverrideLoading,
  onHold,
  onConfirm,
  onExpired,
  onSearchAgain,
  onCreateAnother,
  onOverridePrice,
}: BookingSummaryActionsProps) {
  const candidate = state.selectedCandidate;
  const [remaining, setRemaining] = useState(() =>
    state.hold ? remainingHoldSeconds(state.hold.expiresAtUtc) : 0
  );
  const [overrideAmount, setOverrideAmount] = useState("");
  const [overrideReason, setOverrideReason] = useState("");

  useEffect(() => {
    if (!state.hold || (state.stage !== "held" && state.stage !== "confirming")) return;
    const update = () => {
      const seconds = remainingHoldSeconds(state.hold!.expiresAtUtc);
      setRemaining(seconds);
      if (seconds === 0) onExpired();
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [onExpired, state.hold, state.stage]);

  const countdown = { minutes: Math.floor(remaining / 60), seconds: remaining % 60 };

  if (state.stage === "holdConflict") {
    return (
      <Alert variant="warning">
        <AlertCircle aria-hidden="true" />
        <AlertTitle>{t("booking.hold.conflictTitle")}</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{t("booking.hold.conflictDescription")}</p>
          <Button type="button" variant="outline" onClick={() => void onSearchAgain()}>
            <RotateCcw className="size-4" aria-hidden="true" />
            {t("booking.hold.searchAgain")}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (state.stage === "holdExpired") {
    return (
      <Alert variant="warning">
        <Clock3 aria-hidden="true" />
        <AlertTitle>{t("booking.hold.expiredTitle")}</AlertTitle>
        <AlertDescription className="space-y-3">
          <p>{t("booking.hold.expiredDescription")}</p>
          <Button type="button" variant="outline" onClick={() => void onSearchAgain()}>
            <RotateCcw className="size-4" aria-hidden="true" />
            {t("booking.hold.searchAgain")}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (state.stage === "confirmed") {
    return (
      <Card className="border-nx-success/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-nx-success">
            <CheckCircle2 className="size-5" aria-hidden="true" />
            {t("booking.confirm.title")}
          </CardTitle>
          <p className="text-sm text-nx-ink-2">{t("booking.confirm.description")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <dl className="bg-nx-surface-2 grid gap-4 rounded-xl p-4 sm:grid-cols-2">
            {customer && (
              <div>
                <dt className="text-xs text-nx-ink-3">{t("booking.summary.customer")}</dt>
                <dd className="font-medium text-nx-ink">{customer.displayName}</dd>
              </div>
            )}
            {candidate && (
              <div>
                <dt className="text-xs text-nx-ink-3">{t("booking.summary.resource")}</dt>
                <dd className="font-medium text-nx-ink">{candidate.resourceName}</dd>
              </div>
            )}
            {candidate && (
              <div className="sm:col-span-2">
                <dt className="text-xs text-nx-ink-3">{t("booking.summary.dateTime")}</dt>
                <dd className="font-medium text-nx-ink">
                  {formatDateTime(candidate.startUtc, locale, candidate.timeZoneId)} â€“{" "}
                  {formatDateTime(candidate.endUtc, locale, candidate.timeZoneId)}
                </dd>
              </div>
            )}
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-wide text-nx-ink-3">
                {t("booking.summary.reference")}
              </dt>
              <dd className="mt-1 text-lg font-semibold text-nx-ink">
                {state.reservation?.reservationNumber}
              </dd>
            </div>
          </dl>
          <div className="flex flex-wrap gap-3">
            {state.reservationId && (
              <Button asChild>
                <Link href={`/venue/bookings/${encodeURIComponent(state.reservationId)}`}>
                  {t("booking.confirm.viewBooking")}
                </Link>
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onCreateAnother}>
              {t("booking.confirm.createAnother")}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!candidate || !customer) return null;

  const held = state.stage === "held" || state.stage === "confirming";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockKeyhole className="size-5 text-nx-accent" aria-hidden="true" />
          {held ? t("booking.hold.title") : t("booking.summary.title")}
        </CardTitle>
        {held && <p className="text-sm text-nx-ink-2">{t("booking.hold.description")}</p>}
      </CardHeader>
      <CardContent className="space-y-5">
        <dl className="border-nx-border grid gap-4 rounded-xl border p-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-nx-ink-3">{t("booking.summary.customer")}</dt>
            <dd className="font-medium text-nx-ink">{customer.displayName}</dd>
          </div>
          <div>
            <dt className="text-xs text-nx-ink-3">{t("booking.summary.resource")}</dt>
            <dd className="font-medium text-nx-ink">{candidate.resourceName}</dd>
          </div>
          <div>
            <dt className="text-xs text-nx-ink-3">{t("booking.summary.facility")}</dt>
            <dd className="font-medium text-nx-ink">{candidate.facilityName}</dd>
          </div>
          <div>
            <dt className="text-xs text-nx-ink-3">{t("booking.summary.quantity")}</dt>
            <dd className="font-medium text-nx-ink">{candidate.requestedQuantity}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-xs text-nx-ink-3">{t("booking.summary.dateTime")}</dt>
            <dd className="font-medium text-nx-ink">
              {formatDateTime(candidate.startUtc, locale, candidate.timeZoneId)} â€“{" "}
              {formatDateTime(candidate.endUtc, locale, candidate.timeZoneId)}
            </dd>
          </div>
          {state.reservation && (
            <div className="sm:col-span-2">
              <dt className="text-xs text-nx-ink-3">{t("booking.summary.reference")}</dt>
              <dd className="font-mono font-medium text-nx-ink">
                {state.reservation.reservationNumber}
              </dd>
            </div>
          )}
        </dl>

        {priceQuoteLoading ? (
          <Alert variant="info">
            <AlertTitle>{t("booking.quote.calculating")}</AlertTitle>
            <AlertDescription>{t("booking.quote.calculatingDescription")}</AlertDescription>
          </Alert>
        ) : priceQuote ? (
          <dl className="bg-nx-surface-2 grid gap-3 rounded-xl p-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs text-nx-ink-3">{t("booking.quote.total")}</dt>
              <dd className="font-semibold text-nx-ink">
                {formatMoney(priceQuote.grandTotal, priceQuote.currencyCode, locale)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-nx-ink-3">{t("booking.quote.expires")}</dt>
              <dd className="font-medium text-nx-ink">
                {formatDateTime(priceQuote.expiresAtUtc, locale, candidate.timeZoneId)}
              </dd>
            </div>
          </dl>
        ) : (
          <Alert variant="warning">
            <AlertTitle>{t("booking.quote.unavailable")}</AlertTitle>
            <AlertDescription>
              {priceQuoteError || t("booking.quote.unavailableDescription")}
            </AlertDescription>
          </Alert>
        )}

        {canOverridePrice && priceQuote && (
          <div className="border-nx-border space-y-3 rounded-xl border p-4">
            <p className="text-sm font-medium text-nx-ink">{t("booking.quote.overrideTitle")}</p>
            <p className="text-sm text-nx-ink-2">{t("booking.quote.overrideDescription")}</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quote-override-amount">{t("booking.quote.overrideAmount")}</Label>
                <Input
                  id="quote-override-amount"
                  type="number"
                  step="0.01"
                  value={overrideAmount}
                  disabled={priceOverrideLoading}
                  onChange={(event) => setOverrideAmount(event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quote-override-reason">{t("booking.quote.overrideReason")}</Label>
                <Input
                  id="quote-override-reason"
                  maxLength={500}
                  value={overrideReason}
                  disabled={priceOverrideLoading}
                  onChange={(event) => setOverrideReason(event.target.value)}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={
                priceOverrideLoading ||
                !Number.isFinite(Number(overrideAmount)) ||
                Number(overrideAmount) === 0 ||
                !overrideReason.trim()
              }
              onClick={() => void onOverridePrice(Number(overrideAmount), overrideReason)}
            >
              {priceOverrideLoading
                ? t("booking.quote.overriding")
                : t("booking.quote.overrideAction")}
            </Button>
          </div>
        )}

        {held && state.hold ? (
          <>
            <div className="bg-nx-warning/10 flex flex-wrap items-center justify-between gap-3 rounded-xl p-4">
              <div>
                <p className="font-medium text-nx-ink">
                  {t("booking.hold.expires", {
                    time: formatDateTime(state.hold.expiresAtUtc, locale, candidate.timeZoneId),
                  })}
                </p>
                <p className="text-sm text-nx-ink-2">{t("booking.hold.countdown", countdown)}</p>
              </div>
              <Badge variant="warning">{t("booking.hold.title")}</Badge>
            </div>
            {canConfirm ? (
              <Button
                type="button"
                disabled={
                  !priceQuote ||
                  priceQuoteLoading ||
                  state.stage === "confirming" ||
                  remaining === 0
                }
                onClick={() => void onConfirm()}
              >
                <CheckCircle2 className="size-4" aria-hidden="true" />
                {state.stage === "confirming"
                  ? t("booking.confirm.confirming")
                  : t("booking.confirm.action")}
              </Button>
            ) : (
              <Alert variant="info">
                <AlertTitle>{t("booking.confirm.noPermissionTitle")}</AlertTitle>
                <AlertDescription>{t("booking.confirm.noPermissionDescription")}</AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <Button
            type="button"
            disabled={!canHold || !priceQuote || priceQuoteLoading || state.stage === "holding"}
            onClick={() => void onHold()}
          >
            <LockKeyhole className="size-4" aria-hidden="true" />
            {state.stage === "holding" ? t("booking.hold.holding") : t("booking.hold.action")}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
