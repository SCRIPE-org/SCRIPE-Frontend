"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";

// ─── Types ────────────────────────────────────────────────────────────────────

export type QrSessionStatus = "pending" | "scanned" | "approved" | "rejected" | "expired";

export interface QrStatusInfo {
  /** SVG icon element — no emojis */
  svgIcon: ReactNode;
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

  // ── Status indicators (SVG icons — no emojis) ──
  const getStatusInfo = (): QrStatusInfo => {
    switch (status) {
      case "scanned":
        return {
          svgIcon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" />
              <circle cx="12" cy="17" r="1" fill="#22D3EE" stroke="none" />
            </svg>
          ),
          label: t("auth.qr.scanned") || "QR code scanned! Waiting for approval…",
          color: "#22D3EE",
        };
      case "approved":
        return {
          svgIcon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ),
          label: t("auth.qr.approved") || "Approved! Signing you in…",
          color: "#10B981",
        };
      case "rejected":
        return {
          svgIcon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ),
          label: t("auth.qr.rejected") || "Request rejected.",
          color: "#EF4444",
        };
      case "expired":
        return {
          svgIcon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          ),
          label: t("auth.qr.expired") || "QR code expired.",
          color: "#F59E0B",
        };
      default:
        return {
          svgIcon: (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sx-text-mute)" strokeWidth="1.5" strokeLinecap="round">
              <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
              <path d="M14 14h.01M14 17h.01M17 14h.01M17 17h.01M20 14h.01M20 17h.01" />
            </svg>
          ),
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
