"use client";

import type React from "react";
import { useState, useCallback, useRef, useEffect } from "react";
import { Menu, X, Pin, PinOff } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { LanguageSwitcher, ThemeSwitcher } from "../common";
import { NavRenderer } from "../shared/nav-renderer";
import { UserCard } from "../shared/user-card";
import { LogoutButton } from "../shared/logout-button";
import { Footer } from "../shared/footer";

interface StackedLayoutProps {
  children: React.ReactNode;
}

/**
 * Stacked Layout — Inspired by Notion / Apple Notes / Obsidian.
 *
 * Full-width content with an overlay drawer sidebar.
 * The drawer can be pinned to push content instead of overlaying.
 *
 * Structure (unpinned):
 * ┌──────────────────────────────────┐
 * │ HEADER (56px) — ☰ toggle        │
 * ├──────────────────────────────────┤
 * │                                  │
 * │      FULL-WIDTH CONTENT          │  ← drawer overlays
 * │                                  │
 * └──────────────────────────────────┘
 *
 * Structure (pinned):
 * ┌──────────────────────────────────┐
 * │ HEADER (56px) — ☰ toggle        │
 * ├──────────┬───────────────────────┤
 * │ DRAWER   │                       │
 * │ (300px)  │  MAIN CONTENT         │  ← content pushed
 * │ pinned   │                       │
 * ├──────────┴───────────────────────┤
 * │ FOOTER                           │
 * └──────────────────────────────────┘
 */
export function StackedLayout({ children }: StackedLayoutProps) {
  const { t, direction } = useI18n();
  const { showFooter } = useSettings();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const edgeRef = useRef<HTMLDivElement>(null);

  // Edge-hover trigger (4px strip at the start edge)
  const handleEdgeHover = useCallback(() => {
    if (!pinned && !drawerOpen) {
      setDrawerOpen(true);
    }
  }, [pinned, drawerOpen]);

  // Close drawer when clicking outside (unpinned mode)
  useEffect(() => {
    if (!drawerOpen || pinned) return;
    const handler = (e: MouseEvent) => {
      if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
        setDrawerOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [drawerOpen, pinned]);

  const isDrawerVisible = drawerOpen || pinned;

  return (
    <div className={cn("min-h-screen bg-background", direction === "rtl" ? "rtl" : "ltr")}>
      {/* ── EDGE HOVER TRIGGER ── */}
      {!pinned && !drawerOpen && (
        <div
          ref={edgeRef}
          className={cn(
            "fixed bottom-0 top-14 z-30 w-1 cursor-pointer transition-all hover:w-2",
            "hover:bg-primary/20",
            direction === "rtl" ? "right-0" : "left-0"
          )}
          onMouseEnter={handleEdgeHover}
        />
      )}

      {/* ── HEADER ── */}
      <header className="fixed inset-x-0 top-0 z-40 flex h-14 items-center border-b border-border bg-card px-4 backdrop-blur-sm lg:px-6">
        <div className="flex shrink-0 items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setDrawerOpen(!drawerOpen)}>
            {drawerOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Logo size="sm" className="text-primary-foreground" />
          </div>
          <h1 className="hidden text-base font-semibold text-foreground sm:block">
            {t("app.title")}
          </h1>
        </div>

        <div className="flex-1" />

        <div className="flex items-center gap-2">
          <ThemeSwitcher
            buttonClassName="hover:bg-accent"
            contentClassName="bg-popover border-border"
          />
          <LanguageSwitcher
            buttonClassName="hover:bg-accent"
            contentClassName="bg-popover border-border"
          />
          <UserProfileDropdown variant="navigation" showName={false} />
        </div>
      </header>

      {/* ── DRAWER OVERLAY (unpinned mode) ── */}
      {drawerOpen && !pinned && (
        <div
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px]"
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* ── DRAWER SIDEBAR ── */}
      <aside
        ref={drawerRef}
        className={cn(
          "fixed bottom-0 top-14 z-40 flex w-[300px] flex-col overflow-y-auto border-e border-border bg-card shadow-2xl transition-transform duration-300",
          direction === "rtl" ? "right-0" : "left-0",
          isDrawerVisible
            ? "translate-x-0"
            : direction === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
        )}
      >
        {/* Pin toggle */}
        <div className="flex items-center justify-between border-b border-border p-3">
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {t("layout.navigation") || "Navigation"}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => {
              setPinned(!pinned);
              if (!pinned) setDrawerOpen(true);
            }}
            title={pinned ? "Unpin sidebar" : "Pin sidebar"}
          >
            {pinned ? (
              <PinOff className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Pin className="h-3.5 w-3.5 text-muted-foreground" />
            )}
          </Button>
        </div>

        {/* User card */}
        <div className="border-b border-border p-3">
          <UserCard size="sm" />
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto p-3">
          <NavRenderer
            variant="default"
            onNavigate={() => {
              if (!pinned) setDrawerOpen(false);
            }}
          />
        </div>

        {/* Logout */}
        <div className="border-t border-border p-3">
          <LogoutButton />
        </div>
      </aside>

      {/* ── MAIN CONTENT ── */}
      <main
        className={cn(
          "pt-14 transition-all duration-300",
          pinned && (direction === "rtl" ? "lg:pr-[300px]" : "lg:pl-[300px]")
        )}
      >
        <div className="animate-fade-in p-6">{children}</div>
      </main>

      {showFooter && <Footer />}
    </div>
  );
}
