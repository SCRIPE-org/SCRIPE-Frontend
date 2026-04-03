"use client";

import { useSettings } from "@core/providers/settings-provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@core/ui/card";
import { Check, MoveUp, ZoomIn, Sparkles, Zap, RotateCw, Move } from "lucide-react";
import { cn, getHoverEffectClasses } from "@core/common/utils";

export function HoverEffectsSection() {
  const settings = useSettings();
  const hasHoverEffect = settings.hoverEffectType !== "none" && settings.hoverEffectIntensity !== "none";

  const effectTypes = [
    { value: "none", name: "None", description: "No hover effect", icon: Move },
    { value: "elevate", name: "Elevate", description: "Lift and shadow", icon: MoveUp },
    { value: "scale", name: "Scale", description: "Grow on hover", icon: ZoomIn },
    { value: "glow", name: "Glow", description: "Glowing border", icon: Sparkles },
    { value: "shimmer", name: "Shimmer", description: "Shimmer animation", icon: Zap },
    { value: "rotate", name: "Rotate", description: "Slight rotation", icon: RotateCw },
    { value: "slide", name: "Slide", description: "Slide movement", icon: Move },
  ];

  const intensities = [
    { value: "none", name: "None", description: "No effect", level: 0 },
    { value: "small", name: "Small", description: "Subtle effect", level: 1 },
    { value: "medium", name: "Medium", description: "Balanced effect", level: 2 },
    { value: "strong", name: "Strong", description: "Bold effect", level: 3 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <MoveUp className="h-5 w-5 text-primary" />
          </div>
          Hover Effects
        </CardTitle>
        <CardDescription>Customize hover effects for cards and tables. Choose from 6 effect types and 4 intensity levels.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Effect Type */}
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Hover Effect Type</h4>
            <p className="mb-4 text-xs text-muted-foreground">Select the type of hover effect to apply</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-7">
            {effectTypes.map((effect) => (
              <div key={effect.value} className={cn("relative cursor-pointer rounded-lg border-2 p-4 transition-all", settings.hoverEffectType === effect.value ? "border-primary ring-2 ring-primary/20" : "border-muted hover:border-muted-foreground/50")} onClick={() => settings.setHoverEffectType(effect.value as any)}>
                <div className="space-y-3">
                  <div className="flex justify-center"><effect.icon className="h-6 w-6 text-primary" /></div>
                  <div className="text-center">
                    <h4 className="text-sm font-semibold">{effect.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{effect.description}</p>
                  </div>
                </div>
                {settings.hoverEffectType === effect.value && (<div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary"><Check className="h-3 w-3 text-primary-foreground" /></div>)}
              </div>
            ))}
          </div>
        </div>

        {/* Intensity */}
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Hover Effect Intensity</h4>
            <p className="mb-4 text-xs text-muted-foreground">Control the strength of the hover effect</p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {intensities.map((intensity) => (
              <div key={intensity.value} className={cn("relative cursor-pointer rounded-lg border-2 p-4 transition-all", settings.hoverEffectIntensity === intensity.value ? "border-primary ring-2 ring-primary/20" : "border-muted hover:border-muted-foreground/50")} onClick={() => settings.setHoverEffectIntensity(intensity.value as any)}>
                <div className="space-y-3">
                  <div className="flex justify-center gap-1">
                    {[...Array(4)].map((_, i) => (<div key={i} className={cn("h-8 rounded transition-all", i < intensity.level ? "w-3 bg-primary" : "w-3 bg-muted")} />))}
                  </div>
                  <div className="text-center">
                    <h4 className="text-sm font-semibold">{intensity.name}</h4>
                    <p className="mt-1 text-xs text-muted-foreground">{intensity.description}</p>
                  </div>
                </div>
                {settings.hoverEffectIntensity === intensity.value && (<div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary"><Check className="h-3 w-3 text-primary-foreground" /></div>)}
              </div>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Preview</h4>
            <p className="mb-4 text-xs text-muted-foreground">Hover over the cards below to see the effect</p>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Card Preview</CardTitle>
                <CardDescription>This card demonstrates the hover effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Hover over this card to see the {settings.hoverEffectType !== "none" ? settings.hoverEffectType : "no"} effect
                </p>
              </CardContent>
            </Card>
            <div className={cn("cursor-pointer rounded-lg border bg-card p-4", !hasHoverEffect && "transition-none", getHoverEffectClasses(settings.hoverEffectType, settings.hoverEffectIntensity))}>
              <div className="mb-2 text-sm font-semibold">Table Row Preview</div>
              <div className="text-xs text-muted-foreground">Hover over this element to see the table row hover effect</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
