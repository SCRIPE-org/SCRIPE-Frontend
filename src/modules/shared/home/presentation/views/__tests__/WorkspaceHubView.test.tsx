import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom";
import { SYSTEM_PERMISSIONS } from "@core/common/types/permissions";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { formatHubItemCount, formatPinnedWorkspaceCount } from "../../utils/hub-plurals";
import { HubSidePanel } from "../../components/HubSidePanel";
import { WorkspaceHubView } from "../WorkspaceHubView";

const mockSwitchWorkspace = vi.fn();
const mockTogglePin = vi.fn();
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
let mockNotificationsState: {
  data?: {
    unreadCount: number;
    items: Array<{
      id: string;
      title: string;
      body: string;
      category: string;
      isRead: boolean;
      actionUrl: string | null;
      createdAt: string;
    }>;
  };
  isLoading: boolean;
  isError: boolean;
} = { isLoading: false, isError: false };
let mockActivityState: {
  data?: {
    totalCount: number;
    entries: Array<{
      id: string;
      eventType: string;
      category: string;
      outcome: string;
      endpoint: string | null;
      ipAddress: string | null;
      timestampUtc: string;
    }>;
  };
  isLoading: boolean;
  isError: boolean;
} = { isLoading: false, isError: false };

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

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.count !== undefined) return `${key}:${params.count}`;
      if (params?.name !== undefined) return `${key}:${params.name}`;
      return key;
    },
    language: "en",
  }),
}));

vi.mock("@core/providers/settings-provider", () => ({
  useSettings: () => ({
    buttonStyle: "default",
    borderRadius: "default",
    animationLevel: "default",
  }),
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ user: { firstName: "Seif", username: "seif" } }),
}));

vi.mock("@core/hooks/useAdminContext", () => ({
  useAdminContext: () => ({ activeTenantId: "tenant-ahly" }),
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    hasAnyPermission: (perms: string[]) => perms.some((p) => mockPermissions.includes(p)),
  }),
}));

vi.mock("@core/providers/workspace-provider", () => ({
  useWorkspace: () => ({
    workspaceGroups: mockWorkspaceGroups,
    isLoading: false,
    togglePin: mockTogglePin,
  }),
}));

vi.mock("@core/ui/layout/nexus/use-workspace-transition", () => ({
  useWorkspaceTransition: () => ({ switchWorkspace: mockSwitchWorkspace }),
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
    notifications: mockNotificationsState.data,
    isLoadingNotifications: mockNotificationsState.isLoading,
    isNotificationsError: mockNotificationsState.isError,
    refetchNotifications: mockRefetchNotifications,
    markNotificationAsRead: mockMarkRead,
    markAllNotificationsAsRead: mockMarkAllRead,
    isMarkingNotification: false,
    activity: mockActivityState.data,
    isLoadingActivity: mockActivityState.isLoading,
    isActivityError: mockActivityState.isError,
    refetchActivity: mockRefetchActivity,
  }),
}));

function makeWorkspace(key: string, nameEn: string, overrides: Partial<ConstructorParameters<typeof WorkspaceGroup>[0]> = {}) {
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

describe("WorkspaceHubView — operational launcher, recent strip, billing guard & error recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsImpersonating = false;
    mockPermissions = [];
    mockRecentByContext = { "tenant:ahly": ["venue"] };
    mockNotificationsState = {
      data: {
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
      isLoading: false,
      isError: false,
    };
    mockActivityState = {
      data: {
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
      isLoading: false,
      isError: false,
    };
    mockWorkspaceGroups = [
      makeWorkspace("venue", "Venue Operations"),
      makeWorkspace("crm", "Enterprise CRM", { isLocked: true }),
    ];
  });

  it("never auto-redirects single unlocked workspace, hides locked tiles without billing permissions, renders zero <main> landmarks, and preserves history on explicit click", () => {
    const { container } = render(<WorkspaceHubView />);

    expect(container.querySelectorAll("main")).toHaveLength(0);
    expect(mockSwitchWorkspace).not.toHaveBeenCalled();
    expect(screen.queryByText("Enterprise CRM")).not.toBeInTheDocument();
    expect(screen.getByTestId("hub-recent-workspaces-strip")).toBeInTheDocument();
    expect(screen.getByText("Password Expiry Notice")).toBeInTheDocument();
    expect(screen.getByText("LoginSucceeded")).toBeInTheDocument();

    const venueButtons = screen.getAllByRole("button", { name: /^Venue Operations$/i });
    expect(venueButtons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(venueButtons[venueButtons.length - 1]);
    expect(mockSwitchWorkspace).toHaveBeenCalledWith("venue", { preserveHistory: true });
  });

  it("shows locked upgrade tiles for billing admins and routes UpgradeDialog CTA to /my-subscription", () => {
    mockPermissions = [SYSTEM_PERMISSIONS.BILLING_DASHBOARD_VIEW];
    render(<WorkspaceHubView />);

    const lockedTileBtn = screen.getByRole("button", { name: /^Enterprise CRM$/i });
    fireEvent.click(lockedTileBtn);

    expect(screen.getByTestId("upgrade-dialog")).toHaveTextContent("Enterprise CRM");
    fireEvent.click(screen.getByRole("button", { name: "confirm-upgrade" }));
    expect(mockRouterPush).toHaveBeenCalledWith("/my-subscription");
  });

  it("shows toast.error when pin toggle fails and supports HubSearch clear button", async () => {
    mockTogglePin.mockRejectedValueOnce(new Error("Network error"));
    render(<WorkspaceHubView />);

    const searchInput = screen.getByRole("textbox", { name: "workspaceHub.search.placeholder" });
    fireEvent.change(searchInput, { target: { value: "Venue" } });
    fireEvent.click(screen.getByRole("button", { name: "workspaceHub.search.clear" }));
    expect(searchInput).toHaveValue("");

    fireEvent.click(
      screen.getByRole("button", { name: "workspaceHub.pin.pinWorkspace:Venue Operations" })
    );

    await waitFor(() => {
      expect(mockToastError).toHaveBeenCalledWith("workspaceHub.pin.toggleFailed");
    });
  });

  it("renders empty state when operator has zero unlocked workspaces", () => {
    mockWorkspaceGroups = [makeWorkspace("crm", "Enterprise CRM", { isLocked: true })];
    render(<WorkspaceHubView />);

    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.getByText("workspaceHub.emptyState")).toBeInTheDocument();
    expect(screen.getByText("workspaceHub.emptyStateHint")).toBeInTheDocument();
  });
});

describe("HubSidePanel — personal feed states & impersonation guard", () => {
  it("hides personal feeds and shows impersonation alert when impersonating", () => {
    render(
      <HubSidePanel
        isImpersonating={true}
        isLoadingNotifications={false}
        isNotificationsError={false}
        onRetryNotifications={vi.fn()}
        onMarkNotificationAsRead={vi.fn()}
        onMarkAllNotificationsAsRead={vi.fn()}
        isLoadingActivity={false}
        isActivityError={false}
        onRetryActivity={vi.fn()}
      />
    );

    expect(screen.getByTestId("hub-impersonation-alert")).toBeInTheDocument();
    expect(screen.queryByText("workspaceHub.notifications.title")).not.toBeInTheDocument();
    expect(screen.queryByText("workspaceHub.signInActivity.title")).not.toBeInTheDocument();
  });

  it("renders retry actions cleanly when feed endpoints error", () => {
    const retryNotif = vi.fn();
    const retryAct = vi.fn();

    render(
      <HubSidePanel
        isImpersonating={false}
        isLoadingNotifications={false}
        isNotificationsError={true}
        onRetryNotifications={retryNotif}
        onMarkNotificationAsRead={vi.fn()}
        onMarkAllNotificationsAsRead={vi.fn()}
        isLoadingActivity={false}
        isActivityError={true}
        onRetryActivity={retryAct}
      />
    );

    const retryButtons = screen.getAllByRole("button", { name: "workspaceHub.notifications.retry" });
    fireEvent.click(retryButtons[0]);
    expect(retryNotif).toHaveBeenCalledTimes(1);
  });
});
