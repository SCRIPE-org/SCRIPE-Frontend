"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { CreditCard, ExternalLink, RefreshCw, ArrowRight } from "lucide-react";

interface PayoutsEmptyStateProps {
  isOnboarding: boolean;
  onOnboard: () => void;
}

export function PayoutsEmptyState({ isOnboarding, onOnboard }: PayoutsEmptyStateProps) {
  const { t } = useI18n();

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle>{t("entitlements.stripeConnect.getStarted") || "Set Up Payouts"}</CardTitle>
        <CardDescription>
          {t("entitlements.stripeConnect.getStartedDesc") ||
            "Connect your bank account via Stripe to start receiving payouts."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="rounded-full bg-primary/10 p-6">
          <CreditCard className="h-10 w-10 text-primary" />
        </div>
        <h3 className="text-xl font-semibold">
          {t("entitlements.stripeConnect.readyToConnect") || "Ready to receive payouts?"}
        </h3>
        <p className="text-muted-foreground text-sm max-w-md">
          {t("entitlements.stripeConnect.readyToConnectDesc") ||
            "Click below to securely connect your bank account via Stripe. It takes just a few minutes."}
        </p>
        <Button size="lg" className="mt-2 gap-2" onClick={onOnboard} disabled={isOnboarding}>
          {isOnboarding
            ? <RefreshCw className="h-4 w-4 animate-spin" />
            : <ExternalLink className="h-4 w-4" />}
          {t("entitlements.stripeConnect.connectBankAccount") || "Connect Bank Account"}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
