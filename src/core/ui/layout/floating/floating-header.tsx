"use client";

import { Menu, PanelLeft, Home } from "lucide-react";
import { Button } from "@core/ui/button";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { cn } from "@core/common/utils";
import { LanguageSwitcher, ThemeSwitcher, HeaderSearch } from "@core/ui/layout/common";
import { useRouter } from "next/navigation";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { PageBreadcrumbs } from "@core/ui/page-breadcrumbs";

interface FloatingHeaderProps {
      onMenuClick: () => void;
      sidebarOpen: boolean;
}

/**
 * Floating Header — Full-width with menu toggle.
 *
 * Since there's no persistent sidebar, the header is richer:
 * - Menu button always visible (toggles overlay sidebar)
 * - Centered search bar
 * - Breadcrumbs row below
 */
export function FloatingHeader({ onMenuClick, sidebarOpen }: FloatingHeaderProps) {
      const { t } = useI18n();
      const settings = useSettings();
      const router = useRouter();

      return (
            <header
                  className={cn(
                        settings.stickyHeader ? "sticky top-0" : "relative",
                        "z-40 bg-background/90 backdrop-blur-md border-b border-border/40"
                  )}
            >
                  <div className="flex items-center justify-between px-6 h-14">
                        {/* Left — Menu toggle + Search */}
                        <div className="flex items-center gap-3">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="sidebar-trigger h-9 w-9 rounded-lg hover:bg-muted"
                                    onClick={onMenuClick}
                                    title={sidebarOpen ? "Close menu" : "Open menu"}
                              >
                                    {sidebarOpen ? (
                                          <PanelLeft className="w-4.5 h-4.5" />
                                    ) : (
                                          <Menu className="w-4.5 h-4.5" />
                                    )}
                              </Button>

                              <HeaderSearch
                                    containerClassName="hidden md:block"
                                    inputClassName={cn(
                                          "bg-muted/40 border-0 focus:bg-background focus:ring-1 focus:ring-primary/20",
                                          "w-80 h-9 text-sm rounded-lg transition-all",
                                          "pl-9 rtl:pl-3 rtl:pr-9"
                                    )}
                                    iconClassName="left-3 rtl:left-auto rtl:right-3 w-4 h-4"
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
