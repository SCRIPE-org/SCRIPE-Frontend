"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
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
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";

interface DualHeaderLayoutProps {
      children: React.ReactNode;
}

/**
 * Dual Header Layout — Two-row header for modules + actions.
 *
 * Structure:
 * - Primary header: logo + global actions
 * - Secondary header: module tabs / breadcrumb-style navigation
 * - Full-width content below
 * - Mobile: secondary header scrolls horizontally; hamburger for full nav
 *
 * Inspired by GitHub, Jira, Azure DevOps
 */
export function DualHeaderLayout({ children }: DualHeaderLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

      // Flatten items for secondary header
      const flatItems = useMemo(() => {
            const items: NavigationItem[] = [];
            for (const item of navigation) {
                  if (item.href) items.push(item);
                  else if (item.children) {
                        for (const child of item.children) {
                              if (child.href) items.push(child);
                        }
                  }
            }
            return items;
      }, [navigation]);

      return (
            <div
                  className={cn(
                        "min-h-screen flex flex-col bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Primary Header ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "bg-card border-b border-border",
                        )}
                  >
                        <div className="flex items-center justify-between h-12 px-4 lg:px-6">
                              <div className="flex items-center gap-3">
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="lg:hidden h-8 w-8"
                                          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    >
                                          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                                    </Button>
                                    <Logo size="sm" />
                                    <span className="text-sm font-bold text-foreground hidden md:block">
                                          {t("app.title")}
                                    </span>
                              </div>
                              <div className="flex items-center gap-2">
                                    <LanguageSwitcher />
                                    <ThemeSwitcher />
                                    <UserProfileDropdown showName />
                              </div>
                        </div>

                        {/* ── Secondary Header (module tabs) ── */}
                        <div className="flex items-center gap-1 px-4 lg:px-6 border-t border-border/30 bg-muted/20 overflow-x-auto scrollbar-none">
                              {flatItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = isNavigationItemActive(item, pathname);
                                    return (
                                          <button
                                                key={item.name}
                                                onClick={() => item.href && router.push(item.href)}
                                                className={cn(
                                                      "flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors shrink-0",
                                                      isActive
                                                            ? "border-primary text-primary"
                                                            : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30",
                                                )}
                                          >
                                                {Icon && <Icon className="w-3.5 h-3.5" />}
                                                {t(item.name) || item.name}
                                          </button>
                                    );
                              })}
                        </div>
                  </header>

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
                  <main className="flex-1 p-6">
                        <div style={{ borderRadius: "var(--border-radius)" }}>
                              {children}
                        </div>
                  </main>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
