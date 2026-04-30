/**
 * Editions View
 *
 * CRUD view for managing subscription editions (plans).
 */
"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useEditionsViewModel } from "../viewmodels/useEditionsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import type { Edition } from "../../domain/entities/Edition";
import { Badge } from "@core/ui/badge";
import { Pencil, Trash2, Eye, Settings2, Columns, Plus } from "lucide-react";
import { format } from "date-fns";
import { useModuleLocales } from "@core/hooks/use-module-locales";

export function EditionsView() {
  useModuleLocales(() => import("../../../locales"), "editions");
      const { t, language } = useI18n();
      const vm = useEditionsViewModel();
      const router = useRouter();

      const config: CrudConfig<Edition> = useMemo(
            () => ({
                  titleKey: "entitlements.editions.title",
                  subtitleKey: "entitlements.editions.description",
                  resource: "editions",
                  customActions: [
                        {
                              label: t("entitlements.editions.comparison.heroTitle") || "Compare Editions",
                              onClick: async () => {
                                    router.push("/entitlements/editions/compare");
                              },
                              variant: "outline" as const,
                              icon: <Columns className="h-4 w-4" />,
                        },
                  ],
                  onCreateClick: () => router.push("/entitlements/editions/create"),
                  columns: [
                        {
                              key: "name",
                              label: t("entitlements.editions.editionName") || "Name",
                              sortable: true,
                        },
                        {
                              key: "displayName",
                              label: t("entitlements.editions.displayName") || "Display Name",
                              render: (_val: unknown, edition: Edition) =>
                                    edition.getDisplayName(language),
                        },
                        {
                              key: "features",
                              label: t("entitlements.editions.featureCount") || "Features",
                              render: (_val: unknown, edition: Edition) => (
                                    <Badge variant="secondary">{edition.featureCount}</Badge>
                              ),
                        },
                        {
                              key: "baseMonthlyPriceUsd",
                              label: t("entitlements.pricing.price") || "Price",
                              render: (_val: unknown, edition: Edition) => {
                                    const price = edition.baseMonthlyPriceUsd;
                                    if (price == null || price === 0) {
                                          return <span className="text-muted-foreground">—</span>;
                                    }
                                    const formatted = new Intl.NumberFormat("en-US", {
                                          style: "currency",
                                          currency: "USD",
                                          minimumFractionDigits: 0,
                                    }).format(price);
                                    return (
                                          <span className="tabular-nums text-sm font-medium text-emerald-600 dark:text-emerald-400">
                                                {formatted}
                                                <span className="text-muted-foreground text-xs">/mo</span>
                                          </span>
                                    );
                              },
                        },
                        {
                              key: "isRetired",
                              label: t("entitlements.editions.status") || "Status",
                              render: (_val: unknown, edition: Edition) => (
                                    <Badge variant={edition.isRetired ? "destructive" : "success"}>
                                          {edition.isRetired
                                                ? t("entitlements.editions.retired") || "Retired"
                                                : t("common.active") || "Active"}
                                    </Badge>
                              ),
                        },
                        {
                              key: "createdAt",
                              label: t("common.createdAt") || "Created",
                              render: (value: string) =>
                                    value ? format(new Date(value), "MMM d, yyyy") : "-",
                        },
                  ],
                  getItemDisplayName: (edition: Edition) => edition.getDisplayName(language),
                  deleteService: (id: string) => vm.deleteItem(id),
                  getActions: (vmInstance: ReturnType<typeof useEditionsViewModel>, tFn: (key: string) => string, handleDeleteFn: ((item: Edition) => void) | undefined): CrudAction<Edition>[] => [
                        {
                              label: tFn("common.view") || "View",
                              onClick: (item: Edition) => router.push(`/entitlements/editions/${item.id}`),
                              variant: "ghost" as const,
                              icon: <Eye className="h-4 w-4" />,
                        },
                        {
                              label: tFn("common.edit") || "Edit",
                              onClick: (item: Edition) => router.push(`/entitlements/editions/${item.id}/edit`),
                              variant: "ghost" as const,
                              icon: <Pencil className="h-4 w-4" />,
                        },
                        {
                              label: tFn("entitlements.editions.manageFeatures") || "Manage Features",
                              onClick: (item: Edition) => vmInstance.navigateToFeatures(item.id),
                              variant: "ghost" as const,
                              icon: <Settings2 className="h-4 w-4" />,
                        },
                        {
                              label: tFn("common.delete") || "Delete",
                              onClick: (item: Edition) => handleDeleteFn?.(item),
                              variant: "ghost" as const,
                              className: "text-red-600 hover:text-red-700",
                              icon: <Trash2 className="h-4 w-4" />,
                              show: (item: Edition) => !item.isSystem,
                        },
                  ],
            }),
            [t, vm, language]
      );

      return <GenericCrudView viewModel={vm} config={config} />;
}
