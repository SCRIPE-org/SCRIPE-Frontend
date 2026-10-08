/* eslint-disable @typescript-eslint/no-explicit-any */
import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { usePlatformCommandCenterViewModel } from "./usePlatformCommandCenterViewModel";
import { useOverviewViewModel } from "./useOverviewViewModel";
import { usePlatformHealthViewModel } from "@modules/monitoring/platform-health/src/presentation/viewmodels/usePlatformHealthViewModel";
import { useI18n } from "@core/providers/i18n-provider";
import { useQuery } from "@tanstack/react-query";

vi.mock("./useOverviewViewModel", () => ({
  useOverviewViewModel: vi.fn(),
}));

vi.mock("./useOverviewRealtime", () => ({
  useOverviewRealtime: vi.fn(),
}));

vi.mock(
  "@modules/monitoring/platform-health/src/presentation/viewmodels/usePlatformHealthViewModel",
  () => ({
    usePlatformHealthViewModel: vi.fn(),
  })
);

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: vi.fn(),
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: vi.fn(),
  };
});

describe("usePlatformCommandCenterViewModel", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useI18n).mockReturnValue({
      t: (key: string) => key,
      language: "en",
      direction: "ltr",
      setLanguage: vi.fn(),
    } as any);

    vi.mocked(useQuery).mockReturnValue({
      data: {
        items: [
          { id: "t1", name: "Acme", countryCode: "US", status: "Active" },
          { id: "t2", name: "City Club", countryCode: "EG", status: "Suspended" },
        ],
        totalCount: 2,
      },
      isLoading: false,
    } as any);

    vi.mocked(useOverviewViewModel).mockReturnValue({
      summary: {
        data: {
          totalTenants: 120,
          activeTenants: 115,
          suspendedTenants: 5,
          totalUsers: 1450,
          activeAdmins: 42,
          loginsToday: 320,
          failedLogins24h: 3,
          systemHealth: "Operational",
        },
        isLoading: false,
        isError: false,
      },
      recentActivity: {
        data: [
          {
            id: "act-1",
            entityType: "Tenant",
            action: "Updated",
            userEmail: "admin@scripe.com",
            createdAt: new Date().toISOString(),
            tenantName: "Acme",
          },
        ],
        isLoading: false,
        isError: false,
      },
      loginActivity: {
        data: [],
        isLoading: false,
        isError: false,
      },
      isLoading: false,
      isError: false,
      refresh: vi.fn(),
      enabled: true,
    } as any);

    vi.mocked(usePlatformHealthViewModel).mockReturnValue({
      health: {
        status: "Healthy",
        uptimePercentage: 99.98,
        isDegraded: false,
        modules: [
          { moduleName: "Identity", status: "Healthy", isHealthy: true, responseTimeMs: 25 },
          { moduleName: "Venue", status: "Healthy", isHealthy: true, responseTimeMs: 40 },
        ],
        infrastructure: {
          database: { isConnected: true, provider: "PostgreSql" },
          redis: { isConnected: true },
        },
      },
      isLoading: false,
      isError: false,
      refresh: vi.fn(),
    } as any);
  });

  it("computes platform KPIs correctly from summary and health", () => {
    const { result } = renderHook(() => usePlatformCommandCenterViewModel());

    expect(result.current.kpis.totalTenants).toBe(120);
    expect(result.current.kpis.activeAdmins).toBe(42);
    expect(result.current.kpis.overallHealthScore).toBe("100%");
    expect(result.current.kpis.overallHealthStatus).toBe("platformCommandCenter.kpis.operational");
    expect(result.current.kpis.failedLogins24h).toBe(3);
  });

  it("filters attention alerts from telemetry", () => {
    const { result } = renderHook(() => usePlatformCommandCenterViewModel());

    expect(result.current.attentionAlerts.length).toBeGreaterThanOrEqual(1);
    const criticalAlert = result.current.attentionAlerts.find((a) => a.category === "critical");
    expect(criticalAlert).toBeDefined();
    expect(criticalAlert?.href).toBe("/security");
  });

  it("supports toggling live data mode and time range", () => {
    const { result } = renderHook(() => usePlatformCommandCenterViewModel());

    expect(result.current.isLive).toBe(true);

    act(() => {
      result.current.toggleLive();
    });
    expect(result.current.isLive).toBe(false);

    act(() => {
      result.current.setTimeRangeKey("last7Days");
    });
    expect(result.current.timeRangeKey).toBe("last7Days");
  });

  it("provides geographic region breakdown from tenants data", () => {
    const { result } = renderHook(() => usePlatformCommandCenterViewModel());

    expect(result.current.regionNodes.length).toBeGreaterThan(0);
    const usNode = result.current.regionNodes.find((r) => r.countryName === "United States");
    expect(usNode).toBeDefined();
    expect(usNode?.tenantCount).toBe(1);
  });
});
