/**
 * Subscriptions View
 *
 * Tenant-scoped view showing subscription history with assign/change/revoke actions.
 * Uses GenericCrudView with CrudConfig for the table.
 * Follows EditionsView pattern: columns defined in View (since ViewModel is .ts).
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
import { Label } from "@core/ui/label";
import { Loader2, Plus, RefreshCw, XCircle } from "lucide-react";
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

/** Adapts our custom ViewModel to the GenericCrudView viewModel shape */
function useSubscriptionsCrudAdapter(tenantId: string) {
      const vm = useSubscriptionsViewModel(tenantId);

      return {
            // Spread ViewModel first (all dialog state, form state, etc.)
            ...vm,

            // Override with GenericCrudView-specific fields
            loading: vm.isLoading,
            error: vm.error ? (vm.error as Error).message : null,
            refresh: () => { /* handled by query invalidation */ },
            refreshItems: () => { /* handled by query invalidation */ },
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
                              actions.push({
                                    label: t("entitlements.subscriptions.change"),
                                    icon: <RefreshCw className="h-4 w-4" />,
                                    variant: "outline",
                                    onClick: async () => vm.setShowChangeDialog(true),
                              });
                        } else {
                              actions.push({
                                    label: t("entitlements.subscriptions.assign"),
                                    icon: <Plus className="h-4 w-4" />,
                                    variant: "default",
                                    onClick: async () => vm.setShowAssignDialog(true),
                              });
                        }
                        return actions;
                  })(),

                  customFooterContent: (
                        <>
                              <AssignDialog vm={vm} editionsVm={editionsVm} t={t} />
                              <ChangeDialog vm={vm} editionsVm={editionsVm} t={t} />
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

                              <div className="space-y-2">
                                    <Label>{t("tenant.subscriptionType")}</Label>
                                    <Select value={vm.subscriptionType} onValueChange={vm.setSubscriptionType}>
                                          <SelectTrigger>
                                                <SelectValue />
                                          </SelectTrigger>
                                          <SelectContent>
                                                <SelectItem value="Lifetime">{t("entitlements.subscriptions.lifetime")}</SelectItem>
                                                <SelectItem value="Trial">{t("entitlements.subscriptions.trial")}</SelectItem>
                                                <SelectItem value="Monthly">{t("entitlements.subscriptions.monthly")}</SelectItem>
                                                <SelectItem value="Yearly">{t("entitlements.subscriptions.yearly")}</SelectItem>
                                          </SelectContent>
                                    </Select>
                              </div>

                              {vm.subscriptionType !== "Lifetime" && (
                                    <div className="space-y-2">
                                          <Label>{t("entitlements.subscriptions.endDate") || "End Date"}</Label>
                                          <Input
                                                type="date"
                                                value={vm.endDate}
                                                onChange={(e) => vm.setEndDate(e.target.value)}
                                          />
                                          <p className="text-xs text-muted-foreground">
                                                {vm.subscriptionType === "Trial"
                                                      ? (t("entitlements.subscriptions.trialEndDateHint") || "Default: 14 days from today")
                                                      : vm.subscriptionType === "Monthly"
                                                            ? (t("entitlements.subscriptions.monthlyEndDateHint") || "Default: 30 days from today")
                                                            : (t("entitlements.subscriptions.yearlyEndDateHint") || "Default: 365 days from today")}
                                          </p>
                                    </div>
                              )}
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => vm.setShowAssignDialog(false)}>
                                    {t("common.cancel")}
                              </Button>
                              <Button
                                    onClick={vm.submitAssign}
                                    disabled={!vm.selectedEditionId || vm.isAssigning}
                              >
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
                        </div>

                        <DialogFooter>
                              <Button variant="outline" onClick={() => vm.setShowChangeDialog(false)}>
                                    {t("common.cancel")}
                              </Button>
                              <Button
                                    onClick={vm.submitChange}
                                    disabled={!vm.selectedEditionId || vm.isChanging}
                              >
                                    {vm.isChanging && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                                    {t("entitlements.subscriptions.change")}
                              </Button>
                        </DialogFooter>
                  </DialogContent>
            </Dialog>
      );
}
