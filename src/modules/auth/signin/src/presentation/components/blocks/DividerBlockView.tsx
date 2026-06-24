"use client";

import type { DividerBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { blockColor, clamp } from "./block-style-utils";

/**
 * React presentation component representing the divider block view UI element.
 */
export function DividerBlockView({ block }: { block: DividerBlock }) {
  const props = block.props;
  if (props.style === "space") return <div style={{ height: clamp(props.thickness, 8, 64, 24) }} />;
  if (props.style === "dots") return <div className="text-center text-muted-foreground">...</div>;

  return (
    <div
      className="flex items-center gap-3"
      style={{ width: `${clamp(props.width, 25, 100, 100)}%` }}
    >
      <div
        className="flex-1"
        style={{
          borderTopColor: blockColor(props.color, "hsl(var(--border))"),
          borderTopWidth: clamp(props.thickness, 1, 5, 1),
          borderTopStyle: props.lineStyle || "solid",
        }}
      />
      {props.label && (
        <span className="px-2 text-xs text-muted-foreground" style={{ background: props.labelBg }}>
          {props.label}
        </span>
      )}
      {props.label && (
        <div
          className="flex-1"
          style={{
            borderTopColor: blockColor(props.color, "hsl(var(--border))"),
            borderTopWidth: clamp(props.thickness, 1, 5, 1),
            borderTopStyle: props.lineStyle || "solid",
          }}
        />
      )}
    </div>
  );
}
