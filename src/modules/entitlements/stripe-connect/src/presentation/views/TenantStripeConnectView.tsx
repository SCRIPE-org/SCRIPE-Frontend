/**
 * TenantStripeConnectView
 *
 * Full-page tenant self-service view for Stripe Connect Express account management.
 * Supports three states:
 *   1. Not Onboarded — hero CTA with steps explanation
 *   2. Pending/Restricted — stepper progress with action buttons
 *   3. Complete — dashboard overview with KPIs and quick actions
 *
 * Architecture:
 *   - Uses useTenantConnectViewModel (DI-injected, JWT-resolved tenant)
 *   - No tenantId params needed — backend resolves from JWT context
 *   - All translations via useI18n()
 */
"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useTenantConnectViewModel } from "../viewmodels/useTenantConnectViewModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Skeleton } from "@core/ui/skeleton";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  ExternalLink,
  RefreshCw,
  LayoutDashboard,
  CreditCard,
  ArrowRight,
  Shield,
  Banknote,
  Building2,
  Globe,
  Calendar,
  Zap,
  Info,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { TenantTransactionsResponseModel } from "../../data/models/ConnectModels";

// ── Status Configuration ─────────────────────────────────────────────────────

const STATUS_CONFIG = {
  Complete: {
    icon: CheckCircle2,
    color: "text-emerald-500",
    bgGradient: "from-emerald-500/10 to-emerald-600/5",
    badgeClass: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
    ringClass: "ring-emerald-500/20",
  },
  Pending: {
    icon: Clock,
    color: "text-amber-500",
    bgGradient: "from-amber-500/10 to-amber-600/5",
    badgeClass: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800",
    ringClass: "ring-amber-500/20",
  },
  Restricted: {
    icon: AlertTriangle,
    color: "text-red-500",
    bgGradient: "from-red-500/10 to-red-600/5",
    badgeClass: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800",
    ringClass: "ring-red-500/20",
  },
} as const;

type StatusKey = keyof typeof STATUS_CONFIG;

// ── Onboarding Steps ─────────────────────────────────────────────────────────

const ONBOARDING_STEPS = [
  { key: "createAccount", icon: CreditCard },
  { key: "verifyIdentity", icon: Shield },
  { key: "addBankAccount", icon: Banknote },
  { key: "startEarning", icon: Zap },
] as const;

// ── Main Component ───────────────────────────────────────────────────────────

export function TenantStripeConnectView() {
  useModuleLocales(() => import("../../../locales"), "stripe-connect");
  const { t, language } = useI18n();
  const vm = useTenantConnectViewModel();

  if (vm.isLoading) return <LoadingSkeleton />;

  // If the query failed (403, network error, etc.), show a proper error — not the onboarding CTA
  if (vm.isError) {
    return (
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <Card className="border-red-200 dark:border-red-800">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center space-y-4">
            <div className="rounded-2xl bg-red-50 dark:bg-red-900/20 p-5">
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-bold">
                {t("entitlements.tenantConnect.errorTitle") || "Unable to Load Account"}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t("entitlements.tenantConnect.errorDesc") || "We couldn't load your payment account information. You may not have permission to access this page, or there was a network issue."}
              </p>
            </div>
            <Button
              variant="outline"
              className="gap-2 mt-2"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4" />
              {t("common.retry") || "Try Again"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-4xl mx-auto">
      {/* ── Page Header ─────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:to-indigo-500/20">
              <CreditCard className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            {t("entitlements.tenantConnect.pageTitle") || "Payment Account"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1.5 max-w-xl">
            {t("entitlements.tenantConnect.pageDesc") || "Set up and manage your Stripe Connect Express account to receive automated payouts from your sales."}
          </p>
        </div>
        {vm.account?.isComplete && (
          <Badge variant="outline" className={STATUS_CONFIG.Complete.badgeClass + " text-xs font-medium px-3 py-1 border"}>
            <CheckCircle2 className="h-3 w-3 mr-1" />
            {t("entitlements.tenantConnect.verified") || "Verified"}
          </Badge>
        )}
      </div>

      {/* ── State-Based Content ──────────────────────────────────────── */}
      {!vm.account ? (
        <NotOnboardedState
          t={t}
          isOnboarding={vm.isOnboarding}
          onOnboard={vm.onboard}
        />
      ) : vm.account.isComplete ? (
        <CompletedState
          t={t}
          language={language}
          account={vm.account}
          isOpeningDashboard={vm.isOpeningDashboard}
          onOpenDashboard={vm.openDashboard}
          isSyncing={vm.isSyncing}
          onSync={vm.syncFromStripe}
          transactions={vm.transactions}
          isLoadingTransactions={vm.isLoadingTransactions}
          txnPage={vm.txnPage}
          txnPageSize={vm.txnPageSize}
          txnStatus={vm.txnStatus}
          txnType={vm.txnType}
          setTxnPage={vm.setTxnPage}
          setTxnStatus={vm.setTxnStatus}
          setTxnType={vm.setTxnType}
        />
      ) : (
        <InProgressState
          t={t}
          account={vm.account}
          isOnboarding={vm.isOnboarding}
          isRefreshing={vm.isRefreshing}
          onOnboard={vm.onboard}
          onRefreshLink={vm.refreshLink}
        />
      )}
    </div>
  );
}

// ── Not Onboarded State ──────────────────────────────────────────────────────

function NotOnboardedState({
  t,
  isOnboarding,
  onOnboard,
}: {
  t: (key: string, params?: Record<string, string | number>) => string;
  isOnboarding: boolean;
  onOnboard: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* Hero CTA Card */}
      <Card className="border-dashed border-2 shadow-sm overflow-hidden">
        <div className="relative">
          {/* Decorative background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-indigo-500/5 dark:from-violet-500/10 dark:to-indigo-500/10 pointer-events-none" />
          <CardContent className="relative flex flex-col items-center justify-center py-16 text-center space-y-5">
            <div className="rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-500/20 dark:to-indigo-500/20 p-5 ring-1 ring-violet-500/10">
              <CreditCard className="h-10 w-10 text-violet-600 dark:text-violet-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">
                {t("entitlements.tenantConnect.heroTitle") || "Start Receiving Payments"}
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                {t("entitlements.tenantConnect.heroDesc") || "Connect your bank account through Stripe to securely receive automated payouts from your sales. Setup takes just a few minutes."}
              </p>
            </div>
            <Button
              size="lg"
              className="mt-2 gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20 transition-all duration-200"
              onClick={onOnboard}
              disabled={isOnboarding}
            >
              {isOnboarding ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              {t("entitlements.tenantConnect.getStartedBtn") || "Get Started"}
              <ArrowRight className="h-4 w-4 ml-0.5" />
            </Button>
          </CardContent>
        </div>
      </Card>

      {/* Steps Preview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ONBOARDING_STEPS.map((step, i) => {
          const Icon = step.icon;
          return (
            <Card key={step.key} className="relative overflow-hidden group hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 rounded-lg bg-muted/60 p-2.5 group-hover:bg-violet-50 dark:group-hover:bg-violet-900/20 transition-colors">
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground font-medium">
                      {t("common.step")} {i + 1}
                    </p>
                    <p className="text-sm font-semibold mt-0.5 leading-tight">
                      {t(`entitlements.tenantConnect.step${i + 1}Title`) || step.key}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {t(`entitlements.tenantConnect.step${i + 1}Desc`) || ""}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Security Note */}
      <div className="flex items-start gap-3 px-4 py-3 rounded-lg bg-muted/40 border text-sm">
        <Shield className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-muted-foreground leading-relaxed">
          {t("entitlements.tenantConnect.securityNote") || "Your information is securely processed by Stripe. NEXORA never sees or stores your bank account details."}
        </p>
      </div>
    </div>
  );
}

// ── In-Progress State ────────────────────────────────────────────────────────

function InProgressState({
  t,
  account,
  isOnboarding,
  isRefreshing,
  onOnboard,
  onRefreshLink,
}: {
  t: (key: string, params?: Record<string, string | number>) => string;
  account: { onboardingStatus: string; chargesEnabled: boolean; payoutsEnabled: boolean; stripeAccountId: string; isRestricted?: boolean; isPending?: boolean };
  isOnboarding: boolean;
  isRefreshing: boolean;
  onOnboard: () => void;
  onRefreshLink: () => void;
}) {
  const statusKey = (account.onboardingStatus as StatusKey) || "Pending";
  const config = STATUS_CONFIG[statusKey] || STATUS_CONFIG.Pending;
  const StatusIcon = config.icon;

  // Determine which steps are completed
  const stepStatus = [
    true,  // Step 1: Account created — always done if we have an account record
    account.chargesEnabled,  // Step 2: Identity verified (charges enabled)
    account.payoutsEnabled,  // Step 3: Bank account added (payouts enabled)
    account.chargesEnabled && account.payoutsEnabled,  // Step 4: Ready to earn
  ];

  return (
    <div className="space-y-6">
      {/* Status Header Card */}
      <Card className={`overflow-hidden ring-1 ${config.ringClass}`}>
        <div className={`bg-gradient-to-r ${config.bgGradient} px-6 py-5`}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg bg-background/80 backdrop-blur-sm`}>
                <StatusIcon className={`h-5 w-5 ${config.color}`} />
              </div>
              <div>
                <h2 className="font-semibold text-lg">
                  {t("entitlements.tenantConnect.setupInProgress") || "Account Setup In Progress"}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("entitlements.tenantConnect.setupInProgressDesc") || "Complete the remaining steps to start accepting payments."}
                </p>
              </div>
            </div>
            <Badge variant="outline" className={config.badgeClass + " border text-xs font-medium px-3 py-1"}>
              {t(`entitlements.stripeConnect.status.${account.onboardingStatus}`) || account.onboardingStatus}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Stepper Progress */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            {t("entitlements.tenantConnect.setupProgress") || "Setup Progress"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {ONBOARDING_STEPS.map((step, i) => {
              const Icon = step.icon;
              const done = stepStatus[i];
              return (
                <div key={step.key} className="flex items-center gap-4">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                    done
                      ? "bg-emerald-100 dark:bg-emerald-900/30"
                      : "bg-muted"
                  }`}>
                    {done ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${done ? "text-foreground" : "text-muted-foreground"}`}>
                      {t(`entitlements.tenantConnect.step${i + 1}Title`) || step.key}
                    </p>
                  </div>
                  {done && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs">
                      {t("common.complete") || "Complete"}
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Restricted Warning */}
      {account.onboardingStatus === "Restricted" && (
        <div className="rounded-lg bg-red-50 dark:bg-red-900/10 p-4 border border-red-200 dark:border-red-800">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">
                {t("entitlements.stripeConnect.actionRequired") || "Action Required"}
              </h4>
              <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                {t("entitlements.tenantConnect.restrictedDesc") || "Stripe requires additional information to verify your identity. Please complete the verification to continue."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={onOnboard} disabled={isOnboarding} className="gap-2">
          {isOnboarding ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <ExternalLink className="h-4 w-4" />
          )}
          {t("entitlements.stripeConnect.continueOnboarding") || "Continue Setup"}
        </Button>
        <Button variant="outline" onClick={onRefreshLink} disabled={isRefreshing} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
          {t("entitlements.stripeConnect.refreshLink") || "Refresh Link"}
        </Button>
      </div>

      {/* Account ID (small) */}
      {account.stripeAccountId && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Info className="h-3.5 w-3.5" />
          <span>{t("entitlements.stripeConnect.stripeAccountId") || "Account ID"}:</span>
          <code className="font-mono bg-muted px-1.5 py-0.5 rounded">{account.stripeAccountId}</code>
        </div>
      )}
    </div>
  );
}

// ── Completed State ──────────────────────────────────────────────────────────

function CompletedState({
  t,
  language,
  account,
  isOpeningDashboard,
  onOpenDashboard,
  isSyncing,
  onSync,
  transactions,
  isLoadingTransactions,
  txnPage,
  txnPageSize,
  txnStatus,
  txnType,
  setTxnPage,
  setTxnStatus,
  setTxnType,
}: {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
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
  isOpeningDashboard: boolean;
  onOpenDashboard: () => void;
  isSyncing: boolean;
  onSync: () => void;
  transactions: TenantTransactionsResponseModel | null;
  isLoadingTransactions: boolean;
  txnPage: number;
  txnPageSize: number;
  txnStatus?: string;
  txnType?: string;
  setTxnPage: (p: number) => void;
  setTxnStatus: (s: string | undefined) => void;
  setTxnType: (t: string | undefined) => void;
}) {
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
    }).format(new Date(dateStr));
  };

  return (
    <div className="space-y-6">
      {/* Success Banner */}
      <Card className="overflow-hidden ring-1 ring-emerald-500/20">
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/5 px-6 py-5">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">
                  {t("entitlements.tenantConnect.accountReady") || "Your Account is Ready"}
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {t("entitlements.tenantConnect.accountReadyDesc") || "Payments and payouts are fully enabled."}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={onSync}
                disabled={isSyncing}
                className="gap-2"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                {t("entitlements.tenantConnect.syncBtn") || "Sync"}
              </Button>
              <Button
                onClick={onOpenDashboard}
                disabled={isOpeningDashboard}
                className="gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-500/20"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          icon={<Banknote className="h-4 w-4" />}
          label={t("entitlements.tenantConnect.totalPayouts") || "Total Payouts"}
          value={formatCurrency(account.totalPayoutsAmount)}
          sublabel={`${account.totalPayoutsCount} ${t("entitlements.tenantConnect.transactions") || "transactions"}`}
        />
        <KpiCard
          icon={<Zap className="h-4 w-4" />}
          label={t("entitlements.tenantConnect.commissionRate") || "Platform Fee"}
          value={`${(account.effectiveCommissionRate * 100).toFixed(1)}%`}
          sublabel={t("entitlements.tenantConnect.perTransaction") || "per transaction"}
        />
        <KpiCard
          icon={<Calendar className="h-4 w-4" />}
          label={t("entitlements.tenantConnect.payoutSchedule") || "Payout Schedule"}
          value={account.payoutDelayDays === 0
            ? t("entitlements.tenantConnect.instant") || "Instant"
            : `${account.payoutDelayDays} ${t("entitlements.tenantConnect.days") || "days"}`
          }
          sublabel={t("entitlements.tenantConnect.afterPayment") || "after payment"}
        />
        <KpiCard
          icon={<Calendar className="h-4 w-4" />}
          label={t("entitlements.tenantConnect.lastPayout") || "Last Payout"}
          value={formatDate(account.lastPayoutAt)}
          sublabel={account.lastPayoutAt ? "" : t("entitlements.tenantConnect.noPayout") || "No payouts yet"}
        />
      </div>

      {/* Account Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-base">
            {t("entitlements.tenantConnect.accountDetails") || "Account Details"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailRow
              icon={<CreditCard className="h-4 w-4" />}
              label={t("entitlements.stripeConnect.stripeAccountId") || "Account ID"}
              value={<code className="font-mono text-xs bg-muted px-2 py-1 rounded">{account.stripeAccountId}</code>}
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
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
              label={t("entitlements.tenantConnect.verifiedAt") || "Verified At"}
              value={formatDate(account.onboardingCompletedAt)}
            />
          </div>

          {/* Capability Status */}
          <div className="mt-6 pt-4 border-t grid grid-cols-1 sm:grid-cols-2 gap-3">
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

      {/* Transaction History */}
      <TransactionsSection
        t={t}
        language={language}
        currency={account.defaultCurrency}
        transactions={transactions}
        isLoading={isLoadingTransactions}
        page={txnPage}
        pageSize={txnPageSize}
        status={txnStatus}
        type={txnType}
        setPage={setTxnPage}
        setStatus={setTxnStatus}
        setType={setTxnType}
      />
    </div>
  );
}

// ── Utility Sub-Components ───────────────────────────────────────────────────

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
    <Card className="hover:shadow-sm transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 text-muted-foreground mb-2">
          {icon}
          <span className="text-xs font-medium">{label}</span>
        </div>
        <p className="text-xl font-bold tabular-nums">{value}</p>
        {sublabel && (
          <p className="text-xs text-muted-foreground mt-0.5">{sublabel}</p>
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
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
      <div className="text-muted-foreground flex-shrink-0">{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="text-sm font-medium mt-0.5 truncate">{value}</div>
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
    <div className="flex items-center justify-between p-3 rounded-lg border bg-background">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex items-center gap-1.5">
        {enabled ? (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        ) : (
          <Clock className="h-4 w-4 text-amber-500" />
        )}
        <span className={`text-sm font-medium ${enabled ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
          {enabled ? t("common.active") || "Active" : t("common.pending") || "Pending"}
        </span>
      </div>
    </div>
  );
}

// ── Transactions Section ─────────────────────────────────────────────────────

const TXN_STATUS_OPTIONS = [
  { value: undefined, label: "All" },
  { value: "Pending", label: "Pending" },
  { value: "Collected", label: "Collected" },
  { value: "Refunded", label: "Refunded" },
  { value: "PartiallyRefunded", label: "Partial Refund" },
] as const;

const TXN_TYPE_OPTIONS = [
  { value: undefined, label: "All" },
  { value: "Payment", label: "Payment" },
  { value: "Refund", label: "Refund" },
  { value: "PartialRefund", label: "Partial Refund" },
] as const;

const TXN_STATUS_STYLES: Record<string, string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Collected: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Refunded: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  PartiallyRefunded: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

function TransactionsSection({
  t,
  language,
  currency: accountCurrency,
  transactions,
  isLoading,
  page,
  pageSize,
  status,
  type,
  setPage,
  setStatus,
  setType,
}: {
  t: (key: string, params?: Record<string, string | number>) => string;
  language: string;
  currency?: string;
  transactions: TenantTransactionsResponseModel | null;
  isLoading: boolean;
  page: number;
  pageSize: number;
  status?: string;
  type?: string;
  setPage: (p: number) => void;
  setStatus: (s: string | undefined) => void;
  setType: (t: string | undefined) => void;
}) {
  const formatCurrency = (amount: number, cur?: string) => {
    const c = (cur || accountCurrency || "USD").toUpperCase();
    return new Intl.NumberFormat(language === "ar" ? "ar-EG" : "en-US", {
      style: "currency",
      currency: c,
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));
  };

  const summary = transactions?.summary;
  const txnItems = transactions?.transactions?.items ?? [];
  const totalCount = transactions?.transactions?.totalCount ?? 0;
  const totalPages = Math.ceil(totalCount / pageSize) || 1;

  return (
    <div className="space-y-4">
      {/* Financial Summary KPIs */}
      {summary && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard
            icon={<ArrowUpRight className="h-4 w-4 text-emerald-500" />}
            label={t("entitlements.tenantConnect.txn.grossRevenue") || "Gross Revenue"}
            value={formatCurrency(summary.totalGrossRevenue, summary.currency)}
            sublabel={`${summary.totalTransactions} ${t("entitlements.tenantConnect.transactions") || "transactions"}`}
          />
          <KpiCard
            icon={<Zap className="h-4 w-4 text-violet-500" />}
            label={t("entitlements.tenantConnect.txn.platformFees") || "Platform Fees"}
            value={formatCurrency(summary.totalPlatformFees, summary.currency)}
            sublabel={t("entitlements.tenantConnect.txn.deducted") || "deducted by platform"}
          />
          <KpiCard
            icon={<Banknote className="h-4 w-4 text-blue-500" />}
            label={t("entitlements.tenantConnect.txn.netRevenue") || "Net Revenue"}
            value={formatCurrency(summary.totalNetRevenue, summary.currency)}
            sublabel={t("entitlements.tenantConnect.txn.yourEarnings") || "your earnings"}
          />
          <KpiCard
            icon={<ArrowDownLeft className="h-4 w-4 text-red-500" />}
            label={t("entitlements.tenantConnect.txn.refunded") || "Refunded"}
            value={formatCurrency(summary.totalRefunded, summary.currency)}
            sublabel={`${summary.refundCount} ${t("entitlements.tenantConnect.txn.refunds") || "refunds"}`}
          />
        </div>
      )}

      {/* Transactions Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base">
                {t("entitlements.tenantConnect.txn.title") || "Recent Transactions"}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                {t("entitlements.tenantConnect.txn.desc") || "Payments received, platform fees, and refunds"}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Status filter */}
              <select
                value={status ?? ""}
                onChange={(e) => { setStatus(e.target.value || undefined); setPage(1); }}
                className="text-xs h-8 px-2 rounded-md border bg-background focus:ring-1 focus:ring-violet-500/40 focus:outline-none"
                aria-label="Filter by status"
              >
                {TXN_STATUS_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value ?? ""}>{opt.label}</option>
                ))}
              </select>
              {/* Type filter */}
              <select
                value={type ?? ""}
                onChange={(e) => { setType(e.target.value || undefined); setPage(1); }}
                className="text-xs h-8 px-2 rounded-md border bg-background focus:ring-1 focus:ring-violet-500/40 focus:outline-none"
                aria-label="Filter by type"
              >
                {TXN_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.label} value={opt.value ?? ""}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full rounded-lg" />
              ))}
            </div>
          ) : txnItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-xl bg-muted/50 p-4 mb-3">
                <CreditCard className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                {t("entitlements.tenantConnect.txn.empty") || "No transactions found."}
              </p>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto -mx-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground text-xs">
                      <th className="py-2.5 px-3 font-medium">{t("entitlements.tenantConnect.txn.col.date") || "Date"}</th>
                      <th className="py-2.5 px-3 font-medium">{t("entitlements.tenantConnect.txn.col.type") || "Type"}</th>
                      <th className="py-2.5 px-3 font-medium text-right">{t("entitlements.tenantConnect.txn.col.gross") || "Gross"}</th>
                      <th className="py-2.5 px-3 font-medium text-right">{t("entitlements.tenantConnect.txn.col.fee") || "Fee"}</th>
                      <th className="py-2.5 px-3 font-medium text-right">{t("entitlements.tenantConnect.txn.col.net") || "Net"}</th>
                      <th className="py-2.5 px-3 font-medium">{t("entitlements.tenantConnect.txn.col.status") || "Status"}</th>
                      <th className="py-2.5 px-3 font-medium text-right">{t("entitlements.tenantConnect.txn.col.refund") || "Refund"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txnItems.map((txn) => (
                      <tr key={txn.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-3 text-xs tabular-nums whitespace-nowrap">
                          {formatDate(txn.transactionDate)}
                        </td>
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5">
                            {txn.type === "Payment" ? (
                              <ArrowUpRight className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <ArrowDownLeft className="h-3.5 w-3.5 text-red-500" />
                            )}
                            <span className="text-xs font-medium">{txn.type}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-medium text-xs">
                          {formatCurrency(txn.grossAmount, txn.currency)}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-xs text-muted-foreground">
                          −{formatCurrency(txn.platformFee, txn.currency)}
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums font-semibold text-xs">
                          {formatCurrency(txn.netAmount, txn.currency)}
                        </td>
                        <td className="py-3 px-3">
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-2 py-0.5 border ${TXN_STATUS_STYLES[txn.status] || "bg-muted text-foreground"}`}
                          >
                            {txn.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-3 text-right tabular-nums text-xs">
                          {txn.refundedAmount != null && txn.refundedAmount > 0 ? (
                            <span className="text-red-600 dark:text-red-400 font-medium">
                              −{formatCurrency(txn.refundedAmount, txn.currency)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 mt-2 border-t">
                  <p className="text-xs text-muted-foreground">
                    {t("entitlements.tenantConnect.txn.showing") || "Showing"}{" "}
                    <span className="font-medium">{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)}</span>{" "}
                    {t("entitlements.tenantConnect.txn.of") || "of"}{" "}
                    <span className="font-medium">{totalCount}</span>
                  </p>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(page - 1)}
                      disabled={page <= 1}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="text-xs tabular-nums px-2 font-medium">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPage(page + 1)}
                      disabled={page >= totalPages}
                      className="h-7 w-7 p-0"
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
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <Skeleton className="h-[280px] w-full rounded-xl" />
      <div className="grid grid-cols-4 gap-4">
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
        <Skeleton className="h-24 rounded-lg" />
      </div>
      <Skeleton className="h-48 w-full rounded-lg" />
    </div>
  );
}
