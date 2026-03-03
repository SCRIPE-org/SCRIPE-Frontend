"use client";

import { useState, useEffect, useCallback } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { Badge } from "@core/ui/badge";
import {
      CreditCard, Pencil, Loader2, RefreshCw, Play, Pause, XCircle,
      ArrowUpCircle, Calendar, Clock, AlertTriangle, Shield, RotateCcw,
      ArrowDownCircle, DollarSign, Globe,
} from "lucide-react";
import { useTenantSubscriptionViewModel } from "@modules/system/tenants/src/presentation/viewmodels/useTenantSubscriptionViewModel";
import { SUPPORTED_CURRENCIES, formatPrice } from "@modules/entitlements/editions/src/domain/entities/EditionPricing";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@core/ui/dialog";
import { GenericSelect } from "@core/crud/components/generic-select";
import type { GenericSelectOption } from "@core/crud/components/generic-select";
import { Skeleton } from "@core/ui/skeleton";
import { Textarea } from "@core/ui/textarea";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import type { SubscriptionType, DowngradeImpactReport } from "../../../data/models/TenantSubscription";

interface TenantSubscriptionCardProps {
      tenantId: string;
}

// ── Status & Type Helpers ──

const STATUS_CONFIG: Record<string, { variant: "success" | "secondary" | "destructive" | "outline"; icon: typeof Clock }> = {
      active: { variant: "success", icon: Play },
      trialing: { variant: "outline", icon: Clock },
      suspended: { variant: "destructive", icon: Pause },
      canceled: { variant: "secondary", icon: XCircle },
      expired: { variant: "destructive", icon: AlertTriangle },
      pastdue: { variant: "destructive", icon: AlertTriangle },
};

const TYPE_LABELS: Record<string, string> = {
      Lifetime: "Lifetime",
      Monthly: "Monthly",
      Yearly: "Yearly",
      Trial: "Trial",
      AddOn: "Add-On",
};

function formatDate(dateStr?: string) {
      if (!dateStr) return "—";
      return new Date(dateStr).toLocaleDateString(undefined, {
            year: "numeric", month: "short", day: "numeric",
      });
}

// ── Billing Cycle Options ──

const BILLING_CYCLE_OPTIONS: GenericSelectOption[] = [
      { value: "Monthly", label: "Monthly" },
      { value: "Yearly", label: "Yearly" },
      { value: "Lifetime", label: "Lifetime" },
      { value: "Trial", label: "Trial (14 days)" },
];

const RENEW_OPTIONS: GenericSelectOption[] = [
      { value: "Monthly", label: "1 Month" },
      { value: "Yearly", label: "1 Year" },
      { value: "Lifetime", label: "Make Lifetime (no expiry)" },
];

const CONVERT_OPTIONS: GenericSelectOption[] = [
      { value: "Monthly", label: "Monthly" },
      { value: "Yearly", label: "Yearly" },
      { value: "Lifetime", label: "Lifetime" },
];

// ── Main Component ──

export function TenantSubscriptionCard({ tenantId }: TenantSubscriptionCardProps) {
      const { t } = useI18n();
      const vm = useTenantSubscriptionViewModel(tenantId);

      // Dialog states
      const [changePlanOpen, setChangePlanOpen] = useState(false);
      const [renewOpen, setRenewOpen] = useState(false);
      const [convertOpen, setConvertOpen] = useState(false);
      const [suspendOpen, setSuspendOpen] = useState(false);
      const [cancelOpen, setCancelOpen] = useState(false);
      const [resumeOpen, setResumeOpen] = useState(false);
      const [changeCurrencyOpen, setChangeCurrencyOpen] = useState(false);

      // Form states for dialogs
      const [selectedEditionId, setSelectedEditionId] = useState("");
      const [selectedType, setSelectedType] = useState<SubscriptionType>("Monthly");
      const [suspendReason, setSuspendReason] = useState("");
      const [cancelReason, setCancelReason] = useState("");
      const [useFallbackOnSuspend, setUseFallbackOnSuspend] = useState(true);
      const [useFallbackOnCancel, setUseFallbackOnCancel] = useState(true);
      const [restoreType, setRestoreType] = useState<SubscriptionType>("Monthly");
      const [selectedCurrency, setSelectedCurrency] = useState("");

      // Downgrade impact + price preview state
      const [impactReport, setImpactReport] = useState<DowngradeImpactReport | null>(null);
      const [isLoadingImpact, setIsLoadingImpact] = useState(false);
      const [previewAmount, setPreviewAmount] = useState<number | null>(null);
      const [isLoadingPrice, setIsLoadingPrice] = useState(false);

      // Edition options for GenericSelect
      const editionOptions: GenericSelectOption[] = (vm.availableEditions || []).map((e) => ({
            value: e.id,
            label: e.name || e.displayNameEn || e.id,
      }));

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
                                    <Button variant="outline" size="sm" onClick={() => {
                                          setSelectedEditionId("");
                                          setSelectedType("Monthly");
                                          setChangePlanOpen(true);
                                    }}>
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
                                          <p className="text-xs font-medium text-muted-foreground">{t("tenant.currentPlan") || "Plan"}</p>
                                          <p className="text-sm font-bold">{subscription.editionName || t("tenant.unknownPlan") || "Unknown"}</p>
                                    </div>

                                    {/* Type Badge */}
                                    <div className="space-y-1">
                                          <p className="text-xs font-medium text-muted-foreground">{t("tenant.billingCycle") || "Billing"}</p>
                                          <Badge variant="outline" className="text-xs">
                                                {TYPE_LABELS[subscription.type] || subscription.type}
                                          </Badge>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="space-y-1">
                                          <p className="text-xs font-medium text-muted-foreground">{t("tenant.status") || "Status"}</p>
                                          <Badge variant={statusConfig.variant} className="text-xs gap-1">
                                                <StatusIcon className="h-3 w-3" />
                                                {subscription.status}
                                          </Badge>
                                    </div>

                                    {/* Start Date */}
                                    <div className="space-y-1">
                                          <p className="text-xs font-medium text-muted-foreground">{t("tenant.startDate") || "Start"}</p>
                                          <p className="text-sm font-medium flex items-center gap-1">
                                                <Calendar className="h-3 w-3 text-muted-foreground" />
                                                {formatDate(subscription.startDate)}
                                          </p>
                                    </div>

                                    {/* End Date / Days Remaining */}
                                    <div className="space-y-1">
                                          <p className="text-xs font-medium text-muted-foreground">{t("tenant.endDate") || "Expires"}</p>
                                          {subscription.endDate ? (
                                                <div>
                                                      <p className="text-sm font-medium">{formatDate(subscription.endDate)}</p>
                                                      {vm.daysRemaining !== null && (
                                                            <p className={`text-xs ${vm.daysRemaining <= 7 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                                                                  {vm.daysRemaining > 0
                                                                        ? `${vm.daysRemaining} ${t("tenant.daysLeft") || "days left"}`
                                                                        : t("tenant.expired") || "Expired"}
                                                            </p>
                                                      )}
                                                </div>
                                          ) : (
                                                <p className="text-sm font-medium text-muted-foreground">{t("tenant.never") || "Never"}</p>
                                          )}
                                    </div>
                              </div>

                              {/* ── Pricing Info ── */}
                              {subscription.currency && subscription.totalAmount != null && (
                                    <div className="rounded-lg border border-border/50 bg-muted/30 p-3">
                                          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                                                <div className="space-y-1">
                                                      <p className="text-xs font-medium text-muted-foreground">{t("tenant.billingCurrency") || "Currency"}</p>
                                                      <div className="flex items-center gap-1.5">
                                                            <span className="text-sm">{SUPPORTED_CURRENCIES.find(c => c.code === subscription.currency)?.flag || "🌍"}</span>
                                                            <span className="text-sm font-bold">{subscription.currency}</span>
                                                      </div>
                                                </div>
                                                <div className="space-y-1">
                                                      <p className="text-xs font-medium text-muted-foreground">{t("tenant.totalAmount") || "Total"}</p>
                                                      <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                            {formatPrice(subscription.totalAmount, subscription.currency)}
                                                      </p>
                                                </div>
                                                {subscription.baseAmount != null && subscription.baseAmount !== subscription.totalAmount && (
                                                      <div className="space-y-1">
                                                            <p className="text-xs font-medium text-muted-foreground">{t("tenant.baseAmount") || "Base"}</p>
                                                            <p className="text-sm font-medium">
                                                                  {formatPrice(subscription.baseAmount, subscription.currency)}
                                                            </p>
                                                      </div>
                                                )}
                                                {subscription.currency !== "USD" && subscription.exchangeRateToUsd && (
                                                      <div className="space-y-1">
                                                            <p className="text-xs font-medium text-muted-foreground">{t("tenant.exchangeRate") || "Rate"}</p>
                                                            <p className="text-xs font-mono text-muted-foreground">
                                                                  1 {subscription.currency} = {subscription.exchangeRateToUsd.toFixed(4)} USD
                                                            </p>
                                                      </div>
                                                )}
                                          </div>
                                    </div>
                              )}

                              {/* ── Expiration Warning ── */}
                              {vm.daysRemaining !== null && vm.daysRemaining > 0 && vm.daysRemaining <= 7 && (
                                    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                          <AlertTriangle className="h-4 w-4 shrink-0" />
                                          <span>{t("tenant.expiringWarning") || `Subscription expires in ${vm.daysRemaining} day(s). Consider renewing.`}</span>
                                    </div>
                              )}

                              {/* ── Suspended Banner ── */}
                              {vm.isSuspended && (
                                    <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                          <Shield className="h-4 w-4 shrink-0" />
                                          <span>{t("tenant.suspendedBanner") || "This subscription is suspended. The tenant cannot access the system."}</span>
                                    </div>
                              )}

                              {/* ── Downgraded Banner ── */}
                              {vm.isDowngraded && (
                                    <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400">
                                          <div className="flex items-center gap-2">
                                                <ArrowDownCircle className="h-4 w-4 shrink-0" />
                                                <span>
                                                      {t("tenant.downgradedBanner") || "Downgraded from"}{" "}
                                                      <strong>{vm.downgradedFromEditionName}</strong>
                                                      {" ("}{vm.downgradedFromType}{")"}
                                                      {vm.downgradedAt && (
                                                            <> — {new Date(vm.downgradedAt).toLocaleDateString()}</>
                                                      )}
                                                </span>
                                          </div>
                                          <Button variant="outline" size="sm" onClick={() => {
                                                setRestoreType((vm.downgradedFromType as SubscriptionType) || "Monthly");
                                                setResumeOpen(true);
                                          }}>
                                                <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                                                {t("tenant.restoreOriginalPlan") || "Restore Original Plan"}
                                          </Button>
                                    </div>
                              )}

                              {/* ── Past Due Banner ── */}
                              {vm.isPastDue && (
                                    <div className="flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-sm text-amber-700 dark:text-amber-400">
                                          <AlertTriangle className="h-4 w-4 shrink-0" />
                                          <span>{t("tenant.pastDueBanner") || "Payment past due — subscription at risk. Renew to avoid suspension."}</span>
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
                                                <Button variant="outline" size="sm" onClick={() => {
                                                      setSelectedEditionId("");
                                                      setSelectedType("Monthly");
                                                      setChangePlanOpen(true);
                                                }}>
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
                                                <Button variant="outline" size="sm" onClick={() => {
                                                      setSelectedEditionId("");
                                                      setSelectedType("Monthly");
                                                      setChangePlanOpen(true);
                                                }}>
                                                      <ArrowUpCircle className="mr-1.5 h-3.5 w-3.5" />
                                                      {t("tenant.reassignPlan") || "Reassign Plan"}
                                                </Button>
                                          )}
                                    </div>
                              )}

                              {/* ── Fallback Info Badge ── */}
                              {vm.hasFallback && !vm.isCanceled && !vm.isExpired && (
                                    <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-sm text-blue-700 dark:text-blue-400">
                                          <ArrowDownCircle className="h-4 w-4 shrink-0" />
                                          <span>
                                                {vm.subscription?.type === "Lifetime"
                                                      ? (t("tenant.fallbackOnAction") || "On cancel/suspend")
                                                      : (t("tenant.fallbackInfo") || "On expiry")}{" → "}
                                                <strong>{vm.fallbackEditionName}</strong>
                                                {vm.expiryBehavior === "Suspend" && (
                                                      <span className="ml-1 text-muted-foreground text-xs">
                                                            ({t("tenant.fullSuspendMode") || "full suspend mode"})
                                                      </span>
                                                )}
                                          </span>
                                    </div>
                              )}

                              {/* ── Actions Row ── */}
                              <div className="flex flex-wrap gap-2 border-t pt-3">
                                    {/* Change Plan */}
                                    <Button variant="outline" size="sm" onClick={() => {
                                          setSelectedEditionId(subscription.editionId || "");
                                          setSelectedType((subscription.type as SubscriptionType) || "Monthly");
                                          setChangePlanOpen(true);
                                    }}>
                                          <Pencil className="mr-1.5 h-3.5 w-3.5" />
                                          {t("tenant.changePlan") || "Change Plan"}
                                    </Button>

                                    {/* Renew — hidden for Lifetime */}
                                    {vm.canRenew && (
                                          <Button variant="outline" size="sm" onClick={() => {
                                                setSelectedType((subscription.type as SubscriptionType) || "Monthly");
                                                setRenewOpen(true);
                                          }}>
                                                <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                                                {t("tenant.renew") || "Renew"}
                                          </Button>
                                    )}

                                    {/* Convert Trial */}
                                    {vm.canConvertTrial && (
                                          <Button variant="default" size="sm" onClick={() => {
                                                setSelectedType("Monthly");
                                                setConvertOpen(true);
                                          }}>
                                                <ArrowUpCircle className="mr-1.5 h-3.5 w-3.5" />
                                                {t("tenant.convertTrial") || "Convert to Paid"}
                                          </Button>
                                    )}

                                    {/* Suspend */}
                                    {vm.canSuspend && (
                                          <Button variant="outline" size="sm" className="text-orange-600 hover:text-orange-700" onClick={() => {
                                                setSuspendReason("");
                                                setSuspendOpen(true);
                                          }}>
                                                <Pause className="mr-1.5 h-3.5 w-3.5" />
                                                {t("tenant.suspend") || "Suspend"}
                                          </Button>
                                    )}

                                    {/* Resume / Restore — dynamic label */}
                                    {vm.canResume && (
                                          <Button variant="default" size="sm" onClick={() => {
                                                if (vm.isDowngraded) {
                                                      setRestoreType((vm.downgradedFromType as SubscriptionType) || "Monthly");
                                                }
                                                setResumeOpen(true);
                                          }}>
                                                {vm.isDowngraded
                                                      ? <><RotateCcw className="mr-1.5 h-3.5 w-3.5" />{t("tenant.restoreOriginalPlan") || "Restore Original Plan"}</>
                                                      : <><Play className="mr-1.5 h-3.5 w-3.5" />{t("tenant.resume") || "Resume"}</>
                                                }
                                          </Button>
                                    )}

                                    {/* Cancel */}
                                    {vm.canCancel && (
                                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => {
                                                setCancelReason("");
                                                setCancelOpen(true);
                                          }}>
                                                <XCircle className="mr-1.5 h-3.5 w-3.5" />
                                                {t("tenant.cancel") || "Cancel"}
                                          </Button>
                                    )}

                                    {/* Resync Permissions */}
                                    <Button variant="ghost" size="sm" onClick={() => vm.resyncPermissions()} disabled={vm.isResyncing} title={t("tenant.resyncPermissions") || "Re-sync permissions from edition"}>
                                          {vm.isResyncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                                    </Button>

                                    {/* Change Currency */}
                                    {vm.isActive && (
                                          <Button variant="outline" size="sm" onClick={() => {
                                                setSelectedCurrency(subscription.currency || "USD");
                                                setChangeCurrencyOpen(true);
                                          }}>
                                                <Globe className="mr-1.5 h-3.5 w-3.5" />
                                                {t("tenant.changeCurrency") || "Currency"}
                                          </Button>
                                    )}
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
            const fetchImpact = useCallback(async (editionId: string) => {
                  if (!editionId || !subscription) { setImpactReport(null); return; }
                  if (editionId === subscription.editionId) { setImpactReport(null); return; }
                  setIsLoadingImpact(true);
                  try {
                        const report = await vm.getDowngradeImpact(editionId);
                        setImpactReport(report);
                  } catch { setImpactReport(null); }
                  setIsLoadingImpact(false);
            }, [subscription, vm]);

            // Fetch price preview when edition + type changes
            const fetchPrice = useCallback(async (editionId: string, type: string) => {
                  if (!editionId) { setPreviewAmount(null); return; }
                  const currency = subscription?.currency || "USD";
                  setIsLoadingPrice(true);
                  try {
                        const amount = await vm.previewPrice(editionId, currency, type);
                        setPreviewAmount(amount);
                  } catch { setPreviewAmount(null); }
                  setIsLoadingPrice(false);
            }, [subscription, vm]);

            return (
                  <Dialog open={changePlanOpen} onOpenChange={(open) => {
                        setChangePlanOpen(open);
                        if (!open) { setImpactReport(null); setPreviewAmount(null); }
                  }}>
                        <DialogContent className="max-w-md">
                              <DialogHeader>
                                    <DialogTitle>{t("tenant.changeSubscriptionPlan") || "Change Subscription Plan"}</DialogTitle>
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
                                                      fetchPrice(id, selectedType);
                                                }}
                                                placeholder={t("tenant.selectAPlan") || "Select an edition"}
                                          />
                                    </div>
                                    <div className="space-y-2">
                                          <Label>{t("tenant.billingCycle") || "Billing Cycle"}</Label>
                                          <GenericSelect
                                                options={BILLING_CYCLE_OPTIONS}
                                                value={selectedType}
                                                onValueChange={(v: string | string[]) => {
                                                      const type = v as SubscriptionType;
                                                      setSelectedType(type);
                                                      fetchPrice(selectedEditionId, type);
                                                }}
                                                placeholder={t("tenant.selectBillingCycle") || "Select billing cycle"}
                                          />
                                    </div>

                                    {/* ── Price Preview ── */}
                                    {isLoadingPrice && (
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                {t("common.loading") || "Loading..."}
                                          </div>
                                    )}
                                    {!isLoadingPrice && previewAmount !== null && previewAmount > 0 && (
                                          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                                                <div className="flex items-center justify-between">
                                                      <span className="text-xs font-medium text-muted-foreground">
                                                            {t("tenant.totalAmount") || "Total Amount"}
                                                      </span>
                                                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                                            {formatPrice(previewAmount, subscription?.currency || "USD")}
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
                                                                  <span className="text-muted-foreground">
                                                                        {o.resourceType}
                                                                  </span>
                                                                  <span className="font-mono text-destructive">
                                                                        {o.currentCount} / {o.newLimit === -1 ? "∞" : o.newLimit}
                                                                        <span className="ml-1 text-destructive font-semibold">
                                                                              (+{o.overflowCount} {t("tenant.overflow") || "over"})
                                                                        </span>
                                                                  </span>
                                                            </div>
                                                      ))}
                                                </div>
                                                <p className="text-xs text-muted-foreground">
                                                      {t("tenant.overflowInfo") || "Excess resources will need to be removed or the system will auto-adjust."}
                                                </p>
                                          </div>
                                    )}
                              </div>
                              <DialogFooter>
                                    <Button variant="outline" onClick={() => setChangePlanOpen(false)} disabled={vm.isChanging}>
                                          {t("common.cancel") || "Cancel"}
                                    </Button>
                                    <Button
                                          variant={impactReport?.hasOverflow ? "destructive" : "default"}
                                          onClick={() => {
                                                if (selectedEditionId) {
                                                      vm.changeEdition(selectedEditionId, selectedType);
                                                      setChangePlanOpen(false);
                                                      setImpactReport(null);
                                                      setPreviewAmount(null);
                                                }
                                          }}
                                          disabled={!selectedEditionId || vm.isChanging}
                                    >
                                          {vm.isChanging
                                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.saving") || "Saving..."}</>
                                                : impactReport?.hasOverflow
                                                      ? (t("tenant.confirmDowngrade") || "Confirm Downgrade")
                                                      : (t("common.save") || "Save")
                                          }
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
                                          {t("tenant.renewDesc") || "Extend the subscription period. The new period will be added from the current end date."}
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-2">
                                    {subscription && (
                                          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                                                <p className="text-xs text-muted-foreground">{t("tenant.currentEndDate") || "Current End Date"}</p>
                                                <p className="text-sm font-medium">{subscription.endDate ? formatDate(subscription.endDate) : (t("tenant.never") || "Never (Lifetime)")}</p>
                                          </div>
                                    )}
                                    <div className="space-y-2">
                                          <Label>{t("tenant.extendBy") || "Extend By"}</Label>
                                          <GenericSelect
                                                options={RENEW_OPTIONS}
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
                                    <Button onClick={() => { vm.renewSubscription(selectedType); setRenewOpen(false); }} disabled={vm.isRenewing}>
                                          {vm.isRenewing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.saving") || "Saving..."}</> : (t("tenant.renew") || "Renew")}
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
                                          {t("tenant.convertTrialDesc") || "Select a billing cycle for the paid plan. The new period starts from today."}
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-2">
                                    <div className="flex items-center gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-sm text-yellow-700 dark:text-yellow-400">
                                          <AlertTriangle className="h-4 w-4 shrink-0" />
                                          <span>{t("tenant.trialOnceWarning") || "Trial can only be used once per edition. This action is irreversible."}</span>
                                    </div>
                                    <div className="space-y-2">
                                          <Label>{t("tenant.selectBillingCycle") || "Billing Cycle"}</Label>
                                          <GenericSelect
                                                options={CONVERT_OPTIONS}
                                                value={selectedType}
                                                onValueChange={(v: string | string[]) => setSelectedType(v as SubscriptionType)}
                                                placeholder={t("tenant.selectBillingCycle") || "Select billing cycle"}
                                          />
                                    </div>
                              </div>
                              <DialogFooter>
                                    <Button variant="outline" onClick={() => setConvertOpen(false)} disabled={vm.isConverting}>
                                          {t("common.cancel") || "Cancel"}
                                    </Button>
                                    <Button onClick={() => { vm.convertTrial(selectedType); setConvertOpen(false); }} disabled={vm.isConverting}>
                                          {vm.isConverting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.saving") || "Converting..."}</> : (t("tenant.convertToPaid") || "Convert to Paid")}
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            );
      }

      function renderSuspendDialog() {
            return (
                  <Dialog open={suspendOpen} onOpenChange={setSuspendOpen}>
                        <DialogContent className="max-w-md">
                              <DialogHeader>
                                    <DialogTitle className="text-destructive">{t("tenant.suspendSubscription") || "Suspend Subscription"}</DialogTitle>
                                    <DialogDescription>
                                          {t("tenant.suspendDesc") || "This tenant will lose access to the system while suspended. You can resume it later."}
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-2">
                                    {/* Fallback toggle */}
                                    {vm.hasFallback && (
                                          <div className="rounded-lg border p-3 space-y-3">
                                                <div className="flex items-center justify-between">
                                                      <div className="space-y-0.5">
                                                            <Label className="text-sm font-medium">
                                                                  {t("tenant.downgradeToFallback") || `Downgrade to ${vm.fallbackEditionName}`}
                                                            </Label>
                                                            <p className="text-xs text-muted-foreground">
                                                                  {useFallbackOnSuspend
                                                                        ? (t("tenant.downgradeDesc") || `Tenant will be moved to the ${vm.fallbackEditionName} plan and remain active.`)
                                                                        : (t("tenant.fullSuspendDesc") || "Tenant will be fully suspended and all admins deactivated.")
                                                                  }
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
                                          <div className="flex items-center gap-2 rounded-lg border border-orange-500/30 bg-orange-500/5 p-3 text-sm text-orange-700 dark:text-orange-400">
                                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                                <span>{t("tenant.suspendAdminWarning") || "All tenant administrators will be deactivated and unable to access the system until the subscription is resumed."}</span>
                                          </div>
                                    ) : (
                                          <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-sm text-blue-700 dark:text-blue-400">
                                                <ArrowDownCircle className="h-4 w-4 shrink-0" />
                                                <span>{t("tenant.downgradeKeepActive") || `Tenant will keep active on ${vm.fallbackEditionName} with reduced features.`}</span>
                                          </div>
                                    )}
                                    <div className="space-y-2">
                                          <Label>{t("tenant.suspendReason") || "Reason for suspension"} *</Label>
                                          <Textarea
                                                value={suspendReason}
                                                onChange={(e) => setSuspendReason(e.target.value)}
                                                placeholder={t("tenant.suspendReasonPlaceholder") || "e.g. Payment fraud, Terms violation..."}
                                                className="min-h-[80px]"
                                          />
                                    </div>
                              </div>
                              <DialogFooter>
                                    <Button variant="outline" onClick={() => setSuspendOpen(false)} disabled={vm.isSuspending}>
                                          {t("common.cancel") || "Cancel"}
                                    </Button>
                                    <Button variant="destructive" onClick={() => {
                                          if (suspendReason.trim().length >= 3) {
                                                vm.suspendSubscription(suspendReason.trim(), vm.hasFallback ? useFallbackOnSuspend : undefined);
                                                setSuspendOpen(false);
                                          }
                                    }} disabled={suspendReason.trim().length < 3 || vm.isSuspending}>
                                          {vm.isSuspending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /></> : <Pause className="mr-2 h-4 w-4" />}
                                          {useFallbackOnSuspend && vm.hasFallback
                                                ? (t("tenant.downgrade") || "Downgrade")
                                                : (t("tenant.suspend") || "Suspend")
                                          }
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            );
      }

      function renderCancelDialog() {
            return (
                  <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
                        <DialogContent className="max-w-md">
                              <DialogHeader>
                                    <DialogTitle className="text-destructive">{t("tenant.cancelSubscription") || "Cancel Subscription"}</DialogTitle>
                                    <DialogDescription>
                                          {t("tenant.cancelDesc") || "This will permanently end the subscription. The tenant will lose all edition features and permissions."}
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-2">
                                    {/* Fallback toggle */}
                                    {vm.hasFallback && (
                                          <div className="rounded-lg border p-3 space-y-3">
                                                <div className="flex items-center justify-between">
                                                      <div className="space-y-0.5">
                                                            <Label className="text-sm font-medium">
                                                                  {t("tenant.downgradeToFallback") || `Downgrade to ${vm.fallbackEditionName}`}
                                                            </Label>
                                                            <p className="text-xs text-muted-foreground">
                                                                  {useFallbackOnCancel
                                                                        ? (t("tenant.cancelDowngradeDesc") || `Tenant will be moved to ${vm.fallbackEditionName} and remain active.`)
                                                                        : (t("tenant.cancelPermanentDesc") || "Subscription will be permanently canceled and all admins deactivated.")
                                                                  }
                                                            </p>
                                                      </div>
                                                      <Switch
                                                            checked={useFallbackOnCancel}
                                                            onCheckedChange={setUseFallbackOnCancel}
                                                      />
                                                </div>
                                          </div>
                                    )}
                                    {/* Admin deactivation warning */}
                                    {!useFallbackOnCancel || !vm.hasFallback ? (
                                          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                                                <AlertTriangle className="h-4 w-4 shrink-0" />
                                                <span>{t("tenant.cancelAdminWarning") || "All tenant administrators will be permanently deactivated. This action cannot be undone."}</span>
                                          </div>
                                    ) : (
                                          <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-sm text-blue-700 dark:text-blue-400">
                                                <ArrowDownCircle className="h-4 w-4 shrink-0" />
                                                <span>{t("tenant.cancelDowngradeKeepActive") || `Tenant will keep active on ${vm.fallbackEditionName} with reduced features.`}</span>
                                          </div>
                                    )}
                                    <div className="space-y-2">
                                          <Label>{t("tenant.cancelReason") || "Reason (optional)"}</Label>
                                          <Textarea
                                                value={cancelReason}
                                                onChange={(e) => setCancelReason(e.target.value)}
                                                placeholder={t("tenant.cancelReasonPlaceholder") || "Why are you canceling this subscription?"}
                                                className="min-h-[80px]"
                                          />
                                    </div>
                              </div>
                              <DialogFooter>
                                    <Button variant="outline" onClick={() => setCancelOpen(false)} disabled={vm.isCanceling}>
                                          {t("common.cancel") || "Keep Subscription"}
                                    </Button>
                                    <Button variant="destructive" onClick={() => {
                                          vm.cancelSubscription(cancelReason.trim() || undefined, vm.hasFallback ? useFallbackOnCancel : undefined);
                                          setCancelOpen(false);
                                    }} disabled={vm.isCanceling}>
                                          {vm.isCanceling ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /></> : <XCircle className="mr-2 h-4 w-4" />}
                                          {useFallbackOnCancel && vm.hasFallback
                                                ? (t("tenant.downgrade") || "Downgrade")
                                                : (t("tenant.confirmCancel") || "Cancel Subscription")
                                          }
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
                                                ? (t("tenant.restoreOriginalPlan") || "Restore Original Plan")
                                                : (t("tenant.resumeSubscription") || "Resume Subscription")
                                          }
                                    </DialogTitle>
                                    <DialogDescription>
                                          {isRestore
                                                ? (t("tenant.restoreDesc") || "Restore to the original plan with a new billing period.")
                                                : (t("tenant.resumeDesc") || "Resume the suspended subscription and restore tenant access.")
                                          }
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-2">
                                    {isRestore ? (
                                          /* ── RESTORE FROM DOWNGRADE ── */
                                          <>
                                                {/* Original Plan Info */}
                                                <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                                                      <p className="text-xs text-muted-foreground">{t("tenant.originalPlan") || "Original Plan"}</p>
                                                      <p className="text-sm font-medium">
                                                            {vm.downgradedFromEditionName} — {TYPE_LABELS[vm.downgradedFromType || ""] || vm.downgradedFromType}
                                                      </p>
                                                      {vm.downgradedAt && (
                                                            <p className="text-xs text-muted-foreground">
                                                                  {t("tenant.downgradedOn") || "Downgraded on"}: {new Date(vm.downgradedAt).toLocaleDateString()}
                                                            </p>
                                                      )}
                                                </div>

                                                {/* Billing Cycle Chooser */}
                                                <div className="space-y-2">
                                                      <Label>{t("tenant.billingCycle") || "Billing Cycle"}</Label>
                                                      <GenericSelect
                                                            value={restoreType}
                                                            onValueChange={(v: string) => setRestoreType(v as SubscriptionType)}
                                                            options={CONVERT_OPTIONS}
                                                            placeholder={t("tenant.selectBillingCycle") || "Select billing cycle"}
                                                      />
                                                      <p className="text-xs text-muted-foreground">
                                                            {t("tenant.chooseBillingCycle") || "You may choose a different billing cycle."}
                                                      </p>
                                                </div>

                                                {/* Info Banner */}
                                                <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-sm text-blue-700 dark:text-blue-400">
                                                      <RotateCcw className="h-4 w-4 shrink-0" />
                                                      <span>{t("tenant.restoreInfo") || "A new billing period will start from today. Permissions will be restored to the original plan."}</span>
                                                </div>
                                          </>
                                    ) : (
                                          /* ── RESUME FROM SUSPEND ── */
                                          <>
                                                <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-sm text-blue-700 dark:text-blue-400">
                                                      <Play className="h-4 w-4 shrink-0" />
                                                      <span>{t("tenant.resumeAdminWarning") || "All previously deactivated administrators will be re-activated and regain access to the system."}</span>
                                                </div>
                                                {subscription && (
                                                      <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                                                            <p className="text-xs text-muted-foreground">{t("tenant.currentPlan") || "Plan"}</p>
                                                            <p className="text-sm font-medium">{subscription.editionName} — {TYPE_LABELS[subscription.type] || subscription.type}</p>
                                                      </div>
                                                )}
                                          </>
                                    )}
                              </div>
                              <DialogFooter>
                                    <Button variant="outline" onClick={() => setResumeOpen(false)} disabled={vm.isResuming}>
                                          {t("common.cancel") || "Cancel"}
                                    </Button>
                                    <Button onClick={() => {
                                          if (isRestore) {
                                                vm.resumeSubscription(restoreType);
                                          } else {
                                                vm.resumeSubscription();
                                          }
                                          setResumeOpen(false);
                                    }} disabled={vm.isResuming}>
                                          {vm.isResuming ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isRestore ? <RotateCcw className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                                          {isRestore
                                                ? (t("tenant.confirmRestore") || "Restore Plan")
                                                : (t("tenant.confirmResume") || "Resume Subscription")
                                          }
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            );
      }

      function renderChangeCurrencyDialog() {
            const currencyOptions: GenericSelectOption[] = SUPPORTED_CURRENCIES.map(c => ({
                  value: c.code,
                  label: `${c.flag} ${c.code} — ${c.name}`,
            }));

            return (
                  <Dialog open={changeCurrencyOpen} onOpenChange={setChangeCurrencyOpen}>
                        <DialogContent className="max-w-md">
                              <DialogHeader>
                                    <DialogTitle>{t("tenant.changeCurrency") || "Change Billing Currency"}</DialogTitle>
                                    <DialogDescription>
                                          {t("tenant.changeCurrencyDesc") || "Change the billing currency for this subscription. Pricing will be recalculated using current exchange rates."}
                                    </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-2">
                                    {subscription && subscription.currency && (
                                          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
                                                <p className="text-xs text-muted-foreground">{t("tenant.currentCurrency") || "Current Currency"}</p>
                                                <p className="text-sm font-medium">
                                                      {SUPPORTED_CURRENCIES.find(c => c.code === subscription.currency)?.flag || "🌍"}{" "}
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
                                    <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-sm text-blue-700 dark:text-blue-400">
                                          <DollarSign className="h-4 w-4 shrink-0" />
                                          <span>{t("tenant.changeCurrencyInfo") || "The subscription amount will be recalculated using the current exchange rate. No other subscription details will change."}</span>
                                    </div>
                              </div>
                              <DialogFooter>
                                    <Button variant="outline" onClick={() => setChangeCurrencyOpen(false)} disabled={vm.isChangingCurrency}>
                                          {t("common.cancel") || "Cancel"}
                                    </Button>
                                    <Button onClick={() => {
                                          if (selectedCurrency && selectedCurrency !== subscription?.currency) {
                                                vm.changeCurrency(selectedCurrency);
                                                setChangeCurrencyOpen(false);
                                          }
                                    }} disabled={!selectedCurrency || selectedCurrency === subscription?.currency || vm.isChangingCurrency}>
                                          {vm.isChangingCurrency
                                                ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t("common.saving") || "Saving..."}</>
                                                : <><Globe className="mr-2 h-4 w-4" />{t("tenant.changeCurrency") || "Change Currency"}</>
                                          }
                                    </Button>
                              </DialogFooter>
                        </DialogContent>
                  </Dialog>
            );
      }
}
