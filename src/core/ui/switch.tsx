"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@core/common/utils";
import { CONTROL_HIT_TARGET } from "@core/ui/checkbox";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  showLabels?: boolean;
  onLabel?: string;
  offLabel?: string;
  switchStyle?: string;
  /**
   * An in-flight mutation. Holds the live colours, blocks interaction and sets
   * `aria-busy`. Use this INSTEAD OF `disabled` while a request is pending:
   * `disabled` flattens the track, so an ON switch mid-request reads as OFF and
   * the user thinks their toggle was rejected.
   */
  busy?: boolean;
  /**
   * The value is shown but cannot be edited. Not the same as `disabled` — it
   * stays focusable and keeps its live colours, matching the read-only field
   * treatment in input.tsx.
   */
  readOnly?: boolean;
}

// Three sizes of ONE treatment: track off = sunken --nx-ground behind a
// hairline, track on = accent fill behind the lit accent edge, thumb = a solid
// dot that carries the contrast.
//
// Geometry: `box-sizing: border-box` + 1px border + `p-0.5` = a 3px inset per
// side, so the content box is (w−6)×(h−6) and a concentric thumb is h−6, not
// h−4. The thumb used to be h−4 and overflowed its content box by 1px top and
// bottom in all three skins. Sizing the thumb correctly also lands travel on
// the 4px scale.
//
// DIRECTION IS PINNED, in both locales: OFF is physically LEFT, ON is
// physically RIGHT, in English and in Arabic alike. This is a product
// decision — the track reads as a physical object whose on-position does not
// move between languages — so travel is a plain physical translate with no
// rtl: variant, and the pin lives on the Root element itself (see below)
// rather than on a wrapper, which is what used to break `peer`.
//
// Travel = contentWidth − thumb.
const SWITCH_SKINS = {
  // standard — 44×24 border-box → 38×18 content box, 18px thumb, 20px travel
  default: {
    root: "h-6 w-11",
    thumb: "h-[18px] w-[18px]",
    travel: "data-[state=checked]:translate-x-5",
  },
  // large, iOS-proportioned — 48×28 → 42×22 content box, 22px thumb, 20px travel
  ios: {
    root: "h-7 w-12",
    thumb: "h-[22px] w-[22px]",
    travel: "data-[state=checked]:translate-x-5",
  },
  // compact — 36×20 → 30×14 content box, 14px thumb, 16px travel
  android: {
    root: "h-5 w-9",
    thumb: "h-[14px] w-[14px]",
    travel: "data-[state=checked]:translate-x-4",
  },
} as const;

type SwitchSkin = keyof typeof SWITCH_SKINS;

// Stored settings can hold values the map no longer knows; unknowns fall
// back to default so first paint is always a styled control.
const resolveSwitchSkin = (value: string | null | undefined): SwitchSkin =>
  value && value in SWITCH_SKINS ? (value as SwitchSkin) : "default";

const LABEL_BASE =
  "select-none text-sm font-medium transition-colors duration-nx-micro ease-nx-enter motion-reduce:transition-none";

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  (
    {
      className,
      showLabels = false,
      onLabel,
      offLabel,
      switchStyle: overrideSwitchStyle,
      busy = false,
      readOnly = false,
      onCheckedChange,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const { switchStyle: settingsSwitchStyle } = useSettings();
    const { t } = useI18n();

    // Use override style if provided, otherwise use settings
    const skin = SWITCH_SKINS[resolveSwitchSkin(overrideSwitchStyle || settingsSwitchStyle)];

    // Default labels
    const defaultOnLabel = onLabel || t("common.yes");
    const defaultOffLabel = offLabel || t("common.no");

    // Busy and read-only block the change without disabling the control, so
    // enforcement lives on the handlers rather than on pointer-events: the
    // control stays hoverable (tooltips) and focusable (screen readers), it
    // just refuses to move.
    const isInert = busy || readOnly;

    const rootClassName = cn(
      "peer relative inline-flex shrink-0 cursor-pointer items-center rounded-full border p-0.5",
      // 44×24 drawn, ~60×40 actually clickable — the same invisible inset
      // pseudo Checkbox and Radio use.
      CONTROL_HIT_TARGET,
      skin.root,
      // colour-only transition at MICRO speed — a toggle has to feel switched,
      // not eased; motion-reduce drops it
      "transition-[border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
      // OFF — line-hi, not line: an off switch must be legible on its own, not
      // implied by the absence of colour
      "border-nx-line-hi bg-nx-ground",
      // hover lifts the hairline only while OFF — an ON track already wears the
      // accent edge and must not fall back to a neutral line under the pointer
      "data-[state=unchecked]:enabled:hover:border-nx-accent",
      // on = accent fill behind the lit edge: accent border plus a faint
      // on-fill light along the top inner edge — an edge, never a glow
      "data-[state=checked]:border-nx-accent data-[state=checked]:bg-nx-accent-fill",
      "data-[state=checked]:shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--nx-on-fill)_35%,transparent)]",
      // hover ON brightens the FILL rather than adding a shadow: a hover shadow
      // would out-specify the focus ring below and swallow it.
      "data-[state=checked]:enabled:hover:bg-nx-accent",
      // press — the edge commits before the state does, same language as Checkbox
      "enabled:active:border-nx-accent",
      // focus: one ring for OFF …
      "focus-visible:outline-none focus-visible:shadow-nx-focus",
      // … and a re-hued stack for ON, because --nx-focus draws its inner ring in
      // --nx-accent directly on top of an accent border, where it disappears.
      "data-[state=checked]:focus-visible:shadow-[inset_0_0_0_1px_var(--nx-on-fill),0_0_0_3px_var(--nx-accent-wash)]",
      // invalid — FormControl already injects aria-invalid; this was the only
      // control in the set that rendered nothing for it
      "aria-[invalid=true]:border-nx-danger",
      // busy: live colours held, the change refused by the handler guard below.
      // Deliberately NOT pointer-events-none — that would also suppress the
      // cursor and any tooltip explaining the wait.
      "data-[busy=true]:cursor-progress data-[busy=true]:border-nx-accent",
      // read-only: live colours, still focusable and still hoverable, because a
      // read-only control is usually the one that most needs to explain itself.
      "data-[readonly=true]:cursor-default",
      // inert: the track flattens to the raised step in BOTH positions, so a
      // disabled ON switch never masquerades as a live accent control
      "disabled:cursor-not-allowed disabled:border-nx-line disabled:bg-nx-raised disabled:shadow-none",
      "disabled:data-[state=checked]:border-nx-line disabled:data-[state=checked]:bg-nx-raised-2 disabled:data-[state=checked]:shadow-none",
      // inert outranks invalid, exactly as in input.tsx
      "disabled:aria-[invalid=true]:border-nx-line",
      className
    );

    const thumbClassName = cn(
      "pointer-events-none block rounded-full border border-transparent",
      skin.thumb,
      // travel at micro speed too — thumb and track land together
      "transition-[transform,border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
      // The OFF thumb carries the contrast for the whole OFF state. It used to
      // be a raised surface on a sunken one, which is a near-invisible step;
      // ink-3 is the quietest token that still reads as a solid object.
      "bg-nx-ink-3",
      "data-[state=checked]:bg-nx-on-fill data-[state=checked]:shadow-nx-sm",
      // the disabled thumb sits one clear step below the OFF thumb, so "off"
      // and "off + disabled" stay distinguishable
      "data-[disabled]:bg-nx-line-hi data-[disabled]:shadow-none",
      "data-[state=unchecked]:translate-x-0",
      // Physical travel, no rtl: variant — the Root carries dir="ltr" so OFF is
      // always physically left and ON always physically right, in both locales.
      skin.travel
    );

    const rootProps = {
      ...props,
      // The direction pin lives HERE, on the Root, not on a wrapper element.
      // A wrapper is what the old build used, and it broke `peer`: the class
      // list starts with `peer`, but `peer-disabled:` compiles to a
      // following-sibling selector, so burying the Root inside a div meant a
      // <Label> next to a disabled Switch never dimmed — while the identical
      // markup around a Checkbox did. Pinning the Root itself keeps ON on the
      // right in Arabic AND keeps the Root a real sibling.
      dir: "ltr" as const,
      "data-busy": busy || undefined,
      "data-readonly": readOnly || undefined,
      "aria-busy": busy || undefined,
      "aria-readonly": readOnly || undefined,
      onCheckedChange: (checked: boolean) => {
        if (isInert) return;
        onCheckedChange?.(checked);
      },
      onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>) => {
        onKeyDown?.(event);
        // Space/Enter reach a focused switch even with pointer-events-none, so
        // the inert states have to refuse the key as well.
        if (isInert && (event.key === " " || event.key === "Enter")) {
          event.preventDefault();
        }
      },
    };

    if (showLabels) {
      // `props.checked` is undefined for an uncontrolled switch, so the ink fork
      // derives the state instead of assuming the controlled shape.
      const isOn = props.checked ?? props.defaultChecked ?? false;
      const dimmed = props.disabled || isInert;

      return (
        // dir="ltr" on the ROW too, so the labels keep the same physical sides
        // as the track they describe. Each label still renders its own text in
        // its own direction; only the left-to-right order of the three items is
        // pinned.
        <div dir="ltr" className="flex items-center gap-3">
          {/* OFF label on the physical LEFT, beside the thumb's resting
              position; ON label on the physical RIGHT, where the thumb lands.
              The old order was [on][track][off], which pointed the thumb at the
              wrong word in English. */}
          <span
            aria-hidden="true"
            className={cn(LABEL_BASE, isOn ? "text-nx-ink-3" : "text-nx-ink", dimmed && "text-nx-ink-3")}
          >
            {defaultOffLabel}
          </span>
          <SwitchPrimitives.Root className={rootClassName} {...rootProps} ref={ref}>
            <SwitchPrimitives.Thumb className={thumbClassName} />
          </SwitchPrimitives.Root>
          <span
            aria-hidden="true"
            className={cn(LABEL_BASE, isOn ? "text-nx-ink" : "text-nx-ink-3", dimmed && "text-nx-ink-3")}
          >
            {defaultOnLabel}
          </span>
        </div>
      );
    }

    // Still no wrapper element: `peer` only reaches a following sibling, so the old
    // <div> around the Root meant a <Label> next to a disabled Switch never
    // dimmed, while the identical markup around a Checkbox did.
    return (
      <SwitchPrimitives.Root className={rootClassName} {...rootProps} ref={ref}>
        <SwitchPrimitives.Thumb className={thumbClassName} />
      </SwitchPrimitives.Root>
    );
  }
);

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
export type { SwitchProps };
