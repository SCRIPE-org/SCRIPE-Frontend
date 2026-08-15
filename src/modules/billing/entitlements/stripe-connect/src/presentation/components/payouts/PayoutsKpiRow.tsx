"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { StatCard } from "@core/ui/stat-card";
import { DollarSign, Receipt, Banknote, TrendingUp } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
// Backend already returns dollar-denominated decimals (converted from Stripe cents server-side).
const fmt = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

// ─────────────────────────────────────────────────────────────────────────────
// PayoutsKpiRow
// ─────────────────────────────────────────────────────────────────────────────
interface PayoutsKpiRowProps {
  lifetimeGross: number;
  lifetimeFee: number;
  lifetimeNet: number;
  lifetimePaid: number;
  effectiveRate: number;
  payoutsEnabled: boolean;
  chargesEnabled: boolean;
  isLoading?: boolean;
}

/**
 * Presentation UI component rendering the payouts kpi row.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function PayoutsKpiRow({
  lifetimeGross,
  lifetimeFee,
  lifetimeNet,
  lifetimePaid,
  effectiveRate,
  payoutsEnabled,
  chargesEnabled,
  isLoading,
}: PayoutsKpiRowProps) {
  const { t } = useI18n();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCard key={i} isLoading label="" value="" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={DollarSign}
        label={t("entitlements.stripeConnect.lifetimeGross")}
        value={fmt(lifetimeGross)}
        subtitle={`${lifetimePaid} ${t("entitlements.stripeConnect.transactions")}`}
      />
      <StatCard
        icon={Receipt}
        label={t("entitlements.stripeConnect.platformFee")}
        value={fmt(lifetimeFee)}
        subtitle={`${(effectiveRate * 100).toFixed(1)}% ${t("entitlements.stripeConnect.commissionRate")}`}
        tone="danger"
      />
      <StatCard
        icon={Banknote}
        label={t("entitlements.stripeConnect.netEarnings")}
        value={fmt(lifetimeNet)}
        subtitle={t("entitlements.stripeConnect.afterFees")}
        tone="success"
      />
      <StatCard
        icon={TrendingUp}
        label={t("entitlements.stripeConnect.payoutsEnabled")}
        value={payoutsEnabled ? t("common.yes") : t("common.pending")}
        subtitle={
          chargesEnabled
            ? t("entitlements.stripeConnect.chargesActive")
            : t("entitlements.stripeConnect.onboardingRequired")
        }
        tone={payoutsEnabled ? "success" : "neutral"}
      />
    </div>
  );
}
