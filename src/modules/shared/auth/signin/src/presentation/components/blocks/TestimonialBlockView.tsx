"use client";

import type { TestimonialBlock } from "@modules/auth/core/domain/entities/LoginBrandingTypes";
import { clamp } from "./block-style-utils";
import Image from "next/image";

/**
 * Presentation UI component rendering the testimonial block view.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function TestimonialBlockView({ block }: { block: TestimonialBlock }) {
  const props = block.props;
  const rating = clamp(props.rating, 0, 5, 0);
  const framed = props.displayStyle !== "minimal";

  return (
    <figure
      className={framed ? "rounded-lg border bg-background/80 p-4 shadow-sm" : "space-y-3"}
      style={{ borderColor: props.borderColor }}
    >
      {rating > 0 && (
        <div className="mb-2 text-sm text-primary">{"*".repeat(Math.round(rating))}</div>
      )}
      <blockquote
        className={props.displayStyle === "large-quote" ? "text-xl font-semibold" : "text-sm"}
      >
        &ldquo;{props.quote}&rdquo;
      </blockquote>
      <figcaption className="mt-4 flex items-center gap-3 text-sm">
        {props.avatar && (
          <Image
            src={props.avatar}
            alt={props.author}
            width={40}
            height={40}
            unoptimized
            className="h-10 w-10 rounded-full object-cover"
          />
        )}
        <span>
          <span className="block font-medium">{props.author}</span>
          {(props.role || props.companyName) && (
            <span className="text-xs text-muted-foreground">
              {[props.role, props.companyName].filter(Boolean).join(", ")}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}
