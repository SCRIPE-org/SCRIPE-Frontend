/**
 * Checkout Dialog (Payment Link)
 *
 * Displays the generated payment link with QR code,
 * copy-to-clipboard, open-in-browser actions,
 * and a session expiry countdown timer (L-12).
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import { CreditCard, ExternalLink, Copy, CheckCircle2, Clock } from "lucide-react";
import type { SubscriptionDialogProps } from "../types";

/** Stripe checkout sessions expire after 24 hours by default */
const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000;

function useCountdown(isActive: boolean) {
  const [remaining, setRemaining] = useState(SESSION_EXPIRY_MS);

  const [prevIsActive, setPrevIsActive] = useState(isActive);
  if (isActive !== prevIsActive) {
    setPrevIsActive(isActive);
    setRemaining(SESSION_EXPIRY_MS);
  }

  useEffect(() => {
    if (!isActive) return;
    const start = Date.now();

    const tick = setInterval(() => {
      const elapsed = Date.now() - start;
      const left = Math.max(0, SESSION_EXPIRY_MS - elapsed);
      setRemaining(left);
      if (left <= 0) clearInterval(tick);
    }, 1000);
    return () => clearInterval(tick);
  }, [isActive]);

  const hours = Math.floor(remaining / 3_600_000);
  const minutes = Math.floor((remaining % 3_600_000) / 60_000);
  const seconds = Math.floor((remaining % 60_000) / 1000);
  const isExpired = remaining <= 0;
  const isUrgent = remaining < 3_600_000; // < 1 hour

  return { hours, minutes, seconds, isExpired, isUrgent, remaining };
}

function formatPad(n: number) {
  return n.toString().padStart(2, "0");
}

export function CheckoutDialog({ vm }: SubscriptionDialogProps) {
  const { t } = useI18n();
  const countdown = useCountdown(vm.showCheckoutDialog);

  const handleCopyLink = useCallback(() => {
    if (vm.checkoutUrl) {
      navigator.clipboard.writeText(vm.checkoutUrl);
    }
  }, [vm.checkoutUrl]);

  return (
    <Dialog open={vm.showCheckoutDialog} onOpenChange={vm.setShowCheckoutDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            {t("billing.dialogs.checkoutTitle") || "Payment Link Generated"}
          </DialogTitle>
          <DialogDescription>
            {t("billing.dialogs.checkoutDescription") || "Share this payment link with the tenant."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Session expiry timer (L-12) */}
          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 ${
              countdown.isExpired
                ? "border-red-500/30 bg-red-500/10"
                : countdown.isUrgent
                  ? "border-amber-500/30 bg-amber-500/10"
                  : "border-border bg-muted/50"
            }`}
          >
            <Clock
              className={`h-4 w-4 shrink-0 ${
                countdown.isExpired
                  ? "text-red-500"
                  : countdown.isUrgent
                    ? "text-amber-500"
                    : "text-muted-foreground"
              }`}
            />
            <span
              className={`font-mono text-sm tabular-nums ${
                countdown.isExpired
                  ? "text-red-600 dark:text-red-400"
                  : countdown.isUrgent
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-muted-foreground"
              }`}
            >
              {countdown.isExpired
                ? t("billing.dialogs.sessionExpired") || "Session expired — generate a new link"
                : `${t("billing.dialogs.expiresIn") || "Expires in"} ${formatPad(countdown.hours)}:${formatPad(countdown.minutes)}:${formatPad(countdown.seconds)}`}
            </span>
          </div>

          {/* Email sent indicator */}
          {vm.checkoutEmailSent && (
            <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-green-500" />
              <span className="text-sm text-green-700 dark:text-green-400">
                {t("billing.dialogs.emailSent") ||
                  "Payment link has been emailed to the tenant admin."}
              </span>
            </div>
          )}

          {/* QR Code */}
          {vm.checkoutQrCode && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground">
                {t("billing.dialogs.scanQrCode") || "Scan to open payment page"}
              </p>
              <div className="rounded-xl border bg-white p-3 shadow-sm">
                <img src={vm.checkoutQrCode} alt="Payment QR Code" className="h-48 w-48" />
              </div>
            </div>
          )}

          {/* Payment URL */}
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
            <Input
              readOnly
              value={vm.checkoutUrl}
              className="h-auto flex-1 border-0 bg-transparent p-0 text-xs focus-visible:ring-0"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={handleCopyLink}
            className="gap-2"
            disabled={countdown.isExpired}
          >
            <Copy className="h-4 w-4" />
            {t("billing.actions.copyLink") || "Copy Link"}
          </Button>
          <Button
            onClick={() => window.open(vm.checkoutUrl, "_blank")}
            className="gap-2"
            disabled={countdown.isExpired}
          >
            <ExternalLink className="h-4 w-4" />
            {t("billing.actions.openLink") || "Open Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
