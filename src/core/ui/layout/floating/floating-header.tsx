"use client";

import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Button } from "@core/ui/button";
import { Logo } from "@core/ui/logo";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { PageBreadcrumbs } from "@core/ui/page-breadcrumbs";
import { useRouter } from "next/navigation";
import {
      Bell,
      Menu,
      Home,
      Search,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { HeaderSearch, LanguageSwitcher, ThemeSwitcher } from "../common";

interface FloatingHeaderProps {
      onMenuClick: () => void;
      sidebarOpen: boolean;
}

/**
 * Floating Header — A detached, floating header bar.
 *
 * Key design decisions:
 * - Not edge-to-edge: has horizontal margins so it floats
 * - Rounded corners (rounded-2xl) to match the floating sidebar
 * - Background blur + semi-transparent fill for depth
 * - Elevated with shadow, creating a floating card look
 * - Sits below the top edge with a gap (mt-3)
 * - Includes all standard header components: lang, theme, user, notifications
 */
export function FloatingHeader({ onMenuClick, sidebarOpen }: FloatingHeaderProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const router = useRouter();
      const isRTL = direction === "rtl";

      return (
            <header
                  className={cn(
                        // Floating position
                        settings.stickyHeader
                              ? "sticky top-3 z-30"
                              : "relative mt-3",
                        // Floating card styling — margins on sides
                        "mx-3 rounded-2xl",
                        "bg-card/90 backdrop-blur-xl",
                        "border border-border/50",
                        "shadow-lg shadow-black/5 dark:shadow-black/20",
                        styles.getAnimationClass(),
                  )}
            >
                  <div className={cn(
                        "flex items-center justify-between px-5 h-14",
                  )}>
                        {/* Left side */}
                        <div className="flex items-center gap-3">
                              {/* Menu toggle */}
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={onMenuClick}
                                    className="sidebar-trigger w-9 h-9 rounded-xl hover:bg-muted"
                              >
                                    <Menu className="w-4 h-4" />
                              </Button>

                              {/* Logo — visible on mobile */}
                              <div className="lg:hidden">
                                    <Logo size="sm" />
                              </div>

                              {/* Search */}
                              <HeaderSearch
                                    containerClassName="hidden md:block"
                                    inputClassName={cn(
                                          "bg-muted/50 border-0 focus:bg-background transition-colors w-72",
                                          "rounded-xl",
                                          isRTL ? "pr-10 pl-4" : "pl-10 pr-4",
                                    )}
                                    iconClassName={cn(
                                          isRTL ? "right-3 left-auto" : "left-3",
                                    )}
                              />
                        </div>

                        {/* Right side */}
                        <div className="flex items-center gap-2">
                              {/* Home */}
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push("/")}
                                    className="w-9 h-9 rounded-xl hover:bg-muted"
                                    title={t("nav.home") || "Home"}
                              >
                                    <Home className="w-4 h-4" />
                              </Button>

                              {/* Language Switcher */}
                              <LanguageSwitcher buttonClassName="rounded-xl hover:bg-muted" />

                              {/* Theme Switcher */}
                              <ThemeSwitcher buttonClassName="rounded-xl hover:bg-muted" />

                              {/* Notifications */}
                              {settings.showNotifications && (
                                    <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-muted">
                                          <Bell className="w-4 h-4" />
                                    </Button>
                              )}

                              {/* Mobile Search */}
                              <Button variant="ghost" size="icon" className="w-9 h-9 rounded-xl hover:bg-muted md:hidden">
                                    <Search className="w-4 h-4" />
                              </Button>

                              {/* User Profile */}
                              <UserProfileDropdown showName={false} />
                        </div>
                  </div>

                  {/* Breadcrumbs */}
                  {settings.showBreadcrumbs && (
                        <div className="px-5 pb-2 hidden md:block">
                              <PageBreadcrumbs segments={[]} />
                        </div>
                  )}
            </header>
      );
}
