"use client";

/**
 * ExportIntervalSelect — Reusable interval picker for export dialogs.
 *
 * Provides preset intervals (yearly, monthly, weekly, daily) that auto-calculate
 * dateFrom/dateTo from today, plus a custom option with date pickers.
 *
 * Returns ISO date strings (YYYY-MM-DD) for API consumption.
 */
import { useState, useCallback, useMemo, useEffect } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { DatePicker } from "@core/ui/date-picker";
import { Button } from "@core/ui/button";
import { Calendar, CalendarDays, CalendarRange } from "lucide-react";

export type IntervalPreset = "yearly" | "monthly" | "weekly" | "daily" | "custom";

export interface IntervalDates {
  dateFrom: string;
  dateTo: string;
}

interface ExportIntervalSelectProps {
  value: IntervalDates;
  onChange: (dates: IntervalDates) => void;
  className?: string;
}

/** Calculate ISO date strings (YYYY-MM-DD) for a given preset */
function calculatePresetDates(preset: IntervalPreset): IntervalDates {
  const today = new Date();
  const dateTo = formatDate(today);

  switch (preset) {
    case "daily":
      return { dateFrom: dateTo, dateTo };
    case "weekly": {
      const from = new Date(today);
      from.setDate(from.getDate() - 7);
      return { dateFrom: formatDate(from), dateTo };
    }
    case "monthly": {
      const from = new Date(today);
      from.setMonth(from.getMonth() - 1);
      return { dateFrom: formatDate(from), dateTo };
    }
    case "yearly": {
      const from = new Date(today);
      from.setFullYear(from.getFullYear() - 1);
      return { dateFrom: formatDate(from), dateTo };
    }
    case "custom":
      return { dateFrom: "", dateTo: "" };
  }
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

const PRESETS: { value: IntervalPreset; icon: typeof Calendar }[] = [
  { value: "daily", icon: CalendarDays },
  { value: "weekly", icon: CalendarRange },
  { value: "monthly", icon: Calendar },
  { value: "yearly", icon: Calendar },
  { value: "custom", icon: CalendarRange },
];

export function ExportIntervalSelect({ value, onChange, className }: ExportIntervalSelectProps) {
  const { t } = useI18n();
  const [activePreset, setActivePreset] = useState<IntervalPreset>("monthly");

  // Set initial dates on mount
  useEffect(() => {
    const dates = calculatePresetDates("monthly");
    onChange(dates);
  }, []);

  const handlePresetClick = useCallback(
    (preset: IntervalPreset) => {
      setActivePreset(preset);
      if (preset !== "custom") {
        onChange(calculatePresetDates(preset));
      } else {
        onChange({ dateFrom: "", dateTo: "" });
      }
    },
    [onChange]
  );

  const presetButtons = useMemo(
    () =>
      PRESETS.map((p) => {
        const Icon = p.icon;
        const isActive = activePreset === p.value;
        return (
          <Button
            key={p.value}
            type="button"
            variant={isActive ? "default" : "outline"}
            size="sm"
            onClick={() => handlePresetClick(p.value)}
            className="gap-1.5 text-xs"
          >
            <Icon className="h-3.5 w-3.5" />
            {t(`export.interval.${p.value}`)}
          </Button>
        );
      }),
    [activePreset, handlePresetClick, t]
  );

  return (
    <div className={className}>
      {/* Preset Buttons */}
      <div className="flex flex-wrap gap-2">{presetButtons}</div>

      {/* Custom Date Range */}
      {activePreset === "custom" && (
        <div className="mt-3 flex gap-2">
          <DatePicker
            id="export-date-from"
            placeholder={t("export.interval.from")}
            value={value.dateFrom}
            onChange={(v) => onChange({ ...value, dateFrom: v })}
            className="flex-1"
          />
          <DatePicker
            id="export-date-to"
            placeholder={t("export.interval.to")}
            value={value.dateTo}
            onChange={(v) => onChange({ ...value, dateTo: v })}
            className="flex-1"
          />
        </div>
      )}

      {/* Date Range Label */}
      {activePreset !== "custom" && value.dateFrom && value.dateTo && (
        <p className="mt-2 text-xs text-muted-foreground">
          {value.dateFrom} → {value.dateTo}
        </p>
      )}
    </div>
  );
}
