"use client";

/**
 * Layout & density — how big, how soft, how deep, how much motion.
 *
 * These eight rows are the ones that move the whole interface at once, which is
 * why the Stage for this group shows a slice of real chrome (buttons, badges,
 * an input, a table) rather than a single part: changing radius or density
 * without seeing several components react at once tells you nothing.
 */

import { useMemo } from "react";
import { Move, MoveUp, RotateCw, Sparkles, ZoomIn, Zap } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import type {
  AnimationLevel,
  BorderRadius,
  CardStyle,
  FontSize,
  HoverEffectIntensity,
  HoverEffectType,
  ShadowIntensity,
  SpacingSize,
} from "@core/providers/settings-provider";
import { Choice, GroupPanel, Row, type ChoiceOption } from "../controls";
import { ROW } from "../settings-map";

// ── Option data ───────────────────────────────────────────────────────────

const FONT_SIZES: { value: FontSize; sampleClass: string }[] = [
  { value: "xs", sampleClass: "text-xs" },
  { value: "small", sampleClass: "text-sm" },
  { value: "medium", sampleClass: "text-base" },
  { value: "default", sampleClass: "text-lg" },
  { value: "large", sampleClass: "text-xl" },
  { value: "xl", sampleClass: "text-2xl" },
];

const RADII: { value: BorderRadius; sampleClass: string; px: string }[] = [
  { value: "none", sampleClass: "rounded-none", px: "0px" },
  { value: "small", sampleClass: "rounded-sm", px: "2px" },
  { value: "default", sampleClass: "rounded", px: "4px" },
  { value: "large", sampleClass: "rounded-lg", px: "8px" },
  { value: "full", sampleClass: "rounded-full", px: "9999px" },
];

const SPACINGS: { value: SpacingSize; gapClass: string }[] = [
  { value: "compact", gapClass: "gap-0.5" },
  { value: "default", gapClass: "gap-1.5" },
  { value: "comfortable", gapClass: "gap-2.5" },
  { value: "spacious", gapClass: "gap-4" },
];

// The card-style samples mirror the five treatments globals.css applies at
// :root[data-card-style]. They are miniatures, not the real Card — the real
// Card is what the Stage shows, and it changes the moment you commit.
const CARD_STYLES: { value: CardStyle; labelKey: string; sampleClass: string }[] = [
  {
    value: "default",
    labelKey: "cardStyle.default",
    sampleClass: "border border-nx-line bg-nx-surface",
  },
  {
    value: "glass",
    labelKey: "cardStyle.glass",
    sampleClass: "border border-nx-line-hi bg-nx-raised/60 backdrop-blur",
  },
  { value: "solid", labelKey: "cardStyle.solid", sampleClass: "border-0 bg-nx-accent-wash" },
  {
    value: "bordered",
    labelKey: "cardStyle.bordered",
    sampleClass: "border-2 border-nx-line-hi bg-transparent",
  },
  {
    value: "elevated",
    labelKey: "settings.cardStyleOptions.elevated",
    sampleClass: "border border-nx-line bg-nx-surface shadow-nx-popover",
  },
];

const SHADOWS: { value: ShadowIntensity; sampleClass: string }[] = [
  { value: "none", sampleClass: "shadow-none" },
  { value: "subtle", sampleClass: "shadow-nx-sm" },
  { value: "moderate", sampleClass: "shadow-nx-popover" },
  { value: "strong", sampleClass: "shadow-nx-modal" },
];

const ANIMATION_LEVELS: { value: AnimationLevel; bars: number }[] = [
  { value: "none", bars: 0 },
  { value: "minimal", bars: 1 },
  { value: "moderate", bars: 2 },
  { value: "high", bars: 3 },
];

// The hover pair ships no platform strings; these literals are the same ones
// the previous hover section rendered, so no locale key moves.
const HOVER_TYPES: {
  value: HoverEffectType;
  name: string;
  description: string;
  icon: typeof Move;
}[] = [
  { value: "none", name: "None", description: "No hover effect", icon: Move },
  { value: "elevate", name: "Elevate", description: "Lift and shadow", icon: MoveUp },
  { value: "scale", name: "Scale", description: "Grow on hover", icon: ZoomIn },
  { value: "glow", name: "Glow", description: "Glowing border", icon: Sparkles },
  { value: "shimmer", name: "Shimmer", description: "Shimmer animation", icon: Zap },
  { value: "rotate", name: "Rotate", description: "Slight rotation", icon: RotateCw },
  { value: "slide", name: "Slide", description: "Slide movement", icon: Move },
];

const HOVER_INTENSITIES: {
  value: HoverEffectIntensity;
  name: string;
  description: string;
  level: number;
}[] = [
  { value: "none", name: "None", description: "No effect", level: 0 },
  { value: "small", name: "Small", description: "Subtle effect", level: 1 },
  { value: "medium", name: "Medium", description: "Balanced effect", level: 2 },
  { value: "strong", name: "Strong", description: "Bold effect", level: 3 },
];

// ── Samples ───────────────────────────────────────────────────────────────

function LevelBars({ filled, total }: { filled: number; total: number }) {
  return (
    <span aria-hidden className="flex items-end gap-1">
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          className={cn(
            "w-1.5 rounded-full",
            index < filled ? "bg-nx-accent" : "bg-nx-line-hi",
            index === 0 ? "h-2.5" : index === 1 ? "h-4" : index === 2 ? "h-5" : "h-6"
          )}
        />
      ))}
    </span>
  );
}

// ── The group ─────────────────────────────────────────────────────────────

export function LayoutGroup() {
  const { t } = useI18n();
  const settings = useSettings();

  const fontOptions = useMemo<ChoiceOption<FontSize>[]>(
    () =>
      FONT_SIZES.map((size) => ({
        value: size.value,
        label: t(`fontSize.${size.value}`),
        description: t(`fontSize.${size.value}Desc`),
        sample: (
          <span aria-hidden className={cn("font-semibold text-nx-ink", size.sampleClass)}>
            Aa
          </span>
        ),
      })),
    [t]
  );

  const radiusOptions = useMemo<ChoiceOption<BorderRadius>[]>(
    () =>
      RADII.map((radius) => ({
        value: radius.value,
        label: t(`radius.${radius.value}`),
        description: radius.px,
        sample: (
          <span aria-hidden className={cn("block h-9 w-full bg-nx-raised-2", radius.sampleClass)} />
        ),
      })),
    [t]
  );

  const spacingOptions = useMemo<ChoiceOption<SpacingSize>[]>(
    () =>
      SPACINGS.map((spacing) => ({
        value: spacing.value,
        label: t(`settings.spacing.options.${spacing.value}`),
        sample: (
          <span aria-hidden className={cn("flex w-full flex-col", spacing.gapClass)}>
            <span className="h-1.5 w-full rounded-full bg-nx-line-hi" />
            <span className="h-1.5 w-4/5 rounded-full bg-nx-line-hi" />
            <span className="h-1.5 w-3/5 rounded-full bg-nx-line-hi" />
          </span>
        ),
      })),
    [t]
  );

  const cardOptions = useMemo<ChoiceOption<CardStyle>[]>(
    () =>
      CARD_STYLES.map((style) => ({
        value: style.value,
        label: t(style.labelKey),
        sample: (
          <span
            aria-hidden
            className={cn("block w-full space-y-1 rounded-nx-sm p-2", style.sampleClass)}
          >
            <span className="block h-1.5 w-full rounded-full bg-nx-line-hi" />
            <span className="block h-1.5 w-2/3 rounded-full bg-nx-line" />
          </span>
        ),
      })),
    [t]
  );

  const shadowOptions = useMemo<ChoiceOption<ShadowIntensity>[]>(
    () =>
      SHADOWS.map((shadow) => ({
        value: shadow.value,
        label: t(`settings.shadow.${shadow.value}`),
        sample: (
          <span
            aria-hidden
            className={cn(
              "block h-9 w-9 rounded-nx-sm border border-nx-line bg-nx-surface",
              shadow.sampleClass
            )}
          />
        ),
      })),
    [t]
  );

  const animationOptions = useMemo<ChoiceOption<AnimationLevel>[]>(
    () =>
      ANIMATION_LEVELS.map((level) => ({
        value: level.value,
        label: t(`settings.animation.${level.value}`),
        description: t(`settings.animation.${level.value}Desc`),
        sample: <LevelBars filled={level.bars} total={3} />,
      })),
    [t]
  );

  const hoverTypeOptions = useMemo<ChoiceOption<HoverEffectType>[]>(
    () =>
      HOVER_TYPES.map((effect) => ({
        value: effect.value,
        label: effect.name,
        description: effect.description,
        sample: <effect.icon aria-hidden className="h-5 w-5 text-nx-ink-2" />,
      })),
    []
  );

  const hoverIntensityOptions = useMemo<ChoiceOption<HoverEffectIntensity>[]>(
    () =>
      HOVER_INTENSITIES.map((intensity) => ({
        value: intensity.value,
        label: intensity.name,
        description: intensity.description,
        sample: <LevelBars filled={intensity.level} total={3} />,
      })),
    []
  );

  return (
    <GroupPanel title={t("settings.tabs.layout")}>
      <Row row={ROW["font-size"]}>
        <Choice
          row={ROW["font-size"]}
          value={settings.fontSize}
          onSelect={(value) => settings.setFontSize(value)}
          options={fontOptions}
          settingKey="fontSize"
          gridClassName="sm:grid-cols-3 lg:grid-cols-6"
        />
      </Row>

      <Row row={ROW["border-radius"]}>
        <Choice
          row={ROW["border-radius"]}
          value={settings.borderRadius}
          onSelect={(value) => settings.setBorderRadius(value)}
          options={radiusOptions}
          settingKey="borderRadius"
          gridClassName="sm:grid-cols-5 lg:grid-cols-5"
        />
      </Row>

      <Row row={ROW["spacing"]}>
        <Choice
          row={ROW["spacing"]}
          value={settings.spacingSize}
          onSelect={(value) => settings.setSpacingSize(value)}
          options={spacingOptions}
          settingKey="spacingSize"
          gridClassName="sm:grid-cols-4 lg:grid-cols-4"
        />
      </Row>

      <Row row={ROW["card-style"]}>
        <Choice
          row={ROW["card-style"]}
          value={settings.cardStyle}
          onSelect={(value) => settings.setCardStyle(value)}
          options={cardOptions}
          settingKey="cardStyle"
          gridClassName="sm:grid-cols-5 lg:grid-cols-5"
        />
      </Row>

      <Row row={ROW["shadow"]}>
        <Choice
          row={ROW["shadow"]}
          value={settings.shadowIntensity}
          onSelect={(value) => settings.setShadowIntensity(value)}
          options={shadowOptions}
          settingKey="shadowIntensity"
          gridClassName="sm:grid-cols-4 lg:grid-cols-4"
        />
      </Row>

      <Row row={ROW["animation"]}>
        <Choice
          row={ROW["animation"]}
          value={settings.animationLevel}
          onSelect={(value) => settings.setAnimationLevel(value)}
          options={animationOptions}
          settingKey="animationLevel"
          gridClassName="sm:grid-cols-4 lg:grid-cols-4"
        />
      </Row>

      <Row row={ROW["hover-type"]}>
        <Choice
          row={ROW["hover-type"]}
          value={settings.hoverEffectType}
          onSelect={(value) => settings.setHoverEffectType(value)}
          options={hoverTypeOptions}
          settingKey="hoverEffectType"
          gridClassName="sm:grid-cols-4 lg:grid-cols-7"
        />
      </Row>

      <Row row={ROW["hover-intensity"]}>
        <Choice
          row={ROW["hover-intensity"]}
          value={settings.hoverEffectIntensity}
          onSelect={(value) => settings.setHoverEffectIntensity(value)}
          options={hoverIntensityOptions}
          settingKey="hoverEffectIntensity"
          gridClassName="sm:grid-cols-4 lg:grid-cols-4"
        />
      </Row>
    </GroupPanel>
  );
}
