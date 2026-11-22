"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GenericCrudView } from "@core/crud/components/generic-crud-view";
import type { CrudConfig, CrudAction } from "@core/crud/components/generic-crud-view";
import { useFacilityViewModel } from "../viewmodels/useFacilityViewModel";
import type { Facility } from "../../domain/entities/Facility";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { useI18n } from "@core/providers/i18n-provider";
import { resolveIntlLocale } from "@core/common/utils";
import { Pencil, Trash2, Plus, Building2, MapPin, CalendarDays, GitFork } from "lucide-react";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueResourceNav } from "@modules/venue";
import { VenueProfileQuickCreateDialog } from "@modules/venue";
import { SiteListView } from "@modules/venue";
import { Tabs, TabsList, TabsTrigger } from "@core/ui/tabs";

/**
 * Unified Branches & Facilities operational view.
 */
export const FacilityListView = React.memo(function FacilityListView() {
  useModuleLocales(() => import("../../../locales"), "venue.facility");
  const { vm, searchVenueProfiles, venueProfileNameById } = useFacilityViewModel();
  const { t, language } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState<"facilities" | "sites">(() => {
    const tabParam = searchParams?.get("tab");
    return tabParam === "sites" || tabParam === "campuses" ? "sites" : "facilities";
  });

  useEffect(() => {
    const tabParam = searchParams?.get("tab");
    if (tabParam === "sites" || tabParam === "campuses") {
      setActiveTab("sites");
    } else if (tabParam === "facilities") {
      setActiveTab("facilities");
    }
  }, [searchParams]);

  const [quickCreateVenueProfileOpen, setQuickCreateVenueProfileOpen] = React.useState(false);

  const config: CrudConfig<Facility> = {
    titleKey: "facility.title",
    subtitleKey: "facility.description",
    resource: "facilities",
    entityTypeKey: "facilityoperations.facility",
    permissions: {
      canView: VENUE_PERMISSIONS.FACILITY_VIEW,
      canCreate: VENUE_PERMISSIONS.FACILITY_CREATE,
      canUpdate: VENUE_PERMISSIONS.FACILITY_UPDATE,
      canDelete: VENUE_PERMISSIONS.FACILITY_DELETE,
    },
    columns: [
      { key: "code", label: t("facility.fields.code"), sortable: true },
      { key: "name", label: t("facility.fields.name"), sortable: true },
      {
        key: "venueProfileId",
        label: t("facility.fields.venueProfileId"),
        render: (_value: string, row: Facility) =>
          row.venueProfileName || venueProfileNameById[row.venueProfileId] || "—",
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
      { name: "rowVersion", type: "hidden" as const },
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
      rowVersion: item.rowVersion,
    }),
    getItemDisplayName: (item: Facility) => item.name,
    deleteService: (id: string) => vm.deleteItem(id),
    getActions: (_vmInstance, tFn, handleDeleteFn): CrudAction<Facility>[] => [
      {
        label: tFn("facility.actions.viewCourts", { defaultValue: "Courts & Spaces" }),
        onClick: (item: Facility) =>
          router.push(`/venue/resources?facilityId=${encodeURIComponent(item.id)}`),
        variant: "ghost" as const,
        icon: <GitFork className="h-4 w-4" />,
        requiredPermission: VENUE_PERMISSIONS.SCHEDULABLE_RESOURCE_VIEW,
      },
      {
        label: tFn("facility.actions.viewCalendar", { defaultValue: "Calendar" }),
        onClick: (item: Facility) =>
          router.push(`/venue/calendar?facilityId=${encodeURIComponent(item.id)}`),
        variant: "ghost" as const,
        icon: <CalendarDays className="h-4 w-4" />,
        requiredPermission: VENUE_PERMISSIONS.RESERVATION_VIEW,
      },
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
    hideAddButton: true,
    customActions: [
      {
        label: t("facility.actions.addFacility", { defaultValue: "+ Add Facility" }),
        onClick: async () => vm.setIsCreateModalOpen(true),
        icon: <Plus className="h-4 w-4" />,
        variant: "default" as const,
        requiredPermission: VENUE_PERMISSIONS.FACILITY_CREATE,
      },
      {
        label: t("facility.quickCreateVenueProfile", { defaultValue: "+ New Branch Profile" }),
        onClick: async () => setQuickCreateVenueProfileOpen(true),
        icon: <Plus className="h-4 w-4" />,
        variant: "outline" as const,
        requiredPermission: VENUE_PERMISSIONS.VENUE_PROFILE_CREATE,
      },
    ],
  };

  const handleTabChange = (value: string) => {
    const next = value === "sites" ? "sites" : "facilities";
    setActiveTab(next);
    router.replace(`/venue/facilities?tab=${next}`);
  };

  return (
    <div className="space-y-4">
      <VenueResourceNav />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="flex h-auto w-full max-w-full justify-start overflow-x-auto border border-nx-line bg-nx-surface p-1 sm:inline-flex sm:w-fit">
          <TabsTrigger value="facilities" className="shrink-0 gap-1.5 text-xs font-semibold">
            <Building2 className="size-3.5" aria-hidden="true" />
            <span>
              {t("facility.tabs.facilities", { defaultValue: "Facilities & Complexes" })}
            </span>
          </TabsTrigger>
          <TabsTrigger value="sites" className="shrink-0 gap-1.5 text-xs font-semibold">
            <MapPin className="size-3.5" aria-hidden="true" />
            <span>
              {t("facility.tabs.sites", { defaultValue: "Campuses & Branches" })}
            </span>
          </TabsTrigger>
        </TabsList>

        {activeTab === "facilities" ? (
          <>
            <GenericCrudView viewModel={vm} config={config} />
            <VenueProfileQuickCreateDialog
              open={quickCreateVenueProfileOpen}
              onOpenChange={setQuickCreateVenueProfileOpen}
              onSuccess={() => {
                void vm.refresh();
              }}
            />
          </>
        ) : (
          <SiteListView hideNav={true} hideHeader={true} hidePageHeader={true} />
        )}
      </Tabs>
    </div>
  );
});
