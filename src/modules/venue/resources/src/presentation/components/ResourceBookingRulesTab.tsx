"use client";

import { useState } from "react";
import { Button } from "@core/ui/button";
import { Label } from "@core/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useI18n } from "@core/providers/i18n-provider";
import type { useResourceDetailViewModel } from "../viewmodels/useResourceDetailViewModel";

interface Props {
  vm: ReturnType<typeof useResourceDetailViewModel>;
}

const DURATIONS = [
  { value: 30, labelKey: "duration30", fallback: "30 minutes" },
  { value: 60, labelKey: "duration60", fallback: "60 minutes (Standard)" },
  { value: 90, labelKey: "duration90", fallback: "90 minutes" },
  { value: 120, labelKey: "duration120", fallback: "120 minutes (2 Hours)" },
];

/**
 * Documentation for module export
 */
export function ResourceBookingRulesTab({ vm }: Props) {
  const { t } = useI18n();

  const [slotDuration, setSlotDuration] = useState<number>(
    vm.resource?.slotPolicy?.slotDurationMinutes ?? 60
  );
  const [startIncrement, setStartIncrement] = useState<number>(
    vm.resource?.slotPolicy?.startIncrementMinutes ?? slotDuration
  );

  const handleDurationChange = (dur: number) => {
    setSlotDuration(dur);
    setStartIncrement(dur); // Default equals slot duration
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void vm.updateBookingRules({
      slotDurationMinutes: slotDuration,
      startIncrementMinutes: startIncrement,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("resources.bookingRules.title", { defaultValue: "Booking Slot Rules" })}</CardTitle>
        <CardDescription>
          {t("resources.bookingRules.description", {
            defaultValue: "Define the booking duration and grid intervals for this court.",
          })}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-lg">
          <div className="space-y-3">
            <Label className="text-sm font-semibold">
              {t("resources.bookingRules.slotDuration", { defaultValue: "Slot Duration" })}
            </Label>
            <p className="text-xs text-nx-ink-3">
              {t("resources.bookingRules.slotDurationHelp", {
                defaultValue: "How long each standard booking session lasts.",
              })}
            </p>

            <div className="grid grid-cols-2 gap-3">
              {DURATIONS.map(({ value, labelKey, fallback }) => (
                <button
                  type="button"
                  key={value}
                  onClick={() => handleDurationChange(value)}
                  className={`p-3 rounded-nx-md border text-left transition-all ${
                    slotDuration === value
                      ? "border-nx-accent bg-nx-accent/10 font-bold text-nx-ink ring-1 ring-nx-accent"
                      : "border-nx-line hover:bg-nx-surfaceSubtle text-nx-ink-2"
                  }`}
                >
                  <p className="text-xs font-semibold">
                    {t(`resources.bookingRules.${labelKey}`, { defaultValue: fallback })}
                  </p>
                  <p className="text-[10px] text-nx-ink-3 mt-0.5">
                    Grid: every {value} min
                  </p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-nx-line/60">
            <Label className="text-xs font-semibold text-nx-ink">
              {t("resources.bookingRules.bookingStartsEvery", { defaultValue: "Booking Starts Every" })}
            </Label>
            <p className="text-[11px] text-nx-ink-3">
              {t("resources.bookingRules.startsEveryDefault", {
                defaultValue: "Default equals slot duration (e.g. 13:00, 14:00, 15:00)",
              })}
            </p>

            <div className="flex items-center gap-3">
              {/* UI-EXCEPTION: native element required for compact layout */}
              <select
                className="w-full rounded-nx-md border border-nx-line bg-nx-surface px-3 py-2 text-xs font-medium text-nx-ink"
                value={startIncrement}
                onChange={(e) => setStartIncrement(Number(e.target.value))}
              >
                <option value={slotDuration}>
                  Every {slotDuration} minutes (Recommended Â· Clean slots)
                </option>
                {slotDuration > 30 && (
                  <option value={30}>Every 30 minutes (Half-hour starts)</option>
                )}
                {slotDuration > 15 && (
                  <option value={15}>Every 15 minutes (Quarter-hour starts)</option>
                )}
              </select>
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" disabled={vm.saving} loading={vm.saving}>
              {t("resources.bookingRules.save", { defaultValue: "Save Booking Rules" })}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
