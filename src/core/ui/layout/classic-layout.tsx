"use client"

import type React from "react"
import { ClassicSidebar } from "./classic-sidebar"
import { ClassicHeader } from "./classic-header"
import { useI18n } from "@core/providers/i18n-provider"
import { useSettings } from "@core/providers/settings-provider"
import { cn } from "@core/common/utils"
import { useLayoutStyles } from "./use-layout-styles"

interface ClassicLayoutProps {
  children: React.ReactNode
  sidebarOpen: boolean
  onSidebarOpenChange: (open: boolean) => void
}

export function ClassicLayout({ children, sidebarOpen, onSidebarOpenChange }: ClassicLayoutProps) {
  const { direction } = useI18n()
  const settings = useSettings()
  const {
    getSpacingClass,
    getAnimationClass,
    getBorderRadiusClass,
    getShadowClass,
  } = useLayoutStyles()
  const spacingClass = getSpacingClass({
    compact: "p-4",
    comfortable: "p-10",
    spacious: "p-12",
    default: "p-8",
  })
  const animationClass = getAnimationClass({
    high: "transition-all duration-500 ease-in-out",
  })
  const borderRadiusClass = getBorderRadiusClass()
  const shadowClass = getShadowClass({
    moderate: "shadow-md",
    strong: "shadow-lg",
    default: "shadow-md",
  })

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case "small":
        return "text-sm"
      case "large":
        return "text-lg"
      default:
        return "text-base"
    }
  }

  

  return (
    <div 
      className={cn(
        "min-h-screen bg-background", 
        direction === "rtl" ? "rtl" : "ltr",
        getFontSizeClass(),
        settings.compactMode && "compact-mode",
        settings.highContrast && "high-contrast",
        settings.reducedMotion && "reduce-motion"
      )}
      style={{
        fontSize: `var(--font-size-base)`,
      }}
    >
      {/* Classic sidebar - wider with larger icons and text */}
      <ClassicSidebar open={sidebarOpen} onOpenChange={onSidebarOpenChange} />

      <div 
        className={cn(
          animationClass,
          direction === "rtl" ? "lg:mr-80" : "lg:ml-80"
        )}
      >
        {/* Classic header - simpler with fewer elements */}
        <ClassicHeader onMenuClick={() => onSidebarOpenChange(true)} />

        <main className={cn(spacingClass)}>
          <div 
            className={cn(
              "animate-fade-in",
              borderRadiusClass,
              shadowClass,
              settings.cardStyle === "bordered" && "border border-border",
              settings.cardStyle === "elevated" && "bg-card shadow-lg",
              settings.cardStyle === "glass" && "bg-background/80 backdrop-blur-sm"
            )}
            style={{
              borderRadius: `var(--border-radius)`,
              boxShadow: `var(--shadow-intensity)`,
              padding: `var(--spacing-unit)`,
            }}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className={cn(
            "fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm",
            animationClass
          )}
          onClick={() => onSidebarOpenChange(false)}
        />
      )}
    </div>
  )
}
