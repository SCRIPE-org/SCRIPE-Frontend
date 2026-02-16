"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Switch } from "@core/ui/switch";
import { Badge } from "@core/ui/badge";
import { Card, CardContent } from "@core/ui/card";
import {
      Select,
      SelectContent,
      SelectItem,
      SelectTrigger,
      SelectValue,
} from "@core/ui/select";
import {
      Clock,
      CalendarClock,
      Zap,
      Timer,
} from "lucide-react";
import { cn } from "@core/common/utils";

// ─── Types ──────────────────────────────────────────────────
export type ScheduleMode = "now" | "scheduled" | "recurring";

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

export interface SchedulePickerProps {
      value: ScheduleConfig;
      onChange: (config: ScheduleConfig) => void;
      disabled?: boolean;
}

// ─── Constants ──────────────────────────────────────────────
const TIMEZONES = [
      { value: "UTC", label: "UTC (GMT+0)" },
      { value: "America/New_York", label: "Eastern (GMT-5)" },
      { value: "America/Chicago", label: "Central (GMT-6)" },
      { value: "America/Los_Angeles", label: "Pacific (GMT-8)" },
      { value: "Europe/London", label: "London (GMT+0)" },
      { value: "Europe/Berlin", label: "Berlin (GMT+1)" },
      { value: "Asia/Dubai", label: "Dubai (GMT+4)" },
      { value: "Asia/Kolkata", label: "India (GMT+5:30)" },
      { value: "Asia/Shanghai", label: "China (GMT+8)" },
      { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
      { value: "Australia/Sydney", label: "Sydney (GMT+11)" },
      { value: "Africa/Cairo", label: "Cairo (GMT+2)" },
];

const DAYS_OF_WEEK = [
      { value: 0, label: "Sunday" },
      { value: 1, label: "Monday" },
      { value: 2, label: "Tuesday" },
      { value: 3, label: "Wednesday" },
      { value: 4, label: "Thursday" },
      { value: 5, label: "Friday" },
      { value: 6, label: "Saturday" },
];

// ─── Mode Cards ─────────────────────────────────────────────
const MODES: { id: ScheduleMode; label: string; desc: string; icon: React.ReactNode }[] = [
      {
            id: "now",
            label: "Send Now",
            desc: "Deliver immediately",
            icon: <Zap className="h-5 w-5 text-emerald-500" />,
      },
      {
            id: "scheduled",
            label: "Schedule",
            desc: "Pick a date & time",
            icon: <CalendarClock className="h-5 w-5 text-blue-500" />,
      },
      {
            id: "recurring",
            label: "Recurring",
            desc: "Repeat automatically",
            icon: <Timer className="h-5 w-5 text-purple-500" />,
      },
];

// ─── Main Component ─────────────────────────────────────────
export function SchedulePicker({ value, onChange, disabled }: SchedulePickerProps) {
      const update = (partial: Partial<ScheduleConfig>) => {
            onChange({ ...value, ...partial });
      };

      const minDate = useMemo(() => {
            const d = new Date();
            d.setMinutes(d.getMinutes() + 5);
            return d.toISOString().split("T")[0];
      }, []);

      return (
            <Card>
                  <CardContent className="pt-4 space-y-4">
                        {/* Mode Selector */}
                        <div className="grid grid-cols-3 gap-2">
                              {MODES.map((mode) => (
                                    <button
                                          key={mode.id}
                                          type="button"
                                          disabled={disabled}
                                          className={cn(
                                                "flex flex-col items-center gap-1.5 p-3 rounded-lg border transition-all text-center",
                                                value.mode === mode.id
                                                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                      : "border-border hover:border-primary/30",
                                                disabled && "opacity-50 cursor-not-allowed"
                                          )}
                                          onClick={() => update({ mode: mode.id })}
                                    >
                                          {mode.icon}
                                          <span className="text-sm font-medium">{mode.label}</span>
                                          <span className="text-[10px] text-muted-foreground">{mode.desc}</span>
                                    </button>
                              ))}
                        </div>

                        {/* Scheduled Mode */}
                        {value.mode === "scheduled" && (
                              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="grid grid-cols-2 gap-3">
                                          <div className="space-y-1.5">
                                                <Label className="text-xs">Date</Label>
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
                                                <Label className="text-xs">Time</Label>
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
                                          <Label className="text-xs">Timezone</Label>
                                          <Select
                                                value={value.timezone || "UTC"}
                                                onValueChange={(v) => update({ timezone: v })}
                                                disabled={disabled}
                                          >
                                                <SelectTrigger className="text-sm">
                                                      <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                      {TIMEZONES.map((tz) => (
                                                            <SelectItem key={tz.value} value={tz.value}>
                                                                  {tz.label}
                                                            </SelectItem>
                                                      ))}
                                                </SelectContent>
                                          </Select>
                                    </div>
                                    {value.scheduledDate && value.scheduledTime && (
                                          <div className="flex items-center gap-2 p-2 rounded-md bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                                                <Clock className="h-4 w-4 text-blue-500 shrink-0" />
                                                <span className="text-xs text-blue-700 dark:text-blue-300">
                                                      Will send on <strong>{value.scheduledDate}</strong> at{" "}
                                                      <strong>{value.scheduledTime}</strong> ({value.timezone || "UTC"})
                                                </span>
                                          </div>
                                    )}
                              </div>
                        )}

                        {/* Recurring Mode */}
                        {value.mode === "recurring" && (
                              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                    <div className="space-y-1.5">
                                          <Label className="text-xs">Frequency</Label>
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
                                                      <SelectItem value="daily">Daily</SelectItem>
                                                      <SelectItem value="weekly">Weekly</SelectItem>
                                                      <SelectItem value="monthly">Monthly</SelectItem>
                                                </SelectContent>
                                          </Select>
                                    </div>

                                    {value.recurring?.frequency === "weekly" && (
                                          <div className="space-y-1.5">
                                                <Label className="text-xs">Day of Week</Label>
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
                                                            {DAYS_OF_WEEK.map((d) => (
                                                                  <SelectItem key={d.value} value={String(d.value)}>
                                                                        {d.label}
                                                                  </SelectItem>
                                                            ))}
                                                      </SelectContent>
                                                </Select>
                                          </div>
                                    )}

                                    {value.recurring?.frequency === "monthly" && (
                                          <div className="space-y-1.5">
                                                <Label className="text-xs">Day of Month</Label>
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
                                          <Label className="text-xs">Send Time</Label>
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

                                    <div className="flex items-center gap-2 p-2 rounded-md bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-800">
                                          <Timer className="h-4 w-4 text-purple-500 shrink-0" />
                                          <span className="text-xs text-purple-700 dark:text-purple-300">
                                                Sends{" "}
                                                <strong>
                                                      {value.recurring?.frequency === "daily"
                                                            ? "every day"
                                                            : value.recurring?.frequency === "weekly"
                                                                  ? `every ${DAYS_OF_WEEK.find((d) => d.value === value.recurring?.dayOfWeek)?.label ?? "Monday"}`
                                                                  : `on day ${value.recurring?.dayOfMonth ?? 1} of each month`}
                                                </strong>{" "}
                                                at <strong>{value.recurring?.time || "09:00"}</strong>
                                          </span>
                                    </div>
                              </div>
                        )}
                  </CardContent>
            </Card>
      );
}

export default SchedulePicker;
