"use client";

import * as React from "react";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { fieldVariants, resolveFieldStyle, READ_ONLY_FIELD } from "./input";

// Same field surface as Input — one cva, two elements — including the error,
// disabled and read-only states. Resizing is block-axis only: a textarea that
// can be dragged wider breaks every two-column form it sits in.
const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<"textarea">>(
  ({ className, ...props }, ref) => {
    const settings = useSettings();

    return (
      <textarea
        className={cn(
          // sizing stays textarea-specific; the surface is shared
          "min-h-20 resize-y px-3 py-2 text-base leading-relaxed md:text-sm",
          fieldVariants({
            inputStyle: resolveFieldStyle(settings.inputStyle),
          }),
          READ_ONLY_FIELD,
          // a read-only body is a block of text to copy, not a control to drag
          "read-only:enabled:resize-none",
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
