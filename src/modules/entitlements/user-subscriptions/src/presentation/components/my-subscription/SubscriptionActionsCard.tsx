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
            <CreditCard className="h-5 w-5 text-primary" />
            {t("entitlements.mySubscription.actions") || "Manage"}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          {/* Stripe Customer Portal placeholder */}
          <Button variant="outline" disabled>
            <CreditCard className="h-4 w-4 me-2" />
            {t("entitlements.mySubscription.manageBilling") || "Manage Billing"}
            <span className="ms-1.5 text-xs text-muted-foreground">(Coming Soon)</span>
          </Button>

          {canCancel && (
            <Button
              variant="destructive"
              onClick={() => setShowCancelDialog(true)}
              loading={isCancelling}
            >
              {!isCancelling && <XCircle className="h-4 w-4 me-2" />}
              {t("entitlements.mySubscription.cancel") || "Cancel Subscription"}
            </Button>
          )}

          {subscription.isCancelled && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {t("entitlements.mySubscription.alreadyCancelled") || "This subscription has been cancelled."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Cancel Confirmation Dialog ── */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t("entitlements.mySubscription.cancelTitle") || "Cancel Subscription?"}
            </DialogTitle>
            <DialogDescription>
              {t("entitlements.mySubscription.cancelDesc") ||
                "Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              {t("common.goBack") || "Go Back"}
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel} loading={isCancelling}>
              {t("entitlements.mySubscription.confirmCancel") || "Yes, Cancel"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
