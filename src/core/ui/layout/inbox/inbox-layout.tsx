"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Inbox,
  Send,
  FileText,
  Trash2,
  Tag,
  ChevronRight,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
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
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";

interface InboxLayoutProps {
  children: React.ReactNode;
}

/**
 * Inbox / Three-Column Layout  Email client-style.
 *
 * Structure:
 * - Header bar
 * - Left: folders/categories panel (nav groups)
 * - Middle: item list (nav children of selected group)
 * - Right: content/detail (children prop)
 * - Mobile: single column with back navigation
 *
 * Inspired by Gmail, Outlook, Apple Mail
 */
export function InboxLayout({ children }: InboxLayoutProps) {
  const { direction, t } = useI18n();
  const appName = useBrandedAppName();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isRTL = direction === "rtl";

  // Folders = top-level nav items (groups)
  const folders = useMemo(() => navigation, [navigation]);

  // Active folder = the one containing the active page
  const activeFolder = useMemo(() => {
    for (const folder of folders) {
      if (folder.href && isNavigationItemActive(folder, pathname, navigation)) return folder;
      if (folder.children) {
        for (const child of folder.children) {
          if (child.href && isNavigationItemActive(child, pathname, navigation)) return folder;
        }
      }
    }
    return folders[0] || null;
  }, [folders, pathname]);

  // Items in the active folder
  const folderItems = useMemo(() => {
    if (!activeFolder) return [];
    if (activeFolder.children) return activeFolder.children.filter((c) => c.href);
    return activeFolder.href ? [activeFolder] : [];
  }, [activeFolder]);

  // Folder icons mapping
  const getFolderIcon = (index: number) => {
    const icons = [Inbox, Send, FileText, Trash2, Tag];
    return icons[index % icons.length];
  };

  return (
    <div
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/*  Header  */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "glass border-b border-border",
          "flex h-11 items-center justify-between px-4"
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
          <span className="hidden text-sm font-semibold text-foreground sm:block">
            {appName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown showName={false} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/*  Column 1: Folders (desktop)  */}
        <aside
          className={cn("hidden w-52 shrink-0 flex-col lg:flex", "border-e border-border bg-card")}
        >
          <ScrollArea className="flex-1 py-2">
            {folders.map((folder, i) => {
              const FolderIcon = folder.icon || getFolderIcon(i);
              const isActive = activeFolder?.name === folder.name;
              const childCount = folder.children?.length || 0;
              return (
                <button
                  key={folder.name}
                  onClick={() => {
                    const href = folder.href || folder.children?.[0]?.href;
                    if (href) router.push(href);
                  }}
                  className={cn(
                    "flex w-full items-center gap-2.5 px-4 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <FolderIcon className="h-4 w-4 shrink-0" />
                  <span className="flex-1 truncate text-start">
                    {t(folder.name) || folder.name}
                  </span>
                  {childCount > 0 && (
                    <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                      {childCount}
                    </span>
                  )}
                </button>
              );
            })}
          </ScrollArea>
        </aside>

        {/*  Column 2: Item List  */}
        <div
          className={cn(
            "hidden w-64 shrink-0 flex-col lg:flex",
            "border-e border-border bg-card/50"
          )}
        >
          <div className="border-b border-border px-3 py-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {activeFolder ? t(activeFolder.name) || activeFolder.name : "Items"}
            </p>
          </div>
          <ScrollArea className="flex-1">
            {folderItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.href && isNavigationItemActive(item, pathname, navigation);
              return (
                <button
                  key={item.name}
                  onClick={() => item.href && router.push(item.href)}
                  className={cn(
                    "flex w-full items-center gap-2.5 border-b border-border/30 px-3 py-2.5 text-start text-sm transition-colors",
                    isActive
                      ? "border-s-2 border-s-primary bg-primary/5 font-medium text-primary"
                      : "text-foreground hover:bg-muted/50"
                  )}
                >
                  {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
                  <span className="truncate">{t(item.name) || item.name}</span>
                  {item.badge && (
                    <span className="ms-auto rounded-full bg-destructive px-1.5 py-0.5 text-[9px] font-bold text-destructive-foreground">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </ScrollArea>
        </div>

        {/*  Mobile Drawer  */}
        {mobileMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/30 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <aside
              dir={direction}
              className={cn(
                "fixed bottom-0 top-11 z-40 flex w-72 flex-col border-e border-border bg-card lg:hidden",
                direction === "rtl" ? "right-0" : "left-0"
              )}
            >
              <ScrollArea className="flex-1 py-2">
                {folders.map((folder, i) => {
                  const FolderIcon = folder.icon || getFolderIcon(i);
                  return (
                    <div key={folder.name}>
                      <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        <FolderIcon className="h-3.5 w-3.5" />
                        {t(folder.name) || folder.name}
                      </div>
                      {folder.children
                        ?.filter((c) => c.href)
                        .map((child) => {
                          const ChildIcon = child.icon;
                          const isActive = child.href && isNavigationItemActive(child, pathname, navigation);
                          return (
                            <button
                              key={child.name}
                              onClick={() => {
                                if (child.href) router.push(child.href);
                                setMobileMenuOpen(false);
                              }}
                              className={cn(
                                "flex w-full items-center gap-2 px-6 py-2 text-start text-sm transition-colors",
                                isActive
                                  ? "bg-primary/10 font-medium text-primary"
                                  : "text-foreground hover:bg-muted/50"
                              )}
                            >
                              {ChildIcon && <ChildIcon className="h-3.5 w-3.5" />}
                              {t(child.name) || child.name}
                            </button>
                          );
                        })}
                    </div>
                  );
                })}
              </ScrollArea>
            </aside>
          </>
        )}

        {/*  Column 3: Content/Detail  */}
        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          <div style={{ borderRadius: "var(--border-radius)" }}>{children}</div>
        </main>
      </div>

      {settings.showFooter && <Footer />}
    </div>
  );
}
