import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { KanbanStageColumn } from "./KanbanStageColumn";
import type { WorkflowKanbanStageConfig } from "./types";

interface TestItem {
  id: string;
  title: string;
  stageKey: string;
}

const mockStage: WorkflowKanbanStageConfig<TestItem> = {
  stageKey: "negotiation",
  label: "Negotiation",
  category: "in_progress",
  wipLimit: 3,
};

describe("KanbanStageColumn", () => {
  it("renders idle column with data-testid, data-stage-key, data-over-stage=false, data-drop-status", () => {
    render(
      <KanbanStageColumn
        stage={mockStage}
        items={[{ id: "1", title: "Contract Proposal", stageKey: "negotiation" }]}
        activeItem={null}
        activeStageKey={null}
      />
    );

    const col = screen.getByTestId("kanban-column-negotiation");
    expect(col).toBeInTheDocument();
    expect(col).toHaveAttribute("data-stage-key", "negotiation");
    expect(col).toHaveAttribute("data-over-stage", "false");
    expect(screen.getByText("Negotiation")).toBeInTheDocument();
  });

  it("renders unmistakable dashed drop slot when hovered over by active drag item", () => {
    const activeItem: TestItem = { id: "2", title: "Early Deal", stageKey: "discovery" };

    render(
      <KanbanStageColumn
        stage={mockStage}
        items={[]}
        activeItem={activeItem}
        activeStageKey="discovery"
        isOverStage={true}
        evaluateDropTarget={() => ({
          state: "allowed_screen_required",
          badgeText: "Transition Screen Required",
        })}
      />
    );

    const col = screen.getByTestId("kanban-column-negotiation");
    expect(col).toHaveAttribute("data-over-stage", "true");
    expect(col).toHaveAttribute("data-drop-status", "allowed_screen_required");

    const dropSlot = screen.getByTestId("kanban-drop-slot-negotiation");
    expect(dropSlot).toBeInTheDocument();
    expect(dropSlot).toHaveTextContent("Transition Screen Required");
  });

  it("renders blocked drop slot with reason when transition is forbidden", () => {
    const activeItem: TestItem = { id: "2", title: "Early Deal", stageKey: "discovery" };

    render(
      <KanbanStageColumn
        stage={mockStage}
        items={[]}
        activeItem={activeItem}
        activeStageKey="discovery"
        isOverStage={true}
        evaluateDropTarget={() => ({
          state: "blocked",
          reason: "Separation of duties required",
        })}
      />
    );

    const col = screen.getByTestId("kanban-column-negotiation");
    expect(col).toHaveAttribute("data-over-stage", "true");
    expect(col).toHaveAttribute("data-drop-status", "blocked");

    const dropSlot = screen.getByTestId("kanban-drop-slot-negotiation");
    expect(dropSlot).toBeInTheDocument();
    expect(dropSlot).toHaveTextContent("Separation of duties required");
  });
});
