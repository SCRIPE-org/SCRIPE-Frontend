/**
 * BalanceCards — 3-column grid showing Available, Pending, Connect Reserved balances.
 */
"use client";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent } from "@core/ui/card";
import { CheckCircle2, Clock, Shield } from "lucide-react";
import { PlatformBalance } from "../../domain/entities/PlatformStripeDashboard";
import { formatStripeCurrency } from "./utils";

interface BalanceCardsProps {
  balance: PlatformBalance;
}

/**
 * Presentation UI component rendering the balance cards.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function BalanceCards({ balance }: BalanceCardsProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <BalanceCard
        title={t("entitlements.platformStripe.balanceAvailable")}
        amounts={balance.available}
        icon={CheckCircle2}
        gradient="from-success to-success/70"
        iconColor="text-success"
      />
      <BalanceCard
        title={t("entitlements.platformStripe.balancePending")}
        amounts={balance.pending}
        icon={Clock}
        gradient="from-warning to-warning/70"
        iconColor="text-warning"
      />
      <BalanceCard
        title={t("entitlements.platformStripe.balanceConnectReserved")}
        amounts={balance.connectReserved}
        icon={Shield}
        gradient="from-primary to-primary/70"
        iconColor="text-primary"
      />
    </div>
  );
}

// ── Private Subcomponent ──

function BalanceCard({
  title,
  amounts,
  icon: Icon,
  gradient,
  iconColor,
}: {
  title: string;
  amounts: { currency: string; amount: number }[];
  icon: React.ElementType;
  gradient: string;
  iconColor: string;
}) {
  return (
    <Card className="relative overflow-hidden shadow-md transition-shadow duration-300 hover:shadow-lg">
      <div className={`absolute left-0 right-0 top-0 h-0.5 bg-gradient-to-r ${gradient}`} />
      <CardContent className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        {amounts.length === 0 ? (
          <p className="text-2xl font-bold">$0.00</p>
        ) : (
          <div className="space-y-1">
            {amounts.map((b, i) => (
              <p key={i} className="text-2xl font-bold tracking-tight">
                {formatStripeCurrency(b.amount, b.currency)}
              </p>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
