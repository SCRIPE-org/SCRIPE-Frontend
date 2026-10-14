"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import type { GuestBooking } from "../../domain/entities/GuestBooking";
import { guestPortalService } from "../../data/services/guest-portal.service";
import { en as guestEn } from "../../../locales/guest-portal.en";
import { ar as guestAr } from "../../../locales/guest-portal.ar";

export type PageStage = "loading" | "exchanging" | "ready" | "error" | "missing-token";

export interface FormattedDates {
  dateStr: string;
  startTimeStr: string;
  endTimeStr: string;
  duration: string;
  timeZone: string;
}

export function useGuestBookingPortalViewModel() {
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
  const formattedDates = useMemo<FormattedDates | null>(() => {
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

  const isCancelled = booking?.status === "Cancelled";
  const isConfirmed = booking?.status === "Confirmed";

  return {
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
    isConfirmed,
    t,
    handleToggleLanguage,
    handleRefresh,
    handleConfirmCancel,
    handleCopyReservationNumber,
  };
}
