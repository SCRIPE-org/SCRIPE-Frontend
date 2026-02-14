import * as React from "react";
import { useSettings } from "@core/providers/settings-provider";
import { cn, getHoverEffectClasses } from "@core/common/utils";

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const settings = useSettings();

    const getCardClasses = () => {
      const baseClasses = "rounded-xl text-card-foreground";
      const hasHoverEffect =
        settings.hoverEffectType !== "none" && settings.hoverEffectIntensity !== "none";
      const hoverClasses = getHoverEffectClasses(
        settings.hoverEffectType,
        settings.hoverEffectIntensity
      );

      switch (settings.cardStyle) {
        case "glass":
          return cn(
            baseClasses,
            "bg-white/5 dark:bg-white/5 backdrop-blur-xl border border-white/10 dark:border-white/10",
            "shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            !hasHoverEffect && "transition-none",
            hoverClasses,
            hasHoverEffect &&
              "hover:bg-white/10 dark:hover:bg-white/10 hover:border-white/20 dark:hover:border-white/20",
            hasHoverEffect &&
              "hover:shadow-[0_12px_40px_0_rgba(31,38,135,0.5)] dark:hover:shadow-[0_12px_40px_0_rgba(255,255,255,0.15)]"
          );
        case "solid":
          return cn(
            baseClasses,
            "bg-muted/80 dark:bg-muted/80 border-0",
            !hasHoverEffect && "transition-none",
            hoverClasses,
            hasHoverEffect && "hover:bg-muted hover:shadow-md"
          );
        case "bordered":
          return cn(
            baseClasses,
            "border-2 border-border/50 bg-card/50 backdrop-blur-sm",
            !hasHoverEffect && "transition-none",
            hoverClasses,
            hasHoverEffect && "hover:border-border hover:bg-card hover:shadow-lg"
          );
        case "elevated":
          return cn(
            baseClasses,
            "shadow-xl border-0 bg-card",
            !hasHoverEffect && "transition-none",
            hoverClasses,
            hasHoverEffect && "hover:shadow-2xl"
          );
        default:
          return cn(
            baseClasses,
            "border border-border/30 bg-card/80 shadow-sm backdrop-blur-sm",
            !hasHoverEffect && "transition-none",
            hoverClasses,
            hasHoverEffect && "hover:border-border/50 hover:bg-card hover:shadow-md"
          );
      }
    };

    return <div ref={ref} className={cn(getCardClasses(), className)} {...props} />;
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const settings = useSettings();

    const getPadding = () => {
      switch (settings.spacingSize) {
        case "compact":
          return "p-4";
        case "comfortable":
          return "p-8";
        case "spacious":
          return "p-10";
        default:
          return "p-6";
      }
    };

    return (
      <div
        ref={ref}
        className={cn("flex flex-col space-y-1.5", getPadding(), className)}
        {...props}
      />
    );
  }
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const settings = useSettings();

    const getFontSize = () => {
      switch (settings.fontSize) {
        case "small":
          return "text-lg";
        case "large":
          return "text-3xl";
        default:
          return "text-2xl";
      }
    };

    return (
      <h3
        ref={ref}
        className={cn("font-semibold leading-none tracking-tight", getFontSize(), className)}
        {...props}
      />
    );
  }
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const settings = useSettings();

  const getFontSize = () => {
    switch (settings.fontSize) {
      case "small":
        return "text-xs";
      case "large":
        return "text-base";
      default:
        return "text-sm";
    }
  };

  return (
    <p ref={ref} className={cn(getFontSize(), "text-muted-foreground", className)} {...props} />
  );
});
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const settings = useSettings();

    const getPadding = () => {
      switch (settings.spacingSize) {
        case "compact":
          return "p-4 pt-0";
        case "comfortable":
          return "p-8 pt-0";
        case "spacious":
          return "p-10 pt-0";
        default:
          return "p-6 pt-0";
      }
    };

    return <div ref={ref} className={cn(getPadding(), className)} {...props} />;
  }
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const settings = useSettings();

    const getPadding = () => {
      switch (settings.spacingSize) {
        case "compact":
          return "p-4 pt-0";
        case "comfortable":
          return "p-8 pt-0";
        case "spacious":
          return "p-10 pt-0";
        default:
          return "p-6 pt-0";
      }
    };

    return (
      <div ref={ref} className={cn("flex items-center", getPadding(), className)} {...props} />
    );
  }
);
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
