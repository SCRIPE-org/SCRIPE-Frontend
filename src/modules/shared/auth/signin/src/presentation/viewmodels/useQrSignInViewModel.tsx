"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Smartphone, Check, X, Clock, QrCode } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import type { TokenLoginPayload } from "./useTokenLogin";

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Status union representing the QR cross-device sign-in session lifecycle.
 */
export type QrSessionStatus =
  | "pending"
  | "scanned"
  | "approved"
  | "rejected"
  | "expired"
  | "consumed";

/**
 * Display metadata for the current QR session status indicator.
 */
export interface QrStatusInfo {
  /** Lucide icon element rendered beside the status label. */
  svgIcon: ReactNode;
  label: string;
  color: string;
}

/**
 * Public state and action contract returned by {@link useQrSignInViewModel}.
 */
export interface UseQrSignInViewModelReturn {
  // State
  sessionId: string;
  qrData: string;
  status: QrSessionStatus;
  error: string;
  isCreating: boolean;
  timeLeft: number;
  statusInfo: QrStatusInfo;

  // Actions
  createSession: () => Promise<void>;
  formatTime: (seconds: number) => string;
}

// ─── ViewModel ────────────────────────────────────────────────────────────────

/**
 * useQrSignInViewModel — Business logic for QR Cross-Device Sign-In.
 *
 * Enforces SCRIPE MVVM architecture:
 * View -> ViewModel -> Repository -> Service -> HTTP.
 *
 * Passes the active encrypted `tenantId` (or `null` for Platform login) when
 * creating the session, and completes login on the single winning `"approved"`
 * poll that returns `accessToken` (refresh token is set in the httpOnly cookie).
 */
export function useQrSignInViewModel(
  onSuccess: (result: TokenLoginPayload) => void,
  tenantId?: string | null
): UseQrSignInViewModelReturn {
  const { t } = useI18n();
  const { authRepository } = authContainer;

  const [sessionId, setSessionId] = useState("");
  const [qrData, setQrData] = useState("");
  const [status, setStatus] = useState<QrSessionStatus>("pending");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  // ── Create QR Session ──
  const createSession = useCallback(async () => {
    setIsCreating(true);
    setError("");
    setStatus("pending");
    completedRef.current = false;

    try {
      const result = await authRepository.beginQrSignIn(tenantId ?? null);

      setSessionId(result.sessionId);
      setQrData(result.qrData);

      const expiresAt = new Date(result.expiresAt);
      const now = new Date();
      const remainingSec = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      setTimeLeft(remainingSec);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("auth.qr.createFailed"));
    } finally {
      setIsCreating(false);
    }
  }, [t, authRepository, tenantId]);

  // ── Init session on mount / tenant change ──
  useEffect(() => {
    queueMicrotask(() => {
      void createSession();
    });
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [createSession]);

  // ── Poll session status ──
  useEffect(() => {
    if (
      !sessionId ||
      status === "approved" ||
      status === "rejected" ||
      status === "expired" ||
      status === "consumed"
    ) {
      return;
    }

    pollRef.current = setInterval(async () => {
      if (completedRef.current) return;
      try {
        const result = await authRepository.checkQrSignIn(sessionId);

        if (result.status === "approved" && result.accessToken) {
          completedRef.current = true;
          if (pollRef.current) clearInterval(pollRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          setStatus("approved");
          onSuccess({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
            defaultRedirectPath: result.defaultRedirectPath,
            subscriptionStatus: result.subscriptionStatus ?? null,
            gracePhase: result.gracePhase ?? null,
            editionName: result.editionName ?? null,
            mustChangePassword: Boolean(result.mustChangePassword),
            requireMfaEnrollment: Boolean(result.requireMfaEnrollment),
          });
          return;
        }

        if (result.status === "consumed") {
          if (pollRef.current) clearInterval(pollRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          if (!completedRef.current) {
            setStatus("expired");
            setError(t("auth.qr.expired"));
          }
          return;
        }

        setStatus(result.status);

        if (result.status === "expired" || result.status === "rejected") {
          if (pollRef.current) clearInterval(pollRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          if (result.status === "expired") {
            setError(t("auth.qr.expired"));
          }
        }
      } catch {
        // Silent retry on transient network/poll errors
      }
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [sessionId, status, onSuccess, t, authRepository]);

  // ── Countdown timer ──
  useEffect(() => {
    if (timeLeft <= 0 || status !== "pending") return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timeLeft, status]);

  useEffect(() => {
    if (timeLeft === 0 && status === "pending") {
      queueMicrotask(() => {
        setStatus("expired");
      });
    }
  }, [timeLeft, status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const getStatusInfo = (): QrStatusInfo => {
    switch (status) {
      case "scanned":
        return {
          svgIcon: <Smartphone className="h-4 w-4 text-info" aria-hidden="true" />,
          label: t("auth.qr.scanned"),
          color: "hsl(var(--info))",
        };
      case "approved":
        return {
          svgIcon: <Check className="h-4 w-4 text-success" aria-hidden="true" />,
          label: t("auth.qr.approved"),
          color: "hsl(var(--success))",
        };
      case "rejected":
        return {
          svgIcon: <X className="h-4 w-4 text-destructive" aria-hidden="true" />,
          label: t("auth.qr.rejected"),
          color: "hsl(var(--destructive))",
        };
      case "expired":
      case "consumed":
        return {
          svgIcon: <Clock className="h-4 w-4 text-warning" aria-hidden="true" />,
          label: t("auth.qr.expired"),
          color: "hsl(var(--warning-strong))",
        };
      default:
        return {
          svgIcon: <QrCode className="h-4 w-4 text-nx-ink-2" aria-hidden="true" />,
          label: t("auth.qr.pending"),
          color: "var(--sx-text-mute)",
        };
    }
  };

  return {
    sessionId,
    qrData,
    status,
    error,
    isCreating,
    timeLeft,
    statusInfo: getStatusInfo(),
    createSession,
    formatTime,
  };
}
