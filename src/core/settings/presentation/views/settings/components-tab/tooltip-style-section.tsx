"use client";

import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { StyleCardPicker, type StyleOption } from "@core/settings/components/shared";
import { Button } from "@core/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@core/ui/tooltip";
import { Info } from "lucide-react";

export function TooltipStyleSection() {
  const { t } = useI18n();
  const settings = useSettings();

  const tooltipStyles: StyleOption[] = [
    { value: "default", name: t("settings.tooltipStyle.options.default.name"), description: t("settings.tooltipStyle.options.default.description") },
    { value: "rounded", name: t("settings.tooltipStyle.options.rounded.name"), description: t("settings.tooltipStyle.options.rounded.description") },
    { value: "sharp", name: t("settings.tooltipStyle.options.sharp.name"), description: t("settings.tooltipStyle.options.sharp.description") },
    { value: "bubble", name: t("settings.tooltipStyle.options.bubble.name"), description: t("settings.tooltipStyle.options.bubble.description") },
    { value: "glass", name: t("settings.tooltipStyle.options.glass.name"), description: t("settings.tooltipStyle.options.glass.description") },
    { value: "neon", name: t("settings.tooltipStyle.options.neon.name"), description: t("settings.tooltipStyle.options.neon.description") },
    { value: "minimal", name: t("settings.tooltipStyle.options.minimal.name"), description: t("settings.tooltipStyle.options.minimal.description") },
    { value: "elegant", name: t("settings.tooltipStyle.options.elegant.name"), description: t("settings.tooltipStyle.options.elegant.description") },
  ];

  return (
    <StyleCardPicker
      title={t("settings.tooltipStyle.title")}
      description={t("settings.tooltipStyle.description")}
      options={tooltipStyles}
      selected={settings.tooltipStyle}
      onSelect={(v) => settings.setTooltipStyle(v as any)}
      gridClassName="grid-cols-1 md:grid-cols-4"
      renderPreview={(option) => (
        <div className="flex justify-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="outline" size="sm">
                <Info className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sample tooltip with {option.name.toLowerCase()} style</p>
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    />
  );
}
