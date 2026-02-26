/**
 * Features View
 *
 * CRUD view for managing the feature catalog.
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useFeaturesViewModel } from "../viewmodels/useFeaturesViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import type { Feature } from "../../domain/entities/Feature";
import { Badge } from "@core/ui/badge";
import { format } from "date-fns";

const VALUE_TYPE_COLORS: Record<string, "default" | "secondary" | "outline"> = {
      Boolean: "default",
      Numeric: "secondary",
      String: "outline",
};

export function FeaturesView() {
      const { t, language } = useI18n();
      const vm = useFeaturesViewModel();

      const config: CrudConfig<Feature> = useMemo(
            () => ({
                  titleKey: "entitlements.features.title",
                  subtitleKey: "entitlements.features.description",
                  resource: "features",
                  hideAddButton: true,

                  columns: [
                        {
                              key: "displayNameAr",
                              label: t("entitlements.features.displayName"),
                              render: (_val: unknown, feature: Feature) =>
                                    feature.getDisplayName(language),
                              sortable: true,
                        },
                        {
                              key: "name",
                              label: t("entitlements.features.featureName"),
                              render: (value: string) => (
                                    <span className="text-xs text-muted-foreground font-mono">{value}</span>
                              ),
                        },
                        {
                              key: "module",
                              label: t("entitlements.features.module"),
                              render: (value: string) => (
                                    <Badge variant="secondary">{value}</Badge>
                              ),
                        },
                        {
                              key: "category",
                              label: t("entitlements.features.category"),
                              render: (_val: unknown, feature: Feature) =>
                                    feature.category ? (
                                          <Badge variant="secondary">{feature.category}</Badge>
                                    ) : (
                                          "-"
                                    ),
                        },
                        {
                              key: "valueType",
                              label: t("entitlements.features.valueType") || "Type",
                              render: (value: string) => (
                                    <Badge variant={VALUE_TYPE_COLORS[value] || "outline"}>{value}</Badge>
                              ),
                        },
                        {
                              key: "defaultValue",
                              label: t("entitlements.features.defaultValue") || "Default",
                        },
                        {
                              key: "createdAt",
                              label: t("common.createdAt") || "Created",
                              render: (value: string) =>
                                    value ? format(new Date(value), "MMM d, yyyy") : "-",
                        },
                  ],
                  // Features are system-seeded — read-only, no actions
                  getItemDisplayName: (feature: Feature) => feature.getDisplayName(language),
                  hideActionsColumn: true,
            }),
            [t, vm, language]
      );

      return <GenericCrudView viewModel={vm} config={config} />;
}
