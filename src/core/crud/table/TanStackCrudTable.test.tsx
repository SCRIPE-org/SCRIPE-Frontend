import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { TanStackCrudTable } from "./TanStackCrudTable";
import type { CrudColumn } from "../components/generic-crud-view";

interface TestRow {
  id: string;
  name: string;
  role: string;
  status: string;
}

const mockColumns: CrudColumn<TestRow>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "role", label: "Role", sortable: true },
  { key: "status", label: "Status", sortable: false },
];

const mockData: TestRow[] = [
  { id: "1", name: "Alice", role: "Admin", status: "Active" },
  { id: "2", name: "Bob", role: "Coach", status: "Pending" },
  { id: "3", name: "Charlie", role: "Athlete", status: "Active" },
];

describe("TanStackCrudTable", () => {
  it("renders table headers and rows correctly", () => {
    render(<TanStackCrudTable data={mockData} columns={mockColumns} />);

    expect(screen.getByText("Name")).toBeInTheDocument();
    expect(screen.getByText("Role")).toBeInTheDocument();
    expect(screen.getByText("Status")).toBeInTheDocument();

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("Charlie")).toBeInTheDocument();
  });

  it("handles sorting click on sortable columns", () => {
    const onSort = vi.fn();
    render(
      <TanStackCrudTable data={mockData} columns={mockColumns} onSort={onSort} />
    );

    const nameHeaderBtn = screen.getByRole("button", { name: /name/i });
    fireEvent.click(nameHeaderBtn);
    expect(onSort).toHaveBeenCalledWith("name");
  });

  it("handles row selection checkboxes", () => {
    const onSelectItem = vi.fn();
    const onSelectAll = vi.fn();

    render(
      <TanStackCrudTable
        data={mockData}
        columns={mockColumns}
        selectedIds={["1"]}
        onSelectItem={onSelectItem}
        onSelectAll={onSelectAll}
      />
    );

    const selectAllCheckbox = screen.getByLabelText("Select all rows");
    expect(selectAllCheckbox).toBeInTheDocument();
    fireEvent.click(selectAllCheckbox);
    expect(onSelectAll).toHaveBeenCalled();

    const rowCheckbox = screen.getByLabelText("Select row 1");
    expect(rowCheckbox).toBeInTheDocument();
  });

  it("supports sticky actions column without visual regressions", () => {
    render(
      <TanStackCrudTable
        data={mockData}
        columns={mockColumns}
        stickyActions
        renderRowActionButtons={(row) => (
          <button data-testid={`action-${row.id}`}>Edit</button>
        )}
      />
    );

    expect(screen.getByText("Actions")).toBeInTheDocument();
    expect(screen.getByTestId("action-1")).toBeInTheDocument();
    expect(screen.getByTestId("action-2")).toBeInTheDocument();
    expect(screen.getByTestId("action-3")).toBeInTheDocument();
  });
});
