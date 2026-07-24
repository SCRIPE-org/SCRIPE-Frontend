/**
 * ConnectSummaryCard — Connect accounts stats + commission stats.
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { DetailRow } from "@core/ui/detail-row";
import { Separator } from "@core/ui/separator";
import { StatCard } from "@core/ui/stat-card";
import { Users, CheckCircle2, Clock, XCircle, TrendingUp, Percent } from "lucide-react";
import { PlatformConnectSummary } from "../../domain/entities/PlatformStripeDashboard";
import { formatMajorCurrency } from "./utils";

interface ConnectSummaryCardProps {
  connectSummary: PlatformConnectSummary;
  /** Currency the commission totals are denominated in. */
  currency: string;
}

/**
 * Presentation UI component rendering the connect summary card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function ConnectSummaryCard({ connectSummary, currency }: ConnectSummaryCardProps) {
  const { t } = useI18n();
  const code = currency || "usd";

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-nx-ink-3" aria-hidden="true" />
          <CardTitle className="text-base">
            {t("entitlements.platformStripe.connectAccounts")}
          </CardTitle>
        </div>
        <CardDescription>{t("entitlements.platformStripe.connectDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard
            label={t("entitlements.platformStripe.total")}
            value={connectSummary.totalAccounts.toLocaleString()}
            icon={Users}
          />
          <StatCard
            label={t("entitlements.platformStripe.active")}
            value={connectSummary.activeAccounts.toLocaleString()}
            icon={CheckCircle2}
            tone="success"
          />
          <StatCard
            label={t("entitlements.platformStripe.pending")}
            value={connectSummary.pendingOnboarding.toLocaleString()}
            icon={Clock}
            tone="warning"
          />
          <StatCard
            label={t("entitlements.platformStripe.disabled")}
            value={connectSummary.disabledAccounts.toLocaleString()}
            icon={XCircle}
            tone="danger"
          />
        </div>

        <Separator className="my-4" />

        <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
          <DetailRow
            icon={TrendingUp}
            label={t("entitlements.platformStripe.totalCommissionsEarned")}
            value={formatMajorCurrency(connectSummary.totalCommissionsEarned, code)}
          />
          <DetailRow
            icon={Percent}
            label={t("entitlements.platformStripe.commissionsPending")}
            value={formatMajorCurrency(connectSummary.totalCommissionsPending, code)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
