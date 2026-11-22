import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PipelineManagementView } from "./PipelineManagementView";
import { useCrmWorkflowsStore } from "@modules/crm/workflows";

const mockPipeline = {
  id: "pipe-default",
  code: "default",
  name: "Standard Commercial Pipeline",
  nameEn: "Standard Commercial Pipeline",
  nameAr: "مسار المبيعات التجاري القياسي",
  version: 2,
  rowVersion: "rv-1",
  stages: [
    { stageKey: "default.discovery", labelEn: "Discovery", labelAr: "استكشاف", sortOrder: 1, winProbabilityPercent: 10, requiredExitFields: [] },
    { stageKey: "default.qualification", labelEn: "Qualification", labelAr: "تأهيل", sortOrder: 2, winProbabilityPercent: 25, requiredExitFields: [] },
    { stageKey: "default.solution_fit", labelEn: "Solution Fit", labelAr: "ملاءمة الحل", sortOrder: 3, winProbabilityPercent: 50, requiredExitFields: ["solutionFitConfirmed"] },
    { stageKey: "default.proposal", labelEn: "Proposal", labelAr: "عرض السعر", sortOrder: 4, winProbabilityPercent: 75, requiredExitFields: ["partyId", "estimatedAmount"] },
    { stageKey: "default.negotiation", labelEn: "Negotiation", labelAr: "تفاوض", sortOrder: 5, winProbabilityPercent: 90, requiredExitFields: ["partyId", "targetCloseDate"] },
  ],
};

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.defaultValue) return String(params.defaultValue);
      return key;
    },
    language: "en",
  }),
}));

const mockUsePermission = vi.fn((_perm?: string) => true);

vi.mock("@core/hooks/use-permission", () => ({
  usePermission: (perm: string) => mockUsePermission(perm),
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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/crm/pipelines",
}));

describe("PipelineManagementView — Pipelines Directory & Full-Screen 2D Workflow Studio", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    mockUsePermission.mockReturnValue(true);
    const { useAppStore } = await import("@core/store/useAppStore");
    useAppStore.setState({ isAuthenticated: false });
    useCrmWorkflowsStore.getState().resetDefaults();
  });

  it("renders the Pipelines & Workflows Directory list page and protects active workflows from deletion", () => {
    render(<PipelineManagementView />);

    expect(screen.getByTestId("crm-pipelines-list-page")).toBeDefined();
    expect(screen.getByTestId("workflow-card-wf-deal-default")).toBeDefined();
    expect(screen.getByTestId("workflow-card-wf-lead-default")).toBeDefined();
    expect(screen.getByTestId("workflow-card-wf-lead-custom-3stage")).toBeDefined();

    // Active workflow delete button must be disabled
    const activeDeleteBtn = screen.getByTestId("workflow-delete-wf-deal-default");
    expect(activeDeleteBtn.hasAttribute("disabled")).toBe(true);

    // Inactive template can be activated
    fireEvent.click(screen.getByTestId("workflow-set-active-wf-deal-fast-track"));
    expect(useCrmWorkflowsStore.getState().activeDealWorkflowId).toBe("wf-deal-fast-track");
  });

  it("opens Full-Screen Immersive Studio with 2D Diagram Canvas, START circle, forward & backward SVG edges, and minimap", () => {
    render(<PipelineManagementView />);

    fireEvent.click(screen.getByTestId("workflow-edit-studio-wf-deal-default"));

    expect(screen.getByTestId("crm-workflow-fullscreen-studio")).toBeDefined();
    expect(screen.getByTestId("crm-workflow-canvas-card")).toBeDefined();
    expect(screen.getByTestId("crm-2d-graph-surface")).toBeDefined();
    expect(document.querySelector(".react-flow__edges")).not.toBeNull();
    expect(screen.getByTestId("canvas-node-start")).toBeDefined();
    expect(screen.getByTestId("canvas-node-default.discovery")).toBeDefined();
    expect(screen.getByTestId("canvas-node-default.proposal")).toBeDefined();
    expect(screen.getByTestId("canvas-node-default.closed_won")).toBeDefined();
    expect(screen.getByTestId("canvas-node-default.closed_lost")).toBeDefined();
    expect(screen.getByTestId("workflow-minimap")).toBeDefined();
  });

  it("switches between Diagram, Classic Flow, and Transitions Table modes and validates workflow rules", async () => {
    render(<PipelineManagementView defaultOpenStudio />);

    fireEvent.click(screen.getByTestId("workflow-mode-classic"));
    expect(screen.getByTestId("workflow-classic-flow-surface")).toBeDefined();

    fireEvent.click(screen.getByTestId("workflow-mode-text"));
    expect(screen.getByTestId("workflow-text-mode-table")).toBeDefined();

    fireEvent.click(screen.getByTestId("workflow-mode-diagram"));
    expect(screen.getByTestId("crm-2d-graph-surface")).toBeDefined();

    fireEvent.click(screen.getByTestId("canvas-validate-rules"));
    await waitFor(() => {
      expect(screen.getByText(/Workflow verified: 5 active statuses/i)).toBeDefined();
    });
  });

  it("opens Transition Inspector with 4 Rule cards (Restrict, Request input, Validate details, Perform actions) when clicking a transition pill", async () => {
    render(<PipelineManagementView defaultOpenStudio />);

    fireEvent.click(screen.getByTestId("workflow-mode-text"));
    const transitionRows = screen.getAllByTestId("transition-row-default.discovery");
    fireEvent.click(transitionRows[0]);

    expect(screen.getByTestId("transition-rule-card-restrict")).toBeDefined();
    expect(screen.getByTestId("transition-rule-card-input")).toBeDefined();
    expect(screen.getByTestId("transition-rule-card-validate")).toBeDefined();
    expect(screen.getByTestId("transition-rule-card-actions")).toBeDefined();

    // Expand Perform actions card and toggle Lead -> Deal conversion
    fireEvent.click(screen.getByTestId("transition-rule-card-actions"));
    expect(screen.getByTestId("transition-action-convert-deal")).toBeDefined();
  });

  it("creates a custom field inline inside the workflow inspector and binds it to the selected stage gate", async () => {
    render(<PipelineManagementView defaultOpenStudio />);

    fireEvent.click(screen.getByTestId("canvas-node-default.proposal"));
    fireEvent.click(screen.getByTestId("workflow-create-custom-field-btn"));

    const keyInput = screen.getByTestId("workflow-cf-key-input");
    const labelInput = screen.getByTestId("workflow-cf-label-input");
    fireEvent.change(keyInput, { target: { value: "cfo_budget_signoff" } });
    fireEvent.change(labelInput, { target: { value: "CFO Budget Sign-Off" } });
    fireEvent.click(screen.getByTestId("workflow-cf-save-btn"));

    await waitFor(() => {
      expect(
        screen.getByTestId("inspector-default.proposal-exit-field-custom:cfo_budget_signoff")
      ).toBeDefined();
    });
  });

  it("switches to Leads workflow in Studio, supports adding a dynamic status and transition, and evaluates configurable Deal conversion", async () => {
    render(<PipelineManagementView defaultOpenStudio />);

    fireEvent.click(screen.getByTestId("workflow-switch-leads"));

    expect(screen.getByTestId("crm-2d-graph-surface")).toBeDefined();
    expect(screen.getByTestId("canvas-node-lead.new")).toBeDefined();
    expect(screen.getByTestId("canvas-node-lead.working")).toBeDefined();
    expect(screen.getByTestId("canvas-node-lead.qualified")).toBeDefined();
    expect(screen.getByTestId("canvas-node-lead.converted")).toBeDefined();
    expect(screen.getByTestId("canvas-node-lead.disqualified")).toBeDefined();

    // Select Qualified stage in Leads workflow and verify Lead Exit Field labels map to translation keys (not raw camelCase)
    fireEvent.click(screen.getByTestId("canvas-node-lead.qualified"));
    expect(
      screen.getByText("crmWorkflows.pipelinesPage.exitFieldLeadPhoneOrEmail")
    ).toBeDefined();
    expect(
      screen.getByText("crmWorkflows.pipelinesPage.exitFieldLeadSource")
    ).toBeDefined();
    expect(
      screen.getByText("crmWorkflows.pipelinesPage.exitFieldLeadBantNotes")
    ).toBeDefined();
    expect(
      screen.getByText("crmWorkflows.pipelinesPage.exitFieldLeadAccountOrContact")
    ).toBeDefined();

    // Add a new custom status dynamically (6th stage)
    fireEvent.click(screen.getByTestId("crm-toolbar-add-status"));
    fireEvent.change(screen.getByTestId("new-status-label-en-input"), {
      target: { value: "Deal Handover" },
    });
    fireEvent.click(screen.getByTestId("new-status-submit-btn"));

    await waitFor(() => {
      expect(screen.getByTestId("canvas-node-lead.deal_handover")).toBeDefined();
    });

    // Clicking + Add Rule selects a transition and opens the 4-Category Rule Catalog Modal directly, and renders Lead exit fields in Transition Inspector
    fireEvent.click(screen.getByTestId("crm-toolbar-add-rule"));
    expect(screen.getByTestId("transition-rule-card-restrict")).toBeDefined();
    expect(screen.getByTestId("workflow-rule-catalog-modal")).toBeDefined();
    expect(
      screen.getByText("crmWorkflows.pipelinesPage.exitFieldLeadPhoneOrEmail")
    ).toBeDefined();
    expect(
      screen.getByText("crmWorkflows.pipelinesPage.exitFieldLeadSource")
    ).toBeDefined();

    // Clicking Discard / Close exits Studio back to the list page
    fireEvent.click(screen.getByTestId("studio-discard-close-btn"));
    expect(screen.queryByTestId("crm-workflow-fullscreen-studio")).toBeNull();
    expect(screen.getByTestId("crm-pipelines-list-page")).toBeDefined();
  });

  it("syncs custom Deals & Leads workflows relationally to /api/v1/crm/pipelines without storing workflows in CustomFieldsConfigJson", async () => {
    const { setCrmContainer } = await import("@modules/crm/di");
    const mockUpdateTenantSettings = vi.fn().mockResolvedValue({});
    const mockGetSettings = vi.fn();
    const mockSavePipeline = vi.fn().mockResolvedValue({});
    const mockActivatePipeline = vi.fn().mockResolvedValue({});
    const mockGetPipelines = vi.fn();
    setCrmContainer({
      settingsRepository: {
        updateTenantSettings: mockUpdateTenantSettings,
        getSettings: mockGetSettings,
      },
      workflowRepository: {
        savePipeline: mockSavePipeline,
        activatePipeline: mockActivatePipeline,
        getPipelines: mockGetPipelines,
        updateDefaultPipeline: vi.fn().mockResolvedValue({}),
      },
    } as never);

    const created = useCrmWorkflowsStore.getState().createWorkflow({
      entityType: "lead",
      nameEn: "VIP Sponsorship Leads",
      nameAr: "عملاء كبار الرعاة",
    });
    expect(mockSavePipeline).toHaveBeenCalledTimes(1);
    expect(mockSavePipeline.mock.calls[0][0]).toBe(created.id);
    expect(mockSavePipeline.mock.calls[0][1].entityType).toBe("lead");
    expect(mockUpdateTenantSettings).not.toHaveBeenCalled();

    // Activate custom workflow -> calls relational activatePipeline and savePipeline
    useCrmWorkflowsStore.getState().setActiveWorkflow(created.id);
    expect(mockActivatePipeline).toHaveBeenCalledWith(created.id);
    expect(mockSavePipeline).toHaveBeenCalledTimes(2);

    // Hydrate from server restores workflows and active IDs from relational /api/v1/crm/pipelines
    useCrmWorkflowsStore.getState().resetDefaults();
    expect(useCrmWorkflowsStore.getState().activeLeadWorkflowId).toBe("wf-lead-default");

    mockGetSettings.mockResolvedValue({
      effectiveBaseCurrencyCode: "SAR",
      effectiveAutoConvertToBase: true,
      effectiveShowDualCurrencyBadges: true,
      tenantSettings: {
        baseCurrencyCode: "SAR",
        defaultDealCurrencyCode: "SAR",
        customFieldsConfigJson: JSON.stringify({ customFields: [] }),
      },
      userPreferences: {
        defaultDealViewMode: "Kanban",
        defaultPipelineCode: "default",
        cardDensity: "Comfortable",
      },
    });
    mockGetPipelines.mockResolvedValue([
      {
        id: created.id,
        code: created.id,
        entityType: "lead",
        nameEn: created.nameEn,
        nameAr: created.nameAr,
        isDefault: true,
        version: 1,
        rowVersion: "rv-1",
        stages: created.stages,
        transitionsJson: JSON.stringify(created.transitions),
      },
    ]);
    const { useAppStore } = await import("@core/store/useAppStore");
    useAppStore.setState({ isAuthenticated: true });
    await useCrmWorkflowsStore.getState().fetchPipelinesFromBackend();
    expect(useCrmWorkflowsStore.getState().activeLeadWorkflowId).toBe(created.id);
    expect(useCrmWorkflowsStore.getState().workflows.some((w) => w.id === created.id)).toBe(true);
  });

  it("opens the searchable 4-Category Rule Catalog Modal, filters rules, and attaches a rule to a transition", async () => {
    render(<PipelineManagementView defaultOpenStudio />);

    fireEvent.click(screen.getByTestId("workflow-mode-text"));
    const transitionRows = screen.getAllByTestId("transition-row-default.discovery");
    fireEvent.click(transitionRows[0]);

    // Click the + button on Restrict card to open the 4-Category Rule Catalog Modal
    fireEvent.click(screen.getByTestId("open-rule-catalog-restrict"));
    expect(screen.getByTestId("workflow-rule-catalog-modal")).toBeDefined();

    // Filter rules by search query
    const searchInput = screen.getByTestId("rule-catalog-search-input");
    fireEvent.change(searchInput, { target: { value: "Approval" } });
    expect(screen.getByTestId("rule-catalog-item-restrict.approval_required")).toBeDefined();

    // Click Select on the rule to advance to Step 2 (Rule Configuration)
    fireEvent.click(screen.getByTestId("select-catalog-rule-restrict.approval_required"));
    expect(screen.getByTestId("rule-catalog-step2-config")).toBeDefined();
    expect(screen.getByTestId("rule-catalog-transition-select")).toBeDefined();

    // Confirm and add rule in Step 2
    fireEvent.click(screen.getByTestId("confirm-add-catalog-rule-btn"));

    await waitFor(() => {
      expect(screen.queryByTestId("workflow-rule-catalog-modal")).toBeNull();
    });

    // Open Add transition property modal and save a key/value property
    fireEvent.click(screen.getByTestId("inspector-transition-add-property-btn"));
    expect(screen.getByTestId("transition-properties-modal")).toBeDefined();
    fireEvent.change(screen.getByTestId("transition-prop-key-input"), {
      target: { value: "jira.i18n.title" },
    });
    fireEvent.change(screen.getByTestId("transition-prop-val-input"), {
      target: { value: "Approve Transition" },
    });
    fireEvent.click(screen.getByTestId("transition-prop-save-btn"));
    expect(screen.getByTestId("transition-prop-row-jira.i18n.title")).toBeDefined();
  });

  it("supports multi-source transitions, Domain Event selection, proportional 2D Mini-Map, Tidy Auto-Layout, and Status Replacement Migration Wizard", async () => {
    render(<PipelineManagementView defaultOpenStudio />);

    // Proportional 2D Mini-Map
    expect(screen.getByTestId("workflow-minimap")).toBeDefined();
    expect(document.querySelector(".react-flow__minimap")).not.toBeNull();

    // Toggle transition labels and run Tidy Auto-Layout
    fireEvent.click(screen.getByTestId("canvas-toggle-transition-labels"));
    fireEvent.click(screen.getByTestId("canvas-tidy-auto-layout-btn"));

    // Select a transition from the Transitions Table view and add a multi-source From status + automated Trigger + verify Domain Event selector
    fireEvent.click(screen.getByTestId("workflow-mode-text"));
    const propRow = screen.getByTestId("workflow-text-mode-table").querySelector("tbody tr");
    expect(propRow).not.toBeNull();
    fireEvent.click(screen.getAllByText(/Send Proposal|Qualify/i)[0]);
    fireEvent.click(screen.getByTestId("inspector-toggle-multi-from-btn"));
    expect(screen.getByTestId("inspector-multi-from-list")).toBeDefined();
    fireEvent.click(screen.getByTestId("multi-from-checkbox-default.discovery"));
    expect(screen.getByTestId("inspector-transition-event-select")).toBeDefined();

    fireEvent.click(screen.getByTestId("inspector-transition-add-trigger-btn"));
    fireEvent.click(screen.getByTestId("add-trigger-quote_accepted"));
    expect(screen.getByTestId("transition-trigger-badge-quote_accepted")).toBeDefined();

    // Switch back to diagram mode, select a stage, and replace/migrate it via the Safe Delete & Status Replacement Wizard
    fireEvent.click(screen.getByTestId("workflow-mode-diagram"));
    fireEvent.click(screen.getByTestId("canvas-node-default.solution_fit"));
    expect(screen.getByTestId("inspector-stage-category-select")).toBeDefined();
    fireEvent.click(screen.getByTestId("inspector-replace-stage-btn"));

    expect(screen.getByTestId("replace-status-migration-modal")).toBeDefined();
    fireEvent.click(screen.getByTestId("replace-status-confirm-btn"));

    await waitFor(() => {
      expect(screen.queryByTestId("canvas-node-default.solution_fit")).toBeNull();
    });
  });

  it("restores canonical win probabilities (10, 25, 50, 75, 90) and SLA days (7, 10, 14, 14, 21) when default pipeline hydrates with uniform 50% or null, and supports custom field valueType selection", () => {
    useCrmWorkflowsStore.getState().hydrateFromBackendPipelines([
      {
        id: "backend-default-id",
        code: "default",
        entityType: "deal",
        nameEn: "Standard Commercial Pipeline",
        nameAr: "مسار المبيعات التجاري القياسي",
        isDefault: true,
        version: 1,
        rowVersion: "rv-1",
        stages: [
          { stageKey: "default.discovery", labelEn: "Discovery", labelAr: "استكشاف", sortOrder: 1, winProbabilityPercent: 50, requiresVerifiedParty: false },
          { stageKey: "default.qualification", labelEn: "Qualification", labelAr: "تأهيل", sortOrder: 2, winProbabilityPercent: 50, requiresVerifiedParty: false },
          { stageKey: "default.solution_fit", labelEn: "Solution Fit", labelAr: "ملاءمة الحل", sortOrder: 3, winProbabilityPercent: 50, requiresVerifiedParty: false },
          { stageKey: "default.proposal", labelEn: "Proposal", labelAr: "عرض السعر", sortOrder: 4, winProbabilityPercent: 50, requiresVerifiedParty: true },
          { stageKey: "default.negotiation", labelEn: "Negotiation", labelAr: "تفاوض", sortOrder: 5, winProbabilityPercent: 50, requiresVerifiedParty: true },
        ],
      },
    ]);

    const wf = useCrmWorkflowsStore.getState().workflows.find((w) => w.id === "wf-deal-default")!;
    expect(wf.stages.map((s) => s.winProbabilityPercent)).toEqual([10, 25, 50, 75, 90]);
    expect(wf.stages.map((s) => s.slaDays)).toEqual([7, 10, 14, 14, 21]);

    render(<PipelineManagementView defaultOpenStudio />);
    fireEvent.click(screen.getByTestId("canvas-node-default.discovery"));
    fireEvent.click(screen.getByTestId("workflow-create-custom-field-btn"));
    expect(screen.getByTestId("workflow-cf-type-select")).toBeDefined();
  });

  it("supports Jira 8-port perimeter drag-and-drop targeting, unlimited multi-target transitions, Allow transitions from any status, and interactive Any pill + L-arrow", async () => {
    render(<PipelineManagementView defaultOpenStudio />);

    // 1. Verify all 8 Jira perimeter ports on selected stage node (3 top, 3 bottom, 1 left, 1 right)
    fireEvent.click(screen.getByTestId("canvas-node-default.discovery"));
    for (const portId of ["top-1", "top-2", "top-3", "right-1", "bottom-1", "bottom-2", "bottom-3", "left-1"]) {
      expect(screen.getByTestId(`node-port-default.discovery-${portId}`)).toBeDefined();
    }

    // 2. Drag wire from Discovery top-3 and drop on empty canvas space -> should NOT open Add Transition modal
    fireEvent.pointerDown(screen.getByTestId("node-port-default.discovery-top-3"), { clientX: 251, clientY: 64 });
    fireEvent.pointerMove(screen.getByTestId("crm-2d-graph-surface"), { clientX: 20, clientY: 520 });
    fireEvent.pointerUp(screen.getByTestId("crm-2d-graph-surface"), { clientX: 20, clientY: 520 });
    expect(screen.queryByTestId("add-transition-modal")).toBeNull();

    // 3. Drag wire from Discovery top-3 and drop directly onto Solution Fit node body -> opens Add Transition pre-filled with Move to Solution Fit
    fireEvent.pointerDown(screen.getByTestId("node-port-default.discovery-top-3"), { clientX: 251, clientY: 64 });
    fireEvent.pointerUp(screen.getByTestId("canvas-node-default.solution_fit"));
    expect(screen.getByTestId("add-transition-modal")).toBeDefined();
    fireEvent.click(screen.getByTestId("new-transition-submit-btn"));
    await waitFor(() => {
      expect(screen.queryByTestId("add-transition-modal")).toBeNull();
    });

    // 4. Drag wire from Discovery right-1 and drop onto Proposal top-1 port -> creates another outgoing transition from Discovery
    fireEvent.pointerDown(screen.getByTestId("node-port-default.discovery-right-1"), { clientX: 298, clientY: 116 });
    fireEvent.pointerUp(screen.getByTestId("node-port-default.proposal-top-1"));
    expect(screen.getByTestId("add-transition-modal")).toBeDefined();
    fireEvent.click(screen.getByTestId("new-transition-submit-btn"));
    await waitFor(() => {
      expect(screen.queryByTestId("add-transition-modal")).toBeNull();
    });

    // 5. Select Discovery and verify Outgoing Transitions shows 3 outgoing transitions (Qualification, Solution Fit, Proposal) and does NOT include global "*" transitions
    fireEvent.click(screen.getByTestId("canvas-node-default.discovery"));
    expect(screen.getByTestId("toggle-outgoing-transitions-btn").textContent).toContain("(3)");
    expect(screen.getByTestId("inspector-add-incoming-transition-btn")).toBeDefined();
    expect(screen.getByTestId("inspector-add-outgoing-transition-btn")).toBeDefined();

    // 6. Open Add Status modal, verify [x] Allow transitions from any status checkbox is checked by default, and create a new status
    fireEvent.click(screen.getByTestId("crm-toolbar-add-status"));
    expect(screen.getByTestId("new-stage-allow-from-any")).toBeDefined();
    fireEvent.change(screen.getByTestId("new-status-label-en-input"), { target: { value: "Legal Review" } });
    fireEvent.click(screen.getByTestId("new-status-submit-btn"));

    // 7. Verify floating Any pill renders on the new status and clicking Any opens Transition Inspector
    const anyPill = screen.getByTestId("canvas-transition-global-default.legal_review");
    expect(anyPill).toBeDefined();
    fireEvent.click(anyPill);
    expect(screen.getByTestId("inspector-transition-name-en")).toBeDefined();

    // 8. Dragging from the floating Any pill onto another stage node opens Add Transition modal with From = Any status (*)
    fireEvent.pointerDown(anyPill, { clientX: 928, clientY: 378 });
    fireEvent.pointerUp(screen.getByTestId("canvas-node-default.negotiation"), { clientX: 500, clientY: 390 });
    expect(screen.getByTestId("add-transition-modal")).toBeDefined();
    fireEvent.click(screen.getByTestId("new-transition-submit-btn"));

    // 9. Verify buildWorkflowCanvasEdges uses var(--nx-accent) start wire, removes __fanout__ edges, and assigns distinct highway offsets
    const { buildWorkflowCanvasEdges } = await import("../utils/crmWorkflowEdgeBuilder");
    const builtEdges = buildWorkflowCanvasEdges({
      stages: [
        { stageKey: "s1", labelEn: "S1", labelAr: "S1", probability: 10, slaDays: 5, order: 1, isTerminalWon: false, isTerminalLost: false, requiredExitFields: [], x: 240, y: 110 },
        { stageKey: "s2", labelEn: "S2", labelAr: "S2", probability: 25, slaDays: 5, order: 2, isTerminalWon: false, isTerminalLost: false, requiredExitFields: [], x: 700, y: 110 },
        { stageKey: "s3", labelEn: "S3", labelAr: "S3", probability: 50, slaDays: 5, order: 3, isTerminalWon: false, isTerminalLost: false, requiredExitFields: [], x: 700, y: 410 },
      ],
      firstStage: { stageKey: "s1", labelEn: "S1", labelAr: "S1", probability: 10, slaDays: 5, order: 1, isTerminalWon: false, isTerminalLost: false, requiredExitFields: [], x: 240, y: 110 },
      transitions: [
        { id: "e12", nameEn: "1 to 2", nameAr: "1-2", fromStageKey: "s1", toStageKey: "s2", requiredFields: [] },
        { id: "e21", nameEn: "2 to 1", nameAr: "2-1", fromStageKey: "s2", toStageKey: "s1", direction: "backward", requiredFields: [] },
        { id: "eAny3", nameEn: "Any to 3", nameAr: "3", fromStageKey: "*", toStageKey: "s3", direction: "global", requiredFields: [] },
      ],
      directTransitions: [
        { id: "e12", nameEn: "1 to 2", nameAr: "1-2", fromStageKey: "s1", toStageKey: "s2", requiredFields: [] },
        { id: "e21", nameEn: "2 to 1", nameAr: "2-1", fromStageKey: "s2", toStageKey: "s1", direction: "backward", requiredFields: [] },
      ],
      wildcardTransitions: [{ id: "eAny3", nameEn: "Any to 3", nameAr: "3", fromStageKey: "*", toStageKey: "s3", direction: "global", requiredFields: [] }],
      selectedTransitionId: null,
      isAr: false,
      showGlobalWires: true,
      showTransitionLabels: true,
      onSelectTransition: vi.fn(),
      onSelectStage: vi.fn(),
    });
    const startEdge = builtEdges.find((e) => e.id === "edge-start-to-first");
    expect((startEdge?.style as { stroke?: string })?.stroke).toBe("var(--nx-accent)");
    expect(builtEdges.some((e) => e.id.includes("__fanout__"))).toBe(false);
    expect(builtEdges.find((e) => e.id === "eAny3")?.source).toBe("__global_all__");
  });

  it("supports Studio v3.0 Undo and Redo buttons, keyboard shortcuts, and state restoration", async () => {
    render(<PipelineManagementView defaultOpenStudio />);

    const undoBtn = screen.getByTestId("canvas-undo-btn");
    const redoBtn = screen.getByTestId("canvas-redo-btn");

    expect(undoBtn).toBeDefined();
    expect(redoBtn).toBeDefined();
    expect(undoBtn.hasAttribute("disabled")).toBe(true);
    expect(redoBtn.hasAttribute("disabled")).toBe(true);

    // Add a new stage
    fireEvent.click(screen.getByTestId("crm-toolbar-add-status"));
    fireEvent.change(screen.getByTestId("new-status-label-en-input"), {
      target: { value: "Security Review" },
    });
    fireEvent.click(screen.getByTestId("new-status-submit-btn"));

    // Stage added -> undo must become enabled
    expect(undoBtn.hasAttribute("disabled")).toBe(false);
    expect(screen.getByTestId("canvas-node-default.security_review")).toBeDefined();

    // Click Undo
    fireEvent.click(undoBtn);

    // Undone: Security Review is removed, undo is disabled, redo is enabled
    expect(screen.queryByTestId("canvas-node-default.security_review")).toBeNull();
    expect(undoBtn.hasAttribute("disabled")).toBe(true);
    expect(redoBtn.hasAttribute("disabled")).toBe(false);

    // Click Redo
    fireEvent.click(redoBtn);

    // Redone: Security Review is restored!
    expect(screen.getByTestId("canvas-node-default.security_review")).toBeDefined();
    expect(undoBtn.hasAttribute("disabled")).toBe(false);
    expect(redoBtn.hasAttribute("disabled")).toBe(true);
  });

  it("renders read-only mode for crm.pipelines.read without crm.pipelines.manage and blocks unauthorized users", async () => {
    const { CRM_PERMISSIONS } = await import("@modules/crm/shared");
    mockUsePermission.mockImplementation((perm) => perm === CRM_PERMISSIONS.PIPELINES_READ);

    const { rerender } = render(<PipelineManagementView />);
    expect(screen.getByTestId("crm-pipelines-list-page")).toBeDefined();
    expect(screen.queryByTestId("create-workflow-btn")).toBeNull();
    expect(screen.queryByTestId("create-lead-workflow-btn")).toBeNull();
    expect(screen.queryByTestId("workflow-clone-wf-deal-default")).toBeNull();
    expect(screen.queryByTestId("workflow-delete-wf-deal-default")).toBeNull();

    fireEvent.click(screen.getByTestId("workflow-edit-studio-wf-deal-default"));
    expect(screen.getByTestId("crm-workflow-fullscreen-studio")).toBeDefined();
    expect(screen.queryByTestId("save-pipeline-config-btn")).toBeNull();
    expect(screen.queryByTestId("workflow-import-json-btn")).toBeNull();

    mockUsePermission.mockReturnValue(false);
    rerender(<PipelineManagementView />);
    expect(screen.getByTestId("pipelines-access-denied")).toBeDefined();
  });
});


