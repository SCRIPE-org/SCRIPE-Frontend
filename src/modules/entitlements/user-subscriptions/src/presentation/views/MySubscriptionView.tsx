// FILE-EXCEPTION: file length
/**
 * MySubscriptionView — Tenant admin self-service subscription portal.
 *
 * Displays the tenant's active Tier 1 (TenantSubscription) data:
 * - Edition name, status, type with premium badges
 * - Billing breakdown (base, adjustment, total, currency)
 * - Timeline (start date, end date, trial end, grace period)
 * - Promotion details if applied
 * - Stripe connection status
 *
 * Premium glassmorphism design with subtle animations.
 */
"use client";

import { useMySubscriptionViewModel } from "../viewmodels/useMySubscriptionViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge } from "@core/ui/badge";
import { Separator } from "@core/ui/separator";
import {
  Crown,
  Calendar,
  CreditCard,
  Shield,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Zap,
  Sparkles,
  ArrowDownRight,
  Tag,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { Button } from "@core/ui/button";

// ── Status badge variants ──
const statusConfig: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ElementType;
    color: string;
  }
> = {
  Active: { label: "Active", variant: "default", icon: CheckCircle2, color: "text-emerald-500" },
  Trialing: { label: "Trial", variant: "secondary", icon: Clock, color: "text-amber-500" },
  PendingPayment: {
    label: "Pending Payment",
    variant: "outline",
    icon: AlertCircle,
    color: "text-yellow-500",
  },
  Suspended: { label: "Suspended", variant: "destructive", icon: XCircle, color: "text-red-500" },
  Canceled: { label: "Canceled", variant: "destructive", icon: XCircle, color: "text-red-400" },
  Expired: { label: "Expired", variant: "outline", icon: Clock, color: "text-gray-400" },
  PastDue: {
    label: "Past Due",
    variant: "destructive",
    icon: AlertCircle,
    color: "text-orange-500",
  },
};

// ── Type badge config ──
const typeConfig: Record<string, { label: string; icon: React.ElementType; gradient: string }> = {
  Lifetime: { label: "Lifetime", icon: Crown, gradient: "from-amber-500 to-yellow-600" },
  Monthly: { label: "Monthly", icon: Calendar, gradient: "from-blue-500 to-indigo-600" },
  Yearly: { label: "Yearly", icon: TrendingUp, gradient: "from-violet-500 to-purple-600" },
  Trial: { label: "Free Trial", icon: Zap, gradient: "from-emerald-500 to-teal-600" },
};

function formatDate(dateStr?: string, language?: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount?: number, currency?: string): string {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency?.toUpperCase() || "USD",
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount} ${currency}`;
  }
}

/**
 * React presentation component representing the my subscription view UI element.
 */
export function MySubscriptionView() {
  useModuleLocales(() => import("../../../locales"), "user-subscriptions");
  const vm = useMySubscriptionViewModel();
  const { t, language } = useI18n();

  if (vm.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!vm.hasSubscription || !vm.subscription) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center justify-center gap-6 py-20 text-center">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-violet-500/20 to-pink-500/20 blur-2xl" />
          <div className="relative rounded-full border border-border/50 bg-gradient-to-br from-muted/50 to-muted p-6">
            <Crown className="h-12 w-12 text-muted-foreground" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            {t("entitlements.mySubscription.noSubscription") || "No Active Subscription"}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("entitlements.mySubscription.noSubscriptionDesc") ||
              "Your organization doesn't have an active subscription plan. Contact your platform administrator."}
          </p>
        </div>
      </div>
    );
  }

  const sub = vm.subscription;
  const status = statusConfig[sub.status] ?? statusConfig.Active;
  const type = typeConfig[sub.type] ?? typeConfig.Monthly;
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {t("entitlements.mySubscription.title") || "My Subscription"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {t("entitlements.mySubscription.description") ||
              "View your organization's current subscription plan and details."}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => vm.refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          {t("common.refresh") || "Refresh"}
        </Button>
      </div>

      {/* ══════════════════════════════════════════
          HERO CARD — Edition + Status
         ══════════════════════════════════════════ */}
      <Card className="relative overflow-hidden border-0 shadow-xl">
        {/* Background gradient accent */}
        <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-[0.04]`} />
        <div className={`absolute left-0 right-0 top-0 h-1 bg-gradient-to-r ${type.gradient}`} />

        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            {/* Left: Edition info */}
            <div className="flex items-center gap-4">
              <div className={`rounded-xl bg-gradient-to-br p-3 ${type.gradient} shadow-lg`}>
                <TypeIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">{sub.editionName}</h2>
                <div className="mt-1 flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-medium">
                    {type.label}
                  </Badge>
                  {sub.isDowngraded && (
                    <Badge variant="destructive" className="gap-1 text-xs">
                      <ArrowDownRight className="h-3 w-3" />
                      {t("entitlements.mySubscription.downgraded") || "Downgraded"}
                    </Badge>
                  )}
                </div>
              </div>
            </div>

            {/* Right: Status badge */}
            <div className="flex items-center gap-2">
              <StatusIcon className={`h-5 w-5 ${status.color}`} />
              <Badge variant={status.variant} className="px-3 py-1 text-sm">
                {status.label}
              </Badge>
            </div>
          </div>

          {/* Downgrade notice */}
          {sub.isDowngraded && sub.downgradedFromEditionName && (
            <div className="mt-4 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm">
              <span className="text-muted-foreground">
                {t("entitlements.mySubscription.downgradedFrom") || "Downgraded from"}{" "}
              </span>
              <span className="font-semibold text-foreground">{sub.downgradedFromEditionName}</span>
              {sub.downgradedAt && (
                <span className="text-muted-foreground">
                  {" — "}
                  {formatDate(sub.downgradedAt, language)}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ══════════════════════════════════════════
          DETAILS GRID (2-column on desktop)
         ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* ── Billing Card ── */}
        <Card className="shadow-md transition-shadow duration-300 hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">
                {t("entitlements.mySubscription.billing") || "Billing Details"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {t("entitlements.mySubscription.totalAmount") || "Total Amount"}
              </span>
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-xl font-bold text-transparent">
                {formatCurrency(sub.totalAmount, sub.currency)}
              </span>
            </div>

            <Separator />

            <div className="space-y-3">
              <DetailRow
                label={t("entitlements.mySubscription.baseAmount") || "Base Amount"}
                value={formatCurrency(sub.baseAmount, sub.currency)}
              />
              {(sub.adjustmentAmount ?? 0) !== 0 && (
                <DetailRow
                  label={t("entitlements.mySubscription.adjustment") || "Adjustment"}
                  value={formatCurrency(sub.adjustmentAmount, sub.currency)}
                />
              )}
              <DetailRow
                label={t("entitlements.mySubscription.currency") || "Currency"}
                value={(sub.currency ?? "USD").toUpperCase()}
              />
              {sub.totalAmountUsd != null && sub.currency?.toUpperCase() !== "USD" && (
                <DetailRow
                  label={t("entitlements.mySubscription.usdEquivalent") || "USD Equivalent"}
                  value={formatCurrency(sub.totalAmountUsd, "USD")}
                />
              )}
            </div>

            {/* Promotion banner */}
            {sub.appliedPromoCode && (
              <>
                <Separator />
                <div className="rounded-lg border border-primary/10 bg-primary/5 p-3">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <Tag className="h-4 w-4 text-primary" />
                    <span>{sub.appliedPromoCode}</span>
                  </div>
                  {(sub.promotionDiscount ?? 0) > 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {t("entitlements.mySubscription.discountApplied") || "Discount applied"}:{" "}
                      {formatCurrency(sub.promotionDiscount, sub.currency)}
                    </p>
                  )}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* ── Timeline Card ── */}
        <Card className="shadow-md transition-shadow duration-300 hover:shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">
                {t("entitlements.mySubscription.timeline") || "Timeline"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow
              label={t("entitlements.mySubscription.startDate") || "Start Date"}
              value={formatDate(sub.startDate, language)}
            />
            {sub.endDate && (
              <DetailRow
                label={t("entitlements.mySubscription.endDate") || "End Date"}
                value={formatDate(sub.endDate, language)}
              />
            )}
            {sub.trialEndsAt && (
              <DetailRow
                label={t("entitlements.mySubscription.trialEndsAt") || "Trial Ends"}
                value={formatDate(sub.trialEndsAt, language)}
              />
            )}
            {sub.gracePeriodEndsAt && (
              <DetailRow
                label={t("entitlements.mySubscription.gracePeriodEndsAt") || "Grace Period Ends"}
                value={formatDate(sub.gracePeriodEndsAt, language)}
              />
            )}

            <Separator />

            <DetailRow
              label={t("entitlements.mySubscription.expiryBehavior") || "On Expiry"}
              value={sub.expiryBehavior}
            />
            {sub.fallbackEditionName && (
              <DetailRow
                label={t("entitlements.mySubscription.fallbackEdition") || "Fallback Edition"}
                value={sub.fallbackEditionName}
              />
            )}

            <Separator />

            <DetailRow
              label={t("entitlements.mySubscription.createdAt") || "Created"}
              value={formatDate(sub.createdAt, language)}
            />
            {sub.modifiedAt && (
              <DetailRow
                label={t("entitlements.mySubscription.lastModified") || "Last Modified"}
                value={formatDate(sub.modifiedAt, language)}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* ══════════════════════════════════════════
          PAYMENT GATEWAY SECTION (if connected)
         ══════════════════════════════════════════ */}
      {(sub.gatewaySubscriptionId || sub.gatewayCustomerId) && (
        <Card className="border-0 bg-gradient-to-br from-[#635bff]/5 to-[#635bff]/10 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#635bff]" />
              <CardTitle className="text-base">
                {t("entitlements.mySubscription.gatewayIntegration") || "Payment Integration"}
              </CardTitle>
            </div>
            <CardDescription>
              {t("entitlements.mySubscription.gatewayDesc") ||
                `Your subscription is managed through ${sub.paymentGateway || "your payment provider"}.`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sub.gatewaySubscriptionId && (
              <DetailRow
                label={t("entitlements.mySubscription.gatewaySubId") || "Gateway Subscription"}
                value={sub.gatewaySubscriptionId}
              />
            )}
            {sub.gatewayCustomerId && (
              <DetailRow
                label={t("entitlements.mySubscription.gatewayCustomerId") || "Gateway Customer"}
                value={sub.gatewayCustomerId}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* ── Refund Details (if any) ── */}
      {sub.refundType && sub.refundType !== "None" && (
        <Card className="border-destructive/20 shadow-md">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-destructive" />
              <CardTitle className="text-base text-destructive">
                {t("entitlements.mySubscription.refundDetails") || "Refund Details"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <DetailRow
              label={t("entitlements.mySubscription.refundType") || "Type"}
              value={sub.refundType}
            />
            {sub.refundAmount != null && (
              <DetailRow
                label={t("entitlements.mySubscription.refundAmount") || "Amount"}
                value={formatCurrency(sub.refundAmount, sub.currency)}
              />
            )}
            {sub.refundedAt && (
              <DetailRow
                label={t("entitlements.mySubscription.refundDate") || "Date"}
                value={formatDate(sub.refundedAt, language)}
              />
            )}
            {sub.refundReason && (
              <DetailRow
                label={t("entitlements.mySubscription.refundReason") || "Reason"}
                value={sub.refundReason}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ── Reusable detail row ──
function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
