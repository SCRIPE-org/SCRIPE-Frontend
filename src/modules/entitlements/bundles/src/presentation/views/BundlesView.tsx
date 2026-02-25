/**
 * Bundles View
 *
 * CRUD view for managing permission bundles.
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useBundlesViewModel } from "../viewmodels/useBundlesViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import type { Bundle } from "../../domain/entities/Bundle";
import { Badge } from "@core/ui/badge";
import { Pencil, Trash2, Eye, ShieldCheck, Zap } from "lucide-react";
import { format } from "date-fns";

export function BundlesView() {
      const { t, language } = useI18n();
      const vm = useBundlesViewModel();

      const config: CrudConfig<Bundle> = useMemo(
            () => ({
                  titleKey: "entitlements.bundles.title",
                  subtitleKey: "entitlements.bundles.description",
                  resource: "bundles",
                  columns: [
                        {
                              key: "name",
                              label: t("entitlements.bundles.bundleName") || "Name",
                              sortable: true,
                        },
                        {
                              key: "displayName",
                              label: t("entitlements.bundles.displayName") || "Display Name",
                              render: (_val: unknown, bundle: Bundle) =>
                                    bundle.getDisplayName(language),
                        },
                        {
                              key: "permissionRuleCount",
                              label: t("entitlements.bundles.permissions") || "Permissions",
                              render: (_val: unknown, bundle: Bundle) => (
                                    <Badge variant="secondary" className="gap-1">
                                          <ShieldCheck className="h-3 w-3" />
                                          {bundle.permissionRuleCount}
                                    </Badge>
                              ),
                        },
                        {
                              key: "featureRuleCount",
                              label: t("entitlements.bundles.features") || "Features",
                              render: (_val: unknown, bundle: Bundle) => (
                                    <Badge variant="secondary" className="gap-1">
                                          <Zap className="h-3 w-3" />
                                          {bundle.featureRuleCount}
                                    </Badge>
                              ),
                        },
                        {
                              key: "scope",
                              label: t("entitlements.bundles.scope") || "Scope",
                              render: (value: string) => (
                                    <Badge variant="outline">{value}</Badge>
                              ),
                        },
                        {
                              key: "isSystem",
                              label: t("entitlements.bundles.isSystem") || "System",
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
                              label: t("entitlements.bundles.bundleName") || "Bundle Name",
                              type: "text" as const,
                              required: true,
                              placeholder: "e.g. Packages.AdminBasic",
                        },
                        {
                              name: "displayNameEn",
                              label: t("entitlements.bundles.displayNameEn") || "Display Name (EN)",
                              type: "text" as const,
                        },
                        {
                              name: "displayNameAr",
                              label: t("entitlements.bundles.displayNameAr") || "Display Name (AR)",
                              type: "text" as const,
                        },
                        {
                              name: "description",
                              label: t("common.description") || "Description",
                              type: "textarea" as const,
                        },
                  ],
                  editFields: [
                        {
                              name: "displayNameEn",
                              label: t("entitlements.bundles.displayNameEn") || "Display Name (EN)",
                              type: "text" as const,
                        },
                        {
                              name: "displayNameAr",
                              label: t("entitlements.bundles.displayNameAr") || "Display Name (AR)",
                              type: "text" as const,
                        },
                        {
                              name: "description",
                              label: t("common.description") || "Description",
                              type: "textarea" as const,
                        },
                  ],
                  editInitialValues: (bundle: Bundle) => ({
                        displayNameEn: bundle.displayNameEn || "",
                        displayNameAr: bundle.displayNameAr || "",
                        description: bundle.description || "",
                  }),
                  getItemDisplayName: (bundle: Bundle) => bundle.getDisplayName(language),
                  deleteService: (id: string) => vm.deleteItem(id),
                  getActions: (vmInstance: any, tFn: any, handleDeleteFn: any): CrudAction<Bundle>[] => [
                        {
                              label: tFn("common.view") || "View",
                              onClick: (item: Bundle) => vmInstance.openViewModal(item),
                              variant: "ghost" as const,
                              icon: <Eye className="h-4 w-4" />,
                        },
                        {
                              label: tFn("common.edit") || "Edit",
                              onClick: (item: Bundle) => vmInstance.openEditModal(item),
                              variant: "ghost" as const,
                              icon: <Pencil className="h-4 w-4" />,
                              show: (item: Bundle) => !item.isSystem,
                        },
                        {
                              label: tFn("common.delete") || "Delete",
                              onClick: (item: Bundle) => handleDeleteFn?.(item),
                              variant: "ghost" as const,
                              className: "text-red-600 hover:text-red-700",
                              icon: <Trash2 className="h-4 w-4" />,
                              show: (item: Bundle) => !item.isSystem,
                        },
                  ],
            }),
            [t, vm, language]
      );

      return <GenericCrudView viewModel={vm} config={config} />;
}
