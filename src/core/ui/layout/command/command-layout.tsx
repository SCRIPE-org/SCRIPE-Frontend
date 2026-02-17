"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname } from "next/navigation";
import { Command as CommandIcon, ChevronRight, Home } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { LanguageSwitcher, ThemeSwitcher } from "../common";
import { CommandPalette } from "../shared/command-palette";
import { Footer } from "../shared/footer";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { getFlatNavigationItems, type NavigationItem } from "@core/config/navigation";
import { NotificationBell } from "@core/ui/notification";

interface CommandLayoutProps {
  children: React.ReactNode;
}

/**
 * Command Layout â€” Inspired by Superhuman / Arc Browser / Raycast.
 *
 * Zero-chrome UI. No sidebar. Content is king.
 * Navigation happens entirely via âŒ˜K command palette.
 *
 * Structure:
 * â”Œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”
 * â”‚ CONTEXT BAR (36px) â€” breadcrumbs + âŒ˜K   â”‚
 * â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
 * â”‚                                          â”‚
 * â”‚          FULL-WIDTH CONTENT              â”‚
 * â”‚          (maximum breathing room)        â”‚
 * â”‚                                          â”‚
 * â”œâ”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”¤
 * â”‚ FOOTER (if enabled)                      â”‚
 * â””â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”˜
 */
export function CommandLayout({ children }: CommandLayoutProps) {
  const pathname = usePathname();
  const { t, direction } = useI18n();
  const { showFooter } = useSettings();
  const navigation = useDynamicNavigation();
  const [paletteOpen, setPaletteOpen] = useState(false);

  // Build breadcrumbs from pathname + navigation tree
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

  return (
    <div className={cn("min-h-screen bg-background", direction === "rtl" ? "rtl" : "ltr")}>
      {/* â”€â”€ CONTEXT BAR â”€â”€ */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-9 items-center border-b border-border/50 bg-card/80 px-4 backdrop-blur-md lg:px-6">
        {/* Left: Logo + Breadcrumbs */}
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div className="mx-6 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary">
            <Logo size="xs" className="text-primary-foreground" />
          </div>

          {/* Breadcrumbs */}
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

        {/* Right: âŒ˜K + Actions */}
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            onClick={() => setPaletteOpen(true)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-2 py-1 text-xs",
              "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
              "border border-border/50 transition-colors"
            )}
          >
            <CommandIcon className="h-3 w-3" />
            <span className="hidden sm:inline">{t("common.search") || "Search"}</span>
            <kbd className="ml-1 hidden rounded bg-muted px-1 py-0.5 font-mono text-[10px] sm:inline">
              âŒ˜K
            </kbd>
          </button>

          <ThemeSwitcher
            buttonClassName="h-7 w-7 hover:bg-accent"
            contentClassName="bg-popover border-border"
          />
          <LanguageSwitcher
            buttonClassName="h-7 w-7 hover:bg-accent"
            contentClassName="bg-popover border-border"
          />
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown variant="navigation" showName={false} className="h-7" />
        </div>
      </header>

      {/* â”€â”€ COMMAND PALETTE â”€â”€ */}
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      {/* â”€â”€ MAIN CONTENT (full width, maximum space) â”€â”€ */}
      <main className="pt-9">
        <div className="animate-fade-in mx-auto max-w-7xl p-6 lg:p-8">{children}</div>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}
