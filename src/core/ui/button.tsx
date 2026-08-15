import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useSettings } from "@core/providers/settings-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { cn } from "@core/common/utils";

// ONE weight ladder, loudest → quietest, with no two rungs close enough to be
// confused at a glance:
//
//   default      accent fill        the page's single primary action
//   destructive  danger fill        the same weight, its own hue
//   secondary    neutral fill       a real button, deliberately not the CTA
//   outline      hairline, no fill  the row-of-actions default
//   ghost        nothing at rest    toolbars, table row actions
//   link         ink only           inline navigation
//
// Before this pass `default` was a raised surface behind a hairline, which put
// it within one 4% fill step of `secondary` AND of `outline` — three quiet
// rungs and no primary at all, so "Save" and "Cancel" carried the same weight.
// The filled primary is back; the old quiet default survives as `secondary`.
//
// Motion is state, never decoration: colour/edge only, at the micro step. No
// variant casts a drop shadow at any point — a button does not float; the only
// shadows here are INSET edges, which are structure. Press is the lit edge
// closing around the control plus a 1px scrim depression, the one transform-
// free way to feel a click. Focus is the shared --nx-focus lit-edge ring,
// lifted one semantic z step so a neighbour in a button row cannot clip its
// halo.
const buttonVariants = cva(
  [
    "relative inline-flex select-none items-center justify-center whitespace-nowrap",
    "border border-transparent text-sm font-medium tabular-nums",
    "transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none",
    "focus-visible:outline-none focus-visible:shadow-nx-focus focus-visible:z-raised",
    "active:shadow-[inset_0_0_0_1px_var(--nx-accent),inset_0_1px_2px_0_var(--nx-scrim)]",
    // Disabled is a dedicated surface + ink pair, never opacity math — a 50%
    // veil over a tinted fill reads as "half-loaded", not "unavailable".
    "disabled:pointer-events-none disabled:border-nx-line disabled:bg-nx-raised disabled:text-nx-ink-3 disabled:shadow-none",
    // asChild renders an <a>/<Link>, which ignores `disabled` entirely — the
    // aria-disabled arm is what actually makes a disabled link inert.
    "aria-disabled:pointer-events-none aria-disabled:text-nx-ink-3 aria-disabled:shadow-none",
    // Icons never squash under a long label and never become the event target.
    // Icon SIZE stays with the caller: ~900 call sites already size their own.
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        // PRIMARY. The fill does not move on hover: --nx-accent-fill is pinned
        // at the lightness that holds 4.84:1 against --nx-on-fill, so
        // brightening it would trade contrast for feedback. It carries the same
        // inset on-fill top highlight the Switch and Slider use to make a
        // filled surface read as a surface, and hover closes a full accent edge
        // around it while lifting that highlight.
        default:
          "border-nx-accent-fill bg-nx-accent-fill text-nx-on-fill shadow-[inset_0_1px_0_0_color-mix(in_srgb,var(--nx-on-fill)_22%,transparent)] hover:shadow-[inset_0_0_0_1px_var(--nx-accent),inset_0_1px_0_0_color-mix(in_srgb,var(--nx-on-fill)_35%,transparent)] aria-disabled:border-nx-line aria-disabled:bg-nx-raised aria-disabled:shadow-none",
        // Same weight as primary, its own hue all the way down. Destructive
        // presses in its own colour — the shared accent inset would light a
        // violet edge on a red button, exactly the wrong signal on a delete.
        destructive:
          "border-destructive bg-destructive text-destructive-foreground shadow-[inset_0_1px_0_0_hsl(var(--destructive-foreground)/0.22)] hover:bg-destructive/90 hover:shadow-[inset_0_1px_0_0_hsl(var(--destructive-foreground)/0.38)] active:shadow-[inset_0_0_0_1px_hsl(var(--destructive-foreground)/0.45),inset_0_1px_2px_0_var(--nx-scrim)] aria-disabled:border-nx-line aria-disabled:bg-nx-raised aria-disabled:shadow-none",
        outline:
          "border-nx-line-hi bg-transparent text-nx-ink hover:bg-nx-hover disabled:border-nx-line disabled:bg-transparent aria-disabled:bg-transparent",
        // The old `default`: a real fill, one step of ground, deliberately
        // neutral. Hover steps UP the ladder in both themes (raised → raised-2
        // is lighter in dark and darker in light — "more" either way).
        secondary:
          "border-nx-line bg-nx-raised text-nx-ink hover:border-nx-line-hi hover:bg-nx-raised-2",
        // Quietest interactive rung: nothing at rest, ink promotes on hover so
        // a toolbar reads as one calm row until you reach for it.
        ghost:
          "bg-transparent text-nx-ink-2 hover:bg-nx-hover hover:text-nx-ink disabled:border-transparent disabled:bg-transparent aria-disabled:bg-transparent",
        link: "bg-transparent text-nx-accent underline-offset-4 hover:underline active:shadow-none disabled:border-transparent disabled:bg-transparent disabled:no-underline aria-disabled:bg-transparent aria-disabled:no-underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
        // Square target: 40px, well clear of the 32px floor, and the fixed
        // width keeps icon-only buttons optically centred at every radius.
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** When true, shows an animated spinner inside the button and disables interaction */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref
  ) => {
    const settings = useSettings();
    const Comp = asChild ? Slot : "button";
    const isInert = disabled || loading;

    const getButtonClasses = () => {
      let radiusClasses = "";

      // The Settings buttonStyle values, mapped onto the nx radius ladder
      // (sm 6 / control 8 / md 10 / lg 14 / full). The old free-floating
      // Tailwind radii collapse onto the nearest step; unknown/legacy stored
      // values fall through to the borderRadius mapping below — the
      // stored-value migration itself is Wave C's job.
      switch (settings.buttonStyle) {
        case "sharp":
          radiusClasses = "rounded-none";
          break;
        case "small-round":
          radiusClasses = "rounded-nx-sm";
          break;
        case "medium-round":
          radiusClasses = "rounded-nx-control";
          break;
        case "large-round":
        case "modern":
          radiusClasses = "rounded-nx-md";
          break;
        case "extra-round":
          radiusClasses = "rounded-nx-lg";
          break;
        case "super-round":
        case "rounded":
          radiusClasses = "rounded-full";
          break;
        default:
          // "default" (and any unknown value) defers to the borderRadius
          // setting, mapped onto the same ladder.
          switch (settings.borderRadius) {
            case "none":
              radiusClasses = "rounded-none";
              break;
            case "small":
              radiusClasses = "rounded-nx-sm";
              break;
            case "large":
              radiusClasses = "rounded-nx-lg";
              break;
            case "full":
              radiusClasses = "rounded-full";
              break;
            default:
              radiusClasses = "rounded-nx-control";
          }
      }

      // The micro colour/edge shift lives in the base cva; animationLevel
      // "none" switches it off entirely. Every other level rides the token
      // motion — there is no scale tier anymore.
      const animationClasses = settings.animationLevel === "none" ? "transition-none" : "";

      return cn(radiusClasses, animationClasses);
    };

    // For asChild mode, we can't inject spinner children — just pass through.
    // aria-disabled/aria-busy carry the state to assistive tech AND to the
    // aria-disabled: style arm, which is what actually stops a disabled link
    // from navigating; consumer-supplied aria wins via the later spread.
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size }), getButtonClasses(), className)}
          ref={ref}
          disabled={isInert}
          aria-disabled={isInert || undefined}
          aria-busy={loading || undefined}
          data-loading={loading || undefined}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size }), getButtonClasses(), className)}
        ref={ref}
        disabled={isInert}
        aria-busy={loading || undefined}
        data-loading={loading || undefined}
        {...props}
      >
        {loading && (
          <LoadingSpinner
            size="inline"
            showText={false}
            className={cn("shrink-0", children ? "me-2" : "")}
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
