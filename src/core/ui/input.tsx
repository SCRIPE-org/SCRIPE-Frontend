import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

// The shared field treatment — Input and Textarea render the SAME surface.
// Sunken --nx-ground behind a hairline at rest; focus lights the edge
// (border to accent + the --nx-focus inset line/wash ring) instead of the
// old offset halo. Only border-color/box-shadow transition — colour, not
// movement — at micro speed; motion-reduce drops even that.
const fieldVariants = cva(
  "flex w-full border border-nx-line bg-nx-ground text-nx-ink placeholder:text-nx-ink-3 transition-[border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:border-nx-accent focus-visible:shadow-nx-focus disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      // The Settings inputStyle values, mapped onto token-backed styles.
      inputStyle: {
        default: "rounded-nx-control",
        rounded: "rounded-full px-4",
        underlined:
          "rounded-none border-0 border-b border-nx-line bg-transparent px-0 focus-visible:border-nx-accent focus-visible:shadow-none",
        filled: "rounded-nx-control border-transparent bg-nx-raised focus-visible:border-nx-accent",
      },
    },
    defaultVariants: {
      inputStyle: "default",
    },
  }
);

// Stored settings can hold legacy values the variant map no longer knows;
// cva would silently apply NO style for those, so unknowns fall back to
// default here. The stored-value migration itself is Wave C's job.
const KNOWN_FIELD_STYLES = ["default", "rounded", "underlined", "filled"] as const;
type FieldStyle = (typeof KNOWN_FIELD_STYLES)[number];

const resolveFieldStyle = (value: string | undefined | null): FieldStyle =>
  (KNOWN_FIELD_STYLES as readonly string[]).includes(value ?? "") ? (value as FieldStyle) : "default";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof fieldVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, inputStyle, ...props }, ref) => {
    const settings = useSettings();

    return (
      <input
        type={type}
        className={cn(
          // sizing + file-input chrome stay input-specific; the surface is shared
          "h-10 px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium",
          fieldVariants({
            inputStyle: inputStyle ?? resolveFieldStyle(settings.inputStyle),
          }),
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, fieldVariants, resolveFieldStyle };
