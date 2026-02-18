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
import {
      Eye,
      Pencil,
      Trash2,
      ToggleLeft,
      Plus,
      Globe,
      Zap,
} from "lucide-react";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { WebhookForm } from "../components/WebhookForm";

export function WebhooksView() {
      const { t } = useI18n();
      const router = useRouter();
      const { vm, getConfigBase, handleToggle } = useWebhooksViewModel();
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
                                    <div className="flex items-center gap-2 max-w-[280px]">
                                          <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
                                          <span className="truncate text-sm font-mono" title={item.url}>
                                                {item.url}
                                          </span>
                                    </div>
                              ),
                        },
                        {
                              key: "scope",
                              label: t("webhooks.scope") || "Scope",
                              render: (_val: unknown, item: WebhookSubscriptionListItem) => {
                                    const scopeConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline"; className: string }> = {
                                          system: { label: "System", variant: "default", className: "bg-blue-600 hover:bg-blue-700 text-white" },
                                          hierarchy: { label: "Hierarchy", variant: "default", className: "bg-purple-600 hover:bg-purple-700 text-white" },
                                          tenant: { label: "Tenant", variant: "secondary", className: "" },
                                    };
                                    const cfg = scopeConfig[item.scope] ?? scopeConfig.tenant;
                                    return (
                                          <div className="flex flex-col gap-0.5">
                                                <Badge variant={cfg.variant} className={`text-xs ${cfg.className}`}>
                                                      {cfg.label}
                                                </Badge>
                                                {item.tenantName && (
                                                      <span className="text-[10px] text-muted-foreground truncate max-w-[120px]" title={item.tenantName}>
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
                                    <span className="text-sm text-muted-foreground">
                                          {item.description || "—"}
                                    </span>
                              ),
                        },
                        {
                              key: "events",
                              label: t("webhooks.events") || "Events",
                              render: (_val: unknown, item: WebhookSubscriptionListItem) => (
                                    <div className="flex items-center gap-1.5">
                                          <Zap className="h-3.5 w-3.5 text-amber-500" />
                                          <Badge variant="outline" className="text-xs font-medium">
                                                {item.events.length} {item.events.length === 1 ? "event" : "events"}
                                          </Badge>
                                    </div>
                              ),
                        },
                        {
                              key: "isActive",
                              label: t("webhooks.statusLabel") || "Status",
                              render: (_val: unknown, item: WebhookSubscriptionListItem) => (
                                    <WebhookStatusBadge
                                          isActive={item.isActive}
                                          consecutiveFailures={item.consecutiveFailures}
                                          maxConsecutiveFailures={item.maxConsecutiveFailures}
                                    />
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
                                          rate >= 95
                                                ? "text-emerald-600"
                                                : rate >= 80
                                                      ? "text-amber-600"
                                                      : "text-red-600";
                                    return (
                                          <div className="flex items-center gap-2">
                                                <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                                                      <div
                                                            className={`h-full rounded-full ${rate >= 95
                                                                  ? "bg-emerald-500"
                                                                  : rate >= 80
                                                                        ? "bg-amber-500"
                                                                        : "bg-red-500"
                                                                  }`}
                                                            style={{ width: `${Math.min(rate, 100)}%` }}
                                                      />
                                                </div>
                                                <span className={`text-xs font-semibold ${color}`}>
                                                      {rate.toFixed(1)}%
                                                </span>
                                          </div>
                                    );
                              },
                        },
                        {
                              key: "lastDeliveryAt",
                              label: t("webhooks.lastDelivery") || "Last Delivery",
                              render: (_val: unknown, item: WebhookSubscriptionListItem) => (
                                    <span className="text-sm text-muted-foreground">
                                          {item.lastDeliveryAt
                                                ? format(new Date(item.lastDeliveryAt), "MMM d, HH:mm")
                                                : "—"}
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
                  getActions: (_vmInstance: any, tFn: any, handleDeleteFn: any): CrudAction<WebhookSubscriptionListItem>[] => [
                        {
                              label: tFn("common.view") || "View Details",
                              onClick: (item: WebhookSubscriptionListItem) =>
                                    router.push(`/settings/webhooks/${item.id}`),
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
            <>
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
            </>
      );
}
