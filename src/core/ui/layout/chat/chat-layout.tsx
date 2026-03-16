"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, Hash, Menu, X, Send } from "lucide-react";
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
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";

interface ChatLayoutProps {
  children: React.ReactNode;
}

/**
 * Chat-Centric Layout  Messaging app style.
 *
 * Structure:
 * - Left: channels/rooms sidebar (nav items as channels)
 * - Right: content area (chat/main content)
 * - No footer, immersive full-height
 * - Mobile: sidebar as overlay
 *
 * Inspired by Slack, Discord, Microsoft Teams
 */
export function ChatLayout({ children }: ChatLayoutProps) {
  const { direction, t } = useI18n();
  const appName = useBrandedAppName();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Navigation groups become channel categories
  const channels = useMemo(() => {
    return navigation
      .map((item) => ({
        category: t(item.name) || item.name,
        icon: item.icon,
        items: item.children ? item.children.filter((c) => c.href) : item.href ? [item] : [],
      }))
      .filter((c) => c.items.length > 0);
  }, [navigation, t]);

  const ChannelList = (
    <ScrollArea className="flex-1">
      {channels.map((category) => {
        const CatIcon = category.icon;
        return (
          <div key={category.category} className="mb-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground/60">
              {CatIcon && <CatIcon className="h-3 w-3" />}
              {category.category}
            </div>
            {category.items.map((item) => {
              const isActive = item.href && isNavigationItemActive(item, pathname);
              const ChannelIcon = item.icon || Hash;
              return (
                <button
                  key={item.name}
                  onClick={() => {
                    if (item.href) router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={cn(
                    "mx-1 flex w-full items-center gap-2 rounded-md px-3 py-1.5 text-start text-sm transition-colors",
                    "max-w-[calc(100%-8px)]",
                    isActive
                      ? "bg-primary/15 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                  )}
                >
                  <ChannelIcon className="h-4 w-4 shrink-0" />
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
        );
      })}
    </ScrollArea>
  );

  return (
    <div
      className={cn("flex h-screen overflow-hidden bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/*  Desktop Sidebar  */}
      <aside
        className={cn("hidden w-60 shrink-0 flex-col lg:flex", "border-e border-border bg-card")}
      >
        <div className="flex items-center gap-2 border-b border-border px-3 py-3">
          <Logo size="sm" />
          <span className="truncate text-sm font-bold text-foreground">{appName}</span>
        </div>
        {ChannelList}
        <div className="border-t border-border p-2">
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown showName />
        </div>
      </aside>

      {/*  Mobile Sidebar Overlay  */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
          <aside
            dir={direction}
            className={cn(
              "fixed bottom-0 top-0 z-40 flex w-64 flex-col border-e border-border bg-card lg:hidden",
              direction === "rtl" ? "right-0" : "left-0"
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-3 py-3">
              <Logo size="sm" />
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {ChannelList}
          </aside>
        </>
      )}

      {/*  Content Area  */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Chat header bar */}
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card/50 px-4">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              {t("layout.content") || "Content"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div style={{ borderRadius: "var(--border-radius)" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
