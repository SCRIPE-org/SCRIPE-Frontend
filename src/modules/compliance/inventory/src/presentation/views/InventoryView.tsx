"use client";

import { useMemo } from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import type { InventoryItem } from "../../domain/entities/InventoryItem";
import { useInventoryViewModel } from "../viewmodels/useInventoryViewModel";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Badge } from "@core/ui/badge";

export function InventoryView() {
  useModuleLocales(() => import("../../../locales"), "compliance");
  const { vm, getConfigBase, t } = useInventoryViewModel();

  const configBase = getConfigBase();

  const config: CrudConfig<InventoryItem> = useMemo(
    () => ({
      titleKey: "compliance.dataInventory",
      subtitleKey: "compliance.dataInventoryDesc",
      resource: "compliance",
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
      ],
      ...configBase,
    }),
    [t, configBase]
  );

  return <GenericCrudView<InventoryItem> config={config} viewModel={vm} />;
}
