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

interface CompactHeaderProps {
      onMenuClick: () => void;
}

/**
 * Compact Header — Ultra-slim, 40px height.
 *
 * Features:
 * - Only 40px tall — minimal chrome, maximum content
 * - Single-line breadcrumbs inline (no separate row)
 * - Small action buttons (h-7 w-7)
 * - No search bar in header (sidebar has its own density)
 */
export function CompactHeader({ onMenuClick }: CompactHeaderProps) {
      const { t } = useI18n();
      const settings = useSettings();
      const router = useRouter();

      return (
            <header
                  className={cn(
                        settings.stickyHeader ? "sticky top-0" : "relative",
                        "z-40 bg-background border-b border-border/40 h-10"
                  )}
            >
                  <div className="flex items-center justify-between px-4 h-full">
                        {/* Left — Menu + Breadcrumbs inline */}
                        <div className="flex items-center gap-2">
                              {settings.collapsibleSidebar && (
                                    <Button
                                          variant="ghost"
                                          size="icon"
                                          className="lg:hidden sidebar-trigger h-7 w-7 rounded"
                                          onClick={onMenuClick}
                                    >
                                          <Menu className="w-3.5 h-3.5" />
                                    </Button>
                              )}

                              {settings.showBreadcrumbs && (
                                    <div className="hidden md:block">
                                          <PageBreadcrumbs segments={[]} />
                                    </div>
                              )}
                        </div>

                        {/* Right — Compact actions */}
                        <div className="flex items-center gap-1">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.push("/")}
                                    className="h-7 w-7 rounded text-muted-foreground hover:text-foreground"
                                    title={t("nav.home") || "Home"}
                              >
                                    <Home className="w-3.5 h-3.5" />
                              </Button>
                              <LanguageSwitcher buttonClassName="h-7 w-7 rounded" />
                              <ThemeSwitcher buttonClassName="h-7 w-7 rounded" />
                              <UserProfileDropdown showName={false} />
                        </div>
                  </div>
            </header>
      );
}
