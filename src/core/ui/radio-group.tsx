"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle, Square, Diamond, Star, Heart, Zap, Sparkles, Hexagon } from "lucide-react";

import { cn } from "@core/common/utils";

export type RadioDesign =
  | "default"
  | "modern"
  | "glass"
  | "neon"
  | "gradient"
  | "neumorphism"
  | "cyberpunk"
  | "luxury"
  | "aurora"
  | "cosmic"
  | "minimal"
  | "elegant"
  | "organic"
  | "retro"
  | "matrix"
  | "diamond"
  | "liquid"
  | "crystal"
  | "plasma"
  | "quantum"
  | "holographic"
  | "stellar"
  | "vortex"
  | "phoenix";

interface RadioGroupProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root> {
  design?: RadioDesign;
}

interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<
  typeof RadioGroupPrimitive.Item
> {
  design?: RadioDesign;
}

const getRadioStyles = (design: RadioDesign) => {
  switch (design) {
    case "modern":
      return "h-5 w-5 rounded-full border-2 border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 data-[state=checked]:border-info data-[state=checked]:shadow-lg data-[state=checked]:shadow-info/20";

    case "glass":
      return "h-5 w-5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md shadow-lg hover:bg-white/20 transition-all duration-300 data-[state=checked]:bg-white/25 data-[state=checked]:border-white/50 data-[state=checked]:shadow-xl";

    case "neon":
      return "h-5 w-5 rounded-full border-2 border-info/50 bg-background/50 shadow-lg shadow-info/20 hover:border-info hover:shadow-info/40 transition-all duration-300 data-[state=checked]:border-info data-[state=checked]:shadow-info/60";

    case "gradient":
      return "h-5 w-5 rounded-full border-2 border-transparent bg-gradient-to-br from-primary via-primary/70 to-info p-[2px] hover:from-primary/80 hover:via-primary/60 hover:to-info/80 transition-all duration-300 data-[state=checked]:shadow-lg data-[state=checked]:shadow-primary/30";

    case "neumorphism":
      return "h-5 w-5 rounded-full bg-muted shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] transition-all duration-300 data-[state=checked]:shadow-[2px_2px_5px_rgba(0,0,0,0.2),-2px_-2px_5px_rgba(255,255,255,0.7)]";

    case "cyberpunk":
      return "h-5 w-5 rounded-full border-2 border-warning bg-background shadow-lg shadow-warning/20 hover:border-warning/80 hover:shadow-warning/40 transition-all duration-300 data-[state=checked]:border-warning data-[state=checked]:shadow-warning/60";

    case "luxury":
      return "h-6 w-6 rounded-full border-2 border-warning bg-gradient-to-br from-warning/10 to-warning/20 shadow-lg hover:shadow-xl transition-all duration-300 data-[state=checked]:border-warning data-[state=checked]:shadow-warning/30";

    case "aurora":
      return "h-5 w-5 rounded-full border-2 border-transparent bg-gradient-to-br from-success via-info to-primary p-[1px] hover:from-success/80 hover:via-info/80 hover:to-primary/80 transition-all duration-500 data-[state=checked]:shadow-lg data-[state=checked]:shadow-primary/40 animate-pulse";

    case "cosmic":
      return "h-5 w-5 rounded-full border-2 border-info/50 bg-gradient-to-br from-info/80 via-primary/80 to-primary shadow-lg shadow-info/30 hover:border-info hover:shadow-info/50 transition-all duration-300 data-[state=checked]:border-info data-[state=checked]:shadow-info/60";

    case "minimal":
      return "h-4 w-4 rounded-full border border-border bg-transparent hover:border-muted-foreground transition-colors duration-200 data-[state=checked]:border-foreground";

    case "elegant":
      return "h-5 w-5 rounded-full border border-border bg-card shadow-sm hover:shadow-md transition-all duration-200 data-[state=checked]:border-foreground";

    case "organic":
      return "h-5 w-5 rounded-full border-2 border-success bg-success/10 hover:bg-success/20 transition-all duration-300 data-[state=checked]:border-success data-[state=checked]:shadow-lg data-[state=checked]:shadow-success/30";

    case "retro":
      return "h-5 w-5 rounded-full border-2 border-warning bg-warning/10 shadow-sm hover:shadow-md transition-all duration-200 data-[state=checked]:border-warning data-[state=checked]:shadow-warning/30";

    case "matrix":
      return "h-5 w-5 rounded-full border-2 border-success bg-background shadow-lg shadow-success/20 hover:border-success/80 hover:shadow-success/40 transition-all duration-300 data-[state=checked]:border-success data-[state=checked]:shadow-success/60 font-mono";

    case "diamond":
      return "h-5 w-5 rounded-full border-2 border-primary bg-gradient-to-br from-primary/10 to-primary/20 shadow-lg hover:shadow-xl transition-all duration-300 data-[state=checked]:shadow-primary/40";

    case "liquid":
      return "h-5 w-5 rounded-full border-2 border-info bg-gradient-to-br from-info/10 to-info/20 shadow-lg hover:shadow-xl transition-all duration-500 data-[state=checked]:shadow-info/40 animate-pulse";

    case "crystal":
      return "h-5 w-5 rounded-full border-2 border-transparent bg-gradient-to-br from-card via-info/20 to-primary/20 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 data-[state=checked]:shadow-primary/40";

    case "plasma":
      return "h-5 w-5 rounded-full border-2 border-primary bg-gradient-to-br from-primary via-primary/70 to-destructive shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-300 data-[state=checked]:shadow-lg data-[state=checked]:shadow-primary/60 animate-pulse";

    case "quantum":
      return "h-5 w-5 rounded-full border-2 border-info bg-gradient-to-br from-info/10 via-primary/10 to-primary/20 shadow-lg hover:shadow-xl transition-all duration-500 data-[state=checked]:shadow-info/40";

    case "holographic":
      return "h-5 w-5 rounded-full border-2 border-transparent bg-gradient-to-br from-info via-primary to-primary/70 shadow-lg hover:shadow-xl transition-all duration-300 data-[state=checked]:shadow-lg data-[state=checked]:shadow-primary/50 animate-pulse";

    case "stellar":
      return "h-5 w-5 rounded-full border-2 border-warning bg-gradient-to-br from-warning/40 via-warning to-destructive shadow-lg shadow-warning/30 hover:shadow-warning/50 transition-all duration-300 data-[state=checked]:shadow-lg data-[state=checked]:shadow-warning/60";

    case "vortex":
      return "h-5 w-5 rounded-full border-2 border-primary bg-gradient-to-br from-primary via-info to-info/70 shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all duration-500 data-[state=checked]:shadow-lg data-[state=checked]:shadow-primary/60 animate-spin-slow";

    case "phoenix":
      return "h-5 w-5 rounded-full border-2 border-destructive bg-gradient-to-br from-destructive via-warning to-warning/70 shadow-lg shadow-destructive/30 hover:shadow-destructive/50 transition-all duration-300 data-[state=checked]:shadow-lg data-[state=checked]:shadow-destructive/60 animate-pulse";

    default:
      return "aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  }
};

const getRadioIndicator = (design: RadioDesign) => {
  switch (design) {
    case "luxury":
    case "stellar":
      return <Star className="h-2 w-2 fill-current" />;
    case "organic":
    case "phoenix":
      return <Heart className="h-2 w-2 fill-current" />;
    case "neon":
    case "cyberpunk":
    case "plasma":
      return <Zap className="h-2 w-2 fill-current" />;
    case "cosmic":
    case "aurora":
    case "holographic":
      return <Sparkles className="h-2 w-2 fill-current" />;
    case "diamond":
      return <Diamond className="h-2 w-2 fill-current" />;
    case "minimal":
      return <Circle className="h-1.5 w-1.5 fill-current" />;
    case "matrix":
      return <Square className="h-2 w-2 fill-current" />;
    case "quantum":
      return <Hexagon className="h-2 w-2 fill-current" />;
    default:
      return <Circle className="h-2.5 w-2.5 fill-current text-current" />;
  }
};

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  RadioGroupProps
>(({ className, design = "default", ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("grid gap-2", className)}
      {...props}
      ref={ref}
      data-design={design}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  RadioGroupItemProps
>(({ className, design = "default", ...props }, ref) => {
  // Get design from DOM data attribute if not provided as prop
  const [domDesign, setDomDesign] = React.useState<RadioDesign>("default");

  React.useEffect(() => {
    if (typeof document !== "undefined") {
      const root = document.documentElement;
      const radioDesign = root.getAttribute("data-radio-design") as RadioDesign;
      if (radioDesign && design === "default") {
        setDomDesign(radioDesign);
      }
    }
  }, [design]);

  const effectiveDesign = design !== "default" ? design : domDesign;
  const isGradient = effectiveDesign === "gradient";

  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        getRadioStyles(effectiveDesign),
        "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {isGradient ? (
        <div className="flex h-full w-full items-center justify-center rounded-full bg-background">
          <RadioGroupPrimitive.Indicator className="flex items-center justify-center text-foreground">
            {getRadioIndicator(effectiveDesign)}
          </RadioGroupPrimitive.Indicator>
        </div>
      ) : (
        <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
          {getRadioIndicator(effectiveDesign)}
        </RadioGroupPrimitive.Indicator>
      )}
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
