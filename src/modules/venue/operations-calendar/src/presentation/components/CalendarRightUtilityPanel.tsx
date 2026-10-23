"use client";

import React, { useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Clock, Search, List } from "lucide-react";
import { Card } from "@core/ui/card";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";

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
  const { language } = useI18n();
  const locale = language === "ar" ? "ar-EG" : "en-US";
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

    const mName = new Intl.DateTimeFormat(locale, { month: "long" }).format(firstDate);

    return {
      year: y,
      month: m,
      day: d,
      daysInMonth: dim,
      startDayOfWeek: startDow,
      monthName: mName,
    };
  }, [currentDate, locale]);

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

  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(
      new Date(Date.UTC(2024, 0, 1 + index))
    )
  );

  const inUseVal = statusCounts?.inUse ?? 0;
  const freeVal = statusCounts?.noActiveBooking ?? 0;
  const maintVal = statusCounts?.maintenance ?? 0;

  return (
    <div
      className="w-full shrink-0 select-none space-y-4 lg:w-72"
      data-testid="calendar-right-utility-panel"
    >
      {/* 1. Small Month Calendar */}
      <Card className="rounded-nx-xl shadow-xs border border-nx-line bg-nx-surface p-3.5">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-xs font-bold text-nx-ink">
            {monthName} {year}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={handlePrevMonth}
              className="hover:bg-nx-surfaceSubtle rounded p-1 text-nx-ink-3 transition-colors hover:text-nx-ink"
              aria-label={t("operationsCalendar.utility.previousMonth", {
                defaultValue: "Previous month",
              })}
            >
              <ChevronLeft className="size-3.5 rtl:rotate-180" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={handleNextMonth}
              className="hover:bg-nx-surfaceSubtle rounded p-1 text-nx-ink-3 transition-colors hover:text-nx-ink"
              aria-label={t("operationsCalendar.utility.nextMonth", { defaultValue: "Next month" })}
            >
              <ChevronRight className="size-3.5 rtl:rotate-180" />
            </Button>
          </div>
        </div>

        {/* Weekday initials */}
        <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
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
              <Button
                variant="ghost"
                size="sm"
                key={`day-${dayNum}`}
                type="button"
                onClick={() => handleSelectDay(dayNum)}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? "text-nx-on-fill shadow-xs bg-nx-accent font-bold"
                    : "hover:bg-nx-surfaceSubtle text-nx-ink"
                }`}
              >
                {dayNum}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* 2. Quick Actions */}
      <Card className="rounded-nx-xl shadow-xs border border-nx-line bg-nx-surface p-3.5">
        <h3 className="mb-2.5 text-xs font-bold text-nx-ink">
          {t("operationsCalendar.quickActions.title", { defaultValue: "Quick Actions" })}
        </h3>
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewBooking}
            className="hover:bg-nx-surfaceSubtle h-8 w-full justify-start gap-2.5 text-xs font-semibold text-nx-ink"
          >
            <Plus className="size-3.5 text-blue-500" />
            <span>
              {t("operationsCalendar.quickActions.newBooking", { defaultValue: "New Booking" })}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onBlockTime}
            className="hover:bg-nx-surfaceSubtle h-8 w-full justify-start gap-2.5 text-xs font-semibold text-nx-ink"
          >
            <Clock className="size-3.5 text-amber-500" />
            <span>
              {t("operationsCalendar.quickActions.blockTime", { defaultValue: "Block Time" })}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onFindSlots || onNewBooking}
            className="hover:bg-nx-surfaceSubtle h-8 w-full justify-start gap-2.5 text-xs font-semibold text-nx-ink"
          >
            <Search className="size-3.5 text-indigo-500" />
            <span>
              {t("operationsCalendar.quickActions.findSlots", {
                defaultValue: "Find Available Slots",
              })}
            </span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onViewToday}
            className="hover:bg-nx-surfaceSubtle h-8 w-full justify-start gap-2.5 text-xs font-semibold text-nx-ink"
          >
            <List className="size-3.5 text-emerald-500" />
            <span>
              {t("operationsCalendar.quickActions.viewToday", {
                defaultValue: "View Today's List",
              })}
            </span>
          </Button>
        </div>
      </Card>

      {/* 3. Court Status */}
      <Card className="rounded-nx-xl shadow-xs border border-nx-line bg-nx-surface p-3.5">
        <h3 className="mb-2.5 text-xs font-bold text-nx-ink">
          {t("operationsCalendar.courtStatus.title", { defaultValue: "Court Status" })}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium text-nx-ink-2">
              <span className="size-2 rounded-full bg-emerald-500" />
              <span>{t("operationsCalendar.courtStatus.inUse", { defaultValue: "In Use" })}</span>
            </div>
            <span className="font-bold tabular-nums text-nx-ink">{inUseVal}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium text-nx-ink-2">
              <span className="size-2 rounded-full bg-sky-500" />
              <span>{t("operationsCalendar.courtStatus.free", { defaultValue: "Free" })}</span>
            </div>
            <span className="font-bold tabular-nums text-nx-ink">{freeVal}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium text-nx-ink-2">
              <span className="size-2 rounded-full bg-rose-500" />
              <span>
                {t("operationsCalendar.courtStatus.maintenance", { defaultValue: "Maintenance" })}
              </span>
            </div>
            <span className="font-bold tabular-nums text-nx-ink">{maintVal}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
