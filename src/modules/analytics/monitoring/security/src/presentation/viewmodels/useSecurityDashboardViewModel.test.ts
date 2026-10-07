import { renderHook, act } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { useSecurityDashboardViewModel } from "./useSecurityDashboardViewModel";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

vi.mock("@modules/monitoring/di", () => ({
  monitoringContainer: {
    securityRepository: {
      getSecurityEvents: vi.fn(),
      getLoginActivity: vi.fn(),
      getTopBlockedIPs: vi.fn(),
      getRecentChanges: vi.fn(),
      getSessions: vi.fn(),
      getDashboardSummary: vi.fn(),
      getAdmins: vi.fn(),
      revokeSession: vi.fn(),
      exportEndpoint: "/api/v1/Dashboard/export/security",
    },
  },
}));

vi.mock("@core/providers/tenant-context-provider", () => ({
  useCurrentTenantId: vi.fn().mockReturnValue(null),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@tanstack/react-query")>();
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useQueryClient: vi.fn(),
  };
});

describe("useSecurityDashboardViewModel", () => {
  const mockQueryClient = {
    invalidateQueries: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useQueryClient).mockReturnValue(mockQueryClient as any);

    vi.mocked(useMutation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    // Mock query calls in order of execution
    vi.mocked(useQuery).mockImplementation((options: any) => {
      const key = options.queryKey;
      if (key.includes("security-events")) {
        return {
          data: [
            { eventType: "LoginFailed", count: 2, latestOccurrence: "2026-10-05T08:00:00Z" },
            { eventType: "AccessDenied", count: 1, latestOccurrence: "2026-10-05T07:00:00Z" },
          ],
          isLoading: false,
          isRefetching: false,
          refetch: vi.fn(),
        } as any;
      }
      if (key.includes("login-activity")) {
        return {
          data: [
            { date: "2026-10-04", successCount: 40, failedCount: 1 },
            { date: "2026-10-05", successCount: 55, failedCount: 1 },
          ],
          isLoading: false,
          isRefetching: false,
          refetch: vi.fn(),
        } as any;
      }
      if (key.includes("blocked-ips")) {
        return {
          data: [
            { ipAddress: "192.168.1.100", failedCount: 5, latestAttempt: "2026-10-05T08:00:00Z", lastUsername: "admin" },
          ],
          isLoading: false,
          isRefetching: false,
          refetch: vi.fn(),
        } as any;
      }
      if (key.includes("recent-changes")) {
        return {
          data: [
            {
              id: "evt-1",
              eventType: "LoginFailed",
              username: "unknown",
              isAdmin: false,
              ipAddress: "192.168.1.100",
              isSuccess: false,
              errorMessage: "Invalid credentials",
              timestamp: "2026-10-05T08:00:00Z",
            },
          ],
          isLoading: false,
          isRefetching: false,
          refetch: vi.fn(),
        } as any;
      }
      if (key.includes("sessions")) {
        return {
          data: [
            {
              tokenId: "tok-1",
              deviceInfo: "Chrome on Windows",
              ipAddress: "127.0.0.1",
              createdAt: "2026-10-05T06:00:00Z",
              expiresAt: "2026-11-05T06:00:00Z",
              isCurrent: true,
            },
          ],
          isLoading: false,
          isRefetching: false,
          refetch: vi.fn(),
        } as any;
      }
      if (key.includes("summary")) {
        return {
          data: {
            totalAdmins: 10,
            activeAdmins: 8,
          },
          isLoading: false,
          isRefetching: false,
          refetch: vi.fn(),
        } as any;
      }
      if (key.includes("admins")) {
        return {
          data: {
            items: [
              { id: "adm-1", isTwoFactorEnabled: true },
              { id: "adm-2", isTwoFactorEnabled: false },
            ],
            totalCount: 2,
          },
          isLoading: false,
          isRefetching: false,
          refetch: vi.fn(),
        } as any;
      }
      return { data: null, isLoading: false, isRefetching: false, refetch: vi.fn() } as any;
    });
  });

  it("initializes with default 7d time horizon and computes authoritative posture KPIs", () => {
    const { result } = renderHook(() => useSecurityDashboardViewModel());

    expect(result.current.timeRange).toBe("7d");

    // Total auth = (40+1) + (55+1) = 97
    // Success = 40 + 55 = 95
    // Auth health rate = Math.round((95 / 97) * 1000) / 10 = 97.9%
    expect(result.current.kpis.totalAuthentications).toBe(97);
    expect(result.current.kpis.authHealthRate).toBe(97.9);
    expect(result.current.kpis.failedLoginsCount).toBe(2);

    // MFA: 1 enabled out of 2 total admins = 50%
    expect(result.current.kpis.mfaEnabledCount).toBe(1);
    expect(result.current.kpis.totalAdmins).toBe(2);
    expect(result.current.kpis.mfaAdoptionRate).toBe(50);

    // Active sessions: 1
    expect(result.current.kpis.activeSessionsCount).toBe(1);
    expect(result.current.kpis.securityStatus).toBe("healthy");
  });

  it("updates timeRange when setTimeRange is invoked", () => {
    const { result } = renderHook(() => useSecurityDashboardViewModel());

    act(() => {
      result.current.setTimeRange("24h");
    });
    expect(result.current.timeRange).toBe("24h");

    act(() => {
      result.current.setTimeRange("30d");
    });
    expect(result.current.timeRange).toBe("30d");
  });

  it("exposes authoritative security attention signals", () => {
    const { result } = renderHook(() => useSecurityDashboardViewModel());

    expect(result.current.attentionSignals.length).toBeGreaterThan(0);
    const ipSignal = result.current.attentionSignals.find((s) => s.ipAddress === "192.168.1.100");
    expect(ipSignal).toBeDefined();
    expect(ipSignal?.severity).toBe("medium");
  });

  it("exposes supported authentication methods and operational policies", () => {
    const { result } = renderHook(() => useSecurityDashboardViewModel());

    expect(result.current.authMethods.length).toBe(4);
    expect(result.current.authMethods.some((m) => m.id === "pwd" && m.status === "enforced")).toBe(true);
    expect(result.current.authMethods.some((m) => m.id === "mfa" && m.adoptionPercentage === 50)).toBe(true);

    expect(result.current.securityPolicies.length).toBe(4);
    expect(result.current.securityPolicies.every((p) => p.status === "enforced")).toBe(true);
  });
});
