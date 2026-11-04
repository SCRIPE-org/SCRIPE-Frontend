import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PAGE_PERMISSIONS } from "@core/common/types/permissions";
import { CRM_PERMISSIONS } from "@modules/crm";
import { setCrmContainer, type CrmContainer } from "@modules/crm/di";
import { CrmReportsView } from "./CrmReportsView";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.defaultValue) return String(params.defaultValue);
      return key;
    },
    language: "en",
  }),
}));

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: () => true,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/crm/reports",
}));

describe("CrmReportsView Component (SCRIPE-745)", () => {
  const mockGetPipelineReport = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetPipelineReport.mockResolvedValue({
      generatedAtUtc: "2026-11-04T09:00:00Z",
      pipelineId: "pipe-default",
      pipelineNameEn: "Standard Commercial Pipeline",
      pipelineNameAr: "المسار التجاري القياسي",
      isAmountMasked: false,
      currencyBreakdowns: [
        {
          currencyCode: "SAR",
          openDealsCount: 4,
          wonDealsCount: 2,
          lostDealsCount: 1,
          totalOpenValue: 1850000,
          totalWeightedForecastValue: 920000,
          totalWonValue: 1100000,
          totalLostValue: 250000,
          stages: [
            {
              stageKey: "default.discovery",
              labelEn: "Discovery",
              labelAr: "استكشاف",
              sortOrder: 1,
              probabilityPercent: 10,
              requiresVerifiedParty: false,
              dealCount: 2,
              totalAmount: 650000,
              weightedForecastAmount: 65000,
            },
            {
              stageKey: "default.proposal",
              labelEn: "Proposal",
              labelAr: "عرض تجاري",
              sortOrder: 4,
              probabilityPercent: 60,
              requiresVerifiedParty: true,
              dealCount: 2,
              totalAmount: 1200000,
              weightedForecastAmount: 720000,
            },
          ],
        },
        {
          currencyCode: "USD",
          openDealsCount: 1,
          wonDealsCount: 0,
          lostDealsCount: 0,
          totalOpenValue: 400000,
          totalWeightedForecastValue: 160000,
          totalWonValue: 0,
          totalLostValue: 0,
          stages: [
            {
              stageKey: "default.solution_fit",
              labelEn: "Solution Fit",
              labelAr: "ملاءمة الحل",
              sortOrder: 3,
              probabilityPercent: 40,
              requiresVerifiedParty: false,
              dealCount: 1,
              totalAmount: 400000,
              weightedForecastAmount: 160000,
            },
          ],
        },
      ],
      leadFunnel: {
        totalLeads: 10,
        newCount: 3,
        workingCount: 3,
        qualifiedCount: 2,
        convertedCount: 1,
        disqualifiedCount: 1,
        qualificationRatePercent: 30,
        conversionRatePercent: 10,
      },
      winLoss: {
        totalClosedDeals: 3,
        wonCount: 2,
        lostCount: 1,
        winRatePercent: 66.7,
        avgCycleDays: 18,
      },
      activities: {
        totalActivitiesCount: 14,
        callsCount: 5,
        meetingsCount: 4,
        communicationsSentCount: 3,
        followUpsCreatedCount: 2,
      },
    });

    const container: CrmContainer = {
      overviewService: {} as any,
      overviewRepository: {
        getOverview: vi.fn(),
        getPipelineReport: mockGetPipelineReport,
      } as any,
      leadService: {} as any,
      leadRepository: {} as any,
      opportunityService: {} as any,
      opportunityRepository: {} as any,
      accountService: {} as any,
      accountRepository: {} as any,
      contactService: {} as any,
      contactRepository: {} as any,
      activityService: {} as any,
      activityRepository: {} as any,
    };
    setCrmContainer(container);
  });

  it("renders currency-isolated pipeline breakdowns, lead funnel, and switches currency buckets without mixing totals", async () => {
    render(<CrmReportsView />);

    await waitFor(() => {
      expect(screen.getByTestId("crm-reports-view")).toBeDefined();
      expect(screen.getByText("SAR 1,850,000")).toBeDefined();
      expect(screen.getByText("66.7%")).toBeDefined();
    });

    // Switch to USD currency bucket
    const usdBtn = screen.getByTestId("currency-bucket-btn-USD");
    fireEvent.click(usdBtn);

    await waitFor(() => {
      expect(screen.getAllByText("USD 400,000")[0]).toBeDefined();
    });
  });

  it("enforces REPORTS_READ permission in PAGE_PERMISSIONS for /crm/reports and LEADS_READ for /crm/leads/[id]", () => {
    expect(PAGE_PERMISSIONS["/crm/reports"]).toEqual([CRM_PERMISSIONS.REPORTS_READ]);
    expect(PAGE_PERMISSIONS["/crm/leads/[id]"]).toEqual([CRM_PERMISSIONS.LEADS_READ]);
  });
});
