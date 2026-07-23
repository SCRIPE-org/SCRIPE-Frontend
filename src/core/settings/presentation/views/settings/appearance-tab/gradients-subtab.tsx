"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import {
  ArrowUp,
  ArrowUpRight,
  ArrowRight,
  ArrowDownRight,
  ArrowDown,
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpLeft,
  Pipette,
} from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type {
  GradientDirection,
  LightGradientTheme,
  DarkGradientTheme,
} from "@core/providers/settings-provider";

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

// Wave C: the retired emerald-violet preset is no longer offered; a stored
// value keeps applying (the theme still exists in CSS) but cannot be
// re-selected.
const DARK_GRADIENTS: { value: DarkGradientTheme; from: string; to: string }[] = [
  { value: "none", from: "bg-gray-900", to: "bg-gray-800" },
  { value: "midnight-blue", from: "bg-blue-950", to: "bg-indigo-900" },
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
        <div className="rounded-lg border border-warning/30 bg-warning/10 p-3">
          <p className="text-sm text-warning">
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
          <CardTitle className="flex items-center gap-2 text-base">
            <Pipette className="h-4 w-4 text-primary" />
            {t("settings.gradient.customColors")}
          </CardTitle>
          <CardDescription>{t("settings.gradient.customColorsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row">
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
                    className="h-12 w-12 cursor-pointer rounded-xl border-2 border-muted transition-colors hover:border-primary [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-lg"
                  />
                  <input
                    type="text"
                    value={settings.gradientStartColor || ""}
                    onChange={(e) => settings.setGradientStartColor(e.target.value)}
                    placeholder="#6366f1"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
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
                    className="h-12 w-12 cursor-pointer rounded-xl border-2 border-muted transition-colors hover:border-primary [&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-lg"
                  />
                  <input
                    type="text"
                    value={settings.gradientEndColor || ""}
                    onChange={(e) => settings.setGradientEndColor(e.target.value)}
                    placeholder="#8b5cf6"
                    className="flex-1 rounded-lg border border-input bg-background px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </div>
            </div>

            {/* Live Preview */}
            {settings.gradientStartColor && settings.gradientEndColor && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground">
                  {t("settings.gradient.preview")}
                </span>
                <div
                  className="h-16 w-full rounded-xl border border-border shadow-sm"
                  style={{
                    background: `linear-gradient(${
                      {
                        "to-t": "0deg",
                        "to-tr": "45deg",
                        "to-r": "90deg",
                        "to-br": "135deg",
                        "to-b": "180deg",
                        "to-bl": "225deg",
                        "to-l": "270deg",
                        "to-tl": "315deg",
                      }[settings.gradientDirection] || "135deg"
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
          <CardTitle className="text-base">
            {t("settings.appearanceSettings.gradientDirection")}
          </CardTitle>
          <CardDescription>
            {t("settings.appearanceSettings.gradientDirectionDesc")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="grid w-fit grid-cols-3 gap-2">
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
                          className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted/30"
                        >
                          <div className="h-3 w-3 rounded-full bg-primary" />
                        </div>
                      );
                    }
                    const dirInfo = DIRECTIONS.find((d) => d.value === dir)!;
                    const Icon = dirInfo.icon;
                    return (
                      <button
                        key={dir}
                        className={cn(
                          "flex h-12 w-12 items-center justify-center rounded-lg border-2 transition-all hover:scale-110",
                          settings.gradientDirection === dir
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-muted text-muted-foreground hover:border-muted-foreground/30"
                        )}
                        onClick={() => settings.setGradientDirection(dir as GradientDirection)}
                      >
                        <Icon className="h-5 w-5" />
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
          <CardTitle className="text-base">
            {t("settings.appearanceSettings.lightGradients")}
          </CardTitle>
          <CardDescription>{t("settings.appearanceSettings.lightGradientsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {LIGHT_GRADIENTS.map((g) => (
              <button
                key={g.value}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all hover:scale-[1.03]",
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
                <div className="relative flex h-10 w-full overflow-hidden rounded-lg border border-gray-200/60">
                  <div className={cn("h-full w-1/2", g.from)} />
                  <div className={cn("h-full w-1/2", g.to)} />
                </div>
                <span className="max-w-full truncate text-[10px] font-medium text-muted-foreground">
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
          <CardTitle className="text-base">
            {t("settings.appearanceSettings.darkGradients")}
          </CardTitle>
          <CardDescription>{t("settings.appearanceSettings.darkGradientsDesc")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {DARK_GRADIENTS.map((g) => (
              <button
                key={g.value}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all hover:scale-[1.03]",
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
                <div className="relative flex h-10 w-full overflow-hidden rounded-lg border border-gray-700/40">
                  <div className={cn("h-full w-1/2", g.from)} />
                  <div className={cn("h-full w-1/2", g.to)} />
                </div>
                <span className="max-w-full truncate text-[10px] font-medium text-muted-foreground">
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
