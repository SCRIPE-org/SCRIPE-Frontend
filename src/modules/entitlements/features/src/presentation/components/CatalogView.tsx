/**
 * CatalogView — System admin global feature catalog (read-only CRUD table).
 *
 * Wraps GenericCrudView with feature-specific column configuration.
 * Only rendered when the viewer is a system admin with no tenant context.
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { Badge } from "@core/ui/badge";
import { format } from "date-fns";
import type { Feature } from "../../domain/entities/Feature";

const VALUE_TYPE_COLORS: Record<string, "default" | "secondary" | "outline"> = {
  Boolean: "default",
  Numeric: "secondary",
  String: "outline",
};

interface CatalogViewProps {
  /** The CRUD view model returned by useCrudViewModel<Feature> */

  vm: Record<string, any>;
  t: (key: string) => string;
  language: string;
}

export function CatalogView({ vm, t, language }: CatalogViewProps) {
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
          render: (_val: unknown, feature: Feature) => feature.getDisplayName(language),
          sortable: true,
        },
        {
          key: "name",
          label: t("entitlements.features.featureName"),
          render: (value: string) => (
            <span className="font-mono text-xs text-muted-foreground">{value}</span>
          ),
        },
        {
          key: "module",
          label: t("entitlements.features.module"),
          render: (value: string) => <Badge variant="secondary">{value}</Badge>,
        },
        {
          key: "category",
          label: t("entitlements.features.category"),
          render: (_val: unknown, feature: Feature) =>
            feature.category ? <Badge variant="secondary">{feature.category}</Badge> : "-",
        },
        {
          key: "valueType",
          label: t("entitlements.features.valueType"),
          render: (value: string) => (
            <Badge variant={VALUE_TYPE_COLORS[value] || "outline"}>{value}</Badge>
          ),
        },
        {
          key: "defaultValue",
          label: t("entitlements.features.defaultValue"),
        },
        {
          key: "isMarketingOnly",
          label: t("entitlements.features.marketingOnly"),
          render: (_val: unknown, feature: Feature) =>
            feature.isMarketingOnly ? (
              <Badge variant="outline" className="border-amber-500 text-amber-600">
                Marketing
              </Badge>
            ) : (
              <Badge variant="secondary">Enforced</Badge>
            ),
        },
        {
          key: "createdAt",
          label: t("common.createdAt"),
          render: (value: string) => (value ? format(new Date(value), "MMM d, yyyy") : "-"),
        },
      ],
      getItemDisplayName: (feature: Feature) => feature.getDisplayName(language),
      hideActionsColumn: true,
    }),
    [t, language]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
}
