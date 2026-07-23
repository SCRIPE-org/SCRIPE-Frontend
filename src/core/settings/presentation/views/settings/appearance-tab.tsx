"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { Palette, Sun, Moon, Sparkles, Layers, Wand2 } from "lucide-react";
import type { BackgroundMode } from "@core/providers/settings-provider";
import { ModePicker, type ModeOption } from "@core/settings/components/shared";

import { ColorsSubtab } from "./appearance-tab/colors-subtab";
import { LightBackgroundsSubtab } from "./appearance-tab/light-backgrounds-subtab";
import { DarkBackgroundsSubtab } from "./appearance-tab/dark-backgrounds-subtab";
import { GradientsSubtab } from "./appearance-tab/gradients-subtab";
import { PalettesSubtab } from "./appearance-tab/palettes-subtab";
import { EffectsSubtab } from "./appearance-tab/effects-subtab";

// Wave C: the "custom" background mode (and its colour-picker subtab) was
// retired — nothing consumed the custom colour vars. Stored "custom" values
// resolve to "preset" via the merge-engine migration.
const BG_MODES: ModeOption<BackgroundMode>[] = [
  {
    value: "preset",
    icon: "🎨",
    label: "settings.bgMode.preset",
    description: "settings.bgMode.presetDesc",
  },
  {
    value: "gradient",
    icon: "🌈",
    label: "settings.bgMode.gradient",
    description: "settings.bgMode.gradientDesc",
  },
];

export function AppearanceTab() {
  const { t } = useI18n();
  const settings = useSettings();

  // Translate the mode options
  const translatedModes: ModeOption<BackgroundMode>[] = BG_MODES.map((m) => ({
    ...m,
    label: t(m.label),
    description: t(m.description),
  }));

  const tabs = [
    { key: "colors", label: t("settings.appearanceTabs.colors"), icon: Palette },
    { key: "light-bg", label: t("settings.appearanceTabs.lightBg"), icon: Sun },
    { key: "dark-bg", label: t("settings.appearanceTabs.darkBg"), icon: Moon },
    { key: "gradients", label: t("settings.appearanceTabs.gradients"), icon: Sparkles },
    { key: "palettes", label: t("settings.appearanceTabs.palettes"), icon: Layers },
    { key: "effects", label: t("settings.appearanceTabs.effects"), icon: Wand2 },
  ];

  return (
    <div className="space-y-6">
      {/* Background Mode Selector — uses shared ModePicker */}
      <ModePicker<BackgroundMode>
        title={t("settings.bgMode.title")}
        description={t("settings.bgMode.description")}
        modes={translatedModes}
        selected={settings.backgroundMode}
        onSelect={settings.setBackgroundMode}
      />

      {/* Sub-Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>{t("settings.appearanceSettings.title")}</CardTitle>
          <CardDescription>{t("settings.appearanceSettings.description")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="colors" className="space-y-6">
            <TabsList className="flex h-auto flex-wrap gap-1 rounded-xl bg-muted/50 p-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger
                    key={tab.key}
                    value={tab.key}
                    className="relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs data-[state=active]:bg-background data-[state=active]:shadow-sm sm:text-sm"
                  >
                    <Icon className="h-3.5 w-3.5" />
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
