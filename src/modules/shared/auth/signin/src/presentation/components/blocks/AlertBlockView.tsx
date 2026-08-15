"use client";

import type { AlertBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";

const VARIANT_CLASS = {
  info: "border-info/30 bg-info/10 text-info",
  warning: "border-warning/30 bg-warning/10 text-warning",
  success: "border-success/30 bg-success/10 text-success",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
};

const ICON = { info: "i", warning: "!", success: "ok", error: "!" };

/**
 * Presentation UI component rendering the alert block view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function AlertBlockView({ block }: { block: AlertBlock }) {
  const props = block.props;
  return (
    <div
      className={[
        "flex gap-3 rounded-lg border",
        props.compact ? "p-3 text-sm" : "p-4",
        VARIANT_CLASS[props.variant || "info"],
      ].join(" ")}
    >
      {props.showIcon !== false && (
        <span className="text-xs font-bold">{ICON[props.variant || "info"]}</span>
      )}
      <div>
        {props.title && <h3 className="font-semibold">{props.title}</h3>}
        <p className={props.title ? "mt-1 text-sm" : "text-sm"}>{props.message}</p>
      </div>
    </div>
  );
}
