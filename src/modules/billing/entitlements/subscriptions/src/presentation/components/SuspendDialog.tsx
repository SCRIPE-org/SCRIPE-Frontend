/**
 * Suspend Subscription Dialog
 *
 * Allows admins to temporarily suspend a tenant's subscription.
 * Supports reason input, fallback downgrade, and refund options.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Button } from "@core/ui/button";
import { Checkbox } from "@core/ui/checkbox";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@core/ui/alert-dialog";
import { Label } from "@core/ui/label";
import { Textarea } from "@core/ui/textarea";
import type { SubscriptionDialogProps } from "../types";
import { RefundOptions } from "./RefundOptions";

/**
 * Presentation UI component rendering the suspend dialog.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function SuspendDialog({ vm }: SubscriptionDialogProps) {
  const { t } = useI18n();

  return (
    <AlertDialog open={vm.showSuspendDialog} onOpenChange={vm.setShowSuspendDialog}>
      <AlertDialogContent
        // A suspend in flight stops being dismissable: Escape used to be able
        // to close this over a pending mutation with no UI left to report
        // whether the suspension actually completed.
        onEscapeKeyDown={(event) => {
          if (vm.isSuspending) event.preventDefault();
        }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{t("entSubscriptions.suspend")}</AlertDialogTitle>
          <AlertDialogDescription>{t("entSubscriptions.suspendDesc")}</AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>{t("entSubscriptions.reason")}</Label>
            <Textarea
              value={vm.suspendReason}
              onChange={(e) => vm.setSuspendReason(e.target.value)}
              placeholder={t("entSubscriptions.reasonPlaceholder")}
              rows={3}
              disabled={vm.isSuspending}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox
              id="use-fallback-suspend"
              checked={vm.useFallback}
              onCheckedChange={(v) => vm.setUseFallback(!!v)}
              disabled={vm.isSuspending}
            />
            <Label htmlFor="use-fallback-suspend" className="text-sm font-normal">
              {t("entSubscriptions.useFallback")}
            </Label>
          </div>

          <RefundOptions
            refundType={vm.refundType}
            onRefundTypeChange={vm.setRefundType}
            customRefundAmount={vm.customRefundAmount}
            onCustomRefundAmountChange={vm.setCustomRefundAmount}
            idPrefix="suspend"
          />
        </div>

        <AlertDialogFooter>
          <Button
            variant="outline"
            onClick={() => vm.setShowSuspendDialog(false)}
            disabled={vm.isSuspending}
          >
            {t("common.cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={vm.submitSuspend}
            loading={vm.isSuspending}
            disabled={!vm.suspendReason.trim()}
          >
            {t("entSubscriptions.suspend")}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
