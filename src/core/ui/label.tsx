"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva, type VariantProps } from "class-variance-authority";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

// Labels sit one ink step below their field's content: --nx-ink-2, the
// secondary text token (8.1:1 dark / measured light equivalent — see the
// contrast table in globals.css). Callers can still override via className.
// The size ladder covers every Settings FontSize value; text-* classes are
// rem-based, so they already scale with the --font-size-base root token.
const labelVariants = cva(
  "font-medium leading-none text-nx-ink-2 peer-disabled:cursor-not-allowed peer-disabled:opacity-70",
  {
    variants: {
      fontSize: {
        xs: "text-xs",
        small: "text-xs",
        medium: "text-sm",
        default: "text-sm",
        large: "text-base",
        xl: "text-lg",
      },
    },
    defaultVariants: {
      fontSize: "default",
    },
  }
);

// Unknown/legacy stored values fall back to default — cva would otherwise
// apply no size class at all for them.
const KNOWN_FONT_SIZES = ["xs", "small", "medium", "default", "large", "xl"] as const;
type LabelFontSize = (typeof KNOWN_FONT_SIZES)[number];

const resolveFontSize = (value: string | undefined | null): LabelFontSize =>
  (KNOWN_FONT_SIZES as readonly string[]).includes(value ?? "") ? (value as LabelFontSize) : "default";

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root> & VariantProps<typeof labelVariants>
>(({ className, fontSize, ...props }, ref) => {
  const settings = useSettings();

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        labelVariants({ fontSize: fontSize ?? resolveFontSize(settings.fontSize) }),
        className
      )}
      {...props}
    />
  );
});
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
