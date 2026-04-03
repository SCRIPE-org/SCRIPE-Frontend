"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";

export function ButtonStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  const buttonStyles: StyleOption[] = [
    { value: "default", name: t("settings.buttonStyle.options.default.name"), description: t("settings.buttonStyle.options.default.description"), class: "rounded-md" },
    { value: "small-round", name: t("settings.buttonStyle.options.smallRound.name"), description: t("settings.buttonStyle.options.smallRound.description"), class: "rounded" },
    { value: "medium-round", name: t("settings.buttonStyle.options.mediumRound.name"), description: t("settings.buttonStyle.options.mediumRound.description"), class: "rounded-lg" },
    { value: "large-round", name: t("settings.buttonStyle.options.largeRound.name"), description: t("settings.buttonStyle.options.largeRound.description"), class: "rounded-xl" },
    { value: "extra-round", name: t("settings.buttonStyle.options.extraRound.name"), description: t("settings.buttonStyle.options.extraRound.description"), class: "rounded-2xl" },
    { value: "super-round", name: t("settings.buttonStyle.options.superRound.name"), description: t("settings.buttonStyle.options.superRound.description"), class: "rounded-3xl" },
    { value: "rounded", name: t("settings.buttonStyle.options.rounded.name"), description: t("settings.buttonStyle.options.rounded.description"), class: "rounded-full" },
    { value: "sharp", name: t("settings.buttonStyle.options.sharp.name"), description: t("settings.buttonStyle.options.sharp.description"), class: "rounded-none" },
  ];

  return (
    <StyleCardPicker
      title={t("settings.buttonStyle.title")}
      description={t("settings.buttonStyle.description")}
      options={buttonStyles}
      selected={settings.buttonStyle}
      onSelect={(v) => settings.setButtonStyle(v as any)}
      gridClassName="grid-cols-2 md:grid-cols-4"
      renderPreview={(option) => (
        <div className={`flex h-8 items-center justify-center bg-primary text-xs font-medium text-primary-foreground ${option.class ?? ""}`}>
          {option.name}
        </div>
      )}
    />
  );
}
