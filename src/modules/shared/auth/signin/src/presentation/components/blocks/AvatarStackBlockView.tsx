"use client";

import type { AvatarStackBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import Image from "next/image";

const SIZE_CLASS = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-12 w-12" };

/**
 * Presentation UI component rendering the avatar stack block view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function AvatarStackBlockView({ block }: { block: AvatarStackBlock }) {
  const props = block.props;
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex -space-x-2 rtl:space-x-reverse">
        {props.avatarUrls.slice(0, 5).map((url, index) => (
          <Image
            key={`${url}-${index}`}
            src={url}
            alt=""
            width={40}
            height={40}
            unoptimized
            className={`${SIZE_CLASS[props.size || "md"]} rounded-full border-2 border-nx-surface object-cover`}
          />
        ))}
      </div>
      {(props.totalCount || props.label) && (
        <div className="text-sm">
          {props.totalCount && <div className="font-semibold text-nx-ink">{props.totalCount}</div>}
          {props.label && <div className="text-xs text-nx-ink-2">{props.label}</div>}
        </div>
      )}
    </div>
  );
}
