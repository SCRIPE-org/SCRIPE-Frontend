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
          label: t("webhooks.url"),
          sortable: true,
          render: (_val: unknown, item: WebhookSubscriptionListItem) => (
            <div className="flex max-w-[280px] items-center gap-2">
              <Globe className="h-4 w-4 shrink-0 text-nx-ink-3" aria-hidden="true" />
              <span className="truncate font-mono text-sm" title={item.url}>
                {item.url}
              </span>
            </div>
          ),
        },
        {
          key: "scope",
          label: t("webhooks.scope.label"),
          render: (_val: unknown, item: WebhookSubscriptionListItem) => {
            // Scope breadth, not a health signal — variants differentiate by
            // weight alone (accent for the widest reach, quieter neutrals
            // beneath), never a re-derived colour.
            const scopeConfig: Record<
              string,
              { labelKey: string; variant: "default" | "info" | "secondary" | "outline" }
            > = {
              platform_only: { labelKey: "webhooks.scope.platformOnly", variant: "info" },
              all_tenants: { labelKey: "webhooks.scope.allTenants", variant: "default" },
              tenant_with_children: {
                labelKey: "webhooks.scope.tenantWithChildren",
                variant: "secondary",
              },
              tenant_only: { labelKey: "webhooks.scope.tenantOnly", variant: "outline" },
            };
            const cfg = scopeConfig[item.scope] ?? scopeConfig.tenant_only;
            return (
              <div className="flex flex-col items-start gap-0.5">
                <Badge variant={cfg.variant} className="text-xs">
                  {t(cfg.labelKey)}
                </Badge>
                {item.tenantName && (
                  <span
                    className="max-w-[120px] truncate text-[10px] text-nx-ink-3"
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
          label: t("webhooks.description_field"),
          render: (_val: unknown, item: WebhookSubscriptionListItem) => (
            <span className="text-sm text-nx-ink-2">{item.description || "—"}</span>
          ),
        },
        {
          key: "events",
          label: t("webhooks.events"),
          render: (_val: unknown, item: WebhookSubscriptionListItem) => {
            const count = item.events.length;
            const label =
              count === 1
                ? t("webhooks.eventCount", { count })
                : t("webhooks.eventCountPlural", { count });
            return (
              <div className="flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-warning" aria-hidden="true" />
                <Badge variant="outline" className="text-xs font-medium">
                  {label}
                </Badge>
              </div>
            );
          },
        },
        {
          key: "isActive",
          label: t("webhooks.statusLabel"),
          render: (_val: unknown, item: WebhookSubscriptionListItem) => (
            <WebhookStatusBadge isActive={item.isActive} isAutoDisabled={item.isAutoDisabled} />
          ),
        },
        {
          key: "successRate",
          label: t("webhooks.stats.successRate"),
          render: (_val: unknown, item: WebhookSubscriptionListItem) => {
            if (item.totalDeliveries === 0) {
              return <span className="text-sm text-nx-ink-3">—</span>;
            }
            const rate = item.successRate;
            const color =
              rate >= 95 ? "text-success" : rate >= 80 ? "text-warning" : "text-destructive";
            return (
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-16 overflow-hidden rounded-full bg-nx-raised-2">
                  <div
                    className={`h-full rounded-full ${
                      rate >= 95 ? "bg-success" : rate >= 80 ? "bg-warning" : "bg-destructive"
                    }`}
                    style={{ width: `${Math.min(rate, 100)}%` }}
                  />
                </div>
                <span className={`text-xs font-semibold tabular-nums ${color}`}>
                  {rate.toFixed(1)}%
                </span>
              </div>
            );
          },
        },
        {
          key: "lastDeliveryAt",
          label: t("webhooks.lastDelivery"),
          render: (_val: unknown, item: WebhookSubscriptionListItem) => (
            <span className="text-sm text-nx-ink-2">
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
          label: tFn("common.view"),
          onClick: (item: WebhookSubscriptionListItem) =>
            router.push(`/integrations/webhooks/${item.id}`),
          variant: "ghost" as const,
          icon: <Eye className="h-4 w-4" aria-hidden="true" />,
        },
        {
          label: tFn("webhooks.toggleStatus"),
          onClick: (item: WebhookSubscriptionListItem) => handleToggle(item.id),
          variant: "ghost" as const,
          icon: <ToggleLeft className="h-4 w-4" aria-hidden="true" />,
          requiredPermission: "webhooks.update",
        },
        {
          label: tFn("common.delete"),
          onClick: (item: WebhookSubscriptionListItem) => handleDeleteFn?.(item),
          variant: "ghost" as const,
          className: "text-destructive hover:text-destructive/90",
          icon: <Trash2 className="h-4 w-4" aria-hidden="true" />,
          requiredPermission: "webhooks.delete",
          confirmTitle: tFn("webhooks.deleteConfirmTitle"),
          confirmDescription: tFn("webhooks.deleteConfirmDesc"),
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
