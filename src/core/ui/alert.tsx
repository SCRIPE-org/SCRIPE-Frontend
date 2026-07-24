import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@core/common/utils";

/**
 * Alert — the inline severity banner
 *
 * This was the least-designed file in the primitive layer: two variants
 * (default / destructive), zero nx tokens, and — worse — hard physical
 * directions in the icon layout (`left-4`, `pl-7`), so every alert in the
 * product put its glyph on the WRONG side in Arabic and overlapped its own
 * text. It also carried a `[&>svg+div]:translate-y-[-3px]` nudge that matched
 * nothing: AlertTitle renders an h5, so the adjacent-sibling selector never
 * fired.
 *
 * What changed:
 *  • logical properties throughout — `start-4` / `ps-7` — so RTL is correct by
 *    construction rather than by a mirrored copy;
 *  • the full status set (success / warning / info) joins destructive, because
 *    modules were hand-rolling `border-warning/30 bg-warning/10` at the call
 *    site to fill the gap;
 *  • severity no longer floods the body text with its own colour. Red body copy
 *    on a red wash is the least readable thing an error can do; the ink stays
 *    neutral and the severity speaks through the glyph, the hairline and the
 *    wash — three cues, only one of which is colour.
 *
 * Consumer markup is unchanged: `<Alert><Icon/><AlertTitle/><AlertDescription/>`
 * still positions the icon exactly where it did.
 */
const alertVariants = cva(
  cn(
    "relative w-full rounded-nx-md border p-4 text-nx-ink",
    // The glyph column. 28px of inline-start padding on every sibling keeps the
    // text off the icon at any size.
    "[&>svg]:absolute [&>svg]:start-4 [&>svg]:top-4 [&>svg]:h-4 [&>svg]:w-4",
    "[&>svg~*]:ps-7"
  ),
  {
    variants: {
      variant: {
        // A step ABOVE surface, not equal to it: the neutral alert has to
        // separate from the page ground AND from the card it is usually
        // dropped into, and `bg-background` did neither.
        default: "border-nx-line bg-nx-raised [&>svg]:text-nx-ink-2",
        destructive: "border-destructive/40 bg-destructive/10 [&>svg]:text-destructive",
        success: "border-success/40 bg-success/10 [&>svg]:text-success",
        warning: "border-warning/40 bg-warning/10 [&>svg]:text-warning",
        info: "border-info/40 bg-info/10 [&>svg]:text-info",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof alertVariants>
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
));
Alert.displayName = "Alert";

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5
      ref={ref}
      className={cn(
        "mb-1 text-sm font-semibold leading-tight tracking-tight text-nx-ink text-balance",
        className
      )}
      {...props}
    />
  )
);
AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm text-pretty text-nx-ink-2 [&_p]:leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
