"use client";

import React, { useEffect, useMemo, useState } from "react";
import { AlertCircle, CalendarClock, CheckCircle2, Clock3, Lock, Plus, Search, Trash2 } from "lucide-react";
import { TimezonePicker } from "@modules/custom-fields";
import { Alert, AlertDescription, AlertTitle } from "@core/ui/alert";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { EmptyState } from "@core/ui/empty-state";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { PageHeader } from "@core/ui/page-header";
import { GenericSelect } from "@core/crud/components/generic-select";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { useModuleLocales } from "@core/hooks/use-module-locales";
import { usePermission } from "@core/hooks/use-permission";
import { useI18n } from "@core/providers/i18n-provider";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import type {
  AvailabilitySearchInput,
  SaveAvailabilityCalendar,
  WeekDay,
} from "../../domain/entities/Availability";
import { WEEK_DAYS } from "../../domain/entities/Availability";
import { useAvailabilityViewModel } from "../viewmodels/useAvailabilityViewModel";
import { ResourceBlocksPanel } from "../components/ResourceBlocksPanel";
import {
  validateWeeklyWindows,
  type WeeklyWindowDraft,
} from "../viewmodels/weeklyWindows";

function newWindow(dayOfWeek: WeekDay): WeeklyWindowDraft {
  return {
    id: crypto.randomUUID(),
    dayOfWeek,
    startLocal: "09:00",
    endLocal: "17:00",
    capacityOverride: null,
  };
}

function localDate(utcValue: string | null | undefined, timeZoneId: string): string {
  if (!utcValue) return "";
  try {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: timeZoneId,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(new Date(utcValue));
    const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
    return `${value.year}-${value.month}-${value.day}`;
  } catch {
    return utcValue.slice(0, 10);
  }
}

function todayIn(timeZoneId: string): string {
  return localDate(new Date().toISOString(), timeZoneId);
}

export const AvailabilityView = React.memo(function AvailabilityView() {
  useModuleLocales(() => import("../../../locales"), "venue.availability");
  const { t } = useI18n();
  const vm = useAvailabilityViewModel();
  const { success, error: toastError } = useEnhancedToast();
  const canView = usePermission(VENUE_PERMISSIONS.AVAILABILITY_CALENDAR_VIEW);
  const canCreate = usePermission(VENUE_PERMISSIONS.AVAILABILITY_CALENDAR_CREATE);
  const canUpdate = usePermission(VENUE_PERMISSIONS.AVAILABILITY_CALENDAR_UPDATE);
  const canSearch = usePermission(VENUE_PERMISSIONS.AVAILABILITY_SEARCH_VIEW);

  const [timeZoneId, setTimeZoneId] = useState("UTC");
  const [effectiveFrom, setEffectiveFrom] = useState(todayIn("UTC"));
  const [effectiveTo, setEffectiveTo] = useState("");
  const [windows, setWindows] = useState<WeeklyWindowDraft[]>([]);
  const [startLocal, setStartLocal] = useState(`${todayIn("UTC")}T09:00`);
  const [endLocal, setEndLocal] = useState(`${todayIn("UTC")}T10:00`);
  const [quantity, setQuantity] = useState(1);

  const maximumCapacity = vm.selectedResource?.capacity?.maxConcurrentUsage ?? 1;
  const resourceOptions = useMemo(
    () => vm.resources.map((resource) => ({ value: resource.id, label: resource.name })),
    [vm.resources]
  );

  useEffect(() => {
    const zone = vm.calendar?.timeZoneId ?? "UTC";
    setTimeZoneId(zone);
    setEffectiveFrom(
      vm.calendar ? localDate(vm.calendar.effectiveFrom, zone) : todayIn(zone)
    );
    setEffectiveTo(
      vm.calendar ? localDate(vm.calendar.effectiveTo, zone) : ""
    );
    setWindows(
      vm.calendar?.windows.map((window) => ({
        ...window,
        id: window.id ?? crypto.randomUUID(),
      })) ?? []
    );
    const date = todayIn(zone);
    setStartLocal(`${date}T09:00`);
    setEndLocal(`${date}T10:00`);
  }, [vm.calendar, vm.selectedResourceId]);

  if (!canView) {
    return (
      <EmptyState
        icon={Lock}
        title={t("notAuthorized.title")}
        description={t("notAuthorized.description")}
      />
    );
  }

  if (vm.loading && vm.resources.length === 0) return <LoadingSpinner showText={false} />;

  const addWindow = (dayOfWeek: WeekDay) => {
    setWindows((current) => [...current, newWindow(dayOfWeek)]);
  };

  const updateWindow = (id: string, patch: Partial<WeeklyWindowDraft>) => {
    setWindows((current) =>
      current.map((window) => (window.id === id ? { ...window, ...patch } : window))
    );
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const errors = validateWeeklyWindows(windows, maximumCapacity);
    if (!effectiveFrom || (effectiveTo && effectiveTo <= effectiveFrom) || errors.length > 0) {
      const key = errors[0] ?? "dateRange";
      toastError({ title: t(`availability.validation.${key}`) });
      return;
    }

    const data: SaveAvailabilityCalendar = {
      resourceId: vm.selectedResourceId,
      timeZoneId,
      effectiveFrom,
      effectiveTo: effectiveTo || null,
      windows: windows.map(({ id: _id, ...window }) => window),
    };

    try {
      await vm.saveCalendar(data);
      success({ title: t(vm.calendar ? "availability.updated" : "availability.created") });
    } catch (caught) {
      toastError({ title: caught instanceof Error ? caught.message : t("common.error") });
    }
  };

  const search = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!startLocal || !endLocal || startLocal >= endLocal || quantity < 1) {
      toastError({ title: t("availability.validation.search") });
      return;
    }
    const input: AvailabilitySearchInput = {
      resourceId: vm.selectedResourceId,
      timeZoneId,
      startLocal,
      endLocal,
      quantity,
    };
    try {
      await vm.search(input);
    } catch (caught) {
      toastError({ title: caught instanceof Error ? caught.message : t("common.error") });
    }
  };

  const canSave = vm.calendar ? canUpdate : canCreate;
  const searchDisabled = !canSearch || !vm.selectedResource?.isPublished || !vm.calendar;

  return (
    <div className="space-y-6">
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
          action={<Button variant="outline" onClick={() => void vm.refresh()}>{t("common.retry")}</Button>}
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
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle>{t("availability.calendarTitle")}</CardTitle>
                  <p className="mt-1 text-sm text-nx-ink-2">{t("availability.calendarDescription")}</p>
                </div>
                <Badge variant={vm.calendar ? "active" : "inactive"}>
                  {t(vm.calendar ? "availability.active" : "availability.notConfigured")}
                </Badge>
              </CardHeader>
              <CardContent>
                <form onSubmit={save} className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="availability-timezone">{t("availability.fields.timezone")}</Label>
                      <TimezonePicker
                        id="availability-timezone"
                        aria-label={t("availability.fields.timezone")}
                        value={timeZoneId}
                        onChange={setTimeZoneId}
                        disabled={!canSave}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability-from">{t("availability.fields.effectiveFrom")}</Label>
                      <Input id="availability-from" type="date" value={effectiveFrom} disabled={!canSave} onChange={(event) => setEffectiveFrom(event.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="availability-to">{t("availability.fields.effectiveTo")}</Label>
                      <Input id="availability-to" type="date" value={effectiveTo} disabled={!canSave} onChange={(event) => setEffectiveTo(event.target.value)} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {WEEK_DAYS.map((day) => {
                      const dayWindows = windows.filter((window) => window.dayOfWeek === day);
                      return (
                        <section key={day} className="rounded-nx-md border border-nx-line bg-nx-surface p-4">
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <h3 className="text-sm font-semibold">{t(`availability.days.${day.toLowerCase()}`)}</h3>
                            {canSave && (
                              <Button type="button" variant="ghost" size="sm" onClick={() => addWindow(day)}>
                                <Plus className="size-4" />{t("availability.addWindow")}
                              </Button>
                            )}
                          </div>
                          {dayWindows.length === 0 ? (
                            <p className="text-sm text-nx-ink-3">{t("availability.closed")}</p>
                          ) : (
                            <div className="space-y-2">
                              {dayWindows.map((window) => (
                                <div key={window.id} className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_1fr_auto]">
                                  <div className="space-y-1">
                                    <Label htmlFor={`${window.id}-start`}>{t("availability.fields.starts")}</Label>
                                    <Input id={`${window.id}-start`} type="time" value={window.startLocal} disabled={!canSave} onChange={(event) => updateWindow(window.id, { startLocal: event.target.value })} />
                                  </div>
                                  <div className="space-y-1">
                                    <Label htmlFor={`${window.id}-end`}>{t("availability.fields.ends")}</Label>
                                    <Input id={`${window.id}-end`} type="time" value={window.endLocal} disabled={!canSave} onChange={(event) => updateWindow(window.id, { endLocal: event.target.value })} />
                                  </div>
                                  <div className="space-y-1">
                                    <Label htmlFor={`${window.id}-capacity`}>{t("availability.fields.capacity")}</Label>
                                    <Input id={`${window.id}-capacity`} type="number" min={1} max={maximumCapacity} placeholder={String(maximumCapacity)} value={window.capacityOverride ?? ""} disabled={!canSave} onChange={(event) => updateWindow(window.id, { capacityOverride: event.target.value ? Number(event.target.value) : null })} />
                                  </div>
                                  {canSave && (
                                    <Button type="button" variant="ghost" size="icon" aria-label={t("common.delete")} onClick={() => setWindows((current) => current.filter((item) => item.id !== window.id))}>
                                      <Trash2 className="size-4" />
                                    </Button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </section>
                      );
                    })}
                  </div>

                  {canSave && (
                    <div className="flex justify-end">
                      <Button type="submit" disabled={vm.saving || !vm.selectedResourceId}>
                        {vm.saving ? t("common.saving") : t("availability.save")}
                      </Button>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            <Card className="h-fit xl:sticky xl:top-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><Search className="size-4" />{t("availability.searchTitle")}</CardTitle>
                <p className="text-sm text-nx-ink-2">{t("availability.searchDescription")}</p>
              </CardHeader>
              <CardContent className="space-y-5">
                <form onSubmit={search} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="search-start">{t("availability.fields.searchStart")}</Label>
                    <Input id="search-start" type="datetime-local" value={startLocal} disabled={searchDisabled} onChange={(event) => setStartLocal(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-end">{t("availability.fields.searchEnd")}</Label>
                    <Input id="search-end" type="datetime-local" value={endLocal} disabled={searchDisabled} onChange={(event) => setEndLocal(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="search-quantity">{t("availability.fields.quantity")}</Label>
                    <Input id="search-quantity" type="number" min={1} max={maximumCapacity} value={quantity} disabled={searchDisabled} onChange={(event) => setQuantity(Number(event.target.value))} />
                  </div>
                  <p className="flex items-center gap-2 text-xs text-nx-ink-3"><Clock3 className="size-3.5" />{timeZoneId}</p>
                  <Button type="submit" className="w-full" disabled={searchDisabled || vm.searching}>
                    {vm.searching ? t("availability.searching") : t("availability.search")}
                  </Button>
                </form>

                {vm.searchResult && (
                  <Alert variant={vm.searchResult.isAvailable ? "success" : "warning"}>
                    {vm.searchResult.isAvailable ? <CheckCircle2 /> : <AlertCircle />}
                    <AlertTitle>{t(vm.searchResult.isAvailable ? "availability.resultAvailable" : "availability.resultUnavailable")}</AlertTitle>
                    <AlertDescription>
                      <p>{t("availability.remaining")}: {vm.searchResult.remainingCapacity} / {vm.searchResult.maximumCapacity}</p>
                      <p>{t("availability.decision")}: {t(`availability.reasons.${vm.searchResult.reasonCode}`)}</p>
                    </AlertDescription>
                  </Alert>
                )}

                {!canSearch && <p className="text-sm text-nx-ink-3">{t("availability.searchPermission")}</p>}
              </CardContent>
            </Card>
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
