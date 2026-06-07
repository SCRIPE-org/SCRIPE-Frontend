"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { authContainer } from "@modules/auth/di";
import { QrApprovalView } from "./QrApprovalView";

/**
 * QrApprovePageContent — Reads ?session=<id> from URL, wires approval callbacks.
 *
 * Placed in a Suspense boundary (required by useSearchParams in Next.js App Router).
 *
 * Flow (mobile side):
 *   1. User scans QR code → navigates to /qr-approve?session=<sessionId>&device=<info>
 *   2. This component reads the params, checks the session is valid
 *   3. Shows QrApprovalView with device info
 *   4. User taps Approve → calls authRepository.approveQrSignIn(sessionId)
 *   5. Desktop polling detects "approved" status → receives tokens → login complete
 *
 * Security:
 *   - Session ID is opaque and one-time-use (consumed on approve/reject)
 *   - Page is public (no auth cookie required) — the session ID IS the credential
 *   - If no session param → redirect to login
 */
export function QrApprovePageContent() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useSearchParams();

  const sessionId = params.get("session") ?? "";
  const deviceInfo = params.get("device") ?? undefined;
  const location = params.get("loc") ?? undefined;

  const { authRepository } = authContainer;

  // Redirect to login if no session ID in URL
  useEffect(() => {
    if (!sessionId) {
      router.replace("/login");
    }
  }, [sessionId, router]);

  const handleApprove = useCallback(
    async (sid: string) => {
      await authRepository.approveQrSignIn(sid);
    },
    [authRepository]
  );

  const handleReject = useCallback(
    async (sid: string) => {
      // Best-effort — silent on fail (session expires naturally anyway)
      try {
        await authRepository.rejectQrSignIn(sid);
      } catch {
        // Silent — rejection is best-effort
      }
    },
    [authRepository]
  );

  const handleComplete = useCallback(() => {
    // After approve/reject, send user back to login or a "done" screen
    router.replace("/login");
  }, [router]);

  if (!sessionId) {
    return (
      <div className="space-y-3 text-center">
        <p className="text-sm" style={{ color: "var(--sx-text-mute)" }}>
          {t("auth.qr.invalidSession") || "Invalid or missing session. Please scan the QR code again."}
        </p>
      </div>
    );
  }

  return (
    <QrApprovalView
      sessionId={sessionId}
      deviceInfo={deviceInfo}
      location={location}
      onApprove={handleApprove}
      onReject={handleReject}
      onComplete={handleComplete}
    />
  );
}
