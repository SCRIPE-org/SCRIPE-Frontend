"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import { cn } from "@core/common/utils";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";

interface CustomCalendarProps {
  value?: string;
  onChange?: (value: string) => void;
  onClose?: () => void;
  type?: "date" | "datetime-local";
  className?: string;
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
}: CustomCalendarProps) {
  const { calendarStyle, borderRadius } = useSettings();
  const { t, language, direction } = useI18n();

  const locale = language === "ar" ? "ar-EG" : "en-US";

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

  const calendarStyles = useMemo(() => {
    const baseStyles = "w-full bg-background border shadow-lg transition-all duration-200";

    switch (calendarStyle) {
      case "modern":
        return cn(
          baseStyles,
          "bg-gradient-to-br from-background to-muted/20",
          "border-border/50 shadow-xl backdrop-blur-sm",
          "ring-1 ring-primary/10",
          borderRadiusClass
        );
      case "glass":
        return cn(
          baseStyles,
          "bg-background/80 backdrop-blur-md",
          "border-white/20 shadow-2xl",
          "ring-1 ring-white/10",
          borderRadiusClass
        );
      case "elegant":
        return cn(
          baseStyles,
          "bg-gradient-to-br from-background via-background to-primary/5",
          "border-primary/20 shadow-xl",
          "ring-1 ring-primary/20",
          borderRadiusClass
        );
      case "minimal":
        return cn(baseStyles, "bg-background border-border shadow-md", "ring-0", borderRadiusClass);
      case "dark":
        return cn(
          baseStyles,
          "bg-slate-900 border-slate-700 shadow-2xl",
          "ring-1 ring-slate-600/50",
          borderRadiusClass
        );
      default:
        return cn(baseStyles, "border-border shadow-lg", borderRadiusClass);
    }
  }, [calendarStyle, borderRadiusClass]);

  const headerStyles = useMemo(() => {
    switch (calendarStyle) {
      case "modern":
        return "p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/50";
      case "glass":
        return "p-4 bg-white/10 border-b border-white/20 backdrop-blur-sm";
      case "elegant":
        return "p-4 bg-gradient-to-r from-primary/5 to-transparent border-b border-primary/20";
      case "minimal":
        return "p-3 border-b border-border";
      case "dark":
        return "p-4 bg-slate-800 border-b border-slate-700";
      default:
        return "p-4 border-b border-border";
    }
  }, [calendarStyle]);

  const getButtonStyles = useCallback(
    (isSelected = false, isToday = false, isOtherMonth = false) => {
      const baseStyles =
        "w-10 h-10 flex items-center justify-center text-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";

      if (isSelected) {
        switch (calendarStyle) {
          case "modern":
            return cn(
              baseStyles,
              "bg-primary text-primary-foreground rounded-lg shadow-md font-semibold"
            );
          case "glass":
            return cn(
              baseStyles,
              "bg-primary/80 text-white rounded-lg shadow-lg backdrop-blur-sm font-medium"
            );
          case "elegant":
            return cn(
              baseStyles,
              "bg-gradient-to-br from-primary to-primary/80 text-white rounded-lg shadow-lg font-semibold"
            );
          case "minimal":
            return cn(baseStyles, "bg-primary text-primary-foreground rounded-md font-medium");
          case "dark":
            return cn(baseStyles, "bg-blue-600 text-white rounded-lg shadow-md font-semibold");
          default:
            return cn(baseStyles, "bg-primary text-primary-foreground rounded-md");
        }
      }

      if (isToday) {
        switch (calendarStyle) {
          case "modern":
            return cn(
              baseStyles,
              "bg-primary/20 text-primary rounded-lg font-semibold ring-2 ring-primary/30"
            );
          case "glass":
            return cn(
              baseStyles,
              "bg-white/20 text-primary rounded-lg font-medium ring-1 ring-primary/50"
            );
          case "elegant":
            return cn(
              baseStyles,
              "bg-primary/10 text-primary rounded-lg font-semibold ring-1 ring-primary/40"
            );
          case "minimal":
            return cn(baseStyles, "bg-muted text-primary rounded-md font-medium");
          case "dark":
            return cn(baseStyles, "bg-blue-900/50 text-blue-300 rounded-lg font-semibold");
          default:
            return cn(baseStyles, "bg-muted text-primary rounded-md");
        }
      }

      if (isOtherMonth) {
        return cn(
          baseStyles,
          "text-muted-foreground/40 hover:text-muted-foreground hover:bg-muted/50 rounded-md"
        );
      }

      switch (calendarStyle) {
        case "modern":
          return cn(
            baseStyles,
            "text-foreground hover:bg-primary/10 hover:text-primary rounded-lg"
          );
        case "glass":
          return cn(
            baseStyles,
            "text-foreground/80 hover:bg-white/10 hover:text-foreground rounded-lg"
          );
        case "elegant":
          return cn(baseStyles, "text-foreground hover:bg-primary/5 hover:text-primary rounded-lg");
        case "minimal":
          return cn(baseStyles, "text-foreground hover:bg-muted rounded-md");
        case "dark":
          return cn(baseStyles, "text-slate-300 hover:bg-slate-700 hover:text-white rounded-lg");
        default:
          return cn(baseStyles, "text-foreground hover:bg-muted rounded-md");
      }
    },
    [calendarStyle]
  );

  const timeInputStyles = useMemo(() => {
    const baseStyles =
      "w-full px-3 py-2 text-sm bg-transparent border outline-none transition-all duration-200";

    switch (calendarStyle) {
      case "modern":
        return cn(
          baseStyles,
          "border-border/50 rounded-lg focus:border-primary focus:ring-2 focus:ring-primary/20"
        );
      case "glass":
        return cn(
          baseStyles,
          "border-white/20 rounded-lg focus:border-primary/50 focus:ring-1 focus:ring-primary/30 bg-white/5"
        );
      case "elegant":
        return cn(
          baseStyles,
          "border-primary/20 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary/30"
        );
      case "minimal":
        return cn(baseStyles, "border-border rounded-md focus:border-primary");
      case "dark":
        return cn(
          baseStyles,
          "border-slate-600 rounded-lg focus:border-blue-500 bg-slate-800 text-slate-200"
        );
      default:
        return cn(baseStyles, "border-border rounded-md focus:border-primary");
    }
  }, [calendarStyle]);

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
      let newDate: Date;

      if (isOtherMonth) {
        if (day > 15) {
          // Previous month - fix edge case: set to first day of month before changing
          const tempDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          tempDate.setMonth(tempDate.getMonth() - 1);
          newDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), day);
        } else {
          // Next month
          const tempDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          tempDate.setMonth(tempDate.getMonth() + 1);
          newDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), day);
        }
      } else {
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      }

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
    [currentDate, type, selectedTime, formatDateLocal, onChange, onClose]
  );

  const handleDateDoubleClick = useCallback(
    (day: number, isOtherMonth = false) => {
      let newDate: Date;

      if (isOtherMonth) {
        if (day > 15) {
          const tempDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          tempDate.setMonth(tempDate.getMonth() - 1);
          newDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), day);
        } else {
          const tempDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
          tempDate.setMonth(tempDate.getMonth() + 1);
          newDate = new Date(tempDate.getFullYear(), tempDate.getMonth(), day);
        }
      } else {
        newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      }

      setSelectedDate(newDate);
      submitDateAndTime(newDate);
    },
    [currentDate, submitDateAndTime]
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
      const today = focusedDate || selectedDate?.getDate() || 1;

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
          if (selectedDate) {
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
      focusedDate,
      selectedDate,
      getDaysInMonth,
      getDateByOffset,
      navigateMonth,
      handleDateSelect,
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
      days.push(
        <button
          key={dateKey}
          onClick={() => handleDateSelect(day, true)}
          onDoubleClick={() => handleDateDoubleClick(day, true)}
          onKeyDown={handleKeyDown}
          className={getButtonStyles(false, false, true)}
          aria-label={`${day} ${t("common.ofPreviousMonth") || "of previous month"}, ${months[prevMonth.getMonth()]} ${prevMonth.getFullYear()}`}
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

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          onDoubleClick={() => handleDateDoubleClick(day)}
          onKeyDown={handleKeyDown}
          className={getButtonStyles(isSelected, isToday)}
          aria-label={`${day} ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}${isToday ? `, ${t("common.today") || "today"}` : ""}`}
          aria-current={isSelected ? "date" : undefined}
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
      days.push(
        <button
          key={dateKey}
          onClick={() => handleDateSelect(day, true)}
          onDoubleClick={() => handleDateDoubleClick(day, true)}
          onKeyDown={handleKeyDown}
          className={getButtonStyles(false, false, true)}
          aria-label={`${day} ${t("common.ofNextMonth") || "of next month"}, ${months[(currentDate.getMonth() + 1) % 12]} ${currentDate.getMonth() === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear()}`}
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
            className="rounded-md p-1 transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label={
              viewMode === "year"
                ? t("common.previousYearRange") || "Previous year range"
                : t("common.previousMonth") || "Previous month"
            }
          >
            <PrevIcon className="h-4 w-4" aria-hidden="true" />
          </button>

          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary" aria-hidden="true" />
            <div className="flex items-center gap-1">
              <button
                onClick={handleMonthClick}
                className="rounded-md px-2 py-1 text-sm font-semibold transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={t("common.selectMonth") || "Select month"}
                aria-expanded={viewMode === "month"}
              >
                {months[currentDate.getMonth()]}
              </button>
              <button
                onClick={handleYearClick}
                className="rounded-md px-2 py-1 text-sm font-semibold transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
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
            className="rounded-md p-1 transition-colors hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="flex h-10 w-10 items-center justify-center text-xs font-medium text-muted-foreground"
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
                    "h-12 rounded-md px-3 text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary",
                    isSelected
                      ? "bg-primary font-semibold text-primary-foreground shadow-md"
                      : "hover:bg-primary/10 hover:text-primary"
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
                      "h-12 rounded-md px-3 text-sm font-medium transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary",
                      isSelected
                        ? "bg-primary font-semibold text-primary-foreground shadow-md"
                        : isCurrentYear
                          ? "bg-primary/20 font-semibold text-primary ring-2 ring-primary/30 hover:bg-primary/30"
                          : "hover:bg-primary/10 hover:text-primary"
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
            <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
              <button
                onClick={() => navigateYearRange("prev")}
                onKeyDown={handleKeyDown}
                className="px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label={`${yearRangeStart - 12} - ${yearRangeStart - 1}`}
              >
                {direction === "rtl" ? `→` : `←`} {yearRangeStart - 12} - {yearRangeStart - 1}
              </button>
              <span className="text-xs text-muted-foreground" aria-live="polite">
                {yearRangeStart} - {yearRangeStart + 11}
              </span>
              <button
                onClick={() => navigateYearRange("next")}
                onKeyDown={handleKeyDown}
                className="px-3 py-1 text-xs text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
        <div className="border-t border-border p-4">
          <div className="mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
            <label htmlFor="time-input" className="text-sm font-medium">
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
      <div className="flex justify-end gap-2 border-t border-border p-4">
        <button
          onClick={onClose}
          onKeyDown={handleKeyDown}
          className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          aria-label={t("common.cancel") || "Cancel"}
        >
          {t("common.cancel")}
        </button>
        {type === "datetime-local" && (
          <button
            onClick={() => {
              if (selectedDate) {
                const dateString = `${formatDateLocal(selectedDate)}T${selectedTime}`;
                onChange?.(dateString);
              }
              onClose?.();
            }}
            onKeyDown={handleKeyDown}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label={t("common.ok") || "OK"}
          >
            {t("common.ok") || "OK"}
          </button>
        )}
      </div>
    </div>
  );
}
