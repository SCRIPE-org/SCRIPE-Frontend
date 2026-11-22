import * as React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { MenuItem } from "@core/navigation/domain/entities/MenuItem";

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockSetActiveRootItemId = vi.fn();
const mockCanAccessPage = vi.fn<(route: string) => boolean>();
let mockRootMenuItems: MenuItem[] = [];

const crmWorkspace = new WorkspaceGroup({
  workspaceId: "ws-crm",
  workspaceKey: "crm",
  workspaceNameEn: "CRM",
  workspaceNameAr: "إدارة العملاء",
  workspaceIcon: "Users",
  workspaceSortOrder: 2,
  colorHue: 180,
  colorChroma: 0.14,
  workspaceType: "Admin",
  menuItems: [],
  isLocked: false,
  homeRoute: "/crm/leads",
  platformHomeRoute: null,
  effectiveHomeRoute: "/crm/leads",
  isPinned: false,
  pinSortOrder: null,
  contextScope: "TenantOnly",
  accessibleItemCount: 2,
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
  usePathname: () => "/crm/leads",
}));

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => (
    <span role="img" aria-label={String(props.alt ?? "")} />
  ),
}));

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    activeWorkspace: crmWorkspace,
    rootMenuItems: mockRootMenuItems,
    activeRootItem: null,
    setActiveRootItemId: mockSetActiveRootItemId,
    isModuleMode: false,
    workspaceGroups: [crmWorkspace],
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    language: "en",
    direction: "ltr",
    t: (key: string) => key,
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    showNotifications: false,
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
  }),
}));

vi.mock("@core/providers/tenant-branding-provider", () => ({
  useTenantBranding: () => ({
    logoUrl: null,
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    canAccessPage: (route: string) => mockCanAccessPage(route),
  }),
}));

vi.mock("@core/ui/notification", () => ({
  NotificationBell: () => <div data-testid="notification-bell" />,
}));

vi.mock("@core/ui/user-profile-dropdown", () => ({
  UserProfileDropdown: () => <div data-testid="user-profile-dropdown" />,
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  toast: vi.fn(),
}));

vi.mock("@core/ui/routing-progress-bar", () => ({
  startRoutingProgress: vi.fn(),
}));

vi.mock("../nexus-layout", () => ({
  useWorkspaceTransitionContext: () => ({
    switchWorkspace: vi.fn(),
    goBackWorkspace: vi.fn(),
  }),
}));

import { NexusPrimaryRail } from "../nexus-primary-rail";

describe("NexusPrimaryRail leaf route fallback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRootMenuItems = [
      new MenuItem({
        id: "crm-root",
        slug: "crm-root",
        name: "CRM Pipeline",
        nameEn: "CRM Pipeline",
        nameAr: "مسار المبيعات",
        icon: "Target",
        href: "#",
        order: 1,
        resource: null,
        actions: null,
        children: [
          {
            id: "crm-deals",
            slug: "crm-deals",
            name: "Deals",
            nameEn: "Deals",
            nameAr: "الصفقات",
            href: "/crm/deals",
            icon: "Briefcase",
            order: 2,
            resource: "deals.view",
            actions: null,
            children: [],
          },
          {
            id: "crm-leads",
            slug: "crm-leads",
            name: "Leads",
            nameEn: "Leads",
            nameAr: "العملاء المحتملون",
            href: "/crm/leads",
            icon: "Users",
            order: 1,
            resource: "leads.view",
            actions: null,
            children: [],
          },
        ],
      }),
    ];
  });

  it("navigates to the first order-sorted child that passes canAccessPage", () => {
    mockCanAccessPage.mockImplementation((route) => route === "/crm/deals");

    render(<NexusPrimaryRail onOpenAppLauncher={vi.fn()} />);

    const rootButton = screen.getByRole("button", { name: "CRM Pipeline" });
    fireEvent.click(rootButton);

    expect(mockSetActiveRootItemId).toHaveBeenCalledWith("crm-root");
    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/crm/deals");
  });

  it("picks lowest order when multiple children pass canAccessPage", () => {
    mockCanAccessPage.mockReturnValue(true);

    render(<NexusPrimaryRail onOpenAppLauncher={vi.fn()} />);

    const rootButton = screen.getByRole("button", { name: "CRM Pipeline" });
    fireEvent.click(rootButton);

    expect(mockPush).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/crm/leads");
  });

  it("does NOT navigate (no findAny unauthorized fallback) when all children fail canAccessPage", () => {
    mockCanAccessPage.mockReturnValue(false);

    render(<NexusPrimaryRail onOpenAppLauncher={vi.fn()} />);

    const rootButton = screen.getByRole("button", { name: "CRM Pipeline" });
    fireEvent.click(rootButton);

    expect(mockSetActiveRootItemId).toHaveBeenCalledWith("crm-root");
    expect(mockPush).not.toHaveBeenCalled();
  });
});
