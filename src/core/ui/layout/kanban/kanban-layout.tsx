"use client";

import type React from "react";
import { useMemo, useState } from "react";
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
import { ScrollArea } from "@core/ui/scroll-area";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";

interface KanbanLayoutProps {
      children: React.ReactNode;
}

/**
 * Kanban / Column Layout — Navigation as swimlane columns.
 *
 * Structure:
 * - Header with logo + actions
 * - Navigation items displayed as horizontal scrollable columns
 * - Each nav group is a column; items are cards within
 * - Content renders in a selected/focused column
 * - Mobile: collapses to single column with horizontal scroll
 *
 * Inspired by Trello, Jira board, Asana
 */
export function KanbanLayout({ children }: KanbanLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

      // Groups with children become columns, direct items go into "Quick Links" column
      const columns = useMemo(() => {
            const cols: { title: string; items: NavigationItem[] }[] = [];
            const directItems: NavigationItem[] = [];

            for (const item of navigation) {
                  if (item.children && item.children.length > 0) {
                        cols.push({
                              title: t(item.name) || item.name,
                              items: item.children.filter((c) => c.href),
                        });
                  } else if (item.href) {
                        directItems.push(item);
                  }
            }

            if (directItems.length > 0) {
                  cols.unshift({
                        title: t("common.quickActions") || "Quick Links",
                        items: directItems,
                  });
            }

            return cols;
      }, [navigation, t]);

      return (
            <div
                  className={cn(
                        "min-h-screen flex flex-col bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Header ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "glass border-b border-border",
                              "flex items-center justify-between px-4 lg:px-6 h-12",
                        )}
                  >
                        <div className="flex items-center gap-3">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden h-8 w-8"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                              >
                                    {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                              </Button>
                              <Logo size="sm" />
                              <span className="text-sm font-bold text-foreground hidden sm:block">
                                    {t("app.title")}
                              </span>
                        </div>
                        <div className="flex items-center gap-2">
                              <LanguageSwitcher />
                              <ThemeSwitcher />
                              <UserProfileDropdown showName={false} />
                        </div>
                  </header>

                  {/* ── Kanban Board: Nav columns ── */}
                  <div className="border-b border-border bg-muted/20 overflow-x-auto scrollbar-none">
                        <div className="flex gap-4 p-4 min-w-max">
                              {columns.map((col) => (
                                    <div
                                          key={col.title}
                                          className="w-52 shrink-0 bg-card rounded-xl border border-border overflow-hidden"
                                    >
                                          <div className="px-3 py-2 bg-muted/40 border-b border-border">
                                                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                                      {col.title}
                                                </h3>
                                                <span className="text-[10px] text-muted-foreground/60">
                                                      {col.items.length} {col.items.length === 1 ? "item" : "items"}
                                                </span>
                                          </div>
                                          <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                                                {col.items.map((item) => {
                                                      const Icon = item.icon;
                                                      const isActive = item.href && isNavigationItemActive(item, pathname);
                                                      return (
                                                            <button
                                                                  key={item.name}
                                                                  onClick={() => item.href && router.push(item.href)}
                                                                  className={cn(
                                                                        "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-start",
                                                                        isActive
                                                                              ? "bg-primary/10 text-primary font-medium shadow-sm"
                                                                              : "text-foreground hover:bg-muted/50",
                                                                  )}
                                                            >
                                                                  {Icon && <Icon className="w-4 h-4 shrink-0" />}
                                                                  <span className="truncate">{t(item.name) || item.name}</span>
                                                                  {item.badge && (
                                                                        <span className="ms-auto bg-destructive text-destructive-foreground text-[9px] rounded-full px-1.5 py-0.5 font-bold">
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

                  {/* ── Mobile Drawer ── */}
                  {mobileMenuOpen && (
                        <>
                              <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                              <aside
                                    dir={direction}
                                    className={cn(
                                          "fixed top-0 bottom-0 w-80 z-40 bg-card border-e border-border overflow-y-auto flex flex-col lg:hidden",
                                          direction === "rtl" ? "right-0" : "left-0",
                                    )}
                              >
                                    <div className="flex items-center justify-between p-4 border-b border-border">
                                          <Logo size="sm" />
                                          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                                                <X className="w-4 h-4" />
                                          </Button>
                                    </div>
                                    <div className="p-3 border-b border-border"><UserCard size="sm" /></div>
                                    <div className="flex-1 p-3 overflow-y-auto">
                                          <NavRenderer variant="default" onNavigate={() => setMobileMenuOpen(false)} />
                                    </div>
                                    <div className="p-3 border-t border-border"><LogoutButton /></div>
                              </aside>
                        </>
                  )}

                  {/* ── Content ── */}
                  <main className="flex-1 p-6">
                        <div style={{ borderRadius: "var(--border-radius)" }}>
                              {children}
                        </div>
                  </main>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
