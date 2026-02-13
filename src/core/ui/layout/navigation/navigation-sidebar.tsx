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

export function NavigationSidebar({
  open,
  onOpenChange,
}: NavigationSidebarProps) {
  const { t, direction } = useI18n();

  return (
    <>
      <div
        className={cn(
          "navigation-sidebar fixed inset-y-0 z-50 w-72",
          "bg-slate-950 border-r border-slate-800",
          "transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          direction === "rtl" ? "right-0" : "left-0",
          open
            ? "translate-x-0"
            : direction === "rtl"
              ? "translate-x-full"
              : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-800">
            <Logo className="w-8 h-8" />
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-semibold text-lg leading-tight break-words">
                {t("app.tagline")}
              </h1>
              <p className="text-slate-400 text-sm">{t("nav.dashboard")}</p>
            </div>
          </div>

          {/* Navigation — replaces 85-line renderNavigationItem */}
          <NavRenderer
            variant="navigation"
            className="flex-1 overflow-y-auto py-6 px-4 space-y-2 custom-scrollbar"
            onNavigate={() => {
              if (window.innerWidth < 1024) onOpenChange(false);
            }}
          />

          {/* User Section */}
          <div className="border-t border-slate-800 p-4 space-y-3">
            <UserCard
              size="sm"
              showStatus
              showRole
              className="bg-slate-800/50 border-slate-700"
            />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-300 hover:text-white hover:bg-slate-800/50"
              asChild
            >
              <Link href="/dashboard/settings">
                <Settings className="w-4 h-4" />
                {t("nav.settings")}
              </Link>
            </Button>
            <LogoutButton className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50" />
          </div>
        </div>
      </div>
    </>
  );
}
