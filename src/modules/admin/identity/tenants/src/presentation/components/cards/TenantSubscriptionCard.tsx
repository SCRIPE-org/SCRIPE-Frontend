// FILE-EXCEPTION: file length
"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  CreditCard,
  Pencil,
  Loader2,
  RefreshCw,
  Play,
  Pause,
  XCircle,
  ArrowUpCircle,
  Calendar,
  Clock,
  AlertTriangle,
  Shield,
  RotateCcw,
  ArrowDownCircle,
  DollarSign,
  Globe,
  FileDown,
  Gift,
} from "lucide-react";
import { useTenantSubscriptionViewModel } from "@modules/identity/tenants/src/presentation/viewmodels/useTenantSubscriptionViewModel";
import { SUPPORTED_CURRENCIES } from "@core/constants/currencies";
import { useConvertedAmount } from "@core/hooks/useConvertedAmount";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@core/ui/dialog";
import { GenericSelect } from "@core/crud/components/generic-select";
import { parseLocalizedNumber } from "@core/utils/number-parser";
import { formatDateUtc, formatDateTimeUtc } from "@core/common/utils";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { Skeleton } from "@core/ui/skeleton";
import { Input } from "@core/ui/input";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import type {
  SubscriptionType,
  DowngradeImpactReport,
} from "../../../domain/types/SubscriptionTypes";

interface TenantSubscriptionCardProps {
  tenantId: string;
}

// ── Status & Type Helpers ──

const STATUS_CONFIG: Record<
  string,
  { variant: "success" | "secondary" | "destructive" | "outline"; icon: typeof Clock }
> = {
  active: { variant: "success", icon: Play },
  trialing: { variant: "outline", icon: Clock },
  pendingpayment: { variant: "outline", icon: CreditCard },
  suspended: { variant: "destructive", icon: Pause },
  canceled: { variant: "secondary", icon: XCircle },
  expired: { variant: "destructive", icon: AlertTriangle },
  pastdue: { variant: "destructive", icon: AlertTriangle },
};

function getTypeLabel(type: string, t: (key: string) => string, isFreePlan?: boolean): string {
  if (isFreePlan || type === "Free") {
    return t("tenant.typeLabel.free") || "Free";
  }
  const map: Record<string, string> = {
    Lifetime: t("tenant.typeLabel.lifetime") || "Lifetime",
    Monthly: t("tenant.typeLabel.monthly") || "Monthly",
    Yearly: t("tenant.typeLabel.yearly") || "Yearly",
    Trial: t("tenant.typeLabel.trial") || "Trial",
    AddOn: t("tenant.typeLabel.addon") || "Add-On",
    Free: t("tenant.typeLabel.free") || "Free",
  };
  return map[type] || type;
}

function getStatusLabel(status: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    Active: t("tenant.statusLabel.active") || "Active",
    PendingPayment: t("tenant.statusLabel.pendingPayment") || "Pending Payment",
    Trialing: t("tenant.statusLabel.trialing") || "Trialing",
    Suspended: t("tenant.statusLabel.suspended") || "Suspended",
    Canceled: t("tenant.statusLabel.canceled") || "Canceled",
    Expired: t("tenant.statusLabel.expired") || "Expired",
    PastDue: t("tenant.statusLabel.pastdue") || "Past Due",
  };
  return map[status] || status;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return formatDateUtc(dateStr);
}

// ── Billing Cycle Options (dynamically filtered by edition capabilities) ──

import type { EditionThinModel } from "../../../domain/types/SubscriptionTypes";

function getBillingCycleOptions(
  t: (key: string) => string,
  edition?: EditionThinModel | null
): GenericSelectOption[] {
  if (edition?.isFree) {
    return [{ value: "Free", label: t("tenant.typeLabel.free") || "Free" }];
  }
  const opts: GenericSelectOption[] = [];
  if (!edition || edition.allowMonthly !== false)
    opts.push({ value: "Monthly", label: t("tenant.typeLabel.monthly") || "Monthly" });
  if (!edition || edition.allowYearly !== false)
    opts.push({ value: "Yearly", label: t("tenant.typeLabel.yearly") || "Yearly" });
  if (!edition || edition.allowLifetime !== false)
    opts.push({ value: "Lifetime", label: t("tenant.typeLabel.lifetime") || "Lifetime" });
  if (!edition || edition.allowTrial !== false)
    opts.push({ value: "Trial", label: t("tenant.typeLabel.trial") || "Trial" });
  return opts;
}

function getRenewOptions(
  t: (key: string) => string,
  edition?: EditionThinModel | null
): GenericSelectOption[] {
  if (edition?.isFree) return [];
  const opts: GenericSelectOption[] = [];
  if (!edition || edition.allowMonthly !== false)
    opts.push({ value: "Monthly", label: t("tenant.renewLabel.oneMonth") || "1 Month" });
  if (!edition || edition.allowYearly !== false)
    opts.push({ value: "Yearly", label: t("tenant.renewLabel.oneYear") || "1 Year" });
  if (!edition || edition.allowLifetime !== false)
    opts.push({
      value: "Lifetime",
      label: t("tenant.renewLabel.lifetime") || "Make Lifetime (no expiry)",
    });
  return opts;
}

function getConvertOptions(
  t: (key: string) => string,
  edition?: EditionThinModel | null
): GenericSelectOption[] {
  if (edition?.isFree) return [];
  const opts: GenericSelectOption[] = [];
  if (!edition || edition.allowMonthly !== false)
    opts.push({ value: "Monthly", label: t("tenant.typeLabel.monthly") || "Monthly" });
  if (!edition || edition.allowYearly !== false)
    opts.push({ value: "Yearly", label: t("tenant.typeLabel.yearly") || "Yearly" });
  if (!edition || edition.allowLifetime !== false)
    opts.push({ value: "Lifetime", label: t("tenant.typeLabel.lifetime") || "Lifetime" });
  return opts;
}

// ── Main Component ──

/**
 * Presentation UI component rendering the tenant subscription card.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantSubscriptionCard({ tenantId }: TenantSubscriptionCardProps) {
  const { t } = useI18n();
  const [selectedEditionId, setSelectedEditionId] = useState("");
  const [changePlanOpen, setChangePlanOpen] = useState(false);
  const vm = useTenantSubscriptionViewModel(tenantId, selectedEditionId, changePlanOpen);
  const { formatDisplay } = useConvertedAmount();

  // Dialog states
  const [renewOpen, setRenewOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [suspendOpen, setSuspendOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [resumeOpen, setResumeOpen] = useState(false);
  const [changeCurrencyOpen, setChangeCurrencyOpen] = useState(false);

  // Form states for dialogs
  const [selectedType, setSelectedType] = useState<SubscriptionType>("Monthly");
  const [suspendReason, setSuspendReason] = useState("");
  const [cancelReason, setCancelReason] = useState("");
  const [useFallbackOnSuspend, setUseFallbackOnSuspend] = useState(true);
  const [useFallbackOnCancel, setUseFallbackOnCancel] = useState(true);
  const [restoreType, setRestoreType] = useState<SubscriptionType>("Monthly");
  const [selectedCurrency, setSelectedCurrency] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [selectedPromotionId, setSelectedPromotionId] = useState("");
  const [suspendRefundType, setSuspendRefundType] = useState<string>("None");
  const [cancelRefundType, setCancelRefundType] = useState<string>("None");
  const [suspendCustomAmount, setSuspendCustomAmount] = useState("");
  const [cancelCustomAmount, setCancelCustomAmount] = useState("");

  // Downgrade impact + price preview state
  const [impactReport, setImpactReport] = useState<DowngradeImpactReport | null>(null);
  const [isLoadingImpact, setIsLoadingImpact] = useState(false);
  const [previewAmount, setPreviewAmount] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);

  const closeSuspendDialog = () => {
    setSuspendOpen(false);
    setSuspendReason("");
    setUseFallbackOnSuspend(true);
    setSuspendRefundType("None");
    setSuspendCustomAmount("");
  };

  const closeCancelDialog = () => {
    setCancelOpen(false);
    setCancelReason("");
    setUseFallbackOnCancel(true);
    setCancelRefundType("None");
    setCancelCustomAmount("");
  };

  // ── Find the subscription that was directly canceled as part of the current downgrade ──
  const previousRefundedSub = useMemo(() => {
    if (!vm.subscriptionHistory || vm.subscriptionHistory.length < 2 || !vm.isDowngraded)
      return null;
    const currentStart = vm.subscription?.startDate
      ? new Date(vm.subscription.startDate).getTime()
      : 0;
    // Find the most recently canceled subscription that was replaced by the current downgrade
    // It must have been canceled AROUND the time the current sub started (within 1 minute)
    return (
      vm.subscriptionHistory.find((s) => {
        if (s.status?.toLowerCase() !== "canceled" || s.id === vm.subscription?.id) return false;
        const endTime = s.endDate ? new Date(s.endDate).getTime() : 0;
        // Must have been canceled within 1 minute of the current sub's start (same operation)
        return Math.abs(endTime - currentStart) < 60000;
      }) ?? null
    );
  }, [vm.subscriptionHistory, vm.isDowngraded, vm.subscription?.startDate, vm.subscription?.id]);

  // ── Promotion picker data for Change Plan dialog ──
  const { changePlanPromotionsRaw, isLoadingChangePlanPromos } = vm;

  const changePlanPromotions = useMemo(() => {
    return (changePlanPromotionsRaw as any[])
      .filter((p) => {
        if (!p.isActive) return false;
        if (p.validUntil && new Date(p.validUntil) < new Date()) return false;
        if (p.validFrom && new Date(p.validFrom) > new Date()) return false;
        if (p.maxRedemptions != null && p.currentRedemptions >= p.maxRedemptions) return false;
        if (p.applicableCycle && selectedType) {
          const cycleMap: Record<string, string> = {
            Monthly: "Monthly",
            Yearly: "Yearly",
            Lifetime: "Lifetime",
          };
          if (p.applicableCycle !== cycleMap[selectedType]) return false;
        }
        return true;
      })
      .map((p: any) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        discountValue: p.discountValue,
        requiresCode: p.requiresCode,
      }));
  }, [changePlanPromotionsRaw, selectedType]);

  // Edition options for GenericSelect
  const editionOptions: GenericSelectOption[] = (vm.availableEditions || []).map((e) => ({
    value: e.id,
    label: e.name || e.displayNameEn || e.id,
  }));

  // Find current and selected editions for dynamic filtering
  const currentEdition =
    (vm.availableEditions || []).find((e) => e.id === vm.subscription?.editionId) || null;
  const selectedEdition =
    (vm.availableEditions || []).find((e) => e.id === selectedEditionId) || currentEdition;

  if (vm.isLoading) {
    return (
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const { subscription } = vm;
  const statusKey = subscription?.status?.toLowerCase() ?? "";
  const statusConfig = STATUS_CONFIG[statusKey] ?? STATUS_CONFIG.active;
  const StatusIcon = statusConfig.icon;

  // ── No Subscription State ──

  if (!subscription) {
    return (
      <>
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
            <div className="rounded-full bg-muted p-3">
              <CreditCard className="h-6 w-6 opacity-50" />
            </div>
            <p className="text-sm">{t("tenant.noSubscription") || "No active subscription"}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedEditionId("");
                setSelectedType("Monthly");
                setChangePlanOpen(true);
              }}
            >
              {t("tenant.assignPlan") || "Assign Plan"}
            </Button>
          </CardContent>
        </Card>
        {renderChangePlanDialog()}
      </>
    );
  }

  // ── Active Subscription Card ──

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-base">
              <CreditCard className="h-4 w-4" />
              {t("tenant.subscriptionPlan") || "Subscription Plan"}
            </CardTitle>
            <CardDescription>
              {t("tenant.subscriptionPlanDesc") || "Manage edition and billing for this tenant."}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* ── Status Grid ── */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {/* Edition Name */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {t("tenant.currentPlan") || "Plan"}
              </p>
              <p className="text-sm font-bold">
                {subscription.editionName || t("tenant.unknownPlan") || "Unknown"}
              </p>
            </div>

            {/* Type Badge */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {t("tenant.billingCycle") || "Billing"}
              </p>
              <Badge variant="outline" className="text-xs">
                {getTypeLabel(subscription.type, t, subscription.totalAmount === 0)}
              </Badge>
            </div>

            {/* Status Badge */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {t("tenant.status") || "Status"}
              </p>
              <Badge variant={statusConfig.variant} className="gap-1 text-xs">
                <StatusIcon className="h-3 w-3" />
                {getStatusLabel(subscription.status, t)}
              </Badge>
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {t("tenant.startDate") || "Start"}
              </p>
              <p className="flex items-center gap-1 text-sm font-medium">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                {formatDate(subscription.startDate)}
              </p>
            </div>

            {/* End Date / Days Remaining */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">
                {t("tenant.endDate") || "Expires"}
              </p>
              {subscription.endDate ? (
                <div>
                  <p className="text-sm font-medium">{formatDate(subscription.endDate)}</p>
                  {vm.daysRemaining !== null && (
                    <p
                      className={`text-xs ${vm.daysRemaining <= 7 ? "font-semibold text-destructive" : "text-muted-foreground"}`}
                    >
                      {vm.daysRemaining > 0
                        ? `${vm.daysRemaining} ${t("tenant.daysLeft") || "days left"}`
                        : t("tenant.expired") || "Expired"}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm font-medium text-muted-foreground">
                  {t("tenant.never") || "Never"}
                </p>
              )}
            </div>
          </div>

          {/* ── Pricing Info / Free Plan Banner ── */}
          {subscription.type === "Free" ||
          (subscription.type === "Lifetime" && subscription.totalAmount === 0) ? (
            <div className="flex items-center gap-3 rounded-lg border border-success/20 bg-success/5 p-4 text-success">
              <Gift className="h-5 w-5 shrink-0 animate-pulse text-success" />
              <div>
                <p className="text-sm font-semibold">{t("tenant.freePlanTitle") || "Free Plan"}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {t("tenant.freePlanDesc") ||
                    "This tenant is on a permanently free plan. No pricing, invoicing, or billing operations are required."}
                </p>
              </div>
            </div>
          ) : (
            subscription.currency &&
            subscription.totalAmount != null && (
              <div className="space-y-3 rounded-lg border border-border/50 bg-muted/30 p-3">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("tenant.billingCurrency") || "Currency"}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">
                        {SUPPORTED_CURRENCIES.find((c) => c.code === subscription.currency)?.flag ||
                          "🌍"}
                      </span>
                      <span className="text-sm font-bold">{subscription.currency}</span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">
                      {t("tenant.baseAmount") || "Plan Price"}
                    </p>
                    <p className="text-sm font-medium">
                      {formatDisplay(
                        subscription.baseAmount ?? subscription.totalAmount,
                        subscription.currency
                      )}
                    </p>
                  </div>
                  {(subscription.adjustmentAmount ?? 0) !== 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        {(subscription.adjustmentAmount ?? 0) < 0
                          ? t("tenant.entitlementLabels.overridesDiscount") || "Override Discount"
                          : t("tenant.entitlementLabels.overridesTotalCost") || "Override Costs"}
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          (subscription.adjustmentAmount ?? 0) < 0
                            ? "text-success"
                            : "text-warning"
                        }`}
                      >
                        {(subscription.adjustmentAmount ?? 0) > 0 ? "+" : ""}
                        {formatDisplay(subscription.adjustmentAmount!, subscription.currency)}
                      </p>
                    </div>
                  )}
                  {subscription.currency !== "USD" && subscription.exchangeRateToUsd && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t("tenant.exchangeRate") || "Rate"}
                      </p>
                      <p className="font-mono text-xs text-muted-foreground">
                        1 {subscription.currency} = {subscription.exchangeRateToUsd.toFixed(4)} USD
                      </p>
                    </div>
                  )}
                  {subscription.appliedPromotionName && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground">
                        {t("tenant.appliedPromotion") || "Promotion"}
                      </p>
                      <Badge
                        variant="secondary"
                        className="bg-success/10 text-success"
                      >
                        🏷️ {subscription.appliedPromotionName}
                        {subscription.promotionDiscount != null &&
                          subscription.promotionDiscount > 0 && (
                            <span className="ml-1">
                              (–
                              {formatDisplay(subscription.promotionDiscount, subscription.currency)}
                              )
                            </span>
                          )}
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Grand Total Bar — only when there are adjustments */}
                {(subscription.adjustmentAmount ?? 0) !== 0 && (
                  <div className="flex items-center justify-between rounded-md border border-primary/20 bg-primary/5 px-3 py-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {t("tenant.grandTotal") || "Grand Total"}
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {formatDisplay(subscription.totalAmount, subscription.currency)}
                    </span>
                  </div>
                )}
              </div>
            )
          )}

          {/* ── Expiration Warning ── */}
          {vm.daysRemaining !== null && vm.daysRemaining > 0 && vm.daysRemaining <= 7 && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                {t("tenant.expiringWarning") ||
                  `Subscription expires in ${vm.daysRemaining} day(s). Consider renewing.`}
              </span>
            </div>
          )}

          {/* ── Suspended Banner ── */}
          {vm.isSuspended && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <Shield className="h-4 w-4 shrink-0" />
              <span>
                {t("tenant.suspendedBanner") ||
                  "This subscription is suspended. The tenant cannot access the system."}
              </span>
            </div>
          )}

          {/* ── Downgraded Banner ── */}
          {vm.isDowngraded && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 shrink-0" />
                <span>
                  {t("tenant.downgradedBanner") || "Downgraded from"}{" "}
                  <strong>{vm.downgradedFromEditionName}</strong>
                  {" ("}
                  {vm.downgradedFromType}
                  {")"}
                  {vm.downgradedAt && <> — {formatDateUtc(vm.downgradedAt)}</>}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRestoreType((vm.downgradedFromType as SubscriptionType) || "Monthly");
                  setResumeOpen(true);
                }}
              >
                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                {t("tenant.restoreOriginalPlan") || "Restore Original Plan"}
              </Button>
            </div>
          )}

          {/* ── Refund Info Banner (from the subscription canceled in this downgrade) ── */}
          {previousRefundedSub &&
            previousRefundedSub.refundType &&
            previousRefundedSub.refundType !== "None" &&
            (previousRefundedSub.refundAmount ?? 0) > 0 && (
              <div className="space-y-1 rounded-lg border border-success/30 bg-success/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-success">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <span>
                    {previousRefundedSub.refundType === "Full"
                      ? t("tenant.fullRefundIssued") || "Full refund issued"
                      : t("tenant.partialRefundIssued") || "Partial refund issued"}
                    {previousRefundedSub.refundAmount != null && (
                      <span className="ml-1 font-bold">
                        {formatDisplay(
                          previousRefundedSub.refundAmount,
                          previousRefundedSub.currency || "USD"
                        )}
                      </span>
                    )}
                    {previousRefundedSub.refundedAt && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        — {formatDateUtc(previousRefundedSub.refundedAt)}
                      </span>
                    )}
                  </span>
                </div>
                {previousRefundedSub.refundReason && (
                  <p className="pl-6 text-xs text-muted-foreground">
                    {t("tenant.refundReason") || "Reason"}: {previousRefundedSub.refundReason}
                  </p>
                )}
                <p className="pl-6 text-xs text-muted-foreground">
                  {t("tenant.previousPlan") || "Previous plan"}: {previousRefundedSub.editionName} (
                  {previousRefundedSub.type})
                  {previousRefundedSub.totalAmount != null && (
                    <span className="ml-1">
                      —{" "}
                      {formatDisplay(
                        previousRefundedSub.totalAmount,
                        previousRefundedSub.currency || "USD"
                      )}
                    </span>
                  )}
                </p>
              </div>
            )}

          {/* ── Current Subscription Refund Info ── */}
          {subscription.refundType &&
            subscription.refundType !== "None" &&
            (subscription.refundAmount ?? 0) > 0 && (
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-warning">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <span>
                    {subscription.refundType === "Full"
                      ? t("tenant.fullRefundApplied") || "Full refund applied"
                      : t("tenant.partialRefundApplied") || "Partial refund applied"}
                    {subscription.refundAmount != null && (
                      <span className="ml-1 font-bold">
                        {formatDisplay(subscription.refundAmount, subscription.currency || "USD")}
                      </span>
                    )}
                    {subscription.refundedAt && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        — {formatDateUtc(subscription.refundedAt)}
                      </span>
                    )}
                  </span>
                </div>
                {subscription.refundReason && (
                  <p className="pl-6 text-xs text-muted-foreground">
                    {t("tenant.refundReason") || "Reason"}: {subscription.refundReason}
                  </p>
                )}
              </div>
            )}

          {/* ── Past Due Banner ── */}
          {vm.isPastDue && (
            <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                {t("tenant.pastDueBanner") ||
                  "Payment past due — subscription at risk. Renew to avoid suspension."}
              </span>
            </div>
          )}

          {/* ── Canceled Banner ── */}
          {vm.isCanceled && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-muted bg-muted/30 p-3 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{t("tenant.canceledBanner") || "Subscription has been canceled."}</span>
              </div>
              {vm.canReassign && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEditionId("");
                    setSelectedType("Monthly");
                    setChangePlanOpen(true);
                  }}
                >
                  <ArrowUpCircle className="mr-1.5 h-3.5 w-3.5" />
                  {t("tenant.reassignPlan") || "Reassign Plan"}
                </Button>
              )}
            </div>
          )}

          {/* ── Expired Banner ── */}
          {vm.isExpired && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{t("tenant.expiredBanner") || "Subscription has expired."}</span>
              </div>
              {vm.canReassign && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedEditionId("");
                    setSelectedType("Monthly");
                    setChangePlanOpen(true);
                  }}
                >
                  <ArrowUpCircle className="mr-1.5 h-3.5 w-3.5" />
                  {t("tenant.reassignPlan") || "Reassign Plan"}
                </Button>
              )}
            </div>
          )}

          {/* ── Fallback Info Badge ── */}
          {vm.hasFallback && !vm.isCanceled && !vm.isExpired && (
            <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-sm text-info">
              <ArrowDownCircle className="h-4 w-4 shrink-0" />
              <span>
                {vm.subscription?.type === "Lifetime"
                  ? t("tenant.fallbackOnAction") || "On cancel/suspend"
                  : t("tenant.fallbackInfo") || "On expiry"}
                {" → "}
                <strong>{vm.fallbackEditionName}</strong>
                {vm.expiryBehavior === "Suspend" && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    ({t("tenant.fullSuspendMode") || "full suspend mode"})
                  </span>
                )}
              </span>
            </div>
          )}

          {/* ── M-3: PendingPayment Warning Banner ── */}
          {vm.isPendingPayment && (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 shrink-0" />
                <span>
                  {t("tenant.pendingPaymentBanner") ||
                    "Subscription is awaiting payment confirmation. Generate a payment link or cancel to release."}
                </span>
              </div>
            </div>
          )}

          {/* ── Actions Row ── */}
          <div className="flex flex-wrap gap-2 border-t pt-3">
            {/* Change Plan — hidden for PendingPayment, Canceled, Expired */}
            {!vm.isPendingPayment && !vm.isCanceled && !vm.isExpired && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedEditionId(subscription.editionId || "");
                  setSelectedType((subscription.type as SubscriptionType) || "Monthly");
                  setChangePlanOpen(true);
                }}
              >
                <Pencil className="mr-1.5 h-3.5 w-3.5" />
                {t("tenant.changePlan") || "Change Plan"}
              </Button>
            )}

            {/* Renew — hidden for Lifetime */}
            {vm.canRenew && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedType((subscription.type as SubscriptionType) || "Monthly");
                  setRenewOpen(true);
                }}
              >
                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                {t("tenant.renew") || "Renew"}
              </Button>
            )}

            {/* Convert Trial */}
            {vm.canConvertTrial && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setSelectedType("Monthly");
                  setConvertOpen(true);
                }}
              >
                <ArrowUpCircle className="mr-1.5 h-3.5 w-3.5" />
                {t("tenant.convertTrial") || "Convert to Paid"}
              </Button>
            )}

            {/* Suspend */}
            {vm.canSuspend && (
              <Button
                variant="outline"
                size="sm"
                className="text-warning hover:text-warning/90"
                onClick={() => {
                  setSuspendReason("");
                  setSuspendOpen(true);
                }}
              >
                <Pause className="mr-1.5 h-3.5 w-3.5" />
                {t("tenant.suspend") || "Suspend"}
              </Button>
            )}

            {/* Resume / Restore — dynamic label */}
            {vm.canResume && (
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (vm.isDowngraded) {
                    setRestoreType((vm.downgradedFromType as SubscriptionType) || "Monthly");
                  }
                  setResumeOpen(true);
                }}
              >
                {vm.isDowngraded ? (
                  <>
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    {t("tenant.restoreOriginalPlan") || "Restore Original Plan"}
                  </>
                ) : (
                  <>
                    <Play className="mr-1.5 h-3.5 w-3.5" />
                    {t("tenant.resume") || "Resume"}
                  </>
                )}
              </Button>
            )}

            {/* Cancel */}
            {vm.canCancel && (
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => {
                  setCancelReason("");
                  setCancelOpen(true);
                }}
              >
                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                {t("tenant.cancel") || "Cancel"}
              </Button>
            )}

            {/* Resync Permissions — hidden for PendingPayment */}
            {!vm.isPendingPayment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => vm.resyncPermissions()}
                loading={vm.isResyncing}
                title={t("tenant.resyncPermissions") || "Re-sync permissions from edition"}
              >
                {!vm.isResyncing && <RotateCcw className="h-3.5 w-3.5" />}
              </Button>
            )}

            {/* Change Currency */}
            {vm.isActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCurrency(subscription.currency || "USD");
                  setChangeCurrencyOpen(true);
                }}
              >
                <Globe className="mr-1.5 h-3.5 w-3.5" />
                {t("tenant.changeCurrency") || "Currency"}
              </Button>
            )}

            {/* Download Receipt */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.downloadReceipt()}
              loading={vm.isDownloadingReceipt}
            >
              {!vm.isDownloadingReceipt && <FileDown className="mr-1.5 h-3.5 w-3.5" />}
              {t("tenant.downloadReceipt") || "Receipt"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Dialogs ── */}
      {renderChangePlanDialog()}
      {renderRenewDialog()}
      {renderConvertDialog()}
      {renderSuspendDialog()}
      {renderCancelDialog()}
      {renderResumeDialog()}
      {renderChangeCurrencyDialog()}
    </>
  );

  // ═══════════════════════════════════════════════════════════════
  // DIALOG RENDERERS
  // ═══════════════════════════════════════════════════════════════

  function renderChangePlanDialog() {
    // Fetch downgrade impact when edition changes
    const fetchImpact = async (editionId: string) => {
      if (!editionId || !subscription) {
        setImpactReport(null);
        return;
      }
      if (editionId === subscription.editionId) {
        setImpactReport(null);
        return;
      }
      setIsLoadingImpact(true);
      try {
        const report = await vm.getDowngradeImpact(editionId);
        setImpactReport(report);
      } catch {
        setImpactReport(null);
      }
      setIsLoadingImpact(false);
    };

    // Fetch price preview when edition + type changes
    const fetchPrice = async (editionId: string, type: string) => {
      if (!editionId) {
        setPreviewAmount(null);
        return;
      }
      const currency = subscription?.currency || "USD";
      setIsLoadingPrice(true);
      try {
        const amount = await vm.previewPrice(editionId, currency, type);
        setPreviewAmount(amount);
      } catch {
        setPreviewAmount(null);
      }
      setIsLoadingPrice(false);
    };

    return (
      <Dialog
        open={changePlanOpen}
        onOpenChange={(open) => {
          setChangePlanOpen(open);
          if (!open) {
            setImpactReport(null);
            setPreviewAmount(null);
            setSelectedPromotionId("");
            setPromoCode("");
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t("tenant.changeSubscriptionPlan") || "Change Subscription Plan"}
            </DialogTitle>
            <DialogDescription>
              {t("tenant.changeSubscriptionPlanDesc") || "Select a new edition and billing cycle."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("tenant.selectPlan") || "Edition"}</Label>
              <GenericSelect
                options={editionOptions}
                value={selectedEditionId}
                onValueChange={(v: string | string[]) => {
                  const id = v as string;
                  setSelectedEditionId(id);
                  fetchImpact(id);
                  const targetEdition = (vm.availableEditions || []).find((e) => e.id === id);
                  const newType = targetEdition?.isFree ? "Lifetime" : selectedType;
                  if (targetEdition?.isFree) {
                    setSelectedType("Lifetime");
                  }
                  fetchPrice(id, newType);
                }}
                placeholder={t("tenant.selectAPlan") || "Select an edition"}
              />
            </div>
            {selectedEditionId && (
              <>
                <div className="space-y-2">
                  <Label>{t("tenant.billingCycle") || "Billing Cycle"}</Label>
                  <GenericSelect
                    options={getBillingCycleOptions(t, selectedEdition)}
                    value={selectedType}
                    onValueChange={(v: string | string[]) => {
                      const type = v as SubscriptionType;
                      setSelectedType(type);
                      fetchPrice(selectedEditionId, type);
                    }}
                    placeholder={t("tenant.selectBillingCycle") || "Select billing cycle"}
                  />
                </div>

                {/* ── Promotion Picker ── */}
                {changePlanPromotions.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t("tenant.selectPromotion") || "Promotion (optional)"}</Label>
                    <GenericSelect
                      options={[
                        { value: "", label: t("tenant.noPromotion") || "No promotion" },
                        ...changePlanPromotions.map((p) => ({
                          value: p.id,
                          label: `${p.name} (${p.type === "Percentage" ? `${p.discountValue}%` : `${p.discountValue}`} off)`,
                        })),
                      ]}
                      value={selectedPromotionId}
                      onValueChange={(v: string | string[]) => {
                        setSelectedPromotionId(v as string);
                        if (!v) setPromoCode("");
                      }}
                      placeholder={t("tenant.selectPromotion") || "Select a promotion"}
                    />
                  </div>
                )}
                {/* ── Promo Code (only for code-required promotions) ── */}
                {selectedPromotionId &&
                  changePlanPromotions.find((p) => p.id === selectedPromotionId)?.requiresCode && (
                    <div className="space-y-2">
                      <Label>{t("tenant.promoCode") || "Promo Code"}</Label>
                      <Input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder={t("tenant.promoCodePlaceholder") || "Enter promo code"}
                      />
                    </div>
                  )}
                {/* No promotions but allow raw promo code entry */}
                {changePlanPromotions.length === 0 &&
                  !isLoadingChangePlanPromos &&
                  selectedEditionId && (
                    <div className="space-y-2">
                      <Label>{t("tenant.promoCode") || "Promo Code"}</Label>
                      <Input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder={
                          t("tenant.promoCodePlaceholder") || "Enter promo code (optional)"
                        }
                      />
                    </div>
                  )}

                {/* ── Price Preview ── */}
                {isLoadingPrice && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t("common.loading") || "Loading..."}
                  </div>
                )}
                {!isLoadingPrice && previewAmount !== null && previewAmount >= 0 && (
                  <div className="rounded-lg border border-success/30 bg-success/5 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-muted-foreground">
                        {t("tenant.totalAmount") || "Total Amount"}
                      </span>
                      <span className="text-lg font-bold text-success">
                        {previewAmount === 0
                          ? t("tenant.typeLabel.free") || "Free"
                          : formatDisplay(previewAmount, subscription?.currency || "USD")}
                      </span>
                    </div>
                  </div>
                )}

                {/* ── Downgrade Impact Warning ── */}
                {isLoadingImpact && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {t("tenant.checkingImpact") || "Checking impact..."}
                  </div>
                )}
                {!isLoadingImpact && impactReport?.hasOverflow && (
                  <div className="space-y-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {t("tenant.downgradeWarning") || "Resource limits will be exceeded"}
                    </div>
                    <div className="space-y-1">
                      {impactReport.overflows.map((o, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">{o.resourceType}</span>
                          <span className="font-mono text-destructive">
                            {o.currentCount} / {o.newLimit === -1 ? "∞" : o.newLimit}
                            <span className="ml-1 font-semibold text-destructive">
                              (+{o.overflowCount} {t("tenant.overflow") || "over"})
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("tenant.overflowInfo") ||
                        "Excess resources will need to be removed or the system will auto-adjust."}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChangePlanOpen(false)}
              disabled={vm.isChanging}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              variant={impactReport?.hasOverflow ? "destructive" : "default"}
              onClick={() => {
                if (selectedEditionId) {
                  // C-4 FIX: Use assignEdition for no-subscription state, changeEdition for existing
                  if (vm.hasNoSubscription || vm.canReassign) {
                    vm.assignEdition(
                      selectedEditionId,
                      selectedType,
                      subscription?.currency,
                      promoCode.trim() || undefined,
                      selectedPromotionId || undefined
                    );
                  } else {
                    vm.changeEdition(
                      selectedEditionId,
                      selectedType,
                      subscription?.currency,
                      promoCode.trim() || undefined,
                      selectedPromotionId || undefined
                    );
                  }
                  setChangePlanOpen(false);
                  setImpactReport(null);
                  setPreviewAmount(null);
                  setPromoCode("");
                  setSelectedPromotionId("");
                }
              }}
              disabled={!selectedEditionId}
              loading={vm.isChanging || vm.isAssigning}
            >
              {!(vm.isChanging || vm.isAssigning) &&
                (impactReport?.hasOverflow
                  ? t("tenant.confirmDowngrade") || "Confirm Downgrade"
                  : vm.hasNoSubscription || vm.canReassign
                    ? t("tenant.assignPlan") || "Assign Plan"
                    : t("common.save") || "Save")}
              {(vm.isChanging || vm.isAssigning) && (t("common.saving") || "Saving...")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function renderRenewDialog() {
    return (
      <Dialog open={renewOpen} onOpenChange={setRenewOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("tenant.renewSubscription") || "Renew Subscription"}</DialogTitle>
            <DialogDescription>
              {t("tenant.renewDesc") ||
                "Extend the subscription period. The new period will be added from the current end date."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {subscription && (
              <div className="space-y-1 rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  {t("tenant.currentEndDate") || "Current End Date"}
                </p>
                <p className="text-sm font-medium">
                  {subscription.endDate
                    ? formatDate(subscription.endDate)
                    : t("tenant.never") || "Never (Lifetime)"}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("tenant.extendBy") || "Extend By"}</Label>
              <GenericSelect
                options={getRenewOptions(t, currentEdition)}
                value={selectedType}
                onValueChange={(v: string | string[]) => setSelectedType(v as SubscriptionType)}
                placeholder={t("tenant.selectRenewalPeriod") || "Select renewal period"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewOpen(false)} disabled={vm.isRenewing}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={() => {
                vm.renewSubscription(selectedType);
                setRenewOpen(false);
              }}
              loading={vm.isRenewing}
            >
              {vm.isRenewing ? t("common.saving") || "Saving..." : t("tenant.renew") || "Renew"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function renderConvertDialog() {
    return (
      <Dialog open={convertOpen} onOpenChange={setConvertOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("tenant.convertTrial") || "Convert Trial to Paid Plan"}</DialogTitle>
            <DialogDescription>
              {t("tenant.convertTrialDesc") ||
                "Select a billing cycle for the paid plan. The new period starts from today."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>
                {t("tenant.trialOnceWarning") ||
                  "Trial can only be used once per edition. This action is irreversible."}
              </span>
            </div>
            <div className="space-y-2">
              <Label>{t("tenant.selectBillingCycle") || "Billing Cycle"}</Label>
              <GenericSelect
                options={getConvertOptions(t, currentEdition)}
                value={selectedType}
                onValueChange={(v: string | string[]) => setSelectedType(v as SubscriptionType)}
                placeholder={t("tenant.selectBillingCycle") || "Select billing cycle"}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConvertOpen(false)}
              disabled={vm.isConverting}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={() => {
                vm.convertTrial(selectedType);
                setConvertOpen(false);
              }}
              loading={vm.isConverting}
            >
              {vm.isConverting
                ? t("common.saving") || "Converting..."
                : t("tenant.convertToPaid") || "Convert to Paid"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function renderSuspendDialog() {
    return (
      <Dialog
        open={suspendOpen}
        onOpenChange={(open) => {
          if (!open) closeSuspendDialog();
          else setSuspendOpen(true);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {t("tenant.suspendSubscription") || "Suspend Subscription"}
            </DialogTitle>
            <DialogDescription>
              {t("tenant.suspendDesc") ||
                "This tenant will lose access to the system while suspended. You can resume it later."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Fallback toggle */}
            {vm.hasFallback && (
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {t("tenant.downgradeToFallback") || `Downgrade to ${vm.fallbackEditionName}`}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {useFallbackOnSuspend
                        ? t("tenant.downgradeDesc") ||
                          `Tenant will be moved to the ${vm.fallbackEditionName} plan and remain active.`
                        : t("tenant.fullSuspendDesc") ||
                          "Tenant will be fully suspended and all admins deactivated."}
                    </p>
                  </div>
                  <Switch
                    checked={useFallbackOnSuspend}
                    onCheckedChange={setUseFallbackOnSuspend}
                  />
                </div>
              </div>
            )}
            {/* Admin deactivation warning */}
            {!useFallbackOnSuspend || !vm.hasFallback ? (
              <div className="flex items-center gap-2 rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {t("tenant.suspendAdminWarning") ||
                    "All tenant administrators will be deactivated and unable to access the system until the subscription is resumed."}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-sm text-info">
                <ArrowDownCircle className="h-4 w-4 shrink-0" />
                <span>
                  {t("tenant.downgradeKeepActive") ||
                    `Tenant will keep active on ${vm.fallbackEditionName} with reduced features.`}
                </span>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("tenant.suspendReason") || "Reason for suspension"} *</Label>
              <Textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder={
                  t("tenant.suspendReasonPlaceholder") || "e.g. Payment fraud, Terms violation..."
                }
                className="min-h-[80px]"
              />
              {suspendReason.length > 0 && suspendReason.trim().length < 3 && (
                <p className="text-xs text-destructive">
                  {t("tenant.suspendReasonMinLength") || "Reason must be at least 3 characters"}
                </p>
              )}
            </div>

            {/* ── Refund Options ── */}
            <div className="space-y-3 rounded-lg border p-3">
              <Label className="text-sm font-medium">
                {t("tenant.refundOption") || "Refund Option"}
              </Label>
              <RadioGroup
                value={suspendRefundType}
                onValueChange={setSuspendRefundType}
                className="space-y-2"
              >
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50"
                  onClick={() => setSuspendRefundType("None")}
                >
                  <RadioGroupItem value="None" id="suspend-refund-none" className="mt-0.5" />
                  <div>
                    <Label htmlFor="suspend-refund-none" className="cursor-pointer font-medium">
                      {t("tenant.noRefund") || "No Refund"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("tenant.noRefundDesc") || "No money will be returned to the tenant."}
                    </p>
                  </div>
                </div>
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50"
                  onClick={() => setSuspendRefundType("Full")}
                >
                  <RadioGroupItem value="Full" id="suspend-refund-full" className="mt-0.5" />
                  <div>
                    <Label htmlFor="suspend-refund-full" className="cursor-pointer font-medium">
                      {t("tenant.fullRefund") || "Full Refund"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("tenant.fullRefundDesc") || "Return the full subscription amount."}
                      {subscription?.totalAmount != null && subscription.totalAmount > 0 && (
                        <span className="ml-1 font-semibold text-success">
                          (
                          {formatDisplay(subscription.totalAmount, subscription?.currency || "USD")}
                          )
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50"
                  onClick={() => setSuspendRefundType("ProRata")}
                >
                  <RadioGroupItem value="ProRata" id="suspend-refund-prorata" className="mt-0.5" />
                  <div>
                    <Label htmlFor="suspend-refund-prorata" className="cursor-pointer font-medium">
                      {t("tenant.proRataRefund") || "Pro-Rata Refund"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("tenant.proRataRefundDesc") ||
                        "Return money proportional to remaining unused days."}
                    </p>
                  </div>
                </div>
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50"
                  onClick={() => setSuspendRefundType("Custom")}
                >
                  <RadioGroupItem value="Custom" id="suspend-refund-custom" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="suspend-refund-custom" className="cursor-pointer font-medium">
                      {t("tenant.customRefund") || "Custom Amount"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("tenant.customRefundDesc") || "Specify a custom refund amount."}
                    </p>
                    {suspendRefundType === "Custom" && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={suspendCustomAmount}
                            onChange={(e) => setSuspendCustomAmount(e.target.value)}
                            placeholder={t("tenant.customAmountPlaceholder") || "e.g., 50.00"}
                            className="max-w-[200px] font-mono"
                          />
                          <span className="text-sm font-medium text-muted-foreground">
                            {subscription?.currency || "USD"}
                          </span>
                        </div>
                        {suspendCustomAmount &&
                          !isNaN(parseLocalizedNumber(suspendCustomAmount) ?? NaN) &&
                          subscription?.exchangeRateToUsd &&
                          subscription.currency !== "USD" && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              ≈{" "}
                              {formatDisplay(
                                (parseLocalizedNumber(suspendCustomAmount) ?? 0) *
                                  subscription.exchangeRateToUsd,
                                "USD"
                              )}
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeSuspendDialog} disabled={vm.isSuspending}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (suspendReason.trim().length >= 3) {
                  vm.suspendSubscription(
                    suspendReason.trim(),
                    vm.hasFallback ? useFallbackOnSuspend : undefined,
                    suspendRefundType === "Custom" ? "ProRata" : suspendRefundType,
                    suspendRefundType === "Custom" && suspendCustomAmount
                      ? parseLocalizedNumber(suspendCustomAmount)
                      : undefined
                  );
                  closeSuspendDialog();
                }
              }}
              disabled={suspendReason.trim().length < 3}
              loading={vm.isSuspending}
            >
              {!vm.isSuspending && <Pause className="mr-2 h-4 w-4" />}
              {useFallbackOnSuspend && vm.hasFallback
                ? t("tenant.downgrade") || "Downgrade"
                : t("tenant.suspend") || "Suspend"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function renderCancelDialog() {
    return (
      <Dialog
        open={cancelOpen}
        onOpenChange={(open) => {
          if (!open) closeCancelDialog();
          else setCancelOpen(true);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive">
              {t("tenant.cancelSubscription") || "Cancel Subscription"}
            </DialogTitle>
            <DialogDescription>
              {t("tenant.cancelDesc") ||
                "This will permanently end the subscription. The tenant will lose all edition features and permissions."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Fallback toggle */}
            {vm.hasFallback && (
              <div className="space-y-3 rounded-lg border p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {t("tenant.downgradeToFallback") || `Downgrade to ${vm.fallbackEditionName}`}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {useFallbackOnCancel
                        ? t("tenant.cancelDowngradeDesc") ||
                          `Tenant will be moved to ${vm.fallbackEditionName} and remain active.`
                        : t("tenant.cancelPermanentDesc") ||
                          "Subscription will be permanently canceled and all admins deactivated."}
                    </p>
                  </div>
                  <Switch checked={useFallbackOnCancel} onCheckedChange={setUseFallbackOnCancel} />
                </div>
              </div>
            )}
            {/* Admin deactivation warning */}
            {!useFallbackOnCancel || !vm.hasFallback ? (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                  {t("tenant.cancelAdminWarning") ||
                    "All tenant administrators will be permanently deactivated. This action cannot be undone."}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-sm text-info">
                <ArrowDownCircle className="h-4 w-4 shrink-0" />
                <span>
                  {t("tenant.cancelDowngradeKeepActive") ||
                    `Tenant will keep active on ${vm.fallbackEditionName} with reduced features.`}
                </span>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("tenant.cancelReason") || "Reason (optional)"}</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={
                  t("tenant.cancelReasonPlaceholder") || "Why are you canceling this subscription?"
                }
                className="min-h-[80px]"
              />
            </div>

            {/* ── Refund Options ── */}
            <div className="space-y-3 rounded-lg border p-3">
              <Label className="text-sm font-medium">
                {t("tenant.refundOption") || "Refund Option"}
              </Label>
              <RadioGroup
                value={cancelRefundType}
                onValueChange={setCancelRefundType}
                className="space-y-2"
              >
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50"
                  onClick={() => setCancelRefundType("None")}
                >
                  <RadioGroupItem value="None" id="cancel-refund-none" className="mt-0.5" />
                  <div>
                    <Label htmlFor="cancel-refund-none" className="cursor-pointer font-medium">
                      {t("tenant.noRefund") || "No Refund"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("tenant.noRefundDesc") || "No money will be returned to the tenant."}
                    </p>
                  </div>
                </div>
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50"
                  onClick={() => setCancelRefundType("Full")}
                >
                  <RadioGroupItem value="Full" id="cancel-refund-full" className="mt-0.5" />
                  <div>
                    <Label htmlFor="cancel-refund-full" className="cursor-pointer font-medium">
                      {t("tenant.fullRefund") || "Full Refund"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("tenant.fullRefundDesc") || "Return the full subscription amount."}
                      {subscription?.totalAmount != null && subscription.totalAmount > 0 && (
                        <span className="ml-1 font-semibold text-success">
                          (
                          {formatDisplay(subscription.totalAmount, subscription?.currency || "USD")}
                          )
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50"
                  onClick={() => setCancelRefundType("ProRata")}
                >
                  <RadioGroupItem value="ProRata" id="cancel-refund-prorata" className="mt-0.5" />
                  <div>
                    <Label htmlFor="cancel-refund-prorata" className="cursor-pointer font-medium">
                      {t("tenant.proRataRefund") || "Pro-Rata Refund"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("tenant.proRataRefundDesc") ||
                        "Return money proportional to remaining unused days."}
                    </p>
                  </div>
                </div>
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-md border p-3 hover:bg-muted/50"
                  onClick={() => setCancelRefundType("Custom")}
                >
                  <RadioGroupItem value="Custom" id="cancel-refund-custom" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="cancel-refund-custom" className="cursor-pointer font-medium">
                      {t("tenant.customRefund") || "Custom Amount"}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t("tenant.customRefundDesc") || "Specify a custom refund amount."}
                    </p>
                    {cancelRefundType === "Custom" && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={cancelCustomAmount}
                            onChange={(e) => setCancelCustomAmount(e.target.value)}
                            placeholder={t("tenant.customAmountPlaceholder") || "e.g., 50.00"}
                            className="max-w-[200px] font-mono"
                          />
                          <span className="text-sm font-medium text-muted-foreground">
                            {subscription?.currency || "USD"}
                          </span>
                        </div>
                        {cancelCustomAmount &&
                          !isNaN(parseLocalizedNumber(cancelCustomAmount) ?? NaN) &&
                          subscription?.exchangeRateToUsd &&
                          subscription.currency !== "USD" && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              ≈{" "}
                              {formatDisplay(
                                (parseLocalizedNumber(cancelCustomAmount) ?? 0) *
                                  subscription.exchangeRateToUsd,
                                "USD"
                              )}
                            </p>
                          )}
                      </div>
                    )}
                  </div>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeCancelDialog} disabled={vm.isCanceling}>
              {t("common.cancel") || "Keep Subscription"}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                vm.cancelSubscription(
                  cancelReason.trim() || undefined,
                  vm.hasFallback ? useFallbackOnCancel : undefined,
                  cancelRefundType === "Custom" ? "ProRata" : cancelRefundType,
                  cancelRefundType === "Custom" && cancelCustomAmount
                    ? parseLocalizedNumber(cancelCustomAmount)
                    : undefined
                );
                closeCancelDialog();
              }}
              loading={vm.isCanceling}
            >
              {!vm.isCanceling && <XCircle className="mr-2 h-4 w-4" />}
              {useFallbackOnCancel && vm.hasFallback
                ? t("tenant.downgrade") || "Downgrade"
                : t("tenant.confirmCancel") || "Cancel Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function renderResumeDialog() {
    const isRestore = vm.isDowngraded;
    return (
      <Dialog open={resumeOpen} onOpenChange={setResumeOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isRestore
                ? t("tenant.restoreOriginalPlan") || "Restore Original Plan"
                : t("tenant.resumeSubscription") || "Resume Subscription"}
            </DialogTitle>
            <DialogDescription>
              {isRestore
                ? t("tenant.restoreDesc") ||
                  "Restore to the original plan with a new billing period."
                : t("tenant.resumeDesc") ||
                  "Resume the suspended subscription and restore tenant access."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {isRestore ? (
              /* ── RESTORE FROM DOWNGRADE ── */
              <>
                {/* Original Plan Info */}
                <div className="space-y-1 rounded-lg bg-muted/50 p-3">
                  <p className="text-xs text-muted-foreground">
                    {t("tenant.originalPlan") || "Original Plan"}
                  </p>
                  <p className="text-sm font-medium">
                    {vm.downgradedFromEditionName} — {getTypeLabel(vm.downgradedFromType || "", t)}
                  </p>
                  {vm.downgradedAt && (
                    <p className="text-xs text-muted-foreground">
                      {t("tenant.downgradedOn") || "Downgraded on"}:{" "}
                      {formatDateUtc(vm.downgradedAt)}
                    </p>
                  )}
                </div>

                {/* Billing Cycle Chooser */}
                <div className="space-y-2">
                  <Label>{t("tenant.billingCycle") || "Billing Cycle"}</Label>
                  <GenericSelect
                    value={restoreType}
                    onValueChange={(v: string) => setRestoreType(v as SubscriptionType)}
                    options={getConvertOptions(t, currentEdition)}
                    placeholder={t("tenant.selectBillingCycle") || "Select billing cycle"}
                  />
                  <p className="text-xs text-muted-foreground">
                    {t("tenant.chooseBillingCycle") || "You may choose a different billing cycle."}
                  </p>
                </div>

                {/* Info Banner */}
                <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-sm text-info">
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  <span>
                    {t("tenant.restoreInfo") ||
                      "A new billing period will start from today. Permissions will be restored to the original plan."}
                  </span>
                </div>
              </>
            ) : (
              /* ── RESUME FROM SUSPEND ── */
              <>
                <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-sm text-info">
                  <Play className="h-4 w-4 shrink-0" />
                  <span>
                    {t("tenant.resumeAdminWarning") ||
                      "All previously deactivated administrators will be re-activated and regain access to the system."}
                  </span>
                </div>
                {subscription && (
                  <div className="space-y-1 rounded-lg bg-muted/50 p-3">
                    <p className="text-xs text-muted-foreground">
                      {t("tenant.currentPlan") || "Plan"}
                    </p>
                    <p className="text-sm font-medium">
                      {subscription.editionName} — {getTypeLabel(subscription.type, t)}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResumeOpen(false)} disabled={vm.isResuming}>
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={() => {
                if (isRestore) {
                  vm.resumeSubscription(restoreType);
                } else {
                  vm.resumeSubscription();
                }
                setResumeOpen(false);
              }}
              loading={vm.isResuming}
            >
              {!vm.isResuming &&
                (isRestore ? (
                  <RotateCcw className="mr-2 h-4 w-4" />
                ) : (
                  <Play className="mr-2 h-4 w-4" />
                ))}
              {isRestore
                ? t("tenant.confirmRestore") || "Restore Plan"
                : t("tenant.confirmResume") || "Resume Subscription"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  function renderChangeCurrencyDialog() {
    const currencyOptions: GenericSelectOption[] = SUPPORTED_CURRENCIES.map((c) => ({
      value: c.code,
      label: `${c.flag} ${c.code} — ${c.name}`,
    }));

    return (
      <Dialog open={changeCurrencyOpen} onOpenChange={setChangeCurrencyOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t("tenant.changeCurrency") || "Change Billing Currency"}</DialogTitle>
            <DialogDescription>
              {t("tenant.changeCurrencyDesc") ||
                "Change the billing currency for this subscription. Pricing will be recalculated using current exchange rates."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {subscription && subscription.currency && (
              <div className="space-y-1 rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">
                  {t("tenant.currentCurrency") || "Current Currency"}
                </p>
                <p className="text-sm font-medium">
                  {SUPPORTED_CURRENCIES.find((c) => c.code === subscription.currency)?.flag || "🌍"}{" "}
                  {subscription.currency}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("tenant.newCurrency") || "New Currency"}</Label>
              <GenericSelect
                options={currencyOptions}
                value={selectedCurrency}
                onValueChange={(v: string | string[]) => setSelectedCurrency(v as string)}
                placeholder={t("tenant.selectCurrency") || "Select currency"}
              />
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-info/30 bg-info/5 p-3 text-sm text-info">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span>
                {t("tenant.changeCurrencyInfo") ||
                  "The subscription amount will be recalculated using the current exchange rate. No other subscription details will change."}
              </span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChangeCurrencyOpen(false)}
              disabled={vm.isChangingCurrency}
            >
              {t("common.cancel") || "Cancel"}
            </Button>
            <Button
              onClick={() => {
                if (selectedCurrency && selectedCurrency !== subscription?.currency) {
                  vm.changeCurrency(selectedCurrency);
                  setChangeCurrencyOpen(false);
                }
              }}
              disabled={!selectedCurrency || selectedCurrency === subscription?.currency}
              loading={vm.isChangingCurrency}
            >
              {!vm.isChangingCurrency && <Globe className="mr-2 h-4 w-4" />}
              {vm.isChangingCurrency
                ? t("common.saving") || "Saving..."
                : t("tenant.changeCurrency") || "Change Currency"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}
