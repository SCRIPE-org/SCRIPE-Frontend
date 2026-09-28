"use client";

import React, { useState } from "react";
import { AlertCircle, CalendarClock } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { Label } from "@core/ui/label";
import { PageHeader } from "@core/ui/page-header";
import { GenericSelect } from "@core/crud/components/generic-select";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { useAvailabilityViewModel } from "../viewmodels/useAvailabilityViewModel";
import { ResourceBlocksPanel } from "../components/ResourceBlocksPanel";
import { WeeklyWindowsEditorCard } from "../components/WeeklyWindowsEditorCard";
import { AvailabilitySearchCard } from "../components/AvailabilitySearchCard";
import { VenueResourceNav } from "@modules/venue/shared/src/presentation/components/VenueResourceNav";

export const AvailabilityView = React.memo(function AvailabilityView() {
  useModuleLocales(() => import("../../../locales"), "venue.availability");
  const { t } = useI18n();
  const vm = useAvailabilityViewModel();
  const canView = usePermission(VENUE_PERMISSIONS.AVAILABILITY_CALENDAR_VIEW);
  const canCreate = usePermission(VENUE_PERMISSIONS.AVAILABILITY_CALENDAR_CREATE);
  const canUpdate = usePermission(VENUE_PERMISSIONS.AVAILABILITY_CALENDAR_UPDATE);
  const canSearch = usePermission(VENUE_PERMISSIONS.AVAILABILITY_SEARCH_VIEW);

  const [timeZoneId, setTimeZoneId] = useState("UTC");

  const resourceOptions = vm.resources.map((resource) => ({
    value: resource.id,
    label: resource.name,
  }));

  const canSave = vm.calendar ? canUpdate : canCreate;

  if (!canView) {
    return (
      <EmptyState
        icon={CalendarClock}
        title={t("notAuthorized.title")}
        description={t("notAuthorized.description")}
      />
    );
  }

  return (
    <div className="space-y-6">
      <VenueResourceNav />
      <PageHeader
        icon={CalendarClock}
        title={t("availability.title")}
        description={t("availability.description")}
      />

      <div className="max-w-xl space-y-2">
        <Label>{t("availability.resource")}</Label>
        <GenericSelect
          type="searchable"
          searchType="client"
          allowClear={false}
          aria-label={t("availability.resource")}
          options={resourceOptions}
          value={vm.selectedResourceId}
          onValueChange={(value: string | string[]) =>
            vm.setSelectedResourceId(Array.isArray(value) ? value[0] ?? "" : value)
          }
          placeholder={t("availability.selectResource")}
        />
      </div>

      {vm.error && (
        <EmptyState
          icon={AlertCircle}
          title={t("common.error")}
          description={vm.error.message}
          action={
            <Button variant="outline" onClick={() => void vm.refresh()}>
              {t("common.retry")}
            </Button>
          }
        />
      )}

      {!vm.error && vm.resources.length === 0 && (
        <EmptyState
          icon={CalendarClock}
          title={t("availability.noResources")}
          description={t("availability.noResourcesDescription")}
        />
      )}

      {vm.selectedResource && (
        <>
          {!vm.selectedResource.isPublished && (
            <Alert variant="warning">
              <AlertCircle />
              <AlertTitle>{t("availability.draftTitle")}</AlertTitle>
              <AlertDescription>{t("availability.draftDescription")}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
            <WeeklyWindowsEditorCard
              vm={vm}
              canSave={canSave}
              timeZoneId={timeZoneId}
              onTimeZoneChange={setTimeZoneId}
            />

            <AvailabilitySearchCard
              vm={vm}
              timeZoneId={timeZoneId}
              canSearch={canSearch}
            />
          </div>

          <ResourceBlocksPanel
            resourceId={vm.selectedResourceId}
            timeZoneId={timeZoneId}
            blackouts={vm.blackouts}
            maintenanceBlocks={vm.maintenanceBlocks}
            saving={vm.saving}
            onSave={vm.saveBlock}
            onDelete={vm.deleteBlock}
          />
        </>
      )}
    </div>
  );
});
