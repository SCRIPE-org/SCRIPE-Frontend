import React from "react";
import { renderToString } from "react-dom/server";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RouteGuard } from "../route-guard";
import type { AuthorizedRouteDescriptor } from "@core/navigation/domain/interfaces/INavigationRepository";
import { STORAGE_KEYS } from "@core/config/storage-keys";

const {
  mockRouterReplace,
  mockRouterPush,
  mockUseAppStore,
  mockUseNavigationStore,
  mockHasToken,
  mockClearTokens,
  mockGetCurrentPrincipal,
  mockRefreshToken,
  mockRefreshNavigation,
  mockQueryClear,
  mockAdminContext,
  mockRouteDescriptors,
} = vi.hoisted(() => {
  const mockRouterReplace = vi.fn();
  const mockRouterPush = vi.fn();
  const mockGetCurrentPrincipal = vi.fn();
  const mockRefreshToken = vi.fn();
  const mockRefreshNavigation = vi.fn();
  const mockQueryClear = vi.fn();
  const mockClearTokens = vi.fn();
  const mockHasToken = vi.fn(() => true);

  const mockAdminContext = {
    activeTenantId: "tenant-1" as string | null,
    contextType: "tenant" as "platform" | "tenant",
    isPlatform: false,
    isTenant: true,
    isImpersonating: false,
    activeTenantName: "Tenant One",
    isHydrated: true,
  };

  const mockAppState = {
    isAuthenticated: true,
    _hasHydrated: true,
    subscriptionStatus: null as string | null,
    mustChangePassword: false,
    defaultRedirectPath: "/overview",
    user: { id: "user-1", username: "admin" } as { id: string; username: string } | null,
    roles: [] as Array<{ id: string; roleCode: string; roleName: string }>,
    permissions: [] as string[],
    logout: vi.fn(),
    setAuth: vi.fn(),
    setSubscriptionInfo: vi.fn(),
    setMustChangePassword: vi.fn(),
  };

  const mockUseAppStore = Object.assign(
    (selector: (state: typeof mockAppState) => unknown) => selector(mockAppState),
    {
      getState: () => mockAppState,
    }
  );

  const mockRouteDescriptors = new Map<string, AuthorizedRouteDescriptor>();

  const mockNavigationState = {
    allRoutes: new Set(["/dashboard", "/activate-workspace", "/crm", "/venue", "/data-exchange", "/tenants"]),
    routeDescriptors: mockRouteDescriptors,
    workspaceRouteMap: {} as Record<string, string[]>,
    routesLoaded: true,
    routesContextKey: "tenant-1:admin" as string | null,
    routesError: null as string | null,
    isNavSyncedForContext: vi.fn(
      (expectedKey?: string | null) =>
        mockNavigationState.routesLoaded &&
        !mockNavigationState.routesError &&
        (!expectedKey || mockNavigationState.routesContextKey === expectedKey)
    ),
    getRouteDescriptor: vi.fn((p: string) => mockRouteDescriptors.get(p) ?? null),
    hasRouteAccess: vi.fn((_p: string) => true),
    reset: vi.fn(),
  };

  const mockUseNavigationStore = Object.assign(
    (selector: (state: typeof mockNavigationState) => unknown) => selector(mockNavigationState),
    {
      getState: () => mockNavigationState,
    }
  );

  return {
    mockRouterReplace,
    mockRouterPush,
    mockUseAppStore,
    mockUseNavigationStore,
    mockHasToken,
    mockClearTokens,
    mockGetCurrentPrincipal,
    mockRefreshToken,
    mockRefreshNavigation,
    mockQueryClear,
    mockAdminContext,
    mockRouteDescriptors,
  };
});

let currentPathname = "/dashboard";
let mockCanAccessPage = vi.fn((_p?: string) => true);

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    push: mockRouterPush,
  }),
  usePathname: () => currentPathname,
}));

vi.mock("@core/store/useAppStore", () => ({
  useAppStore: mockUseAppStore,
}));

vi.mock("@core/navigation/store/useNavigationStore", () => ({
  useNavigationStore: mockUseNavigationStore,
}));

vi.mock("@core/hooks/useAdminContext", () => ({
  useAdminContext: () => mockAdminContext,
}));

vi.mock("@core/providers/navigation-provider", () => ({
  useNavigation: () => ({
    refreshNavigation: mockRefreshNavigation,
  }),
}));

vi.mock("@core/common/secure-token-service", () => ({
  secureTokenService: {
    hasToken: mockHasToken,
    clearTokens: mockClearTokens,
  },
}));

vi.mock("@core/common/broadcast-auth", () => ({
  authBroadcast: {
    onTokenRefreshed: vi.fn(),
  },
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    authRepository: {
      getCurrentPrincipal: mockGetCurrentPrincipal,
      refreshToken: mockRefreshToken,
    },
  }),
}));

vi.mock("@core/hooks/use-permissions", () => ({
  usePermissions: () => ({
    canAccessPage: (p: string) => mockCanAccessPage(p),
  }),
}));

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
  }),
}));

vi.mock("@core/common/logger", () => ({
  appLogger: {
    debug: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
    clear: mockQueryClear,
  }),
}));

vi.mock("@core/ui/loading-spinner", () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner">Loading...</div>,
}));

vi.mock("@core/ui/layout/dashboard-layout", () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

vi.mock("@core/components/tenant-context", () => ({
  TenantContextRequiredGate: ({ routePattern }: { routePattern?: string }) => (
    <div data-testid="tenant-context-gate" data-route={routePattern ?? ""} />
  ),
  PlatformContextRequiredGate: ({ routePattern }: { routePattern?: string }) => (
    <div data-testid="platform-context-gate" data-route={routePattern ?? ""} />
  ),
  FeatureUnavailableGate: ({ featureKey }: { featureKey?: string | null }) => (
    <div data-testid="feature-unavailable-gate" data-feature={featureKey ?? ""} />
  ),
  NavigationErrorRecovery: ({
    error,
    onRetry,
  }: {
    error?: string | null;
    onRetry: () => void;
  }) => (
    <div data-testid="nav-error-recovery" data-error={error ?? ""}>
      <button onClick={onRetry}>Retry Navigation</button>
    </div>
  ),
}));

describe("RouteGuard - Hardened Phase 2 Option C Security & Context Gates", () => {
  const originalEnv = process.env.NODE_ENV;

  beforeEach(() => {
    vi.clearAllMocks();
    currentPathname = "/dashboard";
    window.history.replaceState({}, "", "/");
    mockCanAccessPage.mockReset();
    mockCanAccessPage.mockReturnValue(true);

    mockAdminContext.activeTenantId = "tenant-1";
    mockAdminContext.contextType = "tenant";
    mockAdminContext.isPlatform = false;
    mockAdminContext.isTenant = true;

    const appState = mockUseAppStore.getState();
    appState.isAuthenticated = true;
    appState._hasHydrated = true;
    appState.subscriptionStatus = null;
    appState.mustChangePassword = false;
    appState.defaultRedirectPath = "/overview";
    appState.user = { id: "user-1", username: "admin" };
    appState.permissions = [];
    appState.roles = [];

    mockHasToken.mockReturnValue(true);

    mockRouteDescriptors.clear();
    const navState = mockUseNavigationStore.getState();
    navState.routesLoaded = true;
    navState.routesContextKey = "tenant-1:admin";
    navState.routesError = null;
    navState.workspaceRouteMap = {};
    navState.hasRouteAccess.mockReset();
    navState.hasRouteAccess.mockReturnValue(true);
    navState.getRouteDescriptor.mockImplementation((p: string) => mockRouteDescriptors.get(p) ?? null);
    navState.isNavSyncedForContext.mockImplementation(
      (expectedKey?: string | null) =>
        navState.routesLoaded &&
        !navState.routesError &&
        (!expectedKey || navState.routesContextKey === expectedKey)
    );
  });

  afterEach(() => {
    vi.stubEnv("NODE_ENV", originalEnv ?? "test");
  });

  it("allows access when subscription status is normal", () => {
    mockUseAppStore.getState().subscriptionStatus = "Active";

    render(
      <RouteGuard>
        <div data-testid="child-content">Dashboard Content</div>
      </RouteGuard>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("redirects to /activate-workspace when subscription is PendingPayment on /dashboard", () => {
    mockUseAppStore.getState().subscriptionStatus = "PendingPayment";
    currentPathname = "/dashboard";

    render(
      <RouteGuard>
        <div data-testid="child-content">Dashboard Content</div>
      </RouteGuard>
    );

    expect(mockRouterReplace).toHaveBeenCalledWith("/activate-workspace");
    expect(screen.queryByTestId("child-content")).not.toBeInTheDocument();
  });

  it("renders /activate-workspace normally when subscription is PendingPayment", () => {
    mockUseAppStore.getState().subscriptionStatus = "PendingPayment";
    currentPathname = "/activate-workspace";

    render(
      <RouteGuard>
        <div data-testid="child-content">Activation Content</div>
      </RouteGuard>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("allows unauthenticated access to public routes including /bookings/guest and /signup/finalize", () => {
    mockUseAppStore.getState().isAuthenticated = false;
    mockHasToken.mockReturnValue(false);

    for (const pubPath of ["/bookings/guest", "/signup/finalize", "/authorize", "/terms", "/privacy"]) {
      currentPathname = pubPath;
      const { unmount } = render(
        <RouteGuard>
          <div data-testid="public-content">{pubPath}</div>
        </RouteGuard>
      );
      expect(screen.getByTestId("public-content")).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
      expect(mockRouterReplace).not.toHaveBeenCalled();
      unmount();
    }
  });

  it("allows unknown routes (not in APP_ROUTE_MANIFEST) to pass through cleanly for 404 rendering without redirecting", () => {
    mockUseAppStore.getState().isAuthenticated = false;
    mockHasToken.mockReturnValue(false);
    currentPathname = "/nonexistent-404-page/sub";

    render(
      <RouteGuard>
        <div data-testid="not-found-content">404 Not Found</div>
      </RouteGuard>
    );

    expect(screen.getByTestId("not-found-content")).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("redirects unauthenticated access on protected routes to /login with safe encoded ?redirect= target", () => {
    mockUseAppStore.getState().isAuthenticated = false;
    mockHasToken.mockReturnValue(false);
    currentPathname = "/venue";
    window.history.replaceState({}, "", "/venue?view=week");

    render(
      <RouteGuard>
        <div data-testid="venue-content">Venue Content</div>
      </RouteGuard>
    );

    expect(screen.queryByTestId("venue-content")).not.toBeInTheDocument();
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/login?redirect=${encodeURIComponent("/venue?view=week")}`
    );
  });

  it("gates /dashboard-preview and /studio-preview behind authentication and blocks /sileo-playground in production", () => {
    mockUseAppStore.getState().isAuthenticated = false;
    mockHasToken.mockReturnValue(false);
    currentPathname = "/dashboard-preview";

    const { unmount } = render(
      <RouteGuard>
        <div data-testid="preview-content">Preview</div>
      </RouteGuard>
    );
    expect(screen.queryByTestId("preview-content")).not.toBeInTheDocument();
    expect(mockRouterPush).toHaveBeenCalledWith(
      `/login?redirect=${encodeURIComponent("/dashboard-preview")}`
    );
    unmount();

    vi.clearAllMocks();
    mockUseAppStore.getState().isAuthenticated = true;
    mockHasToken.mockReturnValue(true);
    vi.stubEnv("NODE_ENV", "production");
    currentPathname = "/sileo-playground";

    render(
      <RouteGuard>
        <div data-testid="sileo-content">Playground</div>
      </RouteGuard>
    );
    expect(screen.queryByTestId("sileo-content")).not.toBeInTheDocument();
    expect(mockRouterReplace).toHaveBeenCalledWith("/not-found");
  });

  it("eliminates old SYSTEM_PAGES /crm and /settings prefix bypasses and enforces fail-closed PBAC", () => {
    currentPathname = "/crm";
    mockCanAccessPage.mockReturnValue(false);

    const { unmount } = render(
      <RouteGuard>
        <div data-testid="crm-content">CRM Overview</div>
      </RouteGuard>
    );
    expect(screen.queryByTestId("crm-content")).not.toBeInTheDocument();
    expect(mockRouterPush).toHaveBeenCalledWith("/not-authorized");
    unmount();

    vi.clearAllMocks();
    currentPathname = "/settings/permissions";
    mockCanAccessPage.mockReturnValue(false);
    render(
      <RouteGuard>
        <div data-testid="settings-perm-content">Permissions</div>
      </RouteGuard>
    );
    expect(screen.queryByTestId("settings-perm-content")).not.toBeInTheDocument();
    expect(mockRouterPush).toHaveBeenCalledWith("/not-authorized");
  });

  it("allows /overview and exact /settings as explicit shell_authenticated routes when PBAC allows", () => {
    mockUseNavigationStore.getState().hasRouteAccess.mockReturnValue(false);
    for (const shellPath of ["/overview", "/settings"]) {
      currentPathname = shellPath;
      const { unmount } = render(
        <RouteGuard>
          <div data-testid="shell-content">{shellPath}</div>
        </RouteGuard>
      );
      expect(screen.getByTestId("shell-content")).toBeInTheDocument();
      expect(mockRouterPush).not.toHaveBeenCalled();
      unmount();
    }
  });

  it("blocks protected children during SSR pre-mount (!isMounted) while allowing public pages", () => {
    currentPathname = "/crm";
    const protectedHtml = renderToString(
      <RouteGuard>
        <div data-testid="protected-ssr">Secret CRM Data</div>
      </RouteGuard>
    );
    expect(protectedHtml).not.toContain("Secret CRM Data");
    expect(protectedHtml).toContain("loading-spinner");

    currentPathname = "/login";
    mockUseAppStore.getState().isAuthenticated = false;
    mockHasToken.mockReturnValue(false);
    const publicHtml = renderToString(
      <RouteGuard>
        <div data-testid="public-ssr">Login Screen</div>
      </RouteGuard>
    );
    expect(publicHtml).toContain("Login Screen");
  });

  it("never flashes unauthorized children synchronously when transitioning from an allowed route to a denied route", () => {
    let deniedRenderCount = 0;
    const DeniedChild = () => {
      deniedRenderCount += 1;
      return <div data-testid="denied-child">Denied</div>;
    };

    currentPathname = "/overview";
    const { rerender } = render(
      <RouteGuard>
        <div data-testid="overview-child">Overview</div>
      </RouteGuard>
    );
    expect(screen.getByTestId("overview-child")).toBeInTheDocument();

    currentPathname = "/crm";
    mockCanAccessPage.mockImplementation((p?: string) => p !== "/crm");
    rerender(
      <RouteGuard>
        <DeniedChild />
      </RouteGuard>
    );

    expect(deniedRenderCount).toBe(0);
    expect(screen.queryByTestId("denied-child")).not.toBeInTheDocument();
    expect(mockRouterPush).toHaveBeenCalledWith("/not-authorized");
  });

  it("blocks fail-open when navigation is not yet synced for current contextKey and recovers with NavigationErrorRecovery on routesError", () => {
    currentPathname = "/crm";
    const navState = mockUseNavigationStore.getState();
    navState.isNavSyncedForContext.mockReturnValue(false);

    const { rerender } = render(
      <RouteGuard>
        <div data-testid="crm-content">CRM</div>
      </RouteGuard>
    );
    expect(screen.queryByTestId("crm-content")).not.toBeInTheDocument();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();

    navState.routesError = "503 Navigation Service Unavailable";
    rerender(
      <RouteGuard>
        <div data-testid="crm-content">CRM</div>
      </RouteGuard>
    );

    expect(screen.queryByTestId("crm-content")).not.toBeInTheDocument();
    const recovery = screen.getByTestId("nav-error-recovery");
    expect(recovery).toBeInTheDocument();
    expect(recovery).toHaveAttribute("data-error", "503 Navigation Service Unavailable");

    fireEvent.click(screen.getByText("Retry Navigation"));
    expect(mockRefreshNavigation).toHaveBeenCalledTimes(1);
  });

  it("renders TenantContextRequiredGate inside DashboardLayout without mounting the child page", () => {
    let childMounted = 0;
    const SensitivePage = () => {
      childMounted += 1;
      return <div data-testid="data-exchange-page">Data Exchange</div>;
    };

    currentPathname = "/data-exchange";
    mockRouteDescriptors.set("/data-exchange", {
      route: "/data-exchange",
      accessState: "tenant_context_required",
      requiresTenantContext: true,
    });
    mockUseNavigationStore.getState().hasRouteAccess.mockReturnValue(false);

    render(
      <RouteGuard>
        <SensitivePage />
      </RouteGuard>
    );

    expect(childMounted).toBe(0);
    expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
    expect(screen.getByTestId("tenant-context-gate")).toHaveAttribute("data-route", "/data-exchange");
    expect(mockRouterPush).not.toHaveBeenCalled();
  });

  it("renders PlatformContextRequiredGate and FeatureUnavailableGate inside DashboardLayout without mounting the child page", () => {
    let childMounted = 0;
    const GuardedPage = () => {
      childMounted += 1;
      return <div data-testid="guarded-page">Guarded</div>;
    };

    currentPathname = "/tenants";
    mockRouteDescriptors.set("/tenants", {
      route: "/tenants",
      accessState: "platform_context_required",
      requiresTenantContext: false,
    });
    mockUseNavigationStore.getState().hasRouteAccess.mockReturnValue(false);

    const { rerender } = render(
      <RouteGuard>
        <GuardedPage />
      </RouteGuard>
    );

    expect(childMounted).toBe(0);
    expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
    expect(screen.getByTestId("platform-context-gate")).toHaveAttribute("data-route", "/tenants");

    currentPathname = "/crm";
    mockRouteDescriptors.set("/crm", {
      route: "/crm",
      accessState: "feature_disabled",
      requiredFeature: "CRM.Core",
      requiresTenantContext: false,
    });
    rerender(
      <RouteGuard>
        <GuardedPage />
      </RouteGuard>
    );

    expect(childMounted).toBe(0);
    expect(screen.getByTestId("feature-unavailable-gate")).toHaveAttribute("data-feature", "CRM.Core");
  });

  it("redirects to accessible sibling/global fallback when menu_bound route is excluded without special gate", () => {
    const navState = mockUseNavigationStore.getState();
    navState.hasRouteAccess.mockImplementation((p: string) => p === "/overview");
    navState.workspaceRouteMap = { admin: ["/overview"] };
    currentPathname = "/crm";
    mockRouteDescriptors.clear();

    render(
      <RouteGuard>
        <div data-testid="crm-content">CRM</div>
      </RouteGuard>
    );

    expect(screen.queryByTestId("crm-content")).not.toBeInTheDocument();
    expect(mockRouterReplace).toHaveBeenCalledWith("/overview");
  });

  it("performs complete forceLogout cleanup (including app-storage) and redirects cleanly when Case 4 returns null principal", async () => {
    const removeItemSpy = vi.spyOn(window.localStorage, "removeItem");
    window.localStorage.setItem(STORAGE_KEYS.APP_STORE, JSON.stringify({ state: { isAuthenticated: true } }));
    mockUseAppStore.getState().isAuthenticated = false;
    mockHasToken.mockReturnValue(true);
    mockGetCurrentPrincipal.mockResolvedValue(null);
    currentPathname = "/venue";

    render(
      <RouteGuard>
        <div data-testid="venue-content">Venue</div>
      </RouteGuard>
    );

    await waitFor(() => {
      expect(mockClearTokens).toHaveBeenCalled();
      expect(mockUseNavigationStore.getState().reset).toHaveBeenCalled();
      expect(mockUseAppStore.getState().logout).toHaveBeenCalled();
      expect(mockQueryClear).toHaveBeenCalled();
      expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEYS.APP_STORE);
      expect(mockRouterPush).toHaveBeenCalledWith(`/login?redirect=${encodeURIComponent("/venue")}`);
    });
  });

  it("passes principal permissions and roles directly to setAuth in Case 4 without inheriting stale permissions", async () => {
    mockUseAppStore.getState().isAuthenticated = false;
    mockUseAppStore.getState().permissions = ["tenants.delete"];
    mockHasToken.mockReturnValue(true);
    mockGetCurrentPrincipal.mockResolvedValue({
      id: "user-2",
      username: "limited",
      permissions: [],
      roles: [],
    });
    currentPathname = "/hub";

    render(
      <RouteGuard>
        <div data-testid="hub-content">Hub</div>
      </RouteGuard>
    );

    await waitFor(() => {
      expect(mockUseAppStore.getState().setAuth).toHaveBeenCalledWith(
        expect.objectContaining({ id: "user-2" }),
        [],
        []
      );
    });
  });

  it("preserves ?redirect= and cleans app-storage when Case 2 silent refresh fails", async () => {
    const removeItemSpy = vi.spyOn(window.localStorage, "removeItem");
    window.localStorage.setItem(STORAGE_KEYS.APP_STORE, JSON.stringify({ state: { isAuthenticated: true } }));
    mockUseAppStore.getState().isAuthenticated = true;
    mockHasToken.mockReturnValue(false);
    mockRefreshToken.mockResolvedValue({ kind: "error", error: "expired" });
    currentPathname = "/crm";

    render(
      <RouteGuard>
        <div data-testid="crm-content">CRM</div>
      </RouteGuard>
    );

    await waitFor(() => {
      expect(mockClearTokens).toHaveBeenCalled();
      expect(mockUseAppStore.getState().logout).toHaveBeenCalled();
      expect(removeItemSpy).toHaveBeenCalledWith(STORAGE_KEYS.APP_STORE);
      expect(mockRouterPush).toHaveBeenCalledWith(`/login?redirect=${encodeURIComponent("/crm")}`);
    });
  });

  it("keeps the Account shell mounted without loading-spinner blank flash when navigating across /account/* routes", () => {
    let shellMountCount = 0;
    let shellUnmountCount = 0;
    const PersistentAccountShell = ({ children }: { children: React.ReactNode }) => {
      React.useEffect(() => {
        shellMountCount += 1;
        return () => {
          shellUnmountCount += 1;
        };
      }, []);
      return <div data-testid="persistent-account-shell">{children}</div>;
    };

    currentPathname = "/account/integrations";
    const { rerender } = render(
      <RouteGuard>
        <PersistentAccountShell>
          <div data-testid="integrations-page">Integrations</div>
        </PersistentAccountShell>
      </RouteGuard>
    );

    expect(shellMountCount).toBe(1);
    expect(shellUnmountCount).toBe(0);
    expect(screen.getByTestId("integrations-page")).toBeInTheDocument();
    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();

    for (const nextRoute of [
      "/account/integrations/new",
      "/account/integrations/pat-123",
      "/account/security",
      "/account/dossier",
    ]) {
      currentPathname = nextRoute;
      rerender(
        <RouteGuard>
          <PersistentAccountShell>
            <div data-testid="account-target-page">{nextRoute}</div>
          </PersistentAccountShell>
        </RouteGuard>
      );

      expect(screen.getByTestId("persistent-account-shell")).toBeInTheDocument();
      expect(screen.getByTestId("account-target-page")).toHaveTextContent(nextRoute);
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      expect(shellMountCount).toBe(1);
      expect(shellUnmountCount).toBe(0);
    }
  });

  it("keeps DashboardLayout shell mounted across intra-context menu_bound navigations and permission updates", () => {
    let shellMountCount = 0;
    const PersistentWorkspaceShell = ({ children }: { children: React.ReactNode }) => {
      React.useEffect(() => {
        shellMountCount += 1;
      }, []);
      return <div data-testid="persistent-workspace-shell">{children}</div>;
    };

    currentPathname = "/overview";
    const { rerender } = render(
      <RouteGuard>
        <PersistentWorkspaceShell>
          <div data-testid="workspace-page">/overview</div>
        </PersistentWorkspaceShell>
      </RouteGuard>
    );

    expect(shellMountCount).toBe(1);
    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();

    currentPathname = "/crm";
    rerender(
      <RouteGuard>
        <PersistentWorkspaceShell>
          <div data-testid="workspace-page">/crm</div>
        </PersistentWorkspaceShell>
      </RouteGuard>
    );
    expect(shellMountCount).toBe(1);
    expect(screen.getByTestId("workspace-page")).toHaveTextContent("/crm");
    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();

    mockUseAppStore.getState().permissions = ["crm.leads.view"];
    currentPathname = "/venue";
    rerender(
      <RouteGuard>
        <PersistentWorkspaceShell>
          <div data-testid="workspace-page">/venue</div>
        </PersistentWorkspaceShell>
      </RouteGuard>
    );
    expect(shellMountCount).toBe(1);
    expect(screen.getByTestId("workspace-page")).toHaveTextContent("/venue");
    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
  });

  it("still blocks unauthorized children synchronously when transitioning from an allowed Account route to a denied module route", () => {
    let deniedRenderCount = 0;
    const DeniedChild = () => {
      deniedRenderCount += 1;
      return <div data-testid="denied-child">Denied</div>;
    };

    currentPathname = "/account/integrations";
    const { rerender } = render(
      <RouteGuard>
        <div data-testid="account-integrations">Integrations</div>
      </RouteGuard>
    );
    expect(screen.getByTestId("account-integrations")).toBeInTheDocument();

    currentPathname = "/crm";
    mockCanAccessPage.mockImplementation((p?: string) => p !== "/crm");
    rerender(
      <RouteGuard>
        <DeniedChild />
      </RouteGuard>
    );

    expect(deniedRenderCount).toBe(0);
    expect(screen.queryByTestId("denied-child")).not.toBeInTheDocument();
    expect(mockRouterPush).toHaveBeenCalledWith("/not-authorized");
  });

  it("keeps persistent outer shell mounted inside RouteGuard while an inner Suspense route transition displays its skeleton", async () => {
    let resolveRoute!: (mod: { default: React.ComponentType }) => void;
    const LazyCreatePat = React.lazy(
      () =>
        new Promise<{ default: React.ComponentType }>((res) => {
          resolveRoute = res;
        })
    );

    const ShellWithSuspense = ({ children }: { children: React.ReactNode }) => (
      <div data-testid="account-shell">
        <header data-testid="account-topbar">Topbar</header>
        <aside data-testid="account-rail">Left Rail</aside>
        <React.Suspense fallback={<div data-testid="pat-create-skeleton">Skeleton</div>}>
          {children}
        </React.Suspense>
      </div>
    );

    currentPathname = "/account/integrations";
    const { rerender } = render(
      <RouteGuard>
        <ShellWithSuspense>
          <div data-testid="integrations-view">Integrations</div>
        </ShellWithSuspense>
      </RouteGuard>
    );
    expect(screen.getByTestId("account-topbar")).toBeInTheDocument();
    expect(screen.getByTestId("integrations-view")).toBeInTheDocument();

    currentPathname = "/account/integrations/new";
    rerender(
      <RouteGuard>
        <ShellWithSuspense>
          <LazyCreatePat />
        </ShellWithSuspense>
      </RouteGuard>
    );

    expect(screen.getByTestId("account-topbar")).toBeInTheDocument();
    expect(screen.getByTestId("account-rail")).toBeInTheDocument();
    expect(screen.getByTestId("pat-create-skeleton")).toBeInTheDocument();
    expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();

    resolveRoute({ default: () => <div data-testid="pat-create-view">Create PAT</div> });
    await waitFor(() => {
      expect(screen.getByTestId("pat-create-view")).toBeInTheDocument();
    });
    expect(screen.getByTestId("account-topbar")).toBeInTheDocument();
    expect(screen.getByTestId("account-rail")).toBeInTheDocument();
  });
});
