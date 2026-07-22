"use client";

import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "@core/common/utils";
import { useSettings } from "@core/providers/settings-provider";
import { useI18n } from "@core/providers/i18n-provider";

interface SwitchProps extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  showLabels?: boolean;
  onLabel?: string;
  offLabel?: string;
  switchStyle?: string;
}

const Switch = React.forwardRef<React.ElementRef<typeof SwitchPrimitives.Root>, SwitchProps>(
  (
    {
      className,
      showLabels = false,
      onLabel,
      offLabel,
      switchStyle: overrideSwitchStyle,
      ...props
    },
    ref
  ) => {
    const { switchStyle: settingsSwitchStyle, colorTheme } = useSettings();
    const { t, direction } = useI18n();

    // Use override style if provided, otherwise use settings
    const switchStyle = overrideSwitchStyle || settingsSwitchStyle || "default";

    // Default labels
    const defaultOnLabel = onLabel || t("common.yes");
    const defaultOffLabel = offLabel || t("common.no");
    const isRTL = direction === "rtl";

    // Get style-specific classes with RTL support
    const getSwitchStyles = () => {
      const baseStyles =
        "peer inline-flex shrink-0 cursor-pointer items-center transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

      // Professional sliding switch - consistent behavior for all languages
      const getThumbTransform = () => {
        // All languages: Inactive = LEFT, Active = slide RIGHT
        return "data-[state=unchecked]:translate-x-0 data-[state=checked]:translate-x-5";
      };

      switch (switchStyle) {
        case "modern":
          return {
            root: cn(
              baseStyles,
              "h-7 w-12 rounded-full border-2 border-transparent shadow-lg backdrop-blur-sm",
              "data-[state=checked]:bg-primary data-[state=checked]:shadow-primary/30 data-[state=checked]:border-primary/20",
              "data-[state=unchecked]:bg-muted data-[state=unchecked]:border-border",
              "hover:shadow-xl hover:shadow-primary/10 transform hover:scale-105 active:scale-95",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-white/10 before:to-transparent before:pointer-events-none",
              "relative overflow-hidden",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-xl ring-0 transition-all duration-300",
              "data-[state=checked]:shadow-2xl data-[state=checked]:shadow-primary/30 data-[state=checked]:bg-background",
              "data-[state=unchecked]:bg-background data-[state=unchecked]:shadow-muted-foreground/20",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-background before:to-muted before:opacity-90",
              "relative overflow-hidden",
              getThumbTransform()
            ),
          };

        case "ios":
          return {
            root: cn(
              baseStyles,
              "h-8 w-14 rounded-full border-0 shadow-inner backdrop-blur-sm",
              "data-[state=checked]:bg-primary data-[state=checked]:shadow-inner data-[state=checked]:shadow-primary/30",
              "data-[state=unchecked]:bg-muted",
              "hover:shadow-lg hover:shadow-primary/5 transform hover:scale-[1.02] active:scale-[0.98]",
              "relative overflow-hidden",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/20 before:to-transparent before:pointer-events-none",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-7 w-7 rounded-full bg-background shadow-lg ring-0 transition-all duration-200 my-0.5",
              "data-[state=checked]:bg-background data-[state=checked]:shadow-primary/20",
              "data-[state=unchecked]:bg-background data-[state=unchecked]:shadow-muted-foreground/30",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-background before:to-muted before:opacity-95",
              "relative overflow-hidden shadow-xl",
              getThumbTransform()
            ),
          };

        case "android":
          return {
            root: cn(
              baseStyles,
              "h-6 w-10 rounded-full border-0 backdrop-blur-sm",
              "data-[state=checked]:bg-primary/40 data-[state=checked]:shadow-inner data-[state=checked]:shadow-primary/20",
              "data-[state=unchecked]:bg-muted/40",
              "hover:shadow-md hover:shadow-primary/5 transform hover:scale-105 active:scale-95",
              "relative overflow-hidden",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-5 w-5 rounded-full shadow-xl ring-0 transition-all duration-200",
              "data-[state=checked]:bg-primary data-[state=checked]:shadow-primary/40 data-[state=checked]:shadow-xl",
              "data-[state=unchecked]:bg-background data-[state=unchecked]:shadow-muted-foreground/40",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/30 before:to-transparent before:pointer-events-none",
              "relative overflow-hidden",
              getThumbTransform()
            ),
          };

        case "toggle":
          return {
            root: cn(
              baseStyles,
              "h-8 w-16 rounded-lg border-2 backdrop-blur-sm",
              "data-[state=checked]:border-primary data-[state=checked]:bg-primary/20 data-[state=checked]:shadow-inner data-[state=checked]:shadow-primary/10",
              "data-[state=unchecked]:border-border data-[state=unchecked]:bg-muted",
              "hover:shadow-lg hover:shadow-primary/5 transform hover:scale-[1.02] active:scale-[0.98]",
              "relative overflow-hidden",
              "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-white/10 before:to-transparent before:pointer-events-none",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-6 w-6 rounded-md shadow-lg ring-0 transition-all duration-300 my-0.5 mx-0.5",
              "data-[state=checked]:bg-primary data-[state=checked]:shadow-primary/30 data-[state=checked]:shadow-xl",
              "data-[state=unchecked]:bg-background data-[state=unchecked]:shadow-muted-foreground/30",
              "before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-br before:from-white/20 before:to-transparent before:pointer-events-none",
              "relative overflow-hidden",
              getThumbTransform()
            ),
          };

        case "slider":
          return {
            root: cn(
              baseStyles,
              "h-6 w-12 rounded-full border-0 relative overflow-hidden backdrop-blur-sm",
              "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary data-[state=checked]:to-primary/70 data-[state=checked]:shadow-inner data-[state=checked]:shadow-primary/20",
              "data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-muted data-[state=unchecked]:to-muted/70",
              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/25 before:via-white/10 before:to-transparent before:pointer-events-none",
              "after:absolute after:inset-0 after:bg-gradient-to-b after:from-white/20 after:to-transparent after:pointer-events-none",
              "hover:shadow-xl hover:shadow-primary/10 transform hover:scale-105 active:scale-95",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-4 w-4 rounded-full bg-background shadow-xl ring-0 transition-all duration-300 my-1",
              "data-[state=checked]:bg-background data-[state=checked]:shadow-primary/30",
              "data-[state=unchecked]:bg-background data-[state=unchecked]:shadow-muted-foreground/30",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-background before:to-muted before:opacity-95",
              "relative overflow-hidden shadow-2xl",
              getThumbTransform()
            ),
          };

        case "neon":
          return {
            root: cn(
              baseStyles,
              "h-7 w-13 rounded-full border-2 relative overflow-hidden backdrop-blur-sm",
              "data-[state=checked]:border-primary data-[state=checked]:bg-primary/15 data-[state=checked]:shadow-[0_0_20px_hsl(var(--primary)/0.5)]",
              "data-[state=unchecked]:border-border data-[state=unchecked]:bg-muted",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:pointer-events-none before:animate-pulse",
              "after:absolute after:top-0 after:left-0 after:h-full after:w-full after:rounded-full after:bg-gradient-to-b after:from-white/10 after:to-transparent after:pointer-events-none",
              "hover:shadow-[0_0_30px_hsl(var(--primary)/0.3)] transform hover:scale-105 active:scale-95",
              "transition-all duration-300",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-5 w-5 rounded-full shadow-xl ring-0 transition-all duration-300",
              "data-[state=checked]:bg-primary data-[state=checked]:shadow-[0_0_15px_hsl(var(--primary)/0.8)] data-[state=checked]:animate-pulse",
              "data-[state=unchecked]:bg-background data-[state=unchecked]:shadow-muted-foreground/50",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/30 before:to-transparent before:pointer-events-none",
              "relative overflow-hidden",
              getThumbTransform()
            ),
          };

        case "neumorphism":
          return {
            root: cn(
              baseStyles,
              "h-8 w-16 rounded-2xl border-0 relative backdrop-blur-sm",
              "data-[state=checked]:bg-primary/20",
              "data-[state=unchecked]:bg-muted",
              "data-[state=checked]:shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.5),inset_4px_4px_8px_rgba(0,0,0,0.1)]",
              "data-[state=unchecked]:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1),inset_-4px_-4px_8px_rgba(255,255,255,0.5)]",
              "dark:data-[state=checked]:shadow-[inset_-4px_-4px_8px_rgba(255,255,255,0.1),inset_4px_4px_8px_rgba(0,0,0,0.3)]",
              "dark:data-[state=unchecked]:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.3),inset_-4px_-4px_8px_rgba(255,255,255,0.1)]",
              "hover:shadow-[inset_-6px_-6px_12px_rgba(255,255,255,0.6),inset_6px_6px_12px_rgba(0,0,0,0.15)] transform hover:scale-[1.02] active:scale-[0.98]",
              "transition-all duration-300",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-6 w-6 rounded-xl ring-0 transition-all duration-300 my-1 mx-1",
              "data-[state=checked]:bg-primary data-[state=checked]:shadow-[2px_2px_4px_rgba(0,0,0,0.2),-2px_-2px_4px_rgba(255,255,255,0.8)]",
              "data-[state=unchecked]:bg-background data-[state=unchecked]:shadow-[2px_2px_4px_rgba(0,0,0,0.2),-2px_-2px_4px_rgba(255,255,255,0.8)]",
              "dark:data-[state=checked]:shadow-[2px_2px_4px_rgba(0,0,0,0.4),-2px_-2px_4px_rgba(255,255,255,0.1)]",
              "dark:data-[state=unchecked]:shadow-[2px_2px_4px_rgba(0,0,0,0.4),-2px_-2px_4px_rgba(255,255,255,0.1)]",
              "relative overflow-hidden",
              getThumbTransform()
            ),
          };

        case "liquid":
          return {
            root: cn(
              baseStyles,
              "h-8 w-16 rounded-full border-0 relative overflow-hidden backdrop-blur-sm",
              "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary/30 data-[state=checked]:via-primary/40 data-[state=checked]:to-primary/30",
              "data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-muted data-[state=unchecked]:to-muted/70",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:pointer-events-none before:animate-pulse",
              "after:absolute after:top-0 after:left-0 after:h-full after:w-full after:rounded-full after:bg-gradient-to-b after:from-white/10 after:to-transparent after:pointer-events-none",
              "hover:shadow-2xl hover:shadow-primary/20 transform hover:scale-105 active:scale-95",
              "transition-all duration-500 ease-out",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-7 w-7 rounded-full shadow-2xl ring-0 transition-all duration-500 ease-out my-0.5",
              "data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-primary data-[state=checked]:via-primary/90 data-[state=checked]:to-primary/80",
              "data-[state=unchecked]:bg-gradient-to-br data-[state=unchecked]:from-background data-[state=unchecked]:to-muted",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/40 before:to-transparent before:pointer-events-none",
              "after:absolute after:inset-1 after:rounded-full after:bg-gradient-to-t after:from-transparent after:to-white/20 after:pointer-events-none",
              "relative overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.15)]",
              getThumbTransform()
            ),
          };

        case "cyberpunk":
          return {
            root: cn(
              baseStyles,
              "h-6 w-14 rounded-sm border-2 relative overflow-hidden backdrop-blur-sm",
              "data-[state=checked]:border-primary data-[state=checked]:bg-black/90 data-[state=checked]:shadow-[0_0_20px_hsl(var(--primary)/0.6),inset_0_0_20px_hsl(var(--primary)/0.1)]",
              "data-[state=unchecked]:border-border data-[state=unchecked]:bg-muted",
              "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-primary/10 before:to-transparent before:pointer-events-none before:animate-pulse",
              "after:absolute after:top-0 after:left-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-transparent after:via-primary/60 after:to-transparent after:pointer-events-none",
              "hover:shadow-[0_0_30px_hsl(var(--primary)/0.4)] hover:border-primary/80 transform hover:scale-105 active:scale-95",
              "transition-all duration-300",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-4 w-4 rounded-sm shadow-xl ring-0 transition-all duration-300 my-0.5 mx-0.5",
              "data-[state=checked]:bg-primary data-[state=checked]:shadow-[0_0_15px_hsl(var(--primary)/1),inset_0_0_10px_rgba(255,255,255,0.2)]",
              "data-[state=unchecked]:bg-muted-foreground data-[state=unchecked]:shadow-muted-foreground/50",
              "before:absolute before:inset-0 before:rounded-sm before:bg-gradient-to-br before:from-white/30 before:to-transparent before:pointer-events-none",
              "after:absolute after:top-0 after:left-0 after:h-0.5 after:w-full after:bg-gradient-to-r after:from-transparent after:via-white/60 after:to-transparent after:pointer-events-none",
              "relative overflow-hidden",
              getThumbTransform()
            ),
          };

        case "glassmorphism":
          return {
            root: cn(
              baseStyles,
              "h-8 w-16 rounded-2xl border border-white/20 backdrop-blur-xl relative overflow-hidden",
              "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary/20 data-[state=checked]:via-primary/30 data-[state=checked]:to-primary/20",
              "data-[state=checked]:border-primary/40 data-[state=checked]:shadow-[0_8px_32px_hsl(var(--primary)/0.3)]",
              "data-[state=unchecked]:bg-white/10 data-[state=unchecked]:border-white/20 dark:data-[state=unchecked]:bg-black/20",
              "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/25 before:to-transparent before:pointer-events-none",
              "after:absolute after:inset-0 after:rounded-2xl after:bg-gradient-to-t after:from-transparent after:to-white/10 after:pointer-events-none",
              "hover:shadow-[0_12px_40px_hsl(var(--primary)/0.2)] transform hover:scale-105 active:scale-95",
              "transition-all duration-500 ease-out",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-7 w-7 rounded-xl shadow-2xl ring-0 transition-all duration-500 ease-out my-0.5",
              "data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-white data-[state=checked]:via-white/95 data-[state=checked]:to-white/90",
              "data-[state=checked]:shadow-[0_8px_25px_hsl(var(--primary)/0.4),inset_0_1px_0_rgba(255,255,255,0.8)]",
              "data-[state=unchecked]:bg-gradient-to-br data-[state=unchecked]:from-white/80 data-[state=unchecked]:to-white/60",
              "data-[state=unchecked]:shadow-[0_4px_15px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.6)]",
              "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-br before:from-white/40 before:to-transparent before:pointer-events-none",
              "relative overflow-hidden backdrop-blur-sm",
              getThumbTransform()
            ),
          };

        case "aurora":
          return {
            root: cn(
              baseStyles,
              "h-7 w-14 rounded-full border-0 relative overflow-hidden backdrop-blur-sm",
              // Keeps the aurora character, but the hue is the tenant's own
              // primary rather than a pinned purple/pink — a decorative skin
              // should still belong to the brand that switched it on.
              "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary/30 data-[state=checked]:via-primary/20 data-[state=checked]:to-accent/30",
              "data-[state=checked]:shadow-[0_0_30px_hsl(var(--primary)/0.4),0_0_60px_hsl(var(--primary)/0.25)]",
              "data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-input data-[state=unchecked]:to-muted",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:pointer-events-none before:animate-pulse",
              "after:absolute after:inset-0 after:rounded-full after:bg-gradient-to-45 after:from-primary/20 after:via-transparent after:to-accent/20 after:pointer-events-none after:animate-spin after:duration-1000",
              "hover:shadow-[0_0_40px_hsl(var(--primary)/0.5)] transform hover:scale-110 active:scale-95",
              "transition-all duration-700 ease-out",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-6 w-6 rounded-full shadow-2xl ring-0 transition-all duration-700 ease-out my-0.5",
              "data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-background data-[state=checked]:via-primary/15 data-[state=checked]:to-accent/15",
              "data-[state=checked]:shadow-[0_0_20px_hsl(var(--primary)/0.8),0_0_40px_hsl(var(--accent)/0.6)]",
              "data-[state=unchecked]:bg-gradient-to-br data-[state=unchecked]:from-background data-[state=unchecked]:to-muted",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/60 before:to-transparent before:pointer-events-none",
              "relative overflow-hidden",
              getThumbTransform()
            ),
          };

        case "matrix":
          return {
            root: cn(
              baseStyles,
              "h-6 w-12 rounded-sm border border-success/50 relative overflow-hidden backdrop-blur-sm",
              "data-[state=checked]:bg-black data-[state=checked]:border-success data-[state=checked]:shadow-[0_0_20px_hsl(var(--success)/0.6),inset_0_0_20px_hsl(var(--success)/0.1)]",
              "data-[state=unchecked]:bg-black data-[state=unchecked]:border-success/30",
              "before:absolute before:inset-0 before:bg-gradient-to-b before:from-success/10 before:via-transparent before:to-success/5 before:pointer-events-none",
              "after:absolute after:top-0 after:left-0 after:h-full after:w-0.5 after:bg-success/60 after:pointer-events-none after:animate-pulse",
              "hover:shadow-[0_0_30px_hsl(var(--success)/0.4)] hover:border-success/80 transform hover:scale-105 active:scale-95",
              "transition-all duration-300",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-4 w-4 rounded-sm shadow-xl ring-0 transition-all duration-300 my-1 mx-1",
              "data-[state=checked]:bg-success data-[state=checked]:shadow-[0_0_15px_hsl(var(--success)/1),inset_0_0_10px_rgba(255,255,255,0.2)]",
              "data-[state=unchecked]:bg-success/60 data-[state=unchecked]:shadow-success/50",
              "before:absolute before:inset-0 before:rounded-sm before:bg-gradient-to-br before:from-success/30 before:to-transparent before:pointer-events-none",
              "after:absolute after:inset-0 after:rounded-sm after:bg-success/20 after:pointer-events-none after:animate-pulse",
              "relative overflow-hidden",
              getThumbTransform()
            ),
          };

        case "cosmic":
          return {
            root: cn(
              baseStyles,
              "h-8 w-16 rounded-full border-0 relative overflow-hidden backdrop-blur-sm",
              // Deep-space character preserved; the light in it is the
              // tenant's primary, not a fixed indigo/purple/pink triad.
              "data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-primary/70 data-[state=checked]:via-primary/85 data-[state=checked]:to-accent/70",
              "data-[state=checked]:shadow-[0_0_30px_hsl(var(--primary)/0.5),0_0_60px_hsl(var(--primary)/0.3),inset_0_0_30px_hsl(var(--primary)/0.2)]",
              "data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-muted data-[state=unchecked]:to-input",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:pointer-events-none before:animate-pulse",
              "after:absolute after:top-1 after:left-2 after:h-1 after:w-1 after:bg-white/80 after:rounded-full after:pointer-events-none after:animate-ping",
              "hover:shadow-[0_0_40px_hsl(var(--primary)/0.6)] transform hover:scale-110 active:scale-95",
              "transition-all duration-700 ease-out",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-7 w-7 rounded-full shadow-2xl ring-0 transition-all duration-700 ease-out my-0.5",
              "data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-background data-[state=checked]:via-primary/15 data-[state=checked]:to-accent/15",
              "data-[state=checked]:shadow-[0_0_25px_hsl(var(--primary)/0.8),0_0_50px_hsl(var(--accent)/0.6)]",
              "data-[state=unchecked]:bg-gradient-to-br data-[state=unchecked]:from-background data-[state=unchecked]:to-muted",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-white/60 before:to-transparent before:pointer-events-none",
              "after:absolute after:top-1 after:left-1 after:h-1 after:w-1 after:bg-primary/80 after:rounded-full after:pointer-events-none after:animate-pulse",
              "relative overflow-hidden",
              getThumbTransform()
            ),
          };

        case "retro":
          return {
            root: cn(
              baseStyles,
              "h-7 w-14 rounded-lg border-2 relative overflow-hidden backdrop-blur-sm",
              "data-[state=checked]:border-warning-strong data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-warning-strong/30 data-[state=checked]:to-primary/30",
              "data-[state=checked]:shadow-[0_0_20px_hsl(var(--warning-strong)/0.5),inset_0_2px_4px_rgba(0,0,0,0.3)]",
              "data-[state=unchecked]:border-border data-[state=unchecked]:bg-gradient-to-r data-[state=unchecked]:from-muted data-[state=unchecked]:to-muted/70",
              "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-b before:from-white/20 before:via-transparent before:to-black/20 before:pointer-events-none",
              "after:absolute after:top-0 after:left-0 after:h-full after:w-full after:rounded-lg after:bg-gradient-to-r after:from-transparent after:via-warning-strong/10 after:to-transparent after:pointer-events-none",
              "hover:shadow-[0_0_25px_hsl(var(--warning-strong)/0.4)] transform hover:scale-105 active:scale-95",
              "transition-all duration-400 ease-out",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-5 w-5 rounded-md shadow-xl ring-0 transition-all duration-400 ease-out my-1 mx-1",
              "data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-warning data-[state=checked]:via-warning-strong data-[state=checked]:to-warning-strong",
              "data-[state=checked]:shadow-[0_4px_15px_hsl(var(--warning-strong)/0.6),inset_0_1px_2px_rgba(255,255,255,0.5),inset_0_-1px_2px_rgba(0,0,0,0.2)]",
              "data-[state=unchecked]:bg-gradient-to-br data-[state=unchecked]:from-background data-[state=unchecked]:to-muted",
              "data-[state=unchecked]:shadow-[0_2px_8px_rgba(0,0,0,0.3),inset_0_1px_2px_rgba(255,255,255,0.3)]",
              "before:absolute before:inset-0 before:rounded-md before:bg-gradient-to-br before:from-white/40 before:to-transparent before:pointer-events-none",
              "relative overflow-hidden",
              getThumbTransform()
            ),
          };

        default: // default style
          return {
            root: cn(
              baseStyles,
              "h-6 w-11 rounded-full border-2 border-transparent backdrop-blur-sm",
              "data-[state=checked]:bg-primary data-[state=checked]:shadow-inner data-[state=checked]:shadow-primary/20",
              // Off-state reads from the theme rather than a pinned grey, so it
              // stays legible on every background the tenant can choose.
              "data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-muted",
              "hover:shadow-md hover:shadow-primary/5 transform hover:scale-[1.02] active:scale-[0.98]",
              "relative overflow-hidden",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-r before:from-white/15 before:to-transparent before:pointer-events-none",
              className
            ),
            thumb: cn(
              "pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-all duration-300",
              "data-[state=checked]:bg-background data-[state=checked]:shadow-primary/20",
              "data-[state=unchecked]:bg-background data-[state=unchecked]:shadow-muted-foreground/20",
              "before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-br before:from-background before:to-muted before:opacity-90",
              "relative overflow-hidden shadow-xl",
              getThumbTransform()
            ),
          };
      }
    };

    const styles = getSwitchStyles();

    if (showLabels) {
      return (
        <div
          className={cn("flex items-center gap-3", isRTL ? "flex-row-reverse space-x-reverse" : "")}
        >
          <span
            className={cn(
              "select-none text-sm font-medium transition-colors duration-200",
              props.checked ? "text-foreground" : "text-muted-foreground"
            )}
          >
            {defaultOnLabel}
          </span>
          <SwitchPrimitives.Root className={styles.root} {...props} ref={ref}>
            <SwitchPrimitives.Thumb className={styles.thumb} />
          </SwitchPrimitives.Root>
          <span
            className={cn(
              "select-none text-sm font-medium transition-colors duration-200",
              props.checked ? "text-muted-foreground" : "text-foreground"
            )}
          >
            {defaultOffLabel}
          </span>
        </div>
      );
    }

    return (
      <div dir="ltr">
        <SwitchPrimitives.Root className={styles.root} {...props} ref={ref}>
          <SwitchPrimitives.Thumb className={styles.thumb} />
        </SwitchPrimitives.Root>
      </div>
    );
  }
);

Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
