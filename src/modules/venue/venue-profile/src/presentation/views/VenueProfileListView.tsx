"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useVenueProfileViewModel } from "../viewmodels/useVenueProfileViewModel";
import type { VenueProfile } from "../../domain/entities/VenueProfile";
import { useI18n } from "@core/providers/i18n-provider";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { Badge } from "@core/ui/badge";
import { resolveIntlLocale } from "@core/common/utils";
import { Building2, Pencil, Plus, Trash2 } from "lucide-react";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueResourceNav } from "@modules/venue/shared/src/presentation/components/VenueResourceNav";
import { SiteQuickCreateDialog } from "@modules/venue/site/src/presentation/components/SiteQuickCreateDialog";

export const VenueProfileListView = React.memo(function VenueProfileListView() {
  useModuleLocales(() => import("../../../locales"), "venue.venueProfile");
  const { vm, searchSites, siteNameById, refreshSites } = useVenueProfileViewModel();
  const { t, language } = useI18n();
  const router = useRouter();
  const [quickCreateSiteOpen, setQuickCreateSiteOpen] = useState(false);

  const config: CrudConfig<VenueProfile> = {
    titleKey: "venueProfile.title",
    subtitleKey: "venueProfile.description",
    resource: "venue-profiles",
    entityTypeKey: "facilityoperations.venue-profile",
    permissions: {
      canView: VENUE_PERMISSIONS.VENUE_PROFILE_VIEW,
      canCreate: VENUE_PERMISSIONS.VENUE_PROFILE_CREATE,
      canUpdate: VENUE_PERMISSIONS.VENUE_PROFILE_UPDATE,
      canDelete: VENUE_PERMISSIONS.VENUE_PROFILE_DELETE,
    },
    customActions: [
      {
        label: t("venueProfile.quickCreateSite"),
        onClick: async () => {
          setQuickCreateSiteOpen(true);
        },
        variant: "outline" as const,
        icon: <Plus className="h-4 w-4" />,
        requiredPermission: VENUE_PERMISSIONS.SITE_CREATE,
      },
      {
        label: t("venueProfile.manageSites"),
        onClick: async () => {
          router.push("/venue/sites");
        },
        variant: "outline" as const,
        icon: <Building2 className="h-4 w-4" />,
        requiredPermission: VENUE_PERMISSIONS.SITE_VIEW,
      },
    ],
    columns: [
      { key: "code", label: t("venueProfile.fields.code"), sortable: true },
      { key: "name", label: t("venueProfile.fields.name"), sortable: true },
      {
        key: "siteId",
        label: t("venueProfile.fields.siteId"),
        render: (_value: string, row: VenueProfile) => row.siteName || siteNameById[row.siteId] || "—",
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
      {
        name: "enableGuestExperience",
        label: t("venueProfile.fields.enableGuestExperience", { defaultValue: "Enable Guest Experience" }),
        description: t("venueProfile.descriptions.enableGuestExperience", { defaultValue: "Allow customers to view bookings via secure no-app guest links" }),
        type: "switch" as const,
      },
      {
        name: "exposeCancellationToGuests",
        label: t("venueProfile.fields.exposeCancellationToGuests", { defaultValue: "Allow Guest Self-Service Cancellation" }),
        description: t("venueProfile.descriptions.exposeCancellationToGuests", { defaultValue: "Expose online cancellation on the guest portal" }),
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
      enableGuestExperience: item.enableGuestExperience,
      exposeCancellationToGuests: item.exposeCancellationToGuests,
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

  return (
    <div className="space-y-4">
      <VenueResourceNav />
      <GenericCrudView viewModel={vm} config={config} />
      <SiteQuickCreateDialog
        open={quickCreateSiteOpen}
        onOpenChange={setQuickCreateSiteOpen}
        onSuccess={() => {
          void refreshSites();
        }}
      />
    </div>
  );
});
