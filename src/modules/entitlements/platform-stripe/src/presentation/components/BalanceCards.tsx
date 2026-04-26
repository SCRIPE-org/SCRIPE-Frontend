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

export function BalanceCards({ balance }: BalanceCardsProps) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <BalanceCard
        title={t("entitlements.platformStripe.balanceAvailable")}
        amounts={balance.available}
        icon={CheckCircle2}
        gradient="from-emerald-500 to-teal-600"
        iconColor="text-emerald-500"
      />
      <BalanceCard
        title={t("entitlements.platformStripe.balancePending")}
        amounts={balance.pending}
        icon={Clock}
        gradient="from-amber-500 to-yellow-600"
        iconColor="text-amber-500"
      />
      <BalanceCard
        title={t("entitlements.platformStripe.balanceConnectReserved")}
        amounts={balance.connectReserved}
        icon={Shield}
        gradient="from-violet-500 to-purple-600"
        iconColor="text-violet-500"
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
    <Card className="relative overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${gradient}`} />
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground font-medium">{title}</span>
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
