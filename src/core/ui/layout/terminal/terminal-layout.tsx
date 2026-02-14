"use client";

import type React from "react";
import { useState, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Terminal as TerminalIcon, X, ChevronRight } from "lucide-react";
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

interface TerminalLayoutProps {
  children: React.ReactNode;
}

/**
 * Terminal / CLI Layout — Hacker-style monotone.
 *
 * Structure:
 * - Slim title bar (macOS-style traffic lights + title)
 * - Left: command-style nav list with $ prefixes
 * - Content area with mono styling
 * - No footer, immersive
 * - Mobile: nav in bottom sheet
 *
 * Inspired by Hyper terminal, iTerm, VS Code terminal
 */
export function TerminalLayout({ children }: TerminalLayoutProps) {
  const { direction, t } = useI18n();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [navOpen, setNavOpen] = useState(false);

  // Flatten items for command list
  const commands = useMemo(() => {
    const items: NavigationItem[] = [];
    for (const item of navigation) {
      if (item.href) items.push(item);
      else if (item.children) {
        for (const child of item.children) {
          if (child.href) items.push(child);
        }
      }
    }
    return items;
  }, [navigation]);

  return (
    <div
      className={cn(
        "flex h-screen flex-col overflow-hidden bg-[#0d1117] font-mono text-[#c9d1d9]",
        styles.getAnimationClass()
      )}
      dir={direction}
    >
      {/* ── Title Bar ── */}
      <div className="flex h-9 shrink-0 items-center border-b border-[#30363d] bg-[#161b22] px-3">
        {/* Traffic lights */}
        <div className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-full bg-[#ff5f56]" />
          <span className="h-3 w-3 rounded-full bg-[#ffbd2e]" />
          <span className="h-3 w-3 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex flex-1 items-center justify-center gap-2">
          <TerminalIcon className="h-3 w-3 text-[#8b949e]" />
          <span className="text-xs text-[#8b949e]">
            {t("app.title")} — {t("layout.terminal") || "terminal"}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <LanguageSwitcher
            buttonClassName="text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d]"
            contentClassName="bg-[#161b22] border-[#30363d] text-[#c9d1d9]"
          />
          <ThemeSwitcher
            buttonClassName="text-[#8b949e] hover:text-[#c9d1d9] hover:bg-[#30363d]"
            contentClassName="bg-[#161b22] border-[#30363d]"
          />
          <UserProfileDropdown showName={false} />
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* ── Desktop: Command Nav ── */}
        <aside className="hidden w-52 shrink-0 flex-col border-e border-[#30363d] bg-[#0d1117] lg:flex">
          <div className="border-b border-[#30363d] px-3 py-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-[#27c93f]">▶</span>
              <span className="text-xs text-[#8b949e]">~/navigation</span>
            </div>
          </div>
          <ScrollArea className="flex-1 py-1">
            {commands.map((item) => {
              const isActive = item.href && isNavigationItemActive(item, pathname);
              return (
                <button
                  key={item.name}
                  onClick={() => item.href && router.push(item.href)}
                  className={cn(
                    "flex w-full items-center gap-2 px-3 py-1.5 text-start text-xs transition-colors",
                    isActive
                      ? "bg-[#1f6feb]/20 text-[#58a6ff]"
                      : "text-[#8b949e] hover:bg-[#161b22] hover:text-[#c9d1d9]"
                  )}
                >
                  <ChevronRight
                    className={cn(
                      "h-3 w-3 shrink-0",
                      isActive ? "text-[#27c93f]" : "text-[#30363d]"
                    )}
                  />
                  <span className="select-none text-[#27c93f]">$</span>
                  <span className="truncate font-mono">
                    {(t(item.name) || item.name).toLowerCase().replace(/\s+/g, "-")}
                  </span>
                </button>
              );
            })}
          </ScrollArea>
          <div className="border-t border-[#30363d] p-2">
            <div className="flex items-center gap-2 px-2 py-1 text-xs text-[#8b949e]">
              <span className="h-2 w-2 rounded-full bg-[#27c93f]" />
              <span>{t("common.online") || "online"}</span>
            </div>
          </div>
        </aside>

        {/* ── Mobile Nav Toggle ── */}
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 start-4 z-30 h-10 w-10 border border-[#30363d] bg-[#161b22] text-[#c9d1d9] hover:bg-[#30363d] lg:hidden"
          onClick={() => setNavOpen(!navOpen)}
        >
          <TerminalIcon className="h-4 w-4" />
        </Button>

        {/* ── Mobile Nav Sheet ── */}
        {navOpen && (
          <>
            <div
              className="fixed inset-0 z-30 bg-black/50 lg:hidden"
              onClick={() => setNavOpen(false)}
            />
            <div
              className={cn(
                "fixed inset-x-0 bottom-0 z-40 flex max-h-[60vh] flex-col rounded-t-2xl border-t border-[#30363d] bg-[#161b22] lg:hidden"
              )}
            >
              <div className="flex items-center justify-between border-b border-[#30363d] px-4 py-3">
                <span className="text-xs text-[#8b949e]">~/navigation</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-[#8b949e]"
                  onClick={() => setNavOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
              <ScrollArea className="flex-1 px-2 py-1">
                {commands.map((item) => {
                  const isActive = item.href && isNavigationItemActive(item, pathname);
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        if (item.href) router.push(item.href);
                        setNavOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-2 rounded px-3 py-2 text-start text-xs transition-colors",
                        isActive
                          ? "bg-[#1f6feb]/20 text-[#58a6ff]"
                          : "text-[#8b949e] hover:bg-[#0d1117] hover:text-[#c9d1d9]"
                      )}
                    >
                      <span className="text-[#27c93f]">$</span>
                      <span className="font-mono">
                        {(t(item.name) || item.name).toLowerCase().replace(/\s+/g, "-")}
                      </span>
                    </button>
                  );
                })}
              </ScrollArea>
            </div>
          </>
        )}

        {/* ── Content ── */}
        <main className="min-w-0 flex-1 overflow-y-auto p-6">
          <div style={{ borderRadius: "var(--border-radius)" }}>{children}</div>
        </main>
      </div>
    </div>
  );
}
