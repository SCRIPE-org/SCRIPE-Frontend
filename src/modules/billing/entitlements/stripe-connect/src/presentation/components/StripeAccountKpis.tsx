"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { StatCard } from "@core/ui/stat-card";
import { DetailRow } from "@core/ui/detail-row";
import { Badge } from "@core/ui/badge";
import { Separator } from "@core/ui/separator";
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  LayoutDashboard,
  Banknote,
  Zap,
  Calendar,
  Globe,
  Building2,
  Hash,
} from "lucide-react";

interface StripeAccountKpisProps {
  account: {
    stripeAccountId: string;
    chargesEnabled: boolean;
    payoutsEnabled: boolean;
    defaultCurrency?: string;
    country?: string;
    effectiveCommissionRate: number;
    totalPayoutsAmount: number;
    totalPayoutsCount: number;
    payoutDelayDays: number;
    lastPayoutAt?: string;
    onboardingCompletedAt?: string;
  };
  onOpenDashboard: () => void;
  isOpeningDashboard: boolean;
  onSync: () => void;
  isSyncing: boolean;
}

/**
 * Presentation UI component rendering the stripe account kpis.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function StripeAccountKpis({
  account,
  onOpenDashboard,
  isOpeningDashboard,
  onSync,
  isSyncing,
}: StripeAccountKpisProps) {
  const { t, language } = useI18n();

  const formatCurrency = (amount: number) => {
    const currency = account.defaultCurrency?.toUpperCase() || "USD";
    return new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "—";
    return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-5">
          <div className="flex items-center gap-3">
            <div
              className="grid h-10 w-10 shrink-0 place-items-center rounded-nx-md border border-success/30 bg-success/10 text-success"
              aria-hidden="true"
            >
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-nx-ink">
                {t("entitlements.tenantConnect.accountReady")}
              </h2>
              <p className="mt-0.5 text-sm text-nx-ink-2">
                {t("entitlements.tenantConnect.accountReadyDesc")}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={onSync} loading={isSyncing}>
              {!isSyncing && <RefreshCw className="me-1.5 h-3.5 w-3.5" aria-hidden="true" />}
              {t("entitlements.tenantConnect.syncBtn")}
            </Button>
            <Button size="sm" onClick={onOpenDashboard} loading={isOpeningDashboard}>
              {!isOpeningDashboard && (
                <LayoutDashboard className="me-1.5 h-4 w-4" aria-hidden="true" />
              )}
              {t("entitlements.stripeConnect.openStripeDashboard")}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Banknote}
          tone="info"
          label={t("entitlements.tenantConnect.totalPayouts")}
          value={formatCurrency(account.totalPayoutsAmount)}
          subtitle={`${account.totalPayoutsCount} ${t("entitlements.tenantConnect.transactions")}`}
        />
        <StatCard
          icon={Zap}
          tone="neutral"
          label={t("entitlements.tenantConnect.commissionRate")}
          value={`${(account.effectiveCommissionRate * 100).toFixed(1)}%`}
          subtitle={t("entitlements.tenantConnect.perTransaction")}
        />
        <StatCard
          icon={Calendar}
          tone="warning"
          label={t("entitlements.tenantConnect.payoutSchedule")}
          value={
            account.payoutDelayDays === 0
              ? t("entitlements.tenantConnect.instant")
              : `${account.payoutDelayDays} ${t("entitlements.tenantConnect.days")}`
          }
          subtitle={t("entitlements.tenantConnect.afterPayment")}
        />
        <StatCard
          icon={Calendar}
          tone="success"
          label={t("entitlements.tenantConnect.lastPayout")}
          value={formatDate(account.lastPayoutAt)}
          subtitle={account.lastPayoutAt ? undefined : t("entitlements.tenantConnect.noPayout")}
        />
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader className="border-b border-nx-line pb-3">
          <CardTitle className="text-base">
            {t("entitlements.tenantConnect.accountDetails")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
            <DetailRow
              icon={Hash}
              label={t("entitlements.stripeConnect.stripeAccountId")}
              value={account.stripeAccountId}
              mono
            />
            <DetailRow
              icon={Globe}
              label={t("entitlements.tenantConnect.currency")}
              value={account.defaultCurrency?.toUpperCase() || "—"}
            />
            <DetailRow
              icon={Building2}
              label={t("entitlements.tenantConnect.country")}
              value={account.country || "—"}
            />
            <DetailRow
              icon={CheckCircle2}
              label={t("entitlements.tenantConnect.verifiedAt")}
              value={formatDate(account.onboardingCompletedAt)}
            />
          </div>

          <Separator />

          {/* Capability Status */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <CapabilityRow
              label={t("entitlements.stripeConnect.chargesEnabled")}
              enabled={account.chargesEnabled}
            />
            <CapabilityRow
              label={t("entitlements.stripeConnect.payoutsEnabled")}
              enabled={account.payoutsEnabled}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Local Helpers ────────────────────────────────────────────────────────────

function CapabilityRow({ label, enabled }: { label: string; enabled: boolean }) {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-between rounded-nx-md border border-nx-line bg-nx-raised p-4 transition-colors duration-nx-micro ease-nx-enter hover:border-nx-line-hi motion-reduce:transition-none">
      <span className="text-sm font-semibold text-nx-ink">{label}</span>
      <Badge variant={enabled ? "success" : "warning"}>
        {enabled ? (
          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
        ) : (
          <Clock className="h-3 w-3" aria-hidden="true" />
        )}
        {enabled ? t("common.active") : t("common.pending")}
      </Badge>
    </div>
  );
}
