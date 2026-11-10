"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Clock, Calendar, AlertCircle } from "lucide-react";

export interface WeekdayOption {
  day: number; // 0 = Sunday .. 6 = Saturday
  en: string;
  ar: string;
  shortEn: string;
  shortAr: string;
}

export const WEEKDAYS: WeekdayOption[] = [
  { day: 0, en: "Sunday", ar: "الأحد", shortEn: "Sun", shortAr: "أحد" },
  { day: 1, en: "Monday", ar: "الإثنين", shortEn: "Mon", shortAr: "إثنين" },
  { day: 2, en: "Tuesday", ar: "الثلاثاء", shortEn: "Tue", shortAr: "ثلاثاء" },
  { day: 3, en: "Wednesday", ar: "الأربعاء", shortEn: "Wed", shortAr: "أربعاء" },
  { day: 4, en: "Thursday", ar: "الخميس", shortEn: "Thu", shortAr: "خميس" },
  { day: 5, en: "Friday", ar: "الجمعة", shortEn: "Fri", shortAr: "جمعة" },
  { day: 6, en: "Saturday", ar: "السبت", shortEn: "Sat", shortAr: "سبت" }
];

export function formatWeeklyScheduleEn(
  days: number[],
  startTime: string,
  endTime: string,
  timeZoneId: string
): string {
  if (!days.length || !startTime || !endTime) return "";
  const sorted = [...days].sort((a, b) => a - b);
  const dayNames = sorted.map(d => WEEKDAYS.find(w => w.day === d)?.en ?? "");
  const tz = timeZoneId ? ` (${timeZoneId})` : "";
  return `${dayNames.join(", ")} ${startTime} - ${endTime}${tz}`;
}

export function formatWeeklyScheduleAr(
  days: number[],
  startTime: string,
  endTime: string,
  timeZoneId: string
): string {
  if (!days.length || !startTime || !endTime) return "";
  const sorted = [...days].sort((a, b) => a - b);
  const dayNames = sorted.map(d => WEEKDAYS.find(w => w.day === d)?.ar ?? "");
  const tz = timeZoneId ? ` (${timeZoneId})` : "";
  return `${dayNames.join("، ")} ${startTime} - ${endTime}${tz}`;
}

export function isValidTimeRange(start: string, end: string): boolean {
  if (!start || !end) return true;
  return end > start;
}

export interface WeeklyScheduleValue {
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
  timeZoneId: string;
  descriptionEn: string;
  descriptionAr: string;
  isValid: boolean;
}

export interface WeeklyScheduleControlProps {
  initialDaysOfWeek?: number[] | null;
  initialStartTime?: string | null;
  initialEndTime?: string | null;
  initialTimeZoneId?: string | null;
  initialDescriptionEn?: string | null;
  initialDescriptionAr?: string | null;
  timeZoneId?: string;
  language?: string;
  onChange: (value: WeeklyScheduleValue) => void;
}

export function WeeklyScheduleControl({
  initialDaysOfWeek,
  initialStartTime,
  initialEndTime,
  initialTimeZoneId,
  initialDescriptionEn,
  initialDescriptionAr,
  timeZoneId = "Asia/Riyadh",
  language = "en",
  onChange
}: WeeklyScheduleControlProps) {
  const isAr = language === "ar";
  const effectiveTimeZone = initialTimeZoneId || timeZoneId || "Asia/Riyadh";

  const [selectedDays, setSelectedDays] = useState<number[]>(() => {
    return initialDaysOfWeek ? [...initialDaysOfWeek] : [];
  });
  const [startTime, setStartTime] = useState<string>(() => initialStartTime || "");
  const [endTime, setEndTime] = useState<string>(() => initialEndTime || "");

  // Time range validation
  const timeRangeValid = useMemo(() => {
    if (!startTime || !endTime) return true;
    return isValidTimeRange(startTime, endTime);
  }, [startTime, endTime]);

  // Descriptions auto-generated
  const generatedDescEn = useMemo(() => {
    return formatWeeklyScheduleEn(selectedDays, startTime, endTime, effectiveTimeZone);
  }, [selectedDays, startTime, endTime, effectiveTimeZone]);

  const generatedDescAr = useMemo(() => {
    return formatWeeklyScheduleAr(selectedDays, startTime, endTime, effectiveTimeZone);
  }, [selectedDays, startTime, endTime, effectiveTimeZone]);

  // Overall validity
  const isValid = useMemo(() => {
    // If user selected days or times, both times must be filled and valid
    if (selectedDays.length > 0 || startTime || endTime) {
      if (selectedDays.length === 0) return false;
      if (!startTime || !endTime) return false;
      if (!timeRangeValid) return false;
    }
    return true;
  }, [selectedDays, startTime, endTime, timeRangeValid]);

  useEffect(() => {
    onChange({
      daysOfWeek: selectedDays,
      startTime,
      endTime,
      timeZoneId: effectiveTimeZone,
      descriptionEn: generatedDescEn || initialDescriptionEn || "",
      descriptionAr: generatedDescAr || initialDescriptionAr || "",
      isValid
    });
  }, [selectedDays, startTime, endTime, effectiveTimeZone, generatedDescEn, generatedDescAr, isValid, onChange, initialDescriptionEn, initialDescriptionAr]);

  const toggleDay = (day: number) => {
    setSelectedDays(prev => {
      const exists = prev.includes(day);
      const next = exists ? prev.filter(d => d !== day) : [...prev, day];
      return next.sort((a, b) => a - b);
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-nx-line bg-nx-raised/40 p-4">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold uppercase tracking-wider text-nx-ink-2 flex items-center gap-1.5">
          <Calendar className="size-3.5 text-nx-accent" />
          {isAr ? "الجدول الأسبوعي المنظم" : "Structured Weekly Schedule"}
        </label>
        <div className="flex items-center gap-1.5 text-[11px] text-nx-ink-2">
          <Clock className="size-3" />
          <span className="font-mono bg-nx-surface px-2 py-0.5 rounded border border-nx-line">
            {effectiveTimeZone}
          </span>
        </div>
      </div>

      {/* Weekday Selection Pills */}
      <div>
        <p className="text-xs text-nx-ink-2 mb-2">
          {isAr ? "اختر أيام التدريب:" : "Select training days:"}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {WEEKDAYS.map(w => {
            const isSelected = selectedDays.includes(w.day);
            return (
              <button
                key={w.day}
                type="button"
                onClick={() => toggleDay(w.day)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors border ${
                  isSelected
                    ? "bg-nx-accent text-nx-surface border-nx-accent shadow-sm"
                    : "bg-nx-surface text-nx-ink border-nx-line hover:border-nx-accent/50"
                }`}
                title={isAr ? w.ar : w.en}
              >
                {isAr ? w.shortAr : w.shortEn}
              </button>
            );
          })}
        </div>
      </div>

      {/* Start and End Times */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-medium text-nx-ink-2 block mb-1">
            {isAr ? "وقت البدء" : "Start Time"}
          </label>
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="w-full h-9 px-3 rounded-md border border-nx-line bg-nx-canvas text-sm text-nx-ink font-mono"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-nx-ink-2 block mb-1">
            {isAr ? "وقت الانتهاء" : "End Time"}
          </label>
          <input
            type="time"
            value={endTime}
            onChange={e => setEndTime(e.target.value)}
            className={`w-full h-9 px-3 rounded-md border bg-nx-canvas text-sm text-nx-ink font-mono ${
              !timeRangeValid ? "border-red-500 ring-1 ring-red-500" : "border-nx-line"
            }`}
          />
        </div>
      </div>

      {/* Time Validation Error */}
      {!timeRangeValid && (
        <div className="flex items-center gap-2 p-2 rounded-md bg-red-500/10 border border-red-500/30 text-xs text-red-600">
          <AlertCircle className="size-4 shrink-0" />
          <span>
            {isAr
              ? "وقت الانتهاء يجب أن يكون بعد وقت البدء."
              : "End time must be after start time."}
          </span>
        </div>
      )}

      {/* Auto-generated Description Live Preview */}
      {(generatedDescEn || generatedDescAr || initialDescriptionEn || initialDescriptionAr) && (
        <div className="rounded-md border border-nx-line/60 bg-nx-surface/80 p-3 space-y-1.5 text-xs">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-nx-ink-2">
            {isAr ? "المعاينة التلقائية للجدول" : "Auto-Generated Schedule Preview"}
          </div>
          {generatedDescEn ? (
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[10px] text-nx-ink-2 uppercase">EN:</span>
              <span className="text-nx-ink font-medium">{generatedDescEn}</span>
            </div>
          ) : initialDescriptionEn ? (
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[10px] text-nx-ink-2 uppercase">EN:</span>
              <span className="text-nx-ink-2 italic">{initialDescriptionEn}</span>
            </div>
          ) : null}

          {generatedDescAr ? (
            <div className="flex items-baseline gap-2" dir="rtl">
              <span className="font-mono text-[10px] text-nx-ink-2 uppercase">AR:</span>
              <span className="text-nx-ink font-medium">{generatedDescAr}</span>
            </div>
          ) : initialDescriptionAr ? (
            <div className="flex items-baseline gap-2" dir="rtl">
              <span className="font-mono text-[10px] text-nx-ink-2 uppercase">AR:</span>
              <span className="text-nx-ink-2 italic">{initialDescriptionAr}</span>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
