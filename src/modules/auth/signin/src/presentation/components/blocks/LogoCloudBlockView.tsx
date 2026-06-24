"use client";

import type { ReactNode } from "react";
import {
  type LogoCloudBlock,
  isValidCtaUrl,
} from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { safeItems } from "./block-style-utils";

const SIZE_CLASS = { sm: "h-8", md: "h-10", lg: "h-14" };

/**
 * React presentation component representing the logo cloud block view UI element.
 */
export function LogoCloudBlockView({ block }: { block: LogoCloudBlock }) {
  const props = block.props;
  const columns =
    props.columns === 3
      ? "grid-cols-3"
      : props.columns === 4
        ? "grid-cols-4"
        : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className={`grid items-center gap-4 ${columns}`}>
      {safeItems(props.items, 8).map((item, index) => {
        const img = (
          <img
            src={item.src}
            alt={item.alt}
            className={`${SIZE_CLASS[props.size || "md"]} w-full object-contain ${props.grayscale ? "grayscale" : ""}`}
          />
        );
        const content: ReactNode =
          item.url && isValidCtaUrl(item.url) ? (
            <a href={item.url} rel="noopener noreferrer">
              {img}
            </a>
          ) : (
            img
          );
        return <div key={`${item.alt}-${index}`}>{content}</div>;
      })}
    </div>
  );
}
