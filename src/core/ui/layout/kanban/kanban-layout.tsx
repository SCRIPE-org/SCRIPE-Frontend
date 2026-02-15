"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
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
import { NotificationBell } from "@core/ui/notification";

interface KanbanLayoutProps {
  children: React.ReactNode;
}

/**
 * Kanban / Column Layout â€” Navigation as swimlane columns.
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
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/* â”€â”€ Header â”€â”€ */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "glass border-b border-border",
          "flex h-12 items-center justify-between px-4 lg:px-6"
        )}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <Logo size="sm" />
          <span className="hidden text-sm font-bold text-foreground sm:block">
            {t("app.title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell iconClassName="h-4 w-4" />
          <UserProfileDropdown showName={false} />
        </div>
      </header>

      {/* â”€â”€ Kanban Board: Nav columns â”€â”€ */}
      <div className="scrollbar-none overflow-x-auto border-b border-border bg-muted/20">
        <div className="flex min-w-max gap-4 p-4">
          {columns.map((col) => (
            <div
              key={col.title}
              className="w-52 shrink-0 overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="border-b border-border bg-muted/40 px-3 py-2">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {col.title}
                </h3>
                <span className="text-[10px] text-muted-foreground/60">
                  {col.items.length} {col.items.length === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="max-h-48 space-y-1 overflow-y-auto p-2">
                {col.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = item.href && isNavigationItemActive(item, pathname);
                  return (
                    <button
                      key={item.name}
                      onClick={() => item.href && router.push(item.href)}
                      className={cn(
                        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-start text-sm transition-colors",
                        isActive
                          ? "bg-primary/10 font-medium text-primary shadow-sm"
                          : "text-foreground hover:bg-muted/50"
                      )}
                    >
                      {Icon && <Icon className="h-4 w-4 shrink-0" />}
                      <span className="truncate">{t(item.name) || item.name}</span>
                      {item.badge && (
                        <span className="ms-auto rounded-full bg-destructive px-1.5 py-0.5 text-[9px] font-bold text-destructive-foreground">
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

      {/* â”€â”€ Mobile Drawer â”€â”€ */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            dir={direction}
            className={cn(
              "fixed bottom-0 top-0 z-40 flex w-80 flex-col overflow-y-auto border-e border-border bg-card lg:hidden",
              direction === "rtl" ? "right-0" : "left-0"
            )}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <Logo size="sm" />
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="border-b border-border p-3">
              <UserCard size="sm" />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <NavRenderer variant="default" onNavigate={() => setMobileMenuOpen(false)} />
            </div>
            <div className="border-t border-border p-3">
              <LogoutButton />
            </div>
          </aside>
        </>
      )}

      {/* â”€â”€ Content â”€â”€ */}
      <main className="flex-1 p-6">
        <div style={{ borderRadius: "var(--border-radius)" }}>{children}</div>
      </main>

      {settings.showFooter && <Footer />}
    </div>
  );
}
