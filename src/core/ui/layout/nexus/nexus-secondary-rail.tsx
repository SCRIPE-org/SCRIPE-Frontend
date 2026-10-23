"use client";

/**
 * NexusSecondaryRail — 240px panel sidebar
 *
 * Shows the CHILDREN of the selected root menu item from the primary rail.
 *
 * - Header: icon + name of the selected root item (context label + workspace name)
 * - Body: nav rows for the root item's children
 *   - Groups: items with no href but with children → group label + indented children
 *   - Leaf items: items with href → clickable nav link
 *
 * Colour comes from the --nx- token layer (theme resolves in CSS — no
 * resolvedTheme reads). Surface glass over the nexus ground, hairline edge,
 * accent only on the active leaf.
 */

import React, { useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { useWorkspace } from "@core/providers/workspace-provider";
import { useI18n } from "@core/providers/i18n-provider";
import { usePermissions } from "@core/providers/permission-provider";
import { MenuItem } from "@core/navigation";
import { resolveBilingualLabel } from "@core/common/utils";
import { RailHeader, RailContent } from "./_parts/secondary-rail-parts";
import { useNexusReducedMotion } from "./nexus-transition";
import { NEXUS_PANEL_W } from "./_parts/nexus-layout-constants";

interface NexusSecondaryRailProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
  isCollapsed?: boolean;
}

// ── Secondary Rail ────────────────────────────────────────────────────────────
export function NexusSecondaryRail({
  mobileOpen,
  onMobileClose,
  isCollapsed,
}: NexusSecondaryRailProps) {
  const { activeWorkspace, activeRootItem, isModuleMode } = useWorkspace();
  const { language, t } = useI18n();
  const { canAccessPage } = usePermissions();
  const pathname = usePathname();
  const reducedMotion = useNexusReducedMotion();

  const isVenueWorkspace = activeWorkspace?.workspaceKey === "venue";

  // ── Authoritative 5-Group Navigation for SCRIPE Venue ──────────────────────
  // Canonical structure aligned with VenueMenuProvider.cs (5 groups, 18 routes):
  // 1. Operations & Bookings → Dashboard, Calendar, New Booking, Attention Queue, Customers
  // 2. Courts & Facilities → Courts & Spaces, Facilities, Availability, Resource Profiles, Resource Builder
  // 3. Commercial & Rates → Financial Overview, Invoices & Receivables, Payments, Pricing & Rates
  // 4. Analytics & Reports → Reports & Analytics
  // 5. Settings & Setup → Venue & Site Profile, Sites & Campuses, Venue Settings
  const venueMenuItems: MenuItem[] = useMemo(() => {
    if (!isVenueWorkspace) return [];

    const makeItem = (
      id: string,
      nameEn: string,
      nameAr: string,
      href: string,
      icon: string,
      children: MenuItem[] = []
    ): MenuItem =>
      new MenuItem({
        id,
        slug: id,
        name: nameEn,
        nameEn,
        nameAr,
        href,
        icon,
        order: 0,
        resource: null,
        actions: null,
        children: children
          .filter((c) => !c.href || canAccessPage(c.href))
          .map((c) => ({
            id: c.id,
            slug: c.slug,
            name: c.name,
            nameEn: c.nameEn,
            nameAr: c.nameAr,
            href: c.href,
            icon: c.icon,
            order: c.order,
            resource: c.resource,
            actions: c.actions,
            children: [],
          })),
      });

    // ── 1. Operations & Bookings Group ──
    const operationsGroup = makeItem(
      "venue-group-operations",
      "Operations & Bookings",
      "العمليات والحجوزات",
      "",
      "LayoutDashboard",
      [
        makeItem("venue-dashboard", "Operations Dashboard", "لوحة التحكم", "/venue", "LayoutDashboard"),
        makeItem("venue-calendar", "Calendar Grid", "تقويم العمليات", "/venue/calendar", "CalendarDays"),
        makeItem("venue-booking-create", "New Booking", "حجز جديد", "/venue/bookings/new", "CalendarPlus"),
        makeItem("venue-attention", "Attention Queue", "مركز الانتباه", "/venue/attention", "AlertTriangle"),
        makeItem("venue-customers", "Customers & Guests", "العملاء والضيوف", "/venue/customers", "Users"),
      ]
    );

    // ── 2. Courts & Facilities Group ──
    const spacesGroup = makeItem(
      "venue-group-spaces",
      "Courts & Facilities",
      "المنشآت والملاعب",
      "",
      "Building2",
      [
        makeItem("venue-resources", "Courts & Spaces", "الملاعب والمساحات", "/venue/resources", "Layers"),
        makeItem("venue-facilities", "Facilities & Complexes", "المجمعات والمنشآت", "/venue/facilities", "Building"),
        makeItem("venue-availability", "Operating Hours & Schedules", "ساعات العمل والإتاحة", "/venue/availability", "Clock"),
        makeItem("venue-resource-profiles", "Resource Profiles", "ملفات تعريف الموارد", "/venue/resource-profiles", "FileSliders"),
        makeItem("venue-resource-builder", "Resource Builder", "منشئ الموارد", "/venue/resource-builder", "Boxes"),
      ]
    );

    // ── 3. Commercial & Rates Group ──
    const commercialGroup = makeItem(
      "venue-group-commercial",
      "Commercial & Rates",
      "المالية والتسعير",
      "",
      "Receipt",
      [
        makeItem("venue-money", "Financial Overview", "النظرة المالية العامة", "/venue/money", "WalletCards"),
        makeItem("venue-receivables", "Invoices & Receivables", "الفواتير والمستحقات", "/venue/money/receivables", "Receipt"),
        makeItem("venue-payments", "Payment History", "سجل المدفوعات", "/venue/money/payments", "CreditCard"),
        makeItem("venue-pricing", "Pricing & Rates", "قواعد التسعير والتعريفات", "/venue/pricing", "Tag"),
      ]
    );

    // ── 4. Analytics & Reports Group ──
    const analyticsGroup = makeItem(
      "venue-group-analytics",
      "Analytics & Reports",
      "التقارير والتحليلات",
      "",
      "BarChart3",
      [
        makeItem("venue-reports", "Reports & Analytics", "التقارير والتحليلات", "/venue/reports", "BarChart3"),
      ]
    );

    // ── 5. Settings & Setup Group ──
    const settingsGroup = makeItem(
      "venue-group-settings",
      "Settings & Setup",
      "الإعدادات والتكوين",
      "",
      "Settings",
      [
        makeItem("venue-setup", "Venue & Site Profile", "إعداد المنشأة والموقع", "/venue/venue-setup", "Sliders"),
        makeItem("venue-sites", "Sites & Campuses", "المواقع والمجمعات", "/venue/sites", "MapPin"),
        makeItem("venue-settings", "Venue Settings", "إعدادات المنشأة", "/venue/settings", "Settings"),
      ]
    );

    const candidates = [operationsGroup, spacesGroup, commercialGroup, analyticsGroup, settingsGroup];
    return candidates.filter((item) => {
      if (item.href && canAccessPage(item.href)) return true;
      if (item.children.some((c) => c.href && canAccessPage(c.href))) return true;
      return false;
    });
  }, [isVenueWorkspace, canAccessPage]);

  // ── Context label ─────────────────────────────────────────────────────────
  const contextLabel = isVenueWorkspace
    ? resolveBilingualLabel("VENUE", "المنشآت والملاعب", language)
    : activeWorkspace
      ? (activeWorkspace.getLocalizedName(language) ?? activeWorkspace.workspaceKey.toUpperCase())
      : isModuleMode
        ? t("chrome.section.module")
        : t("chrome.section.platform");

  // ── Title: selected root item name ────────────────────────────────────────
  const title = isVenueWorkspace
    ? resolveBilingualLabel("Venue Operations", "عمليات المنشآت", language)
    : activeRootItem
      ? language === "ar"
        ? activeRootItem.nameAr || activeRootItem.nameEn
        : activeRootItem.nameEn || activeRootItem.nameAr
      : (activeWorkspace?.getLocalizedName(language) ?? t("chrome.section.workspace"));

  // ── Menu items to display: children of the selected root item (or focused venue menu) ─────
  const menuItems: MenuItem[] = isVenueWorkspace
    ? (activeRootItem?.children && activeRootItem.children.length > 0 ? activeRootItem.children : venueMenuItems)
    : (activeRootItem?.children ?? []);
  const hasSubmenu = menuItems.length > 0;

  const handleNavigate = useCallback(() => onMobileClose?.(), [onMobileClose]);

  // Auto-collapse when panel is explicitly collapsed by user action OR when active root item has no children.
  // Do NOT collapse when activeWorkspace is null — that is a transient state
  // during JIT workspace activation (one React tick before useActiveRootSync fires).
  // Collapsing on null would cause the secondary rail to flash empty on every
  // page navigation where the workspace key momentarily resets.
  const effectiveCollapsed = !hasSubmenu || !!isCollapsed;

  const railStyle: React.CSSProperties = {
    width: effectiveCollapsed ? 0 : NEXUS_PANEL_W,
    opacity: effectiveCollapsed ? 0 : 1,
    height: "100%",
    minHeight: 0, // critical: allows flex child to scroll
    // An opaque surface step behind a hairline. The 65%-transparent slab needed
    // a 20px backdrop blur to stay legible, and that blur repainted the whole
    // rail on every content scroll behind it.
    background: "var(--nx-surface, hsl(var(--card)))",
    borderInlineEnd: effectiveCollapsed ? "none" : "1px solid var(--nx-line, hsl(var(--border)))",
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
    overflow: "hidden",
    pointerEvents: effectiveCollapsed ? "none" : "auto",
    // Collapse still animates width because the content column must reflow with
    // it (a transform cannot do that). Reduced motion keeps only the crossfade.
    transition: reducedMotion
      ? "opacity var(--nx-t-micro, 140ms) ease"
      : "width var(--nx-t-panel, 300ms) var(--nx-ease-enter, cubic-bezier(0.23, 1, 0.32, 1)), opacity var(--nx-t-standard, 200ms) var(--nx-ease-exit, cubic-bezier(0.3, 0, 0.8, 0.15)), background var(--nx-t-standard, 200ms) ease, border-inline-end-color var(--nx-t-standard, 200ms) ease",
  };

  const innerContainerStyle: React.CSSProperties = {
    width: NEXUS_PANEL_W, // Fixed width to prevent wrapping during collapse animation
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0, // critical: allows flex child to scroll
    overflow: "hidden",
  };

  const railContent = (
    <div style={innerContainerStyle}>
      <RailHeader contextLabel={contextLabel} title={title} />
      <RailContent
        menuItems={menuItems}
        pathname={pathname}
        language={language}
        onNavigate={handleNavigate}
      />
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside
        style={railStyle}
        aria-hidden={effectiveCollapsed}
        className="relative z-raised hidden lg:flex lg:flex-col"
      >
        {railContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && hasSubmenu && !effectiveCollapsed && (
        <>
          {/* The scrim pushes the page back by taking light away — that is the
              whole mechanism, so it carries no blur. */}
          <div
            className="fixed inset-0 z-overlay bg-scrim lg:hidden"
            style={{ transition: "opacity var(--nx-t-panel, 300ms) ease" }}
            onClick={onMobileClose}
            aria-hidden
          />
          <aside
            className="fixed inset-y-0 z-modal flex flex-col lg:hidden"
            style={{
              insetInlineStart: 64, // Logical property matching primary rail mobile width
              width: 260,
              // Floating panel → the popover surface, opaque. It read as glass
              // only because it was 92% of a surface behind a 24px blur.
              background: "var(--nx-popover, hsl(var(--card)))",
              borderInlineEnd: "1px solid var(--nx-line, hsl(var(--border)))", // Logical property
            }}
          >
            <div style={{ width: 260, height: "100%", display: "flex", flexDirection: "column" }}>
              <RailHeader contextLabel={contextLabel} title={title} />
              <RailContent
                menuItems={menuItems}
                pathname={pathname}
                language={language}
                onNavigate={handleNavigate}
              />
            </div>
          </aside>
        </>
      )}
    </>
  );
}
