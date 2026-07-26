"use client";

/**
 * Appearance — the colour story, in the order you actually decide it.
 *
 * Start from a whole palette if you want one decision instead of four; then
 * refine primary, secondary, and the two background families; then, if you are
 * running gradient backgrounds, pick the direction, the preset, or your own two
 * colours. Ten rows, one flat list, no sub-tabs.
 *
 * The swatches here are the one honest exception to "render the real
 * component": for a colour, the colour IS the component. Everything else in
 * this page renders the real primitive.
 */

import { useMemo } from "react";
import {
  ArrowDown,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  ArrowUpLeft,
  ArrowUpRight,
  Palette as PaletteIcon,
  Wand2,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import type {
  BackgroundMode,
  ColorTheme,
  DarkBackgroundTheme,
  DarkGradientTheme,
  GradientDirection,
  LightBackgroundTheme,
  LightGradientTheme,
  SecondaryColorTheme,
} from "@core/providers/settings-provider";
import { Choice, GroupPanel, Row, type ChoiceOption } from "../controls";
import { ROW } from "../settings-map";
import { useStage } from "../stage-context";

// ── Option data ───────────────────────────────────────────────────────────

const COLORS: { value: ColorTheme; swatch: string }[] = [
  { value: "scripe", swatch: "bg-violet-600" },
  { value: "purple", swatch: "bg-purple-500" },
  { value: "blue", swatch: "bg-blue-500" },
  { value: "green", swatch: "bg-green-500" },
  { value: "orange", swatch: "bg-orange-500" },
  { value: "red", swatch: "bg-red-500" },
  { value: "teal", swatch: "bg-teal-500" },
  { value: "pink", swatch: "bg-pink-500" },
  { value: "indigo", swatch: "bg-indigo-500" },
  { value: "cyan", swatch: "bg-cyan-500" },
  { value: "amber", swatch: "bg-amber-500" },
  { value: "yellow", swatch: "bg-yellow-400" },
  { value: "lime", swatch: "bg-lime-500" },
  { value: "emerald", swatch: "bg-emerald-500" },
  { value: "sky", swatch: "bg-sky-500" },
  { value: "violet", swatch: "bg-violet-500" },
  { value: "fuchsia", swatch: "bg-fuchsia-500" },
  { value: "rose", swatch: "bg-rose-500" },
  { value: "slate", swatch: "bg-slate-500" },
  { value: "zinc", swatch: "bg-zinc-500" },
  { value: "stone", swatch: "bg-stone-500" },
  { value: "gold", swatch: "bg-yellow-500" },
  { value: "coral", swatch: "bg-orange-400" },
];

const LIGHT_BACKGROUNDS: { value: LightBackgroundTheme; swatch: string }[] = [
  { value: "default", swatch: "bg-gradient-to-br from-white to-gray-50" },
  { value: "snow", swatch: "bg-gradient-to-br from-white to-slate-50" },
  { value: "pearl", swatch: "bg-gradient-to-br from-slate-50 to-gray-100" },
  { value: "cloud", swatch: "bg-gradient-to-br from-indigo-50 to-blue-50" },
  { value: "sky", swatch: "bg-gradient-to-br from-sky-50 to-blue-50" },
  { value: "mint", swatch: "bg-gradient-to-br from-green-50 to-emerald-50" },
  { value: "lavender", swatch: "bg-gradient-to-br from-purple-50 to-indigo-50" },
  { value: "rose", swatch: "bg-gradient-to-br from-rose-50 to-pink-50" },
  { value: "ice", swatch: "bg-gradient-to-br from-cyan-50 to-sky-50" },
  { value: "cream", swatch: "bg-gradient-to-br from-yellow-50 to-orange-50" },
  { value: "sand", swatch: "bg-gradient-to-br from-amber-50 to-yellow-50" },
  { value: "linen", swatch: "bg-gradient-to-br from-orange-50 to-amber-50" },
  { value: "warm", swatch: "bg-gradient-to-br from-orange-50 to-red-50" },
  { value: "cool", swatch: "bg-gradient-to-br from-blue-50 to-cyan-50" },
  { value: "neutral", swatch: "bg-gradient-to-br from-gray-50 to-slate-50" },
  { value: "soft", swatch: "bg-gradient-to-br from-pink-50 to-purple-50" },
];

const DARK_BACKGROUNDS: { value: DarkBackgroundTheme; swatch: string; labelKey: string }[] = [
  {
    value: "graphite",
    swatch: "bg-gradient-to-br from-zinc-800 to-zinc-700",
    labelKey: "graphite",
  },
  {
    value: "charcoal",
    swatch: "bg-gradient-to-br from-neutral-900 to-neutral-800",
    labelKey: "charcoal",
  },
  { value: "slate", swatch: "bg-gradient-to-br from-slate-900 to-slate-800", labelKey: "slate" },
  { value: "navy", swatch: "bg-gradient-to-br from-blue-950 to-sky-950", labelKey: "navy" },
  {
    value: "forest",
    swatch: "bg-gradient-to-br from-green-950 to-emerald-950",
    labelKey: "forest",
  },
  { value: "ocean", swatch: "bg-gradient-to-br from-blue-950 to-cyan-950", labelKey: "ocean" },
  {
    value: "purple-dark",
    swatch: "bg-gradient-to-br from-purple-950 to-indigo-950",
    labelKey: "purpleDark",
  },
  { value: "crimson", swatch: "bg-gradient-to-br from-red-950 to-rose-950", labelKey: "crimson" },
  {
    value: "warm-dark",
    swatch: "bg-gradient-to-br from-orange-950 to-red-950",
    labelKey: "warmDark",
  },
  {
    value: "volcanic",
    swatch: "bg-gradient-to-br from-red-950 to-orange-950",
    labelKey: "volcanic",
  },
  { value: "default", swatch: "bg-gradient-to-br from-gray-900 to-gray-800", labelKey: "default" },
  {
    value: "midnight",
    swatch: "bg-gradient-to-br from-blue-950 to-indigo-950",
    labelKey: "midnight",
  },
  {
    value: "obsidian",
    swatch: "bg-gradient-to-br from-violet-950 to-purple-950",
    labelKey: "obsidian",
  },
  { value: "darker", swatch: "bg-gradient-to-br from-gray-950 to-gray-900", labelKey: "darker" },
  { value: "onyx", swatch: "bg-gradient-to-br from-black to-neutral-950", labelKey: "onyx" },
  { value: "pitch", swatch: "bg-gradient-to-br from-black to-gray-950", labelKey: "pitch" },
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

// Wave C retired the emerald-violet preset: a stored value keeps applying (the
// theme still exists in CSS) but can no longer be re-selected.
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

interface PaletteRecipe {
  id: string;
  primary: ColorTheme;
  secondary: SecondaryColorTheme;
  lightBg: LightBackgroundTheme;
  darkBg: DarkBackgroundTheme;
  primarySwatch: string;
  secondarySwatch: string;
  lightSwatch: string;
  darkSwatch: string;
}

const PALETTES: PaletteRecipe[] = [
  {
    id: "ocean-breeze",
    primary: "blue",
    secondary: "cyan",
    lightBg: "sky",
    darkBg: "navy",
    primarySwatch: "bg-blue-500",
    secondarySwatch: "bg-cyan-500",
    lightSwatch: "bg-gradient-to-br from-sky-50 to-blue-50",
    darkSwatch: "bg-gradient-to-br from-blue-950 to-sky-950",
  },
  {
    id: "midnight-garden",
    primary: "purple",
    secondary: "emerald",
    lightBg: "lavender",
    darkBg: "midnight",
    primarySwatch: "bg-purple-500",
    secondarySwatch: "bg-emerald-500",
    lightSwatch: "bg-gradient-to-br from-purple-50 to-indigo-50",
    darkSwatch: "bg-gradient-to-br from-blue-950 to-indigo-950",
  },
  {
    id: "sunset-horizon",
    primary: "orange",
    secondary: "rose",
    lightBg: "cream",
    darkBg: "volcanic",
    primarySwatch: "bg-orange-500",
    secondarySwatch: "bg-rose-500",
    lightSwatch: "bg-gradient-to-br from-yellow-50 to-orange-50",
    darkSwatch: "bg-gradient-to-br from-red-950 to-orange-950",
  },
  {
    id: "arctic-frost",
    primary: "sky",
    secondary: "slate",
    lightBg: "snow",
    darkBg: "obsidian",
    primarySwatch: "bg-sky-500",
    secondarySwatch: "bg-slate-500",
    lightSwatch: "bg-gradient-to-br from-white to-slate-50",
    darkSwatch: "bg-gradient-to-br from-violet-950 to-purple-950",
  },
  {
    id: "corporate-classic",
    primary: "blue",
    secondary: "slate",
    lightBg: "default",
    darkBg: "slate",
    primarySwatch: "bg-blue-500",
    secondarySwatch: "bg-slate-500",
    lightSwatch: "bg-gradient-to-br from-white to-gray-50",
    darkSwatch: "bg-gradient-to-br from-slate-900 to-slate-800",
  },
  {
    id: "forest-canopy",
    primary: "emerald",
    secondary: "lime",
    lightBg: "mint",
    darkBg: "forest",
    primarySwatch: "bg-emerald-500",
    secondarySwatch: "bg-lime-500",
    lightSwatch: "bg-gradient-to-br from-green-50 to-emerald-50",
    darkSwatch: "bg-gradient-to-br from-green-950 to-emerald-950",
  },
  {
    id: "royal-jewels",
    primary: "violet",
    secondary: "gold",
    lightBg: "lavender",
    darkBg: "purple-dark",
    primarySwatch: "bg-violet-500",
    secondarySwatch: "bg-yellow-500",
    lightSwatch: "bg-gradient-to-br from-purple-50 to-indigo-50",
    darkSwatch: "bg-gradient-to-br from-purple-950 to-indigo-950",
  },
  {
    id: "warm-earth",
    primary: "coral",
    secondary: "amber",
    lightBg: "linen",
    darkBg: "charcoal",
    primarySwatch: "bg-orange-400",
    secondarySwatch: "bg-amber-500",
    lightSwatch: "bg-gradient-to-br from-orange-50 to-amber-50",
    darkSwatch: "bg-gradient-to-br from-neutral-900 to-neutral-800",
  },
  {
    id: "neon-city",
    primary: "fuchsia",
    secondary: "cyan",
    lightBg: "cloud",
    darkBg: "onyx",
    primarySwatch: "bg-fuchsia-500",
    secondarySwatch: "bg-cyan-500",
    lightSwatch: "bg-gradient-to-br from-indigo-50 to-blue-50",
    darkSwatch: "bg-gradient-to-br from-black to-neutral-950",
  },
  {
    id: "mono-elegance",
    primary: "zinc",
    secondary: "stone",
    lightBg: "pearl",
    darkBg: "graphite",
    primarySwatch: "bg-zinc-500",
    secondarySwatch: "bg-stone-500",
    lightSwatch: "bg-gradient-to-br from-slate-50 to-gray-100",
    darkSwatch: "bg-gradient-to-br from-zinc-800 to-zinc-700",
  },
  {
    id: "cherry-blossom",
    primary: "pink",
    secondary: "rose",
    lightBg: "rose",
    darkBg: "crimson",
    primarySwatch: "bg-pink-500",
    secondarySwatch: "bg-rose-500",
    lightSwatch: "bg-gradient-to-br from-rose-50 to-pink-50",
    darkSwatch: "bg-gradient-to-br from-red-950 to-rose-950",
  },
  {
    id: "tropical-paradise",
    primary: "teal",
    secondary: "amber",
    lightBg: "ice",
    darkBg: "ocean",
    primarySwatch: "bg-teal-500",
    secondarySwatch: "bg-amber-500",
    lightSwatch: "bg-gradient-to-br from-cyan-50 to-sky-50",
    darkSwatch: "bg-gradient-to-br from-blue-950 to-cyan-950",
  },
  {
    id: "crimson-gold",
    primary: "red",
    secondary: "gold",
    lightBg: "warm",
    darkBg: "warm-dark",
    primarySwatch: "bg-red-500",
    secondarySwatch: "bg-yellow-500",
    lightSwatch: "bg-gradient-to-br from-orange-50 to-red-50",
    darkSwatch: "bg-gradient-to-br from-orange-950 to-red-950",
  },
  {
    id: "deep-indigo",
    primary: "indigo",
    secondary: "violet",
    lightBg: "cool",
    darkBg: "midnight",
    primarySwatch: "bg-indigo-500",
    secondarySwatch: "bg-violet-500",
    lightSwatch: "bg-gradient-to-br from-blue-50 to-cyan-50",
    darkSwatch: "bg-gradient-to-br from-blue-950 to-indigo-950",
  },
  {
    id: "emerald-luxe",
    primary: "emerald",
    secondary: "gold",
    lightBg: "sand",
    darkBg: "default",
    primarySwatch: "bg-emerald-500",
    secondarySwatch: "bg-yellow-500",
    lightSwatch: "bg-gradient-to-br from-amber-50 to-yellow-50",
    darkSwatch: "bg-gradient-to-br from-gray-900 to-gray-800",
  },
  {
    id: "pastel-dream",
    primary: "pink",
    secondary: "sky",
    lightBg: "soft",
    darkBg: "darker",
    primarySwatch: "bg-pink-500",
    secondarySwatch: "bg-sky-500",
    lightSwatch: "bg-gradient-to-br from-pink-50 to-purple-50",
    darkSwatch: "bg-gradient-to-br from-gray-950 to-gray-900",
  },
  {
    id: "autumn-harvest",
    primary: "amber",
    secondary: "red",
    lightBg: "cream",
    darkBg: "warm-dark",
    primarySwatch: "bg-amber-500",
    secondarySwatch: "bg-red-500",
    lightSwatch: "bg-gradient-to-br from-yellow-50 to-orange-50",
    darkSwatch: "bg-gradient-to-br from-orange-950 to-red-950",
  },
  {
    id: "nordic-frost",
    primary: "cyan",
    secondary: "blue",
    lightBg: "ice",
    darkBg: "slate",
    primarySwatch: "bg-cyan-500",
    secondarySwatch: "bg-blue-500",
    lightSwatch: "bg-gradient-to-br from-cyan-50 to-sky-50",
    darkSwatch: "bg-gradient-to-br from-slate-900 to-slate-800",
  },
  {
    id: "lavender-haze",
    primary: "violet",
    secondary: "fuchsia",
    lightBg: "lavender",
    darkBg: "obsidian",
    primarySwatch: "bg-violet-500",
    secondarySwatch: "bg-fuchsia-500",
    lightSwatch: "bg-gradient-to-br from-purple-50 to-indigo-50",
    darkSwatch: "bg-gradient-to-br from-violet-950 to-purple-950",
  },
  {
    id: "minimalist",
    primary: "stone",
    secondary: "zinc",
    lightBg: "neutral",
    darkBg: "pitch",
    primarySwatch: "bg-stone-500",
    secondarySwatch: "bg-zinc-500",
    lightSwatch: "bg-gradient-to-br from-gray-50 to-slate-50",
    darkSwatch: "bg-gradient-to-br from-black to-gray-950",
  },
];

const DIRECTION_GRID: (GradientDirection | null)[][] = [
  ["to-tl", "to-t", "to-tr"],
  ["to-l", null, "to-r"],
  ["to-bl", "to-b", "to-br"],
];

const DIRECTION_ICON: Record<GradientDirection, typeof ArrowUp> = {
  "to-t": ArrowUp,
  "to-tr": ArrowUpRight,
  "to-r": ArrowRight,
  "to-br": ArrowDownRight,
  "to-b": ArrowDown,
  "to-bl": ArrowDownLeft,
  "to-l": ArrowLeft,
  "to-tl": ArrowUpLeft,
};

const DIRECTION_ANGLE: Record<GradientDirection, string> = {
  "to-t": "0deg",
  "to-tr": "45deg",
  "to-r": "90deg",
  "to-br": "135deg",
  "to-b": "180deg",
  "to-bl": "225deg",
  "to-l": "270deg",
  "to-tl": "315deg",
};

// ── Samples ───────────────────────────────────────────────────────────────

function Swatch({ className }: { className: string }) {
  return (
    <span aria-hidden className={cn("block h-8 w-8 rounded-full ring-1 ring-nx-line", className)} />
  );
}

function Band({ className }: { className: string }) {
  return (
    <span
      aria-hidden
      className={cn("block h-10 w-full rounded-nx-sm ring-1 ring-nx-line", className)}
    />
  );
}

function SplitBand({ from, to }: { from: string; to: string }) {
  return (
    <span
      aria-hidden
      className="flex h-10 w-full overflow-hidden rounded-nx-sm ring-1 ring-nx-line"
    >
      <span className={cn("h-full w-1/2", from)} />
      <span className={cn("h-full w-1/2", to)} />
    </span>
  );
}

// ── The compass ───────────────────────────────────────────────────────────

function DirectionCompass() {
  const { t, direction } = useI18n();
  const settings = useSettings();
  const { peek, release } = useStage();
  const row = ROW["gradient-direction"];

  const flat = DIRECTION_GRID.flat().filter(Boolean) as GradientDirection[];
  const activeIndex = Math.max(0, flat.indexOf(settings.gradientDirection));

  const move = (event: React.KeyboardEvent, index: number) => {
    const forward = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
    const backward = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
    let next: number | null = null;
    if (event.key === forward || event.key === "ArrowDown") next = (index + 1) % flat.length;
    else if (event.key === backward || event.key === "ArrowUp")
      next = (index - 1 + flat.length) % flat.length;
    else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      settings.setGradientDirection(flat[index]);
      return;
    }
    if (next === null) return;
    event.preventDefault();
    settings.setGradientDirection(flat[next]);
  };

  return (
    <div role="radiogroup" aria-label={t(row.titleKey!)} className="grid w-fit grid-cols-3 gap-1.5">
      {DIRECTION_GRID.flat().map((value, cell) => {
        if (!value) {
          return (
            <span
              key={`center-${cell}`}
              aria-hidden
              className="flex h-11 w-11 items-center justify-center rounded-nx-sm bg-nx-raised"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-nx-accent" />
            </span>
          );
        }
        const Icon = DIRECTION_ICON[value];
        const selected = settings.gradientDirection === value;
        const index = flat.indexOf(value);
        return (
          <div
            key={value}
            role="radio"
            aria-checked={selected}
            aria-label={value}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => settings.setGradientDirection(value)}
            onKeyDown={(event) => move(event, index)}
            onPointerEnter={() => peek(row.subject, { gradientDirection: value })}
            onPointerLeave={release}
            // Focus bubbles to the Row, whose broader aim would clear this
            // option's peek — stop it here, exactly as Choice does.
            onFocus={(event) => {
              event.stopPropagation();
              peek(row.subject, { gradientDirection: value });
            }}
            onBlur={(event) => {
              event.stopPropagation();
              release();
            }}
            className={cn(
              "flex h-11 w-11 cursor-pointer items-center justify-center rounded-nx-sm border outline-none",
              "transition-[background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              "focus-visible:shadow-nx-focus",
              selected
                ? "border-nx-line-hi bg-nx-accent-wash text-nx-accent shadow-[inset_0_0_0_1px_var(--nx-accent)]"
                : "border-nx-line bg-nx-surface text-nx-ink-3 hover:border-nx-line-hi hover:bg-nx-hover"
            )}
          >
            <Icon aria-hidden className="h-4 w-4" />
          </div>
        );
      })}
    </div>
  );
}

// ── The group ─────────────────────────────────────────────────────────────

export function AppearanceGroup() {
  const { t } = useI18n();
  const settings = useSettings();

  const paletteOptions = useMemo<ChoiceOption<string>[]>(
    () =>
      PALETTES.map((palette) => ({
        value: palette.id,
        label: t(`settings.palette.${palette.id}`),
        // A palette is four decisions at once, so it peeks all four.
        patch: {
          colorTheme: palette.primary,
          secondaryColorTheme: palette.secondary,
          lightBackgroundTheme: palette.lightBg,
          darkBackgroundTheme: palette.darkBg,
          activePalette: palette.id,
        },
        sample: (
          <span aria-hidden className="block w-full space-y-2">
            <span className="flex h-8 w-full overflow-hidden rounded-nx-sm ring-1 ring-nx-line">
              <span className={cn("h-full w-1/2", palette.lightSwatch)} />
              <span className={cn("h-full w-1/2", palette.darkSwatch)} />
            </span>
            <span className="flex items-center gap-1.5">
              <span
                className={cn("h-4 w-4 rounded-full ring-1 ring-nx-line", palette.primarySwatch)}
              />
              <span
                className={cn("h-4 w-4 rounded-full ring-1 ring-nx-line", palette.secondarySwatch)}
              />
            </span>
          </span>
        ),
      })),
    [t]
  );

  const colorOptions = useMemo<ChoiceOption<ColorTheme>[]>(
    () =>
      COLORS.map((color) => ({
        value: color.value,
        label: t(`settings.colors.${color.value}`),
        sample: <Swatch className={color.swatch} />,
      })),
    [t]
  );

  const lightBgOptions = useMemo<ChoiceOption<LightBackgroundTheme>[]>(
    () =>
      LIGHT_BACKGROUNDS.map((bg) => ({
        value: bg.value,
        label: t(`settings.lightBg.${bg.value}`),
        sample: <Band className={bg.swatch} />,
      })),
    [t]
  );

  const darkBgOptions = useMemo<ChoiceOption<DarkBackgroundTheme>[]>(
    () =>
      DARK_BACKGROUNDS.map((bg) => ({
        value: bg.value,
        label: t(`settings.darkBg.${bg.labelKey}`),
        sample: <Band className={bg.swatch} />,
      })),
    [t]
  );

  const modeOptions = useMemo<ChoiceOption<BackgroundMode>[]>(
    () => [
      {
        value: "preset",
        label: t("settings.bgMode.preset"),
        description: t("settings.bgMode.presetDesc"),
        sample: <PaletteIcon aria-hidden className="h-5 w-5 text-nx-ink-2" />,
      },
      {
        value: "gradient",
        label: t("settings.bgMode.gradient"),
        description: t("settings.bgMode.gradientDesc"),
        sample: <Wand2 aria-hidden className="h-5 w-5 text-nx-ink-2" />,
      },
    ],
    [t]
  );

  const lightGradientOptions = useMemo<ChoiceOption<LightGradientTheme>[]>(
    () =>
      LIGHT_GRADIENTS.map((gradient) => ({
        value: gradient.value,
        label: t(`settings.lightGradient.${gradient.value}`),
        sample: <SplitBand from={gradient.from} to={gradient.to} />,
      })),
    [t]
  );

  const darkGradientOptions = useMemo<ChoiceOption<DarkGradientTheme>[]>(
    () =>
      DARK_GRADIENTS.map((gradient) => ({
        value: gradient.value,
        label: t(`settings.darkGradient.${gradient.value}`),
        sample: <SplitBand from={gradient.from} to={gradient.to} />,
      })),
    [t]
  );

  const gradientMode = settings.backgroundMode === "gradient";
  const hasCustomGradient = Boolean(settings.gradientStartColor || settings.gradientEndColor);

  return (
    <GroupPanel
      title={t("settings.tabs.appearance")}
      description={t("settings.appearanceSettings.description")}
    >
      <Row row={ROW["palette"]}>
        <Choice
          row={ROW["palette"]}
          value={settings.activePalette ?? ""}
          onSelect={(id) => {
            const palette = PALETTES.find((entry) => entry.id === id);
            if (!palette) return;
            settings.setColorTheme(palette.primary);
            settings.setSecondaryColorTheme(palette.secondary);
            settings.setLightBackgroundTheme(palette.lightBg);
            settings.setDarkBackgroundTheme(palette.darkBg);
            settings.setActivePalette(palette.id);
          }}
          options={paletteOptions}
          gridClassName="sm:grid-cols-3 lg:grid-cols-4"
        />
      </Row>

      <Row row={ROW["primary-color"]}>
        <Choice
          row={ROW["primary-color"]}
          value={settings.colorTheme}
          onSelect={(value) => {
            // Picking a swatch is the one action that actually opts a user out
            // of the tenant's brand accent (--workspace-hue/--workspace-chroma).
            // Until this flag flips, dom-applicator leaves --primary/data-theme
            // unwritten so nothing here fights the workspace colour nobody
            // asked to replace yet.
            settings.setColorTheme(value);
            settings.setColorThemeCustomized(true);
          }}
          options={colorOptions}
          settingKey="colorTheme"
          density="swatch"
        />
        {settings.colorThemeCustomized && (
          <button
            type="button"
            onClick={() => settings.setColorThemeCustomized(false)}
            className={cn(
              "mt-3 rounded-nx-sm text-sm font-medium text-nx-accent outline-none",
              "transition-opacity duration-nx-micro ease-nx-enter motion-reduce:transition-none",
              "hover:opacity-80 focus-visible:shadow-nx-focus"
            )}
          >
            {t("settings.colorTheme.resetToBrand")}
          </button>
        )}
      </Row>

      <Row row={ROW["secondary-color"]}>
        <Choice
          row={ROW["secondary-color"]}
          value={settings.secondaryColorTheme}
          onSelect={(value) => settings.setSecondaryColorTheme(value as SecondaryColorTheme)}
          options={colorOptions}
          settingKey="secondaryColorTheme"
          density="swatch"
        />
      </Row>

      <Row row={ROW["light-background"]}>
        <Choice
          row={ROW["light-background"]}
          value={settings.lightBackgroundTheme}
          onSelect={(value) => settings.setLightBackgroundTheme(value)}
          options={lightBgOptions}
          settingKey="lightBackgroundTheme"
          gridClassName="sm:grid-cols-4 lg:grid-cols-4"
        />
      </Row>

      <Row row={ROW["dark-background"]}>
        <Choice
          row={ROW["dark-background"]}
          value={settings.darkBackgroundTheme}
          onSelect={(value) => settings.setDarkBackgroundTheme(value)}
          options={darkBgOptions}
          settingKey="darkBackgroundTheme"
          gridClassName="sm:grid-cols-4 lg:grid-cols-4"
        />
      </Row>

      <Row row={ROW["background-mode"]}>
        <Choice
          row={ROW["background-mode"]}
          value={settings.backgroundMode}
          onSelect={(value) => settings.setBackgroundMode(value)}
          options={modeOptions}
          settingKey="backgroundMode"
          gridClassName="sm:grid-cols-2 lg:grid-cols-2"
        />
        {!gradientMode && (
          <div className="mt-4 rounded-nx-md border border-nx-line bg-nx-raised p-3">
            <p className="text-sm text-nx-ink-2">{t("settings.gradientWarning")}</p>
            <button
              type="button"
              onClick={() => settings.setBackgroundMode("gradient")}
              className={cn(
                "mt-2 rounded-nx-sm text-sm font-medium text-nx-accent outline-none",
                "transition-opacity duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                "hover:opacity-80 focus-visible:shadow-nx-focus"
              )}
            >
              {t("settings.switchToGradient")}
            </button>
          </div>
        )}
      </Row>

      <Row row={ROW["gradient-direction"]}>
        <DirectionCompass />
      </Row>

      <Row row={ROW["light-gradient"]}>
        <Choice
          row={ROW["light-gradient"]}
          value={settings.lightGradientTheme}
          onSelect={(value) => {
            settings.setLightGradientTheme(value);
            // A preset replaces any hand-picked pair, exactly as before.
            settings.setGradientStartColor("");
            settings.setGradientEndColor("");
          }}
          options={lightGradientOptions}
          settingKey="lightGradientTheme"
          gridClassName="sm:grid-cols-4 lg:grid-cols-4"
        />
      </Row>

      <Row row={ROW["dark-gradient"]}>
        <Choice
          row={ROW["dark-gradient"]}
          value={settings.darkGradientTheme}
          onSelect={(value) => {
            settings.setDarkGradientTheme(value);
            settings.setGradientStartColor("");
            settings.setGradientEndColor("");
          }}
          options={darkGradientOptions}
          settingKey="darkGradientTheme"
          gridClassName="sm:grid-cols-4 lg:grid-cols-4"
        />
      </Row>

      <Row row={ROW["custom-gradient"]}>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 sm:flex-row">
            <ColorField
              label={t("settings.gradient.startColor")}
              value={settings.gradientStartColor}
              fallback="#6366f1"
              onChange={settings.setGradientStartColor}
            />
            <ColorField
              label={t("settings.gradient.endColor")}
              value={settings.gradientEndColor}
              fallback="#8b5cf6"
              onChange={settings.setGradientEndColor}
            />
          </div>

          {hasCustomGradient && (
            <>
              <div
                aria-hidden
                className="h-14 w-full rounded-nx-md ring-1 ring-nx-line"
                style={{
                  background: `linear-gradient(${
                    DIRECTION_ANGLE[settings.gradientDirection] ?? "135deg"
                  }, ${settings.gradientStartColor || "#6366f1"}, ${
                    settings.gradientEndColor || "#8b5cf6"
                  })`,
                }}
              />
              <button
                type="button"
                onClick={() => {
                  settings.setGradientStartColor("");
                  settings.setGradientEndColor("");
                }}
                className={cn(
                  "rounded-nx-sm text-sm font-medium text-nx-danger outline-none",
                  "transition-opacity duration-nx-micro ease-nx-enter motion-reduce:transition-none",
                  "hover:opacity-80 focus-visible:shadow-nx-focus"
                )}
              >
                {t("settings.gradient.clearCustom")}
              </button>
            </>
          )}
        </div>
      </Row>
    </GroupPanel>
  );
}

function ColorField({
  label,
  value,
  fallback,
  onChange,
}: {
  label: string;
  value: string;
  fallback: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex-1 space-y-2">
      <label className="block text-sm font-medium text-nx-ink-2">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          aria-label={label}
          value={value || fallback}
          onChange={(event) => onChange(event.target.value)}
          className={cn(
            "h-10 w-10 cursor-pointer rounded-nx-sm border border-nx-line bg-nx-surface outline-none",
            "transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none",
            "hover:border-nx-line-hi focus-visible:shadow-nx-focus",
            "[&::-webkit-color-swatch-wrapper]:p-1 [&::-webkit-color-swatch]:rounded-[4px] [&::-webkit-color-swatch]:border-0"
          )}
        />
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={fallback}
          className={cn(
            "h-10 min-w-0 flex-1 rounded-nx-control border border-nx-line bg-nx-surface px-3 font-mono text-sm text-nx-ink outline-none",
            "transition-[border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
            "placeholder:text-nx-ink-3 hover:border-nx-line-hi focus-visible:shadow-nx-focus"
          )}
        />
      </div>
    </div>
  );
}
