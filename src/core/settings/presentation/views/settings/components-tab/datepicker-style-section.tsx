"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";
import { CalendarDays } from "lucide-react";
import { cn } from "@core/common/utils";

/**
 * Wave C: only the surviving datepicker styles are offered — "default" (the
 * nexus token treatment) and "elegant" (the accent take), matching the
 * DatePickerVariant collapse in @core/ui/date-picker. The component resolves
 * every stored legacy style onto these survivors.
 */
export function DatePickerStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  const datePickerStyles: (StyleOption & { previewClass: string })[] = [
    {
      value: "default",
      name: t("settings.datePickerStyle.options.default.name"),
      description: t("settings.datePickerStyle.options.default.description"),
      previewClass: "bg-background border border-border rounded-md",
    },
    {
      value: "elegant",
      name: t("settings.datePickerStyle.options.elegant.name"),
      description: t("settings.datePickerStyle.options.elegant.description"),
      previewClass: "bg-background border border-primary/50 rounded-md",
    },
  ];

  return (
    <StyleCardPicker
      title={t("settings.datePickerStyle.title")}
      description={t("settings.datePickerStyle.description")}
      options={datePickerStyles}
      selected={settings.datePickerStyle}
      onSelect={(v) => settings.setDatePickerStyle(v as any)}
      gridClassName="grid-cols-1 md:grid-cols-2"
      renderPreview={(option) => (
        <div className="space-y-2">
          <div
            className={cn(
              "flex h-10 w-full items-center justify-between px-3 text-xs text-muted-foreground",
              (option as any).previewClass
            )}
          >
            <span>{t("settings.datePickerStyle.previewDate")}</span>
            <CalendarDays className="h-4 w-4" />
          </div>
        </div>
      )}
    />
  );
}
