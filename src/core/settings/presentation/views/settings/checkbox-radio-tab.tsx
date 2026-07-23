"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import GenericSelect from "@core/crud/components/generic-select";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { CheckboxStyle, RadioStyle } from "@core/providers/settings-provider";

/**
 * Wave C: the checkbox and radio pickers list only the surviving control
 * surfaces from the Wave A collapse — default and minimal. The checkbox/radio
 * components resolve every stored legacy value onto these survivors, and the
 * merge-engine migration rewrites persisted settings the same way.
 *
 * Gallery cards are keyboard-operable (role="button") rather than native
 * buttons because each preview embeds a live Radix control that must not nest
 * inside a button element.
 */

/** Shared classes for selectable picker cards — focus law + hover elevation. */
const galleryCardClass = (isSelected: boolean) =>
  cn(
    "cursor-pointer rounded-lg border p-3 text-start transition-shadow duration-nx-micro hover:shadow-md motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus",
    isSelected
      ? "border-primary bg-primary/5 shadow-sm"
      : "border-border bg-card hover:border-primary/50"
  );

/** Keyboard activation for role="button" cards (Enter / Space). */
const cardKeyHandler = (activate: () => void) => (e: React.KeyboardEvent) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    activate();
  }
};

function CheckboxPreview({ design, t }: { design: CheckboxStyle; t: (key: string) => string }) {
  return (
    <div className="flex items-center space-x-2 rounded border bg-card/50 p-2">
      <Checkbox design={design} id={`checkbox-${design}`} />
      <Label htmlFor={`checkbox-${design}`} className="text-sm">
        {t("settings.inputs.preview")}
      </Label>
    </div>
  );
}

function RadioPreview({ design, t }: { design: RadioStyle; t: (key: string) => string }) {
  return (
    <div className="rounded border bg-card/50 p-2">
      <RadioGroup value="sample" className="space-y-1">
        <div className="flex items-center space-x-2">
          <RadioGroupItem design={design} value="sample" id={`radio-${design}-1`} />
          <Label htmlFor={`radio-${design}-1`} className="text-sm">
            {t("settings.inputs.preview")} 1
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem design={design} value="sample2" id={`radio-${design}-2`} />
          <Label htmlFor={`radio-${design}-2`} className="text-sm">
            {t("settings.inputs.preview")} 2
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}

export function CheckboxRadioTab() {
  const { t } = useI18n();
  const settings = useSettings();
  const [selectedRadioValue, setSelectedRadioValue] = useState("option1");

  const checkboxStyles: Array<{
    value: CheckboxStyle;
    name: string;
    description: string;
  }> = [
    {
      value: "default",
      name: t("settings.inputs.checkbox.designOptions.default.name") || "Default",
      description:
        t("settings.inputs.checkbox.designOptions.default.description") ||
        "Standard checkbox design",
    },
    {
      value: "minimal",
      name: t("settings.inputs.checkbox.designOptions.minimal.name"),
      description: t("settings.inputs.checkbox.designOptions.minimal.description"),
    },
  ];

  const radioStyles: Array<{
    value: RadioStyle;
    name: string;
    description: string;
  }> = [
    {
      value: "default",
      name: t("settings.inputs.radio.designOptions.default.name") || "Default",
      description:
        t("settings.inputs.radio.designOptions.default.description") ||
        "Standard radio button design",
    },
    {
      value: "minimal",
      name: t("settings.inputs.radio.designOptions.minimal.name"),
      description: t("settings.inputs.radio.designOptions.minimal.description"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Checkbox Styles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Checkbox className="h-5 w-5" />
            {t("settings.inputs.checkbox.title")}
          </CardTitle>
          <CardDescription>{t("settings.inputs.checkbox.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("settings.inputs.checkbox.title")}</Label>
            <GenericSelect
              type="single"
              value={settings.checkboxStyle}
              onValueChange={(value: string | string[]) =>
                settings.setCheckboxStyle(value as CheckboxStyle)
              }
              options={checkboxStyles.map((style) => ({
                value: style.value,
                label: `${style.name} - ${style.description}`,
              }))}
              placeholder={t("settings.inputs.checkbox.description")}
              className="w-full"
            />
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("settings.inputs.preview")}</Label>
            <div className="rounded-lg border bg-muted/20 p-4">
              <CheckboxPreview design={settings.checkboxStyle} t={t} />
            </div>
          </div>

          {/* Style Gallery */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">{t("settings.inputs.checkbox.title")}</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {checkboxStyles.map((style) => (
                <div
                  key={style.value}
                  role="button"
                  tabIndex={0}
                  aria-pressed={settings.checkboxStyle === style.value}
                  className={galleryCardClass(settings.checkboxStyle === style.value)}
                  onClick={() => settings.setCheckboxStyle(style.value)}
                  onKeyDown={cardKeyHandler(() => settings.setCheckboxStyle(style.value))}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{style.name}</span>
                      {settings.checkboxStyle === style.value && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                    {/* inert: the embedded control is purely decorative */}
                    <div inert>
                      <CheckboxPreview design={style.value} t={t} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Radio Button Styles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-primary bg-primary/20">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
            {t("settings.inputs.radio.title")}
          </CardTitle>
          <CardDescription>{t("settings.inputs.radio.description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("settings.inputs.radio.title")}</Label>
            <GenericSelect
              type="single"
              value={settings.radioStyle}
              onValueChange={(value: string | string[]) =>
                settings.setRadioStyle(value as RadioStyle)
              }
              options={radioStyles.map((style) => ({
                value: style.value,
                label: `${style.name} - ${style.description}`,
              }))}
              placeholder={t("settings.inputs.radio.description")}
              className="w-full"
            />
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("settings.inputs.preview")}</Label>
            <div className="rounded-lg border bg-muted/20 p-4">
              <RadioPreview design={settings.radioStyle} t={t} />
            </div>
          </div>

          {/* Style Gallery */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">{t("settings.inputs.radio.title")}</Label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {radioStyles.map((style) => (
                <div
                  key={style.value}
                  role="button"
                  tabIndex={0}
                  aria-pressed={settings.radioStyle === style.value}
                  className={galleryCardClass(settings.radioStyle === style.value)}
                  onClick={() => settings.setRadioStyle(style.value)}
                  onKeyDown={cardKeyHandler(() => settings.setRadioStyle(style.value))}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{style.name}</span>
                      {settings.radioStyle === style.value && (
                        <div className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                    {/* inert: the embedded control is purely decorative */}
                    <div inert>
                      <RadioPreview design={style.value} t={t} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.inputs.preview")}</CardTitle>
          <CardDescription>{t("settings.inputs.previewDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Checkbox Demo */}
            <div className="space-y-4">
              <h4 className="font-medium">{t("settings.inputs.checkbox.title")}</h4>
              <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                <div className="flex items-center space-x-2">
                  <Checkbox design={settings.checkboxStyle} id="demo-1" />
                  <Label htmlFor="demo-1">Accept terms and conditions</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox design={settings.checkboxStyle} id="demo-2" defaultChecked />
                  <Label htmlFor="demo-2">Subscribe to newsletter</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox design={settings.checkboxStyle} id="demo-3" disabled />
                  <Label htmlFor="demo-3">Disabled option</Label>
                </div>
              </div>
            </div>

            {/* Radio Demo */}
            <div className="space-y-4">
              <h4 className="font-medium">{t("settings.inputs.radio.title")}</h4>
              <div className="rounded-lg border bg-muted/20 p-4">
                <RadioGroup
                  value={selectedRadioValue}
                  onValueChange={setSelectedRadioValue}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      design={settings.radioStyle}
                      value="option1"
                      id="demo-radio-1"
                    />
                    <Label htmlFor="demo-radio-1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      design={settings.radioStyle}
                      value="option2"
                      id="demo-radio-2"
                    />
                    <Label htmlFor="demo-radio-2">Option 2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem
                      design={settings.radioStyle}
                      value="option3"
                      id="demo-radio-3"
                    />
                    <Label htmlFor="demo-radio-3">Option 3</Label>
                  </div>
                </RadioGroup>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
