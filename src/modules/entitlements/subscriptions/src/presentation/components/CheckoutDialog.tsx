/**
 * Checkout Dialog (Payment Link)
 *
 * Displays the generated payment link with QR code,
 * copy-to-clipboard, and open-in-browser actions.
 */
"use client";

import { useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from "@core/ui/dialog";
import { Input } from "@core/ui/input";
import {
  CreditCard, ExternalLink, Copy, CheckCircle2,
} from "lucide-react";
import type { SubscriptionDialogProps } from "../types";

export function CheckoutDialog({ vm }: SubscriptionDialogProps) {
  const { t } = useI18n();

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
          {/* Email sent indicator */}
          {vm.checkoutEmailSent && (
            <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/30 px-3 py-2">
              <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
              <span className="text-sm text-green-700 dark:text-green-400">
                {t("billing.dialogs.emailSent") || "Payment link has been emailed to the tenant admin."}
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
                <img
                  src={vm.checkoutQrCode}
                  alt="Payment QR Code"
                  className="h-48 w-48"
                />
              </div>
            </div>
          )}

          {/* Payment URL */}
          <div className="flex items-center gap-2 rounded-lg bg-muted/50 border p-3">
            <Input
              readOnly
              value={vm.checkoutUrl}
              className="flex-1 text-xs bg-transparent border-0 h-auto p-0 focus-visible:ring-0"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCopyLink} className="gap-2">
            <Copy className="h-4 w-4" />
            {t("billing.actions.copyLink") || "Copy Link"}
          </Button>
          <Button
            onClick={() => window.open(vm.checkoutUrl, "_blank")}
            className="gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            {t("billing.actions.openLink") || "Open Link"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
