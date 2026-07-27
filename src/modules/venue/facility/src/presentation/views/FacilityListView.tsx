"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig } from "@core/crud/components/generic-crud-view";
import { useFacilityViewModel } from "../viewmodels/useFacilityViewModel";
import type { Facility } from "../../domain/entities/Facility";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";

export const FacilityListView = React.memo(function FacilityListView() {
  useModuleLocales(() => import("../../../locales"), "venue.facility");
  const { vm } = useFacilityViewModel();
  const { t, language } = useI18n();

  const config: CrudConfig<Facility> = {
    titleKey: "facility.title",
    subtitleKey: "facility.description",
    resource: "facilities",
    columns: [
      { key: "code", label: t("facility.fields.code"), sortable: true },
      { key: "name", label: t("facility.fields.name"), sortable: true },
      { key: "venueProfileId", label: t("facility.fields.venueProfileId") },
      {
        key: "createdAt",
        label: t("common.createdAt"),
        render: (value: string) =>
          value ? new Date(value).toLocaleDateString(resolveIntlLocale(language)) : "-",
      },
    ],
    createFields: [
      {
        name: "venueProfileId",
        label: t("facility.fields.venueProfileId"),
        type: "text" as const,
        placeholder: t("facility.placeholders.venueProfileId"),
        required: true,
      },
      {
        name: "code",
        label: t("facility.fields.code"),
        type: "text" as const,
        placeholder: t("facility.placeholders.code"),
        required: true,
      },
      {
        name: "name",
        label: t("facility.fields.name"),
        type: "text" as const,
        placeholder: t("facility.placeholders.name"),
        required: true,
      },
      {
        name: "description",
        label: t("facility.fields.description"),
        type: "textarea" as const,
        placeholder: t("facility.placeholders.description"),
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "code",
        label: t("facility.fields.code"),
        type: "text" as const,
        placeholder: t("facility.placeholders.code"),
        required: true,
      },
      {
        name: "name",
        label: t("facility.fields.name"),
        type: "text" as const,
        placeholder: t("facility.placeholders.name"),
        required: true,
      },
      {
        name: "description",
        label: t("facility.fields.description"),
        type: "textarea" as const,
        placeholder: t("facility.placeholders.description"),
      },
    ],
    createInitialValues: {
      venueProfileId: "",
      code: "",
      name: "",
      description: "",
    },
    editInitialValues: (item: Facility) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description ?? "",
    }),
    getItemDisplayName: (item: Facility) => item.name,
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
