/**
 * BalanceCards — 3-column grid showing Available, Pending, Connect Reserved balances.
 */
"use client";
import { useI18n } from "@core/providers/i18n-provider";
import { StatCard, type StatTone } from "@core/ui/stat-card";
import { CheckCircle2, Clock, Shield } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { BalanceAmount, PlatformBalance } from "../../domain/entities/PlatformStripeDashboard";
import { formatMajorCurrency, formatStripeCurrency } from "./utils";

interface BalanceCardsProps {
  balance: PlatformBalance;
  /** Currency a zero balance is reported in — the account's own default. */
  defaultCurrency: string;
}

/**
 * Presentation UI component rendering the balance cards.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function BalanceCards({ balance, defaultCurrency }: BalanceCardsProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <BalanceStat
        label={t("entitlements.platformStripe.balanceAvailable")}
        amounts={balance.available}
        icon={CheckCircle2}
        tone="success"
        defaultCurrency={defaultCurrency}
      />
      <BalanceStat
        label={t("entitlements.platformStripe.balancePending")}
        amounts={balance.pending}
        icon={Clock}
        tone="warning"
        defaultCurrency={defaultCurrency}
      />
      <BalanceStat
        label={t("entitlements.platformStripe.balanceConnectReserved")}
        amounts={balance.connectReserved}
        icon={Shield}
        tone="info"
        defaultCurrency={defaultCurrency}
      />
    </div>
  );
}

// ── Private Subcomponent ──

function BalanceStat({
  label,
  amounts,
  icon,
  tone,
  defaultCurrency,
}: {
  label: string;
  amounts: BalanceAmount[];
  icon: LucideIcon;
  tone: StatTone;
  defaultCurrency: string;
}) {
  // A platform can settle in several currencies at once. The account's own
  // currency leads as the figure; the rest ride the subtitle rather than
  // stacking three heroes in one card.
  const [primary, ...rest] = amounts;

  return (
    <StatCard
      label={label}
      value={
        primary
          ? formatStripeCurrency(primary.amount, primary.currency)
          : formatMajorCurrency(0, defaultCurrency || "usd")
      }
      subtitle={
        rest.length > 0
          ? rest.map((b) => formatStripeCurrency(b.amount, b.currency)).join(" · ")
          : undefined
      }
      icon={icon}
      tone={tone}
    />
  );
}
