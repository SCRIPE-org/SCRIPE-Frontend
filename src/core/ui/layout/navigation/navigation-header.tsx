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
import { useAppStore } from "@core/store/useAppStore";
import { useSettings } from "@core/providers/settings-provider";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { secureTokenService } from "@core/common/secure-token-service";
import { useImpersonation } from "@modules/auth/hooks/useImpersonation";
import { UserCheck } from "lucide-react";
import { useLayoutStyles } from "../shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { LanguageSwitcher, ThemeSwitcher } from "../common";
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
  const user = useAppStore((state) => state.user);
  const { colorTheme, cardStyle } = useSettings();
  const { getAnimationClass } = useLayoutStyles();
  const animationClass = getAnimationClass();
  const router = useRouter();

  // Get state from stores
  const { currentTenant, exitTenantWorld } = useTenantContext();
  const { isImpersonating, stopImpersonation } = useImpersonation();
  const activeTenantId = currentTenant?.id;

  return (
    <header
      className={cn(
        "header-shadow fixed left-0 right-0 top-0 z-30 h-16 border-b px-6",
        animationClass,
        cardStyle === "glass"
          ? "border-white/10 bg-white/5 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-xl dark:border-white/10 dark:bg-white/5 dark:shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]"
          : cardStyle === "solid"
            ? "border-border bg-card backdrop-blur-sm"
            : cardStyle === "bordered"
              ? "border border-border bg-card"
              : "bg-card"
      )}
    >
      {/* Header Content Container */}
      <div
        className={cn(
          "flex h-full items-center justify-between px-4 lg:px-6",
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
        <div className="flex flex-shrink-0 items-center gap-4">
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="sidebar-trigger hover:bg-accent hover:text-accent-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Panel Toggle Icon - Only show if there's a panel and not mobile */}
          {hasPanel && !isMobile && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onPanelToggle();
              }}
              className="flex h-10 w-10 cursor-pointer items-center justify-center transition-opacity hover:opacity-80"
              title={
                panelOpen
                  ? t("layout.hide_panel") || "Hide Panel"
                  : t("layout.show_panel") || "Show Panel"
              }
            >
              {direction === "rtl" ? (
                panelOpen ? (
                  <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 18L15 12L9 6"
                      stroke="hsl(var(--primary))"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-8 w-8"
                    viewBox="0 0 24 24"
                    fill="none"
                    style={{ transform: "scaleX(-1)" }}
                  >
                    <rect x="3" y="6" width="18" height="2" rx="1" fill="hsl(var(--primary))" />
                    <rect x="3" y="11" width="12" height="2" rx="1" fill="hsl(var(--primary))" />
                    <rect x="3" y="16" width="15" height="2" rx="1" fill="hsl(var(--primary))" />
                  </svg>
                )
              ) : panelOpen ? (
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M15 18L9 12L15 6"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="6" width="18" height="2" rx="1" fill="hsl(var(--primary))" />
                  <rect x="3" y="11" width="12" height="2" rx="1" fill="hsl(var(--primary))" />
                  <rect x="3" y="16" width="15" height="2" rx="1" fill="hsl(var(--primary))" />
                </svg>
              )}
            </div>
          )}

          {/* App Title */}
          <div className="flex items-center">
            <h1 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-lg font-semibold text-transparent">
              {t("app.title")}
            </h1>
          </div>
        </div>

        {/* Center Section - Search or Banners */}
        <div className="mx-8 hidden min-w-0 max-w-md flex-1 md:block">
          {isImpersonating ? (
            <div className="flex items-center justify-center rounded-md border border-red-200 bg-red-100 px-4 py-2 text-red-700 dark:border-red-800 dark:bg-red-900/30 dark:text-red-300">
              <UserCheck className="mr-2 h-4 w-4" />
              <span className="mr-4 text-sm font-medium">
                {t("admin.impersonating") || "Impersonating User"}
              </span>
              <Button
                variant="destructive"
                size="sm"
                className="h-7 text-xs"
                onClick={stopImpersonation}
              >
                {t("common.stop") || "Stop"}
              </Button>
            </div>
          ) : activeTenantId && currentTenant ? (
            <div className="flex items-center justify-center rounded-md border border-blue-200 bg-blue-100 px-4 py-2 text-blue-700 dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
              <div className="mr-4 flex flex-col items-start">
                <span className="text-xs font-semibold uppercase opacity-70">
                  {t("tenant.context") || "Tenant Context"}
                </span>
                <span className="text-sm font-bold">{currentTenant.name}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="h-7 border-blue-300 text-xs hover:bg-blue-200 dark:border-blue-700 dark:hover:bg-blue-800"
                onClick={() => {
                  exitTenantWorld();
                  router.push("/tenants");
                }}
              >
                {t("common.exit") || "Exit"}
              </Button>
            </div>
          ) : (
            <div className="relative">
              <Search
                className={cn(
                  "absolute top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground",
                  direction === "rtl" ? "right-3" : "left-3"
                )}
              />
              <Input
                type="search"
                placeholder={t("layout.search_placeholder") || "Search here..."}
                className={cn(
                  "w-full border-border bg-transparent transition-all duration-200",
                  "focus:border-primary focus:bg-transparent focus:ring-primary/20",
                  direction === "rtl" ? "pl-12 pr-10" : "pl-10 pr-12"
                )}
              />
              <kbd
                className={cn(
                  "pointer-events-none absolute top-1/2 inline-flex h-5 -translate-y-1/2 transform select-none items-center gap-1 rounded border border-border bg-muted px-1.5 font-mono text-xs text-muted-foreground",
                  direction === "rtl" ? "left-3" : "right-3"
                )}
              >
                /
              </kbd>
            </div>
          )}
        </div>

        {/* Right Section - Theme, Language, Profile */}
        <div className="flex flex-shrink-0 items-center gap-2">
          {/* Search Button for Mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-accent hover:text-accent-foreground md:hidden"
            title="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Home Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="hover:bg-accent hover:text-accent-foreground"
            // title={t("nav.home") || "Home"}
          >
            <Home className="h-5 w-5" />
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
