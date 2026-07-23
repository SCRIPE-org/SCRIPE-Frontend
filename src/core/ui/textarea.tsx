"use client";

import * as React from "react";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { fieldVariants, resolveFieldStyle } from "./input";

// Same field surface as Input — one cva, two elements. settings.inputStyle
// was silently ignored here before; it now maps onto the token-backed styles,
// with unknown/legacy stored values falling back to default via
// resolveFieldStyle.
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    const settings = useSettings();

    return (
      <textarea
        className={cn(
          // sizing stays textarea-specific; the surface is shared
          "min-h-[80px] px-3 py-2 text-base md:text-sm",
          fieldVariants({
            inputStyle: resolveFieldStyle(settings.inputStyle),
          }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
