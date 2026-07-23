"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { StatCard } from "@core/ui/stat-card";
import { DollarSign, Receipt, Banknote, TrendingUp } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

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
        label={t("entitlements.stripeConnect.lifetimeGross") || "Total Gross"}
        value={fmt(lifetimeGross)}
        subtitle={`${lifetimePaid} ${t("entitlements.stripeConnect.transactions") || "transactions"}`}
      />
      <StatCard
        icon={Receipt}
        label={t("entitlements.stripeConnect.platformFee") || "Platform Fee"}
        value={fmt(lifetimeFee)}
        subtitle={`${(effectiveRate * 100).toFixed(1)}% ${t("entitlements.stripeConnect.commissionRate") || "rate"}`}
        tone="danger"
      />
      <StatCard
        icon={Banknote}
        label={t("entitlements.stripeConnect.netEarnings") || "Net Earnings"}
        value={fmt(lifetimeNet)}
        subtitle={t("entitlements.stripeConnect.afterFees") || "After platform fees"}
        tone="success"
      />
      <StatCard
        icon={TrendingUp}
        label={t("entitlements.stripeConnect.payoutsEnabled") || "Payouts Enabled"}
        value={payoutsEnabled ? t("common.yes") || "Yes" : t("common.pending") || "Pending"}
        subtitle={
          chargesEnabled
            ? t("entitlements.stripeConnect.chargesActive") || "Charges active"
            : t("entitlements.stripeConnect.onboardingRequired") || "Complete setup"
        }
        tone={payoutsEnabled ? "success" : "neutral"}
      />
    </div>
  );
}
