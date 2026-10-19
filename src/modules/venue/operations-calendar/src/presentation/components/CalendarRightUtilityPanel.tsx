"use client";

import React, { useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Search,
  List,
  CalendarCheck2,
} from "lucide-react";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";

interface Props {
  currentDate: string; // "YYYY-MM-DD"
  onDateChange: (dateStr: string) => void;
  onNewBooking: () => void;
  onBlockTime: () => void;
  onFindSlots?: () => void;
  onViewToday?: () => void;
  statusCounts?: {
    inUse: number;
    noActiveBooking: number;
    maintenance: number;
  };
  t: (key: string, values?: Record<string, string | number>) => string;
}

export function CalendarRightUtilityPanel({
  currentDate,
  onDateChange,
  onNewBooking,
  onBlockTime,
  onFindSlots,
  onViewToday,
  statusCounts,
  t,
}: Props) {
  // Parse year & month from currentDate
  const { year, month, day, daysInMonth, startDayOfWeek, monthName } = useMemo(() => {
    const parts = (currentDate || new Date().toISOString().slice(0, 10)).split("-").map(Number);
    const y = parts[0] || new Date().getFullYear();
    const m = parts[1] || new Date().getMonth() + 1;
    const d = parts[2] || new Date().getDate();

    const firstDate = new Date(Date.UTC(y, m - 1, 1));
    const startDow = (firstDate.getUTCDay() + 6) % 7; // Monday-first index
    const lastDate = new Date(Date.UTC(y, m, 0));
    const dim = lastDate.getUTCDate();

    const mName = new Intl.DateTimeFormat("en-US", { month: "long" }).format(firstDate);

    return {
      year: y,
      month: m,
      day: d,
      daysInMonth: dim,
      startDayOfWeek: startDow,
      monthName: mName,
    };
  }, [currentDate]);

  const handlePrevMonth = () => {
    let newYear = year;
    let newMonth = month - 1;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    const newDateStr = `${newYear}-${String(newMonth).padStart(2, "0")}-01`;
    onDateChange(newDateStr);
  };

  const handleNextMonth = () => {
    let newYear = year;
    let newMonth = month + 1;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    const newDateStr = `${newYear}-${String(newMonth).padStart(2, "0")}-01`;
    onDateChange(newDateStr);
  };

  const handleSelectDay = (selectedDay: number) => {
    const newDateStr = `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`;
    onDateChange(newDateStr);
  };

  const weekdays = ["M", "T", "W", "T", "F", "S", "S"];

  const inUseVal = statusCounts?.inUse ?? 0;
  const freeVal = statusCounts?.noActiveBooking ?? 0;
  const maintVal = statusCounts?.maintenance ?? 0;

  return (
    <div
      className="space-y-4 w-full lg:w-72 shrink-0 select-none"
      data-testid="calendar-right-utility-panel"
    >
      {/* 1. Small Month Calendar */}
      <Card className="border border-nx-line bg-nx-surface rounded-nx-xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold text-nx-ink">
            {monthName} {year}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-nx-surfaceSubtle text-nx-ink-3 hover:text-nx-ink transition-colors"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-3.5 rtl:rotate-180" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-nx-surfaceSubtle text-nx-ink-3 hover:text-nx-ink transition-colors"
              aria-label="Next month"
            >
              <ChevronRight className="size-3.5 rtl:rotate-180" />
            </button>
          </div>
        </div>

        {/* Weekday initials */}
        <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
          {weekdays.map((w, i) => (
            <span key={i} className="text-[10px] font-bold text-nx-ink-3">
              {w}
            </span>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: startDayOfWeek }).map((_, i) => (
            <div key={`empty-${i}`} className="h-7 w-7" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isSelected = dayNum === day;

            return (
              <button
                key={`day-${dayNum}`}
                type="button"
                onClick={() => handleSelectDay(dayNum)}
                className={`h-7 w-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-nx-accent text-nx-accent-contrast font-bold shadow-xs"
                    : "text-nx-ink hover:bg-nx-surfaceSubtle"
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 2. Quick Actions */}
      <Card className="border border-nx-line bg-nx-surface rounded-nx-xl p-3.5 shadow-xs">
        <h3 className="text-xs font-bold text-nx-ink mb-2.5">
          {t("operationsCalendar.quickActions.title", { defaultValue: "Quick Actions" })}
        </h3>
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewBooking}
            className="w-full justify-start text-xs font-semibold gap-2.5 h-8 text-nx-ink hover:bg-nx-surfaceSubtle"
          >
            <Plus className="size-3.5 text-blue-500" />
            <span>{t("operationsCalendar.quickActions.newBooking", { defaultValue: "New Booking" })}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onBlockTime}
            className="w-full justify-start text-xs font-semibold gap-2.5 h-8 text-nx-ink hover:bg-nx-surfaceSubtle"
          >
            <Clock className="size-3.5 text-amber-500" />
            <span>{t("operationsCalendar.quickActions.blockTime", { defaultValue: "Block Time" })}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onFindSlots || onNewBooking}
            className="w-full justify-start text-xs font-semibold gap-2.5 h-8 text-nx-ink hover:bg-nx-surfaceSubtle"
          >
            <Search className="size-3.5 text-indigo-500" />
            <span>{t("operationsCalendar.quickActions.findSlots", { defaultValue: "Find Available Slots" })}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onViewToday}
            className="w-full justify-start text-xs font-semibold gap-2.5 h-8 text-nx-ink hover:bg-nx-surfaceSubtle"
          >
            <List className="size-3.5 text-emerald-500" />
            <span>{t("operationsCalendar.quickActions.viewToday", { defaultValue: "View Today's List" })}</span>
          </Button>
        </div>
      </Card>

      {/* 3. Court Status */}
      <Card className="border border-nx-line bg-nx-surface rounded-nx-xl p-3.5 shadow-xs">
        <h3 className="text-xs font-bold text-nx-ink mb-2.5">
          {t("operationsCalendar.courtStatus.title", { defaultValue: "Court Status" })}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-nx-ink-2 font-medium">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>In Use</span>
            </div>
            <span className="font-bold text-nx-ink tabular-nums">
              {inUseVal}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-nx-ink-2 font-medium">
              <span className="size-2 rounded-full bg-sky-500" />
              <span>Free</span>
            </div>
            <span className="font-bold text-nx-ink tabular-nums">
              {freeVal}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-nx-ink-2 font-medium">
              <span className="size-2 rounded-full bg-rose-500" />
              <span>Maintenance</span>
            </div>
            <span className="font-bold text-nx-ink tabular-nums">
              {maintVal}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
