/**
 * Editions View
 *
 * CRUD view for managing subscription editions (plans).
 */
"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useEditionsViewModel } from "../viewmodels/useEditionsViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import type { Edition } from "../../domain/entities/Edition";
import { Badge } from "@core/ui/badge";
import { Pencil, Trash2, Eye, Settings2 } from "lucide-react";
import { format } from "date-fns";

export function EditionsView() {
      const { t, language } = useI18n();
      const vm = useEditionsViewModel();

      const config: CrudConfig<Edition> = useMemo(
            () => ({
                  titleKey: "entitlements.editions.title",
                  subtitleKey: "entitlements.editions.description",
                  resource: "editions",
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
                              key: "isSystem",
                              label: t("entitlements.editions.isSystem") || "System",
                              render: (value: boolean) => (
                                    <Badge variant={value ? "default" : "outline"}>
                                          {value ? t("common.yes") || "Yes" : t("common.no") || "No"}
                                    </Badge>
                              ),
                        },
                        {
                              key: "fallbackEditionName",
                              label: t("entitlements.editions.fallbackEdition") || "Fallback Edition",
                              render: (value: string) => value ? (
                                    <Badge variant="outline">{value}</Badge>
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
                              label: t("entitlements.editions.editionName") || "Edition Name",
                              type: "text" as const,
                              required: true,
                              placeholder: "e.g. Enterprise",
                        },
                        {
                              name: "displayNameEn",
                              label: t("entitlements.editions.displayNameEn") || "Display Name (EN)",
                              type: "text" as const,
                              required: true,
                              placeholder: "e.g. Enterprise Plan",
                        },
                        {
                              name: "displayNameAr",
                              label: t("entitlements.editions.displayNameAr") || "Display Name (AR)",
                              type: "text" as const,
                              required: true,
                              placeholder: "مثال: خطة المؤسسة",
                        },
                        {
                              name: "description",
                              label: t("common.description") || "Description",
                              type: "textarea" as const,
                              placeholder: t("entitlements.editions.descriptionPlaceholder") || "Brief description of this edition...",
                        },
                        {
                              name: "fallbackEditionId",
                              label: t("entitlements.editions.fallbackEdition") || "Fallback Edition",
                              type: "select" as const,
                              placeholder: t("entitlements.editions.fallbackPlaceholder") || "Select fallback plan (optional)",
                              options: [
                                    { value: "", label: t("common.none") || "None" },
                                    ...(vm.items || []).map((e: Edition) => ({ value: e.id, label: e.getDisplayName(language) })),
                              ],
                        },
                  ],
                  editFields: [
                        {
                              name: "name",
                              label: t("entitlements.editions.editionName") || "Edition Name",
                              type: "text" as const,
                              placeholder: "e.g. Enterprise",
                        },
                        {
                              name: "displayNameEn",
                              label: t("entitlements.editions.displayNameEn") || "Display Name (EN)",
                              type: "text" as const,
                              placeholder: "e.g. Enterprise Plan",
                        },
                        {
                              name: "displayNameAr",
                              label: t("entitlements.editions.displayNameAr") || "Display Name (AR)",
                              type: "text" as const,
                              placeholder: "مثال: خطة المؤسسة",
                        },
                        {
                              name: "description",
                              label: t("common.description") || "Description",
                              type: "textarea" as const,
                              placeholder: t("entitlements.editions.descriptionPlaceholder") || "Brief description of this edition...",
                        },
                        {
                              name: "fallbackEditionId",
                              label: t("entitlements.editions.fallbackEdition") || "Fallback Edition",
                              type: "select" as const,
                              placeholder: t("entitlements.editions.fallbackPlaceholder") || "Select fallback plan (optional)",
                              options: [
                                    { value: "", label: t("common.none") || "None" },
                                    ...(vm.items || []).map((e: Edition) => ({ value: e.id, label: e.getDisplayName(language) })),
                              ],
                        },
                  ],
                  editInitialValues: (edition: Edition) => ({
                        name: edition.name,
                        displayNameEn: edition.displayNameEn,
                        displayNameAr: edition.displayNameAr,
                        description: edition.description || "",
                        fallbackEditionId: edition.fallbackEditionId || "",
                  }),
                  getItemDisplayName: (edition: Edition) => edition.getDisplayName(language),
                  deleteService: (id: string) => vm.deleteItem(id),
                  getActions: (vmInstance: any, tFn: any, handleDeleteFn: any): CrudAction<Edition>[] => [
                        {
                              label: tFn("common.view") || "View",
                              onClick: (item: Edition) => vmInstance.openViewModal(item),
                              variant: "ghost" as const,
                              icon: <Eye className="h-4 w-4" />,
                        },
                        {
                              label: tFn("common.edit") || "Edit",
                              onClick: (item: Edition) => vmInstance.openEditModal(item),
                              variant: "ghost" as const,
                              icon: <Pencil className="h-4 w-4" />,
                              show: (item: Edition) => !item.isSystem,
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
