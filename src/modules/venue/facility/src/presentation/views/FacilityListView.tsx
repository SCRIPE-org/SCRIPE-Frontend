"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useFacilityViewModel } from "../viewmodels/useFacilityViewModel";
import type { Facility } from "../../domain/entities/Facility";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";
import { Pencil, Trash2 } from "lucide-react";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";

export const FacilityListView = React.memo(function FacilityListView() {
  useModuleLocales(() => import("../../../locales"), "venue.facility");
  const { vm, searchVenueProfiles, venueProfileNameById } = useFacilityViewModel();
  const { t, language } = useI18n();

  const config: CrudConfig<Facility> = {
    titleKey: "facility.title",
    subtitleKey: "facility.description",
    resource: "facilities",
    entityTypeKey: "facilityoperations.facility",
    columns: [
      { key: "code", label: t("facility.fields.code"), sortable: true },
      { key: "name", label: t("facility.fields.name"), sortable: true },
      {
        key: "venueProfileId",
        label: t("facility.fields.venueProfileId"),
        render: (value: string) => venueProfileNameById[value] ?? value,
      },
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
        type: "server-select" as const,
        searchType: "server" as const,
        onServerSearch: searchVenueProfiles,
        placeholder: t("facility.placeholders.venueProfileId"),
        searchPlaceholder: t("facility.placeholders.venueProfileId"),
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
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<Facility>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: Facility) => vm.openEditModal(item),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
        requiredPermission: VENUE_PERMISSIONS.FACILITY_UPDATE,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: Facility) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
        requiredPermission: VENUE_PERMISSIONS.FACILITY_DELETE,
      },
    ],
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
