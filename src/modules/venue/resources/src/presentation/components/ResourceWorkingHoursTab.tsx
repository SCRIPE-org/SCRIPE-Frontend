"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Sliders, ExternalLink, Copy } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { WeekDay, AvailabilityWindow } from "@modules/venue";
import type { useResourceDetailViewModel } from "../viewmodels/useResourceDetailViewModel";

interface Props {
  vm: ReturnType<typeof useResourceDetailViewModel>;
}

const DAYS: WeekDay[] = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

/**
 * Documentation for module export
 */
export function ResourceWorkingHoursTab({ vm }: Props) {
  const { t } = useI18n();

  const [isOpen247, setIsOpen247] = useState<boolean>(() => vm.isCalendar247);
  const [dailyWindows, setDailyWindows] = useState<
    Record<WeekDay, { start: string; end: string; closed: boolean }>
  >(() => {
    const map: Record<WeekDay, { start: string; end: string; closed: boolean }> = {
      Sunday: { start: "08:00", end: "00:00", closed: false },
      Monday: { start: "08:00", end: "00:00", closed: false },
      Tuesday: { start: "08:00", end: "00:00", closed: false },
      Wednesday: { start: "08:00", end: "00:00", closed: false },
      Thursday: { start: "08:00", end: "00:00", closed: false },
      Friday: { start: "14:00", end: "00:00", closed: false },
      Saturday: { start: "08:00", end: "00:00", closed: false },
    };

    if (vm.calendar?.windows) {
      for (const w of vm.calendar.windows) {
        if (map[w.dayOfWeek]) {
          map[w.dayOfWeek] = {
            start: w.startLocal,
            end: w.endLocal,
            closed: false,
          };
        }
      }
    }
    return map;
  });

  const updateDay = (day: WeekDay, key: "start" | "end" | "closed", value: string | boolean) => {
    setDailyWindows((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [key]: value,
      },
    }));
  };

  const copyHoursToAll = (sourceDay: WeekDay) => {
    const { start, end } = dailyWindows[sourceDay];
    setDailyWindows((prev) => {
      const next = { ...prev };
      for (const d of DAYS) {
        if (!next[d].closed) {
          next[d] = { ...next[d], start, end };
        }
      }
      return next;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOpen247) {
      await vm.updateWorkingHours({ isOpen247: true });
    } else {
      const windows: AvailabilityWindow[] = DAYS.filter((day) => !dailyWindows[day].closed).map(
        (day) => ({
          dayOfWeek: day,
          startLocal: dailyWindows[day].start,
          endLocal: dailyWindows[day].end,
          capacityOverride: null,
        })
      );
      await vm.updateWorkingHours({ isOpen247: false, windows });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>
            {t("resources.workingHours.title", { defaultValue: "Working Hours" })}
          </CardTitle>
          <CardDescription>
            {t("resources.workingHours.description", {
              defaultValue: "Configure when this space is open for bookings.",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="max-w-2xl space-y-6">
            {/* Mode selection: Open 24/7 vs Custom Hours */}
            <RadioGroup
              value={isOpen247 ? "open247" : "custom"}
              onValueChange={(value) => setIsOpen247(value === "open247")}
              className="space-y-3"
            >
              <div
                className={`flex cursor-pointer items-start gap-3 rounded-nx-md border p-3.5 transition-all ${
                  isOpen247
                    ? "bg-nx-accent/5 border-nx-accent ring-1 ring-nx-accent"
                    : "hover:bg-nx-surfaceSubtle border-nx-line"
                }`}
              >
                <RadioGroupItem id="res-hours-open247" value="open247" className="mt-1" />
                <div>
                  <Label
                    htmlFor="res-hours-open247"
                    className="flex cursor-pointer items-center gap-1.5 text-sm font-bold text-nx-ink"
                  >
                    <Clock className="size-4 text-nx-accent" aria-hidden="true" />
                    <span>
                      {t("resources.workingHours.open247", {
                        defaultValue: "Open 24 Hours (24/7)",
                      })}
                    </span>
                  </Label>
                  <p className="mt-0.5 text-xs text-nx-ink-2">
                    {t("resources.workingHours.open247Description", {
                      defaultValue: "Open all day and night every day of the week.",
                    })}
                  </p>
                </div>
              </div>

              <div
                className={`flex cursor-pointer items-start gap-3 rounded-nx-md border p-3.5 transition-all ${
                  !isOpen247
                    ? "bg-nx-accent/5 border-nx-accent ring-1 ring-nx-accent"
                    : "hover:bg-nx-surfaceSubtle border-nx-line"
                }`}
              >
                <RadioGroupItem id="res-hours-custom" value="custom" className="mt-1" />
                <div>
                  <Label
                    htmlFor="res-hours-custom"
                    className="flex cursor-pointer items-center gap-1.5 text-sm font-bold text-nx-ink"
                  >
                    <Sliders className="size-4 text-nx-ink-2" aria-hidden="true" />
                    <span>
                      {t("resources.workingHours.custom", { defaultValue: "Custom Working Hours" })}
                    </span>
                  </Label>
                  <p className="mt-0.5 text-xs text-nx-ink-2">
                    {t("resources.workingHours.customDescription", {
                      defaultValue: "Specify exact daily opening and closing hours.",
                    })}
                  </p>
                </div>
              </div>
            </RadioGroup>

            {/* Daily Schedule Table (When Custom is selected) */}
            {!isOpen247 && (
              <div className="overflow-hidden rounded-nx-md border border-nx-line bg-nx-surface">
                <div className="flex items-center justify-between border-b border-nx-line bg-nx-raised p-3 text-xs font-semibold text-nx-ink">
                  <span>{t("resources.workingHours.day", { defaultValue: "Day" })}</span>
                  <div className="mr-4 flex items-center gap-8 rtl:ml-4 rtl:mr-0">
                    <span>
                      {t("resources.workingHours.openingTime", { defaultValue: "Opening Time" })}
                    </span>
                    <span>
                      {t("resources.workingHours.closingTime", { defaultValue: "Closing Time" })}
                    </span>
                  </div>
                </div>

                <div className="divide-nx-line/60 divide-y">
                  {DAYS.map((day) => {
                    const { start, end, closed } = dailyWindows[day];
                    return (
                      <div
                        key={day}
                        className={`flex items-center justify-between p-3 text-xs ${
                          closed ? "bg-nx-surfaceSubtle/50 opacity-60" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Checkbox
                            checked={!closed}
                            onCheckedChange={(checked) =>
                              updateDay(day, "closed", checked !== true)
                            }
                            id={`check-${day}`}
                          />
                          <Label
                            htmlFor={`check-${day}`}
                            className="min-w-[100px] cursor-pointer font-medium"
                          >
                            {t(`resources.workingHours.days.${day}`, { defaultValue: day })}
                          </Label>
                        </div>

                        {!closed ? (
                          <div className="flex items-center gap-2">
                            <Input
                              type="time"
                              value={start}
                              onChange={(e) => updateDay(day, "start", e.target.value)}
                              className="h-8 w-24 font-mono text-xs"
                            />
                            <span className="text-nx-ink-3">â†’</span>
                            <Input
                              type="time"
                              value={end}
                              onChange={(e) => updateDay(day, "end", e.target.value)}
                              className="h-8 w-24 font-mono text-xs"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => copyHoursToAll(day)}
                              className="h-8 px-2 text-[11px] text-nx-ink-3 hover:text-nx-ink"
                              title={t("resources.workingHours.copyToAll", {
                                defaultValue: "Copy to all open days",
                              })}
                            >
                              <Copy className="size-3.5" aria-hidden="true" />
                            </Button>
                          </div>
                        ) : (
                          <span className="mr-16 text-xs italic text-nx-ink-3 rtl:ml-16 rtl:mr-0">
                            {t("resources.workingHours.closed", { defaultValue: "Closed" })}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2">
              <Button type="submit" disabled={vm.saving} loading={vm.saving}>
                {t("resources.workingHours.save", { defaultValue: "Save Working Hours" })}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Advanced Availability Escape Hatch */}
      <Card className="border-nx-line/80 bg-nx-surfaceSubtle/40">
        <CardContent className="flex items-center justify-between p-4">
          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-nx-ink">
              {t("resources.workingHours.advancedLink", {
                defaultValue: "Advanced Availability Settings",
              })}
            </p>
            <p className="text-[11px] text-nx-ink-3">
              Date-specific exceptions, special holiday calendars, and multiple windows per day.
            </p>
          </div>
          <Button asChild variant="outline" size="sm" className="h-8 shrink-0 gap-1.5 text-xs">
            <Link
              href={`/venue/availability?resourceId=${encodeURIComponent(vm.resource?.id ?? "")}`}
            >
              <span>Open Advanced Availability</span>
              <ExternalLink className="size-3.5 text-nx-ink-3" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
