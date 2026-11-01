import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  PipelineAdminDialog,
  CANONICAL_STAGE_KEYS,
  PERMITTED_EXIT_FIELDS,
} from "./PipelineAdminDialog";
import type { PipelineDefinition } from "../../../domain/entities/OpportunityEntity";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) => {
      if (params?.defaultValue) return String(params.defaultValue);
      return key;
    },
    language: "en",
  }),
}));

describe("PipelineAdminDialog Component", () => {
  const mockPipeline: PipelineDefinition = {
    id: "pipe-001",
    tenantId: "tenant-001",
    key: "default",
    name: "Standard Sales Pipeline",
    version: 1,
    isDefault: true,
    rowVersion: "AQIDBA==",
    stages: [
      {
        stageKey: "default.discovery",
        labelEn: "Discovery",
        labelAr: "استكشاف",
        sortOrder: 1,
        winProbabilityPercent: 10,
        requiredExitFields: [],
        requiresVerifiedParty: false,
        rowVersion: "STG1==",
      },
      {
        stageKey: "default.qualification",
        labelEn: "Qualification",
        labelAr: "تأهيل",
        sortOrder: 2,
        winProbabilityPercent: 25,
        requiredExitFields: [],
        requiresVerifiedParty: false,
        rowVersion: "STG2==",
      },
      {
        stageKey: "default.solution_fit",
        labelEn: "Solution Fit",
        labelAr: "ملاءمة الحل",
        sortOrder: 3,
        winProbabilityPercent: 50,
        requiredExitFields: ["solutionFitConfirmed"],
        requiresVerifiedParty: false,
        rowVersion: "STG3==",
      },
      {
        stageKey: "default.proposal",
        labelEn: "Proposal",
        labelAr: "عرض السعر",
        sortOrder: 4,
        winProbabilityPercent: 75,
        requiredExitFields: ["partyId", "estimatedAmount"],
        requiresVerifiedParty: true,
        rowVersion: "STG4==",
      },
      {
        stageKey: "default.negotiation",
        labelEn: "Negotiation",
        labelAr: "تفاوض",
        sortOrder: 5,
        winProbabilityPercent: 90,
        requiredExitFields: ["partyId", "targetCloseDate"],
        requiresVerifiedParty: true,
        rowVersion: "STG5==",
      },
    ],
  };

  it("renders all 5 canonical stage rows with their current labels and ordering", () => {
    render(
      <PipelineAdminDialog
        open={true}
        onOpenChange={vi.fn()}
        pipeline={mockPipeline}
        onSubmit={vi.fn()}
      />
    );

    for (const key of CANONICAL_STAGE_KEYS) {
      expect(screen.getByTestId(`stage-config-row-${key}`)).toBeDefined();
    }

    expect(screen.getAllByDisplayValue("Discovery").length).toBeGreaterThan(0);
    expect(screen.getAllByDisplayValue("Proposal").length).toBeGreaterThan(0);
    expect(screen.getAllByDisplayValue("Negotiation").length).toBeGreaterThan(0);
  });

  it("rejects non-contiguous sort ordering with client validation error", async () => {
    const onSubmit = vi.fn();
    render(
      <PipelineAdminDialog
        open={true}
        onOpenChange={vi.fn()}
        pipeline={mockPipeline}
        onSubmit={onSubmit}
      />
    );

    // Change Discovery sort order to 2 (creating duplicate 2 and missing 1)
    const discoveryRow = screen.getByTestId("stage-config-row-default.discovery");
    const orderInput = discoveryRow.querySelector('input[type="number"]') as HTMLInputElement;
    fireEvent.change(orderInput, { target: { value: "2" } });

    // Submit form
    const saveButton = screen.getByRole("button", { name: "Save Pipeline" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText("Stages must have unique contiguous sort orders from 1 to 5.")
      ).toBeDefined();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects pre-proposal stage ordered at or after Proposal stage", async () => {
    const onSubmit = vi.fn();
    render(
      <PipelineAdminDialog
        open={true}
        onOpenChange={vi.fn()}
        pipeline={mockPipeline}
        onSubmit={onSubmit}
      />
    );

    // Swap Solution Fit (order 3) and Proposal (order 4) -> Proposal becomes 3, Solution Fit becomes 4
    const solutionRow = screen.getByTestId("stage-config-row-default.solution_fit");
    const proposalRow = screen.getByTestId("stage-config-row-default.proposal");

    const solutionOrder = solutionRow.querySelector('input[type="number"]') as HTMLInputElement;
    const proposalOrder = proposalRow.querySelector('input[type="number"]') as HTMLInputElement;

    fireEvent.change(solutionOrder, { target: { value: "4" } });
    fireEvent.change(proposalOrder, { target: { value: "3" } });

    const saveButton = screen.getByRole("button", { name: "Save Pipeline" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(
          "Pre-proposal stages (Discovery, Qualification, Solution Fit) must precede Proposal."
        )
      ).toBeDefined();
    });
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submits valid draft updates including expectedRowVersion for concurrency", async () => {
    const onSubmit = vi.fn().mockResolvedValue(true);
    const onOpenChange = vi.fn();

    render(
      <PipelineAdminDialog
        open={true}
        onOpenChange={onOpenChange}
        pipeline={mockPipeline}
        onSubmit={onSubmit}
      />
    );

    // Change Discovery labelEn
    const discoveryRow = screen.getByTestId("stage-config-row-default.discovery");
    const labelInput = discoveryRow.querySelector('input[placeholder="Stage label (EN)"]') as HTMLInputElement;
    fireEvent.change(labelInput, { target: { value: "Initial Discovery" } });

    const saveButton = screen.getByRole("button", { name: "Save Pipeline" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    const callArg = onSubmit.mock.calls[0][0];
    expect(callArg.nameEn).toBe("Standard Sales Pipeline");
    expect(callArg.expectedRowVersion).toBe("AQIDBA==");
    expect(callArg.stages).toHaveLength(5);
    const updatedDiscovery = callArg.stages.find(
      (s: any) => s.stageKey === "default.discovery"
    );
    expect(updatedDiscovery.labelEn).toBe("Initial Discovery");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("displays explicit Reorder Party Protection error banner on 422 reorder violation", () => {
    render(
      <PipelineAdminDialog
        open={true}
        onOpenChange={vi.fn()}
        pipeline={mockPipeline}
        onSubmit={vi.fn()}
        submitError="422: CRM_OPPORTUNITY_PARTY_REQUIRED_ON_REORDER: Cannot advance stage order with unlinked deals"
      />
    );

    expect(screen.getByText("Reorder Blocked: Unlinked Deals Gate")).toBeDefined();
    expect(
      screen.getByText(
        "Cannot advance stage order while open unlinked deals reside on this stage without a verified Party (PD-1 Policy). Link deals to Parties or move them backward before saving."
      )
    ).toBeDefined();
  });
});
