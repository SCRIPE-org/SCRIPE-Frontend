"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { badgeVariants } from "@core/ui/badge";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";
import { cn } from "@core/common/utils";

function StylePreviewBadge({
  variant,
  badgeStyle,
  children,
  className,
}: {
  variant: string;
  badgeStyle: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        badgeVariants({ variant: variant as any, badgeStyle: badgeStyle as any, className })
      )}
    >
      {children}
    </div>
  );
}

export function BadgeStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  const badgeStyles: StyleOption[] = [
    {
      value: "default",
      name: t("settings.badgeStyle.options.default.name"),
      description: t("settings.badgeStyle.options.default.description"),
    },
    {
      value: "modern",
      name: t("settings.badgeStyle.options.modern.name"),
      description: t("settings.badgeStyle.options.modern.description"),
    },
    {
      value: "glass",
      name: t("settings.badgeStyle.options.glass.name"),
      description: t("settings.badgeStyle.options.glass.description"),
    },
    {
      value: "neon",
      name: t("settings.badgeStyle.options.neon.name"),
      description: t("settings.badgeStyle.options.neon.description"),
    },
    {
      value: "gradient",
      name: t("settings.badgeStyle.options.gradient.name"),
      description: t("settings.badgeStyle.options.gradient.description"),
    },
    {
      value: "outlined",
      name: t("settings.badgeStyle.options.outlined.name"),
      description: t("settings.badgeStyle.options.outlined.description"),
    },
    {
      value: "filled",
      name: t("settings.badgeStyle.options.filled.name"),
      description: t("settings.badgeStyle.options.filled.description"),
    },
    {
      value: "minimal",
      name: t("settings.badgeStyle.options.minimal.name"),
      description: t("settings.badgeStyle.options.minimal.description"),
    },
    {
      value: "pill",
      name: t("settings.badgeStyle.options.pill.name"),
      description: t("settings.badgeStyle.options.pill.description"),
    },
    {
      value: "square",
      name: t("settings.badgeStyle.options.square.name"),
      description: t("settings.badgeStyle.options.square.description"),
    },
  ];

  return (
    <StyleCardPicker
      title={t("settings.badgeStyle.title")}
      description={t("settings.badgeStyle.description")}
      options={badgeStyles}
      selected={settings.badgeStyle}
      onSelect={(v) => settings.setBadgeStyle(v as any)}
      gridClassName="grid-cols-2 md:grid-cols-4"
      renderPreview={(option) => (
        <div className="flex justify-center gap-1">
          <StylePreviewBadge variant="active" badgeStyle={option.value}>
            Active
          </StylePreviewBadge>
          <StylePreviewBadge variant="inactive" badgeStyle={option.value}>
            Inactive
          </StylePreviewBadge>
        </div>
      )}
    />
  );
}
