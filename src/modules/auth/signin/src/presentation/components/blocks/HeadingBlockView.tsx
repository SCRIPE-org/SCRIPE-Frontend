"use client";

import type { HeadingBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { ALIGN_MAP } from "./block-constants";
import { blockColor } from "./block-style-utils";

const LEVEL_CLASS = { h2: "text-3xl", h3: "text-2xl", h4: "text-xl" };

export function HeadingBlockView({ block }: { block: HeadingBlock }) {
  const props = block.props;
  const Tag = props.level || "h3";
  return (
    <Tag
      className={[
        "login-heading font-semibold tracking-tight",
        LEVEL_CLASS[Tag],
        ALIGN_MAP[props.alignment || "left"],
        props.underlineAccent === "primary" ? "border-b-2 border-primary pb-2" : "",
        props.underlineAccent === "gradient"
          ? "border-b-2 border-transparent bg-gradient-to-r from-primary to-transparent bg-[length:100%_2px] bg-bottom bg-no-repeat pb-2"
          : "",
      ].join(" ")}
      style={{ color: blockColor(props.color), textTransform: props.textTransform }}
    >
      {props.text}
    </Tag>
  );
}
