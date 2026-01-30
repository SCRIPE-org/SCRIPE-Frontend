"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Check } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";

export function AppearanceTab() {
  const { t } = useI18n();
  const settings = useSettings();

  const colorThemes = [
    {
      value: "purple",
      name: t("settings.colors.purple"),
      color: "bg-purple-500",
      accent: "bg-purple-100",
    },
    {
      value: "blue",
      name: t("settings.colors.blue"),
      color: "bg-blue-500",
      accent: "bg-blue-100",
    },
    {
      value: "green",
      name: t("settings.colors.green"),
      color: "bg-green-500",
      accent: "bg-green-100",
    },
    {
      value: "orange",
      name: t("settings.colors.orange"),
      color: "bg-orange-500",
      accent: "bg-orange-100",
    },
    {
      value: "red",
      name: t("settings.colors.red"),
      color: "bg-red-500",
      accent: "bg-red-100",
    },
    {
      value: "teal",
      name: t("settings.colors.teal"),
      color: "bg-teal-500",
      accent: "bg-teal-100",
    },
    {
      value: "pink",
      name: t("settings.colors.pink"),
      color: "bg-pink-500",
      accent: "bg-pink-100",
    },
    {
      value: "indigo",
      name: t("settings.colors.indigo"),
      color: "bg-indigo-500",
      accent: "bg-indigo-100",
    },
    {
      value: "cyan",
      name: t("settings.colors.cyan"),
      color: "bg-cyan-500",
      accent: "bg-cyan-100",
    },
  ];

  // Light background themes
  const lightBackgroundThemes = [
    {
      value: "default",
      name: t("settings.lightBg.default"),
      gradient: "bg-gradient-to-br from-white to-gray-50",
    },
    {
      value: "warm",
      name: t("settings.lightBg.warm"),
      gradient: "bg-gradient-to-br from-orange-50 to-red-50",
    },
    {
      value: "cool",
      name: t("settings.lightBg.cool"),
      gradient: "bg-gradient-to-br from-blue-50 to-cyan-50",
    },
    {
      value: "neutral",
      name: t("settings.lightBg.neutral"),
      gradient: "bg-gradient-to-br from-gray-50 to-slate-50",
    },
    {
      value: "soft",
      name: t("settings.lightBg.soft"),
      gradient: "bg-gradient-to-br from-pink-50 to-purple-50",
    },
    {
      value: "cream",
      name: t("settings.lightBg.cream"),
      gradient: "bg-gradient-to-br from-yellow-50 to-orange-50",
    },
    {
      value: "mint",
      name: t("settings.lightBg.mint"),
      gradient: "bg-gradient-to-br from-green-50 to-emerald-50",
    },
    {
      value: "lavender",
      name: t("settings.lightBg.lavender"),
      gradient: "bg-gradient-to-br from-purple-50 to-indigo-50",
    },
    {
      value: "rose",
      name: t("settings.lightBg.rose"),
      gradient: "bg-gradient-to-br from-rose-50 to-pink-50",
    },
  ];

  // Dark background themes
  const darkBackgroundThemes = [
    {
      value: "default",
      name: t("settings.darkBg.default"),
      gradient: "bg-gradient-to-br from-gray-900 to-gray-800",
    },
    {
      value: "darker",
      name: t("settings.darkBg.darker"),
      gradient: "bg-gradient-to-br from-gray-950 to-gray-900",
    },
    {
      value: "pitch",
      name: t("settings.darkBg.pitch"),
      gradient: "bg-gradient-to-br from-black to-gray-950",
    },
    {
      value: "slate",
      name: t("settings.darkBg.slate"),
      gradient: "bg-gradient-to-br from-slate-900 to-slate-800",
    },
    {
      value: "warm-dark",
      name: t("settings.darkBg.warmDark"),
      gradient: "bg-gradient-to-br from-orange-950 to-red-950",
    },
    {
      value: "forest",
      name: t("settings.darkBg.forest"),
      gradient: "bg-gradient-to-br from-green-950 to-emerald-950",
    },
    {
      value: "ocean",
      name: t("settings.darkBg.ocean"),
      gradient: "bg-gradient-to-br from-blue-950 to-cyan-950",
    },
    {
      value: "purple-dark",
      name: t("settings.darkBg.purpleDark"),
      gradient: "bg-gradient-to-br from-purple-950 to-indigo-950",
    },
    {
      value: "crimson",
      name: t("settings.darkBg.crimson"),
      gradient: "bg-gradient-to-br from-red-950 to-rose-950",
    },
  ];
  const shadowOptions = [
    { value: "none", name: t("settings.shadow.none"), class: "shadow-none" },
    { value: "subtle", name: t("settings.shadow.subtle"), class: "shadow-sm" },
    {
      value: "moderate",
      name: t("settings.shadow.moderate"),
      class: "shadow-md",
    },
    { value: "strong", name: t("settings.shadow.strong"), class: "shadow-lg" },
  ];

  // Animation level options
  const animationOptions = [
    {
      value: "none",
      name: t("settings.animation.none"),
      description: t("settings.animation.noneDesc"),
    },
    {
      value: "minimal",
      name: t("settings.animation.minimal"),
      description: t("settings.animation.minimalDesc"),
    },
    {
      value: "moderate",
      name: t("settings.animation.moderate"),
      description: t("settings.animation.moderateDesc"),
    },
    {
      value: "high",
      name: t("settings.animation.high"),
      description: t("settings.animation.highDesc"),
    },
  ];
  return (
    <>
                {/* Color Themes */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.colorTheme.title")}</CardTitle>
                    <CardDescription>
                      {t("settings.colorTheme.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
                      {colorThemes.map((theme) => (
                        <div
                          key={theme.value}
                          className={cn(
                            "relative cursor-pointer rounded-lg border-2 p-3 transition-all hover:scale-105",
                            settings.colorTheme === theme.value
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() =>
                            settings.setColorTheme(theme.value as any)
                          }
                        >
                          <div className="space-y-2">
                            <div
                              className={cn("h-8 w-full rounded", theme.color)}
                            ></div>
                            <div
                              className={cn("h-2 w-full rounded", theme.accent)}
                            ></div>
                          </div>
                          <p className="mt-2 text-xs font-medium text-center">
                            {theme.name}
                          </p>
                          {settings.colorTheme === theme.value && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Light Background Themes */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.lightBackground.title")}</CardTitle>
                    <CardDescription>
                      {t("settings.lightBackground.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
                      {lightBackgroundThemes.map((theme) => (
                        <div
                          key={theme.value}
                          className={cn(
                            "relative cursor-pointer rounded-lg border-2 p-3 transition-all hover:scale-105",
                            settings.lightBackgroundTheme === theme.value
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() =>
                            settings.setLightBackgroundTheme(theme.value as any)
                          }
                        >
                          <div
                            className={cn(
                              "h-12 w-full rounded",
                              theme.gradient
                            )}
                          ></div>
                          <p className="mt-2 text-xs font-medium text-center">
                            {theme.name}
                          </p>
                          {settings.lightBackgroundTheme === theme.value && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Dark Background Themes */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.darkBackground.title")}</CardTitle>
                    <CardDescription>
                      {t("settings.darkBackground.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
                      {darkBackgroundThemes.map((theme) => (
                        <div
                          key={theme.value}
                          className={cn(
                            "relative cursor-pointer rounded-lg border-2 p-3 transition-all hover:scale-105",
                            settings.darkBackgroundTheme === theme.value
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() =>
                            settings.setDarkBackgroundTheme(theme.value as any)
                          }
                        >
                          <div
                            className={cn(
                              "h-12 w-full rounded",
                              theme.gradient
                            )}
                          ></div>
                          <p className="mt-2 text-xs font-medium text-center text-white">
                            {theme.name}
                          </p>
                          {settings.darkBackgroundTheme === theme.value && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Shadow Intensity */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.shadowIntensity.title")}</CardTitle>
                    <CardDescription>
                      {t("settings.shadowIntensity.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {shadowOptions.map((shadow) => (
                        <div
                          key={shadow.value}
                          className={cn(
                            "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                            settings.shadowIntensity === shadow.value
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() =>
                            settings.setShadowIntensity(shadow.value as any)
                          }
                        >
                          <div
                            className={cn(
                              "h-12 bg-card rounded-lg",
                              shadow.class
                            )}
                          ></div>
                          <p className="mt-2 text-sm font-medium text-center">
                            {shadow.name}
                          </p>
                          {settings.shadowIntensity === shadow.value && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Animation Level */}
                <Card>
                  <CardHeader>
                    <CardTitle>{t("settings.animationLevel.title")}</CardTitle>
                    <CardDescription>
                      {t("settings.animationLevel.description")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {animationOptions.map((animation) => (
                        <div
                          key={animation.value}
                          className={cn(
                            "relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:scale-105",
                            settings.animationLevel === animation.value
                              ? "border-primary ring-2 ring-primary/20"
                              : "border-muted hover:border-muted-foreground/50"
                          )}
                          onClick={() =>
                            settings.setAnimationLevel(animation.value as any)
                          }
                        >
                          <div className="space-y-2">
                            <h4 className="font-semibold">{animation.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {animation.description}
                            </p>
                            <div
                              className={cn(
                                "h-2 bg-primary rounded",
                                animation.value === "high" && "animate-pulse",
                                animation.value === "moderate" &&
                                "transition-all duration-300"
                              )}
                            ></div>
                          </div>
                          {settings.animationLevel === animation.value && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-primary rounded-full flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

    </>
  );
}
