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
import { isNavigationItemActive, getFlatNavigationItems } from "@core/config/navigation";
import { Home, ChevronRight, Search, Grid3X3, X } from "lucide-react";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";

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

  // Focus search when mega menu opens + clear on close
  // Track mega menu open/close transitions (render-time, no setState in effect)
  const [prevMegaMenuOpen, setPrevMegaMenuOpen] = useState(megaMenuOpen);
  const [justOpened, setJustOpened] = useState(false);
  if (megaMenuOpen !== prevMegaMenuOpen) {
    if (!megaMenuOpen && prevMegaMenuOpen) {
      setMenuSearch("");
    }
    setJustOpened(megaMenuOpen && !prevMegaMenuOpen);
    setPrevMegaMenuOpen(megaMenuOpen);
  } else if (justOpened) {
    setJustOpened(false);
  }

  // Focus search input when mega menu opens (DOM side effect)
  useEffect(() => {
    if (justOpened) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [justOpened]);

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
    return navigation
      .map((group) => ({
        name: t(group.name) || group.name,
        icon: group.icon,
        items: group.children
          ? group.children
              .filter((child) => child.href)
              .map((child) => ({
                name: t(child.name) || child.name,
                href: child.href!,
                icon: child.icon,
                active: isNavigationItemActive(child, pathname, navigation),
              }))
          : group.href
            ? [
                {
                  name: t(group.name) || group.name,
                  href: group.href,
                  icon: group.icon,
                  active: isNavigationItemActive(group, pathname, navigation),
                },
              ]
            : [],
      }))
      .filter((cat) => cat.items.length > 0);
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
      if (group.href && isNavigationItemActive(group, pathname, navigation)) {
        segs.push({ label: t(group.name) || group.name });
        break;
      }
      if (group.children) {
        const active = group.children.find(
          (c) => c.href && isNavigationItemActive(c, pathname, navigation)
        );
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
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/* ── Header ── */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "border-b border-border bg-card"
        )}
      >
        <div className="flex h-14 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-3">
            {/* Services trigger */}
            <Button
              variant={megaMenuOpen ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setMegaMenuOpen(!megaMenuOpen)}
              className="gap-2 font-semibold"
            >
              <Grid3X3 className="h-4 w-4" />
              <span className="hidden sm:inline">{t("common.services") || "Services"}</span>
              {megaMenuOpen ? <X className="h-3.5 w-3.5" /> : null}
            </Button>
            <div className="hidden h-6 w-px bg-border sm:block" />
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-2">
            <HeaderSearch
              containerClassName="hidden md:block"
              inputClassName="bg-muted/50 border-0 focus:bg-background w-64 rounded-lg"
              iconClassName={isRTL ? "right-3 left-auto" : "left-3"}
            />
            <Button variant="ghost" size="icon" onClick={() => router.push("/")}>
              <Home className="h-4 w-4" />
            </Button>
            <LanguageSwitcher />
            <ThemeSwitcher />
            {settings.showNotifications && <NotificationBell iconClassName="h-5 w-5" />}
            <UserProfileDropdown showName={false} />
          </div>
        </div>

        {/* Breadcrumbs */}
        {settings.showBreadcrumbs !== false && (
          <div className="flex items-center gap-1 px-4 pb-2 text-xs text-muted-foreground md:px-6">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1">
                {i > 0 && <ChevronRight className="h-3 w-3" />}
                {crumb.href ? (
                  <button
                    onClick={() => router.push(crumb.href!)}
                    className="transition-colors hover:text-foreground"
                  >
                    {crumb.label}
                  </button>
                ) : (
                  <span className="font-medium text-foreground">{crumb.label}</span>
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
          <div
            className={cn(
              "fixed z-50",
              "inset-x-0 top-14",
              "border-b border-border bg-card",
              "shadow-2xl",
              "max-h-[70vh] overflow-y-auto",
              "duration-200 animate-in slide-in-from-top-2"
            )}
          >
            <div className="mx-auto max-w-6xl p-6">
              {/* Search in mega menu */}
              <div className="mb-6 flex w-full max-w-md items-center gap-3 rounded-xl border border-border bg-muted/50 px-4 py-2.5">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  placeholder={t("common.searchServices") || "Search services..."}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
              </div>

              {/* Categorized service grid */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredCategories.map((category) => {
                  const CatIcon = category.icon;
                  return (
                    <div key={category.name}>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                        {CatIcon && <CatIcon className="h-3.5 w-3.5" />}
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
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                                item.active
                                  ? "bg-primary/10 font-medium text-primary"
                                  : "text-foreground/80 hover:bg-muted/60 hover:text-foreground"
                              )}
                            >
                              {ItemIcon && (
                                <div
                                  className={cn(
                                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg",
                                    item.active ? "bg-primary/15" : "bg-muted/60"
                                  )}
                                >
                                  <ItemIcon className="h-4 w-4" />
                                </div>
                              )}
                              <span>{item.name}</span>
                              {item.active && (
                                <div className="ms-auto h-2 w-2 rounded-full bg-primary" />
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
                <div className="py-8 text-center text-muted-foreground">
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
