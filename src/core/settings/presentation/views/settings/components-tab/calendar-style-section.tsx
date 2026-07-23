"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";
import { CalendarDays, ChevronRight } from "lucide-react";
import { cn } from "@core/common/utils";

export function CalendarStyleSection() {
  const { t, language } = useI18n();
  const settings = useSettings();

  const weekDays = [
    t("daysShort.sun"),
    t("daysShort.mon"),
    t("daysShort.tue"),
    t("daysShort.wed"),
    t("daysShort.thu"),
    t("daysShort.fri"),
    t("daysShort.sat"),
  ];

  const sampleMonthLabel = t("settings.calendar.sampleLabel", {
    month: t("months.jan"),
    year: new Intl.NumberFormat(language).format(2024),
  });

  // Wave C: only the surviving calendar skins are offered — "default" and
  // "elegant", matching the CalendarVariant collapse in
  // @core/ui/custom-calendar. The component resolves stored legacy skins onto
  // these survivors.
  const calendarStyles: StyleOption[] = [
    {
      value: "default",
      name: t("settings.calendarStyle.options.default.name"),
      description: t("settings.calendarStyle.options.default.description"),
    },
    {
      value: "elegant",
      name: t("settings.calendarStyle.options.elegant.name"),
      description: t("settings.calendarStyle.options.elegant.description"),
    },
  ];

  return (
    <StyleCardPicker
      title={t("settings.calendarStyle.title")}
      description={t("settings.calendarStyle.description")}
      options={calendarStyles}
      selected={settings.calendarStyle}
      onSelect={(v) => settings.setCalendarStyle(v as any)}
      gridClassName="grid-cols-1 md:grid-cols-2"
      renderPreview={() => (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <CalendarDays className="h-3 w-3" />
            <span>{sampleMonthLabel}</span>
            <ChevronRight className="h-3 w-3" />
          </div>
          <div className="grid grid-cols-7 gap-0.5 text-xs">
            {weekDays.map((day, i) => (
              <div
                key={i}
                className="flex h-4 w-4 items-center justify-center text-muted-foreground"
              >
                {day}
              </div>
            ))}
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className={cn(
                  "flex h-4 w-4 items-center justify-center rounded-sm text-xs",
                  i === 3 ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                )}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>
      )}
    />
  );
}
