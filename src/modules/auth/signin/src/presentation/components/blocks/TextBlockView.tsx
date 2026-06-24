"use client";

import type { CSSProperties } from "react";
import type { TextBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { ALIGN_MAP, FONT_SIZE_MAP, FONT_WEIGHT_MAP } from "./block-constants";
import { blockColor, clamp } from "./block-style-utils";

/**
 * Presentation UI component rendering the text block view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*). Coordinates text fields, submit indicators, and validation warning messages.
 */
export function TextBlockView({ block }: { block: TextBlock }) {
  const props = block.props;
  const style: CSSProperties = {
    color: blockColor(props.color, "var(--login-text-muted, hsl(var(--muted-foreground)))"),
    maxWidth: props.maxWidth,
    textTransform: props.textTransform,
  };

  if (props.lineClamp && props.lineClamp > 0) {
    style.display = "-webkit-box";
    style.WebkitLineClamp = clamp(props.lineClamp, 1, 5, 3);
    style.WebkitBoxOrient = "vertical";
    style.overflow = "hidden";
  }

  return (
    <p
      className={[
        ALIGN_MAP[props.alignment || "left"],
        FONT_SIZE_MAP[props.fontSize || "base"],
        FONT_WEIGHT_MAP[props.fontWeight || "normal"],
        props.highlight ? "rounded-md bg-primary/10 px-3 py-2" : "",
      ].join(" ")}
      style={style}
    >
      {props.content}
    </p>
  );
}
