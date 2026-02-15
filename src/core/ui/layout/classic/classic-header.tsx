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
import { NotificationBell } from "@core/ui/notification";

interface ClassicHeaderProps {
  onMenuClick: () => void;
}

/**
 * Classic Header â€” Slim and contextual.
 *
 * Features:
 * - Minimal height â€” just enough for breadcrumbs + actions
 * - Search bar left, user actions right
 * - Breadcrumbs below (conditional)
 * - Sticky when enabled in settings
 */
export function ClassicHeader({ onMenuClick }: ClassicHeaderProps) {
  const { t } = useI18n();
  const settings = useSettings();
  const router = useRouter();

  return (
    <header
      className={cn(
        settings.stickyHeader ? "sticky top-0" : "relative",
        "z-40 border-b border-border/50 bg-background/80 backdrop-blur-md"
      )}
    >
      <div className="flex h-14 items-center justify-between px-6">
        {/* Left â€” Menu + Search */}
        <div className="flex items-center gap-3">
          {settings.collapsibleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="sidebar-trigger h-8 w-8 rounded-lg lg:hidden"
              onClick={onMenuClick}
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}

          <HeaderSearch
            containerClassName="hidden md:block"
            inputClassName={cn(
              "bg-muted/40 border-0 focus:bg-background focus:ring-1 focus:ring-primary/20",
              "w-72 h-8 text-sm rounded-lg transition-all",
              "pl-9 rtl:pl-3 rtl:pr-9"
            )}
            iconClassName="left-3 rtl:left-auto rtl:right-3 w-3.5 h-3.5"
          />
        </div>

        {/* Right â€” Actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
            title={t("nav.home") || "Home"}
          >
            <Home className="h-4 w-4" />
          </Button>
          <LanguageSwitcher buttonClassName="h-8 w-8 rounded-lg" />
          <ThemeSwitcher buttonClassName="h-8 w-8 rounded-lg" />
          <NotificationBell iconClassName="h-4 w-4" />
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
