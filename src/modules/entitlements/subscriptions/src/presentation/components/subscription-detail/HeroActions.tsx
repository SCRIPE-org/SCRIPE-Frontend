/**
 * HeroActions — Context-Aware Action Buttons
 *
 * Renders the appropriate action buttons based on subscription status:
 * - Active/Trialing: Change Plan, Convert Trial, dropdown (Suspend, Resync, Cancel, Stripe)
 * - PendingPayment: Generate Link, Send Link, Revoke
 * - Suspended: Resume, Resync
 *
 * BUG FIX: Payment link buttons only show for PendingPayment, NOT Active.
 */
"use client";

import type { SubscriptionListItem } from "../../../domain/entities/Subscription";
import type { useSubscriptionsViewModel } from "../../viewmodels/useSubscriptionsViewModel";
import { Button } from "@core/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import {
  ArrowRightLeft,
  Ban,
  CreditCard,
  ExternalLink,
  MoreVertical,
  PauseCircle,
  PlayCircle,
  RotateCcw,
  Shield,
  XSquare,
  Zap,
} from "lucide-react";

interface HeroActionsProps {
  sub: SubscriptionListItem;
  vm: ReturnType<typeof useSubscriptionsViewModel>;
  t: (key: string) => string;
}

export function HeroActions({ sub, vm, t }: HeroActionsProps) {
  const isActive = sub.status === "Active" || sub.status === "Trialing";
  const isPending = sub.status === "PendingPayment";
  const isSuspended = sub.status === "Suspended";
  const isTrialing = sub.status === "Trialing";
  const isFree = (sub.totalAmount ?? 0) === 0;
  const hasStripe = !!sub.stripeCustomerId;
  const hasStripeSub = !!sub.stripeSubscriptionId;

  // ── PendingPayment: Payment link actions ──
  if (isPending) {
    return (
      <>
        <Button
          size="sm"
          className="gap-2 cursor-pointer"
          onClick={() => vm.generatePaymentLink()}
          disabled={vm.isSendingPaymentLink}
        >
          <CreditCard className="h-4 w-4" />
          {t("billing.actions.generateLink") || "Generate Link"}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 cursor-pointer"
          onClick={() => vm.sendPaymentLink()}
          disabled={vm.isSendingPaymentLink}
        >
          <Zap className="h-4 w-4" />
          {t("billing.actions.generateAndSend") || "Send Link"}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={() => vm.setShowCancelDialog(true)}
            >
              <Ban className="h-4 w-4 me-2" />
              {t("entSubscriptions.revoke")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  // ── Suspended: Resume ──
  if (isSuspended) {
    return (
      <>
        <Button
          size="sm"
          className="gap-2 cursor-pointer"
          onClick={() => vm.resumeSubscription()}
          disabled={vm.isResuming}
        >
          <PlayCircle className="h-4 w-4" />
          {t("entSubscriptions.resume")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 cursor-pointer"
          onClick={() => vm.resyncPermissions()}
          disabled={vm.isResyncing}
        >
          <RotateCcw className="h-4 w-4" />
          {t("entSubscriptions.resync")}
        </Button>
      </>
    );
  }

  // ── Active / Trialing: Full action set ──
  if (isActive) {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          className="gap-2 cursor-pointer"
          onClick={() => vm.setShowChangeDialog(true)}
        >
          <ArrowRightLeft className="h-4 w-4" />
          {t("entSubscriptions.change")}
        </Button>

        {isTrialing && (
          <Button
            size="sm"
            className="gap-2 cursor-pointer"
            onClick={() => vm.setShowConvertDialog(true)}
          >
            <Shield className="h-4 w-4" />
            {t("entSubscriptions.convertTrial")}
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuItem className="cursor-pointer" onClick={() => vm.setShowSuspendDialog(true)}>
              <PauseCircle className="h-4 w-4 me-2" />
              {t("entSubscriptions.suspend")}
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer" onClick={() => vm.resyncPermissions()} disabled={vm.isResyncing}>
              <RotateCcw className="h-4 w-4 me-2" />
              {t("entSubscriptions.resync")}
            </DropdownMenuItem>

            {hasStripe && !isFree && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer" onClick={() => vm.openBillingPortal()} disabled={vm.isOpeningPortal}>
                  <ExternalLink className="h-4 w-4 me-2" />
                  {t("billing.actions.openPortal") || "Billing Portal"}
                </DropdownMenuItem>
              </>
            )}
            {hasStripeSub && (
              <DropdownMenuItem
                className="text-destructive cursor-pointer"
                onClick={() => vm.setShowCancelStripeDialog(true)}
              >
                <XSquare className="h-4 w-4 me-2" />
                {t("billing.actions.cancelStripe") || "Cancel Stripe"}
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive cursor-pointer"
              onClick={() => vm.setShowCancelDialog(true)}
            >
              <Ban className="h-4 w-4 me-2" />
              {t("entSubscriptions.cancel")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  return null;
}
