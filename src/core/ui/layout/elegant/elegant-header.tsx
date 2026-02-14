"use client";

import { Menu, Home } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "@core/ui/layout/common";
import { useRouter } from "next/navigation";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { PageBreadcrumbs } from "@core/ui/page-breadcrumbs";

interface ElegantHeaderProps {
  onMenuClick: () => void;
}

/**
 * Elegant Header — Frosted glass top bar.
 *
 * Features:
 * - Translucent background with backdrop blur
 * - No hard border — uses shadow instead
 * - Premium typography and spacing
 */
export function ElegantHeader({ onMenuClick }: ElegantHeaderProps) {
  const { t } = useI18n();
  const settings = useSettings();
  const router = useRouter();

  return (
    <header
      className={cn(
        settings.stickyHeader ? "sticky top-0" : "relative",
        "z-40",
        "bg-background/60 backdrop-blur-xl",
        "border-b border-border/20",
        "shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
      )}
    >
      <div className="flex h-14 items-center justify-between px-6">
        {/* Left — Menu + Search */}
        <div className="flex items-center gap-3">
          {settings.collapsibleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="sidebar-trigger h-9 w-9 rounded-xl hover:bg-white/10 lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          <HeaderSearch
            containerClassName="hidden md:block"
            inputClassName={cn(
              "bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/30",
              "w-72 h-9 text-sm rounded-xl transition-all",
              "pl-9 rtl:pl-3 rtl:pr-9",
              "placeholder:text-muted-foreground/50"
            )}
            iconClassName="left-3 rtl:left-auto rtl:right-3 w-3.5 h-3.5 text-muted-foreground/40"
          />
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-8 w-8 rounded-xl text-muted-foreground/60 hover:bg-white/10 hover:text-foreground"
            title={t("nav.home") || "Home"}
          >
            <Home className="h-4 w-4" />
          </Button>
          <LanguageSwitcher buttonClassName="h-8 w-8 rounded-xl hover:bg-white/10" />
          <ThemeSwitcher buttonClassName="h-8 w-8 rounded-xl hover:bg-white/10" />
          <UserProfileDropdown showName={false} />
        </div>
      </div>

      {/* Breadcrumbs */}
      {settings.showBreadcrumbs && (
        <div className="hidden px-6 pb-2 md:block">
          <PageBreadcrumbs segments={[]} />
        </div>
      )}
    </header>
  );
}
