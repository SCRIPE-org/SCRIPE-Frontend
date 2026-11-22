"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
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
import { CalendarRightUtilityPanel } from "../components/CalendarRightUtilityPanel";
import { ClickToBookModal } from "../components/ClickToBookModal";
import { BlockTimeModal } from "../components/BlockTimeModal";
import { FindAvailableSlotsModal } from "../components/FindAvailableSlotsModal";
import { MaintenanceClosureDrawer } from "../components/MaintenanceClosureDrawer";
import { CalendarEmptyResourcesState } from "../components/CalendarEmptyResourcesState";
import {
  cleanModalActionParams,
  useCalendarDeepLinks,
} from "../viewmodels/useCalendarDeepLinks";
import { useOperationsCalendarViewModel } from "../viewmodels/useOperationsCalendarViewModel";
import {
  computeCalendarStatusCounts,
  type CalendarResource,
} from "../../domain/entities/OperationsCalendar";

/**
 * Primary multi-resource operations calendar page view.
 */
export const OperationsCalendarView = React.memo(function OperationsCalendarView() {
  useModuleLocales(() => import("../../../locales"), "venue.operationsCalendar");
  const { t, language, direction } = useI18n();
  const vm = useOperationsCalendarViewModel();
  const facilityResources = vm.facilityResources ?? vm.visibleResources;
  const searchParams = useSearchParams();

  const canView =
    usePermission(VENUE_PERMISSIONS.RESERVATION_VIEW) &&
    usePermission(VENUE_PERMISSIONS.FACILITY_VIEW) &&
    usePermission(VENUE_PERMISSIONS.FACILITY_RESOURCE_PROFILE_VIEW) &&
    usePermission(VENUE_PERMISSIONS.SCHEDULABLE_RESOURCE_VIEW);
  const canCreate =
    usePermission(VENUE_PERMISSIONS.RESERVATION_CREATE) &&
    usePermission(VENUE_PERMISSIONS.BOOKING_HOLD_CREATE) &&
    usePermission(VENUE_PERMISSIONS.AVAILABILITY_SEARCH_VIEW) &&
    usePermission(VENUE_PERMISSIONS.CUSTOMER_PARTY_VIEW);
  const canCreateMaintenanceBlock = usePermission(VENUE_PERMISSIONS.MAINTENANCE_BLOCK_CREATE);

  const [clickToBookOpen, setClickToBookOpen] = React.useState(false);
  const [selectedResource, setSelectedResource] = React.useState<CalendarResource | null>(null);
  const [selectedInstant, setSelectedInstant] = React.useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = React.useState<number>(60);
  const [courtNotReadyNotice, setCourtNotReadyNotice] = React.useState<string | null>(null);
  const [findSlotsOpen, setFindSlotsOpen] = React.useState(false);
  const [blockTimeOpen, setBlockTimeOpen] = React.useState(false);
  const [blockTimeResource, setBlockTimeResource] = React.useState<CalendarResource | null>(null);
  const [blockTimeInstant, setBlockTimeInstant] = React.useState<string | null>(null);

  useCalendarDeepLinks({
    searchParams,
    canCreate,
    allResources: vm.allResources,
    facilityResources,
    facilityId: vm.facilityId,
    timeZoneId: vm.timeZoneId,
    setFacilityId: vm.setFacilityId,
    setDate: vm.setDate,
    setSelectedResource,
    setSelectedInstant,
    setSelectedDuration,
    setClickToBookOpen,
    setFindSlotsOpen,
    setCourtNotReadyNotice,
    t,
  });

  const handleEmptySlot = React.useCallback(
    (resource: CalendarResource, instantUtc: string, durationMinutes?: number) => {
      if (resource.priceEffectiveFromUtc && Date.parse(resource.priceEffectiveFromUtc) > Date.now()) {
        setCourtNotReadyNotice(t("operationsCalendar.readiness.courtActivating"));
        return;
      }
      setSelectedResource(resource);
      setSelectedInstant(instantUtc);
      setSelectedDuration(durationMinutes ?? resource.slotPolicy?.slotDurationMinutes ?? 60);
      setClickToBookOpen(true);
    },
    [t],
  );

  const handleOpenBlockTime = React.useCallback(
    (resource?: CalendarResource | null, instantUtc?: string | null) => {
      setBlockTimeResource(resource ?? null);
      setBlockTimeInstant(instantUtc ?? null);
      setBlockTimeOpen(true);
    },
    [],
  );

  const handleOpenNewBooking = React.useCallback(() => {
    if (!canCreate) return;
    const ready = facilityResources.find(
      (r) => !r.priceEffectiveFromUtc || Date.parse(r.priceEffectiveFromUtc) <= Date.now(),
    );
    if (ready) {
      setSelectedResource(ready);
      setSelectedInstant(null);
      setSelectedDuration(ready.slotPolicy?.slotDurationMinutes ?? 60);
      setClickToBookOpen(true);
    } else if (facilityResources.length > 0) {
      setCourtNotReadyNotice(t("operationsCalendar.readiness.courtActivating"));
    }
  }, [canCreate, facilityResources, t]);

  if (!canView) {
    return (
      <EmptyState
        icon={Lock}
        title={t("operationsCalendar.permission.title")}
        description={t("operationsCalendar.permission.description")}
      />
    );
  }
  if (vm.setupLoading) return <LoadingSpinner showText={false} />;
  if (vm.state.stage === "featureUnavailable") {
    return (
      <EmptyState
        icon={Lock}
        title={t("operationsCalendar.feature.title")}
        description={t("operationsCalendar.feature.description")}
      />
    );
  }

  return (
    <div className="space-y-5" dir={direction} data-testid="operations-calendar-view">
      <PageHeader
        icon={CalendarDays}
        title={t("operationsCalendar.title")}
        description={t("operationsCalendar.description")}
      />
      {courtNotReadyNotice && (
        <Alert variant="warning">
          <AlertCircle className="size-4" />
          <AlertDescription>{courtNotReadyNotice}</AlertDescription>
        </Alert>
      )}
      <CalendarToolbar
        t={t}
        date={vm.date}
        facilityId={vm.facilityId}
        timeZoneId={vm.timeZoneId}
        resourceId={vm.resourceId}
        facilities={vm.facilities}
        resources={facilityResources}
        timeZones={vm.timeZoneOptions}
        loading={vm.state.stage === "loading"}
        hasBookingReadyCourts={facilityResources.some(
          (r) => !r.priceEffectiveFromUtc || Date.parse(r.priceEffectiveFromUtc) <= Date.now(),
        )}
        onDateChange={vm.setDate}
        onFacilityChange={vm.setFacilityId}
        onTimeZoneChange={vm.setTimeZoneId}
        onResourceChange={vm.setResourceId}
        onPrevious={vm.previousDay}
        onNext={vm.nextDay}
        onToday={vm.goToday}
        onRefresh={() => void vm.refresh()}
        onBlockTime={canCreateMaintenanceBlock ? () => handleOpenBlockTime(null, null) : undefined}
        onFindSlots={() => setFindSlotsOpen(true)}
        onNewBooking={canCreate ? handleOpenNewBooking : undefined}
      />

      {vm.resourcesTruncated && (
        <Alert variant="warning">
          <AlertDescription>{t("operationsCalendar.timeline.truncatedResources")}</AlertDescription>
        </Alert>
      )}
      {vm.state.day?.isTruncated && (
        <Alert variant="warning">
          <AlertDescription>{t("operationsCalendar.timeline.truncatedBlocks")}</AlertDescription>
        </Alert>
      )}
      {vm.state.stage === "error" && (
        <EmptyState
          icon={AlertCircle}
          title={t("operationsCalendar.error.title")}
          description={vm.state.errorMessage ?? t("operationsCalendar.error.description")}
          action={
            <Button variant="outline" onClick={() => void vm.refresh()}>
              {t("operationsCalendar.error.retry")}
            </Button>
          }
        />
      )}
      {vm.state.stage === "loading" && !vm.state.day && <LoadingSpinner showText={false} />}
      {!vm.state.day && vm.state.stage === "empty" && (
        <CalendarEmptyResourcesState t={t} hasAnyResources={vm.allResources.length > 0} />
      )}
      {vm.state.day && (
        <div className="flex flex-col items-start gap-5 lg:flex-row">
          <div className="w-full min-w-0 flex-1 space-y-3">
            {vm.state.day.blocks.length === 0 && (
              <p className="text-sm text-nx-ink-2">
                {t("operationsCalendar.timeline.noOccupancy")}
              </p>
            )}
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
          </div>

          <CalendarRightUtilityPanel
            currentDate={vm.date}
            onDateChange={vm.setDate}
            onNewBooking={handleOpenNewBooking}
            onBlockTime={() => handleOpenBlockTime(null, null)}
            onViewToday={vm.goToday}
            onFindSlots={() => setFindSlotsOpen(true)}
            statusCounts={computeCalendarStatusCounts(
              vm.state.day.blocks,
              vm.visibleResources.length,
            )}
            t={t}
          />
        </div>
      )}

      <ClickToBookModal
        open={clickToBookOpen}
        onOpenChange={(open) => {
          setClickToBookOpen(open);
          if (!open) {
            setSelectedInstant(null);
            cleanModalActionParams();
          }
        }}
        resource={selectedResource}
        instantUtc={selectedInstant}
        timeZoneId={vm.timeZoneId}
        durationMinutes={selectedDuration}
        resources={facilityResources}
        initialCustomerId={searchParams?.get("customerPartyId") || searchParams?.get("customerId")}
        onSuccess={() => void vm.refresh()}
        onBlockTime={(res, instant) => handleOpenBlockTime(res, instant)}
        onFindSlots={() => {
          setClickToBookOpen(false);
          setFindSlotsOpen(true);
        }}
      />
      <BlockTimeModal
        open={blockTimeOpen}
        onOpenChange={setBlockTimeOpen}
        resource={blockTimeResource}
        instantUtc={blockTimeInstant}
        resources={facilityResources}
        timeZoneId={vm.timeZoneId}
        onSuccess={() => void vm.refresh()}
      />
      <FindAvailableSlotsModal
        open={findSlotsOpen}
        onOpenChange={setFindSlotsOpen}
        resources={vm.visibleResources}
        currentDate={vm.date}
        timeZoneId={vm.timeZoneId}
        onSelectSlot={(res, instant, dur) => handleEmptySlot(res, instant, dur)}
      />
      <MaintenanceClosureDrawer
        closure={vm.selectedClosure}
        allResources={vm.allResources}
        timeZoneId={vm.timeZoneId}
        locale={language}
        onClose={vm.closeClosure}
        t={t}
      />
    </div>
  );
});
