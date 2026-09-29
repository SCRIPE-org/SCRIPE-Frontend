"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Layers, GitFork, MapPin, Clock, Sliders } from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";

export function VenueResourceNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const links = [
    {
      href: "/venue/venue-setup",
      label: t("venueProfile.title") || "Venue Setup",
      icon: Sliders,
      active: pathname === "/venue/venue-setup",
    },
    {
      href: "/venue/sites",
      label: t("site.title") || "Sites & Campuses",
      icon: MapPin,
      active: pathname === "/venue/sites",
    },
    {
      href: "/venue/facilities",
      label: t("facility.title") || "Facilities",
      icon: Building2,
      active: pathname === "/venue/facilities",
    },
    {
      href: "/venue/resource-builder",
      label: t("schedulableResource.title") || "Resource Builder",
      icon: GitFork,
      active: pathname === "/venue/resource-builder",
    },
    {
      href: "/venue/resource-profiles",
      label: t("resourceProfile.title") || "Resource Profiles",
      icon: Layers,
      active: pathname === "/venue/resource-profiles",
    },
    {
      href: "/venue/availability",
      label: t("availability.title") || "Operating Hours",
      icon: Clock,
      active: pathname === "/venue/availability",
    },
  ];

  return (
    <nav
      aria-label="Resource configuration"
      className="flex items-center gap-1 border-b border-nx-line pb-3 mb-6"
    >
      {links.map((link) => {
        const Icon = link.icon;
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={link.active ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-nx-sm text-xs font-medium transition-colors",
              link.active
                ? "bg-nx-surface text-nx-ink shadow-[inset_0_0_0_1px_var(--nx-line-hi)]"
                : "text-nx-ink-2 hover:text-nx-ink hover:bg-nx-surface/50"
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
