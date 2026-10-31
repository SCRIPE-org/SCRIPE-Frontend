"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, GitFork, Sliders, ArrowLeft } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";

/**
 * Navigation for resource and location settings.
 */
export function VenueResourceNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const links = [
    {
      href: "/venue/resources",
      label: t("resources.title", { defaultValue: "Courts & Spaces" }),
      icon: GitFork,
      active: pathname.startsWith("/venue/resources"),
    },
    {
      href: "/venue/facilities",
      label: t("facility.title", { defaultValue: "Branches & Facilities" }),
      icon: Building2,
      active: pathname.startsWith("/venue/facilities") || pathname.startsWith("/venue/sites"),
    },
    {
      href: "/venue/settings",
      label: t("venueSettings.title", { defaultValue: "Settings & Profile" }),
      icon: Sliders,
      active: pathname.startsWith("/venue/settings") || pathname.startsWith("/venue/venue-setup"),
    },
  ];

  return (
    <div className="mb-6 space-y-3">
      <div className="flex items-center justify-between gap-3 text-xs">
        <Link
          href="/venue/settings"
          className="group inline-flex items-center gap-1.5 font-medium text-nx-ink-2 transition-colors hover:text-nx-ink"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5 rtl:rotate-180" />
          <span>{t("venueSettings.resourceNav.backToSettings", { defaultValue: "Back to Settings" })}</span>
        </Link>
        <Badge
          variant="outline"
          className="bg-nx-raised text-[10px] font-semibold text-nx-ink-2"
        >
          {t("venueSettings.resourceNav.advancedConfiguration", { defaultValue: "Location & Space Setup" })}
        </Badge>
      </div>

      <nav
        aria-label="Location and resource navigation"
        className="flex items-center gap-1 overflow-x-auto border-b border-nx-line pb-3"
      >
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={link.active ? "page" : undefined}
              className={cn(
                "inline-flex shrink-0 items-center gap-2 rounded-nx-sm px-3 py-1.5 text-xs font-medium transition-colors",
                link.active
                  ? "bg-nx-surface text-nx-ink shadow-[inset_0_0_0_1px_var(--nx-line-hi)]"
                  : "bg-nx-surface/0 hover:bg-nx-surface/50 text-nx-ink-2 hover:text-nx-ink"
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
