"use client";

import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Clock } from "lucide-react";
import {  cn , resolveIntlLocale } from "@core/common/utils";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { CustomCalendar } from "./custom-calendar";
import { scrollIntoViewIfNeeded, type DropdownPosition } from "@core/common/dropdown-positioning";

// Wave C collapse: 7 date-picker skins reduce to "default" (the nexus token
// treatment) and "elegant" (the accent take — accent underline + wash). The
// retired skins were the same field with different wallpaper, so they all
// read nearest to "default".
export type DatePickerVariant = "default" | "elegant";

const LEGACY_DATE_PICKER_VARIANT: Partial<Record<string, DatePickerVariant>> = {
  modern: "default",
  glass: "default",
  outlined: "default",
  filled: "default",
  minimal: "default",
};

// Stored settings can hold values the map no longer knows; unknowns fall back
// to "default" so first paint is always a styled field.
export const resolveDatePickerVariant = (value: string | null | undefined): DatePickerVariant => {
  if (value === "default" || value === "elegant") return value;
  return (value && LEGACY_DATE_PICKER_VARIANT[value]) || "default";
};

interface DatePickerProps {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "date" | "datetime-local";
  /** Earliest selectable day (any parseable date string). Additive — undefined keeps every day selectable. */
  minDate?: string;
  /** Latest selectable day (any parseable date string). Additive — undefined keeps every day selectable. */
  maxDate?: string;
  /** Per-day veto for booking-style rules the min/max window cannot express. */
  isDateDisabled?: (date: Date) => boolean;
}

interface PositionCalcParams {
  triggerRect: DOMRect;
  calendarRect?: DOMRect;
  calendarContent?: HTMLElement | null;
}

interface PositionResult {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  shouldShowAbove: boolean;
}

// Constants
const MIN_CALENDAR_WIDTH = 320;
const ESTIMATED_CALENDAR_HEIGHT = 520; // header + calendar grid + time picker + action buttons
const EDGE_PADDING = 8;

function calculateCalendarPosition(params: PositionCalcParams): PositionResult {
  const { triggerRect, calendarRect, calendarContent } = params;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Natural width
  let naturalWidth = MIN_CALENDAR_WIDTH;
  if (calendarContent) {
    const contentRect = calendarContent.getBoundingClientRect();
    naturalWidth = Math.max(contentRect.width || MIN_CALENDAR_WIDTH, MIN_CALENDAR_WIDTH);
  }
  const preferredWidth = Math.max(
    naturalWidth,
    triggerRect.width >= MIN_CALENDAR_WIDTH ? triggerRect.width : MIN_CALENDAR_WIDTH
  );

  // Use actual rendered height if available, otherwise estimate
  const estimatedHeight = calendarRect?.height || ESTIMATED_CALENDAR_HEIGHT;

  // Available space above and below (viewport-relative)
  const spaceBelow = viewportHeight - triggerRect.bottom;
  const spaceAbove = triggerRect.top;

  // Flip above if not enough room below and more room above
  const shouldShowAbove = spaceBelow < estimatedHeight && spaceAbove > spaceBelow;

  // Calculate vertical position (viewport-relative for position:fixed)
  let top: number;
  if (shouldShowAbove) {
    top = triggerRect.top - estimatedHeight - 1;
    top = Math.max(top, EDGE_PADDING);
  } else {
    top = triggerRect.bottom + 1;
  }

  // Calculate horizontal position (viewport-relative)
  let left = triggerRect.left;
  if (left + preferredWidth > viewportWidth) {
    const rightAlignLeft = triggerRect.right - preferredWidth;
    left = Math.max(rightAlignLeft, EDGE_PADDING);
  }
  if (left < 0) {
    left = EDGE_PADDING;
  }

  return {
    top,
    left,
    width: preferredWidth,
    maxHeight: Math.max(spaceBelow, spaceAbove) - EDGE_PADDING,
    shouldShowAbove,
  };
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

export function DatePicker({
  id,
  value = "",
  onChange,
  placeholder,
  required = false,
  disabled = false,
  className,
  type = "date",
  minDate,
  maxDate,
  isDateDisabled,
}: DatePickerProps) {
  const { datePickerStyle, borderRadius } = useSettings();
  const { t, language } = useI18n();
  const [showCalendar, setShowCalendar] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: ESTIMATED_CALENDAR_HEIGHT,
    placement: "bottom-start",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const shouldShowAboveRef = useRef(false);

  const variant = resolveDatePickerVariant(datePickerStyle);

  // Validate and handle input change
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      if (newValue) {
        const parsed = parseDateSafe(newValue);
        if (parsed) {
          onChange?.(newValue);
        }
      } else {
        onChange?.(newValue);
      }
    },
    [onChange]
  );

  const handleCalendarChange = useCallback(
    (newValue: string) => {
      onChange?.(newValue);
      if (type === "date") {
        setShowCalendar(false);
        // Return focus to trigger
        triggerRef.current?.focus();
      }
    },
    [type, onChange]
  );

  const handleIconClick = useCallback(() => {
    if (disabled) return;

    if (!showCalendar && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const position = calculateCalendarPosition({ triggerRect: rect });
      shouldShowAboveRef.current = position.shouldShowAbove;

      setCalendarPosition({
        top: position.top,
        left: position.left,
        width: position.width,
        maxHeight: position.maxHeight,
        placement: position.shouldShowAbove ? "top-start" : "bottom-start",
      });

      scrollIntoViewIfNeeded(containerRef.current);
      setAnimateOpen(false);
      setTimeout(() => setAnimateOpen(true), 10);
    } else {
      setAnimateOpen(false);
    }
    setShowCalendar(!showCalendar);
  }, [showCalendar, disabled]);

  // Keyboard handler for trigger
  const handleTriggerKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled) return;

      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleIconClick();
      } else if (e.key === "Escape" && showCalendar) {
        e.preventDefault();
        setShowCalendar(false);
      }
    },
    [disabled, showCalendar, handleIconClick]
  );

  // Format display value with locale awareness
  const formatDisplayValue = useCallback(
    (dateValue: string) => {
      if (!dateValue) return "";
      const date = parseDateSafe(dateValue);
      if (!date) {
        return t("common.invalidDate");
      }

      try {
        const locale = resolveIntlLocale(language);
        const options: Intl.DateTimeFormatOptions = {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        };

        if (type === "datetime-local") {
          options.hour = "2-digit";
          options.minute = "2-digit";
        }

        return new Intl.DateTimeFormat(locale, options).format(date);
      } catch {
        return t("common.invalidDate");
      }
    },
    [language, type, t]
  );

  const calendarId = `calendar-${id || "datepicker"}`;
  const descriptionId = `${id || "datepicker"}-description`;

  // Update position on window resize
  useEffect(() => {
    if (!showCalendar || !containerRef.current || !calendarRef.current) return;

    const updatePosition = () => {
      const triggerRect = containerRef.current!.getBoundingClientRect();
      const calendarRect = calendarRef.current!.getBoundingClientRect();
      const calendarContent = calendarRef.current!.querySelector(
        "[data-calendar-content]"
      ) as HTMLElement;

      const position = calculateCalendarPosition({
        triggerRect,
        calendarRect,
        calendarContent,
      });

      shouldShowAboveRef.current = position.shouldShowAbove;
      setCalendarPosition((pos) => ({
        ...pos,
        ...position,
      }));
    };

    const handleResize = () => updatePosition();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [showCalendar]);

  // Close calendar if disabled
  const [prevDisabled, setPrevDisabled] = useState(disabled);
  if (disabled !== prevDisabled) {
    setPrevDisabled(disabled);
    if (disabled && showCalendar) {
      setShowCalendar(false);
    }
  }

  // Handle click outside, scroll, and keyboard
  useEffect(() => {
    if (!showCalendar) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isClickInTrigger = containerRef.current?.contains(target);
      const isClickInCalendar = calendarRef.current?.contains(target);
      if (!isClickInTrigger && !isClickInCalendar) {
        setShowCalendar(false);
        triggerRef.current?.focus();
      }
    };

    const handleWindowScroll = () => {
      if (!showCalendar || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const threshold = 10;
      const isFieldStartingToHide =
        rect.top < threshold ||
        rect.bottom > window.innerHeight - threshold ||
        rect.left < threshold ||
        rect.right > window.innerWidth - threshold;

      if (isFieldStartingToHide) {
        setShowCalendar(false);
        triggerRef.current?.focus();
      } else {
        requestAnimationFrame(() => {
          if (!containerRef.current || !calendarRef.current) return;
          const triggerRect = containerRef.current.getBoundingClientRect();
          const calendarRect = calendarRef.current.getBoundingClientRect();
          const calendarContent = calendarRef.current.querySelector(
            "[data-calendar-content]"
          ) as HTMLElement;

          const position = calculateCalendarPosition({
            triggerRect,
            calendarRect,
            calendarContent,
          });

          shouldShowAboveRef.current = position.shouldShowAbove;
          setCalendarPosition((pos) => ({ ...pos, ...position }));
        });
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && showCalendar) {
        setShowCalendar(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleWindowScroll, true);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleWindowScroll, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showCalendar]);

  const IconComponent = type === "datetime-local" ? Clock : CalendarDays;

  // The Settings borderRadius, mapped onto the nx radius ladder — the same
  // ladder Input and Button ride, so a date field and a text field in the same
  // row have identical corners.
  const borderRadiusClass = useMemo(() => {
    switch (borderRadius) {
      case "none":
        return "rounded-none";
      case "small":
        return "rounded-nx-sm";
      case "large":
        return "rounded-nx-lg";
      case "full":
        return "rounded-full";
      default:
        return "rounded-nx-control";
    }
  }, [borderRadius]);

  // The trigger IS the field, so it wears the field surface: 40px tall on the
  // sunken --nx-ground behind a hairline, hover lifts the hairline, focus and
  // the open state light the edge. "elegant" is the accent take — the same
  // skeleton plus an accent underline and an accent-wash tint while the
  // calendar is up. Inert is the raised slab with ink-3, never a 50% wash.
  const triggerStyles = useMemo(() => {
    const base = cn(
      "relative flex h-10 w-full items-center justify-between gap-2 px-3 py-2 text-sm",
      "border border-nx-line bg-nx-ground",
      "transition-[color,border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
      "focus-visible:outline-none focus-visible:border-nx-accent focus-visible:shadow-nx-focus",
      borderRadiusClass
    );

    if (variant === "elegant") {
      return cn(
        base,
        "hover:border-nx-accent",
        showCalendar ? "border-nx-accent bg-nx-accent-wash" : ""
      );
    }

    return cn(
      base,
      "hover:border-nx-line-hi",
      showCalendar ? "border-nx-accent shadow-nx-focus" : ""
    );
  }, [variant, borderRadiusClass, showCalendar]);

  const displayValue = useMemo(() => {
    if (!value) return placeholder || t("common.selectDate");
    return formatDisplayValue(value);
  }, [value, placeholder, formatDisplayValue, t]);

  const ariaLabel = useMemo(() => {
    if (value) {
      return `${placeholder || t("common.selectDate")}: ${formatDisplayValue(value)}`;
    }
    return placeholder || t("common.selectDate");
  }, [value, placeholder, formatDisplayValue, t]);

  return (
    <div ref={containerRef} className={cn("group relative w-full", className)}>
      <input
        id={id}
        type={type}
        value={value}
        onChange={handleChange}
        required={required}
        disabled={disabled}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
      <div
        ref={triggerRef}
        className={cn(
          triggerStyles,
          disabled
            ? "cursor-not-allowed border-nx-line bg-nx-raised text-nx-ink-3 shadow-none hover:border-nx-line"
            : "cursor-pointer"
        )}
        onClick={handleIconClick}
        onKeyDown={handleTriggerKeyDown}
        tabIndex={disabled ? -1 : 0}
        role="combobox"
        aria-expanded={showCalendar}
        aria-haspopup="dialog"
        aria-controls={showCalendar ? calendarId : undefined}
        aria-label={ariaLabel}
        aria-describedby={descriptionId}
        aria-disabled={disabled}
      >
        <span id={descriptionId} className="sr-only">
          {t("common.datePickerInstructions")}
        </span>
        {/* A formatted date is a run of digits — tabular figures stop the
            field twitching as the value changes. Empty reads as placeholder
            ink, never as a value. */}
        <span
          className={cn(
            "flex-1 select-none truncate text-start",
            value ? "tabular-nums text-nx-ink" : "text-nx-ink-3",
            disabled && "text-nx-ink-3"
          )}
        >
          {displayValue}
        </span>
        <IconComponent
          className={cn(
            "h-4 w-4 flex-shrink-0",
            "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
            showCalendar ? "text-nx-accent" : "text-nx-ink-3"
          )}
          aria-hidden="true"
        />
      </div>

      {/* The accent underline — elegant's signature detail. Block-axis anchored,
          so it needs no direction handling. */}
      {variant === "elegant" && !disabled && (
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 h-0.5 bg-nx-accent",
            "transition-opacity duration-nx-standard ease-nx-enter motion-reduce:transition-none",
            showCalendar ? "opacity-100" : "opacity-0 group-focus-within:opacity-60"
          )}
        />
      )}

      {showCalendar &&
        !disabled &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={calendarRef}
            id={calendarId}
            data-dropdown-portal="true"
            data-date-picker="true"
            role="dialog"
            aria-modal="true"
            aria-label={t("common.calendarDialog")}
            className={cn(
              // z-dropdown, not the 32-bit integer ceiling. A popover that outranks every
              // possible layer wins against dialogs and toasts too, which is never right.
              // It floats, so it earns the popover shadow — the only shadow in
              // this file.
              "pointer-events-auto fixed z-dropdown rounded-nx-md border border-nx-line bg-nx-popover shadow-nx-popover",
              calendarPosition.placement === "top-start"
                ? "rounded-b-none border-b-0"
                : "rounded-t-none border-t-0",
              // transform+opacity entrance at micro speed; reduced motion keeps
              // the crossfade and drops the slide
              "transition-[transform,opacity] duration-nx-micro ease-nx-enter motion-reduce:translate-y-0 motion-reduce:transition-none",
              animateOpen
                ? "translate-y-0 opacity-100"
                : cn(
                    "opacity-0",
                    calendarPosition.placement === "top-start"
                      ? "translate-y-1.5"
                      : "-translate-y-1.5"
                  )
            )}
            style={{
              top: `${calendarPosition.top}px`,
              left: `${calendarPosition.left}px`,
              width: `${calendarPosition.width}px`,
              pointerEvents: "auto",
            }}
            onMouseDownCapture={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
            onFocusCapture={(e) => e.stopPropagation()}
          >
            <CustomCalendar
              value={value}
              onChange={disabled ? undefined : handleCalendarChange}
              onClose={() => {
                setShowCalendar(false);
                triggerRef.current?.focus();
              }}
              type={type}
              minDate={minDate}
              maxDate={maxDate}
              isDateDisabled={isDateDisabled}
            />
          </div>,
          document.body
        )}

      {showCalendar && (
        <RenderMeasure
          onMeasure={() => {
            if (!containerRef.current || !calendarRef.current) return;

            // Temporarily remove constraints to measure natural size
            const calendarContent = calendarRef.current.querySelector(
              "[data-calendar-content]"
            ) as HTMLElement;
            const originalWidth = calendarRef.current.style.width;
            const originalMinWidth = calendarRef.current.style.minWidth;
            const originalMaxHeight = calendarRef.current.style.maxHeight;
            const originalOverflow = calendarRef.current.style.overflow;
            calendarRef.current.style.width = "auto";
            calendarRef.current.style.minWidth = `${MIN_CALENDAR_WIDTH}px`;
            calendarRef.current.style.maxHeight = "none";
            calendarRef.current.style.overflow = "visible";
            void calendarRef.current.offsetWidth; // Force reflow

            const triggerRect = containerRef.current.getBoundingClientRect();
            // Use scrollHeight for true natural height (not clipped by viewport)
            const naturalHeight = calendarRef.current.scrollHeight;
            const calendarRect = calendarRef.current.getBoundingClientRect();
            // Override height with natural scrollHeight
            const fullRect = {
              ...calendarRect,
              height: naturalHeight,
            } as DOMRect;

            let naturalWidth = MIN_CALENDAR_WIDTH;
            if (calendarContent) {
              const contentRect = calendarContent.getBoundingClientRect();
              const measuredContentWidth =
                contentRect.width || calendarContent.scrollWidth || MIN_CALENDAR_WIDTH;
              const wrapperStyle = window.getComputedStyle(calendarRef.current);
              const paddingLeft = parseFloat(wrapperStyle.paddingLeft) || 0;
              const paddingRight = parseFloat(wrapperStyle.paddingRight) || 0;
              const borderLeft = parseFloat(wrapperStyle.borderLeftWidth) || 0;
              const borderRight = parseFloat(wrapperStyle.borderRightWidth) || 0;
              naturalWidth = Math.max(
                measuredContentWidth + paddingLeft + paddingRight + borderLeft + borderRight,
                MIN_CALENDAR_WIDTH
              );
            }

            // Restore original constraints
            calendarRef.current.style.width = originalWidth;
            calendarRef.current.style.minWidth = originalMinWidth;
            calendarRef.current.style.maxHeight = originalMaxHeight;
            calendarRef.current.style.overflow = originalOverflow;

            const position = calculateCalendarPosition({
              triggerRect,
              calendarRect: fullRect,
              calendarContent,
            });

            // Override width with natural width calculation
            position.width = Math.max(
              naturalWidth,
              triggerRect.width >= MIN_CALENDAR_WIDTH ? triggerRect.width : MIN_CALENDAR_WIDTH
            );

            shouldShowAboveRef.current = position.shouldShowAbove;
            setCalendarPosition((pos) => ({ ...pos, ...position }));
          }}
        />
      )}
    </div>
  );
}

function RenderMeasure({ onMeasure }: { onMeasure: () => void }) {
  React.useLayoutEffect(() => {
    const id = requestAnimationFrame(() => onMeasure());
    return () => cancelAnimationFrame(id);
  }, [onMeasure]);
  return null;
}
