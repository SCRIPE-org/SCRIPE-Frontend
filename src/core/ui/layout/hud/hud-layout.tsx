"use client";

import type React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
      ChevronRight,
      Home,
      Command as CommandIcon,
      ChevronUp,
} from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { LanguageSwitcher, ThemeSwitcher } from "../common";
import { CommandPalette } from "../shared/command-palette";
import { Footer } from "../shared/footer";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
      isNavigationItemActive,
      getFlatNavigationItems,
      type NavigationItem,
} from "@core/config/navigation";

interface HUDLayoutProps {
      children: React.ReactNode;
}

/**
 * HUD (Heads-Up Display) Layout — Inspired by macOS Dock / Figma / Warp Terminal.
 *
 * Structure:
 * ┌──────────────────────────────────────────┐
 * │ STATUS BAR (36px) — breadcrumbs + user   │
 * ├──────────────────────────────────────────┤
 * │                                          │
 * │          FULL-WIDTH CONTENT              │
 * │                                          │
 * ├──────────────────────────────────────────┤
 * │ DOCK (64px) — centered icons, glass      │
 * └──────────────────────────────────────────┘
 *
 * Flyout menus appear upward from dock icons for items with children.
 */
export function HUDLayout({ children }: HUDLayoutProps) {
      const pathname = usePathname();
      const router = useRouter();
      const { t, direction } = useI18n();
      const { showFooter } = useSettings();
      const navigation = useDynamicNavigation();
      const [paletteOpen, setPaletteOpen] = useState(false);
      const [activeFlyout, setActiveFlyout] = useState<string | null>(null);
      const dockRef = useRef<HTMLDivElement>(null);

      // Top-level items for the dock
      const dockItems = useMemo(
            () => navigation.filter((item) => !item.disabled),
            [navigation]
      );

      // Breadcrumbs
      const breadcrumbs = useMemo(() => {
            const flat = getFlatNavigationItems(navigation);
            const segments = pathname.split("/").filter(Boolean);
            const crumbs: { label: string; href: string }[] = [];
            let currentPath = "";
            for (const seg of segments) {
                  currentPath += `/${seg}`;
                  const match = flat.find((item) => item.href === currentPath);
                  crumbs.push({
                        label: match?.name || seg.charAt(0).toUpperCase() + seg.slice(1),
                        href: currentPath,
                  });
            }
            return crumbs;
      }, [pathname, navigation]);

      // Close flyout on outside click
      useEffect(() => {
            if (!activeFlyout) return;
            const handler = (e: MouseEvent) => {
                  if (dockRef.current && !dockRef.current.contains(e.target as Node)) {
                        setActiveFlyout(null);
                  }
            };
            document.addEventListener("mousedown", handler);
            return () => document.removeEventListener("mousedown", handler);
      }, [activeFlyout]);

      const handleDockClick = (item: NavigationItem) => {
            if (item.children && item.children.length > 0) {
                  setActiveFlyout(activeFlyout === item.name ? null : item.name);
            } else if (item.href) {
                  router.push(item.href);
                  setActiveFlyout(null);
            }
      };

      const renderFlyoutItem = (item: NavigationItem, level: number = 0) => {
            const isActive = isNavigationItemActive(item, pathname);
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;

            return (
                  <div key={item.name}>
                        <button
                              onClick={() => {
                                    if (item.href) {
                                          router.push(item.href);
                                          setActiveFlyout(null);
                                    }
                              }}
                              className={cn(
                                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors",
                                    isActive
                                          ? "bg-primary/15 text-primary font-medium"
                                          : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                                    item.disabled && "opacity-50 pointer-events-none"
                              )}
                              style={{ paddingInlineStart: `${12 + level * 12}px` }}
                        >
                              {Icon && <Icon className="w-4 h-4 shrink-0" />}
                              <span className="truncate">{item.name}</span>
                              {item.badge && (
                                    <span className="px-1.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary ms-auto">
                                          {item.badge}
                                    </span>
                              )}
                        </button>
                        {hasChildren &&
                              item.children!.map((child) => renderFlyoutItem(child, level + 1))}
                  </div>
            );
      };

      return (
            <div
                  className={cn(
                        "min-h-screen bg-background pb-20",
                        direction === "rtl" ? "rtl" : "ltr"
                  )}
            >
                  {/* ── STATUS BAR ── */}
                  <header className="fixed top-0 inset-x-0 z-40 h-9 bg-card/80 backdrop-blur-md border-b border-border/50 flex items-center px-4 lg:px-6">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-5 h-5 bg-primary rounded flex items-center justify-center shrink-0">
                                    <Logo size="xs" className="text-primary-foreground" />
                              </div>
                              <nav className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                                    <a href="/" className="hover:text-foreground transition-colors shrink-0">
                                          <Home className="w-3 h-3" />
                                    </a>
                                    {breadcrumbs.map((crumb, i) => (
                                          <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                                                <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground/50" />
                                                {i === breadcrumbs.length - 1 ? (
                                                      <span className="text-foreground font-medium truncate">{crumb.label}</span>
                                                ) : (
                                                      <a href={crumb.href} className="hover:text-foreground transition-colors truncate">
                                                            {crumb.label}
                                                      </a>
                                                )}
                                          </span>
                                    ))}
                              </nav>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                    onClick={() => setPaletteOpen(true)}
                                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-muted-foreground hover:text-foreground hover:bg-muted/80 border border-border/50 transition-colors"
                              >
                                    <CommandIcon className="w-3 h-3" />
                                    <kbd className="px-1 py-0.5 bg-muted rounded text-[10px] font-mono">⌘K</kbd>
                              </button>
                              <ThemeSwitcher buttonClassName="h-7 w-7 hover:bg-accent" contentClassName="bg-popover border-border" />
                              <LanguageSwitcher buttonClassName="h-7 w-7 hover:bg-accent" contentClassName="bg-popover border-border" />
                              <UserProfileDropdown variant="navigation" showName={false} className="h-7" />
                        </div>
                  </header>

                  {/* ── COMMAND PALETTE ── */}
                  <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

                  {/* ── MAIN CONTENT ── */}
                  <main className="pt-9">
                        <div className="p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto">
                              {children}
                        </div>
                  </main>

                  {/* ── DOCK ── */}
                  <div
                        ref={dockRef}
                        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40"
                  >
                        {/* Flyout menus */}
                        {dockItems.map((item) => {
                              if (activeFlyout !== item.name || !item.children?.length) return null;
                              return (
                                    <div
                                          key={`flyout-${item.name}`}
                                          className={cn(
                                                "absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-64",
                                                "bg-popover border border-border rounded-xl shadow-2xl p-2",
                                                "animate-in slide-in-from-bottom-2 fade-in duration-200",
                                                "max-h-[60vh] overflow-y-auto"
                                          )}
                                    >
                                          <div className="text-xs font-medium text-muted-foreground px-3 py-1.5 uppercase tracking-wider">
                                                {item.name}
                                          </div>
                                          {item.children!.map((child) => renderFlyoutItem(child))}
                                    </div>
                              );
                        })}

                        {/* Dock bar */}
                        <div
                              className={cn(
                                    "flex items-center gap-1 px-3 py-2 rounded-2xl",
                                    "bg-card/90 backdrop-blur-xl border border-border/50 shadow-2xl",
                                    "ring-1 ring-white/10"
                              )}
                        >
                              {dockItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive =
                                          isNavigationItemActive(item, pathname) ||
                                          item.children?.some((c) => isNavigationItemActive(c, pathname));
                                    const hasFlyout = activeFlyout === item.name;

                                    return (
                                          <button
                                                key={item.name}
                                                onClick={() => handleDockClick(item)}
                                                className={cn(
                                                      "relative flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200",
                                                      "hover:scale-110 hover:bg-muted/80",
                                                      isActive && "bg-primary/15 scale-105",
                                                      hasFlyout && "bg-muted"
                                                )}
                                                title={item.name}
                                          >
                                                {Icon && (
                                                      <Icon
                                                            className={cn(
                                                                  "w-5 h-5",
                                                                  isActive ? "text-primary" : "text-foreground/70"
                                                            )}
                                                      />
                                                )}
                                                {/* Active dot */}
                                                {isActive && (
                                                      <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                                                )}
                                                {/* Badge */}
                                                {item.badge && (
                                                      <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center px-1 text-[10px] font-bold rounded-full bg-primary text-primary-foreground">
                                                            {item.badge}
                                                      </span>
                                                )}
                                                {/* Flyout indicator */}
                                                {item.children && item.children.length > 0 && (
                                                      <ChevronUp
                                                            className={cn(
                                                                  "absolute -top-0.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 text-muted-foreground/40 transition-transform",
                                                                  hasFlyout && "rotate-180 text-primary"
                                                            )}
                                                      />
                                                )}
                                          </button>
                                    );
                              })}
                        </div>
                  </div>

                  {showFooter && <Footer />}
            </div>
      );
}
