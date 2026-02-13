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

interface ClassicHeaderProps {
      onMenuClick: () => void;
}

/**
 * Classic Header — Slim and contextual.
 *
 * Features:
 * - Minimal height — just enough for breadcrumbs + actions
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
                        "z-40 bg-background/80 backdrop-blur-md border-b border-border/50"
                  )}
            >
                  <div className="flex items-center justify-between px-6 h-14">
                        {/* Left — Menu + Search */}
                        <div className="flex items-center gap-3">
                              {settings.collapsibleSidebar && (
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="lg:hidden sidebar-trigger h-8 w-8 rounded-lg"
                                          onClick={onMenuClick}
                                    >
                                          <Menu className="w-4 h-4" />
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

                        {/* Right — Actions */}
                        <div className="flex items-center gap-2">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push("/")}
                                    className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground"
                                    title={t("nav.home") || "Home"}
                              >
                                    <Home className="w-4 h-4" />
                              </Button>
                              <LanguageSwitcher buttonClassName="h-8 w-8 rounded-lg" />
                              <ThemeSwitcher buttonClassName="h-8 w-8 rounded-lg" />
                              <UserProfileDropdown showName={false} />
                        </div>
                  </div>

                  {/* Breadcrumbs */}
                  {settings.showBreadcrumbs && (
                        <div className="px-6 pb-2 hidden md:block">
                              <PageBreadcrumbs segments={[]} />
                        </div>
                  )}
            </header>
      );
}
