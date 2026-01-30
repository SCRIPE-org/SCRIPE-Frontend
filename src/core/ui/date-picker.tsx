"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from "react";
import { createPortal } from "react-dom";
import { CalendarDays, Clock } from "lucide-react";
import { cn } from "@core/common/utils";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { CustomCalendar } from "./custom-calendar";
import {
  scrollIntoViewIfNeeded,
  type DropdownPosition,
} from "@/lib/dropdown-positioning";

interface DatePickerProps {
  id?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  type?: "date" | "datetime-local";
}

interface Viewport {
  width: number;
  height: number;
  scrollX: number;
  scrollY: number;
}

interface PositionCalcParams {
  triggerRect: DOMRect;
  calendarRect?: DOMRect;
  calendarHeight?: number;
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
const MIN_CALENDAR_HEIGHT = 300;
const MAX_CALENDAR_HEIGHT = 400;
const BOTTOM_MARGIN_NEAR_EDGE = 50;
const BOTTOM_MARGIN_NORMAL = 10;
const TOP_MARGIN = 10;
const NEAR_BOTTOM_THRESHOLD = 0.8;

// Helper: Calculate accurate viewport dimensions
function getViewport(): { viewport: Viewport; actualHeight: number } {
  const visualViewport = (window as any).visualViewport;
  const viewport: Viewport = {
    width: visualViewport?.width || window.innerWidth,
    height: visualViewport?.height || window.innerHeight,
    scrollX: window.scrollX || visualViewport?.offsetLeft || 0,
    scrollY: window.scrollY || visualViewport?.offsetTop || 0,
  };
  const docElement = document.documentElement;
  const actualHeight = Math.min(
    viewport.height,
    docElement.clientHeight || window.innerHeight
  );
  return { viewport, actualHeight };
}

// Helper: Calculate calendar position
function calculateCalendarPosition(params: PositionCalcParams): PositionResult {
  const {
    triggerRect,
    calendarRect,
    calendarHeight = MAX_CALENDAR_HEIGHT,
    calendarContent,
  } = params;
  const { viewport, actualHeight } = getViewport();

  const isNearBottom =
    triggerRect.bottom > actualHeight * NEAR_BOTTOM_THRESHOLD;
  const bottomMargin = isNearBottom
    ? BOTTOM_MARGIN_NEAR_EDGE
    : BOTTOM_MARGIN_NORMAL;

  // Calculate natural width
  let naturalWidth = MIN_CALENDAR_WIDTH;
  if (calendarContent) {
    const contentRect = calendarContent.getBoundingClientRect();
    naturalWidth = Math.max(
      contentRect.width || MIN_CALENDAR_WIDTH,
      MIN_CALENDAR_WIDTH
    );
  }
  const preferredWidth = Math.max(
    naturalWidth,
    triggerRect.width >= MIN_CALENDAR_WIDTH
      ? triggerRect.width
      : MIN_CALENDAR_WIDTH
  );

  // Calculate available space
  const spaceBelow = actualHeight - triggerRect.bottom - 1;
  const spaceAbove = triggerRect.top - 1;
  const estimatedHeight = calendarRect?.height || calendarHeight;

  // Determine if should show above
  const hasEnoughSpaceBelow = spaceBelow >= estimatedHeight + bottomMargin;
  const hasEnoughSpaceAbove = spaceAbove >= estimatedHeight + TOP_MARGIN;
  const shouldShowAbove =
    !hasEnoughSpaceBelow &&
    (hasEnoughSpaceAbove || spaceAbove > spaceBelow + 30);

  // Calculate vertical position
  let top: number;
  let maxHeight: number;

  if (shouldShowAbove) {
    const availableAbove = Math.max(0, spaceAbove - TOP_MARGIN);
    maxHeight = Math.min(MAX_CALENDAR_HEIGHT, availableAbove);
    maxHeight = Math.max(maxHeight, MIN_CALENDAR_HEIGHT);
    const calendarTop =
      triggerRect.top + viewport.scrollY - estimatedHeight - 1;
    const safeTop = viewport.scrollY + TOP_MARGIN;
    top = Math.max(calendarTop, safeTop);
  } else {
    const availableBelow = Math.max(0, spaceBelow - bottomMargin);
    maxHeight = Math.min(MAX_CALENDAR_HEIGHT, availableBelow);
    maxHeight = Math.max(maxHeight, MIN_CALENDAR_HEIGHT);
    const calendarBottom =
      triggerRect.bottom + viewport.scrollY + estimatedHeight;
    const safeBottom = actualHeight + viewport.scrollY - bottomMargin;

    if (calendarBottom > safeBottom) {
      // Force open above
      const availableAbove = Math.max(0, spaceAbove - TOP_MARGIN);
      maxHeight = Math.min(MAX_CALENDAR_HEIGHT, availableAbove);
      maxHeight = Math.max(maxHeight, MIN_CALENDAR_HEIGHT);
      const calendarTop =
        triggerRect.top + viewport.scrollY - estimatedHeight - 1;
      const safeTop = viewport.scrollY + TOP_MARGIN;
      top = Math.max(calendarTop, safeTop);
      return {
        top,
        left: 0,
        width: preferredWidth,
        maxHeight,
        shouldShowAbove: true,
      };
    } else {
      top = triggerRect.bottom + viewport.scrollY + 1;
    }
  }

  // Calculate horizontal position
  let left = triggerRect.left + viewport.scrollX;
  const rightEdge = viewport.scrollX + viewport.width;
  const calendarRightEdge = left + preferredWidth;

  if (calendarRightEdge > rightEdge) {
    const rightAlignLeft =
      triggerRect.right + viewport.scrollX - preferredWidth;
    const leftEdge = viewport.scrollX + 8;
    left = rightAlignLeft >= leftEdge ? rightAlignLeft : leftEdge;
  }
  if (left < viewport.scrollX) {
    left = viewport.scrollX + 8;
  }

  return {
    top: Math.max(top, viewport.scrollY + 1),
    left,
    width: preferredWidth,
    maxHeight: Math.floor(maxHeight),
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
}: DatePickerProps) {
  const { datePickerStyle, borderRadius } = useSettings();
  const { t, language, direction } = useI18n();
  const [isFocused, setIsFocused] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [animateOpen, setAnimateOpen] = useState(false);
  const [calendarPosition, setCalendarPosition] = useState<DropdownPosition>({
    top: 0,
    left: 0,
    width: 0,
    maxHeight: MAX_CALENDAR_HEIGHT,
    placement: "bottom-start",
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const shouldShowAboveRef = useRef(false);

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
        left: rect.left + window.scrollX,
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
        return t("common.invalidDate") || "Invalid date";
      }

      try {
        const locale = language === "ar" ? "ar-EG" : "en-US";
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
        return t("common.invalidDate") || "Invalid date";
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
  useEffect(() => {
    if (disabled && showCalendar) {
      setShowCalendar(false);
    }
  }, [disabled, showCalendar]);

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
        return "rounded-full";
      default:
        return "rounded-md";
    }
  }, [borderRadius]);

  const datePickerStyles = useMemo(() => {
    const baseStyles =
      "relative w-full transition-all duration-200 ease-in-out";
    switch (datePickerStyle) {
      case "modern":
        return cn(
          baseStyles,
          "group bg-gradient-to-r from-background to-muted/20",
          "border border-border/50 hover:border-border",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          "shadow-sm hover:shadow-md focus-within:shadow-lg",
          borderRadiusClass
        );
      case "glass":
        return cn(
          baseStyles,
          "group bg-background/60 backdrop-blur-sm",
          "border border-white/20 hover:border-white/30",
          "focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10",
          "shadow-lg hover:shadow-xl focus-within:shadow-2xl",
          borderRadiusClass
        );
      case "outlined":
        return cn(
          baseStyles,
          "group bg-transparent",
          "border-2 border-border hover:border-primary/50",
          "focus-within:border-primary focus-within:ring-0",
          "hover:shadow-sm focus-within:shadow-md",
          borderRadiusClass
        );
      case "filled":
        return cn(
          baseStyles,
          "group bg-muted/50 hover:bg-muted/70",
          "border border-transparent hover:border-border/30",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          "focus-within:bg-background",
          borderRadiusClass
        );
      case "minimal":
        return cn(
          baseStyles,
          "group bg-transparent",
          "border-b-2 border-border hover:border-primary/50",
          "focus-within:border-primary focus-within:ring-0",
          "rounded-none hover:shadow-sm"
        );
      case "elegant":
        return cn(
          baseStyles,
          "group bg-gradient-to-br from-background via-background to-muted/10",
          "border border-border/30 hover:border-primary/30",
          "focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/30",
          "shadow-sm hover:shadow-lg focus-within:shadow-xl",
          "before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:to-transparent before:opacity-0 hover:before:opacity-100 before:transition-opacity",
          borderRadiusClass
        );
      default:
        return cn(
          baseStyles,
          "group bg-background",
          "border border-border hover:border-primary/50",
          "focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20",
          borderRadiusClass
        );
    }
  }, [datePickerStyle, borderRadiusClass]);

  const inputStyles = useMemo(() => {
    const baseInputStyles =
      "relative w-full h-12 px-4 py-3 text-sm bg-background border transition-all duration-300 focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-50";
    switch (datePickerStyle) {
      case "modern":
        return cn(
          baseInputStyles,
          borderRadiusClass,
          "bg-gradient-to-r from-background via-background to-muted/10 border-border/40 shadow-lg",
          "hover:shadow-xl hover:border-primary/40 hover:from-background hover:to-primary/5",
          "focus:shadow-2xl focus:border-primary focus:from-background focus:to-primary/10",
          "focus:ring-4 focus:ring-primary/10"
        );
      case "glass":
        return cn(
          baseInputStyles,
          borderRadiusClass,
          "bg-background/60 backdrop-blur-xl border-border/20 shadow-2xl",
          "hover:bg-background/70 hover:border-border/40 hover:shadow-2xl",
          "focus:bg-background/80 focus:border-primary/60 focus:shadow-2xl",
          "focus:ring-4 focus:ring-primary/20 backdrop-saturate-150"
        );
      case "outlined":
        return cn(
          baseInputStyles,
          borderRadiusClass,
          "bg-transparent border-2 border-border/60 shadow-sm",
          "hover:border-primary/60 hover:shadow-lg hover:bg-muted/5",
          "focus:border-primary focus:shadow-xl focus:bg-background/50",
          "focus:ring-4 focus:ring-primary/15"
        );
      case "filled":
        return cn(
          baseInputStyles,
          borderRadiusClass,
          "bg-muted/80 border-transparent shadow-inner",
          "hover:bg-muted hover:shadow-lg",
          "focus:bg-background focus:border-primary focus:shadow-xl",
          "focus:ring-4 focus:ring-primary/10"
        );
      case "minimal":
        return cn(
          "relative w-full h-12 px-4 py-3 text-sm bg-transparent border-0 border-b-2 border-border/60 transition-all duration-300 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 rounded-none",
          "hover:border-primary/60 hover:bg-muted/5",
          "focus:border-primary focus:bg-background/30",
          "focus:shadow-lg focus:shadow-primary/10"
        );
      case "elegant":
        return cn(
          baseInputStyles,
          borderRadiusClass,
          "bg-gradient-to-br from-background via-muted/5 to-primary/5 border-border/50 shadow-lg",
          "hover:shadow-xl hover:border-primary/50 hover:from-background hover:via-muted/10 hover:to-primary/10",
          "focus:shadow-2xl focus:border-primary focus:from-background focus:via-primary/5 focus:to-primary/15",
          "focus:ring-4 focus:ring-primary/15"
        );
      default:
        return cn(
          baseInputStyles,
          borderRadiusClass,
          "border-border/60 shadow-sm hover:border-primary/50 hover:shadow-lg focus:border-primary focus:shadow-xl",
          "focus:ring-4 focus:ring-primary/10"
        );
    }
  }, [datePickerStyle, borderRadiusClass]);

  const iconStyles = useMemo(() => {
    const baseIconStyles =
      "absolute top-1/2 -translate-y-1/2 transition-all duration-200 pointer-events-none";
    const iconPosition = direction === "rtl" ? "right-3" : "left-3";
    const baseHoverFocus =
      "group-hover:text-primary group-focus-within:text-primary";

    switch (datePickerStyle) {
      case "modern":
        return cn(
          baseIconStyles,
          iconPosition,
          "text-muted-foreground",
          baseHoverFocus,
          "group-focus-within:scale-105"
        );
      case "glass":
        return cn(
          baseIconStyles,
          iconPosition,
          "text-foreground/60",
          "group-hover:text-primary/80 group-focus-within:text-primary",
          "group-focus-within:scale-110 group-focus-within:drop-shadow-md drop-shadow-sm"
        );
      case "outlined":
        return cn(
          baseIconStyles,
          iconPosition,
          "text-muted-foreground",
          baseHoverFocus,
          "group-focus-within:scale-105"
        );
      case "filled":
        return cn(
          baseIconStyles,
          iconPosition,
          "text-muted-foreground group-hover:text-foreground group-focus-within:text-primary"
        );
      case "minimal":
        return cn(
          baseIconStyles,
          iconPosition,
          "text-muted-foreground",
          baseHoverFocus,
          "group-focus-within:scale-110"
        );
      case "elegant":
        return cn(
          baseIconStyles,
          iconPosition,
          "text-muted-foreground/70 group-hover:text-primary/80 group-focus-within:text-primary",
          "group-focus-within:scale-105 drop-shadow-sm"
        );
      default:
        return cn(
          baseIconStyles,
          iconPosition,
          "text-muted-foreground",
          baseHoverFocus
        );
    }
  }, [datePickerStyle, direction]);

  const labelStyles = useMemo(() => {
    if (!placeholder || value) return "hidden";
    const baseLabelStyles =
      "absolute transition-all duration-300 pointer-events-none select-none z-10";
    const labelPosition = language === "ar" ? "right-4" : "left-4";
    const focusedLabel =
      (isFocused || showCalendar) &&
      "top-0 text-xs text-primary font-medium scale-90 -translate-y-1/2";

    switch (datePickerStyle) {
      case "modern":
      case "filled":
        return cn(
          baseLabelStyles,
          labelPosition,
          "top-1/2 -translate-y-1/2 text-muted-foreground text-sm bg-background px-2 rounded",
          focusedLabel
        );
      case "glass":
        return cn(
          baseLabelStyles,
          labelPosition,
          "top-1/2 -translate-y-1/2 text-foreground/60 text-sm bg-background/80 backdrop-blur-sm px-2 rounded",
          focusedLabel
        );
      case "outlined":
        return cn(
          baseLabelStyles,
          labelPosition,
          "top-1/2 -translate-y-1/2 text-muted-foreground text-sm bg-background px-2",
          focusedLabel
        );
      case "elegant":
        return cn(
          baseLabelStyles,
          labelPosition,
          "top-1/2 -translate-y-1/2 text-muted-foreground/70 text-sm font-medium bg-gradient-to-r from-background to-background px-2 rounded",
          (isFocused || showCalendar) &&
            "top-0 text-xs text-primary font-semibold scale-90 -translate-y-1/2"
        );
      case "minimal":
        return cn(
          baseLabelStyles,
          labelPosition,
          "top-1/2 -translate-y-1/2 text-muted-foreground text-sm",
          (isFocused || showCalendar) &&
            "top-2 text-xs text-primary font-medium"
        );
      default:
        return cn(
          baseLabelStyles,
          labelPosition,
          "top-1/2 -translate-y-1/2 text-muted-foreground text-sm bg-background px-2 rounded",
          focusedLabel
        );
    }
  }, [placeholder, value, datePickerStyle, language, isFocused, showCalendar]);

  const displayValue = useMemo(() => {
    if (!value) return placeholder || t("common.selectDate") || "Select date";
    return formatDisplayValue(value);
  }, [value, placeholder, formatDisplayValue, t]);

  const ariaLabel = useMemo(() => {
    if (value) {
      return `${
        placeholder || t("common.selectDate") || "Select date"
      }: ${formatDisplayValue(value)}`;
    }
    return placeholder || t("common.selectDate") || "Select date";
  }, [value, placeholder, formatDisplayValue, t]);

  return (
    <div ref={containerRef} className={cn(datePickerStyles, className)}>
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
          inputStyles,
          "flex items-center justify-between",
          disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
        )}
        onClick={handleIconClick}
        onKeyDown={handleTriggerKeyDown}
        onFocus={() => !disabled && setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
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
          {t("common.datePickerInstructions") ||
            "Press Enter or Space to open calendar"}
        </span>
        <span
          className={cn(
            "flex-1 select-none",
            direction === "rtl" ? "text-right" : "text-left",
            value ? "text-foreground" : "text-muted-foreground"
          )}
        >
          {displayValue}
        </span>
        <IconComponent
          className={cn(
            "h-4 w-4 transition-all duration-200 flex-shrink-0",
            direction === "rtl" ? "mr-2" : "ml-2",
            showCalendar ? "text-primary scale-110" : "text-muted-foreground",
            "hover:text-primary hover:scale-105"
          )}
          aria-hidden="true"
        />
      </div>

      {datePickerStyle === "glass" && isFocused && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent rounded-inherit pointer-events-none" />
      )}
      {datePickerStyle === "elegant" && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300" />
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
            aria-label={t("common.calendarDialog") || "Calendar"}
            className={cn(
              "fixed z-[2147483647] pointer-events-auto shadow-lg",
              shouldShowAboveRef.current
                ? "border-b-0 rounded-b-none"
                : "border-t-0 rounded-t-none"
            )}
            style={{
              top: `${calendarPosition.top}px`,
              left: `${calendarPosition.left}px`,
              width: `${calendarPosition.width}px`,
              maxHeight: `${calendarPosition.maxHeight}px`,
              pointerEvents: "auto",
              transform: `translateZ(0) translateY(${
                animateOpen ? 0 : shouldShowAboveRef.current ? 6 : -6
              }px)`,
              willChange: "transform, opacity",
              opacity: animateOpen ? 1 : 0,
              transition:
                "transform 120ms cubic-bezier(.2,.8,.2,1), opacity 120ms cubic-bezier(.2,.8,.2,1)",
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
            />
          </div>,
          document.body
        )}

      {showCalendar && (
        <RenderMeasure
          onMeasure={() => {
            if (!containerRef.current || !calendarRef.current) return;

            // Measure natural width with temporary constraints removed
            const calendarContent = calendarRef.current.querySelector(
              "[data-calendar-content]"
            ) as HTMLElement;
            const originalWidth = calendarRef.current.style.width;
            const originalMinWidth = calendarRef.current.style.minWidth;
            calendarRef.current.style.width = "auto";
            calendarRef.current.style.minWidth = `${MIN_CALENDAR_WIDTH}px`;
            void calendarRef.current.offsetWidth; // Force reflow

            const triggerRect = containerRef.current.getBoundingClientRect();
            const calendarRect = calendarRef.current.getBoundingClientRect();

            let naturalWidth = MIN_CALENDAR_WIDTH;
            if (calendarContent) {
              const contentRect = calendarContent.getBoundingClientRect();
              const measuredContentWidth =
                contentRect.width ||
                calendarContent.scrollWidth ||
                MIN_CALENDAR_WIDTH;
              const wrapperStyle = window.getComputedStyle(calendarRef.current);
              const paddingLeft = parseFloat(wrapperStyle.paddingLeft) || 0;
              const paddingRight = parseFloat(wrapperStyle.paddingRight) || 0;
              const borderLeft = parseFloat(wrapperStyle.borderLeftWidth) || 0;
              const borderRight =
                parseFloat(wrapperStyle.borderRightWidth) || 0;
              naturalWidth = Math.max(
                measuredContentWidth +
                  paddingLeft +
                  paddingRight +
                  borderLeft +
                  borderRight,
                MIN_CALENDAR_WIDTH
              );
            }

            calendarRef.current.style.width = originalWidth;
            calendarRef.current.style.minWidth = originalMinWidth;

            const position = calculateCalendarPosition({
              triggerRect,
              calendarRect,
              calendarContent,
            });

            // Override width with natural width calculation
            position.width = Math.max(
              naturalWidth,
              triggerRect.width >= MIN_CALENDAR_WIDTH
                ? triggerRect.width
                : MIN_CALENDAR_WIDTH
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
