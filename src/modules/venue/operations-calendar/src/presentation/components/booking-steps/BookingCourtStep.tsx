"use client";

import React from "react";
import { Label } from "@core/ui/label";
import { Input } from "@core/ui/input";
import { Alert, AlertDescription } from "@core/ui/alert";
import type { CalendarResource } from "../../../domain/entities/OperationsCalendar";

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
  return (
    <div className="space-y-3 py-1">
      {step0Error && (
        <Alert variant="destructive" className="py-1.5 text-xs">
          <AlertDescription>{step0Error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-1.5">
        <Label className="text-xs font-bold text-nx-ink">{courtLabel}</Label>
        <select
          className="w-full h-9 rounded-md border border-nx-border bg-nx-surface px-3 text-xs focus:ring-1 focus:ring-nx-primary"
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

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-nx-ink">
            {isRtl ? "وقت البدء" : "Start Time"}
          </Label>
          <Input
            type="time"
            value={new Date(startUtc).toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: timeZoneId || "UTC",
            })}
            onChange={(e) => {
              const [h, m] = e.target.value.split(":").map(Number);
              const d = new Date(startUtc);
              d.setHours(h, m, 0, 0);
              onStartTimeChange(d.toISOString());
            }}
            className="h-8 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs font-bold text-nx-ink">
            {isRtl ? "المدة" : "Duration"}
          </Label>
          {allowedDurations.length <= 1 ? (
            <div className="w-full h-8 rounded-md border border-nx-border bg-nx-raised/40 px-3 flex items-center text-xs font-semibold text-nx-ink">
              {allowedDurations[0] ?? 60} min
            </div>
          ) : (
            <select
              className="w-full h-8 rounded-md border border-nx-border bg-nx-surface px-3 text-xs"
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
