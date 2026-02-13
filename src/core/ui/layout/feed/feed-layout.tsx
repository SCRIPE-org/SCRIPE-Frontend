"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, TrendingUp, Bookmark } from "lucide-react";
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

interface FeedLayoutProps {
      children: React.ReactNode;
}

/**
 * Social Feed Layout — Three-column social media style.
 *
 * Structure:
 * - Left: navigation sidebar
 * - Center: content feed (children)
 * - Right: trending/widget sidebar
 * - Mobile: hamburger nav, right sidebar hidden
 *
 * Inspired by Twitter/X, LinkedIn, Facebook
 */
export function FeedLayout({ children }: FeedLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

      // Flatten for left sidebar
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
            return items;
      }, [navigation]);

      return (
            <div
                  className={cn(
                        "min-h-screen bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Top Bar ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "glass border-b border-border",
                              "flex items-center justify-between px-4 h-12",
                        )}
                  >
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
                        </div>
                        <div className="flex items-center gap-2">
                              <LanguageSwitcher />
                              <ThemeSwitcher />
                              <UserProfileDropdown showName={false} />
                        </div>
                  </header>

                  <div className="flex max-w-7xl mx-auto">
                        {/* ── Left: Navigation ── */}
                        <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-12 h-[calc(100vh-3rem)]">
                              <ScrollArea className="flex-1 py-3">
                                    {navItems.map((item) => {
                                          const Icon = item.icon;
                                          const isActive = isNavigationItemActive(item, pathname);
                                          return (
                                                <button
                                                      key={item.name}
                                                      onClick={() => item.href && router.push(item.href)}
                                                      className={cn(
                                                            "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-start rounded-full",
                                                            isActive
                                                                  ? "font-bold text-foreground"
                                                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                                      )}
                                                >
                                                      {Icon && <Icon className={cn("w-5 h-5", isActive && "text-primary")} />}
                                                      <span>{t(item.name) || item.name}</span>
                                                </button>
                                          );
                                    })}
                              </ScrollArea>
                              <div className="p-3">
                                    <UserCard size="sm" />
                              </div>
                        </aside>

                        {/* ── Center: Content Feed ── */}
                        <main className="flex-1 min-w-0 border-x border-border min-h-screen">
                              <div className="p-4">
                                    {children}
                              </div>
                        </main>

                        {/* ── Right: Trending / Widgets ── */}
                        <aside className="hidden xl:flex flex-col w-72 shrink-0 sticky top-12 h-[calc(100vh-3rem)] p-4">
                              <div className="bg-card rounded-2xl border border-border p-4 mb-4">
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                          <TrendingUp className="w-4 h-4 text-primary" />
                                          {t("common.trending") || "Trending"}
                                    </h3>
                                    <div className="space-y-3">
                                          {[1, 2, 3].map((i) => (
                                                <div key={i} className="flex items-start gap-2">
                                                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                                                      <div>
                                                            <p className="text-xs font-medium text-foreground">
                                                                  {t("common.trendingItem") || "Trending Item"} #{i}
                                                            </p>
                                                            <p className="text-[10px] text-muted-foreground">
                                                                  {t("common.posts") || "Posts"}: {Math.floor(Math.random() * 1000)}
                                                            </p>
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              </div>
                              <div className="bg-card rounded-2xl border border-border p-4">
                                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
                                          <Bookmark className="w-4 h-4 text-primary" />
                                          {t("common.quickLinks") || "Quick Links"}
                                    </h3>
                                    <div className="space-y-1">
                                          {navItems.slice(0, 4).map((item) => {
                                                const Icon = item.icon;
                                                return (
                                                      <button
                                                            key={item.name}
                                                            onClick={() => item.href && router.push(item.href)}
                                                            className="w-full flex items-center gap-2 px-2 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-muted/50 transition-colors text-start"
                                                      >
                                                            {Icon && <Icon className="w-3.5 h-3.5" />}
                                                            {t(item.name) || item.name}
                                                      </button>
                                                );
                                          })}
                                    </div>
                              </div>
                        </aside>
                  </div>

                  {/* ── Mobile Drawer ── */}
                  {mobileMenuOpen && (
                        <>
                              <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                              <aside
                                    dir={direction}
                                    className={cn(
                                          "fixed top-0 bottom-0 w-72 z-40 bg-card border-e border-border flex flex-col lg:hidden",
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

                  {settings.showFooter && <Footer />}
            </div>
      );
}
