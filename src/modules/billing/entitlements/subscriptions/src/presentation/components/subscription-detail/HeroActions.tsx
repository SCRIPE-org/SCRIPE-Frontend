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
  DollarSign,
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

/**
 * Presentation UI component rendering the hero actions.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function HeroActions({ sub, vm, t }: HeroActionsProps) {
  const isActive = sub.status === "Active" || sub.status === "Trialing";
  const isPending = sub.status === "PendingPayment";
  const isSuspended = sub.status === "Suspended";
  const isTrialing = sub.status === "Trialing";
  const isFree = (sub.totalAmount ?? 0) === 0;
  const hasGatewayCustomer = !!sub.gatewayCustomerId;
  const hasGatewaySub = !!sub.gatewaySubscriptionId;
  const isStripe = sub.paymentGateway === "Stripe";

  // ── PendingPayment: Payment link actions ──
  if (isPending) {
    return (
      <>
        <Button
          size="sm"
          className="cursor-pointer gap-2"
          onClick={() => vm.openGatewaySelection("generate")}
          disabled={vm.isSendingPaymentLink}
          loading={vm.isSendingPaymentLink}
        >
          <CreditCard className="h-4 w-4" />
          {t("billing.actions.generateLink")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer gap-2"
          onClick={() => vm.openGatewaySelection("send")}
          disabled={vm.isSendingPaymentLink}
          loading={vm.isSendingPaymentLink}
        >
          <Zap className="h-4 w-4" />
          {t("billing.actions.generateAndSend")}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="cursor-pointer text-destructive"
              onClick={() => vm.setShowCancelDialog(true)}
            >
              <Ban className="me-2 h-4 w-4" />
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
          className="cursor-pointer gap-2"
          onClick={() => vm.resumeSubscription()}
          disabled={vm.isResuming}
        >
          <PlayCircle className="h-4 w-4" />
          {t("entSubscriptions.resume")}
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="cursor-pointer gap-2"
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
          className="cursor-pointer gap-2"
          onClick={() => vm.setShowChangeDialog(true)}
        >
          <ArrowRightLeft className="h-4 w-4" />
          {t("entSubscriptions.change")}
        </Button>

        {isTrialing && (
          <Button
            size="sm"
            className="cursor-pointer gap-2"
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
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => vm.setShowSuspendDialog(true)}
            >
              <PauseCircle className="me-2 h-4 w-4" />
              {t("entSubscriptions.suspend")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => vm.resyncPermissions()}
              disabled={vm.isResyncing}
            >
              <RotateCcw className="me-2 h-4 w-4" />
              {t("entSubscriptions.resync")}
            </DropdownMenuItem>
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => vm.setShowCurrencyDialog(true)}
            >
              <DollarSign className="me-2 h-4 w-4" />
              {t("entSubscriptions.changeCurrency")}
            </DropdownMenuItem>

            {hasGatewayCustomer && !isFree && isStripe && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => vm.openBillingPortal()}
                  disabled={vm.isOpeningPortal}
                >
                  <ExternalLink className="me-2 h-4 w-4" />
                  {t("billing.actions.openPortal")}
                </DropdownMenuItem>
              </>
            )}
            {hasGatewaySub && (
              <DropdownMenuItem
                className="cursor-pointer text-destructive"
                onClick={() => vm.setShowCancelGatewayDialog(true)}
              >
                <XSquare className="me-2 h-4 w-4" />
                {t("billing.actions.cancelGateway")}
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="cursor-pointer text-destructive"
              onClick={() => vm.setShowCancelDialog(true)}
            >
              <Ban className="me-2 h-4 w-4" />
              {t("entSubscriptions.cancel")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </>
    );
  }

  return null;
}
