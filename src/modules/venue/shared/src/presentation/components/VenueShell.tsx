"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Grid2X2,
  CircleDollarSign,
  Users,
  ShieldCheck,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Building2,
  Check,
  LogOut,
  User as UserIcon,
  Sun,
  Moon,
  Laptop,
} from "lucide-react";
import { cn } from "@core/common/utils";
import { useI18n } from "@core/providers/i18n-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useTheme } from "next-themes";
import { useAuthLogout } from "@modules/auth/core/src/presentation/viewmodels/useAuthLogout";
import { useTenantContext } from "@core/providers/tenant-context-provider";
import { NotificationBell } from "@core/ui/notification/NotificationBell";
import { NxThemeSwitcher } from "@core/ui/layout/common";
import { usePermission } from "@core/hooks/use-permission";
import { VENUE_PERMISSIONS } from "@modules/venue/permission-constants";
import { Avatar, AvatarFallback, AvatarImage } from "@core/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@core/ui/dropdown-menu";
import { getVenueContainer } from "@modules/venue/di";
import type { Facility } from "@modules/venue/facility/src/domain/entities/Facility";
import { getSavedFacilityId, saveFacilityId } from "../utils/venueFacilityPersistence";

interface VenueShellProps {
  children: React.ReactNode;
}

export function VenueShell({ children }: VenueShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { language, setLanguage, direction, t } = useI18n();
  const isRtl = direction === "rtl";
  const user = useAppStore((s) => s.user);
  const { currentTenant } = useTenantContext();
  const { theme, setTheme } = useTheme();
  const { logout } = useAuthLogout();

  // ── Permissions (Backend Authoritative) ─────────────────────────────────
  const canViewReceivables = usePermission(VENUE_PERMISSIONS.FINANCE_RECEIVABLES_VIEW);
  const canViewPayments = usePermission(VENUE_PERMISSIONS.FINANCE_PAYMENTS_VIEW);
  const canViewMoney = canViewReceivables || canViewPayments;

  const canViewTeam = usePermission(VENUE_PERMISSIONS.TEAM_VIEW);
  const canViewCustomers = usePermission(VENUE_PERMISSIONS.CUSTOMER_PARTY_VIEW);
  const canViewSettings = usePermission(VENUE_PERMISSIONS.FACILITY_VIEW);

  // ── Venue Management Mode: "solo" (Just me) vs "team" (Me and my team) ───
  const [managementMode, setManagementMode] = useState<"solo" | "team">(() => {
    if (typeof window !== "undefined") {
      const mode = localStorage.getItem("scripe_venue_management_mode");
      if (mode === "team" || mode === "solo") {
        return mode;
      }
    }
    return "solo";
  });

  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== "undefined") {
        const mode = localStorage.getItem("scripe_venue_management_mode");
        if (mode === "team" || mode === "solo") {
          setManagementMode(mode);
        }
      }
    };
    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("venue-management-mode-changed", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("venue-management-mode-changed", handleStorageChange);
    };
  }, []);

  // ── Branch / Facility Selector ──────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  useEffect(() => {
    let mounted = true;
    try {
      const container = getVenueContainer();
      if (container.facilityRepository?.getAll) {
        container.facilityRepository
          .getAll({ page: 1, pageSize: 20 })
          .then((res) => {
            if (mounted && res?.items?.length) {
              setFacilities(res.items);
              const validId = getSavedFacilityId(res.items, user?.tenantId);
              const match = res.items.find((f) => f.id === validId) ?? res.items[0];
              setSelectedFacility(match);
            }
          })
          .catch(() => {});
      }
    } catch {
      // Graceful fallback
    }
    return () => {
      mounted = false;
    };
  }, [user?.tenantId]);

  const handleSelectFacility = useCallback((fac: Facility) => {
    setSelectedFacility(fac);
    if (typeof window !== "undefined") {
      saveFacilityId(fac.id, user?.tenantId);
      window.dispatchEvent(
        new CustomEvent("venue-facility-changed", {
          detail: { facilityId: fac.id, facilityName: fac.name },
        })
      );
    }
  }, [user?.tenantId]);

  // ── Primary 5 items (Phase 2 Dominant Client Mental Model) ───────────────
  const isDashboardActive = pathname === "/venue";
  const isCalendarActive =
    pathname.startsWith("/venue/calendar") || pathname.startsWith("/venue/bookings");
  const isCourtsActive =
    pathname === "/venue/resources" || pathname.startsWith("/venue/resources/");
  const isMoneyActive = pathname.startsWith("/venue/money");
  const isReportsActive = pathname.startsWith("/venue/reports");

  const moneyHref =
    canViewReceivables && canViewPayments
      ? "/venue/money"
      : canViewReceivables
      ? "/venue/money/receivables"
      : "/venue/money/payments";

  const primaryNavItems = [
    {
      id: "dashboard",
      label: t("venueNav.dashboard", { defaultValue: "Dashboard" }),
      href: "/venue",
      icon: LayoutDashboard,
      active: isDashboardActive,
    },
    {
      id: "calendar",
      label: t("venueNav.calendar", { defaultValue: "Calendar" }),
      href: "/venue/calendar",
      icon: CalendarDays,
      active: isCalendarActive,
    },
    {
      id: "courts",
      label: t("venueNav.resources", { defaultValue: "Courts & Spaces" }),
      href: "/venue/resources",
      icon: Grid2X2,
      active: isCourtsActive,
    },
    ...(canViewMoney
      ? [
          {
            id: "money",
            label: t("venueNav.money", { defaultValue: "Money" }),
            href: moneyHref,
            icon: CircleDollarSign,
            active: isMoneyActive,
          },
        ]
      : []),
    ...(canViewMoney
      ? [
          {
            id: "reports",
            label: t("venueNav.reports"),
            href: "/venue/reports",
            icon: BarChart3,
            active: isReportsActive,
          },
        ]
      : []),
  ];

  // ── Secondary Lower Navigation (Visually Secondary, Context-Gated) ───────
  const secondaryNavItems = [
    ...(canViewCustomers
      ? [
          {
            id: "customers",
            label: t("venueNav.customers"),
            href: "/venue/customers",
            icon: Users,
            active: pathname.startsWith("/venue/customers"),
          },
        ]
      : []),
    // Team: Only shown when venue is "Me and my team" AND user has backend permission
    ...(canViewTeam && managementMode === "team"
      ? [
          {
            id: "team",
            label: t("venueNav.team"),
            href: "/admins",
            icon: ShieldCheck,
            active: pathname.startsWith("/admins"),
          },
        ]
      : []),
  ];

  // Settings is anchored at bottom of sidebar (Client-Safe Entry)
  const settingsItem = canViewSettings
    ? {
        id: "settings",
        label: t("venueNav.settings"),
        href: "/venue/settings",
        icon: Settings,
        active:
          pathname.startsWith("/venue/settings") ||
          pathname.startsWith("/venue/facilities") ||
          pathname.startsWith("/venue/venue-setup") ||
          pathname.startsWith("/venue/sites") ||
          pathname.startsWith("/venue/resource-profiles") ||
          pathname.startsWith("/venue/resource-builder") ||
          pathname.startsWith("/venue/availability") ||
          pathname.startsWith("/venue/pricing"),
      }
    : null;

  const userInitial =
    (user?.firstName?.charAt(0) || user?.username?.charAt(0) || "M").toUpperCase();

  const formattedDate = new Intl.DateTimeFormat(language === "ar" ? "ar-EG" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const branchName = selectedFacility?.name || t("venueNav.noFacilitySelected");

  const renderSidebar = () => (
    <div className="flex h-full w-[240px] flex-col justify-between bg-nx-surface text-nx-ink select-none border-e border-nx-line">
      {/* Top Brand & Branch Selector */}
      <div className="p-4 space-y-4">
        {/* SCRIPE Logo */}
        <Link href="/venue" className="flex items-center gap-3 px-1 py-1 group">
          <div className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-nx-accent shadow-md shadow-nx-accent/20">
            <span className="font-black text-nx-accent-contrast text-base tracking-tighter">S</span>
          </div>
          <span className="font-extrabold tracking-wider text-nx-ink text-lg">SCRIPE</span>
        </Link>

        {/* Branch / Venue Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex w-full items-center justify-between gap-2 rounded-lg bg-[#1E293B]/70 hover:bg-[#1E293B] border border-[#334155]/60 px-3 py-2 text-xs font-semibold text-slate-200 transition-colors"
              aria-label={t("venueNav.selectFacility")}
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="size-3.5 text-blue-400 shrink-0" aria-hidden="true" />
                <span className="truncate">{branchName}</span>
              </div>
              <ChevronDown className="size-3.5 text-slate-400 shrink-0" aria-hidden="true" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-52 bg-[#0F172A] border-[#334155] text-slate-200">
            <DropdownMenuLabel className="text-[11px] font-medium text-slate-400">
              {t("venueNav.branchesAndVenues")}
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-[#1E293B]" />
            {facilities.length > 0 ? (
              facilities.map((fac) => (
                <DropdownMenuItem
                  key={fac.id}
                  onClick={() => handleSelectFacility(fac)}
                  className="flex items-center justify-between text-xs hover:bg-[#1E293B] cursor-pointer"
                >
                  <span className="truncate">{fac.name}</span>
                  {selectedFacility?.id === fac.id && <Check className="size-3.5 text-blue-400" />}
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem className="text-xs hover:bg-[#1E293B] cursor-pointer">
                <span>{branchName}</span>
                <Check className="size-3.5 text-blue-400" />
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Primary Dominant Navigation (Dashboard, Calendar, Courts & Spaces, Money) */}
        <nav className="space-y-1 pt-1" aria-label={t("venueNav.primaryNavigation")}>
          {primaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all",
                  item.active
                    ? "bg-nx-accent text-nx-accent-contrast shadow-sm font-bold"
                    : "text-nx-ink-2 hover:text-nx-ink hover:bg-nx-surfaceSubtle"
                )}
              >
                <Icon className={cn("size-4 shrink-0", item.active ? "text-nx-accent-contrast" : "text-nx-ink-3")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Secondary Lower Navigation (Customers, Team, Reports) */}
        {secondaryNavItems.length > 0 && (
          <>
            <div className="border-t border-nx-line my-3" />
            <nav className="space-y-1" aria-label={t("venueNav.secondaryNavigation")}>
              {secondaryNavItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                      item.active
                        ? "bg-nx-accent text-nx-accent-contrast font-bold"
                        : "text-nx-ink-2 hover:text-nx-ink hover:bg-nx-surfaceSubtle"
                    )}
                  >
                    <Icon className="size-4 shrink-0 text-nx-ink-3" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </>
        )}
      </div>

      {/* Anchored Lower Settings Navigation */}
      {settingsItem && (
        <div className="p-4 border-t border-nx-line">
          <Link
            href={settingsItem.href}
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all",
              settingsItem.active
                ? "bg-nx-accent text-nx-accent-contrast font-bold"
                : "text-nx-ink-2 hover:text-nx-ink hover:bg-nx-surfaceSubtle"
            )}
          >
            <settingsItem.icon className="size-4 shrink-0 text-nx-ink-3" />
            <span>{settingsItem.label}</span>
          </Link>
        </div>
      )}
    </div>
  );

  return (
    <div
      className={cn("flex h-screen w-full overflow-hidden bg-slate-50 dark:bg-slate-950", isRtl ? "rtl" : "ltr")}
      dir={direction}
      data-testid="venue-shell"
    >
      {/* Desktop Left Dark Sidebar */}
      <aside className="hidden lg:flex shrink-0 h-full">{renderSidebar()}</aside>

      {/* Mobile/Tablet Drawer Backdrop & Sidebar */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label={t("venueNav.navigation")}
        >
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-50 flex h-full">
            {renderSidebar()}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 end-4 p-2 text-slate-400 hover:text-white"
              aria-label={t("venueNav.closeMenu")}
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      )}

      {/* Content Column with Top Toolbar */}
      <div className="flex flex-1 flex-col min-w-0 h-full overflow-hidden">
        {/* Top Clean Toolbar */}
        <header className="h-14 shrink-0 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 sm:px-6 flex items-center justify-between gap-4 z-10">
          {/* Left: Mobile hamburger & Context breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label={t("venueNav.openMenu")}
            >
              <Menu className="size-5" />
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{branchName}</span>
              <span>•</span>
              <span className="capitalize">{primaryNavItems.find((p) => p.active)?.label || "Venue"}</span>
            </div>
          </div>

          {/* Right Toolbar Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Date Navigation Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-nx-lg border border-nx-line bg-nx-surfaceSubtle text-xs font-semibold text-nx-ink">
              <button
                type="button"
                className="p-0.5 hover:text-nx-accent transition-colors"
                aria-label={t("venueNav.previousDay")}
              >
                <ChevronLeft className="size-3.5 rtl:rotate-180" />
              </button>
              <span>{formattedDate}</span>
              <button
                type="button"
                className="p-0.5 hover:text-nx-accent transition-colors"
                aria-label={t("venueNav.nextDay")}
              >
                <ChevronRight className="size-3.5 rtl:rotate-180" />
              </button>
            </div>

            {/* EN / AR Switch Pill */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800 p-0.5 text-xs font-bold">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all text-[11px]",
                  language === "en"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("ar")}
                className={cn(
                  "px-2.5 py-1 rounded-md transition-all text-[11px]",
                  language === "ar"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                )}
              >
                AR
              </button>
            </div>

            {/* Theme Switcher */}
            <NxThemeSwitcher buttonClassName="size-8 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" />

            {/* Notifications Bell */}
            <NotificationBell />

            {/* User Account Menu Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="rounded-full focus:outline-none focus:ring-2 focus:ring-nx-primary focus:ring-offset-2"
                  aria-label="User account menu"
                >
                  <Avatar className="size-8 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-900 text-white font-bold text-xs shadow-xs cursor-pointer hover:opacity-90 transition-opacity">
                    {user?.profileImageUrl ? (
                      <AvatarImage src={user.profileImageUrl} alt="User avatar" />
                    ) : null}
                    <AvatarFallback className="bg-slate-900 text-white text-xs font-bold">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64 p-2 bg-nx-surface border border-nx-line shadow-nx-popover rounded-xl">
                <DropdownMenuLabel className="p-2 font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-bold text-nx-ink truncate">
                      {user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() || user.username || user.email : "Venue Manager"}
                    </p>
                    <p className="text-xs text-nx-ink-2 truncate">
                      {user?.email || "manager@scripe.com"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1 pt-1 border-t border-nx-line/50">
                      <Building2 className="size-3 text-nx-ink-3 shrink-0" />
                      <span className="text-[11px] font-semibold text-nx-accent truncate">
                        {currentTenant?.name || "SCRIPE Venue Test Club"}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem asChild className="cursor-pointer text-xs font-medium py-2">
                  <Link href="/profile" className="flex items-center gap-2">
                    <UserIcon className="size-3.5 text-nx-ink-2" />
                    <span>{t("nav.profile", { defaultValue: "My Account" })}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer text-xs font-medium py-2">
                  <Link href="/venue/settings" className="flex items-center gap-2">
                    <Settings className="size-3.5 text-nx-ink-2" />
                    <span>{t("venue.nav.settings", { defaultValue: "Preferences & Settings" })}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="my-1" />
                <div className="px-2 py-1.5">
                  <p className="text-[10px] font-semibold text-nx-ink-3 uppercase tracking-wider mb-1.5">
                    {t("common.theme", { defaultValue: "Theme" })}
                  </p>
                  <div className="grid grid-cols-3 gap-1 bg-nx-raised/60 p-0.5 rounded-lg border border-nx-line/40 text-xs">
                    <button
                      type="button"
                      onClick={() => setTheme("light")}
                      className={cn(
                        "flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors",
                        theme === "light"
                          ? "bg-nx-surface text-nx-ink shadow-xs font-bold"
                          : "text-nx-ink-3 hover:text-nx-ink"
                      )}
                    >
                      <Sun className="size-3" />
                      <span>Light</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("dark")}
                      className={cn(
                        "flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors",
                        theme === "dark"
                          ? "bg-nx-surface text-nx-ink shadow-xs font-bold"
                          : "text-nx-ink-3 hover:text-nx-ink"
                      )}
                    >
                      <Moon className="size-3" />
                      <span>Dark</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTheme("system")}
                      className={cn(
                        "flex items-center justify-center gap-1 py-1 rounded text-[11px] font-medium transition-colors",
                        theme === "system"
                          ? "bg-nx-surface text-nx-ink shadow-xs font-bold"
                          : "text-nx-ink-3 hover:text-nx-ink"
                      )}
                    >
                      <Laptop className="size-3" />
                      <span>Auto</span>
                    </button>
                  </div>
                </div>
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={async () => {
                    await logout();
                  }}
                  className="cursor-pointer text-xs font-semibold py-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-950/40"
                >
                  <LogOut className="size-3.5 me-2 rtl:rotate-180" />
                  <span>{t("nav.logout", { defaultValue: "Sign Out" })}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Scrollable Page Canvas */}
        <main
          id="venue-main-canvas"
          className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 lg:p-8 bg-[#F8FAFC] dark:bg-slate-950"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
