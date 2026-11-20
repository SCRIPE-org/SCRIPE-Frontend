import React from "react";
import { act, fireEvent, render, renderHook, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  FeatureUnavailableGate,
  NavigationErrorRecovery,
  PlatformContextRequiredGate,
  TenantContextRequiredGate,
} from "../index";
import { DataExchangeTenantRequiredCard } from "@core/data-exchange/presentation/components/DataExchangeTenantRequiredCard";
import { useJobsEntityCatalog } from "@modules/admin/data-transfer/jobs/src/presentation/hooks/useJobsEntityCatalog";
import { I18nProvider } from "@core/providers/i18n-provider";
import { PermissionProvider } from "@core/providers/permission-provider";
import { TenantContextProvider } from "@core/providers/tenant-context-provider";
import { useAppStore } from "@core/store/useAppStore";
import { useNavigationStore } from "@core/navigation/store/useNavigationStore";
import { STORAGE_KEYS } from "@core/config/storage-keys";
import { TENANTS_ENDPOINTS } from "@core/config/api-endpoints/tenants.endpoints";
import { en as coreEn } from "@core/locales/en";
import { ar as coreAr } from "@core/locales/ar";

const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
};

let mockPathname = "/crm/leads";

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(),
}));

const mockApiService = {
  get: vi.fn(),
  post: vi.fn(),
  setTenantContext: vi.fn(),
};

const mockAuthRepository = {
  logout: vi.fn().mockResolvedValue(undefined),
};

const mockBroadcastTenantContext = vi.fn();
const mockClearNavigationCaches = vi.fn();
const mockListEntities = vi.fn().mockResolvedValue([]);

vi.mock("@core/providers/service-provider", () => ({
  useServices: () => ({
    apiService: mockApiService,
    authRepository: mockAuthRepository,
  }),
}));

vi.mock("@core/services/api-factory", () => ({
  broadcastTenantContext: (tenantId: string | null) => mockBroadcastTenantContext(tenantId),
}));

vi.mock("@modules/auth/core/data/utils/auth-storage-cleanup", () => ({
  clearNavigationCaches: () => mockClearNavigationCaches(),
}));

vi.mock("@modules/admin/data-transfer/di", () => ({
  getDataTransferContainer: () => ({
    dataExchangeRepository: {
      listEntities: (...args: unknown[]) => mockListEntities(...args),
    },
    entitiesRepository: {
      getAll: vi.fn().mockResolvedValue([]),
    },
  }),
}));

function renderWithProviders(
  ui: React.ReactElement,
  options?: { language?: "en" | "ar"; queryClient?: QueryClient }
) {
  const language = options?.language ?? "en";
  const queryClient =
    options?.queryClient ??
    new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

  return render(
    <QueryClientProvider client={queryClient}>
      <I18nProvider initialLanguage={language}>
        <PermissionProvider>
          <TenantContextProvider>{ui}</TenantContextProvider>
        </PermissionProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

describe("Tenant Context & Navigation Security Gates", () => {
  const originalLocation = window.location;
  let assignedHref: string | null = null;

  beforeEach(() => {
    sessionStorage.clear();
    vi.clearAllMocks();
    mockPathname = "/crm/leads";
    assignedHref = null;

    Object.defineProperty(window, "location", {
      configurable: true,
      value: {
        origin: "http://localhost:3000",
        pathname: "/crm/leads",
        search: "",
        hash: "",
        get href() {
          return assignedHref ?? "http://localhost:3000/crm/leads";
        },
        set href(value: string) {
          assignedHref = value;
        },
        reload: vi.fn(),
        assign: vi.fn(),
        replace: vi.fn(),
      },
    });

    Object.defineProperty(window, "history", {
      configurable: true,
      value: { length: 3 },
    });

    useAppStore.setState({
      isAuthenticated: true,
      _hasHydrated: true,
      permissions: [],
      roles: [],
      user: {
        id: "user-1",
        username: "operator",
        isProtected: false,
        tenantId: null,
      } as never,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
    sessionStorage.clear();
  });

  describe("TenantContextRequiredGate", () => {
    it("renders searchable inline switcher and switches in place on current URL for eligible users", async () => {
      useAppStore.setState({
        permissions: ["tenants.drill_down"],
      });

      mockApiService.get.mockImplementation(async (endpoint: string) => {
        if (endpoint === TENANTS_ENDPOINTS.TENANTS.SWITCHABLE) {
          return {
            items: [
              { id: "t-ahly", name: "Al Ahly SC", code: "AHLY", isActive: true, isSuspended: false },
              { id: "t-zamalek", name: "Zamalek SC", code: "ZAM", isActive: true, isSuspended: false },
            ],
          };
        }
        return [];
      });

      const { container } = renderWithProviders(
        <TenantContextRequiredGate routePattern="/crm/leads" />
      );

      await waitFor(() => {
        expect(screen.getByTestId("tenant-switch-option-t-ahly")).toBeInTheDocument();
      });

      expect(container.querySelector('a[href="/tenants"]')).toBeNull();

      const searchInput = screen.getByTestId("tenant-switcher-search");
      fireEvent.change(searchInput, { target: { value: "AHLY" } });

      expect(screen.getByTestId("tenant-switch-option-t-ahly")).toBeInTheDocument();
      expect(screen.queryByTestId("tenant-switch-option-t-zamalek")).not.toBeInTheDocument();

      fireEvent.click(screen.getByTestId("tenant-switch-option-t-ahly"));

      await waitFor(() => {
        expect(assignedHref).toBe("/crm/leads");
      });

      const stored = JSON.parse(sessionStorage.getItem(STORAGE_KEYS.tenant_context) || "{}");
      expect(stored.id).toBe("t-ahly");
      expect(mockBroadcastTenantContext).toHaveBeenLastCalledWith("t-ahly");
    });

    it("renders safe recovery with Hub, Back, and Sign Out (zero /tenants links) when unauthorized", () => {
      useAppStore.setState({
        permissions: ["crm.leads.view"],
      });

      const { container } = renderWithProviders(<TenantContextRequiredGate />);

      expect(screen.getByTestId("tenant-required-safe-recovery")).toBeInTheDocument();
      expect(screen.queryByTestId("tenant-switcher-list")).not.toBeInTheDocument();
      expect(container.querySelector('a[href="/tenants"]')).toBeNull();
      expect(
        screen.getByRole("heading", { name: coreEn.contextGates.tenantRequired.noPermissionTitle })
      ).toBeInTheDocument();

      fireEvent.click(screen.getByTestId("gate-go-hub"));
      expect(mockRouter.push).toHaveBeenCalledWith("/hub");

      fireEvent.click(screen.getByTestId("gate-go-back"));
      expect(mockRouter.back).toHaveBeenCalled();
    });

    it("renders safe empty recovery when eligible user has zero switchable tenants", async () => {
      useAppStore.setState({
        permissions: ["tenants.drill_down"],
      });
      mockApiService.get.mockResolvedValue({ items: [] });

      const { container } = renderWithProviders(<TenantContextRequiredGate />);

      await waitFor(() => {
        expect(screen.getByTestId("tenant-required-safe-recovery")).toBeInTheDocument();
      });

      expect(
        screen.getByRole("heading", { name: coreEn.contextGates.tenantRequired.noPermissionTitle })
      ).toBeInTheDocument();
      expect(screen.getByTestId("tenant-required-safe-recovery")).toHaveTextContent(
        coreEn.contextGates.switcher.emptyDescription
      );
      expect(container.querySelector('a[href="/tenants"]')).toBeNull();
    });

    it("renders localized Arabic RTL UI with zero raw translation key fallbacks", () => {
      useAppStore.setState({
        permissions: [],
      });

      renderWithProviders(<TenantContextRequiredGate />, { language: "ar" });

      const gate = screen.getByTestId("tenant-context-required-gate");
      expect(gate).toHaveAttribute("dir", "rtl");
      expect(
        screen.getByRole("heading", { name: coreAr.contextGates.tenantRequired.noPermissionTitle })
      ).toBeInTheDocument();
      expect(screen.getByText(coreAr.contextGates.common.returnToHub)).toBeInTheDocument();
      expect(gate.textContent).not.toContain("contextGates.");
    });
  });

  describe("FeatureUnavailableGate", () => {
    it("hides Upgrade CTA when user lacks edition or subscription permissions", () => {
      useAppStore.setState({
        permissions: ["crm.leads.view"],
      });

      renderWithProviders(<FeatureUnavailableGate featureKey="CRM.Automation" />);

      expect(screen.getByTestId("feature-unavailable-gate")).toBeInTheDocument();
      expect(screen.getByText("CRM.Automation")).toBeInTheDocument();
      expect(screen.queryByTestId("feature-gate-upgrade")).not.toBeInTheDocument();
    });

    it("navigates to /entitlements/editions/compare when user holds editions.view", () => {
      useAppStore.setState({
        permissions: ["editions.view"],
      });

      renderWithProviders(<FeatureUnavailableGate featureKey="Academy.Roster" />);

      const upgradeBtn = screen.getByTestId("feature-gate-upgrade");
      fireEvent.click(upgradeBtn);
      expect(mockRouter.push).toHaveBeenCalledWith("/entitlements/editions/compare");
    });

    it("navigates to /my-subscription for direct tenant admins with subscriptions.view", () => {
      useAppStore.setState({
        permissions: ["subscriptions.view"],
        user: {
          id: "tenant-admin-1",
          username: "club.admin",
          isProtected: false,
          tenantId: "enc-club-1",
        } as never,
      });

      renderWithProviders(<FeatureUnavailableGate />);

      fireEvent.click(screen.getByTestId("feature-gate-upgrade"));
      expect(mockRouter.push).toHaveBeenCalledWith("/my-subscription");
    });
  });

  describe("PlatformContextRequiredGate", () => {
    it("displays active tenant name and returns to platform context on current URL without /tenants detour", async () => {
      mockPathname = "/admin/editions";
      Object.defineProperty(window, "location", {
        configurable: true,
        value: {
          origin: "http://localhost:3000",
          pathname: "/admin/editions",
          search: "",
          hash: "",
          get href() {
            return assignedHref ?? "http://localhost:3000/admin/editions";
          },
          set href(value: string) {
            assignedHref = value;
          },
          reload: vi.fn(),
          assign: vi.fn(),
          replace: vi.fn(),
        },
      });

      sessionStorage.setItem(
        STORAGE_KEYS.tenant_context,
        JSON.stringify({ id: "t-ahly", name: "Al Ahly SC", switchMode: "drill_down" })
      );

      useAppStore.setState({
        permissions: ["tenants.drill_down"],
      });

      renderWithProviders(<PlatformContextRequiredGate routePattern="/admin/editions" />);

      expect(screen.getByTestId("platform-context-required-gate")).toHaveTextContent("Al Ahly SC");
      fireEvent.click(screen.getByTestId("platform-gate-exit"));

      await waitFor(() => {
        expect(sessionStorage.getItem(STORAGE_KEYS.tenant_context)).toBeNull();
      });
      expect(mockBroadcastTenantContext).toHaveBeenLastCalledWith(null);
      expect(assignedHref).toBe("/admin/editions");
      expect(assignedHref).not.toContain("/tenants");
    });

    it("supports Arabic RTL rendering", () => {
      sessionStorage.setItem(
        STORAGE_KEYS.tenant_context,
        JSON.stringify({ id: "t-ahly", name: "الأهلي", switchMode: "drill_down" })
      );
      useAppStore.setState({ permissions: ["tenants.drill_down"] });

      renderWithProviders(<PlatformContextRequiredGate />, { language: "ar" });

      const gate = screen.getByTestId("platform-context-required-gate");
      expect(gate).toHaveAttribute("dir", "rtl");
      expect(screen.getByText(coreAr.contextGates.platformRequired.returnToPlatform)).toBeInTheDocument();
      expect(gate.textContent).toContain("الأهلي");
    });

    it("hides Return to Platform Context action when user is not in a switchable tenant world", () => {
      useAppStore.setState({
        permissions: ["crm.leads.view"],
        user: {
          id: "direct-tenant-user",
          username: "direct.admin",
          isProtected: false,
          tenantId: "native-tenant-1",
          tenantName: "Native Club",
        } as never,
      });

      renderWithProviders(<PlatformContextRequiredGate routePattern="/admin/editions" />);

      expect(screen.getByTestId("platform-context-required-gate")).toHaveTextContent("Native Club");
      expect(screen.queryByTestId("platform-gate-exit")).not.toBeInTheDocument();
      expect(screen.getByTestId("gate-go-hub")).toBeInTheDocument();
    });
  });

  describe("NavigationErrorRecovery", () => {
    it("retries route fetch and performs full session cleanup on Sign Out", async () => {
      const onRetry = vi.fn();
      useNavigationStore.setState({
        allRoutes: new Set(["/crm/leads"]),
        allRoutesSorted: ["/crm/leads"],
        routesLoaded: false,
        routesError: "503 Unavailable",
      });
      sessionStorage.setItem(
        STORAGE_KEYS.tenant_context,
        JSON.stringify({ id: "t-1", name: "Club 1" })
      );

      renderWithProviders(
        <NavigationErrorRecovery error="503 Service Unavailable" onRetry={onRetry} />
      );

      expect(screen.getByTestId("navigation-error-recovery")).toHaveTextContent(
        "503 Service Unavailable"
      );

      fireEvent.click(screen.getByTestId("navigation-error-retry"));
      expect(onRetry).toHaveBeenCalledTimes(1);

      await act(async () => {
        fireEvent.click(screen.getByTestId("navigation-error-signout"));
      });

      await waitFor(() => {
        expect(mockAuthRepository.logout).toHaveBeenCalledTimes(1);
      });
      expect(sessionStorage.getItem(STORAGE_KEYS.tenant_context)).toBeNull();
      expect(mockBroadcastTenantContext).toHaveBeenLastCalledWith(null);
      expect(mockRouter.replace).toHaveBeenCalledWith("/login");
    });
  });

  describe("DataTransfer Secondary Defense & Inline Switcher Card", () => {
    it("opens shared inline switcher dialog from DataExchangeTenantRequiredCard without /tenants links", async () => {
      useAppStore.setState({
        permissions: ["tenants.drill_down"],
      });
      mockApiService.get.mockResolvedValue({
        items: [{ id: "t-dt-1", name: "Data Transfer Org", code: "DTO" }],
      });

      const { container } = renderWithProviders(
        <DataExchangeTenantRequiredCard
          title="Tenant Context Required"
          description="Select an organization first."
          switchHint="Use the switcher."
          goToTenantsLabel="Switch Organization"
          retryLabel="Retry"
          onRetry={vi.fn()}
        />
      );

      expect(container.querySelector('a[href="/tenants"]')).toBeNull();
      fireEvent.click(screen.getByTestId("tenant-required-go-tenants"));

      await waitFor(() => {
        expect(screen.getByTestId("tenant-switcher-dialog")).toBeInTheDocument();
      });
    });

    it("suppresses DataTransfer entity catalog API calls when activeTenantId is null and fetches once tenant context is active", async () => {
      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      });

      const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
          <I18nProvider initialLanguage="en">
            <PermissionProvider>
              <TenantContextProvider>{children}</TenantContextProvider>
            </PermissionProvider>
          </I18nProvider>
        </QueryClientProvider>
      );

      renderHook(() => useJobsEntityCatalog(), { wrapper });
      expect(mockListEntities).not.toHaveBeenCalled();

      sessionStorage.setItem(
        STORAGE_KEYS.tenant_context,
        JSON.stringify({ id: "t-dt-active", name: "Active DT Org", switchMode: "drill_down" })
      );
      useAppStore.setState({
        permissions: ["tenants.drill_down"],
      });

      renderHook(() => useJobsEntityCatalog(), { wrapper });

      await waitFor(() => {
        expect(mockListEntities).toHaveBeenCalledTimes(1);
      });
    });
  });
});
