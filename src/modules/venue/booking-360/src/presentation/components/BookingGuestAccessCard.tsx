"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Clock,
} from "lucide-react";
import { getModuleApiService } from "@/core/services/api-factory";

interface GuestAccessStatus {
  hasActiveLink: boolean;
  expiresAtUtc?: string | null;
  isRevoked: boolean;
  revokedReason?: string | null;
  maskedRecipient?: string | null;
}

interface GenerateGuestAccessResult {
  guestAccessLink: string;
  expiresAtUtc: string;
}

interface SendGuestLinkResult {
  sent: boolean;
  recipient?: string | null;
}

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
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<GuestAccessStatus | null>(null);
  const [activeLink, setActiveLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [sending, setSending] = useState(false);
  const [revoking, setRevoking] = useState(false);
  const [sendSuccess, setSendSuccess] = useState<string | null>(null);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  const api = getModuleApiService("venue");

  const loadStatus = useCallback(async () => {
    try {
      setLoading(true);
      setFeedbackError(null);
      const res = await api.get<GuestAccessStatus>(
        `/v1/reservations/${encodeURIComponent(reservationId)}/guest-access`
      );
      setStatus(res);
    } catch (err: any) {
      // 404 or missing access simply means no link generated yet
      setStatus({
        hasActiveLink: false,
        isRevoked: false,
      });
    } finally {
      setLoading(false);
    }
  }, [api, reservationId]);

  useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  const handleGenerateLink = async () => {
    try {
      setGenerating(true);
      setFeedbackError(null);
      setSendSuccess(null);
      const res = await api.post<GenerateGuestAccessResult>(
        `/v1/reservations/${encodeURIComponent(reservationId)}/guest-access`
      );

      // Build full absolute link if relative path returned
      const fullUrl = res.guestAccessLink.startsWith("http")
        ? res.guestAccessLink
        : `${typeof window !== "undefined" ? window.location.origin : ""}${res.guestAccessLink}`;

      setActiveLink(fullUrl);
      setStatus({
        hasActiveLink: true,
        expiresAtUtc: res.expiresAtUtc,
        isRevoked: false,
      });
    } catch (err: any) {
      setFeedbackError(err?.message || "Failed to generate guest link.");
    } finally {
      setGenerating(false);
    }
  };

  const handleCopyLink = () => {
    if (!activeLink) return;
    navigator.clipboard.writeText(activeLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendLink = async () => {
    try {
      setSending(true);
      setFeedbackError(null);
      setSendSuccess(null);
      const res = await api.post<SendGuestLinkResult>(
        `/v1/reservations/${encodeURIComponent(reservationId)}/send-guest-link`,
        { recipientEmail: customerEmail || null }
      );

      if (res.sent) {
        setSendSuccess(`Guest link dispatched to ${res.recipient || "customer"}.`);
      } else {
        setFeedbackError("Email delivery could not be completed. You can copy and share the link manually.");
      }
    } catch (err: any) {
      setFeedbackError(err?.message || "Failed to dispatch guest link.");
    } finally {
      setSending(false);
    }
  };

  const handleRevokeLink = async () => {
    if (!window.confirm("Are you sure you want to revoke this guest link? The customer will no longer be able to view or manage their booking with it.")) {
      return;
    }

    try {
      setRevoking(true);
      setFeedbackError(null);
      setSendSuccess(null);
      await api.delete(
        `/v1/reservations/${encodeURIComponent(reservationId)}/guest-access?reason=Revoked+by+operator`
      );
      setActiveLink(null);
      await loadStatus();
    } catch (err: any) {
      setFeedbackError(err?.message || "Failed to revoke guest link.");
    } finally {
      setRevoking(false);
    }
  };

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
    <Card className="border border-nx-line/80 shadow-sm overflow-hidden bg-nx-surface">
      <CardHeader className="py-3 px-4 sm:px-6 bg-nx-surfaceSubtle/50 border-b border-nx-line/50 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2 text-nx-ink">
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

      <CardContent className="p-4 sm:p-6 space-y-4">
        {loading ? (
          <div className="py-4 flex justify-center">
            <LoadingSpinner showText={false} />
          </div>
        ) : (
          <>
            {feedbackError && (
              <div className="p-3 rounded-nx-md bg-destructive/10 border border-destructive/20 text-xs text-destructive font-medium flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
                <span>{feedbackError}</span>
              </div>
            )}

            {sendSuccess && (
              <div className="p-3 rounded-nx-md bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300 font-medium flex items-center gap-2">
                <Check className="size-4 shrink-0 text-emerald-600 dark:text-emerald-400" aria-hidden="true" />
                <span>{sendSuccess}</span>
              </div>
            )}

            {/* When an active link exists (either loaded or freshly generated) */}
            {(activeLink || (status?.hasActiveLink && !status?.isRevoked)) ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-nx-ink-2">
                    <span className="font-medium">Secure Guest Link (Fragment Credential)</span>
                    {status?.expiresAtUtc && (
                      <span className="text-[11px] text-nx-ink-3 flex items-center gap-1">
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
                        className="font-mono text-xs h-9 bg-nx-surfaceSubtle select-all"
                        dir="ltr"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyLink}
                        className="h-9 px-3 shrink-0 flex items-center gap-1.5 text-xs font-medium"
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
                    <div className="p-3 rounded-nx-md bg-nx-surfaceSubtle border border-nx-line/50 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-nx-ink">
                        <ShieldCheck className="size-4 text-emerald-600" aria-hidden="true" />
                        <span>Active guest link issued and valid.</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateLink}
                        disabled={generating}
                        className="h-8 text-xs font-medium"
                      >
                        {generating ? "Re-issuing..." : "View / Re-issue Link"}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-nx-line/40">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSendLink}
                    disabled={sending}
                    className="h-8 text-xs flex items-center gap-1.5 text-nx-ink"
                  >
                    <Send className="size-3.5 text-nx-accent" aria-hidden="true" />
                    <span>{sending ? "Sending..." : "Send via Email"}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleRevokeLink}
                    disabled={revoking}
                    className="h-8 text-xs flex items-center gap-1.5 text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="size-3.5" aria-hidden="true" />
                    <span>{revoking ? "Revoking..." : "Revoke Link"}</span>
                  </Button>
                </div>
              </div>
            ) : status?.isRevoked ? (
              <div className="space-y-3">
                <div className="p-3 rounded-nx-md bg-rose-500/10 border border-rose-500/20 text-xs space-y-1">
                  <div className="font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="size-4" aria-hidden="true" />
                    <span>Previous Guest Link Revoked</span>
                  </div>
                  {status.revokedReason && (
                    <p className="text-nx-ink-2 pl-5.5">Reason: {status.revokedReason}</p>
                  )}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateLink}
                  disabled={generating}
                  className="w-full text-xs font-medium flex items-center justify-center gap-1.5"
                >
                  <Link2 className="size-3.5 text-nx-accent" aria-hidden="true" />
                  <span>{generating ? "Generating..." : "Generate New Guest Link"}</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-3 text-center sm:text-left">
                <p className="text-xs text-nx-ink-2 leading-relaxed">
                  Provide customer with zero-friction, mobile-optimized booking details without requiring an app download or account creation.
                </p>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleGenerateLink}
                  disabled={generating}
                  className="w-full sm:w-auto text-xs font-semibold flex items-center justify-center gap-1.5 border-nx-accent/30 text-nx-accent hover:bg-nx-accent/10"
                >
                  <Link2 className="size-3.5" aria-hidden="true" />
                  <span>{generating ? "Generating..." : "Generate Guest Link"}</span>
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
