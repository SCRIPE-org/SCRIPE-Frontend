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
import {
      getFlatNavigationItems,
      type NavigationItem,
} from "@core/config/navigation";

interface CommandLayoutProps {
      children: React.ReactNode;
}

/**
 * Command Layout — Inspired by Superhuman / Arc Browser / Raycast.
 *
 * Zero-chrome UI. No sidebar. Content is king.
 * Navigation happens entirely via ⌘K command palette.
 *
 * Structure:
 * ┌──────────────────────────────────────────┐
 * │ CONTEXT BAR (36px) — breadcrumbs + ⌘K   │
 * ├──────────────────────────────────────────┤
 * │                                          │
 * │          FULL-WIDTH CONTENT              │
 * │          (maximum breathing room)        │
 * │                                          │
 * ├──────────────────────────────────────────┤
 * │ FOOTER (if enabled)                      │
 * └──────────────────────────────────────────┘
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
            <div
                  className={cn(
                        "min-h-screen bg-background",
                        direction === "rtl" ? "rtl" : "ltr"
                  )}
            >
                  {/* ── CONTEXT BAR ── */}
                  <header className="fixed top-0 inset-x-0 z-40 h-9 bg-card/80 backdrop-blur-md border-b border-border/50 flex items-center px-4 lg:px-6">
                        {/* Left: Logo + Breadcrumbs */}
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                              <div className="w-5 h-5 mx-6 bg-primary rounded flex items-center justify-center shrink-0">
                                    <Logo size="xs" className="text-primary-foreground" />
                              </div>

                              {/* Breadcrumbs */}
                              <nav className="flex items-center gap-1 text-xs text-muted-foreground min-w-0">
                                    <a
                                          href="/"
                                          className="hover:text-foreground transition-colors shrink-0"
                                    >
                                          <Home className="w-3 h-3" />
                                    </a>
                                    {breadcrumbs.map((crumb, i) => (
                                          <span key={crumb.href} className="flex items-center gap-1 min-w-0">
                                                <ChevronRight className="w-3 h-3 shrink-0 text-muted-foreground/50" />
                                                {i === breadcrumbs.length - 1 ? (
                                                      <span className="text-foreground font-medium truncate">
                                                            {crumb.label}
                                                      </span>
                                                ) : (
                                                      <a
                                                            href={crumb.href}
                                                            className="hover:text-foreground transition-colors truncate"
                                                      >
                                                            {crumb.label}
                                                      </a>
                                                )}
                                          </span>
                                    ))}
                              </nav>
                        </div>

                        {/* Right: ⌘K + Actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                    onClick={() => setPaletteOpen(true)}
                                    className={cn(
                                          "flex items-center gap-1.5 px-2 py-1 rounded-md text-xs",
                                          "text-muted-foreground hover:text-foreground hover:bg-muted/80",
                                          "border border-border/50 transition-colors"
                                    )}
                              >
                                    <CommandIcon className="w-3 h-3" />
                                    <span className="hidden sm:inline">
                                          {t("common.search") || "Search"}
                                    </span>
                                    <kbd className="ml-1 px-1 py-0.5 bg-muted rounded text-[10px] font-mono hidden sm:inline">
                                          ⌘K
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
                              <UserProfileDropdown variant="navigation" showName={false} className="h-7" />
                        </div>
                  </header>

                  {/* ── COMMAND PALETTE ── */}
                  <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

                  {/* ── MAIN CONTENT (full width, maximum space) ── */}
                  <main className="pt-9">
                        <div className="p-6 lg:p-8 animate-fade-in max-w-7xl mx-auto">
                              {children}
                        </div>
                  </main>

                  {showFooter && <Footer />}
            </div>
      );
}
