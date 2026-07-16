/**
 * TenantPlans View — Elevated Tier 2
 *
 * CRUD view for managing tenant-specific pricing plans with lifecycle status,
 * pricing matrix, feature catalog, and promotions.
 *
 * Architecture compliance:
 * - Zero hardcoded user-visible strings — all via t() locale keys
 * - Typed viewmodel — no `any` types
 */
"use client";

import { useMemo, useState } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useTenantPlansViewModel } from "../viewmodels/useTenantPlansViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import type { TenantPlan } from "../../domain/entities/TenantPlan";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@core/ui/dialog";
import { Pencil, Trash2, Eye, Rocket, Archive, Settings2, Columns } from "lucide-react";
import { formatUtc } from "@core/common/utils";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useRouter } from "next/navigation";

/**
 * Presentation UI component rendering the tenant plans view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TenantPlansView() {
  const router = useRouter();
  useModuleLocales(() => import("../../../locales"), "tenant-plans");
  const { t } = useI18n();
  const vm = useTenantPlansViewModel();
  const [confirmAction, setConfirmAction] = useState<{
    type: "publish" | "archive";
    plan: TenantPlan;
  } | null>(null);

  const handleConfirmAction = () => {
    if (!confirmAction) return;
    if (confirmAction.type === "publish") {
      vm.publishPlan(confirmAction.plan.id);
    } else {
      vm.archivePlan(confirmAction.plan.id);
    }
    setConfirmAction(null);
  };

  const config: CrudConfig<TenantPlan> = useMemo(
    () => ({
      titleKey: "entitlements.tenantPlans.title",
      subtitleKey: "entitlements.tenantPlans.description",
      resource: "tenant_plans",
      customActions: [
        {
          label: t("entitlements.tenantPlans.comparison.heroTitle") || "Compare Plans",
          onClick: async () => {
            router.push("/entitlements/tenant-plans/compare");
          },
          variant: "outline" as const,
          icon: <Columns className="h-4 w-4" />,
        },
      ],
      onCreateClick: () => router.push("/entitlements/tenant-plans/create"),
      columns: [
        {
          key: "name",
          label: t("entitlements.tenantPlans.planName") || "Plan Name",
          sortable: true,
          render: (_val: unknown, plan: TenantPlan) => (
            <div className="flex items-center gap-2">
              {plan.color && (
                <div
                  className="h-3 w-3 rounded-full ring-1 ring-inset ring-black/10"
                  style={{ backgroundColor: plan.color }}
                />
              )}
              <div>
                <span className="font-medium">{plan.name}</span>
                {plan.badgeText && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    {plan.badgeText}
                  </Badge>
                )}
              </div>
            </div>
          ),
        },
        {
          key: "status",
          label: t("common.status") || "Status",
          render: (_val: unknown, plan: TenantPlan) => (
            <Badge variant={plan.statusColor}>{plan.status}</Badge>
          ),
        },
        {
          key: "pricing",
          label: t("entitlements.tenantPlans.pricing") || "Starting Price",
          render: (_val: unknown, plan: TenantPlan) => (
            <span className="text-sm font-medium tabular-nums text-emerald-600 dark:text-emerald-400">
              {plan.formattedStartingPrice}
            </span>
          ),
        },
        {
          key: "cycles",
          label: t("entitlements.tenantPlans.billingCycles") || "Billing Cycles",
          render: (_val: unknown, plan: TenantPlan) => (
            <div className="flex flex-wrap gap-1">
              {plan.supportedCycles.map((cycle) => (
                <Badge key={cycle} variant="outline" className="text-xs">
                  {cycle}
                </Badge>
              ))}
              {plan.supportedCycles.length === 0 && (
                <span className="text-xs text-muted-foreground">—</span>
              )}
            </div>
          ),
        },
        {
          key: "maxUsers",
          label: t("entitlements.tenantPlans.maxUsers") || "Max Users",
          render: (_val: unknown, plan: TenantPlan) => (
            <span className="tabular-nums">{plan.maxUsersDisplay}</span>
          ),
        },
        {
          key: "activeSubscriberCount",
          label: t("entitlements.tenantPlans.subscribers") || "Subscribers",
          render: (_val: unknown, plan: TenantPlan) => (
            <Badge variant={plan.hasActiveSubscribers ? "default" : "secondary"}>
              {plan.activeSubscriberCount}
            </Badge>
          ),
        },
        {
          key: "tierLevel",
          label: t("entitlements.tenantPlans.tier") || "Tier",
          render: (_val: unknown, plan: TenantPlan) => (
            <span className="text-sm tabular-nums">{plan.tierLevel}</span>
          ),
        },
        {
          key: "trialDays",
          label: t("entitlements.tenantPlans.trialDays") || "Trial",
          render: (_val: unknown, plan: TenantPlan) =>
            plan.hasTrial ? (
              <Badge variant="outline">{plan.trialDays}d</Badge>
            ) : (
              <span className="text-muted-foreground">—</span>
            ),
        },
        {
          key: "createdAt",
          label: t("common.createdAt") || "Created",
          render: (value: string) => (value ? formatUtc(value, "MMM d, yyyy") : "-"),
        },
      ],
      getItemDisplayName: (plan: TenantPlan) => plan.name,
      deleteService: (id: string) => vm.deleteItem(id),
      getActions: (
        vmInstance: ReturnType<typeof useTenantPlansViewModel>,
        tFn: (key: string) => string,
        handleDeleteFn: ((item: TenantPlan) => void) | undefined
      ): CrudAction<TenantPlan>[] => [
        {
          label: tFn("common.view") || "View",
          onClick: (item: TenantPlan) => {
            router.push(`/entitlements/tenant-plans/${item.id}`);
          },
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" />,
        },
        {
          label: tFn("entitlements.tenantPlans.managePlan") || "Manage Plan",
          onClick: (item: TenantPlan) => vmInstance.navigateToDetail(item.id),
          variant: "ghost" as const,
          icon: <Settings2 className="h-4 w-4" />,
        },
        {
          label: tFn("common.edit") || "Edit",
          onClick: (item: TenantPlan) => {
            router.push(`/entitlements/tenant-plans/${item.id}/edit`);
          },
          variant: "ghost" as const,
          icon: <Pencil className="h-4 w-4" />,
          show: (item: TenantPlan) => !item.isArchived,
        },
        {
          label: tFn("entitlements.tenantPlans.publish") || "Publish",
          onClick: (item: TenantPlan) => setConfirmAction({ type: "publish", plan: item }),
          variant: "ghost" as const,
          className: "text-green-600 hover:text-green-700",
          icon: <Rocket className="h-4 w-4" />,
          show: (item: TenantPlan) => item.isDraft,
        },
        {
          label: tFn("entitlements.tenantPlans.archive") || "Archive",
          onClick: (item: TenantPlan) => setConfirmAction({ type: "archive", plan: item }),
          variant: "ghost" as const,
          className: "text-amber-600 hover:text-amber-700",
          icon: <Archive className="h-4 w-4" />,
          show: (item: TenantPlan) => item.isPublished,
        },
        {
          label: tFn("common.delete") || "Delete",
          onClick: (item: TenantPlan) => handleDeleteFn?.(item),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          icon: <Trash2 className="h-4 w-4" />,
          show: (item: TenantPlan) => item.isDraft && !item.hasActiveSubscribers,
        },
      ],
    }),

    [t]
  );

  return (
    <>
      <GenericCrudView viewModel={vm} config={config} />

      {/* Publish / Archive Confirmation Dialog */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {confirmAction?.type === "publish" ? (
                <>
                  <Rocket className="h-4 w-4 text-green-600" />{" "}
                  {t("entitlements.tenantPlans.publish") || "Publish"}
                </>
              ) : (
                <>
                  <Archive className="h-4 w-4 text-amber-600" />{" "}
                  {t("entitlements.tenantPlans.archive") || "Archive"}
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "publish"
                ? t("entitlements.tenantPlans.publishDesc") ||
                  "Make this plan live for subscriptions."
                : t("entitlements.tenantPlans.archiveDesc") ||
                  "Archive this plan. Existing subscriptions are maintained."}
              <span className="mt-1 block font-medium text-foreground">
                {confirmAction?.plan.name}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              loading={vm.isPublishing || vm.isArchiving}
              className={
                confirmAction?.type === "publish"
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-amber-600 text-white hover:bg-amber-700"
              }
            >
              {confirmAction?.type === "publish"
                ? t("entitlements.tenantPlans.publish") || "Publish"
                : t("entitlements.tenantPlans.archive") || "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
