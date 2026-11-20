import React from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { GenericCrudView } from "./generic-crud-view";

vi.mock("@core/providers/i18n-provider", () => ({
  useI18n: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
    language: "en",
    direction: "ltr",
  }),
}));

vi.mock("@core/hooks/use-enhanced-toast", () => ({
  useEnhancedToast: () => ({
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@core/data-exchange", () => ({
  DataExchangeToolbarActions: () => null,
}));

vi.mock("@core/providers/permission-provider", () => ({
  usePermissions: () => ({
    permissions: [],
    hasPermission: () => true,
    hasAnyPermission: () => true,
    hasAllPermissions: () => true,
    canAccessPage: () => true,
    roleNames: [],
    isPlatformSuperAdmin: false,
    isTenantSuperAdmin: false,
    isSuperAdmin: false,
  }),
}));

interface SampleRow {
  id: string;
  name: string;
}

function buildViewModel(overrides: Record<string, unknown> = {}) {
  return {
    items: [{ id: "1", name: "Pitch A" }] as SampleRow[],
    loading: false,
    error: null,
    pagination: {
      page: 1,
      pageSize: 20,
      totalCount: 1,
      pagesCount: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      onPageChange: vi.fn(),
      onPageSizeChange: vi.fn(),
    },
    selectedItems: [],
    setSelectedItems: vi.fn(),
    isCreateModalOpen: false,
    setIsCreateModalOpen: vi.fn(),
    isEditModalOpen: false,
    setIsEditModalOpen: vi.fn(),
    viewModalOpen: false,
    setViewModalOpen: vi.fn(),
    editingItem: null,
    viewItem: null,
    openEditModal: vi.fn(),
    closeEditModal: vi.fn(),
    openViewModal: vi.fn(),
    closeViewModal: vi.fn(),
    refreshItems: vi.fn(),
    createItem: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    ...overrides,
  };
}

describe("GenericCrudView customActions tooltip & searchPlaceholder wiring", () => {
  it("renders custom search.placeholder and falls back to config.searchConfig.placeholder", () => {
    const { rerender } = render(
      <GenericCrudView<SampleRow>
        title="Entities"
        viewModel={buildViewModel() as any}
        columns={[{ key: "name", label: "Name" }]}
        search={{
          value: "",
          onChange: vi.fn(),
          placeholder: "Filter entities by module or key...",
        }}
        config={{
          titleKey: "entities.title",
          subtitleKey: "entities.subtitle",
          columns: [{ key: "name", label: "Name" }],
          searchConfig: {
            placeholder: "Fallback config placeholder",
          },
        }}
      />
    );

    expect(
      screen.getByPlaceholderText("Filter entities by module or key...")
    ).toBeInTheDocument();

    rerender(
      <GenericCrudView<SampleRow>
        title="Entities"
        viewModel={buildViewModel() as any}
        columns={[{ key: "name", label: "Name" }]}
        search={{
          value: "",
          onChange: vi.fn(),
        }}
        config={{
          titleKey: "entities.title",
          subtitleKey: "entities.subtitle",
          columns: [{ key: "name", label: "Name" }],
          searchConfig: {
            placeholder: "Fallback config placeholder",
          },
        }}
      />
    );

    expect(
      screen.getByPlaceholderText("Fallback config placeholder")
    ).toBeInTheDocument();
  });

  it("wraps customActions with Tooltip when action.tooltip is set and preserves focusability when disabled", () => {
    const onEnabledClick = vi.fn();
    const onDisabledClick = vi.fn();

    render(
      <GenericCrudView<SampleRow>
        title="Jobs"
        viewModel={buildViewModel() as any}
        columns={[{ key: "name", label: "Name" }]}
        config={{
          titleKey: "jobs.title",
          subtitleKey: "jobs.subtitle",
          columns: [{ key: "name", label: "Name" }],
          customActions: [
            {
              label: "Launch Studio",
              onClick: onEnabledClick,
              tooltip: "Open guided import mapping studio",
            },
            {
              label: "Import Locked",
              onClick: onDisabledClick,
              disabled: true,
              tooltip: "Quota exhausted for this entity",
            },
            {
              label: "Plain Action",
              onClick: vi.fn(),
            },
          ],
        }}
      />
    );

    const enabledBtn = screen.getByRole("button", { name: "Launch Studio" });
    const enabledWrapper = enabledBtn.closest("span");
    expect(enabledWrapper).not.toBeNull();
    expect(enabledWrapper).toHaveAttribute("data-state", "closed");
    fireEvent.click(enabledBtn);
    expect(onEnabledClick).toHaveBeenCalledTimes(1);

    const disabledBtn = screen.getByRole("button", { name: "Import Locked" });
    expect(disabledBtn).toBeDisabled();
    const focusWrapper = disabledBtn.closest("span");
    expect(focusWrapper).not.toBeNull();
    expect(focusWrapper).toHaveAttribute("tabindex", "0");
    expect(focusWrapper).toHaveAttribute("data-state", "closed");

    fireEvent.focus(focusWrapper as HTMLElement);
    expect(
      screen.getAllByText("Quota exhausted for this entity").length
    ).toBeGreaterThanOrEqual(1);

    const plainBtn = screen.getByRole("button", { name: "Plain Action" });
    expect(plainBtn).not.toHaveAttribute("data-state");
  });
});
