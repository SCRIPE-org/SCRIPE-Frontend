"use client";

import React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertCircle, CalendarDays, Lock, Plus } from "lucide-react";
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
import { useOperationsCalendarViewModel } from "../viewmodels/useOperationsCalendarViewModel";
import type { CalendarResource } from "../../domain/entities/OperationsCalendar";

export const OperationsCalendarView = React.memo(function OperationsCalendarView() {
  useModuleLocales(() => import("../../../locales"), "venue.operationsCalendar");
  const { t, language, direction } = useI18n();
  const router = useRouter();
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

  const [findSlotsOpen, setFindSlotsOpen] = React.useState(false);

  const [blockTimeOpen, setBlockTimeOpen] = React.useState(false);
  const [blockTimeResource, setBlockTimeResource] = React.useState<CalendarResource | null>(null);
  const [blockTimeInstant, setBlockTimeInstant] = React.useState<string | null>(null);

  const searchParams = useSearchParams();

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

  const facilityResources = vm.allResources.filter((resource) => resource.facilityId === vm.facilityId && resource.timeZoneId === vm.timeZoneId);

  const handleOpenNewBooking = React.useCallback(() => {
    if (facilityResources.length > 0) {
      setSelectedResource(facilityResources[0]);
      setSelectedInstant(null);
      setClickToBookOpen(true);
    }
  }, [facilityResources]);

  React.useEffect(() => {
    if (!searchParams) return;
    const shouldOpen = searchParams.get("newBooking") === "true" || searchParams.get("action") === "new-booking";
    if (shouldOpen && facilityResources.length > 0) {
      const resourceIdParam = searchParams.get("resourceId");
      const matched = resourceIdParam
        ? facilityResources.find((r) => r.id === resourceIdParam) ?? facilityResources[0]
        : facilityResources[0];
      setSelectedResource(matched);
      setSelectedInstant(null);
      setClickToBookOpen(true);
    }
  }, [searchParams, facilityResources]);

  if (!canView) return <EmptyState icon={Lock} title={t("operationsCalendar.permission.title")} description={t("operationsCalendar.permission.description")} />;
  if (vm.setupLoading) return <LoadingSpinner showText={false} />;
  if (vm.state.stage === "featureUnavailable") return <EmptyState icon={Lock} title={t("operationsCalendar.feature.title")} description={t("operationsCalendar.feature.description")} />;

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
        hasBookingReadyCourts={facilityResources.length > 0}
        onDateChange={vm.setDate}
        onFacilityChange={vm.setFacilityId}
        onTimeZoneChange={vm.setTimeZoneId}
        onResourceChange={vm.setResourceId}
        onPrevious={vm.previousDay}
        onNext={vm.nextDay}
        onToday={vm.goToday}
        onRefresh={() => void vm.refresh()}
        onBlockTime={() => handleOpenBlockTime(null, null)}
        onNewBooking={handleOpenNewBooking}
      />

      {vm.resourcesTruncated && <Alert variant="warning"><AlertDescription>{t("operationsCalendar.timeline.truncatedResources")}</AlertDescription></Alert>}
      {vm.state.day?.isTruncated && <Alert variant="warning"><AlertDescription>{t("operationsCalendar.timeline.truncatedBlocks")}</AlertDescription></Alert>}
      {vm.state.stage === "error" && <EmptyState icon={AlertCircle} title={t("operationsCalendar.error.title")} description={vm.state.errorMessage ?? t("operationsCalendar.error.description")} action={<Button variant="outline" onClick={() => void vm.refresh()}>{t("operationsCalendar.error.retry")}</Button>} />}
      {vm.state.stage === "loading" && !vm.state.day && <LoadingSpinner showText={false} />}
      {!vm.state.day && vm.state.stage === "empty" && <EmptyResourcesState t={t} />}
      {vm.state.day && (
        <div className="flex flex-col lg:flex-row gap-5 items-start">
          <div className="flex-1 min-w-0 w-full space-y-3">
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
          </div>

          <CalendarRightUtilityPanel
            currentDate={vm.date}
            onDateChange={vm.setDate}
            onNewBooking={() => {
              if (vm.visibleResources.length > 0) {
                handleEmptySlot(vm.visibleResources[0], new Date().toISOString());
              } else {
                setClickToBookOpen(true);
              }
            }}
            onBlockTime={() => handleOpenBlockTime(null, null)}
            onViewToday={vm.goToday}
            onFindSlots={() => setFindSlotsOpen(true)}
            statusCounts={{
              inUse: vm.state.day?.blocks.filter((b) => b.status === "CheckedIn").length || 0,
              noActiveBooking: Math.max(
                0,
                vm.visibleResources.length -
                  (vm.state.day?.blocks.filter((b) => {
                    const nowMs = Date.now();
                    const s = Date.parse(b.startUtc);
                    const e = Date.parse(b.endUtc);
                    return (
                      s <= nowMs &&
                      nowMs < e &&
                      (b.status === "CheckedIn" ||
                        b.status === "Confirmed" ||
                        (b.status as string) === "Maintenance" ||
                        (b.status as string) === "Blocked")
                    );
                  }).length || 0)
              ),
              maintenance:
                vm.state.day?.blocks.filter(
                  (b) =>
                    (b.status as string) === "Maintenance" ||
                    (b.status as string) === "Blocked" ||
                    (b.status as string) === "Unavailable"
                ).length || 0,
            }}
            t={t}
          />
        </div>
      )}

      {/* Click-To-Book Modal */}
      <ClickToBookModal
        open={clickToBookOpen}
        onOpenChange={setClickToBookOpen}
        resource={selectedResource}
        instantUtc={selectedInstant}
        timeZoneId={vm.timeZoneId}
        resources={vm.visibleResources}
        initialCustomerId={searchParams?.get("customerId")}
        onSuccess={() => void vm.refresh()}
        onBlockTime={(res, instant) => handleOpenBlockTime(res, instant)}
        onFindSlots={() => {
          setClickToBookOpen(false);
          setFindSlotsOpen(true);
        }}
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

      {/* Find Available Slots Modal */}
      <FindAvailableSlotsModal
        open={findSlotsOpen}
        onOpenChange={setFindSlotsOpen}
        resources={vm.visibleResources}
        currentDate={vm.date}
        timeZoneId={vm.timeZoneId}
        onSelectSlot={(res, instant) => handleEmptySlot(res, instant)}
      />
    </div>
  );
});

function EmptyResourcesState({ t }: { t: (key: string, params?: Record<string, string | number>) => string }) {
  return (
    <EmptyState
      icon={CalendarDays}
      title={t("operationsCalendar.empty.title")}
      description={t("operationsCalendar.empty.description")}
      action={
        <Button asChild>
          <Link href="/venue/resources?setup=new">
            <Plus className="size-4 me-1.5" />
            {t("operationsCalendar.empty.action") || "Add Court / Space"}
          </Link>
        </Button>
      }
    />
  );
}
