"use client";

import type { FeatureListBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { blockColor, safeItems } from "./block-style-utils";

const ICON_SIZE = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" };

export function FeatureListBlockView({ block }: { block: FeatureListBlock }) {
  const props = block.props;
  const columns = props.columns || 1;
  return (
    <div
      className={`grid gap-4 ${columns === 2 ? "sm:grid-cols-2" : ""} ${columns === 3 ? "sm:grid-cols-3" : ""}`}
    >
      {safeItems(props.items, 6).map((item, index) => (
        <div
          key={`${item.title}-${index}`}
          className={props.compactMode ? "flex gap-3" : "space-y-2"}
        >
          <div
            className={`${ICON_SIZE[props.iconSize || "md"]} leading-none`}
            style={{
              color: blockColor(props.iconColor, "var(--login-primary, hsl(var(--primary)))"),
            }}
          >
            {props.numberedMode ? index + 1 : item.icon}
          </div>
          <div>
            <h3 className="text-sm font-semibold" style={{ color: blockColor(props.titleColor) }}>
              {item.title}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
