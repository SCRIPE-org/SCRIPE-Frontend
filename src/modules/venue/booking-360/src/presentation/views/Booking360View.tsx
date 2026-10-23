"use client";

import React from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CalendarClock,
  Clock,
  Lock,
  RefreshCw,
  UserRound,
} from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { BookingHoldState } from "../components/BookingHoldState";
import { BookingLifecycleTimeline } from "../components/BookingLifecycleTimeline";
import { BookingOperationalActions } from "../components/BookingOperationalActions";
import { useBookingFinanceSummary } from "../viewmodels/useBookingFinanceSummary";
import { useBooking360ViewModel } from "../viewmodels/useBooking360ViewModel";

function formatRange(start: string, end: string, locale: string, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  });
  return `${formatter.format(new Date(start))} – ${formatter.format(new Date(end))}`;
}

/**
 * Documentation for module export
 */
export const Booking360View = React.memo(function Booking360View({
  reservationId,
}: {
  reservationId: string;
}) {
  useModuleLocales(() => import("../../../locales"), "venue.booking360");
  const { t, language, direction } = useI18n();
  const canViewReservation = usePermission(VENUE_PERMISSIONS.RESERVATION_VIEW);
  const canConfirm = usePermission(VENUE_PERMISSIONS.RESERVATION_CONFIRM);
  const canCheckIn = usePermission(VENUE_PERMISSIONS.RESERVATION_CHECK_IN);
  const canComplete = usePermission(VENUE_PERMISSIONS.RESERVATION_COMPLETE);
  const canMarkNoShow = usePermission(VENUE_PERMISSIONS.RESERVATION_NO_SHOW);
  const canCancel = usePermission(VENUE_PERMISSIONS.RESERVATION_CANCEL);
  const canReschedule = usePermission(VENUE_PERMISSIONS.RESERVATION_RESCHEDULE);
  const canChangeResource = usePermission(VENUE_PERMISSIONS.RESERVATION_CHANGE_RESOURCE);
  const canViewCustomer = usePermission(VENUE_PERMISSIONS.CUSTOMER_PARTY_VIEW);
  const canViewResource = usePermission(VENUE_PERMISSIONS.SCHEDULABLE_RESOURCE_VIEW);
  const canViewProfile = usePermission(VENUE_PERMISSIONS.FACILITY_RESOURCE_PROFILE_VIEW);
  const canViewFacility = usePermission(VENUE_PERMISSIONS.FACILITY_VIEW);
  const canViewCommercials = usePermission(VENUE_PERMISSIONS.CATALOG_PRICING_VIEW_COMMERCIALS);
  const canCalculateQuote = usePermission(VENUE_PERMISSIONS.CATALOG_PRICING_CALCULATE_QUOTE);
  const canViewReceivables = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW);
  const canRecordPayment = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_CREATE);
  const vm = useBooking360ViewModel(
    reservationId,
    canViewReservation,
    canViewCustomer,
    canViewResource,
    canViewProfile,
    canViewFacility
  );
  const finance = useBookingFinanceSummary(reservationId, canViewReservation && canViewReceivables);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const focusedReservationId = React.useRef<string | null>(null);

  // Focus the canonical identity once per opened booking without racing operational focus.
  const activeReservationId = vm.state.reservation?.id;
  const stage = vm.state.stage;
  React.useEffect(() => {
    if (
      stage === "ready" &&
      activeReservationId &&
      focusedReservationId.current !== activeReservationId
    ) {
      focusedReservationId.current = activeReservationId;
      headingRef.current?.focus();
    }
  }, [activeReservationId, stage]);

  if (!canViewReservation)
    return (
      <EmptyState
        icon={Lock}
        title={t("booking360.permission.title")}
        description={t("booking360.permission.description")}
      />
    );
  if (vm.state.stage === "loading" && !vm.state.reservation)
    return <LoadingSpinner showText={false} />;
  if (vm.state.stage === "notFound")
    return (
      <EmptyState
        icon={AlertCircle}
        title={t("booking360.notFound.title")}
        description={t("booking360.notFound.description")}
      />
    );
  if (vm.state.stage === "featureUnavailable")
    return (
      <EmptyState
        icon={Lock}
        title={t("booking360.feature.title")}
        description={t("booking360.feature.description")}
      />
    );
  if (vm.state.stage === "error" || !vm.state.reservation)
    return (
      <EmptyState
        icon={AlertCircle}
        title={t("booking360.error.title")}
        description={t("booking360.error.description")}
        action={
          <Button variant="outline" onClick={() => void vm.refresh()}>
            {t("booking360.error.retry")}
          </Button>
        }
      />
    );

  const reservation = vm.state.reservation;
  const timeZoneId = vm.state.profile?.timeZoneId ?? "UTC";
  const isTerminal = [
    "Completed",
    "PartiallyFulfilled",
    "Cancelled",
    "Rejected",
    "Expired",
  ].includes(reservation.status);
  const showConfirm =
    vm.state.stage === "ready" &&
    reservation.status === "Held" &&
    reservation.activeHold &&
    canConfirm &&
    canViewCommercials &&
    canCalculateQuote;
  const canReprice = !reservation.priceSnapshotId || (canViewCommercials && canCalculateQuote);

  return (
    <div className="space-y-6" dir={direction} data-testid="booking-360">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/venue/calendar">
          <ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />
          {t("booking360.backToCalendar")}
        </Link>
      </Button>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-nx-line pb-5">
        <div>
          <p className="text-sm font-medium text-nx-ink-2">{t("booking360.eyebrow")}</p>
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-1 text-2xl font-semibold text-nx-ink outline-none focus-visible:shadow-nx-focus"
            dir="ltr"
          >
            {reservation.reservationNumber}
          </h1>
          <p className="mt-2 text-sm text-nx-ink-2">
            {vm.state.resource?.name ??
              t(
                canViewResource
                  ? "booking360.resource.unavailable"
                  : "booking360.resource.restricted"
              )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{t(`booking360.status.${reservation.status}`)}</Badge>
          {isTerminal && (
            <span className="text-sm text-nx-ink-2">{t("booking360.status.terminal")}</span>
          )}
          <Button variant="outline" size="sm" onClick={() => void vm.refresh()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            {t("booking360.refresh")}
          </Button>
        </div>
      </header>

      {/* Authoritative Financial Advisory when Cancelled but Money was Recorded */}
      {reservation.status === "Cancelled" && finance.summary && finance.summary.paidAmount > 0 && (
        <Alert
          variant="warning"
          className="border-warning/30 bg-warning/10"
          data-testid="cancelled-paid-advisory"
        >
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-warning">
                {t("booking360.cancelledPaid.title")}
              </p>
              <p className="mt-1 text-xs text-nx-ink-2">
                {t("booking360.cancelledPaid.description", {
                  amount: new Intl.NumberFormat(language, {
                    style: "currency",
                    currency: finance.summary.currencyCode,
                  }).format(finance.summary.paidAmount),
                })}
              </p>
            </div>
            {canRecordPayment && finance.summary.invoiceId && (
              <Button
                asChild
                size="sm"
                variant="outline"
                className="shrink-0 border-warning/30 text-warning hover:bg-warning/20"
              >
                <Link
                  href={`/venue/money/payments?invoiceId=${encodeURIComponent(finance.summary.invoiceId)}`}
                >
                  {t("booking360.cancelledPaid.manageRefund")}
                </Link>
              </Button>
            )}
          </div>
        </Alert>
      )}

      {/* Top Prominent Operational Action Banner (Check In, Complete, No Show, Reschedule, Change Court) */}
      <BookingOperationalActions
        status={reservation.status as never}
        activeAction={vm.state.activeAction}
        feedback={vm.state.operationalFeedback}
        canCheckIn={canCheckIn}
        canComplete={canComplete}
        canMarkNoShow={canMarkNoShow}
        canCancel={canCancel}
        canReschedule={canReschedule && canReprice}
        canChangeResource={canChangeResource && canReprice}
        direction={direction}
        bookingReference={reservation.reservationNumber}
        customerName={vm.state.customer?.displayName}
        resourceId={reservation.resourceId}
        resourceName={vm.state.resource?.name}
        facilityId={vm.state.facility?.id}
        facilityName={vm.state.facility?.name}
        timeZoneId={timeZoneId}
        quantity={reservation.quantity}
        scheduledTime={formatRange(
          reservation.requestedStartUtc,
          reservation.requestedEndUtc,
          language,
          timeZoneId
        )}
        currentStartUtc={reservation.requestedStartUtc}
        currentEndUtc={reservation.requestedEndUtc}
        t={t}
        onCheckIn={() => void vm.checkIn()}
        onComplete={() => void vm.complete()}
        onMarkNoShow={(reason) => void vm.markNoShow(reason)}
        onCancel={(reason) => void vm.cancel(reason)}
        onReschedule={(input) => void vm.reschedule(input)}
        onChangeResource={(input) => void vm.changeResource(input)}
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="size-5 text-nx-accent" aria-hidden="true" />
                {t("booking360.schedule.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-sm text-nx-ink-2">{t("booking360.schedule.resource")}</dt>
                  <dd className="flex items-center gap-2 font-medium">
                    <span>
                      {vm.state.resource?.name ??
                        t(
                          canViewResource
                            ? "booking360.resource.unavailable"
                            : "booking360.resource.restricted"
                        )}
                    </span>
                    {vm.state.resource && canViewResource && (
                      <Link
                        href={`/venue/resources/${encodeURIComponent(reservation.resourceId)}`}
                        className="inline-flex items-center text-xs text-nx-accent hover:underline"
                      >
                        ({t("booking360.schedule.viewCourt")})
                      </Link>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-nx-ink-2">{t("booking360.schedule.facility")}</dt>
                  <dd className="font-medium">
                    {vm.state.facility?.name ??
                      t(
                        canViewProfile && canViewFacility
                          ? "booking360.facility.unavailable"
                          : "booking360.facility.restricted"
                      )}
                  </dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-sm text-nx-ink-2">{t("booking360.schedule.time")}</dt>
                  <dd className="flex items-center gap-2 font-medium tabular-nums">
                    <span>
                      {formatRange(
                        reservation.requestedStartUtc,
                        reservation.requestedEndUtc,
                        language,
                        timeZoneId
                      )}
                    </span>
                    {canViewResource && (
                      <Link
                        href={`/venue/calendar?resourceId=${encodeURIComponent(reservation.resourceId)}`}
                        className="inline-flex items-center text-xs text-nx-accent hover:underline"
                      >
                        ({t("booking360.schedule.viewInCalendar")})
                      </Link>
                    )}
                  </dd>
                  <p className="text-xs text-nx-ink-3" dir="ltr">
                    {timeZoneId}
                  </p>
                </div>
                <div>
                  <dt className="text-sm text-nx-ink-2">{t("booking360.schedule.quantity")}</dt>
                  <dd className="font-medium tabular-nums">{reservation.quantity}</dd>
                </div>
                {vm.state.profile && (
                  <div>
                    <dt className="text-sm text-nx-ink-2">{t("booking360.schedule.profile")}</dt>
                    <dd className="font-medium">{vm.state.profile.name}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          {/* Simplified Money Card: Total, Paid, Remaining */}
          <Card>
            <CardHeader>
              <CardTitle>
                {t("booking360.commercial.title", { defaultValue: "Money & Payment" })}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!canViewReceivables ? (
                <Alert variant="info">
                  <AlertDescription>{t("booking360.commercial.restricted")}</AlertDescription>
                </Alert>
              ) : finance.loading ? (
                <LoadingSpinner showText={false} />
              ) : finance.error ? (
                <Alert variant="warning">
                  <AlertDescription>{t("booking360.commercial.unavailable")}</AlertDescription>
                </Alert>
              ) : finance.summary ? (
                <>
                  {finance.summary.allocationState === "PendingAllocation" && (
                    <Alert
                      variant="warning"
                      className="border-warning/30 bg-warning/10 py-2 text-warning"
                    >
                      <div className="flex items-center gap-2">
                        <AlertCircle className="size-4 shrink-0 text-warning" />
                        <AlertDescription className="text-xs">
                          {t("booking360.commercial.pendingAllocationNotice", {
                            amount: new Intl.NumberFormat(language, {
                              style: "currency",
                              currency: finance.summary.currencyCode,
                            }).format(finance.summary.unallocatedPaymentAmount),
                            invoiceNumber: finance.summary.invoiceNumber,
                          })}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                  {finance.summary.allocationState === "PendingSynchronization" && (
                    <Alert
                      variant="info"
                      className="border-info/30 bg-info/10 py-2 text-info"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 shrink-0 text-info" />
                        <AlertDescription className="text-xs">
                          {t("booking360.commercial.pendingSyncNotice")}
                        </AlertDescription>
                      </div>
                    </Alert>
                  )}
                  <div className="border-nx-line/50 flex items-center justify-between border-b pb-1 text-xs text-nx-ink-2">
                    <span>
                      {t("booking360.commercial.invoice")}:{" "}
                      <strong className="font-mono text-nx-ink" dir="ltr">
                        {finance.summary.invoiceNumber}
                      </strong>
                    </span>
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                        finance.summary.status === "Paid"
                          ? "border border-success/20 bg-success/10 text-success"
                          : finance.summary.status === "PartiallyPaid"
                            ? "border border-warning/20 bg-warning/10 text-warning"
                            : "bg-nx-raised text-nx-ink-2"
                      }`}
                    >
                      {finance.summary.status}
                    </span>
                  </div>
                  <div className="bg-nx-surfaceSubtle border-nx-line/60 grid gap-4 rounded-nx-md border p-3 text-center sm:grid-cols-3">
                    <div>
                      <p className="text-xs font-semibold uppercase text-nx-ink-3">
                        {t("booking360.commercial.total")}
                      </p>
                      <p className="mt-0.5 text-base font-bold text-nx-ink">
                        {new Intl.NumberFormat(language, {
                          style: "currency",
                          currency: finance.summary.currencyCode,
                        }).format(finance.summary.effectiveTotalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-nx-ink-3">
                        {t("booking360.commercial.paid")}
                      </p>
                      <p className="mt-0.5 text-base font-bold text-success">
                        {new Intl.NumberFormat(language, {
                          style: "currency",
                          currency: finance.summary.currencyCode,
                        }).format(finance.summary.paidAmount)}
                      </p>
                      {finance.summary.unallocatedPaymentAmount > 0 && (
                        <p className="mt-0.5 text-[10px] font-medium text-warning">
                          +{" "}
                          {new Intl.NumberFormat(language, {
                            style: "currency",
                            currency: finance.summary.currencyCode,
                          }).format(finance.summary.unallocatedPaymentAmount)}{" "}
                          {t("booking360.commercial.unallocated")}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase text-nx-ink-3">
                        {t("booking360.commercial.outstanding")}
                      </p>
                      <p
                        className={`mt-0.5 text-base font-bold ${finance.summary.outstandingAmount > 0 ? "text-warning" : "text-nx-ink-3"}`}
                      >
                        {new Intl.NumberFormat(language, {
                          style: "currency",
                          currency: finance.summary.currencyCode,
                        }).format(finance.summary.outstandingAmount)}
                      </p>
                    </div>
                  </div>
                  {finance.summary.payments && finance.summary.payments.length > 0 && (
                    <div className="border-nx-line/40 space-y-1.5 border-t pt-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-3">
                        {t("booking360.commercial.recordedPayments")}
                      </p>
                      <div className="space-y-1">
                        {finance.summary.payments.map((p) => (
                          <div
                            key={p.id}
                            className="bg-nx-surfaceSubtle/60 border-nx-line/30 flex items-center justify-between rounded-md border px-2.5 py-1.5 text-xs text-nx-ink-2"
                          >
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-nx-ink">
                                {p.method} •{" "}
                                <span className="font-mono text-[11px] text-nx-ink-3" dir="ltr">
                                  {p.paymentNumber}
                                </span>
                              </span>
                              {p.externalReference && (
                                <span className="text-[10px] text-nx-ink-3">
                                  ({p.externalReference})
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2">
                              {p.status === "Refunded" ? (
                                <span className="rounded bg-destructive/15 px-1.5 py-0.5 text-[10px] font-semibold text-destructive">
                                  {t("booking360.commercial.refunded")}
                                </span>
                              ) : p.unallocatedAmount > 0 ? (
                                <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[10px] font-semibold text-warning">
                                  {t("booking360.commercial.unallocated")}
                                </span>
                              ) : (
                                <span className="rounded bg-success/15 px-1.5 py-0.5 text-[10px] font-semibold text-success">
                                  {t("booking360.commercial.allocated")}
                                </span>
                              )}
                              <span
                                className={`font-bold ${p.status === "Refunded" ? "text-destructive line-through" : "text-success"}`}
                              >
                                {new Intl.NumberFormat(language, {
                                  style: "currency",
                                  currency: finance.summary?.currencyCode || "EGP",
                                }).format(p.amount)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <Link
                      href="/venue/money/receivables"
                      className="inline-flex items-center gap-1 text-xs font-medium text-nx-accent hover:underline"
                    >
                      {t("booking360.commercial.viewReceivables")}
                    </Link>
                    {canRecordPayment &&
                    finance.summary.outstandingAmount > 0 &&
                    finance.summary.invoiceId ? (
                      <Link
                        href={`/venue/money/payments?invoiceId=${encodeURIComponent(finance.summary.invoiceId)}`}
                        className="inline-flex items-center justify-center gap-1.5 rounded-nx-md border border-nx-accent bg-nx-accent px-3 py-1.5 text-xs font-bold text-nx-on-fill shadow-sm transition-opacity hover:opacity-90"
                      >
                        {t("booking360.commercial.recordPayment")}
                      </Link>
                    ) : null}
                  </div>
                </>
              ) : (
                <p className="text-sm text-nx-ink-2">{t("booking360.commercial.invoicePending")}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserRound className="size-5 text-nx-accent" aria-hidden="true" />
                {t("booking360.customer.title")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vm.state.enrichmentLoading && !vm.state.customer ? (
                <LoadingSpinner showText={false} />
              ) : vm.state.customer ? (
                <div className="flex items-center justify-between">
                  <p className="font-medium">{vm.state.customer.displayName}</p>
                  {canViewCustomer && reservation.customerPartyId && (
                    <Link
                      href={`/venue/customers?partyId=${encodeURIComponent(reservation.customerPartyId)}`}
                      className="text-xs text-nx-accent hover:underline"
                    >
                      {t("booking360.customer.viewCustomer")}
                    </Link>
                  )}
                </div>
              ) : (
                <Alert variant="info">
                  <AlertDescription>
                    {canViewCustomer
                      ? t("booking360.customer.unavailable")
                      : t("booking360.customer.restricted")}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {(reservation.status === "Held" || reservation.activeHold) && (
            <Card>
              <CardHeader>
                <CardTitle>{t("booking360.hold.title")}</CardTitle>
              </CardHeader>
              <CardContent>
                {reservation.activeHold ? (
                  <BookingHoldState
                    expiresAtUtc={reservation.activeHold.expiresAtUtc}
                    asOfUtc={reservation.asOfUtc}
                    locale={language}
                    timeZoneId={timeZoneId}
                    confirming={vm.state.activeAction === "confirm"}
                    canConfirm={Boolean(showConfirm)}
                    actionError={vm.state.actionError}
                    t={t}
                    onConfirm={() => void vm.confirm()}
                    onExpired={() => void vm.holdExpired()}
                  />
                ) : (
                  <Alert variant="warning">
                    <AlertDescription>{t("booking360.hold.none")}</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t("booking360.history.title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {reservation.history.length ? (
              <BookingLifecycleTimeline
                items={reservation.history}
                locale={language}
                timeZoneId={timeZoneId}
                t={t}
              />
            ) : (
              <p className="text-sm text-nx-ink-2">{t("booking360.history.empty")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
});
