/**
 * Subscriptions View
 *
 * Tenant-scoped view showing subscription history with full lifecycle actions:
 * Assign, Change, Revoke, Suspend, Resume, Cancel, Convert Trial, Resync.
 */
"use client";

import { useMemo } from "react";
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
import {
      Loader2, Plus, RefreshCw, XCircle, PauseCircle, PlayCircle,
      Ban, ArrowRightLeft, RotateCcw, Shield, Tag,
} from "lucide-react";
import { format } from "date-fns";
import type { SubscriptionListItem } from "../../domain/entities/Subscription";

/* ============================================
 * BADGE VARIANT MAPS
 * ============================================ */

const STATUS_VARIANTS: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      Active: "default",
      Trialing: "secondary",
      Canceled: "destructive",
      Expired: "outline",
      Suspended: "destructive",
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
      };
}

/* ============================================
 * VIEW
 * ============================================ */

interface SubscriptionsViewProps {
      tenantId: string;
}

export function SubscriptionsView({ tenantId }: SubscriptionsViewProps) {
      const { t, language } = useI18n();
      const vm = useSubscriptionsCrudAdapter(tenantId);
      const editionsVm = useEditionsViewModel();

      const config: CrudConfig<SubscriptionListItem> = useMemo(
            () => ({
                  titleKey: "entitlements.subscriptions.title",
                  subtitleKey: "entitlements.subscriptions.description",
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
                                                      {t("entitlements.subscriptions.downgraded") || "Downgraded"}
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
                                          {t(`entitlements.subscriptions.${value.toLowerCase()}`) || value}
                                    </Badge>
                              ),
                        },
                        {
                              key: "status",
                              label: t("common.status"),
                              render: (value: string) => (
                                    <Badge variant={STATUS_VARIANTS[value] ?? "outline"}>
                                          {t(`entitlements.subscriptions.${value.toLowerCase()}`) || value}
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
                              label: t("entitlements.subscriptions.endDate") || "End Date",
                              render: (value?: string) =>
                                    value ? format(new Date(value), "MMM d, yyyy") : "∞",
                              hideOnMobile: true,
                        },
                        {
                              key: "expiryBehavior",
                              label: t("entitlements.subscriptions.expiryBehavior") || "On Expiry",
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
                              key: "startDate",
                              label: t("common.createdAt"),
                              render: (value: string) =>
                                    value ? format(new Date(value), "MMM d, yyyy") : "-",
                              hideOnMobile: true,
                        },
                  ],

                  getActions: (): CrudAction<SubscriptionListItem>[] => [
                        {
                              label: t("entitlements.subscriptions.revoke"),
                              icon: <XCircle className="h-4 w-4" />,
                              variant: "ghost",
                              className: "text-destructive",
                              onClick: (item: SubscriptionListItem) => vm.revokeSubscription(item.id),
                              show: (item: SubscriptionListItem) =>
                                    item.status === "Active" || item.status === "Trialing",
                              loading: vm.isRevoking,
                              confirmTitle: t("entitlements.subscriptions.revoke"),
                              confirmDescription:
                                    t("entitlements.subscriptions.revokeDesc") ||
                                    "Are you sure you want to revoke this subscription?",
                              confirmVariant: "destructive",
                        },
                  ],

                  customActions: (() => {
                        const actions: CustomAction[] = [];

                        if (vm.hasActiveSubscription) {
                              // Change plan
                              actions.push({
                                    label: t("entitlements.subscriptions.change"),
                                    icon: <ArrowRightLeft className="h-4 w-4" />,
                                    variant: "outline",
                                    onClick: async () => vm.setShowChangeDialog(true),
                              });
                              // Suspend
                              actions.push({
                                    label: t("entitlements.subscriptions.suspend") || "Suspend",
                                    icon: <PauseCircle className="h-4 w-4" />,
                                    variant: "outline",
                                    onClick: async () => vm.setShowSuspendDialog(true),
                              });
                              // Cancel
                              actions.push({
                                    label: t("entitlements.subscriptions.cancel") || "Cancel",
                                    icon: <Ban className="h-4 w-4" />,
                                    variant: "outline",
                                    onClick: async () => vm.setShowCancelDialog(true),
                              });
                              // Convert Trial (only if trialing)
                              if (vm.isTrialing) {
                                    actions.push({
                                          label: t("entitlements.subscriptions.convertTrial") || "Convert Trial",
                                          icon: <Shield className="h-4 w-4" />,
                                          variant: "default",
                                          onClick: async () => vm.setShowConvertDialog(true),
                                    });
                              }
                        } else if (vm.hasSuspendedSubscription) {
                              // Resume
                              actions.push({
                                    label: t("entitlements.subscriptions.resume") || "Resume",
                                    icon: <PlayCircle className="h-4 w-4" />,
                                    variant: "default",
                                    onClick: async () => vm.resumeSubscription(),
                              });
                        } else {
                              // No active subscription — assign
                              actions.push({
                                    label: t("entitlements.subscriptions.assign"),
                                    icon: <Plus className="h-4 w-4" />,
                                    variant: "default",
                                    onClick: async () => vm.setShowAssignDialog(true),
                              });
                        }

                        // Resync (always available)
                        actions.push({
                              label: t("entitlements.subscriptions.resync") || "Resync Permissions",
                              icon: <RotateCcw className="h-4 w-4" />,
                              variant: "outline",
                              onClick: async () => vm.resyncPermissions(),
                        });

                        return actions;
                  })(),

                  customFooterContent: (
                        <>
                              <AssignDialog vm={vm} editionsVm={editionsVm} t={t} />
                              <ChangeDialog vm={vm} editionsVm={editionsVm} t={t} />
                              <SuspendDialog vm={vm} t={t} />
                              <CancelDialog vm={vm} t={t} />
                              <ConvertDialog vm={vm} editionsVm={editionsVm} t={t} />
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
      t,
}: {
      vm: ReturnType<typeof useSubscriptionsCrudAdapter>;
      editionsVm: ReturnType<typeof useEditionsViewModel>;
      t: (key: string, params?: Record<string, any>) => string;
}) {
      return (
            <Dialog open={vm.showAssignDialog} onOpenChange={vm.setShowAssignDialog}>
                  <DialogContent>
                        <DialogHeader>
                              <DialogTitle>{t("entitlements.subscriptions.assign")}</DialogTitle>
                              <DialogDescription>{t("entitlements.subscriptions.assignDesc")}</DialogDescription>
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
                                                                  <SelectItem value="Lifetime">{t("entitlements.subscriptions.lifetime")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowTrial) && (
                                                                  <SelectItem value="Trial">{t("entitlements.subscriptions.trial")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowMonthly) && (
                                                                  <SelectItem value="Monthly">{t("entitlements.subscriptions.monthly")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowYearly) && (
                                                                  <SelectItem value="Yearly">{t("entitlements.subscriptions.yearly")}</SelectItem>
                                                            )}
                                                      </SelectContent>
                                                </Select>
                                          );
                                    })()}
                              </div>

                              {/* End Date */}
                              {vm.subscriptionType !== "Lifetime" && (
                                    <div className="space-y-2">
                                          <Label>{t("entitlements.subscriptions.endDate") || "End Date"}</Label>
                                          <DatePicker
                                                value={vm.endDate}
                                                onChange={(v) => vm.setEndDate(v)}
                                                placeholder={t("entitlements.subscriptions.endDate") || "End Date"}
                                          />
                                    </div>
                              )}

                              {/* Expiry Behavior */}
                              {vm.subscriptionType !== "Lifetime" && (
                                    <div className="space-y-2">
                                          <Label>{t("entitlements.subscriptions.expiryBehavior") || "On Expiry"}</Label>
                                          <Select value={vm.expiryBehavior} onValueChange={vm.setExpiryBehavior}>
                                                <SelectTrigger><SelectValue /></SelectTrigger>
                                                <SelectContent>
                                                      <SelectItem value="Fallback">
                                                            ↓ {t("entitlements.subscriptions.fallback") || "Fallback to lower edition"}
                                                      </SelectItem>
                                                      <SelectItem value="Suspend">
                                                            ⏸ {t("entitlements.subscriptions.suspendOnExpiry") || "Suspend tenant"}
                                                      </SelectItem>
                                                </SelectContent>
                                          </Select>
                                    </div>
                              )}

                              {/* Promo Code */}
                              <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5">
                                          <Tag className="h-3.5 w-3.5 text-primary" />
                                          {t("entitlements.promotions.promoCode") || "Promo Code"}
                                    </Label>
                                    <Input
                                          value={vm.promoCode}
                                          onChange={(e) => vm.setPromoCode(e.target.value.toUpperCase())}
                                          placeholder={t("entitlements.promotions.promoCodePlaceholder") || "Enter promo code (optional)"}
                                          className="font-mono uppercase"
                                    />
                              </div>

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
                                    {t("entitlements.subscriptions.assign")}
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
      t,
}: {
      vm: ReturnType<typeof useSubscriptionsCrudAdapter>;
      editionsVm: ReturnType<typeof useEditionsViewModel>;
      t: (key: string, params?: Record<string, any>) => string;
}) {
      return (
            <Dialog open={vm.showChangeDialog} onOpenChange={vm.setShowChangeDialog}>
                  <DialogContent>
                        <DialogHeader>
                              <DialogTitle>{t("entitlements.subscriptions.change")}</DialogTitle>
                              <DialogDescription>{t("entitlements.subscriptions.changeDesc")}</DialogDescription>
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
                                                                  <SelectItem value="Lifetime">{t("entitlements.subscriptions.lifetime")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowTrial) && (
                                                                  <SelectItem value="Trial">{t("entitlements.subscriptions.trial")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowMonthly) && (
                                                                  <SelectItem value="Monthly">{t("entitlements.subscriptions.monthly")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowYearly) && (
                                                                  <SelectItem value="Yearly">{t("entitlements.subscriptions.yearly")}</SelectItem>
                                                            )}
                                                      </SelectContent>
                                                </Select>
                                          );
                                    })()}
                              </div>

                              {/* Promo Code */}
                              <div className="space-y-2">
                                    <Label className="flex items-center gap-1.5">
                                          <Tag className="h-3.5 w-3.5 text-primary" />
                                          {t("entitlements.promotions.promoCode") || "Promo Code"}
                                    </Label>
                                    <Input
                                          value={vm.promoCode}
                                          onChange={(e) => vm.setPromoCode(e.target.value.toUpperCase())}
                                          placeholder={t("entitlements.promotions.promoCodePlaceholder") || "Enter promo code (optional)"}
                                          className="font-mono uppercase"
                                    />
                              </div>

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
                                    {t("entitlements.subscriptions.change")}
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
      t,
}: {
      vm: ReturnType<typeof useSubscriptionsCrudAdapter>;
      t: (key: string, params?: Record<string, any>) => string;
}) {
      return (
            <Dialog open={vm.showSuspendDialog} onOpenChange={vm.setShowSuspendDialog}>
                  <DialogContent>
                        <DialogHeader>
                              <DialogTitle>{t("entitlements.subscriptions.suspend") || "Suspend Subscription"}</DialogTitle>
                              <DialogDescription>
                                    {t("entitlements.subscriptions.suspendDesc") || "Temporarily suspend this tenant's subscription."}
                              </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                    <Label>{t("entitlements.subscriptions.reason") || "Reason"}</Label>
                                    <Textarea
                                          value={vm.suspendReason}
                                          onChange={(e) => vm.setSuspendReason(e.target.value)}
                                          placeholder={t("entitlements.subscriptions.reasonPlaceholder") || "e.g., Payment overdue, Terms violation..."}
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
                                          {t("entitlements.subscriptions.useFallback") || "Downgrade to fallback edition instead of full suspend"}
                                    </Label>
                              </div>
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
                                    {t("entitlements.subscriptions.suspend") || "Suspend"}
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
      t,
}: {
      vm: ReturnType<typeof useSubscriptionsCrudAdapter>;
      t: (key: string, params?: Record<string, any>) => string;
}) {
      return (
            <Dialog open={vm.showCancelDialog} onOpenChange={vm.setShowCancelDialog}>
                  <DialogContent>
                        <DialogHeader>
                              <DialogTitle>{t("entitlements.subscriptions.cancel") || "Cancel Subscription"}</DialogTitle>
                              <DialogDescription>
                                    {t("entitlements.subscriptions.cancelDesc") || "Permanently cancel this subscription."}
                              </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                    <Label>{t("entitlements.subscriptions.reason") || "Reason (optional)"}</Label>
                                    <Textarea
                                          value={vm.cancelReason}
                                          onChange={(e) => vm.setCancelReason(e.target.value)}
                                          placeholder={t("entitlements.subscriptions.cancelReasonPlaceholder") || "Why are you canceling?"}
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
                                          {t("entitlements.subscriptions.useFallback") || "Downgrade to fallback edition instead of full cancel"}
                                    </Label>
                              </div>
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
                                    {t("entitlements.subscriptions.cancel") || "Cancel Subscription"}
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
      t,
}: {
      vm: ReturnType<typeof useSubscriptionsCrudAdapter>;
      editionsVm: ReturnType<typeof useEditionsViewModel>;
      t: (key: string, params?: Record<string, any>) => string;
}) {
      return (
            <Dialog open={vm.showConvertDialog} onOpenChange={vm.setShowConvertDialog}>
                  <DialogContent>
                        <DialogHeader>
                              <DialogTitle>{t("entitlements.subscriptions.convertTrial") || "Convert Trial"}</DialogTitle>
                              <DialogDescription>
                                    {t("entitlements.subscriptions.convertDesc") || "Convert this trial into a paid subscription."}
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
                                                                  <SelectItem value="Monthly">{t("entitlements.subscriptions.monthly")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowYearly) && (
                                                                  <SelectItem value="Yearly">{t("entitlements.subscriptions.yearly")}</SelectItem>
                                                            )}
                                                            {(!selectedEd || selectedEd.data.allowLifetime) && (
                                                                  <SelectItem value="Lifetime">{t("entitlements.subscriptions.lifetime")}</SelectItem>
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
                                    {t("entitlements.subscriptions.convertTrial") || "Convert"}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
