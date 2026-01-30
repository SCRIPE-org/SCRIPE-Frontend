"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Label } from "@core/ui/label";
import { Checkbox } from "@core/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@core/ui/radio-group";
import GenericSelect from "@core/ui/generic-select";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { CheckboxStyle, RadioStyle } from "@core/providers/settings-provider";

export function CheckboxRadioTab() {
  const { t } = useI18n();
  const settings = useSettings();
  const [selectedRadioValue, setSelectedRadioValue] = useState("option1");

  const checkboxStyles: Array<{
    value: CheckboxStyle;
    name: string;
    description: string;
    category: string;
  }> = [
    {
      value: "default",
      name: t("settings.inputs.checkbox.designOptions.default.name") || "Default",
      description: t("settings.inputs.checkbox.designOptions.default.description") || "Standard checkbox design",
      category: "Basic"
    },
    {
      value: "modern",
      name: t("settings.inputs.checkbox.designOptions.modern.name"),
      description: t("settings.inputs.checkbox.designOptions.modern.description"),
      category: "Basic"
    },
    {
      value: "minimal",
      name: t("settings.inputs.checkbox.designOptions.minimal.name"),
      description: t("settings.inputs.checkbox.designOptions.minimal.description"),
      category: "Basic"
    },
    {
      value: "elegant",
      name: t("settings.inputs.checkbox.designOptions.elegant.name"),
      description: t("settings.inputs.checkbox.designOptions.elegant.description"),
      category: "Basic"
    },
    {
      value: "glass",
      name: t("settings.inputs.checkbox.designOptions.glass.name"),
      description: t("settings.inputs.checkbox.designOptions.glass.description"),
      category: "Advanced"
    },
    {
      value: "neumorphism",
      name: t("settings.inputs.checkbox.designOptions.neumorphism.name"),
      description: t("settings.inputs.checkbox.designOptions.neumorphism.description"),
      category: "Advanced"
    },
    {
      value: "gradient",
      name: t("settings.inputs.checkbox.designOptions.gradient.name"),
      description: t("settings.inputs.checkbox.designOptions.gradient.description"),
      category: "Advanced"
    },
    {
      value: "neon",
      name: t("settings.inputs.checkbox.designOptions.neon.name"),
      description: t("settings.inputs.checkbox.designOptions.neon.description"),
      category: "Futuristic"
    },
    {
      value: "cyberpunk",
      name: t("settings.inputs.checkbox.designOptions.cyberpunk.name"),
      description: t("settings.inputs.checkbox.designOptions.cyberpunk.description"),
      category: "Futuristic"
    },
    {
      value: "matrix",
      name: t("settings.inputs.checkbox.designOptions.matrix.name"),
      description: t("settings.inputs.checkbox.designOptions.matrix.description"),
      category: "Futuristic"
    },
    {
      value: "luxury",
      name: t("settings.inputs.checkbox.designOptions.luxury.name"),
      description: t("settings.inputs.checkbox.designOptions.luxury.description"),
      category: "Premium"
    },
    {
      value: "aurora",
      name: t("settings.inputs.checkbox.designOptions.aurora.name"),
      description: t("settings.inputs.checkbox.designOptions.aurora.description"),
      category: "Premium"
    },
    {
      value: "cosmic",
      name: t("settings.inputs.checkbox.designOptions.cosmic.name"),
      description: t("settings.inputs.checkbox.designOptions.cosmic.description"),
      category: "Premium"
    },
    {
      value: "organic",
      name: t("settings.inputs.checkbox.designOptions.organic.name"),
      description: t("settings.inputs.checkbox.designOptions.organic.description"),
      category: "Themed"
    },
    {
      value: "retro",
      name: t("settings.inputs.checkbox.designOptions.retro.name"),
      description: t("settings.inputs.checkbox.designOptions.retro.description"),
      category: "Themed"
    },
    {
      value: "diamond",
      name: t("settings.inputs.checkbox.designOptions.diamond.name"),
      description: t("settings.inputs.checkbox.designOptions.diamond.description"),
      category: "Unique"
    },
    {
      value: "liquid",
      name: t("settings.inputs.checkbox.designOptions.liquid.name"),
      description: t("settings.inputs.checkbox.designOptions.liquid.description"),
      category: "Unique"
    },
    {
      value: "crystal",
      name: t("settings.inputs.checkbox.designOptions.crystal.name"),
      description: t("settings.inputs.checkbox.designOptions.crystal.description"),
      category: "Unique"
    },
    {
      value: "plasma",
      name: t("settings.inputs.checkbox.designOptions.plasma.name"),
      description: t("settings.inputs.checkbox.designOptions.plasma.description"),
      category: "Unique"
    },
    {
      value: "quantum",
      name: t("settings.inputs.checkbox.designOptions.quantum.name"),
      description: t("settings.inputs.checkbox.designOptions.quantum.description"),
      category: "Unique"
    },
    {
      value: "holographic",
      name: t("settings.inputs.checkbox.designOptions.holographic.name"),
      description: t("settings.inputs.checkbox.designOptions.holographic.description"),
      category: "Unique"
    },
    {
      value: "stellar",
      name: t("settings.inputs.checkbox.designOptions.stellar.name"),
      description: t("settings.inputs.checkbox.designOptions.stellar.description"),
      category: "Unique"
    },
    {
      value: "vortex",
      name: t("settings.inputs.checkbox.designOptions.vortex.name"),
      description: t("settings.inputs.checkbox.designOptions.vortex.description"),
      category: "Unique"
    },
    {
      value: "phoenix",
      name: t("settings.inputs.checkbox.designOptions.phoenix.name"),
      description: t("settings.inputs.checkbox.designOptions.phoenix.description"),
      category: "Unique"
    }
  ];

  const radioStyles: Array<{
    value: RadioStyle;
    name: string;
    description: string;
    category: string;
  }> = [
    {
      value: "default",
      name: t("settings.inputs.radio.designOptions.default.name") || "Default",
      description: t("settings.inputs.radio.designOptions.default.description") || "Standard radio button design",
      category: "Basic"
    },
    {
      value: "modern",
      name: t("settings.inputs.radio.designOptions.modern.name"),
      description: t("settings.inputs.radio.designOptions.modern.description"),
      category: "Basic"
    },
    {
      value: "minimal",
      name: t("settings.inputs.radio.designOptions.minimal.name"),
      description: t("settings.inputs.radio.designOptions.minimal.description"),
      category: "Basic"
    },
    {
      value: "elegant",
      name: t("settings.inputs.radio.designOptions.elegant.name"),
      description: t("settings.inputs.radio.designOptions.elegant.description"),
      category: "Basic"
    },
    {
      value: "glass",
      name: t("settings.inputs.radio.designOptions.glass.name"),
      description: t("settings.inputs.radio.designOptions.glass.description"),
      category: "Advanced"
    },
    {
      value: "neumorphism",
      name: t("settings.inputs.radio.designOptions.neumorphism.name"),
      description: t("settings.inputs.radio.designOptions.neumorphism.description"),
      category: "Advanced"
    },
    {
      value: "gradient",
      name: t("settings.inputs.radio.designOptions.gradient.name"),
      description: t("settings.inputs.radio.designOptions.gradient.description"),
      category: "Advanced"
    },
    {
      value: "neon",
      name: t("settings.inputs.radio.designOptions.neon.name"),
      description: t("settings.inputs.radio.designOptions.neon.description"),
      category: "Futuristic"
    },
    {
      value: "cyberpunk",
      name: t("settings.inputs.radio.designOptions.cyberpunk.name"),
      description: t("settings.inputs.radio.designOptions.cyberpunk.description"),
      category: "Futuristic"
    },
    {
      value: "matrix",
      name: t("settings.inputs.radio.designOptions.matrix.name"),
      description: t("settings.inputs.radio.designOptions.matrix.description"),
      category: "Futuristic"
    },
    {
      value: "luxury",
      name: t("settings.inputs.radio.designOptions.luxury.name"),
      description: t("settings.inputs.radio.designOptions.luxury.description"),
      category: "Premium"
    },
    {
      value: "aurora",
      name: t("settings.inputs.radio.designOptions.aurora.name"),
      description: t("settings.inputs.radio.designOptions.aurora.description"),
      category: "Premium"
    },
    {
      value: "cosmic",
      name: t("settings.inputs.radio.designOptions.cosmic.name"),
      description: t("settings.inputs.radio.designOptions.cosmic.description"),
      category: "Premium"
    },
    {
      value: "organic",
      name: t("settings.inputs.radio.designOptions.organic.name"),
      description: t("settings.inputs.radio.designOptions.organic.description"),
      category: "Themed"
    },
    {
      value: "retro",
      name: t("settings.inputs.radio.designOptions.retro.name"),
      description: t("settings.inputs.radio.designOptions.retro.description"),
      category: "Themed"
    },
    {
      value: "diamond",
      name: t("settings.inputs.radio.designOptions.diamond.name"),
      description: t("settings.inputs.radio.designOptions.diamond.description"),
      category: "Unique"
    },
    {
      value: "liquid",
      name: t("settings.inputs.radio.designOptions.liquid.name"),
      description: t("settings.inputs.radio.designOptions.liquid.description"),
      category: "Unique"
    },
    {
      value: "crystal",
      name: t("settings.inputs.radio.designOptions.crystal.name"),
      description: t("settings.inputs.radio.designOptions.crystal.description"),
      category: "Unique"
    },
    {
      value: "plasma",
      name: t("settings.inputs.radio.designOptions.plasma.name"),
      description: t("settings.inputs.radio.designOptions.plasma.description"),
      category: "Unique"
    },
    {
      value: "quantum",
      name: t("settings.inputs.radio.designOptions.quantum.name"),
      description: t("settings.inputs.radio.designOptions.quantum.description"),
      category: "Unique"
    },
    {
      value: "holographic",
      name: t("settings.inputs.radio.designOptions.holographic.name"),
      description: t("settings.inputs.radio.designOptions.holographic.description"),
      category: "Unique"
    },
    {
      value: "stellar",
      name: t("settings.inputs.radio.designOptions.stellar.name"),
      description: t("settings.inputs.radio.designOptions.stellar.description"),
      category: "Unique"
    },
    {
      value: "vortex",
      name: t("settings.inputs.radio.designOptions.vortex.name"),
      description: t("settings.inputs.radio.designOptions.vortex.description"),
      category: "Unique"
    },
    {
      value: "phoenix",
      name: t("settings.inputs.radio.designOptions.phoenix.name"),
      description: t("settings.inputs.radio.designOptions.phoenix.description"),
      category: "Unique"
    }
  ];

  const groupedCheckboxStyles = checkboxStyles.reduce((acc, style) => {
    if (!acc[style.category]) {
      acc[style.category] = [];
    }
    acc[style.category].push(style);
    return acc;
  }, {} as Record<string, typeof checkboxStyles>);

  const groupedRadioStyles = radioStyles.reduce((acc, style) => {
    if (!acc[style.category]) {
      acc[style.category] = [];
    }
    acc[style.category].push(style);
    return acc;
  }, {} as Record<string, typeof radioStyles>);

  const CheckboxPreview = ({ design }: { design: CheckboxStyle }) => (
    <div className="flex items-center space-x-2 p-2 rounded border bg-card/50">
      <Checkbox design={design} id={`checkbox-${design}`} />
      <Label htmlFor={`checkbox-${design}`} className="text-sm">
        {t("settings.inputs.preview")}
      </Label>
    </div>
  );

  const RadioPreview = ({ design }: { design: RadioStyle }) => (
    <div className="p-2 rounded border bg-card/50">
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

  return (
    <div className="space-y-6">
      {/* Checkbox Styles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Checkbox className="h-5 w-5" />
            {t("settings.inputs.checkbox.title")}
          </CardTitle>
          <CardDescription>
            {t("settings.inputs.checkbox.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("settings.inputs.checkbox.title")}</Label>
            <GenericSelect
              type="single"
              value={settings.checkboxStyle}
              onValueChange={(value: string | string[]) => settings.setCheckboxStyle(value as CheckboxStyle)}
              options={checkboxStyles.map(style => ({
                value: style.value,
                label: `${style.name} - ${style.description}`
              }))}
              placeholder={t("settings.inputs.checkbox.description")}
              className="w-full"
            />
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("settings.inputs.preview")}</Label>
            <div className="p-4 border rounded-lg bg-muted/20">
              <CheckboxPreview design={settings.checkboxStyle} />
            </div>
          </div>

          {/* Style Gallery */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">{t("settings.inputs.checkbox.title")}</Label>
            {Object.entries(groupedCheckboxStyles).map(([category, styles]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {category}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {styles.map((style) => (
                    <div
                      key={style.value}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        settings.checkboxStyle === style.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                      onClick={() => settings.setCheckboxStyle(style.value)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{style.name}</span>
                          {settings.checkboxStyle === style.value && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{style.description}</p>
                        <CheckboxPreview design={style.value} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Radio Button Styles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="h-5 w-5 rounded-full border-2 border-primary bg-primary/20 flex items-center justify-center">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
            {t("settings.inputs.radio.title")}
          </CardTitle>
          <CardDescription>
            {t("settings.inputs.radio.description")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("settings.inputs.radio.title")}</Label>
            <GenericSelect
              type="single"
              value={settings.radioStyle}
              onValueChange={(value: string | string[]) => settings.setRadioStyle(value as RadioStyle)}
              options={radioStyles.map(style => ({
                value: style.value,
                label: `${style.name} - ${style.description}`
              }))}
              placeholder={t("settings.inputs.radio.description")}
              className="w-full"
            />
          </div>

          {/* Live Preview */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("settings.inputs.preview")}</Label>
            <div className="p-4 border rounded-lg bg-muted/20">
              <RadioPreview design={settings.radioStyle} />
            </div>
          </div>

          {/* Style Gallery */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">{t("settings.inputs.radio.title")}</Label>
            {Object.entries(groupedRadioStyles).map(([category, styles]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  {category}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {styles.map((style) => (
                    <div
                      key={style.value}
                      className={cn(
                        "p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md",
                        settings.radioStyle === style.value
                          ? "border-primary bg-primary/5 shadow-sm"
                          : "border-border bg-card hover:border-primary/50"
                      )}
                      onClick={() => settings.setRadioStyle(style.value)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{style.name}</span>
                          {settings.radioStyle === style.value && (
                            <div className="h-2 w-2 rounded-full bg-primary" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{style.description}</p>
                        <RadioPreview design={style.value} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.inputs.preview")}</CardTitle>
          <CardDescription>
            {t("settings.inputs.previewDescription")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Checkbox Demo */}
            <div className="space-y-4">
              <h4 className="font-medium">{t("settings.inputs.checkbox.title")}</h4>
              <div className="space-y-3 p-4 border rounded-lg bg-muted/20">
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
              <div className="p-4 border rounded-lg bg-muted/20">
                <RadioGroup
                  value={selectedRadioValue}
                  onValueChange={setSelectedRadioValue}
                  className="space-y-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem design={settings.radioStyle} value="option1" id="demo-radio-1" />
                    <Label htmlFor="demo-radio-1">Option 1</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem design={settings.radioStyle} value="option2" id="demo-radio-2" />
                    <Label htmlFor="demo-radio-2">Option 2</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem design={settings.radioStyle} value="option3" id="demo-radio-3" />
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
