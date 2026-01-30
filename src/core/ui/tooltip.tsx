"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { useSettings } from "@core/providers/settings-provider"
import { cn } from "@core/common/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => {
  const settings = useSettings()
  
  const getTooltipClasses = () => {
    const baseClasses = "z-50 overflow-hidden border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
    
    switch (settings.tooltipStyle) {
      case "rounded":
        return cn(baseClasses, "rounded-lg")
      case "sharp":
        return cn(baseClasses, "rounded-none")
      case "bubble":
        return cn(baseClasses, "rounded-lg relative after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-popover")
      case "glass":
        return cn(baseClasses, "rounded-xl bg-background/80 backdrop-blur-md border-white/20 shadow-2xl")
      case "neon":
        return cn(baseClasses, "rounded-lg bg-primary/10 border-primary/50 shadow-lg shadow-primary/25 text-primary-foreground")
      case "minimal":
        return cn(baseClasses, "rounded-sm bg-foreground text-primary-foreground border-none shadow-sm px-2 py-1")
      case "elegant":
        return cn(baseClasses, "rounded-2xl bg-gradient-to-br from-background to-muted border-2 border-border/50 shadow-xl px-4 py-2")
      default:
        return cn(baseClasses, "rounded-md")
    }
  }

  return (
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(getTooltipClasses(), className)}
      {...props}
    />
  )
})
TooltipContent.displayName = TooltipPrimitive.Content.displayName

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
