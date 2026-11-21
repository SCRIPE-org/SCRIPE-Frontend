import * as React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { NavigationProvider, isTransientHttpError } from "../navigation-provider";
import HomePage from "@/app/(modules)/page";
import { DashboardLayout } from "@core/ui/layout/dashboard-layout";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { NavigationData } from "@core/navigation/domain/entities/NavigationData";
import { WorkspaceGroup } from "@core/navigation/domain/entities/WorkspaceGroup";
import { STORAGE_KEYS } from "@core/config/storage-keys";

let mockSearch = "";
let mockActiveTenantId: string | null = "tenant-1";
let mockCanAccessPageImpl = (_path: string) => true;
let mockHasToken = true;
let mockAccessToken: string | null = "live-jwt-token";

const mockRouterReplace = vi.fn();
const mockFetchNavigationBootstrap = vi.fn();
const mockFetchRoutes = vi.fn();
const mockFetchDefaultWorkspace = vi.fn();
const mockFetchWorkspaceMenu = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockRouterReplace,
    push: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(mockSearch),
  usePathname: () => "/",
}));

vi.mock("@core/common/secure-token-service", () => ({
  secureTokenService: {
    hasToken: () => mockHasToken,
    getAccessToken: () => mockAccessToken,
    clearTokens: () => {
      mockHasToken = false;
      mockAccessToken = null;
    },
    subscribe: () => () => {},
  },
}));

vi.mock("@core/common/broadcast-auth", () => ({
  authBroadcast: {
    onImpersonation: () => () => {},
  },
}));

vi.mock("@core/hooks/useAdminContext", () => ({
  useAdminContext: () => ({
    activeTenantId: mockActiveTenantId,
    isPlatform: mockActiveTenantId === null,
  }),
}));

vi.mock("@core/hooks/use-permissions", () => ({
  usePermissions: () => ({
    canAccessPage: (path: string) => mockCanAccessPageImpl(path),
  }),
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    navigationRepository: {
      fetchNavigationBootstrap: (...args: unknown[]) => mockFetchNavigationBootstrap(...args),
      fetchRoutes: (...args: unknown[]) => mockFetchRoutes(...args),
      fetchDefaultWorkspace: (...args: unknown[]) => mockFetchDefaultWorkspace(...args),
      fetchWorkspaceMenu: (...args: unknown[]) => mockFetchWorkspaceMenu(...args),
    },
  }),
}));

vi.mock("@core/components/tenant-context", () => ({
  NavigationErrorRecovery: ({
    error,
    onRetry,
  }: {
    error?: string | null;
    onRetry: () => void;
  }) => (
    <div data-testid="navigation-error-recovery" data-error={error ?? ""}>
      <button type="button" onClick={onRetry}>
        Retry Navigation
      </button>
    </div>
  ),
}));

vi.mock("@core/ui/layout/modules-loading-skeleton", () => ({
  ModulesLoadingSkeleton: () => <div data-testid="modules-loading-skeleton" />,
}));

// DashboardLayout shell mocks to test curtain release behavior directly
vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (k: string) => k,
    direction: "ltr" as const,
    language: "en" as const,
  }),
}));

vi.mock("@core/providers/useAdminSettingsSync", () => ({
  useAdminSettingsSync: () => ({
    isSettingsReady: false,
    isTransitioning: false,
  }),
}));

vi.mock("@core/providers/tenant-branding-provider", () => ({
  TenantBrandingProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useTenantBranding: () => ({
    isLoading: true,
  }),
}));

vi.mock("@core/ui/layout/shared/tenant-context-banner", () => ({
  TenantContextBanner: () => null,
}));

vi.mock("@core/components/GracePeriodBanner", () => ({
  GracePeriodBanner: () => null,
}));

vi.mock("@core/components/PaymentWallDialog", () => ({
  PaymentWallDialog: () => null,
}));

vi.mock("@core/hooks/use-resolved-file-url", () => ({
  useResolvedFileUrl: () => null,
}));

vi.mock("@core/ui/layout/nexus/nexus-layout", () => ({
  NexusLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="nexus-layout-shell">{children}</div>
  ),
}));

vi.mock("@core/data-exchange/presentation/components/DataExchangeFloatingDock", () => ({
  DataExchangeFloatingDock: () => null,
}));

function buildBootstrapFixture(overrides?: {
  landingRoute?: string;
  landingWsKey?: string | null;
  isEnforced?: boolean;
}) {
  const crmGroup = new WorkspaceGroup({
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
    effectiveHomeRoute: "/crm",
    isPinned: true,
    pinSortOrder: 1,
    contextScope: "TenantOnly",
    accessibleItemCount: 3,
  });

  const venueGroup = new WorkspaceGroup({
    workspaceId: "ws-venue",
    workspaceKey: "venue",
    workspaceNameEn: "Venue",
    workspaceNameAr: "المنشآت",
    workspaceIcon: "Building2",
    workspaceSortOrder: 3,
    colorHue: 140,
    colorChroma: 0.14,
    workspaceType: "Module",
    menuItems: [],
    isLocked: false,
    homeRoute: "/venue",
    platformHomeRoute: null,
    effectiveHomeRoute: "/venue",
    isPinned: false,
    pinSortOrder: null,
    contextScope: "TenantOnly",
    accessibleItemCount: 2,
  });

  return {
    navigationData: new NavigationData({
      menuItems: [],
      routes: ["/crm", "/crm/leads", "/venue"],
      workspaceGroups: [crmGroup.toData(), venueGroup.toData()],
    }),
    routes: ["/crm", "/crm/leads", "/venue", "/hub"],
    workspaceRouteMap: {
      crm: ["/crm", "/crm/leads"],
      venue: ["/venue"],
    },
    routeDescriptors: [
      {
        route: "/crm/leads",
        accessState: "authorized" as const,
        workspaceKey: "crm",
        requiredFeature: null,
        requiresTenantContext: false,
      },
      {
        route: "/venue",
        accessState: "authorized" as const,
        workspaceKey: "venue",
        requiredFeature: null,
        requiresTenantContext: false,
      },
      {
        route: "/tenants",
        accessState: "platform_context_required" as const,
        workspaceKey: "admin",
        requiredFeature: null,
        requiresTenantContext: false,
      },
    ],
    landingResolution: {
      targetKind: "workspace",
      route: overrides?.landingRoute ?? "/venue",
      workspaceKey:
        overrides?.landingWsKey !== undefined ? overrides.landingWsKey : "venue",
      sourceReason: overrides?.isEnforced ? "RoleEnforced" : "AdminPreference",
      isEnforced: Boolean(overrides?.isEnforced),
      enforcingRoleName: overrides?.isEnforced ? "Venue Staff" : null,
      wasFallbackApplied: false,
      fallbackReason: null,
    },
  };
}

describe("NavigationProvider single-pass bootstrap, app/(modules)/page.tsx & DashboardLayout error recovery", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();
    mockSearch = "";
    mockActiveTenantId = "tenant-1";
    mockCanAccessPageImpl = () => true;
    mockHasToken = true;
    mockAccessToken = "live-jwt-token";
    window.history.replaceState({}, "", "/");

    useNavigationStore.getState().reset();
    useAppStore.setState({
      user: { id: "u-1", username: "admin" } as never,
      isAuthenticated: true,
      _hasHydrated: true,
    });
  });

  it("isTransientHttpError never retries 401/403/429 and allows transient 5xx/network retries", () => {
    expect(isTransientHttpError({ statusCode: 401 })).toBe(false);
    expect(isTransientHttpError({ statusCode: 403 })).toBe(false);
    expect(isTransientHttpError({ statusCode: 429 })).toBe(false);
    expect(isTransientHttpError({ status: 400 })).toBe(false);
    expect(isTransientHttpError({ details: { statusCode: 422 } })).toBe(false);

    expect(isTransientHttpError({ statusCode: 500 })).toBe(true);
    expect(isTransientHttpError({ statusCode: 503 })).toBe(true);
    expect(isTransientHttpError({ statusCode: 408 })).toBe(true);
    expect(isTransientHttpError(new Error("Network offline"))).toBe(true);
  });

  it("NavigationProvider performs single-pass fetchNavigationBootstrap and does not retry 429/401/403, while HomePage renders NavigationErrorRecovery without loops", async () => {
    for (const statusCode of [401, 403, 429]) {
      vi.clearAllMocks();
      useNavigationStore.getState().reset();
      mockFetchNavigationBootstrap.mockRejectedValueOnce(
        Object.assign(new Error(`HTTP ${statusCode} Blocked`), { statusCode })
      );

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retryDelay: 1 } },
      });

      const { unmount } = render(
        <QueryClientProvider client={queryClient}>
          <NavigationProvider>
            <HomePage />
          </NavigationProvider>
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId("navigation-error-recovery")).toHaveAttribute(
          "data-error",
          `HTTP ${statusCode} Blocked`
        );
      });

      expect(mockFetchNavigationBootstrap).toHaveBeenCalledTimes(1);
      expect(mockFetchRoutes).not.toHaveBeenCalled();
      expect(mockFetchDefaultWorkspace).not.toHaveBeenCalled();
      expect(mockRouterReplace).not.toHaveBeenCalled();
      unmount();
    }
  });

  it("retries transient 500 up to 2 times and settles cleanly when bootstrap succeeds on retry", async () => {
    const boot = buildBootstrapFixture({ landingRoute: "/venue", landingWsKey: "venue" });
    mockFetchNavigationBootstrap
      .mockRejectedValueOnce(Object.assign(new Error("HTTP 500"), { statusCode: 500 }))
      .mockResolvedValueOnce(boot);

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retryDelay: 5 } },
    });

    render(
      <QueryClientProvider client={queryClient}>
        <NavigationProvider>
          <HomePage />
        </NavigationProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith("/venue");
    });
    expect(mockFetchNavigationBootstrap).toHaveBeenCalledTimes(2);
    expect(mockFetchRoutes).not.toHaveBeenCalled();
  });

  it("Tier 1 authorized ?redirect= beats Tier 2 enforced landing, and unauthorized ?redirect= falls back safely", async () => {
    mockSearch = `redirect=${encodeURIComponent("/crm/leads?tab=open")}`;
    window.history.replaceState({}, "", `/?${mockSearch}`);
    const boot = buildBootstrapFixture({
      landingRoute: "/venue",
      landingWsKey: "venue",
      isEnforced: true,
    });
    mockFetchNavigationBootstrap.mockResolvedValue(boot);

    const queryClient = new QueryClient();
    const { unmount } = render(
      <QueryClientProvider client={queryClient}>
        <NavigationProvider>
          <HomePage />
        </NavigationProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith("/crm/leads?tab=open");
    });
    expect(mockFetchNavigationBootstrap).toHaveBeenCalledWith("/crm/leads?tab=open");
    unmount();

    // Unauthorized/wrong-context ?redirect=/tenants falls back cleanly to Tier 2 enforced /venue
    vi.clearAllMocks();
    useNavigationStore.getState().reset();
    mockSearch = `redirect=${encodeURIComponent("/tenants")}`;
    window.history.replaceState({}, "", `/?${mockSearch}`);
    mockFetchNavigationBootstrap.mockResolvedValue(boot);

    const { unmount: unmountWrongCtx } = render(
      <QueryClientProvider client={new QueryClient()}>
        <NavigationProvider>
          <HomePage />
        </NavigationProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith("/venue");
    });
    expect(mockRouterReplace).not.toHaveBeenCalledWith("/tenants");
    unmountWrongCtx();

    // PBAC-denied ?redirect=/crm/leads falls back to Tier 2 enforced /venue without looping
    vi.clearAllMocks();
    useNavigationStore.getState().reset();
    mockCanAccessPageImpl = (path: string) => path !== "/crm/leads";
    mockSearch = `redirect=${encodeURIComponent("/crm/leads")}`;
    window.history.replaceState({}, "", `/?${mockSearch}`);
    mockFetchNavigationBootstrap.mockResolvedValue(boot);

    render(
      <QueryClientProvider client={new QueryClient()}>
        <NavigationProvider>
          <HomePage />
        </NavigationProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith("/venue");
    });
    expect(mockRouterReplace).not.toHaveBeenCalledWith("/crm/leads");
  });

  it("retry action on NavigationErrorRecovery recovers cleanly without redirect loops", async () => {
    mockFetchNavigationBootstrap
      .mockRejectedValueOnce(Object.assign(new Error("503 Unavailable"), { statusCode: 429 }))
      .mockResolvedValueOnce(buildBootstrapFixture({ landingRoute: "/hub", landingWsKey: null }));

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <NavigationProvider>
          <HomePage />
        </NavigationProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("navigation-error-recovery")).toBeInTheDocument();
    });

    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Retry Navigation" }));
    });

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith("/hub");
    });
  });

  it("DashboardLayout releases fresh-login blocking curtain immediately when routesError is set", () => {
    sessionStorage.setItem(STORAGE_KEYS.JUST_LOGGED_IN, "1");
    useNavigationStore.setState({
      isInitialLoading: true,
      routesLoadedAt: null,
      routesError: "503 Service Unavailable",
    });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <DashboardLayout>
          <div data-testid="recovery-child">Recovery Surface</div>
        </DashboardLayout>
      </QueryClientProvider>
    );

    expect(screen.getByTestId("nexus-layout-shell")).toBeInTheDocument();
    expect(screen.getByTestId("recovery-child")).toBeInTheDocument();
  });

  it("auto-fetches persisted 'admin' workspace on /overview reload when bootstrap pre-hydrated 'crm'", async () => {
    window.history.replaceState({}, "", "/overview");
    useNavigationStore.setState({ activeWorkspaceKey: "admin" });

    const adminStub = new WorkspaceGroup({
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
      effectiveHomeRoute: "/overview",
      isPinned: false,
      pinSortOrder: null,
      contextScope: "Both",
      accessibleItemCount: 2,
    });
    const crmPrehydrated = new WorkspaceGroup({
      workspaceId: "ws-crm",
      workspaceKey: "crm",
      workspaceNameEn: "CRM",
      workspaceNameAr: "المبيعات",
      workspaceIcon: "Users",
      workspaceSortOrder: 2,
      colorHue: 180,
      colorChroma: 0.14,
      workspaceType: "Module",
      menuItems: [
        {
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
        },
      ],
      isLocked: false,
      homeRoute: "/crm",
      platformHomeRoute: null,
      effectiveHomeRoute: "/crm",
      isPinned: false,
      pinSortOrder: null,
      contextScope: "TenantOnly",
      accessibleItemCount: 3,
    });

    mockFetchNavigationBootstrap.mockResolvedValue({
      navigationData: new NavigationData({
        menuItems: crmPrehydrated.menuItems.map((m) => m.toData()),
        routes: ["/crm", "/crm/leads", "/overview"],
        workspaceGroups: [adminStub.toData(), crmPrehydrated.toData()],
      }),
      routes: ["/crm", "/crm/leads", "/overview", "/hub"],
      workspaceRouteMap: { admin: ["/overview"], crm: ["/crm", "/crm/leads"] },
      routeDescriptors: [],
      landingResolution: {
        targetKind: "workspace",
        route: "/crm",
        workspaceKey: "crm",
        sourceReason: "RoleEnforced",
        isEnforced: true,
        enforcingRoleName: "Sales Rep",
        wasFallbackApplied: false,
        fallbackReason: null,
      },
    });
    mockFetchWorkspaceMenu.mockResolvedValue(
      new NavigationData({
        menuItems: [],
        routes: ["/overview"],
        workspaceGroups: [adminStub.toData(), crmPrehydrated.toData()],
      })
    );

    render(
      <QueryClientProvider client={new QueryClient()}>
        <NavigationProvider>
          <div data-testid="overview-shell" />
        </NavigationProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockFetchWorkspaceMenu).toHaveBeenCalledWith("admin");
    });
  });

  it("preserves Tier 1 ?redirect= when isReady transitions true on /login before navigating to '/'", async () => {
    mockSearch = `redirect=${encodeURIComponent("/crm/leads")}`;
    window.history.replaceState({}, "", `/login?${mockSearch}`);
    useAppStore.setState({ isAuthenticated: false, _hasHydrated: true });

    const boot = buildBootstrapFixture({
      landingRoute: "/crm/leads",
      landingWsKey: "crm",
    });
    mockFetchNavigationBootstrap.mockResolvedValue(boot);

    const queryClient = new QueryClient();
    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <NavigationProvider>
          <div data-testid="login-stage" />
        </NavigationProvider>
      </QueryClientProvider>
    );

    expect(mockFetchNavigationBootstrap).not.toHaveBeenCalled();

    // Admin signs in while browser is still at /login?redirect=%2Fcrm%2Fleads
    await act(async () => {
      useAppStore.setState({ isAuthenticated: true });
    });

    await waitFor(() => {
      expect(mockFetchNavigationBootstrap).toHaveBeenCalledWith("/crm/leads");
    });

    // Next.js navigates to /?redirect=%2Fcrm%2Fleads using the already-warm single-pass cache
    window.history.replaceState({}, "", `/?${mockSearch}`);
    rerender(
      <QueryClientProvider client={queryClient}>
        <NavigationProvider>
          <HomePage />
        </NavigationProvider>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(mockRouterReplace).toHaveBeenCalledWith("/crm/leads");
    });
    expect(mockFetchNavigationBootstrap).toHaveBeenCalledTimes(1);
  });

  it("never fires 401 boot workspace fetch when access token is missing or cleared by a child effect during session transition", () => {
    const adminStub = new WorkspaceGroup({
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
      accessibleItemCount: 2,
    });

    // Unhydrated workspace present while token has been cleared before parent effect fires
    mockHasToken = false;
    mockAccessToken = null;
    useNavigationStore.setState({
      workspaceGroups: [adminStub],
      workspaces: new Map(),
      activeWorkspaceKey: "admin",
      isInitialLoading: false,
    });

    const ClearOnMountChild = () => {
      React.useEffect(() => {
        mockHasToken = false;
        mockAccessToken = null;
        useAppStore.getState().logout();
      }, []);
      return <div data-testid="login-mount-child" />;
    };

    render(
      <QueryClientProvider client={new QueryClient()}>
        <NavigationProvider>
          <ClearOnMountChild />
        </NavigationProvider>
      </QueryClientProvider>
    );

    expect(mockFetchWorkspaceMenu).not.toHaveBeenCalled();
    expect(mockFetchNavigationBootstrap).not.toHaveBeenCalled();

    // Even if store still looks authenticated momentarily while token is absent (or transitioning)
    mockHasToken = true;
    mockAccessToken = null;
    useAppStore.setState({ isAuthenticated: true, isAuthTransitioning: true, _hasHydrated: true });

    render(
      <QueryClientProvider client={new QueryClient()}>
        <NavigationProvider>
          <div data-testid="transition-child" />
        </NavigationProvider>
      </QueryClientProvider>
    );

    expect(mockFetchWorkspaceMenu).not.toHaveBeenCalled();
  });
});
