"use client";

import React from "react";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Alert, AlertDescription } from "@core/ui/alert";
import type { CalendarResource } from "../../../domain/entities/OperationsCalendar";
import {
  localPrefillForInstant,
  localToUtcInstant,
} from "../../viewmodels/calendarLayout";

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
  isRtl: boolean;
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
  isRtl,
  step0Error,
  courtLabel,
}: BookingCourtStepProps) {
  const effectiveTz = selectedResource?.timeZoneId || timeZoneId || "UTC";
  const prefill = React.useMemo(
    () => localPrefillForInstant(startUtc, effectiveTz),
    [startUtc, effectiveTz]
  );

  const timeOptions = React.useMemo(() => {
    const increment = selectedResource?.slotPolicy?.startIncrementMinutes ?? 30;
    const options: string[] = [];
    for (let m = 0; m < 24 * 60; m += increment) {
      const hh = String(Math.floor(m / 60)).padStart(2, "0");
      const mm = String(m % 60).padStart(2, "0");
      options.push(`${hh}:${mm}`);
    }
    if (prefill.startTime && !options.includes(prefill.startTime)) {
      options.push(prefill.startTime);
      options.sort();
    }
    return options;
  }, [selectedResource?.slotPolicy?.startIncrementMinutes, prefill.startTime]);

  return (
    <div className="space-y-3 py-1">
      {step0Error && (
        <Alert variant="destructive" className="py-1.5 text-xs">
          <AlertDescription>{step0Error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="booking-court-select" className="text-xs font-bold text-nx-ink">{courtLabel}</Label>
        <select
          id="booking-court-select"
          className="w-full h-9 rounded-md border border-nx-border bg-nx-surface px-3 text-xs font-semibold text-nx-ink focus:ring-1 focus:ring-nx-primary"
          value={selectedResource?.id || ""}
          onChange={(e) => {
            const res = resources.find((r) => r.id === e.target.value);
            if (res) onSelectResource(res);
          }}
        >
          {resources.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name} ({r.facilityName})
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="booking-court-date" className="text-xs font-bold text-nx-ink">
            {isRtl ? "التاريخ" : "Booking Date"}
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
          <Label htmlFor="booking-court-time" className="text-xs font-bold text-nx-ink">
            {isRtl ? "وقت البدء" : "Start Time"}
          </Label>
          <select
            id="booking-court-time"
            value={prefill.startTime}
            onChange={(e) => {
              if (!e.target.value) return;
              const newUtc = localToUtcInstant(prefill.date, e.target.value, effectiveTz);
              onStartTimeChange(newUtc);
            }}
            className="w-full h-8 rounded-md border border-nx-border bg-nx-surface px-2.5 text-xs font-semibold text-nx-ink focus:ring-1 focus:ring-nx-primary"
          >
            {timeOptions.map((tVal) => (
              <option key={tVal} value={tVal}>
                {tVal}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="booking-court-duration" className="text-xs font-bold text-nx-ink">
            {isRtl ? "المدة" : "Duration"}
          </Label>
          {allowedDurations.length <= 1 ? (
            <div className="w-full h-8 rounded-md border border-nx-border bg-nx-raised/40 px-3 flex items-center text-xs font-semibold text-nx-ink">
              {allowedDurations[0] ?? 60} min
            </div>
          ) : (
            <select
              id="booking-court-duration"
              className="w-full h-8 rounded-md border border-nx-border bg-nx-surface px-2.5 text-xs font-semibold text-nx-ink focus:ring-1 focus:ring-nx-primary"
              value={duration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
            >
              {allowedDurations.map((d) => (
                <option key={d} value={d}>
                  {d} min {d >= 60 && d % 60 === 0 ? `(${d / 60} hr)` : ""}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </div>
  );
}
