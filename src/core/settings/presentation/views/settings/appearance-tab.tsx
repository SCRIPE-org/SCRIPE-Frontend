"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@core/ui/tabs";
import { useI18n } from "@core/providers/i18n-provider";
import { Palette, Sun, Moon, Sparkles, Pipette, Layers, Wand2 } from "lucide-react";

import { ColorsSubtab } from "./appearance-tab/colors-subtab";
import { LightBackgroundsSubtab } from "./appearance-tab/light-backgrounds-subtab";
import { DarkBackgroundsSubtab } from "./appearance-tab/dark-backgrounds-subtab";
import { GradientsSubtab } from "./appearance-tab/gradients-subtab";
import { CustomColorsSubtab } from "./appearance-tab/custom-colors-subtab";
import { PalettesSubtab } from "./appearance-tab/palettes-subtab";
import { EffectsSubtab } from "./appearance-tab/effects-subtab";

export function AppearanceTab() {
  const { t } = useI18n();

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
  );
}
