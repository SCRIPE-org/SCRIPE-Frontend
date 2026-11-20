"use client";

import { useState } from "react";
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

/**
 * Right-hand utility rail providing mini-month navigation, quick actions, and live occupancy counts.
 */
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
  const [fallbackToday] = useState(() => new Date().toISOString().slice(0, 10));
  const fallbackParts = fallbackToday.split("-").map(Number);

  const parts = (currentDate || fallbackToday).split("-").map(Number);
  const year = parts[0] || fallbackParts[0];
  const month = parts[1] || fallbackParts[1];
  const day = parts[2] || fallbackParts[2];

  const firstDate = new Date(Date.UTC(year, month - 1, 1));
  const startDayOfWeek = (firstDate.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const monthName = new Intl.DateTimeFormat(language, { month: "long" }).format(firstDate);

  const handlePrevMonth = () => {
    const newYear = month - 1 < 1 ? year - 1 : year;
    const newMonth = month - 1 < 1 ? 12 : month - 1;
    onDateChange(`${newYear}-${String(newMonth).padStart(2, "0")}-01`);
  };

  const handleNextMonth = () => {
    const newYear = month + 1 > 12 ? year + 1 : year;
    const newMonth = month + 1 > 12 ? 1 : month + 1;
    onDateChange(`${newYear}-${String(newMonth).padStart(2, "0")}-01`);
  };

  const handleSelectDay = (selectedDay: number) => {
    onDateChange(
      `${year}-${String(month).padStart(2, "0")}-${String(selectedDay).padStart(2, "0")}`,
    );
  };

  const weekdays = Array.from({ length: 7 }, (_, index) =>
    new Intl.DateTimeFormat(language, { weekday: "short", timeZone: "UTC" }).format(
      new Date(Date.UTC(2024, 0, 1 + index)),
    ),
  );

  const inUseVal = statusCounts?.inUse ?? 0;
  const freeVal = statusCounts?.noActiveBooking ?? 0;
  const maintVal = statusCounts?.maintenance ?? 0;

  return (
    <div
      className="w-full shrink-0 select-none space-y-4 lg:w-72"
      data-testid="calendar-right-utility-panel"
    >
      {/* 1. Mini Month Calendar */}
      <Card className="p-3.5">
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
              className="rounded p-1 text-nx-ink-3 transition-colors hover:bg-nx-raised hover:text-nx-ink"
              aria-label={t("operationsCalendar.utility.previousMonth")}
            >
              <ChevronLeft className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              type="button"
              onClick={handleNextMonth}
              className="rounded p-1 text-nx-ink-3 transition-colors hover:bg-nx-raised hover:text-nx-ink"
              aria-label={t("operationsCalendar.utility.nextMonth")}
            >
              <ChevronRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
            </Button>
          </div>
        </div>

        <div className="mb-1.5 grid grid-cols-7 gap-1 text-center">
          {weekdays.map((w, i) => (
            <span key={i} className="text-[10px] font-bold text-nx-ink-3">
              {w}
            </span>
          ))}
        </div>

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
                    ? "bg-nx-accent-fill font-bold text-nx-on-fill hover:bg-nx-accent-fill hover:text-nx-on-fill"
                    : "text-nx-ink hover:bg-nx-raised"
                }`}
              >
                {dayNum}
              </Button>
            );
          })}
        </div>
      </Card>

      {/* 2. Quick Actions */}
      <Card className="p-3.5">
        <h3 className="mb-2.5 text-xs font-bold text-nx-ink">
          {t("operationsCalendar.quickActions.title")}
        </h3>
        <div className="space-y-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNewBooking}
            className="h-8 w-full justify-start gap-2.5 text-xs font-semibold text-nx-ink hover:bg-nx-raised"
          >
            <Plus className="size-3.5 text-info" aria-hidden="true" />
            <span>{t("operationsCalendar.quickActions.newBooking")}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onBlockTime}
            className="h-8 w-full justify-start gap-2.5 text-xs font-semibold text-nx-ink hover:bg-nx-raised"
          >
            <Clock className="size-3.5 text-warning" aria-hidden="true" />
            <span>{t("operationsCalendar.quickActions.blockTime")}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onFindSlots || onNewBooking}
            className="h-8 w-full justify-start gap-2.5 text-xs font-semibold text-nx-ink hover:bg-nx-raised"
          >
            <Search className="size-3.5 text-nx-accent" aria-hidden="true" />
            <span>{t("operationsCalendar.quickActions.findSlots")}</span>
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={onViewToday}
            className="h-8 w-full justify-start gap-2.5 text-xs font-semibold text-nx-ink hover:bg-nx-raised"
          >
            <List className="size-3.5 text-success" aria-hidden="true" />
            <span>{t("operationsCalendar.quickActions.viewToday")}</span>
          </Button>
        </div>
      </Card>

      {/* 3. Court Status */}
      <Card className="p-3.5">
        <h3 className="mb-2.5 text-xs font-bold text-nx-ink">
          {t("operationsCalendar.courtStatus.title")}
        </h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium text-nx-ink-2">
              <span className="size-2 rounded-full bg-success" />
              <span>{t("operationsCalendar.courtStatus.inUse")}</span>
            </div>
            <span className="font-bold tabular-nums text-nx-ink">{inUseVal}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium text-nx-ink-2">
              <span className="size-2 rounded-full bg-info" />
              <span>{t("operationsCalendar.courtStatus.free")}</span>
            </div>
            <span className="font-bold tabular-nums text-nx-ink">{freeVal}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 font-medium text-nx-ink-2">
              <span className="size-2 rounded-full bg-destructive" />
              <span>{t("operationsCalendar.courtStatus.maintenance")}</span>
            </div>
            <span className="font-bold tabular-nums text-nx-ink">{maintVal}</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
