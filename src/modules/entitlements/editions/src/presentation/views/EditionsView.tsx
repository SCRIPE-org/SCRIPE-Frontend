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
                        // ── Billing Controls ──
                        {
                              name: "allowMonthly",
                              label: t("entitlements.editions.allowMonthly") || "Allow Monthly Billing",
                              type: "switch" as const,
                              defaultValue: true,
                        },
                        {
                              name: "allowYearly",
                              label: t("entitlements.editions.allowYearly") || "Allow Yearly Billing",
                              type: "switch" as const,
                              defaultValue: true,
                        },
                        {
                              name: "allowLifetime",
                              label: t("entitlements.editions.allowLifetime") || "Allow Lifetime (One-Time)",
                              type: "switch" as const,
                              defaultValue: true,
                        },
                        {
                              name: "allowTrial",
                              label: t("entitlements.editions.allowTrial") || "Allow Trial Period",
                              type: "switch" as const,
                              defaultValue: true,
                        },
                        // ── Trial Configuration (visible only when allowTrial=true) ──
                        {
                              name: "trialDurationDays",
                              label: t("entitlements.editions.trialDurationDays") || "Trial Duration (Days)",
                              type: "number" as const,
                              min: 1,
                              max: 730,
                              defaultValue: 14,
                              placeholder: "14",
                              isVisible: (formData: Record<string, any>) => formData.allowTrial !== false,
                        },
                        {
                              name: "trialIsFree",
                              label: t("entitlements.editions.trialIsFree") || "Free Trial (No Charge)",
                              type: "switch" as const,
                              defaultValue: true,
                              isVisible: (formData: Record<string, any>) => formData.allowTrial !== false,
                        },
                        {
                              name: "trialDiscountPercent",
                              label: t("entitlements.editions.trialDiscountPercent") || "Trial Discount (%)",
                              type: "slider" as const,
                              min: 0,
                              max: 100,
                              step: 5,
                              defaultValue: 100,
                              isVisible: (formData: Record<string, any>) => formData.allowTrial !== false && formData.trialIsFree === false,
                        },
                        // ── Grace Period ──
                        {
                              name: "gracePeriodDays",
                              label: t("entitlements.editions.gracePeriodDays") || "Grace Period (Days)",
                              type: "number" as const,
                              min: 0,
                              max: 365,
                              defaultValue: 0,
                              placeholder: "0",
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
                        // ── Billing Controls ──
                        {
                              name: "allowMonthly",
                              label: t("entitlements.editions.allowMonthly") || "Allow Monthly Billing",
                              type: "switch" as const,
                        },
                        {
                              name: "allowYearly",
                              label: t("entitlements.editions.allowYearly") || "Allow Yearly Billing",
                              type: "switch" as const,
                        },
                        {
                              name: "allowLifetime",
                              label: t("entitlements.editions.allowLifetime") || "Allow Lifetime (One-Time)",
                              type: "switch" as const,
                        },
                        {
                              name: "allowTrial",
                              label: t("entitlements.editions.allowTrial") || "Allow Trial Period",
                              type: "switch" as const,
                        },
                        // ── Trial Configuration ──
                        {
                              name: "trialDurationDays",
                              label: t("entitlements.editions.trialDurationDays") || "Trial Duration (Days)",
                              type: "number" as const,
                              min: 1,
                              max: 730,
                              placeholder: "14",
                              isVisible: (formData: Record<string, any>) => formData.allowTrial !== false,
                        },
                        {
                              name: "trialIsFree",
                              label: t("entitlements.editions.trialIsFree") || "Free Trial (No Charge)",
                              type: "switch" as const,
                              isVisible: (formData: Record<string, any>) => formData.allowTrial !== false,
                        },
                        {
                              name: "trialDiscountPercent",
                              label: t("entitlements.editions.trialDiscount") || "Trial Discount (%)",
                              type: "slider" as const,
                              min: 0,
                              max: 100,
                              step: 5,
                              isVisible: (formData: Record<string, any>) => formData.allowTrial !== false && formData.trialIsFree === false,
                        },
                        // ── Grace Period ──
                        {
                              name: "gracePeriodDays",
                              label: t("entitlements.editions.gracePeriod") || "Grace Period (Days)",
                              type: "number" as const,
                              min: 0,
                              max: 365,
                              placeholder: "0",
                        },
                  ],
                  editInitialValues: (edition: Edition) => ({
                        name: edition.name,
                        displayNameEn: edition.displayNameEn,
                        displayNameAr: edition.displayNameAr,
                        description: edition.description || "",
                        fallbackEditionId: edition.fallbackEditionId || "",
                        // ── Billing Controls ──
                        allowMonthly: edition.allowMonthly,
                        allowYearly: edition.allowYearly,
                        allowLifetime: edition.allowLifetime,
                        allowTrial: edition.allowTrial,
                        trialDurationDays: edition.trialDurationDays,
                        trialIsFree: edition.trialIsFree,
                        trialDiscountPercent: edition.trialDiscountPercent,
                        gracePeriodDays: edition.gracePeriodDays,
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
