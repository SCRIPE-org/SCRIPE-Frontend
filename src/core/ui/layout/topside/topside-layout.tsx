"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
      isNavigationItemActive,
      type NavigationItem,
} from "@core/config/navigation";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { ScrollArea } from "@core/ui/scroll-area";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";

interface TopSideLayoutProps {
      children: React.ReactNode;
}

/**
 * Top+Side Combo Layout — Header with module tabs + sidebar for sub-items.
 *
 * Structure:
 * - Top header with logo + group tabs + actions
 * - Left sidebar showing children of the selected tab
 * - Content area
 * - Mobile: hamburger menu replaces both tiers
 *
 * Inspired by Azure Portal, Notion workspace
 */
export function TopSideLayout({ children }: TopSideLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

      // Top-level groups as tabs
      const groups = useMemo(() => {
            return navigation.filter(
                  (item) => item.children && item.children.length > 0,
            );
      }, [navigation]);

      const directItems = useMemo(() => {
            return navigation.filter(
                  (item) => item.href && (!item.children || item.children.length === 0),
            );
      }, [navigation]);

      // Find active group
      const activeGroup = useMemo(() => {
            for (const group of groups) {
                  if (group.children) {
                        for (const child of group.children) {
                              if (child.href && isNavigationItemActive(child, pathname)) {
                                    return group;
                              }
                        }
                  }
            }
            return groups[0] || null;
      }, [groups, pathname]);

      const sidebarItems = useMemo(() => {
            return activeGroup?.children?.filter((c) => c.href) || [];
      }, [activeGroup]);

      return (
            <div
                  className={cn(
                        "min-h-screen flex flex-col bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Header with Tabs ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "bg-card border-b border-border",
                        )}
                  >
                        <div className="flex items-center justify-between h-12 px-4 lg:px-6">
                              <div className="flex items-center gap-4">
                                    <Logo size="sm" />
                                    <span className="text-sm font-bold text-foreground hidden md:block">
                                          {t("app.title")}
                                    </span>
                              </div>

                              {/* Desktop tabs */}
                              <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                                    {directItems.map((item) => {
                                          const Icon = item.icon;
                                          const isActive = isNavigationItemActive(item, pathname);
                                          return (
                                                <button
                                                      key={item.name}
                                                      onClick={() => item.href && router.push(item.href)}
                                                      className={cn(
                                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                                            isActive
                                                                  ? "bg-primary/10 text-primary"
                                                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                                      )}
                                                >
                                                      {Icon && <Icon className="w-3.5 h-3.5" />}
                                                      {t(item.name) || item.name}
                                                </button>
                                          );
                                    })}
                                    {groups.map((group) => {
                                          const Icon = group.icon;
                                          const isActive = activeGroup?.name === group.name;
                                          return (
                                                <button
                                                      key={group.name}
                                                      onClick={() => {
                                                            const href = group.children?.[0]?.href;
                                                            if (href) router.push(href);
                                                      }}
                                                      className={cn(
                                                            "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                                                            isActive
                                                                  ? "bg-primary/10 text-primary"
                                                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                                      )}
                                                >
                                                      {Icon && <Icon className="w-3.5 h-3.5" />}
                                                      {t(group.name) || group.name}
                                                </button>
                                          );
                                    })}
                              </nav>

                              <div className="flex items-center gap-2">
                                    <LanguageSwitcher />
                                    <ThemeSwitcher />
                                    <UserProfileDropdown showName={false} />
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="lg:hidden h-8 w-8"
                                          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    >
                                          <ChevronDown className="w-4 h-4" />
                                    </Button>
                              </div>
                        </div>
                  </header>

                  <div className="flex-1 flex">
                        {/* ── Left Sidebar (sub-items of active group) ── */}
                        {sidebarItems.length > 0 && (
                              <aside
                                    className={cn(
                                          "hidden lg:flex flex-col w-56 shrink-0",
                                          "bg-card/50 border-e border-border",
                                    )}
                              >
                                    <div className="px-3 py-2 border-b border-border">
                                          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                                {activeGroup ? t(activeGroup.name) || activeGroup.name : ""}
                                          </p>
                                    </div>
                                    <ScrollArea className="flex-1 py-1">
                                          {sidebarItems.map((item) => {
                                                const Icon = item.icon;
                                                const isActive = item.href && isNavigationItemActive(item, pathname);
                                                return (
                                                      <button
                                                            key={item.name}
                                                            onClick={() => item.href && router.push(item.href)}
                                                            className={cn(
                                                                  "w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors text-start",
                                                                  isActive
                                                                        ? "bg-primary/10 text-primary font-medium border-s-2 border-s-primary"
                                                                        : "text-foreground hover:bg-muted/50",
                                                            )}
                                                      >
                                                            {Icon && <Icon className="w-4 h-4 shrink-0" />}
                                                            <span className="truncate">{t(item.name) || item.name}</span>
                                                      </button>
                                                );
                                          })}
                                    </ScrollArea>
                              </aside>
                        )}

                        {/* ── Mobile Drawer ── */}
                        {mobileMenuOpen && (
                              <>
                                    <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                                    <aside
                                          dir={direction}
                                          className={cn(
                                                "fixed top-0 bottom-0 w-80 z-40 bg-card border-e border-border overflow-y-auto flex flex-col lg:hidden",
                                                direction === "rtl" ? "right-0" : "left-0",
                                          )}
                                    >
                                          <div className="flex items-center justify-between p-4 border-b border-border">
                                                <Logo size="sm" />
                                                <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                                                      <X className="w-4 h-4" />
                                                </Button>
                                          </div>
                                          <div className="p-3 border-b border-border"><UserCard size="sm" /></div>
                                          <div className="flex-1 p-3 overflow-y-auto">
                                                <NavRenderer variant="default" onNavigate={() => setMobileMenuOpen(false)} />
                                          </div>
                                          <div className="p-3 border-t border-border"><LogoutButton /></div>
                                    </aside>
                              </>
                        )}

                        {/* ── Content ── */}
                        <main className="flex-1 min-w-0 p-6">
                              <div style={{ borderRadius: "var(--border-radius)" }}>
                                    {children}
                              </div>
                        </main>
                  </div>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
