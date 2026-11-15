import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GenericTable, type Column } from "./generic-table";

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

interface Row {
  id: string;
  name: string;
  amount: number;
}

const COLUMNS: Column<Row>[] = [
  { key: "name", label: "Name", sortable: true },
  { key: "amount", label: "Amount", sortable: false },
];

const ROWS: Row[] = [
  { id: "r-1", name: "Alpha", amount: 120 },
  { id: "r-2", name: "Beta", amount: 240 },
];

describe("GenericTable Phase C accessibility, sorting, pagination & RTL scroll", () => {
  it("renders sticky thead, dynamic aria-sort, checkbox labels, and tabular-nums", () => {
    const onSelectionChange = vi.fn();
    const { container } = render(
      <GenericTable
        data={ROWS}
        columns={COLUMNS}
        selectable
        selectedItems={["r-1"]}
        onSelectionChange={onSelectionChange}
      />
    );

    const thead = container.querySelector("thead");
    expect(thead).toHaveClass("sticky", "top-0");

    const nameHeader = screen.getByRole("columnheader", { name: "Name" });
    const amountHeader = screen.getByRole("columnheader", { name: "Amount" });
    expect(nameHeader).toHaveAttribute("aria-sort", "none");
    expect(amountHeader).not.toHaveAttribute("aria-sort");

    fireEvent.click(nameHeader);
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");

    fireEvent.click(nameHeader);
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");

    const selectAll = screen.getByLabelText("Select all rows");
    expect(selectAll).toBeInTheDocument();
    expect(screen.getAllByLabelText("Select row r-1").length).toBeGreaterThan(0);

    fireEvent.click(selectAll);
    expect(onSelectionChange).toHaveBeenCalledWith(["r-2", "r-1"]);

    const desktopTable = container.querySelector("table");
    expect(desktopTable).not.toBeNull();
    const numericCells = screen.getAllByText("120");
    expect(numericCells.length).toBeGreaterThanOrEqual(2);
    expect(numericCells[0]).toHaveClass("tabular-nums");
    const amountCell = numericCells.find((el) => el.closest("td"))?.closest("td") ?? null;
    expect(amountCell).not.toBeNull();
    expect(amountCell).toHaveClass("tabular-nums");
  });

  it("blocks disabled previous/first/next/last/current pagination clicks from firing", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(
      <GenericTable
        data={ROWS}
        columns={COLUMNS}
        pagination={{
          itemsCount: 30,
          pageSize: 10,
          currentPage: 1,
          pagesCount: 3,
          onPageChange,
        }}
      />
    );

    const currentPageLink = screen.getByRole("link", { name: "1" });
    expect(currentPageLink).toHaveAttribute("aria-current", "page");
    fireEvent.click(currentPageLink);
    expect(onPageChange).not.toHaveBeenCalled();

    const firstBtn = screen.getByRole("link", { name: /first/i });
    expect(firstBtn).toHaveAttribute("aria-disabled", "true");
    fireEvent.click(firstBtn);
    expect(onPageChange).not.toHaveBeenCalled();

    const disabledControls = Array.from(document.querySelectorAll('[aria-disabled="true"]'));
    expect(disabledControls.length).toBeGreaterThanOrEqual(2);
    for (const control of disabledControls) {
      fireEvent.click(control);
    }
    expect(onPageChange).not.toHaveBeenCalled();

    rerender(
      <GenericTable
        data={ROWS}
        columns={COLUMNS}
        pagination={{
          itemsCount: 30,
          pageSize: 10,
          currentPage: 3,
          pagesCount: 3,
          onPageChange,
        }}
      />
    );

    const lastBtn = screen.getByRole("link", { name: /last/i });
    expect(lastBtn).toHaveAttribute("aria-disabled", "true");
    for (const control of Array.from(document.querySelectorAll('[aria-disabled="true"]'))) {
      fireEvent.click(control);
    }
    expect(onPageChange).not.toHaveBeenCalled();
  });
});
