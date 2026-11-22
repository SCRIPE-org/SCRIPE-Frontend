import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { MenuItem } from "@core/navigation/domain/entities/MenuItem";
import { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import type { AuthorizedRouteDescriptor } from "@core/navigation/domain/interfaces/INavigationRepository";
import { formatHubItemCount, formatPinnedWorkspaceCount } from "../../utils/hub-plurals";
import { en as homeEn } from "../../../core/locales/home.en";
import { WorkspaceHubView } from "../WorkspaceHubView";

const mockSwitchWorkspace = vi.fn();
const mockTogglePin = vi.fn();
const mockSetActiveWorkspace = vi.fn();
const mockSetActiveRootItemId = vi.fn();
const mockRecordRecentWorkspace = vi.fn();
const mockRouterPush = vi.fn();
const mockToastError = vi.fn();
const mockMarkRead = vi.fn();
const mockMarkAllRead = vi.fn();
const mockRefetchNotifications = vi.fn();
const mockRefetchActivity = vi.fn();

let mockIsImpersonating = false;
let mockPermissions: string[] = [];
let mockWorkspaceGroups: WorkspaceGroup[] = [];
let mockRecentByContext: Record<string, string[]> = {};
let mockPreviousWorkspaceKey: string | null = null;
let mockCachedWorkspaces = new Map<string, NavigationData>();
let mockRouteDescriptors = new Map<string, AuthorizedRouteDescriptor>();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockRouterPush }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
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

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.count !== undefined) return `${key}:${params.count}`;
      if (params?.name !== undefined) return `${key}:${params.name}`;
      return key;
    },
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    cardStyle: "default",
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
    badgeStyle: "default",
  }),
}));

vi.mock("@core/providers/tenant-branding-provider", () => ({
  useTenantBranding: () => ({
    logoUrl: "/brand/app-logo-1024.png",
    appName: "SCRIPE",
    isTenantContext: false,
  }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ user: { firstName: "Seif", username: "seif" } }),
}));

vi.mock("@core/hooks/useAdminContext", () => ({
  useAdminContext: () => ({
    activeTenantId: "tenant-ahly",
    activeTenantName: "Al Ahly SC",
    isPlatform: false,
  }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    hasAnyPermission: (perms: string[]) => perms.some((p) => mockPermissions.includes(p)),
    hasPermission: (perm: string) => mockPermissions.includes(perm),
  }),
}));

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    workspaceGroups: mockWorkspaceGroups,
    isLoading: false,
    togglePin: mockTogglePin,
    setActiveWorkspace: mockSetActiveWorkspace,
    setActiveRootItemId: mockSetActiveRootItemId,
  }),
}));

vi.mock("@core/ui/layout/nexus/use-workspace-transition", () => ({
  useWorkspaceTransition: () => ({
    loaderState: { show: false, workspaceName: "", workspaceAbbr: "", accentColor: null },
    switchWorkspace: mockSwitchWorkspace,
    goBackWorkspace: vi.fn(),
  }),
}));

vi.mock("@core/ui/layout/nexus/nexus-workspace-loader", () => ({
  NexusWorkspaceLoader: () => null,
}));

vi.mock("@core/ui/layout/nexus/nexus-app-launcher", () => ({
  UpgradeDialog: ({
    workspaceName,
    onUpgrade,
  }: {
    workspaceName: string;
    onUpgrade: () => void;
  }) => (
    <div data-testid="upgrade-dialog">
      <span>{workspaceName}</span>
      <button type="button" onClick={onUpgrade}>
        confirm-upgrade
      </button>
    </div>
  ),
}));

vi.mock("@core/components/tenant-context", () => ({
  TenantContextSwitcherDialog: () => null,
}));

vi.mock("@core/ui/layout/common", () => ({
  LanguageSwitcher: () => <div data-testid="language-switcher" />,
  NxThemeSwitcher: () => <div data-testid="theme-switcher" />,
}));

vi.mock("@core/ui/user-profile-dropdown", () => ({
  UserProfileDropdown: () => <div data-testid="user-profile-dropdown" />,
}));

vi.mock("@core/ui/routing-progress-bar", () => ({
  startRoutingProgress: vi.fn(),
}));

vi.mock("@core/navigation/store/useNavigationStore", () => {
  const store = {
    getState: () => ({
      activeWorkspaceKey: null,
      setActiveWorkspace: vi.fn(),
    }),
  };
  return {
    useNavigationStore: Object.assign(
      (selector: (s: Record<string, unknown>) => unknown) =>
        selector({
          recentWorkspaceKeysByContext: mockRecentByContext,
          contextKey: "tenant:ahly",
          routesContextKey: "tenant:ahly",
          previousWorkspaceKey: mockPreviousWorkspaceKey,
          workspaces: mockCachedWorkspaces,
          routeDescriptors: mockRouteDescriptors,
          recordRecentWorkspace: mockRecordRecentWorkspace,
        }),
      store
    ),
  };
});

vi.mock("@core/ui/sileo-toast", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

vi.mock("../../viewmodels/useHubPersonalFeeds", () => ({
  useHubPersonalFeeds: () => ({
    isImpersonating: mockIsImpersonating,
    isWelcomeSettled: true,
    notifications: {
      unreadCount: 1,
      items: [
        {
          id: "n-1",
          title: "Password Expiry Notice",
          body: "Rotate token in 7 days",
          category: "Security",
          isRead: false,
          actionUrl: "/account/security",
          createdAt: "2026-11-20T12:00:00Z",
        },
      ],
    },
    isLoadingNotifications: false,
    isNotificationsError: false,
    refetchNotifications: mockRefetchNotifications,
    markNotificationAsRead: mockMarkRead,
    markAllNotificationsAsRead: mockMarkAllRead,
    isMarkingNotification: false,
    activity: {
      totalCount: 1,
      entries: [
        {
          id: "a-1",
          eventType: "LoginSucceeded",
          category: "Security",
          outcome: "Success",
          endpoint: "/api/v1/auth/login",
          ipAddress: "10.0.0.15",
          timestampUtc: "2026-11-20T12:00:00Z",
        },
      ],
    },
    isLoadingActivity: false,
    isActivityError: false,
    refetchActivity: mockRefetchActivity,
  }),
}));

function makeWorkspace(
  key: string,
  nameEn: string,
  overrides: Partial<ConstructorParameters<typeof WorkspaceGroup>[0]> = {}
) {
  return new WorkspaceGroup({
    workspaceId: `id-${key}`,
    workspaceKey: key,
    workspaceNameEn: nameEn,
    workspaceNameAr: nameEn,
    workspaceIcon: "Layers",
    workspaceSortOrder: 1,
    colorHue: 145,
    colorChroma: 0.14,
    workspaceType: "Module",
    menuItems: [],
    isLocked: false,
    homeRoute: `/${key}`,
    platformHomeRoute: null,
    effectiveHomeRoute: `/${key}`,
    isPinned: false,
    pinSortOrder: null,
    accessibleItemCount: 3,
    ...overrides,
  });
}

describe("hub-plurals — Unicode CLDR Arabic & English pluralization", () => {
  it("resolves all six Arabic CLDR plural forms cleanly", () => {
    const t = (key: string, params?: Record<string, string | number>) =>
      params?.count !== undefined ? `${key}:${params.count}` : key;

    expect(formatHubItemCount(0, "ar", t)).toBe("workspaceHub.items.zero:0");
    expect(formatHubItemCount(1, "ar", t)).toBe("workspaceHub.items.one:1");
    expect(formatHubItemCount(2, "ar", t)).toBe("workspaceHub.items.two:2");
    expect(formatHubItemCount(5, "ar", t)).toBe("workspaceHub.items.few:5");
    expect(formatHubItemCount(15, "ar", t)).toBe("workspaceHub.items.many:15");
    expect(formatHubItemCount(100, "ar", t)).toBe("workspaceHub.items.other:100");

    expect(formatPinnedWorkspaceCount(0, "ar", t)).toBe("workspaceHub.pinned.apps_zero:0");
    expect(formatPinnedWorkspaceCount(2, "ar", t)).toBe("workspaceHub.pinned.apps_two:2");
  });
});

describe("WorkspaceHubView — Standalone Odoo x Nexus Launchpad", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsImpersonating = false;
    mockPermissions = [];
    mockPreviousWorkspaceKey = null;
    mockRecentByContext = { "tenant:ahly": ["venue"] };
    mockCachedWorkspaces = new Map();
    mockRouteDescriptors = new Map([
      [
        "/venue/facilities",
        {
          route: "/venue/facilities",
          accessState: "authorized",
          workspaceKey: "venue",
          requiresTenantContext: true,
        },
      ],
      [
        "/venue/courts",
        {
          route: "/venue/courts",
          accessState: "authorized",
          workspaceKey: "venue",
          requiresTenantContext: true,
        },
      ],
    ]);

    const venueMenu = new MenuItem({
      id: "m-venue-cal",
      slug: "venue-calendar",
      name: "Calendar Grid",
      nameEn: "Calendar Grid",
      nameAr: "التقويم",
      href: "/venue/calendar",
      icon: "Calendar",
      order: 1,
      resource: "venue.calendar",
      actions: null,
      children: [],
    });

    mockWorkspaceGroups = [
      makeWorkspace("academy", "Academy", { workspaceSortOrder: 1, isPinned: false }),
      makeWorkspace("venue", "Venue Operations", {
        workspaceSortOrder: 2,
        isPinned: true,
        pinSortOrder: 1,
        menuItems: [venueMenu],
      }),
      makeWorkspace("crm", "Enterprise CRM", { workspaceSortOrder: 3, isLocked: true }),
    ];
  });

  it("renders single <main id='hub-content'>, unified zero-duplicate squircles sorted pinned-first, and hides recent strip with <2 items", () => {
    render(<WorkspaceHubView />);

    const mains = screen.getAllByRole("main");
    expect(mains).toHaveLength(1);
    expect(mains[0]).toHaveAttribute("id", "hub-content");
    expect(mains[0]).toHaveAttribute("tabindex", "-1");

    expect(mockSwitchWorkspace).not.toHaveBeenCalled();
    expect(screen.queryByText("Enterprise CRM")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hub-recent-workspaces-strip")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hub-typeahead-input")).not.toBeInTheDocument();

    // Pinned Venue Operations renders ONCE (zero duplicates) and appears before unpinned Academy
    const appsRegion = screen.getByRole("region", { name: "workspaceHub.launchpad.appsGridAria" });
    const squirclesGrid = appsRegion.firstElementChild as HTMLElement;
    expect(squirclesGrid.className).toContain("flex");
    expect(squirclesGrid.className).toContain("flex-wrap");
    expect(squirclesGrid.className).toContain("justify-center");
    expect(squirclesGrid.className).toContain("max-w-[752px]");
    expect(squirclesGrid.className).not.toContain("grid-cols-6");

    const squircles = screen.getAllByTestId("hub-app-squircle");
    expect(squircles).toHaveLength(2);
    expect(squircles[0]).toHaveTextContent("Venue Operations");
    expect(squircles[1]).toHaveTextContent("Academy");

    fireEvent.click(screen.getByRole("button", { name: /^Venue Operations$/i }));
    expect(mockSwitchWorkspace).toHaveBeenCalledWith("venue", { preserveHistory: true });
  });

  it("shows HubRecentStrip when >=2 recents exist, hides during search, and launches Type-Anywhere Quick Jump pages with <bdi dir='ltr'>", () => {
    mockRecentByContext = { "tenant:ahly": ["venue", "academy"] };
    render(<WorkspaceHubView />);

    const recentStrip = screen.getByTestId("hub-recent-workspaces-strip");
    expect(recentStrip).toBeInTheDocument();
    expect(recentStrip).toHaveTextContent("Venue Operations");
    expect(recentStrip).toHaveTextContent("Academy");

    // Typing a printable key opens & seeds Type-Anywhere input and hides recent strip
    fireEvent.keyDown(document, { key: "v" });
    const input = screen.getByTestId("hub-typeahead-input");
    expect(input).toHaveValue("v");
    expect(screen.queryByTestId("hub-recent-workspaces-strip")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "venue" } });
    const quickList = screen.getByTestId("hub-quick-jump-list");
    expect(quickList).toBeInTheDocument();
    const quickJumpHeader = screen.getByText("workspaceHub.launchpad.quickJumpTitle");
    expect(quickJumpHeader.className).toContain("text-xs");
    expect(quickJumpHeader.className).toContain("font-medium");
    expect(quickJumpHeader.className).not.toContain("uppercase");
    expect(quickJumpHeader.className).not.toContain("tracking-wider");
    expect(screen.getByText("/venue/calendar").closest("bdi")).toHaveAttribute("dir", "ltr");
    expect(screen.getByText("/venue/facilities").closest("bdi")).toHaveAttribute("dir", "ltr");

    // ArrowDown -> Enter launches the second Quick Jump page
    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(mockSetActiveWorkspace).toHaveBeenCalledWith("venue", false);
    expect(mockRouterPush).toHaveBeenCalledWith("/venue/facilities");
  });

  it("supports Return-to-Workspace pill + Esc and prevents Esc from returning while search is closing", () => {
    mockPreviousWorkspaceKey = "academy";
    render(<WorkspaceHubView />);

    const returnBtn = screen.getByTestId("hub-return-workspace-btn");
    expect(returnBtn).toHaveTextContent("workspaceHub.launchpad.returnToWorkspace:Academy");

    // Open search, type text, press Ctrl+K -> closes cleanly and clears query
    fireEvent.click(screen.getByTestId("hub-search-trigger"));
    const input = screen.getByTestId("hub-typeahead-input");
    fireEvent.change(input, { target: { value: "venue" } });
    fireEvent.keyDown(document, { key: "k", ctrlKey: true });
    expect(screen.queryByTestId("hub-typeahead-input")).not.toBeInTheDocument();

    // Open search again, press Escape -> closes search ONLY without calling switchWorkspace
    fireEvent.click(screen.getByTestId("hub-search-trigger"));
    const reopenedInput = screen.getByTestId("hub-typeahead-input");
    expect(reopenedInput).toHaveValue("");
    fireEvent.keyDown(reopenedInput, { key: "Escape" });
    expect(screen.queryByTestId("hub-typeahead-input")).not.toBeInTheDocument();
    expect(mockSwitchWorkspace).not.toHaveBeenCalled();

    // Now at rest, Escape returns to previous workspace
    fireEvent.keyDown(document, { key: "Escape" });
    expect(mockSwitchWorkspace).toHaveBeenCalledWith("academy");
  });

  it("shows locked upgrade squircles for billing admins, renders impersonation notice, and shows toast on pin error", async () => {
    expect(homeEn.workspaceHub.launchpad.quickJumpTitle).toBe("Quick jump pages");
    expect(homeEn.workspaceHub.launchpad.availableToUnlock).toBe("Available to unlock");

    mockPermissions = [SYSTEM_PERMISSIONS.BILLING_DASHBOARD_VIEW];
    mockTogglePin.mockRejectedValueOnce(new Error("Network error"));
    const { rerender } = render(<WorkspaceHubView />);

    const unlockHeading = screen.getByRole("heading", {
      name: "workspaceHub.launchpad.availableToUnlock",
    });
    expect(unlockHeading.className).toContain("text-xs");
    expect(unlockHeading.className).toContain("font-medium");
    expect(unlockHeading.className).not.toContain("uppercase");
    expect(unlockHeading.className).not.toContain("tracking-[0.08em]");
    const unlockGrid = unlockHeading.nextElementSibling as HTMLElement;
    expect(unlockGrid.className).toContain("flex");
    expect(unlockGrid.className).toContain("flex-wrap");
    expect(unlockGrid.className).toContain("justify-center");
    expect(unlockGrid.className).toContain("max-w-[752px]");

    fireEvent.click(screen.getByRole("button", { name: /^Enterprise CRM$/i }));
    expect(screen.getByTestId("upgrade-dialog")).toHaveTextContent("Enterprise CRM");
    fireEvent.click(screen.getByRole("button", { name: "confirm-upgrade" }));
    expect(mockRouterPush).toHaveBeenCalledWith("/my-subscription");

    fireEvent.click(
      screen.getByRole("button", { name: "workspaceHub.pin.pinWorkspace:Academy" })
    );
    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("workspaceHub.pin.toggleFailed");
    });

    mockIsImpersonating = true;
    rerender(<WorkspaceHubView />);
    const notice = screen.getByTestId("hub-impersonation-notice");
    expect(notice).toBeInTheDocument();
    expect(notice.className).toContain("rounded-nx-md");
    expect(notice.className).not.toContain("rounded-full");
    expect(
      screen.getByRole("button", { name: "workspaceHub.pin.unpinWorkspace:Venue Operations" })
    ).toBeDisabled();
  });

  it("renders empty state when operator has zero unlocked workspaces", () => {
    mockWorkspaceGroups = [makeWorkspace("crm", "Enterprise CRM", { isLocked: true })];
    render(<WorkspaceHubView />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("workspaceHub.emptyState")).toBeInTheDocument();
    expect(screen.getByText("workspaceHub.emptyStateHint")).toBeInTheDocument();
  });
});
