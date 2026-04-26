/**
 * ConnectSummaryCard — Connect accounts stats + commission stats.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Separator } from "@core/ui/separator";
import { Users, CheckCircle2, Clock, XCircle, TrendingUp, Percent } from "lucide-react";
import { PlatformConnectSummary } from "../../domain/entities/PlatformStripeDashboard";

interface ConnectSummaryCardProps {
  connectSummary: PlatformConnectSummary;
}

export function ConnectSummaryCard({ connectSummary }: ConnectSummaryCardProps) {
  const { t } = useI18n();

  return (
    <Card className="shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-[#635bff]" />
          <CardTitle className="text-base">{t("entitlements.platformStripe.connectAccounts")}</CardTitle>
        </div>
        <CardDescription>{t("entitlements.platformStripe.connectDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBlock
            label={t("entitlements.platformStripe.total")}
            value={connectSummary.totalAccounts}
            icon={Users}
            color="text-[#635bff]"
          />
          <StatBlock
            label={t("entitlements.platformStripe.active")}
            value={connectSummary.activeAccounts}
            icon={CheckCircle2}
            color="text-emerald-500"
          />
          <StatBlock
            label={t("entitlements.platformStripe.pending")}
            value={connectSummary.pendingOnboarding}
            icon={Clock}
            color="text-amber-500"
          />
          <StatBlock
            label={t("entitlements.platformStripe.disabled")}
            value={connectSummary.disabledAccounts}
            icon={XCircle}
            color="text-red-500"
          />
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
              <span className="text-sm text-muted-foreground">{t("entitlements.platformStripe.totalCommissionsEarned")}</span>
            </div>
            <span className="font-bold text-emerald-600">
              ${connectSummary.totalCommissionsEarned.toFixed(2)}
            </span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2">
              <Percent className="h-4 w-4 text-amber-500" />
              <span className="text-sm text-muted-foreground">{t("entitlements.platformStripe.commissionsPending")}</span>
            </div>
            <span className="font-bold text-amber-600">
              ${connectSummary.totalCommissionsPending.toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Private Subcomponent ──

function StatBlock({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <div className="text-center p-3 rounded-lg bg-muted/30">
      <Icon className={`h-5 w-5 mx-auto mb-1.5 ${color}`} />
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
