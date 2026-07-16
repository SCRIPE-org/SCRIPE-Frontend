"use client";

import type { CSSProperties } from "react";
import type { SpacerBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { clamp } from "./block-style-utils";

/**
 * Presentation UI component rendering the spacer block view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function SpacerBlockView({ block }: { block: SpacerBlock }) {
  return (
    <div
      aria-hidden="true"
      className={block.props.responsiveHalve ? "h-[var(--spacer-mobile)] sm:h-[var(--spacer)]" : ""}
      style={
        block.props.responsiveHalve
          ? ({
              "--spacer": `${clamp(block.props.height, 8, 80, 24)}px`,
              "--spacer-mobile": `${clamp(block.props.height, 8, 80, 24) / 2}px`,
            } as CSSProperties)
          : { height: clamp(block.props.height, 8, 80, 24) }
      }
    />
  );
}
