"use client";

import { Bell, Menu, Home } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "./common";
import { useRouter } from "next/navigation";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { PageBreadcrumbs } from "@core/ui/page-breadcrumbs";

interface HeaderProps {
  onMenuClick: () => void;
  isModern?: boolean;
}

export function Header({ onMenuClick, isModern = false }: HeaderProps) {
  const { t } = useI18n();
  const settings = useSettings();
  const router = useRouter();

  return (
    <header
      className={cn(
        settings.stickyHeader ? "sticky top-0" : "relative",
        "z-40 glass border-b border-border",
        isModern && "h-20 flex flex-col"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between px-6",
          isModern ? "py-6" : "py-4"
        )}
      >
        {/* Left side */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {settings.collapsibleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden hover-lift sidebar-trigger"
              onClick={onMenuClick}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}

          <HeaderSearch
            containerClassName="hidden md:block"
            inputClassName={cn(
              "bg-muted/50 border-0 focus:bg-background transition-colors",
              isModern ? "w-96 h-12" : "w-80",
              "pl-10 rtl:pl-4 rtl:pr-10"
            )}
            iconClassName="left-3 rtl:left-auto rtl:right-3"
          />
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
          {/* Home Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/")}
            className="hover-lift"
            title={t("nav.home") || "Home"}
          >
            <Home className="w-5 h-5" />
          </Button>
          <LanguageSwitcher buttonClassName="hover-lift" />
          <ThemeSwitcher buttonClassName="hover-lift" />
          {settings.showNotifications && (
            <Button variant="ghost" size="icon" className="hover-lift">
              <Bell className="w-5 h-5" />
            </Button>
          )}
          <UserProfileDropdown showName={false} />
        </div>
      </div>
      {settings.showBreadcrumbs && (
        <div className="px-6 pb-2 hidden md:block">
          <PageBreadcrumbs segments={[]} />
        </div>
      )}
    </header>
  );
}
