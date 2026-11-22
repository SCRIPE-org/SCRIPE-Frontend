import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { AcademyOperationalMetrics } from "../../domain/entities/AcademyAnalytics";
import { AnalyticsKpiCards } from "./AnalyticsKpiCards";

const t = (key: string) => key;

function metrics(): AcademyOperationalMetrics {
  return {
    totalRegisteredAthletes: 18,
    uniqueAthletesWithEnrollments: 11,
    totalEnrollmentsCount: 15,
    activeEnrollmentsCount: 12,
    totalUniqueAthletes: 11,
    multiSportAthletesCount: 3,
    enrollmentsByStatus: { Active: 12, Cancelled: 3 },
    enrollmentsBySport: [],
    enrollmentsByProgram: [],
    enrollmentsByBranch: [],
    enrollmentsBySeason: [],
    groupCapacityUtilization: {
      totalGroups: 4,
      totalCapacity: 40,
      totalActiveMembers: 25,
      averageFillRatePercent: 62.5,
      groups: [],
    },
    trialFunnel: {
      totalTrials: 6,
      requestedCount: 1,
      scheduledCount: 1,
      completedCount: 2,
      acceptedCount: 1,
      rejectedCount: 1,
      conversionRatePercent: 50,
    },
    financialReceivables: { currencySummaries: [], asOfUtc: "2026-11-20T00:00:00Z" },
    deferredCodexMetrics: {
      attendanceRatePercent: null,
      coachSessionWorkloadHours: null,
      sessionUtilizationRatePercent: null,
      status: "DEFERRED",
      reason: "Not available",
      expectedMetrics: [],
    },
    metadata: {
      asOfUtc: "2026-11-20T00:00:00Z",
      tenantId: "tenant-a",
      scopedBranchIds: [],
      denominatorRules: {},
    },
  };
}

describe("AnalyticsKpiCards", () => {
  it("shows no invented values while metrics are unavailable", () => {
    const { container } = render(<AnalyticsKpiCards metrics={null} t={t} />);
    expect(container.textContent).not.toContain("1,126");
    expect(container.textContent).not.toContain("91.8%");
    expect(container.textContent).not.toContain("97.6%");
    expect(container.textContent).not.toContain("265,750");
    expect(screen.getAllByText("—").length).toBeGreaterThan(0);
  });

  it("renders only values supplied by the operational metrics contract", () => {
    render(<AnalyticsKpiCards metrics={metrics()} t={t} />);
    expect(screen.getByText("18")).toBeTruthy();
    expect(screen.getByText("12")).toBeTruthy();
    expect(screen.getByText("11")).toBeTruthy();
    expect(screen.getByText("3")).toBeTruthy();
    expect(screen.getByText("62.5%")).toBeTruthy();
    expect(screen.getByText("50.0%")).toBeTruthy();
  });
});
