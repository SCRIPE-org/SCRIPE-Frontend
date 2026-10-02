"use client";

import React, { useState } from "react";
import { Building2, Clock3, Lock, Pencil, Plus, Tag } from "lucide-react";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PageHeader } from "@core/ui/page-header";
import { GenericSelect } from "@core/crud/components/generic-select";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { VenueResourceNav } from "@modules/venue/shared/src/presentation/components/VenueResourceNav";
import type { FacilityResourceProfile } from "../../domain/entities/FacilityResourceProfile";
import { useFacilityResourceProfilesViewModel } from "../viewmodels/useFacilityResourceProfilesViewModel";
import { FacilityResourceProfileDialog } from "../dialogs/FacilityResourceProfileDialog";
import { FacilityQuickCreateDialog } from "@modules/venue/facility/src/presentation/components/FacilityQuickCreateDialog";

export const FacilityResourceProfilesView = React.memo(function FacilityResourceProfilesView() {
  useModuleLocales(() => import("../../../locales"), "venue.resourceProfile");
  const { t } = useI18n();
  const vm = useFacilityResourceProfilesViewModel();
  const canView = usePermission(VENUE_PERMISSIONS.FACILITY_RESOURCE_PROFILE_VIEW);
  const canCreate = usePermission(VENUE_PERMISSIONS.FACILITY_RESOURCE_PROFILE_CREATE);
  const canUpdate = usePermission(VENUE_PERMISSIONS.FACILITY_RESOURCE_PROFILE_UPDATE);
  const canCreateFacility = usePermission(VENUE_PERMISSIONS.FACILITY_CREATE);
  const { error: toastError } = useEnhancedToast();
  const [open, setOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<FacilityResourceProfile | undefined>();
  const [quickCreateFacilityOpen, setQuickCreateFacilityOpen] = useState(false);

  const facilityOptions = vm.facilities.map((facility) => ({
    value: facility.id,
    label: facility.name ? `${facility.name} (${facility.code})` : facility.code || facility.id,
  }));

  if (!canView) {
    return <EmptyState icon={Lock} title={t("notAuthorized.title")} description={t("notAuthorized.description")} />;
  }

  if (vm.loading && vm.facilities.length === 0) return <LoadingSpinner showText={false} />;

  const beginCreate = () => { setEditingProfile(undefined); setOpen(true); };

  const beginEdit = async (profile: FacilityResourceProfile) => {
    try {
      const detail = await vm.loadDetail(profile.id);
      setEditingProfile(detail);
      setOpen(true);
    } catch (caught) {
      toastError({ title: caught instanceof Error ? caught.message : t("common.error") });
    }
  };

  return (
    <div className="space-y-6">
      <VenueResourceNav />
      <PageHeader
        icon={Building2}
        title={t("resourceProfile.title")}
        description={t("resourceProfile.description")}
        actions={
          canCreate ? (
            <Button onClick={beginCreate}>
              <Plus className="size-4" />
              {t("resourceProfile.add")}
            </Button>
          ) : undefined
        }
      />

      <div className="flex max-w-xl items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label>{t("resourceProfile.facility")}</Label>
          <GenericSelect
            type="searchable"
            searchType="client"
            allowClear={false}
            aria-label={t("resourceProfile.facility")}
            options={facilityOptions}
            value={vm.selectedFacilityId}
            onValueChange={(value: string | string[]) =>
              vm.setSelectedFacilityId(Array.isArray(value) ? value[0] ?? "" : value)
            }
            placeholder={t("resourceProfile.selectFacility")}
          />
        </div>
        {canCreateFacility && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setQuickCreateFacilityOpen(true)}
            className="shrink-0 gap-1.5"
          >
            <Plus className="size-4" />
            {t("facility.addNew") || "New Facility"}
          </Button>
        )}
      </div>

      {vm.error && (
        <EmptyState
          icon={Building2}
          title={t("common.error")}
          description={vm.error.message}
          action={<Button variant="outline" onClick={() => void vm.refresh()}>{t("common.retry")}</Button>}
        />
      )}
      {!vm.error && !vm.loading && vm.facilities.length === 0 && (
        <EmptyState
          icon={Building2}
          title={t("resourceProfile.noFacilities")}
          description={t("resourceProfile.noFacilitiesDescription")}
          action={<Button onClick={() => setQuickCreateFacilityOpen(true)}><Plus className="mr-1 size-4" />{t("facility.addNew") || "New Facility"}</Button>}
        />
      )}
      {!vm.error && vm.selectedFacilityId && vm.profiles.length === 0 && (
        <EmptyState icon={Building2} title={t("resourceProfile.empty")} description={t("resourceProfile.emptyDescription")} />
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {vm.profiles.map((profile) => (
          <Card key={profile.id}>
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div>
                <CardTitle>{profile.name}</CardTitle>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="secondary">{profile.code}</Badge>
                  <Badge variant="outline">{profile.resourceKindCode}</Badge>
                </div>
              </div>
              {canUpdate && (
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t("common.edit")}
                  onClick={() => void beginEdit(profile)}
                >
                  <Pencil className="size-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-nx-ink-2">
              {profile.description && <p>{profile.description}</p>}
              <p className="flex items-center gap-2">
                <Clock3 className="size-4" />
                {t("resourceProfile.detailsOpen")}
              </p>
              <p className="flex items-center gap-2">
                <Tag className="size-4" />
                {t("resourceProfile.detailsUsage")}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <FacilityResourceProfileDialog
        open={open}
        onOpenChange={setOpen}
        facilityId={vm.selectedFacilityId}
        facilities={vm.facilities}
        editingProfile={editingProfile}
        onSave={vm.save}
        onFacilityCreated={(createdId) => {
          void vm.refresh();
          vm.setSelectedFacilityId(createdId);
        }}
      />
      <FacilityQuickCreateDialog
        open={quickCreateFacilityOpen}
        onOpenChange={setQuickCreateFacilityOpen}
        onSuccess={(createdId) => {
          void vm.refresh();
          vm.setSelectedFacilityId(createdId);
        }}
      />
    </div>
  );
});
