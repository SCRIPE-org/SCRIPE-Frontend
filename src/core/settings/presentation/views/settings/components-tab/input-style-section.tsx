"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";
import { cn } from "@core/common/utils";

export function InputStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  const inputStyles: StyleOption[] = [
    {
      value: "default",
      name: t("settings.inputStyle.options.default"),
      class: "rounded-md border",
    },
    {
      value: "rounded",
      name: t("settings.inputStyle.options.rounded"),
      class: "rounded-full border px-4",
    },
    {
      value: "underlined",
      name: t("settings.inputStyle.options.underlined"),
      class: "rounded-none border-0 border-b-2 px-0",
    },
    {
      value: "filled",
      name: t("settings.inputStyle.options.filled"),
      class: "rounded-lg bg-muted border-0",
    },
  ];

  return (
    <StyleCardPicker
      title={t("settings.inputStyle.title")}
      description={t("settings.inputStyle.description")}
      options={inputStyles}
      selected={settings.inputStyle}
      onSelect={(v) => settings.setInputStyle(v as any)}
      gridClassName="grid-cols-1 md:grid-cols-4"
      renderPreview={(option) => (
        <div className={cn("flex h-8 items-center bg-background px-3 text-sm", option.class)}>
          Sample input
        </div>
      )}
    />
  );
}
