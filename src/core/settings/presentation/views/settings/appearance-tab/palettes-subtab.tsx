"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Check, Sparkles } from "lucide-react";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import type {
  ColorTheme,
  SecondaryColorTheme,
  LightBackgroundTheme,
  DarkBackgroundTheme,
} from "@core/providers/settings-provider";

interface Palette {
  id: string;
  primary: ColorTheme;
  secondary: SecondaryColorTheme;
  lightBg: LightBackgroundTheme;
  darkBg: DarkBackgroundTheme;
  primaryColor: string;
  secondaryColor: string;
  lightGrad: string;
  darkGrad: string;
}

const PALETTES: Palette[] = [
  {
    id: "ocean-breeze",
    primary: "blue",
    secondary: "cyan",
    lightBg: "sky",
    darkBg: "navy",
    primaryColor: "bg-blue-500",
    secondaryColor: "bg-cyan-500",
    lightGrad: "bg-gradient-to-br from-sky-50 to-blue-50",
    darkGrad: "bg-gradient-to-br from-blue-950 to-sky-950",
  },
  {
    id: "midnight-garden",
    primary: "purple",
    secondary: "emerald",
    lightBg: "lavender",
    darkBg: "midnight",
    primaryColor: "bg-purple-500",
    secondaryColor: "bg-emerald-500",
    lightGrad: "bg-gradient-to-br from-purple-50 to-indigo-50",
    darkGrad: "bg-gradient-to-br from-blue-950 to-indigo-950",
  },
  {
    id: "sunset-horizon",
    primary: "orange",
    secondary: "rose",
    lightBg: "cream",
    darkBg: "volcanic",
    primaryColor: "bg-orange-500",
    secondaryColor: "bg-rose-500",
    lightGrad: "bg-gradient-to-br from-yellow-50 to-orange-50",
    darkGrad: "bg-gradient-to-br from-red-950 to-orange-950",
  },
  {
    id: "arctic-frost",
    primary: "sky",
    secondary: "slate",
    lightBg: "snow",
    darkBg: "obsidian",
    primaryColor: "bg-sky-500",
    secondaryColor: "bg-slate-500",
    lightGrad: "bg-gradient-to-br from-white to-slate-50",
    darkGrad: "bg-gradient-to-br from-violet-950 to-purple-950",
  },
  {
    id: "corporate-classic",
    primary: "blue",
    secondary: "slate",
    lightBg: "default",
    darkBg: "slate",
    primaryColor: "bg-blue-500",
    secondaryColor: "bg-slate-500",
    lightGrad: "bg-gradient-to-br from-white to-gray-50",
    darkGrad: "bg-gradient-to-br from-slate-900 to-slate-800",
  },
  {
    id: "forest-canopy",
    primary: "emerald",
    secondary: "lime",
    lightBg: "mint",
    darkBg: "forest",
    primaryColor: "bg-emerald-500",
    secondaryColor: "bg-lime-500",
    lightGrad: "bg-gradient-to-br from-green-50 to-emerald-50",
    darkGrad: "bg-gradient-to-br from-green-950 to-emerald-950",
  },
  {
    id: "royal-jewels",
    primary: "violet",
    secondary: "gold",
    lightBg: "lavender",
    darkBg: "purple-dark",
    primaryColor: "bg-violet-500",
    secondaryColor: "bg-yellow-500",
    lightGrad: "bg-gradient-to-br from-purple-50 to-indigo-50",
    darkGrad: "bg-gradient-to-br from-purple-950 to-indigo-950",
  },
  {
    id: "warm-earth",
    primary: "coral",
    secondary: "amber",
    lightBg: "linen",
    darkBg: "charcoal",
    primaryColor: "bg-orange-400",
    secondaryColor: "bg-amber-500",
    lightGrad: "bg-gradient-to-br from-orange-50 to-amber-50",
    darkGrad: "bg-gradient-to-br from-neutral-900 to-neutral-800",
  },
  {
    id: "neon-city",
    primary: "fuchsia",
    secondary: "cyan",
    lightBg: "cloud",
    darkBg: "onyx",
    primaryColor: "bg-fuchsia-500",
    secondaryColor: "bg-cyan-500",
    lightGrad: "bg-gradient-to-br from-indigo-50 to-blue-50",
    darkGrad: "bg-gradient-to-br from-black to-neutral-950",
  },
  {
    id: "mono-elegance",
    primary: "zinc",
    secondary: "stone",
    lightBg: "pearl",
    darkBg: "graphite",
    primaryColor: "bg-zinc-500",
    secondaryColor: "bg-stone-500",
    lightGrad: "bg-gradient-to-br from-slate-50 to-gray-100",
    darkGrad: "bg-gradient-to-br from-zinc-800 to-zinc-700",
  },
  {
    id: "cherry-blossom",
    primary: "pink",
    secondary: "rose",
    lightBg: "rose",
    darkBg: "crimson",
    primaryColor: "bg-pink-500",
    secondaryColor: "bg-rose-500",
    lightGrad: "bg-gradient-to-br from-rose-50 to-pink-50",
    darkGrad: "bg-gradient-to-br from-red-950 to-rose-950",
  },
  {
    id: "tropical-paradise",
    primary: "teal",
    secondary: "amber",
    lightBg: "ice",
    darkBg: "ocean",
    primaryColor: "bg-teal-500",
    secondaryColor: "bg-amber-500",
    lightGrad: "bg-gradient-to-br from-cyan-50 to-sky-50",
    darkGrad: "bg-gradient-to-br from-blue-950 to-cyan-950",
  },
  {
    id: "crimson-gold",
    primary: "red",
    secondary: "gold",
    lightBg: "warm",
    darkBg: "warm-dark",
    primaryColor: "bg-red-500",
    secondaryColor: "bg-yellow-500",
    lightGrad: "bg-gradient-to-br from-orange-50 to-red-50",
    darkGrad: "bg-gradient-to-br from-orange-950 to-red-950",
  },
  {
    id: "deep-indigo",
    primary: "indigo",
    secondary: "violet",
    lightBg: "cool",
    darkBg: "midnight",
    primaryColor: "bg-indigo-500",
    secondaryColor: "bg-violet-500",
    lightGrad: "bg-gradient-to-br from-blue-50 to-cyan-50",
    darkGrad: "bg-gradient-to-br from-blue-950 to-indigo-950",
  },
  {
    id: "emerald-luxe",
    primary: "emerald",
    secondary: "gold",
    lightBg: "sand",
    darkBg: "default",
    primaryColor: "bg-emerald-500",
    secondaryColor: "bg-yellow-500",
    lightGrad: "bg-gradient-to-br from-amber-50 to-yellow-50",
    darkGrad: "bg-gradient-to-br from-gray-900 to-gray-800",
  },
  {
    id: "pastel-dream",
    primary: "pink",
    secondary: "sky",
    lightBg: "soft",
    darkBg: "darker",
    primaryColor: "bg-pink-500",
    secondaryColor: "bg-sky-500",
    lightGrad: "bg-gradient-to-br from-pink-50 to-purple-50",
    darkGrad: "bg-gradient-to-br from-gray-950 to-gray-900",
  },
  {
    id: "autumn-harvest",
    primary: "amber",
    secondary: "red",
    lightBg: "cream",
    darkBg: "warm-dark",
    primaryColor: "bg-amber-500",
    secondaryColor: "bg-red-500",
    lightGrad: "bg-gradient-to-br from-yellow-50 to-orange-50",
    darkGrad: "bg-gradient-to-br from-orange-950 to-red-950",
  },
  {
    id: "nordic-frost",
    primary: "cyan",
    secondary: "blue",
    lightBg: "ice",
    darkBg: "slate",
    primaryColor: "bg-cyan-500",
    secondaryColor: "bg-blue-500",
    lightGrad: "bg-gradient-to-br from-cyan-50 to-sky-50",
    darkGrad: "bg-gradient-to-br from-slate-900 to-slate-800",
  },
  {
    id: "lavender-haze",
    primary: "violet",
    secondary: "fuchsia",
    lightBg: "lavender",
    darkBg: "obsidian",
    primaryColor: "bg-violet-500",
    secondaryColor: "bg-fuchsia-500",
    lightGrad: "bg-gradient-to-br from-purple-50 to-indigo-50",
    darkGrad: "bg-gradient-to-br from-violet-950 to-purple-950",
  },
  {
    id: "minimalist",
    primary: "stone",
    secondary: "zinc",
    lightBg: "neutral",
    darkBg: "pitch",
    primaryColor: "bg-stone-500",
    secondaryColor: "bg-zinc-500",
    lightGrad: "bg-gradient-to-br from-gray-50 to-slate-50",
    darkGrad: "bg-gradient-to-br from-black to-gray-950",
  },
];

export function PalettesSubtab() {
  const { t } = useI18n();
  const settings = useSettings();

  const applyPalette = (palette: Palette) => {
    settings.setColorTheme(palette.primary);
    settings.setSecondaryColorTheme(palette.secondary);
    settings.setLightBackgroundTheme(palette.lightBg);
    settings.setDarkBackgroundTheme(palette.darkBg);
    settings.setActivePalette(palette.id);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-muted bg-muted/50 p-3">
        <p className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          {t("settings.appearanceSettings.palettesInfo")}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PALETTES.map((palette) => {
          const isActive = settings.activePalette === palette.id;
          return (
            <button
              key={palette.id}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-xl border-2 transition-all hover:scale-[1.02] hover:shadow-lg",
                isActive
                  ? "border-primary shadow-md ring-2 ring-primary/20"
                  : "border-muted hover:border-muted-foreground/30"
              )}
              onClick={() => applyPalette(palette)}
            >
              {/* Preview header */}
              <div className="flex h-14">
                <div className={cn("w-1/2", palette.lightGrad)} />
                <div className={cn("w-1/2", palette.darkGrad)} />
              </div>

              {/* Color dots */}
              <div className="flex items-center justify-center gap-2 bg-card py-3">
                <div
                  className={cn(
                    "h-6 w-6 rounded-full shadow-sm ring-1 ring-black/10",
                    palette.primaryColor
                  )}
                  title="Primary"
                />
                <div
                  className={cn(
                    "h-6 w-6 rounded-full shadow-sm ring-1 ring-black/10",
                    palette.secondaryColor
                  )}
                  title="Secondary"
                />
              </div>

              {/* Name */}
              <div className="bg-card px-3 pb-3">
                <span className="text-xs font-medium text-foreground">
                  {t(`settings.palette.${palette.id}`)}
                </span>
              </div>

              {/* Active indicator */}
              {isActive && (
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary shadow-md">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
