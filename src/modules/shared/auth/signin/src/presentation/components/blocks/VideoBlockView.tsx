"use client";

import {
  type VideoBlock,
  isValidVideoUrl,
} from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import Image from "next/image";

/**
 * Presentation UI component rendering the video block view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function VideoBlockView({ block }: { block: VideoBlock }) {
  const props = block.props;
  if (!isValidVideoUrl(props.url)) return null;

  return (
    <a
      href={props.url}
      rel="noopener noreferrer"
      className={`group relative block overflow-hidden rounded-lg border border-nx-line bg-nx-raised ${props.aspectRatio === "4:3" ? "aspect-[4/3]" : "aspect-video"}`}
    >
      {props.thumbnailUrl ? (
        <Image
          src={props.thumbnailUrl}
          alt={props.overlayText || "Video"}
          width={800}
          height={450}
          unoptimized
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-sm text-nx-ink-2">
          Video
        </div>
      )}
      <span
        className={[
          "absolute rounded-full border border-nx-line bg-nx-surface px-3 py-2 text-sm font-semibold text-nx-ink",
          props.playButtonStyle === "corner"
            ? "bottom-3 end-3"
            : "start-1/2 top-1/2 -translate-x-1/2 rtl:translate-x-1/2 -translate-y-1/2",
        ].join(" ")}
      >
        Play
      </span>
      {props.overlayText && (
        <span className="absolute bottom-3 start-3 text-sm font-medium text-[var(--scripe-white)]">
          {props.overlayText}
        </span>
      )}
    </a>
  );
}
