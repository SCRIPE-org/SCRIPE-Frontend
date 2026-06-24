"use client";

import type { AvatarStackBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";

const SIZE_CLASS = { sm: "h-7 w-7", md: "h-9 w-9", lg: "h-12 w-12" };

/**
 * React presentation component representing the avatar stack block view UI element.
 */
export function AvatarStackBlockView({ block }: { block: AvatarStackBlock }) {
  const props = block.props;
  return (
    <div className="flex items-center justify-center gap-3">
      <div className="flex -space-x-2">
        {props.avatarUrls.slice(0, 5).map((url, index) => (
          <img
            key={`${url}-${index}`}
            src={url}
            alt=""
            className={`${SIZE_CLASS[props.size || "md"]} rounded-full border-2 border-background object-cover`}
          />
        ))}
      </div>
      {(props.totalCount || props.label) && (
        <div className="text-sm">
          {props.totalCount && <div className="font-semibold">{props.totalCount}</div>}
          {props.label && <div className="text-xs text-muted-foreground">{props.label}</div>}
        </div>
      )}
    </div>
  );
}
