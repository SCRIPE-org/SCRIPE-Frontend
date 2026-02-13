"use client";

import type React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
      isNavigationItemActive,
      getFlatNavigationItems,
      type NavigationItem,
} from "@core/config/navigation";
import { Bell, Home, ChevronRight, Search, Grid3X3, X } from "lucide-react";
import { cn } from "@core/common/utils";

interface VaultLayoutProps {
      children: React.ReactNode;
}

/**
 * Vault Layout — Cloud Console–style mega menu.
 *
 * Structure:
 * - Header with "Services" trigger that opens full-screen mega menu
 * - Mega menu shows ALL modules in categorized grid
 * - When closed, no sidebar — full content area
 * - Breadcrumb trail for wayfinding
 * - Search within mega menu
 *
 * Inspired by AWS Console, Azure Portal, Google Cloud Console
 */
export function VaultLayout({ children }: VaultLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const flatItems = useMemo(() => getFlatNavigationItems(navigation), [navigation]);
      const isRTL = direction === "rtl";

      const [megaMenuOpen, setMegaMenuOpen] = useState(false);
      const [menuSearch, setMenuSearch] = useState("");
      const searchInputRef = useRef<HTMLInputElement>(null);

      // Focus search when mega menu opens
      useEffect(() => {
            if (megaMenuOpen) {
                  setTimeout(() => searchInputRef.current?.focus(), 100);
            } else {
                  setMenuSearch("");
            }
      }, [megaMenuOpen]);

      // Close on Escape
      useEffect(() => {
            const handler = (e: KeyboardEvent) => {
                  if (e.key === "Escape") setMegaMenuOpen(false);
            };
            window.addEventListener("keydown", handler);
            return () => window.removeEventListener("keydown", handler);
      }, []);

      // Group navigation into categories
      const categories = useMemo(() => {
            return navigation.map((group) => ({
                  name: t(group.name) || group.name,
                  icon: group.icon,
                  items: group.children
                        ? group.children
                              .filter((child) => child.href)
                              .map((child) => ({
                                    name: t(child.name) || child.name,
                                    href: child.href!,
                                    icon: child.icon,
                                    active: isNavigationItemActive(child, pathname),
                              }))
                        : group.href
                              ? [{
                                    name: t(group.name) || group.name,
                                    href: group.href,
                                    icon: group.icon,
                                    active: isNavigationItemActive(group, pathname),
                              }]
                              : [],
            })).filter((cat) => cat.items.length > 0);
      }, [navigation, pathname, t]);

      // Filter categories by search
      const filteredCategories = useMemo(() => {
            if (!menuSearch) return categories;
            const q = menuSearch.toLowerCase();
            return categories
                  .map((cat) => ({
                        ...cat,
                        items: cat.items.filter((item) => item.name.toLowerCase().includes(q)),
                  }))
                  .filter((cat) => cat.items.length > 0);
      }, [categories, menuSearch]);

      // Breadcrumbs
      const breadcrumbs = useMemo(() => {
            const segs: { label: string; href?: string }[] = [
                  { label: t("nav.home") || "Home", href: "/" },
            ];
            for (const group of navigation) {
                  if (group.href && isNavigationItemActive(group, pathname)) {
                        segs.push({ label: t(group.name) || group.name });
                        break;
                  }
                  if (group.children) {
                        const active = group.children.find((c) => c.href && isNavigationItemActive(c, pathname));
                        if (active) {
                              segs.push({ label: t(group.name) || group.name });
                              segs.push({ label: t(active.name) || active.name });
                              break;
                        }
                  }
            }
            return segs;
      }, [navigation, pathname, t]);

      return (
            <div
                  className={cn("min-h-screen flex flex-col bg-background", styles.getAnimationClass())}
                  dir={direction}
            >
                  {/* ── Header ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "bg-card border-b border-border",
                        )}
                  >
                        <div className="flex items-center justify-between px-4 md:px-6 h-14">
                              <div className="flex items-center gap-3">
                                    {/* Services trigger */}
                                    <Button
                                          variant={megaMenuOpen ? "secondary" : "ghost"}
                                          size="sm"
                                          onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                                          className="gap-2 font-semibold"
                                    >
                                          <Grid3X3 className="w-4 h-4" />
                                          <span className="hidden sm:inline">{t("common.services") || "Services"}</span>
                                          {megaMenuOpen ? <X className="w-3.5 h-3.5" /> : null}
                                    </Button>
                                    <div className="h-6 w-px bg-border hidden sm:block" />
                                    <Logo size="sm" />
                              </div>
                              <div className="flex items-center gap-2">
                                    <HeaderSearch
                                          containerClassName="hidden md:block"
                                          inputClassName="bg-muted/50 border-0 focus:bg-background w-64 rounded-lg"
                                          iconClassName={isRTL ? "right-3 left-auto" : "left-3"}
                                    />
                                    <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
                                          <Home className="w-4 h-4" />
                                    </Button>
                                    <LanguageSwitcher />
                                    <ThemeSwitcher />
                                    {settings.showNotifications && (
                                          <Button variant="ghost" size="icon">
                                                <Bell className="w-4 h-4" />
                                          </Button>
                                    )}
                                    <UserProfileDropdown showName={false} />
                              </div>
                        </div>

                        {/* Breadcrumbs */}
                        {settings.showBreadcrumbs !== false && (
                              <div className="px-4 md:px-6 pb-2 flex items-center gap-1 text-xs text-muted-foreground">
                                    {breadcrumbs.map((crumb, i) => (
                                          <span key={i} className="flex items-center gap-1">
                                                {i > 0 && <ChevronRight className="w-3 h-3" />}
                                                {crumb.href ? (
                                                      <button onClick={() => router.push(crumb.href!)} className="hover:text-foreground transition-colors">
                                                            {crumb.label}
                                                      </button>
                                                ) : (
                                                      <span className="text-foreground font-medium">{crumb.label}</span>
                                                )}
                                          </span>
                                    ))}
                              </div>
                        )}
                  </header>

                  {/* ── Mega Menu Overlay ── */}
                  {megaMenuOpen && (
                        <>
                              <div
                                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                                    onClick={() => setMegaMenuOpen(false)}
                              />
                              <div className={cn(
                                    "fixed z-50",
                                    "top-14 inset-x-0",
                                    "bg-card border-b border-border",
                                    "shadow-2xl",
                                    "max-h-[70vh] overflow-y-auto",
                                    "animate-in slide-in-from-top-2 duration-200",
                              )}>
                                    <div className="max-w-6xl mx-auto p-6">
                                          {/* Search in mega menu */}
                                          <div className="flex items-center gap-3 w-full max-w-md mb-6 px-4 py-2.5 rounded-xl bg-muted/50 border border-border">
                                                <Search className="w-4 h-4 text-muted-foreground shrink-0" />
                                                <input
                                                      ref={searchInputRef}
                                                      type="text"
                                                      value={menuSearch}
                                                      onChange={(e) => setMenuSearch(e.target.value)}
                                                      placeholder={t("common.searchServices") || "Search services..."}
                                                      className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground"
                                                />
                                          </div>

                                          {/* Categorized service grid */}
                                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {filteredCategories.map((category) => {
                                                      const CatIcon = category.icon;
                                                      return (
                                                            <div key={category.name}>
                                                                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                                                                        {CatIcon && <CatIcon className="w-3.5 h-3.5" />}
                                                                        {category.name}
                                                                  </h3>
                                                                  <div className="space-y-0.5">
                                                                        {category.items.map((item) => {
                                                                              const ItemIcon = item.icon;
                                                                              return (
                                                                                    <button
                                                                                          key={item.href}
                                                                                          onClick={() => {
                                                                                                router.push(item.href);
                                                                                                setMegaMenuOpen(false);
                                                                                          }}
                                                                                          className={cn(
                                                                                                "flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition-colors",
                                                                                                item.active
                                                                                                      ? "bg-primary/10 text-primary font-medium"
                                                                                                      : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                                                                                          )}
                                                                                    >
                                                                                          {ItemIcon && (
                                                                                                <div className={cn(
                                                                                                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                                                                                                      item.active ? "bg-primary/15" : "bg-muted/60",
                                                                                                )}>
                                                                                                      <ItemIcon className="w-4 h-4" />
                                                                                                </div>
                                                                                          )}
                                                                                          <span>{item.name}</span>
                                                                                          {item.active && (
                                                                                                <div className="ms-auto w-2 h-2 rounded-full bg-primary" />
                                                                                          )}
                                                                                    </button>
                                                                              );
                                                                        })}
                                                                  </div>
                                                            </div>
                                                      );
                                                })}
                                          </div>

                                          {filteredCategories.length === 0 && (
                                                <div className="text-center py-8 text-muted-foreground">
                                                      {t("common.noResults") || "No services found"}
                                                </div>
                                          )}
                                    </div>
                              </div>
                        </>
                  )}

                  {/* ── Content ── */}
                  <main className="flex-1">
                        <div className={cn(styles.getSpacingClass())}>
                              <div style={{ borderRadius: "var(--border-radius)", padding: "var(--spacing-unit)" }}>
                                    {children}
                              </div>
                        </div>
                  </main>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
