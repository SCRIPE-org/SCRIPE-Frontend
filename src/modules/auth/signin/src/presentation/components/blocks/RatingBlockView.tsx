"use client";

import type { RatingBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { blockColor, clamp } from "./block-style-utils";

const SIZE_CLASS = { sm: "text-sm", md: "text-lg", lg: "text-2xl" };

/**
 * Presentation UI component rendering the rating block view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function RatingBlockView({ block }: { block: RatingBlock }) {
  const props = block.props;
  const value = clamp(props.value, 1, 5, 5);
  if (props.style === "number-badge") {
    return (
      <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-primary">
        <span className="font-bold">{value.toFixed(1)}</span>
        {props.label && <span className="text-sm">{props.label}</span>}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`${SIZE_CLASS[props.size || "md"]} tracking-wide`}
        style={{ color: blockColor(props.color, "var(--login-primary, hsl(var(--primary)))") }}
      >
        {Array.from({ length: 5 }, (_, index) => (index < Math.round(value) ? "*" : "-")).join(" ")}
      </div>
      {props.label && <div className="text-sm text-muted-foreground">{props.label}</div>}
    </div>
  );
}
