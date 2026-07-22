"use client";

import Link from "next/link";
import { Settings } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import { Button } from "@core/ui/button";
import { NavRenderer, UserCard, LogoutButton } from "../shared";
import { Logo } from "@core/ui/logo";

interface NavigationSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NavigationSidebar({ open, onOpenChange }: NavigationSidebarProps) {
  const { t, direction } = useI18n();

  return (
    <>
      <div
        dir={direction}
        className={cn(
          "navigation-sidebar fixed inset-y-0 z-50 w-72",
          "border-r border-sidebar-border bg-sidebar",
          "transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          direction === "rtl" ? "right-0" : "left-0",
          open ? "translate-x-0" : direction === "rtl" ? "translate-x-full" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex items-center gap-3 border-b border-sidebar-border px-6 py-6">
            <Logo className="h-8 w-8" />
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-lg font-semibold leading-tight text-sidebar-foreground">
                {t("app.tagline")}
              </h1>
              <p className="text-sm text-sidebar-foreground/60">{t("nav.dashboard")}</p>
            </div>
          </div>

          {/* Navigation — replaces 85-line renderNavigationItem */}
          <NavRenderer
            variant="navigation"
            className="custom-scrollbar flex-1 space-y-2 overflow-y-auto px-4 py-6"
            onNavigate={() => {
              if (window.innerWidth < 1024) onOpenChange(false);
            }}
          />

          {/* User Section */}
          <div className="space-y-3 border-t border-sidebar-border p-4">
            <UserCard
              size="sm"
              showStatus
              showRole
              className="border-sidebar-border bg-sidebar-accent/50"
            />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              asChild
            >
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4" />
                {t("nav.settings")}
              </Link>
            </Button>
            <LogoutButton className="w-full justify-start text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground" />
          </div>
        </div>
      </div>
    </>
  );
}
