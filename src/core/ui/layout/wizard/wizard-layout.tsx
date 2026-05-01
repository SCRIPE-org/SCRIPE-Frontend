"use client";

import type React from "react";
import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Check, Menu, X } from "lucide-react";
import { useI18n } from "@core/providers/i18n-provider";
import { useSettings } from "@core/providers/settings-provider";
import { useLayoutStyles } from "@core/ui/layout/shared/use-layout-styles";
import { useDynamicNavigation } from "@core/ui/navigation/dynamic-navigation";
import { isNavigationItemActive, type NavigationItem } from "@core/config/navigation";
import { Logo } from "@core/ui/logo";
import { Button } from "@core/ui/button";
import { LanguageSwitcher, ThemeSwitcher } from "@core/ui/layout/common";
import { UserProfileDropdown } from "@core/ui/user-profile-dropdown";
import { Footer } from "@core/ui/layout/shared/footer";
import { NavRenderer } from "@core/ui/layout/shared/nav-renderer";
import { UserCard } from "@core/ui/layout/shared/user-card";
import { LogoutButton } from "@core/ui/layout/shared/logout-button";
import { cn } from "@core/common/utils";
import { NotificationBell } from "@core/ui/notification";
import { useBrandedAppName } from "@core/hooks/use-branded-app-name";

interface WizardLayoutProps {
  children: React.ReactNode;
}

/**
 * Wizard / Stepper Layout  Step-by-step navigation.
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
  const appName = useBrandedAppName();
  const settings = useSettings();
  const styles = useLayoutStyles();
  const pathname = usePathname();
  const router = useRouter();
  const navigation = useDynamicNavigation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Use top-level nav items as "steps"
  const steps = useMemo(() => {
    const items: {
      name: string;
      href: string;
      icon?: NavigationItem["icon"];
      isActive: boolean;
      isCompleted: boolean;
    }[] = [];
    let foundActive = false;
    for (const item of navigation) {
      const href = item.href || item.children?.[0]?.href || "#";
      const isActive = isNavigationItemActive(item, pathname, navigation);
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
      className={cn("flex min-h-screen flex-col bg-background", styles.getAnimationClass())}
      dir={direction}
    >
      {/*  Header  */}
      <header
        className={cn(
          settings.stickyHeader ? "sticky top-0 z-30" : "relative",
          "glass border-b border-border",
          "flex h-12 items-center justify-between px-4 lg:px-6"
        )}
      >
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
          <Logo size="sm" />
          <span className="hidden text-sm font-semibold text-foreground sm:block">{appName}</span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeSwitcher />
          <NotificationBell iconClassName="h-5 w-5" />
          <UserProfileDropdown showName={false} />
        </div>
      </header>

      {/*  Stepper  */}
      <div className="scrollbar-none overflow-x-auto border-b border-border bg-card/50 px-4 py-3 lg:px-6">
        <div className="mx-auto flex min-w-max max-w-4xl items-center gap-2">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.name} className="flex items-center gap-2">
                {i > 0 && (
                  <div
                    className={cn(
                      "h-px w-8 lg:w-12",
                      i <= activeStepIndex ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
                <button
                  onClick={() => router.push(step.href)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium transition-all",
                    step.isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : step.isCompleted
                        ? "bg-primary/10 text-primary"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {step.isCompleted ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full border-2 border-current text-[10px] font-bold">
                      {i + 1}
                    </span>
                  )}
                  <span className="hidden lg:inline">{t(step.name) || step.name}</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/*  Mobile Drawer  */}
      {mobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30 bg-black/30 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
          <aside
            dir={direction}
            className={cn(
              "fixed bottom-0 top-0 z-40 flex w-80 flex-col overflow-y-auto border-e border-border bg-card lg:hidden",
              direction === "rtl" ? "right-0" : "left-0"
            )}
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <Logo size="sm" />
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="border-b border-border p-3">
              <UserCard size="sm" />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <NavRenderer variant="default" onNavigate={() => setMobileMenuOpen(false)} />
            </div>
            <div className="border-t border-border p-3">
              <LogoutButton />
            </div>
          </aside>
        </>
      )}

      {/*  Content  */}
      <main className="flex-1 p-6">
        <div style={{ borderRadius: "var(--border-radius)" }}>{children}</div>
      </main>

      {settings.showFooter && <Footer />}
    </div>
  );
}
