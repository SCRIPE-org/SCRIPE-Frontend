"use client";

import React from "react";
import Link from "next/link";
import { AlertCircle, ArrowLeft, CalendarClock, CreditCard, Lock, RefreshCw, UserRound } from "lucide-react";
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
import { BookingGuestAccessCard } from "../components/BookingGuestAccessCard";
import { useBookingFinanceSummary } from "../viewmodels/useBookingFinanceSummary";
import { useBooking360ViewModel } from "../viewmodels/useBooking360ViewModel";

function formatRange(start: string, end: string, locale: string, timeZone: string): string {
  const formatter = new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short", timeZone });
  return `${formatter.format(new Date(start))} – ${formatter.format(new Date(end))}`;
}

export const Booking360View = React.memo(function Booking360View({ reservationId }: { reservationId: string }) {
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
  const vm = useBooking360ViewModel(reservationId, canViewReservation, canViewCustomer, canViewResource, canViewProfile, canViewFacility);
  const finance = useBookingFinanceSummary(reservationId, canViewReservation && canViewReceivables);
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const focusedReservationId = React.useRef<string | null>(null);

  // Focus the canonical identity once per opened booking without racing operational focus.
  const activeReservationId = vm.state.reservation?.id;
  const stage = vm.state.stage;
  React.useEffect(() => {
    if (stage === "ready" && activeReservationId && focusedReservationId.current !== activeReservationId) {
      focusedReservationId.current = activeReservationId;
      headingRef.current?.focus();
    }
  }, [activeReservationId, stage]);

  if (!canViewReservation) return <EmptyState icon={Lock} title={t("booking360.permission.title")} description={t("booking360.permission.description")} />;
  if (vm.state.stage === "loading" && !vm.state.reservation) return <LoadingSpinner showText={false} />;
  if (vm.state.stage === "notFound") return <EmptyState icon={AlertCircle} title={t("booking360.notFound.title")} description={t("booking360.notFound.description")} />;
  if (vm.state.stage === "featureUnavailable") return <EmptyState icon={Lock} title={t("booking360.feature.title")} description={t("booking360.feature.description")} />;
  if (vm.state.stage === "error" || !vm.state.reservation) return <EmptyState icon={AlertCircle} title={t("booking360.error.title")} description={t("booking360.error.description")} action={<Button variant="outline" onClick={() => void vm.refresh()}>{t("booking360.error.retry")}</Button>} />;

  const reservation = vm.state.reservation;
  const timeZoneId = vm.state.profile?.timeZoneId ?? "UTC";
  const isTerminal = ["Completed", "PartiallyFulfilled", "Cancelled", "Rejected", "Expired"].includes(reservation.status);
  const showConfirm = vm.state.stage === "ready" && reservation.status === "Held" &&
    reservation.activeHold && canConfirm && canViewCommercials && canCalculateQuote;
  const canReprice = !reservation.priceSnapshotId || (canViewCommercials && canCalculateQuote);

  return (
    <div className="space-y-6" dir={direction} data-testid="booking-360">
      <Button variant="ghost" size="sm" asChild><Link href="/venue/calendar"><ArrowLeft className="size-4 rtl:rotate-180" aria-hidden="true" />{t("booking360.backToCalendar")}</Link></Button>
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-nx-line pb-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">{t("booking360.eyebrow")}</p>
          <div className="flex items-center gap-3">
            <h1 ref={headingRef} tabIndex={-1} className="text-2xl font-bold text-nx-ink outline-none focus-visible:shadow-nx-focus tabular-nums" dir="ltr">{reservation.reservationNumber}</h1>
            <Badge variant="outline" className="font-semibold text-xs">{t(`booking360.status.${reservation.status}`)}</Badge>
            {isTerminal && <span className="text-xs text-nx-ink-3 font-medium">({t("booking360.status.terminal")})</span>}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-nx-ink-2 pt-0.5">
            <span className="font-semibold text-nx-ink">{vm.state.customer?.displayName ?? t("booking360.customer.unspecified")}</span>
            <span className="text-nx-line" aria-hidden="true">·</span>
            <span>{vm.state.resource?.name ?? t("booking360.resource.unavailable")}</span>
            {vm.state.facility?.name && (
              <>
                <span className="text-nx-line" aria-hidden="true">·</span>
                <span>{vm.state.facility.name}</span>
              </>
            )}
            <span className="text-nx-line" aria-hidden="true">·</span>
            <span className="tabular-nums font-medium">{formatRange(reservation.requestedStartUtc, reservation.requestedEndUtc, language, timeZoneId)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void vm.refresh()}><RefreshCw className="size-4" aria-hidden="true" />{t("booking360.refresh")}</Button>
        </div>
      </header>

      {/* Authoritative Financial Advisory when Cancelled but Money was Recorded */}
      {reservation.status === "Cancelled" && finance.summary && (finance.summary.paidAmount > 0 || (finance.summary.effectiveTotalAmount - finance.summary.outstandingAmount) > 0) && (
        <Alert variant="warning" className="border-amber-400 bg-amber-50 dark:bg-amber-950/30" data-testid="cancelled-paid-advisory">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 w-full">
            <div>
              <p className="font-semibold text-amber-900 dark:text-amber-200">
                {t("booking360.cancelledPaid.title")}
              </p>
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                {t("booking360.cancelledPaid.description", {
                  amount: new Intl.NumberFormat(language, { style: "currency", currency: finance.summary.currencyCode }).format(
                    finance.summary.paidAmount || (finance.summary.effectiveTotalAmount - finance.summary.outstandingAmount)
                  ),
                })}
              </p>
            </div>
            {canRecordPayment && finance.summary.invoiceId && (
              <Button asChild size="sm" variant="outline" className="border-amber-500 text-amber-900 dark:text-amber-100 hover:bg-amber-100 dark:hover:bg-amber-900/40 shrink-0">
                <Link href={`/venue/money/payments?invoiceId=${encodeURIComponent(finance.summary.invoiceId)}`}>
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
        scheduledTime={formatRange(reservation.requestedStartUtc, reservation.requestedEndUtc, language, timeZoneId)}
        currentStartUtc={reservation.requestedStartUtc}
        currentEndUtc={reservation.requestedEndUtc}
        currentTotal={finance.summary?.effectiveTotalAmount}
        currencyCode={finance.summary?.currencyCode}
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
            <CardHeader><CardTitle className="flex items-center gap-2"><CalendarClock className="size-5 text-nx-accent" aria-hidden="true" />{t("booking360.schedule.title")}</CardTitle></CardHeader>
            <CardContent><dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-nx-ink-2">{t("booking360.schedule.resource")}</dt>
                <dd className="font-medium flex items-center gap-2">
                  <span>{vm.state.resource?.name ?? t(canViewResource ? "booking360.resource.unavailable" : "booking360.resource.restricted")}</span>
                  {vm.state.resource && canViewResource && (
                    <Link
                      href={`/venue/resources/${encodeURIComponent(reservation.resourceId)}`}
                      className="text-xs text-nx-accent hover:underline inline-flex items-center"
                    >
                      ({t("booking360.schedule.viewCourt")})
                    </Link>
                  )}
                </dd>
              </div>
              <div><dt className="text-sm text-nx-ink-2">{t("booking360.schedule.facility")}</dt><dd className="font-medium">{vm.state.facility?.name ?? t(canViewProfile && canViewFacility ? "booking360.facility.unavailable" : "booking360.facility.restricted")}</dd></div>
              <div className="sm:col-span-2">
                <dt className="text-sm text-nx-ink-2">{t("booking360.schedule.time")}</dt>
                <dd className="font-medium tabular-nums flex items-center gap-2">
                  <span>{formatRange(reservation.requestedStartUtc, reservation.requestedEndUtc, language, timeZoneId)}</span>
                  <Link
                    href={`/venue/calendar?resourceId=${encodeURIComponent(reservation.resourceId)}`}
                    className="text-xs text-nx-accent hover:underline inline-flex items-center"
                  >
                    ({t("booking360.schedule.viewInCalendar")})
                  </Link>
                </dd>
                <p className="text-xs text-nx-ink-3" dir="ltr">{timeZoneId}</p>
              </div>
              <div><dt className="text-sm text-nx-ink-2">{t("booking360.schedule.quantity")}</dt><dd className="font-medium tabular-nums">{reservation.quantity}</dd></div>
              {vm.state.profile && <div><dt className="text-sm text-nx-ink-2">{t("booking360.schedule.profile")}</dt><dd className="font-medium">{vm.state.profile.name}</dd></div>}
            </dl></CardContent>
          </Card>

          {/* Simplified Money Card: Total, Paid, Remaining */}
          <Card>
            <CardHeader><CardTitle>{t("booking360.commercial.title", { defaultValue: "Money & Payment" })}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {!canViewReceivables ? (
                <Alert variant="info"><AlertDescription>{t("booking360.commercial.restricted")}</AlertDescription></Alert>
              ) : finance.loading ? <LoadingSpinner showText={false} /> : finance.error ? (
                <Alert variant="warning"><AlertDescription>{t("booking360.commercial.unavailable")}</AlertDescription></Alert>
              ) : finance.summary ? (
                <>
                  <div className="flex items-center justify-between text-xs text-nx-ink-2 pb-1 border-b border-nx-line/50">
                    <span>{t("booking360.commercial.invoice")}: <strong className="font-mono text-nx-ink" dir="ltr">{finance.summary.invoiceNumber}</strong></span>
                    <span className="text-[11px] text-nx-ink-3">{finance.summary.status}</span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3 p-3 rounded-nx-md bg-nx-surfaceSubtle border border-nx-line/60 text-center">
                    <div>
                      <p className="text-xs text-nx-ink-3 font-semibold uppercase">{t("booking360.commercial.total")}</p>
                      <p className="text-base font-bold text-nx-ink mt-0.5">
                        {new Intl.NumberFormat(language, { style: "currency", currency: finance.summary.currencyCode }).format(finance.summary.effectiveTotalAmount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-nx-ink-3 font-semibold uppercase">{t("booking360.commercial.paid")}</p>
                      <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                        {new Intl.NumberFormat(language, { style: "currency", currency: finance.summary.currencyCode }).format(
                          finance.summary.paidAmount ?? Math.max(0, finance.summary.effectiveTotalAmount - finance.summary.outstandingAmount)
                        )}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-nx-ink-3 font-semibold uppercase">{t("booking360.commercial.outstanding")}</p>
                      <p className={`text-base font-bold mt-0.5 ${finance.summary.outstandingAmount > 0 ? "text-amber-600" : "text-nx-ink-3"}`}>
                        {new Intl.NumberFormat(language, { style: "currency", currency: finance.summary.currencyCode }).format(finance.summary.outstandingAmount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                    <Link
                      href="/venue/money/receivables"
                      className="text-xs font-medium text-nx-accent hover:underline inline-flex items-center gap-1"
                    >
                      {t("booking360.commercial.viewReceivables")}
                    </Link>
                    {canRecordPayment && finance.summary.outstandingAmount > 0 && finance.summary.invoiceId ? (
                      <Link
                        href={`/venue/money/payments?invoiceId=${encodeURIComponent(finance.summary.invoiceId)}`}
                        className="inline-flex items-center justify-center rounded-nx-md border border-nx-accent bg-nx-accent px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:opacity-90 transition-opacity gap-1.5"
                      >
                        {t("booking360.commercial.recordPayment")}
                      </Link>
                    ) : null}
                  </div>
                </>
              ) : <p className="text-sm text-nx-ink-2">{t("booking360.commercial.invoicePending")}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><UserRound className="size-5 text-nx-accent" aria-hidden="true" />{t("booking360.customer.title")}</CardTitle></CardHeader>
            <CardContent>
              {vm.state.enrichmentLoading && !vm.state.customer ? <LoadingSpinner showText={false} /> :
                vm.state.customer ? (
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
                ) :
                <Alert variant="info"><AlertDescription>{canViewCustomer ? t("booking360.customer.unavailable") : t("booking360.customer.restricted")}</AlertDescription></Alert>}
            </CardContent>
          </Card>

          {(reservation.status === "Held" || reservation.activeHold) && (
            <Card>
              <CardHeader><CardTitle>{t("booking360.hold.title")}</CardTitle></CardHeader>
              <CardContent>
                {reservation.activeHold ? <BookingHoldState expiresAtUtc={reservation.activeHold.expiresAtUtc} asOfUtc={reservation.asOfUtc} locale={language} timeZoneId={timeZoneId} confirming={vm.state.activeAction === "confirm"} canConfirm={Boolean(showConfirm)} actionError={vm.state.actionError} t={t} onConfirm={() => void vm.confirm()} onExpired={() => void vm.holdExpired()} /> : <Alert variant="warning"><AlertDescription>{t("booking360.hold.none")}</AlertDescription></Alert>}
              </CardContent>
            </Card>
          )}

          {/* No-App Guest Access Link Management Card */}
          <BookingGuestAccessCard
            reservationId={reservation.id}
            customerEmail={null}
            direction={direction}
            t={t}
          />
        </div>

        <Card>
          <CardHeader><CardTitle>{t("booking360.history.title")}</CardTitle></CardHeader>
          <CardContent>{reservation.history.length ? <BookingLifecycleTimeline items={reservation.history} locale={language} timeZoneId={timeZoneId} t={t} /> : <p className="text-sm text-nx-ink-2">{t("booking360.history.empty")}</p>}</CardContent>
        </Card>
      </div>
    </div>
  );
});
