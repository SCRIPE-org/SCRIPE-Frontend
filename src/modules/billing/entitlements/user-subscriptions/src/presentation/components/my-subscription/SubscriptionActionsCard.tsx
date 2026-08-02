/**
 * SubscriptionActionsCard — Cancel and future billing management actions.
 *
 * Stripe-ready: Phase 10 will add a "Manage Billing" button that opens
 * the Stripe Customer Portal.
 */
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { AlertTriangle, CreditCard, XCircle } from "lucide-react";
import type { UserSubscription } from "../../../domain/entities/UserSubscription";

interface SubscriptionActionsCardProps {
  subscription: UserSubscription;
  onCancel: () => void;
  isCancelling: boolean;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the subscription actions card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function SubscriptionActionsCard({
  subscription,
  onCancel,
  isCancelling,
  t,
}: SubscriptionActionsCardProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const canCancel = subscription.isActive && !subscription.isCancelled;

  const handleConfirmCancel = () => {
    onCancel();
    setShowCancelDialog(false);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-nx-accent" aria-hidden="true" />
            {t("entitlements.mySubscription.actions")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {/* Stripe Customer Portal placeholder */}
          <Button variant="outline" disabled>
            <CreditCard className="me-2 h-4 w-4" aria-hidden="true" />
            {t("entitlements.mySubscription.manageBilling")}
            <span className="ms-1.5 text-xs text-nx-ink-3">({t("common.comingSoon")})</span>
          </Button>

          {canCancel && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
              loading={isCancelling}
            >
              {!isCancelling && <XCircle className="me-2 h-4 w-4" aria-hidden="true" />}
              {t("entitlements.mySubscription.cancel")}
            </Button>
          )}

          {subscription.isCancelled && (
            <div className="flex items-center gap-2 text-sm text-nx-ink-2">
              <AlertTriangle className="h-4 w-4 text-warning" aria-hidden="true" />
              {t("entitlements.mySubscription.alreadyCancelled")}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Cancel Confirmation Dialog ── */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("entitlements.mySubscription.cancelTitle")}</DialogTitle>
            <DialogDescription>{t("entitlements.mySubscription.cancelDesc")}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              {t("common.goBack")}
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel} loading={isCancelling}>
              {t("entitlements.mySubscription.confirmCancel")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
