// FILE-EXCEPTION: file length
// UI-EXCEPTION: compact studio layout
"use client";

import React, { useMemo } from "react";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Card, CardContent } from "@core/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@core/ui/select";
import { Clock, CalendarClock, Zap, Timer } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

// ─── Types ──────────────────────────────────────────────────
/**
 * Exported type defining parameters and fields for schedule mode configurations.
 */
export type ScheduleMode = "now" | "scheduled" | "recurring";

/**
 * Interface defining property specifications, keys types, and structural contract rules for schedule config.
 */
export interface ScheduleConfig {
  mode: ScheduleMode;
  scheduledDate?: string;
  scheduledTime?: string;
  timezone?: string;
  recurring?: {
    frequency: "daily" | "weekly" | "monthly";
    dayOfWeek?: number;
    dayOfMonth?: number;
    time: string;
  };
}

/**
 * Interface defining property specifications, keys types, and structural contract rules for schedule picker props.
 */
export interface SchedulePickerProps {
  value: ScheduleConfig;
  onChange: (config: ScheduleConfig) => void;
  disabled?: boolean;
}

const DAY_KEYS = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
] as const;

const TIMEZONE_KEYS = [
  { value: "UTC", key: "utc" },
  { value: "America/New_York", key: "easternUs" },
  { value: "America/Chicago", key: "centralUs" },
  { value: "America/Los_Angeles", key: "pacificUs" },
  { value: "Europe/London", key: "london" },
  { value: "Europe/Berlin", key: "berlin" },
  { value: "Asia/Dubai", key: "dubai" },
  { value: "Asia/Kolkata", key: "india" },
  { value: "Asia/Shanghai", key: "china" },
  { value: "Asia/Tokyo", key: "tokyo" },
  { value: "Australia/Sydney", key: "sydney" },
  { value: "Africa/Cairo", key: "cairo" },
] as const;

// ─── Main Component ─────────────────────────────────────────
/**
 * Presentation UI component rendering the schedule picker.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function SchedulePicker({ value, onChange, disabled }: SchedulePickerProps) {
  const { t } = useI18n();
  const update = (partial: Partial<ScheduleConfig>) => {
    onChange({ ...value, ...partial });
  };

  const minDate = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    return d.toISOString().split("T")[0];
  }, []);

  const modes: { id: ScheduleMode; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      id: "now",
      label: t("messaging.email.sendNow"),
      desc: t("messaging.email.sendNowDesc"),
      icon: <Zap className="h-5 w-5 text-success" aria-hidden="true" />,
    },
    {
      id: "scheduled",
      label: t("messaging.email.scheduled"),
      desc: t("messaging.email.scheduledDesc"),
      icon: <CalendarClock className="h-5 w-5 text-info" aria-hidden="true" />,
    },
    {
      id: "recurring",
      label: t("messaging.email.recurring"),
      desc: t("messaging.email.recurringDesc"),
      icon: <Timer className="h-5 w-5 text-nx-accent" aria-hidden="true" />,
    },
  ];

  const recurringSummary = (() => {
    const time = value.recurring?.time || "09:00";
    if (value.recurring?.frequency === "weekly") {
      const day = t(`messaging.email.days.${DAY_KEYS[value.recurring?.dayOfWeek ?? 1]}`);
      return t("messaging.email.recurringSendsWeekly", { day, time });
    }
    if (value.recurring?.frequency === "monthly") {
      return t("messaging.email.recurringSendsMonthly", {
        day: value.recurring?.dayOfMonth ?? 1,
        time,
      });
    }
    return t("messaging.email.recurringSendsDaily", { time });
  })();

  return (
    <Card>
      <CardContent className="space-y-4 pt-4">
        {/* Mode Selector */}
        <div className="grid grid-cols-3 gap-2">
          {modes.map((mode) => (
            <button
              key={mode.id}
              type="button"
              disabled={disabled}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-nx-md border p-3 text-center transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter focus-visible:shadow-nx-focus focus-visible:outline-none motion-reduce:transition-none",
                value.mode === mode.id
                  ? "border-nx-accent bg-nx-accent-wash shadow-[inset_0_0_0_1px_var(--nx-accent)]"
                  : "border-nx-line hover:border-nx-line-hi",
                disabled && "cursor-not-allowed opacity-50"
              )}
              onClick={() => update({ mode: mode.id })}
            >
              {mode.icon}
              <span className="text-sm font-medium text-nx-ink">{mode.label}</span>
              <span className="text-[10px] text-nx-ink-3">{mode.desc}</span>
            </button>
          ))}
        </div>

        {/* Scheduled Mode */}
        {value.mode === "scheduled" && (
          <div className="space-y-3 duration-nx-standard ease-nx-enter animate-in fade-in-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs">{t("messaging.email.scheduledDate")}</Label>
                <Input
                  type="date"
                  value={value.scheduledDate || ""}
                  min={minDate}
                  onChange={(e) => update({ scheduledDate: e.target.value })}
                  disabled={disabled}
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">{t("messaging.email.scheduledTime")}</Label>
                <Input
                  type="time"
                  value={value.scheduledTime || ""}
                  onChange={(e) => update({ scheduledTime: e.target.value })}
                  disabled={disabled}
                  className="text-sm"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t("messaging.email.timezone")}</Label>
              <Select
                value={value.timezone || "UTC"}
                onValueChange={(v) => update({ timezone: v })}
                disabled={disabled}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_KEYS.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {t(`messaging.email.timezones.${tz.key}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {value.scheduledDate && value.scheduledTime && (
              <div className="flex items-center gap-2 rounded-nx-md border border-info/30 bg-info/10 p-2">
                <Clock className="h-4 w-4 shrink-0 text-info" aria-hidden="true" />
                <span className="text-xs text-info">
                  {t("messaging.email.scheduleWillSend", {
                    date: value.scheduledDate,
                    time: value.scheduledTime,
                    tz: value.timezone || "UTC",
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Recurring Mode */}
        {value.mode === "recurring" && (
          <div className="space-y-3 duration-nx-standard ease-nx-enter animate-in fade-in-0">
            <div className="space-y-1.5">
              <Label className="text-xs">{t("messaging.email.frequency")}</Label>
              <Select
                value={value.recurring?.frequency || "weekly"}
                onValueChange={(v) =>
                  update({
                    recurring: {
                      ...value.recurring!,
                      frequency: v as "daily" | "weekly" | "monthly",
                    },
                  })
                }
                disabled={disabled}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">{t("messaging.email.daily")}</SelectItem>
                  <SelectItem value="weekly">{t("messaging.email.weekly")}</SelectItem>
                  <SelectItem value="monthly">{t("messaging.email.monthly")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {value.recurring?.frequency === "weekly" && (
              <div className="space-y-1.5">
                <Label className="text-xs">{t("messaging.email.dayOfWeek")}</Label>
                <Select
                  value={String(value.recurring?.dayOfWeek ?? 1)}
                  onValueChange={(v) =>
                    update({
                      recurring: {
                        ...value.recurring!,
                        dayOfWeek: Number(v),
                      },
                    })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DAY_KEYS.map((dayKey, idx) => (
                      <SelectItem key={dayKey} value={String(idx)}>
                        {t(`messaging.email.days.${dayKey}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {value.recurring?.frequency === "monthly" && (
              <div className="space-y-1.5">
                <Label className="text-xs">{t("messaging.email.dayOfMonth")}</Label>
                <Select
                  value={String(value.recurring?.dayOfMonth ?? 1)}
                  onValueChange={(v) =>
                    update({
                      recurring: {
                        ...value.recurring!,
                        dayOfMonth: Number(v),
                      },
                    })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 28 }, (_, i) => i + 1).map((d) => (
                      <SelectItem key={d} value={String(d)}>
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs">{t("messaging.email.sendTime")}</Label>
              <Input
                type="time"
                value={value.recurring?.time || "09:00"}
                onChange={(e) =>
                  update({
                    recurring: {
                      ...value.recurring!,
                      time: e.target.value,
                    },
                  })
                }
                disabled={disabled}
                className="text-sm"
              />
            </div>

            <div className="flex items-center gap-2 rounded-nx-md border border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash p-2">
              <Timer className="h-4 w-4 shrink-0 text-nx-accent" aria-hidden="true" />
              <span className="text-xs text-nx-accent">{recurringSummary}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default SchedulePicker;
