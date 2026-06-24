"use client";

import type { StatsRowBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { safeItems } from "./block-style-utils";

const VALUE_CLASS = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" };

/**
 * React presentation component representing the stats row block view UI element.
 */
export function StatsRowBlockView({ block }: { block: StatsRowBlock }) {
  const props = block.props;
  return (
    <div
      className={
        props.layout === "grid" ? "grid grid-cols-2 gap-4" : "flex flex-wrap justify-center gap-6"
      }
    >
      {safeItems(props.items, 4).map((item, index) => (
        <div key={`${item.label}-${index}`} className="text-center">
          {item.icon && <div className="mb-1 text-lg">{item.icon}</div>}
          <div className={`${VALUE_CLASS[props.size || "md"]} font-bold text-foreground`}>
            {item.value}
          </div>
          <div className="text-xs text-muted-foreground">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
