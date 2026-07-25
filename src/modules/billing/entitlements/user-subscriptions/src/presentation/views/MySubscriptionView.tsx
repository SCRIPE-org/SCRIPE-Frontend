// FILE-EXCEPTION: file length
/**
 * MySubscriptionView — Tenant admin self-service subscription portal.
 *
 * Displays the tenant's active Tier 1 (TenantSubscription) data:
 * - Edition name, status, type with premium badges
 * - Billing breakdown (base, adjustment, total, currency)
 * - Timeline (start date, end date, trial end, grace period)
 * - Promotion details if applied
 * - Payment gateway connection status
 */
"use client";

import { useMySubscriptionViewModel } from "../viewmodels/useMySubscriptionViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Badge, type BadgeProps } from "@core/ui/badge";
import { Separator } from "@core/ui/separator";
import { PageHeader } from "@core/ui/page-header";
import { DetailRow } from "@core/ui/detail-row";
import { EmptyState } from "@core/ui/empty-state";
import { ErrorMessage } from "@core/ui/error-message";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { cn } from "@core/common/utils";
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
  RefreshCw,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@core/ui/button";

type BadgeVariant = BadgeProps["variant"];

// ── Status badge / icon tone, keyed to entitlements.subscription.status.* ──
const STATUS_CONFIG: Record<
  string,
  { icon: LucideIcon; badgeVariant: BadgeVariant; iconClass: string }
> = {
  Active: { icon: CheckCircle2, badgeVariant: "success", iconClass: "text-success" },
  Trialing: { icon: Clock, badgeVariant: "info", iconClass: "text-info" },
  PendingPayment: { icon: AlertCircle, badgeVariant: "pending", iconClass: "text-warning-strong" },
  Suspended: { icon: XCircle, badgeVariant: "destructive", iconClass: "text-destructive" },
  Canceled: { icon: XCircle, badgeVariant: "destructive", iconClass: "text-destructive" },
  Expired: { icon: Clock, badgeVariant: "inactive", iconClass: "text-nx-ink-3" },
  PastDue: { icon: AlertCircle, badgeVariant: "warning", iconClass: "text-warning" },
};

// ── Plan-type icon tile tone — same tint recipe as StatCard's tone tiles ──
const TYPE_CONFIG: Record<string, { icon: LucideIcon; toneClass: string; labelKey: string }> = {
  Lifetime: {
    icon: Crown,
    toneClass: "border-warning/30 bg-warning/10 text-warning",
    labelKey: "entitlements.mySubscription.typeLifetime",
  },
  Monthly: {
    icon: Calendar,
    toneClass: "border-info/30 bg-info/10 text-info",
    labelKey: "entitlements.mySubscription.typeMonthly",
  },
  Yearly: {
    icon: TrendingUp,
    toneClass: "border-nx-accent bg-nx-accent-wash text-nx-accent",
    labelKey: "entitlements.mySubscription.typeYearly",
  },
  Trial: {
    icon: Zap,
    toneClass: "border-success/30 bg-success/10 text-success",
    labelKey: "entitlements.mySubscription.typeTrial",
  },
};

function formatDate(dateStr?: string, language?: string): string {
  if (!dateStr) return "—";
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString(language === "ar" ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
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
 * Presentation UI component rendering the my subscription view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function MySubscriptionView() {
  useModuleLocales(() => import("../../../locales"), "user-subscriptions");
  const vm = useMySubscriptionViewModel();
  const { t, language } = useI18n();

  if (vm.isLoading) {
    return <LoadingSpinner />;
  }

  if (vm.error && !vm.subscription) {
    return <ErrorMessage message={t("common.error")} onRetry={() => vm.refetch()} />;
  }

  if (!vm.hasSubscription || !vm.subscription) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState
          icon={Crown}
          title={t("entitlements.mySubscription.noSubscription")}
          description={t("entitlements.mySubscription.noSubscriptionDesc")}
          size="lg"
        />
      </div>
    );
  }

  const sub = vm.subscription;
  const status = STATUS_CONFIG[sub.status] ?? STATUS_CONFIG.Active;
  const type = TYPE_CONFIG[sub.type] ?? TYPE_CONFIG.Monthly;
  const StatusIcon = status.icon;
  const TypeIcon = type.icon;

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-col" style={{ gap: "calc(var(--spacing-unit) * 1.5)" }}>
        <PageHeader
          className="mb-0"
          icon={CreditCard}
          title={t("entitlements.mySubscription.title")}
          description={t("entitlements.mySubscription.description")}
          actions={
            <Button variant="outline" size="sm" onClick={() => vm.refetch()} className="gap-2">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              {t("common.refresh")}
            </Button>
          }
        />

        {/* ══════════════════════════════════════════
            HERO CARD — Edition + Status
           ══════════════════════════════════════════ */}
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              {/* Left: Edition info */}
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "grid h-12 w-12 shrink-0 place-items-center rounded-nx-md border",
                    type.toneClass
                  )}
                  aria-hidden="true"
                >
                  <TypeIcon className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="text-balance text-xl font-bold leading-tight tracking-tight text-nx-ink">
                    {sub.editionName}
                  </h2>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs font-medium">
                      {t(type.labelKey)}
                    </Badge>
                    {sub.isDowngraded && (
                      <Badge variant="destructive" className="gap-1 text-xs">
                        <ArrowDownRight className="h-3 w-3" aria-hidden="true" />
                        {t("entitlements.mySubscription.downgraded")}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Right: Status badge */}
              <div className="flex items-center gap-2">
                <StatusIcon className={cn("h-5 w-5", status.iconClass)} aria-hidden="true" />
                <Badge variant={status.badgeVariant} className="px-3 py-1 text-sm">
                  {t(`entitlements.subscription.status.${sub.status}`)}
                </Badge>
              </div>
            </div>

            {/* Downgrade notice */}
            {sub.isDowngraded && sub.downgradedFromEditionName && (
              <div className="rounded-nx-md border border-destructive/30 bg-destructive/10 p-3 text-sm">
                <span className="text-nx-ink-2">
                  {t("entitlements.mySubscription.downgradedFrom")}{" "}
                </span>
                <span className="font-semibold text-nx-ink">{sub.downgradedFromEditionName}</span>
                {sub.downgradedAt && (
                  <span className="text-nx-ink-2">
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
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                <CardTitle className="text-base">
                  {t("entitlements.mySubscription.billing")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-nx-ink-2">
                  {t("entitlements.mySubscription.totalAmount")}
                </span>
                <span className="text-xl font-bold tabular-nums text-success">
                  {formatCurrency(sub.totalAmount, sub.currency)}
                </span>
              </div>

              <Separator />

              <div className="space-y-3">
                <DetailRow
                  label={t("entitlements.mySubscription.baseAmount")}
                  value={formatCurrency(sub.baseAmount, sub.currency)}
                />
                {(sub.adjustmentAmount ?? 0) !== 0 && (
                  <DetailRow
                    label={t("entitlements.mySubscription.adjustment")}
                    value={formatCurrency(sub.adjustmentAmount, sub.currency)}
                  />
                )}
                <DetailRow
                  label={t("entitlements.mySubscription.currency")}
                  value={(sub.currency ?? "USD").toUpperCase()}
                />
                {sub.totalAmountUsd != null && sub.currency?.toUpperCase() !== "USD" && (
                  <DetailRow
                    label={t("entitlements.mySubscription.usdEquivalent")}
                    value={formatCurrency(sub.totalAmountUsd, "USD")}
                  />
                )}
              </div>

              {/* Promotion banner */}
              {sub.appliedPromoCode && (
                <>
                  <Separator />
                  <div className="rounded-nx-md border border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash p-3">
                    <div className="flex items-center gap-2 text-sm font-medium text-nx-ink">
                      <Tag className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                      <span>{sub.appliedPromoCode}</span>
                    </div>
                    {(sub.promotionDiscount ?? 0) > 0 && (
                      <p className="mt-1 text-xs text-nx-ink-2">
                        {t("entitlements.mySubscription.discountApplied")}:{" "}
                        {formatCurrency(sub.promotionDiscount, sub.currency)}
                      </p>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* ── Timeline Card ── */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                <CardTitle className="text-base">
                  {t("entitlements.mySubscription.timeline")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                label={t("entitlements.mySubscription.startDate")}
                value={formatDate(sub.startDate, language)}
              />
              {sub.endDate && (
                <DetailRow
                  label={t("entitlements.mySubscription.endDate")}
                  value={formatDate(sub.endDate, language)}
                />
              )}
              {sub.trialEndsAt && (
                <DetailRow
                  label={t("entitlements.mySubscription.trialEndsAt")}
                  value={formatDate(sub.trialEndsAt, language)}
                />
              )}
              {sub.gracePeriodEndsAt && (
                <DetailRow
                  label={t("entitlements.mySubscription.gracePeriodEndsAt")}
                  value={formatDate(sub.gracePeriodEndsAt, language)}
                />
              )}

              <Separator />

              <DetailRow
                label={t("entitlements.mySubscription.expiryBehavior")}
                value={sub.expiryBehavior}
              />
              {sub.fallbackEditionName && (
                <DetailRow
                  label={t("entitlements.mySubscription.fallbackEdition")}
                  value={sub.fallbackEditionName}
                />
              )}

              <Separator />

              <DetailRow
                label={t("entitlements.mySubscription.createdAt")}
                value={formatDate(sub.createdAt, language)}
              />
              {sub.modifiedAt && (
                <DetailRow
                  label={t("entitlements.mySubscription.lastModified")}
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
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-nx-accent" aria-hidden="true" />
                <CardTitle className="text-base">
                  {t("entitlements.mySubscription.gatewayIntegration")}
                </CardTitle>
              </div>
              <CardDescription>
                {t("entitlements.mySubscription.gatewayDesc", {
                  gateway:
                    sub.paymentGateway || t("entitlements.mySubscription.yourPaymentProvider"),
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sub.gatewaySubscriptionId && (
                <DetailRow
                  label={t("entitlements.mySubscription.gatewaySubId")}
                  value={sub.gatewaySubscriptionId}
                  mono
                  copyable={sub.gatewaySubscriptionId}
                />
              )}
              {sub.gatewayCustomerId && (
                <DetailRow
                  label={t("entitlements.mySubscription.gatewayCustomerId")}
                  value={sub.gatewayCustomerId}
                  mono
                  copyable={sub.gatewayCustomerId}
                />
              )}
            </CardContent>
          </Card>
        )}

        {/* ── Refund Details (if any) ── */}
        {sub.refundType && sub.refundType !== "None" && (
          <Card className="border-destructive/30">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-destructive" aria-hidden="true" />
                <CardTitle className="text-base text-destructive">
                  {t("entitlements.mySubscription.refundDetails")}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <DetailRow
                label={t("entitlements.mySubscription.refundType")}
                value={sub.refundType}
              />
              {sub.refundAmount != null && (
                <DetailRow
                  label={t("entitlements.mySubscription.refundAmount")}
                  value={formatCurrency(sub.refundAmount, sub.currency)}
                />
              )}
              {sub.refundedAt && (
                <DetailRow
                  label={t("entitlements.mySubscription.refundDate")}
                  value={formatDate(sub.refundedAt, language)}
                />
              )}
              {sub.refundReason && (
                <DetailRow
                  label={t("entitlements.mySubscription.refundReason")}
                  value={sub.refundReason}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
