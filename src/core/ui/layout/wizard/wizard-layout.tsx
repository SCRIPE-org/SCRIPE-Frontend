"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Menu, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import {
      isNavigationItemActive,
      type NavigationItem,
} from "@core/config/navigation";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";

interface WizardLayoutProps {
      children: React.ReactNode;
}

/**
 * Wizard / Stepper Layout — Step-by-step navigation.
 *
 * Structure:
 * - Header with logo + actions
 * - Horizontal stepper showing top-level nav groups as steps
 * - Content area below stepper
 * - Mobile: stepper becomes compact numbered circles
 *
 * Inspired by checkout flows, onboarding, multi-step forms
 */
export function WizardLayout({ children }: WizardLayoutProps) {
      const { direction, t } = useI18n();
      const settings = useSettings();
      const styles = useLayoutStyles();
      const pathname = usePathname();
      const router = useRouter();
      const navigation = useDynamicNavigation();
      const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

      // Use top-level nav items as "steps"
      const steps = useMemo(() => {
            const items: { name: string; href: string; icon?: NavigationItem["icon"]; isActive: boolean; isCompleted: boolean }[] = [];
            let foundActive = false;
            for (const item of navigation) {
                  const href = item.href || (item.children?.[0]?.href) || "#";
                  const isActive = isNavigationItemActive(item, pathname);
                  if (isActive) foundActive = true;
                  items.push({
                        name: item.name,
                        href,
                        icon: item.icon,
                        isActive,
                        isCompleted: !foundActive && !isActive,
                  });
            }
            return items;
      }, [navigation, pathname]);

      const activeStepIndex = steps.findIndex((s) => s.isActive);

      return (
            <div
                  className={cn(
                        "min-h-screen flex flex-col bg-background",
                        styles.getAnimationClass(),
                  )}
                  dir={direction}
            >
                  {/* ── Header ── */}
                  <header
                        className={cn(
                              settings.stickyHeader ? "sticky top-0 z-30" : "relative",
                              "glass border-b border-border",
                              "flex items-center justify-between px-4 lg:px-6 h-12",
                        )}
                  >
                        <div className="flex items-center gap-3">
                              <Button
                                    variant="ghost"
                                    size="icon"
                                    className="lg:hidden h-8 w-8"
                                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                              >
                                    {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
                              </Button>
                              <Logo size="sm" />
                              <span className="text-sm font-semibold text-foreground hidden sm:block">
                                    {t("app.title")}
                              </span>
                        </div>
                        <div className="flex items-center gap-2">
                              <LanguageSwitcher />
                              <ThemeSwitcher />
                              <UserProfileDropdown showName={false} />
                        </div>
                  </header>

                  {/* ── Stepper ── */}
                  <div className="border-b border-border bg-card/50 px-4 lg:px-6 py-3 overflow-x-auto scrollbar-none">
                        <div className="flex items-center gap-2 min-w-max mx-auto max-w-4xl">
                              {steps.map((step, i) => {
                                    const Icon = step.icon;
                                    return (
                                          <div key={step.name} className="flex items-center gap-2">
                                                {i > 0 && (
                                                      <div
                                                            className={cn(
                                                                  "w-8 lg:w-12 h-px",
                                                                  i <= activeStepIndex
                                                                        ? "bg-primary"
                                                                        : "bg-border",
                                                            )}
                                                      />
                                                )}
                                                <button
                                                      onClick={() => router.push(step.href)}
                                                      className={cn(
                                                            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0",
                                                            step.isActive
                                                                  ? "bg-primary text-primary-foreground shadow-sm"
                                                                  : step.isCompleted
                                                                        ? "bg-primary/10 text-primary"
                                                                        : "bg-muted text-muted-foreground hover:bg-muted/80",
                                                      )}
                                                >
                                                      {step.isCompleted ? (
                                                            <Check className="w-3.5 h-3.5" />
                                                      ) : (
                                                            <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">
                                                                  {i + 1}
                                                            </span>
                                                      )}
                                                      <span className="hidden lg:inline">
                                                            {t(step.name) || step.name}
                                                      </span>
                                                </button>
                                          </div>
                                    );
                              })}
                        </div>
                  </div>

                  {/* ── Mobile Drawer ── */}
                  {mobileMenuOpen && (
                        <>
                              <div className="fixed inset-0 z-30 bg-black/30 lg:hidden" onClick={() => setMobileMenuOpen(false)} />
                              <aside
                                    dir={direction}
                                    className={cn(
                                          "fixed top-0 bottom-0 w-80 z-40 bg-card border-e border-border overflow-y-auto flex flex-col lg:hidden",
                                          direction === "rtl" ? "right-0" : "left-0",
                                    )}
                              >
                                    <div className="flex items-center justify-between p-4 border-b border-border">
                                          <Logo size="sm" />
                                          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                                                <X className="w-4 h-4" />
                                          </Button>
                                    </div>
                                    <div className="p-3 border-b border-border"><UserCard size="sm" /></div>
                                    <div className="flex-1 p-3 overflow-y-auto">
                                          <NavRenderer variant="default" onNavigate={() => setMobileMenuOpen(false)} />
                                    </div>
                                    <div className="p-3 border-t border-border"><LogoutButton /></div>
                              </aside>
                        </>
                  )}

                  {/* ── Content ── */}
                  <main className="flex-1 p-6">
                        <div style={{ borderRadius: "var(--border-radius)" }}>
                              {children}
                        </div>
                  </main>

                  {settings.showFooter && <Footer />}
            </div>
      );
}
