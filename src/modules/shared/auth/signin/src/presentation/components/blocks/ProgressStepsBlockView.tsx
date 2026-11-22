"use client";

import type { ProgressStepsBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { safeItems } from "./block-style-utils";

/**
 * Presentation UI component rendering the progress steps block view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
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
                complete
                  ? "bg-nx-accent-fill text-nx-on-fill"
                  : "border border-nx-line bg-nx-raised text-nx-ink-2"
              }`}
            >
              {index + 1}
            </span>
            <span className={isVertical ? "block" : "mt-2 block"}>
              <span className="block text-sm font-medium text-nx-ink">{item.label}</span>
              {item.description && (
                <span className="block text-xs text-nx-ink-2">{item.description}</span>
              )}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
