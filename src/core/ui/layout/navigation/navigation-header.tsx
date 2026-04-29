"use client";

import dynamic from "next/dynamic";
import { Search, Menu, Home, ChevronRight, ChevronLeft } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "../shared/use-layout-styles";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { Input } from "@core/ui/input";
import { useRouter, usePathname } from "next/navigation";
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";
import {
  PanelMenuIcon,
  PanelMenuIconRTL,
  PanelCollapseIcon,
  PanelCollapseIconRTL,
} from "./nav-icons";

// Lazy-load secondary header components (dropdowns/popovers — not LCP-critical)
const UserProfileDropdown = dynamic(
  () =>
    import("@core/ui/user-profile-dropdown").then((m) => ({
      default: m.UserProfileDropdown,
    })),
  { ssr: false }
);
const NotificationBell = dynamic(
  () => import("@core/ui/notification").then((m) => ({ default: m.NotificationBell })),
  { ssr: false }
);
const ThemeSwitcher = dynamic(
  () => import("../common/theme-switcher").then((m) => ({ default: m.ThemeSwitcher })),
  { ssr: false }
);
const LanguageSwitcher = dynamic(
  () => import("../common/language-switcher").then((m) => ({ default: m.LanguageSwitcher })),
  { ssr: false }
);

interface NavigationHeaderProps {
  onMenuClick: () => void;
  onPanelToggle: () => void;
  panelOpen: boolean;
  hasPanel: boolean;
  selectedMainItem: string;
  isMobile: boolean;
  activeAncestry?: string[];
}

export function NavigationHeader({
  onMenuClick,
  onPanelToggle,
  panelOpen,
  hasPanel,
  selectedMainItem,
  isMobile,
  activeAncestry = [],
}: NavigationHeaderProps) {
  const { language, direction, t } = useI18n();
  const appName = useBrandedAppName();
  const user = useAppStore((state) => state.user);
  const { colorTheme, cardStyle } = useSettings();
  const { getAnimationClass } = useLayoutStyles();
  const animationClass = getAnimationClass();
  const router = useRouter();
  const pathname = usePathname();

  const isRTL = direction === "rtl";

  // Dynamic breadcrumbs from ancestry
  const showBreadcrumbs = activeAncestry.length > 0;
  const BreadcrumbChevron = isRTL ? ChevronLeft : ChevronRight;

  // Hide home button when already on dashboard
  const isOnDashboard = pathname === "/";

  // Panel toggle icons — use extracted components
  const renderPanelToggleIcon = () => {
    if (isRTL) {
      return panelOpen ? <PanelCollapseIconRTL /> : <PanelMenuIconRTL />;
    }
    return panelOpen ? <PanelCollapseIcon /> : <PanelMenuIcon />;
  };

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
          // Dynamic margins using CSS variables for consistency
          isRTL
            ? cn(
                isMobile ? "mr-0" : "mr-[var(--main-sidebar-w,6rem)]",
                !isMobile && panelOpen && hasPanel && "mr-[var(--total-sidebar-w,22rem)]"
              )
            : cn(
                isMobile ? "ml-0" : "ml-[var(--main-sidebar-w,6rem)]",
                !isMobile && panelOpen && hasPanel && "ml-[var(--total-sidebar-w,22rem)]"
              )
        )}
      >
        {/* Left Section - Mobile Menu + Panel Toggle + Breadcrumbs */}
        <div className="flex flex-shrink-0 items-center gap-3">
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
              {renderPanelToggleIcon()}
            </div>
          )}

          {/* Breadcrumbs — shows current navigation path (desktop only) */}
          {showBreadcrumbs && !isMobile && (
            <nav aria-label="breadcrumb" className="flex items-center gap-1 text-sm">
              {activeAncestry.map((name, index) => {
                const isLast = index === activeAncestry.length - 1;
                const displayLabel = t(name) || name;

                return (
                  <span key={name} className="flex items-center gap-1">
                    {index > 0 && (
                      <BreadcrumbChevron className="h-3 w-3 flex-shrink-0 text-muted-foreground/60" />
                    )}
                    <span
                      className={cn(
                        "max-w-[140px] truncate",
                        isLast ? "font-medium text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {displayLabel}
                    </span>
                  </span>
                );
              })}
            </nav>
          )}

          {/* App Title — show on mobile always, or desktop when no breadcrumbs */}
          {(isMobile || !showBreadcrumbs) && (
            <div className="flex items-center">
              <h1 className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-lg font-semibold text-transparent">
                {appName}
              </h1>
            </div>
          )}
        </div>

        {/* Center Section - Search */}
        <div className="mx-8 hidden min-w-0 max-w-md flex-1 md:block">
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

          {/* Home Button — hide when already on dashboard */}
          {!isOnDashboard && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="hover:bg-accent hover:text-accent-foreground"
            >
              <Home className="h-5 w-5" />
            </Button>
          )}

          <ThemeSwitcher
            buttonClassName="hover:bg-accent hover:text-accent-foreground"
            contentClassName="bg-popover border-border"
          />

          <LanguageSwitcher
            buttonClassName="hover:bg-accent hover:text-accent-foreground"
            contentClassName="bg-popover border-border"
          />

          {/* User Profile Dropdown */}
          <NotificationBell iconClassName="h-5 w-5" />
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
