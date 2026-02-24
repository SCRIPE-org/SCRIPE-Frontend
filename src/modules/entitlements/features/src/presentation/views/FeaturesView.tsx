/**
 * Features View
 *
 * CRUD view for managing the feature catalog.
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useFeaturesViewModel } from "../viewmodels/useFeaturesViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import type { Feature } from "../../domain/entities/Feature";
import { Badge } from "@core/ui/badge";
import { Pencil, Trash2, Eye } from "lucide-react";
import { format } from "date-fns";

const VALUE_TYPE_COLORS: Record<string, "default" | "secondary" | "outline"> = {
      Boolean: "default",
      Numeric: "secondary",
      String: "outline",
};

export function FeaturesView() {
      const { t } = useI18n();
      const vm = useFeaturesViewModel();

      const config: CrudConfig<Feature> = useMemo(
            () => ({
                  titleKey: "entitlements.features.title",
                  subtitleKey: "entitlements.features.description",
                  resource: "features",
                  columns: [
                        {
                              key: "name",
                              label: t("entitlements.features.featureName") || "Name",
                              sortable: true,
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
                              key: "module",
                              label: t("entitlements.features.module") || "Module",
                              render: (value: string) => (
                                    <Badge variant="secondary">{value}</Badge>
                              ),
                        },
                        {
                              key: "isSystem",
                              label: t("entitlements.features.isSystem") || "System",
                              render: (value: boolean) => (
                                    <Badge variant={value ? "default" : "outline"}>
                                          {value ? t("common.yes") || "Yes" : t("common.no") || "No"}
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
                  createFields: [
                        {
                              name: "name",
                              label: t("entitlements.features.featureName") || "Feature Name",
                              type: "text" as const,
                              required: true,
                              placeholder: "e.g. Identity.MaxAdminsPerTenant",
                        },
                        {
                              name: "valueType",
                              label: t("entitlements.features.valueType") || "Value Type",
                              type: "select" as const,
                              required: true,
                              options: [
                                    { value: "Boolean", label: "Boolean" },
                                    { value: "Numeric", label: "Numeric" },
                                    { value: "String", label: "String" },
                              ],
                        },
                        {
                              name: "defaultValue",
                              label: t("entitlements.features.defaultValue") || "Default Value",
                              type: "text" as const,
                              required: true,
                        },
                        {
                              name: "module",
                              label: t("entitlements.features.module") || "Module",
                              type: "text" as const,
                              required: true,
                              placeholder: "e.g. Identity, Communication",
                        },
                        {
                              name: "description",
                              label: t("common.description") || "Description",
                              type: "textarea" as const,
                        },
                  ],
                  editFields: [
                        {
                              name: "name",
                              label: t("entitlements.features.featureName") || "Feature Name",
                              type: "text" as const,
                        },
                        {
                              name: "defaultValue",
                              label: t("entitlements.features.defaultValue") || "Default Value",
                              type: "text" as const,
                        },
                        {
                              name: "description",
                              label: t("common.description") || "Description",
                              type: "textarea" as const,
                        },
                  ],
                  editInitialValues: (feature: Feature) => ({
                        name: feature.name,
                        defaultValue: feature.defaultValue,
                        description: feature.description || "",
                  }),
                  getItemDisplayName: (feature: Feature) => feature.name,
                  deleteService: (id: string) => vm.deleteItem(id),
                  getActions: (vmInstance: any, tFn: any, handleDeleteFn: any): CrudAction<Feature>[] => [
                        {
                              label: tFn("common.view") || "View",
                              onClick: (item: Feature) => vmInstance.openViewModal(item),
                              variant: "ghost" as const,
                              icon: <Eye className="h-4 w-4" />,
                        },
                        {
                              label: tFn("common.edit") || "Edit",
                              onClick: (item: Feature) => vmInstance.openEditModal(item),
                              variant: "ghost" as const,
                              icon: <Pencil className="h-4 w-4" />,
                              show: (item: Feature) => !item.isSystem,
                        },
                        {
                              label: tFn("common.delete") || "Delete",
                              onClick: (item: Feature) => handleDeleteFn?.(item),
                              variant: "ghost" as const,
                              className: "text-red-600 hover:text-red-700",
                              icon: <Trash2 className="h-4 w-4" />,
                              show: (item: Feature) => !item.isSystem,
                        },
                  ],
            }),
            [t, vm]
      );

      return <GenericCrudView viewModel={vm} config={config} />;
}
