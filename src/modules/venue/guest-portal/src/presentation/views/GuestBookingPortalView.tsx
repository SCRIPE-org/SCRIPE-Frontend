"use client";

import React from "react";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { Alert, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  Calendar,
  Clock,
  MapPin,
  Info,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Globe,
} from "lucide-react";
import { useGuestBookingPortalViewModel } from "../viewmodels/useGuestBookingPortalViewModel";
import { GuestBookingHeader } from "../components/GuestBookingHeader";
import { GuestBookingFinancialCard } from "../components/GuestBookingFinancialCard";
import { GuestBookingCancelModal } from "../components/GuestBookingCancelModal";
import { GuestPortalEmptyState } from "../components/GuestPortalEmptyState";

export function GuestBookingPortalView() {
  const {
    stage,
    booking,
    errorMessage,
    cancelModalOpen,
    setCancelModalOpen,
    cancelling,
    cancelSuccessBanner,
    copied,
    language,
    direction,
    formattedDates,
    isCancelled,
    t,
    handleToggleLanguage,
    handleRefresh,
    handleConfirmCancel,
    handleCopyReservationNumber,
  } = useGuestBookingPortalViewModel();

  // Loading States
  if (stage === "loading" || stage === "exchanging") {
    return (
      <div
        className="bg-nx-surfaceSubtle/30 flex min-h-screen flex-col items-center justify-center p-4"
        dir={direction}
      >
        <div className="space-y-4 text-center">
          <LoadingSpinner showText={false} />
          <p className="animate-pulse text-sm font-medium text-nx-ink-2">
            {stage === "exchanging"
              ? t("guestPortal.loading.securing")
              : t("guestPortal.loading.loadingBooking")}
          </p>
        </div>
      </div>
    );
  }

  // Error States
  if (stage === "missing-token" || stage === "error" || !booking) {
    return (
      <div className="bg-nx-surfaceSubtle/20 min-h-screen" dir={direction}>
        <header className="bg-nx-surfaceSubtle/80 border-nx-line/60 sticky top-0 z-30 w-full border-b px-4 py-3 backdrop-blur-md sm:px-6">
          <div className="mx-auto flex max-w-2xl items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleLanguage}
              className="border-nx-line/50 flex h-8 items-center gap-1.5 rounded-full border px-2.5 text-xs text-nx-ink-2 hover:text-nx-ink"
              aria-label="Toggle Language"
            >
              <Globe className="size-3.5" aria-hidden="true" />
              <span className="font-semibold">{language === "ar" ? "English" : "العربية"}</span>
            </Button>
          </div>
        </header>
        <GuestPortalEmptyState
          title={t("guestPortal.errors.invalidOrExpiredTitle")}
          description={
            stage === "missing-token"
              ? t("guestPortal.errors.invalidOrExpiredDescription")
              : errorMessage || t("guestPortal.errors.invalidOrExpiredDescription")
          }
          onRetry={stage === "error" ? handleRefresh : undefined}
          t={t}
        />
      </div>
    );
  }

  return (
    <div
      className="from-nx-surfaceSubtle/40 to-nx-surfaceSubtle/30 min-h-screen bg-gradient-to-b via-nx-surface pb-16"
      dir={direction}
      data-testid="guest-booking-portal"
    >
      {/* Top Header */}
      <GuestBookingHeader
        booking={booking}
        language={language}
        onToggleLanguage={handleToggleLanguage}
        t={t}
      />

      <main className="mx-auto max-w-2xl space-y-5 px-4 pt-6 sm:px-6">
        {/* Success Banner upon Cancellation */}
        {cancelSuccessBanner && (
          <Alert
            variant="info"
            className="border-success/20 bg-success/10 text-success"
          >
            <CheckCircle
              className="size-4 text-success"
              aria-hidden="true"
            />
            <AlertDescription className="text-sm font-medium">
              {t("guestPortal.messages.cancelSuccess")}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Callout Banner */}
        {isCancelled && (
          <Alert
            variant="destructive"
            className="border-destructive/20 bg-destructive/10 text-destructive"
          >
            <XCircle className="size-4 text-destructive" aria-hidden="true" />
            <AlertDescription className="text-sm font-medium">
              This reservation has been cancelled.
            </AlertDescription>
          </Alert>
        )}

        {/* Primary Booking Card */}
        <Card className="overflow-hidden border border-nx-line bg-nx-surface shadow-md">
          {/* Card Top Strip: Reservation Number */}
          <div className="bg-nx-surfaceSubtle border-nx-line/60 flex items-center justify-between border-b px-4 py-3 sm:px-6">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
                {t("guestPortal.reservationNumber")}
              </span>
              <span className="font-mono text-sm font-bold text-nx-ink sm:text-base" dir="ltr">
                {booking.reservationNumber}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyReservationNumber}
              className="flex h-7 items-center gap-1 px-2 text-xs text-nx-ink-2 hover:text-nx-ink"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-success" aria-hidden="true" />
                  <span className="text-[11px] font-medium text-success">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3 text-nx-ink-3" aria-hidden="true" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </Button>
          </div>

          <CardContent className="space-y-6 p-4 sm:p-6">
            {/* Facility & Court Info */}
            <div className="space-y-1">
              <h2 className="text-lg font-bold tracking-tight text-nx-ink sm:text-xl">
                {booking.facilityName}
              </h2>
              <div className="flex items-center gap-2 text-sm font-medium text-nx-ink-2">
                <MapPin className="size-4 shrink-0 text-nx-accent" aria-hidden="true" />
                <span>{booking.resourceName}</span>
                <span className="text-nx-ink-3">•</span>
                <span className="text-xs font-normal text-nx-ink-3">{booking.venueName}</span>
              </div>
            </div>

            {/* Schedule & Time Details */}
            {formattedDates && (
              <div className="bg-nx-surfaceSubtle/60 border-nx-line/70 grid gap-3 rounded-nx-lg border p-4 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="bg-nx-accent/10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-nx-md text-nx-accent">
                    <Calendar className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-nx-ink-3">
                      {t("guestPortal.schedule")}
                    </span>
                    <span className="mt-0.5 block text-sm font-bold text-nx-ink">
                      {formattedDates.dateStr}
                    </span>
                    <span className="block text-xs text-nx-ink-3" dir="ltr">
                      {formattedDates.timeZone}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="bg-nx-accent/10 mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-nx-md text-nx-accent">
                    <Clock className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold uppercase text-nx-ink-3">
                      {t("guestPortal.duration")} ({formattedDates.duration})
                    </span>
                    <span className="mt-0.5 block text-sm font-bold tabular-nums text-nx-ink">
                      {formattedDates.startTimeStr} – {formattedDates.endTimeStr}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Key Meta: Quantity & Customer */}
            <div className="border-nx-line/40 grid grid-cols-2 gap-4 border-t pt-4 text-xs">
              <div>
                <span className="block font-medium text-nx-ink-3">{t("guestPortal.quantity")}</span>
                <span className="mt-0.5 block text-sm font-semibold text-nx-ink">
                  {booking.quantity}
                </span>
              </div>

              {booking.customerName && (
                <div>
                  <span className="block font-medium text-nx-ink-3">
                    {t("guestPortal.customer")}
                  </span>
                  <span className="mt-0.5 block truncate text-sm font-semibold text-nx-ink">
                    {booking.customerName}
                  </span>
                </div>
              )}
            </div>

            {/* Directions & Instructions */}
            {booking.instructions && (
              <div className="border-nx-line/40 space-y-2 border-t pt-4">
                <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-nx-ink-2">
                  <Info className="size-3.5 text-nx-accent" aria-hidden="true" />
                  <span>{t("guestPortal.instructions")}</span>
                </div>
                <div className="bg-nx-surfaceSubtle whitespace-pre-line rounded-nx-md p-3 text-xs leading-relaxed text-nx-ink sm:text-sm">
                  {booking.instructions}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Financial Summary Card (if present) */}
        {booking.financialSummary && (
          <GuestBookingFinancialCard
            financialSummary={booking.financialSummary}
            language={language}
            t={t}
          />
        )}

        {/* Self-service Cancellation Action */}
        {booking.canCancel && !isCancelled && (
          <div className="flex flex-col items-center gap-2 pb-4 pt-2">
            <Button
              variant="outline"
              size="default"
              onClick={() => setCancelModalOpen(true)}
              className="w-full border-destructive/30 px-6 text-xs font-medium text-destructive transition-colors hover:border-destructive/60 hover:bg-destructive/10 sm:w-auto sm:text-sm"
            >
              {t("guestPortal.actions.cancelBooking")}
            </Button>
            <p className="text-center text-[11px] text-nx-ink-3">
              Free cancellation available according to venue policy.
            </p>
          </div>
        )}

        {/* Refresh Action */}
        <div className="flex justify-center pb-8 pt-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="flex items-center gap-1.5 text-xs text-nx-ink-3 hover:text-nx-ink"
          >
            <RefreshCw className="size-3.5" aria-hidden="true" />
            <span>Refresh details</span>
          </Button>
        </div>
      </main>

      {/* Cancellation Dialog */}
      <GuestBookingCancelModal
        open={cancelModalOpen}
        onOpenChange={setCancelModalOpen}
        reservationNumber={booking.reservationNumber}
        onConfirmCancel={handleConfirmCancel}
        loading={cancelling}
        t={t}
      />
    </div>
  );
}
