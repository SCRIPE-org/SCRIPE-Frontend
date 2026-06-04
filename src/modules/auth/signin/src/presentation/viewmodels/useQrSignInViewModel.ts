"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QrSessionStatus = "pending" | "scanned" | "approved" | "rejected" | "expired";

export interface QrStatusInfo {
  icon: string;
  label: string;
  color: string;
}

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
 * Extracted from QrSignInView.tsx to enforce SCRIPE MVVM architecture:
 * View → ViewModel → Repository → Service → HTTP
 *
 * Per auth-methods.md §4 QR Code Login:
 * 1. Desktop creates a QR session → displays QR code
 * 2. Mobile scans QR → sees approval screen (QrApprovalView)
 * 3. Desktop polls session status every 3 seconds
 * 4. When approved → receives tokens, completes login
 *
 * Security:
 * - Session expires after 5 minutes
 * - One-time use (consumed on approve/reject)
 * - Polling uses fixed interval (3s)
 */
export function useQrSignInViewModel(
  onSuccess: (result: { accessToken: string; refreshToken: string }) => void
): UseQrSignInViewModelReturn {
  const { t } = useI18n();
  const { authRepository } = authContainer;

  const [sessionId, setSessionId] = useState("");
  const [qrData, setQrData] = useState("");
  const [status, setStatus] = useState<QrSessionStatus>("pending");
  const [error, setError] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Create QR Session ──
  const createSession = useCallback(async () => {
    setIsCreating(true);
    setError("");
    setStatus("pending");

    try {
      const result = await authRepository.beginQrSignIn();

      setSessionId(result.sessionId);
      setQrData(result.qrData);

      // Calculate time left from expiry
      const expiresAt = new Date(result.expiresAt);
      const now = new Date();
      const remainingSec = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
      setTimeLeft(remainingSec);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : t("auth.qr.createFailed") || "Failed to create QR session."
      );
    } finally {
      setIsCreating(false);
    }
  }, [t, authRepository]);

  // ── Init session on mount ──
  useEffect(() => {
    createSession();
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Poll session status ──
  useEffect(() => {
    if (!sessionId || status === "approved" || status === "rejected" || status === "expired") {
      return;
    }

    pollRef.current = setInterval(async () => {
      try {
        const result = await authRepository.checkQrSignIn(sessionId);

        setStatus(result.status as QrSessionStatus);

        if (result.status === "approved" && result.accessToken && result.refreshToken) {
          if (pollRef.current) clearInterval(pollRef.current);
          if (timerRef.current) clearInterval(timerRef.current);
          onSuccess({
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
          });
        } else if (result.status === "expired") {
          if (pollRef.current) clearInterval(pollRef.current);
          setError(t("auth.qr.expired") || "QR code expired. Please generate a new one.");
        }
      } catch {
        // Silent fail — retry on next interval
      }
    }, 3000); // Poll every 3 seconds

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

  // Expire when timer hits zero — separate effect avoids nested setState
  useEffect(() => {
    if (timeLeft === 0 && status === "pending") {
      setStatus("expired");
    }
  }, [timeLeft, status]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // ── Status indicators ──
  const getStatusInfo = (): QrStatusInfo => {
    switch (status) {
      case "scanned":
        return {
          icon: "📱",
          label: t("auth.qr.scanned") || "QR code scanned! Waiting for approval…",
          color: "#22D3EE",
        };
      case "approved":
        return {
          icon: "✅",
          label: t("auth.qr.approved") || "Approved! Signing you in…",
          color: "#10B981",
        };
      case "rejected":
        return {
          icon: "❌",
          label: t("auth.qr.rejected") || "Request rejected.",
          color: "#EF4444",
        };
      case "expired":
        return {
          icon: "⏰",
          label: t("auth.qr.expired") || "QR code expired.",
          color: "#F59E0B",
        };
      default:
        return {
          icon: "📷",
          label: t("auth.qr.pending") || "Scan the QR code with your mobile device",
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
