import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { OpportunitiesView } from "./OpportunitiesView";
import { setCrmContainer } from "@modules/crm/di";
import type { CrmContainer } from "@modules/crm/di";
import type { CrmOpportunity, PagedOpportunitiesResult } from "../../domain/models/crm-opportunity.types";
import { PAGE_PERMISSIONS } from "@core/common/types/permissions";
import { queryClient } from "@core/query-client";
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
  useSearchParams: () => new URLSearchParams(),
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

      workflowService: {} as never,

      workflowRepository: {} as never,
      reportsService: {} as any,
      reportsRepository: {} as any,
      settingsService: {} as any,
      settingsRepository: {} as any,
      leadService: {} as any,
      leadRepository: {} as any,
      opportunityService: {} as any,
      opportunityRepository: mockRepo,
      accountService: {} as any,
      accountRepository: {} as any,
      contactService: {} as any,
      contactRepository: {} as any,
      activityService: {} as any,
      activityRepository: {} as any,
      entityLookup: {} as any,
    };

    setCrmContainer(container);
    queryClient.clear();
  });

  afterEach(async () => {
    try {
      const { useCrmClientPrefsStore } = await import("@modules/crm");
      useCrmClientPrefsStore.getState().setDefaultDealViewMode("Table");
    } catch { /* noop */ }
  });

  it("renders opportunity records after fetching successfully", async () => {
    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Nassr Pitch Licensing Contract")[0]).toBeDefined();
      expect(screen.getAllByText("Jeddah Stadium Corporate Suite Sponsorship")[0]).toBeDefined();
    });

    expect(mockRepo.getOpportunities).toHaveBeenCalled();
  });

  it("opens create dialog when clicking new deal button", async () => {
    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Nassr Pitch Licensing Contract")[0]).toBeDefined();
    });

    const newDealBtn = screen.getByText("crmOpportunities.actions.newDeal");
    fireEvent.click(newDealBtn);

    await waitFor(() => {
      expect(screen.getByText("crmOpportunities.dialogs.create.title")).toBeDefined();
    });
  });

  it("opens CrmWorkflowTransitionDialog when clicking move stage and submits stage advance", async () => {
    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Nassr Pitch Licensing Contract")[0]).toBeDefined();
    });

    const actionBtns = screen.getAllByLabelText(/^(Actions|table\.actions)$/);
    fireEvent.pointerDown(actionBtns[0], { button: 0, pointerType: "mouse" });
    fireEvent.click(actionBtns[0]);

    const moveStageBtn = await screen.findByText("crmOpportunities.actions.moveStage");
    fireEvent.click(moveStageBtn);

    await waitFor(() => {
      expect(screen.getByTestId("crm-workflow-transition-dialog")).toBeDefined();
    });

    const submitBtn = screen.getByTestId("transition-dialog-submit-btn");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockRepo.moveStage).toHaveBeenCalled();
    });
  });

  it("opens close dialog when clicking close won", async () => {
    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Nassr Pitch Licensing Contract")[0]).toBeDefined();
    });

    const actionBtns = screen.getAllByLabelText(/^(Actions|table\.actions)$/);
    fireEvent.pointerDown(actionBtns[0], { button: 0, pointerType: "mouse" });
    fireEvent.click(actionBtns[0]);

    const closeWonBtn = await screen.findByText("crmOpportunities.actions.closeWon");
    fireEvent.click(closeWonBtn);

    await waitFor(() => {
      expect(
        screen.queryByText("crmOpportunities.dialogs.close.title") ||
        screen.queryByText("crm.transitionDialog.title")
      ).toBeDefined();
    });
  });

  it("enforces OPPORTUNITIES_READ route permissions in PAGE_PERMISSIONS for list and detail paths", () => {
    expect(PAGE_PERMISSIONS["/crm/opportunities"]).toEqual([CRM_PERMISSIONS.OPPORTUNITIES_READ]);
    expect(PAGE_PERMISSIONS["/crm/opportunities/[id]"]).toEqual([CRM_PERMISSIONS.OPPORTUNITIES_READ]);
  });

  it("toggles between Table view and Kanban board view smoothly", async () => {
    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Nassr Pitch Licensing Contract")[0]).toBeDefined();
    });

    // Default view is table
    const kanbanToggle = screen.getByTestId("toggle-kanban-view");
    fireEvent.click(kanbanToggle);

    // Kanban board should now be rendered with 5 columns
    await waitFor(() => {
      expect(screen.getAllByTestId("kanban-column-default.discovery")[0]).toBeDefined();
      expect(screen.getAllByTestId("kanban-column-default.proposal")[0]).toBeDefined();
    });

    // Switch back to table
    const tableToggle = screen.getByTestId("toggle-table-view");
    fireEvent.click(tableToggle);

    await waitFor(() => {
      expect(screen.queryAllByTestId("kanban-column-default.discovery").length).toBe(0);
    });
  });

  it("blocks disallowed transitions on Kanban board when active Deal workflow restricts a transition", async () => {
    const { useCrmWorkflowsStore } = await import("@modules/crm");
    useCrmWorkflowsStore.getState().resetDefaults();
    const defaultWf = useCrmWorkflowsStore.getState().getActiveWorkflow("deal");
    // Restrict Discovery -> Qualification transition
    useCrmWorkflowsStore.getState().saveWorkflow({
      ...defaultWf,
      transitions: defaultWf.transitions.filter((tr) =>
        !(tr.fromStageKey === "default.discovery" && tr.toStageKey === "default.qualification")
      ),
    });

    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Nassr Pitch Licensing Contract")[0]).toBeDefined();
    });

    fireEvent.click(screen.getByTestId("toggle-kanban-view"));

    const qualDropTargets = await screen.findAllByTestId("kanban-stage-value-default.qualification");
    const qualDropTarget = qualDropTargets[qualDropTargets.length - 1];
    fireEvent.drop(qualDropTarget, {
      dataTransfer: {
        getData: (type: string) => (type === "text/plain" ? "opp-001" : ""),
      },
    });

    await waitFor(() => {
      expect(screen.getByText(/No transition is configured|restricted or locked in active workflow/i)).toBeDefined();
    });
    expect(mockRepo.moveStage).not.toHaveBeenCalled();

    useCrmWorkflowsStore.getState().resetDefaults();
  });

  it("renders Kanban board view by default when defaultDealViewMode is set to Kanban in client preferences", async () => {
    const { useCrmClientPrefsStore } = await import("@modules/crm");
    useCrmClientPrefsStore.getState().setDefaultDealViewMode("Kanban");

    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Nassr Pitch Licensing Contract")[0]).toBeDefined();
    });

    expect(screen.getAllByTestId("kanban-column-default.discovery")[0]).toBeDefined();
    expect(screen.getAllByTestId("kanban-column-default.qualification")[0]).toBeDefined();

    useCrmClientPrefsStore.getState().setDefaultDealViewMode("Table");
  });

  it("enforces workflow exit gate validation inside CrmWorkflowTransitionDialog and blocks premature submission", async () => {
    const { useCrmWorkflowsStore } = await import("@modules/crm");
    useCrmWorkflowsStore.getState().resetDefaults();
    useCrmWorkflowsStore.getState().updateStageInWorkflow("wf-deal-default", "default.discovery", {
      requiredExitFields: ["estimatedAmount", "nextStepSummary"],
    });

    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Nassr Pitch Licensing Contract")[0]).toBeDefined();
    });

    const actionBtns = screen.getAllByLabelText(/^(Actions|table\.actions)$/);
    fireEvent.pointerDown(actionBtns[0], { button: 0, pointerType: "mouse" });
    fireEvent.click(actionBtns[0]);

    const moveStageBtn = await screen.findByText("crmOpportunities.actions.moveStage");
    fireEvent.click(moveStageBtn);

    await waitFor(() => {
      expect(screen.getByTestId("crm-workflow-transition-dialog")).toBeDefined();
    });

    fireEvent.click(screen.getByTestId("transition-dialog-submit-btn"));
    expect(mockRepo.moveStage).not.toHaveBeenCalled();

    useCrmWorkflowsStore.getState().resetDefaults();
  });
});
