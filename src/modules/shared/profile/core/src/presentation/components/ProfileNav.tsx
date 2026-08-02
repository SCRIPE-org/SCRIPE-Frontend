"use client";

/**
 * ProfileNav — Section switcher for the profile settings page
 *
 * Renders as `TabsTrigger`s so it rides the `Tabs` root's own state/keyboard/
 * ARIA handling instead of re-implementing tab semantics — it must be
 * mounted inside the same `<Tabs>` tree as the page's `TabsContent` panels.
 * One vertical list for desktop (a real sidebar), one horizontal scroller
 * for mobile — same triggers, same state, two layouts.
 */
import { useI18n } from "@core/providers/i18n-provider";
import { TabsList, TabsTrigger } from "@core/ui/tabs";
import { Badge } from "@core/ui/badge";
import { cn } from "@core/common/utils";
import { User, Shield, Monitor, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";

const navItems: Array<{ value: string; icon: LucideIcon; labelKey: string }> = [
  { value: "general", icon: User, labelKey: "profile.nav.general" },
  { value: "security", icon: Shield, labelKey: "profile.nav.security" },
  { value: "sessions", icon: Monitor, labelKey: "profile.nav.sessions" },
  { value: "activity", icon: Activity, labelKey: "profile.nav.activity" },
];

interface ProfileNavProps {
  /** Show an attention dot on the Security item — a real signal (2FA off,
   *  password expiring), never decoration. */
  securityNeedsAttention?: boolean;
  /** Active session count, shown as a quiet badge on the Sessions item. */
  sessionsCount?: number;
  className?: string;
}

/**
 * Presentation UI component rendering the profile nav.
 * Arranges layout boundaries and accessibility targets (WCAG, tab index) using the core design library (@core/ui/*).
 */
export function ProfileNav({ securityNeedsAttention, sessionsCount, className }: ProfileNavProps) {
  const { t } = useI18n();

  const renderBadge = (value: string) => {
    if (value === "security" && securityNeedsAttention) {
      return (
        <span
          className="ms-auto h-1.5 w-1.5 shrink-0 rounded-full bg-warning"
          aria-label={t("profile.nav.needsAttention")}
        />
      );
    }
    if (value === "sessions" && typeof sessionsCount === "number" && sessionsCount > 0) {
      return (
        <Badge variant="secondary" className="ms-auto px-1.5 py-0 text-[10px]">
          {sessionsCount}
        </Badge>
      );
    }
    return null;
  };

  return (
    <>
      {/* Desktop vertical sidebar */}
      <TabsList
        variant="pill"
        className={cn(
          "hidden h-auto w-full flex-col items-stretch gap-1 bg-transparent p-0 md:flex",
          className
        )}
      >
        {navItems.map((item) => (
          <TabsTrigger
            key={item.value}
            variant="pill"
            value={item.value}
            className="h-auto w-full justify-start gap-3 rounded-nx-control px-3 py-2.5 text-sm font-medium"
          >
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{t(item.labelKey)}</span>
            {renderBadge(item.value)}
          </TabsTrigger>
        ))}
      </TabsList>

      {/* Mobile horizontal scroller */}
      <TabsList
        variant="pill"
        className={cn(
          "flex w-full items-center gap-1 overflow-x-auto bg-nx-raised p-1 md:hidden",
          className
        )}
      >
        {navItems.map((item) => (
          <TabsTrigger
            key={item.value}
            variant="pill"
            value={item.value}
            className="h-auto shrink-0 gap-1.5 whitespace-nowrap px-3 py-2 text-xs font-medium"
          >
            <item.icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{t(item.labelKey)}</span>
            {item.value === "security" && securityNeedsAttention && (
              <span
                className="h-1.5 w-1.5 shrink-0 rounded-full bg-warning"
                aria-label={t("profile.nav.needsAttention")}
              />
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </>
  );
}
