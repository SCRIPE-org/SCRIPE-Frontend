"use client";

import type React from "react";
import { useMemo, useState } from "react";
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

interface BentoLayoutProps {
      children: React.ReactNode;
}

/**
 * Bento Grid Layout — Apple-style grid navigation.
 *
 * Structure:
 * - Header with logo + actions
 * - Bento-style grid of nav items (varying card sizes)
 * - Content area below
 * - Mobile: smaller grid (2 columns)
 *
 * Inspired by Apple Vision Pro, Bento UI trend, Windows tiles
 */
export function BentoLayout({ children }: BentoLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

      // Flatten and assign sizes for bento effect
      const bentoItems = useMemo(() => {
            const items: (NavigationItem & { size: "sm" | "md" | "lg" })[] = [];
            for (const item of navigation) {
                  if (item.href) {
                        // Direct items get larger size if they're first
                        items.push({
                              ...item,
                              size: items.length === 0 ? "lg" : "sm",
                        });
                  }
                  if (item.children) {
                        for (const child of item.children) {
                              if (child.href) {
                                    items.push({
                                          ...child,
                                          size: items.length % 5 === 0 ? "md" : "sm",
                                    });
                              }
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
                  {/* ── Header ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "glass border-b border-border",
                              "flex items-center justify-between px-4 lg:px-6 h-12",
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
                              <span className="text-sm font-bold text-foreground hidden sm:block">
                                    {t("app.title")}
                              </span>
                        </div>
                        <div className="flex items-center gap-2">
                              <LanguageSwitcher />
                              <ThemeSwitcher />
                              <UserProfileDropdown showName={false} />
                        </div>
                  </header>

                  {/* ── Bento Navigation Grid ── */}
                  <div className="border-b border-border/50 bg-muted/10 px-4 lg:px-6 py-5">
                        <div className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 auto-rows-[80px]">
                              {bentoItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = isNavigationItemActive(item, pathname);
                                    return (
                                          <button
                                                key={item.name}
                                                onClick={() => item.href && router.push(item.href)}
                                                className={cn(
                                                      "flex flex-col items-center justify-center gap-2 rounded-2xl border transition-all group relative overflow-hidden",
                                                      item.size === "lg" && "col-span-2 row-span-2",
                                                      item.size === "md" && "col-span-2",
                                                      isActive
                                                            ? "bg-primary/10 border-primary/30 text-primary shadow-md"
                                                            : "bg-card border-border hover:border-primary/20 hover:shadow-md hover:scale-[1.02] text-foreground",
                                                )}
                                          >
                                                {/* Gradient overlay for active */}
                                                {isActive && (
                                                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                                                )}
                                                {Icon && (
                                                      <Icon
                                                            className={cn(
                                                                  "relative z-10 transition-transform group-hover:scale-110",
                                                                  item.size === "lg" ? "w-8 h-8" : item.size === "md" ? "w-6 h-6" : "w-5 h-5",
                                                            )}
                                                      />
                                                )}
                                                <span
                                                      className={cn(
                                                            "relative z-10 font-medium text-center leading-tight px-1",
                                                            item.size === "lg" ? "text-sm" : "text-xs",
                                                      )}
                                                >
                                                      {t(item.name) || item.name}
                                                </span>
                                                {item.badge && (
                                                      <span className="absolute top-2 end-2 bg-destructive text-destructive-foreground text-[9px] rounded-full px-1.5 py-0.5 font-bold z-10">
                                                            {item.badge}
                                                      </span>
                                                )}
                                          </button>
                                    );
                              })}
                        </div>
                  </div>

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
                        <div className="max-w-5xl mx-auto" style={{ borderRadius: "var(--border-radius)" }}>
                              {children}
                        </div>
                  </main>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
