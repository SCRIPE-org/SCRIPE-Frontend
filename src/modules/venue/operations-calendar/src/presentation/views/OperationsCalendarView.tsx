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

/**
 * Documentation for module export
 */
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
  const canCreateMaintenanceBlock = usePermission(VENUE_PERMISSIONS.MAINTENANCE_BLOCK_CREATE);
  const canCreate =
    canCreateReservation && canCreateHold && canSearchAvailability && canViewCustomer;
  const canView = canViewReservations && canViewFacilities && canViewProfiles && canViewResources;

  // Click-to-book & Block-time modal states
  const [clickToBookOpen, setClickToBookOpen] = React.useState(false);
  const [selectedResource, setSelectedResource] = React.useState<CalendarResource | null>(null);
  const [selectedInstant, setSelectedInstant] = React.useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = React.useState<number>(60);
  const [courtNotReadyNotice, setCourtNotReadyNotice] = React.useState<string | null>(null);

  const [findSlotsOpen, setFindSlotsOpen] = React.useState(false);

  const [blockTimeOpen, setBlockTimeOpen] = React.useState(false);
  const [blockTimeResource, setBlockTimeResource] = React.useState<CalendarResource | null>(null);
  const [blockTimeInstant, setBlockTimeInstant] = React.useState<string | null>(null);

  const searchParams = useSearchParams();

  const handleEmptySlot = React.useCallback(
    (resource: CalendarResource, instantUtc: string, durationMinutes?: number) => {
      if (
        resource.priceEffectiveFromUtc &&
        Date.parse(resource.priceEffectiveFromUtc) > Date.now()
      ) {
        setCourtNotReadyNotice(
          t("operationsCalendar.readiness.courtActivating", {
            defaultValue:
              "Authoritative pricing for this court is still activating. Bookings will become available once pricing is active.",
          })
        );
        return;
      }
      setSelectedResource(resource);
      setSelectedInstant(instantUtc);
      setSelectedDuration(durationMinutes ?? resource.slotPolicy?.slotDurationMinutes ?? 60);
      setClickToBookOpen(true);
    },
    [t]
  );

  const handleOpenBlockTime = React.useCallback(
    (resource?: CalendarResource | null, instantUtc?: string | null) => {
      setBlockTimeResource(resource ?? null);
      setBlockTimeInstant(instantUtc ?? null);
      setBlockTimeOpen(true);
    },
    []
  );

  const facilityResources = vm.allResources.filter(
    (resource) => resource.facilityId === vm.facilityId && resource.timeZoneId === vm.timeZoneId
  );

  const handleOpenNewBooking = React.useCallback(() => {
    if (!canCreate) return;
    const readyResource = facilityResources.find(
      (r) => !r.priceEffectiveFromUtc || Date.parse(r.priceEffectiveFromUtc) <= Date.now()
    );
    if (readyResource) {
      setSelectedResource(readyResource);
      setSelectedInstant(null);
      setSelectedDuration(readyResource.slotPolicy?.slotDurationMinutes ?? 60);
      setClickToBookOpen(true);
    } else if (facilityResources.length > 0) {
      setCourtNotReadyNotice(
        t("operationsCalendar.readiness.courtActivating", {
          defaultValue:
            "Authoritative pricing for this court is still activating. Bookings will become available once pricing is active.",
        })
      );
    }
  }, [canCreate, facilityResources, t]);

  React.useEffect(() => {
    if (!searchParams || !canCreate) return;
    const shouldOpen =
      searchParams.get("newBooking") === "true" || searchParams.get("action") === "new-booking";
    if (!shouldOpen || vm.allResources.length === 0) return;

    const facilityIdParam = searchParams.get("facilityId");
    const resourceIdParam = searchParams.get("resourceId");
    const dateParam = searchParams.get("date");
    const startTimeParam = searchParams.get("startTime");
    const durationParam = searchParams.get("durationMinutes");

    let targetResource: CalendarResource | null = null;

    if (resourceIdParam) {
      const found = vm.allResources.find((r) => r.id === resourceIdParam);
      if (!found) {
        // Setup Required Court or invalid court: fail-closed, do NOT open booking (Requirement 11)
        setCourtNotReadyNotice(
          t("operationsCalendar.readiness.courtNotReady", {
            defaultValue:
              "Selected court is not ready for bookings. Please complete court setup first.",
          })
        );
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname);
        }
        return;
      }
      if (found.priceEffectiveFromUtc && Date.parse(found.priceEffectiveFromUtc) > Date.now()) {
        setCourtNotReadyNotice(
          t("operationsCalendar.readiness.courtActivating", {
            defaultValue:
              "Authoritative pricing for this court is still activating. Bookings will become available once pricing is active.",
          })
        );
        if (typeof window !== "undefined") {
          window.history.replaceState(null, "", window.location.pathname);
        }
        return;
      }
      targetResource = found;
      // Reconcile branch context deliberately (Requirement 10)
      if (found.facilityId !== vm.facilityId) {
        vm.setFacilityId(found.facilityId);
      }
    } else if (facilityIdParam && facilityIdParam !== vm.facilityId) {
      vm.setFacilityId(facilityIdParam);
      const inBranch = vm.allResources.find((r) => r.facilityId === facilityIdParam);
      targetResource = inBranch ?? vm.allResources[0] ?? null;
    } else {
      targetResource = facilityResources[0] ?? vm.allResources[0] ?? null;
    }

    if (!targetResource) return;

    setSelectedResource(targetResource);

    if (dateParam) {
      vm.setDate(dateParam);
    }

    if (dateParam && startTimeParam) {
      try {
        const instant = new Date(`${dateParam}T${startTimeParam}:00`).toISOString();
        setSelectedInstant(instant);
      } catch {
        setSelectedInstant(null);
      }
    } else {
      setSelectedInstant(null);
    }

    if (durationParam) {
      const dur = Number(durationParam);
      if (Number.isInteger(dur) && dur >= 15) {
        setSelectedDuration(dur);
      } else {
        setSelectedDuration(targetResource.slotPolicy?.slotDurationMinutes ?? 60);
      }
    } else {
      setSelectedDuration(targetResource.slotPolicy?.slotDurationMinutes ?? 60);
    }

    setClickToBookOpen(true);

    // Clean URL query string immediately to avoid stale modal re-trigger on refresh (Requirement 36)
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, [canCreate, searchParams, vm.allResources, vm.facilityId, facilityResources, vm, t]);

  if (!canView)
    return (
      <EmptyState
        icon={Lock}
        title={t("operationsCalendar.permission.title")}
        description={t("operationsCalendar.permission.description")}
      />
    );
  if (vm.setupLoading) return <LoadingSpinner showText={false} />;
  if (vm.state.stage === "featureUnavailable")
    return (
      <EmptyState
        icon={Lock}
        title={t("operationsCalendar.feature.title")}
        description={t("operationsCalendar.feature.description")}
      />
    );

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
          (resource) =>
            !resource.priceEffectiveFromUtc ||
            Date.parse(resource.priceEffectiveFromUtc) <= Date.now()
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
      {!vm.state.day && vm.state.stage === "empty" && <EmptyResourcesState t={t} hasAnyResources={vm.allResources.length > 0} />}
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
        onOpenChange={(open) => {
          setClickToBookOpen(open);
          if (!open) {
            setSelectedInstant(null);
            if (typeof window !== "undefined") {
              window.history.replaceState(null, "", window.location.pathname);
            }
          }
        }}
        resource={selectedResource}
        instantUtc={selectedInstant}
        timeZoneId={vm.timeZoneId}
        durationMinutes={selectedDuration}
        resources={facilityResources}
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
        onSelectSlot={(res, instant, dur) => handleEmptySlot(res, instant, dur)}
      />
    </div>
  );
});

function EmptyResourcesState({
  t,
  hasAnyResources = false,
}: {
  t: (key: string, params?: Record<string, string | number>) => string;
  hasAnyResources?: boolean;
}) {
  return (
    <EmptyState
      icon={CalendarDays}
      title={
        hasAnyResources
          ? t("operationsCalendar.empty.branchEmptyTitle", {
              defaultValue: "No courts found for this facility",
            })
          : t("operationsCalendar.empty.title")
      }
      description={
        hasAnyResources
          ? t("operationsCalendar.empty.branchEmptyDescription", {
              defaultValue:
                "Select another facility using the filter above, or add new courts and spaces to this facility.",
            })
          : t("operationsCalendar.empty.description")
      }
      action={
        <Button asChild>
          <Link href="/venue/resources?setup=new">
            <Plus className="me-1.5 size-4" />
            {t("operationsCalendar.empty.action") || "Add Court / Space"}
          </Link>
        </Button>
      }
    />
  );
}
