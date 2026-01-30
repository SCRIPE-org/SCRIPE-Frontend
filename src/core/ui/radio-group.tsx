"use client"

import * as React from "react"
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"
import { Circle, Square, Diamond, Star, Heart, Zap, Sparkles, Hexagon } from "lucide-react"

import { cn } from "@core/common/utils"

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

interface RadioGroupItemProps extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> {
  design?: RadioDesign;
}

const getRadioStyles = (design: RadioDesign) => {
  switch (design) {
    case "modern":
      return "h-5 w-5 rounded-full border-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 data-[state=checked]:border-blue-500 data-[state=checked]:shadow-lg data-[state=checked]:shadow-blue-500/20";
    
    case "glass":
      return "h-5 w-5 rounded-full border border-white/30 bg-white/10 backdrop-blur-md shadow-lg hover:bg-white/20 transition-all duration-300 data-[state=checked]:bg-white/25 data-[state=checked]:border-white/50 data-[state=checked]:shadow-xl";
    
    case "neon":
      return "h-5 w-5 rounded-full border-2 border-cyan-400/50 bg-black/50 shadow-lg shadow-cyan-400/20 hover:border-cyan-400 hover:shadow-cyan-400/40 transition-all duration-300 data-[state=checked]:border-cyan-400 data-[state=checked]:shadow-cyan-400/60";
    
    case "gradient":
      return "h-5 w-5 rounded-full border-2 border-transparent bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 p-[2px] hover:from-pink-400 hover:via-purple-400 hover:to-blue-400 transition-all duration-300 data-[state=checked]:shadow-lg data-[state=checked]:shadow-purple-500/30";
    
    case "neumorphism":
      return "h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-800 shadow-[inset_2px_2px_5px_rgba(0,0,0,0.1),inset_-2px_-2px_5px_rgba(255,255,255,0.7)] dark:shadow-[inset_2px_2px_5px_rgba(0,0,0,0.3),inset_-2px_-2px_5px_rgba(255,255,255,0.1)] hover:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.1),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] transition-all duration-300 data-[state=checked]:shadow-[2px_2px_5px_rgba(0,0,0,0.2),-2px_-2px_5px_rgba(255,255,255,0.7)]";
    
    case "cyberpunk":
      return "h-5 w-5 rounded-full border-2 border-yellow-400 bg-black shadow-lg shadow-yellow-400/20 hover:border-yellow-300 hover:shadow-yellow-400/40 transition-all duration-300 data-[state=checked]:border-yellow-300 data-[state=checked]:shadow-yellow-400/60";
    
    case "luxury":
      return "h-6 w-6 rounded-full border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-amber-900 dark:to-yellow-900 shadow-lg hover:shadow-xl transition-all duration-300 data-[state=checked]:border-amber-300 data-[state=checked]:shadow-amber-400/30";
    
    case "aurora":
      return "h-5 w-5 rounded-full border-2 border-transparent bg-gradient-to-br from-green-400 via-blue-500 to-purple-600 p-[1px] hover:from-green-300 hover:via-blue-400 hover:to-purple-500 transition-all duration-500 data-[state=checked]:shadow-lg data-[state=checked]:shadow-purple-500/40 animate-pulse";
    
    case "cosmic":
      return "h-5 w-5 rounded-full border-2 border-indigo-500/50 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 shadow-lg shadow-indigo-500/30 hover:border-indigo-400 hover:shadow-indigo-500/50 transition-all duration-300 data-[state=checked]:border-indigo-400 data-[state=checked]:shadow-indigo-400/60";
    
    case "minimal":
      return "h-4 w-4 rounded-full border border-gray-300 dark:border-gray-600 bg-transparent hover:border-gray-400 dark:hover:border-gray-500 transition-colors duration-200 data-[state=checked]:border-gray-900 dark:data-[state=checked]:border-gray-100";
    
    case "elegant":
      return "h-5 w-5 rounded-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 shadow-sm hover:shadow-md transition-all duration-200 data-[state=checked]:border-slate-900 dark:data-[state=checked]:border-slate-100";
    
    case "organic":
      return "h-5 w-5 rounded-full border-2 border-green-400 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 transition-all duration-300 data-[state=checked]:border-green-500 data-[state=checked]:shadow-lg data-[state=checked]:shadow-green-400/30";
    
    case "retro":
      return "h-5 w-5 rounded-full border-2 border-orange-500 bg-orange-100 dark:bg-orange-900/20 shadow-sm hover:shadow-md transition-all duration-200 data-[state=checked]:border-orange-600 data-[state=checked]:shadow-orange-500/30";
    
    case "matrix":
      return "h-5 w-5 rounded-full border-2 border-green-500 bg-black shadow-lg shadow-green-500/20 hover:border-green-400 hover:shadow-green-500/40 transition-all duration-300 data-[state=checked]:border-green-400 data-[state=checked]:shadow-green-400/60 font-mono";
    
    case "diamond":
      return "h-5 w-5 rounded-full border-2 border-pink-400 bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900 dark:to-purple-900 shadow-lg hover:shadow-xl transition-all duration-300 data-[state=checked]:shadow-pink-400/40";
    
    case "liquid":
      return "h-5 w-5 rounded-full border-2 border-blue-400 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900 dark:to-cyan-900 shadow-lg hover:shadow-xl transition-all duration-500 data-[state=checked]:shadow-blue-400/40 animate-pulse";
    
    case "crystal":
      return "h-5 w-5 rounded-full border-2 border-transparent bg-gradient-to-br from-white via-blue-100 to-purple-100 dark:from-gray-800 dark:via-blue-900 dark:to-purple-900 shadow-lg backdrop-blur-sm hover:shadow-xl transition-all duration-300 data-[state=checked]:shadow-purple-400/40";
    
    case "plasma":
      return "h-5 w-5 rounded-full border-2 border-purple-500 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 data-[state=checked]:shadow-lg data-[state=checked]:shadow-purple-400/60 animate-pulse";
    
    case "quantum":
      return "h-5 w-5 rounded-full border-2 border-indigo-400 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-900 dark:via-purple-900 dark:to-pink-900 shadow-lg hover:shadow-xl transition-all duration-500 data-[state=checked]:shadow-indigo-400/40";
    
    case "holographic":
      return "h-5 w-5 rounded-full border-2 border-transparent bg-gradient-to-br from-cyan-400 via-purple-500 to-pink-500 shadow-lg hover:shadow-xl transition-all duration-300 data-[state=checked]:shadow-lg data-[state=checked]:shadow-purple-500/50 animate-pulse";
    
    case "stellar":
      return "h-5 w-5 rounded-full border-2 border-yellow-400 bg-gradient-to-br from-yellow-200 via-orange-300 to-red-400 dark:from-yellow-800 dark:via-orange-800 dark:to-red-800 shadow-lg shadow-yellow-400/30 hover:shadow-yellow-400/50 transition-all duration-300 data-[state=checked]:shadow-lg data-[state=checked]:shadow-yellow-400/60";
    
    case "vortex":
      return "h-5 w-5 rounded-full border-2 border-purple-500 bg-gradient-to-br from-purple-400 via-blue-500 to-cyan-400 shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-500 data-[state=checked]:shadow-lg data-[state=checked]:shadow-purple-400/60 animate-spin-slow";
    
    case "phoenix":
      return "h-5 w-5 rounded-full border-2 border-red-500 bg-gradient-to-br from-red-400 via-orange-500 to-yellow-400 shadow-lg shadow-red-500/30 hover:shadow-red-500/50 transition-all duration-300 data-[state=checked]:shadow-lg data-[state=checked]:shadow-red-400/60 animate-pulse";
    
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
        <div className="h-full w-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center">
          <RadioGroupPrimitive.Indicator className="flex items-center justify-center text-gray-900 dark:text-white">
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
