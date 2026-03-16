"use client";

import type React from "react";
import { useState } from "react";
import { Menu, X, PanelRight, PanelRightClose } from "lucide-react";
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
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";

interface MultiPanelLayoutProps {
  children: React.ReactNode;
}

/**
 * Multi-Panel Workbench Layout  IDE-style with left nav + content + right details.
 *
 * Structure:
 * - Header bar
 * - Left sidebar (navigation)
 * - Main content area (center)
 * - Toggleable right panel (inspector/properties)
 * - Mobile: left sidebar = drawer, right panel hidden
 *
 * Inspired by Figma, Linear, Notion columns
 */
export function MultiPanelLayout({ children }: MultiPanelLayoutProps) {
  const { direction, t } = useI18n();
  const appName = useBrandedAppName();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

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
          <Button
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 lg:flex"
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            title={rightPanelOpen ? "Hide inspector" : "Show inspector"}
          >
            {rightPanelOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRight className="h-4 w-4" />
            )}
          </Button>
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown showName={false} />
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/*  Left Sidebar  */}
        <aside
          className={cn("hidden w-56 shrink-0 flex-col lg:flex", "border-e border-border bg-card")}
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

        {/*  Main Content  */}
        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          <div style={{ borderRadius: "var(--border-radius)" }}>{children}</div>
        </main>

        {/*  Right Inspector Panel  */}
        {rightPanelOpen && (
          <aside
            className={cn(
              "hidden w-64 shrink-0 flex-col lg:flex",
              "border-s border-border bg-card/50"
            )}
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {t("common.details") || "Details"}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setRightPanelOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">
                    {t("common.status") || "Status"}
                  </p>
                  <p className="text-sm text-foreground">{t("common.active") || "Active"}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/50 p-3">
                  <p className="mb-1 text-xs font-semibold text-muted-foreground">
                    {t("common.lastModified") || "Last Modified"}
                  </p>
                  <p className="text-sm text-foreground">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {settings.showFooter && <Footer />}
    </div>
  );
}
