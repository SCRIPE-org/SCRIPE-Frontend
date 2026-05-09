"use client";

import type { GradientTextBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { ALIGN_MAP, FONT_WEIGHT_MAP } from "./block-constants";

const SIZE_CLASS = {
  lg: "text-lg",
  xl: "text-xl",
  "2xl": "text-2xl",
  "3xl": "text-3xl",
  "4xl": "text-4xl",
};
const DIRECTION = {
  "left-right": "to right",
  "top-bottom": "to bottom",
  diagonal: "135deg",
};

export function GradientTextBlockView({ block }: { block: GradientTextBlock }) {
  const props = block.props;
  return (
    <p
      className={[
        "login-heading bg-clip-text text-transparent",
        ALIGN_MAP[props.alignment || "left"],
        SIZE_CLASS[props.fontSize || "2xl"],
        FONT_WEIGHT_MAP[props.fontWeight || "bold"],
      ].join(" ")}
      style={{
        backgroundImage: `linear-gradient(${DIRECTION[props.direction || "left-right"]}, ${props.fromColor}, ${props.toColor})`,
      }}
    >
      {props.text}
    </p>
  );
}
