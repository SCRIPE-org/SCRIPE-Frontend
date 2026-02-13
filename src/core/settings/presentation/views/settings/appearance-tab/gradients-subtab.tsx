"use client";

import { useState, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Check, ArrowUp, ArrowUpRight, ArrowRight, ArrowDownRight, ArrowDown, ArrowDownLeft, ArrowLeft, ArrowUpLeft, Pipette } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type { GradientDirection, LightGradientTheme, DarkGradientTheme } from "@core/providers/settings-provider";

const DIRECTIONS: { value: GradientDirection; label: string; icon: typeof ArrowUp }[] = [
      { value: "to-t", label: "↑ Top", icon: ArrowUp },
      { value: "to-tr", label: "↗ Top Right", icon: ArrowUpRight },
      { value: "to-r", label: "→ Right", icon: ArrowRight },
      { value: "to-br", label: "↘ Bottom Right", icon: ArrowDownRight },
      { value: "to-b", label: "↓ Bottom", icon: ArrowDown },
      { value: "to-bl", label: "↙ Bottom Left", icon: ArrowDownLeft },
      { value: "to-l", label: "← Left", icon: ArrowLeft },
      { value: "to-tl", label: "↖ Top Left", icon: ArrowUpLeft },
];

const LIGHT_GRADIENTS: { value: LightGradientTheme; from: string; to: string }[] = [
      { value: "none", from: "bg-white", to: "bg-gray-50" },
      { value: "sunrise", from: "bg-orange-100", to: "bg-rose-100" },
      { value: "ocean-breeze", from: "bg-blue-100", to: "bg-teal-100" },
      { value: "lavender-mist", from: "bg-purple-100", to: "bg-indigo-100" },
      { value: "meadow", from: "bg-green-100", to: "bg-lime-100" },
      { value: "peach-glow", from: "bg-orange-100", to: "bg-amber-100" },
      { value: "sky-wash", from: "bg-sky-100", to: "bg-blue-100" },
      { value: "cotton-candy", from: "bg-pink-100", to: "bg-sky-100" },
      { value: "lemonade", from: "bg-yellow-100", to: "bg-lime-100" },
      { value: "seafoam", from: "bg-emerald-100", to: "bg-cyan-100" },
      { value: "blush", from: "bg-rose-100", to: "bg-pink-50" },
      { value: "arctic", from: "bg-cyan-100", to: "bg-slate-50" },
      { value: "golden-hour", from: "bg-amber-100", to: "bg-orange-100" },
];

const DARK_GRADIENTS: { value: DarkGradientTheme; from: string; to: string }[] = [
      { value: "none", from: "bg-gray-900", to: "bg-gray-800" },
      { value: "midnight-blue", from: "bg-blue-950", to: "bg-indigo-900" },
      { value: "aurora", from: "bg-emerald-950", to: "bg-violet-900" },
      { value: "deep-space", from: "bg-slate-950", to: "bg-purple-950" },
      { value: "ember", from: "bg-red-950", to: "bg-orange-900" },
      { value: "twilight", from: "bg-purple-950", to: "bg-pink-900" },
      { value: "neon-noir", from: "bg-black", to: "bg-violet-950" },
      { value: "volcanic-ash", from: "bg-red-950", to: "bg-rose-900" },
      { value: "northern-lights", from: "bg-teal-950", to: "bg-purple-900" },
      { value: "abyss", from: "bg-blue-950", to: "bg-cyan-900" },
      { value: "cyber-punk", from: "bg-fuchsia-950", to: "bg-cyan-900" },
      { value: "dark-forest", from: "bg-green-950", to: "bg-emerald-900" },
      { value: "nebula", from: "bg-purple-950", to: "bg-pink-900" },
];

export function GradientsSubtab() {
      const { t } = useI18n();
      const settings = useSettings();

      const isGradientMode = settings.backgroundMode === "gradient";

      return (
            <div className="space-y-6">
                  {/* Mode hint */}
                  {!isGradientMode && (
                        <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                              <p className="text-sm text-amber-700 dark:text-amber-300">
                                    ⚠️ {t("settings.gradientWarning")}
                              </p>
                              <button
                                    className="mt-2 text-xs font-medium text-primary hover:underline"
                                    onClick={() => settings.setBackgroundMode("gradient")}
                              >
                                    {t("settings.switchToGradient")}
                              </button>
                        </div>
                  )}

                  {/* Custom Gradient Colors */}
                  <Card>
                        <CardHeader>
                              <CardTitle className="text-base flex items-center gap-2">
                                    <Pipette className="w-4 h-4 text-primary" />
                                    {t("settings.gradient.customColors")}
                              </CardTitle>
                              <CardDescription>{t("settings.gradient.customColorsDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                              <div className="space-y-4">
                                    <div className="flex flex-col sm:flex-row gap-4">
                                          {/* Start Color */}
                                          <div className="flex-1 space-y-2">
                                                <label className="text-sm font-medium text-foreground">
                                                      {t("settings.gradient.startColor")}
                                                </label>
                                                <div className="flex items-center gap-3">
                                                      <input
                                                            type="color"
                                                            value={settings.gradientStartColor || "#6366f1"}
                                                            onChange={(e) => settings.setGradientStartColor(e.target.value)}
                                                            className="w-12 h-12 rounded-xl border-2 border-muted cursor-pointer hover:border-primary transition-colors [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-lg"
                                                      />
                                                      <input
                                                            type="text"
                                                            value={settings.gradientStartColor || ""}
                                                            onChange={(e) => settings.setGradientStartColor(e.target.value)}
                                                            placeholder="#6366f1"
                                                            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                      />
                                                </div>
                                          </div>

                                          {/* End Color */}
                                          <div className="flex-1 space-y-2">
                                                <label className="text-sm font-medium text-foreground">
                                                      {t("settings.gradient.endColor")}
                                                </label>
                                                <div className="flex items-center gap-3">
                                                      <input
                                                            type="color"
                                                            value={settings.gradientEndColor || "#8b5cf6"}
                                                            onChange={(e) => settings.setGradientEndColor(e.target.value)}
                                                            className="w-12 h-12 rounded-xl border-2 border-muted cursor-pointer hover:border-primary transition-colors [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-lg"
                                                      />
                                                      <input
                                                            type="text"
                                                            value={settings.gradientEndColor || ""}
                                                            onChange={(e) => settings.setGradientEndColor(e.target.value)}
                                                            placeholder="#8b5cf6"
                                                            className="flex-1 px-3 py-2 rounded-lg border border-input bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
                                                      />
                                                </div>
                                          </div>
                                    </div>

                                    {/* Live Preview */}
                                    {settings.gradientStartColor && settings.gradientEndColor && (
                                          <div className="space-y-2">
                                                <span className="text-xs font-medium text-muted-foreground">{t("settings.gradient.preview")}</span>
                                                <div
                                                      className="w-full h-16 rounded-xl border border-border shadow-sm"
                                                      style={{
                                                            background: `linear-gradient(${{ "to-t": "0deg", "to-tr": "45deg", "to-r": "90deg", "to-br": "135deg", "to-b": "180deg", "to-bl": "225deg", "to-l": "270deg", "to-tl": "315deg" }[settings.gradientDirection] || "135deg"
                                                                  }, ${settings.gradientStartColor}, ${settings.gradientEndColor})`,
                                                      }}
                                                />
                                          </div>
                                    )}

                                    {/* Clear custom */}
                                    {(settings.gradientStartColor || settings.gradientEndColor) && (
                                          <button
                                                onClick={() => {
                                                      settings.setGradientStartColor("");
                                                      settings.setGradientEndColor("");
                                                }}
                                                className="text-xs font-medium text-destructive hover:underline"
                                          >
                                                {t("settings.gradient.clearCustom")}
                                          </button>
                                    )}
                              </div>
                        </CardContent>
                  </Card>

                  {/* Direction Picker */}
                  <Card>
                        <CardHeader>
                              <CardTitle className="text-base">{t("settings.appearanceSettings.gradientDirection")}</CardTitle>
                              <CardDescription>{t("settings.appearanceSettings.gradientDirectionDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                              <div className="flex items-center justify-center">
                                    <div className="grid grid-cols-3 gap-2 w-fit">
                                          {[
                                                ["to-tl", "to-t", "to-tr"],
                                                ["to-l", null, "to-r"],
                                                ["to-bl", "to-b", "to-br"],
                                          ].map((row, ri) => (
                                                <div key={ri} className="contents">
                                                      {row.map((dir, ci) => {
                                                            if (!dir) {
                                                                  return (
                                                                        <div
                                                                              key={`${ri}-${ci}`}
                                                                              className="w-12 h-12 rounded-lg bg-muted/30 flex items-center justify-center"
                                                                        >
                                                                              <div className="w-3 h-3 rounded-full bg-primary" />
                                                                        </div>
                                                                  );
                                                            }
                                                            const dirInfo = DIRECTIONS.find((d) => d.value === dir)!;
                                                            const Icon = dirInfo.icon;
                                                            return (
                                                                  <button
                                                                        key={dir}
                                                                        className={cn(
                                                                              "w-12 h-12 rounded-lg border-2 flex items-center justify-center transition-all hover:scale-110",
                                                                              settings.gradientDirection === dir
                                                                                    ? "border-primary bg-primary/10 text-primary"
                                                                                    : "border-muted hover:border-muted-foreground/30 text-muted-foreground"
                                                                        )}
                                                                        onClick={() => settings.setGradientDirection(dir as GradientDirection)}
                                                                  >
                                                                        <Icon className="w-5 h-5" />
                                                                  </button>
                                                            );
                                                      })}
                                                </div>
                                          ))}
                                    </div>
                              </div>
                        </CardContent>
                  </Card>

                  {/* Light Gradient Presets */}
                  <Card>
                        <CardHeader>
                              <CardTitle className="text-base">{t("settings.appearanceSettings.lightGradients")}</CardTitle>
                              <CardDescription>{t("settings.appearanceSettings.lightGradientsDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {LIGHT_GRADIENTS.map((g) => (
                                          <button
                                                key={g.value}
                                                className={cn(
                                                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:scale-[1.03]",
                                                      settings.lightGradientTheme === g.value
                                                            ? "border-primary shadow-md ring-2 ring-primary/20"
                                                            : "border-transparent hover:border-muted-foreground/20"
                                                )}
                                                onClick={() => {
                                                      settings.setLightGradientTheme(g.value);
                                                      // Clear custom gradient when selecting preset
                                                      settings.setGradientStartColor("");
                                                      settings.setGradientEndColor("");
                                                }}
                                          >
                                                <div className="w-full h-10 rounded-lg border border-gray-200/60 relative overflow-hidden flex">
                                                      <div className={cn("w-1/2 h-full", g.from)} />
                                                      <div className={cn("w-1/2 h-full", g.to)} />
                                                </div>
                                                <span className="text-[10px] font-medium text-muted-foreground truncate max-w-full">
                                                      {t(`settings.lightGradient.${g.value}`)}
                                                </span>
                                          </button>
                                    ))}
                              </div>
                        </CardContent>
                  </Card>

                  {/* Dark Gradient Presets */}
                  <Card>
                        <CardHeader>
                              <CardTitle className="text-base">{t("settings.appearanceSettings.darkGradients")}</CardTitle>
                              <CardDescription>{t("settings.appearanceSettings.darkGradientsDesc")}</CardDescription>
                        </CardHeader>
                        <CardContent>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {DARK_GRADIENTS.map((g) => (
                                          <button
                                                key={g.value}
                                                className={cn(
                                                      "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all hover:scale-[1.03]",
                                                      settings.darkGradientTheme === g.value
                                                            ? "border-primary shadow-md ring-2 ring-primary/20"
                                                            : "border-transparent hover:border-muted-foreground/20"
                                                )}
                                                onClick={() => {
                                                      settings.setDarkGradientTheme(g.value);
                                                      // Clear custom gradient when selecting preset
                                                      settings.setGradientStartColor("");
                                                      settings.setGradientEndColor("");
                                                }}
                                          >
                                                <div className="w-full h-10 rounded-lg border border-gray-700/40 relative overflow-hidden flex">
                                                      <div className={cn("w-1/2 h-full", g.from)} />
                                                      <div className={cn("w-1/2 h-full", g.to)} />
                                                </div>
                                                <span className="text-[10px] font-medium text-muted-foreground truncate max-w-full">
                                                      {t(`settings.darkGradient.${g.value}`)}
                                                </span>
                                          </button>
                                    ))}
                              </div>
                        </CardContent>
                  </Card>
            </div>
      );
}
