"use client";

import type React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, ChevronDown } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
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
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/* ── Top Header Bar ── */}
      <header
        ref={menuRef}
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-40" : "relative",
          "border-b border-border bg-card"
        )}
      >
        {/* Primary bar: logo + nav + actions */}
        <div className="flex h-14 items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Logo size="sm" />
            <span className="hidden text-sm font-bold text-foreground md:block">
              {t("app.title")}
            </span>
          </div>

          {/* Desktop nav items */}
          <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
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
                      "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {Icon && <Icon className="h-4 w-4" />}
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
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    isActive || isOpen
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {t(item.name) || item.name}
                  <ChevronDown
                    className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")}
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
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* ── Mega Dropdown Panel (desktop) ── */}
        {openMenu && (
          <div className="absolute inset-x-0 top-full z-50 border-b border-border bg-card shadow-xl">
            <div className="mx-auto max-w-5xl p-6">
              {topItems
                .filter((item) => item.name === openMenu && item.children)
                .map((item) => (
                  <div
                    key={item.name}
                    className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
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
                            "flex items-center gap-3 rounded-xl p-3 text-start transition-colors",
                            childIsActive
                              ? "bg-primary/10 text-primary"
                              : "text-foreground hover:bg-muted/50"
                          )}
                        >
                          {ChildIcon && (
                            <div
                              className={cn(
                                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                                childIsActive ? "bg-primary/20" : "bg-muted"
                              )}
                            >
                              <ChildIcon className="h-4 w-4" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium">
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
              "fixed bottom-0 top-14 z-40 flex w-80 flex-col overflow-y-auto border-e border-border bg-card lg:hidden",
              direction === "rtl" ? "right-0" : "left-0"
            )}
          >
            <div className="border-b border-border p-3">
              <UserCard size="sm" />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <NavRenderer variant="default" onNavigate={() => setMobileOpen(false)} />
            </div>
            <div className="border-t border-border p-3">
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
