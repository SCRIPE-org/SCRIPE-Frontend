import * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TooltipProvider } from "@core/ui/tooltip";
import { ModuleWorkspaceButton, NexusPrimaryRail } from "../nexus-primary-rail";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { MenuItem } from "@core/navigation/domain/entities/MenuItem";

let mockPathname = "/crm";
const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockStartRoutingProgress = vi.fn();
const mockSwitchWorkspace = vi.fn();
const mockGoBackWorkspace = vi.fn();
const mockSetActiveRootItemId = vi.fn();

let mockActiveWorkspace: WorkspaceGroup | null = null;
let mockRootMenuItems: MenuItem[] = [];

const crmWorkspace = new WorkspaceGroup({
  workspaceId: "ws-crm",
  workspaceKey: "crm",
  workspaceNameEn: "CRM",
  workspaceNameAr: "المبيعات",
  workspaceIcon: "Users",
  workspaceSortOrder: 2,
  colorHue: 180,
  colorChroma: 0.14,
  workspaceType: "Module",
  menuItems: [],
  isLocked: false,
  homeRoute: "/crm",
  platformHomeRoute: null,
  isPinned: true,
  pinSortOrder: 10,
  contextScope: "TenantOnly",
  accessibleItemCount: 3,
});

const adminWorkspace = new WorkspaceGroup({
  workspaceId: "ws-admin",
  workspaceKey: "admin",
  workspaceNameEn: "Admin",
  workspaceNameAr: "الإدارة",
  workspaceIcon: "Shield",
  workspaceSortOrder: 1,
  colorHue: null,
  colorChroma: null,
  workspaceType: "Admin",
  menuItems: [],
  isLocked: false,
  homeRoute: "/overview",
  platformHomeRoute: "/overview",
  isPinned: false,
  pinSortOrder: null,
  contextScope: "Both",
  accessibleItemCount: 4,
});

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

vi.mock("next/image", () => ({
  default: ({
    priority: _priority,
    unoptimized: _unoptimized,
    ...rest
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    priority?: boolean;
    unoptimized?: boolean;
  }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={rest.alt ?? ""} {...rest} />
  ),
}));

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    activeWorkspace: mockActiveWorkspace,
    rootMenuItems: mockRootMenuItems,
    activeRootItem: null,
    setActiveRootItemId: mockSetActiveRootItemId,
    isModuleMode: Boolean(mockActiveWorkspace?.isModuleWorkspace),
    workspaceGroups: [adminWorkspace, crmWorkspace],
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
    canAccessPage: () => true,
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
  startRoutingProgress: (...args: unknown[]) => mockStartRoutingProgress(...args),
}));

vi.mock("../nexus-layout", () => ({
  useWorkspaceTransitionContext: () => ({
    switchWorkspace: mockSwitchWorkspace,
    goBackWorkspace: mockGoBackWorkspace,
  }),
}));

describe("NexusPrimaryRail — /hub navigation & null-workspace shell behavior", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPathname = "/crm";
    useNavigationStore.getState().reset();
    mockActiveWorkspace = crmWorkspace;
    mockRootMenuItems = [
      new MenuItem({
        id: "crm-leads",
        slug: "crm-leads",
        name: "Leads",
        nameEn: "Leads",
        nameAr: "العملاء",
        href: "/crm/leads",
        icon: "Users",
        order: 1,
        resource: "crm.leads",
        actions: null,
        children: [],
      }),
    ];
    useNavigationStore.getState().setActiveWorkspace("crm");
    useNavigationStore.getState().setActiveRootItem("crm-leads");
  });

  it("clears activeWorkspaceKey and navigates to /hub via router.push when PrimaryRailLogo is clicked from /crm", () => {
    render(<NexusPrimaryRail onOpenAppLauncher={vi.fn()} />);

    const logoButton = screen.getByRole("button", { name: "chrome.goToHome" });
    fireEvent.click(logoButton);

    expect(useNavigationStore.getState().activeWorkspaceKey).toBeNull();
    expect(useNavigationStore.getState().activeRootItemId).toBeNull();
    expect(mockStartRoutingProgress).toHaveBeenCalledTimes(1);
    expect(mockPush).toHaveBeenCalledWith("/hub");
    expect(mockPush).not.toHaveBeenCalledWith("/");
    expect(mockReplace).not.toHaveBeenCalled();
  });

  it("clears activeWorkspaceKey without calling startRoutingProgress or router.push when PrimaryRailLogo is already on /hub or /hub/", () => {
    mockPathname = "/hub";
    const { rerender } = render(<NexusPrimaryRail onOpenAppLauncher={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "chrome.goToHome" }));
    expect(useNavigationStore.getState().activeWorkspaceKey).toBeNull();
    expect(mockStartRoutingProgress).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();

    mockPathname = "/hub/";
    useNavigationStore.getState().setActiveWorkspace("crm");
    rerender(<NexusPrimaryRail onOpenAppLauncher={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "chrome.goToHome" }));
    expect(useNavigationStore.getState().activeWorkspaceKey).toBeNull();
    expect(mockStartRoutingProgress).not.toHaveBeenCalled();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("hides Back button and admin root items when activeWorkspace is null and rootMenuItems is empty on /hub", () => {
    mockActiveWorkspace = null;
    mockRootMenuItems = [];
    useNavigationStore.getState().setActiveWorkspace(null);

    render(<NexusPrimaryRail onOpenAppLauncher={vi.fn()} />);

    expect(screen.queryByRole("button", { name: "chrome.backToAdmin" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Leads" })).toBeNull();
    expect(screen.getByRole("button", { name: "CRM" })).toBeInTheDocument();
  });

  it("preserves pointer-events for hover tooltips/cursor while blocking clicks on locked ModuleWorkspaceButton", () => {
    const onLockedClick = vi.fn();
    render(
      <TooltipProvider>
        <ModuleWorkspaceButton
          label="Finance"
          abbreviation="FN"
          icon="DollarSign"
          accentColor="#10b981"
          isActive={false}
          isRTL={false}
          isLocked={true}
          onClick={onLockedClick}
        />
      </TooltipProvider>
    );

    const lockedBtn = screen.getByRole("button", { name: "Finance (chrome.section.locked)" });
    expect(lockedBtn).toHaveAttribute("aria-disabled", "true");
    expect(lockedBtn.className).toContain("aria-disabled:pointer-events-auto");

    fireEvent.click(lockedBtn);
    expect(onLockedClick).not.toHaveBeenCalled();
  });
});
