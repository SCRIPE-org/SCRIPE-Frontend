import * as React from "react";

import { cn } from "@core/common/utils";

// A skeleton is a promise about what is arriving. A grey rectangle is a promise
// about nothing — which is all this component could make before, since its only
// shape was `rounded-md` and every caller had to hand-roll the geometry.
//
// `shape` names the thing being replaced, so the placeholder inherits its
// silhouette: text lines sit on the text height and the last line runs short,
// like a real paragraph; a circle stays a circle; a control keeps the 40px
// button/input box and the control radius.
//
// Motion: one calm 2s opacity pulse, and only while something is genuinely
// loading — a skeleton has no idle life to pulse through. No shimmer sweep, no
// gradient travelling across the box. Reduced motion gets a static block.
const SKELETON_SHAPES = {
  /** Default — an unopinionated slab. Size comes from the caller. */
  block: "rounded-md",
  /** One line of body copy. */
  text: "h-4 rounded-nx-sm",
  /** A heading line: taller, and short of the measure by default. */
  title: "h-6 w-1/3 rounded-nx-sm",
  /** Avatars and icon slots. Pair with a size (e.g. `h-10 w-10`). */
  circle: "aspect-square rounded-full",
  /** A button, input or select — the 40px control box at the control radius. */
  control: "h-10 rounded-nx-control",
  /** A badge/status chip. */
  chip: "h-5 w-16 rounded-full",
} as const;

export type SkeletonShape = keyof typeof SKELETON_SHAPES;

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Silhouette of the content being replaced. Defaults to an unshaped block. */
  shape?: SkeletonShape;
  /** Number of lines to draw for `shape="text"`. Ignored by other shapes. */
  lines?: number;
}

function Skeleton({ className, shape = "block", lines = 1, ...props }: SkeletonProps) {
  // Skeletons are decorative by default: the region that owns them announces
  // the load. Callers that label the placeholder itself (section-state does)
  // keep their announcement — we only hide what nothing else describes.
  const isDescribed =
    props["aria-label"] !== undefined ||
    props["aria-labelledby"] !== undefined ||
    props.role !== undefined;

  const base = "motion-safe:animate-pulse select-none bg-nx-raised-2";

  if (shape === "text" && lines > 1) {
    return (
      <div
        aria-hidden={isDescribed ? undefined : true}
        className={cn("flex w-full flex-col gap-2", className)}
        {...props}
      >
        {Array.from({ length: lines }, (_, index) => (
          <div
            key={index}
            className={cn(
              base,
              SKELETON_SHAPES.text,
              // A paragraph does not end flush with the measure.
              index === lines - 1 ? "w-3/5" : "w-full"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      aria-hidden={isDescribed ? undefined : true}
      className={cn(base, SKELETON_SHAPES[shape], className)}
      {...props}
    />
  );
}

export { Skeleton };
