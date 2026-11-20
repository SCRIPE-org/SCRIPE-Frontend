import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { GenericCrudView } from "./generic-crud-view";
import { CrudSplitPaneSection } from "../views/CrudSplitPaneSection";

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

globalThis.ResizeObserver ??= class {
  observe() {}
  unobserve() {}
  disconnect() {}
} as unknown as typeof ResizeObserver;

interface FacilityRow {
  id: string;
  name: string;
  capacity?: number;
}

function makeViewModel(overrides: Record<string, unknown> = {}) {
  return {
    items: [
      { id: "1", name: "Pitch A", capacity: 22 },
      { id: "2", name: "Pitch B", capacity: 14 },
    ],
    loading: false,
    error: null,
    isCreateModalOpen: false,
    isEditModalOpen: false,
    viewModalOpen: false,
    editingItem: null,
    selectedItems: [],
    pagination: { page: 1, pageSize: 10, total: 2, totalPages: 1 },
    changePage: vi.fn(),
    changePageSize: vi.fn(),
    searchValue: "",
    handleSearchChange: vi.fn(),
    setIsCreateModalOpen: vi.fn(),
    setSelectedItems: vi.fn(),
    refresh: vi.fn(),
    refreshItems: vi.fn(),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    closeEditModal: vi.fn(),
    closeViewModal: vi.fn(),
    ...overrides,
  };
}

describe("GenericCrudView & CrudSplitPaneSection Phase C", () => {
  it("keeps rows visible and shows retry banner when error occurs with existing items", () => {
    const refresh = vi.fn();
    render(
      <GenericCrudView<FacilityRow>
        title="Facilities"
        viewModel={makeViewModel({ error: "Background sync failed", refresh }) as any}
        columns={[{ key: "name", label: "Name" }]}
      />
    );

    expect(screen.getAllByText("Pitch A").length).toBeGreaterThan(0);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("Background sync failed");

    const retryBtn = screen.getByRole("button", { name: /retry/i });
    fireEvent.click(retryBtn);
    expect(refresh).toHaveBeenCalledTimes(1);
  });

  it("wires accessible view switcher with aria-pressed and passes emptyState to CardGrid and SplitPane", () => {
    render(
      <GenericCrudView<FacilityRow>
        title="Facilities"
        viewModel={makeViewModel({ items: [] }) as any}
        columns={[{ key: "name", label: "Name" }]}
        config={{
          titleKey: "facilities.title",
          subtitleKey: "facilities.subtitle",
          columns: [{ key: "name", label: "Name" }],
          viewModes: ["Table", "CardGrid", "SplitPane"],
        }}
        emptyState={<div data-testid="custom-crud-empty">Nothing matches filter</div>}
      />
    );

    const tableToggle = screen.getByTestId("toggle-table-view");
    const cardToggle = screen.getByTestId("toggle-cardgrid-view");
    const splitToggle = screen.getByTestId("toggle-splitpane-view");
    expect(tableToggle).toHaveAttribute("aria-pressed", "true");
    expect(cardToggle).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(cardToggle);
    expect(cardToggle).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByTestId("custom-crud-empty")).toBeInTheDocument();

    fireEvent.click(splitToggle);
    expect(splitToggle).toHaveAttribute("aria-pressed", "true");
    expect(screen.getAllByTestId("custom-crud-empty").length).toBeGreaterThan(0);
  });

  it("renders CrudSplitPaneSection list items without nested interactive elements", () => {
    const onSelectId = vi.fn();
    const onAction = vi.fn();
    render(
      <CrudSplitPaneSection<FacilityRow>
        items={[{ id: "row-1", name: "Court 1" }]}
        columns={[{ key: "name", label: "Name" }]}
        selectedId="row-1"
        onSelectId={onSelectId}
        renderSplitListItem={(item) => (
          <div className="flex items-center justify-between p-2">
            <span>{item.name}</span>
            <button type="button" onClick={() => onAction(item.id)}>
              Inspect {item.id}
            </button>
          </div>
        )}
      />
    );

    const selectBtn = screen.getByRole("button", { name: "Court 1" });
    const inspectBtn = screen.getByRole("button", { name: "Inspect row-1" });
    expect(selectBtn).toHaveAttribute("aria-pressed", "true");
    expect(selectBtn.contains(inspectBtn)).toBe(false);

    fireEvent.click(inspectBtn);
    expect(onAction).toHaveBeenCalledWith("row-1");
    expect(onSelectId).not.toHaveBeenCalled();

    fireEvent.click(selectBtn);
    expect(onSelectId).toHaveBeenCalledWith("row-1");
  });

  it("ignores prototype-polluting headers during CSV import", async () => {
    const createItem = vi.fn().mockResolvedValue({});
    render(
      <GenericCrudView<FacilityRow>
        title="Facilities"
        viewModel={makeViewModel({ createItem }) as any}
        columns={[{ key: "name", label: "Name" }]}
        config={{
          titleKey: "facilities.title",
          subtitleKey: "facilities.subtitle",
          columns: [{ key: "name", label: "Name" }],
          bulkOptions: { enableCsvImport: true },
        }}
      />
    );

    const csvInput = screen.getByLabelText("Import CSV") as HTMLInputElement;
    const csvContent = "__proto__,constructor,prototype,name\nbad,bad2,bad3,Safe Pitch";
    const file = new File([csvContent], "facilities.csv", { type: "text/csv" });
    if (typeof file.text !== "function") {
      Object.defineProperty(file, "text", { value: async () => csvContent });
    }

    fireEvent.change(csvInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(createItem).toHaveBeenCalledTimes(1);
    });
    const payload = createItem.mock.calls[0][0] as Record<string, unknown>;
    expect(payload).toEqual({ name: "Safe Pitch" });
    expect(Object.prototype.hasOwnProperty.call(payload, "__proto__")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(payload, "constructor")).toBe(false);
    expect(Object.prototype.hasOwnProperty.call(payload, "prototype")).toBe(false);
  });
});
