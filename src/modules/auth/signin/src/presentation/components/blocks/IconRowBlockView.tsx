"use client";

import type { ReactNode } from "react";
import { type IconRowBlock, isValidCtaUrl } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { safeItems } from "./block-style-utils";

const GAP_CLASS = { sm: "gap-2", md: "gap-4", lg: "gap-6" };
const ICON_CLASS = { sm: "text-lg", md: "text-2xl", lg: "text-3xl" };

export function IconRowBlockView({ block }: { block: IconRowBlock }) {
  const props = block.props;
  return (
    <div className={`flex flex-wrap items-center justify-center ${GAP_CLASS[props.gap || "md"]}`}>
      {safeItems(props.items, 6).map((item, index) => {
        const content: ReactNode = (
          <>
            <span className={ICON_CLASS[props.iconSize || "md"]}>{item.icon}</span>
            {props.showLabels && item.label && <span className="text-xs text-muted-foreground">{item.label}</span>}
          </>
        );
        if (item.url && isValidCtaUrl(item.url)) {
          return (
            <a key={`${item.label || item.icon}-${index}`} href={item.url} className="flex flex-col items-center gap-1">
              {content}
            </a>
          );
        }
        return (
          <span key={`${item.label || item.icon}-${index}`} className="flex flex-col items-center gap-1">
            {content}
          </span>
        );
      })}
    </div>
  );
}
