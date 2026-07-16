/**
 * Webhooks List View
 *
 * Main list page for webhook subscription management.
 * Uses GenericCrudView for standard CRUD + custom status/action columns.
 */
"use client";

import { useMemo, useState } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import type { WebhookSubscriptionListItem } from "../../domain/entities/Webhook";
import { useWebhooksViewModel } from "../viewmodels/useWebhooksViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { WebhookStatusBadge } from "../components/WebhookStatusBadge";
import { Eye, Trash2, ToggleLeft, Globe, Zap } from "lucide-react";
import { formatUtc } from "@core/common/utils";
import { useRouter } from "next/navigation";
import { WebhookForm } from "../components/WebhookForm";
import { WebhookHealthDashboard } from "../components/WebhookHealthDashboard";
import { useModuleLocales } from "@core/hooks/use-module-locales";

/**
 * Presentation UI component rendering the webhooks view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function WebhooksView() {
  useModuleLocales(() => import("../../../locales"), "webhooks");

  const { t } = useI18n();
  const router = useRouter();
  const { vm, getConfigBase, handleToggle, healthSummary, isLoadingHealth } =
    useWebhooksViewModel();
  const configBase = getConfigBase();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const config: CrudConfig<WebhookSubscriptionListItem> = useMemo(
    () => ({
      titleKey: "webhooks.title",
      subtitleKey: "webhooks.description",
      resource: "webhooks",
      columns: [
        {
          key: "url",
          label: t("webhooks.url") || "Endpoint URL",
          sortable: true,
          render: (_val: unknown, item: WebhookSubscriptionListItem) => (
            <div className="flex max-w-[280px] items-center gap-2">
              <Globe className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate font-mono text-sm" title={item.url}>
                {item.url}
              </span>
            </div>
          ),
        },
        {
          key: "scope",
          label: t("webhooks.scope.label") || "Scope",
          render: (_val: unknown, item: WebhookSubscriptionListItem) => {
            const scopeConfig: Record<
              string,
              {
                labelKey: string;
                fallback: string;
                variant: "default" | "secondary" | "outline";
                className: string;
              }
            > = {
              platform_only: {
                labelKey: "webhooks.scope.platformOnly",
                fallback: "Platform Only",
                variant: "default",
                className: "bg-blue-600 hover:bg-blue-700 text-white",
              },
              all_tenants: {
                labelKey: "webhooks.scope.allTenants",
                fallback: "All Tenants",
                variant: "default",
                className: "bg-purple-600 hover:bg-purple-700 text-white",
              },
              tenant_with_children: {
                labelKey: "webhooks.scope.tenantWithChildren",
                fallback: "Tenant + Children",
                variant: "secondary",
                className:
                  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
              },
              tenant_only: {
                labelKey: "webhooks.scope.tenantOnly",
                fallback: "Tenant Only",
                variant: "secondary",
                className: "",
              },
            };
            const cfg = scopeConfig[item.scope] ?? scopeConfig.tenant_only;
            return (
              <div className="flex flex-col items-start gap-0.5">
                <Badge variant={cfg.variant} className={`text-xs ${cfg.className}`}>
                  {t(cfg.labelKey) || cfg.fallback}
                </Badge>
                {item.tenantName && (
                  <span
                    className="max-w-[120px] truncate text-[10px] text-muted-foreground"
                    title={item.tenantName}
                  >
                    {item.tenantName}
                  </span>
                )}
              </div>
            );
          },
        },
        {
          key: "description",
          label: t("webhooks.description_field") || "Description",
          render: (_val: unknown, item: WebhookSubscriptionListItem) => (
            <span className="text-sm text-muted-foreground">{item.description || "—"}</span>
          ),
        },
        {
          key: "events",
          label: t("webhooks.events") || "Events",
          render: (_val: unknown, item: WebhookSubscriptionListItem) => {
            const count = item.events.length;
            const label =
              count === 1
                ? t("webhooks.eventCount", { count }) || `${count} event`
                : t("webhooks.eventCountPlural", { count }) || `${count} events`;
            return (
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-500" />
                <Badge variant="outline" className="text-xs font-medium">
                  {label}
                </Badge>
              </div>
            );
          },
        },
        {
          key: "isActive",
          label: t("webhooks.statusLabel") || "Status",
          render: (_val: unknown, item: WebhookSubscriptionListItem) => (
            <WebhookStatusBadge isActive={item.isActive} isAutoDisabled={item.isAutoDisabled} />
          ),
        },
        {
          key: "successRate",
          label: t("webhooks.stats.successRate") || "Success Rate",
          render: (_val: unknown, item: WebhookSubscriptionListItem) => {
            if (item.totalDeliveries === 0) {
              return <span className="text-sm text-muted-foreground">—</span>;
            }
            const rate = item.successRate;
            const color =
              rate >= 95 ? "text-emerald-600" : rate >= 80 ? "text-amber-600" : "text-red-600";
            return (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full ${
                      rate >= 95 ? "bg-emerald-500" : rate >= 80 ? "bg-amber-500" : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(rate, 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold ${color}`}>{rate.toFixed(1)}%</span>
              </div>
            );
          },
        },
        {
          key: "lastDeliveryAt",
          label: t("webhooks.lastDelivery") || "Last Delivery",
          render: (_val: unknown, item: WebhookSubscriptionListItem) => (
            <span className="text-sm text-muted-foreground">
              {item.lastDeliveryAt ? formatUtc(item.lastDeliveryAt, "MMM d, HH:mm") : "—"}
            </span>
          ),
        },
      ],
      createFields: configBase.createFields || [],
      editFields: configBase.editFields || [],
      createInitialValues: configBase.createInitialValues,
      editInitialValues: configBase.editInitialValues,
      getItemDisplayName: configBase.getItemDisplayName,
      deleteService: configBase.deleteService,
      permissions: configBase.permissions,
      onCreateClick: () => setCreateDialogOpen(true),
      getActions: (
        _vmInstance: unknown,
        tFn: (key: string) => string,
        handleDeleteFn?: (item: WebhookSubscriptionListItem) => void
      ): CrudAction<WebhookSubscriptionListItem>[] => [
        {
          label: tFn("common.view") || "View Details",
          onClick: (item: WebhookSubscriptionListItem) =>
            router.push(`/integrations/webhooks/${item.id}`),
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" />,
        },
        {
          label: tFn("webhooks.toggleStatus") || "Toggle Status",
          onClick: (item: WebhookSubscriptionListItem) => handleToggle(item.id),
          variant: "ghost" as const,
          icon: <ToggleLeft className="h-4 w-4" />,
          requiredPermission: "webhooks:update",
        },
        {
          label: tFn("common.delete") || "Delete",
          onClick: (item: WebhookSubscriptionListItem) => handleDeleteFn?.(item),
          variant: "ghost" as const,
          className: "text-red-600 hover:text-red-700",
          icon: <Trash2 className="h-4 w-4" />,
          requiredPermission: "webhooks:delete",
          confirmTitle: tFn("webhooks.deleteConfirmTitle") || "Delete Webhook",
          confirmDescription:
            tFn("webhooks.deleteConfirmDesc") ||
            "This will permanently delete this webhook and all delivery logs.",
          confirmVariant: "destructive" as const,
        },
      ],
    }),
    [t, configBase, handleToggle, router]
  );

  return (
    <div className="space-y-5">
      {/* System Health Summary */}
      <WebhookHealthDashboard summary={healthSummary} isLoading={isLoadingHealth} />

      {/* CRUD Table */}
      <GenericCrudView viewModel={vm} config={config} />

      <WebhookForm
        mode="create"
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => {
          setCreateDialogOpen(false);
          vm.refreshItems();
        }}
      />
    </div>
  );
}
