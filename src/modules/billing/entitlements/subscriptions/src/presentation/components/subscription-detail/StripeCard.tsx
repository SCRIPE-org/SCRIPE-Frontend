/**
 * StripeCard — Payment Gateway Integration
 *
 * Shows Stripe customer ID, subscription ID, and actions
 * (Billing Portal, Cancel Stripe). Shows "Free Edition" state
 * when no payment gateway is needed.
 */
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Separator } from "@core/ui/separator";
import { DetailRow } from "@core/ui/detail-row";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { CreditCard, ExternalLink, Receipt, Sparkles, XSquare } from "lucide-react";
import type { SubscriptionListItem } from "../../../domain/entities/Subscription";
import type { useSubscriptionsViewModel } from "../../viewmodels/useSubscriptionsViewModel";

interface StripeCardProps {
  sub: SubscriptionListItem;
  vm: ReturnType<typeof useSubscriptionsViewModel>;
  t: (key: string) => string;
}

/**
 * Presentation UI component rendering the stripe card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function StripeCard({ sub, vm, t }: StripeCardProps) {
  const hasGatewayCustomer = !!sub.gatewayCustomerId;

  // Free edition — no gateway card needed
  if (!hasGatewayCustomer && (sub.totalAmount ?? 0) === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-nx-raised">
              <CreditCard className="h-4 w-4 text-nx-ink-2" aria-hidden="true" />
            </div>
            <CardTitle className="text-sm font-semibold">
              {t("entSubscriptions.paymentGateway")}
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-nx-raised">
              <Sparkles className="h-5 w-5 text-nx-ink-2" aria-hidden="true" />
            </div>
            <p className="text-sm font-medium text-nx-ink-2">
              {t("entSubscriptions.freeEdition")}
            </p>
            <p className="mt-1 text-xs text-nx-ink-3">
              {t("entSubscriptions.noPaymentGateway")}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-nx-md bg-nx-accent-wash">
            <CreditCard className="h-4 w-4 text-nx-accent" aria-hidden="true" />
          </div>
          <CardTitle className="text-sm font-semibold">
            {sub.paymentGateway || t("entSubscriptions.paymentGateway")}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        <DetailRow
          icon={CreditCard}
          label={t("entSubscriptions.customer")}
          value={
            sub.gatewayCustomerId ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <code className="rounded-nx-sm bg-nx-raised px-1.5 py-0.5 font-mono text-xs">
                      {sub.gatewayCustomerId.slice(0, 14)}...
                    </code>
                  </TooltipTrigger>
                  <TooltipContent>{sub.gatewayCustomerId}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="text-xs text-nx-ink-2">{t("entSubscriptions.notCreated")}</span>
            )
          }
        />
        <Separator />
        <DetailRow
          icon={Receipt}
          label={t("entSubscriptions.subscription")}
          value={
            sub.gatewaySubscriptionId ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <code className="rounded-nx-sm bg-nx-raised px-1.5 py-0.5 font-mono text-xs">
                      {sub.gatewaySubscriptionId.slice(0, 14)}...
                    </code>
                  </TooltipTrigger>
                  <TooltipContent>{sub.gatewaySubscriptionId}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="text-xs text-nx-ink-2">{t("entSubscriptions.notLinked")}</span>
            )
          }
        />

        {sub.gatewayCustomerId && (
          <>
            <Separator />
            <div className="space-y-2 pt-3">
              {sub.paymentGateway === "Stripe" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full cursor-pointer gap-2"
                  onClick={() => vm.openBillingPortal()}
                  disabled={vm.isOpeningPortal}
                >
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("billing.actions.openPortal")}
                </Button>
              )}
              {sub.gatewaySubscriptionId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full cursor-pointer gap-2 border-destructive/30 text-destructive hover:bg-destructive/10"
                  onClick={() => vm.setShowCancelGatewayDialog(true)}
                >
                  <XSquare className="h-3.5 w-3.5" aria-hidden="true" />
                  {t("billing.actions.cancelGateway")}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
