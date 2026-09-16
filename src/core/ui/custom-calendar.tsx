"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight, Calendar, Clock } from "lucide-react";
import {  cn , resolveIntlLocale } from "@core/common/utils";
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
  /**
   * Move focus into the day grid when this calendar mounts.
   *
   * Opt-in, and `false` by default, because the two consumers are not the same
   * shape. `DatePicker` mounts this component only while its panel is open and
   * portals it to `document.body` — there, taking focus is the whole fix (see
   * the `rovingDay` and focus-management comments below). The Settings preview
   * stage renders a calendar permanently inline as page content; grabbing focus
   * on mount there would hijack the page on every visit.
   */
  autoFocus?: boolean;
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
  autoFocus = false,
}: CustomCalendarProps) {
  const { calendarStyle, borderRadius } = useSettings();
  const { t, language, direction } = useI18n();

  const locale = resolveIntlLocale(language);
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

  // The Settings borderRadius, mapped onto the nx radius ladder — same ladder
  // as the trigger it drops out of, so the two corners agree.
  const borderRadiusClass = useMemo(() => {
    switch (borderRadius) {
      case "none":
        return "rounded-none";
      case "small":
        return "rounded-nx-sm";
      case "large":
      case "full":
        return "rounded-nx-lg";
      default:
        return "rounded-nx-md";
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

  // Every day cell is a 40px target with tabular figures, so the grid columns
  // line up whatever the digits are. Four states, four distinct readings:
  //   unavailable  ink-3 + a strike, so a blocked booking day is legible at a
  //                glance instead of being a slightly paler number
  //   selected     the accent fill (elegant adds the ONE signature glow)
  //   today        an accent lit EDGE, not a fill — today is a marker, the
  //                selection is the statement, and the two must never look
  //                the same
  //   other-month  ink-3, hover lifts it one ink step
  const getButtonStyles = useCallback(
    (isSelected = false, isToday = false, isOtherMonth = false, isDisabled = false) => {
      const baseStyles = cn(
        "flex h-10 w-10 items-center justify-center rounded-nx-sm text-sm tabular-nums",
        "transition-[color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
        "focus-visible:outline-none focus-visible:shadow-nx-focus",
        "disabled:cursor-not-allowed disabled:hover:bg-transparent"
      );

      if (isDisabled) {
        return cn(baseStyles, "text-nx-ink-3 line-through decoration-1");
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
        return cn(
          baseStyles,
          "font-semibold text-nx-accent shadow-[inset_0_0_0_1px_var(--nx-accent)] hover:bg-nx-accent-wash"
        );
      }

      if (isOtherMonth) {
        return cn(baseStyles, "text-nx-ink-3 hover:bg-nx-hover hover:text-nx-ink-2");
      }

      return cn(baseStyles, "text-nx-ink hover:bg-nx-hover");
    },
    [variant]
  );

  // The time field is a field: same sunken ground, same hover lift, same lit
  // edge as every Input in the product.
  const timeInputStyles = cn(
    "h-10 w-full rounded-nx-control border border-nx-line bg-nx-ground px-3 py-2 text-sm tabular-nums text-nx-ink",
    "outline-none transition-[border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
    "hover:border-nx-line-hi focus-visible:border-nx-accent focus-visible:shadow-nx-focus"
  );

  // Shared chrome for the header/nav/footer controls — same focus law as the
  // day grid, hover on the ink-derived tint, and a 32px minimum box so a month
  // step is a real pointer target rather than a 16px chevron.
  const controlButtonStyles =
    "inline-flex min-h-8 items-center justify-center rounded-nx-sm transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none hover:bg-nx-hover focus-visible:outline-none focus-visible:shadow-nx-focus";

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

  // ── The day grid's single tab stop ──────────────────────────────
  //
  // A roving tabindex is only reachable if EXACTLY ONE cell carries
  // tabIndex={0} in every state. This grid used to manage none and sometimes
  // two.
  //
  // NONE was the blocker: `isFocused` was `focusedDate === day || (!focusedDate
  // && isSelected)`, `focusedDate` starts null, and an EMPTY date field has no
  // selected day — so every cell in the month rendered tabIndex={-1}. Nothing
  // focused the panel on open either, and `DatePicker` portals it to
  // document.body, so Tab from the field walked straight past the whole
  // calendar into the page behind it. The window keydown listener below only
  // reacts to events whose target is already inside the calendar, which nothing
  // could ever become. Net effect: an empty Date / DateTime field could not be
  // set by keyboard at all.
  //
  // TWO was the quieter bug: `focusedDate === day` compared day NUMBERS with no
  // regard for which month the cell belongs to, so a `focusedDate` of 3 lit
  // both the current month's 3rd and the trailing "3" borrowed from the next
  // month. Other-month cells are now pinned to -1 unconditionally: they are
  // never the roving target, because the arrow keys step the month first and
  // only then focus the day, by which point it belongs to the current month.
  //
  // This is derived rather than an effect that seeds `focusedDate`, so there is
  // no render in which the grid has no tab stop, and no ordering question
  // between the seed and the keyboard handler that reads it.
  const rovingDay = useMemo(() => {
    const daysInMonth = getDaysInMonth(currentDate);
    const isInView = (date: Date) =>
      date.getMonth() === currentDate.getMonth() &&
      date.getFullYear() === currentDate.getFullYear();

    let preferred: number;
    if (focusedDate !== null) {
      preferred = focusedDate;
    } else if (selectedDate && isInView(selectedDate)) {
      preferred = selectedDate.getDate();
    } else {
      const today = new Date();
      preferred = isInView(today) ? today.getDate() : 1;
    }
    // A month step can leave `focusedDate` past the end of a shorter month
    // (the 31st, then PageDown into February).
    preferred = Math.min(Math.max(preferred, 1), daysInMonth);

    // `disabled` outranks tabIndex: a disabled <button> is not focusable, so a
    // roving target parked on a blocked day (a future minDate, a booking veto)
    // would leave the grid unreachable all over again. Walk out to the nearest
    // selectable day — forward first, because a min-bounded window opens that
    // way.
    if (!isDisabledDate(resolveCellDate(preferred))) return preferred;
    for (let step = 1; step < daysInMonth; step++) {
      const after = preferred + step;
      if (after <= daysInMonth && !isDisabledDate(resolveCellDate(after))) return after;
      const before = preferred - step;
      if (before >= 1 && !isDisabledDate(resolveCellDate(before))) return before;
    }
    // Nothing in this month is selectable. Keep the preferred cell as the tab
    // stop so the state stays deterministic; the header's month/year controls
    // and the footer buttons are still reachable, which is how the user gets
    // to a month that has something in it.
    return preferred;
  }, [currentDate, focusedDate, selectedDate, getDaysInMonth, isDisabledDate, resolveCellDate]);

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
      // The arrows step from the cell that actually holds the tab stop. This
      // read used to be `focusedDate || selectedDate?.getDate() || 1`, which
      // disagreed with the rendered grid whenever `focusedDate` was null: on an
      // empty field the visible tab stop is today, but the first arrow press
      // jumped as if from the 1st.
      const today = rovingDay;

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
    [currentDate, rovingDay, getDaysInMonth, getFirstDayAdjusted]
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
      const cellDisabled = isDisabledDate(resolveCellDate(day, true));
      days.push(
        <button
          key={dateKey}
          onClick={() => handleDateSelect(day, true)}
          onDoubleClick={() => handleDateDoubleClick(day, true)}
          onKeyDown={handleKeyDown}
          className={getButtonStyles(false, false, true, cellDisabled)}
          aria-label={`${day} ${t("common.ofPreviousMonth")}, ${months[prevMonth.getMonth()]} ${prevMonth.getFullYear()}`}
          aria-disabled={cellDisabled || undefined}
          disabled={cellDisabled}
          role="gridcell"
          // Never the roving target — see the `rovingDay` comment.
          tabIndex={-1}
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

      // Exactly one current-month cell is the tab stop, in every state.
      const isFocused = day === rovingDay && viewMode === "calendar";

      const cellDisabled = isDisabledDate(resolveCellDate(day));

      days.push(
        <button
          key={day}
          onClick={() => handleDateSelect(day)}
          onDoubleClick={() => handleDateDoubleClick(day)}
          onKeyDown={handleKeyDown}
          className={getButtonStyles(isSelected, isToday, false, cellDisabled)}
          aria-label={`${day} ${months[currentDate.getMonth()]} ${currentDate.getFullYear()}${isToday ? `, ${t("common.today")}` : ""}`}
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
      const cellDisabled = isDisabledDate(resolveCellDate(day, true));
      days.push(
        <button
          key={dateKey}
          onClick={() => handleDateSelect(day, true)}
          onDoubleClick={() => handleDateDoubleClick(day, true)}
          onKeyDown={handleKeyDown}
          className={getButtonStyles(false, false, true, cellDisabled)}
          aria-label={`${day} ${t("common.ofNextMonth")}, ${months[(currentDate.getMonth() + 1) % 12]} ${currentDate.getMonth() === 11 ? currentDate.getFullYear() + 1 : currentDate.getFullYear()}`}
          aria-disabled={cellDisabled || undefined}
          disabled={cellDisabled}
          role="gridcell"
          // Never the roving target — see the `rovingDay` comment.
          tabIndex={-1}
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
    rovingDay,
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

  // ── Focus follows the tab stop ──────────────────────────────────
  //
  // A roving tabindex only works if DOM focus and the tab stop move together.
  // Three cases, and each is a real one:
  //
  //   1. On open (`autoFocus`) nothing in the panel had focus. This is the half
  //      of the blocker that tabIndex alone cannot fix: `DatePicker` portals the
  //      panel to document.body, so without moving focus here Tab from the field
  //      goes to the page behind the calendar and the window keydown listener
  //      above — which only reacts to targets already inside the calendar —
  //      never fires for anything.
  //   2. While the grid already holds focus, an arrow key changes `rovingDay`;
  //      the previously focused cell has just dropped to tabIndex={-1} and focus
  //      has to follow, or the ring and the tab stop drift apart.
  //   3. A month step (PageUp/PageDown, or an arrow crossing the edge) unmounts
  //      the focused cell, which parks activeElement on <body>. Nobody owns
  //      focus then, so reclaiming it is safe — and it is the only way keyboard
  //      navigation survives a month boundary.
  //
  // Case 3 is gated on having focused the grid at least once, so the inline
  // Settings-stage calendar (autoFocus={false}, never focused) cannot grab focus
  // off a quiet page. And because the reclaim requires activeElement to be body
  // or inside the grid, a focus trap that pulls focus elsewhere — a Radix modal
  // Dialog hosting this picker — is left alone rather than fought over.
  const gridOwnsFocusRef = useRef(false);

  useEffect(() => {
    if (viewMode !== "calendar") return;
    const grid = gridRef.current;
    if (!grid) return;

    const cell = grid.querySelector<HTMLElement>(
      `[data-day="${rovingDay}"]:not([data-other-month])`
    );
    if (!cell) return;

    const active = document.activeElement;
    const focusIsInGrid = !!active && grid.contains(active);
    if (focusIsInGrid) gridOwnsFocusRef.current = true;

    const shouldTakeFocusOnOpen = autoFocus && !gridOwnsFocusRef.current;
    const mayReclaimFocus =
      gridOwnsFocusRef.current && (focusIsInGrid || !active || active === document.body);
    if (!shouldTakeFocusOnOpen && !mayReclaimFocus) return;

    gridOwnsFocusRef.current = true;
    if (active !== cell) cell.focus();
    // `currentDate` is a dependency even though it is not read directly: a month
    // step can land on the SAME rovingDay number in a different month, and case
    // 3 above still has to run for the newly mounted cell.
  }, [autoFocus, viewMode, rovingDay, currentDate]);

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
      aria-label={t("common.calendar")}
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
              viewMode === "year" ? t("common.previousYearRange") : t("common.previousMonth")
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
                aria-label={t("common.selectMonth")}
                aria-expanded={viewMode === "month"}
              >
                {months[currentDate.getMonth()]}
              </button>
              <button
                onClick={handleYearClick}
                className={cn(controlButtonStyles, "px-2 py-1 text-sm font-semibold text-nx-ink")}
                aria-label={t("common.selectYear")}
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
              viewMode === "year" ? t("common.nextYearRange") : t("common.nextMonth")
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
            aria-label={t("common.selectMonth")}
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
                    "transition-[color,background-color] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                    "focus-visible:shadow-nx-focus focus-visible:outline-none",
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
              aria-label={t("common.selectYear")}
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
                      "h-12 rounded-nx-control px-3 text-sm font-medium tabular-nums",
                      "transition-[color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                      "focus-visible:shadow-nx-focus focus-visible:outline-none",
                      isSelected
                        ? "bg-nx-accent-fill font-semibold text-nx-on-fill"
                        : isCurrentYear
                          ? // the current year gets the same lit edge as today
                            // in the day grid — one language for "you are here"
                            "font-semibold text-nx-accent shadow-[inset_0_0_0_1px_var(--nx-accent)] hover:bg-nx-accent-wash"
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
            {/* Range stepper — the arrows are the SAME RTL-aware icons the
                month nav uses, not `←`/`→` glyphs picked by a direction
                ternary. Digits are tabular so the two ranges stay the same
                width as the decade rolls. */}
            <div className="mt-2 flex items-center justify-between gap-2 border-t border-nx-line pt-2">
              <button
                onClick={() => navigateYearRange("prev")}
                onKeyDown={handleKeyDown}
                className={cn(
                  controlButtonStyles,
                  "gap-1 px-2 py-1 text-xs tabular-nums text-nx-ink-2 hover:text-nx-ink"
                )}
                aria-label={`${yearRangeStart - 12} - ${yearRangeStart - 1}`}
              >
                <PrevIcon className="h-3 w-3" aria-hidden="true" />
                {yearRangeStart - 12} – {yearRangeStart - 1}
              </button>
              <span className="text-xs tabular-nums text-nx-ink-2" aria-live="polite">
                {yearRangeStart} – {yearRangeStart + 11}
              </span>
              <button
                onClick={() => navigateYearRange("next")}
                onKeyDown={handleKeyDown}
                className={cn(
                  controlButtonStyles,
                  "gap-1 px-2 py-1 text-xs tabular-nums text-nx-ink-2 hover:text-nx-ink"
                )}
                aria-label={`${yearRangeStart + 12} - ${yearRangeStart + 23}`}
              >
                {yearRangeStart + 12} – {yearRangeStart + 23}
                <NextIcon className="h-3 w-3" aria-hidden="true" />
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
              {t("common.time")}
            </label>
          </div>
          <input
            id="time-input"
            type="time"
            value={selectedTime}
            onChange={(e) => handleTimeChange(e.target.value)}
            className={timeInputStyles}
            aria-label={t("common.selectTime")}
          />
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-2 border-t border-nx-line p-4">
        <button
          onClick={onClose}
          onKeyDown={handleKeyDown}
          className={cn(controlButtonStyles, "px-3 py-1.5 text-sm text-nx-ink-2 hover:text-nx-ink")}
          aria-label={t("common.cancel")}
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
              // hover lights the top inner edge instead of fading the fill —
              // opacity math on a filled control reads as "disabled", not "hot"
              "inline-flex min-h-8 items-center rounded-nx-control bg-nx-accent-fill px-3 py-1.5 text-sm font-medium text-nx-on-fill",
              "transition-shadow duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              "hover:shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--nx-on-fill)_35%,transparent)]",
              "focus-visible:shadow-nx-focus focus-visible:outline-none"
            )}
            aria-label={t("common.ok")}
          >
            {t("common.ok")}
          </button>
        )}
      </div>
    </div>
  );
}
