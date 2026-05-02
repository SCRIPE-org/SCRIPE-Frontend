"use client";

import type { ReactNode } from "react";
import type { BaseBlockProps } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { ANIMATION_STYLES, MARGIN_PX, PADDING_PX } from "./block-constants";

export function BlockWrapper({ props, children }: { props: BaseBlockProps; children: ReactNode }) {
  if (props.visible === false) return null;
  const animStyle = ANIMATION_STYLES[props.animation || "none"] || {};
  const pad = PADDING_PX[props.padding || "none"] || "0";
  const mar = MARGIN_PX[props.marginBottom || "none"] || "0";
  const hasStyles = Object.keys(animStyle).length > 0 || pad !== "0" || mar !== "0";
  if (!hasStyles) return <>{children}</>;
  return (
    <div
      style={{
        ...animStyle,
        padding: pad !== "0" ? pad : undefined,
        marginBottom: mar !== "0" ? mar : undefined,
      }}
    >
      {children}
    </div>
  );
}
