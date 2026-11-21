import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { MenuItem } from "@core/navigation/domain/entities/MenuItem";
import { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import { NexusSearchPalette } from "../nexus-search-palette";

const mockPush = vi.fn();
const mockSetActiveWorkspace = vi.fn();
const mockSetActiveRootItemId = vi.fn();
const mockRecordRecentWorkspace = vi.fn();

let mockLanguage = "en";
let mockWorkspaceGroups: WorkspaceGroup[] = [];
let mockCachedWorkspaces = new Map<string, NavigationData>();
let mockRouteDescriptors = new Map<
  string,
  {
    route: string;
    accessState: "authorized" | "tenant_context_required" | "platform_context_required" | "feature_disabled";
    workspaceKey?: string | null;
    requiresTenantContext: boolean;
  }
>();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: mockLanguage,
    direction: mockLanguage === "ar" ? "rtl" : "ltr",
  }),
}));

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    workspaceGroups: mockWorkspaceGroups,
    setActiveWorkspace: mockSetActiveWorkspace,
    setActiveRootItemId: mockSetActiveRootItemId,
  }),
}));

vi.mock("@core/navigation/store/useNavigationStore", () => ({
  useNavigationStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      workspaces: mockCachedWorkspaces,
      routeDescriptors: mockRouteDescriptors,
      contextKey: "tenant:demo",
      recordRecentWorkspace: mockRecordRecentWorkspace,
    }),
}));

vi.mock("@core/ui/routing-progress-bar", () => ({
  startRoutingProgress: vi.fn(),
}));

describe("NexusSearchPalette — unlocked workspaces, unhydrated routes & <bdi> isolation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLanguage = "ar";
    mockCachedWorkspaces = new Map();
    mockRouteDescriptors = new Map([
      [
        "/academy/athletes",
        {
          route: "/academy/athletes",
          accessState: "authorized",
          workspaceKey: "academy",
          requiresTenantContext: true,
        },
      ],
    ]);

    const venueMenu = new MenuItem({
      id: "m-courts",
      slug: "venue-courts",
      name: "Courts",
      nameEn: "Courts",
      nameAr: "الملاعب",
      href: "/venue/courts",
      icon: "Calendar",
      order: 1,
      resource: "courts",
      actions: null,
      children: [],
    });

    mockWorkspaceGroups = [
      new WorkspaceGroup({
        workspaceId: "ws-venue",
        workspaceKey: "venue",
        workspaceNameEn: "Venue Ops",
        workspaceNameAr: "عمليات المنشآت",
        workspaceIcon: "Building2",
        workspaceSortOrder: 1,
        colorHue: 145,
        colorChroma: 0.14,
        workspaceType: "Module",
        menuItems: [venueMenu],
        isLocked: false,
        homeRoute: "/venue/courts",
        platformHomeRoute: null,
        effectiveHomeRoute: "/venue/courts",
        isPinned: true,
        pinSortOrder: 1,
        accessibleItemCount: 1,
      }),
      new WorkspaceGroup({
        workspaceId: "ws-academy",
        workspaceKey: "academy",
        workspaceNameEn: "Academy",
        workspaceNameAr: "الأكاديمية",
        workspaceIcon: "Users",
        workspaceSortOrder: 2,
        colorHue: 210,
        colorChroma: 0.12,
        workspaceType: "Module",
        menuItems: [],
        isLocked: false,
        homeRoute: "/academy/overview",
        platformHomeRoute: null,
        effectiveHomeRoute: "/academy/overview",
        isPinned: false,
        pinSortOrder: null,
        accessibleItemCount: 2,
      }),
      new WorkspaceGroup({
        workspaceId: "ws-locked",
        workspaceKey: "finance",
        workspaceNameEn: "Locked Finance",
        workspaceNameAr: "المالية المقفلة",
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
  });

  it("indexes unlocked workspaces + unhydrated routeDescriptors, omits locked workspaces, and isolates routes in <bdi dir=\"ltr\">", () => {
    const onOpenChange = vi.fn();
    render(<NexusSearchPalette open={true} onOpenChange={onOpenChange} />);

    const venueRouteBadges = screen.getAllByText("/venue/courts");
    expect(venueRouteBadges.length).toBeGreaterThanOrEqual(1);
    for (const el of venueRouteBadges) {
      expect(el.closest("bdi")).toHaveAttribute("dir", "ltr");
    }
    expect(screen.getByText("/academy/athletes").closest("bdi")).toHaveAttribute("dir", "ltr");
    expect(screen.queryByText("Locked Finance")).not.toBeInTheDocument();

    const academyItem = screen.getByText("Athletes").closest("[cmdk-item]") as HTMLElement;
    fireEvent.click(academyItem);

    expect(mockSetActiveWorkspace).toHaveBeenCalledWith("academy");
    expect(mockRecordRecentWorkspace).toHaveBeenCalledWith("tenant:demo", "academy");
    expect(mockPush).toHaveBeenCalledWith("/academy/athletes");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
