"use client";

import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { TimezonePicker } from "@core/ui/timezone-picker";
import { Badge } from "@core/ui/badge";
import { Button } from "@core/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { useI18n } from "@core/providers/i18n-provider";
import { useEnhancedToast } from "@core/hooks/use-enhanced-toast";
import { WEEK_DAYS, type SaveAvailabilityCalendar, type WeekDay } from "../../domain/entities/Availability";
import { validateWeeklyWindows, type WeeklyWindowDraft } from "../viewmodels/useWeeklyWindows";
import type { useAvailabilityViewModel } from "../viewmodels/useAvailabilityViewModel";

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

interface WeeklyWindowsEditorCardProps {
  vm: ReturnType<typeof useAvailabilityViewModel>;
  canSave: boolean;
  timeZoneId: string;
  onTimeZoneChange: (tz: string) => void;
}

/**
 * Documentation for WeeklyWindowsEditorCard
 */
export function WeeklyWindowsEditorCard({
  vm,
  canSave,
  timeZoneId,
  onTimeZoneChange,
}: WeeklyWindowsEditorCardProps) {
  const { t } = useI18n();
  const { success, error: toastError } = useEnhancedToast();
  const maximumCapacity = vm.selectedResource?.capacity?.maxConcurrentUsage ?? 1;

  const zone = vm.calendar?.timeZoneId ?? timeZoneId;
  const [prevCalendar, setPrevCalendar] = useState(vm.calendar);
  const [effectiveFrom, setEffectiveFrom] = useState(() =>
    vm.calendar ? localDate(vm.calendar.effectiveFrom, zone) : todayIn(zone)
  );
  const [effectiveTo, setEffectiveTo] = useState(() =>
    vm.calendar ? localDate(vm.calendar.effectiveTo, zone) : ""
  );
  const [windows, setWindows] = useState<WeeklyWindowDraft[]>(() =>
    vm.calendar?.windows.map((w) => ({
      ...w,
      id: w.id ?? crypto.randomUUID(),
    })) ?? []
  );

  if (prevCalendar !== vm.calendar) {
    setPrevCalendar(vm.calendar);
    setEffectiveFrom(
      vm.calendar ? localDate(vm.calendar.effectiveFrom, zone) : todayIn(zone)
    );
    setEffectiveTo(vm.calendar ? localDate(vm.calendar.effectiveTo, zone) : "");
    setWindows(
      vm.calendar?.windows.map((w) => ({
        ...w,
        id: w.id ?? crypto.randomUUID(),
      })) ?? []
    );
  }

  const addWindow = (dayOfWeek: WeekDay) => {
    setWindows((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        dayOfWeek,
        startLocal: "09:00",
        endLocal: "17:00",
        capacityOverride: null,
      },
    ]);
  };

  const updateWindow = (id: string, patch: Partial<WeeklyWindowDraft>) => {
    setWindows((current) =>
      current.map((item) => (item.id === id ? { ...item, ...patch } : item))
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
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

  return (
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="availability-timezone">{t("availability.fields.timezone")}</Label>
              <TimezonePicker
                id="availability-timezone"
                aria-label={t("availability.fields.timezone")}
                value={timeZoneId}
                onChange={onTimeZoneChange}
                disabled={!canSave}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability-from">{t("availability.fields.effectiveFrom")}</Label>
              <Input
                id="availability-from"
                type="date"
                value={effectiveFrom}
                disabled={!canSave}
                onChange={(event) => setEffectiveFrom(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="availability-to">{t("availability.fields.effectiveTo")}</Label>
              <Input
                id="availability-to"
                type="date"
                value={effectiveTo}
                disabled={!canSave}
                onChange={(event) => setEffectiveTo(event.target.value)}
              />
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
                        <Plus className="size-4" />
                        {t("availability.addWindow")}
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
                            <Input
                              id={`${window.id}-start`}
                              type="time"
                              value={window.startLocal}
                              disabled={!canSave}
                              onChange={(event) =>
                                updateWindow(window.id, { startLocal: event.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`${window.id}-end`}>{t("availability.fields.ends")}</Label>
                            <Input
                              id={`${window.id}-end`}
                              type="time"
                              value={window.endLocal}
                              disabled={!canSave}
                              onChange={(event) =>
                                updateWindow(window.id, { endLocal: event.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-1">
                            <Label htmlFor={`${window.id}-capacity`}>
                              {t("availability.fields.capacity")}
                              {maximumCapacity > 1 && (
                                <span className="text-xs font-normal text-nx-ink-3"> (max {maximumCapacity})</span>
                              )}
                            </Label>
                            <Input
                              id={`${window.id}-capacity`}
                              type="number"
                              min={1}
                              placeholder={String(maximumCapacity)}
                              value={window.capacityOverride ?? ""}
                              disabled={!canSave || maximumCapacity <= 1}
                              onChange={(event) =>
                                updateWindow(window.id, {
                                  capacityOverride: event.target.value ? Number(event.target.value) : null,
                                })
                              }
                            />
                            {maximumCapacity <= 1 && (
                              <p className="text-[11px] text-nx-ink-3">
                                {t("availability.singleCapacityNotice")}
                              </p>
                            )}
                          </div>
                          {canSave && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              aria-label={t("common.delete")}
                              onClick={() =>
                                setWindows((current) => current.filter((item) => item.id !== window.id))
                              }
                            >
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
              <Button type="submit" disabled={vm.saving}>
                {vm.saving ? t("common.saving") : t("availability.save")}
              </Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
