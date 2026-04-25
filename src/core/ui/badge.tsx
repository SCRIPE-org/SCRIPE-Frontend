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
        // Status variants
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
        error: "border-transparent bg-red-500 text-white hover:bg-red-600",
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        info: "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        pending: "border-transparent bg-orange-500 text-white hover:bg-orange-600",
        // Active/Inactive variants
        active: "border-transparent bg-green-500 text-white hover:bg-green-600",
        inactive: "border-transparent bg-gray-500 text-white hover:bg-gray-600",
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
      // DEFAULT STYLE - Solid filled badges
      {
        variant: ["success", "active"],
        badgeStyle: "default",
        class: "bg-green-500 text-white hover:bg-green-600 border-green-500",
      },
      {
        variant: "error",
        badgeStyle: "default",
        class: "bg-red-500 text-white hover:bg-red-600 border-red-500",
      },
      {
        variant: "warning",
        badgeStyle: "default",
        class: "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500",
      },
      {
        variant: "info",
        badgeStyle: "default",
        class: "bg-blue-500 text-white hover:bg-blue-600 border-blue-500",
      },
      {
        variant: "pending",
        badgeStyle: "default",
        class: "bg-orange-500 text-white hover:bg-orange-600 border-orange-500",
      },
      {
        variant: "inactive",
        badgeStyle: "default",
        class: "bg-gray-500 text-white hover:bg-gray-600 border-gray-500",
      },

      // MODERN STYLE - Subtle backgrounds with colored borders
      {
        variant: ["success", "active"],
        badgeStyle: "modern",
        class:
          "bg-green-50/80 text-green-700 border-green-200/50 dark:bg-green-900/10 dark:text-green-400 dark:border-green-700/20",
      },
      {
        variant: "error",
        badgeStyle: "modern",
        class:
          "bg-red-50/80 text-red-700 border-red-200/50 dark:bg-red-900/10 dark:text-red-400 dark:border-red-700/20",
      },
      {
        variant: "warning",
        badgeStyle: "modern",
        class:
          "bg-yellow-50/80 text-yellow-700 border-yellow-200/50 dark:bg-yellow-900/10 dark:text-yellow-400 dark:border-yellow-700/20",
      },
      {
        variant: "info",
        badgeStyle: "modern",
        class:
          "bg-blue-50/80 text-blue-700 border-blue-200/50 dark:bg-blue-900/10 dark:text-blue-400 dark:border-blue-700/20",
      },
      {
        variant: "pending",
        badgeStyle: "modern",
        class:
          "bg-orange-50/80 text-orange-700 border-orange-200/50 dark:bg-orange-900/10 dark:text-orange-400 dark:border-orange-700/20",
      },
      {
        variant: "inactive",
        badgeStyle: "modern",
        class:
          "bg-gray-50/80 text-gray-700 border-gray-200/50 dark:bg-gray-900/10 dark:text-gray-400 dark:border-gray-700/20",
      },

      // GLASS STYLE - Transparent with colored backgrounds and borders
      {
        variant: ["success", "active"],
        badgeStyle: "glass",
        class:
          "bg-green-500/10 text-green-600 border-green-500/20 dark:bg-green-400/10 dark:text-green-400 dark:border-green-400/20",
      },
      {
        variant: "error",
        badgeStyle: "glass",
        class:
          "bg-red-500/10 text-red-600 border-red-500/20 dark:bg-red-400/10 dark:text-red-400 dark:border-red-400/20",
      },
      {
        variant: "warning",
        badgeStyle: "glass",
        class:
          "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:bg-yellow-400/10 dark:text-yellow-400 dark:border-yellow-400/20",
      },
      {
        variant: "info",
        badgeStyle: "glass",
        class:
          "bg-blue-500/10 text-blue-600 border-blue-500/20 dark:bg-blue-400/10 dark:text-blue-400 dark:border-blue-400/20",
      },
      {
        variant: "pending",
        badgeStyle: "glass",
        class:
          "bg-orange-500/10 text-orange-600 border-orange-500/20 dark:bg-orange-400/10 dark:text-orange-400 dark:border-orange-400/20",
      },
      {
        variant: "inactive",
        badgeStyle: "glass",
        class:
          "bg-gray-500/10 text-gray-600 border-gray-500/20 dark:bg-gray-400/10 dark:text-gray-400 dark:border-gray-400/20",
      },

      // NEON STYLE - Dark backgrounds with colored text and glowing shadows
      {
        variant: ["success", "active"],
        badgeStyle: "neon",
        class:
          "bg-green-950 text-green-400 border-green-400/50 shadow-[0_0_10px_rgba(34,197,94,0.3)] dark:bg-green-950/50 dark:shadow-[0_0_15px_rgba(34,197,94,0.4)]",
      },
      {
        variant: "error",
        badgeStyle: "neon",
        class:
          "bg-red-950 text-red-400 border-red-400/50 shadow-[0_0_10px_rgba(239,68,68,0.3)] dark:bg-red-950/50 dark:shadow-[0_0_15px_rgba(239,68,68,0.4)]",
      },
      {
        variant: "warning",
        badgeStyle: "neon",
        class:
          "bg-yellow-950 text-yellow-400 border-yellow-400/50 shadow-[0_0_10px_rgba(234,179,8,0.3)] dark:bg-yellow-950/50 dark:shadow-[0_0_15px_rgba(234,179,8,0.4)]",
      },
      {
        variant: "info",
        badgeStyle: "neon",
        class:
          "bg-blue-950 text-blue-400 border-blue-400/50 shadow-[0_0_10px_rgba(59,130,246,0.3)] dark:bg-blue-950/50 dark:shadow-[0_0_15px_rgba(59,130,246,0.4)]",
      },
      {
        variant: "pending",
        badgeStyle: "neon",
        class:
          "bg-orange-950 text-orange-400 border-orange-400/50 shadow-[0_0_10px_rgba(249,115,22,0.3)] dark:bg-orange-950/50 dark:shadow-[0_0_15px_rgba(249,115,22,0.4)]",
      },
      {
        variant: "inactive",
        badgeStyle: "neon",
        class:
          "bg-gray-950 text-gray-400 border-gray-400/50 shadow-[0_0_10px_rgba(107,114,128,0.3)] dark:bg-gray-950/50 dark:shadow-[0_0_15px_rgba(107,114,128,0.4)]",
      },

      // GRADIENT STYLE - Gradient backgrounds
      {
        variant: ["success", "active"],
        badgeStyle: "gradient",
        class:
          "bg-gradient-to-r from-green-500 to-emerald-500 text-white dark:from-green-600 dark:to-emerald-600",
      },
      {
        variant: "error",
        badgeStyle: "gradient",
        class:
          "bg-gradient-to-r from-red-500 to-rose-500 text-white dark:from-red-600 dark:to-rose-600",
      },
      {
        variant: "warning",
        badgeStyle: "gradient",
        class:
          "bg-gradient-to-r from-yellow-500 to-amber-500 text-white dark:from-yellow-600 dark:to-amber-600",
      },
      {
        variant: "info",
        badgeStyle: "gradient",
        class:
          "bg-gradient-to-r from-blue-500 to-cyan-500 text-white dark:from-blue-600 dark:to-cyan-600",
      },
      {
        variant: "pending",
        badgeStyle: "gradient",
        class:
          "bg-gradient-to-r from-orange-500 to-amber-500 text-white dark:from-orange-600 dark:to-amber-600",
      },
      {
        variant: "inactive",
        badgeStyle: "gradient",
        class:
          "bg-gradient-to-r from-gray-500 to-slate-500 text-white dark:from-gray-600 dark:to-slate-600",
      },

      // OUTLINED STYLE - Transparent backgrounds with colored borders
      {
        variant: ["success", "active"],
        badgeStyle: "outlined",
        class:
          "bg-transparent text-green-600 border-green-500 dark:text-green-400 dark:border-green-400",
      },
      {
        variant: "error",
        badgeStyle: "outlined",
        class: "bg-transparent text-red-600 border-red-500 dark:text-red-400 dark:border-red-400",
      },
      {
        variant: "warning",
        badgeStyle: "outlined",
        class:
          "bg-transparent text-yellow-600 border-yellow-500 dark:text-yellow-400 dark:border-yellow-400",
      },
      {
        variant: "info",
        badgeStyle: "outlined",
        class:
          "bg-transparent text-blue-600 border-blue-500 dark:text-blue-400 dark:border-blue-400",
      },
      {
        variant: "pending",
        badgeStyle: "outlined",
        class:
          "bg-transparent text-orange-600 border-orange-500 dark:text-orange-400 dark:border-orange-400",
      },
      {
        variant: "inactive",
        badgeStyle: "outlined",
        class:
          "bg-transparent text-gray-600 border-gray-500 dark:text-gray-400 dark:border-gray-400",
      },

      // FILLED STYLE - Solid backgrounds (same as default)
      {
        variant: ["success", "active"],
        badgeStyle: "filled",
        class: "bg-green-500 text-white border-green-500 dark:bg-green-600 dark:border-green-600",
      },
      {
        variant: "error",
        badgeStyle: "filled",
        class: "bg-red-500 text-white border-red-500 dark:bg-red-600 dark:border-red-600",
      },
      {
        variant: "warning",
        badgeStyle: "filled",
        class:
          "bg-yellow-500 text-white border-yellow-500 dark:bg-yellow-600 dark:border-yellow-600",
      },
      {
        variant: "info",
        badgeStyle: "filled",
        class: "bg-blue-500 text-white border-blue-500 dark:bg-blue-600 dark:border-blue-600",
      },
      {
        variant: "pending",
        badgeStyle: "filled",
        class:
          "bg-orange-500 text-white border-orange-500 dark:bg-orange-600 dark:border-orange-600",
      },
      {
        variant: "inactive",
        badgeStyle: "filled",
        class: "bg-gray-500 text-white border-gray-500 dark:bg-gray-600 dark:border-gray-600",
      },

      // MINIMAL STYLE - No backgrounds, just colored text
      {
        variant: ["success", "active"],
        badgeStyle: "minimal",
        class: "bg-transparent text-green-600 dark:text-green-400",
      },
      {
        variant: "error",
        badgeStyle: "minimal",
        class: "bg-transparent text-red-600 dark:text-red-400",
      },
      {
        variant: "warning",
        badgeStyle: "minimal",
        class: "bg-transparent text-yellow-600 dark:text-yellow-400",
      },
      {
        variant: "info",
        badgeStyle: "minimal",
        class: "bg-transparent text-blue-600 dark:text-blue-400",
      },
      {
        variant: "pending",
        badgeStyle: "minimal",
        class: "bg-transparent text-orange-600 dark:text-orange-400",
      },
      {
        variant: "inactive",
        badgeStyle: "minimal",
        class: "bg-transparent text-gray-600 dark:text-gray-400",
      },

      // PILL STYLE - Rounded with subtle backgrounds
      {
        variant: ["success", "active"],
        badgeStyle: "pill",
        class:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
      },
      {
        variant: "error",
        badgeStyle: "pill",
        class:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
      },
      {
        variant: "warning",
        badgeStyle: "pill",
        class:
          "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30",
      },
      {
        variant: "info",
        badgeStyle: "pill",
        class:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
      },
      {
        variant: "pending",
        badgeStyle: "pill",
        class:
          "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30",
      },
      {
        variant: "inactive",
        badgeStyle: "pill",
        class:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/30",
      },

      // SQUARE STYLE - Sharp corners with subtle backgrounds
      {
        variant: ["success", "active"],
        badgeStyle: "square",
        class:
          "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/30",
      },
      {
        variant: "error",
        badgeStyle: "square",
        class:
          "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/30",
      },
      {
        variant: "warning",
        badgeStyle: "square",
        class:
          "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800/30",
      },
      {
        variant: "info",
        badgeStyle: "square",
        class:
          "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800/30",
      },
      {
        variant: "pending",
        badgeStyle: "square",
        class:
          "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800/30",
      },
      {
        variant: "inactive",
        badgeStyle: "square",
        class:
          "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900/20 dark:text-gray-400 dark:border-gray-800/30",
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
