"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Card, CardContent } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Alert, AlertDescription } from "@core/ui/alert";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Info,
  CheckCircle,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  AlertCircle,
  Globe,
} from "lucide-react";
import type { GuestBooking } from "../../domain/entities/GuestBooking";
import { guestPortalService } from "../../data/services/guest-portal.service";
import { en as guestEn } from "../../../locales/guest-portal.en";
import { ar as guestAr } from "../../../locales/guest-portal.ar";
import { GuestBookingHeader } from "../components/GuestBookingHeader";
import { GuestBookingFinancialCard } from "../components/GuestBookingFinancialCard";
import { GuestBookingCancelModal } from "../components/GuestBookingCancelModal";
import { GuestPortalEmptyState } from "../components/GuestPortalEmptyState";

type PageStage = "loading" | "exchanging" | "ready" | "error" | "missing-token";

export function GuestBookingPortalView() {
  const { t: contextT, language, direction, setLanguage, registerBothLanguages } = useI18n();

  // Register guest portal translations into context
  useEffect(() => {
    if (registerBothLanguages) {
      registerBothLanguages(guestEn, guestAr);
    }
  }, [registerBothLanguages]);

  // Fallback translation helper in case context hasn't loaded keys yet
  const t = useCallback(
    (key: string, params?: Record<string, string | number>): string => {
      const fromContext = contextT(key, params);
      if (fromContext && fromContext !== key) {
        return fromContext;
      }

      // Local dictionary lookup fallback
      const dict = language === "ar" ? guestAr : guestEn;
      const parts = key.split(".");
      let current: any = dict;
      for (const part of parts) {
        if (current && typeof current === "object" && part in current) {
          current = current[part];
        } else {
          return key;
        }
      }

      if (typeof current === "string") {
        let res = current;
        if (params) {
          for (const [k, v] of Object.entries(params)) {
            res = res.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), String(v));
          }
        }
        return res;
      }

      return key;
    },
    [contextT, language]
  );

  const [stage, setStage] = useState<PageStage>("loading");
  const [booking, setBooking] = useState<GuestBooking | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelSuccessBanner, setCancelSuccessBanner] = useState(false);
  const [copied, setCopied] = useState(false);
  // Initialize: Extract fragment token, strip from URL, exchange for session
  useEffect(() => {
    let active = true;

    async function init() {
      try {
        const hash = typeof window !== "undefined" ? window.location.hash : "";
        let rawToken = "";

        if (hash && hash.length > 1) {
          rawToken = decodeURIComponent(hash.substring(1)).trim();

          // CRITICAL SECURITY REQUIREMENT:
          // Immediately wipe the bearer token from the visible browser address bar
          // to prevent credential exposure in history, bookmarks, or captures.
          window.history.replaceState(null, "", window.location.pathname);
        }

        if (rawToken) {
          setStage("exchanging");
          const sessionRes = await guestPortalService.exchangeSession(rawToken);

          if (!active) return;
          setBooking(sessionRes.reservation);
          setStage("ready");
          return;
        }

        // If no token in fragment, check if there's already an active session cookie
        try {
          const existingBooking = await guestPortalService.getBooking();
          if (!active) return;
          setBooking(existingBooking);
          setStage("ready");
        } catch {
          if (!active) return;
          setStage("missing-token");
        }
      } catch (err: any) {
        if (!active) return;
        setErrorMessage(err?.message || "This guest link is invalid or has expired.");
        setStage("error");
      }
    }

    void init();

    return () => {
      active = false;
    };
  }, []);

  const handleToggleLanguage = () => {
    const nextLang = language === "ar" ? "en" : "ar";
    setLanguage(nextLang);
  };

  const handleRefresh = async () => {
    try {
      setStage("loading");
      const updated = await guestPortalService.getBooking();
      setBooking(updated);
      setStage("ready");
    } catch (err: any) {
      setErrorMessage(err?.message || t("guestPortal.errors.generalError"));
      setStage("error");
    }
  };

  const handleConfirmCancel = async (reason: string) => {
    if (!booking) return;

    try {
      setCancelling(true);
      const idempotencyKey =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `guest-cancel-${Date.now()}`;

      await guestPortalService.cancelBooking(reason, idempotencyKey);

      setBooking((prev) =>
        prev
          ? {
              ...prev,
              status: "Cancelled",
              canCancel: false,
            }
          : null
      );

      setCancelModalOpen(false);
      setCancelSuccessBanner(true);
    } catch (err: any) {
      alert(err?.message || t("guestPortal.messages.cancelFailed"));
    } finally {
      setCancelling(false);
    }
  };

  const handleCopyReservationNumber = () => {
    if (!booking) return;
    navigator.clipboard.writeText(booking.reservationNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Date and Time Formatting according to the venue's timezone
  const formattedDates = useMemo(() => {
    if (!booking) return null;

    try {
      const timeZone = booking.timeZoneId || "UTC";
      const startDate = new Date(booking.startUtc);
      const endDate = new Date(booking.endUtc);

      const dayFormatter = new Intl.DateTimeFormat(language, {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        timeZone,
      });

      const timeFormatter = new Intl.DateTimeFormat(language, {
        hour: "numeric",
        minute: "2-digit",
        timeZone,
      });

      const durationMinutes = Math.max(
        0,
        Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60))
      );

      const hours = Math.floor(durationMinutes / 60);
      const mins = durationMinutes % 60;
      let durationStr = "";
      if (hours > 0) {
        durationStr += `${hours}h `;
      }
      if (mins > 0 || hours === 0) {
        durationStr += `${mins}m`;
      }

      return {
        dateStr: dayFormatter.format(startDate),
        startTimeStr: timeFormatter.format(startDate),
        endTimeStr: timeFormatter.format(endDate),
        duration: durationStr.trim(),
        timeZone,
      };
    } catch {
      return {
        dateStr: booking.startUtc,
        startTimeStr: "",
        endTimeStr: booking.endUtc,
        duration: "",
        timeZone: booking.timeZoneId,
      };
    }
  }, [booking, language]);

  // Loading States
  if (stage === "loading" || stage === "exchanging") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-nx-surfaceSubtle/30" dir={direction}>
        <div className="text-center space-y-4">
          <LoadingSpinner showText={false} />
          <p className="text-sm font-medium text-nx-ink-2 animate-pulse">
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
      <div className="min-h-screen bg-nx-surfaceSubtle/20" dir={direction}>
        <header className="w-full bg-nx-surfaceSubtle/80 backdrop-blur-md border-b border-nx-line/60 px-4 py-3 sm:px-6 sticky top-0 z-30">
          <div className="max-w-2xl mx-auto flex items-center justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleLanguage}
              className="flex items-center gap-1.5 text-xs text-nx-ink-2 hover:text-nx-ink h-8 px-2.5 rounded-full border border-nx-line/50"
              aria-label="Toggle Language"
            >
              <Globe className="size-3.5" aria-hidden="true" />
              <span className="font-semibold">{language === "ar" ? "English" : "العربية"}</span>
            </Button>
          </div>
        </header>
        <GuestPortalEmptyState
          title={t("guestPortal.errors.invalidOrExpiredTitle")}
          description={stage === "missing-token" ? t("guestPortal.errors.invalidOrExpiredDescription") : (errorMessage || t("guestPortal.errors.invalidOrExpiredDescription"))}
          onRetry={stage === "error" ? handleRefresh : undefined}
          t={t}
        />
      </div>
    );
  }

  const isCancelled = booking.status === "Cancelled";
  const isConfirmed = booking.status === "Confirmed";

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-nx-surfaceSubtle/40 via-nx-surface to-nx-surfaceSubtle/30 pb-16"
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

      <main className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 space-y-5">
        {/* Success Banner upon Cancellation */}
        {cancelSuccessBanner && (
          <Alert variant="info" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="size-4 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
            <AlertDescription className="text-sm font-medium">
              {t("guestPortal.messages.cancelSuccess")}
            </AlertDescription>
          </Alert>
        )}

        {/* Status Callout Banner */}
        {isCancelled && (
          <Alert variant="destructive" className="border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300">
            <XCircle className="size-4 text-rose-600 dark:text-rose-400" aria-hidden="true" />
            <AlertDescription className="text-sm font-medium">
              This reservation has been cancelled.
            </AlertDescription>
          </Alert>
        )}

        {/* Primary Booking Card */}
        <Card className="border border-nx-line shadow-md overflow-hidden bg-nx-surface">
          {/* Card Top Strip: Reservation Number */}
          <div className="bg-nx-surfaceSubtle px-4 py-3 sm:px-6 border-b border-nx-line/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-nx-ink-3 uppercase font-semibold tracking-wider">
                {t("guestPortal.reservationNumber")}
              </span>
              <span className="font-mono text-sm sm:text-base font-bold text-nx-ink" dir="ltr">
                {booking.reservationNumber}
              </span>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyReservationNumber}
              className="h-7 px-2 text-xs text-nx-ink-2 hover:text-nx-ink flex items-center gap-1"
            >
              {copied ? (
                <>
                  <Check className="size-3 text-emerald-600" aria-hidden="true" />
                  <span className="text-emerald-600 font-medium text-[11px]">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="size-3 text-nx-ink-3" aria-hidden="true" />
                  <span className="text-[11px]">Copy</span>
                </>
              )}
            </Button>
          </div>

          <CardContent className="p-4 sm:p-6 space-y-6">
            {/* Facility & Court Info */}
            <div className="space-y-1">
              <h2 className="text-lg sm:text-xl font-bold text-nx-ink tracking-tight">
                {booking.facilityName}
              </h2>
              <div className="flex items-center gap-2 text-sm text-nx-ink-2 font-medium">
                <MapPin className="size-4 text-nx-accent shrink-0" aria-hidden="true" />
                <span>{booking.resourceName}</span>
                <span className="text-nx-ink-3">•</span>
                <span className="text-xs text-nx-ink-3 font-normal">{booking.venueName}</span>
              </div>
            </div>

            {/* Schedule & Time Details */}
            {formattedDates && (
              <div className="p-4 rounded-nx-lg bg-nx-surfaceSubtle/60 border border-nx-line/70 grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-nx-md bg-nx-accent/10 text-nx-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Calendar className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-nx-ink-3 uppercase">
                      {t("guestPortal.schedule")}
                    </span>
                    <span className="block text-sm font-bold text-nx-ink mt-0.5">
                      {formattedDates.dateStr}
                    </span>
                    <span className="block text-xs text-nx-ink-3" dir="ltr">
                      {formattedDates.timeZone}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="size-8 rounded-nx-md bg-nx-accent/10 text-nx-accent flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="size-4" aria-hidden="true" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-nx-ink-3 uppercase">
                      {t("guestPortal.duration")} ({formattedDates.duration})
                    </span>
                    <span className="block text-sm font-bold text-nx-ink mt-0.5 tabular-nums">
                      {formattedDates.startTimeStr} – {formattedDates.endTimeStr}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Key Meta: Quantity & Customer */}
            <div className="grid grid-cols-2 gap-4 text-xs border-t border-nx-line/40 pt-4">
              <div>
                <span className="text-nx-ink-3 font-medium block">
                  {t("guestPortal.quantity")}
                </span>
                <span className="font-semibold text-nx-ink text-sm mt-0.5 block">
                  {booking.quantity}
                </span>
              </div>

              {booking.customerName && (
                <div>
                  <span className="text-nx-ink-3 font-medium block">
                    {t("guestPortal.customer")}
                  </span>
                  <span className="font-semibold text-nx-ink text-sm mt-0.5 block truncate">
                    {booking.customerName}
                  </span>
                </div>
              )}
            </div>

            {/* Directions & Instructions */}
            {booking.instructions && (
              <div className="border-t border-nx-line/40 pt-4 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-nx-ink-2 uppercase tracking-wide">
                  <Info className="size-3.5 text-nx-accent" aria-hidden="true" />
                  <span>{t("guestPortal.instructions")}</span>
                </div>
                <div className="p-3 rounded-nx-md bg-nx-surfaceSubtle text-xs sm:text-sm text-nx-ink leading-relaxed whitespace-pre-line">
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
          <div className="pt-2 pb-4 flex flex-col items-center gap-2">
            <Button
              variant="outline"
              size="default"
              onClick={() => setCancelModalOpen(true)}
              className="text-xs sm:text-sm text-destructive hover:bg-destructive/10 border-destructive/30 hover:border-destructive/60 transition-colors w-full sm:w-auto px-6 font-medium"
            >
              {t("guestPortal.actions.cancelBooking")}
            </Button>
            <p className="text-[11px] text-nx-ink-3 text-center">
              Free cancellation available according to venue policy.
            </p>
          </div>
        )}

        {/* Refresh Action */}
        <div className="pt-4 pb-8 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            className="text-xs text-nx-ink-3 hover:text-nx-ink flex items-center gap-1.5"
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
