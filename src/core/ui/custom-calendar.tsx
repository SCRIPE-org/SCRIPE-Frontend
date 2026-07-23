"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { cn } from "@core/common/utils";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";

// Wave C collapse: 6 calendar skins reduce to "default" (the nexus token
// treatment) and "elegant" (the accent take — accent-washed header, the
// signature glow on the selected day). The retired skins were the same grid
// with different wallpaper, so they all read nearest to "default".
export type CalendarVariant = "default" | "elegant";

const LEGACY_CALENDAR_VARIANT: Partial<Record<string, CalendarVariant>> = {
  modern: "default",
  glass: "default",
  minimal: "default",
  dark: "default",
};

// Stored settings can hold values the map no longer knows; unknowns fall back
// to "default" so first paint is always a styled calendar.
export const resolveCalendarVariant = (value: string | null | undefined): CalendarVariant => {
  if (value === "default" || value === "elegant") return value;
  return (value && LEGACY_CALENDAR_VARIANT[value]) || "default";
};

interface CustomCalendarProps {
  value?: string;
  onChange?: (value: string) => void;
  onClose?: () => void;
  type?: "date" | "datetime-local";
  className?: string;
  /** Earliest selectable day (any parseable date string). Additive — undefined keeps every day selectable. */
  minDate?: string;
  /** Latest selectable day (any parseable date string). Additive — undefined keeps every day selectable. */
  maxDate?: string;
  /** Per-day veto for booking-style rules the min/max window cannot express. */
  isDateDisabled?: (date: Date) => boolean;
}

// Helper: Parse date safely
function parseDateSafe(dateStr: string | null | undefined): Date | null {
  if (!dateStr) return null;
  try {
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

// Helper: Get locale-aware week start day (0 = Sunday, 6 = Saturday)
function getWeekStartDay(locale: string): number {
  // Arabic/Middle Eastern locales typically start on Saturday (6)
  // Western locales typically start on Sunday (0)
  return locale.startsWith("ar") ? 6 : 0;
}

// Helper: Get locale-aware weekday names
function getWeekDays(locale: string): string[] {
  const formatter = new Intl.DateTimeFormat(locale, { weekday: "short" });
  const weekStart = getWeekStartDay(locale);
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(2024, 0, weekStart + i + 1); // Use a fixed week (Jan 2024)
    return formatter.format(date);
  });
}

// Helper: Calculate first day of month adjusted for locale
function getFirstDayOfMonth(date: Date, locale: string): number {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const localeStart = getWeekStartDay(locale);
  return (firstDay - localeStart + 7) % 7;
}

export function CustomCalendar({
  value = "",
  onChange,
  onClose,
  type = "date",
  className,
  minDate,
  maxDate,
  isDateDisabled,
}: CustomCalendarProps) {
  const { calendarStyle, borderRadius } = useSettings();
  const { t, language, direction } = useI18n();

  const locale = language === "ar" ? "ar-EG" : "en-US";
  const variant = resolveCalendarVariant(calendarStyle);

  // Safe date initialization
  const [currentDate, setCurrentDate] = useState(() => {
    const parsed = parseDateSafe(value);
    return parsed || new Date();
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(parseDateSafe(value));

  const [selectedTime, setSelectedTime] = useState(() => {
    if (value && type === "datetime-local") {
      const parts = value.split("T");
      return parts[1]?.split(":")?.slice(0, 2).join(":") || "12:00";
    }
    return "12:00";
  });

  const [viewMode, setViewMode] = useState<"calendar" | "month" | "year">("calendar");
  const [focusedDate, setFocusedDate] = useState<number | null>(null);

  const [yearRangeStart, setYearRangeStart] = useState(() => {
    const currentYear = new Date().getFullYear();
    return Math.floor((currentYear - 12) / 10) * 10;
  });

  const calendarContainerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // Reset view mode when value changes
  useEffect(() => {
    if (value) {
      const parsed = parseDateSafe(value);
      if (parsed) {
        setCurrentDate(parsed);
        setSelectedDate(parsed);
        if (type === "datetime-local") {
          const parts = value.split("T");
          if (parts[1]) {
            setSelectedTime(parts[1].split(":")?.slice(0, 2).join(":") || "12:00");
          }
        }
      }
    }
    setViewMode("calendar");
    setFocusedDate(null);
  }, [value, type]);

  // ── Selectable-range guard ──────────────────────────────
  // Day-granular: minDate clamps to the start of its day, maxDate to the end,
  // and the predicate gets the candidate day for booking-style veto rules.

  const minDateObj = useMemo(() => {
    const d = parseDateSafe(minDate);
    if (d) d.setHours(0, 0, 0, 0);
    return d;
  }, [minDate]);

  const maxDateObj = useMemo(() => {
    const d = parseDateSafe(maxDate);
    if (d) d.setHours(23, 59, 59, 999);
    return d;
  }, [maxDate]);

  const isDisabledDate = useCallback(
    (date: Date): boolean => {
      if (minDateObj && date < minDateObj) return true;
      if (maxDateObj && date > maxDateObj) return true;
      return isDateDisabled ? isDateDisabled(date) : false;
    },
    [minDateObj, maxDateObj, isDateDisabled]
  );

  // Memoize months array (remove duplicate)
  const months = useMemo(
    () => [
      t("months.jan"),
      t("months.feb"),
      t("months.mar"),
      t("months.apr"),
      t("months.may"),
      t("months.jun"),
      t("months.jul"),
      t("months.aug"),
      t("months.sep"),
      t("months.oct"),
      t("months.nov"),
      t("months.dec"),
    ],
    [t]
  );

  // Get locale-aware weekdays
  const weekDays = useMemo(() => getWeekDays(locale), [locale]);

  // Memoize style functions
  const borderRadiusClass = useMemo(() => {
    switch (borderRadius) {
      case "none":
        return "rounded-none";
      case "small":
        return "rounded-sm";
      case "large":
        return "rounded-lg";
      case "full":
        return "rounded-xl";
      default:
        return "rounded-md";
    }
  }, [borderRadius]);

  // The calendar surface. Border and shadow belong to the popover wrapper in
  // date-picker (the only consumer) — doubling them here drew a seam.
  const calendarStyles = useMemo(
    () => cn("w-full bg-nx-popover", borderRadiusClass),
    [borderRadiusClass]
  );

  const headerStyles =
    variant === "elegant"
      ? "p-4 border-b border-nx-line bg-nx-accent-wash"
      : "p-4 border-b border-nx-line";

  const getButtonStyles = useCallback(
    (isSelected = false, isToday = false, isOtherMonth = false, isDisabled = false) => {
      const baseStyles = cn(
        "flex h-10 w-10 items-center justify-center rounded-nx-sm text-sm",
        "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:shadow-nx-focus",
        "disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
      );

      if (isDisabled) {
        return cn(baseStyles, "text-nx-ink-3");
      }

      if (isSelected) {
        return cn(
          baseStyles,
          "bg-nx-accent-fill font-semibold text-nx-on-fill",
          // the signature glow — the selected day is elegant's ONE lit element
          variant === "elegant" ? "shadow-nx-glow" : ""
        );
      }

      if (isToday) {
        return cn(baseStyles, "bg-nx-accent-wash font-semibold text-nx-accent");
      }

      if (isOtherMonth) {
        return cn(baseStyles, "text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink-2");
      }

      return cn(baseStyles, "text-nx-ink hover:bg-nx-hover");
    },
    [variant]
  );

  const timeInputStyles = cn(
    "w-full rounded-nx-control border border-nx-line bg-transparent px-3 py-2 text-sm text-nx-ink",
    "outline-none transition-[border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
    "focus-visible:border-nx-accent focus-visible:shadow-nx-focus"
  );

  // Shared chrome for the header/nav/footer controls — same focus law as the
  // day grid, hover on the ink-derived tint.
  const controlButtonStyles =
    "rounded-nx-sm transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover focus-visible:outline-none focus-visible:shadow-nx-focus";

  const getDaysInMonth = useCallback((date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }, []);

  const getFirstDayAdjusted = useCallback(
    (date: Date) => {
      return getFirstDayOfMonth(date, locale);
    },
    [locale]
  );

  // Format date using local time components
  const formatDateLocal = useCallback((date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // Resolve the actual Date a grid cell represents (other-month cells belong
  // to the adjacent month; day > 15 in an other-month cell means "previous").
  const resolveCellDate = useCallback(
    (day: number, isOtherMonth = false): Date => {
      if (isOtherMonth) {
        // Set to first day of month before shifting to avoid overflow edge cases
        const tempDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        tempDate.setMonth(tempDate.getMonth() + (day > 15 ? -1 : 1));
        return new Date(tempDate.getFullYear(), tempDate.getMonth(), day);
      }
      return new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    },
    [currentDate]
  );

  // Submit the selected date and time
  const submitDateAndTime = useCallback(
    (dateToSubmit: Date) => {
      if (type === "date") {
        const dateString = formatDateLocal(dateToSubmit);
        onChange?.(dateString);
        onClose?.();
      } else {
        const dateString = `${formatDateLocal(dateToSubmit)}T${selectedTime}`;
        onChange?.(dateString);
        onClose?.();
      }
    },
    [type, selectedTime, formatDateLocal, onChange, onClose]
  );

  const handleDateSelect = useCallback(
    (day: number, isOtherMonth = false) => {
      const newDate = resolveCellDate(day, isOtherMonth);
      if (isDisabledDate(newDate)) return;

      setSelectedDate(newDate);
      setFocusedDate(day);

      if (type === "date") {
        const dateString = formatDateLocal(newDate);
        onChange?.(dateString);
        onClose?.();
      } else {
        const dateString = `${formatDateLocal(newDate)}T${selectedTime}`;
        onChange?.(dateString);
      }
    },
    [resolveCellDate, isDisabledDate, type, selectedTime, formatDateLocal, onChange, onClose]
  );

  const handleDateDoubleClick = useCallback(
    (day: number, isOtherMonth = false) => {
      const newDate = resolveCellDate(day, isOtherMonth);
      if (isDisabledDate(newDate)) return;

      setSelectedDate(newDate);
      submitDateAndTime(newDate);
    },
    [resolveCellDate, isDisabledDate, submitDateAndTime]
  );

  const handleTimeChange = useCallback(
    (time: string) => {
      setSelectedTime(time);
      if (selectedDate) {
        const dateString = `${formatDateLocal(selectedDate)}T${time}`;
        onChange?.(dateString);
      }
    },
    [selectedDate, formatDateLocal, onChange]
  );

  // Navigate month - FIX: Handle edge case (Jan 31 -> Feb)
  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      // Set to first day to avoid month overflow issues
      newDate.setDate(1);
      if (direction === "prev") {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
    setViewMode("calendar");
    setFocusedDate(null);
  }, []);

  const handleMonthClick = useCallback(() => {
    setViewMode("month");
    setFocusedDate(null);
  }, []);

  const handleYearClick = useCallback(() => {
    setViewMode("year");
    setFocusedDate(null);
    const currentYear = currentDate.getFullYear();
    setYearRangeStart(Math.floor((currentYear - 12) / 10) * 10);
  }, [currentDate]);

  const handleMonthSelect = useCallback((monthIndex: number) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      // Fix edge case: set to first day before changing month
      newDate.setDate(1);
      newDate.setMonth(monthIndex);
      return newDate;
    });
    setViewMode("calendar");
    setFocusedDate(null);
  }, []);

  const handleYearSelect = useCallback(
    (year: number) => {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(1); // Set to first day to avoid month overflow
        newDate.setFullYear(year);
        return newDate;
      });
      if (year < yearRangeStart || year >= yearRangeStart + 12) {
        setYearRangeStart(Math.floor((year - 6) / 12) * 12);
      }
      setViewMode("calendar");
      setFocusedDate(null);
    },
    [yearRangeStart]
  );

  const navigateYearRange = useCallback((direction: "prev" | "next") => {
    setYearRangeStart((prev) => (direction === "prev" ? prev - 12 : prev + 12));
  }, []);

  // Keyboard navigation
  const getDateByOffset = useCallback(
    (offset: number): { day: number; isOtherMonth: boolean } | null => {
      const daysInMonth = getDaysInMonth(currentDate);
      const firstDay = getFirstDayAdjusted(currentDate);
      const today = focusedDate || selectedDate?.getDate() || 1;

      const totalDays = Math.ceil((firstDay + daysInMonth) / 7) * 7;
      const currentIndex = firstDay + (today - 1);
      const newIndex = currentIndex + offset;

      if (newIndex < 0) {
        // Previous month
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
        const daysInPrevMonth = prevMonth.getDate();
        const day = daysInPrevMonth + newIndex + 1;
        return { day: Math.max(1, day), isOtherMonth: true };
      } else if (newIndex >= totalDays) {
        // Next month
        const day = newIndex - totalDays + 1;
        return { day, isOtherMonth: true };
      } else if (newIndex < firstDay) {
        // Previous month (within current view)
        const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
        const daysInPrevMonth = prevMonth.getDate();
        const day = daysInPrevMonth - (firstDay - newIndex - 1);
        return { day, isOtherMonth: true };
      } else if (newIndex >= firstDay + daysInMonth) {
        // Next month (within current view)
        const day = newIndex - (firstDay + daysInMonth) + 1;
        return { day, isOtherMonth: true };
      } else {
        // Current month
        const day = newIndex - firstDay + 1;
        return { day, isOtherMonth: false };
      }
    },
    [currentDate, focusedDate, selectedDate, getDaysInMonth, getFirstDayAdjusted]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent | KeyboardEvent) => {
      if (viewMode !== "calendar") {
        if (e.key === "Escape") {
          e.preventDefault();
          setViewMode("calendar");
        }
        return;
      }

      const daysInMonth = getDaysInMonth(currentDate);

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          const leftDate = getDateByOffset(-1);
          if (leftDate) {
            if (leftDate.isOtherMonth) {
              navigateMonth("prev");
              setTimeout(() => setFocusedDate(leftDate.day), 0);
            } else {
              setFocusedDate(leftDate.day);
              handleDateSelect(leftDate.day, false);
            }
          }
          break;

        case "ArrowRight":
          e.preventDefault();
          const rightDate = getDateByOffset(1);
          if (rightDate) {
            if (rightDate.isOtherMonth) {
              navigateMonth("next");
              setTimeout(() => setFocusedDate(rightDate.day), 0);
            } else {
              setFocusedDate(rightDate.day);
              handleDateSelect(rightDate.day, false);
            }
          }
          break;

        case "ArrowUp":
          e.preventDefault();
          const upDate = getDateByOffset(-7);
          if (upDate) {
            if (upDate.isOtherMonth) {
              if (upDate.day > 15) {
                navigateMonth("prev");
              } else {
                navigateMonth("next");
              }
              setTimeout(() => setFocusedDate(upDate.day), 0);
            } else {
              setFocusedDate(upDate.day);
              handleDateSelect(upDate.day, false);
            }
          }
          break;

        case "ArrowDown":
          e.preventDefault();
          const downDate = getDateByOffset(7);
          if (downDate) {
            if (downDate.isOtherMonth) {
              if (downDate.day > 15) {
                navigateMonth("prev");
              } else {
                navigateMonth("next");
              }
              setTimeout(() => setFocusedDate(downDate.day), 0);
            } else {
              setFocusedDate(downDate.day);
              handleDateSelect(downDate.day, false);
            }
          }
          break;

        case "Home":
          e.preventDefault();
          setFocusedDate(1);
          handleDateSelect(1, false);
          break;

        case "End":
          e.preventDefault();
          setFocusedDate(daysInMonth);
          handleDateSelect(daysInMonth, false);
          break;

        case "PageUp":
          e.preventDefault();
          navigateMonth("prev");
          break;

        case "PageDown":
          e.preventDefault();
          navigateMonth("next");
          break;

        case "Enter":
        case " ":
          e.preventDefault();
          if (selectedDate && !isDisabledDate(selectedDate)) {
            submitDateAndTime(selectedDate);
          }
          break;

        case "Escape":
          e.preventDefault();
          onClose?.();
          break;
      }
    },
    [
      viewMode,
      currentDate,
      selectedDate,
      getDaysInMonth,
      getDateByOffset,
      navigateMonth,
      handleDateSelect,
      isDisabledDate,
      submitDateAndTime,
      onClose,
    ]
  );

  // Keyboard event listener
  useEffect(() => {
    const handleWindowKeyDown = (event: KeyboardEvent) => {
      if (calendarContainerRef.current?.contains(event.target as Node)) {
        handleKeyDown(event as any);
      }
    };

    window.addEventListener("keydown", handleWindowKeyDown);
    return () => window.removeEventListener("keydown", handleWindowKeyDown);
  }, [handleKeyDown]);

  const renderCalendarDays = useCallback(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayAdjusted(currentDate);
    const today = new Date();
    const days = [];

    // Previous month's trailing days
    const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();

    for (let i = firstDay - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const dateKey = `prev-${day}`;
      const isFocused = focusedDate === day && viewMode === "calendar";
      const cellDisabled = isDisabledDate(resolveCellDate(day, true));
      days.push(
        <button
          key={dateKey}
          onClick={() => handleDateSelect(day, true)}
          onDoubleClick={() => handleDateDoubleClick(day, true)}
          onKeyDown={handleKeyDown}
          className={getButtonStyles(false, false, true, cellDisabled)}
          aria-label={`${day} ${t("common.ofPreviousMonth") || "of previous month"}, ${months[prevMonth.getMonth()]} ${prevMonth.getFullYear()}`}
          aria-disabled={cellDisabled || undefined}
          disabled={cellDisabled}
          role="gridcell"
          tabIndex={isFocused ? 0 : -1}
          data-day={day}
          data-other-month="true"
        >
          {day}
        </button>
      );
    }

    // Current month's days
    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = selectedDate
        ? selectedDate.getDate() === day &&
          selectedDate.getMonth() === currentDate.getMonth() &&
          selectedDate.getFullYear() === currentDate.getFullYear()
        : false;

      const isToday =
        today.getDate() === day &&
        today.getMonth() === currentDate.getMonth() &&
        today.getFullYear() === currentDate.getFullYear();

      const isFocused =
        (focusedDate === day || (!focusedDate && isSelected)) && viewMode === "calendar";

      const cellDisabled = isDisabledDate(resolveCellDate(day));

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          onDoubleClick={() => handleDateDoubleClick(day)}
          onKeyDown={handleKeyDown}
          className={getButtonStyles(isSelected, isToday, false, cellDisabled)}
          aria-label={`${day} ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}${isToday ? `, ${t("common.today") || "today"}` : ""}`}
          aria-current={isSelected ? "date" : undefined}
          aria-disabled={cellDisabled || undefined}
          disabled={cellDisabled}
          role="gridcell"
          tabIndex={isFocused ? 0 : -1}
          data-day={day}
        >
          {day}
        </button>
      );
    }

    // Next month's leading days
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDay + daysInMonth);

    for (let day = 1; day <= remainingCells; day++) {
      const dateKey = `next-${day}`;
      const isFocused = focusedDate === day && viewMode === "calendar";
      const cellDisabled = isDisabledDate(resolveCellDate(day, true));
      days.push(
        <button
          key={dateKey}
          onClick={() => handleDateSelect(day, true)}
          onDoubleClick={() => handleDateDoubleClick(day, true)}
          onKeyDown={handleKeyDown}
          className={getButtonStyles(false, false, true, cellDisabled)}
          aria-label={`${day} ${t("common.ofNextMonth") || "of next month"}, ${months[(currentDate.getMonth() + 1) % 12]} ${currentDate.getMonth() === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear()}`}
          aria-disabled={cellDisabled || undefined}
          disabled={cellDisabled}
          role="gridcell"
          tabIndex={isFocused ? 0 : -1}
          data-day={day}
          data-other-month="true"
        >
          {day}
        </button>
      );
    }

    return days;
  }, [
    currentDate,
    selectedDate,
    focusedDate,
    viewMode,
    getDaysInMonth,
    getFirstDayAdjusted,
    months,
    getButtonStyles,
    handleDateSelect,
    handleDateDoubleClick,
    handleKeyDown,
    isDisabledDate,
    resolveCellDate,
    t,
  ]);

  // RTL-aware navigation icons
  // In RTL: left button = next (→), right button = previous (←)
  // In LTR: left button = previous (←), right button = next (→)
  const PrevIcon = direction === "rtl" ? ChevronRight : ChevronLeft;
  const NextIcon = direction === "rtl" ? ChevronLeft : ChevronRight;

  return (
    <div
      ref={calendarContainerRef}
      data-calendar-content="true"
      className={cn(calendarStyles, "h-full min-w-[320px]", className)}
      tabIndex={-1}
      role="application"
      aria-label={t("common.calendar") || "Calendar"}
    >
      {/* Header */}
      <div className={headerStyles}>
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              if (viewMode === "year") {
                navigateYearRange("prev");
              } else {
                navigateMonth("prev");
              }
            }}
            className={cn(controlButtonStyles, "p-1 text-nx-ink-2 hover:text-nx-ink")}
            aria-label={
              viewMode === "year"
                ? t("common.previousYearRange") || "Previous year range"
                : t("common.previousMonth") || "Previous month"
            }
          >
            <PrevIcon className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-nx-accent" aria-hidden="true" />
            <div className="flex items-center gap-1">
              <button
                onClick={handleMonthClick}
                className={cn(controlButtonStyles, "px-2 py-1 text-sm font-semibold text-nx-ink")}
                aria-label={t("common.selectMonth") || "Select month"}
                aria-expanded={viewMode === "month"}
              >
                {months[currentDate.getMonth()]}
              </button>
              <button
                onClick={handleYearClick}
                className={cn(controlButtonStyles, "px-2 py-1 text-sm font-semibold text-nx-ink")}
                aria-label={t("common.selectYear") || "Select year"}
                aria-expanded={viewMode === "year"}
              >
                {currentDate.getFullYear()}
              </button>
            </div>
          </div>

          <button
            onClick={() => {
              if (viewMode === "year") {
                navigateYearRange("next");
              } else {
                navigateMonth("next");
              }
            }}
            className={cn(controlButtonStyles, "p-1 text-nx-ink-2 hover:text-nx-ink")}
            aria-label={
              viewMode === "year"
                ? t("common.nextYearRange") || "Next year range"
                : t("common.nextMonth") || "Next month"
            }
          >
            <NextIcon className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Calendar/Month/Year View */}
      <div className="p-4">
        {viewMode === "calendar" && (
          <>
            {/* Week Days */}
            <div className="mb-2 grid grid-cols-7 gap-1" role="row">
              {weekDays.map((day, index) => (
                <div
                  key={index}
                  className="flex h-10 w-10 items-center justify-center text-xs font-medium text-nx-ink-3"
                  role="columnheader"
                  aria-label={day}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div
              ref={gridRef}
              className="grid grid-cols-7 gap-1"
              role="grid"
              aria-label={`${months[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            >
              {renderCalendarDays()}
            </div>
          </>
        )}

        {viewMode === "month" && (
          <div
            className="grid grid-cols-3 gap-2"
            role="listbox"
            aria-label={t("common.selectMonth") || "Select month"}
          >
            {months.map((month, index) => {
              const isSelected = currentDate.getMonth() === index;
              return (
                <button
                  key={index}
                  onClick={() => handleMonthSelect(index)}
                  onKeyDown={handleKeyDown}
                  className={cn(
                    "h-12 rounded-nx-control px-3 text-sm font-medium",
                    "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    "focus-visible:outline-none focus-visible:shadow-nx-focus",
                    isSelected
                      ? "bg-nx-accent-fill font-semibold text-nx-on-fill"
                      : "text-nx-ink hover:bg-nx-hover"
                  )}
                  role="option"
                  aria-selected={isSelected}
                  aria-label={month}
                >
                  {month}
                </button>
              );
            })}
          </div>
        )}

        {viewMode === "year" && (
          <>
            <div
              className="mb-2 grid grid-cols-4 gap-2"
              role="listbox"
              aria-label={t("common.selectYear") || "Select year"}
            >
              {Array.from({ length: 12 }, (_, i) => {
                const year = yearRangeStart + i;
                const isSelected = currentDate.getFullYear() === year;
                const isCurrentYear = new Date().getFullYear() === year;
                return (
                  <button
                    key={year}
                    onClick={() => handleYearSelect(year)}
                    onKeyDown={handleKeyDown}
                    className={cn(
                      "h-12 rounded-nx-control px-3 text-sm font-medium",
                      "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                      "focus-visible:outline-none focus-visible:shadow-nx-focus",
                      isSelected
                        ? "bg-nx-accent-fill font-semibold text-nx-on-fill"
                        : isCurrentYear
                          ? "bg-nx-accent-wash font-semibold text-nx-accent"
                          : "text-nx-ink hover:bg-nx-hover"
                    )}
                    role="option"
                    aria-selected={isSelected}
                    aria-label={year.toString()}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
            <div className="mt-2 flex items-center justify-between border-t border-nx-line pt-2">
              <button
                onClick={() => navigateYearRange("prev")}
                onKeyDown={handleKeyDown}
                className={cn(controlButtonStyles, "px-3 py-1 text-xs text-nx-ink-2 hover:text-nx-ink")}
                aria-label={`${yearRangeStart - 12} - ${yearRangeStart - 1}`}
              >
                {direction === "rtl" ? `→` : `←`} {yearRangeStart - 12} - {yearRangeStart - 1}
              </button>
              <span className="text-xs text-nx-ink-2" aria-live="polite">
                {yearRangeStart} - {yearRangeStart + 11}
              </span>
              <button
                onClick={() => navigateYearRange("next")}
                onKeyDown={handleKeyDown}
                className={cn(controlButtonStyles, "px-3 py-1 text-xs text-nx-ink-2 hover:text-nx-ink")}
                aria-label={`${yearRangeStart + 12} - ${yearRangeStart + 23}`}
              >
                {yearRangeStart + 12} - {yearRangeStart + 23} {direction === "rtl" ? `←` : `→`}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Time Picker for datetime-local */}
      {type === "datetime-local" && (
        <div className="border-t border-nx-line p-4">
          <div className="mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-nx-accent" aria-hidden="true" />
            <label htmlFor="time-input" className="text-sm font-medium text-nx-ink">
              {t("common.time") || "Time"}
            </label>
          </div>
          <input
            id="time-input"
            type="time"
            value={selectedTime}
            onChange={(e) => handleTimeChange(e.target.value)}
            className={timeInputStyles}
            aria-label={t("common.selectTime") || "Select time"}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 border-t border-nx-line p-4">
        <button
          onClick={onClose}
          onKeyDown={handleKeyDown}
          className={cn(controlButtonStyles, "px-3 py-1.5 text-sm text-nx-ink-2 hover:text-nx-ink")}
          aria-label={t("common.cancel") || "Cancel"}
        >
          {t("common.cancel")}
        </button>
        {type === "datetime-local" && (
          <button
            onClick={() => {
              if (selectedDate && !isDisabledDate(selectedDate)) {
                const dateString = `${formatDateLocal(selectedDate)}T${selectedTime}`;
                onChange?.(dateString);
              }
              onClose?.();
            }}
            onKeyDown={handleKeyDown}
            className={cn(
              "rounded-nx-control bg-nx-accent-fill px-3 py-1.5 text-sm text-nx-on-fill",
              "transition-opacity duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:opacity-90",
              "focus-visible:outline-none focus-visible:shadow-nx-focus"
            )}
            aria-label={t("common.ok") || "OK"}
          >
            {t("common.ok") || "OK"}
          </button>
        )}
      </div>
    </div>
  );
}
