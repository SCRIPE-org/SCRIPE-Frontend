// FILE-EXCEPTION: file length
"use client";

import { useState, useMemo } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
  CreditCard,
  Pencil,
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
  Tag,
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
import { formatDateUtc } from "@core/common/utils";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { Skeleton } from "@core/ui/skeleton";
import { LoadingSpinner } from "@core/ui/loading-spinner";
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
    return t("tenant.typeLabel.free");
  }
  const map: Record<string, string> = {
    Lifetime: t("tenant.typeLabel.lifetime"),
    Monthly: t("tenant.typeLabel.monthly"),
    Yearly: t("tenant.typeLabel.yearly"),
    Trial: t("tenant.typeLabel.trial"),
    AddOn: t("tenant.typeLabel.addon"),
    Free: t("tenant.typeLabel.free"),
  };
  return map[type] || type;
}

function getStatusLabel(status: string, t: (key: string) => string): string {
  const map: Record<string, string> = {
    Active: t("tenant.statusLabel.active"),
    PendingPayment: t("tenant.statusLabel.pendingPayment"),
    Trialing: t("tenant.statusLabel.trialing"),
    Suspended: t("tenant.statusLabel.suspended"),
    Canceled: t("tenant.statusLabel.canceled"),
    Expired: t("tenant.statusLabel.expired"),
    PastDue: t("tenant.statusLabel.pastdue"),
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
    return [{ value: "Free", label: t("tenant.typeLabel.free") }];
  }
  const opts: GenericSelectOption[] = [];
  if (!edition || edition.allowMonthly !== false)
    opts.push({ value: "Monthly", label: t("tenant.typeLabel.monthly") });
  if (!edition || edition.allowYearly !== false)
    opts.push({ value: "Yearly", label: t("tenant.typeLabel.yearly") });
  if (!edition || edition.allowLifetime !== false)
    opts.push({ value: "Lifetime", label: t("tenant.typeLabel.lifetime") });
  if (!edition || edition.allowTrial !== false)
    opts.push({ value: "Trial", label: t("tenant.typeLabel.trial") });
  return opts;
}

function getRenewOptions(
  t: (key: string) => string,
  edition?: EditionThinModel | null
): GenericSelectOption[] {
  if (edition?.isFree) return [];
  const opts: GenericSelectOption[] = [];
  if (!edition || edition.allowMonthly !== false)
    opts.push({ value: "Monthly", label: t("tenant.renewLabel.oneMonth") });
  if (!edition || edition.allowYearly !== false)
    opts.push({ value: "Yearly", label: t("tenant.renewLabel.oneYear") });
  if (!edition || edition.allowLifetime !== false)
    opts.push({
      value: "Lifetime",
      label: t("tenant.renewLabel.lifetime"),
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
    opts.push({ value: "Monthly", label: t("tenant.typeLabel.monthly") });
  if (!edition || edition.allowYearly !== false)
    opts.push({ value: "Yearly", label: t("tenant.typeLabel.yearly") });
  if (!edition || edition.allowLifetime !== false)
    opts.push({ value: "Lifetime", label: t("tenant.typeLabel.lifetime") });
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
        <EmptyState
          icon={CreditCard}
          size="sm"
          title={t("tenant.noSubscription")}
          action={
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedEditionId("");
                setSelectedType("Monthly");
                setChangePlanOpen(true);
              }}
            >
              {t("tenant.assignPlan")}
            </Button>
          }
        />
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
              {t("tenant.subscriptionPlan")}
            </CardTitle>
            <CardDescription>{t("tenant.subscriptionPlanDesc")}</CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 pt-2">
          {/* ── Status Grid ── */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {/* Edition Name */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-nx-ink-2">{t("tenant.currentPlan")}</p>
              <p className="text-sm font-bold">
                {subscription.editionName || t("tenant.unknownPlan")}
              </p>
            </div>

            {/* Type Badge */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-nx-ink-2">{t("tenant.billingCycle")}</p>
              <Badge variant="outline" className="text-xs">
                {getTypeLabel(subscription.type, t, subscription.totalAmount === 0)}
              </Badge>
            </div>

            {/* Status Badge */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-nx-ink-2">{t("tenant.status")}</p>
              <Badge variant={statusConfig.variant} className="gap-1 text-xs">
                <StatusIcon className="h-3 w-3" />
                {getStatusLabel(subscription.status, t)}
              </Badge>
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-nx-ink-2">{t("tenant.startDate")}</p>
              <p className="flex items-center gap-1 text-sm font-medium">
                <Calendar className="h-3 w-3 text-nx-ink-2" />
                {formatDate(subscription.startDate)}
              </p>
            </div>

            {/* End Date / Days Remaining */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-nx-ink-2">{t("tenant.endDate")}</p>
              {subscription.endDate ? (
                <div>
                  <p className="text-sm font-medium">{formatDate(subscription.endDate)}</p>
                  {vm.daysRemaining !== null && (
                    <p
                      className={`text-xs ${vm.daysRemaining <= 7 ? "font-semibold text-destructive" : "text-nx-ink-2"}`}
                    >
                      {vm.daysRemaining > 0
                        ? `${vm.daysRemaining} ${t("tenant.daysLeft")}`
                        : t("tenant.expired")}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm font-medium text-nx-ink-2">{t("tenant.never")}</p>
              )}
            </div>
          </div>

          {/* ── Pricing Info / Free Plan Banner ── */}
          {subscription.type === "Free" ||
          (subscription.type === "Lifetime" && subscription.totalAmount === 0) ? (
            <div className="flex items-center gap-3 rounded-nx-md border border-success/20 bg-success/5 p-4 text-success">
              <Gift className="h-5 w-5 shrink-0 text-success" />
              <div>
                <p className="text-sm font-semibold">{t("tenant.freePlanTitle")}</p>
                <p className="mt-0.5 text-xs text-nx-ink-2">{t("tenant.freePlanDesc")}</p>
              </div>
            </div>
          ) : (
            subscription.currency &&
            subscription.totalAmount != null && (
              <div className="space-y-3 rounded-nx-md border border-nx-line bg-nx-raised p-3">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-nx-ink-2">
                      {t("tenant.billingCurrency")}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {SUPPORTED_CURRENCIES.find((c) => c.code === subscription.currency)?.flag ? (
                        <span className="text-sm" aria-hidden="true">
                          {SUPPORTED_CURRENCIES.find((c) => c.code === subscription.currency)?.flag}
                        </span>
                      ) : (
                        <Globe className="h-3.5 w-3.5 text-nx-ink-2" aria-hidden="true" />
                      )}
                      <span className="text-sm font-bold tabular-nums">
                        {subscription.currency}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-nx-ink-2">{t("tenant.baseAmount")}</p>
                    <p className="text-sm font-medium tabular-nums">
                      {formatDisplay(
                        subscription.baseAmount ?? subscription.totalAmount,
                        subscription.currency
                      )}
                    </p>
                  </div>
                  {(subscription.adjustmentAmount ?? 0) !== 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-nx-ink-2">
                        {(subscription.adjustmentAmount ?? 0) < 0
                          ? t("tenant.entitlementLabels.overridesDiscount")
                          : t("tenant.entitlementLabels.overridesTotalCost")}
                      </p>
                      <p
                        className={`text-sm font-bold tabular-nums ${
                          (subscription.adjustmentAmount ?? 0) < 0 ? "text-success" : "text-warning"
                        }`}
                      >
                        {(subscription.adjustmentAmount ?? 0) > 0 ? "+" : ""}
                        {formatDisplay(subscription.adjustmentAmount!, subscription.currency)}
                      </p>
                    </div>
                  )}
                  {subscription.currency !== "USD" && subscription.exchangeRateToUsd && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-nx-ink-2">
                        {t("tenant.exchangeRate")}
                      </p>
                      <p className="font-mono text-xs tabular-nums text-nx-ink-2">
                        1 {subscription.currency} = {subscription.exchangeRateToUsd.toFixed(4)} USD
                      </p>
                    </div>
                  )}
                  {subscription.appliedPromotionName && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-nx-ink-2">
                        {t("tenant.appliedPromotion")}
                      </p>
                      <Badge variant="secondary" className="gap-1 bg-success/10 text-success">
                        <Tag className="h-3 w-3" aria-hidden="true" />
                        {subscription.appliedPromotionName}
                        {subscription.promotionDiscount != null &&
                          subscription.promotionDiscount > 0 && (
                            <span className="ms-1 tabular-nums">
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
                  <div className="flex items-center justify-between rounded-nx-md border border-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)] bg-nx-accent-wash px-3 py-2">
                    <span className="text-xs font-medium text-nx-ink-2">
                      {t("tenant.grandTotal")}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-nx-accent">
                      {formatDisplay(subscription.totalAmount, subscription.currency)}
                    </span>
                  </div>
                )}
              </div>
            )
          )}

          {/* ── Expiration Warning ── */}
          {vm.daysRemaining !== null && vm.daysRemaining > 0 && vm.daysRemaining <= 7 && (
            <div className="flex items-center gap-2 rounded-nx-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{t("tenant.expiringWarning", { days: vm.daysRemaining ?? 0 })}</span>
            </div>
          )}

          {/* ── Suspended Banner ── */}
          {vm.isSuspended && (
            <div className="flex items-center gap-2 rounded-nx-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <Shield className="h-4 w-4 shrink-0" />
              <span>{t("tenant.suspendedBanner")}</span>
            </div>
          )}

          {/* ── Downgraded Banner ── */}
          {vm.isDowngraded && (
            <div className="flex items-center justify-between gap-2 rounded-nx-md border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
              <div className="flex items-center gap-2">
                <ArrowDownCircle className="h-4 w-4 shrink-0" />
                <span>
                  {t("tenant.downgradedBanner")} <strong>{vm.downgradedFromEditionName}</strong>
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
                <RotateCcw className="me-1.5 h-3.5 w-3.5" />
                {t("tenant.restoreOriginalPlan")}
              </Button>
            </div>
          )}

          {/* ── Refund Info Banner (from the subscription canceled in this downgrade) ── */}
          {previousRefundedSub &&
            previousRefundedSub.refundType &&
            previousRefundedSub.refundType !== "None" &&
            (previousRefundedSub.refundAmount ?? 0) > 0 && (
              <div className="space-y-1 rounded-nx-md border border-success/30 bg-success/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-success">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <span>
                    {previousRefundedSub.refundType === "Full"
                      ? t("tenant.fullRefundIssued")
                      : t("tenant.partialRefundIssued")}
                    {previousRefundedSub.refundAmount != null && (
                      <span className="ms-1 font-bold tabular-nums">
                        {formatDisplay(
                          previousRefundedSub.refundAmount,
                          previousRefundedSub.currency || "USD"
                        )}
                      </span>
                    )}
                    {previousRefundedSub.refundedAt && (
                      <span className="ms-1 text-xs text-nx-ink-2">
                        — {formatDateUtc(previousRefundedSub.refundedAt)}
                      </span>
                    )}
                  </span>
                </div>
                {previousRefundedSub.refundReason && (
                  <p className="ps-6 text-xs text-nx-ink-2">
                    {t("tenant.refundReason")}: {previousRefundedSub.refundReason}
                  </p>
                )}
                <p className="ps-6 text-xs text-nx-ink-2">
                  {t("tenant.previousPlan")}: {previousRefundedSub.editionName} (
                  {previousRefundedSub.type})
                  {previousRefundedSub.totalAmount != null && (
                    <span className="ms-1 tabular-nums">
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
              <div className="rounded-nx-md border border-warning/30 bg-warning/5 p-3">
                <div className="flex items-center gap-2 text-sm font-medium text-warning">
                  <DollarSign className="h-4 w-4 shrink-0" />
                  <span>
                    {subscription.refundType === "Full"
                      ? t("tenant.fullRefundApplied")
                      : t("tenant.partialRefundApplied")}
                    {subscription.refundAmount != null && (
                      <span className="ms-1 font-bold tabular-nums">
                        {formatDisplay(subscription.refundAmount, subscription.currency || "USD")}
                      </span>
                    )}
                    {subscription.refundedAt && (
                      <span className="ms-1 text-xs text-nx-ink-2">
                        — {formatDateUtc(subscription.refundedAt)}
                      </span>
                    )}
                  </span>
                </div>
                {subscription.refundReason && (
                  <p className="ps-6 text-xs text-nx-ink-2">
                    {t("tenant.refundReason")}: {subscription.refundReason}
                  </p>
                )}
              </div>
            )}

          {/* ── Past Due Banner ── */}
          {vm.isPastDue && (
            <div className="flex items-center gap-2 rounded-nx-md border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{t("tenant.pastDueBanner")}</span>
            </div>
          )}

          {/* ── Canceled Banner ── */}
          {vm.isCanceled && (
            <div className="flex items-center justify-between gap-2 rounded-nx-md border border-nx-line bg-nx-raised p-3 text-sm">
              <div className="flex items-center gap-2 text-nx-ink-2">
                <XCircle className="h-4 w-4 shrink-0" />
                <span>{t("tenant.canceledBanner")}</span>
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
                  <ArrowUpCircle className="me-1.5 h-3.5 w-3.5" />
                  {t("tenant.reassignPlan")}
                </Button>
              )}
            </div>
          )}

          {/* ── Expired Banner ── */}
          {vm.isExpired && (
            <div className="flex items-center justify-between gap-2 rounded-nx-md border border-destructive/30 bg-destructive/5 p-3 text-sm">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{t("tenant.expiredBanner")}</span>
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
                  <ArrowUpCircle className="me-1.5 h-3.5 w-3.5" />
                  {t("tenant.reassignPlan")}
                </Button>
              )}
            </div>
          )}

          {/* ── Fallback Info Badge ── */}
          {vm.hasFallback && !vm.isCanceled && !vm.isExpired && (
            <div className="flex items-center gap-2 rounded-nx-md border border-info/30 bg-info/5 p-3 text-sm text-info">
              <ArrowDownCircle className="h-4 w-4 shrink-0" />
              <span>
                {vm.subscription?.type === "Lifetime"
                  ? t("tenant.fallbackOnAction")
                  : t("tenant.fallbackInfo")}
                {" → "}
                <strong>{vm.fallbackEditionName}</strong>
                {vm.expiryBehavior === "Suspend" && (
                  <span className="ms-1 text-xs text-nx-ink-2">
                    ({t("tenant.fullSuspendMode")})
                  </span>
                )}
              </span>
            </div>
          )}

          {/* ── M-3: PendingPayment Warning Banner ── */}
          {vm.isPendingPayment && (
            <div className="flex items-center justify-between gap-2 rounded-nx-md border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 shrink-0" />
                <span>{t("tenant.pendingPaymentBanner")}</span>
              </div>
            </div>
          )}

          {/* ── Actions Row ── */}
          <div className="flex flex-wrap gap-2 border-t border-nx-line pt-3">
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
                <Pencil className="me-1.5 h-3.5 w-3.5" />
                {t("tenant.changePlan")}
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
                <RefreshCw className="me-1.5 h-3.5 w-3.5" />
                {t("tenant.renew")}
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
                <ArrowUpCircle className="me-1.5 h-3.5 w-3.5" />
                {t("tenant.convertTrial")}
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
                <Pause className="me-1.5 h-3.5 w-3.5" />
                {t("tenant.suspend")}
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
                    <RotateCcw className="me-1.5 h-3.5 w-3.5" />
                    {t("tenant.restoreOriginalPlan")}
                  </>
                ) : (
                  <>
                    <Play className="me-1.5 h-3.5 w-3.5" />
                    {t("tenant.resume")}
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
                <XCircle className="me-1.5 h-3.5 w-3.5" />
                {t("tenant.cancel")}
              </Button>
            )}

            {/* Resync Permissions — hidden for PendingPayment */}
            {!vm.isPendingPayment && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => vm.resyncPermissions()}
                loading={vm.isResyncing}
                aria-label={t("tenant.resyncPermissions")}
                title={t("tenant.resyncPermissions")}
              >
                {!vm.isResyncing && <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />}
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
                <Globe className="me-1.5 h-3.5 w-3.5" />
                {t("tenant.changeCurrency")}
              </Button>
            )}

            {/* Download Receipt */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => vm.downloadReceipt()}
              loading={vm.isDownloadingReceipt}
            >
              {!vm.isDownloadingReceipt && <FileDown className="me-1.5 h-3.5 w-3.5" />}
              {t("tenant.downloadReceipt")}
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
            <DialogTitle>{t("tenant.changeSubscriptionPlan")}</DialogTitle>
            <DialogDescription>{t("tenant.changeSubscriptionPlanDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>{t("tenant.selectPlan")}</Label>
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
                placeholder={t("tenant.selectAPlan")}
              />
            </div>
            {selectedEditionId && (
              <>
                <div className="space-y-2">
                  <Label>{t("tenant.billingCycle")}</Label>
                  <GenericSelect
                    options={getBillingCycleOptions(t, selectedEdition)}
                    value={selectedType}
                    onValueChange={(v: string | string[]) => {
                      const type = v as SubscriptionType;
                      setSelectedType(type);
                      fetchPrice(selectedEditionId, type);
                    }}
                    placeholder={t("tenant.selectBillingCycle")}
                  />
                </div>

                {/* ── Promotion Picker ── */}
                {changePlanPromotions.length > 0 && (
                  <div className="space-y-2">
                    <Label>{t("tenant.selectPromotion")}</Label>
                    <GenericSelect
                      options={[
                        { value: "", label: t("tenant.noPromotion") },
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
                      placeholder={t("tenant.selectPromotion")}
                    />
                  </div>
                )}
                {/* ── Promo Code (only for code-required promotions) ── */}
                {selectedPromotionId &&
                  changePlanPromotions.find((p) => p.id === selectedPromotionId)?.requiresCode && (
                    <div className="space-y-2">
                      <Label>{t("tenant.promoCode")}</Label>
                      <Input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder={t("tenant.promoCodePlaceholder")}
                      />
                    </div>
                  )}
                {/* No promotions but allow raw promo code entry */}
                {changePlanPromotions.length === 0 &&
                  !isLoadingChangePlanPromos &&
                  selectedEditionId && (
                    <div className="space-y-2">
                      <Label>{t("tenant.promoCode")}</Label>
                      <Input
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder={t("tenant.promoCodePlaceholder")}
                      />
                    </div>
                  )}

                {/* ── Price Preview ── */}
                {isLoadingPrice && (
                  <div className="flex items-center gap-2 text-sm text-nx-ink-2">
                    <LoadingSpinner size="inline" showText={false} />
                    {t("common.loading")}
                  </div>
                )}
                {!isLoadingPrice && previewAmount !== null && previewAmount >= 0 && (
                  <div className="rounded-nx-md border border-success/30 bg-success/5 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-nx-ink-2">
                        {t("tenant.totalAmount")}
                      </span>
                      <span className="text-lg font-bold tabular-nums text-success">
                        {previewAmount === 0
                          ? t("tenant.typeLabel.free")
                          : formatDisplay(previewAmount, subscription?.currency || "USD")}
                      </span>
                    </div>
                  </div>
                )}

                {/* ── Downgrade Impact Warning ── */}
                {isLoadingImpact && (
                  <div className="flex items-center gap-2 text-sm text-nx-ink-2">
                    <LoadingSpinner size="inline" showText={false} />
                    {t("tenant.checkingImpact")}
                  </div>
                )}
                {!isLoadingImpact && impactReport?.hasOverflow && (
                  <div className="space-y-2 rounded-nx-md border border-destructive/30 bg-destructive/5 p-3">
                    <div className="flex items-center gap-2 text-sm font-semibold text-destructive">
                      <AlertTriangle className="h-4 w-4 shrink-0" />
                      {t("tenant.downgradeWarning")}
                    </div>
                    <div className="space-y-1">
                      {impactReport.overflows.map((o, i) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-nx-ink-2">{o.resourceType}</span>
                          <span className="font-mono tabular-nums text-destructive">
                            {o.currentCount} / {o.newLimit === -1 ? "∞" : o.newLimit}
                            <span className="ms-1 font-semibold text-destructive">
                              (+{o.overflowCount} {t("tenant.overflow")})
                            </span>
                          </span>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-nx-ink-2">{t("tenant.overflowInfo")}</p>
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
              {t("common.cancel")}
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
                  ? t("tenant.confirmDowngrade")
                  : vm.hasNoSubscription || vm.canReassign
                    ? t("tenant.assignPlan")
                    : t("common.save"))}
              {(vm.isChanging || vm.isAssigning) && t("common.saving")}
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
            <DialogTitle>{t("tenant.renewSubscription")}</DialogTitle>
            <DialogDescription>{t("tenant.renewDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {subscription && (
              <div className="space-y-1 rounded-nx-md bg-nx-raised p-3">
                <p className="text-xs text-nx-ink-2">{t("tenant.currentEndDate")}</p>
                <p className="text-sm font-medium">
                  {subscription.endDate ? formatDate(subscription.endDate) : t("tenant.never")}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("tenant.extendBy")}</Label>
              <GenericSelect
                options={getRenewOptions(t, currentEdition)}
                value={selectedType}
                onValueChange={(v: string | string[]) => setSelectedType(v as SubscriptionType)}
                placeholder={t("tenant.selectRenewalPeriod")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRenewOpen(false)} disabled={vm.isRenewing}>
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                vm.renewSubscription(selectedType);
                setRenewOpen(false);
              }}
              loading={vm.isRenewing}
            >
              {vm.isRenewing ? t("common.saving") : t("tenant.renew")}
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
            <DialogTitle>{t("tenant.convertTrial")}</DialogTitle>
            <DialogDescription>{t("tenant.convertTrialDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center gap-2 rounded-nx-md border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{t("tenant.trialOnceWarning")}</span>
            </div>
            <div className="space-y-2">
              <Label>{t("tenant.selectBillingCycle")}</Label>
              <GenericSelect
                options={getConvertOptions(t, currentEdition)}
                value={selectedType}
                onValueChange={(v: string | string[]) => setSelectedType(v as SubscriptionType)}
                placeholder={t("tenant.selectBillingCycle")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConvertOpen(false)}
              disabled={vm.isConverting}
            >
              {t("common.cancel")}
            </Button>
            <Button
              onClick={() => {
                vm.convertTrial(selectedType);
                setConvertOpen(false);
              }}
              loading={vm.isConverting}
            >
              {vm.isConverting ? t("common.saving") : t("tenant.convertToPaid")}
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
              {t("tenant.suspendSubscription")}
            </DialogTitle>
            <DialogDescription>{t("tenant.suspendDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Fallback toggle */}
            {vm.hasFallback && (
              <div className="space-y-3 rounded-nx-md border border-nx-line p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {t("tenant.downgradeToFallback", { edition: vm.fallbackEditionName ?? "" })}
                    </Label>
                    <p className="text-xs text-nx-ink-2">
                      {useFallbackOnSuspend
                        ? t("tenant.downgradeDesc", { edition: vm.fallbackEditionName ?? "" })
                        : t("tenant.fullSuspendDesc")}
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
              <div className="flex items-center gap-2 rounded-nx-md border border-warning/30 bg-warning/5 p-3 text-sm text-warning">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{t("tenant.suspendAdminWarning")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-nx-md border border-info/30 bg-info/5 p-3 text-sm text-info">
                <ArrowDownCircle className="h-4 w-4 shrink-0" />
                <span>
                  {t("tenant.downgradeKeepActive", { edition: vm.fallbackEditionName ?? "" })}
                </span>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("tenant.suspendReason")} *</Label>
              <Textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder={t("tenant.suspendReasonPlaceholder")}
                className="min-h-[80px]"
              />
              {suspendReason.length > 0 && suspendReason.trim().length < 3 && (
                <p className="text-xs text-destructive">{t("tenant.suspendReasonMinLength")}</p>
              )}
            </div>

            {/* ── Refund Options ── */}
            <div className="space-y-3 rounded-nx-md border border-nx-line p-3">
              <Label className="text-sm font-medium">{t("tenant.refundOption")}</Label>
              <RadioGroup
                value={suspendRefundType}
                onValueChange={setSuspendRefundType}
                className="space-y-2"
              >
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-nx-md border border-nx-line p-3 hover:bg-nx-hover"
                  onClick={() => setSuspendRefundType("None")}
                >
                  <RadioGroupItem value="None" id="suspend-refund-none" className="mt-0.5" />
                  <div>
                    <Label htmlFor="suspend-refund-none" className="cursor-pointer font-medium">
                      {t("tenant.noRefund")}
                    </Label>
                    <p className="text-xs text-nx-ink-2">{t("tenant.noRefundDesc")}</p>
                  </div>
                </div>
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-nx-md border border-nx-line p-3 hover:bg-nx-hover"
                  onClick={() => setSuspendRefundType("Full")}
                >
                  <RadioGroupItem value="Full" id="suspend-refund-full" className="mt-0.5" />
                  <div>
                    <Label htmlFor="suspend-refund-full" className="cursor-pointer font-medium">
                      {t("tenant.fullRefund")}
                    </Label>
                    <p className="text-xs text-nx-ink-2">
                      {t("tenant.fullRefundDesc")}
                      {subscription?.totalAmount != null && subscription.totalAmount > 0 && (
                        <span className="ms-1 font-semibold tabular-nums text-success">
                          (
                          {formatDisplay(subscription.totalAmount, subscription?.currency || "USD")}
                          )
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-nx-md border border-nx-line p-3 hover:bg-nx-hover"
                  onClick={() => setSuspendRefundType("ProRata")}
                >
                  <RadioGroupItem value="ProRata" id="suspend-refund-prorata" className="mt-0.5" />
                  <div>
                    <Label htmlFor="suspend-refund-prorata" className="cursor-pointer font-medium">
                      {t("tenant.proRataRefund")}
                    </Label>
                    <p className="text-xs text-nx-ink-2">{t("tenant.proRataRefundDesc")}</p>
                  </div>
                </div>
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-nx-md border border-nx-line p-3 hover:bg-nx-hover"
                  onClick={() => setSuspendRefundType("Custom")}
                >
                  <RadioGroupItem value="Custom" id="suspend-refund-custom" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="suspend-refund-custom" className="cursor-pointer font-medium">
                      {t("tenant.customRefund")}
                    </Label>
                    <p className="text-xs text-nx-ink-2">{t("tenant.customRefundDesc")}</p>
                    {suspendRefundType === "Custom" && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={suspendCustomAmount}
                            onChange={(e) => setSuspendCustomAmount(e.target.value)}
                            placeholder={t("tenant.customAmountPlaceholder")}
                            className="max-w-[200px] font-mono"
                          />
                          <span className="text-sm font-medium text-nx-ink-2">
                            {subscription?.currency || "USD"}
                          </span>
                        </div>
                        {suspendCustomAmount &&
                          !isNaN(parseLocalizedNumber(suspendCustomAmount) ?? NaN) &&
                          subscription?.exchangeRateToUsd &&
                          subscription.currency !== "USD" && (
                            <p className="mt-1 text-xs tabular-nums text-nx-ink-2">
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
              {t("common.cancel")}
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
              {!vm.isSuspending && <Pause className="me-2 h-4 w-4" />}
              {useFallbackOnSuspend && vm.hasFallback ? t("tenant.downgrade") : t("tenant.suspend")}
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
            <DialogTitle className="text-destructive">{t("tenant.cancelSubscription")}</DialogTitle>
            <DialogDescription>{t("tenant.cancelDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Fallback toggle */}
            {vm.hasFallback && (
              <div className="space-y-3 rounded-nx-md border border-nx-line p-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-medium">
                      {t("tenant.downgradeToFallback", { edition: vm.fallbackEditionName ?? "" })}
                    </Label>
                    <p className="text-xs text-nx-ink-2">
                      {useFallbackOnCancel
                        ? t("tenant.cancelDowngradeDesc", { edition: vm.fallbackEditionName ?? "" })
                        : t("tenant.cancelPermanentDesc")}
                    </p>
                  </div>
                  <Switch checked={useFallbackOnCancel} onCheckedChange={setUseFallbackOnCancel} />
                </div>
              </div>
            )}
            {/* Admin deactivation warning */}
            {!useFallbackOnCancel || !vm.hasFallback ? (
              <div className="flex items-center gap-2 rounded-nx-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{t("tenant.cancelAdminWarning")}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-nx-md border border-info/30 bg-info/5 p-3 text-sm text-info">
                <ArrowDownCircle className="h-4 w-4 shrink-0" />
                <span>
                  {t("tenant.cancelDowngradeKeepActive", { edition: vm.fallbackEditionName ?? "" })}
                </span>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("tenant.cancelReason")}</Label>
              <Textarea
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={t("tenant.cancelReasonPlaceholder")}
                className="min-h-[80px]"
              />
            </div>

            {/* ── Refund Options ── */}
            <div className="space-y-3 rounded-nx-md border border-nx-line p-3">
              <Label className="text-sm font-medium">{t("tenant.refundOption")}</Label>
              <RadioGroup
                value={cancelRefundType}
                onValueChange={setCancelRefundType}
                className="space-y-2"
              >
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-nx-md border border-nx-line p-3 hover:bg-nx-hover"
                  onClick={() => setCancelRefundType("None")}
                >
                  <RadioGroupItem value="None" id="cancel-refund-none" className="mt-0.5" />
                  <div>
                    <Label htmlFor="cancel-refund-none" className="cursor-pointer font-medium">
                      {t("tenant.noRefund")}
                    </Label>
                    <p className="text-xs text-nx-ink-2">{t("tenant.noRefundDesc")}</p>
                  </div>
                </div>
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-nx-md border border-nx-line p-3 hover:bg-nx-hover"
                  onClick={() => setCancelRefundType("Full")}
                >
                  <RadioGroupItem value="Full" id="cancel-refund-full" className="mt-0.5" />
                  <div>
                    <Label htmlFor="cancel-refund-full" className="cursor-pointer font-medium">
                      {t("tenant.fullRefund")}
                    </Label>
                    <p className="text-xs text-nx-ink-2">
                      {t("tenant.fullRefundDesc")}
                      {subscription?.totalAmount != null && subscription.totalAmount > 0 && (
                        <span className="ms-1 font-semibold tabular-nums text-success">
                          (
                          {formatDisplay(subscription.totalAmount, subscription?.currency || "USD")}
                          )
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-nx-md border border-nx-line p-3 hover:bg-nx-hover"
                  onClick={() => setCancelRefundType("ProRata")}
                >
                  <RadioGroupItem value="ProRata" id="cancel-refund-prorata" className="mt-0.5" />
                  <div>
                    <Label htmlFor="cancel-refund-prorata" className="cursor-pointer font-medium">
                      {t("tenant.proRataRefund")}
                    </Label>
                    <p className="text-xs text-nx-ink-2">{t("tenant.proRataRefundDesc")}</p>
                  </div>
                </div>
                <div
                  className="flex cursor-pointer items-start gap-3 rounded-nx-md border border-nx-line p-3 hover:bg-nx-hover"
                  onClick={() => setCancelRefundType("Custom")}
                >
                  <RadioGroupItem value="Custom" id="cancel-refund-custom" className="mt-0.5" />
                  <div className="flex-1">
                    <Label htmlFor="cancel-refund-custom" className="cursor-pointer font-medium">
                      {t("tenant.customRefund")}
                    </Label>
                    <p className="text-xs text-nx-ink-2">{t("tenant.customRefundDesc")}</p>
                    {cancelRefundType === "Custom" && (
                      <div className="mt-2">
                        <div className="flex items-center gap-2">
                          <Input
                            type="text"
                            value={cancelCustomAmount}
                            onChange={(e) => setCancelCustomAmount(e.target.value)}
                            placeholder={t("tenant.customAmountPlaceholder")}
                            className="max-w-[200px] font-mono"
                          />
                          <span className="text-sm font-medium text-nx-ink-2">
                            {subscription?.currency || "USD"}
                          </span>
                        </div>
                        {cancelCustomAmount &&
                          !isNaN(parseLocalizedNumber(cancelCustomAmount) ?? NaN) &&
                          subscription?.exchangeRateToUsd &&
                          subscription.currency !== "USD" && (
                            <p className="mt-1 text-xs tabular-nums text-nx-ink-2">
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
              {t("common.cancel")}
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
              {!vm.isCanceling && <XCircle className="me-2 h-4 w-4" />}
              {useFallbackOnCancel && vm.hasFallback
                ? t("tenant.downgrade")
                : t("tenant.confirmCancel")}
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
              {isRestore ? t("tenant.restoreOriginalPlan") : t("tenant.resumeSubscription")}
            </DialogTitle>
            <DialogDescription>
              {isRestore ? t("tenant.restoreDesc") : t("tenant.resumeDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {isRestore ? (
              /* ── RESTORE FROM DOWNGRADE ── */
              <>
                {/* Original Plan Info */}
                <div className="space-y-1 rounded-nx-md bg-nx-raised p-3">
                  <p className="text-xs text-nx-ink-2">{t("tenant.originalPlan")}</p>
                  <p className="text-sm font-medium">
                    {vm.downgradedFromEditionName} — {getTypeLabel(vm.downgradedFromType || "", t)}
                  </p>
                  {vm.downgradedAt && (
                    <p className="text-xs text-nx-ink-2">
                      {t("tenant.downgradedOn")}: {formatDateUtc(vm.downgradedAt)}
                    </p>
                  )}
                </div>

                {/* Billing Cycle Chooser */}
                <div className="space-y-2">
                  <Label>{t("tenant.billingCycle")}</Label>
                  <GenericSelect
                    value={restoreType}
                    onValueChange={(v: string) => setRestoreType(v as SubscriptionType)}
                    options={getConvertOptions(t, currentEdition)}
                    placeholder={t("tenant.selectBillingCycle")}
                  />
                  <p className="text-xs text-nx-ink-2">{t("tenant.chooseBillingCycle")}</p>
                </div>

                {/* Info Banner */}
                <div className="flex items-center gap-2 rounded-nx-md border border-info/30 bg-info/5 p-3 text-sm text-info">
                  <RotateCcw className="h-4 w-4 shrink-0" />
                  <span>{t("tenant.restoreInfo")}</span>
                </div>
              </>
            ) : (
              /* ── RESUME FROM SUSPEND ── */
              <>
                <div className="flex items-center gap-2 rounded-nx-md border border-info/30 bg-info/5 p-3 text-sm text-info">
                  <Play className="h-4 w-4 shrink-0" />
                  <span>{t("tenant.resumeAdminWarning")}</span>
                </div>
                {subscription && (
                  <div className="space-y-1 rounded-nx-md bg-nx-raised p-3">
                    <p className="text-xs text-nx-ink-2">{t("tenant.currentPlan")}</p>
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
              {t("common.cancel")}
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
                  <RotateCcw className="me-2 h-4 w-4" />
                ) : (
                  <Play className="me-2 h-4 w-4" />
                ))}
              {isRestore ? t("tenant.confirmRestore") : t("tenant.confirmResume")}
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
            <DialogTitle>{t("tenant.changeCurrency")}</DialogTitle>
            <DialogDescription>{t("tenant.changeCurrencyDesc")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {subscription && subscription.currency && (
              <div className="space-y-1 rounded-nx-md bg-nx-raised p-3">
                <p className="text-xs text-nx-ink-2">{t("tenant.currentCurrency")}</p>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  {SUPPORTED_CURRENCIES.find((c) => c.code === subscription.currency)?.flag ? (
                    <span aria-hidden="true">
                      {SUPPORTED_CURRENCIES.find((c) => c.code === subscription.currency)?.flag}
                    </span>
                  ) : (
                    <Globe className="h-3.5 w-3.5 text-nx-ink-2" aria-hidden="true" />
                  )}
                  {subscription.currency}
                </p>
              </div>
            )}
            <div className="space-y-2">
              <Label>{t("tenant.newCurrency")}</Label>
              <GenericSelect
                options={currencyOptions}
                value={selectedCurrency}
                onValueChange={(v: string | string[]) => setSelectedCurrency(v as string)}
                placeholder={t("tenant.selectCurrency")}
              />
            </div>
            <div className="flex items-center gap-2 rounded-nx-md border border-info/30 bg-info/5 p-3 text-sm text-info">
              <DollarSign className="h-4 w-4 shrink-0" />
              <span>{t("tenant.changeCurrencyInfo")}</span>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setChangeCurrencyOpen(false)}
              disabled={vm.isChangingCurrency}
            >
              {t("common.cancel")}
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
              {!vm.isChangingCurrency && <Globe className="me-2 h-4 w-4" />}
              {vm.isChangingCurrency ? t("common.saving") : t("tenant.changeCurrency")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
}
