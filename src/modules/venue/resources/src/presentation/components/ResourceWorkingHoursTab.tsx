"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Sliders, ExternalLink } from "lucide-react";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { WeekDay, AvailabilityWindow } from "@modules/venue/availability/src/domain/entities/Availability";
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

export function ResourceWorkingHoursTab({ vm }: Props) {
  const { t } = useI18n();

  const [isOpen247, setIsOpen247] = useState<boolean>(() => vm.isCalendar247);
  const [dailyWindows, setDailyWindows] = useState<Record<WeekDay, { start: string; end: string; closed: boolean }>>(() => {
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
          <CardTitle>{t("resources.workingHours.title", { defaultValue: "Working Hours" })}</CardTitle>
          <CardDescription>
            {t("resources.workingHours.description", {
              defaultValue: "Configure when this court is open for customer bookings.",
            })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-6 max-w-2xl">
            {/* Mode selection: Open 24/7 vs Custom Hours */}
            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 p-3.5 rounded-nx-md border cursor-pointer transition-all ${
                  isOpen247
                    ? "border-nx-accent bg-nx-accent/5 ring-1 ring-nx-accent"
                    : "border-nx-line hover:bg-nx-surfaceSubtle"
                }`}
              >
                <input
                  type="radio"
                  name="court-working-hours"
                  checked={isOpen247}
                  onChange={() => setIsOpen247(true)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-bold text-nx-ink flex items-center gap-1.5">
                    <Clock className="size-4 text-nx-accent" aria-hidden="true" />
                    <span>{t("resources.workingHours.open247", { defaultValue: "Open 24 Hours (24/7)" })}</span>
                  </p>
                  <p className="text-xs text-nx-ink-2 mt-0.5">
                    {t("resources.workingHours.open247Description", {
                      defaultValue: "Court is bookable all day and night every day of the week.",
                    })}
                  </p>
                </div>
              </label>

              <label
                className={`flex items-start gap-3 p-3.5 rounded-nx-md border cursor-pointer transition-all ${
                  !isOpen247
                    ? "border-nx-accent bg-nx-accent/5 ring-1 ring-nx-accent"
                    : "border-nx-line hover:bg-nx-surfaceSubtle"
                }`}
              >
                <input
                  type="radio"
                  name="court-working-hours"
                  checked={!isOpen247}
                  onChange={() => setIsOpen247(false)}
                  className="mt-1"
                />
                <div>
                  <p className="text-sm font-bold text-nx-ink flex items-center gap-1.5">
                    <Sliders className="size-4 text-nx-ink-2" aria-hidden="true" />
                    <span>{t("resources.workingHours.custom", { defaultValue: "Custom Working Hours" })}</span>
                  </p>
                  <p className="text-xs text-nx-ink-2 mt-0.5">
                    {t("resources.workingHours.customDescription", {
                      defaultValue: "Specify exact daily opening and closing hours.",
                    })}
                  </p>
                </div>
              </label>
            </div>

            {/* Daily Schedule Table (When Custom is selected) */}
            {!isOpen247 && (
              <div className="border border-nx-line rounded-nx-md overflow-hidden bg-nx-surface">
                <div className="p-3 border-b border-nx-line bg-nx-raised text-xs font-semibold text-nx-ink flex items-center justify-between">
                  <span>Day</span>
                  <div className="flex items-center gap-8 mr-4">
                    <span>Opening Time</span>
                    <span>Closing Time</span>
                  </div>
                </div>

                <div className="divide-y divide-nx-line/60">
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
                          <input
                            type="checkbox"
                            checked={!closed}
                            onChange={(e) => updateDay(day, "closed", !e.target.checked)}
                            className="size-4 rounded"
                            id={`check-${day}`}
                          />
                          <Label
                            htmlFor={`check-${day}`}
                            className="font-medium cursor-pointer min-w-[100px]"
                          >
                            {t(`resources.workingHours.days.${day}`, { defaultValue: day })}
                          </Label>
                        </div>

                        {!closed ? (
                          <div className="flex items-center gap-3">
                            <Input
                              type="time"
                              value={start}
                              onChange={(e) => updateDay(day, "start", e.target.value)}
                              className="h-8 w-28 text-xs font-mono"
                            />
                            <span className="text-nx-ink-3">→</span>
                            <Input
                              type="time"
                              value={end}
                              onChange={(e) => updateDay(day, "end", e.target.value)}
                              className="h-8 w-28 text-xs font-mono"
                            />
                          </div>
                        ) : (
                          <span className="text-nx-ink-3 italic text-xs mr-16">
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
          <Button asChild variant="outline" size="sm" className="h-8 text-xs gap-1.5 shrink-0">
            <Link href={`/venue/availability?resourceId=${encodeURIComponent(vm.resource?.id ?? "")}`}>
              <span>Open Advanced Availability</span>
              <ExternalLink className="size-3.5 text-nx-ink-3" aria-hidden="true" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
