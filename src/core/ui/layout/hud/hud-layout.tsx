"use client";

import type React from "react";
import { useState, useMemo, useRef, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronRight, Home, Command as CommandIcon, ChevronUp } from "lucide-react";
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
import { NotificationBell } from "@core/ui/notification";

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
  const dockItems = useMemo(() => navigation.filter((item) => !item.disabled), [navigation]);

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
            "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors",
            isActive
              ? "bg-primary/15 font-medium text-primary"
              : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
            item.disabled && "pointer-events-none opacity-50"
          )}
          style={{ paddingInlineStart: `${12 + level * 12}px` }}
        >
          {Icon && <Icon className="h-4 w-4 shrink-0" />}
          <span className="truncate">{item.name}</span>
          {item.badge && (
            <span className="ms-auto rounded-full bg-primary/10 px-1.5 py-0.5 text-xs text-primary">
              {item.badge}
            </span>
          )}
        </button>
        {hasChildren && item.children!.map((child) => renderFlyoutItem(child, level + 1))}
      </div>
    );
  };

  return (
    <div className={cn("min-h-screen bg-background pb-20", direction === "rtl" ? "rtl" : "ltr")}>
      {/* ── STATUS BAR ── */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-9 items-center border-b border-border/50 bg-card/80 px-4 backdrop-blur-md lg:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="mx-6 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary">
            <Logo size="xs" className="text-primary-foreground" />
          </div>
          <nav className="flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
            <a href="/" className="shrink-0 transition-colors hover:text-foreground">
              <Home className="h-3 w-3" />
            </a>
            {breadcrumbs.map((crumb, i) => (
              <span key={crumb.href} className="flex min-w-0 items-center gap-1">
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                {i === breadcrumbs.length - 1 ? (
                  <span className="truncate font-medium text-foreground">{crumb.label}</span>
                ) : (
                  <a href={crumb.href} className="truncate transition-colors hover:text-foreground">
                    {crumb.label}
                  </a>
                )}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => setPaletteOpen(true)}
            className="flex items-center gap-1 rounded-md border border-border/50 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
          >
            <CommandIcon className="h-3 w-3" />
            <kbd className="rounded bg-muted px-1 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </button>
          <ThemeSwitcher
            buttonClassName="h-7 w-7 hover:bg-accent"
            contentClassName="bg-popover border-border"
          />
          <LanguageSwitcher
            buttonClassName="h-7 w-7 hover:bg-accent"
            contentClassName="bg-popover border-border"
          />
          <NotificationBell iconClassName="h-5 w-5" className="h-7 w-7" />
          <UserProfileDropdown variant="navigation" showName={false} className="h-7" />
        </div>
      </header>

      {/* ── COMMAND PALETTE ── */}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      {/* ── MAIN CONTENT ── */}
      <main className="pt-9">
        <div className="animate-fade-in mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
      </main>

      {/* ── DOCK ── */}
      <div ref={dockRef} className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2">
        {/* Flyout menus */}
        {dockItems.map((item) => {
          if (activeFlyout !== item.name || !item.children?.length) return null;
          return (
            <div
              key={`flyout-${item.name}`}
              className={cn(
                "absolute bottom-full left-1/2 mb-3 w-64 -translate-x-1/2",
                "rounded-xl border border-border bg-popover p-2 shadow-2xl",
                "duration-200 animate-in fade-in slide-in-from-bottom-2",
                "max-h-[60vh] overflow-y-auto"
              )}
            >
              <div className="px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {item.name}
              </div>
              {item.children!.map((child) => renderFlyoutItem(child))}
            </div>
          );
        })}

        {/* Dock bar */}
        <div
          className={cn(
            "flex items-center gap-1 rounded-2xl px-3 py-2",
            "border border-border/50 bg-card/90 shadow-2xl backdrop-blur-xl",
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
                  "relative flex h-12 w-12 items-center justify-center rounded-xl transition-all duration-200",
                  "hover:scale-110 hover:bg-muted/80",
                  isActive && "scale-105 bg-primary/15",
                  hasFlyout && "bg-muted"
                )}
                title={item.name}
              >
                {Icon && (
                  <Icon
                    className={cn("h-5 w-5", isActive ? "text-primary" : "text-foreground/70")}
                  />
                )}
                {/* Active dot */}
                {isActive && (
                  <span className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
                )}
                {/* Badge */}
                {item.badge && (
                  <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {item.badge}
                  </span>
                )}
                {/* Flyout indicator */}
                {item.children && item.children.length > 0 && (
                  <ChevronUp
                    className={cn(
                      "absolute -top-0.5 left-1/2 h-2.5 w-2.5 -translate-x-1/2 text-muted-foreground/40 transition-transform",
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
