import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { PipelineManagementView } from "./PipelineManagementView";
import { useCrmSettingsStore, useCrmWorkflowsStore } from "@modules/crm";

const mockFetchPipeline = vi.fn();
const mockHandleUpdatePipeline = vi.fn().mockResolvedValue(true);

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

vi.mock("../viewmodels/useOpportunitiesViewModel", () => ({
  useOpportunitiesViewModel: () => ({
    pipeline: mockPipeline,
    fetchPipeline: mockFetchPipeline,
    handleUpdatePipeline: mockHandleUpdatePipeline,
    isSubmitting: false,
    pipelineError: null,
  }),
}));

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
  usePathname: () => "/crm/pipelines",
}));

describe("PipelineManagementView — Pipelines Directory & Full-Screen 2D Workflow Studio", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useCrmSettingsStore.getState().resetDefaults();
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
    expect(screen.getByTestId("crm-2d-svg-edges")).toBeDefined();
    expect(screen.getByTestId("canvas-node-start")).toBeDefined();
    expect(screen.getByTestId("canvas-node-default.discovery")).toBeDefined();
    expect(screen.getByTestId("canvas-node-default.proposal")).toBeDefined();
    expect(screen.getByTestId("canvas-node-terminal-won")).toBeDefined();
    expect(screen.getByTestId("canvas-node-terminal-lost")).toBeDefined();
    expect(screen.getAllByTestId("canvas-transition-default.discovery").length).toBeGreaterThanOrEqual(1);
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

    const transitionPills = screen.getAllByTestId("canvas-transition-default.discovery");
    fireEvent.click(transitionPills[0]);

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
      screen.getByText("crmOpportunities.pipelinesPage.exitFieldLeadPhoneOrEmail")
    ).toBeDefined();
    expect(
      screen.getByText("crmOpportunities.pipelinesPage.exitFieldLeadSource")
    ).toBeDefined();
    expect(
      screen.getByText("crmOpportunities.pipelinesPage.exitFieldLeadBantNotes")
    ).toBeDefined();
    expect(
      screen.getByText("crmOpportunities.pipelinesPage.exitFieldLeadAccountOrContact")
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
      screen.getByText("crmOpportunities.pipelinesPage.exitFieldLeadPhoneOrEmail")
    ).toBeDefined();
    expect(
      screen.getByText("crmOpportunities.pipelinesPage.exitFieldLeadSource")
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
      overviewRepository: {
        updateTenantSettings: mockUpdateTenantSettings,
        getSettings: mockGetSettings,
      },
      opportunityRepository: {
        savePipeline: mockSavePipeline,
        activatePipeline: mockActivatePipeline,
        getPipelines: mockGetPipelines,
        updateDefaultPipeline: vi.fn().mockResolvedValue({}),
      },
    } as any);

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
        stages: created.stages,
        transitionsJson: JSON.stringify(created.transitions),
      },
    ]);
    await useCrmSettingsStore.getState().hydrateFromServer();
    expect(useCrmWorkflowsStore.getState().activeLeadWorkflowId).toBe(created.id);
    expect(useCrmWorkflowsStore.getState().workflows.some((w) => w.id === created.id)).toBe(true);
  });

  it("opens the searchable 4-Category Rule Catalog Modal, filters rules, and attaches a rule to a transition", async () => {
    render(<PipelineManagementView defaultOpenStudio />);

    const transitionPills = screen.getAllByTestId("canvas-transition-default.discovery");
    fireEvent.click(transitionPills[0]);

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

    // Proportional 2D Mini-Map nodes, viewport box, and 50%-150% zoom slider
    expect(screen.getByTestId("workflow-minimap")).toBeDefined();
    expect(screen.getByTestId("workflow-minimap-surface")).toBeDefined();
    expect(screen.getByTestId("minimap-viewport-box")).toBeDefined();
    expect(screen.getByTestId("minimap-zoom-slider")).toBeDefined();
    expect(screen.getByTestId("minimap-node-default.discovery")).toBeDefined();

    // Toggle transition labels and run Tidy Auto-Layout
    fireEvent.click(screen.getByTestId("canvas-toggle-transition-labels"));
    fireEvent.click(screen.getByTestId("canvas-tidy-auto-layout-btn"));

    // Select a transition and add a multi-source From status + automated Trigger + verify Domain Event selector
    const transitionPills = screen.getAllByTestId("canvas-transition-default.proposal");
    fireEvent.click(transitionPills[0]);
    fireEvent.click(screen.getByTestId("inspector-toggle-multi-from-btn"));
    expect(screen.getByTestId("inspector-multi-from-list")).toBeDefined();
    fireEvent.click(screen.getByTestId("multi-from-checkbox-default.discovery"));
    expect(screen.getByTestId("inspector-transition-event-select")).toBeDefined();

    fireEvent.click(screen.getByTestId("inspector-transition-add-trigger-btn"));
    fireEvent.click(screen.getByTestId("add-trigger-quote_accepted"));
    expect(screen.getByTestId("transition-trigger-badge-quote_accepted")).toBeDefined();

    // Select a stage and replace/migrate it via the Safe Delete & Status Replacement Wizard
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
});


