"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { Skeleton } from "@core/ui/skeleton";
import { DollarSign, Receipt, Banknote, TrendingUp } from "lucide-react";
import type { ComponentType } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────
const fmt = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);

type Accent = "green" | "red" | "default";
const ACCENT_CLASS: Record<Accent, string> = {
  green: "text-emerald-500",
  red: "text-red-500",
  default: "text-primary",
};

// ─────────────────────────────────────────────────────────────────────────────
// KpiCard (private — file-scoped)
// ─────────────────────────────────────────────────────────────────────────────
interface KpiCardProps {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
  accent?: Accent;
}

function KpiCard({ icon: Icon, label, value, sub, accent = "default" }: KpiCardProps) {
  const color = ACCENT_CLASS[accent];
  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="mb-2 flex items-center gap-2">
          <div className={`rounded-lg bg-muted p-1.5 ${color}`}>
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
        </div>
        <p className={`text-2xl font-bold tabular-nums tracking-tight ${color}`}>{value}</p>
        {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

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
 * React presentation component representing the payouts kpi row UI element.
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
          <Card key={i}>
            <CardContent className="p-5">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard
        icon={DollarSign}
        label={t("entitlements.stripeConnect.lifetimeGross") || "Total Gross"}
        value={fmt(lifetimeGross)}
        sub={`${lifetimePaid} ${t("entitlements.stripeConnect.transactions") || "transactions"}`}
      />
      <KpiCard
        icon={Receipt}
        label={t("entitlements.stripeConnect.platformFee") || "Platform Fee"}
        value={fmt(lifetimeFee)}
        sub={`${(effectiveRate * 100).toFixed(1)}% ${t("entitlements.stripeConnect.commissionRate") || "rate"}`}
        accent="red"
      />
      <KpiCard
        icon={Banknote}
        label={t("entitlements.stripeConnect.netEarnings") || "Net Earnings"}
        value={fmt(lifetimeNet)}
        sub={t("entitlements.stripeConnect.afterFees") || "After platform fees"}
        accent="green"
      />
      <KpiCard
        icon={TrendingUp}
        label={t("entitlements.stripeConnect.payoutsEnabled") || "Payouts Enabled"}
        value={payoutsEnabled ? t("common.yes") || "Yes" : t("common.pending") || "Pending"}
        sub={
          chargesEnabled
            ? t("entitlements.stripeConnect.chargesActive") || "Charges active"
            : t("entitlements.stripeConnect.onboardingRequired") || "Complete setup"
        }
        accent={payoutsEnabled ? "green" : "default"}
      />
    </div>
  );
}
