import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

// A badge is a READING, not a control. It never hovers, never lifts, never
// casts a shadow, and never wears a fill weight that could be mistaken for a
// button — that is the whole brief, and this file used to fail it: `neon` shed
// a coloured 12px glow at rest, `glass` and `modern` carried backdrop-blur plus
// shadow-lg, `filled` a shadow-md, `gradient` a two-stop ramp. Ten "styles",
// nine of them decoration.
//
// The ten names survive (they are persisted user settings and the settings
// preview renders all of them), but each is now cut from STRUCTURE only —
// radius, border weight, fill weight. Nothing floats, nothing glows, nothing
// blurs, and no chip is louder than the state it reports:
//
//   fill ladder   glass 10% < default/modern 15% < pill/square 20%
//                 < neon (deep + 60% hairline) < outlined (0%, full hairline)
//                 < filled/gradient (solid + on-fill ink)
//   shape ladder  pill (default/gradient/pill) · soft square (modern/neon/
//                 outlined/filled) · control (glass) · sharp (square/minimal)
//
// The `badge` class stays on the root: globals.css hangs the moderate-animation
// entrance off it. Badges are non-interactive spans, so there are no hover
// classes anywhere in this file; the transition only smooths dynamic status
// flips. Focus (for the rare focusable composition) is :focus-visible with the
// --nx-focus lit-edge ring.
const badgeVariants = cva(
  "badge inline-flex items-center gap-1 whitespace-nowrap align-middle px-2.5 py-0.5 text-xs font-semibold tabular-nums transition-colors duration-nx-standard motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        // The workspace accent chip — wash fill, accent text, same-hue
        // hairline. --nx-accent is a complete colour, not an hsl triplet, so
        // its tint ladder is written with color-mix rather than slash-alpha
        // (which Tailwind would silently drop on a var-valued colour).
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
        // Shape and border weight only. Colour (fill, text, hairline) comes
        // from the variant rows above, re-pitched per style by the table below.
        default: "rounded-full border",
        modern: "rounded-nx-sm border",
        glass: "rounded-nx-control border",
        neon: "rounded-nx-sm border",
        gradient: "rounded-full border",
        outlined: "rounded-nx-sm border",
        filled: "rounded-nx-sm border",
        minimal: "rounded-none border-0",
        pill: "rounded-full border",
        square: "rounded-none border",
      },
    },
    compoundVariants: [
      // ── FILL LADDER ──────────────────────────────────────────────────────
      // Every hue family appears in every style; the previous table skipped
      // `default` (accent), `secondary`, `outline` and `destructive` entirely,
      // so those four fell through to the 15% wash no matter which style was
      // selected — a "filled" destructive badge rendered as a translucent one.
      //
      // Neutral families (secondary / outline / inactive) resolve on the nx
      // surface + ink ladder, never on `muted`/`border`, so they track the
      // theme with everything else.

      // MODERN — soft square, 15% wash (same weight as default, different shape)
      {
        variant: ["success", "active"],
        badgeStyle: "modern",
        class: "border-success/25 bg-success/15 text-success",
      },
      {
        variant: ["error", "destructive"],
        badgeStyle: "modern",
        class: "border-destructive/25 bg-destructive/15 text-destructive",
      },
      {
        variant: "warning",
        badgeStyle: "modern",
        class: "border-warning/25 bg-warning/15 text-warning",
      },
      {
        variant: "info",
        badgeStyle: "modern",
        class: "border-info/25 bg-info/15 text-info",
      },
      {
        variant: "pending",
        badgeStyle: "modern",
        class: "border-warning-strong/25 bg-warning-strong/15 text-warning-strong",
      },
      {
        variant: "inactive",
        badgeStyle: "modern",
        class: "border-nx-line bg-nx-raised text-nx-ink-3",
      },

      // GLASS — the quietest chip: 10% fill on a 20% hairline. (No blur: a
      // backdrop-filter under a 20px-tall span is pure cost for no signal.)
      {
        variant: "default",
        badgeStyle: "glass",
        class:
          "border-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)] bg-[color:color-mix(in_srgb,var(--nx-accent)_10%,transparent)] text-nx-accent",
      },
      {
        variant: ["success", "active"],
        badgeStyle: "glass",
        class: "border-success/20 bg-success/10 text-success",
      },
      {
        variant: ["error", "destructive"],
        badgeStyle: "glass",
        class: "border-destructive/20 bg-destructive/10 text-destructive",
      },
      {
        variant: "warning",
        badgeStyle: "glass",
        class: "border-warning/20 bg-warning/10 text-warning",
      },
      {
        variant: "info",
        badgeStyle: "glass",
        class: "border-info/20 bg-info/10 text-info",
      },
      {
        variant: "pending",
        badgeStyle: "glass",
        class: "border-warning-strong/20 bg-warning-strong/10 text-warning-strong",
      },
      {
        variant: "inactive",
        badgeStyle: "glass",
        class: "border-nx-line bg-nx-raised text-nx-ink-3",
      },

      // NEON — the loud translucent: deep hue hairline at 60%, wash fill,
      // hue-strength ink. The 12px coloured glow it used to cast is gone; a
      // status chip is not the one element per screen allowed to emit light.
      {
        variant: "default",
        badgeStyle: "neon",
        class:
          "border-[color:color-mix(in_srgb,var(--nx-accent)_60%,transparent)] bg-nx-accent-wash text-nx-accent",
      },
      {
        variant: ["success", "active"],
        badgeStyle: "neon",
        class: "border-success/60 bg-success/15 text-success",
      },
      {
        variant: ["error", "destructive"],
        badgeStyle: "neon",
        class: "border-destructive/60 bg-destructive/15 text-destructive",
      },
      {
        variant: "warning",
        badgeStyle: "neon",
        class: "border-warning/60 bg-warning/15 text-warning",
      },
      {
        variant: "info",
        badgeStyle: "neon",
        class: "border-info/60 bg-info/15 text-info",
      },
      {
        variant: "pending",
        badgeStyle: "neon",
        class: "border-warning-strong/60 bg-warning-strong/15 text-warning-strong",
      },
      {
        variant: ["secondary", "outline", "inactive"],
        badgeStyle: "neon",
        class: "border-nx-line-hi bg-nx-raised-2 text-nx-ink",
      },

      // GRADIENT — the solid pill. The name is kept because it is persisted in
      // user settings; the two-stop ramp is not, because gradient fill on a
      // 20px chip is decoration with no state to report.
      {
        variant: "default",
        badgeStyle: "gradient",
        class: "border-nx-accent-fill bg-nx-accent-fill text-nx-on-fill",
      },
      {
        variant: ["success", "active"],
        badgeStyle: "gradient",
        class: "border-success bg-success text-success-foreground",
      },
      {
        variant: ["error", "destructive"],
        badgeStyle: "gradient",
        class: "border-destructive bg-destructive text-destructive-foreground",
      },
      {
        variant: "warning",
        badgeStyle: "gradient",
        class: "border-warning bg-warning text-warning-foreground",
      },
      {
        variant: "info",
        badgeStyle: "gradient",
        class: "border-info bg-info text-info-foreground",
      },
      {
        variant: "pending",
        badgeStyle: "gradient",
        class: "border-warning-strong bg-warning-strong text-warning-strong-foreground",
      },
      {
        variant: ["secondary", "outline", "inactive"],
        badgeStyle: "gradient",
        class: "border-nx-line-hi bg-nx-raised-2 text-nx-ink",
      },

      // OUTLINED — full-strength hairline, no fill.
      {
        variant: "default",
        badgeStyle: "outlined",
        class: "border-nx-accent bg-transparent text-nx-accent",
      },
      {
        variant: ["success", "active"],
        badgeStyle: "outlined",
        class: "border-success bg-transparent text-success",
      },
      {
        variant: ["error", "destructive"],
        badgeStyle: "outlined",
        class: "border-destructive bg-transparent text-destructive",
      },
      {
        variant: "warning",
        badgeStyle: "outlined",
        class: "border-warning bg-transparent text-warning",
      },
      {
        variant: "info",
        badgeStyle: "outlined",
        class: "border-info bg-transparent text-info",
      },
      {
        variant: "pending",
        badgeStyle: "outlined",
        class: "border-warning-strong bg-transparent text-warning-strong",
      },
      {
        variant: ["secondary", "inactive"],
        badgeStyle: "outlined",
        class: "border-nx-line-hi bg-transparent text-nx-ink-2",
      },

      // FILLED — solid soft square. The loud option, an explicit opt-in now
      // that the default is the tint chip.
      {
        variant: "default",
        badgeStyle: "filled",
        class: "border-nx-accent-fill bg-nx-accent-fill text-nx-on-fill",
      },
      {
        variant: ["success", "active"],
        badgeStyle: "filled",
        class: "border-success bg-success text-success-foreground",
      },
      {
        variant: ["error", "destructive"],
        badgeStyle: "filled",
        class: "border-destructive bg-destructive text-destructive-foreground",
      },
      {
        variant: "warning",
        badgeStyle: "filled",
        class: "border-warning bg-warning text-warning-foreground",
      },
      {
        variant: "info",
        badgeStyle: "filled",
        class: "border-info bg-info text-info-foreground",
      },
      {
        variant: "pending",
        badgeStyle: "filled",
        class: "border-warning-strong bg-warning-strong text-warning-strong-foreground",
      },
      {
        variant: ["secondary", "outline", "inactive"],
        badgeStyle: "filled",
        class: "border-nx-line-hi bg-nx-raised-2 text-nx-ink",
      },

      // MINIMAL — hue-strength ink on nothing. The chip is the word.
      {
        variant: "default",
        badgeStyle: "minimal",
        class: "bg-transparent text-nx-accent",
      },
      {
        variant: ["success", "active"],
        badgeStyle: "minimal",
        class: "bg-transparent text-success",
      },
      {
        variant: ["error", "destructive"],
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
        variant: ["secondary", "outline"],
        badgeStyle: "minimal",
        class: "bg-transparent text-nx-ink-2",
      },
      {
        variant: "inactive",
        badgeStyle: "minimal",
        class: "bg-transparent text-nx-ink-3",
      },

      // PILL / SQUARE — same 20% fill, opposite corners: the roundest chip and
      // the sharpest one, for callers who need shape alone to separate two
      // badge populations in the same table.
      {
        variant: "default",
        badgeStyle: ["pill", "square"],
        class:
          "border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-[color:color-mix(in_srgb,var(--nx-accent)_20%,transparent)] text-nx-accent",
      },
      {
        variant: ["success", "active"],
        badgeStyle: ["pill", "square"],
        class: "border-success/30 bg-success/20 text-success",
      },
      {
        variant: ["error", "destructive"],
        badgeStyle: ["pill", "square"],
        class: "border-destructive/30 bg-destructive/20 text-destructive",
      },
      {
        variant: "warning",
        badgeStyle: ["pill", "square"],
        class: "border-warning/30 bg-warning/20 text-warning",
      },
      {
        variant: "info",
        badgeStyle: ["pill", "square"],
        class: "border-info/30 bg-info/20 text-info",
      },
      {
        variant: "pending",
        badgeStyle: ["pill", "square"],
        class: "border-warning-strong/30 bg-warning-strong/20 text-warning-strong",
      },
      {
        variant: "inactive",
        badgeStyle: ["pill", "square"],
        class: "border-nx-line bg-nx-raised-2 text-nx-ink-3",
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
