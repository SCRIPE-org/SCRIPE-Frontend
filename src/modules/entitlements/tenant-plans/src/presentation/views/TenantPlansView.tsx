/**
 * TenantPlans View
 *
 * CRUD view for managing tenant-specific pricing plans (Tier 2).
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useTenantPlansViewModel } from "../viewmodels/useTenantPlansViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import type { TenantPlan } from "../../domain/entities/TenantPlan";
import { Badge } from "@core/ui/badge";
import { Pencil, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";
import { useModuleLocales } from "@core/hooks/use-module-locales";

export function TenantPlansView() {
  useModuleLocales(() => import("../../../locales"), "tenant-plans");
  const { t } = useI18n();
  const vm = useTenantPlansViewModel();

  // Tenant context is resolved server-side from JWT — no client-side guard needed.

  const config: CrudConfig<TenantPlan> = useMemo(
    () => ({
      titleKey: "entitlements.tenantPlans.title",
      subtitleKey: "entitlements.tenantPlans.description",
      resource: "tenant_plans",
      columns: [
        {
          key: "name",
          label: t("entitlements.tenantPlans.planName") || "Plan Name",
          sortable: true,
        },
        {
          key: "price",
          label: t("entitlements.tenantPlans.price") || "Price",
          render: (_val: unknown, plan: TenantPlan) => (
            <span className="tabular-nums text-sm font-medium text-emerald-600 dark:text-emerald-400">
              {plan.formattedPrice}
              <span className="text-muted-foreground text-xs">
                /{plan.billingCycle === "Yearly" ? "yr" : plan.billingCycle === "Lifetime" ? "once" : "mo"}
              </span>
            </span>
          ),
        },
        {
          key: "billingCycle",
          label: t("entitlements.tenantPlans.billingCycle") || "Cycle",
          render: (_val: unknown, plan: TenantPlan) => (
            <Badge variant="outline">{plan.billingCycle}</Badge>
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
          key: "isActive",
          label: t("common.status") || "Status",
          render: (_val: unknown, plan: TenantPlan) => (
            <Badge variant={plan.isActive ? "success" : "destructive"}>
              {plan.isActive
                ? t("common.active") || "Active"
                : t("common.inactive") || "Inactive"}
            </Badge>
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
          name: "description",
          label: t("common.description") || "Description",
          type: "textarea" as const,
          placeholder: t("entitlements.tenantPlans.descriptionPlaceholder") || "Brief description of this plan...",
        },
        {
          name: "price",
          label: t("entitlements.tenantPlans.price") || "Price",
          type: "number" as const,
          required: true,
          min: 0,
          step: 0.01,
          placeholder: "29.99",
        },
        {
          name: "currency",
          label: t("entitlements.tenantPlans.currency") || "Currency",
          type: "select" as const,
          defaultValue: "USD",
          options: [
            { value: "USD", label: "USD" },
            { value: "EUR", label: "EUR" },
            { value: "GBP", label: "GBP" },
            { value: "SAR", label: "SAR" },
            { value: "AED", label: "AED" },
            { value: "EGP", label: "EGP" },
          ],
        },
        {
          name: "billingCycle",
          label: t("entitlements.tenantPlans.billingCycle") || "Billing Cycle",
          type: "select" as const,
          defaultValue: "Monthly",
          options: [
            { value: "Monthly", label: t("entitlements.tenantPlans.monthly") || "Monthly" },
            { value: "Yearly", label: t("entitlements.tenantPlans.yearly") || "Yearly" },
            { value: "Lifetime", label: t("entitlements.tenantPlans.lifetime") || "Lifetime" },
          ],
        },
        {
          name: "isPublic",
          label: t("entitlements.tenantPlans.isPublic") || "Publicly Visible",
          type: "switch" as const,
          defaultValue: true,
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
          name: "sortOrder",
          label: t("entitlements.tenantPlans.sortOrder") || "Sort Order",
          type: "number" as const,
          min: 0,
          defaultValue: 0,
          placeholder: "0",
        },
      ],
      editFields: (editingItem: TenantPlan) => [
        {
          name: "name",
          label: t("entitlements.tenantPlans.planName") || "Plan Name",
          type: "text" as const,
          required: true,
          placeholder: "e.g. Gold, Premium, Enterprise",
        },
        {
          name: "description",
          label: t("common.description") || "Description",
          type: "textarea" as const,
        },
        {
          name: "price",
          label: t("entitlements.tenantPlans.price") || "Price",
          type: "number" as const,
          required: true,
          min: 0,
          step: 0.01,
        },
        {
          name: "currency",
          label: t("entitlements.tenantPlans.currency") || "Currency",
          type: "select" as const,
          options: [
            { value: "USD", label: "USD" },
            { value: "EUR", label: "EUR" },
            { value: "GBP", label: "GBP" },
            { value: "SAR", label: "SAR" },
            { value: "AED", label: "AED" },
            { value: "EGP", label: "EGP" },
          ],
        },
        {
          name: "billingCycle",
          label: t("entitlements.tenantPlans.billingCycle") || "Billing Cycle",
          type: "select" as const,
          options: [
            { value: "Monthly", label: t("entitlements.tenantPlans.monthly") || "Monthly" },
            { value: "Yearly", label: t("entitlements.tenantPlans.yearly") || "Yearly" },
            { value: "Lifetime", label: t("entitlements.tenantPlans.lifetime") || "Lifetime" },
          ],
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
          name: "sortOrder",
          label: t("entitlements.tenantPlans.sortOrder") || "Sort Order",
          type: "number" as const,
          min: 0,
        },
      ],
      editInitialValues: (plan: TenantPlan) => ({
        name: plan.name,
        description: plan.description || "",
        price: plan.price,
        currency: plan.currency,
        billingCycle: plan.billingCycle,
        isActive: plan.isActive,
        isPublic: plan.isPublic,
        trialDays: plan.trialDays,
        maxUsers: plan.maxUsers,
        sortOrder: plan.sortOrder,
      }),
      getItemDisplayName: (plan: TenantPlan) => plan.name,
      deleteService: (id: string) => vm.deleteItem(id),
      getActions: (vmInstance: any, tFn: any, handleDeleteFn: any): CrudAction<TenantPlan>[] => [
        {
          label: tFn("common.view") || "View",
          onClick: (item: TenantPlan) => vmInstance.openViewModal(item),
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" />,
        },
        {
          label: tFn("common.edit") || "Edit",
          onClick: (item: TenantPlan) => vmInstance.openEditModal(item),
          variant: "ghost" as const,
          icon: <Pencil className="h-4 w-4" />,
        },
        {
          label: tFn("common.delete") || "Delete",
          onClick: (item: TenantPlan) => handleDeleteFn?.(item),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          icon: <Trash2 className="h-4 w-4" />,
          show: (item: TenantPlan) => !item.hasActiveSubscribers,
        },
      ],
    }),
    [t, vm]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
}
