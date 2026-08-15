"use client";

import type { CSSProperties } from "react";
import {
  type CtaButtonBlock,
  isValidCtaUrl,
} from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { blockColor } from "./block-style-utils";

const SIZE_CLASS = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5",
  xl: "h-14 px-6 text-lg",
};

/**
 * Presentation UI component rendering the cta button block view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function CtaButtonBlockView({ block }: { block: CtaButtonBlock }) {
  const props = block.props;
  if (!isValidCtaUrl(props.url)) return null;

  const style: CSSProperties = {
    borderRadius: props.borderRadius,
    boxShadow: props.shadow ? "var(--login-shadow-card, 0 10px 30px rgba(0,0,0,.12))" : undefined,
  };
  if (props.color && props.variant !== "outline" && props.variant !== "ghost") {
    style.backgroundColor = blockColor(props.color, "var(--login-primary, hsl(var(--primary)))");
  }

  return (
    <div className={props.fullWidth ? "w-full" : "inline-flex"}>
      <a
        href={props.url}
        className={[
          "inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors",
          SIZE_CLASS[props.size || "md"],
          props.fullWidth ? "w-full" : "",
          props.variant === "outline"
            ? "border border-border bg-transparent hover:bg-muted"
            : props.variant === "ghost"
              ? "hover:bg-muted"
              : "bg-primary text-primary-foreground hover:opacity-90",
        ].join(" ")}
        style={style}
      >
        {props.icon && <span aria-hidden="true">{props.icon}</span>}
        <span>{props.label}</span>
      </a>
      {props.secondaryText && (
        <p className="mt-1 text-center text-xs text-muted-foreground">{props.secondaryText}</p>
      )}
    </div>
  );
}
