"use client";

import { useEffect, useRef } from "react";
import QRCode from "qrcode";
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
 * Uses the `qrcode` npm library to render a real, scannable QR code matrix on a canvas.
 * The QR data encodes the /qr-approve?session={sessionId} URL that the mobile device opens.
 *
 * Design: Vault aesthetic, real QR rendered via canvas, status indicators.
 */
export function QrSignInView({ onSuccess, onBack, isRTL }: QrSignInViewProps) {
  const { t } = useI18n();
  const vm = useQrSignInViewModel(onSuccess);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // ── Render real QR code via qrcode library ──
  useEffect(() => {
    if (!vm.qrData || !canvasRef.current) return;

    // qrData from backend is the raw session URL/payload to encode as QR
    QRCode.toCanvas(canvasRef.current, vm.qrData, {
      width: 200,
      margin: 2,
      color: {
        dark: "#1a1a2e",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    }).catch(() => {
      // Fallback: if library fails, render basic pattern so we don't break
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      canvas.width = 200;
      canvas.height = 200;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 200, 200);
      ctx.fillStyle = "#1a1a2e";
      ctx.font = "11px monospace";
      ctx.textAlign = "center";
      ctx.fillText("QR Error", 100, 100);
    });
  }, [vm.qrData]);

  return (
    <div className="sx-screen-anim w-full space-y-5 text-center" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header */}
      <div>
        <h2 className="text-lg font-bold" style={{ color: "var(--sx-text)" }}>
          {t("auth.qr.title") || "Sign in with QR code"}
        </h2>
        <p className="mt-1 text-sm" style={{ color: "var(--sx-text-mute)" }}>
          {t("auth.qr.subtitle") || "Scan from your mobile device to sign in instantly"}
        </p>
      </div>

      {/* QR Code container */}
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
          {/* Real QR canvas */}
          {vm.isCreating ? (
            // Loading skeleton while session is being created
            <div
              className="mx-auto animate-pulse rounded-lg"
              style={{ width: 200, height: 200, background: "#f3f4f6" }}
            />
          ) : (
            <canvas ref={canvasRef} className="mx-auto" style={{ width: 200, height: 200 }} />
          )}

          {/* Scanned overlay */}
          {vm.status === "scanned" && (
            <div
              className="absolute inset-0 flex items-center justify-center rounded-xl"
              style={{ background: "rgba(255,255,255,0.92)" }}
            >
              <div className="flex flex-col items-center gap-2">
                {/* Phone icon SVG */}
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#4C6200"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ animation: "sxPop 350ms ease-out both" }}
                >
                  <rect x="5" y="2" width="14" height="20" rx="2" />
                  <circle cx="12" cy="17" r="1" fill="#4C6200" stroke="none" />
                </svg>
                <span className="text-[13px] font-semibold" style={{ color: "#4C6200" }}>
                  {t("auth.qr.scannedLabel") || "Waiting for approval…"}
                </span>
              </div>
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
      <div className="flex items-center justify-center gap-2">
        {vm.statusInfo.svgIcon}
        <p className="text-sm font-medium" style={{ color: vm.statusInfo.color }}>
          {vm.statusInfo.label}
        </p>
      </div>

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
