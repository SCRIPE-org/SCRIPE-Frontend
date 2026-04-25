"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { CreditCard, ArrowRight } from "lucide-react";

/**
 * PayoutsEmptyState
 *
 * Shown when the tenant has not yet onboarded their Stripe Connect account.
 * Instead of duplicating the onboarding flow inline, this component redirects
 * to the dedicated /my-stripe-account page which owns the full onboarding UX.
 *
 * Architecture: Single ownership of onboarding → /my-stripe-account
 */
export function PayoutsEmptyState() {
  const { t } = useI18n();
  const router = useRouter();

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
            "Set up your payment account to securely receive automated payouts from your sales."}
        </p>
        <Button
          size="lg"
          className="mt-2 gap-2"
          onClick={() => router.push("/my-stripe-account")}
        >
          <CreditCard className="h-4 w-4" />
          {t("entitlements.tenantConnect.getStartedBtn") || "Get Started"}
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
}
