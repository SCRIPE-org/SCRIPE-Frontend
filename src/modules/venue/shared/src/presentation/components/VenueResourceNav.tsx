"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Layers, GitFork, MapPin, Clock, Sliders, ArrowLeft } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { Badge } from "@core/ui/badge";

/**
 * Documentation for module export
 */
export function VenueResourceNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const links = [
    {
      href: "/venue/venue-setup",
      label: t("venueProfile.title"),
      icon: Sliders,
      active: pathname === "/venue/venue-setup",
    },
    {
      href: "/venue/sites",
      label: t("site.title"),
      icon: MapPin,
      active: pathname === "/venue/sites",
    },
    {
      href: "/venue/facilities",
      label: t("facility.title"),
      icon: Building2,
      active: pathname === "/venue/facilities",
    },
    {
      href: "/venue/resource-builder",
      label: t("schedulableResource.title"),
      icon: GitFork,
      active: pathname === "/venue/resource-builder",
    },
    {
      href: "/venue/resource-profiles",
      label: t("resourceProfile.title"),
      icon: Layers,
      active: pathname === "/venue/resource-profiles",
    },
    {
      href: "/venue/availability",
      label: t("availability.title"),
      icon: Clock,
      active: pathname === "/venue/availability",
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
          <span>{t("venueSettings.resourceNav.backToSettings")}</span>
        </Link>
        <Badge
          variant="outline"
          className="bg-nx-raised text-[10px] font-semibold text-nx-ink-2"
        >
          {t("venueSettings.resourceNav.advancedConfiguration")}
        </Badge>
      </div>

      <nav
        aria-label={t("resourceProfile.nav.ariaLabel")}
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
