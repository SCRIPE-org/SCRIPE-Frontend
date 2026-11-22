import React from "react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { JobsFilterToolbar } from "../src/presentation/components/JobsFilterToolbar";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string) => key,
    language: "en",
    direction: "ltr",
  }),
}));

beforeAll(() => {
  if (!HTMLElement.prototype.hasPointerCapture) {
    HTMLElement.prototype.hasPointerCapture = () => false;
  }
  if (!HTMLElement.prototype.setPointerCapture) {
    HTMLElement.prototype.setPointerCapture = () => {};
  }
  if (!HTMLElement.prototype.releasePointerCapture) {
    HTMLElement.prototype.releasePointerCapture = () => {};
  }
});

describe("JobsFilterToolbar", () => {
  it("renders canonical status and kind @core/ui/select triggers with accessible labels", () => {
    render(
      <JobsFilterToolbar
        statusFilter="all"
        kindFilter="all"
        onStatusFilterChange={vi.fn()}
        onKindFilterChange={vi.fn()}
      />
    );

    expect(screen.getByTestId("jobs-filter-toolbar")).toBeInTheDocument();
    expect(screen.getByTestId("jobs-status-filter-trigger")).toHaveAttribute(
      "aria-label",
      "adminDataTransferJobs.columns.status"
    );
    expect(screen.getByTestId("jobs-kind-filter-trigger")).toHaveAttribute(
      "aria-label",
      "adminDataTransferJobs.columns.kind"
    );
    expect(screen.queryByTestId("jobs-reset-filters-btn")).not.toBeInTheDocument();
  });

  it("changes status and kind filters including Queued, CompletedWithErrors, and MultiSheetMigration", () => {
    const onStatusFilterChange = vi.fn();
    const onKindFilterChange = vi.fn();

    render(
      <JobsFilterToolbar
        statusFilter="all"
        kindFilter="all"
        onStatusFilterChange={onStatusFilterChange}
        onKindFilterChange={onKindFilterChange}
      />
    );

    fireEvent.click(screen.getByTestId("jobs-status-filter-trigger"));
    fireEvent.click(screen.getByText("adminDataTransferJobs.statuses.Queued"));
    expect(onStatusFilterChange).toHaveBeenCalledWith("Queued");

    fireEvent.click(screen.getByTestId("jobs-status-filter-trigger"));
    fireEvent.click(screen.getByText("adminDataTransferJobs.statuses.CompletedWithErrors"));
    expect(onStatusFilterChange).toHaveBeenCalledWith("CompletedWithErrors");

    fireEvent.click(screen.getByTestId("jobs-kind-filter-trigger"));
    fireEvent.click(screen.getByText("adminDataTransferJobs.kinds.MultiSheetMigration"));
    expect(onKindFilterChange).toHaveBeenCalledWith("MultiSheetMigration");
  });

  it("renders reset action when filters are active and invokes onResetFilters", () => {
    const onResetFilters = vi.fn();
    render(
      <JobsFilterToolbar
        statusFilter="Failed"
        kindFilter="Import"
        onStatusFilterChange={vi.fn()}
        onKindFilterChange={vi.fn()}
        hasActiveFilters
        onResetFilters={onResetFilters}
      />
    );

    const resetBtn = screen.getByTestId("jobs-reset-filters-btn");
    expect(resetBtn).toBeInTheDocument();
    fireEvent.click(resetBtn);
    expect(onResetFilters).toHaveBeenCalledTimes(1);
  });
});
