"use client";

import { useMemo } from "react";
import { useEditionCategoriesViewModel } from "../viewmodels/useEditionCategoriesViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import type { EditionCategory } from "../../domain/entities/EditionCategory";
import { Pencil, Trash2 } from "lucide-react";

/**
 * Presentation UI component rendering the edition categories view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function EditionCategoriesView() {
  const { t, language } = useI18n();
  const vm = useEditionCategoriesViewModel();

  const config: CrudConfig<EditionCategory> = useMemo(
    () => ({
      titleKey: "entitlements.editions.categories.title",
      subtitleKey: "entitlements.editions.categories.description",

      columns: [
        {
          key: "name",
          label: t("common.name"),
          render: (_val: unknown, cat: EditionCategory) => cat.getDisplayName(language),
          sortable: true,
        },
        {
          key: "description",
          label: t("common.description"),
          render: (_val: unknown, cat: EditionCategory) => cat.description || "—",
        },
        {
          key: "sortOrder",
          label: t("entitlements.editions.categories.sortOrder"),
          render: (_val: unknown, cat: EditionCategory) => String(cat.sortOrder),
        },
      ],

      createFields: [
        {
          name: "name",
          label: t("common.name"),
          type: "text" as const,
          required: true,
          placeholder: "e.g. ERP, Healthcare, General",
        },
        {
          name: "displayNameEn",
          label: t("common.displayNameEn"),
          type: "text" as const,
          placeholder: "General Purpose",
        },
        {
          name: "displayNameAr",
          label: t("common.displayNameAr"),
          type: "text" as const,
          placeholder: "عام",
        },
        {
          name: "description",
          label: t("common.description"),
          type: "textarea" as const,
          placeholder: "Optional description for this category",
        },
        {
          name: "sortOrder",
          label: t("entitlements.editions.categories.sortOrder"),
          type: "number" as const,
          defaultValue: 0,
        },
      ],

      editFields: (item: EditionCategory) => [
        {
          name: "name",
          label: t("common.name"),
          type: "text" as const,
          defaultValue: item?.name ?? "",
          required: true,
        },
        {
          name: "displayNameEn",
          label: t("common.displayNameEn"),
          type: "text" as const,
          defaultValue: item?.displayNameEn ?? "",
        },
        {
          name: "displayNameAr",
          label: t("common.displayNameAr"),
          type: "text" as const,
          defaultValue: item?.displayNameAr ?? "",
        },
        {
          name: "description",
          label: t("common.description"),
          type: "textarea" as const,
          defaultValue: item?.description ?? "",
        },
        {
          name: "sortOrder",
          label: t("entitlements.editions.categories.sortOrder"),
          type: "number" as const,
          defaultValue: item?.sortOrder ?? 0,
        },
      ],
      resource: "editions",
      getItemDisplayName: (cat: EditionCategory) => cat.getDisplayName(language),
      deleteService: (id: string) => vm.deleteItem(id),
      getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<EditionCategory>[] => [
        {
          label: tFn("common.edit"),
          onClick: (item: EditionCategory) => vm.openEditModal(item),
          variant: "ghost" as const,
          icon: <Pencil className="h-4 w-4" />,
        },
        {
          label: tFn("common.delete"),
          onClick: (item: EditionCategory) => handleDeleteFn?.(item),
          variant: "ghost" as const,
          className: "text-destructive hover:text-destructive/80",
          icon: <Trash2 className="h-4 w-4" />,
        },
      ],
    }),
    [t, vm, language]
  );

  return <GenericCrudView<EditionCategory> viewModel={vm} config={config} />;
}
