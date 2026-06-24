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

/**
 * Presentation UI component rendering the catalog view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function CatalogView({ vm, t, language }: CatalogViewProps) {
  const config: CrudConfig<Feature> = useMemo(
    () => ({
      titleKey: "entitlements.features.title",
      subtitleKey: "entitlements.features.description",
      resource: "features",

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

      createFields: [
        {
          name: "name",
          label: t("entitlements.features.featureName") || "Feature Key",
          type: "text" as const,
          required: true,
          placeholder: "e.g. Identity.MaxAdmins",
          description: "Unique dot-namespaced key used in code to check feature access.",
        },
        {
          name: "module",
          label: t("entitlements.features.module") || "Module",
          type: "text" as const,
          required: true,
          placeholder: "e.g. Identity",
        },
        {
          name: "valueType",
          label: t("entitlements.features.valueType") || "Value Type",
          type: "select" as const,
          required: true,
          options: [
            { value: "Boolean", label: "Boolean (true/false)" },
            { value: "Numeric", label: "Numeric (integer limit)" },
            { value: "String", label: "String (text value)" },
          ],
        },
        {
          name: "defaultValue",
          label: t("entitlements.features.defaultValue") || "Default Value",
          type: "text" as const,
          required: true,
          placeholder: "false / 0 / empty",
          description: "Value used when no edition or override is set for a tenant.",
        },
        {
          name: "displayNameEn",
          label: t("entitlements.features.displayNameEn") || "Display Name (English)",
          type: "text" as const,
          placeholder: "e.g. Maximum Administrators",
        },
        {
          name: "displayNameAr",
          label: t("entitlements.features.displayNameAr") || "Display Name (Arabic)",
          type: "text" as const,
          placeholder: "e.g. الحد الأقصى للمديرين",
        },
        {
          name: "category",
          label: t("entitlements.features.category") || "Category",
          type: "text" as const,
          placeholder: "e.g. Limits, Integrations",
        },
        {
          name: "description",
          label: t("common.description") || "Description",
          type: "textarea" as const,
          placeholder: "Internal description for admin reference.",
        },
        {
          name: "isMarketingOnly",
          label: t("entitlements.features.marketingOnly") || "Marketing Only",
          type: "switch" as const,
          defaultValue: false,
          description:
            "When enabled, this feature is display-only and never enforced by the system.",
        },
      ],

      editFields: (item: Feature) => [
        {
          name: "displayNameEn",
          label: t("entitlements.features.displayNameEn") || "Display Name (English)",
          type: "text" as const,
          defaultValue: item?.displayNameEn ?? "",
        },
        {
          name: "displayNameAr",
          label: t("entitlements.features.displayNameAr") || "Display Name (Arabic)",
          type: "text" as const,
          defaultValue: item?.displayNameAr ?? "",
        },
        {
          name: "defaultValue",
          label: t("entitlements.features.defaultValue") || "Default Value",
          type: "text" as const,
          defaultValue: item?.defaultValue ?? "",
          required: true,
        },
        {
          name: "category",
          label: t("entitlements.features.category") || "Category",
          type: "text" as const,
          defaultValue: item?.category ?? "",
        },
        {
          name: "description",
          label: t("common.description") || "Description",
          type: "textarea" as const,
          defaultValue: item?.description ?? "",
        },
        {
          name: "isMarketingOnly",
          label: t("entitlements.features.marketingOnly") || "Marketing Only",
          type: "switch" as const,
          defaultValue: item?.isMarketingOnly ?? false,
          description:
            "When enabled, this feature is display-only and never enforced by the system.",
        },
      ],

      getItemDisplayName: (feature: Feature) => feature.getDisplayName(language),
    }),
    [t, language]
  );

  return <GenericCrudView viewModel={vm} config={config} />;
}
