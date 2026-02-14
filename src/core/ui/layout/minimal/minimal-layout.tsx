"use client";

import type React from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { MinimalHeader } from "./minimal-header";
import { Footer } from "@core/ui/layout/shared/footer";
import { cn } from "@core/common/utils";

interface MinimalLayoutProps {
  children: React.ReactNode;
}

/**
 * Minimal Layout — No sidebar, topbar navigation only.
 *
 * All navigation lives in the horizontal header via dropdown menus.
 * Content area is centered (max-w-6xl) with generous whitespace.
 * The cleanest, most typography-driven layout.
 *
 * Inspired by Vercel/Stripe dashboards.
 */
export function MinimalLayout({ children }: MinimalLayoutProps) {
  const { direction } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();

  return (
    <div
      className={cn(
        "min-h-screen bg-background",
        styles.getAnimationClass(),
        direction === "rtl" ? "rtl" : "ltr",
        settings.compactMode === true && "compact-mode",
        settings.highContrast === true && "high-contrast",
        settings.reducedMotion === true && "reduce-motion"
      )}
    >
      {/* Header with horizontal navigation */}
      <MinimalHeader />

      {/* Content — centered, generous whitespace */}
      <main className="min-h-[calc(100vh-3.5rem)]">
        <div
          className={cn(
            styles.getSpacingClass({
              compact: "px-6 py-4",
              comfortable: "px-12 py-8",
              spacious: "px-16 py-12",
              default: "px-8 py-6",
            })
          )}
        >
          <div
            className={cn(
              "mx-auto max-w-6xl",
              styles.getBorderRadiusClass(),
              styles.getShadowClass(),
              settings.cardStyle === "bordered" && "border border-border",
              settings.cardStyle === "elevated" && "bg-card shadow-lg",
              settings.animationLevel === "high" && "animate-fade-in"
            )}
            style={{
              borderRadius: "var(--border-radius)",
              boxShadow: "var(--shadow-intensity)",
              padding: "var(--spacing-unit)",
            }}
          >
            {children}
          </div>
        </div>
      </main>

      {settings.showFooter === true && <Footer />}
    </div>
  );
}
