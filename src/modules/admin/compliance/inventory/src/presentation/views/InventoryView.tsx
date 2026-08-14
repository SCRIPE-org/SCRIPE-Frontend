"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import type { InventoryItem } from "../../domain/entities/InventoryItem";
import { useInventoryViewModel } from "../viewmodels/useInventoryViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Badge } from "@core/ui/badge";

/**
 * Presentation UI component rendering the inventory view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function InventoryView() {
  // Distinct from the retention view's key: both used "compliance", and the
  // loader dedupes on it — whichever page mounted first marked the dictionary
  // loaded and the other rendered raw translation keys.
  useModuleLocales(() => import("../../../locales"), "compliance-inventory");
  const { vm, getConfigBase, t } = useInventoryViewModel();

  const configBase = getConfigBase();

  const config: CrudConfig<InventoryItem> = useMemo(
    () => ({
      titleKey: "compliance.dataInventory",
      subtitleKey: "compliance.dataInventoryDesc",
      resource: "compliance",
      // Registered in the backend's ComplianceEntityTypeCatalog -- must match
      // exactly. Create/edit both route through GenericCrudView's own modal
      // here, so this one line is all the wiring this screen needs.
      entityTypeKey: "compliance.data-inventory",
      columns: [
        {
          key: "moduleName",
          label: t("compliance.module"),
          sortable: true,
          render: (_val: unknown, item: InventoryItem) => (
            <span className="font-medium">{item.moduleName}</span>
          ),
        },
        {
          key: "entityName",
          label: t("compliance.entity"),
          sortable: true,
          render: (_val: unknown, item: InventoryItem) => <span>{item.entityName}</span>,
        },
        {
          key: "fieldName",
          label: t("compliance.field"),
          render: (_val: unknown, item: InventoryItem) => <span>{item.fieldName}</span>,
        },
        {
          key: "dataCategory",
          label: t("compliance.dataCategory"),
          render: (_val: unknown, item: InventoryItem) => (
            <Badge variant="outline">{t(`compliance.categories.${item.dataCategory}`)}</Badge>
          ),
        },
        {
          key: "legalBasis",
          label: t("compliance.legalBasis"),
          render: (_val: unknown, item: InventoryItem) => (
            <Badge variant="secondary">{t(`compliance.legalBases.${item.legalBasis}`)}</Badge>
          ),
        },
        {
          key: "isAnonymizedOnErasure",
          label: t("compliance.isAnonymized"),
          render: (_val: unknown, item: InventoryItem) => (
            <span>{item.isAnonymizedOnErasure ? t("common.yes") : t("common.no")}</span>
          ),
        },
        {
          key: "isIncludedInExport",
          label: t("compliance.isExported"),
          render: (_val: unknown, item: InventoryItem) => (
            <span>{item.isIncludedInExport ? t("common.yes") : t("common.no")}</span>
          ),
        },
        {
          key: "isGlobal",
          label: t("compliance.scope"),
          render: (_val: unknown, item: InventoryItem) => (
            <Badge variant={item.isGlobal ? "info" : "secondary"}>
              {item.isGlobal ? t("compliance.global") : t("common.tenant")}
            </Badge>
          ),
        },
      ],
      ...configBase,
    }),
    [t, configBase]
  );

  return <GenericCrudView<InventoryItem> config={config} viewModel={vm} />;
}
