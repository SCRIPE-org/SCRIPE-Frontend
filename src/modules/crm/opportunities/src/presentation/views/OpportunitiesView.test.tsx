import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
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
      accountService: {} as any,
      accountRepository: {} as any,
      contactService: {} as any,
      contactRepository: {} as any,
    };

    setCrmContainer(container);
  });

  afterEach(async () => {
    try {
      const { useCrmSettingsStore } = await import("@modules/crm");
      useCrmSettingsStore.getState().setDefaultDealViewMode("Table");
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

  it("opens move stage dialog and submits stage advance", async () => {
    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Nassr Pitch Licensing Contract")[0]).toBeDefined();
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
      expect(screen.getAllByText("Al-Nassr Pitch Licensing Contract")[0]).toBeDefined();
    });

    const closeWonBtns = screen.getAllByText("crmOpportunities.actions.closeWon");
    fireEvent.click(closeWonBtns[0]);

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

    const qualCols = await screen.findAllByTestId("kanban-column-default.qualification");
    const qualCol = qualCols[qualCols.length - 1];
    fireEvent.drop(qualCol, {
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

  it("renders Kanban board view by default when defaultDealViewMode is set to Kanban in CRM Settings", async () => {
    const { useCrmSettingsStore } = await import("@modules/crm");
    useCrmSettingsStore.getState().setDefaultDealViewMode("Kanban");

    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Nassr Pitch Licensing Contract")[0]).toBeDefined();
    });

    // Should render Kanban columns by default
    expect(screen.getAllByTestId("kanban-column-default.discovery")[0]).toBeDefined();
    expect(screen.getAllByTestId("kanban-column-default.qualification")[0]).toBeDefined();

    // Reset back to Table
    useCrmSettingsStore.getState().setDefaultDealViewMode("Table");
  });

  it("supports adding a custom exit gate field inline inside MoveStageDialog and enforces Boolean and Text custom field gate validation", async () => {
    const { useCrmSettingsStore, useCrmWorkflowsStore } = await import("@modules/crm");
    useCrmSettingsStore.getState().resetDefaults();
    useCrmWorkflowsStore.getState().resetDefaults();

    // Pre-register a Boolean custom field on default.discovery exit gate
    useCrmSettingsStore.getState().addCrmCustomField({
      entityTypeKey: "crm.opportunity",
      key: "board_compliance_check",
      labelEn: "Board Compliance Confirmed",
      labelAr: "تأكيد امتثال المجلس",
      valueType: "Boolean",
      isRequired: true,
      defaultStageGateKey: "default.discovery",
    });

    render(<OpportunitiesView />);

    await waitFor(() => {
      expect(screen.getAllByText("Al-Nassr Pitch Licensing Contract")[0]).toBeDefined();
    });

    const moveStageBtns = screen.getAllByText("crmOpportunities.actions.moveStage");
    fireEvent.click(moveStageBtns[0]);

    await waitFor(() => {
      expect(screen.getByTestId("move-stage-gate-cf-board_compliance_check")).toBeDefined();
    });

    // Submitting without checking Boolean custom field should fail validation
    const submitBtn = screen.getByText("crmOpportunities.dialogs.stage.submit");
    fireEvent.click(submitBtn);
    expect(mockRepo.moveStage).not.toHaveBeenCalled();

    // Add a new custom field inline inside MoveStageDialog
    fireEvent.click(screen.getByTestId("move-stage-add-cf-toggle-btn"));
    fireEvent.change(screen.getByTestId("move-stage-cf-label-input"), {
      target: { value: "Sponsor PO Number" },
    });
    fireEvent.change(screen.getByTestId("move-stage-cf-key-input"), {
      target: { value: "sponsor_po_num" },
    });
    fireEvent.click(screen.getByTestId("move-stage-cf-save-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("move-stage-gate-cf-sponsor_po_num")).toBeDefined();
    });

    useCrmSettingsStore.getState().resetDefaults();
    useCrmWorkflowsStore.getState().resetDefaults();
  });
});

