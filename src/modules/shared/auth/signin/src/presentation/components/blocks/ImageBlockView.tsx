"use client";

import type { CSSProperties, ReactNode } from "react";
import {
  type ImageBlock,
  isValidCtaUrl,
} from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { ASPECT_MAP, HOVER_MAP, SHADOW_MAP } from "./block-constants";
import Image from "next/image";

/**
 * Presentation UI component rendering the image block view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ImageBlockView({ block }: { block: ImageBlock }) {
  const props = block.props;
  const image = (
    <Image
      src={props.src}
      alt={props.alt}
      width={800}
      height={450}
      unoptimized
      className={`w-full ${ASPECT_MAP[props.aspectRatio || "auto"]} ${HOVER_MAP[props.hoverEffect || "none"]} ${SHADOW_MAP[props.shadow || "none"]}`}
      style={{
        maxWidth: props.maxWidth,
        maxHeight: props.maxHeight,
        borderRadius: props.borderRadius,
        objectFit: props.objectFit || "cover",
      }}
    />
  );

  const content: ReactNode =
    props.linkUrl && isValidCtaUrl(props.linkUrl) ? (
      <a href={props.linkUrl} rel="noopener noreferrer">
        {image}
      </a>
    ) : (
      image
    );

  const wrapperStyle: CSSProperties = { maxWidth: props.maxWidth };
  return (
    <figure className="flex flex-col items-center gap-2" style={wrapperStyle}>
      {content}
      {props.caption && (
        <figcaption className="text-center text-xs text-muted-foreground">
          {props.caption}
        </figcaption>
      )}
    </figure>
  );
}
