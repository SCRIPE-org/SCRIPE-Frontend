"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";
import { CalendarDays } from "lucide-react";
import { cn } from "@core/common/utils";

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
      value: "modern",
      name: t("settings.datePickerStyle.options.modern.name"),
      description: t("settings.datePickerStyle.options.modern.description"),
      previewClass:
        "bg-gradient-to-r from-background to-muted/20 border border-border/50 rounded-md shadow-sm",
    },
    {
      value: "glass",
      name: t("settings.datePickerStyle.options.glass.name"),
      description: t("settings.datePickerStyle.options.glass.description"),
      previewClass: "bg-background/60 backdrop-blur-sm border border-white/20 rounded-md shadow-lg",
    },
    {
      value: "outlined",
      name: t("settings.datePickerStyle.options.outlined.name"),
      description: t("settings.datePickerStyle.options.outlined.description"),
      previewClass: "bg-transparent border-2 border-border rounded-md",
    },
    {
      value: "filled",
      name: t("settings.datePickerStyle.options.filled.name"),
      description: t("settings.datePickerStyle.options.filled.description"),
      previewClass: "bg-muted/50 border border-transparent rounded-md",
    },
    {
      value: "minimal",
      name: t("settings.datePickerStyle.options.minimal.name"),
      description: t("settings.datePickerStyle.options.minimal.description"),
      previewClass: "bg-transparent border-b-2 border-border rounded-none",
    },
    {
      value: "elegant",
      name: t("settings.datePickerStyle.options.elegant.name"),
      description: t("settings.datePickerStyle.options.elegant.description"),
      previewClass:
        "bg-gradient-to-br from-background via-background to-muted/10 border border-border/30 rounded-md shadow-sm",
    },
  ];

  return (
    <StyleCardPicker
      title={t("settings.datePickerStyle.title")}
      description={t("settings.datePickerStyle.description")}
      options={datePickerStyles}
      selected={settings.datePickerStyle}
      onSelect={(v) => settings.setDatePickerStyle(v as any)}
      gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
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
