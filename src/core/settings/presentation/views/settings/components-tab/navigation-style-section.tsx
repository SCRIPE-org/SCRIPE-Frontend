"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";
import type { ReactNode } from "react";

export function NavigationStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  const previewMap: Record<string, ReactNode> = {
    pills: (
      <div className="flex gap-1">
        <div className="h-6 w-12 rounded-full bg-primary" />
        <div className="h-6 w-12 rounded-full bg-muted" />
      </div>
    ),
    underline: (
      <div className="flex gap-1">
        <div className="h-6 w-12 border-b-2 border-primary bg-muted" />
        <div className="h-6 w-12 bg-muted" />
      </div>
    ),
    sidebar: (
      <div className="flex gap-1">
        <div className="h-6 w-2 rounded bg-primary" />
        <div className="h-6 w-16 rounded bg-muted" />
      </div>
    ),
    default: (
      <div className="flex gap-1">
        <div className="h-6 w-12 rounded bg-primary" />
        <div className="h-6 w-12 rounded bg-muted" />
      </div>
    ),
  };

  const navigationStyles: StyleOption[] = [
    {
      value: "default",
      name: t("settings.navigationStyle.options.default.name"),
      description: t("settings.navigationStyle.options.default.description"),
    },
    {
      value: "pills",
      name: t("settings.navigationStyle.options.pills.name"),
      description: t("settings.navigationStyle.options.pills.description"),
    },
    {
      value: "underline",
      name: t("settings.navigationStyle.options.underline.name"),
      description: t("settings.navigationStyle.options.underline.description"),
    },
    {
      value: "sidebar",
      name: t("settings.navigationStyle.options.sidebar.name"),
      description: t("settings.navigationStyle.options.sidebar.description"),
    },
  ];

  return (
    <StyleCardPicker
      title={t("settings.navigationStyle.title")}
      description={t("settings.navigationStyle.description")}
      options={navigationStyles}
      selected={settings.navigationStyle}
      onSelect={(v) => settings.setNavigationStyle(v as any)}
      gridClassName="grid-cols-1 md:grid-cols-4"
      renderPreview={(option) => previewMap[option.value] ?? null}
    />
  );
}
