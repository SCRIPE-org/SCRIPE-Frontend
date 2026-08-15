"use client";

import React from "react";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useVenueProfileViewModel } from "../viewmodels/useVenueProfileViewModel";
import type { VenueProfile } from "../../domain/entities/VenueProfile";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";
import { Pencil, Trash2 } from "lucide-react";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";

export const VenueProfileListView = React.memo(function VenueProfileListView() {
  useModuleLocales(() => import("../../../locales"), "venue.venueProfile");
  const { vm, searchSites, siteNameById } = useVenueProfileViewModel();
  const { t, language } = useI18n();

  const config: CrudConfig<VenueProfile> = {
    titleKey: "venueProfile.title",
    subtitleKey: "venueProfile.description",
    resource: "venue-profiles",
    entityTypeKey: "facilityoperations.venue-profile",
    columns: [
      { key: "code", label: t("venueProfile.fields.code"), sortable: true },
      { key: "name", label: t("venueProfile.fields.name"), sortable: true },
      {
        key: "siteId",
        label: t("venueProfile.fields.siteId"),
        render: (value: string) => siteNameById[value] ?? value,
      },
      {
        key: "isActive",
        label: t("venueProfile.fields.isActive"),
        render: (value: boolean) => (
          <Badge variant={value ? "active" : "inactive"}>
            {value ? t("common.active") : t("common.inactive")}
          </Badge>
        ),
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
        name: "siteId",
        label: t("venueProfile.fields.siteId"),
        type: "server-select" as const,
        searchType: "server" as const,
        onServerSearch: searchSites,
        placeholder: t("venueProfile.placeholders.siteId"),
        searchPlaceholder: t("venueProfile.placeholders.siteId"),
        description: t("venueProfile.descriptions.siteId"),
        required: true,
      },
      {
        name: "code",
        label: t("venueProfile.fields.code"),
        type: "text" as const,
        placeholder: t("venueProfile.placeholders.code"),
        required: true,
      },
      {
        name: "name",
        label: t("venueProfile.fields.name"),
        type: "text" as const,
        placeholder: t("venueProfile.placeholders.name"),
        required: true,
      },
      {
        name: "description",
        label: t("venueProfile.fields.description"),
        type: "textarea" as const,
        placeholder: t("venueProfile.placeholders.description"),
      },
    ],
    editFields: [
      { name: "id", type: "hidden" as const, required: true },
      {
        name: "code",
        label: t("venueProfile.fields.code"),
        type: "text" as const,
        placeholder: t("venueProfile.placeholders.code"),
        required: true,
      },
      {
        name: "name",
        label: t("venueProfile.fields.name"),
        type: "text" as const,
        placeholder: t("venueProfile.placeholders.name"),
        required: true,
      },
      {
        name: "description",
        label: t("venueProfile.fields.description"),
        type: "textarea" as const,
        placeholder: t("venueProfile.placeholders.description"),
      },
      {
        name: "isActive",
        label: t("venueProfile.fields.isActive"),
        type: "switch" as const,
      },
    ],
    createInitialValues: {
      siteId: "",
      code: "",
      name: "",
      description: "",
    },
    editInitialValues: (item: VenueProfile) => ({
      id: item.id,
      code: item.code,
      name: item.name,
      description: item.description ?? "",
      isActive: item.isActive,
    }),
    getItemDisplayName: (item: VenueProfile) => item.name,
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<VenueProfile>[] => [
      {
        label: tFn("common.edit"),
        onClick: (item: VenueProfile) => vm.openEditModal(item),
        variant: "ghost" as const,
        icon: <Pencil className="h-4 w-4" />,
        requiredPermission: VENUE_PERMISSIONS.VENUE_PROFILE_UPDATE,
      },
      {
        label: tFn("common.delete"),
        onClick: (item: VenueProfile) => handleDeleteFn?.(item),
        variant: "ghost" as const,
        className: "text-destructive hover:text-destructive/80",
        icon: <Trash2 className="h-4 w-4" />,
        requiredPermission: VENUE_PERMISSIONS.VENUE_PROFILE_DELETE,
      },
    ],
  };

  return <GenericCrudView viewModel={vm} config={config} />;
});
