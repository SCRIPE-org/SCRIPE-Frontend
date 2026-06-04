"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { useQrSignInViewModel } from "../viewmodels/useQrSignInViewModel";

// ─── Types ────────────────────────────────────────────────────────────────────

interface QrSignInViewProps {
  onSuccess: (result: { accessToken: string; refreshToken: string }) => void;
  onBack: () => void;
  isRTL: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * QrSignInView — QR Cross-Device Sign-In (pure render)
 *
 * All business logic (session creation, polling, countdown) lives in useQrSignInViewModel.
 * This component is a pure render — no DI imports, no HTTP calls.
 *
 * Design: Vault aesthetic, QR rendered via canvas, status indicators
 */
export function QrSignInView({ onSuccess, onBack, isRTL }: QrSignInViewProps) {
  const { t } = useI18n();
  const vm = useQrSignInViewModel(onSuccess);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Render QR code as simple text-based display ──
  useEffect(() => {
    if (!vm.qrData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Simple QR display: render the session URL as a centered text
    // In production, use a QR library (qrcode, qr.js) to render actual QR matrix
    canvas.width = 200;
    canvas.height = 200;

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, 200, 200);

    // Border
    ctx.strokeStyle = "#E5E7EB";
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, 198, 198);

    // QR placeholder pattern (a real implementation would use a QR encoder)
    ctx.fillStyle = "#1a1a2e";
    const cellSize = 6;
    const offset = 20;
    const data = vm.qrData || vm.sessionId;
    // Generate deterministic pattern from session data
    for (let row = 0; row < 27; row++) {
      for (let col = 0; col < 27; col++) {
        const charIndex = (row * 27 + col) % data.length;
        const charCode = data.charCodeAt(charIndex);
        if ((charCode + row + col) % 3 !== 0) {
          ctx.fillRect(
            offset + col * cellSize,
            offset + row * cellSize,
            cellSize - 1,
            cellSize - 1
          );
        }
      }
    }

    // Corner markers (standard QR positioning squares)
    const drawCorner = (x: number, y: number) => {
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(x, y, 42, 42);
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(x + 6, y + 6, 30, 30);
      ctx.fillStyle = "#1a1a2e";
      ctx.fillRect(x + 12, y + 12, 18, 18);
    };

    drawCorner(offset, offset);
    drawCorner(offset + 120, offset);
    drawCorner(offset, offset + 120);
  }, [vm.qrData, vm.sessionId]);

  return (
    <div className="sx-screen space-y-5 text-center" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold" style={{ color: "var(--sx-text)" }}>
          {t("auth.qr.title") || "Sign in with QR code"}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--sx-text-mute)" }}>
          {t("auth.qr.subtitle") || "Scan from your mobile device to sign in instantly"}
        </p>
      </div>

      {/* QR Code */}
      <div className="relative mx-auto">
        <div
          className="relative mx-auto overflow-hidden rounded-xl p-3"
          style={{
            background: "#ffffff",
            width: 220,
            height: 220,
            boxShadow: "0 8px 32px rgba(0,0,0,0.3)",
            opacity: vm.status === "expired" || vm.status === "rejected" ? 0.3 : 1,
            transition: "opacity 0.3s ease",
          }}
        >
          <canvas ref={canvasRef} className="mx-auto" style={{ width: 200, height: 200 }} />
          {/* Scanned overlay */}
          {vm.status === "scanned" && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-xl"
              style={{ background: "rgba(255,255,255,0.9)" }}
            >
              <span className="text-4xl" style={{ animation: "sxPop 350ms ease-out both" }}>
                📱
              </span>
            </div>
          )}
        </div>

        {/* Timer badge */}
        {vm.status === "pending" && vm.timeLeft > 0 && (
          <div
            className="mx-auto mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
            style={{
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: vm.timeLeft < 60 ? "#F59E0B" : "var(--sx-text-mute)",
            }}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            {vm.formatTime(vm.timeLeft)}
          </div>
        )}
      </div>

      {/* Status message */}
      <p className="text-sm font-medium" style={{ color: vm.statusInfo.color }}>
        {vm.statusInfo.icon} {vm.statusInfo.label}
      </p>

      {/* Error */}
      {vm.error && (
        <div
          className="sx-shake rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3"
          role="alert"
          aria-live="assertive"
        >
          <p className="text-[13px] font-medium text-destructive">{vm.error}</p>
        </div>
      )}

      {/* Refresh / Retry for expired sessions */}
      {(vm.status === "expired" || vm.status === "rejected") && (
        <Button
          type="button"
          onClick={vm.createSession}
          disabled={vm.isCreating}
          className="mx-auto rounded-lg px-6 py-2.5 text-sm font-semibold"
          style={{
            background: "var(--sx-cta-gradient)",
            color: "#fff",
            boxShadow: "var(--sx-cta-shadow)",
          }}
        >
          {vm.isCreating ? (
            <span className="flex items-center gap-2">
              <span className="sx-spin1 inline-block h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
              {t("common.loading") || "Loading…"}
            </span>
          ) : (
            t("auth.qr.refresh") || "Generate new QR code"
          )}
        </Button>
      )}

      {/* Instructions */}
      {vm.status === "pending" && (
        <div
          className="space-y-2 rounded-lg p-4 text-start text-xs"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <p className="font-semibold" style={{ color: "var(--sx-text, rgba(245,242,255,0.9))" }}>
            {t("auth.qr.howTo") || "How to scan:"}
          </p>
          <ol className="list-decimal space-y-1 ps-4" style={{ color: "var(--sx-text-mute)" }}>
            <li>{t("auth.qr.step1") || "Open the Scripe app on your phone"}</li>
            <li>{t("auth.qr.step2") || "Tap the QR scan icon on the login screen"}</li>
            <li>{t("auth.qr.step3") || "Point your camera at this QR code"}</li>
          </ol>
        </div>
      )}

      {/* Back */}
      <Button
        variant="link"
        onClick={onBack}
        className="mx-auto block text-sm font-medium underline underline-offset-2"
        style={{ color: "var(--sx-accent-text)" }}
      >
        {t("auth.passkey.otherMethods") || "Use another sign-in method"}
      </Button>
    </div>
  );
}
