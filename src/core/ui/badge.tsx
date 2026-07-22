import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

const badgeVariants = cva(
  "badge inline-flex items-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 px-2.5 py-0.5 text-xs",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground border-border",
        // Status variants — semantic tokens, so they follow the theme and the
        // tenant's palette instead of pinning a fixed Tailwind shade. Each
        // token pair is contrast-checked against its own theme surface.
        success: "border-transparent bg-success text-success-foreground hover:bg-success/85",
        error:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/85",
        warning: "border-transparent bg-warning text-warning-foreground hover:bg-warning/85",
        info: "border-transparent bg-info text-info-foreground hover:bg-info/85",
        pending:
          "border-transparent bg-warning-strong text-warning-strong-foreground hover:bg-warning-strong/85",
        // Active/Inactive variants
        active: "border-transparent bg-success text-success-foreground hover:bg-success/85",
        inactive: "border-transparent bg-muted text-muted-foreground hover:bg-muted/85",
      },
      badgeStyle: {
        default: "rounded-full border border-border",
        modern: "rounded-lg border border-border/50 backdrop-blur-sm shadow-sm hover:shadow-md",
        glass: "rounded-xl border border-border/30 backdrop-blur-md shadow-lg hover:shadow-xl",
        neon: "rounded-md border border-primary/40 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:shadow-xl",
        gradient: "rounded-full border-0 shadow-lg",
        outlined: "rounded-lg border-2 border-primary/50 hover:border-primary/70",
        filled: "rounded-md border-0 shadow-md hover:shadow-lg",
        minimal: "rounded-none border-0",
        pill: "rounded-full border border-border hover:shadow-md",
        square: "rounded-sm border border-border hover:shadow-sm",
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
      //   glass  (10%) < modern (15%) < pill/square (20%)

      // DEFAULT STYLE - Solid filled badges
      {
        variant: ["success", "active"],
        badgeStyle: "default",
        class: "bg-success text-success-foreground hover:bg-success/85 border-success",
      },
      {
        variant: "error",
        badgeStyle: "default",
        class:
          "bg-destructive text-destructive-foreground hover:bg-destructive/85 border-destructive",
      },
      {
        variant: "warning",
        badgeStyle: "default",
        class: "bg-warning text-warning-foreground hover:bg-warning/85 border-warning",
      },
      {
        variant: "info",
        badgeStyle: "default",
        class: "bg-info text-info-foreground hover:bg-info/85 border-info",
      },
      {
        variant: "pending",
        badgeStyle: "default",
        class:
          "bg-warning-strong text-warning-strong-foreground hover:bg-warning-strong/85 border-warning-strong",
      },
      {
        variant: "inactive",
        badgeStyle: "default",
        class: "bg-muted text-muted-foreground hover:bg-muted/85 border-border",
      },

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

      // FILLED STYLE - Solid backgrounds (same as default)
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

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  const settings = useSettings();

  return (
    <span
      className={cn(
        badgeVariants({
          variant,
          badgeStyle: settings.badgeStyle,
          className,
        })
      )}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
