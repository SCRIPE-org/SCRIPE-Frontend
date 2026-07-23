import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { useSettings } from "@core/providers/settings-provider";
import { LoadingSpinner } from "@core/ui/loading-spinner";
import { cn } from "@core/common/utils";

// Buttons are quiet surfaces in this system — light collects on the ACTIVE
// thing. Rest state is a raised surface behind a hairline; hover is a micro
// bg/border shift (the old scale-on-hover/press pair is gone — transform
// noise, not light); press is the lit edge: a 1px inset accent line. Focus
// is the shared --nx-focus lit-edge ring, no offset halo.
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap text-sm font-medium transition-[color,background-color,border-color,box-shadow] duration-nx-micro ease-nx-enter motion-reduce:transition-none focus-visible:outline-none focus-visible:shadow-nx-focus active:shadow-[inset_0_0_0_1px_var(--nx-accent)] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "border border-nx-line bg-nx-raised text-nx-ink hover:border-nx-line-hi hover:bg-nx-raised-2",
        // Destructive stays on the global measured status tokens — the --nx-
        // status vars alias them, and the hsl-triplet form keeps slash-alpha.
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-nx-line-hi bg-transparent text-nx-ink hover:bg-nx-hover",
        secondary: "bg-nx-surface text-nx-ink-2 hover:bg-nx-raised hover:text-nx-ink",
        ghost: "text-nx-ink hover:bg-nx-hover",
        link: "text-nx-accent underline-offset-4 hover:underline active:shadow-none",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 px-3",
        lg: "h-11 px-8",
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

      // The Settings buttonStyle values, mapped onto the nx radius ladder
      // (sm 6 / control 8 / md 10 / lg 14 / full). The old free-floating
      // Tailwind radii collapse onto the nearest step; unknown/legacy stored
      // values fall through to the borderRadius mapping below — the
      // stored-value migration itself is Wave C's job.
      switch (settings.buttonStyle) {
        case "sharp":
          radiusClasses = "rounded-none";
          break;
        case "small-round":
          radiusClasses = "rounded-nx-sm";
          break;
        case "medium-round":
          radiusClasses = "rounded-nx-control";
          break;
        case "large-round":
        case "modern":
          radiusClasses = "rounded-nx-md";
          break;
        case "extra-round":
          radiusClasses = "rounded-nx-lg";
          break;
        case "super-round":
        case "rounded":
          radiusClasses = "rounded-full";
          break;
        default:
          // "default" (and any unknown value) defers to the borderRadius
          // setting, mapped onto the same ladder.
          switch (settings.borderRadius) {
            case "none":
              radiusClasses = "rounded-none";
              break;
            case "small":
              radiusClasses = "rounded-nx-sm";
              break;
            case "large":
              radiusClasses = "rounded-nx-lg";
              break;
            case "full":
              radiusClasses = "rounded-full";
              break;
            default:
              radiusClasses = "rounded-nx-control";
          }
      }

      // The micro bg/border shift lives in the base cva; animationLevel
      // "none" switches it off entirely. Every other level rides the token
      // motion — there is no scale tier anymore.
      const animationClasses = settings.animationLevel === "none" ? "transition-none" : "";

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
            className={cn("shrink-0", children ? "me-2" : "")}
          />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
