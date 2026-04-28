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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@core/ui/dialog";
import { Pencil, Trash2, Eye, Rocket, Archive, Settings2, Columns } from "lucide-react";
import { format } from "date-fns";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useRouter } from "next/navigation";

export function TenantPlansView() {
  const router = useRouter();
  useModuleLocales(() => import("../../../locales"), "tenant-plans");
  const { t } = useI18n();
  const vm = useTenantPlansViewModel();
  const [confirmAction, setConfirmAction] = useState<{ type: "publish" | "archive"; plan: TenantPlan } | null>(null);

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
            <span className="tabular-nums text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {plan.formattedStartingPrice}
            </span>
          ),
        },
        {
          key: "cycles",
          label: t("entitlements.tenantPlans.billingCycles") || "Billing Cycles",
          render: (_val: unknown, plan: TenantPlan) => (
            <div className="flex gap-1 flex-wrap">
              {plan.supportedCycles.map((cycle) => (
                <Badge key={cycle} variant="outline" className="text-xs">
                  {cycle}
                </Badge>
              ))}
              {plan.supportedCycles.length === 0 && (
                <span className="text-muted-foreground text-xs">—</span>
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
            <span className="tabular-nums text-sm">{plan.tierLevel}</span>
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
          render: (value: string) =>
            value ? format(new Date(value), "MMM d, yyyy") : "-",
        },
      ],
      createFields: [
        {
          name: "name",
          label: t("entitlements.tenantPlans.planName") || "Plan Name",
          type: "text" as const,
          required: true,
          placeholder: t("entitlements.tenantPlans.namePlaceholder") || "e.g. Gold, Premium, Enterprise",
        },
        {
          name: "displayNameEn",
          label: t("entitlements.tenantPlans.displayNameEn") || "Display Name (EN)",
          type: "text" as const,
          placeholder: t("entitlements.tenantPlans.displayNameEnPlaceholder") || "Customer-facing name in English",
        },
        {
          name: "displayNameAr",
          label: t("entitlements.tenantPlans.displayNameAr") || "Display Name (AR)",
          type: "text" as const,
          placeholder: t("entitlements.tenantPlans.displayNameArPlaceholder") || "اسم العرض بالعربية",
        },
        {
          name: "description",
          label: t("common.description") || "Description",
          type: "textarea" as const,
          placeholder: t("entitlements.tenantPlans.descriptionPlaceholder") || "Brief description of this plan...",
        },
        {
          name: "tagline",
          label: t("entitlements.tenantPlans.tagline") || "Tagline",
          type: "text" as const,
          placeholder: t("entitlements.tenantPlans.taglinePlaceholder") || "Short marketing tagline",
        },
        {
          name: "isPublic",
          label: t("entitlements.tenantPlans.isPublic") || "Publicly Visible",
          type: "switch" as const,
          defaultValue: true,
        },
        {
          name: "allowMonthly",
          label: t("entitlements.tenantPlans.allowMonthly") || "Allow Monthly Billing",
          type: "switch" as const,
          defaultValue: true,
        },
        {
          name: "allowYearly",
          label: t("entitlements.tenantPlans.allowYearly") || "Allow Yearly Billing",
          type: "switch" as const,
          defaultValue: false,
        },
        {
          name: "allowLifetime",
          label: t("entitlements.tenantPlans.allowLifetime") || "Allow Lifetime Purchase",
          type: "switch" as const,
          defaultValue: false,
        },
        {
          name: "allowTrial",
          label: t("entitlements.tenantPlans.allowTrial") || "Allow Trial",
          type: "switch" as const,
          defaultValue: false,
        },
        {
          name: "trialDays",
          label: t("entitlements.tenantPlans.trialDays") || "Trial Days",
          type: "number" as const,
          min: 0,
          max: 365,
          defaultValue: 0,
          placeholder: "0",
        },
        {
          name: "maxUsers",
          label: t("entitlements.tenantPlans.maxUsers") || "Max Users (-1 = Unlimited)",
          type: "number" as const,
          min: -1,
          defaultValue: -1,
          placeholder: "-1",
        },
        {
          name: "tierLevel",
          label: t("entitlements.tenantPlans.tier") || "Tier Level",
          type: "number" as const,
          min: 0,
          defaultValue: 0,
        },
        {
          name: "sortOrder",
          label: t("entitlements.tenantPlans.sortOrder") || "Sort Order",
          type: "number" as const,
          min: 0,
          defaultValue: 0,
          placeholder: "0",
        },
      ],
      editFields: () => [
        {
          name: "name",
          label: t("entitlements.tenantPlans.planName") || "Plan Name",
          type: "text" as const,
          required: true,
        },
        {
          name: "displayNameEn",
          label: t("entitlements.tenantPlans.displayNameEn") || "Display Name (EN)",
          type: "text" as const,
        },
        {
          name: "displayNameAr",
          label: t("entitlements.tenantPlans.displayNameAr") || "Display Name (AR)",
          type: "text" as const,
        },
        {
          name: "description",
          label: t("common.description") || "Description",
          type: "textarea" as const,
        },
        {
          name: "tagline",
          label: t("entitlements.tenantPlans.tagline") || "Tagline",
          type: "text" as const,
        },
        {
          name: "isActive",
          label: t("common.active") || "Active",
          type: "switch" as const,
        },
        {
          name: "isPublic",
          label: t("entitlements.tenantPlans.isPublic") || "Publicly Visible",
          type: "switch" as const,
        },
        {
          name: "allowMonthly",
          label: t("entitlements.tenantPlans.allowMonthly") || "Allow Monthly",
          type: "switch" as const,
        },
        {
          name: "allowYearly",
          label: t("entitlements.tenantPlans.allowYearly") || "Allow Yearly",
          type: "switch" as const,
        },
        {
          name: "allowLifetime",
          label: t("entitlements.tenantPlans.allowLifetime") || "Allow Lifetime",
          type: "switch" as const,
        },
        {
          name: "allowTrial",
          label: t("entitlements.tenantPlans.allowTrial") || "Allow Trial",
          type: "switch" as const,
        },
        {
          name: "trialDays",
          label: t("entitlements.tenantPlans.trialDays") || "Trial Days",
          type: "number" as const,
          min: 0,
          max: 365,
        },
        {
          name: "maxUsers",
          label: t("entitlements.tenantPlans.maxUsers") || "Max Users (-1 = Unlimited)",
          type: "number" as const,
          min: -1,
        },
        {
          name: "tierLevel",
          label: t("entitlements.tenantPlans.tier") || "Tier Level",
          type: "number" as const,
          min: 0,
        },
        {
          name: "sortOrder",
          label: t("entitlements.tenantPlans.sortOrder") || "Sort Order",
          type: "number" as const,
          min: 0,
        },
      ],
      editInitialValues: (plan: TenantPlan) => ({
        name: plan.name,
        displayNameEn: plan.displayNameEn || "",
        displayNameAr: plan.displayNameAr || "",
        description: plan.description || "",
        tagline: plan.tagline || "",
        isActive: plan.isActive,
        isPublic: plan.isPublic,
        allowMonthly: plan.allowMonthly,
        allowYearly: plan.allowYearly,
        allowLifetime: plan.allowLifetime,
        allowTrial: plan.allowTrial,
        trialDays: plan.trialDays,
        maxUsers: plan.maxUsers,
        tierLevel: plan.tierLevel,
        sortOrder: plan.sortOrder,
      }),
      getItemDisplayName: (plan: TenantPlan) => plan.name,
      deleteService: (id: string) => vm.deleteItem(id),
      getActions: (vmInstance: ReturnType<typeof useTenantPlansViewModel>, tFn: (key: string) => string, handleDeleteFn: ((item: TenantPlan) => void) | undefined): CrudAction<TenantPlan>[] => [
        {
          label: tFn("common.view") || "View",
          onClick: (item: TenantPlan) => vmInstance.openViewModal(item),
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
          onClick: (item: TenantPlan) => vmInstance.openEditModal(item),
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
                <><Rocket className="h-4 w-4 text-green-600" /> {t("entitlements.tenantPlans.publish") || "Publish"}</>
              ) : (
                <><Archive className="h-4 w-4 text-amber-600" /> {t("entitlements.tenantPlans.archive") || "Archive"}</>
              )}
            </DialogTitle>
            <DialogDescription>
              {confirmAction?.type === "publish"
                ? t("entitlements.tenantPlans.publishDesc") || "Make this plan live for subscriptions."
                : t("entitlements.tenantPlans.archiveDesc") || "Archive this plan. Existing subscriptions are maintained."}
              <span className="block mt-1 font-medium text-foreground">
                {confirmAction?.plan.name}
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setConfirmAction(null)}>Cancel</Button>
            <Button
              onClick={handleConfirmAction}
              loading={vm.isPublishing || vm.isArchiving}
              className={confirmAction?.type === "publish" ? "bg-green-600 hover:bg-green-700 text-white" : "bg-amber-600 hover:bg-amber-700 text-white"}
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
