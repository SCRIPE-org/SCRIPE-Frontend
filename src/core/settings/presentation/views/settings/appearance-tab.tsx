"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Palette, Sun, Moon, Sparkles, Pipette, Layers, Wand2, Check } from "lucide-react";
import type { BackgroundMode } from "@core/providers/settings-provider";

import { ColorsSubtab } from "./appearance-tab/colors-subtab";
import { LightBackgroundsSubtab } from "./appearance-tab/light-backgrounds-subtab";
import { DarkBackgroundsSubtab } from "./appearance-tab/dark-backgrounds-subtab";
import { GradientsSubtab } from "./appearance-tab/gradients-subtab";
import { CustomColorsSubtab } from "./appearance-tab/custom-colors-subtab";
import { PalettesSubtab } from "./appearance-tab/palettes-subtab";
import { EffectsSubtab } from "./appearance-tab/effects-subtab";

const BG_MODES: { value: BackgroundMode; icon: string; labelKey: string; descKey: string }[] = [
  { value: "preset", icon: "🎨", labelKey: "settings.bgMode.preset", descKey: "settings.bgMode.presetDesc" },
  { value: "gradient", icon: "🌈", labelKey: "settings.bgMode.gradient", descKey: "settings.bgMode.gradientDesc" },
  { value: "custom", icon: "🎯", labelKey: "settings.bgMode.custom", descKey: "settings.bgMode.customDesc" },
];

export function AppearanceTab() {
  const { t } = useI18n();
  const settings = useSettings();

  const tabs = [
    { key: "colors", label: t("settings.appearanceTabs.colors"), icon: Palette },
    { key: "light-bg", label: t("settings.appearanceTabs.lightBg"), icon: Sun },
    { key: "dark-bg", label: t("settings.appearanceTabs.darkBg"), icon: Moon },
    { key: "gradients", label: t("settings.appearanceTabs.gradients"), icon: Sparkles },
    { key: "custom", label: t("settings.appearanceTabs.custom"), icon: Pipette },
    { key: "palettes", label: t("settings.appearanceTabs.palettes"), icon: Layers },
    { key: "effects", label: t("settings.appearanceTabs.effects"), icon: Wand2 },
  ];

  return (
    <div className="space-y-6">
      {/* Background Mode Selector */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.bgMode.title")}</CardTitle>
          <CardDescription>{t("settings.bgMode.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {BG_MODES.map((mode) => (
              <button
                key={mode.value}
                className={cn(
                  "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:scale-[1.02]",
                  settings.backgroundMode === mode.value
                    ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                    : "border-muted hover:border-muted-foreground/30"
                )}
                onClick={() => settings.setBackgroundMode(mode.value)}
              >
                <span className="text-2xl">{mode.icon}</span>
                <span className="text-sm font-semibold">{t(mode.labelKey)}</span>
                <span className="text-[11px] text-muted-foreground text-center leading-tight">{t(mode.descKey)}</span>
                {settings.backgroundMode === mode.value && (
                  <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sub-Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.appearanceSettings.title")}</CardTitle>
          <CardDescription>{t("settings.appearanceSettings.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colors" className="space-y-6">
            <TabsList className="flex flex-wrap h-auto gap-1 bg-muted/50 p-1 rounded-xl">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="relative rounded-lg text-xs sm:text-sm px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm flex items-center gap-1.5"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value="colors">
              <ColorsSubtab />
            </TabsContent>
            <TabsContent value="light-bg">
              <LightBackgroundsSubtab />
            </TabsContent>
            <TabsContent value="dark-bg">
              <DarkBackgroundsSubtab />
            </TabsContent>
            <TabsContent value="gradients">
              <GradientsSubtab />
            </TabsContent>
            <TabsContent value="custom">
              <CustomColorsSubtab />
            </TabsContent>
            <TabsContent value="palettes">
              <PalettesSubtab />
            </TabsContent>
            <TabsContent value="effects">
              <EffectsSubtab />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
