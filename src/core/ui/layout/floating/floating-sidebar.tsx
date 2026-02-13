"use client";

import { X } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";

interface FloatingSidebarProps {
      open: boolean;
      onOpenChange: (open: boolean) => void;
}

/**
 * Floating Sidebar — Overlay slide-in panel.
 *
 * Hidden by default. Slides in from left/right (RTL-aware)
 * with elevated shadow. Content stays in place (no shift).
 * Backdrop dims the page behind.
 *
 * Inspired by Figma/Framer overlay panels.
 */
export function FloatingSidebar({
      open,
      onOpenChange,
}: FloatingSidebarProps) {
      const { t, direction } = useI18n();

      return (
            <>
                  {/* Backdrop */}
                  {open && (
                        <div
                              className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm transition-opacity duration-300"
                              onClick={() => onOpenChange(false)}
                        />
                  )}

                  {/* Sidebar panel */}
                  <aside
                        className={cn(
                              "fixed top-0 bottom-0 z-[60] flex flex-col w-80",
                              "bg-sidebar shadow-2xl",
                              direction === "rtl"
                                    ? "right-0 border-l border-sidebar-border/50"
                                    : "left-0 border-r border-sidebar-border/50",
                              "transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
                              open
                                    ? "translate-x-0"
                                    : direction === "rtl"
                                          ? "translate-x-full"
                                          : "-translate-x-full"
                        )}
                  >
                        {/* ── Header ── */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-sidebar-border/30">
                              <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center shadow-sm">
                                          <Logo size="sm" className="text-primary-foreground" />
                                    </div>
                                    <div>
                                          <h1 className="text-sm font-bold text-sidebar-foreground">
                                                {t("app.title")}
                                          </h1>
                                          <p className="text-[10px] text-sidebar-foreground/50">
                                                {t("app.version")}
                                          </p>
                                    </div>
                              </div>

                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent rounded-lg h-8 w-8"
                                    onClick={() => onOpenChange(false)}
                              >
                                    <X className="w-4 h-4" />
                              </Button>
                        </div>

                        {/* ── User Card ── */}
                        <div className="px-4 py-3 border-b border-sidebar-border/20">
                              <UserCard size="md" />
                        </div>

                        {/* ── Navigation ── */}
                        <div className="flex-1 px-3 py-3 overflow-y-auto scrollbar-thin">
                              <NavRenderer
                                    variant="default"
                                    onNavigate={() => onOpenChange(false)}
                              />
                        </div>

                        {/* ── Footer ── */}
                        <div className="px-3 py-3 border-t border-sidebar-border/20">
                              <LogoutButton />
                              <p className="text-[10px] text-sidebar-foreground/40 text-center mt-2">
                                    {t("app.version")}
                              </p>
                        </div>
                  </aside>
            </>
      );
}
