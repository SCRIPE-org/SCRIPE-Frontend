"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Button } from "@core/ui/button";
import {
  CheckCircle2,
  Clock,
  RefreshCw,
  LayoutDashboard,
  Banknote,
  Zap,
  Calendar,
  CreditCard,
  Globe,
  Building2,
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
      <Card className="overflow-hidden shadow-sm ring-1 ring-success/20 transition-shadow hover:shadow-md">
        <div className="bg-gradient-to-r from-success/10 to-success/5 px-6 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-foreground/95">
                  {t("entitlements.tenantConnect.accountReady") || "Your Account is Ready"}
                </h2>
                <p className="mt-0.5 text-sm text-muted-foreground/90">
                  {t("entitlements.tenantConnect.accountReadyDesc") ||
                    "Payments and payouts are fully enabled."}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                disabled={isSyncing}
                className="gap-2 transition-all hover:bg-muted/40"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                {t("entitlements.tenantConnect.syncBtn") || "Sync"}
              </Button>
              <Button
                onClick={onOpenDashboard}
                disabled={isOpeningDashboard}
                className="gap-2 bg-gradient-to-r from-primary to-info text-primary-foreground shadow-lg shadow-primary/15 transition-all hover:scale-[1.01] hover:from-primary/90 hover:to-info/90 active:scale-95"
              >
                {isOpeningDashboard ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <LayoutDashboard className="h-4 w-4" />
                )}
                {t("entitlements.stripeConnect.openStripeDashboard") || "Open Stripe Dashboard"}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<Banknote className="h-4.5 w-4.5 text-info" />}
          label={t("entitlements.tenantConnect.totalPayouts") || "Total Payouts"}
          value={formatCurrency(account.totalPayoutsAmount)}
          sublabel={`${account.totalPayoutsCount} ${t("entitlements.tenantConnect.transactions") || "transactions"}`}
        />
        <KpiCard
          icon={<Zap className="h-4.5 w-4.5 text-primary" />}
          label={t("entitlements.tenantConnect.commissionRate") || "Platform Fee"}
          value={`${(account.effectiveCommissionRate * 100).toFixed(1)}%`}
          sublabel={t("entitlements.tenantConnect.perTransaction") || "per transaction"}
        />
        <KpiCard
          icon={<Calendar className="h-4.5 w-4.5 text-warning" />}
          label={t("entitlements.tenantConnect.payoutSchedule") || "Payout Schedule"}
          value={
            account.payoutDelayDays === 0
              ? t("entitlements.tenantConnect.instant") || "Instant"
              : `${account.payoutDelayDays} ${t("entitlements.tenantConnect.days") || "days"}`
          }
          sublabel={t("entitlements.tenantConnect.afterPayment") || "after payment"}
        />
        <KpiCard
          icon={<Calendar className="h-4.5 w-4.5 text-success" />}
          label={t("entitlements.tenantConnect.lastPayout") || "Last Payout"}
          value={formatDate(account.lastPayoutAt)}
          sublabel={
            account.lastPayoutAt ? "" : t("entitlements.tenantConnect.noPayout") || "No payouts yet"
          }
        />
      </div>

      {/* Account Details */}
      <Card className="shadow-sm">
        <CardHeader className="border-b bg-muted/20 pb-4">
          <CardTitle className="text-base font-bold tracking-tight text-foreground/95">
            {t("entitlements.tenantConnect.accountDetails") || "Account Details"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailRow
              icon={<CreditCard className="h-4 w-4" />}
              label={t("entitlements.stripeConnect.stripeAccountId") || "Account ID"}
              value={
                <code className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] font-semibold text-foreground/80">
                  {account.stripeAccountId}
                </code>
              }
            />
            <DetailRow
              icon={<Globe className="h-4 w-4" />}
              label={t("entitlements.tenantConnect.currency") || "Currency"}
              value={account.defaultCurrency?.toUpperCase() || "—"}
            />
            <DetailRow
              icon={<Building2 className="h-4 w-4" />}
              label={t("entitlements.tenantConnect.country") || "Country"}
              value={account.country || "—"}
            />
            <DetailRow
              icon={<CheckCircle2 className="h-4 w-4 text-success" />}
              label={t("entitlements.tenantConnect.verifiedAt") || "Verified At"}
              value={formatDate(account.onboardingCompletedAt)}
            />
          </div>

          {/* Capability Status */}
          <div className="grid grid-cols-1 gap-3 border-t pt-5 sm:grid-cols-2">
            <CapabilityBadge
              label={t("entitlements.stripeConnect.chargesEnabled") || "Payments"}
              enabled={account.chargesEnabled}
              t={t}
            />
            <CapabilityBadge
              label={t("entitlements.stripeConnect.payoutsEnabled") || "Payouts"}
              enabled={account.payoutsEnabled}
              t={t}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ── Local Helpers ────────────────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sublabel,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sublabel?: string;
}) {
  return (
    <Card className="transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-5">
        <div className="mb-2 flex items-center gap-2 text-muted-foreground/90">
          {icon}
          <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-2xl font-extrabold tabular-nums tracking-tight text-foreground">
          {value}
        </p>
        {sublabel && (
          <p className="mt-1 text-xs font-medium text-muted-foreground/80">{sublabel}</p>
        )}
      </CardContent>
    </Card>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3.5 transition-colors hover:bg-muted/60">
      <div className="flex-shrink-0 text-muted-foreground/80">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/90">
          {label}
        </p>
        <div className="mt-1 truncate text-sm font-bold text-foreground/90">{value}</div>
      </div>
    </div>
  );
}

function CapabilityBadge({
  label,
  enabled,
  t,
}: {
  label: string;
  enabled: boolean;
  t: (key: string) => string;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-muted-foreground/25">
      <span className="text-sm font-semibold text-foreground/90">{label}</span>
      <div className="flex items-center gap-2">
        {enabled ? (
          <CheckCircle2 className="h-4.5 w-4.5 text-success" />
        ) : (
          <Clock className="h-4.5 w-4.5 text-warning" />
        )}
        <span
          className={`text-sm font-bold ${
            enabled
              ? "text-success"
              : "text-warning"
          }`}
        >
          {enabled ? t("common.active") || "Active" : t("common.pending") || "Pending"}
        </span>
      </div>
    </div>
  );
}
