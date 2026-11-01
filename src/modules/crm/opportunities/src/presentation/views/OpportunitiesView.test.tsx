import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { OpportunitiesView } from "./OpportunitiesView";
import { setCrmContainer } from "@modules/crm/di";
import type { CrmContainer } from "@modules/crm/di";
import type { CrmOpportunity, PagedOpportunitiesResult } from "../../domain/models/crm-opportunity.types";
import { PAGE_PERMISSIONS } from "@core/common/types/permissions";
import { CRM_PERMISSIONS } from "@modules/crm";

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

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    permissions: [],
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    canAccessPage: () => true,
    roleNames: [],
    isSuperAdmin: true,
  }),
  PermissionGate: ({ children }: { children: unknown }) => children,
}));

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/crm/opportunities",
}));

describe("OpportunitiesView Component", () => {
  const mockOpportunities: CrmOpportunity[] = [
    {
      id: "opp-001",
      title: "Al-Nassr Pitch Licensing Contract",
      leadId: null,
      accountId: null,
      partyId: "party-001",
      pipelineId: "pipe-001",
      stageId: "stage-001",
      stageKey: "default.discovery",
      stageLabelEnSnapshot: "Discovery",
      pipelineVersionSnapshot: 1,
      lastActiveStageKey: null,
      ownerUserId: "user-001",
      ownerTeamId: null,
      dealKind: "NewBusiness",
      hqOutcomeKind: null,
      targetExistingTenantId: null,
      estimatedAmount: 250000,
      currencyCode: "SAR",
      targetCloseDate: "2026-12-31T00:00:00Z",
      status: "Open",
      statusName: "Open",
      directCreateSource: "ManualDirect",
      directCreateRationale: "Executive direct referral",
      createdAt: "2026-10-15T10:00:00Z",
      rowVersion: "AAAA==",
      maskedFieldKeys: [],
    },
    {
      id: "opp-002",
      title: "Jeddah Stadium Corporate Suite Sponsorship",
      leadId: null,
      accountId: null,
      partyId: null,
      pipelineId: "pipe-001",
      stageId: "stage-002",
      stageKey: "default.qualification",
      stageLabelEnSnapshot: "Qualification",
      pipelineVersionSnapshot: 1,
      lastActiveStageKey: null,
      ownerUserId: "user-002",
      ownerTeamId: null,
      dealKind: "Expansion",
      hqOutcomeKind: null,
      targetExistingTenantId: null,
      estimatedAmount: 500000,
      currencyCode: "SAR",
      targetCloseDate: "2026-11-30T00:00:00Z",
      status: "Open",
      statusName: "Open",
      createdAt: "2026-10-18T14:30:00Z",
      rowVersion: "BBBB==",
      maskedFieldKeys: [],
    },
  ];

  const mockPagedResult: PagedOpportunitiesResult = {
    items: mockOpportunities,
    totalCount: 2,
    pageNumber: 1,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
    page: 1,
    pageSize: 20,
  };

  let mockRepo: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockRepo = {
      getOpportunities: vi.fn().mockResolvedValue(mockPagedResult),
      getOpportunityById: vi.fn(),
      createOpportunity: vi.fn().mockResolvedValue(mockOpportunities[0]),
      updateOpportunity: vi.fn().mockResolvedValue(mockOpportunities[0]),
      assignOwner: vi.fn().mockResolvedValue(mockOpportunities[0]),
      moveStage: vi.fn().mockResolvedValue({
        ...mockOpportunities[0],
        stageKey: "default.qualification",
        stageLabelEnSnapshot: "Qualification",
      }),
      closeOpportunity: vi.fn().mockResolvedValue({
        ...mockOpportunities[0],
        status: "Won",
      }),
      reopenOpportunity: vi.fn().mockResolvedValue({
        ...mockOpportunities[0],
        status: "Open",
      }),
    };

    const container: CrmContainer = {
      overviewService: {} as any,
      overviewRepository: {} as any,
      leadService: {} as any,
      leadRepository: {} as any,
      opportunityService: {} as any,
      opportunityRepository: mockRepo,
    };

    setCrmContainer(container);
  });

  it("renders opportunity records after fetching successfully", async () => {
    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getByText("Al-Nassr Pitch Licensing Contract")).toBeDefined();
      expect(screen.getByText("Jeddah Stadium Corporate Suite Sponsorship")).toBeDefined();
    });

    expect(mockRepo.getOpportunities).toHaveBeenCalled();
  });

  it("opens create dialog when clicking new deal button", async () => {
    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getByText("Al-Nassr Pitch Licensing Contract")).toBeDefined();
    });

    const newDealBtn = screen.getByText("crmOpportunities.actions.newDeal");
    fireEvent.click(newDealBtn);

    await waitFor(() => {
      expect(screen.getByText("crmOpportunities.dialogs.create.title")).toBeDefined();
    });
  });

  it("opens move stage dialog and submits stage advance", async () => {
    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getByText("Al-Nassr Pitch Licensing Contract")).toBeDefined();
    });

    const moveStageBtns = screen.getAllByText("crmOpportunities.actions.moveStage");
    fireEvent.click(moveStageBtns[0]);

    await waitFor(() => {
      expect(screen.getByText("crmOpportunities.dialogs.stage.title")).toBeDefined();
    });

    const submitBtn = screen.getByText("crmOpportunities.dialogs.stage.submit");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRepo.moveStage).toHaveBeenCalled();
    });
  });

  it("opens close dialog when clicking close won", async () => {
    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getByText("Al-Nassr Pitch Licensing Contract")).toBeDefined();
    });

    const closeWonBtns = screen.getAllByText("crmOpportunities.actions.closeWon");
    fireEvent.click(closeWonBtns[0]);

    await waitFor(() => {
      expect(screen.getByText("crmOpportunities.dialogs.close.title")).toBeDefined();
    });
  });

  it("enforces OPPORTUNITIES_READ route permissions in PAGE_PERMISSIONS for list and detail paths", () => {
    expect(PAGE_PERMISSIONS["/crm/opportunities"]).toEqual([CRM_PERMISSIONS.OPPORTUNITIES_READ]);
    expect(PAGE_PERMISSIONS["/crm/opportunities/[id]"]).toEqual([CRM_PERMISSIONS.OPPORTUNITIES_READ]);
  });
});
