import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useSettings } from "@core/providers/settings-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { cn } from "@core/common/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  /** When true, shows an animated spinner inside the button and disables interaction */
  loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, asChild = false, loading = false, disabled, children, ...props },
    ref
  ) => {
    const settings = useSettings();
    const Comp = asChild ? Slot : "button";

    const getButtonClasses = () => {
      let radiusClasses = "";

      switch (settings.buttonStyle) {
        case "small-round":
          radiusClasses = "rounded";
          break;
        case "medium-round":
          radiusClasses = "rounded-lg";
          break;
        case "large-round":
          radiusClasses = "rounded-xl";
          break;
        case "extra-round":
          radiusClasses = "rounded-2xl";
          break;
        case "super-round":
          radiusClasses = "rounded-3xl";
          break;
        case "rounded":
          radiusClasses = "rounded-full";
          break;
        case "sharp":
          radiusClasses = "rounded-none";
          break;
        case "modern":
          radiusClasses = "rounded-xl";
          break;
        default:
          switch (settings.borderRadius) {
            case "none":
              radiusClasses = "rounded-none";
              break;
            case "small":
              radiusClasses = "rounded-sm";
              break;
            case "large":
              radiusClasses = "rounded-lg";
              break;
            case "full":
              radiusClasses = "rounded-full";
              break;
            default:
              radiusClasses = "rounded-md";
          }
      }

      // Add animation classes based on settings
      let animationClasses = "";
      if (settings.animationLevel !== "none") {
        animationClasses = "transition-all duration-200 hover:scale-105 active:scale-95";
      }

      return cn(radiusClasses, animationClasses);
    };

    // For asChild mode, we can't inject spinner children — just pass through
    if (asChild) {
      return (
        <Comp
          className={cn(buttonVariants({ variant, size }), getButtonClasses(), className)}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <button
        className={cn(
          buttonVariants({ variant, size }),
          getButtonClasses(),
          loading && "relative",
          className
        )}
        ref={ref}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <LoadingSpinner
            size="inline"
            showText={false}
            className={cn("shrink-0", children ? "ltr:mr-2 rtl:ml-2" : "")}
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
