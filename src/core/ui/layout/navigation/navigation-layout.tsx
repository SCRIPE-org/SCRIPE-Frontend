"use client";

import type React from "react";
import { useEffect, useRef } from "react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { NavigationHeader } from "./navigation-header";
import { NavigationMainSidebar } from "./navigation-main-sidebar";
import { NavigationPanelSidebar } from "./navigation-panel-sidebar";
import { useNavigationState } from "./useNavigationState";
import { cn } from "@core/common/utils";
import { Footer } from "@core/ui/layout/shared/footer";

interface NavigationLayoutProps {
  children: React.ReactNode;
  sidebarOpen: boolean;
  onSidebarOpenChange: (open: boolean) => void;
}

export function NavigationLayout({
  children,
  sidebarOpen,
  onSidebarOpenChange,
}: NavigationLayoutProps) {
  const { direction } = useI18n();
  const settings = useSettings();
  const navigation = useDynamicNavigation();

  // ── Single source of truth for all navigation state ──
  const nav = useNavigationState(navigation);

  const layoutRef = useRef<HTMLDivElement>(null);

  // ── Close mobile sidebar when clicking outside ──
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!nav.isMobile || !event.target) return;

      const sidebars = document.querySelectorAll(".navigation-main-sidebar");
      const panelSidebar = document.querySelector(".navigation-panel-sidebar");
      const sidebarTrigger = document.querySelector(".sidebar-trigger");
      const target = event.target as Node;

      // Check if click is inside ANY sidebar element (desktop or mobile)
      let insideSidebar = false;
      sidebars.forEach((sidebar) => {
        if (sidebar.contains(target)) insideSidebar = true;
      });

      const clickedOutside =
        !insideSidebar &&
        (!panelSidebar || !panelSidebar.contains(target)) &&
        (!sidebarTrigger || !sidebarTrigger.contains(target));

      if (clickedOutside) {
        onSidebarOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onSidebarOpenChange, nav.isMobile]);

  // ── Styling helpers ──
  const getBackgroundClass = () => {
    switch (settings.cardStyle) {
      case "glass":
        return "bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-xl";
      case "solid":
        return "bg-background";
      case "bordered":
        return "bg-background border border-border";
      default:
        return "bg-background";
    }
  };

  const getAnimationClass = () => {
    if (settings.animationLevel === "none") return "";
    if (settings.animationLevel === "minimal") return "transition-colors duration-200";
    if (settings.animationLevel === "moderate") return "transition-all duration-300";
    return "transition-all duration-500 ease-in-out";
  };

  const getSpacingClass = () => {
    switch (settings.spacingSize) {
      case "compact":
        return "p-4 lg:p-6";
      case "comfortable":
        return "p-8 lg:p-12";
      case "spacious":
        return "p-12 lg:p-16";
      default:
        return "p-6 lg:p-8";
    }
  };

  const getFontSizeClass = () => {
    switch (settings.fontSize) {
      case "xs":
        return "text-xs";
      case "small":
        return "text-sm";
      case "medium":
        return "text-base";
      case "large":
        return "text-xl";
      case "xl":
        return "text-2xl";
      default:
        return "text-lg";
    }
  };

  const getBorderRadiusClass = () => {
    switch (settings.borderRadius) {
      case "none":
        return "rounded-none";
      case "small":
        return "rounded-sm";
      case "large":
        return "rounded-lg";
      case "full":
        return "rounded-full";
      default:
        return "rounded-md";
    }
  };

  const getShadowClass = () => {
    switch (settings.shadowIntensity) {
      case "none":
        return "";
      case "subtle":
        return "shadow-sm";
      case "strong":
        return "shadow-lg";
      default:
        return "shadow-md";
    }
  };

  return (
    <div
      ref={layoutRef}
      className={cn(
        "min-h-screen",
        getBackgroundClass(),
        getAnimationClass(),
        getFontSizeClass(),
        direction === "rtl" ? "rtl" : "ltr",
        settings.highContrast === true && "high-contrast",
        settings.reducedMotion === true && "reduce-motion"
      )}
      style={
        {
          fontSize: "var(--font-size-base)",
          // CSS custom properties for sidebar widths — single source of truth
          "--main-sidebar-w": "6rem",
          "--panel-sidebar-w": "16rem",
          "--total-sidebar-w": "22rem",
        } as React.CSSProperties
      }
    >
      {/* Main Sidebar - Primary Navigation */}
      <NavigationMainSidebar
        open={sidebarOpen}
        onOpenChange={onSidebarOpenChange}
        activeMainItem={nav.activeMainItem}
        selectedMainItem={nav.selectedMainItem}
        onItemClick={nav.handleMainItemClick}
        isMobile={nav.isMobile}
      />

      {/* Panel Sidebar - Always mounted, CSS-hidden when closed */}
      <NavigationPanelSidebar
        currentMainItem={nav.currentMainItem}
        open={nav.panelOpen}
        onOpenChange={nav.handlePanelToggle}
        hasChildren={nav.hasChildren}
        expandedItems={nav.expandedItems}
        toggleExpanded={nav.toggleExpanded}
        activeAncestry={nav.activeAncestry}
      />

      {/* Navigation Header — with breadcrumbs */}
      <NavigationHeader
        onMenuClick={() => onSidebarOpenChange(true)}
        onPanelToggle={nav.handlePanelToggle}
        panelOpen={nav.panelOpen}
        hasPanel={nav.hasChildren}
        selectedMainItem={nav.currentMainItem}
        isMobile={nav.isMobile}
        activeAncestry={nav.activeAncestry}
      />

      {/* Main Content Area — flex column for sticky footer */}
      <div
        className={cn(
          "flex min-h-screen flex-col",
          settings.stickyHeader === true ? "pt-16" : "pt-4",
          getAnimationClass(),
          // Dynamic margins using CSS variables
          direction === "rtl"
            ? cn("lg:mr-[var(--main-sidebar-w)]", nav.panelOpen && "lg:mr-[var(--total-sidebar-w)]")
            : cn("lg:ml-[var(--main-sidebar-w)]", nav.panelOpen && "lg:ml-[var(--total-sidebar-w)]")
        )}
      >
        <main className="flex-1 bg-background">
          <div className={cn(getSpacingClass())}>
            <div
              className={cn(
                settings.animationLevel === "high" && "animate-fade-in",
                settings.animationLevel === "moderate" && "transition-opacity duration-300",
                getBorderRadiusClass(),
                getShadowClass(),
                settings.cardStyle === "bordered" && "border border-border",
                settings.cardStyle === "elevated" && "bg-card shadow-lg"
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

        {/* Sticky Footer — pushed to bottom by flex-1 on main */}
        {settings.showFooter === true && <Footer />}
      </div>

      {/* Mobile Overlay — closes BOTH sidebar AND resets panel state */}
      {(sidebarOpen || (nav.panelOpen && nav.isMobile)) && (
        <div
          className={cn(
            "fixed inset-0 z-40 backdrop-blur-sm lg:hidden",
            settings.cardStyle === "glass" ? "bg-black/20" : "bg-black/50",
            getAnimationClass()
          )}
          onClick={() => {
            onSidebarOpenChange(false);
          }}
        />
      )}
    </div>
  );
}
