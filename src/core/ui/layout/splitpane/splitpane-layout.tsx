"use client";

import type React from "react";
import { useState } from "react";
import { Menu, X, PanelBottomClose, PanelBottomOpen } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";

interface SplitPaneLayoutProps {
  children: React.ReactNode;
}

/**
 * Split Pane / IDE Layout  Sidebar + content + resizable bottom panel.
 *
 * Structure:
 * - Header bar
 * - Left nav sidebar (240px)
 * - Main content area
 * - Toggleable bottom panel (activity/logs/console)
 * - Mobile: sidebar as hamburger, bottom panel hidden
 *
 * Inspired by VS Code, Outlook, Figma
 */
export function SplitPaneLayout({ children }: SplitPaneLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [bottomPanelOpen, setBottomPanelOpen] = useState(false);

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
            {t("app.title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Bottom panel toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 lg:flex"
            onClick={() => setBottomPanelOpen(!bottomPanelOpen)}
            title={bottomPanelOpen ? "Hide panel" : "Show panel"}
          >
            {bottomPanelOpen ? (
              <PanelBottomClose className="h-4 w-4" />
            ) : (
              <PanelBottomOpen className="h-4 w-4" />
            )}
          </Button>
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown showName={false} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* â”€â”€ Desktop Sidebar â”€â”€ */}
        <aside
          className={cn("hidden w-60 shrink-0 flex-col lg:flex", "border-e border-border bg-card")}
        >
          <div className="border-b border-border p-3">
            <UserCard size="sm" />
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            <NavRenderer variant="compact" />
          </div>
          <div className="border-t border-border p-2">
            <LogoutButton />
          </div>
        </aside>

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
                "fixed bottom-0 top-11 z-40 flex w-72 flex-col border-e border-border bg-card lg:hidden",
                direction === "rtl" ? "right-0" : "left-0"
              )}
            >
              <div className="border-b border-border p-3">
                <UserCard size="sm" />
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                <NavRenderer variant="default" onNavigate={() => setMobileMenuOpen(false)} />
              </div>
              <div className="border-t border-border p-2">
                <LogoutButton />
              </div>
            </aside>
          </>
        )}

        {/* â”€â”€ Content + Bottom Panel â”€â”€ */}
        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 overflow-y-auto p-6">
            <div style={{ borderRadius: "var(--border-radius)" }}>{children}</div>
          </main>

          {/* Bottom Panel */}
          {bottomPanelOpen && (
            <div className="hidden h-44 shrink-0 border-t border-border bg-card lg:block">
              <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-semibold text-primary">
                    {t("common.output") || "Output"}
                  </span>
                  <span className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    {t("common.activity") || "Activity"}
                  </span>
                  <span className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                    {t("common.console") || "Console"}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setBottomPanelOpen(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="h-[calc(100%-36px)] overflow-y-auto p-3 font-mono text-xs text-muted-foreground">
                <div className="space-y-1">
                  <p>
                    <span className="text-muted-foreground/60">[info]</span>{" "}
                    {t("common.ready") || "System ready"}
                  </p>
                  <p>
                    <span className="text-green-500">[ok]</span>{" "}
                    {t("common.connected") || "Connected"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {settings.showFooter && <Footer />}
    </div>
  );
}
