"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";
import { Home, Users, Settings } from "lucide-react";

export function IconStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  // Wave C: iconStyle is only honoured by the navigation layout — hide the
  // picker everywhere else instead of offering a dead knob.
  if (settings.layoutTemplate !== "navigation") {
    return null;
  }

  const iconStyles: StyleOption[] = [
    {
      value: "outline",
      name: t("settings.iconStyle.options.outline.name"),
      description: t("settings.iconStyle.options.outline.description"),
    },
    {
      value: "filled",
      name: t("settings.iconStyle.options.filled.name"),
      description: t("settings.iconStyle.options.filled.description"),
    },
    {
      value: "duotone",
      name: t("settings.iconStyle.options.duotone.name"),
      description: t("settings.iconStyle.options.duotone.description"),
    },
    {
      value: "minimal",
      name: t("settings.iconStyle.options.minimal.name"),
      description: t("settings.iconStyle.options.minimal.description"),
    },
  ];

  return (
    <StyleCardPicker
      title={t("settings.iconStyle.title")}
      description={t("settings.iconStyle.description")}
      options={iconStyles}
      selected={settings.iconStyle}
      onSelect={(v) => settings.setIconStyle(v as any)}
      gridClassName="grid-cols-1 md:grid-cols-4"
      renderPreview={() => (
        <div className="flex justify-center gap-2">
          <Home className="h-6 w-6" />
          <Users className="h-6 w-6" />
          <Settings className="h-6 w-6" />
        </div>
      )}
    />
  );
}
