import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GenericWorkflowKanban } from "./GenericWorkflowKanban";
import type { WorkflowKanbanConfig, WorkflowKanbanStageConfig } from "./types";

interface TestItem {
  id: string;
  title: string;
  stageKey: string;
  amount?: number;
}

const mockStages: WorkflowKanbanStageConfig<TestItem>[] = [
  {
    stageKey: "discovery",
    label: "Discovery",
    category: "todo",
  },
  {
    stageKey: "qualification",
    label: "Qualification",
    category: "in_progress",
    wipLimit: 5,
  },
  {
    stageKey: "closed_won",
    label: "Closed Won",
    category: "done",
  },
  {
    stageKey: "closed_lost",
    label: "Closed Lost",
    category: "lost",
  },
];

const mockItems: TestItem[] = [
  { id: "deal-1", title: "Deal One", stageKey: "discovery", amount: 10000 },
  { id: "deal-2", title: "Deal Two", stageKey: "qualification", amount: 25000 },
  { id: "deal-3", title: "Deal Three", stageKey: "closed_won", amount: 50000 },
];

describe("GenericWorkflowKanban", () => {
  it("renders all configured stages and cards", () => {
    const config: WorkflowKanbanConfig<TestItem> = {
      stages: mockStages,
      stageField: "stageKey",
    };

    render(<GenericWorkflowKanban config={config} items={mockItems} />);

    expect(screen.getByText("Discovery")).toBeInTheDocument();
    expect(screen.getByText("Qualification")).toBeInTheDocument();
    expect(screen.getByText("Closed Won")).toBeInTheDocument();
    expect(screen.getByText("Closed Lost")).toBeInTheDocument();

    expect(screen.getByText("Deal One")).toBeInTheDocument();
    expect(screen.getByText("Deal Two")).toBeInTheDocument();
    expect(screen.getByText("Deal Three")).toBeInTheDocument();
  });

  it("renders WIP limit indicator in column header", () => {
    const config: WorkflowKanbanConfig<TestItem> = {
      stages: mockStages,
      stageField: "stageKey",
    };

    render(<GenericWorkflowKanban config={config} items={mockItems} />);

    // Qualification column has wipLimit 5 and 1 item -> displays "1 / 5"
    expect(screen.getByText("1 / 5")).toBeInTheDocument();
  });

  it("handles density changes via toolbar buttons", () => {
    const config: WorkflowKanbanConfig<TestItem> = {
      stages: mockStages,
      stageField: "stageKey",
      cardDensity: "standard",
    };

    render(<GenericWorkflowKanban config={config} items={mockItems} />);

    const compactBtn = screen.getByRole("button", { name: /^compact$/i });
    expect(compactBtn).toBeInTheDocument();
    fireEvent.click(compactBtn);
  });

  it("renders and dismisses error messages cleanly", () => {
    const onDismiss = vi.fn();
    const config: WorkflowKanbanConfig<TestItem> = {
      stages: mockStages,
      stageField: "stageKey",
      errorMessage: "Transition rejected by Four-Eyes separation of duties.",
      onDismissError: onDismiss,
    };

    render(<GenericWorkflowKanban config={config} items={mockItems} />);

    expect(
      screen.getByText("Transition rejected by Four-Eyes separation of duties.")
    ).toBeInTheDocument();

    const dismissBtn = screen.getByRole("button", { name: /dismiss error/i });
    fireEvent.click(dismissBtn);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("supports smart 3-state Jira Drop Evaluation callback definition", () => {
    const evaluateDropTarget = vi.fn((item: TestItem, targetStageKey: string) => {
      if (targetStageKey === "closed_lost") {
        return {
          state: "allowed_screen_required" as const,
          badgeText: "Requires Loss Reason",
        };
      }
      if (targetStageKey === "closed_won" && item.id === "deal-1") {
        return {
          state: "blocked" as const,
          reason: "Cannot jump directly to Closed Won without Qualification",
        };
      }
      return {
        state: "allowed_instant" as const,
        badgeText: "Instant Move",
      };
    });

    const onMoveItem = vi.fn();

    const config: WorkflowKanbanConfig<TestItem> = {
      stages: mockStages,
      stageField: "stageKey",
      evaluateDropTarget,
      onMoveItem,
    };

    render(<GenericWorkflowKanban config={config} items={mockItems} />);

    // Board renders without crashing
    expect(screen.getByText("4 Stages")).toBeInTheDocument();
    expect(screen.getByText("3 Cards")).toBeInTheDocument();

    // Verify data-testid and data-stage-key attributes on all columns
    expect(screen.getByTestId("kanban-column-discovery")).toHaveAttribute("data-stage-key", "discovery");
    expect(screen.getByTestId("kanban-column-qualification")).toHaveAttribute("data-stage-key", "qualification");
    expect(screen.getByTestId("kanban-column-closed_won")).toHaveAttribute("data-stage-key", "closed_won");
    expect(screen.getByTestId("kanban-column-closed_lost")).toHaveAttribute("data-stage-key", "closed_lost");
  });

  it("renders swimlanes with scoped collapse/expand buttons and stage columns", () => {
    const config: WorkflowKanbanConfig<TestItem> = {
      stages: mockStages,
      stageField: "stageKey",
      swimlaneMode: "custom",
      swimlanes: [
        { id: "enterprise", label: "Enterprise Deals", filter: (i) => (i.amount ?? 0) >= 20000 },
        { id: "smb", label: "SMB Deals", filter: (i) => (i.amount ?? 0) < 20000 },
      ],
    };

    render(<GenericWorkflowKanban config={config} items={mockItems} />);

    expect(screen.getByText("Enterprise Deals")).toBeInTheDocument();
    expect(screen.getByText("SMB Deals")).toBeInTheDocument();

    const collapseEnterpriseBtn = screen.getByRole("button", { name: /collapse enterprise deals/i });
    expect(collapseEnterpriseBtn).toBeInTheDocument();
    fireEvent.click(collapseEnterpriseBtn);

    const collapseSmbBtn = screen.getByRole("button", { name: /collapse smb deals/i });
    expect(collapseSmbBtn).toBeInTheDocument();
  });

  it("attaches direct full-card drag without GripVertical handle or nested role=button around action buttons", () => {
    const onDelete = vi.fn();
    const config: WorkflowKanbanConfig<TestItem> = {
      stages: mockStages,
      stageField: "stageKey",
    };

    render(
      <GenericWorkflowKanban
        config={config}
        items={mockItems}
        renderRowActionButtons={(item) => (
          <button type="button" onClick={() => onDelete(item.id)}>
            Delete {item.title}
          </button>
        )}
      />
    );

    expect(screen.queryByRole("button", { name: /^drag /i })).toBeNull();
    const cards = screen.getAllByTestId("kanban-sortable-card");
    expect(cards.length).toBeGreaterThanOrEqual(3);
    expect(cards[0]).toHaveAttribute("aria-roledescription", "sortable");
    expect(cards[0].className).toContain("cursor-grab");
    expect(cards[0].className).toContain("active:cursor-grabbing");

    const actionBtn = screen.getByRole("button", { name: "Delete Deal One" });
    expect(actionBtn.closest("[role='button']")).toBeNull();
    expect(actionBtn.closest("button")).toBe(actionBtn);

    fireEvent.click(actionBtn);
    expect(onDelete).toHaveBeenCalledWith("deal-1");

    const compactBtn = screen.getByRole("button", { name: /^compact$/i });
    const standardBtn = screen.getByRole("button", { name: /^standard$/i });
    expect(standardBtn).toHaveAttribute("aria-pressed", "true");
    fireEvent.click(compactBtn);
    expect(compactBtn).toHaveAttribute("aria-pressed", "true");
    expect(standardBtn).toHaveAttribute("aria-pressed", "false");
  });

  it("renders custom emptyState and stage aria-expanded state cleanly", () => {
    const config: WorkflowKanbanConfig<TestItem> = {
      stages: mockStages,
      stageField: "stageKey",
    };

    render(
      <GenericWorkflowKanban
        config={config}
        items={[]}
        emptyState={<div data-testid="kanban-custom-empty">No matching deals</div>}
      />
    );

    expect(screen.getByTestId("kanban-custom-empty")).toBeInTheDocument();
    const collapseCol = screen.getByRole("button", { name: "Collapse Discovery" });
    expect(collapseCol).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(collapseCol);
    expect(screen.getByRole("button", { name: "Expand Discovery" })).toHaveAttribute(
      "aria-expanded",
      "false"
    );
  });

  it("renders custom renderCard directly without extra nested border or padding wrapper", () => {
    const config: WorkflowKanbanConfig<TestItem> = {
      stages: mockStages,
      stageField: "stageKey",
      renderCard: (item) => (
        <div data-testid={`custom-card-${item.id}`} className="custom-single-card">
          {item.title}
        </div>
      ),
    };

    render(<GenericWorkflowKanban config={config} items={mockItems} />);

    const customCard = screen.getByTestId("custom-card-deal-1");
    const sortableRoot = customCard.parentElement;
    expect(sortableRoot).toHaveAttribute("data-testid", "kanban-sortable-card");
    expect(sortableRoot?.className).toContain("cursor-grab");
    expect(sortableRoot?.className).not.toContain("border-nx-line");
    expect(sortableRoot?.className).not.toContain("p-1.5");
  });
});
