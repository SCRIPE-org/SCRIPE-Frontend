import { describe, it, expect } from "vitest";
import { MenuItem } from "@core/navigation/domain/entities/MenuItem";
import { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import type { AuthorizedRouteDescriptor } from "@core/navigation/domain/interfaces/INavigationRepository";
import { buildSearchIndex, filterQuickJumpItems } from "../buildSearchIndex";

function makeMenu(id: string, nameEn: string, nameAr: string, href: string, children: MenuItem[] = []) {
  return new MenuItem({
    id,
    slug: id,
    name: nameEn,
    nameEn,
    nameAr,
    href,
    icon: "FileText",
    order: 1,
    resource: null,
    actions: null,
    children,
  });
}

describe("buildSearchIndex & filterQuickJumpItems", () => {
  it("indexes unlocked workspaces, cached JIT menu trees, and unhydrated authorized routeDescriptors while excluding locked and dynamic routes", () => {
    const venueMenu = makeMenu("m-courts", "Courts", "الملاعب", "/venue/courts");
    const crmLeadMenu = makeMenu("m-leads", "Leads", "العملاء", "/crm/leads");

    const workspaceGroups = [
      new WorkspaceGroup({
        workspaceId: "ws-venue",
        workspaceKey: "venue",
        workspaceNameEn: "Venue",
        workspaceNameAr: "المنشآت",
        workspaceIcon: "Building2",
        workspaceSortOrder: 1,
        colorHue: 145,
        colorChroma: 0.14,
        workspaceType: "Module",
        menuItems: [venueMenu],
        isLocked: false,
        homeRoute: "/venue",
        platformHomeRoute: null,
        effectiveHomeRoute: "/venue",
        isPinned: true,
        pinSortOrder: 1,
        accessibleItemCount: 2,
      }),
      new WorkspaceGroup({
        workspaceId: "ws-crm",
        workspaceKey: "crm",
        workspaceNameEn: "CRM",
        workspaceNameAr: "المبيعات",
        workspaceIcon: "Users",
        workspaceSortOrder: 2,
        colorHue: 200,
        colorChroma: 0.14,
        workspaceType: "Module",
        menuItems: [],
        isLocked: false,
        homeRoute: "/crm",
        platformHomeRoute: null,
        effectiveHomeRoute: "/crm",
        isPinned: false,
        pinSortOrder: null,
        accessibleItemCount: 3,
      }),
      new WorkspaceGroup({
        workspaceId: "ws-locked",
        workspaceKey: "finance",
        workspaceNameEn: "Finance",
        workspaceNameAr: "المالية",
        workspaceIcon: "Wallet",
        workspaceSortOrder: 3,
        colorHue: 180,
        colorChroma: 0.12,
        workspaceType: "Module",
        menuItems: [],
        isLocked: true,
        homeRoute: "/finance",
        platformHomeRoute: null,
        effectiveHomeRoute: "/finance",
        isPinned: false,
        pinSortOrder: null,
        accessibleItemCount: 0,
      }),
    ];

    const cachedWorkspaces = new Map<string, NavigationData>([
      [
        "crm",
        new NavigationData({
          menuItems: [crmLeadMenu.toData()],
          routes: ["/crm", "/crm/leads"],
          workspaceGroups: [],
        }),
      ],
    ]);

    const routeDescriptors = new Map<string, AuthorizedRouteDescriptor>([
      [
        "/venue",
        {
          route: "/venue",
          accessState: "authorized",
          workspaceKey: "venue",
          requiresTenantContext: true,
        },
      ],
      [
        "/venue/bookings/new",
        {
          route: "/venue/bookings/new",
          accessState: "authorized",
          workspaceKey: "venue",
          requiresTenantContext: true,
        },
      ],
      [
        "/venue/bookings/[id]",
        {
          route: "/venue/bookings/[id]",
          accessState: "authorized",
          workspaceKey: "venue",
          requiresTenantContext: true,
        },
      ],
      [
        "/crm/leads",
        {
          route: "/crm/leads",
          accessState: "authorized",
          workspaceKey: "crm",
          requiresTenantContext: true,
        },
      ],
      [
        "/finance/invoices",
        {
          route: "/finance/invoices",
          accessState: "authorized",
          workspaceKey: "finance",
          requiresTenantContext: true,
        },
      ],
    ]);

    const t = (key: string) => {
      const ar: Record<string, string> = {
        "nav.routeSegments.bookings": "الحجوزات",
        "nav.routeSegments.new": "جديد",
      };
      return ar[key] ?? key;
    };

    const items = buildSearchIndex({
      workspaceGroups,
      cachedWorkspaces,
      routeDescriptors,
      language: "ar",
      t,
    });

    // Locked workspace and its routes must be absent
    expect(items.some((i) => i.workspaceKey === "finance")).toBe(false);
    // Dynamic routes with [id] must be absent
    expect(items.some((i) => i.href.includes("[id]"))).toBe(false);
    // Duplicate /venue home and /crm/leads menu route must not repeat
    expect(items.filter((i) => i.href === "/venue")).toHaveLength(1);
    expect(items.filter((i) => i.href === "/crm/leads")).toHaveLength(1);
    // Generic leaf keeps localized parent context
    const newBooking = items.find((i) => i.href === "/venue/bookings/new");
    expect(newBooking?.titleSegments).toEqual(["الحجوزات", "جديد"]);
    expect(newBooking?.kind).toBe("page");
  });

  it("filterQuickJumpItems excludes bare ws: workspace entries and caps results at 6", () => {
    const extraDescriptors = new Map<string, AuthorizedRouteDescriptor>();
    for (let i = 1; i <= 8; i++) {
      const route = `/venue/page-${i}`;
      extraDescriptors.set(route, {
        route,
        accessState: "authorized",
        workspaceKey: "venue",
        requiresTenantContext: true,
      });
    }

    const venueWs = new WorkspaceGroup({
      workspaceId: "ws-venue",
      workspaceKey: "venue",
      workspaceNameEn: "Venue",
      workspaceNameAr: "المنشآت",
      workspaceIcon: "Building2",
      workspaceSortOrder: 1,
      colorHue: 145,
      colorChroma: 0.14,
      workspaceType: "Module",
      menuItems: [],
      isLocked: false,
      homeRoute: "/venue",
      platformHomeRoute: null,
      effectiveHomeRoute: "/venue",
      isPinned: false,
      pinSortOrder: null,
      accessibleItemCount: 8,
    });

    const items = buildSearchIndex({
      workspaceGroups: [venueWs],
      cachedWorkspaces: new Map(),
      routeDescriptors: extraDescriptors,
      language: "en",
      t: (k) => k,
    });

    const quickJumps = filterQuickJumpItems(items, "venue", 6);
    expect(quickJumps).toHaveLength(6);
    expect(quickJumps.every((item) => item.kind === "page" && !item.id.startsWith("ws:"))).toBe(true);
    expect(quickJumps.some((item) => item.href === "/venue")).toBe(false);
  });

  it("never falls back to /overview when effectiveHomeRoute, menuTree, and authorized descriptors are all absent", () => {
    const emptyVenueWs = new WorkspaceGroup({
      workspaceId: "ws-venue-empty",
      workspaceKey: "venue",
      workspaceNameEn: "Venue",
      workspaceNameAr: "المنشآت",
      workspaceIcon: "Building2",
      workspaceSortOrder: 1,
      colorHue: 145,
      colorChroma: 0.14,
      workspaceType: "Module",
      menuItems: [],
      isLocked: false,
      homeRoute: "/venue",
      platformHomeRoute: null,
      effectiveHomeRoute: null,
      isPinned: false,
      pinSortOrder: null,
      accessibleItemCount: 0,
    });

    const crmOnlyWithEffective = new WorkspaceGroup({
      workspaceId: "ws-crm-effective",
      workspaceKey: "crm",
      workspaceNameEn: "CRM",
      workspaceNameAr: "المبيعات",
      workspaceIcon: "Briefcase",
      workspaceSortOrder: 2,
      colorHue: 200,
      colorChroma: 0.14,
      workspaceType: "Module",
      menuItems: [],
      isLocked: false,
      homeRoute: "/crm",
      platformHomeRoute: null,
      effectiveHomeRoute: "/crm/leads",
      isPinned: false,
      pinSortOrder: null,
      accessibleItemCount: 1,
    });

    const items = buildSearchIndex({
      workspaceGroups: [emptyVenueWs, crmOnlyWithEffective],
      cachedWorkspaces: new Map(),
      routeDescriptors: new Map(),
      language: "en",
      t: (k) => k,
    });

    expect(items.some((item) => item.href === "/overview")).toBe(false);
    expect(items.find((item) => item.id === "ws:venue")).toBeUndefined();
    expect(items.find((item) => item.id === "ws:crm")?.href).toBe("/crm/leads");
  });
});
