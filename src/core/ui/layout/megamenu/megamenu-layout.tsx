"use client";

import type React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
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

interface MegaMenuLayoutProps {
      children: React.ReactNode;
}

/**
 * Mega Menu Layout — Enterprise-grade horizontal navigation.
 *
 * Structure:
 * - Horizontal top nav with module/group items
 * - Hover/click on item → mega dropdown panel with multi-column links
 * - Full-width content below
 * - Mobile: hamburger → accordion-style expandable sections
 *
 * Inspired by Salesforce, SAP Fiori, enterprise portals
 */
export function MegaMenuLayout({ children }: MegaMenuLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const [openMenu, setOpenMenu] = useState<string | null>(null);
      const [mobileOpen, setMobileOpen] = useState(false);
      const menuRef = useRef<HTMLDivElement>(null);

      // Close mega panel when clicking outside
      useEffect(() => {
            const handler = (e: MouseEvent) => {
                  if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                        setOpenMenu(null);
                  }
            };
            document.addEventListener("mousedown", handler);
            return () => document.removeEventListener("mousedown", handler);
      }, []);

      // Close on route change
      useEffect(() => {
            setOpenMenu(null);
            setMobileOpen(false);
      }, [pathname]);

      // Separate top-level items: groups (with children) and direct links
      const topItems = useMemo(() => navigation, [navigation]);

      return (
            <div
                  className={cn(
                        "min-h-screen flex flex-col bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Top Header Bar ── */}
                  <header
                        ref={menuRef}
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-40" : "relative",
                              "bg-card border-b border-border",
                        )}
                  >
                        {/* Primary bar: logo + nav + actions */}
                        <div className="flex items-center justify-between h-14 px-4 lg:px-6">
                              <div className="flex items-center gap-4">
                                    <Logo size="sm" />
                                    <span className="text-sm font-bold text-foreground hidden md:block">
                                          {t("app.title")}
                                    </span>
                              </div>

                              {/* Desktop nav items */}
                              <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
                                    {topItems.map((item) => {
                                          const hasChildren = item.children && item.children.length > 0;
                                          const isActive = isNavigationItemActive(item, pathname);
                                          const isOpen = openMenu === item.name;
                                          const Icon = item.icon;

                                          if (!hasChildren && item.href) {
                                                return (
                                                      <button
                                                            key={item.name}
                                                            onClick={() => router.push(item.href!)}
                                                            className={cn(
                                                                  "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                                  isActive
                                                                        ? "bg-primary/10 text-primary"
                                                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                                            )}
                                                      >
                                                            {Icon && <Icon className="w-4 h-4" />}
                                                            {t(item.name) || item.name}
                                                      </button>
                                                );
                                          }

                                          return (
                                                <button
                                                      key={item.name}
                                                      onClick={() => setOpenMenu(isOpen ? null : item.name)}
                                                      onMouseEnter={() => {
                                                            if (openMenu) setOpenMenu(item.name);
                                                      }}
                                                      className={cn(
                                                            "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                                            isActive || isOpen
                                                                  ? "bg-primary/10 text-primary"
                                                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                                      )}
                                                >
                                                      {Icon && <Icon className="w-4 h-4" />}
                                                      {t(item.name) || item.name}
                                                      <ChevronDown
                                                            className={cn(
                                                                  "w-3 h-3 transition-transform",
                                                                  isOpen && "rotate-180",
                                                            )}
                                                      />
                                                </button>
                                          );
                                    })}
                              </nav>

                              <div className="flex items-center gap-2">
                                    <LanguageSwitcher />
                                    <ThemeSwitcher />
                                    <UserProfileDropdown showName={false} />
                                    {/* Mobile hamburger */}
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="lg:hidden"
                                          onClick={() => setMobileOpen(!mobileOpen)}
                                    >
                                          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                                    </Button>
                              </div>
                        </div>

                        {/* ── Mega Dropdown Panel (desktop) ── */}
                        {openMenu && (
                              <div className="absolute inset-x-0 top-full z-50 bg-card border-b border-border shadow-xl">
                                    <div className="max-w-5xl mx-auto p-6">
                                          {topItems
                                                .filter((item) => item.name === openMenu && item.children)
                                                .map((item) => (
                                                      <div
                                                            key={item.name}
                                                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                                                      >
                                                            {item.children!.map((child) => {
                                                                  const ChildIcon = child.icon;
                                                                  const childIsActive = isNavigationItemActive(child, pathname);
                                                                  return (
                                                                        <button
                                                                              key={child.name}
                                                                              onClick={() => {
                                                                                    if (child.href) router.push(child.href);
                                                                                    setOpenMenu(null);
                                                                              }}
                                                                              className={cn(
                                                                                    "flex items-center gap-3 p-3 rounded-xl transition-colors text-start",
                                                                                    childIsActive
                                                                                          ? "bg-primary/10 text-primary"
                                                                                          : "hover:bg-muted/50 text-foreground",
                                                                              )}
                                                                        >
                                                                              {ChildIcon && (
                                                                                    <div
                                                                                          className={cn(
                                                                                                "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                                                                                                childIsActive
                                                                                                      ? "bg-primary/20"
                                                                                                      : "bg-muted",
                                                                                          )}
                                                                                    >
                                                                                          <ChildIcon className="w-4 h-4" />
                                                                                    </div>
                                                                              )}
                                                                              <div className="min-w-0">
                                                                                    <div className="text-sm font-medium truncate">
                                                                                          {t(child.name) || child.name}
                                                                                    </div>
                                                                              </div>
                                                                        </button>
                                                                  );
                                                            })}
                                                      </div>
                                                ))}
                                    </div>
                              </div>
                        )}
                  </header>

                  {/* ── Mobile Drawer ── */}
                  {mobileOpen && (
                        <>
                              <div
                                    className="fixed inset-0 z-30 bg-black/30 lg:hidden"
                                    onClick={() => setMobileOpen(false)}
                              />
                              <aside
                                    dir={direction}
                                    className={cn(
                                          "fixed top-14 bottom-0 w-80 z-40 bg-card border-e border-border overflow-y-auto flex flex-col lg:hidden",
                                          direction === "rtl" ? "right-0" : "left-0",
                                    )}
                              >
                                    <div className="p-3 border-b border-border">
                                          <UserCard size="sm" />
                                    </div>
                                    <div className="flex-1 p-3 overflow-y-auto">
                                          <NavRenderer variant="default" onNavigate={() => setMobileOpen(false)} />
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
