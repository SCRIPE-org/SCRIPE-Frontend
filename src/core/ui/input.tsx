import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";

const inputVariants = cva(
  "flex h-10 w-full border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      inputStyle: {
        default: "rounded-md",
        rounded: "rounded-full px-4",
        underlined:
          "rounded-none border-0 border-b-2 border-input focus-visible:border-primary focus-visible:ring-0 px-0",
        filled: "rounded-lg bg-muted border-0 focus-visible:bg-background",
      },
    },
    defaultVariants: {
      inputStyle: "default",
    },
  }
);

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const settings = useSettings();

    return (
      <input
        type={type}
        className={cn(
          inputVariants({
            inputStyle: settings.inputStyle,
            className,
          })
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input, inputVariants };
