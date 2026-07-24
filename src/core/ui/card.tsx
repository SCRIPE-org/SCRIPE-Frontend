import * as React from "react";
import { useSettings } from "@core/providers/settings-provider";
import { cn, getHoverEffectClasses } from "@core/common/utils";

/**
 * Card — the matte slab
 *
 * A card is structure, not furniture: a hairline edge on a surface step, and
 * nothing else at rest. Hover BRIGHTENS that edge rather than lifting the slab,
 * which is why every treatment below moves border-colour first and reaches for
 * a shadow only in `elevated` — the one style whose entire point is that it
 * floats.
 *
 * What this replaces:
 *  • the default card carried `shadow-sm` at rest, so ~175 files' worth of
 *    static containers were pretending to hover above the page;
 *  • `glass` mixed two rgba() drop shadows by hand and kept a `dark:` twin of
 *    each — four colour literals and a theme ternary in the one file every
 *    surface in the product passes through;
 *  • `solid`/`bordered`/`elevated` reached for the pre-nexus muted/border pair,
 *    so a card never matched the panel it sat inside.
 *
 * The five style NAMES survive because they are a user setting; only their
 * material changed. `card` stays on the element because globals.css hangs the
 * animation-level and hover-effect rules off that class.
 */

const CARD_BASE = "card rounded-nx-lg text-nx-ink";

// Scoped to the three properties a card actually moves. The old path put
// `transition-all` at 300ms on every card, which animated layout properties
// during resize and reflow for no visual gain.
const CARD_MOTION =
  "transition-[border-color,background-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none";

// The settings-driven hover effects (elevate/scale/rotate/slide/shimmer) come
// from a shared helper that ships no reduced-motion path of its own, and its
// `hover:` rules out-specify a plain `motion-reduce:` utility. The important
// flag is the only thing that reliably wins inside the reduce media query — it
// is scoped to this element and to that query, and it buys a real a11y
// guarantee rather than a decoration.
const REDUCED_MOTION_GUARD = "motion-reduce:!transform-none motion-reduce:!transition-none";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const settings = useSettings();

    const getCardClasses = () => {
      // The intrinsic hairline hover is the card's own identity and is always
      // on; the settings effect is the extra layer that "none" switches off.
      const hasHoverEffect =
        settings.hoverEffectType !== "none" && settings.hoverEffectIntensity !== "none";
      const hoverClasses = hasHoverEffect
        ? cn(getHoverEffectClasses(settings.hoverEffectType, settings.hoverEffectIntensity),
            REDUCED_MOTION_GUARD)
        : "";

      switch (settings.cardStyle) {
        case "glass":
          // The ONE deliberate glass surface in the system — an opt-in user
          // setting, never a default. A raised step at 60% behind the blur
          // keeps text legible over whatever it is laid on.
          return cn(
            CARD_BASE,
            CARD_MOTION,
            "border border-nx-line-hi bg-nx-raised/60 backdrop-blur-md",
            "hover:bg-nx-raised/80",
            hoverClasses
          );
        case "solid":
          // No hairline: the fill step alone carries the edge.
          return cn(
            CARD_BASE,
            CARD_MOTION,
            "border-0 bg-nx-raised",
            "hover:bg-nx-raised-2",
            hoverClasses
          );
        case "bordered":
          // Structure only — the double hairline draws the card, the page
          // ground shows through.
          return cn(
            CARD_BASE,
            CARD_MOTION,
            "border-2 border-nx-line bg-transparent",
            "hover:border-nx-line-hi",
            hoverClasses
          );
        case "elevated":
          // The one treatment that genuinely floats, so the one that is allowed
          // a shadow at rest.
          return cn(
            CARD_BASE,
            CARD_MOTION,
            "border border-nx-line bg-nx-surface shadow-nx-popover",
            "hover:border-nx-line-hi hover:shadow-nx-modal",
            hoverClasses
          );
        default:
          return cn(
            CARD_BASE,
            CARD_MOTION,
            "border border-nx-line bg-nx-surface",
            "hover:border-nx-line-hi",
            hoverClasses
          );
      }
    };

    return <div ref={ref} className={cn(getCardClasses(), className)} {...props} />;
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const settings = useSettings();

    const getPadding = () => {
      switch (settings.spacingSize) {
        case "compact":
          return "p-4";
        case "comfortable":
          return "p-8";
        case "spacious":
          return "p-10";
        default:
          return "p-6";
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5", getPadding(), className)}
        {...props}
      />
    );
  }
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const settings = useSettings();

    // A card title used to render at text-2xl by default — LOUDER than the
    // page's own h1 (text-xl in PageHeader), which inverted the hierarchy on
    // every record page in the product. The ladder now sits one step below the
    // page title at each font-size setting.
    const getFontSize = () => {
      switch (settings.fontSize) {
        case "small":
          return "text-base";
        case "large":
          return "text-xl";
        default:
          return "text-lg";
      }
    };

    return (
      <h3
        ref={ref}
        className={cn(
          "font-semibold leading-none tracking-tight text-balance",
          getFontSize(),
          className
        )}
        {...props}
      />
    );
  }
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const settings = useSettings();

  const getFontSize = () => {
    switch (settings.fontSize) {
      case "small":
        return "text-xs";
      case "large":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  return (
    <p
      ref={ref}
      className={cn(getFontSize(), "text-pretty leading-relaxed text-nx-ink-2", className)}
      {...props}
    />
  );
});
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const settings = useSettings();

    const getPadding = () => {
      switch (settings.spacingSize) {
        case "compact":
          return "p-4 pt-0";
        case "comfortable":
          return "p-8 pt-0";
        case "spacious":
          return "p-10 pt-0";
        default:
          return "p-6 pt-0";
      }
    };

    return <div ref={ref} className={cn(getPadding(), className)} {...props} />;
  }
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const settings = useSettings();

    const getPadding = () => {
      switch (settings.spacingSize) {
        case "compact":
          return "p-4 pt-0";
        case "comfortable":
          return "p-8 pt-0";
        case "spacious":
          return "p-10 pt-0";
        default:
          return "p-6 pt-0";
      }
    };

    return (
      <div ref={ref} className={cn("flex items-center", getPadding(), className)} {...props} />
    );
  }
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
