import { describe, it, expect, vi, beforeEach } from "vitest";
import { AcademyAnalyticsService } from "./AcademyAnalyticsService";
import type { IApiService } from "@core/interfaces/api.interface";

describe("AcademyAnalyticsService", () => {
  let service: AcademyAnalyticsService;
  let mockApi: {
    get: ReturnType<typeof vi.fn>;
    post: ReturnType<typeof vi.fn>;
    put: ReturnType<typeof vi.fn>;
    delete: ReturnType<typeof vi.fn>;
    patch: ReturnType<typeof vi.fn>;
    getBaseUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockApi = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
      patch: vi.fn(),
      getBaseUrl: vi.fn().mockReturnValue("https://api.scripe.local/api/v1")
    };
    service = new AcademyAnalyticsService(mockApi as unknown as IApiService);
  });

  it("calls operational-metrics endpoint with optional filters", async () => {
    const mockMetrics = {
      totalRegisteredAthletes: 60,
      uniqueAthletesWithEnrollments: 45,
      totalEnrollmentsCount: 55,
      activeEnrollmentsCount: 50,
      totalUniqueAthletes: 42,
      multiSportAthletesCount: 8,
      enrollmentsByStatus: { Active: 50, Withdrawn: 5 },
      enrollmentsBySport: [],
      enrollmentsByProgram: [],
      enrollmentsByBranch: [],
      enrollmentsBySeason: [],
      groupCapacityUtilization: {
        totalGroups: 5,
        totalCapacity: 100,
        totalActiveMembers: 75,
        averageFillRatePercent: 75.0,
        groups: []
      },
      trialFunnel: {
        totalTrials: 20,
        requestedCount: 5,
        scheduledCount: 5,
        completedCount: 10,
        acceptedCount: 8,
        rejectedCount: 2,
        conversionRatePercent: 80.0
      },
      financialReceivables: {
        currencySummaries: [],
        asOfUtc: "2026-11-08T12:00:00Z"
      },
      deferredCodexMetrics: {
        attendanceRatePercent: null,
        coachSessionWorkloadHours: null,
        sessionUtilizationRatePercent: null,
        status: "DEFERRED_PENDING_CODEX_S5_S6",
        reason: "Awaiting Codex S5/S6 modules",
        expectedMetrics: ["AttendanceRatePercent", "CoachSessionWorkloadHours", "SessionUtilizationRatePercent"]
      },
      metadata: {
        asOfUtc: "2026-11-08T12:00:00Z",
        tenantId: "tenant-1",
        scopedBranchIds: [],
        denominatorRules: {}
      }
    };

    mockApi.get.mockResolvedValue(mockMetrics);

    const res = await service.getOperationalMetrics({ branchId: "branch-1" });

    expect(mockApi.get).toHaveBeenCalledWith(
      expect.stringContaining("/academy/analytics/operational-metrics?branchId=branch-1")
    );
    expect(res.totalRegisteredAthletes).toBe(60);
    expect(res.uniqueAthletesWithEnrollments).toBe(45);
    expect(res.totalEnrollmentsCount).toBe(55);
    expect(res.activeEnrollmentsCount).toBe(50);
    expect(res.totalUniqueAthletes).toBe(42);
    expect(res.multiSportAthletesCount).toBe(8);
    expect(res.deferredCodexMetrics.status).toBe("DEFERRED_PENDING_CODEX_S5_S6");
    expect(res.deferredCodexMetrics.expectedMetrics).toContain("AttendanceRatePercent");
  });

  it("constructs governed export URL with dataset parameter", () => {
    const url = service.getExportUrl("athletes", { branchId: "branch-1" });
    expect(url).toContain("/academy/analytics/operational-export");
    expect(url).toContain("dataset=athletes");
    expect(url).toContain("branchId=branch-1");
  });
});
