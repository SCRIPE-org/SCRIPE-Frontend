import { describe, it, expect, vi, beforeEach } from "vitest";
import { AcademyAnalyticsRepository } from "./AcademyAnalyticsRepository";
import type { IAcademyAnalyticsService } from "../../domain/interfaces/IAcademyAnalyticsService";

describe("AcademyAnalyticsRepository", () => {
  let repository: AcademyAnalyticsRepository;
  let mockService: {
    getOperationalMetrics: ReturnType<typeof vi.fn>;
    getExportUrl: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockService = {
      getOperationalMetrics: vi.fn(),
      getExportUrl: vi.fn()
    };
    repository = new AcademyAnalyticsRepository(mockService as unknown as IAcademyAnalyticsService);
  });

  it("maps metrics and guarantees zero-capacity fill rate is 0.0%", async () => {
    const rawDto = {
      totalRegisteredAthletes: 25,
      uniqueAthletesWithEnrollments: 12,
      totalEnrollmentsCount: 15,
      activeEnrollmentsCount: 15,
      totalUniqueAthletes: 10,
      multiSportAthletesCount: 3,
      enrollmentsByStatus: {},
      enrollmentsBySport: [],
      enrollmentsByProgram: [],
      enrollmentsByBranch: [],
      enrollmentsBySeason: [],
      groupCapacityUtilization: {
        totalGroups: 1,
        totalCapacity: 0,
        totalActiveMembers: 0,
        averageFillRatePercent: 0,
        groups: [
          {
            groupId: "g-zero",
            groupNameEn: "New Empty Group",
            groupNameAr: "مجموعة جديدة",
            offeringId: "off-1",
            offeringNameEn: "Trial Offering",
            branchId: "b-1",
            minCapacity: 0,
            maxCapacity: 0,
            activeMembers: 0,
            fillRatePercent: 0,
            status: "Active"
          }
        ]
      },
      trialFunnel: {
        totalTrials: 5,
        requestedCount: 2,
        scheduledCount: 1,
        completedCount: 2,
        acceptedCount: 2,
        rejectedCount: 0,
        conversionRatePercent: 100
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
        reason: "Contract pending",
        expectedMetrics: ["AttendanceRatePercent"]
      },
      metadata: {
        asOfUtc: "2026-11-08T12:00:00Z",
        tenantId: "tenant-1",
        scopedBranchIds: [],
        denominatorRules: {}
      }
    };

    mockService.getOperationalMetrics.mockResolvedValue(rawDto);

    const result = await repository.getOperationalMetrics();

    expect(result.totalRegisteredAthletes).toBe(25);
    expect(result.uniqueAthletesWithEnrollments).toBe(12);
    expect(result.totalUniqueAthletes).toBe(10);
    expect(result.multiSportAthletesCount).toBe(3);
    expect(result.groupCapacityUtilization.groups[0].fillRatePercent).toBe(0);
    expect(result.deferredCodexMetrics.attendanceRatePercent).toBeNull();
    expect(result.deferredCodexMetrics.expectedMetrics).toContain("AttendanceRatePercent");
  });
});
