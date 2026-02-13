"use client";

import type React from "react";
import { useState, useEffect, useRef, useMemo } from "react";
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

interface CollapseHeaderLayoutProps {
      children: React.ReactNode;
}

/**
 * Collapse Header Layout — Auto-hiding header on scroll.
 *
 * Structure:
 * - Horizontal top nav with links
 * - Header hides when scrolling down, reappears when scrolling up
 * - Full-width content
 * - Mobile: hamburger menu
 *
 * Inspired by YouTube, Twitter/X, Medium
 */
export function CollapseHeaderLayout({ children }: CollapseHeaderLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const [headerVisible, setHeaderVisible] = useState(true);
      const lastScrollY = useRef(0);

      // Flatten for header nav
      const navItems = useMemo(() => {
            const items: NavigationItem[] = [];
            for (const item of navigation) {
                  if (item.href) items.push(item);
                  else if (item.children) {
                        for (const child of item.children) {
                              if (child.href) items.push(child);
                        }
                  }
            }
            return items.slice(0, 8); // Max 8 in top bar
      }, [navigation]);

      useEffect(() => {
            const handleScroll = () => {
                  const currentScrollY = window.scrollY;
                  if (currentScrollY < 60) {
                        setHeaderVisible(true);
                  } else if (currentScrollY > lastScrollY.current + 5) {
                        setHeaderVisible(false); // scrolling down
                  } else if (currentScrollY < lastScrollY.current - 5) {
                        setHeaderVisible(true); // scrolling up
                  }
                  lastScrollY.current = currentScrollY;
            };
            window.addEventListener("scroll", handleScroll, { passive: true });
            return () => window.removeEventListener("scroll", handleScroll);
      }, []);

      return (
            <div
                  className={cn(
                        "min-h-screen flex flex-col bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Auto-hiding Header ── */}
                  <header
                        className={cn(
                              "fixed top-0 inset-x-0 z-30",
                              "bg-card/95 backdrop-blur-xl border-b border-border",
                              "flex items-center justify-between px-4 lg:px-6 h-14",
                              "transition-transform duration-300",
                              headerVisible ? "translate-y-0" : "-translate-y-full",
                        )}
                  >
                        <div className="flex items-center gap-4">
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

                        {/* Desktop nav links */}
                        <nav className="hidden lg:flex items-center gap-1">
                              {navItems.map((item) => {
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
                        </nav>

                        <div className="flex items-center gap-2">
                              <LanguageSwitcher />
                              <ThemeSwitcher />
                              <UserProfileDropdown showName={false} />
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
                  <main className="flex-1 pt-14 p-6">
                        <div style={{ borderRadius: "var(--border-radius)" }}>
                              {children}
                        </div>
                  </main>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
