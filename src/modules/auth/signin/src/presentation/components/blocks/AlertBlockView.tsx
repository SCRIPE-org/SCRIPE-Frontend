"use client";

import type { AlertBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";

const VARIANT_CLASS = {
  info: "border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-100",
  warning: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-100",
  success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-100",
  error: "border-destructive/30 bg-destructive/10 text-destructive",
};

const ICON = { info: "i", warning: "!", success: "ok", error: "!" };

/**
 * React presentation component representing the alert block view UI element.
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
