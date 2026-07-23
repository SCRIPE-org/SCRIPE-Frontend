"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@core/common/utils";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  showLabels?: boolean;
  onLabel?: string;
  offLabel?: string;
  switchStyle?: string;
}

// The 13-skin zoo collapsed to three sizes of ONE treatment: track off =
// sunken --nx-ground behind a hairline, track on = accent fill behind the
// lit accent edge, thumb = raised surface. Thumb travel is computed per
// size from the border-box: w − 2×(1px border + 2px padding) − thumb.
// Legacy stored values resolve to "default" below; the stored-value
// migration itself is Wave C's job.
const SWITCH_SKINS = {
  // standard — 44×24 track, 20px thumb → 38px inner run, 18px travel
  default: {
    root: "h-6 w-11",
    thumb: "h-5 w-5",
    travel: "data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-[18px]",
  },
  // large, iOS-proportioned — 48×28 track, 24px thumb → 18px travel
  ios: {
    root: "h-7 w-12",
    thumb: "h-6 w-6",
    travel: "data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-[18px]",
  },
  // compact — 36×20 track, 16px thumb → 14px travel
  android: {
    root: "h-5 w-9",
    thumb: "h-4 w-4",
    travel: "data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-[14px]",
  },
} as const;

type SwitchSkin = keyof typeof SWITCH_SKINS;

// Stored settings can hold values the map no longer knows; unknowns fall
// back to default so first paint is always a styled control.
const resolveSwitchSkin = (value: string | null | undefined): SwitchSkin =>
  value && value in SWITCH_SKINS ? (value as SwitchSkin) : "default";

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  (
    {
      className,
      showLabels = false,
      onLabel,
      offLabel,
      switchStyle: overrideSwitchStyle,
      ...props
    },
    ref
  ) => {
    const { switchStyle: settingsSwitchStyle } = useSettings();
    const { t, direction } = useI18n();

    // Use override style if provided, otherwise use settings
    const skin = SWITCH_SKINS[resolveSwitchSkin(overrideSwitchStyle || settingsSwitchStyle)];

    // Default labels
    const defaultOnLabel = onLabel || t("common.yes");
    const defaultOffLabel = offLabel || t("common.no");
    const isRTL = direction === "rtl";

    const rootClassName = cn(
      "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border border-nx-line bg-nx-ground p-0.5",
      skin.root,
      // colour-only transition capped at standard speed; motion-reduce drops it
      "transition-[border-color,background-color,box-shadow] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
      // on = accent fill behind the lit edge: accent border plus a faint
      // on-fill light along the top inner edge — an edge, never a glow
      "data-[state=checked]:border-nx-accent data-[state=checked]:bg-nx-accent-fill",
      "data-[state=checked]:shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--nx-on-fill)_35%,transparent)]",
      // the stacked variant keeps the focus ring winning over the lit edge
      "focus-visible:outline-none focus-visible:shadow-nx-focus data-[state=checked]:focus-visible:shadow-nx-focus",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className
    );

    const thumbClassName = cn(
      "pointer-events-none block rounded-full border border-nx-line-hi bg-nx-raised-2 shadow-nx-sm",
      skin.thumb,
      "transition-[transform,border-color,background-color] duration-nx-standard ease-nx-enter motion-reduce:transition-none",
      "data-[state=checked]:border-transparent data-[state=checked]:bg-nx-on-fill",
      skin.travel
    );

    if (showLabels) {
      return (
        <div className={cn("flex items-center gap-3", isRTL ? "flex-row-reverse" : "")}>
          <span
            className={cn(
              "select-none text-sm font-medium transition-colors duration-nx-standard motion-reduce:transition-none",
              props.checked ? "text-nx-ink" : "text-nx-ink-3"
            )}
          >
            {defaultOnLabel}
          </span>
          <SwitchPrimitives.Root className={rootClassName} {...props} ref={ref}>
            <SwitchPrimitives.Thumb className={thumbClassName} />
          </SwitchPrimitives.Root>
          <span
            className={cn(
              "select-none text-sm font-medium transition-colors duration-nx-standard motion-reduce:transition-none",
              props.checked ? "text-nx-ink-3" : "text-nx-ink"
            )}
          >
            {defaultOffLabel}
          </span>
        </div>
      );
    }

    // dir="ltr" pins the track so ON is physically RIGHT in both locales —
    // a product decision, not an RTL bug. Do not convert to logical
    // utilities: the translate-x travel above depends on this.
    return (
      <div dir="ltr">
        <SwitchPrimitives.Root className={rootClassName} {...props} ref={ref}>
          <SwitchPrimitives.Thumb className={thumbClassName} />
        </SwitchPrimitives.Root>
      </div>
    );
  }
);

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
