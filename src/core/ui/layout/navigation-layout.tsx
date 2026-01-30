"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useDynamicNavigation } from "@/components/navigation/dynamic-navigation";
import { NavigationHeader } from "./navigation-header";
import { NavigationMainSidebar } from "./navigation-main-sidebar";
import { NavigationPanelSidebar } from "./navigation-panel-sidebar";
import { cn } from "@core/common/utils";
import { Footer } from "@core/ui/layout/footer";

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
  const pathname = usePathname();
  const [activeMainItem, setActiveMainItem] = useState<string>("");
  const [selectedMainItem, setSelectedMainItem] = useState<string | null>(null);
  const [panelSidebarOpen, setPanelSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });
  const manualSelectionRef = useRef(false);

  // Helper function to find parent item for current path
  const findParentItemForPath = (path: string) => {
    // First, check if path exactly matches any item
    for (const item of navigation) {
      if (item.href === path) {
        return item.name;
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.href === path) {
            return item.name; // Return parent of this child
          }
          // Check nested children
          if (child.children) {
            for (const nestedChild of child.children) {
              if (nestedChild.href === path) {
                return item.name; // Return grandparent
              }
            }
          }
        }
      }
    }

    // If no exact match, check if path starts with any child's href (for dynamic routes)
    // Ensure proper path segment match (next char must be '/' or end of string)
    for (const item of navigation) {
      if (item.children) {
        for (const child of item.children) {
          if (child.href && child.href !== "/" && path.startsWith(child.href)) {
            // Ensure the next character after the href is either '/' or end of string
            // This prevents partial matches like /system/entryGate matching /system/entryGateVisitor
            const nextChar = path[child.href.length];
            if (nextChar === undefined || nextChar === "/") {
              return item.name;
            }
          }
          // Check nested children
          if (child.children) {
            for (const nestedChild of child.children) {
              if (nestedChild.href && nestedChild.href !== "/" && path.startsWith(nestedChild.href)) {
                const nextChar = path[nestedChild.href.length];
                if (nextChar === undefined || nextChar === "/") {
                  return item.name;
                }
              }
            }
          }
        }
      }
    }

    // No matching item found for this path
    return "";
  };

  // Update active item based on current pathname (only when navigating via URL)
  useEffect(() => {
    if (manualSelectionRef.current) {
      manualSelectionRef.current = false;
      return;
    }
    
    const parentItem = findParentItemForPath(pathname);
    setActiveMainItem(parentItem);

    // If we're on a child page, keep the panel open
    const parentNavItem = navigation.find((item) => item.name === parentItem);
    const hasChildren =
      parentNavItem?.children && parentNavItem.children.length > 0;

    // Always open panel when we have children and a child page is active
    if (hasChildren && !isMobile) {
      setPanelSidebarOpen(true);
    }

    // Also open main sidebar on mobile when navigating to a page with children
    if (hasChildren && isMobile) {
      onSidebarOpenChange(true);
    }

    // Reset selected item when navigating via URL
    if (selectedMainItem !== null) {
      setSelectedMainItem(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, isMobile]);

  // Get the current item to display (selected takes priority over active)
  const currentItem = selectedMainItem || activeMainItem;
  const currentNavItem = navigation.find(
    (item) => item.name === currentItem
  );
  const hasChildren =
    currentNavItem?.children && currentNavItem.children.length > 0;
  const shouldShowPanel = hasChildren && panelSidebarOpen && !isMobile;

  // Handle main item selection
  const handleMainItemSelect = (itemName: string) => {
    manualSelectionRef.current = true;
    
    // If empty string, clear selection
    if (!itemName || itemName === "") {
      setSelectedMainItem(null);
      // Return to active item's panel
      const activeNavItem = navigation.find((item) => item.name === activeMainItem);
      const activeHasChildren = activeNavItem?.children && activeNavItem.children.length > 0;
      if (activeHasChildren && !isMobile) {
        setPanelSidebarOpen(true);
      }
      return;
    }
    
    const newItem = navigation.find((item) => item.name === itemName);
    const newHasChildren = newItem?.children && newItem.children.length > 0;

    setSelectedMainItem(itemName);

    // Auto-expand panel if new item has children and we're on desktop
    if (newHasChildren && !isMobile) {
      setPanelSidebarOpen(true);
    }
    // Auto-collapse panel if new item has no children
    else if (!newHasChildren) {
      setPanelSidebarOpen(false);
    }
  };

  // Handle panel toggle - only works if current item has children
  const handlePanelToggle = () => {
    if (hasChildren) {
      setPanelSidebarOpen(!panelSidebarOpen);
    }
  };

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);

      if (mobile) {
        setPanelSidebarOpen(false);
      } else {
        // Only auto-open panel if current item has children
        const currentNavItem = navigation.find(
          (item) => item.name === currentItem
        );
        const currentHasChildren =
          currentNavItem?.children && currentNavItem.children.length > 0;
        if (currentHasChildren) {
          setPanelSidebarOpen(true);
        }
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMainItem]);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!isMobile || !event.target) return;

      const sidebar = document.querySelector(".navigation-main-sidebar");
      const panelSidebar = document.querySelector(".navigation-panel-sidebar");
      const sidebarTrigger = document.querySelector(".sidebar-trigger");
      const target = event.target as Node;

      const clickedOutside =
        (!sidebar || !sidebar.contains(target)) &&
        (!panelSidebar || !panelSidebar.contains(target)) &&
        (!sidebarTrigger || !sidebarTrigger.contains(target));

      if (clickedOutside) {
        onSidebarOpenChange(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onSidebarOpenChange, isMobile]);

  const getBackgroundClass = () => {
    switch (settings.cardStyle) {
      case "glass":
        return "bg-gradient-to-br from-background/50 to-background/30 backdrop-blur-xl";
      case "solid":
        return "bg-background";
      case "bordered":
        return "bg-background border border-border";
      default:
        return "bg-background"; // Use solid background instead of gradient
    }
  };

  const getAnimationClass = () => {
    if (settings.animationLevel === "none") return "";
    if (settings.animationLevel === "minimal")
      return "transition-colors duration-200";
    if (settings.animationLevel === "moderate")
      return "transition-all duration-300";
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
      case "small":
        return "text-sm";
      case "large":
        return "text-lg";
      default:
        return "text-base";
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
      className={cn(
        "min-h-screen",
        getBackgroundClass(),
        getAnimationClass(),
        getFontSizeClass(),
        direction === "rtl" ? "rtl" : "ltr",
        settings.compactMode === true && "compact-mode",
        settings.highContrast === true && "high-contrast",
        settings.reducedMotion === true && "reduce-motion"
      )}
      style={{
        fontSize: `var(--font-size-base)`,
      }}
    >
      {/* Main Sidebar - Primary Navigation */}
      <NavigationMainSidebar
        open={sidebarOpen}
        onOpenChange={onSidebarOpenChange}
        activeItem={activeMainItem}
        selectedItem={selectedMainItem}
        onItemSelect={handleMainItemSelect}
      />

      {/* Panel Sidebar - Contextual Options - Only show if current item has children */}
      {hasChildren && (
        <NavigationPanelSidebar
          selectedMainItem={currentItem}
          open={!!shouldShowPanel}
          onOpenChange={setPanelSidebarOpen}
          hasChildren={hasChildren}
        />
      )}

      {/* Navigation Header - FULL WIDTH */}
      <NavigationHeader
        onMenuClick={() => onSidebarOpenChange(true)}
        onPanelToggle={handlePanelToggle}
        panelOpen={!!shouldShowPanel}
        hasPanel={!!hasChildren}
        selectedMainItem={currentItem}
        isMobile={isMobile}
      />

      {/* Main Content Area */}
      <div
        className={cn(
          "min-h-screen",
          settings.stickyHeader === true ? "pt-16" : "pt-4",
          getAnimationClass(),
          // Dynamic margins based on sidebar states and direction
          direction === "rtl"
            ? cn(
                "lg:mr-24", // Always account for main sidebar on desktop (w-24 = 96px)
                shouldShowPanel && "lg:mr-[352px]" // Add total width when both sidebars open (96px + 256px)
              )
            : cn(
                "lg:ml-24", // Always account for main sidebar on desktop (w-24 = 96px)
                shouldShowPanel && "lg:ml-[352px]" // Add total width when both sidebars open (96px + 256px)
              )
        )}
      >
        {/* Main Content */}
        <main className={cn("min-h-screen bg-background px-6 py-4")}>
          <div className={cn(getSpacingClass())}>
            <div
              className={cn(
                settings.animationLevel === "high" && "animate-fade-in",
                settings.animationLevel === "moderate" &&
                  "transition-opacity duration-300",
                getBorderRadiusClass(),
                getShadowClass(),
                settings.cardStyle === "bordered" && "border border-border",
                settings.cardStyle === "elevated" && "bg-card shadow-lg"
              )}
              style={{
                borderRadius: `var(--border-radius)`,
                boxShadow: `var(--shadow-intensity)`,
                padding: `var(--spacing-unit)`,
              }}
            >
              {children}
            </div>
          </div>
        </main>
        {settings.showFooter === true && <Footer />}
      </div>

      {/* Mobile Overlay */}
      {(sidebarOpen || (shouldShowPanel && isMobile)) && (
        <div
          className={cn(
            "fixed inset-0 z-40 lg:hidden backdrop-blur-sm",
            settings.cardStyle === "glass" ? "bg-black/20" : "bg-black/50",
            getAnimationClass()
          )}
          onClick={() => {
            onSidebarOpenChange(false);
            if (isMobile) setPanelSidebarOpen(false);
          }}
        />
      )}
    </div>
  );
}
