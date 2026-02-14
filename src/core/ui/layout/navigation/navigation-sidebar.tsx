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
          "border-r border-slate-800 bg-slate-950",
          "transform transition-transform duration-300 ease-in-out lg:translate-x-0",
          direction === "rtl" ? "right-0" : "left-0",
          open ? "translate-x-0" : direction === "rtl" ? "translate-x-full" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo Section */}
          <div className="flex items-center gap-3 border-b border-slate-800 px-6 py-6">
            <Logo className="h-8 w-8" />
            <div className="min-w-0 flex-1">
              <h1 className="break-words text-lg font-semibold leading-tight text-white">
                {t("app.tagline")}
              </h1>
              <p className="text-sm text-slate-400">{t("nav.dashboard")}</p>
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
          <div className="space-y-3 border-t border-slate-800 p-4">
            <UserCard size="sm" showStatus showRole className="border-slate-700 bg-slate-800/50" />
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-slate-300 hover:bg-slate-800/50 hover:text-white"
              asChild
            >
              <Link href="/dashboard/settings">
                <Settings className="h-4 w-4" />
                {t("nav.settings")}
              </Link>
            </Button>
            <LogoutButton className="w-full justify-start text-slate-300 hover:bg-slate-800/50 hover:text-white" />
          </div>
        </div>
      </div>
    </>
  );
}
