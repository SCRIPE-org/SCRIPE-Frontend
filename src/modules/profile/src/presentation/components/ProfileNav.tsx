"use client";

/**
 * ProfileNav — Sidebar navigation for profile pages
 *
 * GitHub Settings-style sidebar with active state indicator.
 */
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@core/providers/i18n-provider";
import { cn } from "@core/common/utils";
import {
      User,
      Shield,
      Monitor,
      Activity,
} from "lucide-react";

const navItems = [
      { href: "/profile", icon: User, labelKey: "profile.nav.general" },
      { href: "/profile/security", icon: Shield, labelKey: "profile.nav.security" },
      { href: "/profile/sessions", icon: Monitor, labelKey: "profile.nav.sessions" },
      { href: "/profile/activity", icon: Activity, labelKey: "profile.nav.activity" },
];

export function ProfileNav() {
      const pathname = usePathname();
      const { t } = useI18n();

      const isActive = (href: string) => {
            if (href === "/profile") return pathname === "/profile";
            return pathname.startsWith(href);
      };

      return (
            <>
                  {/* Desktop sidebar nav */}
                  <nav className="hidden md:flex flex-col gap-1">
                        {navItems.map((item) => {
                              const active = isActive(item.href);
                              return (
                                    <Link
                                          key={item.href}
                                          href={item.href}
                                          className={cn(
                                                "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                                                active
                                                      ? "bg-primary/10 text-primary border-l-2 border-primary rtl:border-l-0 rtl:border-r-2"
                                                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                          )}
                                    >
                                          <item.icon className="h-4 w-4 flex-shrink-0" />
                                          <span>{t(item.labelKey)}</span>
                                    </Link>
                              );
                        })}
                  </nav>

                  {/* Mobile horizontal tabs */}
                  <nav className="md:hidden flex gap-1 overflow-x-auto pb-2 border-b border-border/40">
                        {navItems.map((item) => {
                              const active = isActive(item.href);
                              return (
                                    <Link
                                          key={item.href}
                                          href={item.href}
                                          className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                                                active
                                                      ? "bg-primary/10 text-primary"
                                                      : "text-muted-foreground hover:bg-accent/50"
                                          )}
                                    >
                                          <item.icon className="h-3.5 w-3.5" />
                                          <span>{t(item.labelKey)}</span>
                                    </Link>
                              );
                        })}
                  </nav>
            </>
      );
}
