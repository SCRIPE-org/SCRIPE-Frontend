"use client";

import type { BadgeBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";

const VARIANT_CLASS = {
  success: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  warning: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  neutral: "bg-muted text-muted-foreground",
  premium: "bg-primary/10 text-primary",
};

/**
 * Presentation UI component rendering the badge block view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function BadgeBlockView({ block }: { block: BadgeBlock }) {
  const props = block.props;
  return (
    <span
      className={[
        "inline-flex items-center gap-1 font-medium",
        props.size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        props.pill ? "rounded-full" : "rounded-md",
        VARIANT_CLASS[props.variant || "neutral"],
      ].join(" ")}
    >
      {props.icon && <span aria-hidden="true">{props.icon}</span>}
      {props.label}
    </span>
  );
}
