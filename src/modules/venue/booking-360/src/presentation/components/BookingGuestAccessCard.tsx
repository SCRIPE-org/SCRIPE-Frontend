"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import { Input } from "@core/ui/input";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { Link2, Copy, Check, Send, Trash2, ShieldCheck, AlertCircle, Clock } from "lucide-react";
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
    copied,
    generating,
    sending,
    revoking,
    sendSuccess,
    feedbackError,
    handleGenerateLink,
    handleCopyLink,
    handleSendLink,
    handleRevokeLink,
  } = useBookingGuestAccessViewModel({ reservationId, customerEmail });

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
    <Card className="border-nx-line/80 overflow-hidden border bg-nx-surface shadow-sm">
      <CardHeader className="bg-nx-surfaceSubtle/50 border-nx-line/50 flex flex-row items-center justify-between border-b px-4 py-3 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-nx-ink">
          <Link2 className="size-4 text-nx-accent" aria-hidden="true" />
          <span>No-App Guest Access</span>
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
              <div className="flex items-center gap-2 rounded-nx-md border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs font-medium text-emerald-800 dark:text-emerald-300">
                <Check
                  className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400"
                  aria-hidden="true"
                />
                <span>{sendSuccess}</span>
              </div>
            )}

            {/* When an active link exists (either loaded or freshly generated) */}
            {activeLink || (status?.hasActiveLink && !status?.isRevoked) ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-nx-ink-2">
                    <span className="font-medium">Secure Guest Link (Fragment Credential)</span>
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
                        value={activeLink}
                        readOnly
                        className="bg-nx-surfaceSubtle h-9 select-all font-mono text-xs"
                        dir="ltr"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="flex h-9 shrink-0 items-center gap-1.5 px-3 text-xs font-medium"
                      >
                        {copied ? (
                          <>
                            <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="size-3.5 text-nx-ink-2" aria-hidden="true" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-nx-surfaceSubtle border-nx-line/60 flex items-center justify-between rounded-nx-md border p-3 text-xs">
                      <div className="flex items-center gap-2 text-nx-ink-2">
                        <ShieldCheck className="size-4 text-emerald-600" aria-hidden="true" />
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
                <div className="bg-nx-surfaceSubtle/70 border-nx-line/50 rounded-nx-md border p-3 text-xs leading-relaxed text-nx-ink-2">
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
