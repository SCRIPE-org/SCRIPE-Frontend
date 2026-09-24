/**
 * Checkout Dialog (Payment Link)
 *
 * Displays the generated payment link with QR code,
 * copy-to-clipboard, open-in-browser actions,
 * and a session expiry countdown timer.
 */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
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
import Image from "next/image";

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

/**
 * Presentation UI component rendering the checkout dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CheckoutDialog({ vm }: SubscriptionDialogProps) {
  const { t } = useI18n();
  // KNOWN GAP: the gateway never hands this dialog a server-issued expiry
  // timestamp (no `checkoutExpiresAt` exists on SubscriptionsVM, and the
  // viewmodel/repository/mapper that would need to carry one live outside
  // this package). The countdown below still measures 24h from the moment
  // THIS dialog opens rather than from when the gateway actually issued the
  // session, so a session reopened after being left idle will show more time
  // remaining than the gateway will actually honor.
  const countdown = useCountdown(vm.showCheckoutDialog);

  const checkoutUrl = vm.checkoutUrl;
  const handleCopyLink = useCallback(() => {
    if (checkoutUrl) {
      navigator.clipboard.writeText(checkoutUrl);
    }
  }, [checkoutUrl]);

  return (
    <Dialog open={vm.showCheckoutDialog} onOpenChange={vm.setShowCheckoutDialog}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-nx-accent" aria-hidden="true" />
            {t("billing.dialogs.checkoutTitle")}
          </DialogTitle>
          <DialogDescription>{t("billing.dialogs.checkoutDescription")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Session expiry timer */}
          <div
            className={cn(
              "flex items-center gap-2 rounded-nx-md border px-3 py-2",
              countdown.isExpired
                ? "border-destructive/30 bg-destructive/10"
                : countdown.isUrgent
                  ? "border-warning/30 bg-warning/10"
                  : "border-nx-line bg-nx-raised"
            )}
          >
            <Clock
              className={cn(
                "h-4 w-4 shrink-0",
                countdown.isExpired
                  ? "text-destructive"
                  : countdown.isUrgent
                    ? "text-warning"
                    : "text-nx-ink-3"
              )}
              aria-hidden="true"
            />
            <span
              className={cn(
                "font-mono text-sm tabular-nums",
                countdown.isExpired
                  ? "text-destructive"
                  : countdown.isUrgent
                    ? "text-warning"
                    : "text-nx-ink-3"
              )}
            >
              {countdown.isExpired
                ? t("billing.dialogs.sessionExpired")
                : `${t("billing.dialogs.expiresIn")} ${formatPad(countdown.hours)}:${formatPad(countdown.minutes)}:${formatPad(countdown.seconds)}`}
            </span>
          </div>

          {/* Email sent indicator */}
          {vm.checkoutEmailSent && (
            <div className="flex items-center gap-2 rounded-nx-md border border-success/30 bg-success/10 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden="true" />
              <span className="text-sm text-success">{t("billing.dialogs.emailSent")}</span>
            </div>
          )}

          {/* QR Code */}
          {vm.checkoutQrCode && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-nx-ink-3">{t("billing.dialogs.scanQrCode")}</p>
              {/* The plate is pinned to the one ink-neutral surface rather
                  than an nx step — a QR scanner needs guaranteed maximum
                  contrast against the code regardless of the active theme. */}
              <div className="rounded-nx-lg border border-nx-line bg-[var(--nx-on-fill)] p-3 shadow-nx-sm">
                <Image
                  src={vm.checkoutQrCode}
                  alt={t("billing.dialogs.qrCodeAlt")}
                  width={192}
                  height={192}
                  unoptimized
                  className="h-48 w-48"
                />
              </div>
            </div>
          )}

          {/* Payment URL */}
          <div className="flex items-center gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-3">
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
            <Copy className="h-4 w-4" aria-hidden="true" />
            {t("billing.actions.copyLink")}
          </Button>
          <Button
            onClick={() => window.open(vm.checkoutUrl, "_blank")}
            className="gap-2"
            disabled={countdown.isExpired}
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            {t("billing.actions.openLink")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
