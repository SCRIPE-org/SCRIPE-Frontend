import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PAGE_PERMISSIONS } from "@core/common/types/permissions";
import { CRM_PERMISSIONS } from "@modules/crm";
import { setCrmContainer, type CrmContainer } from "@modules/crm/di";
import { OverviewEntity } from "../../domain/entities/OverviewEntity";
import { CrmOverviewView } from "./CrmOverviewView";

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

function renderWithQuery(ui: React.ReactElement) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

describe("CrmOverviewView Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setCrmContainer({
      overviewService: {} as never,
      overviewRepository: {
        getOverview: vi.fn().mockResolvedValue(
          new OverviewEntity({
            stats: [],
            pipeline: {
              id: "default",
              name: "Standard Commercial Pipeline",
              stages: [],
              totalDeals: 0,
              totalPipelineValue: 0,
              currency: "SAR",
            },
            recentDeals: [],
          })
        ),
      },
      reportsService: {} as never,
      reportsRepository: {} as never,
      settingsService: {} as never,
      settingsRepository: {
        getSettings: vi.fn().mockResolvedValue({}),
      } as never,
      leadService: {} as never,
      leadRepository: {} as never,
      workflowService: {} as never,
      workflowRepository: {} as never,
      opportunityService: {} as never,
      opportunityRepository: {} as never,
      accountService: {} as never,
      accountRepository: {} as never,
      contactService: {} as never,
      contactRepository: {} as never,
      activityService: {} as never,
      activityRepository: {} as never,
      entityLookup: {} as never,
    } as CrmContainer);
  });

  it("renders the CRM Command Center and Overview Shell", async () => {
    renderWithQuery(<CrmOverviewView />);

    expect(screen.getByText("crm.title")).toBeDefined();
    expect(screen.getByText("crm.tabs.overview")).toBeDefined();
  });

  it("enforces OVERVIEW_READ permission in PAGE_PERMISSIONS for /crm workspace root", () => {
    expect(PAGE_PERMISSIONS["/crm"]).toEqual([CRM_PERMISSIONS.OVERVIEW_READ]);
  });

  it("filters overview-pipeline-switcher exclusively to deal workflows and excludes lead workflows", async () => {
    const { fireEvent, waitFor } = await import("@testing-library/react");
    renderWithQuery(<CrmOverviewView />);

    const switcher = await waitFor(() => screen.getByTestId("overview-pipeline-switcher"));
    fireEvent.click(switcher);

    await waitFor(() => {
      expect(screen.getByText("Standard Commercial Pipeline")).toBeDefined();
      expect(screen.queryByText("Standard Lead Intake Pipeline")).toBeNull();
    });
  });
});
