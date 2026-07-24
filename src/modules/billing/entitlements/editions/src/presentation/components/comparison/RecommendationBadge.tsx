/**
 * RecommendationBadge — the "Most Popular" / "Best Value" pill on an edition.
 *
 * The fill used to be an OKLCH triple derived from a hash of the label text, so
 * rewording the copy silently repainted the chip — and painted it in a hue the
 * workspace never chose, which is the one thing an accent-owned product must
 * not do. The pill is a reading about the plan the product is pointing at, so
 * it now wears the workspace accent tint: wash fill, same-hue hairline, accent
 * ink. `--nx-accent` is a complete colour rather than an HSL triplet, so its
 * tint is written with color-mix — Tailwind drops slash-alpha on a var-valued
 * colour.
 *
 * A badge is a reading, not a control: it never hovers, lifts or casts a shadow.
 */
"use client";

import { cn } from "@core/common/utils";
import { Star } from "lucide-react";

interface RecommendationBadgeProps {
  label: string;
  size?: "sm" | "md";
}

/**
 * Presentation UI component rendering the recommendation badge.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function RecommendationBadge({ label, size = "md" }: RecommendationBadgeProps) {
  const isSmall = size === "sm";

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full border font-semibold",
        "border-[color:color-mix(in_srgb,var(--nx-accent)_30%,transparent)] bg-nx-accent-wash text-nx-accent",
        isSmall ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"
      )}
    >
      <Star aria-hidden="true" className={cn("shrink-0", isSmall ? "h-2.5 w-2.5" : "h-3 w-3")} />
      {label}
    </span>
  );
}
