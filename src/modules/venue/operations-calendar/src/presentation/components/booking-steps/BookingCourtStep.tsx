"use client";

import React from "react";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { GenericSelect } from "@core/crud/components/generic-select";
import { Alert, AlertDescription } from "@core/ui/alert";
import type { CalendarResource } from "../../../domain/entities/OperationsCalendar";
import { localPrefillForInstant, localToUtcInstant } from "../../viewmodels/useCalendarLayout";

interface BookingCourtStepProps {
  resources: CalendarResource[];
  selectedResource: CalendarResource | null;
  onSelectResource: (resource: CalendarResource) => void;
  startUtc: string;
  onStartTimeChange: (utcIso: string) => void;
  duration: number;
  onDurationChange: (durationMinutes: number) => void;
  allowedDurations: number[];
  timeZoneId: string;
  t: (key: string, values?: Record<string, string | number>) => string;
  step0Error: string | null;
  courtLabel: string;
}

export function BookingCourtStep({
  resources,
  selectedResource,
  onSelectResource,
  startUtc,
  onStartTimeChange,
  duration,
  onDurationChange,
  allowedDurations,
  timeZoneId,
  t,
  step0Error,
  courtLabel,
}: BookingCourtStepProps) {
  const effectiveTz = selectedResource?.timeZoneId || timeZoneId || "UTC";
  const prefill = React.useMemo(
    () => localPrefillForInstant(startUtc, effectiveTz),
    [startUtc, effectiveTz]
  );

  const startIncrementMinutes = selectedResource?.slotPolicy?.startIncrementMinutes;
  const prefillStartTime = prefill.startTime;

  const timeOptions = React.useMemo(() => {
    const increment = startIncrementMinutes ?? 30;
    const options: string[] = [];
    for (let m = 0; m < 24 * 60; m += increment) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      options.push(`${hh}:${mm}`);
    }
    if (prefillStartTime && !options.includes(prefillStartTime)) {
      options.push(prefillStartTime);
      options.sort();
    }
    return options;
  }, [startIncrementMinutes, prefillStartTime]);

  return (
    <div className="space-y-3 py-1">
      {step0Error && (
        <Alert variant="destructive" className="py-1.5 text-xs">
          <AlertDescription>{step0Error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label id="booking-court-select-label" className="text-xs font-bold text-nx-ink">
          {courtLabel}
        </Label>
        <GenericSelect
          id="booking-court-select"
          aria-labelledby="booking-court-select-label"
          allowClear={false}
          options={resources.map((resource) => ({
            value: resource.id,
            label: `${resource.name} (${resource.facilityName})`,
          }))}
          value={selectedResource?.id ?? ""}
          onValueChange={(value: string | string[]) => {
            const resourceId = Array.isArray(value) ? value[0] : value;
            const res = resources.find((r) => r.id === resourceId);
            if (res) onSelectResource(res);
          }}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="booking-court-date" className="text-xs font-bold text-nx-ink">
            {t("operationsCalendar.clickToBook.courtStep.bookingDate")}
          </Label>
          <Input
            id="booking-court-date"
            type="date"
            value={prefill.date}
            onChange={(e) => {
              if (!e.target.value) return;
              const newUtc = localToUtcInstant(e.target.value, prefill.startTime, effectiveTz);
              onStartTimeChange(newUtc);
            }}
            className="h-8 text-xs font-semibold"
          />
        </div>

        <div className="space-y-1.5">
          <Label id="booking-court-time-label" className="text-xs font-bold text-nx-ink">
            {t("operationsCalendar.clickToBook.courtStep.startTime")}
          </Label>
          <GenericSelect
            id="booking-court-time"
            aria-labelledby="booking-court-time-label"
            allowClear={false}
            value={prefill.startTime}
            options={timeOptions.map((time) => ({ value: time, label: time }))}
            onValueChange={(value: string | string[]) => {
              const time = Array.isArray(value) ? value[0] : value;
              if (!time) return;
              const newUtc = localToUtcInstant(prefill.date, time, effectiveTz);
              onStartTimeChange(newUtc);
            }}
          />
        </div>

        <div className="space-y-1.5">
          <Label id="booking-court-duration-label" className="text-xs font-bold text-nx-ink">
            {t("operationsCalendar.clickToBook.courtStep.duration")}
          </Label>
          {allowedDurations.length <= 1 ? (
            <div className="border-nx-border bg-nx-raised/40 flex h-8 w-full items-center rounded-md border px-3 text-xs font-semibold text-nx-ink">
              {t("operationsCalendar.clickToBook.courtStep.minutes", {
                minutes: allowedDurations[0] ?? 60,
              })}
            </div>
          ) : (
            <GenericSelect
              id="booking-court-duration"
              aria-labelledby="booking-court-duration-label"
              allowClear={false}
              options={allowedDurations.map((minutes) => ({
                value: String(minutes),
                label:
                  minutes >= 60 && minutes % 60 === 0
                    ? t("operationsCalendar.clickToBook.courtStep.hourDuration", {
                        minutes,
                        hours: minutes / 60,
                      })
                    : t("operationsCalendar.clickToBook.courtStep.minutes", { minutes }),
              }))}
              value={String(duration)}
              onValueChange={(value: string | string[]) => {
                const selected = Array.isArray(value) ? value[0] : value;
                if (selected) onDurationChange(Number(selected));
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
