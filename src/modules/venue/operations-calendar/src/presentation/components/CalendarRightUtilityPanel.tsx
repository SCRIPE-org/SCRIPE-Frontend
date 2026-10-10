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
import { Card, CardContent, CardHeader, CardTitle } from "@core/ui/card";
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
  statusCounts = { inUse: 0, noActiveBooking: 0, maintenance: 0 },
  t,
}: Props) {
  // Parse year & month from currentDate
  const { year, month, day, daysInMonth, startDayOfWeek, monthName } = useMemo(() => {
    const parts = (currentDate || new Date().toISOString().slice(0, 10)).split("-").map(Number);
    const y = parts[0] || new Date().getFullYear();
    const m = parts[1] || new Date().getMonth() + 1;
    const d = parts[2] || new Date().getDate();

    const firstDate = new Date(Date.UTC(y, m - 1, 1));
    const startDow = firstDate.getUTCDay();
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

  const weekdays = ["S", "M", "T", "W", "T", "F", "S"];

  return (
    <div
      className="space-y-4 w-full lg:w-72 shrink-0 select-none"
      data-testid="calendar-right-utility-panel"
    >
      {/* 1. Small Month Calendar */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-3.5 shadow-xs">
        {/* Month Header with < > */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800">
          <span className="text-xs font-bold text-slate-900 dark:text-white">
            {monthName} {year}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Previous month"
            >
              <ChevronLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="Next month"
            >
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>

        {/* Weekday Labels */}
        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1">
          {weekdays.map((w, idx) => (
            <div key={idx} className="py-0.5">
              {w}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {/* Empty cells before first day */}
          {Array.from({ length: startDayOfWeek }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-7 w-7" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, idx) => {
            const dayNum = idx + 1;
            const isSelected = dayNum === day;

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => handleSelectDay(dayNum)}
                className={`h-7 w-7 rounded-full text-xs font-semibold flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-blue-600 text-white font-bold shadow-xs shadow-blue-500/40"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                {dayNum}
              </button>
            );
          })}
        </div>
      </Card>

      {/* 2. Quick Actions */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-3.5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2.5">
          {t("operationsCalendar.quickActions.title", { defaultValue: "Quick Actions" })}
        </h3>
        <div className="space-y-1.5">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewBooking}
            className="w-full justify-start text-xs font-semibold gap-2.5 h-8 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Plus className="size-3.5 text-blue-600 dark:text-blue-400" />
            <span>{t("operationsCalendar.quickActions.newBooking", { defaultValue: "New Booking" })}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onBlockTime}
            className="w-full justify-start text-xs font-semibold gap-2.5 h-8 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Clock className="size-3.5 text-amber-500" />
            <span>{t("operationsCalendar.quickActions.blockTime", { defaultValue: "Block Time" })}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onFindSlots || onNewBooking}
            className="w-full justify-start text-xs font-semibold gap-2.5 h-8 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Search className="size-3.5 text-purple-500" />
            <span>{t("operationsCalendar.quickActions.findSlots", { defaultValue: "Find Available Slots" })}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onViewToday}
            className="w-full justify-start text-xs font-semibold gap-2.5 h-8 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <List className="size-3.5 text-emerald-500" />
            <span>{t("operationsCalendar.quickActions.viewToday", { defaultValue: "View Today's List" })}</span>
          </Button>
        </div>
      </Card>

      {/* 3. Court Status */}
      <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-xl p-3.5 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-2.5">
          {t("operationsCalendar.courtStatus.title", { defaultValue: "Court Status" })}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>{t("operationsCalendar.courtStatus.inUse", { defaultValue: "In Use" })}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {statusCounts.inUse}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="size-2 rounded-full bg-slate-400" />
              <span>{t("operationsCalendar.courtStatus.noActiveBooking", { defaultValue: "No Current Booking" })}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {statusCounts.noActiveBooking}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
              <span className="size-2 rounded-full bg-amber-500" />
              <span>{t("operationsCalendar.courtStatus.maintenance", { defaultValue: "Maintenance" })}</span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white tabular-nums">
              {statusCounts.maintenance}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
