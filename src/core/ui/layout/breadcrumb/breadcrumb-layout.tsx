"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Menu, X } from "lucide-react";
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

interface BreadcrumbLayoutProps {
      children: React.ReactNode;
}

/**
 * Breadcrumb Layout — No sidebar, navigate entirely via breadcrumb trail.
 *
 * Structure:
 * - Top bar with logo, breadcrumb trail, and actions
 * - Full-width content below
 * - Mobile: breadcrumb collapses to "..." with dropdown
 *
 * Inspired by AWS Console, IBM Carbon, Cloudflare Dashboard
 */
export function BreadcrumbLayout({ children }: BreadcrumbLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
      const isRTL = direction === "rtl";
      const Separator = isRTL ? ChevronLeft : ChevronRight;

      // Build breadcrumb trail from pathname + navigation structure
      const breadcrumbs = useMemo(() => {
            const crumbs: { label: string; href: string }[] = [
                  { label: t("nav.home") || "Home", href: "/" },
            ];

            const segments = pathname.split("/").filter(Boolean);
            let currentPath = "";

            for (const segment of segments) {
                  currentPath += `/${segment}`;
                  // Find matching nav item
                  const findItem = (items: NavigationItem[]): NavigationItem | null => {
                        for (const item of items) {
                              if (item.href === currentPath) return item;
                              if (item.children) {
                                    const found = findItem(item.children);
                                    if (found) return found;
                              }
                        }
                        return null;
                  };
                  const navItem = findItem(navigation);
                  const label = navItem ? t(navItem.name) || navItem.name : segment;
                  crumbs.push({ label, href: currentPath });
            }

            return crumbs;
      }, [pathname, navigation, t]);

      return (
            <div
                  className={cn(
                        "min-h-screen flex flex-col bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Header with Breadcrumbs ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "bg-card border-b border-border",
                        )}
                  >
                        {/* Primary bar */}
                        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
                              <div className="flex items-center gap-3">
                                    {/* Mobile menu button */}
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="lg:hidden"
                                          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                    >
                                          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                    </Button>
                                    <Logo size="sm" />
                              </div>

                              <div className="flex items-center gap-2">
                                    <LanguageSwitcher />
                                    <ThemeSwitcher />
                                    <UserProfileDropdown showName={false} />
                              </div>
                        </div>

                        {/* Breadcrumb trail */}
                        <div className="flex items-center gap-1 px-4 lg:px-6 pb-3 overflow-x-auto scrollbar-none">
                              {breadcrumbs.map((crumb, i) => {
                                    const isLast = i === breadcrumbs.length - 1;
                                    return (
                                          <div key={crumb.href} className="flex items-center gap-1 shrink-0">
                                                {i > 0 && (
                                                      <Separator className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
                                                )}
                                                <button
                                                      onClick={() => {
                                                            if (!isLast) router.push(crumb.href);
                                                      }}
                                                      className={cn(
                                                            "text-sm px-2 py-1 rounded-md transition-colors",
                                                            isLast
                                                                  ? "font-semibold text-foreground bg-muted/50"
                                                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50 cursor-pointer",
                                                      )}
                                                >
                                                      {crumb.label}
                                                </button>
                                          </div>
                                    );
                              })}
                        </div>
                  </header>

                  {/* ── Mobile Navigation Drawer ── */}
                  {mobileMenuOpen && (
                        <>
                              <div
                                    className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                                    onClick={() => setMobileMenuOpen(false)}
                              />
                              <aside
                                    dir={direction}
                                    className={cn(
                                          "fixed top-0 bottom-0 w-80 z-40 bg-card border-e border-border overflow-y-auto flex flex-col lg:hidden",
                                          direction === "rtl" ? "right-0" : "left-0",
                                    )}
                              >
                                    <div className="flex items-center justify-between p-4 border-b border-border">
                                          <Logo size="sm" />
                                          <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => setMobileMenuOpen(false)}
                                          >
                                                <X className="w-4 h-4" />
                                          </Button>
                                    </div>
                                    <div className="p-3 border-b border-border">
                                          <UserCard size="sm" />
                                    </div>
                                    <div className="flex-1 p-3 overflow-y-auto">
                                          <NavRenderer
                                                variant="default"
                                                onNavigate={() => setMobileMenuOpen(false)}
                                          />
                                    </div>
                                    <div className="p-3 border-t border-border">
                                          <LogoutButton />
                                    </div>
                              </aside>
                        </>
                  )}

                  {/* ── Content ── */}
                  <main className="flex-1 p-6">
                        <div
                              style={{
                                    borderRadius: "var(--border-radius)",
                              }}
                        >
                              {children}
                        </div>
                  </main>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
