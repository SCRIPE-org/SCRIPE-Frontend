"use client";

import { useState } from "react";
import { Menu, X, Home } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { Logo } from "@core/ui/logo";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive } from "@core/config/navigation";
import { MinimalDropdown } from "./minimal-dropdown";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { NotificationBell } from "@core/ui/notification";
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";

export function MinimalHeader() {
  const { t } = useI18n();
  const appName = useBrandedAppName();
  const settings = useSettings();
  const pathname = usePathname();
  const navigation = useDynamicNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0" : "relative",
          "z-40 border-b border-border/40 bg-background/90 backdrop-blur-xl"
        )}
      >
        <div className="flex h-14 items-center justify-between px-6">
          {/* Left  Logo + Nav */}
          <div className="flex items-center gap-6">
            {/* Logo */}
            <Link href="/" className="flex shrink-0 items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Logo size="sm" className="text-primary-foreground" />
              </div>
              <span className="hidden text-sm font-bold text-foreground sm:block">
                {appName}
              </span>
            </Link>

            {/* Desktop horizontal nav */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navigation.map((item) => {
                if (item.children && item.children.length > 0) {
                  return <MinimalDropdown key={item.name} item={item} />;
                }

                // Simple link (no children)
                const isActive = item.href ? isNavigationItemActive(item, pathname, navigation) : false;
                return (
                  <Link
                    key={item.name}
                    href={item.href || "#"}
                    className={cn(
                      "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/5 text-primary"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    {item.icon && <item.icon className="h-4 w-4" />}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right  Actions */}
          <div className="flex items-center gap-2">
            <HeaderSearch
              containerClassName="hidden md:block"
              inputClassName={cn(
                "bg-muted/40 border-0 focus:bg-background focus:ring-1 focus:ring-primary/20",
                "w-56 h-8 text-sm rounded-lg transition-all",
                "pl-8 rtl:pl-3 rtl:pr-8"
              )}
              iconClassName="left-2.5 rtl:left-auto rtl:right-2.5 w-3.5 h-3.5"
            />
            <LanguageSwitcher buttonClassName="h-8 w-8 rounded-lg" />
            <ThemeSwitcher buttonClassName="h-8 w-8 rounded-lg" />
            <NotificationBell iconClassName="h-5 w-5" />
            <UserProfileDropdown showName={false} />

            {/* Mobile hamburger */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile full-screen overlay menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background lg:hidden">
          <div className="flex h-14 items-center justify-between border-b border-border/40 px-6">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Logo size="sm" className="text-primary-foreground" />
              </div>
              <span className="text-sm font-bold">{appName}</span>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg"
              onClick={() => setMobileMenuOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="max-h-[calc(100vh-3.5rem)] overflow-y-auto p-4">
            <NavRenderer variant="default" onNavigate={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
