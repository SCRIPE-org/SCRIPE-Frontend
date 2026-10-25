import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { RouteGuard } from "../route-guard";

// Mocks
const {
  mockRouterReplace,
  mockRouterPush,
  mockUseAppStore,
  mockUseNavigationStore,
  mockHasToken,
  mockGetMe,
} = vi.hoisted(() => {
  const mockRouterReplace = vi.fn();
  const mockRouterPush = vi.fn();
  const mockGetMe = vi.fn();

  const mockAppState = {
    isAuthenticated: true,
    _hasHydrated: true,
    subscriptionStatus: null as string | null,
    mustChangePassword: false,
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

  const mockNavigationState = {
    allRoutes: new Set(["/dashboard", "/activate-workspace"]),
    workspaceRouteMap: {},
    hasRouteAccess: vi.fn(() => true),
    reset: vi.fn(),
  };

  const mockUseNavigationStore = Object.assign(
    (selector: (state: typeof mockNavigationState) => unknown) => selector(mockNavigationState),
    {
      getState: () => mockNavigationState,
    }
  );

  const mockHasToken = vi.fn(() => true);

  return {
    mockRouterReplace,
    mockRouterPush,
    mockUseAppStore,
    mockUseNavigationStore,
    mockHasToken,
    mockGetMe,
  };
});

// Configure next/navigation mock
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

vi.mock("@core/common/secure-token-service", () => ({
  secureTokenService: {
    hasToken: mockHasToken,
    clearTokens: vi.fn(),
  },
}));

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    authRepository: {
      getMe: mockGetMe,
      refreshToken: vi.fn(),
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
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({
    invalidateQueries: vi.fn(),
  }),
}));

describe("RouteGuard - Locked Billing Wall Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPathname = "/dashboard";
    mockUseAppStore.getState().subscriptionStatus = null;
    mockUseAppStore.getState().isAuthenticated = true;
    mockHasToken.mockReturnValue(true);
  });

  it("should allow access when subscription status is normal", () => {
    mockUseAppStore.getState().subscriptionStatus = "Active";

    render(
      <RouteGuard>
        <div data-testid="child-content">Dashboard Content</div>
      </RouteGuard>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("should redirect to /activate-workspace when subscription is PendingPayment and pathname is /dashboard", () => {
    mockUseAppStore.getState().subscriptionStatus = "PendingPayment";
    currentPathname = "/dashboard";

    render(
      <RouteGuard>
        <div data-testid="child-content">Dashboard Content</div>
      </RouteGuard>
    );

    expect(mockRouterReplace).toHaveBeenCalledWith("/activate-workspace");
  });

  it("should render page normally when subscription is PendingPayment and pathname is /activate-workspace", () => {
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

  it("should allow unauthenticated access to /bookings/guest without redirecting", () => {
    mockUseAppStore.getState().isAuthenticated = false;
    mockHasToken.mockReturnValue(false);
    currentPathname = "/bookings/guest";

    render(
      <RouteGuard>
        <div data-testid="guest-portal-content">Guest Portal Content</div>
      </RouteGuard>
    );

    expect(screen.getByTestId("guest-portal-content")).toBeInTheDocument();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });

  it("should redirect unauthenticated access to /venue to /login", () => {
    mockUseAppStore.getState().isAuthenticated = false;
    mockHasToken.mockReturnValue(false);
    currentPathname = "/venue";

    render(
      <RouteGuard>
        <div data-testid="venue-content">Venue Content</div>
      </RouteGuard>
    );

    expect(screen.queryByTestId("venue-content")).not.toBeInTheDocument();
    expect(mockRouterPush).toHaveBeenCalledWith("/login");
  });

  it("should enforce page permission on /party-kernel/parties and redirect to /not-authorized when user lacks access", () => {
    mockUseAppStore.getState().isAuthenticated = true;
    mockHasToken.mockReturnValue(true);
    currentPathname = "/party-kernel/parties";
    mockCanAccessPage.mockReturnValue(false);

    render(
      <RouteGuard>
        <div data-testid="party-content">Party Content</div>
      </RouteGuard>
    );

    expect(screen.queryByTestId("party-content")).not.toBeInTheDocument();
    expect(mockRouterPush).toHaveBeenCalledWith("/not-authorized");
  });

  it("should allow authenticated access to /overview as a system page without redirecting", () => {
    mockUseAppStore.getState().isAuthenticated = true;
    mockHasToken.mockReturnValue(true);
    currentPathname = "/overview";

    render(
      <RouteGuard>
        <div data-testid="overview-content">Overview Content</div>
      </RouteGuard>
    );

    expect(screen.getByTestId("overview-content")).toBeInTheDocument();
    expect(mockRouterPush).not.toHaveBeenCalled();
    expect(mockRouterReplace).not.toHaveBeenCalled();
  });
});
