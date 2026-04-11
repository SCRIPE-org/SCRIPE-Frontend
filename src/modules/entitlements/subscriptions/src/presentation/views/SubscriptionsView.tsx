/**
 * Subscriptions View
 *
 * Tenant-scoped view showing subscription history with full lifecycle actions:
 * Assign, Change, Revoke, Suspend, Resume, Cancel, Convert Trial, Resync.
 */
"use client";

import { useMemo, useCallback } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction, CustomAction } from "@core/crud/components/generic-crud-view";
import { useSubscriptionsViewModel } from "../viewmodels/useSubscriptionsViewModel";
import { useEditionsViewModel } from "@modules/entitlements/editions/src/presentation/viewmodels/useEditionsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
      Dialog, DialogContent, DialogDescription, DialogFooter,
      DialogHeader, DialogTitle,
} from "@core/ui/dialog";
import {
      Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@core/ui/select";
import { Input } from "@core/ui/input";
import { DatePicker } from "@core/ui/date-picker";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
import { Textarea } from "@core/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import {
      Loader2, Plus, RefreshCw, XCircle, PauseCircle, PlayCircle,
      Ban, ArrowRightLeft, RotateCcw, Shield, Tag, DollarSign,
      CreditCard, ExternalLink, Copy, XSquare,
} from "lucide-react";
import { format } from "date-fns";
import type { SubscriptionListItem } from "../../domain/entities/Subscription";
import { useModuleLocales } from "@core/hooks/use-module-locales";

/* ============================================
 * BADGE VARIANT MAPS
 * ============================================ */

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      Active: "default",
      Trialing: "secondary",
      Canceled: "destructive",
      Expired: "outline",
      Suspended: "destructive",
      PendingPayment: "secondary",
};

const TYPE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
      Lifetime: "default",
      Monthly: "secondary",
      Yearly: "secondary",
      Trial: "outline",
};

/* ============================================
 * VIEWMODEL ADAPTER
 * ============================================ */

function useSubscriptionsCrudAdapter(tenantId: string) {
      const vm = useSubscriptionsViewModel(tenantId);
      const totalCount = vm.items?.length ?? 0;

      return {
            ...vm,
            loading: vm.isLoading,
            error: vm.error ? (vm.error as Error).message : null,
            refresh: () => { },
            refreshItems: () => { },
            selectedItems: [] as string[],
            setSelectedItems: () => { },
            searchValue: "",
            handleSearchChange: () => { },
            isCreateModalOpen: false,
            setIsCreateModalOpen: () => { },
            // Explicit pagination so GenericCrudView footer renders correct counts
            totalCount,
            page: 1,
            pageSize: totalCount || 1,
            totalPages: 1,
      };
}

/* ============================================
 * VIEW
 * ============================================ */

interface SubscriptionsViewProps {
      tenantId: string;
}

export function SubscriptionsView({ tenantId }: SubscriptionsViewProps) {
  useModuleLocales(() => import("../../../../locales"), "entitlements-shared");
      const { t, language } = useI18n();
      const vm = useSubscriptionsCrudAdapter(tenantId);
      const editionsVm = useEditionsViewModel();

      const config: CrudConfig<SubscriptionListItem> = useMemo(
            () => ({
                  titleKey: "entSubscriptions.title",
                  subtitleKey: "entSubscriptions.description",
                  hideAddButton: true,

                  columns: [
                        {
                              key: "editionName",
                              label: t("entitlements.editions.editionName"),
                              sortable: false,
                              render: (value: string, item: SubscriptionListItem) => (
                                    <div className="flex items-center gap-2">
                                          <span>{value}</span>
                                          {item.isDowngraded && (
                                                <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                                                      {t("entSubscriptions.downgraded") || "Downgraded"}
                                                </Badge>
                                          )}
                                    </div>
                              ),
                        },
                        {
                              key: "type",
                              label: t("tenant.subscriptionType"),
                              render: (value: string) => (
                                    <Badge variant={TYPE_VARIANTS[value] ?? "outline"}>
                                          {t(`entSubscriptions.${value.toLowerCase()}`) || value}
                                    </Badge>
                              ),
                        },
                        {
                              key: "status",
                              label: t("common.status"),
                              render: (value: string) => (
                                    <Badge variant={STATUS_VARIANTS[value] ?? "outline"}>
                                          {t(`entSubscriptions.${value.toLowerCase()}`) || value}
                                    </Badge>
                              ),
                        },
                        {
                              key: "totalAmount",
                              label: t("entitlements.pricing.amount") || "Amount",
                              render: (_value: unknown, item: SubscriptionListItem) => {
                                    if (!item.totalAmount || !item.currency) {
                                          return <span className="text-muted-foreground">—</span>;
                                    }
                                    const formatted = new Intl.NumberFormat("en-US", {
                                          style: "currency",
                                          currency: item.currency,
                                          minimumFractionDigits: 2,
                                    }).format(item.totalAmount);
                                    const hasDiscount = item.promotionDiscount != null && item.promotionDiscount > 0;
                                    return (
                                          <div className="flex flex-col">
                                                <div className="flex items-center gap-1.5">
                                                      <span className="tabular-nums text-sm font-medium">{formatted}</span>
                                                      <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                                            {item.currency}
                                                      </Badge>
                                                </div>
                                                {hasDiscount && item.baseAmount != null && (
                                                      <span className="text-[10px] text-muted-foreground">
                                                            <span className="line-through">
                                                                  {new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency, minimumFractionDigits: 2 }).format(item.baseAmount)}
                                                            </span>
                                                            {" "}
                                                            <span className="text-green-600">-{new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency, minimumFractionDigits: 2 }).format(item.promotionDiscount!)}</span>
                                                      </span>
                                                )}
                                          </div>
                                    );
                              },
                        },
                        {
                              key: "endDate",
                              label: t("entSubscriptions.endDate") || "End Date",
                              render: (value?: string) =>
                                    value ? format(new Date(value), "MMM d, yyyy") : "∞",
                              hideOnMobile: true,
                        },
                        {
                              key: "expiryBehavior",
                              label: t("entSubscriptions.expiryBehavior") || "On Expiry",
                              render: (value: string) => (
                                    <Badge variant="outline" className="text-xs">
                                          {value === "Fallback" ? "↓ Fallback" : "⏸ Suspend"}
                                    </Badge>
                              ),
                              hideOnMobile: true,
                        },
                        {
                              key: "appliedPromoCode",
                              label: t("entitlements.promotions.promoCode") || "Promo",
                              render: (_value: unknown, item: SubscriptionListItem) => {
                                    if (!item.appliedPromoCode) {
                                          return <span className="text-muted-foreground">—</span>;
                                    }
                                    return (
                                          <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className="text-[10px] border-primary/30 text-primary">
                                                      <Tag className="h-3 w-3 me-0.5" />
                                                      {item.appliedPromoCode}
                                                </Badge>
                                                {item.promotionDiscount != null && item.promotionDiscount > 0 && (
                                                      <span className="text-[10px] text-green-600">-{item.promotionDiscount}%</span>
                                                )}
                                          </div>
                                    );
                              },
                              hideOnMobile: true,
                        },
                        {
                              key: "refundType",
                              label: t("entSubscriptions.refundType") || "Refund",
                              render: (_value: unknown, item: SubscriptionListItem) => {
                                    if (!item.refundType || item.refundType === "None") {
                                          return <span className="text-muted-foreground">—</span>;
                                    }
                                    const variant = item.refundType === "Full" ? "destructive" as const : "secondary" as const;
                                    return (
                                          <div className="flex flex-col gap-0.5">
                                                <Badge variant={variant} className="text-[10px] px-1.5 py-0">
                                                      <DollarSign className="h-3 w-3 me-0.5" />
                                                      {item.refundType === "Full"
                                                            ? (t("entSubscriptions.fullRefund") || "Full Refund")
                                                            : (t("entSubscriptions.proRataRefund") || "Pro-Rata")}
                                                </Badge>
                                                {item.refundAmount != null && item.refundAmount > 0 && item.currency && (
                                                      <span className="text-[10px] text-muted-foreground tabular-nums">
                                                            {new Intl.NumberFormat("en-US", { style: "currency", currency: item.currency, minimumFractionDigits: 2 }).format(item.refundAmount)}
                                                      </span>
                                                )}
                                          </div>
                                    );
                              },
                              hideOnMobile: true,
                        },
                        {
                              key: "startDate",
                              label: t("common.createdAt"),
                              render: (value: string) =>
                                    value ? format(new Date(value), "MMM d, yyyy") : "-",
                              hideOnMobile: true,
                        },
                  ],

                  getActions: (): CrudAction<SubscriptionListItem>[] => [
                        {
                              label: t("entSubscriptions.revoke"),
                              icon: <XCircle className="h-4 w-4" />,
                              variant: "ghost",
                              className: "text-destructive",
                              onClick: (item: SubscriptionListItem) => vm.revokeSubscription(item.id),
                              show: (item: SubscriptionListItem) =>
                                    item.status === "Active" || item.status === "Trialing",
                              loading: vm.isRevoking,
                              confirmTitle: t("entSubscriptions.revoke"),
                              confirmDescription:
                                    t("entSubscriptions.revokeDesc") ||
                                    "Are you sure you want to revoke this subscription?",
                              confirmVariant: "destructive",
                        },
                  ],

                  customActions: (() => {
                        const actions: CustomAction[] = [];

                        if (vm.hasActiveSubscription) {
                              // Change plan
                              actions.push({
                                    label: t("entSubscriptions.change"),
                                    icon: <ArrowRightLeft className="h-4 w-4" />,
                                    variant: "outline",
                                    onClick: async () => vm.setShowChangeDialog(true),
                              });
                              // Suspend
                              actions.push({
                                    label: t("entSubscriptions.suspend") || "Suspend",
                                    icon: <PauseCircle className="h-4 w-4" />,
                                    variant: "outline",
                                    onClick: async () => vm.setShowSuspendDialog(true),
                              });
                              // Cancel
                              actions.push({
                                    label: t("entSubscriptions.cancel") || "Cancel",
                                    icon: <Ban className="h-4 w-4" />,
                                    variant: "outline",
                                    onClick: async () => vm.setShowCancelDialog(true),
                              });
                              // Convert Trial (only if trialing)
                              if (vm.isTrialing) {
                                    actions.push({
                                          label: t("entSubscriptions.convertTrial") || "Convert Trial",
                                          icon: <Shield className="h-4 w-4" />,
                                          variant: "default",
                                          onClick: async () => vm.setShowConvertDialog(true),
                                    });
                              }
                        } else if (vm.hasSuspendedSubscription) {
                              // Resume
                              actions.push({
                                    label: t("entSubscriptions.resume") || "Resume",
                                    icon: <PlayCircle className="h-4 w-4" />,
                                    variant: "default",
                                    onClick: async () => vm.resumeSubscription(),
                              });
                        } else {
                              // No active subscription — assign
                              actions.push({
                                    label: t("entSubscriptions.assign"),
                                    icon: <Plus className="h-4 w-4" />,
                                    variant: "default",
                                    onClick: async () => vm.setShowAssignDialog(true),
                              });
                        }

                        // Resync (always available)
                        actions.push({
                              label: t("entSubscriptions.resync") || "Resync Permissions",
                              icon: <RotateCcw className="h-4 w-4" />,
                              variant: "outline",
                              onClick: async () => vm.resyncPermissions(),
                        });

                        // ── Billing actions (only when there's an active subscription) ──
                        if (vm.hasActiveSubscription) {
                              // Send Payment Link
                              actions.push({
                                    label: t("billing.actions.createCheckout") || "Send Payment Link",
                                    icon: <CreditCard className="h-4 w-4" />,
                                    variant: "outline",
                                    onClick: async () => vm.sendPaymentLink(),
                                    loading: vm.isSendingPaymentLink,
                              });

                              // Open Billing Portal (only if tenant has Stripe customer)
                              if (vm.activeSubscription?.hasStripeCustomer) {
                                    actions.push({
                                          label: t("billing.actions.openPortal") || "Open Billing Portal",
                                          icon: <ExternalLink className="h-4 w-4" />,
                                          variant: "outline",
                                          onClick: async () => vm.openBillingPortal(),
                                          loading: vm.isOpeningPortal,
                                    });
                              }

                              // Cancel Stripe Subscription (only if tenant has Stripe subscription)
                              if (vm.activeSubscription?.hasStripeSubscription) {
                                    actions.push({
                                          label: t("billing.actions.cancelStripe") || "Cancel Stripe",
                                          icon: <XSquare className="h-4 w-4" />,
                                          variant: "outline",
                                          className: "text-destructive",
                                          onClick: async () => vm.setShowCancelStripeDialog(true),
                                    });
                              }
                        }

                        return actions;
                  })(),

                  customFooterContent: (
                        <>
                              <AssignDialog vm={vm} editionsVm={editionsVm} />
                              <ChangeDialog vm={vm} editionsVm={editionsVm} />
                              <SuspendDialog vm={vm} />
                              <CancelDialog vm={vm} />
                              <ConvertDialog vm={vm} editionsVm={editionsVm} />
                              <CheckoutDialog vm={vm} />
                              <CancelStripeDialog vm={vm} />
                        </>
                  ),
            }),
            [t, vm, editionsVm, language]
      );

      return <GenericCrudView viewModel={vm} config={config} />;
}

/* ============================================
 * ASSIGN DIALOG
 * ============================================ */

function AssignDialog({
      vm,
      editionsVm,
}: {
      vm: ReturnType<typeof useSubscriptionsCrudAdapter>;
      editionsVm: ReturnType<typeof useEditionsViewModel>;
}) {
      const { t } = useI18n();
      return (
            <Dialog open={vm.showAssignDialog} onOpenChange={vm.setShowAssignDialog}>
                  <DialogContent>
                        <DialogHeader>
                              <DialogTitle>{t("entSubscriptions.assign")}</DialogTitle>
                              <DialogDescription>{t("entSubscriptions.assignDesc")}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                              {/* Edition */}
                              <div className="space-y-2">
                                    <Label>{t("entitlements.editions.editionName")}</Label>
                                    <Select value={vm.selectedEditionId} onValueChange={vm.setSelectedEditionId}>
                                          <SelectTrigger>
                                                <SelectValue placeholder={t("entitlements.editions.editionName")} />
                                          </SelectTrigger>
                                          <SelectContent>
                                                {(editionsVm.items ?? []).map((ed) => (
                                                      <SelectItem key={ed.id} value={ed.id}>
                                                            {ed.displayNameEn || ed.name}
                                                      </SelectItem>
                                                ))}
                                          </SelectContent>
                                    </Select>
                              </div>

                              {/* Type — filtered by selected edition billing controls */}
                              <div className="space-y-2">
                                    <Label>{t("tenant.subscriptionType")}</Label>
                                    {(() => {
                                          const selectedEd = (editionsVm.items ?? []).find((ed) => ed.id === vm.selectedEditionId);
                                          return (
                                                <Select value={vm.subscriptionType} onValueChange={vm.setSubscriptionType}>
                                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                                      <SelectContent>
                                                            {(!selectedEd || selectedEd.data.allowLifetime) && (
                                                                  <SelectItem value="Lifetime">{t("entSubscriptions.lifetime")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowTrial) && (
                                                                  <SelectItem value="Trial">{t("entSubscriptions.trial")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowMonthly) && (
                                                                  <SelectItem value="Monthly">{t("entSubscriptions.monthly")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowYearly) && (
                                                                  <SelectItem value="Yearly">{t("entSubscriptions.yearly")}</SelectItem>
                                                            )}
                                                      </SelectContent>
                                                </Select>
                                          );
                                    })()}
                              </div>

                              {/* End Date */}
                              {vm.subscriptionType !== "Lifetime" && (
                                    <div className="space-y-2">
                                          <Label>{t("entSubscriptions.endDate") || "End Date"}</Label>
                                          <DatePicker
                                                value={vm.endDate}
                                                onChange={(v) => vm.setEndDate(v)}
                                                placeholder={t("entSubscriptions.endDate") || "End Date"}
                                          />
                                    </div>
                              )}

                              {/* Expiry Behavior */}
                              {vm.subscriptionType !== "Lifetime" && (
                                    <div className="space-y-2">
                                          <Label>{t("entSubscriptions.expiryBehavior") || "On Expiry"}</Label>
                                          <Select value={vm.expiryBehavior} onValueChange={vm.setExpiryBehavior}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                      <SelectItem value="Fallback">
                                                            ↓ {t("entSubscriptions.fallback") || "Fallback to lower edition"}
                                                      </SelectItem>
                                                      <SelectItem value="Suspend">
                                                            ⏸ {t("entSubscriptions.suspendOnExpiry") || "Suspend tenant"}
                                                      </SelectItem>
                                                </SelectContent>
                                          </Select>
                                    </div>
                              )}

                              {/* Promotion Picker */}
                              {vm.selectedEditionId && (
                                    <div className="space-y-3">
                                          <div className="space-y-2">
                                                <Label className="flex items-center gap-1.5">
                                                      <Tag className="h-3.5 w-3.5 text-primary" />
                                                      {t("entitlements.promotions.title") || "Promotion"}
                                                </Label>
                                                {vm.isLoadingPromotions ? (
                                                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            {t("common.loading") || "Loading promotions..."}
                                                      </div>
                                                ) : vm.availablePromotions.length === 0 ? (
                                                      <p className="text-sm text-muted-foreground py-1">
                                                            {t("entitlements.promotions.noPromotionsAvailable") || "No promotions available for this plan"}
                                                      </p>
                                                ) : (
                                                      <Select
                                                            value={vm.selectedPromotionId ?? "__none__"}
                                                            onValueChange={(v) => vm.setSelectedPromotionId(v === "__none__" ? null : v)}
                                                      >
                                                            <SelectTrigger>
                                                                  <SelectValue placeholder={t("entitlements.promotions.selectPromotion") || "No promotion"} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                  <SelectItem value="__none__">
                                                                        {t("entitlements.promotions.noPromotion") || "No promotion"}
                                                                  </SelectItem>
                                                                  {vm.availablePromotions.map((promo) => (
                                                                        <SelectItem key={promo.id} value={promo.id}>
                                                                              <span className="flex items-center gap-2">
                                                                                    {promo.name}
                                                                                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                                                          {promo.type === "Percentage" ? `${promo.discountValue}% off` : `$${promo.discountValue} off`}
                                                                                    </Badge>
                                                                                    {promo.requiresCode && (
                                                                                          <Badge variant="secondary" className="text-[10px] px-1 py-0">Code</Badge>
                                                                                    )}
                                                                              </span>
                                                                        </SelectItem>
                                                                  ))}
                                                            </SelectContent>
                                                      </Select>
                                                )}
                                          </div>

                                          {/* Conditional promo code input */}
                                          {vm.requiresPromoCode && vm.selectedPromotion && (
                                                <div className="space-y-2">
                                                      <Label className="text-sm">
                                                            {t("entitlements.promotions.promoCode") || "Promo Code"}
                                                      </Label>
                                                      <Input
                                                            value={vm.promoCode}
                                                            onChange={(e) => vm.setPromoCode(e.target.value.toUpperCase())}
                                                            placeholder={t("entitlements.promotions.enterCode") || "Enter the promo code"}
                                                            className="font-mono uppercase"
                                                      />
                                                </div>
                                          )}

                                          {/* Discount preview */}
                                          {vm.selectedPromotion && (
                                                <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-2">
                                                      <Tag className="h-4 w-4 text-green-600" />
                                                      <span className="text-sm text-green-700 dark:text-green-400">
                                                            {vm.selectedPromotion.name} —{" "}
                                                            {vm.selectedPromotion.type === "Percentage"
                                                                  ? `${vm.selectedPromotion.discountValue}% off`
                                                                  : `$${vm.selectedPromotion.discountValue} off`
                                                            }
                                                            {!vm.selectedPromotion.requiresCode && (
                                                                  <span className="text-xs opacity-75 ms-1">(auto-applied)</span>
                                                            )}
                                                      </span>
                                                </div>
                                          )}
                                    </div>
                              )}

                              {/* Currency */}
                              <div className="space-y-2">
                                    <Label>{t("entitlements.promotions.currency") || "Currency"}</Label>
                                    <Select value={vm.currency} onValueChange={vm.setCurrency}>
                                          <SelectTrigger><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                                {["USD", "EUR", "GBP", "SAR", "AED", "EGP"].map((c) => (
                                                      <SelectItem key={c} value={c}>{c}</SelectItem>
                                                ))}
                                          </SelectContent>
                                    </Select>
                              </div>
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => vm.setShowAssignDialog(false)}>
                                    {t("common.cancel")}
                              </Button>
                              <Button onClick={vm.submitAssign} disabled={!vm.selectedEditionId || vm.isAssigning}>
                                    {vm.isAssigning && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    {t("entSubscriptions.assign")}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}

/* ============================================
 * CHANGE DIALOG
 * ============================================ */

function ChangeDialog({
      vm,
      editionsVm,
}: {
      vm: ReturnType<typeof useSubscriptionsCrudAdapter>;
      editionsVm: ReturnType<typeof useEditionsViewModel>;
}) {
      const { t } = useI18n();
      return (
            <Dialog open={vm.showChangeDialog} onOpenChange={vm.setShowChangeDialog}>
                  <DialogContent>
                        <DialogHeader>
                              <DialogTitle>{t("entSubscriptions.change")}</DialogTitle>
                              <DialogDescription>{t("entSubscriptions.changeDesc")}</DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                              {/* Edition */}
                              <div className="space-y-2">
                                    <Label>{t("entitlements.editions.editionName")}</Label>
                                    <Select value={vm.selectedEditionId} onValueChange={vm.setSelectedEditionId}>
                                          <SelectTrigger>
                                                <SelectValue placeholder={t("entitlements.editions.editionName")} />
                                          </SelectTrigger>
                                          <SelectContent>
                                                {(editionsVm.items ?? []).map((ed) => (
                                                      <SelectItem key={ed.id} value={ed.id}>
                                                            {ed.displayNameEn || ed.name}
                                                      </SelectItem>
                                                ))}
                                          </SelectContent>
                                    </Select>
                              </div>

                              {/* Type — filtered by selected edition billing controls */}
                              <div className="space-y-2">
                                    <Label>{t("tenant.subscriptionType")}</Label>
                                    {(() => {
                                          const selectedEd = (editionsVm.items ?? []).find((ed) => ed.id === vm.selectedEditionId);
                                          return (
                                                <Select value={vm.subscriptionType} onValueChange={vm.setSubscriptionType}>
                                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                                      <SelectContent>
                                                            {(!selectedEd || selectedEd.data.allowLifetime) && (
                                                                  <SelectItem value="Lifetime">{t("entSubscriptions.lifetime")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowTrial) && (
                                                                  <SelectItem value="Trial">{t("entSubscriptions.trial")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowMonthly) && (
                                                                  <SelectItem value="Monthly">{t("entSubscriptions.monthly")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowYearly) && (
                                                                  <SelectItem value="Yearly">{t("entSubscriptions.yearly")}</SelectItem>
                                                            )}
                                                      </SelectContent>
                                                </Select>
                                          );
                                    })()}
                              </div>

                              {/* Promotion Picker */}
                              {vm.selectedEditionId && (
                                    <div className="space-y-3">
                                          <div className="space-y-2">
                                                <Label className="flex items-center gap-1.5">
                                                      <Tag className="h-3.5 w-3.5 text-primary" />
                                                      {t("entitlements.promotions.title") || "Promotion"}
                                                </Label>
                                                {vm.isLoadingPromotions ? (
                                                      <div className="flex items-center gap-2 text-sm text-muted-foreground py-2">
                                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                            {t("common.loading") || "Loading promotions..."}
                                                      </div>
                                                ) : vm.availablePromotions.length === 0 ? (
                                                      <p className="text-sm text-muted-foreground py-1">
                                                            {t("entitlements.promotions.noPromotionsAvailable") || "No promotions available for this plan"}
                                                      </p>
                                                ) : (
                                                      <Select
                                                            value={vm.selectedPromotionId ?? "__none__"}
                                                            onValueChange={(v) => vm.setSelectedPromotionId(v === "__none__" ? null : v)}
                                                      >
                                                            <SelectTrigger>
                                                                  <SelectValue placeholder={t("entitlements.promotions.selectPromotion") || "No promotion"} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                  <SelectItem value="__none__">
                                                                        {t("entitlements.promotions.noPromotion") || "No promotion"}
                                                                  </SelectItem>
                                                                  {vm.availablePromotions.map((promo) => (
                                                                        <SelectItem key={promo.id} value={promo.id}>
                                                                              <span className="flex items-center gap-2">
                                                                                    {promo.name}
                                                                                    <Badge variant="outline" className="text-[10px] px-1 py-0">
                                                                                          {promo.type === "Percentage" ? `${promo.discountValue}% off` : `$${promo.discountValue} off`}
                                                                                    </Badge>
                                                                                    {promo.requiresCode && (
                                                                                          <Badge variant="secondary" className="text-[10px] px-1 py-0">Code</Badge>
                                                                                    )}
                                                                              </span>
                                                                        </SelectItem>
                                                                  ))}
                                                            </SelectContent>
                                                      </Select>
                                                )}
                                          </div>

                                          {/* Conditional promo code input */}
                                          {vm.requiresPromoCode && vm.selectedPromotion && (
                                                <div className="space-y-2">
                                                      <Label className="text-sm">
                                                            {t("entitlements.promotions.promoCode") || "Promo Code"}
                                                      </Label>
                                                      <Input
                                                            value={vm.promoCode}
                                                            onChange={(e) => vm.setPromoCode(e.target.value.toUpperCase())}
                                                            placeholder={t("entitlements.promotions.enterCode") || "Enter the promo code"}
                                                            className="font-mono uppercase"
                                                      />
                                                </div>
                                          )}

                                          {/* Discount preview */}
                                          {vm.selectedPromotion && (
                                                <div className="flex items-center gap-2 rounded-md bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 p-2">
                                                      <Tag className="h-4 w-4 text-green-600" />
                                                      <span className="text-sm text-green-700 dark:text-green-400">
                                                            {vm.selectedPromotion.name} —{" "}
                                                            {vm.selectedPromotion.type === "Percentage"
                                                                  ? `${vm.selectedPromotion.discountValue}% off`
                                                                  : `$${vm.selectedPromotion.discountValue} off`
                                                            }
                                                            {!vm.selectedPromotion.requiresCode && (
                                                                  <span className="text-xs opacity-75 ms-1">(auto-applied)</span>
                                                            )}
                                                      </span>
                                                </div>
                                          )}
                                    </div>
                              )}

                              {/* Currency */}
                              <div className="space-y-2">
                                    <Label>{t("entitlements.promotions.currency") || "Currency"}</Label>
                                    <Select value={vm.currency} onValueChange={vm.setCurrency}>
                                          <SelectTrigger><SelectValue /></SelectTrigger>
                                          <SelectContent>
                                                {["USD", "EUR", "GBP", "SAR", "AED", "EGP"].map((c) => (
                                                      <SelectItem key={c} value={c}>{c}</SelectItem>
                                                ))}
                                          </SelectContent>
                                    </Select>
                              </div>
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => vm.setShowChangeDialog(false)}>
                                    {t("common.cancel")}
                              </Button>
                              <Button onClick={vm.submitChange} disabled={!vm.selectedEditionId || vm.isChanging}>
                                    {vm.isChanging && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    {t("entSubscriptions.change")}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}

/* ============================================
 * SUSPEND DIALOG
 * ============================================ */

function SuspendDialog({
      vm,
}: {
      vm: ReturnType<typeof useSubscriptionsCrudAdapter>;
}) {
      const { t } = useI18n();
      return (
            <Dialog open={vm.showSuspendDialog} onOpenChange={vm.setShowSuspendDialog}>
                  <DialogContent>
                        <DialogHeader>
                              <DialogTitle>{t("entSubscriptions.suspend") || "Suspend Subscription"}</DialogTitle>
                              <DialogDescription>
                                    {t("entSubscriptions.suspendDesc") || "Temporarily suspend this tenant's subscription."}
                              </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                    <Label>{t("entSubscriptions.reason") || "Reason"}</Label>
                                    <Textarea
                                          value={vm.suspendReason}
                                          onChange={(e) => vm.setSuspendReason(e.target.value)}
                                          placeholder={t("entSubscriptions.reasonPlaceholder") || "e.g., Payment overdue, Terms violation..."}
                                          rows={3}
                                    />
                              </div>

                              <div className="flex items-center space-x-2">
                                    <Checkbox
                                          id="use-fallback-suspend"
                                          checked={vm.useFallback}
                                          onCheckedChange={(v) => vm.setUseFallback(!!v)}
                                    />
                                    <Label htmlFor="use-fallback-suspend" className="text-sm font-normal">
                                          {t("entSubscriptions.useFallback") || "Downgrade to fallback edition instead of full suspend"}
                                    </Label>
                              </div>

                              {/* ── Refund Options ── */}
                              <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5">
                                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                                          {t("entSubscriptions.refundType") || "Refund"}
                                    </Label>
                                    <RadioGroup value={vm.refundType} onValueChange={vm.setRefundType}>
                                          <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="None" id="suspend-refund-none" />
                                                <Label htmlFor="suspend-refund-none" className="text-sm font-normal">
                                                      {t("entSubscriptions.noRefund") || "No Refund"}
                                                </Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Full" id="suspend-refund-full" />
                                                <Label htmlFor="suspend-refund-full" className="text-sm font-normal">
                                                      {t("entSubscriptions.fullRefund") || "Full Refund"}
                                                </Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="ProRata" id="suspend-refund-prorata" />
                                                <Label htmlFor="suspend-refund-prorata" className="text-sm font-normal">
                                                      {t("entSubscriptions.proRataRefund") || "Pro-rata Refund (remaining time)"}
                                                </Label>
                                          </div>
                                    </RadioGroup>
                              </div>

                              {/* Custom amount — only visible for ProRata */}
                              {vm.refundType === "ProRata" && (
                                    <div className="space-y-2">
                                          <Label className="text-sm">
                                                {t("entSubscriptions.customRefundAmount") || "Custom Amount (optional — leave empty for auto-calculate)"}
                                          </Label>
                                          <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={vm.customRefundAmount}
                                                onChange={(e) => vm.setCustomRefundAmount(e.target.value)}
                                                placeholder={t("entSubscriptions.customAmountPlaceholder") || "e.g., 50.00"}
                                                className="font-mono"
                                          />
                                          <p className="text-xs text-muted-foreground">
                                                {t("entSubscriptions.customAmountHint") || "If empty, the system auto-calculates based on remaining subscription time."}
                                          </p>
                                    </div>
                              )}
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => vm.setShowSuspendDialog(false)}>
                                    {t("common.cancel")}
                              </Button>
                              <Button
                                    variant="destructive"
                                    onClick={vm.submitSuspend}
                                    disabled={!vm.suspendReason.trim() || vm.isSuspending}
                              >
                                    {vm.isSuspending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    {t("entSubscriptions.suspend") || "Suspend"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}

/* ============================================
 * CANCEL DIALOG
 * ============================================ */

function CancelDialog({
      vm,
}: {
      vm: ReturnType<typeof useSubscriptionsCrudAdapter>;
}) {
      const { t } = useI18n();
      return (
            <Dialog open={vm.showCancelDialog} onOpenChange={vm.setShowCancelDialog}>
                  <DialogContent>
                        <DialogHeader>
                              <DialogTitle>{t("entSubscriptions.cancel") || "Cancel Subscription"}</DialogTitle>
                              <DialogDescription>
                                    {t("entSubscriptions.cancelDesc") || "Permanently cancel this subscription."}
                              </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                    <Label>{t("entSubscriptions.reason") || "Reason (optional)"}</Label>
                                    <Textarea
                                          value={vm.cancelReason}
                                          onChange={(e) => vm.setCancelReason(e.target.value)}
                                          placeholder={t("entSubscriptions.cancelReasonPlaceholder") || "Why are you canceling?"}
                                          rows={3}
                                    />
                              </div>

                              <div className="flex items-center space-x-2">
                                    <Checkbox
                                          id="use-fallback-cancel"
                                          checked={vm.useFallback}
                                          onCheckedChange={(v) => vm.setUseFallback(!!v)}
                                    />
                                    <Label htmlFor="use-fallback-cancel" className="text-sm font-normal">
                                          {t("entSubscriptions.useFallback") || "Downgrade to fallback edition instead of full cancel"}
                                    </Label>
                              </div>

                              {/* ── Refund Options ── */}
                              <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5">
                                          <DollarSign className="h-3.5 w-3.5 text-primary" />
                                          {t("entSubscriptions.refundType") || "Refund"}
                                    </Label>
                                    <RadioGroup value={vm.refundType} onValueChange={vm.setRefundType}>
                                          <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="None" id="cancel-refund-none" />
                                                <Label htmlFor="cancel-refund-none" className="text-sm font-normal">
                                                      {t("entSubscriptions.noRefund") || "No Refund"}
                                                </Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="Full" id="cancel-refund-full" />
                                                <Label htmlFor="cancel-refund-full" className="text-sm font-normal">
                                                      {t("entSubscriptions.fullRefund") || "Full Refund"}
                                                </Label>
                                          </div>
                                          <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="ProRata" id="cancel-refund-prorata" />
                                                <Label htmlFor="cancel-refund-prorata" className="text-sm font-normal">
                                                      {t("entSubscriptions.proRataRefund") || "Pro-rata Refund (remaining time)"}
                                                </Label>
                                          </div>
                                    </RadioGroup>
                              </div>

                              {/* Custom amount — only visible for ProRata */}
                              {vm.refundType === "ProRata" && (
                                    <div className="space-y-2">
                                          <Label className="text-sm">
                                                {t("entSubscriptions.customRefundAmount") || "Custom Amount (optional — leave empty for auto-calculate)"}
                                          </Label>
                                          <Input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={vm.customRefundAmount}
                                                onChange={(e) => vm.setCustomRefundAmount(e.target.value)}
                                                placeholder={t("entSubscriptions.customAmountPlaceholder") || "e.g., 50.00"}
                                                className="font-mono"
                                          />
                                          <p className="text-xs text-muted-foreground">
                                                {t("entSubscriptions.customAmountHint") || "If empty, the system auto-calculates based on remaining subscription time."}
                                          </p>
                                    </div>
                              )}
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => vm.setShowCancelDialog(false)}>
                                    {t("common.cancel")}
                              </Button>
                              <Button
                                    variant="destructive"
                                    onClick={vm.submitCancel}
                                    disabled={vm.isCanceling}
                              >
                                    {vm.isCanceling && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    {t("entSubscriptions.cancel") || "Cancel Subscription"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}

/* ============================================
 * CONVERT TRIAL DIALOG
 * ============================================ */

function ConvertDialog({
      vm,
      editionsVm,
}: {
      vm: ReturnType<typeof useSubscriptionsCrudAdapter>;
      editionsVm: ReturnType<typeof useEditionsViewModel>;
}) {
      const { t } = useI18n();
      return (
            <Dialog open={vm.showConvertDialog} onOpenChange={vm.setShowConvertDialog}>
                  <DialogContent>
                        <DialogHeader>
                              <DialogTitle>{t("entSubscriptions.convertTrial") || "Convert Trial"}</DialogTitle>
                              <DialogDescription>
                                    {t("entSubscriptions.convertDesc") || "Convert this trial into a paid subscription."}
                              </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                    <Label>{t("tenant.subscriptionType")}</Label>
                                    {(() => {
                                          // Get the current subscription's edition billing controls
                                          const activeSubEditionId = vm.items?.find(
                                                (s: SubscriptionListItem) => s.status === "Active" || s.status === "Trialing"
                                          )?.editionId;
                                          const selectedEd = activeSubEditionId
                                                ? (editionsVm.items ?? []).find((ed) => ed.id === activeSubEditionId)
                                                : null;
                                          return (
                                                <Select value={vm.convertType} onValueChange={vm.setConvertType}>
                                                      <SelectTrigger><SelectValue /></SelectTrigger>
                                                      <SelectContent>
                                                            {(!selectedEd || selectedEd.data.allowMonthly) && (
                                                                  <SelectItem value="Monthly">{t("entSubscriptions.monthly")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowYearly) && (
                                                                  <SelectItem value="Yearly">{t("entSubscriptions.yearly")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowLifetime) && (
                                                                  <SelectItem value="Lifetime">{t("entSubscriptions.lifetime")}</SelectItem>
                                                            )}
                                                      </SelectContent>
                                                </Select>
                                          );
                                    })()}
                              </div>
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => vm.setShowConvertDialog(false)}>
                                    {t("common.cancel")}
                              </Button>
                              <Button onClick={vm.submitConvert} disabled={vm.isConverting}>
                                    {vm.isConverting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    {t("entSubscriptions.convertTrial") || "Convert"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}

/* ============================================
 * CHECKOUT DIALOG (Payment Link)
 * ============================================ */

function CheckoutDialog({
      vm,
}: {
      vm: ReturnType<typeof useSubscriptionsCrudAdapter>;
}) {
      const { t } = useI18n();

      const handleCopyLink = useCallback(() => {
            if (vm.checkoutUrl) {
                  navigator.clipboard.writeText(vm.checkoutUrl);
            }
      }, [vm.checkoutUrl]);

      return (
            <Dialog open={vm.showCheckoutDialog} onOpenChange={vm.setShowCheckoutDialog}>
                  <DialogContent className="max-w-md">
                        <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                    {t("billing.dialogs.checkoutTitle") || "Payment Link Generated"}
                              </DialogTitle>
                              <DialogDescription>
                                    {t("billing.dialogs.checkoutDescription") || "Share this payment link with the tenant."}
                              </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                              <div className="flex items-center gap-2 rounded-lg bg-muted/50 border p-3">
                                    <Input
                                          readOnly
                                          value={vm.checkoutUrl}
                                          className="flex-1 text-xs bg-transparent border-0 h-auto p-0 focus-visible:ring-0"
                                    />
                              </div>
                        </div>

                        <DialogFooter className="gap-2 sm:gap-0">
                              <Button variant="outline" onClick={handleCopyLink} className="gap-2">
                                    <Copy className="h-4 w-4" />
                                    {t("billing.actions.copyLink") || "Copy Link"}
                              </Button>
                              <Button
                                    onClick={() => window.open(vm.checkoutUrl, "_blank")}
                                    className="gap-2"
                              >
                                    <ExternalLink className="h-4 w-4" />
                                    {t("billing.actions.openLink") || "Open Link"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}

/* ============================================
 * CANCEL STRIPE DIALOG
 * ============================================ */

function CancelStripeDialog({
      vm,
}: {
      vm: ReturnType<typeof useSubscriptionsCrudAdapter>;
}) {
      const { t } = useI18n();

      return (
            <Dialog open={vm.showCancelStripeDialog} onOpenChange={vm.setShowCancelStripeDialog}>
                  <DialogContent className="max-w-md">
                        <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-destructive">
                                    <XSquare className="h-5 w-5" />
                                    {t("billing.dialogs.cancelTitle") || "Cancel Stripe Subscription"}
                              </DialogTitle>
                              <DialogDescription>
                                    {t("billing.dialogs.cancelDescription") || "Choose how you want to cancel."}
                              </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                              <RadioGroup
                                    value={vm.cancelImmediately ? "immediately" : "period-end"}
                                    onValueChange={(val) => vm.setCancelImmediately(val === "immediately")}
                              >
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                          <RadioGroupItem value="period-end" id="cancel-period-end" />
                                          <Label htmlFor="cancel-period-end" className="cursor-pointer">
                                                {t("billing.actions.cancelAtPeriodEnd") || "Cancel at Period End"}
                                          </Label>
                                    </div>
                                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                                          <RadioGroupItem value="immediately" id="cancel-immediately" />
                                          <Label htmlFor="cancel-immediately" className="cursor-pointer text-destructive">
                                                {t("billing.actions.cancelImmediately") || "Cancel Immediately"}
                                          </Label>
                                    </div>
                              </RadioGroup>
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => vm.setShowCancelStripeDialog(false)}>
                                    {t("common.cancel")}
                              </Button>
                              <Button
                                    variant="destructive"
                                    onClick={vm.submitCancelStripe}
                                    disabled={vm.isCancelingStripe}
                              >
                                    {vm.isCancelingStripe && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    {t("billing.actions.cancelStripe") || "Cancel Stripe"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
