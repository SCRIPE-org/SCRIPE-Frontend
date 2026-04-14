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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@core/ui/tooltip";
import { CreditCard, ExternalLink, Receipt, Sparkles, XSquare } from "lucide-react";
import { InfoRow } from "./InfoRow";
import type { SubscriptionListItem } from "../../../domain/entities/Subscription";
import type { useSubscriptionsViewModel } from "../../viewmodels/useSubscriptionsViewModel";

interface StripeCardProps {
  sub: SubscriptionListItem;
  vm: ReturnType<typeof useSubscriptionsViewModel>;
  t: (key: string) => string;
}

export function StripeCard({ sub, vm, t }: StripeCardProps) {
  const hasStripe = !!sub.stripeCustomerId;

  // Free edition — no Stripe card needed
  if (!hasStripe && (sub.totalAmount ?? 0) === 0) {
    return (
      <Card className="border-border/50 border-dashed">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-zinc-500/10 flex items-center justify-center">
              <CreditCard className="h-4 w-4 text-zinc-500" />
            </div>
            <CardTitle className="text-sm font-semibold">Payment Gateway</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-10 w-10 rounded-full bg-muted/50 flex items-center justify-center mb-3">
              <Sparkles className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">Free Edition</p>
            <p className="text-xs text-muted-foreground/70 mt-1">No payment gateway required</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <CreditCard className="h-4 w-4 text-violet-500" />
          </div>
          <CardTitle className="text-sm font-semibold">Stripe</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-0">
        <InfoRow
          icon={<CreditCard className="h-3.5 w-3.5" />}
          label="Customer"
          value={
            sub.stripeCustomerId ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                      {sub.stripeCustomerId.slice(0, 14)}...
                    </code>
                  </TooltipTrigger>
                  <TooltipContent>{sub.stripeCustomerId}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="text-xs text-muted-foreground">Not created</span>
            )
          }
        />
        <Separator />
        <InfoRow
          icon={<Receipt className="h-3.5 w-3.5" />}
          label="Subscription"
          value={
            sub.stripeSubscriptionId ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                      {sub.stripeSubscriptionId.slice(0, 14)}...
                    </code>
                  </TooltipTrigger>
                  <TooltipContent>{sub.stripeSubscriptionId}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <span className="text-xs text-muted-foreground">Not linked</span>
            )
          }
        />

        {sub.stripeCustomerId && (
          <>
            <Separator />
            <div className="pt-3 space-y-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full gap-2 cursor-pointer"
                onClick={() => vm.openBillingPortal()}
                disabled={vm.isOpeningPortal}
              >
                <ExternalLink className="h-3.5 w-3.5" />
                {t("billing.actions.openPortal") || "Open Billing Portal"}
              </Button>
              {sub.stripeSubscriptionId && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full gap-2 text-destructive border-destructive/30 hover:bg-destructive/10 cursor-pointer"
                  onClick={() => vm.setShowCancelStripeDialog(true)}
                >
                  <XSquare className="h-3.5 w-3.5" />
                  {t("billing.actions.cancelStripe") || "Cancel Stripe Subscription"}
                </Button>
              )}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
