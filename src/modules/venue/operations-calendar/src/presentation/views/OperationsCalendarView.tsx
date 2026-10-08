"use client";

import React from "react";
import { AlertCircle, CalendarDays, Lock } from "lucide-react";
import { Alert, AlertDescription } from "@core/ui/alert";
import { Button } from "@core/ui/button";
import { EmptyState } from "@core/ui/empty-state";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PageHeader } from "@core/ui/page-header";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { CalendarToolbar } from "../components/CalendarToolbar";
import { ResourceTimeline } from "../components/ResourceTimeline";
import { ClickToBookModal } from "../components/ClickToBookModal";
import { BlockTimeModal } from "../components/BlockTimeModal";
import { useOperationsCalendarViewModel } from "../viewmodels/useOperationsCalendarViewModel";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";

/**
 * Documentation for module export
 */
export const OperationsCalendarView = React.memo(function OperationsCalendarView() {
  useModuleLocales(() => import("../../../locales"), "venue.operationsCalendar");
  const { t, language, direction } = useI18n();
  const vm = useOperationsCalendarViewModel();
  const canViewReservations = usePermission(VENUE_PERMISSIONS.RESERVATION_VIEW);
  const canViewFacilities = usePermission(VENUE_PERMISSIONS.FACILITY_VIEW);
  const canViewProfiles = usePermission(VENUE_PERMISSIONS.FACILITY_RESOURCE_PROFILE_VIEW);
  const canViewResources = usePermission(VENUE_PERMISSIONS.SCHEDULABLE_RESOURCE_VIEW);
  const canViewCustomer = usePermission(VENUE_PERMISSIONS.CUSTOMER_PARTY_VIEW);
  const canCreateReservation = usePermission(VENUE_PERMISSIONS.RESERVATION_CREATE);
  const canCreateHold = usePermission(VENUE_PERMISSIONS.BOOKING_HOLD_CREATE);
  const canSearchAvailability = usePermission(VENUE_PERMISSIONS.AVAILABILITY_SEARCH_VIEW);
  const canCreate = canCreateReservation && canCreateHold && canSearchAvailability && canViewCustomer;
  const canView = canViewReservations && canViewFacilities && canViewProfiles && canViewResources;

  // Click-to-book & Block-time modal states
  const [clickToBookOpen, setClickToBookOpen] = React.useState(false);
  const [selectedResource, setSelectedResource] = React.useState<CalendarResource | null>(null);
  const [selectedInstant, setSelectedInstant] = React.useState<string | null>(null);

  const [blockTimeOpen, setBlockTimeOpen] = React.useState(false);
  const [blockTimeResource, setBlockTimeResource] = React.useState<CalendarResource | null>(null);
  const [blockTimeInstant, setBlockTimeInstant] = React.useState<string | null>(null);

  const handleEmptySlot = React.useCallback((resource: CalendarResource, instantUtc: string) => {
    setSelectedResource(resource);
    setSelectedInstant(instantUtc);
    setClickToBookOpen(true);
  }, []);

  const handleOpenBlockTime = React.useCallback((resource?: CalendarResource | null, instantUtc?: string | null) => {
    setBlockTimeResource(resource ?? null);
    setBlockTimeInstant(instantUtc ?? null);
    setBlockTimeOpen(true);
  }, []);

  if (!canView) return <EmptyState icon={Lock} title={t("operationsCalendar.permission.title")} description={t("operationsCalendar.permission.description")} />;
  if (vm.setupLoading) return <LoadingSpinner showText={false} />;
  if (vm.state.stage === "featureUnavailable") return <EmptyState icon={Lock} title={t("operationsCalendar.feature.title")} description={t("operationsCalendar.feature.description")} />;

  const facilityResources = vm.allResources.filter((resource) => resource.facilityId === vm.facilityId && resource.timeZoneId === vm.timeZoneId);
  return (
    <div className="space-y-5" dir={direction} data-testid="operations-calendar-view">
      <PageHeader icon={CalendarDays} title={t("operationsCalendar.title")} description={t("operationsCalendar.description")} />
      <CalendarToolbar
        t={t}
        date={vm.date}
        facilityId={vm.facilityId}
        timeZoneId={vm.timeZoneId}
        resourceId={vm.resourceId}
        facilities={vm.facilities.filter((facility) => vm.allResources.some((resource) => resource.facilityId === facility.id))}
        resources={facilityResources}
        timeZones={vm.timeZoneOptions}
        loading={vm.state.stage === "loading"}
        onDateChange={vm.setDate}
        onFacilityChange={vm.setFacilityId}
        onTimeZoneChange={vm.setTimeZoneId}
        onResourceChange={vm.setResourceId}
        onPrevious={vm.previousDay}
        onNext={vm.nextDay}
        onToday={vm.goToday}
        onRefresh={() => void vm.refresh()}
        onBlockTime={() => handleOpenBlockTime(null, null)}
      />

      {vm.resourcesTruncated && <Alert variant="warning"><AlertDescription>{t("operationsCalendar.timeline.truncatedResources")}</AlertDescription></Alert>}
      {vm.state.day?.isTruncated && <Alert variant="warning"><AlertDescription>{t("operationsCalendar.timeline.truncatedBlocks")}</AlertDescription></Alert>}
      {vm.state.stage === "error" && <EmptyState icon={AlertCircle} title={t("operationsCalendar.error.title")} description={vm.state.errorMessage ?? t("operationsCalendar.error.description")} action={<Button variant="outline" onClick={() => void vm.refresh()}>{t("operationsCalendar.error.retry")}</Button>} />}
      {vm.state.stage === "loading" && !vm.state.day && <LoadingSpinner showText={false} />}
      {!vm.state.day && vm.state.stage === "empty" && <EmptyResourcesState t={t} />}
      {vm.state.day && (
        <>
          {vm.state.day.blocks.length === 0 && <p className="text-sm text-nx-ink-2">{t("operationsCalendar.timeline.noOccupancy")}</p>}
          <ResourceTimeline
            day={vm.state.day}
            resources={vm.visibleResources}
            locale={language}
            direction={direction}
            canCreate={canCreate}
            t={t}
            onOpen={vm.openBlock}
            onEmptySlot={handleEmptySlot}
          />
        </>
      )}

      {/* Click-To-Book Modal */}
      <ClickToBookModal
        open={clickToBookOpen}
        onOpenChange={setClickToBookOpen}
        resource={selectedResource}
        instantUtc={selectedInstant}
        timeZoneId={vm.timeZoneId}
        onSuccess={() => void vm.refresh()}
        onBlockTime={(res, instant) => handleOpenBlockTime(res, instant)}
      />

      {/* Block Time Modal */}
      <BlockTimeModal
        open={blockTimeOpen}
        onOpenChange={setBlockTimeOpen}
        resource={blockTimeResource}
        instantUtc={blockTimeInstant}
        resources={facilityResources}
        timeZoneId={vm.timeZoneId}
        onSuccess={() => void vm.refresh()}
      />
    </div>
  );
});

function EmptyResourcesState({ t }: { t: (key: string) => string }) {
  return <EmptyState icon={CalendarDays} title={t("operationsCalendar.empty.title")} description={t("operationsCalendar.empty.description")} />;
}
