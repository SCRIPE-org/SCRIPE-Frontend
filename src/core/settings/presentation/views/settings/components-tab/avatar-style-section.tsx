"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";
import { User } from "lucide-react";
import { cn } from "@core/common/utils";

export function AvatarStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  const avatarStyles: StyleOption[] = [
    { value: "default", name: t("settings.avatarStyle.options.default"), class: "rounded-full" },
    { value: "rounded", name: t("settings.avatarStyle.options.rounded"), class: "rounded-lg" },
    { value: "square", name: t("settings.avatarStyle.options.square"), class: "rounded-none" },
    { value: "hexagon", name: t("settings.avatarStyle.options.hexagon"), class: "rounded-full" },
  ];

  return (
    <StyleCardPicker
      title={t("settings.avatarStyle.title")}
      description={t("settings.avatarStyle.description")}
      options={avatarStyles}
      selected={settings.avatarStyle}
      onSelect={(v) => settings.setAvatarStyle(v as any)}
      gridClassName="grid-cols-2 md:grid-cols-4"
      renderPreview={(option) => (
        <div className="flex justify-center">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center bg-primary text-sm font-medium text-primary-foreground",
              option.class
            )}
          >
            <User className="h-5 w-5" />
          </div>
        </div>
      )}
    />
  );
}
