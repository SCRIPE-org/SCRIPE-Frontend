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

interface ModernHeaderProps {
  onMenuClick: () => void;
}

/**
 * Modern Header — Slim, aware of rail width.
 *
 * Similar to compact header but designed to sit beside the icon rail.
 * No sidebar toggle on desktop (the rail is always visible).
 */
export function ModernHeader({ onMenuClick }: ModernHeaderProps) {
  const { t } = useI18n();
  const settings = useSettings();
  const router = useRouter();

  return (
    <header
      className={cn(
        settings.stickyHeader ? "sticky top-0" : "relative",
        "z-40 border-b border-border/40 bg-background/90 backdrop-blur-md"
      )}
    >
      <div className="flex h-12 items-center justify-between px-5">
        {/* Left — Mobile menu + breadcrumbs */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="sidebar-trigger h-8 w-8 rounded-lg lg:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-4 w-4" />
          </Button>

          {settings.showBreadcrumbs && (
            <div className="hidden md:block">
              <PageBreadcrumbs segments={[]} />
            </div>
          )}
        </div>

        {/* Center — Search (wider since we have space) */}
        <HeaderSearch
          containerClassName="hidden md:block"
          inputClassName={cn(
            "bg-muted/40 border-0 focus:bg-background focus:ring-1 focus:ring-primary/20",
            "w-80 h-8 text-sm rounded-lg transition-all",
            "pl-9 rtl:pl-3 rtl:pr-9"
          )}
          iconClassName="left-3 rtl:left-auto rtl:right-3 w-3.5 h-3.5"
        />

        {/* Right — Actions */}
        <div className="flex items-center gap-1.5">
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
          <UserProfileDropdown showName={false} />
        </div>
      </div>
    </header>
  );
}
