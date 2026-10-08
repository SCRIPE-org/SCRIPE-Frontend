/* eslint-disable unused-imports/no-unused-vars */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Sliders,
  CircleDollarSign,
  ShieldAlert,
  GitFork,
  Plus,
  Receipt,
  CreditCard,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";

interface Props {
  attentionCount?: number;
  className?: string;
}

/**
 * Documentation for module export
 */
export function VenueNav({ attentionCount = 0, className = "" }: Props) {
  const pathname = usePathname();
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const canViewAttention = usePermission(VENUE_PERMISSIONS.VENUE_ATTENTION_VIEW);
  const canViewPricing = usePermission(VENUE_PERMISSIONS.CATALOG_PRICING_VIEW_COMMERCIALS);
  const canViewReceivables = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW);
  const canViewPayments = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW);
  const canViewMoney = canViewReceivables || canViewPayments;

  // Determine active primary category
  const isDashboard = pathname === "/venue";
  const isCalendar =
    pathname.startsWith("/venue/calendar") || pathname.startsWith("/venue/bookings");
  const isResources =
    pathname.startsWith("/venue/resources") ||
    pathname.startsWith("/venue/facilities") ||
    pathname.startsWith("/venue/resource-builder") ||
    pathname.startsWith("/venue/resource-profiles") ||
    pathname.startsWith("/venue/sites") ||
    pathname.startsWith("/venue/venue-setup") ||
    pathname.startsWith("/venue/availability") ||
    pathname.startsWith("/venue/pricing");
  const isMoney = pathname.startsWith("/venue/money");
  const isAttention = pathname.startsWith("/venue/attention");

  const primaryItems = [
    {
      id: "overview",
      label: t("venueNav.dashboard", {
        defaultValue: t("venueNav.overview", { defaultValue: "Dashboard" }),
      }),
      href: "/venue",
      icon: LayoutDashboard,
      active: isDashboard,
    },
    {
      id: "operations",
      label: t("venueNav.calendar", {
        defaultValue: t("venueNav.operations", { defaultValue: "Calendar" }),
      }),
      href: "/venue/calendar",
      icon: CalendarDays,
      active: isCalendar,
      badge: canViewAttention && attentionCount > 0 ? attentionCount : undefined,
    },
    {
      id: "setup",
      label: t("venueNav.resources", {
        defaultValue: t("venueNav.setup", { defaultValue: "Resources" }),
      }),
      href: "/venue/resources",
      icon: GitFork,
      active: isResources,
    },
    ...(canViewMoney
      ? [
          {
            id: "money",
            label: t("venueNav.money", { defaultValue: "Money" }),
            href: canViewReceivables ? "/venue/money/receivables" : "/venue/money/payments",
            icon: CircleDollarSign,
            active: isMoney,
          },
        ]
      : []),
  ];

  // Secondary items based on active primary context
  let secondaryLinks: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    active: boolean;
    badge?: number;
  }> = [];

  if (isCalendar) {
    secondaryLinks = [
      {
        href: "/venue/calendar",
        label: t("venueNav.calendar", { defaultValue: "Calendar" }),
        icon: CalendarDays,
        active: pathname === "/venue/calendar",
      },
      {
        href: "/venue/bookings/new",
        label: t("venueNav.newBooking", { defaultValue: "New Booking" }),
        icon: Plus,
        active: pathname.startsWith("/venue/bookings/new"),
      },
      ...(canViewAttention && attentionCount > 0
        ? [
            {
              href: "/venue/attention",
              label: t("venueNav.attention", { defaultValue: "Attention" }),
              icon: ShieldAlert,
              active: pathname.startsWith("/venue/attention"),
              badge: attentionCount,
            },
          ]
        : []),
    ];
  } else if (isResources) {
    secondaryLinks = [
      {
        href: "/venue/resources",
        label: t("venueNav.allResources", { defaultValue: "Courts & Fields" }),
        icon: GitFork,
        active: pathname === "/venue/resources" || pathname.startsWith("/venue/resources/"),
      },
      {
        href: "/venue/resources?setup=new",
        label: t("venueNav.addCourt", { defaultValue: "+ Add Court / Field" }),
        icon: Plus,
        active: false,
      },
      {
        href: "/venue/facilities",
        label: t("venueNav.advancedSetup", { defaultValue: "Advanced Setup" }),
        icon: Sliders,
        active:
          pathname.startsWith("/venue/facilities") ||
          pathname.startsWith("/venue/resource-builder") ||
          pathname.startsWith("/venue/resource-profiles") ||
          pathname.startsWith("/venue/sites") ||
          pathname.startsWith("/venue/availability") ||
          pathname.startsWith("/venue/pricing"),
      },
    ];
  } else if (isMoney) {
    secondaryLinks = [
      ...(canViewReceivables
        ? [
            {
              href: "/venue/money/receivables",
              label: t("venueNav.receivables", { defaultValue: "Receivables" }),
              icon: Receipt,
              active: pathname.startsWith("/venue/money/receivables"),
            },
          ]
        : []),
      ...(canViewPayments
        ? [
            {
              href: "/venue/money/payments",
              label: t("venueNav.payments", { defaultValue: "Payments" }),
              icon: CreditCard,
              active: pathname.startsWith("/venue/money/payments"),
            },
          ]
        : []),
    ];
  } else if (isAttention) {
    secondaryLinks = [
      {
        href: "/venue/attention",
        label: t("venueNav.attention", { defaultValue: "Attention" }),
        icon: ShieldAlert,
        active: true,
        badge: attentionCount > 0 ? attentionCount : undefined,
      },
    ];
  }

  return (
    <div className={cn("mb-6 space-y-3", className)} dir={isRtl ? "rtl" : "ltr"}>
      {/* Primary Category Bar */}
      <nav
        aria-label="Venue primary navigation"
        className="no-scrollbar flex items-center gap-1.5 overflow-x-auto border-b border-nx-line pb-2"
      >
        {primaryItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={item.active ? "page" : undefined}
              className={cn(
                "relative inline-flex shrink-0 select-none items-center gap-2 rounded-nx-md px-3.5 py-2 text-xs font-semibold transition-all duration-nx-micro",
                item.active
                  ? "border-nx-line/80 border bg-nx-surface font-bold text-nx-ink shadow-nx-sm"
                  : "hover:bg-nx-surface/60 text-nx-ink-2 hover:text-nx-ink"
              )}
            >
              <Icon
                className={cn("size-4", item.active ? "text-nx-accent" : "text-nx-ink-3")}
                aria-hidden="true"
              />
              <span>{item.label}</span>
              {item.badge != null && (
                <span className="size-4.5 flex items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold leading-none text-white">
                  {item.badge}
                </span>
              )}
              {item.active && (
                <span
                  className="absolute inset-x-3 bottom-[-9px] h-0.5 rounded-full bg-nx-accent"
                  aria-hidden="true"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Contextual Secondary Bar */}
      {secondaryLinks.length > 0 && (
        <div
          role="navigation"
          aria-label="Contextual navigation"
          className="no-scrollbar flex items-center gap-1.5 overflow-x-auto py-1"
        >
          {secondaryLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={link.active ? "page" : undefined}
                className={cn(
                  "inline-flex shrink-0 items-center gap-1.5 rounded-nx-sm px-2.5 py-1 text-xs font-medium transition-colors",
                  link.active
                    ? "bg-nx-surfaceSubtle border border-nx-line font-semibold text-nx-ink"
                    : "hover:bg-nx-surfaceSubtle/50 text-nx-ink-2 hover:text-nx-ink"
                )}
              >
                <Icon className="size-3.5 text-nx-ink-3" aria-hidden="true" />
                <span>{link.label}</span>
                {link.badge != null && (
                  <span className="flex size-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-white">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
