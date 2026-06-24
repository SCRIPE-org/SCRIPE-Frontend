"use client";

import type { ProgressStepsBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { safeItems } from "./block-style-utils";

/**
 * React presentation component representing the progress steps block view UI element.
 */
export function ProgressStepsBlockView({ block }: { block: ProgressStepsBlock }) {
  const props = block.props;
  const active = props.activeStep ?? 0;
  const isVertical = props.style === "vertical";
  return (
    <ol className={isVertical ? "space-y-3" : "flex flex-wrap justify-center gap-4"}>
      {safeItems(props.items, 5).map((item, index) => {
        const complete = index <= active;
        return (
          <li key={`${item.label}-${index}`} className={isVertical ? "flex gap-3" : "text-center"}>
            <span
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                complete ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              }`}
            >
              {index + 1}
            </span>
            <span className={isVertical ? "block" : "mt-2 block"}>
              <span className="block text-sm font-medium">{item.label}</span>
              {item.description && (
                <span className="block text-xs text-muted-foreground">{item.description}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
