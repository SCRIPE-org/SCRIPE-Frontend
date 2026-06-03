"use client";

import { useState, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QrApprovalViewProps {
  /** QR session ID from the scanned QR code URL */
  sessionId: string;
  /** Device info string (browser + OS) from QR payload */
  deviceInfo?: string;
  /** Location hint from QR payload */
  location?: string;
  /** Called when user taps Approve — the parent (viewmodel) handles the API call */
  onApprove: (sessionId: string) => Promise<void>;
  /** Called when user taps Reject — the parent (viewmodel) handles the API call */
  onReject: (sessionId: string) => Promise<void>;
  /** Callback after approval/rejection completes */
  onComplete: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * QrApprovalView — Mobile-side QR sign-in approval
 *
 * Per auth-methods.md §4 QR Code Login (mobile side):
 * - Shows requesting device info
 * - Approve / Reject buttons
 * - Parent layer sends approval to backend which issues tokens to desktop poller
 *
 * Architecture: Pure presentation component — no direct API/service imports.
 * All API calls are injected via onApprove/onReject callbacks from the viewmodel.
 *
 * Design: Vault aesthetic, success/error animations, design tokens only.
 */
export function QrApprovalView({
  sessionId,
  deviceInfo,
  location,
  onApprove,
  onReject,
  onComplete,
}: QrApprovalViewProps) {
  const { t, direction } = useI18n();

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<"idle" | "approved" | "rejected">("idle");
  const [error, setError] = useState("");

  const handleApprove = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      await onApprove(sessionId);
      setResult("approved");
      setTimeout(onComplete, 2000);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : (t("auth.qr.approveFailed") || "Failed to approve. Please try again.")
      );
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, onApprove, onComplete, t]);

  const handleReject = useCallback(async () => {
    setIsLoading(true);

    try {
      await onReject(sessionId);
      setResult("rejected");
      setTimeout(onComplete, 1500);
    } catch {
      // Silent — rejection is best-effort
      setResult("rejected");
      setTimeout(onComplete, 1500);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, onReject, onComplete]);

  // ── Success screen ──
  if (result === "approved") {
    return (
      <div className="sx-screen space-y-5 p-6 text-center" dir={direction}>
        <div className="sx-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "var(--sx-success-bg, rgba(16,185,129,0.15))",
            border: "1px solid var(--sx-success-border, rgba(16,185,129,0.3))",
          }}
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--sx-success-dot, #10B981)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" className="sx-check" />
          </svg>
        </div>
        <h2 className="text-lg font-bold" style={{ color: "var(--sx-text)" }}>
          {t("auth.qr.approvedTitle") || "Sign-in approved!"}
        </h2>
        <p className="text-sm" style={{ color: "var(--sx-text-mute)" }}>
          {t("auth.qr.approvedDesc") || "The other device is now signed in."}
        </p>
      </div>
    );
  }

  // ── Rejected screen ──
  if (result === "rejected") {
    return (
      <div className="sx-screen space-y-5 p-6 text-center" dir={direction}>
        <div className="sx-pop mx-auto flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "var(--sx-error-bg, rgba(239,68,68,0.15))",
            border: "1px solid var(--sx-error-border, rgba(239,68,68,0.3))",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="hsl(var(--destructive))" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </div>
        <h2 className="text-lg font-bold" style={{ color: "var(--sx-text)" }}>
          {t("auth.qr.rejectedTitle") || "Sign-in rejected"}
        </h2>
        <p className="text-sm" style={{ color: "var(--sx-text-mute)" }}>
          {t("auth.qr.rejectedDesc") || "The sign-in request was denied."}
        </p>
      </div>
    );
  }

  // ── Approval prompt ──
  return (
    <div className="sx-screen space-y-6 p-6" dir={direction}>
      {/* Header */}
      <div className="text-center">
        <div
          className="sx-rise mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
          style={{
            background: "var(--sx-accent-bg, linear-gradient(135deg, rgba(168,85,247,0.15) 0%, rgba(124,58,237,0.1) 100%))",
            border: "1px solid var(--sx-accent-border, rgba(168,85,247,0.3))",
          }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--sx-accent, hsl(var(--primary)))" strokeWidth="1.5">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
        </div>
        <h2 className="text-lg font-bold" style={{ color: "var(--sx-text)" }}>
          {t("auth.qr.approvalTitle") || "Approve sign-in?"}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--sx-text-mute)" }}>
          {t("auth.qr.approvalDesc") || "A device is trying to sign in to your account"}
        </p>
      </div>

      {/* Device info card */}
      <div
        className="rounded-lg p-4 space-y-2"
        style={{
          background: "var(--sx-chip-bg, rgba(255,255,255,0.04))",
          border: "1px solid var(--sx-chip-border, rgba(255,255,255,0.08))",
        }}
      >
        {deviceInfo && (
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sx-text-mute)" strokeWidth="1.5">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span className="text-sm" style={{ color: "var(--sx-text)" }}>
              {deviceInfo}
            </span>
          </div>
        )}
        {location && (
          <div className="flex items-center gap-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sx-text-mute)" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span className="text-sm" style={{ color: "var(--sx-text)" }}>
              {location}
            </span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--sx-text-mute)" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="text-sm" style={{ color: "var(--sx-text-mute)" }}>
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Warning */}
      <div
        className="rounded-lg px-4 py-3 text-xs"
        role="alert"
        style={{
          background: "var(--sx-warning-bg, rgba(245,158,11,0.08))",
          border: "1px solid var(--sx-warning-border, rgba(245,158,11,0.15))",
          color: "var(--sx-warning-text, #F59E0B)",
        }}
      >
        {t("auth.qr.securityWarning") ||
          "Only approve if you initiated this sign-in. If you didn't, tap Reject."}
      </div>

      {/* Error */}
      {error && (
        <div
          className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-[13px] font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={handleReject}
          disabled={isLoading}
          className="flex-1 rounded-xl border-destructive/20 bg-destructive/10 py-3 text-sm font-semibold text-destructive hover:bg-destructive/15"
        >
          {t("auth.qr.reject") || "Reject"}
        </Button>
        <Button
          type="button"
          onClick={handleApprove}
          disabled={isLoading}
          className="relative flex-1 overflow-hidden rounded-xl py-3 text-sm font-semibold text-white"
          style={{
            background: "var(--sx-cta-gradient)",
            boxShadow: "var(--sx-cta-shadow)",
          }}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="sx-spin1 inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
            </span>
          ) : (
            t("auth.qr.approve") || "Approve"
          )}
        </Button>
      </div>
    </div>
  );
}
