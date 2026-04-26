/**
 * PlatformStripeDashboardView — System Admin mirror of the Stripe platform account.
 *
 * Shows:
 * - Account identity & capabilities
 * - Live balance (available, pending, reserved)
 * - Recent transactions with type/fee breakdown
 * - Recent payouts with status
 * - Connect accounts summary (active, pending, disabled)
 * - Commission stats
 * - Quick links to Stripe Dashboard pages
 *
 * Premium dark-card glassmorphism design with Stripe-branded accents (#635bff).
 */
"use client";

import { usePlatformStripeViewModel } from "../viewmodels/usePlatformStripeViewModel";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Separator } from "@core/ui/separator";
import { Button } from "@core/ui/button";
import {
  Wallet,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Building2,
  Users,
  TrendingUp,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Globe,
  Mail,
  Phone,
  Shield,
  Code,
  Webhook,
  Activity,
  DollarSign,
  Landmark,
  Percent,
} from "lucide-react";

// ── Helpers ──
function formatStripeCurrency(amountCents: number, currency: string): string {
  const amount = amountCents / 100;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency.toUpperCase()}`;
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

const txTypeLabels: Record<string, { label: string; color: string }> = {
  charge: { label: "Charge", color: "text-emerald-500" },
  payment: { label: "Payment", color: "text-emerald-500" },
  refund: { label: "Refund", color: "text-red-500" },
  transfer: { label: "Transfer", color: "text-blue-500" },
  payout: { label: "Payout", color: "text-violet-500" },
  adjustment: { label: "Adjustment", color: "text-amber-500" },
  stripe_fee: { label: "Stripe Fee", color: "text-gray-400" },
  application_fee: { label: "App Fee", color: "text-indigo-500" },
};

const payoutStatusConfig: Record<string, { variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ElementType }> = {
  paid: { variant: "default", icon: CheckCircle2 },
  pending: { variant: "secondary", icon: Clock },
  in_transit: { variant: "outline", icon: ArrowUpRight },
  canceled: { variant: "destructive", icon: XCircle },
  failed: { variant: "destructive", icon: AlertCircle },
};

export function PlatformStripeDashboardView() {
  const { dashboard, isLoading, error, refetch } = usePlatformStripeViewModel();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-[#635bff]" />
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 max-w-md mx-auto text-center">
        <div className="p-4 rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h2 className="text-lg font-semibold">Unable to load Stripe data</h2>
        <p className="text-sm text-muted-foreground">
          Check your Stripe API key configuration and try again.
        </p>
        <Button variant="outline" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  const { account, balance, recentTransactions, recentPayouts, connectSummary, links } = dashboard;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Wallet className="h-6 w-6 text-[#635bff]" />
            Platform Stripe Dashboard
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time mirror of your Stripe platform account
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
            <RefreshCw className="h-4 w-4" /> Refresh
          </Button>
          <Button
            size="sm"
            className="gap-2 bg-[#635bff] hover:bg-[#5851ea] text-white"
            onClick={() => window.open(links.dashboard, "_blank")}
          >
            <ExternalLink className="h-4 w-4" /> Open Stripe
          </Button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          ACCOUNT INFO — Hero Card
         ══════════════════════════════════════════════ */}
      <Card className="relative overflow-hidden border-0 shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#635bff]/5 to-[#635bff]/10" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#635bff] to-[#80e9ff]" />

        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left: Identity */}
            <div className="flex-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-[#635bff] to-[#80e9ff] shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{account.businessName || "Stripe Account"}</h2>
                  <p className="text-sm text-muted-foreground font-mono">{account.accountId}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {account.email && (
                  <InfoChip icon={Mail} label="Email" value={account.email} />
                )}
                {account.country && (
                  <InfoChip icon={Globe} label="Country" value={account.country.toUpperCase()} />
                )}
                {account.defaultCurrency && (
                  <InfoChip icon={DollarSign} label="Currency" value={account.defaultCurrency.toUpperCase()} />
                )}
                {account.businessType && (
                  <InfoChip icon={Building2} label="Type" value={account.businessType} />
                )}
                {account.statementDescriptor && (
                  <InfoChip icon={CreditCard} label="Descriptor" value={account.statementDescriptor} />
                )}
              </div>
            </div>

            {/* Right: Capabilities */}
            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:justify-center">
              <CapabilityBadge enabled={account.chargesEnabled} label="Charges" />
              <CapabilityBadge enabled={account.payoutsEnabled} label="Payouts" />
              <CapabilityBadge enabled={account.detailsSubmitted} label="Details Submitted" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════
          BALANCE CARDS
         ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BalanceCard
          title="Available"
          amounts={balance.available}
          icon={CheckCircle2}
          gradient="from-emerald-500 to-teal-600"
          iconColor="text-emerald-500"
        />
        <BalanceCard
          title="Pending"
          amounts={balance.pending}
          icon={Clock}
          gradient="from-amber-500 to-yellow-600"
          iconColor="text-amber-500"
        />
        <BalanceCard
          title="Connect Reserved"
          amounts={balance.connectReserved}
          icon={Shield}
          gradient="from-violet-500 to-purple-600"
          iconColor="text-violet-500"
        />
      </div>

      {/* ══════════════════════════════════════════════
          CONNECT SUMMARY
         ══════════════════════════════════════════════ */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#635bff]" />
            <CardTitle className="text-base">Connect Accounts</CardTitle>
          </div>
          <CardDescription>Overview of connected Stripe Express accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatBlock
              label="Total"
              value={connectSummary.totalAccounts}
              icon={Users}
              color="text-[#635bff]"
            />
            <StatBlock
              label="Active"
              value={connectSummary.activeAccounts}
              icon={CheckCircle2}
              color="text-emerald-500"
            />
            <StatBlock
              label="Pending"
              value={connectSummary.pendingOnboarding}
              icon={Clock}
              color="text-amber-500"
            />
            <StatBlock
              label="Disabled"
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
                <span className="text-sm text-muted-foreground">Total Commissions Earned</span>
              </div>
              <span className="font-bold text-emerald-600">
                ${connectSummary.totalCommissionsEarned.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <Percent className="h-4 w-4 text-amber-500" />
                <span className="text-sm text-muted-foreground">Commissions Pending</span>
              </div>
              <span className="font-bold text-amber-600">
                ${connectSummary.totalCommissionsPending.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════════
          TRANSACTIONS + PAYOUTS (side by side)
         ══════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-[#635bff]" />
                <CardTitle className="text-base">Recent Transactions</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1"
                onClick={() => window.open(links.payments, "_blank")}
              >
                View All <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No recent transactions</p>
            ) : (
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {recentTransactions.map((tx) => {
                  const txType = txTypeLabels[tx.type] ?? { label: tx.type, color: "text-foreground" };
                  const isPositive = tx.amount >= 0;
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`p-1.5 rounded-lg ${isPositive ? "bg-emerald-500/10" : "bg-red-500/10"}`}>
                          {isPositive ? (
                            <ArrowDownRight className="h-3.5 w-3.5 text-emerald-500" />
                          ) : (
                            <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-xs font-medium ${txType.color}`}>{txType.label}</span>
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">{tx.status}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {tx.description || tx.id}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-semibold ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
                          {isPositive ? "+" : ""}{formatStripeCurrency(tx.amount, tx.currency)}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Fee: {formatStripeCurrency(tx.fee, tx.currency)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Payouts */}
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-[#635bff]" />
                <CardTitle className="text-base">Recent Payouts</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1"
                onClick={() => window.open(links.payouts, "_blank")}
              >
                View All <ExternalLink className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentPayouts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No recent payouts</p>
            ) : (
              <div className="space-y-2">
                {recentPayouts.map((po) => {
                  const poStatus = payoutStatusConfig[po.status] ?? payoutStatusConfig.pending;
                  const PoIcon = poStatus.icon;
                  return (
                    <div
                      key={po.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-1.5 rounded-lg bg-violet-500/10">
                          <Landmark className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={poStatus.variant} className="text-[10px] px-1.5 py-0 gap-1">
                              <PoIcon className="h-3 w-3" />
                              {po.status}
                            </Badge>
                            {po.method && (
                              <span className="text-[10px] text-muted-foreground">{po.method}</span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {po.arrivalDate ? `Arrival: ${formatDate(po.arrivalDate)}` : formatDate(po.created)}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">
                        {formatStripeCurrency(po.amount, po.currency)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ══════════════════════════════════════════════
          QUICK LINKS
         ══════════════════════════════════════════════ */}
      <Card className="shadow-md">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4 text-[#635bff]" />
            <CardTitle className="text-base">Quick Links</CardTitle>
          </div>
          <CardDescription>Open Stripe Dashboard pages directly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <QuickLink icon={CreditCard} label="Payments" href={links.payments} />
            <QuickLink icon={Landmark} label="Payouts" href={links.payouts} />
            <QuickLink icon={Users} label="Connect" href={links.connect} />
            <QuickLink icon={Globe} label="Customers" href={links.customers} />
            <QuickLink icon={Code} label="Developers" href={links.developers} />
            <QuickLink icon={Webhook} label="Webhooks" href={links.webhooks} />
            <QuickLink icon={Activity} label="Events" href={links.events} />
            <QuickLink icon={Building2} label="Dashboard" href={links.dashboard} />
          </div>
        </CardContent>
      </Card>

      {/* Support Info */}
      {(account.supportEmail || account.supportPhone || account.supportUrl) && (
        <Card className="shadow-sm border-dashed">
          <CardContent className="p-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            {account.supportEmail && (
              <span className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" /> {account.supportEmail}
              </span>
            )}
            {account.supportPhone && (
              <span className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" /> {account.supportPhone}
              </span>
            )}
            {account.supportUrl && (
              <a
                href={account.supportUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-foreground transition-colors"
              >
                <Globe className="h-3.5 w-3.5" /> {account.supportUrl}
              </a>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Subcomponents
// ═══════════════════════════════════════

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

function InfoChip({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/30 text-sm">
      <Icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground leading-none">{label}</p>
        <p className="font-medium truncate">{value}</p>
      </div>
    </div>
  );
}

function CapabilityBadge({ enabled, label }: { enabled: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${
      enabled
        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
        : "bg-red-500/10 text-red-500 border border-red-500/20"
    }`}>
      {enabled ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {label}
    </div>
  );
}

function QuickLink({
  icon: Icon,
  label,
  href,
}: {
  icon: React.ElementType;
  label: string;
  href: string;
}) {
  return (
    <button
      onClick={() => window.open(href, "_blank")}
      className="flex items-center gap-2 p-3 rounded-lg border border-border/50 hover:border-[#635bff]/30 hover:bg-[#635bff]/5 transition-all duration-200 text-sm font-medium group"
    >
      <Icon className="h-4 w-4 text-muted-foreground group-hover:text-[#635bff] transition-colors" />
      <span>{label}</span>
      <ExternalLink className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
    </button>
  );
}
