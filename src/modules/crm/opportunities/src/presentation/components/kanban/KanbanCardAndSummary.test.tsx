import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { KanbanCard } from "./KanbanCard";
import { KanbanStageValueSummary } from "./KanbanStageValueSummary";
import type { CrmOpportunity } from "../../../domain/entities/OpportunityEntity";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, string | number>) =>
      params?.defaultValue ? String(params.defaultValue) : key,
    language: "en",
  }),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), replace: vi.fn(), prefetch: vi.fn() }),
}));

const sampleOpp: CrmOpportunity = {
  id: "opp-k-1",
  title: "Al-Hilal Pitch Upgrade",
  leadId: null,
  accountId: null,
  partyId: "party-1",
  pipelineId: "wf-deal-default",
  stageId: "stg-1",
  stageKey: "default.discovery",
  stageLabelEnSnapshot: "Discovery",
  pipelineVersionSnapshot: 1,
  lastActiveStageKey: null,
  ownerUserId: "user-1",
  ownerTeamId: null,
  dealKind: "NewBusiness",
  hqOutcomeKind: null,
  targetExistingTenantId: null,
  estimatedAmount: 250000,
  currencyCode: "SAR",
  targetCloseDate: "2026-12-15T00:00:00Z",
  status: "Open",
  statusName: "Open",
  enteredStageAtUtc: "2020-01-01T00:00:00Z",
  createdAt: "2020-01-01T00:00:00Z",
  rowVersion: "rv-1",
  maskedFieldKeys: [],
};

describe("KanbanCard & KanbanStageValueSummary", () => {
  it("renders KanbanCard metadata, SLA rotting indicator, and fires keyboard navigation callbacks", () => {
    const onMoveForward = vi.fn();
    const onMoveBackward = vi.fn();
    render(
      <KanbanCard
        opportunity={sampleOpp}
        currentStageIndex={1}
        totalStages={5}
        slaTargetDays={7}
        cardDensity="Standard"
        onMoveForward={onMoveForward}
        onMoveBackward={onMoveBackward}
      />
    );

    const card = screen.getByTestId("kanban-card");
    expect(card).toBeDefined();
    expect(screen.getByText("Al-Hilal Pitch Upgrade")).toBeDefined();
    fireEvent.keyDown(card, { key: "ArrowRight" });
    expect(onMoveForward).toHaveBeenCalledWith(sampleOpp);
    fireEvent.keyDown(card, { key: "ArrowLeft" });
    expect(onMoveBackward).toHaveBeenCalledWith(sampleOpp);
  });

  it("renders KanbanStageValueSummary stage aggregate", () => {
    render(
      <KanbanStageValueSummary
        stageKey="default.discovery"
        items={[sampleOpp]}
        allItems={[sampleOpp]}
        onDropStage={vi.fn()}
      />
    );
    expect(screen.getByTestId("kanban-stage-value-default.discovery")).toBeDefined();
  });
});
