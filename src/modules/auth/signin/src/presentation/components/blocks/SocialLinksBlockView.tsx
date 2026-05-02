"use client";

import { type SocialLinksBlock, isValidCtaUrl } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { SOCIAL_ICONS } from "./block-constants";
import { safeItems } from "./block-style-utils";

const SIZE_CLASS = { sm: "h-8 min-w-8 text-xs", md: "h-10 min-w-10 text-sm", lg: "h-12 min-w-12" };

export function SocialLinksBlockView({ block }: { block: SocialLinksBlock }) {
  const props = block.props;
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      {safeItems(props.items, 8)
        .filter((item) => isValidCtaUrl(item.url))
        .map((item) => (
          <a
            key={`${item.platform}-${item.url}`}
            href={item.url}
            rel="noopener noreferrer"
            className={[
              "inline-flex items-center justify-center gap-2 rounded-md border px-3 font-medium transition-colors hover:bg-muted",
              SIZE_CLASS[props.size || "md"],
              props.style === "colored-bg" ? "border-primary/20 bg-primary/10 text-primary" : "",
            ].join(" ")}
            aria-label={item.platform}
          >
            <span>{SOCIAL_ICONS[item.platform.toLowerCase()] || item.platform.slice(0, 2).toUpperCase()}</span>
            {props.style === "with-labels" && <span>{item.platform}</span>}
          </a>
        ))}
    </div>
  );
}
