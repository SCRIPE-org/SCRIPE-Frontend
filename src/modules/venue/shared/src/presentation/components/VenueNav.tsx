/* eslint-disable unused-imports/no-unused-vars */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Settings,
  CircleDollarSign,
  ShieldAlert,
  GitFork,
  Plus,
  Receipt,
  CreditCard,
  Users,
  Building2,
  BarChart3,
  Search,
  Tag,
  MapPin,
  Sliders,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";

interface Props {
  attentionCount?: number;
  className?: string;
  /** When true, suppresses top-level category pills to avoid duplicating the sidebar */
  hidePrimaryBar?: boolean;
}

/**
 * Sovereign Venue module navigation bar implementing the 7 primary operator pillars.
 */
export function VenueNav({ attentionCount = 0, className = "", hidePrimaryBar = false }: Props) {
  const pathname = usePathname();
  const { t, language } = useI18n();
  const isRtl = language === "ar";

  const canViewAttention = usePermission(VENUE_PERMISSIONS.VENUE_ATTENTION_VIEW);
  const canViewReceivables = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW);
  const canViewPayments = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW);
  const canViewMoney = canViewReceivables || canViewPayments;
  const canViewCustomers = usePermission(VENUE_PERMISSIONS.CUSTOMER_PARTY_VIEW);
  const canViewFacilities = usePermission(VENUE_PERMISSIONS.FACILITY_VIEW);
  const canViewResources = usePermission(VENUE_PERMISSIONS.SCHEDULABLE_RESOURCE_VIEW);
  const canViewPricing = usePermission(VENUE_PERMISSIONS.CATALOG_PRICING_VIEW_COMMERCIALS);

  // Determine active primary category
  const isDashboard =
    pathname === "/venue" ||
    pathname.startsWith("/venue/attention") ||
    pathname.startsWith("/venue/reports");

  const isCalendar =
    pathname.startsWith("/venue/calendar") ||
    pathname.startsWith("/venue/bookings") ||
    pathname.startsWith("/venue/availability");

  const isResources =
    pathname.startsWith("/venue/resources") ||
    pathname.startsWith("/venue/resource-builder") ||
    pathname.startsWith("/venue/resource-profiles");

  const isCustomers = pathname.startsWith("/venue/customers");

  const isFacilities =
    pathname.startsWith("/venue/facilities") || pathname.startsWith("/venue/sites");

  const isMoney = pathname.startsWith("/venue/money") || pathname.startsWith("/venue/pricing");

  const isSettings =
    pathname.startsWith("/venue/settings") || pathname.startsWith("/venue/venue-setup");

  // 7 Primary Navigation Pillars
  const primaryItems = [
    {
      id: "overview",
      label: t("venueNav.overview", {
        defaultValue: t("venueNav.dashboard", { defaultValue: "Overview" }),
      }),
      href: "/venue",
      icon: LayoutDashboard,
      active: isDashboard,
    },
    {
      id: "calendar",
      label: t("venueNav.calendar", {
        defaultValue: t("venueNav.operations", { defaultValue: "Calendar" }),
      }),
      href: "/venue/calendar",
      icon: CalendarDays,
      active: isCalendar,
      badge: canViewAttention && attentionCount > 0 ? attentionCount : undefined,
    },
    {
      id: "resources",
      label: t("venueNav.resources", {
        defaultValue: t("venueNav.setup", { defaultValue: "Courts & Spaces" }),
      }),
      href: "/venue/resources",
      icon: GitFork,
      active: isResources,
    },
    ...(canViewCustomers
      ? [
          {
            id: "customers",
            label: t("venueNav.customers", { defaultValue: "Customers" }),
            href: "/venue/customers",
            icon: Users,
            active: isCustomers,
          },
        ]
      : []),
    ...(canViewFacilities
      ? [
          {
            id: "facilities",
            label: t("venueNav.facilities", { defaultValue: "Branches & Facilities" }),
            href: "/venue/facilities",
            icon: Building2,
            active: isFacilities,
          },
        ]
      : []),
    ...(canViewMoney
      ? [
          {
            id: "money",
            label: t("venueNav.money", { defaultValue: "Money" }),
            href:
              canViewReceivables && canViewPayments
                ? "/venue/money"
                : canViewReceivables
                  ? "/venue/money/receivables"
                  : "/venue/money/payments",
            icon: CircleDollarSign,
            active: isMoney,
          },
        ]
      : []),
    {
      id: "settings",
      label: t("venueNav.settings", { defaultValue: "Settings" }),
      href: "/venue/settings",
      icon: Settings,
      active: isSettings,
    },
  ];

  // Secondary items based on active primary context
  let secondaryLinks: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    active: boolean;
    badge?: number;
  }> = [];

  if (isDashboard) {
    secondaryLinks = [
      ...(canViewAttention
        ? [
            {
              href: "/venue/attention",
              label: t("venueNav.attention", { defaultValue: "Attention Queue" }),
              icon: ShieldAlert,
              active: pathname.startsWith("/venue/attention"),
              badge: attentionCount > 0 ? attentionCount : undefined,
            },
          ]
        : []),
      {
        href: "/venue/reports",
        label: t("venueNav.reports", { defaultValue: "Reports & Analytics" }),
        icon: BarChart3,
        active: pathname.startsWith("/venue/reports"),
      },
    ];
  } else if (isCalendar) {
    secondaryLinks = [
      {
        href: "/venue/calendar",
        label: t("venueNav.calendar", { defaultValue: "Calendar Grid" }),
        icon: CalendarDays,
        active: pathname === "/venue/calendar" && !pathname.includes("newBooking"),
      },
      {
        href: "/venue/calendar?newBooking=true",
        label: t("venueNav.newBooking", { defaultValue: "New Booking" }),
        icon: Plus,
        active: pathname.includes("newBooking") || pathname.startsWith("/venue/bookings/new"),
      },
      {
        href: "/venue/calendar?findSlot=true",
        label: t("venueNav.findSlot", { defaultValue: "Find Available Slot" }),
        icon: Search,
        active: false,
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
        label: t("venueNav.allResources", { defaultValue: "Courts & Spaces" }),
        icon: GitFork,
        active: pathname === "/venue/resources" || pathname.startsWith("/venue/resources/"),
      },
      {
        href: "/venue/resources?setup=new",
        label: t("venueNav.addCourt", { defaultValue: "+ Add Court / Space" }),
        icon: Plus,
        active: false,
      },
    ];
  } else if (isFacilities) {
    secondaryLinks = [
      {
        href: "/venue/facilities",
        label: t("venueNav.facilities", { defaultValue: "Facilities & Complexes" }),
        icon: Building2,
        active: pathname === "/venue/facilities",
      },
      {
        href: "/venue/facilities?tab=sites",
        label: t("venueNav.sites", { defaultValue: "Campuses & Branches" }),
        icon: MapPin,
        active: pathname.includes("tab=sites") || pathname.startsWith("/venue/sites"),
      },
    ];
  } else if (isMoney) {
    secondaryLinks = [
      ...(canViewReceivables && canViewPayments
        ? [
            {
              href: "/venue/money",
              label: t("venueNav.financialOverview", { defaultValue: "Financial Overview" }),
              icon: CircleDollarSign,
              active: pathname === "/venue/money",
            },
          ]
        : []),
      ...(canViewReceivables
        ? [
            {
              href: "/venue/money/receivables",
              label: t("venueNav.receivables", { defaultValue: "Invoices & Receivables" }),
              icon: Receipt,
              active: pathname.startsWith("/venue/money/receivables"),
            },
          ]
        : []),
      ...(canViewPayments
        ? [
            {
              href: "/venue/money/payments",
              label: t("venueNav.payments", { defaultValue: "Payment History" }),
              icon: CreditCard,
              active: pathname.startsWith("/venue/money/payments"),
            },
          ]
        : []),
      ...(canViewPricing
        ? [
            {
              href: "/venue/pricing",
              label: t("venueNav.pricing", { defaultValue: "Pricing & Rates" }),
              icon: Tag,
              active: pathname.startsWith("/venue/pricing"),
            },
          ]
        : []),
    ];
  } else if (isSettings) {
    secondaryLinks = [
      {
        href: "/venue/settings",
        label: t("venueNav.generalSettings", { defaultValue: "General Settings" }),
        icon: Settings,
        active: pathname === "/venue/settings" && !pathname.includes("tab=profile"),
      },
      {
        href: "/venue/settings?tab=profile",
        label: t("venueNav.venueProfile", { defaultValue: "Venue Profile" }),
        icon: Sliders,
        active: pathname.includes("tab=profile") || pathname.startsWith("/venue/venue-setup"),
      },
    ];
  }

  return (
    <div className={cn("mb-6 space-y-3", className)} dir={isRtl ? "rtl" : "ltr"}>
      {/* Primary Category Bar (suppressed when hidePrimaryBar=true to prevent duplication with sidebar) */}
      {!hidePrimaryBar && (
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
                  <span className="size-4.5 flex items-center justify-center rounded-full bg-warning text-[10px] font-bold leading-none text-nx-on-fill">
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
      )}

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
                  <span className="flex size-4 items-center justify-center rounded-full bg-warning text-[9px] font-bold text-nx-on-fill">
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
