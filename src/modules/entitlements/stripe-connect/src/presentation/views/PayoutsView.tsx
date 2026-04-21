/**
 * PayoutsView
 *
 * Premium tenant-facing payouts & commission history page.
 *
 * Layout:
 *   [Header]
 *   [Account Status Card]     — onboarding state + Stripe actions
 *   [4 KPI Cards]             — lifetime gross, fee, net, tx count
 *   [Commission History]      — filterable paginated table
 *
 * Architecture:
 * - "use client"
 * - All data via usePayoutsViewModel (DI chain)
 * - @core/ui/* components only
 * - Full locale support via t()
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePayoutsViewModel } from "../viewmodels/usePayoutsViewModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@core/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@core/ui/select";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  LayoutDashboard,
  CreditCard,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Receipt,
  Banknote,
  ChevronLeft,
  ChevronRight,
  Filter,
  X,
} from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number, currency = "USD") =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(n);

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const STATUS_COLORS: Record<string, string> = {
  Collected:  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Pending:    "bg-amber-100   text-amber-700   dark:bg-amber-900/30   dark:text-amber-400",
  Refunded:   "bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400",
  Failed:     "bg-red-100     text-red-700     dark:bg-red-900/30     dark:text-red-400",
};

const ACCOUNT_STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; badge: string }> = {
  Complete: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  },
  Pending: {
    icon: Clock,
    color: "text-amber-500",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  },
  Restricted: {
    icon: AlertTriangle,
    color: "text-red-500",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// KPI Card sub-component
// ─────────────────────────────────────────────────────────────────────────────
interface KpiCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent?: "green" | "red" | "blue" | "default";
  isLoading?: boolean;
}

function KpiCard({ icon: Icon, label, value, sub, accent = "default", isLoading }: KpiCardProps) {
  const accentClass = {
    green:   "text-emerald-500",
    red:     "text-red-500",
    blue:    "text-blue-400",
    default: "text-primary",
  }[accent];

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-5">
          <Skeleton className="h-5 w-24 mb-3" />
          <Skeleton className="h-8 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-center gap-2 mb-2">
          <div className={`p-1.5 rounded-lg bg-muted ${accentClass}`}>
            <Icon className="h-4 w-4" />
          </div>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</p>
        </div>
        <p className={`text-2xl font-bold tabular-nums tracking-tight ${accentClass}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main View
// ─────────────────────────────────────────────────────────────────────────────
export function PayoutsView() {
  useModuleLocales(() => import("../../../locales"), "stripe-connect");
  const { t } = useI18n();
  const vm = usePayoutsViewModel();

  // ── Loading skeleton ───────────────────────────────────────────────────────
  if (vm.isAccountLoading) {
    return (
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <Skeleton className="h-9 w-56" />
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}><CardContent className="p-5"><Skeleton className="h-20 w-full" /></CardContent></Card>
          ))}
        </div>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const accountStatus = vm.account?.onboardingStatus ?? "Pending";
  const statusConfig = ACCOUNT_STATUS_CONFIG[accountStatus] ?? ACCOUNT_STATUS_CONFIG.Pending;
  const StatusIcon = statusConfig.icon;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">

      {/* ── Page Header ───────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <Banknote className="h-6 w-6 text-primary" />
            {t("entitlements.stripeConnect.payoutsTitle") || "Payouts & Earnings"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {t("entitlements.stripeConnect.payoutsDesc") ||
              "Track your earnings, commission deductions, and net payouts from Stripe Connect."}
          </p>
        </div>
        {vm.account && (
          <Badge className={statusConfig.badge}>
            <StatusIcon className={`h-3.5 w-3.5 mr-1.5 ${statusConfig.color}`} />
            {t(`entitlements.stripeConnect.status.${accountStatus}`) || accountStatus}
          </Badge>
        )}
      </div>

      {/* ── Not Onboarded State ───────────────────────────────────────────── */}
      {vm.isNotOnboarded && (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>{t("entitlements.stripeConnect.getStarted") || "Set Up Payouts"}</CardTitle>
            <CardDescription>
              {t("entitlements.stripeConnect.getStartedDesc") ||
                "Connect your bank account via Stripe to start receiving payouts."}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-6">
              <CreditCard className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">
              {t("entitlements.stripeConnect.readyToConnect") || "Ready to receive payouts?"}
            </h3>
            <p className="text-muted-foreground text-sm max-w-md">
              {t("entitlements.stripeConnect.readyToConnectDesc") ||
                "Click below to securely connect your bank account via Stripe. It takes just a few minutes."}
            </p>
            <Button
              size="lg"
              className="mt-2 gap-2"
              onClick={vm.onboard}
              disabled={vm.isOnboarding}
            >
              {vm.isOnboarding
                ? <RefreshCw className="h-4 w-4 animate-spin" />
                : <ExternalLink className="h-4 w-4" />}
              {t("entitlements.stripeConnect.connectBankAccount") || "Connect Bank Account"}
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── KPI Cards ─────────────────────────────────────────────────────── */}
      {vm.account && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <KpiCard
            icon={DollarSign}
            label={t("entitlements.stripeConnect.lifetimeGross") || "Total Gross"}
            value={fmt(vm.lifetimeGross / 100)}
            sub={`${vm.lifetimePaid} ${t("entitlements.stripeConnect.transactions") || "transactions"}`}
            accent="default"
          />
          <KpiCard
            icon={Receipt}
            label={t("entitlements.stripeConnect.platformFee") || "Platform Fee"}
            value={fmt(vm.lifetimeFee / 100)}
            sub={`${(vm.effectiveRate * 100).toFixed(1)}% ${t("entitlements.stripeConnect.commissionRate") || "commission rate"}`}
            accent="red"
          />
          <KpiCard
            icon={Banknote}
            label={t("entitlements.stripeConnect.netEarnings") || "Net Earnings"}
            value={fmt(vm.lifetimeNet / 100)}
            sub={t("entitlements.stripeConnect.afterFees") || "After platform fees"}
            accent="green"
          />
          <KpiCard
            icon={TrendingUp}
            label={t("entitlements.stripeConnect.payoutsEnabled") || "Payouts Enabled"}
            value={vm.account.payoutsEnabled
              ? (t("common.yes") || "Yes")
              : (t("common.pending") || "Pending")}
            sub={vm.account.chargesEnabled
              ? (t("entitlements.stripeConnect.chargesActive") || "Charges active")
              : (t("entitlements.stripeConnect.onboardingRequired") || "Complete setup")}
            accent={vm.account.payoutsEnabled ? "green" : "default"}
          />
        </div>
      )}

      {/* ── Account Status + Actions Card ─────────────────────────────────── */}
      {vm.account && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted`}>
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base">
                    {t("entitlements.stripeConnect.stripeAccount") || "Stripe Connect Account"}
                  </CardTitle>
                  {vm.account.stripeAccountId && (
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">
                      {vm.account.stripeAccountId}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {vm.account.onboardingStatus === "Complete" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={vm.openDashboard}
                    disabled={vm.isOpeningDashboard}
                  >
                    {vm.isOpeningDashboard
                      ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      : <LayoutDashboard className="h-3.5 w-3.5" />}
                    {t("entitlements.stripeConnect.openStripeDashboard") || "Stripe Dashboard"}
                  </Button>
                ) : (
                  <>
                    <Button
                      size="sm"
                      className="gap-2"
                      onClick={vm.onboard}
                      disabled={vm.isOnboarding}
                    >
                      {vm.isOnboarding
                        ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                        : <ExternalLink className="h-3.5 w-3.5" />}
                      {t("entitlements.stripeConnect.continueOnboarding") || "Continue Setup"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={vm.refreshLink}
                      disabled={vm.isRefreshing}
                    >
                      <RefreshCw className={`h-3.5 w-3.5 ${vm.isRefreshing ? "animate-spin" : ""}`} />
                      {t("entitlements.stripeConnect.refreshLink") || "Refresh Link"}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>

          {accountStatus === "Restricted" && (
            <CardContent className="pt-0">
              <div className="rounded-md bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                      {t("entitlements.stripeConnect.actionRequired") || "Action Required"}
                    </p>
                    <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                      {t("entitlements.stripeConnect.actionRequiredDesc") ||
                        "Stripe needs more information to verify your account. Open the Stripe Dashboard to resolve this."}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* ── Commission History ─────────────────────────────────────────────── */}
      {vm.account?.tenantId && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-primary" />
                  {t("entitlements.stripeConnect.commissionHistory") || "Commission History"}
                </CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {vm.totalCount}{" "}
                  {t("entitlements.stripeConnect.totalRecords") || "total records"}
                </p>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <Select
                  value={vm.filter.status || "all"}
                  onValueChange={(v) =>
                    vm.setFilter({ status: v === "all" ? undefined : v })
                  }
                >
                  <SelectTrigger className="h-8 w-36 text-xs">
                    <SelectValue placeholder={t("common.status") || "Status"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("common.all") || "All"}</SelectItem>
                    <SelectItem value="Collected">{t("entitlements.stripeConnect.statusCollected") || "Collected"}</SelectItem>
                    <SelectItem value="Pending">{t("entitlements.stripeConnect.statusPending") || "Pending"}</SelectItem>
                    <SelectItem value="Refunded">{t("entitlements.stripeConnect.statusRefunded") || "Refunded"}</SelectItem>
                  </SelectContent>
                </Select>
                {(vm.filter.status) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 gap-1 text-xs"
                    onClick={vm.clearFilter}
                  >
                    <X className="h-3.5 w-3.5" />
                    {t("common.clear") || "Clear"}
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {vm.isCommissionsLoading ? (
              <div className="space-y-2 p-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : vm.commissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
                <Receipt className="h-10 w-10 mb-3 opacity-30" />
                <p className="font-medium">
                  {t("entitlements.stripeConnect.noCommissions") || "No commission records yet"}
                </p>
                <p className="text-sm mt-1 opacity-70">
                  {t("entitlements.stripeConnect.noCommissionsDesc") ||
                    "Commission records will appear here after your first successful payment."}
                </p>
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">{t("entitlements.stripeConnect.date") || "Date"}</TableHead>
                      <TableHead className="text-xs text-right">{t("entitlements.stripeConnect.gross") || "Gross"}</TableHead>
                      <TableHead className="text-xs text-right">{t("entitlements.stripeConnect.fee") || "Platform Fee"}</TableHead>
                      <TableHead className="text-xs text-right">{t("entitlements.stripeConnect.net") || "Your Net"}</TableHead>
                      <TableHead className="text-xs">{t("entitlements.stripeConnect.commissionRate") || "Rate"}</TableHead>
                      <TableHead className="text-xs">{t("common.status") || "Status"}</TableHead>
                      <TableHead className="text-xs">{t("entitlements.stripeConnect.paymentRef") || "Stripe Ref"}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vm.commissions.map((c) => (
                      <TableRow key={c.id} className="text-sm">
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                          {fmtDate(c.collectedAt ?? c.createdAt)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-medium">
                          {fmt(c.grossAmount / 100, c.currency)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums text-red-500">
                          −{fmt(c.commissionAmount / 100, c.currency)}
                        </TableCell>
                        <TableCell className="text-right tabular-nums font-semibold text-emerald-500">
                          {fmt(c.netAmount / 100, c.currency)}
                        </TableCell>
                        <TableCell className="tabular-nums text-xs text-muted-foreground">
                          {(c.commissionRate * 100).toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={`text-xs ${STATUS_COLORS[c.status] ?? ""}`}
                          >
                            {t(`entitlements.stripeConnect.status${c.status}`) || c.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs text-muted-foreground truncate max-w-[100px] block">
                            {c.stripePaymentIntentId?.substring(0, 16) ?? "—"}…
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                {vm.totalPages > 1 && (
                  <div className="flex items-center justify-between px-4 py-3 border-t">
                    <p className="text-xs text-muted-foreground">
                      {t("common.page") || "Page"} {vm.page} {t("common.of") || "of"} {vm.totalPages}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => vm.setPage(vm.page - 1)}
                        disabled={vm.page <= 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => vm.setPage(vm.page + 1)}
                        disabled={vm.page >= vm.totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
