"use client";

import type React from "react";
import { useState, useMemo } from "react";
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
import { cn } from "@core/common/utils";

interface OverlayLayoutProps {
      children: React.ReactNode;
}

/**
 * Overlay Layout — Fullscreen menu that takes over on open.
 *
 * Structure:
 * - Minimal top header with logo + hamburger + actions
 * - Full-width content (zero chrome)
 * - Menu button opens a fullscreen overlay with large nav links
 * - Mobile: same experience — overlay IS the mobile pattern
 *
 * Inspired by Stripe, creative portfolios, luxury brands
 */
export function OverlayLayout({ children }: OverlayLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const [menuOpen, setMenuOpen] = useState(false);

      // Flatten navigation for the overlay
      const allItems = useMemo(() => {
            const items: NavigationItem[] = [];
            for (const item of navigation) {
                  if (item.href) {
                        items.push(item);
                  }
                  if (item.children) {
                        for (const child of item.children) {
                              if (child.href) items.push(child);
                        }
                  }
            }
            return items;
      }, [navigation]);

      // Group items: top-level with children become sections
      const sections = useMemo(() => {
            return navigation.map((item) => ({
                  title: item.children && item.children.length > 0 ? t(item.name) || item.name : null,
                  items: item.children && item.children.length > 0
                        ? item.children.filter((c) => c.href)
                        : item.href
                              ? [item]
                              : [],
            })).filter((s) => s.items.length > 0);
      }, [navigation, t]);

      return (
            <div
                  className={cn(
                        "min-h-screen flex flex-col bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Minimal Header ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "glass border-b border-border",
                              "flex items-center justify-between px-6 h-14",
                        )}
                  >
                        <div className="flex items-center gap-3">
                              <Logo size="sm" />
                              <span className="text-sm font-bold text-foreground hidden sm:block">
                                    {t("app.title")}
                              </span>
                        </div>

                        <div className="flex items-center gap-2">
                              <LanguageSwitcher />
                              <ThemeSwitcher />
                              <UserProfileDropdown showName={false} />
                              <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setMenuOpen(true)}
                                    className="gap-2"
                              >
                                    <Menu className="w-4 h-4" />
                                    <span className="hidden sm:inline text-xs">
                                          {t("layout.navigation") || "Menu"}
                                    </span>
                              </Button>
                        </div>
                  </header>

                  {/* ── Content ── */}
                  <main className="flex-1 p-6">
                        <div style={{ borderRadius: "var(--border-radius)" }}>
                              {children}
                        </div>
                  </main>

                  {settings.showFooter && <Footer />}

                  {/* ── Fullscreen Overlay Menu ── */}
                  {menuOpen && (
                        <div
                              className={cn(
                                    "fixed inset-0 z-50",
                                    "bg-background/98 backdrop-blur-xl",
                                    "flex flex-col",
                                    "animate-in fade-in duration-200",
                              )}
                              dir={direction}
                        >
                              {/* Overlay header */}
                              <div className="flex items-center justify-between px-6 h-14 border-b border-border/30">
                                    <div className="flex items-center gap-3">
                                          <Logo size="sm" />
                                          <span className="text-sm font-bold text-foreground">
                                                {t("app.title")}
                                          </span>
                                    </div>
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() => setMenuOpen(false)}
                                          className="w-10 h-10"
                                    >
                                          <X className="w-5 h-5" />
                                    </Button>
                              </div>

                              {/* Navigation grid */}
                              <div className="flex-1 overflow-y-auto px-6 py-8 lg:px-16 lg:py-12">
                                    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                          {sections.map((section, i) => (
                                                <div key={i}>
                                                      {section.title && (
                                                            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                                                                  {section.title}
                                                            </h3>
                                                      )}
                                                      <div className="flex flex-col gap-1">
                                                            {section.items.map((item) => {
                                                                  const Icon = item.icon;
                                                                  const isActive = isNavigationItemActive(item, pathname);
                                                                  return (
                                                                        <button
                                                                              key={item.name}
                                                                              onClick={() => {
                                                                                    if (item.href) router.push(item.href);
                                                                                    setMenuOpen(false);
                                                                              }}
                                                                              className={cn(
                                                                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-start",
                                                                                    isActive
                                                                                          ? "bg-primary/10 text-primary scale-[1.02]"
                                                                                          : "text-foreground hover:bg-muted/50 hover:scale-[1.01]",
                                                                              )}
                                                                        >
                                                                              {Icon && (
                                                                                    <div
                                                                                          className={cn(
                                                                                                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                                                                isActive ? "bg-primary/20" : "bg-muted",
                                                                                          )}
                                                                                    >
                                                                                          <Icon className="w-5 h-5" />
                                                                                    </div>
                                                                              )}
                                                                              <span className="text-lg font-medium">
                                                                                    {t(item.name) || item.name}
                                                                              </span>
                                                                              {item.badge && (
                                                                                    <span className="ms-auto bg-destructive text-destructive-foreground text-xs rounded-full px-2 py-0.5 font-bold">
                                                                                          {item.badge}
                                                                                    </span>
                                                                              )}
                                                                        </button>
                                                                  );
                                                            })}
                                                      </div>
                                                </div>
                                          ))}
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
}
