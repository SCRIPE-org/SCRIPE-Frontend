"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useRouter } from "next/navigation";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { CreditCard, ArrowRight } from "lucide-react";

/**
 * PayoutsEmptyState
 *
 * Shown when the tenant has not yet onboarded their Stripe Connect account.
 * Composes the core EmptyState (@core/ui/empty-state); rather than duplicating
 * the onboarding flow inline, the action redirects to the dedicated
 * /my-stripe-account page which owns the full onboarding UX.
 *
 * Architecture: Single ownership of onboarding → /my-stripe-account
 */
export function PayoutsEmptyState() {
  const { t } = useI18n();
  const router = useRouter();

  return (
    <EmptyState
      icon={CreditCard}
      title={t("entitlements.stripeConnect.readyToConnect") || "Ready to receive payouts?"}
      description={
        t("entitlements.stripeConnect.readyToConnectDesc") ||
        "Set up your payment account to securely receive automated payouts from your sales."
      }
      action={
        <Button size="lg" className="gap-2" onClick={() => router.push("/my-stripe-account")}>
          <CreditCard className="h-4 w-4" />
          {t("entitlements.tenantConnect.getStartedBtn") || "Get Started"}
          <ArrowRight className="ms-1 h-4 w-4" />
        </Button>
      }
    />
  );
}
