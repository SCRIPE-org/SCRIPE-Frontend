import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KanbanBoard, CANONICAL_KANBAN_STAGES } from "./KanbanBoard";
import type { CrmOpportunity } from "../../../domain/entities/OpportunityEntity";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.defaultValue) return String(params.defaultValue);
      return key;
    },
    language: "en",
  }),
}));

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

describe("KanbanBoard Component", () => {
  const mockOpportunities: CrmOpportunity[] = [
    {
      id: "opp-001",
      title: "Al-Hilal Stadium Pitch Lighting Upgrade",
      leadId: null,
      accountId: null,
      partyId: "party-verified-001", // Verified party linked
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
      estimatedAmount: 350000,
      currencyCode: "SAR",
      targetCloseDate: "2026-12-15T00:00:00Z",
      status: "Open",
      statusName: "Open",
      createdAt: "2026-10-01T10:00:00Z",
      rowVersion: "AAAA==",
      maskedFieldKeys: [],
    },
    {
      id: "opp-002",
      title: "Jeddah Academy Training Equipment",
      leadId: null,
      accountId: null,
      partyId: null, // Unlinked party (triggers PD-1 warning)
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
      estimatedAmount: 180000,
      currencyCode: "SAR",
      targetCloseDate: "2026-11-20T00:00:00Z",
      status: "Open",
      statusName: "Open",
      createdAt: "2026-10-05T12:00:00Z",
      rowVersion: "BBBB==",
      maskedFieldKeys: [],
    },
    {
      id: "opp-003",
      title: "Riyadh VIP Box Catering Deal",
      leadId: null,
      accountId: null,
      partyId: "party-verified-002",
      pipelineId: "pipe-001",
      stageId: "stage-004",
      stageKey: "default.proposal",
      stageLabelEnSnapshot: "Proposal",
      pipelineVersionSnapshot: 1,
      lastActiveStageKey: null,
      ownerUserId: "user-003",
      ownerTeamId: null,
      dealKind: "Renewal",
      hqOutcomeKind: null,
      targetExistingTenantId: null,
      estimatedAmount: 90000,
      currencyCode: "SAR",
      targetCloseDate: "2026-11-10T00:00:00Z",
      status: "Open",
      statusName: "Open",
      createdAt: "2026-10-08T09:00:00Z",
      rowVersion: "CCCC==",
      maskedFieldKeys: ["estimatedAmount"], // FLS masked
    },
  ];

  it("renders all 5 canonical pipeline stages in order", () => {
    const onMoveStage = vi.fn();
    render(<KanbanBoard opportunities={mockOpportunities} onMoveStage={onMoveStage} />);

    expect(screen.getByTestId("kanban-column-default.discovery")).toBeDefined();
    expect(screen.getByTestId("kanban-column-default.qualification")).toBeDefined();
    expect(screen.getByTestId("kanban-column-default.solution_fit")).toBeDefined();
    expect(screen.getByTestId("kanban-column-default.proposal")).toBeDefined();
    expect(screen.getByTestId("kanban-column-default.negotiation")).toBeDefined();

    expect(screen.getByText("Discovery")).toBeDefined();
    expect(screen.getByText("Qualification")).toBeDefined();
    expect(screen.getByText("Solution Fit")).toBeDefined();
    expect(screen.getByText("Proposal")).toBeDefined();
    expect(screen.getByText("Negotiation")).toBeDefined();
  });

  it("displays visual PD-1 party-verification indicator on Proposal and Negotiation columns", () => {
    const onMoveStage = vi.fn();
    render(<KanbanBoard opportunities={mockOpportunities} onMoveStage={onMoveStage} />);

    // PD-1 indicator must appear on Proposal and Negotiation
    expect(screen.getByTestId("pd1-badge-default.proposal")).toBeDefined();
    expect(screen.getByTestId("pd1-badge-default.negotiation")).toBeDefined();

    // Must NOT appear on Discovery, Qualification, or Solution Fit
    expect(screen.queryByTestId("pd1-badge-default.discovery")).toBeNull();
    expect(screen.queryByTestId("pd1-badge-default.qualification")).toBeNull();
    expect(screen.queryByTestId("pd1-badge-default.solution_fit")).toBeNull();
  });

  it("displays verified badge for linked party and unlinked badge for missing party", () => {
    const onMoveStage = vi.fn();
    render(<KanbanBoard opportunities={mockOpportunities} onMoveStage={onMoveStage} />);

    expect(screen.getAllByText("Verified").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Unlinked")).toBeDefined();
  });

  it("masks financial amounts when estimatedAmount is restricted by FLS", () => {
    const onMoveStage = vi.fn();
    render(<KanbanBoard opportunities={mockOpportunities} onMoveStage={onMoveStage} />);

    // opp-003 has maskedFieldKeys: ["estimatedAmount"]
    expect(screen.getAllByText("••••••").length).toBeGreaterThanOrEqual(1);
  });

  it("triggers onMoveStage with next stage when clicking move forward", async () => {
    const onMoveStage = vi.fn();
    render(<KanbanBoard opportunities={mockOpportunities} onMoveStage={onMoveStage} />);

    // opp-001 is in Discovery (index 0). Forward moves to Qualification (index 1).
    const forwardBtns = screen.getAllByLabelText("Move forward");
    fireEvent.click(forwardBtns[0]);

    expect(onMoveStage).toHaveBeenCalledWith(
      expect.objectContaining({ id: "opp-001" }),
      "default.qualification"
    );
  });

  it("triggers onMoveStage with previous stage when clicking move backward", async () => {
    const onMoveStage = vi.fn();
    render(<KanbanBoard opportunities={mockOpportunities} onMoveStage={onMoveStage} />);

    // opp-002 is in Qualification (index 1). Backward moves to Discovery (index 0).
    const backwardBtns = screen.getAllByLabelText("Move backward");
    // Find enabled backward button
    const enabledBackwardBtn = backwardBtns.find(
      (btn) => !btn.hasAttribute("disabled")
    );
    expect(enabledBackwardBtn).toBeDefined();

    fireEvent.click(enabledBackwardBtn!);

    expect(onMoveStage).toHaveBeenCalledWith(
      expect.objectContaining({ id: "opp-002" }),
      "default.discovery"
    );
  });

  it("supports WCAG keyboard navigation (ArrowRight / ArrowLeft) on cards", () => {
    const onMoveStage = vi.fn();
    render(<KanbanBoard opportunities={mockOpportunities} onMoveStage={onMoveStage} />);

    const card = screen.getByLabelText(/Al-Hilal Stadium Pitch Lighting Upgrade/i);
    card.focus();

    // In LTR, ArrowRight moves forward
    fireEvent.keyDown(card, { key: "ArrowRight" });

    expect(onMoveStage).toHaveBeenCalledWith(
      expect.objectContaining({ id: "opp-001" }),
      "default.qualification"
    );
  });

  it("handles drag and drop to move card between columns", () => {
    const onMoveStage = vi.fn();
    render(<KanbanBoard opportunities={mockOpportunities} onMoveStage={onMoveStage} />);

    const targetColumn = screen.getByTestId("kanban-column-default.solution_fit");

    // Simulate drop of opp-001 onto Solution Fit
    fireEvent.drop(targetColumn, {
      dataTransfer: {
        getData: (type: string) => (type === "text/plain" ? "opp-001" : ""),
      },
    });

    expect(onMoveStage).toHaveBeenCalledWith(
      expect.objectContaining({ id: "opp-001" }),
      "default.solution_fit"
    );
  });

  it("renders rejection alert with rollback message when errorMessage is provided", () => {
    const onMoveStage = vi.fn();
    const onClearError = vi.fn();
    const errorMessage = "A verified canonical Party must be linked before advancing to Proposal (PD-1).";

    render(
      <KanbanBoard
        opportunities={mockOpportunities}
        onMoveStage={onMoveStage}
        errorMessage={errorMessage}
        onClearError={onClearError}
      />
    );

    expect(screen.getByText("Stage Transition Rejected")).toBeDefined();
    expect(screen.getByText(errorMessage)).toBeDefined();

    const dismissBtn = screen.getByText("Dismiss");
    fireEvent.click(dismissBtn);
    expect(onClearError).toHaveBeenCalled();
  });

  it("strictly enforces PD-5 per-currency breakdown without cross-currency sums in column totals", () => {
    const multiCurrencyOpps: CrmOpportunity[] = [
      {
        ...mockOpportunities[0],
        id: "opp-sar",
        stageKey: "default.discovery",
        currencyCode: "SAR",
        estimatedAmount: 100000,
      },
      {
        ...mockOpportunities[1],
        id: "opp-usd",
        stageKey: "default.discovery",
        currencyCode: "USD",
        estimatedAmount: 50000,
      },
    ];

    render(<KanbanBoard opportunities={multiCurrencyOpps} onMoveStage={vi.fn()} />);

    // Discovery column must display separate currency totals and NOT sum 100k + 50k into 150k
    const discoveryCol = screen.getByTestId("kanban-column-default.discovery");
    expect(discoveryCol.textContent).toContain("SAR 100,000 / USD 50,000");
    expect(discoveryCol.textContent).not.toContain("SAR 150,000");
  });

  it("does not trigger card click or router navigation when pressing Enter on child action buttons", () => {
    mockPush.mockClear();

    const onMoveStage = vi.fn();
    render(<KanbanBoard opportunities={mockOpportunities} onMoveStage={onMoveStage} />);

    // Target the move forward button
    const forwardBtns = screen.getAllByLabelText("Move forward");
    const firstForwardBtn = forwardBtns[0];

    // Trigger keydown with Enter directly on button
    fireEvent.keyDown(firstForwardBtn, { key: "Enter" });

    // router.push must NOT be called on bubbling
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("dynamically renders server-provided stage labels, ordering, and win probabilities", () => {
    // Permissible stage reordering: swap Qualification (sortOrder: 1) and Discovery (sortOrder: 2)
    const customStages = [
      {
        stageKey: "default.qualification",
        labelEn: "Client Qualification (Stage 1)",
        labelAr: "تأهيل العميل",
        sortOrder: 1,
        winProbabilityPercent: 20,
        requiresVerifiedParty: false,
        requiredExitFields: [],
      },
      {
        stageKey: "default.discovery",
        labelEn: "Discovery & Scope (Stage 2)",
        labelAr: "مرحلة الاستكشاف الأولي",
        sortOrder: 2,
        winProbabilityPercent: 15,
        requiresVerifiedParty: false,
        requiredExitFields: [],
      },
      {
        stageKey: "default.solution_fit",
        labelEn: "Solution Architecture",
        labelAr: "معمارية الحل",
        sortOrder: 3,
        winProbabilityPercent: 60,
        requiresVerifiedParty: false,
        requiredExitFields: [],
      },
      {
        stageKey: "default.proposal",
        labelEn: "Commercial Offer",
        labelAr: "العرض التجاري",
        sortOrder: 4,
        winProbabilityPercent: 80,
        requiresVerifiedParty: true,
        requiredExitFields: ["partyId"],
      },
      {
        stageKey: "default.negotiation",
        labelEn: "Final Closing",
        labelAr: "الإغلاق النهائي",
        sortOrder: 5,
        winProbabilityPercent: 95,
        requiresVerifiedParty: true,
        requiredExitFields: ["partyId"],
      },
    ];

    render(
      <KanbanBoard
        opportunities={mockOpportunities}
        stages={customStages}
        onMoveStage={vi.fn()}
      />
    );

    expect(screen.getByText("Client Qualification (Stage 1)")).toBeDefined();
    expect(screen.getByText("Discovery & Scope (Stage 2)")).toBeDefined();
    expect(screen.getByText("Solution Architecture")).toBeDefined();
    expect(screen.getByText("Commercial Offer")).toBeDefined();
    expect(screen.getByText("Final Closing")).toBeDefined();
    expect(screen.getByText("20%")).toBeDefined();
    expect(screen.getByText("15%")).toBeDefined();
    expect(screen.getByText("95%")).toBeDefined();

    // Verify the actual Kanban columns in DOM are ordered according to swapped sortOrder (Qualification first, Discovery second)
    const stageColumnHeadings = Array.from(
       document.querySelectorAll('[data-testid^="kanban-column-"]')
    ).map((col) => col.getAttribute("data-testid"));

    expect(stageColumnHeadings).toEqual([
      "kanban-column-default.qualification",
      "kanban-column-default.discovery",
      "kanban-column-default.solution_fit",
      "kanban-column-default.proposal",
      "kanban-column-default.negotiation",
    ]);
  });

  it("triggers onMoveStage with default.closed_won and default.closed_lost when dropping onto terminal outcome dropzones", () => {
    const onMoveStage = vi.fn();
    render(<KanbanBoard opportunities={mockOpportunities} onMoveStage={onMoveStage} />);

    const wonDropzone = screen.getByTestId("kanban-dropzone-closed-won");
    const lostDropzone = screen.getByTestId("kanban-dropzone-closed-lost");

    fireEvent.drop(wonDropzone, {
      dataTransfer: {
        getData: (type: string) => (type === "text/plain" ? "opp-001" : ""),
      },
    });
    expect(onMoveStage).toHaveBeenCalledWith(mockOpportunities[0], "default.closed_won");

    fireEvent.drop(lostDropzone, {
      dataTransfer: {
        getData: (type: string) => (type === "text/plain" ? "opp-002" : ""),
      },
    });
    expect(onMoveStage).toHaveBeenCalledWith(mockOpportunities[1], "default.closed_lost");
  });

  it("places open deals in unmapped stages into the first column when a 2-stage workflow is active", () => {
    const twoStageWorkflow = [
      {
        stageKey: "default.discovery",
        labelEn: "Discovery",
        labelAr: "استكشاف",
        sortOrder: 1,
        winProbabilityPercent: 30,
        requiresVerifiedParty: false,
      },
      {
        stageKey: "default.proposal",
        labelEn: "Proposal & Closing",
        labelAr: "العرض والإغلاق",
        sortOrder: 2,
        winProbabilityPercent: 85,
        requiresVerifiedParty: true,
      },
    ];

    render(
      <KanbanBoard
        opportunities={mockOpportunities}
        stages={twoStageWorkflow}
        onMoveStage={vi.fn()}
      />
    );

    // Only 2 columns rendered
    const cols = document.querySelectorAll('[data-testid^="kanban-column-"]');
    expect(cols.length).toBe(2);

    // opp-002 (stageKey: "default.qualification") should not vanish; it should be visible in the first column
    expect(screen.getByText("Jeddah Academy Training Equipment")).toBeDefined();
    expect(screen.getByText("Al-Hilal Stadium Pitch Lighting Upgrade")).toBeDefined();
    expect(screen.getByText("Riyadh VIP Box Catering Deal")).toBeDefined();
  });

  describe("SCRIPE-766: Jira-Style Drag-and-Drop Transition Overlay Enforcement", () => {
    it("renders frosted restriction overlays on forbidden columns and affirmative feedback on allowed columns when dragging a card", () => {
      const onMoveStage = vi.fn();
      render(<KanbanBoard opportunities={mockOpportunities} onMoveStage={onMoveStage} />);

      // Find opp-001 card (Discovery stage)
      const opp1Title = screen.getByText("Al-Hilal Stadium Pitch Lighting Upgrade");
      const card = opp1Title.closest('[data-testid="kanban-card"]')!;
      expect(card).toBeDefined();

      // Trigger dragstart on the card
      fireEvent.dragStart(card, {
        dataTransfer: {
          setData: vi.fn(),
          effectAllowed: "",
        },
      });

      // 1. Current stage column (Discovery) should display "Current Stage" pill
      expect(screen.getByTestId("kanban-current-pill-default.discovery")).toBeDefined();
      expect(screen.getByText("Current Stage")).toBeDefined();

      // 2. Allowed forward column (Qualification) should display affirmative pill with Signal Lime feedback
      expect(screen.getByTestId("kanban-allowed-pill-default.qualification")).toBeDefined();
      expect(screen.getByText("Direct Transition")).toBeDefined();
      const qualCol = screen.getByTestId("kanban-column-default.qualification");
      expect(qualCol.className).toContain("border-nx-accent/50");

      // 3. Forbidden columns (Solution Fit, Proposal, Negotiation) should display frosted matte overlays
      expect(screen.getByTestId("kanban-blocked-overlay-default.solution_fit")).toBeDefined();
      expect(screen.getByTestId("kanban-blocked-overlay-default.proposal")).toBeDefined();
      expect(screen.getByTestId("kanban-blocked-overlay-default.negotiation")).toBeDefined();

      // 4. Centered restriction cards with "Can't move here" and specific diagnostic reason
      expect(screen.getByTestId("kanban-restriction-card-default.proposal")).toBeDefined();
      expect(screen.getAllByText("Can't move here").length).toBe(3);
      expect(screen.getAllByText(/Non-adjacent stage skipping restricted/i).length).toBeGreaterThanOrEqual(1);

      // 5. Dragging over forbidden column enforces dropEffect = "none"
      const dataTransferBlocked = { dropEffect: "move" };
      fireEvent.dragOver(screen.getByTestId("kanban-column-default.proposal"), {
        dataTransfer: dataTransferBlocked,
      });
      expect(dataTransferBlocked.dropEffect).toBe("none");

      // 6. Complete drop rejection: dropping onto forbidden column does NOT invoke onMoveStage
      fireEvent.drop(screen.getByTestId("kanban-column-default.proposal"), {
        dataTransfer: {
          getData: (type: string) => (type === "text/plain" ? "opp-001" : ""),
        },
      });
      expect(onMoveStage).not.toHaveBeenCalled();

      // 7. Dropping onto allowed column successfully calls onMoveStage
      fireEvent.drop(screen.getByTestId("kanban-column-default.qualification"), {
        dataTransfer: {
          getData: (type: string) => (type === "text/plain" ? "opp-001" : ""),
        },
      });
      expect(onMoveStage).toHaveBeenCalledWith(
        expect.objectContaining({ id: "opp-001" }),
        "default.qualification"
      );
    });

    it("clears frosted restriction overlays and pills when drag ends", () => {
      render(<KanbanBoard opportunities={mockOpportunities} onMoveStage={vi.fn()} />);

      const opp1Title = screen.getByText("Al-Hilal Stadium Pitch Lighting Upgrade");
      const card = opp1Title.closest('[data-testid="kanban-card"]')!;

      // Drag start triggers overlays
      fireEvent.dragStart(card, {
        dataTransfer: { setData: vi.fn(), effectAllowed: "" },
      });
      expect(screen.getByTestId("kanban-blocked-overlay-default.proposal")).toBeDefined();

      // Drag end removes overlays
      fireEvent.dragEnd(card);
      expect(screen.queryByTestId("kanban-blocked-overlay-default.proposal")).toBeNull();
      expect(screen.queryByTestId("kanban-allowed-pill-default.qualification")).toBeNull();
    });

    it("displays Stage Gate indicator pill when moving deal to stage requiring party or review", () => {
      // opp-002 is in Qualification without linked party (partyId: null)
      render(<KanbanBoard opportunities={mockOpportunities} onMoveStage={vi.fn()} />);

      const opp2Title = screen.getByText("Jeddah Academy Training Equipment");
      const card = opp2Title.closest('[data-testid="kanban-card"]')!;

      fireEvent.dragStart(card, {
        dataTransfer: { setData: vi.fn(), effectAllowed: "" },
      });

      // Backward move to Discovery requires review/modal
      expect(screen.getByTestId("kanban-allowed-pill-default.discovery")).toBeDefined();
      expect(screen.getByText("Stage Gate: Review Required")).toBeDefined();

      // Adjacent forward move to Solution Fit is direct transition
      expect(screen.getByTestId("kanban-allowed-pill-default.solution_fit")).toBeDefined();
      expect(screen.getByText("Direct Transition")).toBeDefined();
    });

    it("shows permission restriction diagnostic when canUpdateOpportunity is false", () => {
      render(
        <KanbanBoard
          opportunities={mockOpportunities}
          onMoveStage={vi.fn()}
          canUpdateOpportunity={false}
        />
      );

      const opp1Title = screen.getByText("Al-Hilal Stadium Pitch Lighting Upgrade");
      const card = opp1Title.closest('[data-testid="kanban-card"]')!;

      fireEvent.dragStart(card, {
        dataTransfer: { setData: vi.fn(), effectAllowed: "" },
      });

      // All destination columns should be blocked due to update permission
      expect(screen.getByTestId("kanban-blocked-overlay-default.qualification")).toBeDefined();
      expect(
        screen.getAllByText("Opportunity update permission required to move deals.").length
      ).toBeGreaterThanOrEqual(1);
    });

    it("displays Stage Gate: Account & Contact Required pill when moving deal to Proposal without a linked party", () => {
      const oppInSolutionFitNoParty: CrmOpportunity = {
        ...mockOpportunities[0],
        id: "opp-sol-fit-no-party",
        title: "Dammam Stadium LED Displays",
        stageKey: "default.solution_fit",
        stageLabelEnSnapshot: "Solution Fit",
        partyId: null,
      };

      render(
        <KanbanBoard
          opportunities={[...mockOpportunities, oppInSolutionFitNoParty]}
          onMoveStage={vi.fn()}
        />
      );

      const cardTitle = screen.getByText("Dammam Stadium LED Displays");
      const card = cardTitle.closest('[data-testid="kanban-card"]')!;

      fireEvent.dragStart(card, {
        dataTransfer: { setData: vi.fn(), effectAllowed: "" },
      });

      // Forward move to Proposal (which requires verified party) should show the Stage Gate Account & Contact pill
      expect(screen.getByTestId("kanban-allowed-pill-default.proposal")).toBeDefined();
      expect(screen.getByText("Stage Gate: Account & Contact Required")).toBeDefined();
    });

    it("rejects drops on terminal Closed Won / Lost zones when canUpdateOpportunity is false", () => {
      const onMoveStage = vi.fn();
      render(
        <KanbanBoard
          opportunities={mockOpportunities}
          onMoveStage={onMoveStage}
          canUpdateOpportunity={false}
        />
      );

      const wonZone = screen.getByTestId("kanban-dropzone-closed-won");
      const lostZone = screen.getByTestId("kanban-dropzone-closed-lost");

      // Verify dragover enforces dropEffect = "none"
      const wonDt = { dropEffect: "move" };
      fireEvent.dragOver(wonZone, { dataTransfer: wonDt });
      expect(wonDt.dropEffect).toBe("none");

      const lostDt = { dropEffect: "move" };
      fireEvent.dragOver(lostZone, { dataTransfer: lostDt });
      expect(lostDt.dropEffect).toBe("none");

      // Verify drop is rejected
      fireEvent.drop(wonZone, {
        dataTransfer: { getData: () => "opp-001" },
      });
      fireEvent.drop(lostZone, {
        dataTransfer: { getData: () => "opp-001" },
      });

      expect(onMoveStage).not.toHaveBeenCalled();
    });
  });
});
