"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { Pipette } from "lucide-react";

function ColorPickerField({
  label,
  description,
  value,
  onChange,
  onClear,
  placeholder,
}: {
  label: string;
  description: string;
  value: string;
  onChange: (color: string) => void;
  onClear: () => void;
  placeholder: string;
}) {
  const [localValue, setLocalValue] = useState(value || "#6366f1");

  const handleColorChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const color = e.target.value;
      setLocalValue(color);
      onChange(color);
    },
    [onChange]
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Pipette className="h-4 w-4 text-primary" />
          {label}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input
              type="color"
              value={value || localValue}
              onChange={handleColorChange}
              className="h-16 w-16 cursor-pointer rounded-xl border-2 border-muted transition-colors hover:border-primary [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-lg"
            />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={value || ""}
                onChange={(e) => {
                  setLocalValue(e.target.value);
                  onChange(e.target.value);
                }}
                placeholder={placeholder}
                className="flex-1 rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {value && (
                <button
                  onClick={onClear}
                  className="rounded-lg border border-input px-3 py-2 text-xs font-medium transition-colors hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
                >
                  Reset
                </button>
              )}
            </div>
            {value && (
              <div className="flex items-center gap-2">
                <div
                  className="h-4 w-8 rounded border border-muted"
                  style={{ backgroundColor: value }}
                />
                <span className="text-xs text-muted-foreground">
                  {value ? "Active" : "Using preset"}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CustomColorsSubtab() {
  const { t } = useI18n();
  const settings = useSettings();

  return (
    <div className="space-y-4">
      {settings.backgroundMode !== "custom" && (
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
          <p className="text-sm text-warning">
            ⚠️ {t("settings.customBgWarning")}
          </p>
          <button
            className="mt-2 text-xs font-medium text-primary hover:underline"
            onClick={() => settings.setBackgroundMode("custom")}
          >
            {t("settings.switchToCustom")}
          </button>
        </div>
      )}

      <div className="rounded-lg border border-muted bg-muted/50 p-3">
        <p className="text-sm text-muted-foreground">
          {t("settings.appearanceSettings.customColorsInfo")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ColorPickerField
          label={t("settings.appearanceSettings.customPrimary")}
          description={t("settings.appearanceSettings.customPrimaryDesc")}
          value={settings.customPrimaryColor}
          onChange={settings.setCustomPrimaryColor}
          onClear={() => settings.setCustomPrimaryColor("")}
          placeholder="#6366f1"
        />
        <ColorPickerField
          label={t("settings.appearanceSettings.customSecondary")}
          description={t("settings.appearanceSettings.customSecondaryDesc")}
          value={settings.customSecondaryColor}
          onChange={settings.setCustomSecondaryColor}
          onClear={() => settings.setCustomSecondaryColor("")}
          placeholder="#8b5cf6"
        />
        <ColorPickerField
          label={t("settings.appearanceSettings.customLightBg")}
          description={t("settings.appearanceSettings.customLightBgDesc")}
          value={settings.customLightBgColor}
          onChange={settings.setCustomLightBgColor}
          onClear={() => settings.setCustomLightBgColor("")}
          placeholder="#fafafa"
        />
        <ColorPickerField
          label={t("settings.appearanceSettings.customDarkBg")}
          description={t("settings.appearanceSettings.customDarkBgDesc")}
          value={settings.customDarkBgColor}
          onChange={settings.setCustomDarkBgColor}
          onClear={() => settings.setCustomDarkBgColor("")}
          placeholder="#0a0a0a"
        />
      </div>
    </div>
  );
}
