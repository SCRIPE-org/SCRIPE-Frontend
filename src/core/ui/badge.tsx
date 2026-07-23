import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

// The house badge is the nexus tint chip: a 13-15% fill of its own hue behind
// a same-hue hairline, hue-strength text. Badges are non-interactive spans,
// so there are no hover classes anywhere in this file; the transition only
// smooths dynamic status flips. Focus (for the rare focusable composition)
// is :focus-visible with the --nx-focus lit-edge ring.
const badgeVariants = cva(
  "badge inline-flex items-center font-semibold transition-colors duration-nx-standard motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus px-2.5 py-0.5 text-xs",
  {
    variants: {
      variant: {
        // The workspace accent chip — wash fill, accent text, same-hue
        // hairline. The wash + accent tokens flip with the theme themselves.
        default:
          "border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash text-nx-accent",
        secondary: "border-nx-line bg-nx-raised text-nx-ink-2",
        destructive: "border-destructive/30 bg-destructive/15 text-destructive",
        outline: "border-nx-line-hi bg-transparent text-nx-ink",
        // Status variants — the global measured status tokens (which the
        // --nx- status vars alias); the hsl-triplet form keeps the slash-
        // alpha tint ladder working. Same tint treatment as default:
        // 15% fill, 30% hairline, hue-strength text.
        success: "border-success/30 bg-success/15 text-success",
        error: "border-destructive/30 bg-destructive/15 text-destructive",
        warning: "border-warning/30 bg-warning/15 text-warning",
        info: "border-info/30 bg-info/15 text-info",
        pending: "border-warning-strong/30 bg-warning-strong/15 text-warning-strong",
        // Active/Inactive variants
        active: "border-success/30 bg-success/15 text-success",
        inactive: "border-nx-line bg-nx-raised text-nx-ink-3",
      },
      badgeStyle: {
        // The default style adds only shape — border width and the nx-sm-ish
        // pill radius. Colour (fill, text, hairline) comes straight from the
        // variant rows above, so no per-variant compound block is needed.
        default: "rounded-full border",
        modern: "rounded-lg border border-nx-line backdrop-blur-sm shadow-nx-sm",
        glass: "rounded-xl border border-nx-line backdrop-blur-md shadow-lg",
        neon: "rounded-md border border-primary/40 shadow-lg shadow-primary/20",
        gradient: "rounded-full border-0 shadow-lg",
        outlined: "rounded-lg border-2 border-primary/50",
        filled: "rounded-md border-0 shadow-md",
        minimal: "rounded-none border-0",
        pill: "rounded-full border border-nx-line",
        square: "rounded-sm border border-nx-line",
      },
    },
    compoundVariants: [
      // Status hues below are sourced from semantic tokens only. Each named
      // style keeps its own structural signature (fill weight, tint ladder,
      // gradient direction, glow radius) so the styles stay distinguishable;
      // only the hue source changed. Tokens resolve per theme, so the old
      // `dark:` re-pins are gone.
      //
      // Tint ladder shared by the translucent styles:
      //   glass  (10%) < default/modern (15%) < pill/square (20%)

      // MODERN STYLE - Subtle backgrounds with colored borders
      {
        variant: ["success", "active"],
        badgeStyle: "modern",
        class: "bg-success/15 text-success border-success/25",
      },
      {
        variant: "error",
        badgeStyle: "modern",
        class: "bg-destructive/15 text-destructive border-destructive/25",
      },
      {
        variant: "warning",
        badgeStyle: "modern",
        class: "bg-warning/15 text-warning border-warning/25",
      },
      {
        variant: "info",
        badgeStyle: "modern",
        class: "bg-info/15 text-info border-info/25",
      },
      {
        variant: "pending",
        badgeStyle: "modern",
        class: "bg-warning-strong/15 text-warning-strong border-warning-strong/25",
      },
      {
        variant: "inactive",
        badgeStyle: "modern",
        class: "bg-muted/60 text-muted-foreground border-border/50",
      },

      // GLASS STYLE - Transparent with colored backgrounds and borders
      {
        variant: ["success", "active"],
        badgeStyle: "glass",
        class: "bg-success/10 text-success border-success/20",
      },
      {
        variant: "error",
        badgeStyle: "glass",
        class: "bg-destructive/10 text-destructive border-destructive/20",
      },
      {
        variant: "warning",
        badgeStyle: "glass",
        class: "bg-warning/10 text-warning border-warning/20",
      },
      {
        variant: "info",
        badgeStyle: "glass",
        class: "bg-info/10 text-info border-info/20",
      },
      {
        variant: "pending",
        badgeStyle: "glass",
        class: "bg-warning-strong/10 text-warning-strong border-warning-strong/20",
      },
      {
        variant: "inactive",
        badgeStyle: "glass",
        class: "bg-muted/40 text-muted-foreground border-border/40",
      },

      // NEON STYLE - Deep tinted plate, bright hue, glowing shadow
      {
        variant: ["success", "active"],
        badgeStyle: "neon",
        class:
          "bg-success/15 text-success border-success/60 shadow-[0_0_12px_hsl(var(--success)/0.35)]",
      },
      {
        variant: "error",
        badgeStyle: "neon",
        class:
          "bg-destructive/15 text-destructive border-destructive/60 shadow-[0_0_12px_hsl(var(--destructive)/0.35)]",
      },
      {
        variant: "warning",
        badgeStyle: "neon",
        class:
          "bg-warning/15 text-warning border-warning/60 shadow-[0_0_12px_hsl(var(--warning)/0.35)]",
      },
      {
        variant: "info",
        badgeStyle: "neon",
        class: "bg-info/15 text-info border-info/60 shadow-[0_0_12px_hsl(var(--info)/0.35)]",
      },
      {
        variant: "pending",
        badgeStyle: "neon",
        class:
          "bg-warning-strong/15 text-warning-strong border-warning-strong/60 shadow-[0_0_12px_hsl(var(--warning-strong)/0.35)]",
      },
      {
        variant: "inactive",
        badgeStyle: "neon",
        class:
          "bg-muted/50 text-muted-foreground border-muted-foreground/50 shadow-[0_0_12px_hsl(var(--muted-foreground)/0.35)]",
      },

      // GRADIENT STYLE - Gradient backgrounds
      {
        variant: ["success", "active"],
        badgeStyle: "gradient",
        class: "bg-gradient-to-r from-success to-success/70 text-success-foreground",
      },
      {
        variant: "error",
        badgeStyle: "gradient",
        class: "bg-gradient-to-r from-destructive to-destructive/70 text-destructive-foreground",
      },
      {
        variant: "warning",
        badgeStyle: "gradient",
        class: "bg-gradient-to-r from-warning to-warning/70 text-warning-foreground",
      },
      {
        variant: "info",
        badgeStyle: "gradient",
        class: "bg-gradient-to-r from-info to-info/70 text-info-foreground",
      },
      {
        // The one gradient that spans two real severity steps, matching the
        // original orange→amber ramp.
        variant: "pending",
        badgeStyle: "gradient",
        class: "bg-gradient-to-r from-warning-strong to-warning text-warning-strong-foreground",
      },
      {
        variant: "inactive",
        badgeStyle: "gradient",
        class: "bg-gradient-to-r from-muted to-muted/70 text-muted-foreground",
      },

      // OUTLINED STYLE - Transparent backgrounds with colored borders
      {
        variant: ["success", "active"],
        badgeStyle: "outlined",
        class: "bg-transparent text-success border-success",
      },
      {
        variant: "error",
        badgeStyle: "outlined",
        class: "bg-transparent text-destructive border-destructive",
      },
      {
        variant: "warning",
        badgeStyle: "outlined",
        class: "bg-transparent text-warning border-warning",
      },
      {
        variant: "info",
        badgeStyle: "outlined",
        class: "bg-transparent text-info border-info",
      },
      {
        variant: "pending",
        badgeStyle: "outlined",
        class: "bg-transparent text-warning-strong border-warning-strong",
      },
      {
        variant: "inactive",
        badgeStyle: "outlined",
        class: "bg-transparent text-muted-foreground border-muted-foreground",
      },

      // FILLED STYLE - Solid backgrounds (the loud option, kept as a named
      // style now that the default is the tint chip)
      {
        variant: ["success", "active"],
        badgeStyle: "filled",
        class: "bg-success text-success-foreground border-success",
      },
      {
        variant: "error",
        badgeStyle: "filled",
        class: "bg-destructive text-destructive-foreground border-destructive",
      },
      {
        variant: "warning",
        badgeStyle: "filled",
        class: "bg-warning text-warning-foreground border-warning",
      },
      {
        variant: "info",
        badgeStyle: "filled",
        class: "bg-info text-info-foreground border-info",
      },
      {
        variant: "pending",
        badgeStyle: "filled",
        class: "bg-warning-strong text-warning-strong-foreground border-warning-strong",
      },
      {
        variant: "inactive",
        badgeStyle: "filled",
        class: "bg-muted text-muted-foreground border-border",
      },

      // MINIMAL STYLE - No backgrounds, just colored text
      {
        variant: ["success", "active"],
        badgeStyle: "minimal",
        class: "bg-transparent text-success",
      },
      {
        variant: "error",
        badgeStyle: "minimal",
        class: "bg-transparent text-destructive",
      },
      {
        variant: "warning",
        badgeStyle: "minimal",
        class: "bg-transparent text-warning",
      },
      {
        variant: "info",
        badgeStyle: "minimal",
        class: "bg-transparent text-info",
      },
      {
        variant: "pending",
        badgeStyle: "minimal",
        class: "bg-transparent text-warning-strong",
      },
      {
        variant: "inactive",
        badgeStyle: "minimal",
        class: "bg-transparent text-muted-foreground",
      },

      // PILL STYLE - Rounded with subtle backgrounds
      {
        variant: ["success", "active"],
        badgeStyle: "pill",
        class: "bg-success/20 text-success border-success/30",
      },
      {
        variant: "error",
        badgeStyle: "pill",
        class: "bg-destructive/20 text-destructive border-destructive/30",
      },
      {
        variant: "warning",
        badgeStyle: "pill",
        class: "bg-warning/20 text-warning border-warning/30",
      },
      {
        variant: "info",
        badgeStyle: "pill",
        class: "bg-info/20 text-info border-info/30",
      },
      {
        variant: "pending",
        badgeStyle: "pill",
        class: "bg-warning-strong/20 text-warning-strong border-warning-strong/30",
      },
      {
        variant: "inactive",
        badgeStyle: "pill",
        class: "bg-muted text-muted-foreground border-border",
      },

      // SQUARE STYLE - Sharp corners with subtle backgrounds
      {
        variant: ["success", "active"],
        badgeStyle: "square",
        class: "bg-success/20 text-success border-success/30",
      },
      {
        variant: "error",
        badgeStyle: "square",
        class: "bg-destructive/20 text-destructive border-destructive/30",
      },
      {
        variant: "warning",
        badgeStyle: "square",
        class: "bg-warning/20 text-warning border-warning/30",
      },
      {
        variant: "info",
        badgeStyle: "square",
        class: "bg-info/20 text-info border-info/30",
      },
      {
        variant: "pending",
        badgeStyle: "square",
        class: "bg-warning-strong/20 text-warning-strong border-warning-strong/30",
      },
      {
        variant: "inactive",
        badgeStyle: "square",
        class: "bg-muted text-muted-foreground border-border",
      },
    ],
    defaultVariants: {
      variant: "default",
      badgeStyle: "default",
    },
  }
);

// Stored settings can hold legacy values the variant map no longer knows;
// cva would silently apply NO style for those, so unknowns fall back to
// default here. The stored-value migration itself is Wave C's job.
const KNOWN_BADGE_STYLES = [
  "default",
  "modern",
  "glass",
  "neon",
  "gradient",
  "outlined",
  "filled",
  "minimal",
  "pill",
  "square",
] as const;
type KnownBadgeStyle = (typeof KNOWN_BADGE_STYLES)[number];

const resolveBadgeStyle = (value: string | undefined | null): KnownBadgeStyle =>
  (KNOWN_BADGE_STYLES as readonly string[]).includes(value ?? "")
    ? (value as KnownBadgeStyle)
    : "default";

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  const settings = useSettings();

  return (
    <span
      className={cn(
        badgeVariants({
          variant,
          badgeStyle: resolveBadgeStyle(settings.badgeStyle),
          className,
        })
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
