"use client";

import type React from "react";
import {
  Search,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  ChevronLeft,
  ChevronRight,
  Home,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useAuth } from "@core/providers/auth-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "./use-layout-styles";
import { useDynamicNavigation } from "@/components/navigation/dynamic-navigation";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { LanguageSwitcher, ThemeSwitcher } from "./common";
import { useRouter } from "next/navigation";

interface NavigationHeaderProps {
  onMenuClick: () => void;
  onPanelToggle: () => void;
  panelOpen: boolean;
  hasPanel: boolean;
  selectedMainItem: string;
  isMobile: boolean;
}

export function NavigationHeader({
  onMenuClick,
  onPanelToggle,
  panelOpen,
  hasPanel,
  selectedMainItem,
  isMobile,
}: NavigationHeaderProps) {
  const { language, direction, t } = useI18n();
  const { user, logout } = useAuth();
  const { colorTheme, cardStyle } = useSettings();
  const { getAnimationClass } = useLayoutStyles();
  const animationClass = getAnimationClass();
  const router = useRouter();

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-30 h-16 border-b header-shadow px-6",
        animationClass,
        cardStyle === "glass"
          ? "bg-white/5 dark:bg-white/5 backdrop-blur-xl border-white/10 dark:border-white/10 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]"
          : cardStyle === "solid"
          ? "bg-card border-border backdrop-blur-sm"
          : cardStyle === "bordered"
          ? "bg-card border border-border"
          : "bg-card"
      )}
    >
      {/* Header Content Container */}
      <div
        className={cn(
          "h-full flex items-center justify-between px-4 lg:px-6",
          animationClass,
          // Dynamic margins based on sidebar states
          direction === "rtl"
            ? cn(
                isMobile ? "mr-0" : "mr-24", // Account for main sidebar on desktop (w-24 = 96px)
                !isMobile && panelOpen && hasPanel && "mr-[352px]" // Total width when both sidebars open (96px + 256px)
              )
            : cn(
                isMobile ? "ml-0" : "ml-24", // Account for main sidebar on desktop (w-24 = 96px)
                !isMobile && panelOpen && hasPanel && "ml-[352px]" // Total width when both sidebars open (96px + 256px)
              )
        )}
      >
        {/* Left Section - Mobile Menu + Panel Toggle + Title */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="sidebar-trigger hover:bg-accent hover:text-accent-foreground lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>

          {/* Panel Toggle Icon - Only show if there's a panel and not mobile */}
          {hasPanel && !isMobile && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onPanelToggle();
              }}
              className="cursor-pointer hover:opacity-80 transition-opacity flex items-center justify-center w-10 h-10"
              title={
                panelOpen
                  ? t("layout.hide_panel") || "Hide Panel"
                  : t("layout.show_panel") || "Show Panel"
              }
            >
              {direction === "rtl" ? (
                panelOpen ? (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                    <path d="M9 18L15 12L9 6" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" style={{ transform: 'scaleX(-1)' }}>
                    <rect x="3" y="6" width="18" height="2" rx="1" fill="hsl(var(--primary))"/>
                    <rect x="3" y="11" width="12" height="2" rx="1" fill="hsl(var(--primary))"/>
                    <rect x="3" y="16" width="15" height="2" rx="1" fill="hsl(var(--primary))"/>
                  </svg>
                )
              ) : panelOpen ? (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="6" width="18" height="2" rx="1" fill="hsl(var(--primary))"/>
                  <rect x="3" y="11" width="12" height="2" rx="1" fill="hsl(var(--primary))"/>
                  <rect x="3" y="16" width="15" height="2" rx="1" fill="hsl(var(--primary))"/>
                </svg>
              )}
            </div>
          )}

          {/* App Title */}
          <div className="flex items-center">
            <h1 className="text-lg font-semibold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              {t("app.title")}
            </h1>
          </div>
        </div>

        {/* Center Section - Search */}
        <div className="flex-1 max-w-md mx-8 min-w-0 hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="search"
              placeholder={t("layout.search_placeholder") || "Search here..."}
              className={cn(
                "w-full pl-10 pr-12 transition-all duration-200 bg-transparent border-border",
                "focus:border-primary focus:ring-primary/20 focus:bg-transparent"
              )}
            />
            <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs text-muted-foreground">
              /
            </kbd>
          </div>
        </div>

        {/* Right Section - Theme, Language, Profile */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Search Button for Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent hover:text-accent-foreground md:hidden"
            title="Search"
          >
            <Search className="w-5 h-5" />
          </Button>

          {/* Home Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="hover:bg-accent hover:text-accent-foreground"
            // title={t("nav.home") || "Home"}
          >
            <Home className="w-5 h-5" />
          </Button>

          <ThemeSwitcher
            buttonClassName="hover:bg-accent hover:text-accent-foreground"
            contentClassName="bg-popover border-border"
          />

          <LanguageSwitcher
            buttonClassName="hover:bg-accent hover:text-accent-foreground"
            contentClassName="bg-popover border-border"
          />

          {/* User Profile Dropdown */}
          <UserProfileDropdown
            variant="navigation"
            showName={!isMobile}
            className="flex-shrink-0"
          />
        </div>
      </div>
    </header>
  );
}
