"use client";

import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import {
  Link2,
  Copy,
  Check,
  Send,
  Trash2,
  ShieldCheck,
  AlertCircle,
  Clock,
  KeyRound,
  QrCode,
} from "lucide-react";
import { useBookingGuestAccessViewModel } from "../viewmodels/useBookingGuestAccessViewModel";

interface BookingGuestAccessCardProps {
  reservationId: string;
  customerEmail?: string | null;
  direction?: "ltr" | "rtl";
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function BookingGuestAccessCard({
  reservationId,
  customerEmail,
  direction = "ltr",
  t,
}: BookingGuestAccessCardProps) {
  const {
    loading,
    status,
    activeLink,
    guestPortalUrl,
    pin,
    copied,
    copiedPin,
    generating,
    sending,
    revoking,
    sendSuccess,
    feedbackError,
    handleGenerateLink,
    handleCopyLink,
    handleCopyPin,
    handleSendLink,
    handleRevokeLink,
  } = useBookingGuestAccessViewModel({ reservationId, customerEmail });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const qrData = guestPortalUrl || activeLink;
    if (!qrData) return;

    QRCode.toCanvas(canvasRef.current, qrData, {
      width: 112,
      margin: 1,
      color: {
        dark: "#0c101a",
        light: "#ffffff",
      },
      errorCorrectionLevel: "M",
    }).catch(() => {
      // Graceful fallback for environments without canvas support
    });
  }, [activeLink, guestPortalUrl]);

  const formatExpiry = (expiryUtc?: string | null) => {
    if (!expiryUtc) return "";
    try {
      return new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(expiryUtc));
    } catch {
      return expiryUtc;
    }
  };

  return (
    <Card className="overflow-hidden border border-nx-line bg-nx-surface" data-testid="guest-access-card">
      <CardHeader className="flex flex-row items-center justify-between border-b border-nx-line/50 bg-nx-raised/50 px-4 py-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-nx-ink">
          <Link2 className="size-4 text-nx-accent" aria-hidden="true" />
          <span>{t("booking360.guestAccess.title", { defaultValue: "No-App Guest Access" })}</span>
        </CardTitle>

        <div className="flex items-center gap-1.5">
          {status?.hasActiveLink && !status.isRevoked && (
            <Badge variant="active" className="text-xs">
              Link Active
            </Badge>
          )}
          {status?.isRevoked && (
            <Badge variant="destructive" className="text-xs">
              Revoked
            </Badge>
          )}
          {!status?.hasActiveLink && !status?.isRevoked && !loading && (
            <Badge variant="outline" className="text-xs text-nx-ink-3">
              Not Generated
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4 p-4 sm:p-6">
        {loading ? (
          <div className="flex justify-center py-4">
            <LoadingSpinner showText={false} />
          </div>
        ) : (
          <>
            {feedbackError && (
              <div className="flex items-center gap-2 rounded-nx-md border border-destructive/20 bg-destructive/10 p-3 text-xs font-medium text-destructive">
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                <span>{feedbackError}</span>
              </div>
            )}

            {sendSuccess && (
              <div className="flex items-center gap-2 rounded-nx-md border border-success/20 bg-success/10 p-3 text-xs font-medium text-success">
                <Check
                  className="size-4 shrink-0 text-success"
                  aria-hidden="true"
                />
                <span>{sendSuccess}</span>
              </div>
            )}

            {/* When an active link exists (either loaded or freshly generated) */}
            {activeLink || (status?.hasActiveLink && !status?.isRevoked) ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-nx-ink-2">
                    <span className="font-medium">
                      {t("booking360.guestAccess.linkTitle", {
                        defaultValue: "Secure Guest Self-Service Link",
                      })}
                    </span>
                    {status?.expiresAtUtc && (
                      <span className="flex items-center gap-1 text-[11px] text-nx-ink-3">
                        <Clock className="size-3" aria-hidden="true" />
                        Expires {formatExpiry(status.expiresAtUtc)}
                      </span>
                    )}
                  </div>

                  {activeLink ? (
                    <div className="flex items-center gap-2">
                      <Input
                        value={guestPortalUrl || activeLink}
                        readOnly
                        data-testid="guest-access-link-input"
                        className="h-9 select-all font-mono text-xs bg-nx-raised"
                        dir="ltr"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        data-testid="copy-guest-link-button"
                        className="flex h-9 shrink-0 items-center gap-1.5 px-3 text-xs font-medium"
                      >
                        {copied ? (
                          <>
                            <Check className="size-3.5 text-success" aria-hidden="true" />
                            <span className="text-success">{t("booking360.guestAccess.linkCopied", { defaultValue: "Copied" })}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5 text-nx-ink-2" aria-hidden="true" />
                            <span>{t("booking360.guestAccess.copyLink", { defaultValue: "Copy" })}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between rounded-nx-md border border-nx-line/60 bg-nx-raised p-3 text-xs">
                      <div className="flex items-center gap-2 text-nx-ink-2">
                        <ShieldCheck className="size-4 text-success" aria-hidden="true" />
                        <span>Link generated & active. Generate again to view and copy token.</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateLink}
                        disabled={generating}
                        className="h-8 text-xs font-medium"
                      >
                        {generating ? "Regenerating..." : "Regenerate Link"}
                      </Button>
                    </div>
                  )}
                </div>

                {/* PIN and QR Code Operational Access Panel */}
                <div className="grid gap-3 sm:grid-cols-2">
                  {/* Gate / Kiosk Access PIN */}
                  <div className="flex flex-col justify-between rounded-nx-md border border-nx-line bg-nx-raised p-3">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-nx-ink-3">
                        <KeyRound className="size-3.5 text-nx-accent" aria-hidden="true" />
                        {t("booking360.guestAccess.pinLabel", { defaultValue: "Gate / Kiosk PIN" })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopyPin}
                        data-testid="copy-pin-button"
                        className="h-7 px-2 text-[11px]"
                      >
                        {copiedPin ? (
                          <>
                            <Check className="size-3 text-success me-1" aria-hidden="true" />
                            <span className="text-success">{t("booking360.guestAccess.pinCopied", { defaultValue: "Copied" })}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3 text-nx-ink-2 me-1" aria-hidden="true" />
                            <span>{t("booking360.guestAccess.copyPin", { defaultValue: "Copy PIN" })}</span>
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="my-2">
                      <span
                        data-testid="guest-access-pin"
                        className="font-mono text-2xl font-bold tracking-widest text-nx-ink select-all"
                        dir="ltr"
                      >
                        {pin ? `${pin.slice(0, 3)} ${pin.slice(3)}` : "------"}
                      </span>
                    </div>
                    <p className="text-[11px] text-nx-ink-3">
                      Use on physical access keypad or self-service tablet.
                    </p>
                  </div>

                  {/* QR Code Scannable Pass */}
                  <div className="flex items-center gap-3 rounded-nx-md border border-nx-line bg-nx-raised p-3">
                    <div className="shrink-0 rounded border border-nx-line/60 bg-white p-1">
                      <canvas
                        ref={canvasRef}
                        data-testid="guest-access-qrcode"
                        width={100}
                        height={100}
                        className="size-20"
                        aria-label="Guest Access QR Code"
                      />
                    </div>
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-1 font-semibold text-nx-ink">
                        <QrCode className="size-3.5 text-nx-accent" aria-hidden="true" />
                        <span>{t("booking360.guestAccess.qrLabel", { defaultValue: "QR Pass" })}</span>
                      </div>
                      <p className="text-[11px] leading-tight text-nx-ink-3">
                        {t("booking360.guestAccess.scanPrompt", {
                          defaultValue: "Scan with camera for guest self-service access",
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions row: Dispath to email or Revoke */}
                <div className="border-nx-line/40 flex flex-wrap items-center justify-between gap-2 border-t pt-2">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSendLink}
                      disabled={sending}
                      className="flex h-8 items-center gap-1.5 text-xs font-medium"
                    >
                      <Send className="size-3 text-nx-ink-2" aria-hidden="true" />
                      <span>{sending ? "Sending..." : "Dispatch to Email"}</span>
                    </Button>
                    {customerEmail && (
                      <span className="text-[11px] text-nx-ink-3">to {customerEmail}</span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRevokeLink}
                    disabled={revoking}
                    className="flex h-8 items-center gap-1.5 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3" aria-hidden="true" />
                    <span>{revoking ? "Revoking..." : "Revoke Access"}</span>
                  </Button>
                </div>
              </div>
            ) : (
              /* When no link exists or previous was revoked */
              <div className="space-y-3">
                <div className="bg-nx-raised/70 border-nx-line/50 rounded-nx-md border p-3 text-xs leading-relaxed text-nx-ink-2">
                  <p>
                    Guest access links allow customers to view their booking details and request
                    cancellations via a self-service portal without requiring an account or mobile app.
                  </p>
                  <p className="mt-1 text-nx-ink-3">
                    Tokens are cryptographically bound to the URL fragment and never logged in server
                    access logs.
                  </p>
                </div>

                <div className="flex items-center justify-start gap-2">
                  <Button
                    size="sm"
                    onClick={handleGenerateLink}
                    disabled={generating}
                    className="flex h-9 items-center gap-2 px-4 text-xs font-semibold"
                  >
                    <Link2 className="size-3.5" aria-hidden="true" />
                    <span>{generating ? "Generating..." : "Generate Guest Link"}</span>
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
