"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Inbox, Send, FileText, Trash2, Tag, ChevronRight, ChevronLeft, Menu, X } from "lucide-react";
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
import { cn } from "@core/common/utils";

interface InboxLayoutProps {
      children: React.ReactNode;
}

/**
 * Inbox / Three-Column Layout — Email client-style.
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
                  if (folder.href && isNavigationItemActive(folder, pathname)) return folder;
                  if (folder.children) {
                        for (const child of folder.children) {
                              if (child.href && isNavigationItemActive(child, pathname)) return folder;
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
                              "flex items-center justify-between px-4 h-11",
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
                              <span className="text-sm font-semibold text-foreground hidden sm:block">
                                    {t("app.title")}
                              </span>
                        </div>
                        <div className="flex items-center gap-2">
                              <LanguageSwitcher />
                              <ThemeSwitcher />
                              <UserProfileDropdown showName={false} />
                        </div>
                  </header>

                  <div className="flex-1 flex overflow-hidden">
                        {/* ── Column 1: Folders (desktop) ── */}
                        <aside
                              className={cn(
                                    "hidden lg:flex flex-col w-52 shrink-0",
                                    "bg-card border-e border-border",
                              )}
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
                                                            "w-full flex items-center gap-2.5 px-4 py-2 text-sm transition-colors",
                                                            isActive
                                                                  ? "bg-primary/10 text-primary font-medium"
                                                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                                                      )}
                                                >
                                                      <FolderIcon className="w-4 h-4 shrink-0" />
                                                      <span className="truncate flex-1 text-start">
                                                            {t(folder.name) || folder.name}
                                                      </span>
                                                      {childCount > 0 && (
                                                            <span className="text-[10px] text-muted-foreground bg-muted rounded-full px-1.5 py-0.5">
                                                                  {childCount}
                                                            </span>
                                                      )}
                                                </button>
                                          );
                                    })}
                              </ScrollArea>
                        </aside>

                        {/* ── Column 2: Item List ── */}
                        <div
                              className={cn(
                                    "hidden lg:flex flex-col w-64 shrink-0",
                                    "bg-card/50 border-e border-border",
                              )}
                        >
                              <div className="px-3 py-2 border-b border-border">
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                                          {activeFolder ? t(activeFolder.name) || activeFolder.name : "Items"}
                                    </p>
                              </div>
                              <ScrollArea className="flex-1">
                                    {folderItems.map((item) => {
                                          const Icon = item.icon;
                                          const isActive = item.href && isNavigationItemActive(item, pathname);
                                          return (
                                                <button
                                                      key={item.name}
                                                      onClick={() => item.href && router.push(item.href)}
                                                      className={cn(
                                                            "w-full flex items-center gap-2.5 px-3 py-2.5 text-sm border-b border-border/30 transition-colors text-start",
                                                            isActive
                                                                  ? "bg-primary/5 text-primary font-medium border-s-2 border-s-primary"
                                                                  : "text-foreground hover:bg-muted/50",
                                                      )}
                                                >
                                                      {Icon && <Icon className="w-4 h-4 shrink-0 text-muted-foreground" />}
                                                      <span className="truncate">{t(item.name) || item.name}</span>
                                                      {item.badge && (
                                                            <span className="ms-auto bg-destructive text-destructive-foreground text-[9px] rounded-full px-1.5 py-0.5 font-bold">
                                                                  {item.badge}
                                                            </span>
                                                      )}
                                                </button>
                                          );
                                    })}
                              </ScrollArea>
                        </div>

                        {/* ── Mobile Drawer ── */}
                        {mobileMenuOpen && (
                              <>
                                    <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                                    <aside
                                          dir={direction}
                                          className={cn(
                                                "fixed top-11 bottom-0 w-72 z-40 bg-card border-e border-border flex flex-col lg:hidden",
                                                direction === "rtl" ? "right-0" : "left-0",
                                          )}
                                    >
                                          <ScrollArea className="flex-1 py-2">
                                                {folders.map((folder, i) => {
                                                      const FolderIcon = folder.icon || getFolderIcon(i);
                                                      return (
                                                            <div key={folder.name}>
                                                                  <div className="px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                                        <FolderIcon className="w-3.5 h-3.5" />
                                                                        {t(folder.name) || folder.name}
                                                                  </div>
                                                                  {folder.children?.filter((c) => c.href).map((child) => {
                                                                        const ChildIcon = child.icon;
                                                                        const isActive = child.href && isNavigationItemActive(child, pathname);
                                                                        return (
                                                                              <button
                                                                                    key={child.name}
                                                                                    onClick={() => {
                                                                                          if (child.href) router.push(child.href);
                                                                                          setMobileMenuOpen(false);
                                                                                    }}
                                                                                    className={cn(
                                                                                          "w-full flex items-center gap-2 px-6 py-2 text-sm transition-colors text-start",
                                                                                          isActive
                                                                                                ? "bg-primary/10 text-primary font-medium"
                                                                                                : "text-foreground hover:bg-muted/50",
                                                                                    )}
                                                                              >
                                                                                    {ChildIcon && <ChildIcon className="w-3.5 h-3.5" />}
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

                        {/* ── Column 3: Content/Detail ── */}
                        <main className="flex-1 min-w-0 p-6 overflow-y-auto">
                              <div style={{ borderRadius: "var(--border-radius)" }}>
                                    {children}
                              </div>
                        </main>
                  </div>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
